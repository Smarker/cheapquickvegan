import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Recipe } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query) return recipes;
  const q = query.toLowerCase();
  return recipes.filter((recipe) => recipe.title.toLowerCase().includes(q));
}
