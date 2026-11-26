import { NextResponse } from "next/server";
import { APP_CACHE_HEADERS, appRecipes } from "@/lib/app-api";

/** One published recipe in the app's shape, or 404. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = appRecipes().find((r) => r.slug === slug);
  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  return NextResponse.json({ recipe }, { headers: APP_CACHE_HEADERS });
}
