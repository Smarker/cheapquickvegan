// Making a recipe for more or fewer people: scale each ingredient's amount, keep it friendly
// (1 ½ cups, not 1.5 cups; 6 tbsp becomes ⅓ cup), and leave times, temperatures and
// "to taste" alone. Works on the written line, before any grams/cups conversion.
import { useSyncExternalStore } from 'react';
import { ML, NUM, niceNumber, roundGrams, toNumber, UNIT, unitKey } from './units';

const LEAD = new RegExp(String.raw`^(\s*)(${NUM})(?:\s*(-|–|to)\s*(${NUM}))?(\s*${UNIT}\.?(?=\s|$|\)))?`, 'i');

// Counted things whose word should become plural when one becomes several.
const COUNTED = /^(clove|can|lemon|lime|onion|block|carrot|potato|tomato|pepper|jar|package|bunch|head|stalk|sprig|slice|banana|avocado|cucumber|zucchini|shallot|sheet|bag|date|egg|tortilla|bun|patty|leaf|piece|cup)\b/i;
const plural = (w: string) => (/(o|ch)$/i.test(w) ? `${w}es` : /f$/i.test(w) ? `${w.slice(0, -1)}ves` : `${w}s`);

/** A count, rounded to the nearest half (you can't buy 0.37 of an onion), never below ½. */
const countText = (n: number) => niceNumber(Math.max(0.5, Math.round(n * 2) / 2));

// The fractions each measure actually comes in: cups in quarters and thirds, tablespoons in halves.
const FRACS: Record<number, number[]> = { 240: [0, 0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1], 15: [0, 0.5, 1], 5: [0, 0.25, 0.5, 0.75, 1] };
/** Is n close (within 5%) to a whole number plus a fraction this measure comes in? */
const clean = (n: number, size: number) => FRACS[size].some((f) => Math.abs(Math.floor(n) + f - n) <= Math.max(0.05 * n, 0.01));

/**
 * Millilitres as cups, tablespoons or teaspoons: the biggest spoon that measures it cleanly.
 * 4 tbsp is ¼ cup, but 6 tbsp stays 6 tbsp rather than becoming a rounded-off ⅓ cup.
 */
function spoonText(low: number, high: number | null = null): string {
  const vals = high != null ? [low, high] : [low];
  const top = high ?? low;
  const pick = ([240, 15, 5] as const).find((size) => top / size >= (size === 240 ? 0.25 : size === 15 ? 1 : 0) && vals.every((v) => clean(v / size, size))) ?? (top >= 15 ? 15 : 5);
  const unit = pick === 240 ? (top / 240 > 1.1 ? 'cups' : 'cup') : pick === 15 ? 'tbsp' : 'tsp';
  const n = (ml: number) => niceNumber(ml / pick);
  return high != null ? `${n(low)}–${n(high)} ${unit}` : `${n(low)} ${unit}`;
}

function amount(n: number, unit: string | null): string {
  if (!unit) return countText(n);
  const u = unitKey(unit);
  if (u === 'cup' || u === 'tbsp' || u === 'tsp') return spoonText(n * ML[u]);
  if (u === 'g' || u === 'kg') return `${u === 'kg' && n >= 1 ? niceNumber(n) : roundGrams(u === 'kg' ? n * 1000 : n)} ${u === 'kg' && n >= 1 ? 'kg' : 'g'}`;
  if (u === 'ml' || u === 'l') return n * ML[u] >= 1000 ? `${niceNumber((n * ML[u]) / 1000)} l` : `${roundGrams(n * ML[u])} ml`;
  if (u === 'oz' || u === 'lb') return `${niceNumber(n)} ${u === 'lb' && n > 1 ? 'lbs' : u}`;
  return `${niceNumber(n)} ${unit.trim()}`;
}

/** One ingredient line made `factor` times bigger. Lines without a leading amount stay as written. */
export function scaleLine(line: string, factor: number): string {
  if (factor === 1) return line;
  const m = line.match(LEAD);
  if (!m) return line;
  const [whole, lead, lowText, dash, highText, unitText] = m;
  const low = toNumber(lowText) * factor;
  const high = highText ? toNumber(highText) * factor : null;
  if (!Number.isFinite(low)) return line;
  const unit = unitText?.trim() || null;
  // The number pattern can swallow the space after it; give it back.
  const gap = whole.match(/\s+$/)?.[0] ?? '';
  let rest = line.slice(whole.length);
  let text: string;
  if (high != null) {
    // A range keeps one unit, chosen by its top end: "2–3 tbsp" doubled is "4–6 tbsp".
    const u = unit ? unitKey(unit) : null;
    if (u === 'cup' || u === 'tbsp' || u === 'tsp') text = spoonText(low * ML[u], high * ML[u]);
    else if (unit) text = `${amount(low, unit).replace(/\s*[a-z]+$/i, '')}–${amount(high, unit)}`;
    else text = `${countText(low)}${dash === 'to' ? ' to ' : '–'}${countText(high)}`;  } else {
    text = amount(low, unit);
  }
  // "1 lemon" for four people is "2 lemons".
  if (!unit && (high ?? low) > 1) rest = rest.replace(/^(\s*(?:\([^)]*\)\s*)?)([a-z]+)\b/i, (all, sp, w) => (COUNTED.test(w) && !/s$/i.test(w) ? `${sp}${plural(w)}` : all));
  return `${lead}${text}${gap}${rest}`;
}

/** An amount written inside a step ("2 cups"), scaled when it's a measured quantity. Times and temperatures never match. */
export function scaleInStep(amountText: string, factor: number): string {
  if (factor === 1) return amountText;
  const m = amountText.match(LEAD);
  if (!m || !m[5]) return amountText;
  return scaleLine(amountText, factor);
}

/** The first number in a yield ("6 servings", "2-4 servings", "12 cookies"), or null for "1 loaf"-less yields. */
export function baseServings(yieldText: string | null | undefined): number | null {
  const m = yieldText?.match(/(\d+(?:\.\d+)?)/);
  return m ? +m[1] : null;
}

/** The yield, scaled: "2-4 servings" for 4 people instead of 2 reads "4-8 servings". */
export function scaleYield(yieldText: string, factor: number): string {
  if (factor === 1) return yieldText;
  return yieldText.replace(/\d+(?:\.\d+)?/g, (n) => niceNumber(+n * factor).replace(' ', ''));
}

// How many each recipe is being made for, while the app is open. Shared by the recipe page,
// cook mode and the grocery picker, so "make it for 2" carries through without passing it around.
const servings = new Map<string, number>();
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** The factor a recipe is currently scaled by, for code that isn't a component. */
export const factorFor = (slug: string, yieldText: string | null | undefined) => {
  const base = baseServings(yieldText) ?? 1;
  return (servings.get(slug) ?? base) / base;
};

/** The factor a recipe's amounts are multiplied by, and a way to set how many it makes. */
export function useScale(slug: string, yieldText: string | null | undefined) {
  const base = baseServings(yieldText) ?? 1;
  const target = useSyncExternalStore(subscribe, () => servings.get(slug) ?? base);
  const set = (n: number) => {
    if (n === base) servings.delete(slug);
    else servings.set(slug, n);
    listeners.forEach((fn) => fn());
  };
  return { base, target, factor: target / base, setTarget: set, hasYield: baseServings(yieldText) != null };
}
