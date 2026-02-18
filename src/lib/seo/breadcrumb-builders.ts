import { toCategorySlug } from "@/lib/utils";

interface BreadcrumbItem {
  name: string;
  path: string;
}

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
      name: cat,
      path: `/${contentType}/category/${toCategorySlug(cat)}`,
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
