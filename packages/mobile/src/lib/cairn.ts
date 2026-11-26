import { freshKeys } from './planner';
import type { Recipe } from './recipes';

// Your cairn: one stone for each different recipe you've cooked, stacked in the order you
// first made them. Hikers build cairns to mark the way; this one marks yours. A quiet record:
// no streaks, nothing to keep up, and it never shrinks.

/** A cairn gets too tall to read past this; the next stone starts a new cairn along the trail. */
export const STONES_PER_CAIRN = 7;

export type Stone = { slug: string; width: number; height: number; tilt: number; shift: number; shade: number; bumps: [number, number, number] };

/** A stable number from a slug, so each recipe's stone keeps its shape every time. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

/** Stones in the order first cooked (oldest at the bottom), split into cairns. */
export function cairns(cooked: { slug: string; firstCookedOn?: string }[]): Stone[][] {
  const ordered = [...cooked].sort((a, b) => (a.firstCookedOn ?? '').localeCompare(b.firstCookedOn ?? '') || a.slug.localeCompare(b.slug));
  const out: Stone[][] = [];
  ordered.forEach(({ slug }, i) => {
    const level = i % STONES_PER_CAIRN;
    if (level === 0) out.push([]);
    const r = (n: number) => hash(`${slug}:${n}`);
    out[out.length - 1].push({
      slug,
      // Wide flat stones at the bottom, smaller rounder ones on top, each a little different.
      width: 64 - level * 6 + (r(1) - 0.5) * 12,
      height: 20 + r(2) * 7 - level * 0.6,
      tilt: (r(3) - 0.5) * 12,
      shift: (r(4) - 0.5) * 8,
      shade: Math.floor(r(5) * 3),
      bumps: [r(6), r(7), r(8)],
    });
  });
  return out;
}

/** A lumpy stone outline around (cx, cy): flatter underneath, rounded on top, never two alike. */
export function stonePath(s: Stone, cx: number, cy: number): string {
  const w = s.width / 2;
  const h = s.height / 2;
  const [a, b, c] = s.bumps.map((x) => (x - 0.5) * h * 0.5);
  const f = (n: number) => n.toFixed(1);
  return [
    `M${f(cx - w)} ${f(cy + h * 0.2)}`,
    `C${f(cx - w)} ${f(cy - h * 0.5 + a)} ${f(cx - w * 0.35)} ${f(cy - h + b)} ${f(cx + w * 0.05)} ${f(cy - h)}`,
    `C${f(cx + w * 0.45)} ${f(cy - h + c)} ${f(cx + w)} ${f(cy - h * 0.4)} ${f(cx + w)} ${f(cy + h * 0.15)}`,
    `C${f(cx + w)} ${f(cy + h * 0.7)} ${f(cx + w * 0.4)} ${f(cy + h)} ${f(cx)} ${f(cy + h)}`,
    `C${f(cx - w * 0.45)} ${f(cy + h)} ${f(cx - w)} ${f(cy + h * 0.75)} ${f(cx - w)} ${f(cy + h * 0.2)}Z`,
  ].join(' ');
}

/** How tall a cairn stands, for sizing the drawing to the tallest one. */
export const cairnHeight = (stack: Stone[]) => stack.reduce((y, s) => y + s.height * 0.82, 0) + 6;

export type Progress = { recipes: number; meals: number; summits: number; ingredients: number };

/** Where this cook is now: different recipes, total meals, hikes summited, fresh ingredients cooked with. */
export function progressOf(all: Recipe[], cookedCount: (slug: string) => number, summits: number): Progress {
  const cooked = all.filter((r) => cookedCount(r.slug) > 0);
  return {
    recipes: cooked.length,
    meals: cooked.reduce((n, r) => n + cookedCount(r.slug), 0),
    summits,
    ingredients: new Set(cooked.flatMap(freshKeys)).size,
  };
}

type Milestone = { reached: (p: Progress) => boolean; line: string };

// Small moments, said once, on the finish screen. Never a badge, never a count to beat.
const MILESTONES: Milestone[] = [
  { reached: (p) => p.recipes >= 1, line: 'Your first stone. Your cairn has started.' },
  { reached: (p) => p.recipes >= 5, line: 'Five different recipes. Your cairn is taking shape.' },
  { reached: (p) => p.meals >= 10, line: "That's ten meals cooked." },
  { reached: (p) => p.recipes >= 10, line: 'Ten different recipes tried.' },
  { reached: (p) => p.ingredients >= 25, line: "You've cooked with 25 different fresh ingredients." },
  { reached: (p) => p.recipes >= 25, line: 'Twenty-five different recipes. That cairn can be seen from the trail.' },
  { reached: (p) => p.summits >= 1, line: 'Your first hike summited.' },
];

/** The milestone this cook just crossed, if any. When several land at once, the biggest one. */
export function newMilestone(before: Progress, after: Progress): string | null {
  const crossed = MILESTONES.filter((m) => m.reached(after) && !m.reached(before));
  return crossed.length ? crossed[crossed.length - 1].line : null;
}
