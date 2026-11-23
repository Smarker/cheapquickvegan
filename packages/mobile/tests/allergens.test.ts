import { describe, expect, it } from 'vitest';
import { allergensIn } from '../src/lib/allergens';

describe('allergensIn', () => {
  it('finds the usual suspects', () => {
    expect(allergensIn(['1 block firm tofu', '2 tbsp soy sauce'])).toEqual(['soy', 'gluten']);
    expect(allergensIn(['2 tbsp peanut butter'])).toEqual(['peanuts']);
    expect(allergensIn(['1 cup raw cashews'])).toEqual(['treeNuts']);
    expect(allergensIn(['⅓ cup tahini', '1 tbsp sesame oil'])).toEqual(['sesame']);
    expect(allergensIn(['1 can full-fat coconut milk'])).toEqual(['coconut']);
    expect(allergensIn(['200 g all-purpose flour'])).toEqual(['gluten']);
  });

  it("doesn't cry wolf at look-alikes or gluten-free swaps", () => {
    expect(allergensIn(['¼ tsp nutmeg', '1 butternut squash', '2 tbsp nutritional yeast'])).toEqual([]);
    expect(allergensIn(['1 cup almond flour'])).toEqual(['treeNuts']);
    expect(allergensIn(['2 tbsp tamari', '8 oz rice noodles', '6 corn tortillas'])).toEqual(['soy']);
    expect(allergensIn(['1 red onion', '3 cloves garlic'])).toEqual([]);
  });
});
