import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { normalizeImageUrl } from "@/lib/utils";

interface ArticleMetadataInput {
  title: string;
  description: string;
  slug: string;
  date: string;
  lastUpdated?: string | null;
  coverImage?: string | null;
  alt?: string;
  basePath: string; // e.g. "/recipes" or "/guides"
  tags?: string[];
}

export function generateArticleMetadata({
  title,
  description,
  slug,
  date,
  lastUpdated,
  coverImage,
  alt,
  basePath,
  tags,
}: ArticleMetadataInput): Metadata {
  const url = `${SITE_URL}${basePath}/${slug}`;
  const imageUrl = normalizeImageUrl(coverImage);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: new Date(date).toISOString(),
      modifiedTime: new Date(lastUpdated || date).toISOString(),
      authors: ["Stephanie Marker"],
      ...(tags && { tags }),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: alt || title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: alt || title }],
    },
  };
}
