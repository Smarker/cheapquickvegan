#!/usr/bin/env tsx

/**
 * List Ingredients CLI Script
 *
 * Lists all ingredients in the database
 *
 * Usage: pnpm tsx scripts/list-ingredients.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local if not in production
if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
  config({ path: path.resolve(process.cwd(), '.env.local') });
}

import { listAllIngredients, getIngredientCount } from '../src/lib/db/ingredients';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  try {
    log('\n📋 Ingredient Database\n', colors.bright + colors.green);

    const [ingredients, count] = await Promise.all([
      listAllIngredients({ limit: 100, sortBy: 'name', sortOrder: 'asc' }),
      getIngredientCount(),
    ]);

    log(`Total ingredients: ${count}`, colors.cyan);

    if (ingredients.length === 0) {
      log('\nNo ingredients found. Add some with:', colors.dim);
      log('pnpm tsx scripts/add-ingredient.ts\n', colors.bright);
      return;
    }

    log('\n' + '─'.repeat(80) + '\n');

    ingredients.forEach((ingredient, index) => {
      log(`${index + 1}. ${ingredient.name}`, colors.bright);
      log(`   Serving: ${ingredient.servingSize} (${ingredient.servingWeightGrams}g)`, colors.dim);
      log(`   Calories: ${ingredient.calories} | ` +
           `Fat: ${ingredient.totalFat || 0}g | ` +
           `Carbs: ${ingredient.totalCarbohydrates || 0}g | ` +
           `Protein: ${ingredient.protein || 0}g`, colors.cyan);

      if (ingredient.brand) {
        log(`   Brand: ${ingredient.brand}`, colors.dim);
      }

      if (ingredient.aliases && ingredient.aliases.length > 0) {
        log(`   Aliases: ${ingredient.aliases.join(', ')}`, colors.dim);
      }

      log(`   Source: ${ingredient.source} | ID: ${ingredient.id}`, colors.dim);
      log('');
    });

    if (count > ingredients.length) {
      log(`Showing ${ingredients.length} of ${count} ingredients\n`, colors.dim);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error(error);
    process.exit(1);
  }
}

main();
