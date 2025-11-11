import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/private/",
        "/_next/", // prevent indexing build/static assets
        "/site.webmanifest", // not meant for indexing
        "/*.ico$", // favicon or icon files
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
