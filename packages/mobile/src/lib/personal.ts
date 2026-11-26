import type { Recipe } from './recipes';

// Discover shelves built from what this cook told us after cooking. Quiet shelves only,
// never nudges: they show what's there and disappear when there's nothing to show.

/** Recipes they loved, most-cooked first. */
export function favorites(all: Recipe[], loved: string[], cookedCount: (slug: string) => number): Recipe[] {
  return all.filter((r) => loved.includes(r.slug)).sort((a, b) => cookedCount(b.slug) - cookedCount(a.slug));
}

/**
 * Recipes they haven't cooked that share a category or cuisine with ones they loved,
 * closest first (a cuisine match counts more than a category match), then newest.
 */
export function moreLikeLoved(all: Recipe[], loved: string[], cookedCount: (slug: string) => number, fits: (r: Recipe) => boolean): Recipe[] {
  const lovedRecipes = all.filter((r) => loved.includes(r.slug));
  if (!lovedRecipes.length) return [];
  const cuisines = new Set(lovedRecipes.map((r) => r.cuisine).filter(Boolean));
  const categories = new Set(lovedRecipes.map((r) => r.category).filter(Boolean));
  const score = (r: Recipe) => (r.cuisine && cuisines.has(r.cuisine) ? 2 : 0) + (r.category && categories.has(r.category) ? 1 : 0);
  return all
    .filter((r) => !loved.includes(r.slug) && cookedCount(r.slug) === 0 && fits(r) && score(r) > 0)
    .sort((a, b) => score(b) - score(a) || (b.date ?? '').localeCompare(a.date ?? ''));
}
