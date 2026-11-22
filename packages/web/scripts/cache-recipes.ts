import { fetchPublishedPosts, getRecipeFromNotion } from '../src/lib/notion';
import { buildCache } from './lib/cache-utils';
import fs from 'fs';
import path from 'path';

// Get slug from command line args: pnpm cache:recipes -- vegan-tahini-maple-halva
const filterSlug = process.argv[2];

if (filterSlug) {
  // Single recipe refresh mode
  console.log(`Refreshing single recipe with slug: ${filterSlug}`);

  const cachePath = path.join(process.cwd(), 'recipes-cache.json');

  // Load existing cache
  let existingCache = [];
  if (fs.existsSync(cachePath)) {
    existingCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }

  // Fetch all published posts to find the matching one
  fetchPublishedPosts().then(async (pages) => {
    let found = false;

    for (const page of pages) {
      const recipe = await getRecipeFromNotion(page.id);
      if (recipe && recipe.slug === filterSlug) {
        found = true;
        console.log(`Found and processing: ${recipe.title}`);

        // Update or add to cache
        const existingIndex = existingCache.findIndex((r: any) => r.slug === filterSlug);
        if (existingIndex >= 0) {
          existingCache[existingIndex] = recipe;
          console.log(`Updated existing recipe in cache`);
        } else {
          existingCache.push(recipe);
          console.log(`Added new recipe to cache`);
        }

        // Save updated cache
        fs.writeFileSync(cachePath, JSON.stringify(existingCache, null, 2));
        console.log(`Successfully updated cache for: ${filterSlug}`);
        break;
      }
    }

    if (!found) {
      console.error(`No recipe found with slug: ${filterSlug}`);
      process.exit(1);
    }
  }).catch((error) => {
    console.error('Error refreshing recipe:', error);
    process.exit(1);
  });

} else {
  // Full cache rebuild
  buildCache({
    contentType: 'recipes',
    imagesSubdir: 'recipes',
    cacheFileName: 'recipes-cache.json',
    fetchPages: fetchPublishedPosts,
    getContentFromNotion: getRecipeFromNotion
  });
}
