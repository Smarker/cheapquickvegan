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

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...postUrls,
  ];
}
