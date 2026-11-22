import { describe, it, expect } from "vitest";
import {
  generateArticleMetadata,
  generateAllArticlesMetadata,
  generateCategoryMetadata,
} from "@/lib/seo/nextjs-metadata-builders";
import type { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";

// SITE_URL defaults to this when NEXT_PUBLIC_SITE_URL is not set
const SITE_URL = "https://www.cheapquickvegan.com";

// ---------------------------------------------------------------------------
// generateArticleMetadata
// ---------------------------------------------------------------------------

describe("generateArticleMetadata", () => {
  const base = {
    title: "Easy Pasta",
    description: "A simple pasta dish",
    slug: "easy-pasta",
    date: "2024-03-01",
    basePath: "/recipes",
  };

  it("sets title and description", () => {
    const result = generateArticleMetadata(base);
    expect(result.title).toBe("Easy Pasta");
    expect(result.description).toBe("A simple pasta dish");
  });

  it("sets canonical URL to SITE_URL + basePath + slug", () => {
    const result = generateArticleMetadata(base);
    expect(result.alternates?.canonical).toBe(
      `${SITE_URL}/recipes/easy-pasta`
    );
  });

  it("uses basePath when building URL", () => {
    const result = generateArticleMetadata({ ...base, basePath: "/guides" });
    expect(result.alternates?.canonical).toBe(
      `${SITE_URL}/guides/easy-pasta`
    );
  });

  it("sets openGraph type to article", () => {
    const result = generateArticleMetadata(base);
    const og = result.openGraph as { type?: string };
    expect(og.type).toBe("article");
  });

  it("sets publishedTime as ISO string from date", () => {
    const result = generateArticleMetadata(base);
    const og = result.openGraph as { publishedTime?: string };
    expect(og.publishedTime).toBe(new Date("2024-03-01").toISOString());
  });

  it("uses date for modifiedTime when lastUpdated is not provided", () => {
    const result = generateArticleMetadata(base);
    const og = result.openGraph as { modifiedTime?: string };
    expect(og.modifiedTime).toBe(new Date("2024-03-01").toISOString());
  });

  it("uses lastUpdated for modifiedTime when provided", () => {
    const result = generateArticleMetadata({
      ...base,
      lastUpdated: "2024-06-15",
    });
    const og = result.openGraph as { modifiedTime?: string };
    expect(og.modifiedTime).toBe(new Date("2024-06-15").toISOString());
  });

  it("uses date for modifiedTime when lastUpdated is null", () => {
    const result = generateArticleMetadata({ ...base, lastUpdated: null });
    const og = result.openGraph as { modifiedTime?: string };
    expect(og.modifiedTime).toBe(new Date("2024-03-01").toISOString());
  });

  it("sets authors to Stephanie Marker", () => {
    const result = generateArticleMetadata(base);
    const og = result.openGraph as { authors?: string[] };
    expect(og.authors).toContain("Stephanie Marker");
  });

  it("includes tags in openGraph when provided", () => {
    const result = generateArticleMetadata({
      ...base,
      tags: ["vegan", "quick"],
    });
    const og = result.openGraph as { tags?: string[] };
    expect(og.tags).toEqual(["vegan", "quick"]);
  });

  it("omits tags from openGraph when not provided", () => {
    const result = generateArticleMetadata(base);
    const og = result.openGraph as { tags?: string[] };
    expect(og.tags).toBeUndefined();
  });

  it("uses an absolute coverImage URL directly", () => {
    const result = generateArticleMetadata({
      ...base,
      coverImage: "https://cdn.example.com/img.jpg",
    });
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe("https://cdn.example.com/img.jpg");
  });

  it("prefixes a relative coverImage URL with SITE_URL", () => {
    const result = generateArticleMetadata({
      ...base,
      coverImage: "/images/pasta.jpg",
    });
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe(`${SITE_URL}/images/pasta.jpg`);
  });

  it("falls back to opengraph-image.png when no coverImage is given", () => {
    const result = generateArticleMetadata(base);
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe(`${SITE_URL}/opengraph-image.png`);
  });

  it("uses the alt parameter for OG image alt text", () => {
    const result = generateArticleMetadata({
      ...base,
      alt: "A plate of pasta",
    });
    const images = result.openGraph?.images as Array<{
      url: string;
      alt: string;
    }>;
    expect(images[0].alt).toBe("A plate of pasta");
  });

  it("falls back to title for OG image alt text when alt is not provided", () => {
    const result = generateArticleMetadata(base);
    const images = result.openGraph?.images as Array<{
      url: string;
      alt: string;
    }>;
    expect(images[0].alt).toBe("Easy Pasta");
  });

  it("sets OG image dimensions to 1200 x 630", () => {
    const result = generateArticleMetadata(base);
    const images = result.openGraph?.images as Array<{
      url: string;
      width: number;
      height: number;
    }>;
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });

  it("sets Twitter card to summary_large_image", () => {
    const result = generateArticleMetadata(base);
    const twitter = result.twitter as { card?: string };
    expect(twitter.card).toBe("summary_large_image");
  });

  it("sets Twitter title and description", () => {
    const result = generateArticleMetadata(base);
    expect(result.twitter?.title).toBe("Easy Pasta");
    expect(result.twitter?.description).toBe("A simple pasta dish");
  });
});

// ---------------------------------------------------------------------------
// generateAllArticlesMetadata
// ---------------------------------------------------------------------------

describe("generateAllArticlesMetadata", () => {
  const call = () =>
    generateAllArticlesMetadata(
      "All Recipes",
      "Browse vegan recipes",
      "/recipes",
      "Vegan recipe collection"
    );

  it("sets title and description", () => {
    const result = call();
    expect(result.title).toBe("All Recipes");
    expect(result.description).toBe("Browse vegan recipes");
  });

  it("sets canonical URL from path", () => {
    const result = call();
    expect(result.alternates?.canonical).toBe(`${SITE_URL}/recipes`);
  });

  it("sets openGraph type to website", () => {
    const result = call();
    const og = result.openGraph as { type?: string };
    expect(og.type).toBe("website");
  });

  it("appends site name to OG title", () => {
    const result = call();
    expect(result.openGraph?.title).toBe("All Recipes | Cheap Quick Vegan");
  });

  it("uses opengraph-image.png as OG image", () => {
    const result = call();
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe(`${SITE_URL}/opengraph-image.png`);
  });

  it("sets OG image dimensions to 1200 x 630", () => {
    const result = call();
    const images = result.openGraph?.images as Array<{
      url: string;
      width: number;
      height: number;
    }>;
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });

  it("sets Twitter card to summary_large_image", () => {
    const result = call();
    const twitter = result.twitter as { card?: string };
    expect(twitter.card).toBe("summary_large_image");
  });

  it("reflects the provided imageAlt in OG image alt", () => {
    const result = generateAllArticlesMetadata(
      "All Guides",
      "Browse guides",
      "/guides",
      "Vegan travel guides"
    );
    const images = result.openGraph?.images as Array<{
      url: string;
      alt: string;
    }>;
    expect(images[0].alt).toBe("Vegan travel guides");
  });
});

// ---------------------------------------------------------------------------
// generateCategoryMetadata
// ---------------------------------------------------------------------------

describe("generateCategoryMetadata", () => {
  const base = {
    categoryName: "Italian",
    contentLabel: "Recipes",
    description: "Italian vegan recipes",
    canonicalUrl: `${SITE_URL}/recipes/category/italian`,
    imageAlt: "Italian vegan recipes",
  };

  it("combines categoryName and contentLabel as page title", () => {
    const result = generateCategoryMetadata(base);
    expect(result.title).toBe("Italian Recipes");
  });

  it("appends site name to OG title", () => {
    const result = generateCategoryMetadata(base);
    expect(result.openGraph?.title).toBe("Italian Recipes | Cheap Quick Vegan");
  });

  it("sets the canonical URL from the canonicalUrl param", () => {
    const result = generateCategoryMetadata(base);
    expect(result.alternates?.canonical).toBe(
      `${SITE_URL}/recipes/category/italian`
    );
  });

  it("sets openGraph type to website", () => {
    const result = generateCategoryMetadata(base);
    const og = result.openGraph as { type?: string };
    expect(og.type).toBe("website");
  });

  it("sets description", () => {
    const result = generateCategoryMetadata(base);
    expect(result.description).toBe("Italian vegan recipes");
  });

  it("reflects imageAlt in OG image alt", () => {
    const result = generateCategoryMetadata(base);
    const images = result.openGraph?.images as Array<{
      url: string;
      alt: string;
    }>;
    expect(images[0].alt).toBe("Italian vegan recipes");
  });

  it("works for guide categories", () => {
    const result = generateCategoryMetadata({
      categoryName: "Travel",
      contentLabel: "Guides",
      description: "Vegan travel guides",
      canonicalUrl: `${SITE_URL}/guides/category/travel`,
      imageAlt: "Travel guides",
    });
    expect(result.title).toBe("Travel Guides");
    expect(result.openGraph?.title).toBe("Travel Guides | Cheap Quick Vegan");
    expect(result.alternates?.canonical).toBe(
      `${SITE_URL}/guides/category/travel`
    );
  });
});
