import { isAppRecipe, toAppGuide, toAppRecipe, type AppGuide, type AppRecipe } from "@cheapquickvegan/shared";
import { getGuidesFromCache, getRecipesFromCache } from "@/lib/notion";

/**
 * Read-only data for the mobile app, built from the same caches the pages use.
 * Images always point at the production site, never localhost or a preview domain,
 * because the app can be served data from any environment but must load real photos.
 */
const CANONICAL = "https://www.cheapquickvegan.com";

export function appRecipes(): AppRecipe[] {
  return getRecipesFromCache().filter(isAppRecipe).map((r) => toAppRecipe(r, CANONICAL));
}

export function appGuides(): AppGuide[] {
  return getGuidesFromCache().map((g) => toAppGuide(g, CANONICAL));
}

/** Let phones and the CDN reuse a response for an hour, and serve a stale copy for a day while refreshing. */
export const APP_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};
