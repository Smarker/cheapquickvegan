// Copies published recipes and guides from the website's caches into JSON the app bundles.
// It's the offline fallback: on launch the app fetches the same data live from /api/recipes and /api/guides.
// Both paths use the shared conversion in @cheapquickvegan/shared, so they always match.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAppRecipe, toAppGuide, toAppRecipe, type SourceGuide, type SourceRecipe } from '@cheapquickvegan/shared';

const SITE = 'https://www.cheapquickvegan.com';
const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '../../web');
const out = resolve(here, '../src/data');

const recipes = (JSON.parse(readFileSync(resolve(web, 'recipes-cache.json'), 'utf8')) as SourceRecipe[])
  .filter(isAppRecipe)
  .map((r) => toAppRecipe(r, SITE));
writeFileSync(resolve(out, 'recipes.json'), JSON.stringify(recipes, null, 2) + '\n');
console.log(`Wrote ${recipes.length} recipes`);

const guides = (JSON.parse(readFileSync(resolve(web, 'guides-cache.json'), 'utf8')) as SourceGuide[]).map((g) => toAppGuide(g, SITE));
writeFileSync(resolve(out, 'guides.json'), JSON.stringify(guides, null, 2) + '\n');
console.log(`Wrote ${guides.length} guides`);
