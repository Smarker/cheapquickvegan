import { describe, expect, it } from 'vitest';
import { canConvert, convertLine } from '../src/lib/units';

describe('convertLine to grams', () => {
  it.each([
    ['1 cup all-purpose flour', '130 g all-purpose flour'],
    ['2 cups flour', '250 g flour'],
    ['½ cup sugar', '100 g sugar'],
    ['1 ½ cups oat milk', '360 g oat milk'],
    ['1/2 C of tzatziki', '120 g of tzatziki'],
    ['2-3 C of tzatziki', '490–740 g of tzatziki'],
    ['1C frozen blueberries', '150 g frozen blueberries'],
    ['1 can full-fat coconut milk', '1 can full-fat coconut milk'],
    ['¼ cup maple syrup', '80 g maple syrup'],
    ['3 tbsp peanut butter', '50 g peanut butter'],
    ['24 oz of vegan ground beef', '680 g of vegan ground beef'],
  ])('%s → %s', (from, to) => expect(convertLine(from, 'grams')).toBe(to));

  it('keeps small spoon amounts, counts and unknown ingredients as they are', () => {
    for (const line of ['1 tsp cumin', '1 tbsp soy sauce', '1–2 tbsp coconut oil', '1 red onion, sliced', '1 block firm tofu', '3 cloves garlic', '1 cup mystery mix', 'Black pepper, to taste', '200 g flour'])
      expect(convertLine(line, 'grams')).toBe(line);
  });
});

describe('convertLine to cups and spoons', () => {
  it.each([
    ['500 g bread flour', '4 cups bread flour'],
    ['350 g water', '1 ½ cups water'],
    ['80 g sourdough discard', '⅓ cup sourdough discard'],
    ['10 g salt', '10 g salt'],
    ['50g water', '3 ⅓ tbsp water'],
    ['250 ml oat milk', '1 cup oat milk'],
  ])('%s → %s', (from, to) => expect(convertLine(from, 'volume')).toBe(to));

  it('leaves cup lines alone', () => expect(convertLine('1 cup flour', 'volume')).toBe('1 cup flour'));
});

describe('canConvert', () => {
  it('is false when nothing would change', () => expect(canConvert(['1 tsp cumin', '1 red onion'])).toBe(false));
  it('is true with a cup of flour', () => expect(canConvert(['1 cup flour'])).toBe(true));
});

describe('real-recipe edge cases', () => {
  it.each([
    ['3 cups all-purpose flour (360g)', 'grams', '360 g all-purpose flour'],
    ['4 tbsp (56g) vegan butter (melted)', 'grams', '56 g vegan butter (melted)'],
    ['1 lb chopped mixed nuts', 'grams', '450 g chopped mixed nuts'],
    ['1 ¾ lb (or 800g) of fresh tomatoes', 'volume', '1 ¾ lb (or 800g) of fresh tomatoes'],
    ['1 cup frozen blueberries (No ice needed, it chills without watering it down.)', 'grams', '150 g frozen blueberries (No ice needed, it chills without watering it down.)'],
    ['1 C cooked white rice', 'grams', '160 g cooked white rice'],
    ['1 C jasmine rice (cooked)', 'grams', '160 g jasmine rice (cooked)'],
    ['30-50g vegan vanilla yogurt', 'volume', '2–3 ¼ tbsp vegan vanilla yogurt'],
  ] as const)('%s (%s) → %s', (from, to, out) => expect(convertLine(from, to)).toBe(out));
});

import { convertInStep } from '../src/lib/units';
describe('convertInStep', () => {
  it('converts amounts by the words that follow', () => {
    expect(convertInStep('3 cups', ' all-purpose flour, then mix', 'grams')).toBe('380 g');
    expect(convertInStep('½ cup', ' of maple syrup and stir', 'grams')).toBe('160 g');
    expect(convertInStep('6 tbsp', ' water, give it a stir', 'grams')).toBe('90 g');
  });
  it('leaves small spoons, times, temperatures and unchosen units alone', () => {
    expect(convertInStep('2 tbsp', ' ground flax', 'grams')).toBe('2 tbsp');
    expect(convertInStep('15–20 minutes', ', shaking', 'grams')).toBe('15–20 minutes');
    expect(convertInStep('400°F', ' for 10 minutes', 'grams')).toBe('400°F');
    expect(convertInStep('3 cups', ' flour', null)).toBe('3 cups');
  });
});
