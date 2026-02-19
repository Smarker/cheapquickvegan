import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { notFound } from "next/navigation";
import GuideListPage from "@/components/guides/guide-list-page";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { generateCategoryMetadata } from "@/lib/seo/metadata-builders";
import { buildCategoryBreadcrumbs } from "@/lib/seo/google-search-jsonld-builders";
import { formatCategoryName } from "@/lib/utils";

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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const categoryName = formatCategoryName(cat);

  if (!VALID_CATEGORIES.includes(cat.toLowerCase().replace(/-/g, " "))) {
    return { title: "Category Not Found" };
  }

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
      <BreadcrumbJsonLd items={buildCategoryBreadcrumbs("guides", categoryName, cat)} />
      <GuideListPage
        guides={categoryGuides}
        title={`${categoryName} Guides`}
        cardVariant="detailed"
      />
    </>
  );
}
