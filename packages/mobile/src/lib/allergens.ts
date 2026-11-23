// What a recipe seems to contain, read from its ingredient lines. A helper, never a guarantee:
// it can't see inside a branded sauce or a "may contain" label, so the app always says so.

export const ALLERGENS = [
  { key: 'peanuts', label: 'Peanuts' },
  { key: 'treeNuts', label: 'Tree nuts' },
  { key: 'soy', label: 'Soy' },
  { key: 'gluten', label: 'Gluten' },
  { key: 'sesame', label: 'Sesame' },
  { key: 'coconut', label: 'Coconut' },
] as const;
export type Allergen = (typeof ALLERGENS)[number]['key'];

// Words that look like an allergen but aren't ("nutmeg", "butternut", "almond-free"), and
// gluten-free swaps ("rice noodles", "almond flour"), removed before checking.
const NOT_NUTS = /\b(nutmeg|butternut|coconut|nutritional|donuts?|doughnuts?|peanuts?|peanut butter)\b/g;
const GLUTEN_FREE = /\b(gluten[- ]free [a-z]+|(almond|oat|rice|coconut|chickpea|cassava|buckwheat|corn|tapioca|potato|sorghum) (flour|starch)|corn tortillas?|rice noodles?|rice paper|glass noodles?|tamari)\b/g;

const RULES: Record<Allergen, (text: string) => boolean> = {
  peanuts: (t) => /\bpeanuts?\b/.test(t),
  treeNuts: (t) =>
    /\b(cashews?|almonds?|walnuts?|pecans?|pistachios?|hazelnuts?|macadamias?|brazil nuts?|pine nuts?|mixed nuts|nut butters?|nuts?)\b/.test(t.replace(NOT_NUTS, ' ')),
  soy: (t) => /\b(soy|soya|tofu|tempeh|edamame|miso|tamari|shoyu)\b/.test(t),
  gluten: (t) =>
    /\b(flour|bread|breadcrumbs|panko|pasta|spaghetti|lasagna|macaroni|penne|noodles?|ramen|udon|soba|couscous|seitan|wheat|barley|rye|bulgur|farro|phyllo|filo|dough|tortillas?|pita|naan|crackers?|biscoff|soy sauce|beer|bagels?|buns?|toast|croutons?|semolina|orzo|wraps?|sourdough|discard|starter)\b/.test(
      t.replace(GLUTEN_FREE, ' '),
    ),
  sesame: (t) => /\b(sesame|tahini)\b/.test(t),
  coconut: (t) => /\bcoconut\b/.test(t),
};

/** Allergens an ingredient list seems to contain, in ALLERGENS order. */
export function allergensIn(lines: string[]): Allergen[] {
  const text = lines.join('\n').toLowerCase();
  return ALLERGENS.map((a) => a.key).filter((k) => RULES[k](text));
}

export const allergenLabel = (k: Allergen) => ALLERGENS.find((a) => a.key === k)!.label;
