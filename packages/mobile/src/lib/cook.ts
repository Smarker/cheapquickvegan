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
