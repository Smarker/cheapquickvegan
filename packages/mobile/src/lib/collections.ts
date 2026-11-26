// Collections: your own named groups of saved recipes ("Weeknights", "For guests").
// A recipe can be in as many as you like, like a song in several playlists.

export type Collection = { id: string; name: string; slugs: string[] };

export function createCollection(list: Collection[], name: string, id: string, firstSlug?: string): Collection[] {
  const clean = name.trim();
  if (!clean || list.some((c) => c.name.toLowerCase() === clean.toLowerCase())) return list;
  return [...list, { id, name: clean, slugs: firstSlug ? [firstSlug] : [] }];
}

export function renameCollection(list: Collection[], id: string, name: string): Collection[] {
  const clean = name.trim();
  if (!clean || list.some((c) => c.id !== id && c.name.toLowerCase() === clean.toLowerCase())) return list;
  return list.map((c) => (c.id === id ? { ...c, name: clean } : c));
}

export const deleteCollection = (list: Collection[], id: string) => list.filter((c) => c.id !== id);

/** Add or take out one recipe, newest first. */
export const toggleInCollection = (list: Collection[], id: string, slug: string) =>
  list.map((c) => (c.id !== id ? c : { ...c, slugs: c.slugs.includes(slug) ? c.slugs.filter((s) => s !== slug) : [slug, ...c.slugs] }));

/** When a recipe is unsaved it leaves every collection, so collections only ever hold saved recipes. */
export const removeEverywhere = (list: Collection[], slug: string) => list.map((c) => ({ ...c, slugs: c.slugs.filter((s) => s !== slug) }));

export const collectionsWith = (list: Collection[], slug: string) => list.filter((c) => c.slugs.includes(slug));
