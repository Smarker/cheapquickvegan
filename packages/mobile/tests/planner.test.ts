import { describe, expect, it } from 'vitest';
import { addDays, daysOf, freshKeys, mondayOf, moveMeal, nextDinner, planMyWeek, repeatWeek, setSlot, slugsIn, type Plan, type Taste } from '../src/lib/planner';
import type { Recipe } from '../src/lib/recipes';

const recipe = (slug: string, minutes: number, lines: string[] = [], extra: Partial<Recipe> = {}): Recipe =>
  ({ id: null, slug, title: slug, shortTitle: null, description: '', category: 'Meal', totalMinutes: minutes, totalText: null, yieldText: null, equipment: [], image: '', date: null, ingredients: [{ name: null, items: lines }], steps: [], tips: [], cuisine: null, difficulty: null, ...extra }) as Recipe;

const MON = '2026-11-23';
const week = daysOf(MON);
const none: Taste = { loved: [], good: [], tweak: [], wanted: [] };
const zero = () => 0;
const item = (slug: string) => ({ slug, cookedAtAdd: 0 });

describe('dates', () => {
  it('weeks start on Monday', () => {
    expect(mondayOf(new Date(2026, 10, 25))).toBe(MON); // a Wednesday
    expect(mondayOf(new Date(2026, 10, 29))).toBe(MON); // the Sunday
    expect(mondayOf(new Date(2026, 10, 30))).toBe('2026-11-30');
    expect(week).toHaveLength(7);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('moving and repeating', () => {
  it('trades places when moving onto a planned day, so nothing is lost', () => {
    let plan: Plan = setSlot({}, week[0], 'dinner', item('curry'));
    plan = setSlot(plan, week[2], 'dinner', item('soup'));
    plan = moveMeal(plan, { day: week[0], slot: 'dinner' }, { day: week[2], slot: 'dinner' });
    expect(plan[week[0]].dinner?.slug).toBe('soup');
    expect(plan[week[2]].dinner?.slug).toBe('curry');
  });

  it('moves into an empty day and clears the old one', () => {
    const plan = moveMeal(setSlot({}, week[0], 'dinner', item('curry')), { day: week[0], slot: 'dinner' }, { day: week[4], slot: 'extra' });
    expect(plan[week[0]]).toBeUndefined();
    expect(plan[week[4]].extra?.slug).toBe('curry');
  });

  it('repeats a week only into empty slots', () => {
    const next = addDays(MON, 7);
    let plan: Plan = setSlot({}, week[0], 'dinner', item('curry'));
    plan = setSlot(plan, week[1], 'extra', item('cookies'));
    plan = setSlot(plan, next, 'dinner', item('soup'));
    plan = repeatWeek(plan, MON, next, zero);
    expect(plan[next].dinner?.slug).toBe('soup'); // already planned, kept
    expect(plan[addDays(next, 1)].extra?.slug).toBe('cookies');
  });
});

describe('planMyWeek', () => {
  const dinners = [
    recipe('quick-a', 20, ['1 red onion']),
    recipe('quick-b', 30, ['1 block firm tofu']),
    recipe('quick-c', 40, ['2 red onions, sliced']),
    recipe('quick-d', 45),
    recipe('quick-e', 25),
    recipe('slow-stew', 90),
    recipe('slow-bread', 240),
  ];

  it('fills every empty dinner with a different recipe, quick ones on weeknights', () => {
    const plan = planMyWeek({ days: week, plan: {}, dinners, taste: none, recent: [], cookedCount: zero });
    const picked = slugsIn(plan, week, 'dinner');
    expect(new Set(picked).size).toBe(7);
    for (const d of week.slice(0, 5)) expect(plan[d].dinner?.slug).toMatch(/^quick/);
  });

  it("keeps what's already planned and leaves extras alone", () => {
    const start = setSlot(setSlot({}, week[0], 'dinner', item('slow-stew')), week[0], 'extra', item('cookies'));
    const plan = planMyWeek({ days: week, plan: start, dinners, taste: none, recent: [], cookedCount: zero });
    expect(plan[week[0]]).toEqual(start[week[0]]);
    expect(week.filter((d) => plan[d].extra)).toEqual([week[0]]);
  });

  it('prefers loved and wanted recipes, and skips recent ones when it can', () => {
    const taste = { ...none, loved: ['quick-e'], wanted: ['quick-d'] };
    const plan = planMyWeek({ days: week.slice(0, 2), plan: {}, dinners, taste, recent: [], cookedCount: zero });
    expect(slugsIn(plan, week.slice(0, 2)).sort()).toEqual(['quick-d', 'quick-e']);
    const again = planMyWeek({ days: week.slice(0, 1), plan: {}, dinners, taste: none, recent: ['quick-a', 'quick-b', 'quick-c'], cookedCount: zero });
    expect(['quick-d', 'quick-e']).toContain(again[week[0]].dinner?.slug);
  });

  it('leans toward recipes that share fresh ingredients', () => {
    const start = setSlot({}, week[0], 'dinner', item('quick-a')); // red onion
    const plan = planMyWeek({ days: week.slice(0, 2), plan: start, dinners, taste: none, recent: [], cookedCount: zero });
    expect(plan[week[1]].dinner?.slug).toBe('quick-c'); // also red onion
  });

  it('is the same every time for the same inputs', () => {
    const a = planMyWeek({ days: week, plan: {}, dinners, taste: none, recent: [], cookedCount: zero });
    const b = planMyWeek({ days: week, plan: {}, dinners, taste: none, recent: [], cookedCount: zero });
    expect(a).toEqual(b);
  });

  it('stops when it runs out of recipes instead of repeating', () => {
    const plan = planMyWeek({ days: week, plan: {}, dinners: dinners.slice(0, 3), taste: none, recent: [], cookedCount: zero });
    expect(slugsIn(plan, week)).toHaveLength(3);
  });
});

describe('nextDinner', () => {
  it('offers a different dinner not already in the week', () => {
    const dinners = [recipe('a', 20), recipe('b', 20), recipe('c', 20)];
    const plan = setSlot(setSlot({}, week[0], 'dinner', item('a')), week[1], 'dinner', item('b'));
    expect(nextDinner({ day: week[0], days: week, plan, dinners, taste: none, recent: [] })?.slug).toBe('c');
  });
});

describe('freshKeys', () => {
  it('ignores pantry staples and matches the same fresh thing written two ways', () => {
    expect(freshKeys(recipe('x', 10, ['1 red bell pepper', '2 tbsp olive oil', 'Salt, to taste', '1 cup soy sauce']))).toEqual(['bell pepper']);
    expect(freshKeys(recipe('y', 10, ['1 bell pepper, diced']))).toEqual(['bell pepper']);
    expect(freshKeys(recipe('z', 10, ['2 tomatoes', '1 tomato']))).toEqual(['tomato']);
  });
});
