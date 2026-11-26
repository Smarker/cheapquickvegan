import { allergensIn, type Allergen } from './allergens';

// Swaps for ingredients a cook said to avoid. Common, well-known substitutions, not tested in
// each recipe, so the app always says so. An ingredient with no swap that holds up (tofu in
// agedashi tofu, bread flour in focaccia, phyllo) gets none rather than a bad one.

type Option = { use: string; contains: Allergen[] };
/** `for`: the allergens this ingredient brings, so a line is only swapped for what the cook avoids. */
type Rule = { match: RegExp; name: string; for: Allergen[]; options: Option[] };

const RULES: Rule[] = [
  { match: /\bpeanut butter\b/, name: 'Peanut butter', for: ['peanuts'], options: [{ use: 'sunflower seed butter', contains: [] }] },
  { match: /\balmond flour\b/, name: 'Almond flour', for: ['treeNuts'], options: [{ use: 'finely ground sunflower seeds', contains: [] }] },
  {
    match: /\bcashews?\b/,
    name: 'Cashews', for: ['treeNuts'],
    options: [{ use: 'sunflower seeds (raw for creamy blends, roasted for crunch)', contains: [] }],
  },
  { match: /\bpine nuts?\b/, name: 'Pine nuts', for: ['treeNuts'], options: [{ use: 'sunflower seeds', contains: [] }] },
  {
    match: /\b(walnuts?|pecans?|pistachios?|almonds|hazelnuts?|mixed nuts)\b/,
    name: 'Nuts', for: ['treeNuts'],
    options: [{ use: 'pumpkin or sunflower seeds', contains: [] }],
  },
  {
    match: /\b(soy sauce|shoyu)\b/,
    name: 'Soy sauce', for: ['soy', 'gluten'],
    options: [
      // Tamari is soy without (usually) the wheat; coconut aminos is neither.
      { use: 'tamari labeled gluten-free', contains: ['soy'] },
      { use: 'coconut aminos (a little sweeter, so add a pinch of salt)', contains: ['coconut'] },
    ],
  },
  { match: /\btamari\b/, name: 'Tamari', for: ['soy'], options: [{ use: 'coconut aminos (a little sweeter, so add a pinch of salt)', contains: ['coconut'] }] },
  { match: /\bmiso\b/, name: 'Miso', for: ['soy'], options: [{ use: 'chickpea miso', contains: [] }] },
  { match: /\ball[- ]purpose flour\b/, name: 'All-purpose flour', for: ['gluten'], options: [{ use: 'a 1:1 gluten-free baking flour with xanthan gum', contains: [] }] },
  { match: /\bflour tortillas?\b/, name: 'Flour tortillas', for: ['gluten'], options: [{ use: 'corn tortillas or gluten-free wraps', contains: [] }] },
  { match: /\bramen\b|\bnoodles?\b/, name: 'Noodles', for: ['gluten'], options: [{ use: 'rice noodles or rice ramen', contains: [] }] },
  { match: /\b(pasta|spaghetti|penne|macaroni)\b/, name: 'Pasta', for: ['gluten'], options: [{ use: 'gluten-free pasta', contains: [] }] },
  { match: /\b(panko|breadcrumbs)\b/, name: 'Breadcrumbs', for: ['gluten'], options: [{ use: 'gluten-free panko', contains: [] }] },
  { match: /\bpizza dough\b/, name: 'Pizza dough', for: ['gluten'], options: [{ use: 'gluten-free pizza dough', contains: [] }] },
  { match: /\bbagels?\b/, name: 'Bagel', for: ['gluten'], options: [{ use: 'a gluten-free bagel', contains: [] }] },
  { match: /\b(bread|toast|buns?)\b(?! flour)/, name: 'Bread', for: ['gluten'], options: [{ use: 'gluten-free bread', contains: [] }] },
  { match: /\btahini\b/, name: 'Tahini', for: ['sesame'], options: [{ use: 'sunflower seed butter', contains: [] }] },
  { match: /\bsesame oil\b/, name: 'Sesame oil', for: ['sesame'], options: [{ use: "a neutral oil (you'll lose the toasty flavor)", contains: [] }] },
  { match: /\bsesame seeds\b/, name: 'Sesame seeds', for: ['sesame'], options: [{ use: 'hemp seeds', contains: [] }] },
  {
    match: /\bcoconut milk\b/,
    name: 'Coconut milk', for: ['coconut'],
    options: [
      { use: 'cashew cream', contains: ['treeNuts'] },
      { use: 'an oat-based cooking cream', contains: [] },
    ],
  },
  { match: /\bcoconut oil\b/, name: 'Coconut oil', for: ['coconut'], options: [{ use: 'vegan butter, or a neutral oil for frying and greasing', contains: [] }] },
];

export type Swap = { name: string; use: string };
/** `incomplete`: some avoided ingredient here has no swap (tofu, phyllo), so the swaps alone don't make it safe. */
export type Swaps = { swaps: Swap[]; incomplete: boolean };

/**
 * Swaps for the ingredient lines that contain something this cook avoids. Each swap is
 * free of everything they avoid; an optional ingredient is simply left out.
 */
export function swapsFor(lines: string[], avoid: Allergen[]): Swaps {
  const swaps: Swap[] = [];
  let incomplete = false;
  for (const line of lines) {
    // "pine nuts (or sesame seeds!)": an alternative the cook can just not pick.
    const text = line.toLowerCase().replace(/\(or [^)]*\)/g, '');
    const avoided = allergensIn([text]).filter((a) => avoid.includes(a));
    if (!avoided.length) continue;
    const rule = RULES.find((r) => r.for.some((a) => avoided.includes(a)) && r.match.test(text));
    const option = rule?.options.find((o) => !o.contains.some((a) => avoid.includes(a)));
    const swap: Swap | null = !rule
      ? null
      : /\boptional\b/.test(text)
        ? { name: rule.name, use: "It's optional: leave it out" }
        : option
          ? { name: rule.name, use: option.use }
          : null;
    if (!swap) incomplete = true;
    else if (!swaps.some((s) => s.name === swap.name)) swaps.push(swap);
  }
  return { swaps, incomplete };
}
