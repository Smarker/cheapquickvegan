import { describe, expect, it } from 'vitest';
import { baseServings, scaleInStep, scaleLine, scaleYield } from '../src/lib/scale';

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
  it('rounds counts to halves and pluralises', () => {
    expect(scaleLine('1 lemon, juiced', 2)).toBe('2 lemons, juiced');
    expect(scaleLine('3 cloves garlic', 0.5)).toBe('1 ½ cloves garlic');
    expect(scaleLine('1 onion', 0.25)).toBe('½ onion');
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
