import { getPostsFromCache, Post } from "@/lib/notion";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  const recipes = getPostsFromCache();
  const postUrls = recipes.map((post: Post) => ({
    url: `${siteUrl}/recipes/${post.slug}`,
    lastModified: new Date(), // new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Static pages
  const staticPages = [
    { path: "/recipes", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/shop", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/start-here", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms-and-conditions", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/disclaimer", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const staticUrls = staticPages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Category pages
  const categories = ["meal", "breakfast", "dessert", "side", "snack"];
  const categoryUrls = categories.map((cat) => ({
    url: `${siteUrl}/recipes/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...staticUrls,
    ...categoryUrls,
    ...postUrls,
  ];
}
