import { fetchPublishedGuides, getGuideFromNotion } from '../src/lib/notion';
import { buildCache } from './lib/cache-utils';

buildCache({
  contentType: 'guides',
  imagesSubdir: 'guides',
  cacheFileName: 'guides-cache.json',
  fetchPages: fetchPublishedGuides,
  getContentFromNotion: getGuideFromNotion
});
