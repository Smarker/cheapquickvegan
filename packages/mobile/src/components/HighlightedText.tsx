import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { MEASURE, amountFor, type IngredientAmount } from '../lib/cook';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Props = {
  text: string;
  /** Ingredient names to pick out. */
  terms: string[];
  style: TextStyle | TextStyle[];
  highlight: TextStyle;
  /** Ingredient amounts. When given, each ingredient's first mention gets its amount ("coconut milk 1 can"). */
  amounts?: IngredientAmount[];
  amountStyle?: TextStyle;
  /** Draws amounts, temperatures and times as small rounded tags, findable by shape rather than colour. */
  amountTag?: ViewStyle;
  /** Equipment names ("air fryer", "blender"), underlined so they read differently from ingredients. */
  tools?: string[];
  toolStyle?: TextStyle;
  /** Rewrites an amount in the step ("2 cups" before "flour") into the cook's units. */
  convertAmount?: (amount: string, after: string) => string;
};

type Part = { s: string; kind: 'text' | 'ingredient' | 'tool' | 'measure' };

/**
 * Step text made skimmable: ingredient names in bold with their amount after the first mention,
 * tools underlined, and temperatures and times as tags. Neighbouring ingredient words merge into
 * one name ("Thai red curry paste").
 */
export function HighlightedText({ text, terms, style, highlight, amounts, amountStyle, amountTag, tools = [], toolStyle, convertAmount }: Props) {
  // Numbered groups, not named ones: Hermes (the app's JS engine) doesn't fill in named groups.
  const kinds: Part['kind'][] = [];
  const alternatives: string[] = [];
  if (amountTag) (kinds.push('measure'), alternatives.push(`(${MEASURE.source})`));
  if (tools.length && toolStyle) (kinds.push('tool'), alternatives.push(`(\\b(?:${tools.map(escape).join('|')})(?:e?s)?\\b)`));
  if (terms.length) (kinds.push('ingredient'), alternatives.push(`(\\b(?:${terms.map(escape).join('|')})(?:e?s|ed)?\\b)`));
  if (!alternatives.length) return <Text style={style}>{text}</Text>;

  const re = new RegExp(alternatives.join('|'), 'gi');
  const parts: Part[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const kind = kinds[m.slice(1).findIndex((g) => g !== undefined)];
    const gap = text.slice(last, m.index);
    const prev = parts[parts.length - 1];
    if (kind === 'ingredient' && prev?.kind === 'ingredient' && /^\s+$/.test(gap)) {
      prev.s += gap + m[0]; // only a space between two names: one ingredient
    } else {
      if (gap) parts.push({ s: gap, kind: 'text' });
      parts.push({ s: m[0], kind });
    }
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ s: text.slice(last), kind: 'text' });

  const tag = (label: string) => (
    <View style={amountTag} accessible accessibilityLabel={label}>
      <Text style={amountStyle}>{label}</Text>
    </View>
  );

  const shownLines = new Set<string>();
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.kind === 'text') return part.s;
        if (part.kind === 'tool')
          return (
            <Text key={i} style={toolStyle}>
              {part.s}
            </Text>
          );
        if (part.kind === 'measure') return <Text key={i}>{tag(convertAmount ? convertAmount(part.s, parts.slice(i + 1).map((x) => x.s).join('')) : part.s)}</Text>;
        // "Heat 1–2 tablespoons of coconut oil": the step already gives the quantity.
        const between = parts[i - 1]?.kind === 'text' ? parts[i - 1].s : '';
        const statedAlready = parts[i - 1]?.kind === 'measure' || (parts[i - 2]?.kind === 'measure' && /^\s*(of\s+)?(the\s+)?$/i.test(between));
        const found = amounts ? amountFor(part.s, amounts) : null;
        const show = found && !shownLines.has(found.line) && !statedAlready;
        if (found) shownLines.add(found.line);
        return (
          <Text key={i}>
            <Text style={highlight}>{part.s}</Text>
            {show && amountTag ? (
              <Text>
                {' '}
                {tag(found.amount)}
              </Text>
            ) : show ? (
              <Text style={amountStyle}>{` (${found.amount})`}</Text>
            ) : null}
          </Text>
        );
      })}
    </Text>
  );
}
