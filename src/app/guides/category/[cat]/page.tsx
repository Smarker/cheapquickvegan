import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { notFound } from "next/navigation";
import GuideListPage from "@/components/guides/guide-list-page";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export const revalidate = 86400; // 24 hours — allows revalidatePath() and periodic refresh

// Pre-render every guide category derived from the data so pages are static at
// deploy time and new categories from Notion appear automatically after the
// next cache rebuild + deployment.
export function generateStaticParams() {
  const guides = getGuidesFromCache();
  const categories = [
    ...new Set(guides.flatMap((g) => g.categories.map((c) => c.toLowerCase().replace(/\s+/g, "-")))),
  ];
  return categories.map((cat) => ({ cat }));
}

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

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "" },
        { name: "Guides", path: "/guides" },
        { name: categoryName, path: `/guides/category/${cat}` },
      ]} />
      <GuideListPage
        guides={categoryGuides}
        title={`${categoryName} Guides`}
        cardVariant="detailed"
      />
    </>
  );
}
