import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/list-page-metadata";

interface CategoryMetadataInput {
  categoryName: string;
  contentLabel: string; // e.g. "Recipes" or "Guides"
  description: string;
  canonicalUrl: string;
  imageAlt: string;
}

export function generateCategoryMetadata({
  categoryName,
  contentLabel,
  description,
  canonicalUrl,
  imageAlt,
}: CategoryMetadataInput): Metadata {
  const title = `${categoryName} ${contentLabel}`;
  return buildPageMetadata(title, description, canonicalUrl, imageAlt);
}
