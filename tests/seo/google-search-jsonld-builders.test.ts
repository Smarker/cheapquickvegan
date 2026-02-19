import { describe, it, expect } from "vitest";
import {
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  generateItemListSchema,
  buildArticleBreadcrumbs,
  buildCategoryBreadcrumbs,
} from "@/lib/seo/google-search-jsonld-builders";
import type { Recipe } from "@/types/recipe";

// SITE_URL defaults to this when NEXT_PUBLIC_SITE_URL is not set
const SITE_URL = "https://www.cheapquickvegan.com";

// ---------------------------------------------------------------------------
// generateBreadcrumbJsonLd
// ---------------------------------------------------------------------------

describe("generateBreadcrumbJsonLd", () => {
  it("returns correct @context and @type", () => {
    const result = generateBreadcrumbJsonLd([]);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("BreadcrumbList");
  });

  it("returns empty itemListElement for empty input", () => {
    const result = generateBreadcrumbJsonLd([]);
    expect(result.itemListElement).toEqual([]);
  });

  it("builds a single item with position 1 and correct URL", () => {
    const result = generateBreadcrumbJsonLd([{ name: "Home", path: "" }]);
    expect(result.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ]);
  });

  it("builds multiple items with sequential positions and correct URLs", () => {
    // Reflects the real recipe breadcrumb: Home → Recipes → Category → Recipe
    const items = [
      { name: "Home", path: "" },
      { name: "Recipes", path: "/recipes" },
      { name: "Meal", path: "/recipes/category/meal" },
      { name: "Pasta Salad", path: "/recipes/pasta-salad" },
    ];
    const result = generateBreadcrumbJsonLd(items);
    expect(result.itemListElement).toHaveLength(4);
    expect(result.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    });
    expect(result.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Recipes",
      item: `${SITE_URL}/recipes`,
    });
    expect(result.itemListElement[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "Meal",
      item: `${SITE_URL}/recipes/category/meal`,
    });
    expect(result.itemListElement[3]).toEqual({
      "@type": "ListItem",
      position: 4,
      name: "Pasta Salad",
      item: `${SITE_URL}/recipes/pasta-salad`,
    });
  });

  it("prefixes SITE_URL to every item URL", () => {
    const result = generateBreadcrumbJsonLd([
      { name: "About", path: "/about" },
    ]);
    expect(result.itemListElement[0].item).toBe(`${SITE_URL}/about`);
  });

  it("gives every item @type ListItem", () => {
    const result = generateBreadcrumbJsonLd([
      { name: "Home", path: "" },
      { name: "About", path: "/about" },
    ]);
    result.itemListElement.forEach((item) => {
      expect(item["@type"]).toBe("ListItem");
    });
  });
});

// ---------------------------------------------------------------------------
// generateFaqJsonLd
// ---------------------------------------------------------------------------

describe("generateFaqJsonLd", () => {
  it("returns correct @context and @type", () => {
    const result = generateFaqJsonLd("");
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("FAQPage");
  });

  it("returns empty mainEntity for empty input", () => {
    const result = generateFaqJsonLd("");
    expect(result.mainEntity).toEqual([]);
  });

  it("parses **Q: / **A: markdown format", () => {
    const content = "**Q: Is this vegan?**\n**A: Yes, it is.**";
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity).toHaveLength(1);
    expect(result.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "Is this vegan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, it is.",
      },
    });
  });

  it("parses **Q: / A: mixed format", () => {
    const content = "**Q: Is this cheap?**\nA: Absolutely.";
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity).toHaveLength(1);
    expect(result.mainEntity[0].name).toBe("Is this cheap?");
    expect(result.mainEntity[0].acceptedAnswer.text).toBe("Absolutely.");
  });

  it("parses multiple Q&A pairs", () => {
    const content = [
      "**Q: First question?**",
      "**A: First answer.**",
      "**Q: Second question?**",
      "A: Second answer.",
    ].join("\n");
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity).toHaveLength(2);
    expect(result.mainEntity[0].name).toBe("First question?");
    expect(result.mainEntity[0].acceptedAnswer.text).toBe("First answer.");
    expect(result.mainEntity[1].name).toBe("Second question?");
    expect(result.mainEntity[1].acceptedAnswer.text).toBe("Second answer.");
  });

  it("ignores blank lines between Q&A pairs", () => {
    const content = "**Q: Question?**\n\n**A: Answer.**";
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity).toHaveLength(1);
  });

  it("skips answers that have no preceding question", () => {
    const content = "**A: Orphaned answer.**";
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity).toHaveLength(0);
  });

  it("overwrites an unanswered question when a new question appears", () => {
    // Only the second Q gets paired with the answer
    const content = [
      "**Q: Unanswered question?**",
      "**Q: Another question?**",
      "**A: Answer to second.**",
    ].join("\n");
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity).toHaveLength(1);
    expect(result.mainEntity[0].name).toBe("Another question?");
    expect(result.mainEntity[0].acceptedAnswer.text).toBe("Answer to second.");
  });

  it("each mainEntity item has @type Question and acceptedAnswer @type Answer", () => {
    const content = "**Q: Q?**\n**A: A.**";
    const result = generateFaqJsonLd(content);
    expect(result.mainEntity[0]["@type"]).toBe("Question");
    expect(result.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
  });
});

// ---------------------------------------------------------------------------
// generateItemListSchema
// ---------------------------------------------------------------------------

const makeRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: "1",
  title: "Pasta Salad",
  slug: "pasta-salad",
  description: "A great pasta salad",
  coverImage: "https://example.com/pasta.jpg",
  alt: "pasta salad",
  content: "",
  date: "2024-01-01",
  lastUpdated: "2024-01-01",
  categories: ["salads"],
  relatedRecipes: [],
  recipeCuisine: "Italian",
  tags: [],
  ...overrides,
});

describe("generateItemListSchema", () => {
  it("returns CollectionPage @type with schema.org @context", () => {
    const result = generateItemListSchema("Title", "Desc", "slug", []);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("CollectionPage");
  });

  it("sets name and description from parameters", () => {
    const result = generateItemListSchema(
      "Best Pasta Guides",
      "Explore pasta",
      "slug",
      []
    );
    expect(result.name).toBe("Best Pasta Guides");
    expect(result.description).toBe("Explore pasta");
  });

  it("builds url as /guides/{slug}", () => {
    const result = generateItemListSchema("Title", "Desc", "my-guide", []);
    expect(result.url).toBe(`${SITE_URL}/guides/my-guide`);
  });

  it("falls back to opengraph-image.png when coverImage is omitted", () => {
    const result = generateItemListSchema("Title", "Desc", "slug", []);
    expect(result.image).toBe(`${SITE_URL}/opengraph-image.png`);
  });

  it("uses absolute coverImage URL directly", () => {
    const result = generateItemListSchema(
      "Title",
      "Desc",
      "slug",
      [],
      "https://cdn.example.com/cover.jpg"
    );
    expect(result.image).toBe("https://cdn.example.com/cover.jpg");
  });

  it("prefixes relative coverImage URL with SITE_URL", () => {
    const result = generateItemListSchema(
      "Title",
      "Desc",
      "slug",
      [],
      "/images/cover.jpg"
    );
    expect(result.image).toBe(`${SITE_URL}/images/cover.jpg`);
  });

  it("sets author to Stephanie Marker", () => {
    const result = generateItemListSchema("Title", "Desc", "slug", []);
    expect(result.author).toEqual({ "@type": "Person", name: "Stephanie Marker" });
  });

  it("sets publisher name and logo URL", () => {
    const result = generateItemListSchema("Title", "Desc", "slug", []);
    expect(result.publisher).toMatchObject({
      "@type": "Organization",
      name: "CheapQuickVegan",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    });
  });

  it("sets mainEntity @type to ItemList", () => {
    const result = generateItemListSchema("Title", "Desc", "slug", []);
    expect(result.mainEntity["@type"]).toBe("ItemList");
  });

  it("reflects numberOfItems from the recipes array length", () => {
    const result = generateItemListSchema("Title", "Desc", "slug", [
      makeRecipe(),
      makeRecipe({ id: "2", slug: "another" }),
    ]);
    expect(result.mainEntity.numberOfItems).toBe(2);
  });

  it("builds itemListElement with correct positions, URLs, and names", () => {
    const recipes = [makeRecipe()];
    const result = generateItemListSchema("Title", "Desc", "slug", recipes);
    expect(result.mainEntity.itemListElement[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      url: `${SITE_URL}/recipes/pasta-salad`,
      name: "Pasta Salad",
      description: "A great pasta salad",
      image: "https://example.com/pasta.jpg",
    });
  });

  it("sets image to undefined for a recipe with no coverImage", () => {
    const recipes = [makeRecipe({ coverImage: "" })];
    const result = generateItemListSchema("Title", "Desc", "slug", recipes);
    expect(result.mainEntity.itemListElement[0].image).toBeUndefined();
  });

  it("builds correct positions for multiple recipes", () => {
    const recipes = [
      makeRecipe({ id: "1", slug: "first" }),
      makeRecipe({ id: "2", slug: "second" }),
      makeRecipe({ id: "3", slug: "third" }),
    ];
    const result = generateItemListSchema("Title", "Desc", "slug", recipes);
    result.mainEntity.itemListElement.forEach((item, i) => {
      expect(item.position).toBe(i + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// buildArticleBreadcrumbs
// ---------------------------------------------------------------------------

describe("buildArticleBreadcrumbs", () => {
  it("builds recipe breadcrumbs with no categories", () => {
    const result = buildArticleBreadcrumbs("recipes", "My Recipe", "my-recipe");
    expect(result).toEqual([
      { name: "Home", path: "" },
      { name: "Recipes", path: "/recipes" },
      { name: "My Recipe", path: "/recipes/my-recipe" },
    ]);
  });

  it("builds guide breadcrumbs with no categories", () => {
    const result = buildArticleBreadcrumbs("guides", "My Guide", "my-guide");
    expect(result).toEqual([
      { name: "Home", path: "" },
      { name: "Guides", path: "/guides" },
      { name: "My Guide", path: "/guides/my-guide" },
    ]);
  });

  it("inserts a single category between section and article", () => {
    const result = buildArticleBreadcrumbs(
      "recipes",
      "My Recipe",
      "my-recipe",
      ["meal"]
    );
    expect(result).toEqual([
      { name: "Home", path: "" },
      { name: "Recipes", path: "/recipes" },
      { name: "Meal", path: "/recipes/category/meal" },
      { name: "My Recipe", path: "/recipes/my-recipe" },
    ]);
  });

  it("formats hyphenated category names with title case", () => {
    const result = buildArticleBreadcrumbs("recipes", "Recipe", "recipe", [
      "quick-meals",
    ]);
    const cat = result.find((i) => i.path.includes("/category/"));
    expect(cat?.name).toBe("Quick Meals");
  });

  it("handles multiple categories in the order given", () => {
    const result = buildArticleBreadcrumbs(
      "recipes",
      "Recipe",
      "recipe",
      ["italian", "pasta"]
    );
    expect(result).toHaveLength(5); // home, recipes, italian, pasta, article
    expect(result[2]).toMatchObject({ name: "Italian", path: "/recipes/category/italian" });
    expect(result[3]).toMatchObject({ name: "Pasta", path: "/recipes/category/pasta" });
  });

  it("defaults to no categories when omitted", () => {
    const result = buildArticleBreadcrumbs("recipes", "Recipe", "my-recipe");
    expect(result).toHaveLength(3);
  });

  it("always starts with Home as path ''", () => {
    const result = buildArticleBreadcrumbs("guides", "Guide", "guide");
    expect(result[0]).toEqual({ name: "Home", path: "" });
  });

  it("always ends with the article as the last item", () => {
    const result = buildArticleBreadcrumbs("recipes", "Soup", "soup", [
      "soups",
    ]);
    const last = result[result.length - 1];
    expect(last).toEqual({ name: "Soup", path: "/recipes/soup" });
  });
});

// ---------------------------------------------------------------------------
// buildCategoryBreadcrumbs
// ---------------------------------------------------------------------------

describe("buildCategoryBreadcrumbs", () => {
  it("builds recipe category breadcrumbs", () => {
    const result = buildCategoryBreadcrumbs("recipes", "Italian", "italian");
    expect(result).toEqual([
      { name: "Home", path: "" },
      { name: "Recipes", path: "/recipes" },
      { name: "Italian", path: "/recipes/category/italian" },
    ]);
  });

  it("builds guide category breadcrumbs", () => {
    const result = buildCategoryBreadcrumbs("guides", "Travel", "travel");
    expect(result).toEqual([
      { name: "Home", path: "" },
      { name: "Guides", path: "/guides" },
      { name: "Travel", path: "/guides/category/travel" },
    ]);
  });

  it("always returns exactly 3 items", () => {
    const result = buildCategoryBreadcrumbs(
      "recipes",
      "Category",
      "category"
    );
    expect(result).toHaveLength(3);
  });

  it("always starts with Home", () => {
    const result = buildCategoryBreadcrumbs("recipes", "Soups", "soups");
    expect(result[0]).toEqual({ name: "Home", path: "" });
  });

  it("sets section name to Recipes for recipes contentType", () => {
    const result = buildCategoryBreadcrumbs("recipes", "Quick", "quick");
    expect(result[1].name).toBe("Recipes");
    expect(result[1].path).toBe("/recipes");
  });

  it("sets section name to Guides for guides contentType", () => {
    const result = buildCategoryBreadcrumbs("guides", "Quick", "quick");
    expect(result[1].name).toBe("Guides");
    expect(result[1].path).toBe("/guides");
  });

  it("uses the provided categorySlug in the category path", () => {
    const result = buildCategoryBreadcrumbs(
      "recipes",
      "Quick Meals",
      "quick-meals"
    );
    expect(result[2].path).toBe("/recipes/category/quick-meals");
  });
});
