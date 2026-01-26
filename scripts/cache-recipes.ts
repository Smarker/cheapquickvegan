import { fetchPublishedPosts, getRecipeFromNotion } from '../src/lib/notion';
import { buildCache } from './lib/cache-utils';

buildCache({
  contentType: 'recipes',
  imagesSubdir: 'recipes',
  cacheFileName: 'recipes-cache.json',
  fetchPages: fetchPublishedPosts,
  getContentFromNotion: getRecipeFromNotion
});
