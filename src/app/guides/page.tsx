import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
import { Metadata } from "next";
import GuideListPage from "@/components/guides/guide-list-page";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { generateAllArticlesMetadata } from "@/lib/seo/nextjs-metadata-builders";

export const metadata: Metadata = generateAllArticlesMetadata(
  "All Guides",
  "Discover comprehensive vegan travel guides, food guides, and how-to articles. Everything you need for your plant-based journey.",
  "/guides",
  "Cheap Quick Vegan Guides"
);

export default function GuidesPage() {
  const guides: Guide[] = getGuidesFromCache();
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "" },
        { name: "Guides", path: "/guides" },
      ]} />
      <GuideListPage guides={guides} title="All Guides" cardVariant="detailed" />
    </>
  );
}
