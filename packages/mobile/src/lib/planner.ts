import { shoppingName } from './groceryMerge';
import type { Recipe } from './recipes';

// The weekly planner: a dinner each day plus one optional extra (lunch, a side, dessert).
// Plain data and functions only; the store in plannerStore.tsx keeps it on the phone.

export type Slot = 'dinner' | 'extra';
export const SLOTS: Slot[] = ['dinner', 'extra'];
/** A planned recipe, and how many times it had been cooked when planned (so we can tick it off). */
export type PlanItem = { slug: string; cookedAtAdd: number };
export type Day = Partial<Record<Slot, PlanItem>>;
/** Keyed by local date, "2026-11-23". */
export type Plan = Record<string, Day>;

// ---- Dates: weeks run Monday to Sunday, in the phone's own time zone. ----

const pad = (n: number) => String(n).padStart(2, '0');
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export function addDays(iso: string, n: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + n);
  return isoDay(d);
}
/** The Monday of the week a date falls in. */
export function mondayOf(d: Date): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return isoDay(copy);
}
export const daysOf = (monday: string) => Array.from({ length: 7 }, (_, i) => addDays(monday, i));
export const isWeekendDay = (iso: string) => [0, 6].includes(fromIso(iso).getDay());
export function dayLabel(iso: string, today: string): string {
  if (iso === today) return 'Today';
  if (iso === addDays(today, 1)) return 'Tomorrow';
  return fromIso(iso).toLocaleDateString(undefined, { weekday: 'long' });
}
export function weekLabel(monday: string, thisMonday: string): string {
  if (monday === thisMonday) return 'This week';
  if (monday === addDays(thisMonday, 7)) return 'Next week';
  if (monday === addDays(thisMonday, -7)) return 'Last week';
  const d = fromIso(monday);
  return `Week of ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

// ---- Changing a plan. Each returns a new plan. ----

export function setSlot(plan: Plan, day: string, slot: Slot, item: PlanItem | null): Plan {
  const next: Day = { ...plan[day] };
  if (item) next[slot] = item;
  else delete next[slot];
  const out = { ...plan, [day]: next };
  if (!next.dinner && !next.extra) delete out[day];
  return out;
}

/** Move a meal to another day or slot. Whatever was there trades places with it, so nothing is lost. */
export function moveMeal(plan: Plan, from: { day: string; slot: Slot }, to: { day: string; slot: Slot }): Plan {
  const moving = plan[from.day]?.[from.slot];
  if (!moving || (from.day === to.day && from.slot === to.slot)) return plan;
  const there = plan[to.day]?.[to.slot] ?? null;
  return setSlot(setSlot(plan, from.day, from.slot, there), to.day, to.slot, moving);
}

/** Copy one week into another, only into empty slots, so nothing already planned is replaced. */
export function repeatWeek(plan: Plan, fromMonday: string, toMonday: string, cookedCount: (slug: string) => number): Plan {
  let out = plan;
  daysOf(fromMonday).forEach((src, i) => {
    const dst = addDays(toMonday, i);
    for (const slot of SLOTS) {
      const item = plan[src]?.[slot];
      if (item && !out[dst]?.[slot]) out = setSlot(out, dst, slot, { slug: item.slug, cookedAtAdd: cookedCount(item.slug) });
    }
  });
  return out;
}

export const slugsIn = (plan: Plan, days: string[], slot?: Slot) =>
  days.flatMap((d) => (slot ? [plan[d]?.[slot]] : SLOTS.map((s) => plan[d]?.[s]))).filter((x): x is PlanItem => !!x).map((x) => x.slug);

// ---- "Plan my week": no AI, just a scored, explainable pick. ----

/** Weeknights get quicker dinners when there are enough of them; weekends can take longer. */
export const WEEKNIGHT_MINUTES = 45;

export type Taste = {
  loved: string[];
  good: string[];
  tweak: string[];
  /** Hearted recipes and the "This week" list: meals the cook already said they want. */
  wanted: string[];
};

// Fresh things worth using up across the week. Pantry staples overlapping means nothing.
const STAPLE = /\b(oils?|salt|black pepper|white pepper|water|cornstarch|sauce|vinegar|garlic|sugar|flour|syrup|spices?|powder|paprika|cumin|flakes|to taste|seasoning|extract|stock cube)\b/;
const DESCRIPTOR = /\b(chopped|minced|diced|sliced|fresh|loosely|packed|cooked|large|small|medium|ripe|thinly|finely|optional)\b/g;

/** Fresh ingredients a recipe buys, as short keys: "red bell pepper" and "bell pepper" both become "bell pepper". */
export function freshKeys(r: Recipe): string[] {
  const keys = new Set<string>();
  for (const line of r.ingredients.flatMap((g) => g.items)) {
    const name = shoppingName(line).toLowerCase();
    if (STAPLE.test(name)) continue;
    const words = name.replace(DESCRIPTOR, ' ').split(/\s+/).filter(Boolean);
    // "red onions" and "red onion" are the same shopping: drop a plural s from the last word.
    if (words.length) keys.add(words.slice(-2).join(' ').replace(/oes$/, 'o').replace(/(?<=[a-z]{3})s$/, ''));
  }
  return [...keys];
}

function baseScore(r: Recipe, taste: Taste, recent: string[]): number {
  let s = 0;
  if (taste.loved.includes(r.slug)) s += 3;
  if (taste.wanted.includes(r.slug)) s += 3;
  if (taste.good.includes(r.slug)) s += 1;
  if (taste.tweak.includes(r.slug)) s -= 2;
  if (recent.includes(r.slug)) s -= 4;
  return s;
}

/**
 * Fill the empty dinner slots of a week. Picks one at a time: the best-scoring recipe that fits
 * the cook, isn't already in the week, is quick enough on a weeknight, and (as a tiebreak that
 * adds up) shares fresh ingredients with what's already picked, so the grocery list stays short.
 * Deterministic: the same inputs always give the same week.
 */
export function planMyWeek(opts: {
  days: string[];
  plan: Plan;
  dinners: Recipe[];
  taste: Taste;
  /** Dinners from the previous two weeks, kept for later rather than repeated. */
  recent: string[];
  lovedCuisines?: string[];
  cookedCount: (slug: string) => number;
}): Plan {
  const { days, dinners, taste, recent } = opts;
  const cuisines = new Set(opts.lovedCuisines ?? []);
  let plan = opts.plan;
  const used = new Set(slugsIn(plan, days));
  const bought = new Set(days.flatMap((d) => SLOTS.map((s) => plan[d]?.[s]?.slug)).flatMap((slug) => {
    const r = dinners.find((x) => x.slug === slug);
    return r ? freshKeys(r) : [];
  }));

  // Fill weeknights first, so quick dinners go where time is short.
  const empty = days.filter((d) => !plan[d]?.dinner).sort((a, b) => Number(isWeekendDay(a)) - Number(isWeekendDay(b)));
  for (const day of empty) {
    const weeknight = !isWeekendDay(day);
    const pool = dinners.filter((r) => !used.has(r.slug));
    const quick = pool.filter((r) => (r.totalMinutes ?? 0) <= WEEKNIGHT_MINUTES);
    const choices = weeknight && quick.length ? quick : pool;
    if (!choices.length) break;
    const score = (r: Recipe) =>
      baseScore(r, taste, recent) + (r.cuisine && cuisines.has(r.cuisine) ? 1 : 0) + Math.min(2, freshKeys(r).filter((k) => bought.has(k)).length * 0.5);
    const pick = [...choices].sort((a, b) => score(b) - score(a) || a.slug.localeCompare(b.slug))[0];
    plan = setSlot(plan, day, 'dinner', { slug: pick.slug, cookedAtAdd: opts.cookedCount(pick.slug) });
    used.add(pick.slug);
    freshKeys(pick).forEach((k) => bought.add(k));
  }
  return plan;
}

/** "Swap" on one day: the next best dinner not already in the week, or null when there's none. */
export function nextDinner(opts: { day: string; days: string[]; plan: Plan; dinners: Recipe[]; taste: Taste; recent: string[] }): Recipe | null {
  const { day, days, plan, dinners, taste, recent } = opts;
  const current = plan[day]?.dinner?.slug;
  const used = new Set(slugsIn(plan, days));
  const pool = dinners.filter((r) => !used.has(r.slug));
  const quick = pool.filter((r) => (r.totalMinutes ?? 0) <= WEEKNIGHT_MINUTES);
  const choices = !isWeekendDay(day) && quick.length ? quick : pool;
  const sorted = [...choices].sort((a, b) => baseScore(b, taste, recent) - baseScore(a, taste, recent) || a.slug.localeCompare(b.slug));
  return sorted.find((r) => r.slug !== current) ?? null;
}
