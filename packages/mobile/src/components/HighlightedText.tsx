import { Text, type TextStyle } from 'react-native';
import type { IngredientAmount } from '../lib/cook';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Props = {
  text: string;
  terms: string[];
  style: TextStyle | TextStyle[];
  highlight: TextStyle;
  /** Term → amount. When given, the first mention of each ingredient reads "coconut milk (1 can)". */
  amounts?: Map<string, IngredientAmount>;
  amountStyle?: TextStyle;
};

type Part = { s: string; terms: string[] };

/**
 * Step text with ingredient names picked out, so a cook can skim. Neighbouring matches merge into one
 * name ("Thai red curry paste"), and each ingredient's amount appears once, after its first mention,
 * unless the sentence already gives a quantity right before it ("Heat 1–2 tablespoons of coconut oil").
 */
export function HighlightedText({ text, terms, style, highlight, amounts, amountStyle }: Props) {
  if (!terms.length) return <Text style={style}>{text}</Text>;
  const re = new RegExp(`\\b(${terms.map(escape).join('|')})(?:e?s|ed)?\\b`, 'gi');
  const parts: Part[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const gap = text.slice(last, m.index);
    const prev = parts[parts.length - 1];
    if (prev?.terms.length && /^\s+$/.test(gap)) {
      // Only a space between two names: one ingredient, one highlight.
      prev.s += gap + m[0];
      prev.terms.push(m[1].toLowerCase());
    } else {
      if (gap) parts.push({ s: gap, terms: [] });
      parts.push({ s: m[0], terms: [m[1].toLowerCase()] });
    }
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ s: text.slice(last), terms: [] });

  const shownLines = new Set<string>();
  let consumed = 0;
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        const before = text.slice(Math.max(0, consumed - 28), consumed);
        consumed += part.s.length;
        if (!part.terms.length) return part.s;
        const found = part.terms.map((t) => amounts?.get(t)).find((a): a is IngredientAmount => !!a);
        const statedAlready = /\d|½|¼|¾|⅓|⅔/.test(before);
        const show = found && !shownLines.has(found.line) && !statedAlready;
        if (found) shownLines.add(found.line);
        return (
          <Text key={i}>
            <Text style={highlight}>{part.s}</Text>
            {show ? <Text style={amountStyle}>{` (${found.amount})`}</Text> : null}
          </Text>
        );
      })}
    </Text>
  );
}
