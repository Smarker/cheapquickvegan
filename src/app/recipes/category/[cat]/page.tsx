// app/recipes/category/[cat]/page.tsx
import { getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { Metadata } from "next";
import CategoryPageClient from "@/components/recipes/category-page-client";
import { SITE_URL } from "@/config/constants";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { generateCategoryMetadata } from "@/lib/seo/nextjs-metadata-builders";
import { buildCategoryBreadcrumbs } from "@/lib/seo/google-search-jsonld-builders";
import { formatCategoryName } from "@/lib/utils";

export const revalidate = 86400; // 24 hours — allows revalidatePath() and periodic refresh

// Pre-render every category that exists in the data so the page is static at
// deploy time and new categories added in Notion appear automatically after the
// next cache rebuild + deployment.
export function generateStaticParams() {
  const recipes = getRecipesFromCache();
  const categories = [...new Set(recipes.flatMap((r) => r.categories.map((c) => c.toLowerCase())))];
  return categories.map((cat) => ({ cat }));
}

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

const categoryDescriptions: Record<string, string> = {
  meal: "Easy vegan meal recipes that are cheap, quick, and delicious. Perfect for busy weeknights.",
  breakfast: "Start your day right with these affordable vegan breakfast recipes. Quick and satisfying.",
  dessert: "Indulge in delicious vegan desserts that won't break the bank. Sweet treats made simple.",
  side: "Complement your meals with these easy vegan side dishes. Budget-friendly and flavorful.",
  snack: "Healthy vegan snacks for any time of day. Quick, cheap, and satisfying bites.",
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const displayCategory = formatCategoryName(cat);
  const description = categoryDescriptions[cat.toLowerCase()] ||
    `Browse our collection of vegan ${cat} recipes. Cheap, quick, and delicious.`;

  return generateCategoryMetadata({
    categoryName: displayCategory,
    contentLabel: "Recipes",
    description,
    canonicalUrl: `${SITE_URL}/recipes/category/${cat}`,
    imageAlt: `${displayCategory} vegan recipes`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;

  const recipes: Recipe[] = getRecipesFromCache().filter(
    (r) => r.categories?.some(
      (c: string) => c.toLowerCase() === cat.toLowerCase()
    )
  );

  const displayCategory = formatCategoryName(cat);

  return (
    <>
      <BreadcrumbJsonLd items={buildCategoryBreadcrumbs("recipes", displayCategory, cat.toLowerCase())} />
      <CategoryPageClient recipes={recipes} category={displayCategory} />
    </>
  );
}
