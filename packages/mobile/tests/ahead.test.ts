import { describe, expect, it } from 'vitest';
import { aheadOf } from '../src/lib/ahead';

describe('aheadOf', () => {
  it('asks for softened butter and a flax egg before starting', () => {
    const a = aheadOf(['1 cup room temperature vegan butter', '2 flax egg (2 tbsp ground flax mixed with 6 tbsp water; let sit for 5-10 minutes)'], []);
    expect(a.tasks).toEqual(['Leave the vegan butter out to soften', 'Make the flax egg first: it sets in 5–10 min']);
  });

  it('presses the tofu once, with its time, and skips "if you don\'t have..." alternatives', () => {
    const a = aheadOf(
      ['1 block firm tofu'],
      ['Prepare the firm tofu by pressing it for ~15 minutes or so.', 'After pressing the tofu, cut it into cubes.', "If you don't have an air fryer, press the tofu and pan fry it."],
    );
    expect(a.tasks).toEqual(['Press the tofu, about 15 min']);
    expect(aheadOf(['1 block firm tofu'], ["If you don't have an air fryer, press the tofu."]).tasks).toEqual([]);
  });

  it('names what to thaw', () => {
    expect(aheadOf([], ['Confirm phyllo dough is fully thawed before starting.']).tasks).toEqual(['Thaw the phyllo dough']);
  });

  it('lists long hands-off waits and ignores short ones and alternatives', () => {
    const a = aheadOf([], [
      'Cover the bowl and leave out at room temperature for 8 hours or until it doubles in volume.',
      'Place the muffin pan in the freezer for 1 hour to chill.',
      'Put the cups back in the freezer to chill for 10 minutes, then serve.',
      'Put the bowl in the fridge for 30 mins to chill.',
      'For a softer texture, you can refrigerate it for about 4 hours instead.',
    ]);
    expect(a.waits.map((w) => w.text)).toEqual(['8 hr to rise', '1 hr in the freezer', '30 min in the fridge']);
  });

  it('has nothing to say about a straightforward recipe', () => {
    expect(aheadOf(['1 cup rice'], ['Cook the rice for 15 minutes.'])).toEqual({ tasks: [], waits: [] });
  });
});
