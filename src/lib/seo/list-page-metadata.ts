import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

/** Shared builder used by both generateListPageMetadata and generateCategoryMetadata. */
export function buildPageMetadata(
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

export function generateListPageMetadata(
  title: string,
  description: string,
  path: string,
  imageAlt: string
): Metadata {
  return buildPageMetadata(title, description, `${SITE_URL}${path}`, imageAlt);
}
