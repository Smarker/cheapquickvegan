// Read a grocery list someone pasted in: one this app sent ("Grocery list for…", aisle
// headings, ☐ lines), or any plain list from Notes, a text or an email.

const AISLE_HEADINGS = /^(produce|fridge & freezer|pantry|spices & oils|bakery|other)$/i;
// Things already bought: a ticked box or [x].
const DONE = /^\s*(☑|✅|✔|✓|\[x\])/i;
// Bullets, boxes and numbering in front of an item.
const MARKER = /^\s*(☐|□|▢|\[ ?\]|[-*•·–—]|\d+[.)])\s*/;

/** The items in a pasted list, in order, without headings, blanks, repeats or ticked-off lines. */
export function parsePastedList(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || DONE.test(line)) continue;
    if (/^grocery list\b/i.test(line) || AISLE_HEADINGS.test(line)) continue;
    const item = line.replace(MARKER, '').trim();
    if (item && !out.some((x) => x.toLowerCase() === item.toLowerCase())) out.push(item);
  }
  return out;
}
