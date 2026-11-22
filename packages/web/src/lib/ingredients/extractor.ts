// Words that end in 's' but are not plurals — never singularized
const UNCOUNTABLE = new Set([
  'hummus', 'molasses', 'oats', 'lentils', 'grits', 'tahinis', 'grains',
  'herbs', 'flakes', 'crumbs', 'dregs', 'grounds',
]);

// Singularize only the last word of a canonical ingredient name.
// Keeps names like "garlic clove" (not "garlic cloves"),
// "bell pepper" (not "bell peppers"), "blueberry" (not "blueberries").
function singularizeLastWord(name: string): string {
  const words = name.split(' ');
  const last = words[words.length - 1];
  words[words.length - 1] = singularize(last);
  return words.join(' ');
}

function singularize(word: string): string {
  if (UNCOUNTABLE.has(word)) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y'; // berries→berry
  if (word.endsWith('oes') && word.length > 5) return word.slice(0, -2);        // tomatoes→tomato, potatoes→potato
  if (word.endsWith('aves') && word.length > 5) return word.slice(0, -4) + 'af'; // leaves→leaf, loaves→loaf
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) return word.slice(0, -2);
  if (word.endsWith('ches') || word.endsWith('shes')) return word.slice(0, -2);
  if (
    word.endsWith('s') &&
    !word.endsWith('ss') &&
    !word.endsWith('us') &&
    !word.endsWith('is') &&
    word.length > 3
  ) return word.slice(0, -1);                                                    // peppers→pepper
  return word;
}

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
  'pack', 'packs',
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
  'pint', 'pints',
  'strip', 'strips',
  'drop', 'drops',
  'dash', 'dashes',
  'pinch', 'pinches',
  'handful', 'handfuls',
  'ear', 'ears',
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
  'firm', 'soft', 'silken', 'drained', 'rinsed', 'pressed',
  'torn', 'crumbled', 'shaved', 'zested', 'juiced', 'seeded', 'deseeded',
  'loosely',
]);

// Pre-compiled regexes for trailing phrases — built once at module load, not per call
const TRAILING_PHRASE_RES = [
  'or to taste', 'to taste', 'as needed', 'or more', 'or as needed',
  'for serving', 'for garnish', 'for topping', 'for coating',
  'if desired', 'optional', 'approximately', 'about', 'plus more',
  'plus more to taste', 'or your favorite', 'or preferred',
].map((p) => new RegExp(`[,]?\\s*${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'));

// Pre-compiled regex for leading multi-word phrases
const LEADING_PHRASE_RES = [
  /^room temperature\s+/i,
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
  for (const re of TRAILING_PHRASE_RES) {
    text = text.replace(re, '').trim();
  }
  // Strip "for [gerund] ..." patterns not covered by the list above
  // e.g. "for greasing the pan", "for frying", "for coating the tray"
  text = text.replace(/[,]?\s+for\s+\w+ing\b.*/i, '').trim();
  // Strip "to [verb] ..." trailing context phrases
  // e.g. "olive oil to sauté veggies", "dill to top the soup"
  text = text.replace(/[,]?\s+to\s+\w+\b.*/i, '').trim();

  // Strip informal leading quantity phrases with no number: "dash of", "pinch of", "handful of"
  text = text.replace(/^(?:a\s+)?(?:dash|pinch|handful|sprinkle|knob|splash)\s+of\s+/i, '').trim();

  // 5. Extract leading quantity: a number (including fractions and ranges)
  //    followed by an optional unit
  //    e.g. "2 cups", "1/2 tsp", "3-4", "½"
  let quantity: string | null = null;

  // Ordered longest-first to match the most specific format first:
  //   "1 and ½", "1 2/3", "1 ½", "1½", "1/2", "3-4", "1–2" (en-dash range), "½–¾" (unicode fraction range), "½"
  const UNICODE_FRAC = '[½¼¾⅓⅔⅛⅜⅝⅞]';
  const NUMBER = `(?:[\\d]+\\s+and\\s+${UNICODE_FRAC}|[\\d]+\\s+[\\d]+\\/[\\d]+|[\\d]+\\s+${UNICODE_FRAC}|[\\d]+${UNICODE_FRAC}|[\\d]+\\/[\\d]+|[\\d]+(?:[-–][\\d]+)?|${UNICODE_FRAC}[-–]${UNICODE_FRAC}|${UNICODE_FRAC})`;
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

    // Strip leading "of" left by "X cups of Y" patterns
    text = text.replace(/^of\s+/i, '').trim();
  }

  // 6. Strip multi-word leading phrases, then single-word modifiers
  for (const re of LEADING_PHRASE_RES) {
    text = text.replace(re, '').trim();
  }

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

  // Strip trailing ", [prep]" left by inline prep notes e.g. "garlic clove, minced"
  text = text.replace(/,\s*(?:cut|sliced|chopped|minced|diced|grated|crushed|halved|quartered|cubed|pitted|torn|crumbled|thinly|finely|roughly|coarsely)\b.*/i, '').trim();

  // 7. Normalise: lowercase, collapse whitespace, singularize last word
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  const canonicalName = singularizeLastWord(normalized);

  return {
    canonicalName: canonicalName || rawLine.replace(/^[-*]\s*/, '').trim().toLowerCase(),
    quantity: quantity || null,
    notes: collectedNotes.length > 0 ? collectedNotes.join(', ') : null,
    rawText,
  };
}
