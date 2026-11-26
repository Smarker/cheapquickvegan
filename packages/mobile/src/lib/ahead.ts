import { timersIn } from './timers';

// What a cook needs to know before starting: things to get ready first (soften the butter,
// press the tofu) and long hands-off waits (3 hr in the freezer), so nobody finds a 3-hour
// freeze halfway through dinner. Read from the recipe's own lines, never invented.

export type Wait = { minutes: number; text: string };
export type Ahead = { tasks: string[]; waits: Wait[] };

/** Waits shorter than this are part of cooking, not something to plan around. */
const LONG_WAIT_MINUTES = 30;

const AMOUNT = /^[\d\s¼½¾⅓⅔⅛.,/\-–]+/;
const UNIT = /^(cups?|c|tbsp|tsp|tablespoons?|teaspoons?|g|grams?|oz|ounces?|lbs?|pounds?|sticks?)\b\.?\s*/i;

/** "1 cup room temperature vegan butter" → "vegan butter". */
function nameOf(line: string): string {
  return line
    .replace(/\(.*?\)/g, '')
    .replace(AMOUNT, '')
    .replace(UNIT, '')
    .replace(/\b(room[- ]temperature|softened)\b\s*/gi, '')
    .replace(/^of\s+/i, '')
    .trim();
}

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/);

export function aheadOf(ingredients: string[], steps: string[]): Ahead {
  const tasks: string[] = [];
  const add = (t: string) => !tasks.includes(t) && tasks.push(t);
  const lines = [...ingredients, ...steps.flatMap(sentences)];

  for (const line of ingredients) {
    if (/\b(room[- ]temperature|softened)\b/i.test(line)) add(`Leave the ${nameOf(line)} out to soften`);
  }
  for (const line of lines) {
    const thaw = line.match(/\b(?:the\s+)?([a-z][a-z ]*?)\s+(?:is|are)\s+(?:fully\s+|completely\s+)?thawed\b/i);
    if (thaw) add(`Thaw the ${thaw[1].replace(/^(confirm|make sure|check)\s+(that\s+)?(the\s+)?/i, '')}`);
  }
  // "If you don't have an air fryer, press the tofu" is an alternative, not a step everyone does.
  const pressing = lines.filter(
    (l) => !/^\s*if\b/i.test(l) && /\bpress(ed|ing)?\b[^.]*\btofu\b|\btofu\b[^.]*\bpress(ed|ing)?\b/i.test(l),
  );
  if (pressing.length) {
    const time = pressing.map((l) => timersIn(l)[0]).find(Boolean);
    add(time ? `Press the tofu, about ${time.label}` : 'Press the tofu');
  }
  for (const line of ingredients) {
    if (/\bflax eggs?\b/i.test(line)) {
      const time = timersIn(line)[0];
      add(time ? `Make the flax egg first: it sets in ${time.label}` : 'Make the flax egg first so it can set');
    }
  }

  const waits: Wait[] = [];
  for (const step of steps) {
    // "...or refrigerate for 24 hours instead" is another way to do it, not an extra wait.
    if (/\binstead\b/i.test(step)) continue;
    const where = /\bfreez/i.test(step)
      ? 'in the freezer'
      : /\b(fridge|refrigerat|chill)/i.test(step)
        ? 'in the fridge'
        : /\b(proof|rise|doubles?|puffs?)\b|room temperature/i.test(step)
          ? 'to rise'
          : null;
    if (!where) continue;
    const longest = timersIn(step).sort((a, b) => b.minutes - a.minutes)[0];
    if (longest && longest.minutes >= LONG_WAIT_MINUTES) waits.push({ minutes: longest.minutes, text: `${longest.label} ${where}` });
  }

  return { tasks, waits };
}
