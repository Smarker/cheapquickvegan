#!/usr/bin/env tsx

/**
 * Import Ingredients CLI Script
 *
 * Imports ingredients from JSON or CSV file to the database
 *
 * Usage: pnpm tsx scripts/import-ingredients.ts --file ingredients.json
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';
import { addIngredient } from '../src/lib/db/ingredients';
import { IngredientData, IngredientSource } from '../src/types/ingredient';

const rl = readline.createInterface({ input, output });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
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

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

/**
 * Parse CSV to ingredients
 */
function parseCSV(csvContent: string): IngredientData[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    const ingredient: any = {};
    headers.forEach((header, index) => {
      const value = values[index];

      switch (header) {
        case 'name':
          ingredient.name = value;
          break;
        case 'aliases':
          ingredient.aliases = value ? value.split(';') : [];
          break;
        case 'usda_fdc_id':
          ingredient.usdaFdcId = value || undefined;
          break;
        case 'brand':
          ingredient.brand = value || undefined;
          break;
        case 'notes':
          ingredient.notes = value || undefined;
          break;
        case 'serving_size':
          ingredient.servingSize = value;
          break;
        case 'serving_weight_grams':
          ingredient.servingWeightGrams = parseFloat(value);
          break;
        case 'calories':
          ingredient.calories = parseFloat(value);
          break;
        case 'total_fat':
          ingredient.totalFat = value ? parseFloat(value) : undefined;
          break;
        case 'saturated_fat':
          ingredient.saturatedFat = value ? parseFloat(value) : undefined;
          break;
        case 'trans_fat':
          ingredient.transFat = value ? parseFloat(value) : undefined;
          break;
        case 'cholesterol':
          ingredient.cholesterol = value ? parseFloat(value) : undefined;
          break;
        case 'sodium':
          ingredient.sodium = value ? parseFloat(value) : undefined;
          break;
        case 'total_carbohydrates':
          ingredient.totalCarbohydrates = value ? parseFloat(value) : undefined;
          break;
        case 'dietary_fiber':
          ingredient.dietaryFiber = value ? parseFloat(value) : undefined;
          break;
        case 'total_sugars':
          ingredient.totalSugars = value ? parseFloat(value) : undefined;
          break;
        case 'protein':
          ingredient.protein = value ? parseFloat(value) : undefined;
          break;
        case 'vitamin_d':
          ingredient.vitaminD = value ? parseFloat(value) : undefined;
          break;
        case 'calcium':
          ingredient.calcium = value ? parseFloat(value) : undefined;
          break;
        case 'iron':
          ingredient.iron = value ? parseFloat(value) : undefined;
          break;
        case 'potassium':
          ingredient.potassium = value ? parseFloat(value) : undefined;
          break;
        case 'source':
          ingredient.source = value as IngredientSource;
          break;
      }
    });

    return ingredient as IngredientData;
  });
}

async function main() {
  try {
    log('\n📥 Import Ingredients\n', colors.bright + colors.cyan);

    // Get file path from command line or prompt
    const fileIndex = process.argv.indexOf('--file');
    let filePath = fileIndex > -1 ? process.argv[fileIndex + 1] : '';

    if (!filePath) {
      filePath = await rl.question('Import file path: ');
    }

    if (!filePath.trim()) {
      logError('File path is required');
      rl.close();
      return;
    }

    // Make path absolute
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logError(`File not found: ${filePath}`);
      rl.close();
      return;
    }

    // Detect format from extension
    const ext = path.extname(filePath).toLowerCase();
    const format = ext === '.csv' ? 'csv' : 'json';

    log(`\nReading ${format.toUpperCase()} file...`, colors.cyan);

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse ingredients
    let ingredients: IngredientData[];

    if (format === 'json') {
      try {
        ingredients = JSON.parse(fileContent);

        if (!Array.isArray(ingredients)) {
          logError('Invalid JSON format. Expected an array of ingredients');
          rl.close();
          return;
        }
      } catch (error) {
        logError('Failed to parse JSON file');
        rl.close();
        return;
      }
    } else {
      ingredients = parseCSV(fileContent);
    }

    log(`Found ${ingredients.length} ingredients to import`, colors.green);

    // Confirm import
    const confirm = await rl.question('\nProceed with import? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      logWarning('Import cancelled');
      rl.close();
      return;
    }

    // Import ingredients
    log('\nImporting ingredients...', colors.cyan);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];

      try {
        await addIngredient(ingredient);
        successCount++;

        if ((i + 1) % 10 === 0) {
          log(`Progress: ${i + 1}/${ingredients.length}`, colors.cyan);
        }
      } catch (error) {
        errorCount++;
        logError(`Failed to import ${ingredient.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    log('');
    logSuccess(`Import complete!`);
    log(`Success: ${successCount}`, colors.green);
    if (errorCount > 0) {
      log(`Errors: ${errorCount}`, colors.red);
    }
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
