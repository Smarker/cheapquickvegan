// app/recipes/page.tsx
import RecipePageClient from "@/components/recipes/recipe-page-client";
import { getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { generateListPageMetadata } from "@/lib/seo/list-page-metadata";

export const metadata: Metadata = generateListPageMetadata(
  "All Recipes",
  "Browse all our vegan recipes. Cheap, quick, and delicious plant-based meals for every occasion.",
  "/recipes",
  "Cheap Quick Vegan Recipes"
);

export default function RecipesPage() {
  const recipes: Recipe[] = getRecipesFromCache();
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "" },
        { name: "Recipes", path: "/recipes" },
      ]} />
      <RecipePageClient recipes={recipes} />
    </>
  );
}
