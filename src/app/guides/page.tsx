import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import GuideListPage from "@/components/guides/guide-list-page";

export const metadata: Metadata = {
  title: "All Guides",
  description: "Discover comprehensive vegan travel guides, food guides, and how-to articles. Everything you need for your plant-based journey.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: "All Guides | Cheap Quick Vegan",
    description: "Discover comprehensive vegan travel guides, food guides, and how-to articles. Everything you need for your plant-based journey.",
    type: "website",
    url: `${SITE_URL}/guides`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Cheap Quick Vegan Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Guides | Cheap Quick Vegan",
    description: "Discover comprehensive vegan travel guides, food guides, and how-to articles. Everything you need for your plant-based journey.",
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
      name: "Guides",
      item: `${SITE_URL}/guides`,
    },
  ],
};

export default function GuidesPage() {
  const guides: Guide[] = getGuidesFromCache();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GuideListPage guides={guides} title="All Guides" cardVariant="detailed" />
    </>
  );
}
