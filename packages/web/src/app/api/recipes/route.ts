import { NextResponse } from "next/server";
import { APP_CACHE_HEADERS, appRecipes } from "@/lib/app-api";

/** Every published recipe in the app's shape. Read-only; used by the mobile app. */
export async function GET() {
  const recipes = appRecipes();
  return NextResponse.json({ recipes, updatedAt: new Date().toISOString() }, { headers: APP_CACHE_HEADERS });
}
