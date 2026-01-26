/**
 * Breadcrumb JSON-LD Utilities
 *
 * Generates structured data for breadcrumbs across the site
 */

import { SITE_URL } from '@/config/constants';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Generates breadcrumb JSON-LD structured data
 * @param items - Array of breadcrumb items with name and path
 * @returns JSON-LD object for breadcrumbs
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * React component that renders breadcrumb JSON-LD script tag
 * @param items - Array of breadcrumb items
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = generateBreadcrumbJsonLd(items);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
