// Cups & spoons ↔ grams for ingredient lines. Weighing is faster (one bowl on a scale), but a
// teaspoon of cumin is easier to scoop than to weigh, so small amounts stay in spoons.
// Only ingredients with a known weight per cup convert; anything else keeps its original unit.

export type Units = 'volume' | 'grams';

/** Grams per US cup. First match wins, so specific names come before broad ones. */
const GRAMS_PER_CUP: [RegExp, number][] = [
  [/almond flour|almond meal/, 96],
  [/oat flour/, 90],
  [/bread flour/, 127],
  [/whole wheat flour/, 120],
  [/flour/, 125],
  [/cornstarch|corn starch|arrowroot|tapioca/, 128],
  [/powdered sugar|confectioners|icing sugar/, 120],
  [/brown sugar/, 213],
  [/coconut sugar/, 160],
  [/sugar/, 200],
  [/maple syrup|maple/, 315],
  [/agave|syrup/, 330],
  [/peanut butter|almond butter|cashew butter|nut butter/, 256],
  [/tahini/, 240],
  [/vegan butter|butter/, 227],
  [/coconut milk|coconut cream/, 240],
  [/\boil\b/, 216],
  [/soy sauce|tamari|aminos/, 255],
  [/yogh?urt|tzatziki/, 245],
  [/milk|creamer/, 240],
  [/broth|stock/, 240],
  [/vinegar|lemon juice|lime juice|juice|mirin|\bsake\b|\bwine\b|water/, 240],
  [/sourdough (starter|discard)|\bdiscard\b|\bstarter\b/, 240],
  [/tomato sauce|marinara|passata|salsa/, 245],
  [/cocoa|cacao powder/, 85],
  [/chocolate chips|chocolate/, 170],
  [/rolled oats|\boats\b/, 90],
  [/\bcooked\b.*\brice\b|\brice\b.*\bcooked\b/, 160],
  [/\brice\b/, 185],
  [/quinoa/, 170],
  [/lentils/, 190],
  [/chickpeas|garbanzo/, 165],
  [/\bbeans\b/, 170],
  [/cashews/, 140],
  [/almonds/, 143],
  [/walnuts|pecans/, 115],
  [/peanuts/, 145],
  [/raisins|dates|cranberries/, 150],
  [/shredded coconut|coconut flakes|desiccated/, 85],
  [/panko|breadcrumbs|bread crumbs/, 60],
  [/nutritional yeast/, 60],
  [/blueberries|berries/, 150],
  [/\bcorn\b/, 165],
  [/spinach|kale|greens/, 30],
  [/shredded .*cheese|mozzarella|cheddar/, 113],
  [/marshmallows/, 50],
];

const ML: Record<string, number> = { cup: 240, tbsp: 15, tsp: 5, ml: 1, l: 1000 };
const G: Record<string, number> = { g: 1, kg: 1000, oz: 28.35, lb: 453.6 };

const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };
const NUM = String.raw`(?:\d+\s+[½¼¾⅓⅔⅛]|\d+\s+\d\/\d+|\d+\/\d+|\d+(?:\.\d+)?\s*[½¼¾⅓⅔⅛]?|[½¼¾⅓⅔⅛])`;
const UNIT = String.raw`(cups?|c|tablespoons?|tbsp|tbs|teaspoons?|tsp|grams?|g|kg|kilograms?|ml|milliliters?|millilitres?|l|liters?|litres?|oz|ounces?|lbs?|pounds?)`;
const QUANTITY = new RegExp(String.raw`^(\s*)(${NUM})(?:\s*(?:-|–|to)\s*(${NUM}))?\s*${UNIT}\.?(?=\s|$)(\s+of)?`, 'i');

function toNumber(s: string): number {
  const t = s.trim();
  const mixed = t.match(/^(\d+)\s+(\d)\/(\d+)$/);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return +frac[1] / +frac[2];
  const glyph = t.match(/^(\d+(?:\.\d+)?)?\s*([½¼¾⅓⅔⅛])$/);
  if (glyph) return (glyph[1] ? +glyph[1] : 0) + FRACTIONS[glyph[2]];
  return parseFloat(t);
}

function unitKey(u: string): string {
  const x = u.toLowerCase();
  if (/^(cups?|c)$/.test(x)) return 'cup';
  if (/^(tablespoons?|tbsp|tbs)$/.test(x)) return 'tbsp';
  if (/^(teaspoons?|tsp)$/.test(x)) return 'tsp';
  if (/^(grams?|g)$/.test(x)) return 'g';
  if (/^(kg|kilograms?)$/.test(x)) return 'kg';
  if (/^(ml|millil)/.test(x)) return 'ml';
  if (/^(l|lit(er|re)s?)$/.test(x)) return 'l';
  if (/^(oz|ounces?)$/.test(x)) return 'oz';
  return 'lb';
}

export const gramsPerCup = (name: string): number | null => GRAMS_PER_CUP.find(([re]) => re.test(name.toLowerCase()))?.[1] ?? null;

const roundGrams = (g: number) => (g < 20 ? Math.round(g) : g < 100 ? Math.round(g / 5) * 5 : Math.round(g / 10) * 10);

const NICE: [number, string][] = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
function niceNumber(x: number): string {
  let whole = Math.floor(x);
  const [frac, glyph] = NICE.reduce((best, cand) => (Math.abs(cand[0] - (x - whole)) < Math.abs(best[0] - (x - whole)) ? cand : best));
  if (frac === 1) whole += 1;
  if (!whole) return glyph || '0';
  return glyph ? `${whole} ${glyph}` : String(whole);
}

/** Millilitres → the friendliest spoon or cup amount; a range uses the unit that suits its top end. */
function volumeText(low: number, high: number | null = null): string {
  const top = high ?? low;
  const [size, unit] = top / 240 >= 0.25 ? [240, top / 240 > 1.1 ? 'cups' : 'cup'] : top / 15 >= 1 ? [15, 'tbsp'] : [5, 'tsp'];
  const n = (ml: number) => niceNumber(ml / size);
  return high != null ? `${n(low)}–${n(high)} ${unit}` : `${n(low)} ${unit}`;
}

// Notes in brackets ("No ice needed… watering it down") shouldn't decide what the ingredient is.
const nameOf = (rest: string) => rest.replace(/\([^)]*\)/g, (note) => (/\bcooked\b/i.test(note) ? ' cooked ' : ' '));

// "3 cups flour (360g)", "4 tbsp (56g) butter", "1 ¾ lb (or 800g) tomatoes": the recipe's own weight wins.
const STATED_GRAMS = /\s*\((?:or\s+|about\s+|~)?(\d+(?:\.\d+)?)\s*g\)/i;

/**
 * The line in the chosen units, or unchanged when it's already there, is a count (1 onion), is a small
 * spoon amount in grams mode, or is an ingredient whose weight per cup isn't known.
 */
export function convertLine(line: string, to: Units): string {
  const m = line.match(QUANTITY);
  if (!m) return line;
  const [whole, lead, lowText, highText, rawUnit, of] = m;
  const unit = unitKey(rawUnit);
  const rest = line.slice(whole.length);
  const perCup = gramsPerCup(nameOf(rest));
  const low = toNumber(lowText);
  const high = highText ? toNumber(highText) : null;
  if (!Number.isFinite(low)) return line;

  if (to === 'grams') {
    const stated = rest.match(STATED_GRAMS);
    if (stated && high == null && unit !== 'g') return `${lead}${stated[1]} g${of ?? ''}${rest.replace(STATED_GRAMS, '')}`;
    let grams: (n: number) => number;
    if (unit in G) {
      if (unit === 'g') return line;
      grams = (n) => n * G[unit];
    } else {
      const ml = ML[unit];
      // A spoonful is quicker to scoop than to weigh: 2 tbsp or less stays in spoons.
      if ((high ?? low) * ml <= 30 || perCup == null) return line;
      grams = (n) => ((n * ml) / 240) * perCup;
    }
    const amount = high != null ? `${roundGrams(grams(low))}–${roundGrams(grams(high))} g` : `${roundGrams(grams(low))} g`;
    return `${lead}${amount}${of ?? ''}${rest}`;
  }

  // Back to cups and spoons, for recipes written by weight.
  if (unit === 'cup' || unit === 'tbsp' || unit === 'tsp' || unit === 'oz' || unit === 'lb') return line;
  let ml: (n: number) => number;
  if (unit === 'ml' || unit === 'l') ml = (n) => n * ML[unit];
  else if (perCup != null) ml = (n) => ((n * G[unit]) / perCup) * 240;
  else return line;
  const amount = volumeText(ml(low), high != null ? ml(high) : null);
  return `${lead}${amount}${of ?? ''}${rest}`;
}

/** Does this recipe have anything that would change? Hides the switch when it would do nothing. */
export const canConvert = (lines: string[]) => lines.some((l) => convertLine(l, 'grams') !== l || convertLine(l, 'volume') !== l);

/** Which units a recipe is mostly written in, so the switch can show "as written" before anyone picks. */
export function writtenIn(lines: string[]): Units {
  let grams = 0;
  let volume = 0;
  for (const l of lines) {
    const m = l.match(QUANTITY);
    if (!m) continue;
    const u = unitKey(m[4]);
    if (u === 'g' || u === 'kg') grams++;
    else if (u === 'cup' || u === 'tbsp' || u === 'tsp' || u === 'ml' || u === 'l') volume++;
  }
  return grams > volume ? 'grams' : 'volume';
}

/** Lines in the cook's chosen units; with no choice yet, exactly as the recipe was written. */
export const linesIn = (lines: string[], units: Units | null) => (units ? lines.map((l) => convertLine(l, units)) : lines);

/**
 * An amount written inside a step ("2 cups", followed by "flour, then stir") in the chosen units.
 * The words after it say what's being measured; times and temperatures never change.
 */
export function convertInStep(amount: string, after: string, to: Units | null): string {
  if (!to) return amount;
  const words = after.split(/[,.;:]/)[0];
  const line = `${amount} ${words}`;
  const out = convertLine(line, to);
  return out !== line && out.endsWith(words) ? out.slice(0, out.length - words.length).trim().replace(/\s+of$/, '') : amount;
}
