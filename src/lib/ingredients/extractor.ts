// Units that appear between a quantity number and the ingredient name
const UNITS = [
  'tablespoon', 'tablespoons', 'tbsp',
  'teaspoon', 'teaspoons', 'tsp',
  'cup', 'cups', 'c',
  'ounce', 'ounces', 'oz',
  'pound', 'pounds', 'lb', 'lbs',
  'gram', 'grams', 'g',
  'kilogram', 'kilograms', 'kg',
  'milliliter', 'milliliters', 'ml',
  'liter', 'liters', 'l',
  'clove', 'cloves',
  'slice', 'slices',
  'can', 'cans',
  'bunch', 'bunches',
  'package', 'packages', 'pkg',
  'piece', 'pieces',
  'head', 'heads',
  'stalk', 'stalks',
  'sprig', 'sprigs',
  'sheet', 'sheets',
  'stick', 'sticks',
  'block', 'blocks',
  'bag', 'bags',
  'jar', 'jars',
  'bottle', 'bottles',
  'strip', 'strips',
  'drop', 'drops',
  'dash', 'dashes',
  'pinch', 'pinches',
  'handful', 'handfuls',
  'container', 'containers',
  'box', 'boxes',
];

// Sorted longest-first so "tablespoon" matches before "table"
const UNITS_PATTERN = UNITS.slice()
  .sort((a, b) => b.length - a.length)
  .join('|');

// Adjectives/adverbs that describe how an ingredient is prepared — stripped to notes
const MODIFIERS = new Set([
  'shredded', 'diced', 'chopped', 'minced', 'sliced', 'grated', 'crushed',
  'mashed', 'peeled', 'pitted', 'trimmed', 'halved', 'quartered', 'cubed',
  'roughly', 'finely', 'coarsely', 'thinly', 'thickly', 'freshly', 'lightly',
  'frozen', 'thawed', 'cooked', 'uncooked', 'raw', 'dried', 'fresh',
  'canned', 'packed', 'heaping', 'level', 'ripe', 'softened', 'melted',
  'toasted', 'roasted', 'divided', 'large', 'medium', 'small',
  'extra', 'firm', 'soft', 'silken', 'drained', 'rinsed', 'pressed',
  'torn', 'crumbled', 'shaved', 'zested', 'juiced', 'seeded', 'deseeded',
]);

// Phrases at the end of an ingredient line that don't describe the ingredient itself
const TRAILING_PHRASES = [
  'or to taste', 'to taste', 'as needed', 'or more', 'or as needed',
  'for serving', 'for garnish', 'for topping', 'for coating',
  'if desired', 'optional', 'approximately', 'about', 'plus more',
  'plus more to taste', 'or your favorite', 'or preferred',
];

export interface ExtractedIngredient {
  canonicalName: string; // "vegan mozzarella"
  quantity: string | null; // "2 cups"
  notes: string | null; // "shredded, diced"
  rawText: string; // original line from parser
}

export function extractIngredient(rawLine: string): ExtractedIngredient {
  const rawText = rawLine;

  // 1. Strip bullet marker (- or *)
  let text = rawLine.replace(/^[-*•]\s*/, '').trim();

  // 2. Strip markdown links, keep the visible text
  //    e.g. "[Nasoya brand](url)" → "Nasoya brand"
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 3. Strip parentheticals: "(14 oz)", "(optional)", "(about 2 cups)"
  text = text.replace(/\s*\([^)]*\)/g, '').trim();

  // 4. Strip trailing phrases (case-insensitive, with optional leading comma)
  for (const phrase of TRAILING_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`[,]?\\s*${escaped}\\s*$`, 'i'), '').trim();
  }
  // Strip "for [gerund] ..." patterns not covered by the list above
  // e.g. "for greasing the pan", "for frying", "for coating the tray"
  text = text.replace(/[,]?\s+for\s+\w+ing\b.*/i, '').trim();

  // 5. Extract leading quantity: a number (including fractions and ranges)
  //    followed by an optional unit
  //    e.g. "2 cups", "1/2 tsp", "3-4", "½"
  let quantity: string | null = null;

  // Ordered longest-first so "1 2/3" (mixed) matches before "1" (whole)
  const NUMBER = '(?:[\\d]+\\s+[\\d]+\\/[\\d]+|[\\d]+\\/[\\d]+|[\\d]+(?:-[\\d]+)?|[½¼¾⅓⅔⅛⅜⅝⅞])';
  const qtyRe = new RegExp(`^(${NUMBER})\\s*`, 'i');
  const qtyMatch = text.match(qtyRe);

  if (qtyMatch) {
    const num = qtyMatch[1].trim();
    const rest = text.slice(qtyMatch[0].length);

    // Check if the next word is a unit
    const unitRe = new RegExp(`^(${UNITS_PATTERN})\\s+`, 'i');
    const unitMatch = rest.match(unitRe);

    if (unitMatch) {
      quantity = `${num} ${unitMatch[1]}`;
      text = rest.slice(unitMatch[0].length);
    } else {
      quantity = num;
      text = rest;
    }
  }

  // 6. Strip leading modifier adjectives, collect them as notes
  const collectedNotes: string[] = [];
  let changed = true;

  while (changed) {
    changed = false;
    const word = text.split(/\s+/)[0]?.toLowerCase();
    if (word && MODIFIERS.has(word)) {
      collectedNotes.push(word);
      text = text.slice(word.length).trim();
      changed = true;
    }
  }

  // 7. Normalise: lowercase, collapse whitespace
  const canonicalName = text.trim().toLowerCase().replace(/\s+/g, ' ');

  return {
    canonicalName: canonicalName || rawLine.replace(/^[-*]\s*/, '').trim().toLowerCase(),
    quantity: quantity || null,
    notes: collectedNotes.length > 0 ? collectedNotes.join(', ') : null,
    rawText,
  };
}
