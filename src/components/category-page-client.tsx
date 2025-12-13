"use client";

import RecipeListPage from "./recipe-list-page";
import { Recipe } from "@/lib/types";

interface CategoryPageClientProps {
  recipes: Recipe[];
  category: string;
}

export default function CategoryPageClient({ recipes, category }: CategoryPageClientProps) {
  return <RecipeListPage recipes={recipes} title={`${category}s`} cardVariant="compact" />;
}
