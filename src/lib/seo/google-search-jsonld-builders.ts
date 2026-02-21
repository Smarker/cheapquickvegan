import { Recipe } from "@/types/recipe";
import { SITE_URL } from "@/config/constants";
import { formatCategoryName, normalizeImageUrl } from "@/lib/utils";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

// https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
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

// https://developers.google.com/search/docs/appearance/structured-data/faqpage
export function generateFaqJsonLd(faqContent: string) {
  const lines = faqContent
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: { "@type": string; text: string }
  }> = [];

  let currentQuestion: string | null = null;

  lines.forEach(line => {
    if (line.startsWith("**Q:")) {
      currentQuestion = line.replace("**Q:", "").replace("**", "").trim();
    } else if (currentQuestion && (line.startsWith("**A:") || line.startsWith("A:"))) {
      // Handle both **A:** and A: formats
      let answerText = line;
      if (line.startsWith("**A:")) {
        answerText = line.replace("**A:", "").replace("**", "").trim();
      } else {
        answerText = line.replace("A:", "").trim();
      }
      mainEntity.push({
        "@type": "Question",
        name: currentQuestion,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
        },
      });
      currentQuestion = null;
    }
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

// https://developers.google.com/search/docs/appearance/structured-data/carousel#all-in-one
export function generateItemListSchema(
  title: string,
  description: string,
  slug: string,
  recipes: Recipe[],
  coverImage?: string
) {
  const pageUrl = `${SITE_URL}/guides/${slug}`;
  const imageUrl = normalizeImageUrl(coverImage);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: pageUrl,
    image: imageUrl,
    author: { "@type": "Person", name: "Stephanie Marker" },
    publisher: {
      "@type": "Organization",
      name: "CheapQuickVegan",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntity: {
      "@type": "ItemList",
      name: title,
      description,
      numberOfItems: recipes.length,
      itemListElement: recipes.map((recipe, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/recipes/${recipe.slug}`,
        name: recipe.title,
        description: recipe.description,
        image: recipe.coverImage ? normalizeImageUrl(recipe.coverImage) : undefined,
      })),
    },
  };
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
