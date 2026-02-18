import { getGuidesFromCache, getRecipesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ResolvingMetadata } from "next";
import { NotionImage } from "@/components/notion-image";
import { SITE_URL } from "@/config/constants";
import { generateTOC } from "@/lib/guide-parser";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { generateFaqJsonLd } from "@/lib/seo/faq-schema";
import { generateItemListSchema } from "@/lib/seo/item-list-schema";
import { GuideTravelLayout, GuideLayoutProps } from "@/components/guides/guide-travel-layout";
import { GuideRoundup } from "@/components/guides/guide-roundup";
import type { ComponentType } from "react";

// Pre-render every published guide at build time so the first visitor gets a
// fully static response instead of a cold-start render.
export function generateStaticParams() {
  const guides = getGuidesFromCache();
  return guides.map((guide) => ({ slug: guide.slug }));
}

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

// --- Layout registry: add new guide types here ---
const LAYOUTS: Record<string, ComponentType<GuideLayoutProps>> = {
  "Recipe Collection": GuideRoundup,
};

// --- Schema registry: add new schema types here ---
function buildPageSchema(guide: Guide) {
  if (guide.categories.includes("Recipe Collection")) {
    const tagMatches = [...guide.content.matchAll(/\[recipes:([^\]]+)\]/g)].map((m) => m[1].trim());
    const recipes = getRecipesFromCache().filter((r) =>
      r.tags?.some((t) => tagMatches.some((tag) => t.toLowerCase() === tag.toLowerCase()))
    );
    return generateItemListSchema(guide.title, guide.description, guide.slug, recipes, guide.coverImage);
  }

  // Default: Article (travel guides, etc.)
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: guide.coverImage
      ? guide.coverImage.startsWith("http") ? guide.coverImage : `${SITE_URL}${guide.coverImage}`
      : `${SITE_URL}/opengraph-image.png`,
    author: { "@type": "Person", name: "Stephanie Marker" },
    publisher: {
      "@type": "Organization",
      name: "CheapQuickVegan",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: new Date(guide.date).toISOString(),
    dateModified: new Date(guide.lastUpdated || guide.date).toISOString(),
    articleSection: guide.categories[0],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/${guide.slug}` },
  };
}

export async function generateMetadata(
  { params }: GuidePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuidesFromCache().find((g) => g.slug === slug);

  if (!guide) return { title: "Guide Not Found" };

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: `${SITE_URL}/guides/${guide.slug}`,
      publishedTime: new Date(guide.date).toISOString(),
      modifiedTime: new Date(guide.lastUpdated || guide.date).toISOString(),
      authors: ["Stephanie Marker"],
      images: [{
        url: guide.coverImage || `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: guide.alt || guide.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [{ url: guide.coverImage || `${SITE_URL}/opengraph-image.png`, alt: guide.alt || guide.title }],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const allGuides = getGuidesFromCache();
  const guide = allGuides.find((g) => g.slug === slug);

  if (!guide) notFound();

  const sections = generateTOC(guide.content);
  const pageJsonLd = buildPageSchema(guide);
  const faqJsonLd = generateFaqJsonLd(guide.content);

  // Pick layout: first matching category in registry, fallback to travel
  const layoutKey = guide.categories.find((c) => c in LAYOUTS);
  const Layout = layoutKey ? LAYOUTS[layoutKey] : GuideTravelLayout;

  const category = guide.categories[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "" },
        { name: "Guides", path: "/guides" },
        { name: category.charAt(0).toUpperCase() + category.slice(1), path: `/guides/category/${category.toLowerCase()}` },
        { name: guide.title, path: `/guides/${guide.slug}` },
      ]} />
      {faqJsonLd && faqJsonLd.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4">
        {guide.coverImage && (
          <div className="relative w-full aspect-[16/9] max-h-[400px] overflow-hidden rounded-lg mb-4 sm:mb-6 md:mb-8">
            <NotionImage
              src={guide.coverImage}
              alt={guide.alt || guide.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <Layout guide={guide} sections={sections} allGuides={allGuides} />
      </div>
    </>
  );
}
