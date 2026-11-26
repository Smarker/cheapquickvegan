import { describe, expect, it } from 'vitest';
import { cairnPile, cairns, newMilestone, progressOf, STACK_UNTIL, STONES_PER_CAIRN, type Progress } from '../src/lib/cairn';
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

describe('cairnPile', () => {
  const cooked = (n: number) => Array.from({ length: n }, (_, i) => ({ slug: `r${i}`, firstCookedOn: `2026-01-${String(i + 1).padStart(2, '0')}` }));

  it('stacks a few stones in one balanced column, each smaller than the one below', () => {
    const { stones } = cairnPile(cooked(STACK_UNTIL));
    expect(stones.map((s) => s.slug)).toEqual(['r0', 'r1', 'r2', 'r3', 'r4']);
    for (let i = 1; i < stones.length; i++) expect(stones[i].y).toBeGreaterThan(stones[i - 1].y);
    expect(stones[stones.length - 1].width).toBeLessThan(stones[0].width);
  });

  it('builds a wide base once there are enough, oldest at the bottom and the newest on top', () => {
    const { stones, width } = cairnPile(cooked(30));
    expect(stones).toHaveLength(30);
    const lowest = Math.min(...stones.map((s) => s.y));
    const bottom = stones.filter((s) => s.y - lowest < 4);
    expect(bottom.length).toBeGreaterThan(3);
    expect(bottom.map((s) => s.slug)).toContain('r0');
    const top = stones.reduce((a, b) => (b.y > a.y ? b : a));
    expect(top.slug).toBe('r29');
    // Wider than a single stack, and narrower towards the top.
    expect(width).toBeGreaterThan(cairnPile(cooked(STACK_UNTIL)).width);
    const half = (pick: typeof stones) => Math.max(...pick.map((s) => Math.abs(s.x) + s.width / 2));
    const mid = (Math.min(...stones.map((s) => s.y)) + Math.max(...stones.map((s) => s.y))) / 2;
    expect(half(stones.filter((s) => s.y > mid))).toBeLessThan(half(stones.filter((s) => s.y <= mid)));
  });
});
