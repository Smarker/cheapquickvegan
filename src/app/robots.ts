import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/_next/static/chunks/", // so Googlebot can fetch JS and image
        "/_next/static/media/", // so Googlebot can fetch JS and image
        "/", // allow main pages
      ],
      disallow: [
        "/private/",
        "/_next/data/", // Next.js data JSON files
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
