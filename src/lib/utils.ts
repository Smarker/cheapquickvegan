import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query) return recipes;
  const q = query.toLowerCase();
  return recipes.filter((recipe) => recipe.title.toLowerCase().includes(q));
}

export function filterGuides(guides: Guide[], query: string): Guide[] {
  if (!query) return guides;
  const q = query.toLowerCase();
  return guides.filter((guide) => guide.title.toLowerCase().includes(q));
}
