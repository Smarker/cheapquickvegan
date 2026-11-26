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
    expect(scaleLine('4 tbsp vinegar', 1 / 3)).toBe('1 tbsp + 1 tsp vinegar');
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
    expect(scaleLine('Pinch of chili flakes', 3)).toBe('3 pinches of chili flakes');
  });
});

describe('steps and yields', () => {
  it('scales measured amounts in steps but never times or temperatures', () => {
    expect(scaleInStep('2 cups', 2)).toBe('4 cups');
    expect(scaleInStep('20 min', 2)).toBe('20 min');
    expect(scaleInStep('400F', 2)).toBe('400F');
    // A bare count before an ingredient ("Dice 1/2 a shallot") follows the batch too.
    expect(scaleInStep('1/2', 2)).toBe('1');
    expect(scaleInStep('2', 0.5)).toBe('1');
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
  });
  it('writes big spoon counts as the bigger measure plus a little', () => {
    // The chimichurri at 7 servings instead of 6.
    expect(scaleLine('1 cup fresh cilantro, chopped', 7 / 6)).toBe('1 cup + 2 ½ tbsp fresh cilantro, chopped');
    expect(scaleLine('1/2 cup olive oil', 7 / 6)).toBe('½ cup + 1 ½ tbsp olive oil');
    expect(scaleLine('3 1/2 tsp lemon juice', 2)).toBe('2 tbsp + 1 tsp lemon juice');
    // 3 tsp is a tablespoon, so 3 ½ tsp is a tablespoon and a bit.
    expect(scaleLine('1 tbsp lemon juice', 7 / 6)).toBe('1 tbsp + ½ tsp lemon juice');
    // Small counts stay as one measure.
    expect(scaleLine('3 tbsp soy sauce', 2)).toBe('6 tbsp soy sauce');
    expect(scaleLine('4 tbsp vinegar', 1 / 3)).toBe('1 tbsp + 1 tsp vinegar');
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

describe('pinches', () => {
  it('stay a pinch when scaled down, add up when scaled up, and become spoons when measurable', () => {
    expect(scaleLine('A pinch of salt', 0.5)).toBe('A pinch of salt');
    expect(scaleLine('A pinch of salt', 2)).toBe('2 pinches of salt');
    expect(scaleLine('a pinch of cayenne', 4)).toBe('¼ tsp cayenne');
  });
});

describe('compound amounts downstream', () => {
  it('are read whole as an amount, so step tags match the ingredient list', async () => {
    const { amountOf } = await import('../src/lib/cook');
    expect(amountOf('1 cup + 2 ½ tbsp fresh cilantro, chopped')).toBe('1 cup + 2 ½ tbsp');
    expect(amountOf('1 tbsp + ½ tsp lemon juice')).toBe('1 tbsp + ½ tsp');
  });
  it('weigh as one amount in grams', async () => {
    const { convertLine } = await import('../src/lib/units');
    expect(convertLine('½ cup + 1 ½ tbsp olive oil', 'grams')).toBe('130 g olive oil');
    expect(convertLine('1 tbsp + ½ tsp lemon juice', 'grams')).toBe('1 tbsp + ½ tsp lemon juice');
  });
});
