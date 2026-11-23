// Which little drawing goes with an ingredient line. First match wins, so specific rules
// ("coconut oil" → oil, "garlic powder" → spice jar) come before broad ones ("coconut", "garlic").

export const ART = [
  'vanilla', 'nutButter', 'oil', 'soySauce', 'vinegar', 'syrup', 'coconut', 'spice', 'milk', 'butter', 'yogurt',
  'noodles', 'rice', 'flour', 'cornstarch', 'sugar', 'yeast', 'broth', 'bellPepper', 'salt', 'pepper', 'scallion',
  'onion', 'garlic', 'ginger', 'greens', 'herbs', 'citrus', 'potato', 'mushroom', 'tomato', 'carrot', 'avocado',
  'tofu', 'beans', 'chocolate', 'nuts', 'dates', 'seeds', 'sauce',
] as const;
export type Art = (typeof ART)[number];

const RULES: [Art, RegExp][] = [
  ['vanilla', /vanilla/],
  ['nutButter', /\b(peanut|almond|cashew|nut|seed|sunflower) butter\b|tahini/],
  ['oil', /\boil\b|cooking spray/],
  ['soySauce', /soy sauce|\btamari\b|coconut aminos|liquid aminos/],
  ['vinegar', /vinegar|\bmirin\b/],
  ['syrup', /maple|syrup|agave|\bhoney\b|molasses/],
  ['coconut', /coconut(?! sugar)/],
  ['spice', /powder|paprika|cumin|turmeric|cinnamon|nutmeg|flakes|seasoning|garam masala|cardamom|allspice|cayenne|oregano|bay lea|\bdried (basil|thyme|rosemary|parsley|dill)|everything bagel|nutritional yeast|gochugaru|five spice/],
  ['milk', /\bmilk\b|\bcream\b|creamer/],
  ['butter', /butter/],
  ['yogurt', /yogh?urt/],
  ['noodles', /noodle|pasta|spaghetti|ramen|udon|soba|lasagna|macaroni|penne/],
  ['rice', /\brice\b/],
  ['flour', /flour|bisquick|baking mix/],
  ['cornstarch', /cornstarch|corn starch|arrowroot|tapioca|baking (powder|soda)/],
  ['sugar', /sugar|sweetener/],
  ['yeast', /\byeast\b|sourdough (starter|discard)|\bdiscard\b/],
  ['broth', /broth|stock|bouillon/],
  ['bellPepper', /bell pepper|jalape|poblano|chili pepper|chile|serrano|habanero/],
  ['salt', /\bsalt\b/],
  ['pepper', /pepper/],
  ['scallion', /scallion|green onion|spring onion|chive/],
  ['onion', /onion|shallot|\bleeks?\b/],
  ['garlic', /garlic/],
  ['ginger', /ginger/],
  ['greens', /spinach|kale|lettuce|chard|arugula|greens|cabbage|bok choy|collard/],
  ['herbs', /cilantro|parsley|basil|\bmint\b|\bdill\b|rosemary|thyme|herb/],
  ['citrus', /lemon|lime|orange|grapefruit/],
  ['potato', /potato|yam/],
  ['mushroom', /mushroom|shiitake|portobello/],
  ['tomato', /tomato|marinara/],
  ['carrot', /carrot/],
  ['avocado', /avocado|guacamole/],
  ['tofu', /tofu|tempeh|seitan/],
  ['beans', /chickpea|garbanzo|\bbeans?\b|lentil|edamame|\bpeas\b/],
  ['chocolate', /chocolate|cocoa|cacao/],
  ['nuts', /cashew|almond|walnut|pecan|peanut|pistachio|hazelnut|\bnuts?\b/],
  ['dates', /\bdates?\b|raisin|\bfigs?\b|cranberr|apricot/],
  ['seeds', /sesame|chia|flax|hemp|pumpkin seed|sunflower seed|\bseeds?\b/],
  ['sauce', /paste|gochujang|\bmiso\b|sriracha|hot sauce|ketchup|mustard|\bsauce\b|salsa|mayo/],
];

/** The drawing for an ingredient line, or null (water, ice and anything unusual get none). */
export function artFor(line: string): Art | null {
  const text = line.toLowerCase().replace(/\([^)]*\)/g, ' ');
  if (/^\W*[\d\s\/½¼¾.–-]*\s*(cups?|c|tbsp|tsp|ml)?\s*(of\s+)?(cold|warm|hot|boiling|ice)?\s*water\b(?!\s*chestnut)/.test(text)) return null;
  return RULES.find(([, re]) => re.test(text))?.[0] ?? null;
}
