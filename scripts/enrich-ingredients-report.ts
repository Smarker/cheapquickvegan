import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.POSTGRES_URL!);

// Default: show only unenriched ingredients.
// Pass --all to show everything.
const showAll = process.argv.includes('--all');

async function main() {
  const rows = showAll
    ? await sql`
        SELECT
          i.name,
          p.name AS parent_name,
          i.no_parent,
          i.category_tags,
          i.aliases,
          COUNT(ri.recipe_id)::int AS recipe_count
        FROM ingredients i
        LEFT JOIN ingredients p ON p.id = i.parent_id
        LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
        GROUP BY i.id, i.name, p.name, i.no_parent, i.category_tags, i.aliases
        ORDER BY recipe_count DESC, i.name
      `
    : await sql`
        SELECT
          i.name,
          p.name AS parent_name,
          i.no_parent,
          i.category_tags,
          i.aliases,
          COUNT(ri.recipe_id)::int AS recipe_count
        FROM ingredients i
        LEFT JOIN ingredients p ON p.id = i.parent_id
        LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
        WHERE
          i.name NOT IN ('water')
          AND (
            (i.parent_id IS NULL AND NOT i.no_parent)
            OR i.category_tags IS NULL
            OR i.category_tags = '{}'
            OR i.aliases IS NULL
            OR i.aliases = '{}'
          )
        GROUP BY i.id, i.name, p.name, i.no_parent, i.category_tags, i.aliases
        ORDER BY recipe_count DESC, i.name
      `;

  if (showAll) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log('✓ All ingredients are fully enriched.');
    return;
  }

  for (const r of rows as any[]) {
    const missing = [];
    if (!r.parent_name && !r.no_parent) missing.push('parent?');
    if (!r.category_tags?.length) missing.push('no tags');
    if (!r.aliases?.length) missing.push('no aliases');
    console.log(`[${r.recipe_count}] ${r.name} — ${missing.join(', ')}`);
    console.log(`  tags: ${r.category_tags?.join(', ') || '—'} | aliases: ${r.aliases?.join(', ') || '—'}`);
  }
  console.log(`\nTotal pending: ${rows.length}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
