// Copies published recipes from the website cache into a small JSON the app bundles.
// Temporary: replaced by the site's read-only recipe API routes.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../web/recipes-cache.json');
const target = resolve(here, '../src/data/recipes.json');
const guideSource = resolve(here, '../../web/guides-cache.json');
const guideTarget = resolve(here, '../src/data/guides.json');

const field = (content, name) => {
  const m = content.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*([^\\n]*)`));
  const v = m?.[1]?.trim();
  return v && v !== 'None' && !v.includes('?') ? v : null;
};

const toMinutes = (text) => {
  if (!text) return null;
  let total = 0;
  const day = text.match(/(\d+)\s*day/);
  const hr = text.match(/(\d+)\s*hr/);
  const min = text.match(/(\d+)\s*min/);
  if (day) total += Number(day[1]) * 1440;
  if (hr) total += Number(hr[1]) * 60;
  if (min) total += Number(min[1]);
  return total || null;
};

// Plain text: drop markdown links (keep their label), bold, and image embeds.
const clean = (line) =>
  line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/^-+\s*/, '')
    .trim();

/** The text under one "## Heading" (bold or not), up to the next "## ". */
const section = (content, name) => {
  const re = new RegExp(`^##\\s+(?:\\*\\*)?${name}s?(?:\\*\\*)?\\s*$`, 'mi');
  const m = content.match(re);
  if (!m) return '';
  const rest = content.slice(m.index + m[0].length);
  const next = rest.search(/^##\s/m);
  return next === -1 ? rest : rest.slice(0, next);
};

/** Bullets grouped under optional "### " subheadings. */
const groups = (text, fallbackName) => {
  const out = [];
  let cur = { name: fallbackName, items: [] };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('### ')) {
      if (cur.items.length) out.push(cur);
      cur = { name: clean(line.slice(4)).replace(/:$/, ''), items: [] };
    } else if (/^-\s/.test(line)) {
      const item = clean(line);
      if (item) cur.items.push(item);
    }
  }
  if (cur.items.length) out.push(cur);
  return out;
};

const recipes = JSON.parse(readFileSync(source, 'utf8'))
  .filter((r) => r.status === 'Published' && r.slug && r.slug !== 'untitled')
  .map((r) => {
    const totalText = field(r.content, 'Total Time');
    return {
      slug: r.slug,
      title: r.title,
      shortTitle: r.shortTitle ?? null,
      description: r.description ?? '',
      category: r.categories?.[0] ?? null,
      totalMinutes: toMinutes(totalText),
      totalText,
      yieldText: field(r.content, 'Yield'),
      equipment: r.tags ?? [],
      image: `https://www.cheapquickvegan.com/images/${r.slug}-1x1.jpg`,
      ingredients: groups(section(r.content, 'Ingredient'), null),
      steps: groups(section(r.content, 'Instruction'), null),
      tips: groups(section(r.content, 'Tip'), null).flatMap((g) => g.items),
      date: r.date ?? null,
      cuisine: r.recipeCuisine ?? null,
      // Set in Notion as Easy / Medium / Challenge once the field exists; the app estimates when it's missing.
      difficulty: r.difficulty ?? null,
    };
  });

writeFileSync(target, JSON.stringify(recipes, null, 2) + '\n');
console.log(`Wrote ${recipes.length} recipes to ${target}`);

const guides = JSON.parse(readFileSync(guideSource, 'utf8')).map((g) => ({
  slug: g.slug,
  title: g.title,
  description: g.description ?? '',
  image: `https://www.cheapquickvegan.com${g.coverImage}`,
  category: g.categories?.[0] ?? null,
  country: g.country ?? null,
  city: g.city ?? null,
  readingTime: g.readingTime ?? null,
  content: g.content ?? '',
}));
writeFileSync(guideTarget, JSON.stringify(guides, null, 2) + '\n');
console.log(`Wrote ${guides.length} guides to ${guideTarget}`);
