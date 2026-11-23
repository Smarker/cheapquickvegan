import { describe, expect, it } from 'vitest';
import { mergeLines, shoppingName } from '../src/lib/groceryMerge';

const items = (...texts: string[]) => texts.map((text, i) => ({ id: String(i), text, checked: false }));

describe('shoppingName', () => {
  it.each([
    ['3 cloves garlic, minced', 'garlic'],
    ['1 tsp garlic, finely chopped', 'garlic'],
    ['2–3 tbsp soy sauce', 'soy sauce'],
    ['1 (4 oz) can Thai Red Curry Paste (Maesri)', 'Thai Red Curry Paste'],
    ['Black pepper, to taste', 'Black pepper'],
    ['1/2 C of tzatziki', 'tzatziki'],
    ['1 red onion, sliced', 'red onion'],
  ])('%s → %s', (line, name) => expect(shoppingName(line)).toBe(name));
});

describe('mergeLines', () => {
  it('adds up the same unit', () => {
    const out = mergeLines(items('2 tbsp soy sauce', '1 red onion', '1 tbsp soy sauce'));
    expect(out.map((l) => l.text)).toEqual(['3 tbsp soy sauce', '1 red onion']);
    expect(out[0].ids).toEqual(['0', '2']);
  });
  it('joins different units', () => {
    expect(mergeLines(items('1 tsp garlic, finely chopped', '3 cloves garlic, minced'))[0].text).toBe('1 tsp + 3 cloves garlic');
  });
  it('adds counts and fractions', () => {
    expect(mergeLines(items('1 red onion, sliced', '½ red onion'))[0].text).toBe('1 ½ red onion');
    expect(mergeLines(items('1 cup spinach', '3 cups spinach'))[0].text).toBe('4 cups spinach');
  });
  it('keeps one-off lines exactly as written', () => {
    expect(mergeLines(items('1 block firm tofu, pressed'))[0].text).toBe('1 block firm tofu, pressed');
  });
  it('is ticked only when every copy is', () => {
    const out = mergeLines([
      { id: 'a', text: '1 tbsp olive oil', checked: true },
      { id: 'b', text: '2 tbsp olive oil', checked: false },
    ]);
    expect(out[0].checked).toBe(false);
  });
});
