import { describe, expect, it } from 'vitest';
import { favorites, moreLikeLoved } from '../src/lib/personal';
import type { Recipe } from '../src/lib/recipes';

const recipe = (slug: string, extra: Partial<Recipe> = {}): Recipe =>
  ({ id: null, slug, title: slug, shortTitle: null, description: '', category: null, totalMinutes: null, totalText: null, yieldText: null, equipment: [], image: '', date: null, ingredients: [], steps: [], tips: [], cuisine: null, difficulty: null, ...extra }) as Recipe;

const all = [
  recipe('curry', { cuisine: 'Thai', category: 'Meal' }),
  recipe('pad-see-ew', { cuisine: 'Thai', category: 'Meal', date: '2026-01-01' }),
  recipe('soup', { cuisine: 'Italian', category: 'Meal', date: '2026-02-01' }),
  recipe('cookies', { cuisine: 'American', category: 'Dessert' }),
  recipe('larb', { cuisine: 'Thai', category: 'Side' }),
];
const counts: Record<string, number> = { curry: 2, soup: 5 };
const cooked = (s: string) => counts[s] ?? 0;

describe('favorites', () => {
  it('shows loved recipes, most-cooked first', () => {
    expect(favorites(all, ['curry', 'soup'], cooked).map((r) => r.slug)).toEqual(['soup', 'curry']);
  });
});

describe('moreLikeLoved', () => {
  it('suggests uncooked recipes like the loved ones, cuisine first', () => {
    expect(moreLikeLoved(all, ['curry'], cooked, () => true).map((r) => r.slug)).toEqual(['pad-see-ew', 'larb']);
  });

  it("skips what's been cooked and what doesn't fit the cook", () => {
    expect(moreLikeLoved(all, ['curry'], cooked, (r) => r.slug !== 'pad-see-ew').map((r) => r.slug)).toEqual(['larb']);
    // soup shares "Meal" with curry but has been cooked.
    expect(moreLikeLoved(all, ['curry'], cooked, () => true)).not.toContainEqual(expect.objectContaining({ slug: 'soup' }));
  });

  it('is empty until something is loved', () => {
    expect(moreLikeLoved(all, [], cooked, () => true)).toEqual([]);
  });
});
