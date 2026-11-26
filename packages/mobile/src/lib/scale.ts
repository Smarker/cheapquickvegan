// Making a recipe for more or fewer people: scale each ingredient's amount, keep it friendly
// (1 ½ cups, not 1.5 cups; 6 tbsp becomes ⅓ cup), and leave times, temperatures and
// "to taste" alone. Works on the written line, before any grams/cups conversion.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { ML, NUM, niceNumber, roundGrams, toNumber, UNIT, unitKey } from './units';

const LEAD = new RegExp(String.raw`^(\s*)(${NUM})(?:\s*(-|–|to)\s*(${NUM}))?(\s*${UNIT}\.?(?=\s|$|\)))?`, 'i');

// Counted things whose word should become plural when one becomes several.
const COUNTED = /^(clove|can|lemon|lime|onion|block|carrot|potato|tomato|pepper|jar|package|bunch|head|stalk|sprig|slice|banana|avocado|cucumber|zucchini|shallot|sheet|bag|date|egg|tortilla|bun|patty|leaf|piece|cup)\b/i;
const plural = (w: string) => (/(o|ch)$/i.test(w) ? `${w}es` : /f$/i.test(w) ? `${w.slice(0, -1)}ves` : `${w}s`);

/** A count, rounded to the nearest quarter (¼ shallot is a real thing; 0.37 of an onion isn't), never below ¼. Big counts round to halves. */
// How each counted thing can be split, by convention: a clove or an egg is whole, a can or a block can be
// halved, produce can be quartered (¼ onion, ¼ shallot).
const WHOLE = /^(cloves?|eggs?|tortillas?|slices?|sheets?|buns?|patt(y|ies)|lea(f|ves)|dates?|pieces?|crackers?|cookies?|sprigs?|stalks?)\b/i;
const PACKED = /^(cans?|jars?|blocks?|packages?|packs?|bags?|bunch(es)?|heads?|box(es)?|cartons?|loa(f|ves))\b/i;
/** The word being counted: "1 (14 oz) can coconut milk" → "can". */
const countedWord = (rest: string) => rest.replace(/^\s*(?:\([^)]*\)\s*)?/, '').match(/^[a-z]+/i)?.[0] ?? '';
const countStep = (rest: string): { step: number; min: number } =>
  WHOLE.test(countedWord(rest)) ? { step: 1, min: 1 } : PACKED.test(countedWord(rest)) ? { step: 0.5, min: 0.5 } : { step: 0.25, min: 0.25 };
/** A count rounded the way that thing is bought or cut. Past 3, quarters stop mattering, so halves. */
const countText = (n: number, rest = '') => {
  const { step, min } = countStep(rest);
  const st = n >= 3 && step < 0.5 ? 0.5 : step;
  return frac(Math.max(min, Math.round(n / st) * st));
};

const GLYPH: [number, string][] = [[0.125, '⅛'], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']];
/** A number as a cook writes it: 1 ½, ⅛, 2 ⅔. */
function frac(x: number): string {
  let whole = Math.floor(x + 1e-9);
  const rest = x - whole;
  if (rest < 0.06) return String(whole || 0);
  if (rest > 0.94) return String(whole + 1);
  const g = GLYPH.reduce((best, c) => (Math.abs(c[0] - rest) < Math.abs(best[0] - rest) ? c : best))[1];
  return whole ? `${whole} ${g}` : g;
}

// The fractions each measure actually comes in: cups in quarters and thirds, tablespoons in halves.
// The fractions each measure actually comes in: cup measures in quarters and thirds, tablespoons in
// halves, teaspoons down to an eighth.
const FRACS: Record<number, number[]> = { 240: [0, 0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1], 15: [0, 0.5, 1], 5: [0, 0.125, 0.25, 0.5, 0.75, 1] };
/** The nearest amount this measure can actually measure. */
const snap = (n: number, size: number) => {
  const whole = Math.floor(n);
  return whole + FRACS[size].reduce((best, f) => (Math.abs(whole + f - n) < Math.abs(whole + best - n) ? f : best));
};
/** The smallest spoon amount worth writing: ⅛ teaspoon. Less than that is a pinch. */
export const MIN_ML = 0.625;
/** Is n close (within 5%) to a whole number plus a fraction this measure comes in? */
const clean = (n: number, size: number) => FRACS[size].some((f) => Math.abs(Math.floor(n) + f - n) <= Math.max(0.05 * n, 0.01));

/**
 * Millilitres as cups, tablespoons or teaspoons: the biggest spoon that measures it cleanly.
 * 4 tbsp is ¼ cup, but 6 tbsp stays 6 tbsp rather than becoming a rounded-off ⅓ cup.
 */
function spoonText(low: number, high: number | null = null): string {
  const vals = high != null ? [low, high] : [low];
  const top = high ?? low;
  if (top < MIN_ML * 0.75) return 'a pinch';
  const pick = ([240, 15, 5] as const).find((size) => top / size >= (size === 240 ? 0.25 : size === 15 ? 0.5 : 0) && vals.every((v) => clean(v / size, size))) ?? (top >= 15 ? 15 : 5);
  const unit = pick === 240 ? (top / 240 > 1.1 ? 'cups' : 'cup') : pick === 15 ? 'tbsp' : 'tsp';
  const n = (ml: number) => frac(Math.max(pick === 5 ? 0.125 : 0, snap(ml / pick, pick)));
  return high != null ? `${n(low)}–${n(high)} ${unit}` : `${n(low)} ${unit}`;
}

function amount(n: number, unit: string | null, rest = ''): string {
  if (!unit) return countText(n, rest);
  const u = unitKey(unit);
  if (u === 'cup' || u === 'tbsp' || u === 'tsp') return spoonText(n * ML[u]);
  if (u === 'g' || u === 'kg') return `${u === 'kg' && n >= 1 ? niceNumber(n) : roundGrams(u === 'kg' ? n * 1000 : n)} ${u === 'kg' && n >= 1 ? 'kg' : 'g'}`;
  if (u === 'ml' || u === 'l') return n * ML[u] >= 1000 ? `${niceNumber((n * ML[u]) / 1000)} l` : `${roundGrams(n * ML[u])} ml`;
  if (u === 'oz' || u === 'lb') return `${niceNumber(n)} ${u === 'lb' && n > 1 ? 'lbs' : u}`;
  return `${niceNumber(n)} ${unit.trim()}`;
}

/** One ingredient line made `factor` times bigger. Lines without a leading amount stay as written. */
// "A pinch of salt": about 1/16 teaspoon. Pinches add up (2 pinches), and once there are enough to
// measure, they become teaspoons (4 pinches is ¼ tsp). Scaling down, a pinch stays a pinch.
const PINCH = /^(\s*)(?:an?\s+|(\d+)\s+)?(pinch(?:es)?|dash(?:es)?)\b/i;
const PINCH_ML = 5 / 16;
function scalePinch(line: string, factor: number): string | null {
  const m = line.match(PINCH);
  if (!m) return null;
  const [whole, lead, count, word] = m;
  const n = (count ? +count : 1) * factor;
  const rest = line.slice(whole.length);
  const kind = /^dash/i.test(word) ? 'dash' : 'pinch';
  if (n < 1.5) return `${lead}a ${kind}${rest}`;
  if (n * PINCH_ML >= 5 / 4 - 1e-9) return `${lead}${spoonText(n * PINCH_ML)}${rest.replace(/^\s+of\b/i, '')}`;
  const k = Math.round(n);
  return `${lead}${k} ${kind === 'dash' ? 'dashes' : 'pinches'}${rest}`;
}

export function scaleLine(line: string, factor: number): string {
  if (factor === 1) return line;
  const pinch = scalePinch(line, factor);
  // Keep the recipe's capital letter ("A pinch").
  if (pinch != null) return /^\s*[A-Z]/.test(line) ? pinch.replace(/^(\s*)([a-z])/, (_, sp: string, c: string) => sp + c.toUpperCase()) : pinch;
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
    else text = `${countText(low, line.slice(whole.length))}${dash === 'to' ? ' to ' : '–'}${countText(high, line.slice(whole.length))}`;  } else {
    text = amount(low, unit, line.slice(whole.length));
  }
  // "1 lemon" for four people is "2 lemons".
  if (!unit && (high ?? low) > 1) rest = rest.replace(/^(\s*(?:\([^)]*\)\s*)?)([a-z]+)\b/i, (all, sp, w) => (COUNTED.test(w) && !/s$/i.test(w) ? `${sp}${plural(w)}` : all));
  return `${lead}${text}${gap}${rest}`;
}

/**
 * The smallest factor a recipe can be scaled to before something can't be measured: a spoon amount
 * under ⅛ teaspoon, a clove or an egg under one, a can under half, produce under a quarter.
 */
export function minFactor(lines: string[]): number {
  return floorOf(lines).factor;
}

/** The floor and the ingredient that sets it, so the stepper can say why it stops. */
export function floorOf(lines: string[]): { factor: number; limit: string | null } {
  let floor = 0;
  let limit: string | null = null;
  for (const line of lines) {
    const m = line.match(LEAD);
    if (!m) continue;
    const n = toNumber(m[2]);
    if (!Number.isFinite(n) || n <= 0) continue;
    const unit = m[5]?.trim();
    if (unit) {
      const u = unitKey(unit);
      if (u === 'cup' || u === 'tbsp' || u === 'tsp') {
        const f = MIN_ML / (n * ML[u]);
        if (f > floor) [floor, limit] = [f, line];
      }
    } else {
      const f = countStep(line.slice(m[0].length)).min / n;
      if (f > floor) [floor, limit] = [f, line];
    }
  }
  return { factor: Math.min(1, floor), limit: floor > 0 ? limit : null };
}

/**
 * An amount written inside a step, scaled when it's a quantity: "2 cups", or a bare count
 * before an ingredient ("1/2" in "Dice 1/2 a shallot"). Times and temperatures never match.
 */
export function scaleInStep(amountText: string, factor: number): string {
  if (factor === 1) return amountText;
  const m = amountText.match(LEAD);
  const bareCount = !!m && m[0].trim() === amountText.trim();
  if (!m || (!m[5] && !bareCount)) return amountText;
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

// How many each recipe is made for. Shared by the recipe page, cook mode and the grocery picker, so
// "make it for 2" carries through, and kept on the phone so a restart mid-cook doesn't go back to 6.
const KEY = 'cqv:servings:v1';
const servings = new Map<string, number>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (!raw) return;
    for (const [slug, n] of Object.entries(JSON.parse(raw) as Record<string, number>)) if (!servings.has(slug)) servings.set(slug, n);
    emit();
  })
  .catch(() => {});
const save = () => AsyncStorage.setItem(KEY, JSON.stringify(Object.fromEntries(servings))).catch(() => {});

/**
 * The amounts the stepper moves through. Small yields go one at a time (6 → 5 → 4 servings);
 * big batches move in useful fractions and multiples (12 date balls → 6 → 3, or → 18 → 24).
 */
export function servingSteps(base: number): number[] {
  if (base < 8) return Array.from({ length: Math.max(12, base * 4) }, (_, i) => i + 1);
  const out = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map((m) => Math.round(base * m)).filter((n) => n >= 1);
  return [...new Set(out)];
}
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
export function useScale(slug: string, yieldText: string | null | undefined, lines: string[] = []) {
  const base = baseServings(yieldText) ?? 1;
  const target = useSyncExternalStore(subscribe, () => servings.get(slug) ?? base);
  const set = (n: number) => {
    if (n === base) servings.delete(slug);
    else servings.set(slug, n);
    emit();
    save();
  };
  // Never smaller than every ingredient can still be measured.
  const { factor: floor, limit } = floorOf(lines);
  const steps = servingSteps(base).filter((n) => n === base || n / base >= floor - 1e-9);
  // The nearest step below/above the current amount, even if it was saved off-step.
  const less = [...steps].reverse().find((n) => n < target);
  const more = steps.find((n) => n > target);
  return {
    base,
    target,
    factor: target / base,
    setTarget: set,
    hasYield: baseServings(yieldText) != null,
    less: () => less != null && set(less),
    more: () => more != null && set(more),
    canLess: less != null,
    canMore: more != null,
    /** At the smallest batch: the ingredient line that can't go smaller. */
    // Only when an ingredient is what stops it, not the plain one-serving minimum.
    limit: less == null && servingSteps(base)[0] < target ? limit : null,
  };
}
