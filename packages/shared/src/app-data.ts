import { parseRecipeSections } from "./recipe-sections";
import type { RecipeGroup } from "./types";

/** A recipe as the mobile app uses it: plain fields, parsed sections, absolute image URL. */
export interface AppRecipe {
  slug: string;
  title: string;
  shortTitle: string | null;
  description: string;
  category: string | null;
  totalMinutes: number | null;
  totalText: string | null;
  yieldText: string | null;
  equipment: string[];
  image: string;
  date: string | null;
  ingredients: RecipeGroup[];
  steps: RecipeGroup[];
  tips: string[];
  cuisine: string | null;
  difficulty: string | null;
}

export interface AppGuide {
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string | null;
  country: string | null;
  city: string | null;
  readingTime: string | null;
  content: string;
}

/** The fields of a website recipe the app needs. Matches packages/web's Recipe type. */
export interface SourceRecipe {
  slug: string;
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  categories?: string[];
  date?: string;
  recipeCuisine?: string;
  status?: string;
  shortTitle?: string;
  difficulty?: string;
}

export interface SourceGuide {
  slug: string;
  title: string;
  description?: string;
  coverImage: string;
  content?: string;
  categories?: string[];
  country?: string;
  city?: string;
  readingTime?: string;
}

/** "1 hr 30 min" -> 90, "1 day" -> 1440. Null when there is no usable time. */
export function toMinutes(text: string | null | undefined): number | null {
  if (!text) return null;
  let total = 0;
  const day = text.match(/(\d+)\s*day/);
  const hr = text.match(/(\d+)\s*h(?:ou)?r/);
  const min = text.match(/(\d+)\s*min/);
  if (day) total += Number(day[1]) * 1440;
  if (hr) total += Number(hr[1]) * 60;
  if (min) total += Number(min[1]);
  return total || null;
}

const usable = (v: string | undefined) => (v && v !== "None" && !v.includes("?") ? v.trim() : null);

/** A "- **Name:** value" line from the Recipe Details list, as written (not the ISO duration used for JSON-LD). */
function detail(content: string, name: string): string | null {
  const m = content.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*([^\\n]*)`));
  return usable(m?.[1]);
}

/** Published recipes with a real slug; drafts, in-progress pages and "untitled" placeholders stay out of the app. */
/**
 * The recipe's whole opening paragraph. The site's description is the same paragraph
 * cut to 160 characters for search results; the app has room to show all of it.
 * Content that opens with a heading, list, table or quote has no intro paragraph.
 */
function intro(content: string): string {
  const first = content.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";
  return /^[#\-*|>]/.test(first) ? "" : first;
}

export const isAppRecipe = (r: SourceRecipe) => (r.status ?? "Published") === "Published" && !!r.slug && r.slug !== "untitled";

export function toAppRecipe(r: SourceRecipe, siteUrl: string): AppRecipe {
  const sections = parseRecipeSections(r.content);
  const totalText = detail(r.content, "Total Time");
  return {
    slug: r.slug,
    title: r.title,
    shortTitle: r.shortTitle?.trim() || null,
    description: intro(r.content) || r.description || "",
    category: r.categories?.[0] ?? null,
    totalMinutes: toMinutes(totalText),
    totalText,
    yieldText: detail(r.content, "Yield"),
    equipment: r.tags ?? [],
    image: `${siteUrl}/images/${r.slug}-1x1.jpg`,
    date: r.date ?? null,
    ingredients: sections.ingredients,
    steps: sections.steps,
    tips: sections.tips,
    cuisine: r.recipeCuisine || null,
    difficulty: r.difficulty || null,
  };
}

export function toAppGuide(g: SourceGuide, siteUrl: string): AppGuide {
  return {
    slug: g.slug,
    title: g.title,
    description: g.description ?? "",
    image: `${siteUrl}${g.coverImage}`,
    category: g.categories?.[0] ?? null,
    country: g.country ?? null,
    city: g.city ?? null,
    readingTime: g.readingTime ?? null,
    content: g.content ?? "",
  };
}
