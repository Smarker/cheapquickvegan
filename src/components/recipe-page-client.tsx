"use client";

import RecipeListPage from "./recipe-list-page";
import { Recipe } from "@/lib/types";

interface RecipePageClientProps {
  recipes: Recipe[];
}

export default function RecipePageClient({ recipes }: RecipePageClientProps) {
  return <RecipeListPage recipes={recipes} title="All Recipes" cardVariant="detailed" />;
}
