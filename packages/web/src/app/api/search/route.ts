import { getRecipesFromCache } from "@/lib/notion";
import { getGuidesFromCache } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const recipes = getRecipesFromCache();
    const guides = getGuidesFromCache();

    // Return minimal data needed for search
    const searchData = {
      recipes: recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        coverImage: recipe.coverImage,
        alt: recipe.alt,
        categories: recipe.categories,
      })),
      guides: guides.map((guide) => ({
        id: guide.id,
        title: guide.title,
        slug: guide.slug,
        coverImage: guide.coverImage,
        alt: guide.alt,
        categories: guide.categories,
      })),
    };

    // Cache the search index at the CDN/browser level.
    // The data only changes when a new build is deployed, so a short s-maxage
    // with a long stale-while-revalidate window is safe and reduces cold-start
    // latency as the blog grows.
    return NextResponse.json(searchData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching search data:", error);
    return NextResponse.json({ recipes: [], guides: [] }, { status: 500 });
  }
}
