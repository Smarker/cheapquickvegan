import { fetchPublishedGuides, getGuideFromNotion } from '../src/lib/notion';
import fs from 'fs';
import path from 'path';

async function cacheGuides() {
  try {
    console.log('Fetching guides from Notion...');
    const pages = await fetchPublishedGuides();

    const allGuides = [];

    for (const page of pages) {
      const guide = await getGuideFromNotion(page.id);
      if (guide) {
        allGuides.push(guide);
      }
    }

    const cachePath = path.join(process.cwd(), 'guides-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(allGuides, null, 2));

    console.log(`Successfully cached ${allGuides.length} guides.`);
  } catch (error) {
    console.error('Error caching guides:', error);
    process.exit(1);
  }
}

cacheGuides();
