import { formatCategoryName } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";

export function buildArticleBreadcrumbs(
  contentType: "recipes" | "guides",
  title: string,
  slug: string,
  categories: string[] = []
): BreadcrumbItem[] {
  const section = contentType === "recipes" ? "Recipes" : "Guides";
  return [
    { name: "Home", path: "" },
    { name: section, path: `/${contentType}` },
    ...categories.map((cat) => ({
      name: formatCategoryName(cat),
      path: `/${contentType}/category/${cat.toLowerCase().replace(/\s+/g, "-")}`,
    })),
    { name: title, path: `/${contentType}/${slug}` },
  ];
}

export function buildCategoryBreadcrumbs(
  contentType: "recipes" | "guides",
  categoryName: string,
  categorySlug: string
): BreadcrumbItem[] {
  const section = contentType === "recipes" ? "Recipes" : "Guides";
  return [
    { name: "Home", path: "" },
    { name: section, path: `/${contentType}` },
    { name: categoryName, path: `/${contentType}/category/${categorySlug}` },
  ];
}
