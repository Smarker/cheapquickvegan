// app/recipes/category/[cat]/page.tsx
import { getPostsFromCache, Post } from "@/lib/notion";
import { Metadata } from "next";
import CategoryPageClient from "@/components/category-page-client";
import { SITE_URL } from "@/config/constants";

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
  const displayCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
  const description = categoryDescriptions[cat.toLowerCase()] ||
    `Browse our collection of vegan ${cat} recipes. Cheap, quick, and delicious.`;

  return {
    title: `${displayCategory} Recipes`,
    description,
    alternates: { canonical: `${SITE_URL}/recipes/category/${cat}` },
    openGraph: {
      title: `${displayCategory} Recipes | Cheap Quick Vegan`,
      description,
      type: "website",
      url: `${SITE_URL}/recipes/category/${cat}`,
      images: [
        {
          url: `${SITE_URL}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `${displayCategory} vegan recipes`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayCategory} Recipes | Cheap Quick Vegan`,
      description,
      images: [`${SITE_URL}/opengraph-image.png`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;

  const allPosts: Post[] = getPostsFromCache().filter(
    (p) => p.categories?.some(
      (c) => c.toLowerCase() === cat.toLowerCase()
    )
  );

  const displayCategory = cat.charAt(0).toUpperCase() + cat.slice(1);

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
      {
        "@type": "ListItem",
        position: 3,
        name: displayCategory,
        item: `${SITE_URL}/recipes/category/${cat.toLowerCase()}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageClient recipes={allPosts} category={displayCategory} />
    </>
  );
}
