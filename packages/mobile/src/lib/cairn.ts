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
      // A broad flat stone at the bottom, each one above it smaller, the way a cairn is built; no two alike.
      width: 84 - level * 10 + (r(1) - 0.5) * 6,
      height: 21 + r(2) * 6 - level * 1.1,
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

/** A stone set in place in a cairn: its centre, with x from the cairn's middle and y up from the ground. */
export type PlacedStone = Stone & { x: number; y: number };

/** Up to this many stones the cairn is one balanced stack; past it, the older stones become a wide base. */
export const STACK_UNTIL = 5;
/** How many of the newest stones balance on top of a big cairn, like the last few a hiker adds. */
const CAP = 3;

/**
 * Every stone you've earned, built into one cairn. A few stones stack in a single column. After that the
 * older ones are laid in courses (the bottom course widest, each above it narrower) with the newest few
 * balanced on top, so the cairn grows wider as well as taller, the way real ones do. Oldest at the bottom.
 */
export function cairnPile(cooked: { slug: string; firstCookedOn?: string }[]): { stones: PlacedStone[]; width: number; height: number } {
  const ordered = [...cooked].sort((a, b) => (a.firstCookedOn ?? '').localeCompare(b.firstCookedOn ?? '') || a.slug.localeCompare(b.slug));
  const r = (slug: string, n: number) => hash(`${slug}:${n}`);
  const shape = (slug: string, width: number, height: number): Stone => ({
    slug,
    width,
    height,
    tilt: (r(slug, 3) - 0.5) * 10,
    shift: 0,
    shade: Math.floor(r(slug, 5) * 3),
    bumps: [r(slug, 6), r(slug, 7), r(slug, 8)],
  });
  const stones: PlacedStone[] = [];
  let y = 0;
  // A balanced column: each stone a little smaller than the one it sits on.
  const column = (list: { slug: string }[], startWidth: number, step: number) => {
    list.forEach(({ slug }, i) => {
      const st = shape(slug, startWidth - i * step + (r(slug, 1) - 0.5) * 6, 21 + r(slug, 2) * 5 - i * 1.1);
      stones.push({ ...st, x: (r(slug, 4) - 0.5) * 7, y: y + st.height / 2 });
      y += st.height * 0.8;
    });
  };

  if (ordered.length <= STACK_UNTIL) {
    column(ordered, 84, 10);
  } else {
    const base = ordered.slice(0, ordered.length - CAP);
    const cap = ordered.slice(ordered.length - CAP);
    // Course sizes from the top down, widening by one stone every second course (2, 2, 3, 3, 4…) so the
    // cairn stands steep and tall rather than slumping into a heap. Trimmed from the top to hold exactly the base.
    const sizes: number[] = [];
    for (let i = 0, total = 0; total < base.length; i++) {
      const n = 2 + Math.floor(i / 2);
      sizes.push(n);
      total += n;
    }
    let extra = sizes.reduce((a, b) => a + b, 0) - base.length;
    while (extra > 0) {
      const cut = Math.min(extra, sizes[0] - 1);
      sizes[0] -= cut;
      extra -= cut;
      if (extra > 0) extra -= sizes.shift()!;
    }
    // Lay them bottom up, oldest first, each course's slabs side by side and offset like brickwork.
    let next = 0;
    sizes.reverse().forEach((count, ci) => {
      const slabs = base.slice(next, next + count).map(({ slug }) => shape(slug, 30 + r(slug, 1) * 12, 12 + r(slug, 2) * 4));
      next += count;
      const rowW = slabs.reduce((w, s) => w + s.width * 0.9, 0);
      let x = -rowW / 2 + (ci % 2 ? 4 : -4);
      const rowH = Math.max(...slabs.map((s) => s.height));
      slabs.forEach((s) => {
        stones.push({ ...s, x: x + (s.width * 0.9) / 2, y: y + s.height / 2 + (r(s.slug, 9) - 0.5) * 2 });
        x += s.width * 0.9;
      });
      y += rowH * 0.82;
    });
    // The newest few on top, balanced, getting smaller.
    column(cap, 44, 8);
  }
  const width = stones.length ? Math.max(...stones.map((s) => Math.abs(s.x) + s.width / 2)) * 2 : 0;
  const height = stones.length ? Math.max(...stones.map((s) => s.y + s.height / 2)) : 0;
  return { stones, width, height };
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
  { reached: (p) => p.recipes >= 1, line: 'Your first stone. Your cairn has started in Kitchen.' },
  { reached: (p) => p.recipes >= 5, line: 'Five different recipes. Your cairn is taking shape.' },
  { reached: (p) => p.meals >= 10, line: "That's ten meals cooked." },
  { reached: (p) => p.recipes >= 10, line: 'Ten different recipes tried.' },
  { reached: (p) => p.ingredients >= 25, line: "You've cooked with 25 different fresh ingredients." },
  { reached: (p) => p.recipes >= 25, line: 'Twenty-five different recipes. That cairn can be seen from the trail.' },
  { reached: (p) => p.summits >= 1, line: 'Your first journey finished.' },
];

/** The milestone this cook just crossed, if any. When several land at once, the biggest one. */
export function newMilestone(before: Progress, after: Progress): string | null {
  const crossed = MILESTONES.filter((m) => m.reached(after) && !m.reached(before));
  return crossed.length ? crossed[crossed.length - 1].line : null;
}
