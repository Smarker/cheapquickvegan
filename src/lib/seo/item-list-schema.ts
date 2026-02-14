import { Recipe } from "@/types/recipe";
import { SITE_URL } from "@/config/constants";

export function generateItemListSchema(
  title: string,
  description: string,
  slug: string,
  recipes: Recipe[],
  coverImage?: string
) {
  const pageUrl = `${SITE_URL}/guides/${slug}`;
  const imageUrl = coverImage
    ? coverImage.startsWith("http") ? coverImage : `${SITE_URL}${coverImage}`
    : `${SITE_URL}/opengraph-image.png`;

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
        image: recipe.coverImage
          ? recipe.coverImage.startsWith("http")
            ? recipe.coverImage
            : `${SITE_URL}${recipe.coverImage}`
          : undefined,
      })),
    },
  };
}
