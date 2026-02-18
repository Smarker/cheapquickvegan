import { Recipe } from "@/types/recipe";
import { SITE_URL } from "@/config/constants";
import { normalizeImageUrl } from "@/lib/utils";

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
