import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
