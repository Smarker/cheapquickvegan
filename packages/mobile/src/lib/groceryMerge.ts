// One line per ingredient on the grocery list, even when several recipes need it.
// "2 tbsp soy sauce" + "1 tbsp soy sauce" → "3 tbsp soy sauce";
// "1 tsp garlic, finely chopped" + "3 cloves garlic, minced" → "1 tsp + 3 cloves garlic".

import { amountOf } from './cook';

export type MergeInput = { id: string; text: string; checked: boolean };
export type MergedLine = { key: string; text: string; ids: string[]; checked: boolean; firstText: string };

const UNIT_ALIASES: [RegExp, string][] = [
  [/^(tablespoons?|tbsp|tbs)$/i, 'tbsp'],
  [/^(teaspoons?|tsp)$/i, 'tsp'],
  [/^(cups?|c)$/i, 'cup'],
  [/^(cloves?)$/i, 'clove'],
  [/^(cans?)$/i, 'can'],
  [/^(g|grams?)$/i, 'g'],
  [/^(blocks?)$/i, 'block'],
];
const GLYPHS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

/** "3 cloves" → { n: 3, unit: 'clove' }; ranges and anything odd → null (shown as written instead). */
function parse(amount: string): { n: number; unit: string; word: string } | null {
  const m = amount.trim().match(/^(\d+(?:\.\d+)?|\d+\/\d+|[½¼¾⅓⅔]|\d+\s+\d\/\d)\s*([a-zA-Z]*)$/);
  if (!m) return null;
  const num = m[1].includes(' ')
    ? m[1].split(/\s+/).reduce((s, x) => s + (x.includes('/') ? +x.split('/')[0] / +x.split('/')[1] : +x), 0)
    : m[1].includes('/')
      ? +m[1].split('/')[0] / +m[1].split('/')[1]
      : GLYPHS[m[1]] ?? +m[1];
  const word = m[2] ?? '';
  const unit = UNIT_ALIASES.find(([re]) => re.test(word))?.[1] ?? word.toLowerCase();
  return Number.isFinite(num) ? { n: num, unit, word } : null;
}

const NICE: [number, string][] = [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']];
function fmt(n: number): string {
  const whole = Math.floor(n + 1e-9);
  const frac = n - whole;
  if (frac < 0.01) return String(whole);
  const g = NICE.find(([v]) => Math.abs(v - frac) < 0.04)?.[1];
  if (!g) return String(Math.round(n * 10) / 10);
  return whole ? `${whole} ${g}` : g;
}
const plural = (unit: string, word: string, n: number) => {
  if (!unit) return '';
  if (unit === 'tbsp' || unit === 'tsp' || unit === 'g') return unit;
  return n > 1 ? `${unit}s` : unit === word.toLowerCase().replace(/s$/, '') ? unit : unit;
};

/** The shopping name of a line: no amount, no notes in brackets, nothing after the first comma. */
export function shoppingName(line: string): string {
  const amount = amountOf(line);
  let rest = amount ? line.slice(line.toLowerCase().indexOf(amount.split(' ').pop()!.toLowerCase()) + amount.split(' ').pop()!.length) : line;
  if (amount && !/\D/.test(amount)) rest = line.replace(/^\s*[\d½¼¾⅓⅔./\s-–]+/, '');
  return rest
    .replace(/\([^)]*\)/g, ' ')
    .split(',')[0]
    .replace(/^\s*(of\s+)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const keyOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/\b(fresh|freshly|chopped|minced|diced|sliced|finely|roughly|large|small|medium)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(oes|es|s)$/, (m) => (m === 'oes' ? 'o' : ''));

/** Merge a list's items by ingredient, keeping first-seen order. */
export function mergeLines(items: MergeInput[]): MergedLine[] {
  const groups = new Map<string, MergeInput[]>();
  for (const it of items) {
    const k = keyOf(shoppingName(it.text)) || it.text.toLowerCase();
    groups.set(k, [...(groups.get(k) ?? []), it]);
  }
  return [...groups.entries()].map(([key, group]) => {
    const ids = group.map((g) => g.id);
    const checked = group.every((g) => g.checked);
    if (group.length === 1) return { key, text: group[0].text, ids, checked, firstText: group[0].text };
    const name = shoppingName(group[0].text);
    const amounts = group.map((g) => amountOf(g.text));
    const parsed = amounts.map((a) => (a ? parse(a) : null));
    let amountText: string;
    if (parsed.every((p) => p) && parsed.every((p) => p!.unit === parsed[0]!.unit)) {
      const total = parsed.reduce((s, p) => s + p!.n, 0);
      amountText = [fmt(total), plural(parsed[0]!.unit, parsed[0]!.word, total)].filter(Boolean).join(' ');
    } else {
      const shown = amounts.filter((a): a is string => !!a);
      amountText = [...new Set(shown)].join(' + ');
    }
    return { key, text: amountText ? `${amountText} ${name}` : name, ids, checked, firstText: group[0].text };
  });
}
