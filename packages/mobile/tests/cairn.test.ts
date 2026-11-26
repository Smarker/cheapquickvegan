import { describe, expect, it } from 'vitest';
import { cairns, newMilestone, progressOf, STONES_PER_CAIRN, type Progress } from '../src/lib/cairn';
import type { Recipe } from '../src/lib/recipes';

const p = (over: Partial<Progress> = {}): Progress => ({ recipes: 0, meals: 0, summits: 0, ingredients: 0, ...over });

describe('cairns', () => {
  it('stacks one stone per recipe, oldest at the bottom, a new cairn every few stones', () => {
    const cooked = Array.from({ length: STONES_PER_CAIRN + 2 }, (_, i) => ({ slug: `r${i}`, firstCookedOn: `2026-01-${String(20 - i).padStart(2, '0')}` }));
    const stacks = cairns(cooked);
    expect(stacks.map((s) => s.length)).toEqual([STONES_PER_CAIRN, 2]);
    expect(stacks[0][0].slug).toBe(`r${STONES_PER_CAIRN + 1}`); // first cooked
  });

  it('gives each recipe the same stone every time, smaller toward the top', () => {
    const a = cairns([{ slug: 'curry' }, { slug: 'soup' }]);
    expect(cairns([{ slug: 'curry' }, { slug: 'soup' }])).toEqual(a);
    expect(cairns([])).toEqual([]);
  });
});

describe('newMilestone', () => {
  it('marks the first cook', () => {
    expect(newMilestone(p(), p({ recipes: 1, meals: 1 }))).toMatch(/first stone/);
  });

  it('says nothing when no milestone was crossed', () => {
    expect(newMilestone(p({ recipes: 2, meals: 3 }), p({ recipes: 2, meals: 4 }))).toBeNull();
  });

  it('picks the biggest when several land at once', () => {
    expect(newMilestone(p({ recipes: 9, meals: 9 }), p({ recipes: 10, meals: 10 }))).toMatch(/Ten different recipes/);
  });
});

describe('progressOf', () => {
  it('counts different recipes, meals and fresh ingredients', () => {
    const r = (slug: string, items: string[]) => ({ slug, ingredients: [{ name: null, items }] }) as unknown as Recipe;
    const all = [r('a', ['1 red onion', '1 tbsp olive oil']), r('b', ['2 red onions', '1 lime']), r('c', ['1 cup rice'])];
    const counts: Record<string, number> = { a: 2, b: 1 };
    expect(progressOf(all, (s) => counts[s] ?? 0, 1)).toEqual({ recipes: 2, meals: 3, summits: 1, ingredients: 2 });
  });
});
