import { describe, expect, it } from 'vitest';
import { swapsFor } from '../src/lib/swaps';

describe('swapsFor', () => {
  it('only swaps what the cook avoids', () => {
    const lines = ['3 tbsp peanut butter', '2 tbsp soy sauce', '1 cup rice'];
    expect(swapsFor(lines, ['peanuts']).swaps).toEqual([{ name: 'Peanut butter', use: 'sunflower seed butter' }]);
    expect(swapsFor(lines, []).swaps).toEqual([]);
  });

  it('picks a swap free of everything avoided', () => {
    const soySauce = ['2 tbsp soy sauce'];
    expect(swapsFor(soySauce, ['gluten']).swaps[0].use).toMatch(/^tamari/);
    expect(swapsFor(soySauce, ['soy']).swaps[0].use).toMatch(/^coconut aminos/);
    // Tamari has soy, coconut aminos has coconut: nothing fits, so say so instead of guessing.
    expect(swapsFor(soySauce, ['soy', 'coconut'])).toEqual({ swaps: [], incomplete: true });
  });

  it('leaves out optional ingredients', () => {
    expect(swapsFor(['1 tsp sesame oil (optional)'], ['sesame']).swaps).toEqual([{ name: 'Sesame oil', use: "It's optional: leave it out" }]);
  });

  it('ignores an avoided ingredient that is only offered as an alternative', () => {
    expect(swapsFor(['2 tbsp pine nuts (or sesame seeds!)'], ['sesame'])).toEqual({ swaps: [], incomplete: false });
  });

  it('flags ingredients with no good swap', () => {
    const r = swapsFor(['1 block firm tofu', '2 tbsp soy sauce'], ['soy']);
    expect(r.swaps.map((s) => s.name)).toEqual(['Soy sauce']);
    expect(r.incomplete).toBe(true);
  });

  it("doesn't treat bread flour as bread", () => {
    expect(swapsFor(['4 cups bread flour'], ['gluten'])).toEqual({ swaps: [], incomplete: true });
  });
});
