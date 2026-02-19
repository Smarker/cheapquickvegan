import { generateBreadcrumbJsonLd, BreadcrumbItem } from "@/lib/seo/google-search-jsonld-builders";

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbJsonLd(items)) }}
    />
  );
}
