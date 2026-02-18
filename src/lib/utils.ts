import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";
import { SITE_URL } from "@/config/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCategoryName(category: string): string {
  return category
    .split(/[-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeImageUrl(
  imageUrl: string | undefined | null,
  fallback = `${SITE_URL}/opengraph-image.png`
): string {
  if (!imageUrl) return fallback;
  return imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`;
}

export function filterByTitle<T extends { title: string }>(
  items: T[],
  query: string
): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) => item.title.toLowerCase().includes(q));
}

export function filterRecipes(recipes: Recipe[], query: string): Recipe[] {
  return filterByTitle(recipes, query);
}

export function filterGuides(guides: Guide[], query: string): Guide[] {
  return filterByTitle(guides, query);
}
