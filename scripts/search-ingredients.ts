#!/usr/bin/env tsx

/**
 * Search Ingredients CLI Script
 *
 * Searches ingredients in the database
 *
 * Usage: pnpm tsx scripts/search-ingredients.ts [search query]
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local if not in production
if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
  config({ path: path.resolve(process.cwd(), '.env.local') });
}

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { searchIngredients } from '../src/lib/db/ingredients';

const rl = readline.createInterface({ input, output });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  try {
    log('\n🔍 Search Ingredients\n', colors.bright + colors.green);

    // Check if query was provided as argument
    let query = process.argv[2];

    if (!query) {
      query = await rl.question('Search query: ');
    }

    if (!query.trim()) {
      log('❌ Query cannot be empty', colors.yellow);
      rl.close();
      return;
    }

    log(`\nSearching for: "${query}"`, colors.dim);

    const results = await searchIngredients(query);

    if (results.length === 0) {
      log('\nNo ingredients found.', colors.yellow);
      log('\nAdd a new ingredient with:', colors.dim);
      log('pnpm tsx scripts/add-ingredient.ts\n', colors.bright);
      rl.close();
      return;
    }

    log(`\nFound ${results.length} ingredient(s):\n`, colors.green);
    log('─'.repeat(80) + '\n');

    results.forEach((ingredient, index) => {
      log(`${index + 1}. ${ingredient.name}`, colors.bright + colors.cyan);
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

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
