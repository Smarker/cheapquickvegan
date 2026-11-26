import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/notion", () => ({
  getRecipesFromCache: () => [
    { slug: "ramen", title: "Quick Vegan Peanut Butter Ramen", content: "- **Total Time:** 20 min\n\n## Ingredients\n\n- 3 tbsp peanut butter\n", categories: ["Meal"], status: "Published", recipeCuisine: "Asian" },
    { slug: "draft-thing", title: "Draft", content: "", status: "Draft" },
    { slug: "untitled", title: "Untitled", content: "", status: "Published" },
  ],
  getGuidesFromCache: () => [{ slug: "cusco", title: "Cusco", coverImage: "/images/cusco.jpg", content: "Hi", city: "Cusco", country: "Peru" }],
}));

const recipes = await import("@/app/api/recipes/route");
const recipe = await import("@/app/api/recipes/[slug]/route");
const guides = await import("@/app/api/guides/route");
const guide = await import("@/app/api/guides/[slug]/route");

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("app API routes", () => {
  it("lists only published recipes, in the app's shape, with CDN caching", async () => {
    const res = await recipes.GET();
    const body = await res.json();
    expect(body.recipes.map((r: { slug: string }) => r.slug)).toEqual(["ramen"]);
    expect(body.recipes[0]).toMatchObject({ totalMinutes: 20, cuisine: "Asian", category: "Meal" });
    expect(body.recipes[0].image).toMatch(/^https:\/\/www\.cheapquickvegan\.com\/images\/ramen-1x1\.jpg$/);
    expect(res.headers.get("cache-control")).toContain("s-maxage");
  });

  it("returns one recipe, or 404 for drafts and unknown slugs", async () => {
    expect((await recipe.GET(new Request("http://x"), params("ramen"))).status).toBe(200);
    expect((await recipe.GET(new Request("http://x"), params("draft-thing"))).status).toBe(404);
    expect((await recipe.GET(new Request("http://x"), params("nope"))).status).toBe(404);
  });

  it("lists guides and finds one by slug", async () => {
    const body = await (await guides.GET()).json();
    expect(body.guides[0]).toMatchObject({ slug: "cusco", city: "Cusco", image: "https://www.cheapquickvegan.com/images/cusco.jpg" });
    expect((await guide.GET(new Request("http://x"), params("cusco"))).status).toBe(200);
    expect((await guide.GET(new Request("http://x"), params("nope"))).status).toBe(404);
  });
});
