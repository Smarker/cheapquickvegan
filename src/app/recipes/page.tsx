// app/recipes/page.tsx
import RecipePageClient from "@/components/recipe-page-client";
import { getPostsFromCache, Post } from "@/lib/notion";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

export const metadata: Metadata = {
  title: "All Recipes",
  description: "Browse all our vegan recipes. Cheap, quick, and delicious plant-based meals for every occasion.",
  alternates: { canonical: `${siteUrl}/recipes` },
  openGraph: {
    title: "All Recipes | Cheap Quick Vegan",
    description: "Browse all our vegan recipes. Cheap, quick, and delicious plant-based meals for every occasion.",
    type: "website",
    url: `${siteUrl}/recipes`,
    images: [
      {
        url: `${siteUrl}/opengraph-image.png`,
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
    images: [`${siteUrl}/opengraph-image.png`],
  },
};

export default function RecipesPage() {
  const recipes: Post[] = getPostsFromCache();
  return <RecipePageClient recipes={recipes} />;
}
