import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { notFound } from "next/navigation";
import GuideListPage from "@/components/guides/guide-list-page";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { generateCategoryMetadata } from "@/lib/seo/nextjs-metadata-builders";
import { buildCategoryBreadcrumbs } from "@/lib/seo/google-search-jsonld-builders";
import { formatCategoryName } from "@/lib/utils";

export const revalidate = 86400; // 24 hours — allows revalidatePath() and periodic refresh

// Pre-render every guide category derived from the data so pages are static at
// deploy time and new categories from Notion appear automatically after the
// next cache rebuild + deployment.
export function generateStaticParams() {
  const guides = getGuidesFromCache();
  const categories = [
    ...new Set(
      guides
        .filter((g) => g.categories.length > 0)
        .map((g) => g.categories[0].toLowerCase().replace(/\s+/g, "-"))
    ),
  ];
  return categories.map((cat) => ({ cat }));
}

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const categoryName = formatCategoryName(cat);
  const description = `Browse all ${categoryName.toLowerCase()} guides. Comprehensive articles and resources for your vegan lifestyle.`;

  return generateCategoryMetadata({
    categoryName,
    contentLabel: "Guides",
    description,
    canonicalUrl: `${SITE_URL}/guides/category/${cat}`,
    imageAlt: `${categoryName} Guides`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  const categoryName = formatCategoryName(cat);

  const allGuides = getGuidesFromCache();
  const categoryGuides = allGuides.filter((guide: Guide) => {
    const guideCategory = guide.categories[0]?.toLowerCase().replace(/\s+/g, "-");
    return guideCategory === cat.toLowerCase();
  });

  if (categoryGuides.length === 0) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd items={buildCategoryBreadcrumbs("guides", categoryName, cat)} />
      <GuideListPage
        guides={categoryGuides}
        title={`${categoryName} Guides`}
        cardVariant="detailed"
      />
    </>
  );
}
