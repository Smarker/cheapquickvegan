import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

function buildPageMetadata(
  title: string,
  description: string,
  canonicalUrl: string,
  imageAlt: string
): Metadata {
  const ogTitle = `${title} | Cheap Quick Vegan`;
  const imageUrl = `${SITE_URL}/opengraph-image.png`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url: canonicalUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },
  };
}

// For root/index pages (e.g. /recipes, /guides): type "website" with no
// authorship or publishing dates. Takes a path and constructs the canonical URL.
export function generateAllArticlesMetadata(
  title: string,
  description: string,
  path: string,
  imageAlt: string
): Metadata {
  return buildPageMetadata(title, description, `${SITE_URL}${path}`, imageAlt);
}

interface CategoryMetadataInput {
  categoryName: string;
  contentLabel: string; // e.g. "Recipes" or "Guides"
  description: string;
  canonicalUrl: string;
  imageAlt: string;
}

// For category pages (e.g. /recipes/category/travel): derives the title by
// joining categoryName + contentLabel ("Travel Recipes"), and takes a fully
// constructed canonicalUrl because the caller already has it.
export function generateCategoryMetadata({
  categoryName,
  contentLabel,
  description,
  canonicalUrl,
  imageAlt,
}: CategoryMetadataInput): Metadata {
  return buildPageMetadata(`${categoryName} ${contentLabel}`, description, canonicalUrl, imageAlt);
}
