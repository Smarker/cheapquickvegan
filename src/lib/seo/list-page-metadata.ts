import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

export function generateListPageMetadata(
  title: string,
  description: string,
  path: string,
  imageAlt: string
): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogTitle = `${title} | Cheap Quick Vegan`;
  const imageUrl = `${SITE_URL}/opengraph-image.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url,
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
