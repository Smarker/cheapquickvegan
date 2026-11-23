import { describe, expect, it } from 'vitest';
import { MEASURE, amountFor, ingredientAmounts } from '../src/lib/cook';

const lines = ['1 C jasmine rice (cooked)', '1 block firm tofu, pressed', '1 (4 oz) can Thai Red Curry Paste (Maesri)', '2 tbsp rice wine vinegar', '2 tbsp olive oil, for frying', '3 cloves garlic, minced', '1 red onion'];
const amounts = ingredientAmounts(lines);

describe('amountFor', () => {
  it('matches only the whole ingredient name', () => {
    expect(amountFor('rice', amounts)?.amount).toBe('1 C');
    expect(amountFor('rice wine vinegar', amounts)?.amount).toBe('2 tbsp');
    expect(amountFor('Thai red curry paste', amounts)?.amount).toBe('1 can');
    expect(amountFor('tofu', amounts)?.amount).toBe('1 block');
    expect(amountFor('olive oil', amounts)?.amount).toBe('2 tbsp');
    expect(amountFor('onions', amounts)?.amount).toBe('1');
  });
  it('gives no amount rather than a wrong one', () => {
    expect(amountFor('curry', amounts)).toBe(null);
    expect(amountFor('wine', amounts)).toBe(null);
  });
});

describe('MEASURE', () => {
  const find = (s: string) => s.match(MEASURE);
  it('finds temperatures, times and quantities', () => {
    expect(find('air fry at 400°F for 15–20 minutes')).toEqual(['400°F', '15–20 minutes']);
    expect(find('Bake at 180 °C for 1 hour')).toEqual(['180 °C', '1 hour']);
    expect(find('Preheat to 350 degrees F')).toEqual(['350 degrees F']);
    expect(find('Heat 1–2 tablespoons of oil, add ½ cup water')).toEqual(['1–2 tablespoons', '½ cup']);
    expect(find('Cut into 1 inch cubes')).toEqual(['1 inch']);
  });
  it('leaves other numbers alone', () => {
    expect(find('Serves 4. Step 2 of 3.')).toBe(null);
  });
});
