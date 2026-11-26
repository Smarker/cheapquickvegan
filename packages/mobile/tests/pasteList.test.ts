import { describe, expect, it } from 'vitest';
import { parsePastedList } from '../src/lib/pasteList';

describe('parsePastedList', () => {
  it('reads a list this app sent', () => {
    const sent = 'Grocery list for Easy Gazpacho, Halva\n\nProduce\n☐ 2 red onions\n☐ 1 cucumber (for the gazpacho)\n\nPantry\n☐ 1 1/2 cups tahini';
    expect(parsePastedList(sent)).toEqual(['2 red onions', '1 cucumber (for the gazpacho)', '1 1/2 cups tahini']);
  });

  it('reads plain lists from notes and texts', () => {
    expect(parsePastedList('- tofu\n* spinach\n• rice\n1. chickpeas\n2) coconut milk\nnutritional yeast')).toEqual(['tofu', 'spinach', 'rice', 'chickpeas', 'coconut milk', 'nutritional yeast']);
  });

  it('skips blanks, ticked-off lines and repeats', () => {
    expect(parsePastedList('\n☐ limes\n☑ salt\n[x] oil\n✓ bread\n☐ Limes\n\n')).toEqual(['limes']);
  });

  it('keeps an item that only looks like a heading inside a longer line', () => {
    expect(parsePastedList('Pantry staples: rice')).toEqual(['Pantry staples: rice']);
  });
});
