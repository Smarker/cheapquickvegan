import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Post } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterRecipes(recipes: Post[], query: string): Post[] {
  if (!query) return recipes;
  const q = query.toLowerCase();
  return recipes.filter((recipe) => recipe.title.toLowerCase().includes(q));
}
