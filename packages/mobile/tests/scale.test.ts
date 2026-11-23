import { describe, expect, it } from 'vitest';
import { baseServings, minFactor, scaleInStep, scaleLine, scaleYield, servingSteps } from '../src/lib/scale';

describe('scaleLine', () => {
  it('leaves lines alone at 1×', () => {
    expect(scaleLine('2 cups flour', 1)).toBe('2 cups flour');
  });
  it('doubles and halves cups and spoons into friendly amounts', () => {
    expect(scaleLine('1 cup flour', 2)).toBe('2 cups flour');
    expect(scaleLine('1/2 cup oat milk', 0.5)).toBe('¼ cup oat milk');
    expect(scaleLine('3 tbsp soy sauce', 2)).toBe('6 tbsp soy sauce');
    expect(scaleLine('2 tbsp soy sauce', 2)).toBe('¼ cup soy sauce');
    expect(scaleLine('1 tsp cumin', 0.5)).toBe('½ tsp cumin');
    expect(scaleLine('4 tbsp vinegar', 1 / 3)).toBe('4 tsp vinegar');
    expect(scaleLine('1 ½ cups rice', 2)).toBe('3 cups rice');
  });
  it('scales weights and keeps grams round', () => {
    expect(scaleLine('200g tofu', 1.5)).toBe('300 g tofu');
    expect(scaleLine('1 (14 oz) can coconut milk', 2)).toBe('2 (14 oz) cans coconut milk');
  });
  it('rounds counts and pluralises', () => {
    expect(scaleLine('1 lemon, juiced', 2)).toBe('2 lemons, juiced');
    expect(scaleLine('1 onion', 0.25)).toBe('¼ onion');
    expect(scaleLine('1/2 shallot, chopped', 0.5)).toBe('¼ shallot, chopped');
    expect(scaleLine('1/2 shallot, chopped', 1 / 3)).toBe('¼ shallot, chopped');
  });
  it('scales ranges with one unit', () => {
    expect(scaleLine('2-3 tbsp maple syrup', 2)).toBe('4–6 tbsp maple syrup');
    expect(scaleLine('2-3 cloves garlic', 2)).toBe('4–6 cloves garlic');
  });
  it('leaves untouchable lines as written', () => {
    expect(scaleLine('Salt and pepper to taste', 2)).toBe('Salt and pepper to taste');
    expect(scaleLine('Pinch of chili flakes', 3)).toBe('Pinch of chili flakes');
  });
});

describe('steps and yields', () => {
  it('scales measured amounts in steps but never times or temperatures', () => {
    expect(scaleInStep('2 cups', 2)).toBe('4 cups');
    expect(scaleInStep('20 min', 2)).toBe('20 min');
    expect(scaleInStep('400F', 2)).toBe('400F');
  });
  it('reads and scales yields', () => {
    expect(baseServings('2-4 servings')).toBe(2);
    expect(baseServings('Makes a loaf')).toBe(null);
    expect(scaleYield('2-4 servings', 2)).toBe('4-8 servings');
    expect(scaleYield('6 servings', 0.5)).toBe('3 servings');
  });
});

describe('servingSteps', () => {
  it('goes one at a time for small yields', () => {
    expect(servingSteps(6).slice(0, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('moves big batches in useful jumps', () => {
    expect(servingSteps(12)).toEqual([3, 6, 9, 12, 18, 24, 36, 48]);
  });
});

describe('conventional rounding', () => {
  it('rounds spoons to what spoons measure', () => {
    expect(scaleLine('1 tsp salt', 1 / 6)).toBe('⅛ tsp salt');
    expect(scaleLine('1 tbsp oil', 0.5)).toBe('½ tbsp oil');
    expect(scaleLine('1/4 tsp cayenne', 0.25)).toBe('a pinch cayenne');
  });
  it('keeps whole things whole and halves packages', () => {
    expect(scaleLine('3 cloves garlic', 0.5)).toBe('2 cloves garlic');
    expect(scaleLine('1 block firm tofu', 1 / 3)).toBe('½ block firm tofu');
    expect(scaleLine('1 can chickpeas', 0.5)).toBe('½ can chickpeas');
  });
});

describe('minFactor', () => {
  it('stops before anything drops below what can be measured', () => {
    expect(minFactor(['1/2 shallot, chopped', '1 cup cilantro'])).toBe(0.5);
    expect(minFactor(['1 egg', '2 cups flour'])).toBe(1);
    expect(minFactor(['1/4 tsp salt'])).toBe(0.5);
  });
});
