import type { RecipeGroup, RecipeSections } from "./types";

/** Plain text: drop image embeds, markdown links (keeping their label), bold markers and the bullet. */
export function cleanLine(line: string): string {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/^-+\s*/, "")
    .trim();
}

/** The text under one "## Heading" (bold or plural allowed), up to the next "## ". */
function sectionBody(markdown: string, name: string): string {
  const re = new RegExp(`^##\\s+(?:\\*\\*)?${name}s?(?:\\*\\*)?\\s*$`, "mi");
  const m = markdown.match(re);
  if (!m || m.index === undefined) return "";
  const rest = markdown.slice(m.index + m[0].length);
  const next = rest.search(/^##\s/m);
  return next === -1 ? rest : rest.slice(0, next);
}

/** Bullets grouped under optional "### " subheadings. Prose between bullets is ignored. */
function groups(body: string): RecipeGroup[] {
  const out: RecipeGroup[] = [];
  let cur: RecipeGroup = { name: null, items: [] };
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("### ")) {
      if (cur.items.length) out.push(cur);
      cur = { name: cleanLine(line.slice(4)).replace(/:$/, ""), items: [] };
    } else if (/^-\s/.test(line)) {
      const item = cleanLine(line);
      if (item) cur.items.push(item);
    }
  }
  if (cur.items.length) out.push(cur);
  return out;
}

/**
 * Ingredients, steps and tips with their subheadings kept, so steps stay
 * grouped under the recipe's own section names ("Prepare the rice and tofu").
 * parseRecipeContent flattens steps for JSON-LD; this keeps the structure for UI.
 */
export function parseRecipeSections(markdown: string): RecipeSections {
  return {
    ingredients: groups(sectionBody(markdown, "Ingredient")),
    steps: groups(sectionBody(markdown, "Instruction")),
    tips: groups(sectionBody(markdown, "Tip")).flatMap((g) => g.items),
  };
}
