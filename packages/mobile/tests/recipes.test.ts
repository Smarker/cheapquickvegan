import { describe, expect, it } from 'vitest';
import { fitsMeal, isMain, recipes, tonight } from '../src/lib/recipes';

describe('tonight', () => {
  for (const meal of ['breakfast', 'lunch', 'dinner'] as const) {
    it(`puts the ${meal} itself before sides and snacks, each quickest first`, () => {
      const trail = tonight(null, null, meal);
      const firstSide = trail.findIndex((r) => !isMain(r, meal));
      const mains = firstSide === -1 ? trail : trail.slice(0, firstSide);
      const sides = firstSide === -1 ? [] : trail.slice(firstSide);
      expect(sides.every((r) => !isMain(r, meal))).toBe(true);
      for (const part of [mains, sides]) {
        const minutes = part.map((r) => r.totalMinutes ?? 0);
        expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
      }
    });
  }
});

describe('fitsMeal', () => {
  it('keeps desserts out of every meal', () => {
    const desserts = recipes.filter((r) => r.category === 'Dessert');
    for (const meal of ['breakfast', 'lunch', 'dinner'] as const) expect(desserts.some((r) => fitsMeal(r, meal))).toBe(false);
  });

  it('agrees with the trail: everything on it fits the meal', () => {
    for (const meal of ['breakfast', 'lunch', 'dinner'] as const) expect(tonight(null, null, meal).every((r) => fitsMeal(r, meal))).toBe(true);
  });
});
