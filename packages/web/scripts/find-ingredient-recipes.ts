import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.POSTGRES_URL!);

const name = process.argv[2];
if (!name) { console.error('Usage: pnpm tsx scripts/find-ingredient-recipes.ts "ingredient name"'); process.exit(1); }

async function main() {
  const rows = await sql`
    SELECT ri.recipe_slug, ri.raw_text
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE LOWER(i.name) = LOWER(${name})
    ORDER BY ri.recipe_slug
  `;
  if (rows.length === 0) { console.log(`No recipes found for "${name}"`); return; }
  console.log(`"${name}" appears in ${rows.length} recipe(s):`);
  for (const r of rows) console.log(`  ${r.recipe_slug}  ←  "${r.raw_text}"`);
}

main().catch((err) => { console.error(err); process.exit(1); });
