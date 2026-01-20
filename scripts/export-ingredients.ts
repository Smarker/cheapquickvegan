#!/usr/bin/env tsx

/**
 * Export Ingredients CLI Script
 *
 * Exports ingredients from the database to JSON or CSV format
 *
 * Usage: pnpm tsx scripts/export-ingredients.ts --format json --output ingredients.json
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';
import { listAllIngredients } from '../src/lib/db/ingredients';
import { Ingredient } from '../src/types/ingredient';

const rl = readline.createInterface({ input, output });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

/**
 * Convert ingredients to CSV format
 */
function ingredientsToCSV(ingredients: Ingredient[]): string {
  const headers = [
    'name',
    'aliases',
    'usda_fdc_id',
    'brand',
    'notes',
    'serving_size',
    'serving_weight_grams',
    'calories',
    'total_fat',
    'saturated_fat',
    'trans_fat',
    'cholesterol',
    'sodium',
    'total_carbohydrates',
    'dietary_fiber',
    'total_sugars',
    'protein',
    'vitamin_d',
    'calcium',
    'iron',
    'potassium',
    'source',
  ];

  const rows = ingredients.map((ing) => {
    return [
      ing.name,
      ing.aliases.join(';'),
      ing.usdaFdcId || '',
      ing.brand || '',
      ing.notes || '',
      ing.servingSize,
      ing.servingWeightGrams,
      ing.calories,
      ing.totalFat || '',
      ing.saturatedFat || '',
      ing.transFat || '',
      ing.cholesterol || '',
      ing.sodium || '',
      ing.totalCarbohydrates || '',
      ing.dietaryFiber || '',
      ing.totalSugars || '',
      ing.protein || '',
      ing.vitaminD || '',
      ing.calcium || '',
      ing.iron || '',
      ing.potassium || '',
      ing.source,
    ].map(field => {
      // Escape commas and quotes in CSV
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

async function main() {
  try {
    log('\n📤 Export Ingredients\n', colors.bright + colors.cyan);

    // Get format from command line or prompt
    const formatIndex = process.argv.indexOf('--format');
    let format = formatIndex > -1 ? process.argv[formatIndex + 1] : '';

    if (!format) {
      format = await rl.question('Export format (json/csv): ');
    }

    format = format.toLowerCase();

    if (format !== 'json' && format !== 'csv') {
      logError('Invalid format. Please use "json" or "csv"');
      rl.close();
      return;
    }

    // Get output path from command line or prompt
    const outputIndex = process.argv.indexOf('--output');
    let outputPath = outputIndex > -1 ? process.argv[outputIndex + 1] : '';

    if (!outputPath) {
      const defaultName = `ingredients-export.${format}`;
      outputPath = await rl.question(`Output file (default: ${defaultName}): `);
      outputPath = outputPath.trim() || defaultName;
    }

    // Make path absolute
    if (!path.isAbsolute(outputPath)) {
      outputPath = path.join(process.cwd(), outputPath);
    }

    // Fetch all ingredients
    log('\nFetching ingredients from database...', colors.cyan);

    const ingredients = await listAllIngredients({ limit: 10000, sortBy: 'name', sortOrder: 'asc' });

    if (ingredients.length === 0) {
      logError('No ingredients found in database');
      rl.close();
      return;
    }

    log(`Found ${ingredients.length} ingredients`, colors.green);

    // Export based on format
    let content: string;

    if (format === 'json') {
      // Remove internal metadata for cleaner export
      const cleanedIngredients = ingredients.map(({ id, createdAt, updatedAt, ...rest }) => rest);
      content = JSON.stringify(cleanedIngredients, null, 2);
    } else {
      content = ingredientsToCSV(ingredients);
    }

    // Write to file
    log(`\nWriting to ${outputPath}...`, colors.cyan);

    fs.writeFileSync(outputPath, content, 'utf-8');

    logSuccess(`\nExported ${ingredients.length} ingredients to ${outputPath}`);
    log('');

  } catch (error) {
    logError('\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
