import type { AppRecipe, RecipeGroup } from '@cheapquickvegan/shared';
import data from '../data/recipes.json';

export type Group = RecipeGroup;
export type Recipe = AppRecipe;

/** The recipe list. Starts as the bundled copy; DataProvider swaps in live data from the website in place. */
export const recipes: Recipe[] = [...(data as Recipe[])];

/** Until Notion has a "Short title" field: drop parentheticals and anything after a colon. */
export function displayTitle(r: Recipe): string {
  if (r.shortTitle) return r.shortTitle;
  return r.title
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .split(':')[0]
    .replace(/\bVegan\b\s*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[&,\s]+/, '')
    .trim();
}

export type TimeLimit = 15 | 30 | 60 | null;

export const TIME_OPTIONS: { value: TimeLimit; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
  { value: null, label: 'Any' },
];

/** The next wider time limit, for the end-of-trail nudge. Null when already showing everything. */
export function widerLimit(t: TimeLimit): TimeLimit | undefined {
  if (t === null) return undefined;
  const i = TIME_OPTIONS.findIndex((o) => o.value === t);
  return TIME_OPTIONS[i + 1]?.value;
}

export type Meal = 'breakfast' | 'lunch' | 'dinner';

/** Sides and snacks fit any meal; the main dish follows the meal. Desserts stay out of the trail. */
const CATEGORIES: Record<Meal, string[]> = {
  breakfast: ['Breakfast', 'Side', 'Snack'],
  lunch: ['Meal', 'Side', 'Snack'],
  dinner: ['Meal', 'Side', 'Snack'],
};

/** Recipes for this meal within the time limit, quickest first. The trail reads left to right like a timeline. */
export function tonight(limit: TimeLimit, equipment: string | null, meal: Meal = 'dinner'): Recipe[] {
  return recipes
    .filter((r) => r.category != null && CATEGORIES[meal].includes(r.category))
    .filter((r) => r.totalMinutes != null && (limit == null || r.totalMinutes <= limit))
    .filter((r) => !equipment || r.equipment.includes(equipment))
    .sort((a, b) => (a.totalMinutes ?? 0) - (b.totalMinutes ?? 0));
}

/** How many trail recipes a piece of equipment would give, within the current time limit. */
export function equipmentCount(name: string, limit: TimeLimit = null, meal: Meal = 'dinner'): number {
  return tonight(limit, name, meal).length;
}

export function greeting(now = new Date()): string {
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const h = now.getHours();
  const part = h < 11 ? 'morning' : h < 17 ? 'afternoon' : 'night';
  return `Good ${part === 'night' ? 'evening' : part}, it's ${day}`;
}

/** The Discover heading follows the time of day: breakfast, lunch or dinner. */
export function mealWord(now = new Date()): Meal {
  const h = now.getHours();
  return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : 'dinner';
}

/** Longer savory cooks for a slower day, shortest of them first. */
export function projects(minMinutes = 45): Recipe[] {
  return recipes
    .filter((r) => r.category === 'Meal' || r.category === 'Side' || r.category === 'Breakfast')
    .filter((r) => r.totalMinutes != null && r.totalMinutes > minMinutes)
    .sort((a, b) => (a.totalMinutes ?? 0) - (b.totalMinutes ?? 0));
}

export const isWeekend = (now = new Date()) => now.getDay() === 0 || now.getDay() === 6;

/** Time steps the trail marks with a signpost when it crosses them. */
const STEPS = [
  { max: 15, label: '15 min' },
  { max: 30, label: '30 min' },
  { max: 45, label: '45 min' },
  { max: 60, label: '1 hr' },
  { max: 90, label: '1½ hr' },
  { max: Infinity, label: 'longer' },
];

export function timeStep(minutes: number | null): string {
  return STEPS.find((s) => (minutes ?? 0) <= s.max)!.label;
}
