import { describe, expect, it } from 'vitest';
import { artFor } from '../src/lib/ingredientArt';

describe('artFor', () => {
  it.each([
    ['2 tbsp coconut oil', 'oil'],
    ['1 can full-fat coconut milk', 'coconut'],
    ['1 tsp garlic powder', 'spice'],
    ['3 cloves garlic, minced', 'garlic'],
    ['2 tbsp rice wine vinegar', 'vinegar'],
    ['1 C jasmine rice (cooked)', 'rice'],
    ['1 red bell pepper, sliced', 'bellPepper'],
    ['Black pepper, to taste', 'pepper'],
    ['1/4 tsp red pepper flakes', 'spice'],
    ['2 tbsp peanut butter', 'nutButter'],
    ['1 tbsp vegan butter', 'butter'],
    ['1 tsp vanilla extract', 'vanilla'],
    ['2 scallions, sliced', 'scallion'],
    ['1 red onion, sliced', 'onion'],
    ['1 block firm tofu', 'tofu'],
    ['2 tbsp lime juice', 'citrus'],
    ['2 tbsp soy sauce', 'soySauce'],
    ['1 (4 oz) can Thai Red Curry Paste', 'sauce'],
    ['200 g all-purpose flour', 'flour'],
    ['2 tbsp coconut sugar', 'sugar'],
  ])('%s → %s', (line, art) => {
    expect(artFor(line)).toBe(art);
  });

  it('leaves water and one-offs without a drawing', () => {
    expect(artFor('2 cups water')).toBe(null);
    expect(artFor('1 vegan burger patty')).toBe(null);
  });
});

