import { describe, expect, it } from 'vitest';
import { toShopping } from '../src/lib/shopping';

describe('toShopping', () => {
  it.each([
    ['1 red onion, sliced', '1 red onion', null],
    ['150 g Medjool dates, pitted', '150 g Medjool dates', null],
    ['1 C jasmine rice (cooked)', 'jasmine rice', 'for 1 cup cooked'],
    ['2 cups cooked quinoa', 'quinoa', 'for 2 cups cooked'],
    ['2 tbsp lime juice (optional)', '1 lime', 'optional'],
    ['Juice of 2 lemons', '2 lemons', null],
    ['1/4 cup lemon juice', '2 lemons', null],
    ['1 cup chopped cilantro', '1 cup cilantro', null],
    ['1/2 C oat milk', '1/2 cup oat milk', null],
    ['Salt and pepper, to taste', 'Salt and pepper', null],
    ['1 (4 oz) can Thai Red Curry Paste (Maesri)', '1 (4 oz) can Thai Red Curry Paste (Maesri)', null],
    ['1 block firm tofu, pressed', '1 block firm tofu', null],
  ])('%s → %s', (line, text, note) => {
    const out = toShopping(line);
    expect(out.text).toBe(text);
    expect(out.note).toBe(note);
  });
});
