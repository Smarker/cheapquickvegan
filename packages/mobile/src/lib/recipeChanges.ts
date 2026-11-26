import { shoppingName } from './groceryMerge';
import type { Recipe } from './recipes';

// "Updated since you saved it": what changed in a saved recipe that matters to a cook.
// An ingredient added or removed, an amount changed, a step added, removed or rewritten.
// Typo fixes, punctuation and capitals don't count.

export type RecipeSnapshot = { ingredients: string[]; steps: string[] };

export const snapshotOf = (r: Recipe): RecipeSnapshot => ({
  ingredients: r.ingredients.flatMap((g) => g.items),
  steps: r.steps.flatMap((g) => g.items),
});

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}½¼¾⅓⅔/.\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const numbers = (s: string) => (s.match(/\d+(?:[./]\d+)?|[½¼¾⅓⅔]/g) ?? []).join(' ');

/** How alike two lines are, 0 to 1, by edit distance. */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return 0;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

/** Same line apart from a typo: nearly identical text and exactly the same numbers. */
const sameLine = (a: string, b: string) => numbers(a) === numbers(b) && similarity(norm(a), norm(b)) >= 0.85;

/** The amount at the start of an ingredient line ("2 cups"), for "2 cups instead of 1". */
const amountOf = (line: string) => line.match(/^[\d\s½¼¾⅓⅔/.–-]+(?:\s*(?:cups?|c|tbsp|tsp|g|kg|ml|l|oz|lbs?|cans?|blocks?|cloves?)\b\.?)?/i)?.[0].trim() ?? '';

/**
 * What changed between the recipe as saved and as it is now, in plain sentences. Empty when
 * nothing material did.
 */
export function changesBetween(before: RecipeSnapshot, after: RecipeSnapshot): string[] {
  const out: string[] = [];
  const oldIngs = [...before.ingredients];
  const newIngs: string[] = [];
  for (const line of after.ingredients) {
    const i = oldIngs.findIndex((o) => sameLine(o, line));
    if (i >= 0) oldIngs.splice(i, 1);
    else newIngs.push(line);
  }
  // A line on both sides naming the same ingredient is an amount change, not an add and a remove.
  for (const line of [...newIngs]) {
    const name = shoppingName(line).toLowerCase();
    const i = oldIngs.findIndex((o) => shoppingName(o).toLowerCase() === name);
    if (i < 0) continue;
    const was = amountOf(oldIngs[i]);
    const now = amountOf(line);
    out.push(was && now ? `Now uses ${now} ${name} instead of ${was}.` : `Changed: ${line}`);
    oldIngs.splice(i, 1);
    newIngs.splice(newIngs.indexOf(line), 1);
  }
  newIngs.forEach((l) => out.push(`New ingredient: ${l}`));
  oldIngs.forEach((l) => out.push(`No longer uses: ${l}`));

  const oldSteps = [...before.steps];
  let rewritten = 0;
  let added = 0;
  for (const step of after.steps) {
    const i = oldSteps.findIndex((o) => sameLine(o, step));
    if (i >= 0) oldSteps.splice(i, 1);
    else added++;
  }
  // A step that vanished and a step that appeared in its place is one rewrite.
  rewritten = Math.min(added, oldSteps.length);
  added -= rewritten;
  const removed = oldSteps.length - rewritten;
  if (rewritten) out.push(rewritten === 1 ? 'One step was rewritten.' : `${rewritten} steps were rewritten.`);
  if (added) out.push(added === 1 ? 'A step was added.' : `${added} steps were added.`);
  if (removed) out.push(removed === 1 ? 'A step was taken out.' : `${removed} steps were taken out.`);
  return out;
}
