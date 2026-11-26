// A recipe line, rewritten as something you pick up at the store.
// "1 C jasmine rice (cooked)" → "jasmine rice", noted "for 1 cup cooked";
// "2 tbsp lime juice (optional)" → "1 lime", noted "optional"; "1 red onion, sliced" → "1 red onion".

export type ShoppingLine = { text: string; note: string | null; optional: boolean };

// Notes in brackets that are about cooking, not buying.
const KITCHEN_NOTE = /\((?:[^)]*\b(?:optional|cooked|divided|to taste|see note|for serving|for garnish|or more|plus more|packed|drained|rinsed|softened|melted|room temperature|at room temp)\b[^)]*)\)/gi;
// Prep words that sit before the ingredient's name ("chopped cilantro").
const PREP = /\b(finely|roughly|thinly|coarsely|freshly)?\s*(chopped|minced|diced|sliced|grated|crushed|pitted|peeled|halved|quartered|cubed|julienned|squeezed)\b/gi;
// Grains and legumes that recipes measure cooked but stores sell dry.
const COOKED_GRAIN = /\b(rice|quinoa|lentils|couscous|farro|barley|pasta|noodles|chickpeas|beans)\b/i;
// Tablespoons of juice per fruit.
const JUICE: [RegExp, string, number][] = [
  [/\blime juice\b|\bjuice (?:of|from) .*\blimes?\b/i, 'lime', 2],
  [/\blemon juice\b|\bjuice (?:of|from) .*\blemons?\b/i, 'lemon', 3],
  [/\borange juice\b|\bjuice (?:of|from) .*\boranges?\b/i, 'orange', 6],
];
const TBSP: Record<string, number> = { tbsp: 1, tablespoon: 1, tablespoons: 1, tsp: 1 / 3, teaspoon: 1 / 3, teaspoons: 1 / 3, cup: 16, cups: 16, c: 16 };

const num = (s: string) => {
  const t = s.trim();
  const g: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };
  const mixed = t.match(/^(\d+)\s+(\d)\/(\d)$/);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return +frac[1] / +frac[2];
  const glyph = t.match(/^(\d+)?\s*([½¼¾⅓⅔])$/);
  if (glyph) return (glyph[1] ? +glyph[1] : 0) + g[glyph[2]];
  return parseFloat(t);
};

const LEAD = /^\s*((?:\d+\s+\d\/\d|\d+\/\d+|\d+(?:\.\d+)?\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔])(?:\s*[-–]\s*(?:\d+(?:\.\d+)?|[½¼¾⅓⅔]))?)\s*(cups?|c|tablespoons?|tbsp|teaspoons?|tsp)?\.?\s+(?:of\s+)?/i;

const tidy = (s: string) =>
  s
    .replace(/\s+,/g, ',')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();

export function toShopping(line: string): ShoppingLine {
  let text = line;
  const optional = /\boptional\b/i.test(text);
  const cooked = /\bcooked\b/i.test(text) && COOKED_GRAIN.test(text);

  // Juice → whole fruit: "2 tbsp lime juice" is one lime, "juice of 1 lemon" is one lemon.
  for (const [re, fruit, perFruit] of JUICE) {
    if (!re.test(text)) continue;
    const of = text.match(new RegExp(String.raw`juice (?:of|from)\s+(\d+|one|two|half|½)\s+${fruit}`, 'i'));
    const m = text.match(LEAD);
    let count = 1;
    if (of) count = /half|½/i.test(of[1]) ? 0.5 : /one/i.test(of[1]) ? 1 : /two/i.test(of[1]) ? 2 : +of[1];
    else if (m) count = Math.max(1, Math.ceil(((num(m[1].split(/[-–]/).pop()!) || 1) * (TBSP[(m[2] ?? 'tbsp').toLowerCase()] ?? 1)) / perFruit));
    const n = count < 1 ? '½' : String(count);
    return { text: `${n} ${count > 1 ? `${fruit}s` : fruit}`, note: optional ? 'optional' : null, optional };
  }

  // Cooked grains: the amount is for the cooked grain, so name the dry one and keep the amount as a note.
  let note: string | null = null;
  if (cooked) {
    const m = text.match(LEAD);
    if (m) {
      const unit = (m[2] ?? '').toLowerCase();
      const unitWord = unit === 'c' ? (num(m[1]) > 1 ? 'cups' : 'cup') : unit;
      note = `for ${m[1].trim()}${unitWord ? ` ${unitWord}` : ''} cooked`;
      text = text.slice(m[0].length);
    }
    text = text.replace(/\bcooked\b/gi, ' ');
  }

  text = text
    .replace(KITCHEN_NOTE, ' ')
    .split(/,(?![^(]*\))/)[0] // nothing after the first comma ("sliced", "to taste"), unless it's inside brackets
    .replace(PREP, ' ')
    .replace(/\bto taste\b/gi, ' ')
    // "1 C flour" reads as "1 cup flour"
    .replace(/^(\s*[\d½¼¾⅓⅔./\s–-]+)\s*C\b\.?/, (_, n: string) => `${n.trim()} ${num(n) > 1 ? 'cups' : 'cup'}`);

  if (optional) note = note ? `${note}, optional` : 'optional';
  return { text: tidy(text) || tidy(line), note, optional };
}
