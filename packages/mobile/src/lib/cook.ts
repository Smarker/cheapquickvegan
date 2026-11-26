import type { Recipe } from './recipes';

export type CookPage = { title: string; steps: string[]; ingredients: string[] };

const UNITS = new Set([
  'cup', 'cups', 'c', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'oz', 'g', 'kg', 'ml', 'l', 'lb', 'lbs',
  'can', 'cans', 'pack', 'packs', 'block', 'pinch', 'dash', 'clove', 'cloves', 'large', 'small', 'medium', 'whole', 'each',
]);
const FILLER = new Set([
  'fresh', 'chopped', 'finely', 'diced', 'sliced', 'minced', 'cooked', 'optional', 'taste', 'and', 'or', 'of', 'the', 'for', 'to',
  'regular', 'vegan', 'plant', 'based', 'plant-based', 'extra', 'about', 'more', 'needed', 'divided', 'pitted', 'melted', 'thinly',
  'ground', 'firm', 'full', 'fat', 'full-fat', 'into', 'with', 'packed', 'roughly', 'room', 'temperature', 'topping',
]);

/** The words that name an ingredient: "1 cup fresh cilantro, chopped" -> ["cilantro"]. */
function keywords(line: string): string[] {
  return line
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .split(/[^a-z-]+/)
    .filter((w) => w.length > 2 && !UNITS.has(w) && !FILLER.has(w));
}

const stem = (w: string) => w.replace(/(es|s)$/, '');

/**
 * Ingredient words to highlight in step text, longest first so "coconut milk" wins over "milk".
 * Two-word names are kept together when both words are meaningful ("peanut butter", "soy sauce").
 */
export function ingredientTerms(lines: string[]): string[] {
  const terms = new Set<string>();
  for (const line of lines) {
    const kw = keywords(line);
    if (kw.length >= 2) terms.add(kw.slice(0, 2).join(' '));
    kw.forEach((w) => w.length > 2 && terms.add(stem(w)));
  }
  return [...terms].sort((a, b) => b.length - a.length);
}

/** Ingredients a set of steps mentions. Empty when a step uses none ("serve immediately"), so the sheet can stay out of the way. */
export function ingredientsFor(stepText: string, all: string[]): string[] {
  const text = stepText.toLowerCase();
  if (/\ball (the )?(remaining )?ingredients\b/.test(text)) return all;
  const hits = all.filter((line) => keywords(line).some((w) => text.includes(stem(w))));
  return hits;
}

/**
 * One page per named section ("Prepare the rice and tofu"); recipes without
 * section names get one page per step, so no page is a wall of text.
 */
export function cookPages(r: Recipe): CookPage[] {
  const all = r.ingredients.flatMap((g) => g.items);
  const named = r.steps.some((g) => g.name);
  const pages: Omit<CookPage, 'ingredients'>[] = named
    ? r.steps.map((g, i) => ({ title: g.name ?? `Step ${i + 1}`, steps: g.items }))
    : r.steps.flatMap((g) => g.items).map((s, i) => ({ title: `Step ${i + 1}`, steps: [s] }));
  return pages.map((pg) => ({ ...pg, ingredients: ingredientsFor(pg.steps.join(' '), all) }));
}

// "1 (4 oz) can …", "2–3 tbsp …", "½ cup …", "200 g …", "1 block …", "1 cup + 2 ½ tbsp …"
const AMOUNT = /^\s*((?:\d+(?:[.,]\d+)?|[½¼¾⅓⅔⅛])(?:\s*(?:[-–]|to)\s*\d+(?:[.,]\d+)?)?(?:\s+\d\/\d|\s*[½¼¾⅓⅔⅛]|\/\d+)?\s*(?:\([^)]*\)\s*)?(?:cups?|c\b|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|g\b|grams?|kg|ml|l\b|lbs?|pounds?|cans?|blocks?|packs?|packages?|cloves?|pinch(?:es)?|bunch(?:es)?|slices?|sheets?|sticks?|stalks?|heads?|jars?|handfuls?|large|small|medium)?(?:\s*\+\s*(?:\d+(?:\s*[½¼¾⅓⅔⅛])?|[½¼¾⅓⅔⅛])\s*(?:cups?|tbsp|tsp))?)/i;

/** The amount at the start of an ingredient line ("1 can", "2–3 tbsp"), or null for "Black pepper, to taste". */
export function amountOf(line: string): string | null {
  const m = line.match(AMOUNT);
  const amount = m?.[1]?.replace(/\s*\([^)]*\)\s*/, ' ').replace(/\s+/g, ' ').trim();
  return amount && /\d|[½¼¾⅓⅔⅛]/.test(amount) ? amount : null;
}

/** An ingredient line's amount, so cook mode can say "coconut milk (1 can)" inline. */
export type IngredientAmount = { amount: string; line: string };

/** Every ingredient line that starts with an amount. */
export function ingredientAmounts(lines: string[]): IngredientAmount[] {
  return lines.flatMap((line) => {
    const amount = amountOf(line);
    return amount ? [{ amount, line }] : [];
  });
}

// Words that can follow an ingredient's name without being part of it ("olive oil, for frying").
const AFTER_NAME = new Set('for or to and plus divided optional about if as at from in with of cut chopped minced diced sliced drained rinsed pressed melted softened cooked thinly finely roughly freshly packed more extra'.split(' '));

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The amount for a name as it appears in a step ("rice", "Thai red curry paste"). Only a line where that
 * name is the whole ingredient counts: "rice" matches "1 C jasmine rice (cooked)" but not
 * "2 tbsp rice wine vinegar". No clean match means no amount, never a wrong one.
 */
export function amountFor(name: string, amounts: IngredientAmount[]): IngredientAmount | null {
  const words = name.toLowerCase().split(/\s+/).map(stem);
  const re = new RegExp(`\\b${words.map(escapeRe).join('(?:e?s)?\\s+')}(?:e?s)?\\b\\s*([a-z]+)?`, 'i');
  for (const a of amounts) {
    const m = a.line.toLowerCase().match(re);
    if (!m) continue;
    const next = m[1];
    if (!next || AFTER_NAME.has(next)) return a;
  }
  return null;
}

// Numbers worth finding at a glance in a step: temperatures, times and stated quantities.
// "400°F", "180 °C", "350 degrees", "15–20 minutes", "1 hour", "30 sec", "1–2 tablespoons", "½ cup".
const NUM = String.raw`(?:\d+(?:[.,]\d+)?(?:\s*[½¼¾⅓⅔])?|[½¼¾⅓⅔])(?:\s*(?:[-–]|to)\s*\d+(?:[.,]\d+)?)?`;
export const MEASURE = new RegExp(
  String.raw`${NUM}\s*(?:°\s*[FC]?\b|degrees(?:\s*[FC]\b)?|(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)\b|(?:cups?|tablespoons?|teaspoons?|tbsp|tsp|oz|ounces?|grams?|g|ml|lbs?|pounds?|inch(?:es)?|cm)\b)`,
  'gi',
);

/** Words a step might use for a recipe's equipment tags: "Air Fryer" → air fryer, air fry; "Tall Skillet" → skillet. */
export function toolTerms(equipment: string[]): string[] {
  const out = new Set<string>();
  for (const tag of equipment) {
    const name = tag.toLowerCase().trim();
    out.add(name.replace(/s$/, ''));
    const lastWord = name.split(/\s+/).pop()!.replace(/s$/, '');
    if (lastWord.length > 3 && !['can', 'opener'].includes(lastWord)) out.add(lastWord);
    if (name === 'air fryer') out.add('air fry');
    if (name === 'immersion blender') out.add('blender');
  }
  return [...out].sort((a, b) => b.length - a.length);
}
