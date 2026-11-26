import { describe, expect, it } from 'vitest';
import { changesBetween, type RecipeSnapshot } from '../src/lib/recipeChanges';

const snap = (ingredients: string[], steps: string[] = []): RecipeSnapshot => ({ ingredients, steps });

describe('changesBetween', () => {
  it('ignores typo fixes, punctuation and capitals', () => {
    const before = snap(['1 cup spinnach', '2 tbsp olive oil'], ['Saute the onion until soft.']);
    const after = snap(['1 cup spinach', '2 tbsp Olive oil.'], ['Sauté the onion until soft']);
    expect(changesBetween(before, after)).toEqual([]);
  });

  it('says when an amount changed', () => {
    expect(changesBetween(snap(['1 cup spinach']), snap(['2 cups spinach']))).toEqual(['Now uses 2 cups spinach instead of 1 cup.']);
  });

  it('lists added and removed ingredients', () => {
    expect(changesBetween(snap(['1 lime', '1 cup rice']), snap(['1 cup rice', '1 block firm tofu']))).toEqual([
      'New ingredient: 1 block firm tofu',
      'No longer uses: 1 lime',
    ]);
  });

  it('counts a replaced step as a rewrite, and notes added or removed steps', () => {
    const before = snap([], ['Boil the pasta.', 'Drain it.']);
    expect(changesBetween(before, snap([], ['Bake the pasta at 400F for 20 minutes.', 'Drain it.']))).toEqual(['One step was rewritten.']);
    expect(changesBetween(before, snap([], ['Boil the pasta.', 'Drain it.', 'Toss with pesto.']))).toEqual(['A step was added.']);
    expect(changesBetween(before, snap([], ['Boil the pasta.']))).toEqual(['A step was taken out.']);
  });

  it('treats a changed number in a step as material', () => {
    expect(changesBetween(snap([], ['Bake for 20 minutes.']), snap([], ['Bake for 30 minutes.']))).toEqual(['One step was rewritten.']);
  });

  it("doesn't care about order", () => {
    expect(changesBetween(snap(['a', 'b'], ['x', 'y']), snap(['b', 'a'], ['y', 'x']))).toEqual([]);
  });
});
