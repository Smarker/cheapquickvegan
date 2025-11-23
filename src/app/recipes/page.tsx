// app/recipes/page.tsx
import RecipePageClient from "@/components/recipe-page-client";
import { getPostsFromCache, Post } from "@/lib/notion";

export default function RecipesPage() {
  const recipes: Post[] = getPostsFromCache();
  return <RecipePageClient recipes={recipes} />;
}
