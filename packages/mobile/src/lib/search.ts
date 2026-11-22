import { guides, type Guide } from './journeys';
import { displayTitle, recipes, type Recipe, type TimeLimit } from './recipes';

export type RecipeHit = { recipe: Recipe; why: string | null; score: number };

const words = (q: string) =>
  q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1);

// Plural-insensitive: "chickpeas" finds "chickpea", "tomatoes" finds "tomato".
const stem = (w: string) => w.replace(/(oes|es|s)$/, (m) => (m === 'oes' ? 'o' : ''));

/**
 * Recipes matching every word, ranked: title matches first, then ingredients, then
 * equipment, cuisine and category. `why` names the ingredient that matched, so a
 * search for "lime" can say "has 1 tbsp lime juice".
 */
export function searchRecipes(query: string, limit: TimeLimit): RecipeHit[] {
  const terms = words(query).map(stem);
  if (!terms.length) return [];
  const hits: RecipeHit[] = [];
  for (const r of recipes) {
    if (limit != null && (r.totalMinutes == null || r.totalMinutes > limit)) continue;
    const title = `${displayTitle(r)} ${r.title}`.toLowerCase();
    const ingredients = r.ingredients.flatMap((g) => g.items);
    const meta = [...r.equipment, r.cuisine ?? '', r.category ?? ''].join(' ').toLowerCase();
    let score = 0;
    let why: string | null = null;
    let all = true;
    for (const t of terms) {
      if (title.includes(t)) score += 3;
      else {
        const ing = ingredients.find((line) => line.toLowerCase().includes(t));
        if (ing) {
          score += 2;
          why ??= ing;
        } else if (meta.includes(t)) score += 1;
        else all = false;
      }
    }
    if (all) hits.push({ recipe: r, why, score });
  }
  return hits.sort((a, b) => b.score - a.score || (a.recipe.totalMinutes ?? 0) - (b.recipe.totalMinutes ?? 0));
}

export function searchGuides(query: string): Guide[] {
  const terms = words(query).map(stem);
  if (!terms.length) return [];
  return guides.filter((g) => {
    const text = `${g.title} ${g.city ?? ''} ${g.country ?? ''} ${g.category ?? ''}`.toLowerCase();
    return terms.every((t) => text.includes(t));
  });
}

/** Ingredients that show up across the most recipes: good one-tap suggestions. */
export function popularIngredients(n = 8): string[] {
  const CANDIDATES = [
    'tofu', 'chickpeas', 'peanut butter', 'coconut milk', 'sourdough discard', 'lime', 'garlic', 'spinach',
    'black beans', 'potatoes', 'rice', 'tahini', 'dates', 'oat milk', 'mushrooms', 'cashews', 'blueberries',
  ];
  return CANDIDATES.map((c) => ({ c, n: searchRecipes(c, null).length }))
    .filter((x) => x.n >= 2)
    .sort((a, b) => b.n - a.n)
    .slice(0, n)
    .map((x) => x.c);
}
