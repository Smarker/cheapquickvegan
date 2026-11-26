import { describe, expect, it } from "vitest";
import { isAppRecipe, toAppGuide, toAppRecipe, toMinutes } from "../src/app-data";

const CONTENT = `
## Recipe Details

- **Prep Time:** 10 min
- **Cook Time:** 20 min
- **Total Time:** 1 hr 30 min
- **Yield:** 4 bowls

## Ingredients

- 1 block firm tofu

## Instructions

### Press the tofu

- Press the tofu for 15 minutes.
`;

describe("toMinutes", () => {
  it("reads minutes, hours and days", () => {
    expect(toMinutes("20 min")).toBe(20);
    expect(toMinutes("1 hr 30 min")).toBe(90);
    expect(toMinutes("1 day")).toBe(1440);
    expect(toMinutes("None")).toBe(null);
    expect(toMinutes(undefined)).toBe(null);
  });
});

describe("toAppRecipe", () => {
  const r = toAppRecipe(
    { slug: "tofu-bowl", title: "Tofu Bowl", content: CONTENT, categories: ["Meal", "Side"], tags: ["Air Fryer"], recipeCuisine: "Asian", shortTitle: " Tofu Bowl ", difficulty: "Easy" },
    "https://www.cheapquickvegan.com",
  );

  it("keeps the fields the app shows", () => {
    expect(r).toMatchObject({
      category: "Meal",
      totalMinutes: 90,
      totalText: "1 hr 30 min",
      yieldText: "4 bowls",
      equipment: ["Air Fryer"],
      cuisine: "Asian",
      shortTitle: "Tofu Bowl",
      difficulty: "Easy",
      image: "https://www.cheapquickvegan.com/images/tofu-bowl-1x1.jpg",
    });
  });

  it("keeps named step sections", () => {
    expect(r.steps).toEqual([{ name: "Press the tofu", items: ["Press the tofu for 15 minutes."] }]);
  });

  it("uses null for missing optional fields", () => {
    const bare = toAppRecipe({ slug: "x", title: "X", content: "" }, "https://example.com");
    expect(bare).toMatchObject({ shortTitle: null, difficulty: null, cuisine: null, category: null, totalMinutes: null });
  });
});

describe("toAppRecipe description", () => {
  const long = "Yes, traditional Spanish gazpacho is naturally vegan. ".repeat(5).trim();
  const make = (content: string) =>
    toAppRecipe({ slug: "x", title: "X", description: long.slice(0, 160) + "...", content }, "https://example.com");

  it("shows the whole opening paragraph instead of the site's 160-character cut", () => {
    expect(make(`\n${long}\n\n## Ingredients\n`).description).toBe(long);
  });

  it("falls back to the site's description when the content opens with a heading", () => {
    expect(make(CONTENT).description).toBe(long.slice(0, 160) + "...");
  });
});

describe("isAppRecipe", () => {
  it("drops drafts and untitled placeholders", () => {
    expect(isAppRecipe({ slug: "a", title: "A", content: "", status: "Published" })).toBe(true);
    expect(isAppRecipe({ slug: "a", title: "A", content: "", status: "Draft" })).toBe(false);
    expect(isAppRecipe({ slug: "untitled", title: "A", content: "" })).toBe(false);
  });
});

describe("toAppGuide", () => {
  it("makes the cover image absolute", () => {
    const g = toAppGuide({ slug: "cusco", title: "Cusco", coverImage: "/images/cusco.jpg" }, "https://www.cheapquickvegan.com");
    expect(g.image).toBe("https://www.cheapquickvegan.com/images/cusco.jpg");
  });
});
