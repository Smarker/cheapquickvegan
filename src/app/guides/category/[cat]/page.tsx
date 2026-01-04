import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { notFound } from "next/navigation";
import GuideListPage from "@/components/guides/guide-list-page";

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

const VALID_CATEGORIES = ["travel", "vegan food", "how to"];

function getCategoryDisplayName(cat: string): string {
  return cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const categoryName = getCategoryDisplayName(cat);

  // Validate category
  if (!VALID_CATEGORIES.includes(cat.toLowerCase().replace(/-/g, " "))) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${categoryName} Guides`,
    description: `Browse all ${categoryName.toLowerCase()} guides. Comprehensive articles and resources for your vegan lifestyle.`,
    alternates: { canonical: `${SITE_URL}/guides/category/${cat}` },
    openGraph: {
      title: `${categoryName} Guides | Cheap Quick Vegan`,
      description: `Browse all ${categoryName.toLowerCase()} guides. Comprehensive articles and resources for your vegan lifestyle.`,
      type: "website",
      url: `${SITE_URL}/guides/category/${cat}`,
      images: [
        {
          url: `${SITE_URL}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `${categoryName} Guides`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Guides | Cheap Quick Vegan`,
      description: `Browse all ${categoryName.toLowerCase()} guides. Comprehensive articles and resources for your vegan lifestyle.`,
      images: [`${SITE_URL}/opengraph-image.png`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  const categoryName = getCategoryDisplayName(cat);

  // Validate category
  if (!VALID_CATEGORIES.includes(cat.toLowerCase().replace(/-/g, " "))) {
    notFound();
  }

  const allGuides = getGuidesFromCache();
  const categoryGuides = allGuides.filter((guide: Guide) => {
    const guideCategory = guide.categories[0]?.toLowerCase().replace(/\s+/g, "-");
    return guideCategory === cat.toLowerCase();
  });

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
        name: "Guides",
        item: `${SITE_URL}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/guides/category/${cat}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GuideListPage
        guides={categoryGuides}
        title={`${categoryName} Guides`}
        cardVariant="detailed"
      />
    </>
  );
}
