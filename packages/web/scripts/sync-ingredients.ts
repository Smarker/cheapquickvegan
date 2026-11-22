/**
 * Sync ingredients from recipe cache into the database.
 *
 * Reads every recipe's markdown content, extracts canonical ingredient names,
 * upserts them into the `ingredients` table, and links them via `recipe_ingredients`.
 * Safe to run multiple times — all operations are idempotent.
 *
 * Prerequisites: run migrations 002, 004, 005 before running this script.
 *
 * Usage:
 *   pnpm sync:ingredients                        ← sync all recipes
 *   pnpm sync:ingredients [recipe-slug]          ← sync one recipe
 *   pnpm sync:ingredients [recipe-slug] --dry-run  ← preview extraction, no DB writes
 *   pnpm sync:ingredients --dry-run              ← preview all, no DB writes
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { parseRecipeContent } from '../src/lib/recipe-parser';
import { extractIngredient } from '../src/lib/ingredients/extractor';
import {
  findIngredientByName,
  upsertIngredient,
  syncRecipeIngredients,
} from '../src/lib/db/ingredients';
import type { Recipe } from '../src/types/recipe';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filterSlug = args.find((a) => !a.startsWith('--'));

async function main() {
  const cachePath = path.join(process.cwd(), 'recipes-cache.json');

  if (!fs.existsSync(cachePath)) {
    console.error('recipes-cache.json not found — run pnpm cache:recipes first');
    process.exit(1);
  }

  const allRecipes: Recipe[] = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  const recipes = filterSlug
    ? allRecipes.filter((r) => r.slug === filterSlug)
    : allRecipes;

  if (filterSlug && recipes.length === 0) {
    console.error(`No recipe found with slug: ${filterSlug}`);
    process.exit(1);
  }

  if (dryRun) console.log('DRY RUN — no changes will be written to the DB\n');
  console.log(`${dryRun ? 'Previewing' : 'Syncing'} ingredients for ${recipes.length} recipe(s)...\n`);

  let totalIngredients = 0;
  let totalNew = 0;

  for (const recipe of recipes) {
    if (!recipe.content) {
      console.log(`[skip] ${recipe.slug} — no content`);
      continue;
    }

    const { ingredients: rawLines } = parseRecipeContent(recipe.content);

    if (rawLines.length === 0) {
      console.log(`[skip] ${recipe.slug} — no ingredient lines`);
      continue;
    }

    console.log(`${recipe.slug}`);

    const items: Array<{
      ingredientId: string | null;
      rawText: string;
      quantity: string | null;
      notes: string | null;
      displayOrder: number;
    }> = [];

    for (let i = 0; i < rawLines.length; i++) {
      const extracted = extractIngredient(rawLines[i]);

      if (dryRun) {
        const parts = [extracted.quantity, extracted.notes, `"${extracted.canonicalName}"`].filter(Boolean);
        console.log(`  ${parts.join(' | ')}  ←  ${extracted.rawText}`);
        continue;
      }

      if (!extracted.canonicalName) {
        items.push({ ingredientId: null, rawText: rawLines[i], quantity: null, notes: null, displayOrder: i });
        continue;
      }

      let ingredient = await findIngredientByName(extracted.canonicalName);
      const isNew = !ingredient;

      if (!ingredient) {
        ingredient = await upsertIngredient({ name: extracted.canonicalName });
        totalNew++;
      }

      items.push({
        ingredientId: ingredient.id,
        rawText: rawLines[i],
        quantity: extracted.quantity,
        notes: extracted.notes,
        displayOrder: i,
      });

      totalIngredients++;
    }

    if (!dryRun) {
      await syncRecipeIngredients(recipe.slug, recipe.id, items);
      console.log(`  → ${items.length} ingredient(s) linked`);
    }

    console.log('');
  }

  if (!dryRun) {
    console.log(`Finished. ${totalIngredients} ingredient links written, ${totalNew} new ingredient(s) created.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
