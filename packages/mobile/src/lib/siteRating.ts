import { API_BASE } from './data';

/**
 * Send this cook's stars to the website's quick ratings, the same ones the recipe page shows.
 * The returned token is what lets this phone change its own rating later; it's never shared.
 */
export async function sendStars(recipeId: string, stars: number, token: string | null): Promise<string> {
  // Development builds talk to the live site, so never post real ratings from them.
  if (__DEV__) {
    console.log(`[dev] Not sending ${stars} stars for ${recipeId} to the live site`);
    return token ?? `dev-${recipeId}`;
  }
  const res = await fetch(`${API_BASE}/api/ratings/quick`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ recipeId, rating: stars, ratingToken: token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ratingToken) throw new Error(data.error ?? 'Could not send your rating');
  return data.ratingToken as string;
}
