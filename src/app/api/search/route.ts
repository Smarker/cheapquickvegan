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
        category: guide.category,
      })),
    };

    return NextResponse.json(searchData);
  } catch (error) {
    console.error("Error fetching search data:", error);
    return NextResponse.json({ recipes: [], guides: [] }, { status: 500 });
  }
}
