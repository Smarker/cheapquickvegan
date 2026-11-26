import { describe, expect, it } from 'vitest';
import { AREAS, journey, MIN_STOPS, openHikes, recipesFor } from '../src/lib/journeys';

describe('hikes', () => {
  it('only shows hikes with enough stops', () => {
    for (const h of openHikes()) expect(recipesFor(h).length).toBeGreaterThanOrEqual(MIN_STOPS);
  });

  it('give each area recipe at most one hike', () => {
    for (const area of AREAS) {
      const slugs = openHikes()
        .filter((h) => h.area === area.id)
        .flatMap((h) => recipesFor(h).map((r) => r.slug));
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('puts a signpost before each grade on a hike', () => {
    for (const h of openHikes()) {
      const stops = journey(h);
      const grades = new Set(stops.flatMap((s) => (s.kind === 'recipe' ? [s.difficulty] : [])));
      expect(stops.filter((s) => s.kind === 'section')).toHaveLength(grades.size);
      for (const g of grades) expect((h.grades ?? [h.grade]).includes(g)).toBe(true);
    }
  });
});

describe('started hikes', () => {
  it('keep their stops when new recipes arrive, and list the new ones as side trips', async () => {
    const { sideTrips } = await import('../src/lib/journeys');
    const h = openHikes().find((x) => recipesFor(x).length >= 3)!;
    const all = recipesFor(h).map((r) => r.slug);
    const pinned = all.slice(0, all.length - 1); // pretend the last recipe was published after starting
    const stops = journey(h, pinned).flatMap((s) => (s.kind === 'recipe' ? [s.recipe.slug] : []));
    expect(stops.sort()).toEqual([...pinned].sort());
    expect(sideTrips(h, pinned).map((r) => r.slug)).toEqual([all[all.length - 1]]);
  });
});
