import { getRecipesFromCache, getGuidesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";
import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const recipes = getRecipesFromCache();
  const recipeUrls = recipes.map((recipe: Recipe) => ({
    url: `${SITE_URL}/recipes/${recipe.slug}`,
    lastModified: new Date(), // new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guides = getGuidesFromCache();
  const guideUrls = guides.map((guide: Guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Static pages
  const staticPages = [
    { path: "/recipes", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/guides", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/shop", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/start-here", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms-and-conditions", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/disclaimer", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const staticUrls = staticPages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Recipe category pages
  const recipeCategories = ["breakfast", "meal", "dessert", "side", "snack"];
  const recipeCategoryUrls = recipeCategories.map((cat) => ({
    url: `${SITE_URL}/recipes/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Guide category pages
  const guideCategories = ["travel", "vegan-food", "how-to"];
  const guideCategoryUrls = guideCategories.map((cat) => ({
    url: `${SITE_URL}/guides/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...staticUrls,
    ...recipeCategoryUrls,
    ...guideCategoryUrls,
    ...recipeUrls,
    ...guideUrls,
  ];
}
