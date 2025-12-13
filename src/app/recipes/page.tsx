// app/recipes/page.tsx
import RecipePageClient from "@/components/recipe-page-client";
import { getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/lib/types";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

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

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Recipes",
      item: `${SITE_URL}/recipes`,
    },
  ],
};

export default function RecipesPage() {
  const recipes: Recipe[] = getRecipesFromCache();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RecipePageClient recipes={recipes} />
    </>
  );
}
