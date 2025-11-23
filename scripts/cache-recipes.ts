import { fetchPublishedPosts, getPostFromNotion } from '../src/lib/notion';
import fs from 'fs';
import path from 'path';

async function cachePosts() {
  try {
    console.log('Fetching recipes from Notion...');
    const recipes = await fetchPublishedPosts();

    const allPosts = [];

    for (const post of recipes) {
      const postDetails = await getPostFromNotion(post.id);
      if (postDetails) {
        allPosts.push(postDetails);
      }
    }

    const cachePath = path.join(process.cwd(), 'recipes-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(allPosts, null, 2));

    console.log(`Successfully cached ${allPosts.length} recipes.`);
  } catch (error) {
    console.error('Error caching recipes:', error);
    process.exit(1);
  }
}

cachePosts();
