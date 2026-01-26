// app/recipes/page.tsx
import RecipePageClient from "@/components/recipes/recipe-page-client";
import { getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "All Recipes",
  description: "Browse all our vegan recipes. Cheap, quick, and delicious plant-based meals for every occasion.",
  alternates: { canonical: `${SITE_URL}/recipes` },
  openGraph: {
    title: "All Recipes | Cheap Quick Vegan",
    description: "Browse all our vegan recipes. Cheap, quick, and delicious plant-based meals for every occasion.",
    type: "website",
    url: `${SITE_URL}/recipes`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Cheap Quick Vegan Recipes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Recipes | Cheap Quick Vegan",
    description: "Browse all our vegan recipes. Cheap, quick, and delicious plant-based meals for every occasion.",
    images: [`${SITE_URL}/opengraph-image.png`],
  },
};

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
