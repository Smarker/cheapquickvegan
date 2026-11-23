import { describe, expect, it } from 'vitest';
import { AREAS, journey, openHikes, recipesFor, REGIONS } from '../src/lib/journeys';

describe('hikes', () => {
  it('give each area recipe exactly one hike', () => {
    for (const area of AREAS) {
      const hikes = REGIONS.filter((h) => h.area === area.id);
      const slugs = hikes.flatMap((h) => recipesFor(h).map((r) => r.slug));
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('keep every stop at the hike grade, behind one signpost', () => {
    for (const h of openHikes()) {
      const stops = journey(h);
      expect(stops.filter((s) => s.kind === 'section')).toHaveLength(1);
      for (const s of stops) if (s.kind === 'recipe') expect(s.difficulty).toBe(h.grade);
    }
  });

});
