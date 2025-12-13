import { fetchPublishedPosts, getRecipeFromNotion } from '../src/lib/notion';
import fs from 'fs';
import path from 'path';

async function cacheRecipes() {
  try {
    console.log('Fetching recipes from Notion...');
    const pages = await fetchPublishedPosts();

    const allRecipes = [];

    for (const page of pages) {
      const recipe = await getRecipeFromNotion(page.id);
      if (recipe) {
        allRecipes.push(recipe);
      }
    }

    const cachePath = path.join(process.cwd(), 'recipes-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(allRecipes, null, 2));

    console.log(`Successfully cached ${allRecipes.length} recipes.`);
  } catch (error) {
    console.error('Error caching recipes:', error);
    process.exit(1);
  }
}

cacheRecipes();
