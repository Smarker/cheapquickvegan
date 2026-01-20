#!/usr/bin/env tsx

/**
 * Add Ingredient Manually CLI Script
 *
 * Interactive script to manually add ingredients (for items not in USDA database).
 *
 * Usage: pnpm tsx scripts/add-ingredient-manual.ts
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { addIngredient } from '../src/lib/db/ingredients';
import { IngredientData } from '../src/types/ingredient';

const rl = readline.createInterface({ input, output });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
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

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

async function askNumber(prompt: string, optional: boolean = true): Promise<number | undefined> {
  const answer = await rl.question(prompt);

  if (!answer.trim() && optional) {
    return undefined;
  }

  const num = parseFloat(answer);

  if (isNaN(num)) {
    logError('Invalid number');
    return askNumber(prompt, optional);
  }

  return num;
}

async function main() {
  try {
    console.clear();
    log('\n✍️  Add Ingredient Manually\n', colors.bright + colors.green);

    logInfo('Enter nutrition data from product packaging or another source.\n');

    // Required fields
    const name = await rl.question('Ingredient name (required): ');

    if (!name.trim()) {
      logError('Name is required');
      rl.close();
      return;
    }

    const servingSize = await rl.question('Serving size (e.g., "1 cup", "100g") (required): ');

    if (!servingSize.trim()) {
      logError('Serving size is required');
      rl.close();
      return;
    }

    const servingWeightGrams = await askNumber('Serving weight in grams (required): ', false);

    if (!servingWeightGrams) {
      logError('Serving weight is required');
      rl.close();
      return;
    }

    const calories = await askNumber('Calories per serving (required): ', false);

    if (calories === undefined) {
      logError('Calories is required');
      rl.close();
      return;
    }

    // Optional macronutrients
    log('\n--- Macronutrients (press Enter to skip) ---', colors.dim);

    const totalFat = await askNumber('Total Fat (g): ');
    const saturatedFat = await askNumber('Saturated Fat (g): ');
    const transFat = await askNumber('Trans Fat (g): ');
    const cholesterol = await askNumber('Cholesterol (mg): ');
    const sodium = await askNumber('Sodium (mg): ');
    const totalCarbohydrates = await askNumber('Total Carbohydrates (g): ');
    const dietaryFiber = await askNumber('Dietary Fiber (g): ');
    const totalSugars = await askNumber('Total Sugars (g): ');
    const protein = await askNumber('Protein (g): ');

    // Optional micronutrients
    log('\n--- Vitamins & Minerals (press Enter to skip) ---', colors.dim);

    const vitaminD = await askNumber('Vitamin D (mcg): ');
    const calcium = await askNumber('Calcium (mg): ');
    const iron = await askNumber('Iron (mg): ');
    const potassium = await askNumber('Potassium (mg): ');

    // Metadata
    log('\n--- Additional Information ---', colors.dim);

    const aliasesInput = await rl.question('Aliases (comma-separated, optional): ');
    const aliases = aliasesInput
      ? aliasesInput.split(',').map(a => a.trim()).filter(a => a.length > 0)
      : [];

    const brand = await rl.question('Brand (optional): ');
    const notes = await rl.question('Notes (optional): ');

    // Source selection
    log('\n--- Source ---', colors.dim);
    log('1. Packaging label');
    log('2. Other manual source');

    const sourceChoice = await rl.question('Select source: ');
    const source = sourceChoice === '1' ? 'packaging' : 'manual';

    // Build ingredient data
    const ingredientData: IngredientData = {
      name: name.trim().toLowerCase(),
      aliases,
      brand: brand.trim() || undefined,
      notes: notes.trim() || undefined,
      servingSize: servingSize.trim(),
      servingWeightGrams,
      calories,
      totalFat,
      saturatedFat,
      transFat,
      cholesterol,
      sodium,
      totalCarbohydrates,
      dietaryFiber,
      totalSugars,
      protein,
      vitaminD,
      calcium,
      iron,
      potassium,
      source,
    };

    // Display summary
    log('\n\n--- Summary ---', colors.bright + colors.cyan);
    log(`Name: ${ingredientData.name}`);
    log(`Serving: ${ingredientData.servingSize} (${ingredientData.servingWeightGrams}g)`);
    log(`Calories: ${ingredientData.calories}`);
    if (ingredientData.totalFat) log(`Total Fat: ${ingredientData.totalFat}g`);
    if (ingredientData.saturatedFat) log(`Saturated Fat: ${ingredientData.saturatedFat}g`);
    if (ingredientData.sodium) log(`Sodium: ${ingredientData.sodium}mg`);
    if (ingredientData.totalCarbohydrates) log(`Total Carbs: ${ingredientData.totalCarbohydrates}g`);
    if (ingredientData.dietaryFiber) log(`Fiber: ${ingredientData.dietaryFiber}g`);
    if (ingredientData.totalSugars) log(`Sugars: ${ingredientData.totalSugars}g`);
    if (ingredientData.protein) log(`Protein: ${ingredientData.protein}g`);
    if (ingredientData.brand) log(`Brand: ${ingredientData.brand}`);
    if (ingredientData.notes) log(`Notes: ${ingredientData.notes}`);

    // Confirm
    const confirm = await rl.question('\n\nSave this ingredient? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      logError('Cancelled');
      rl.close();
      return;
    }

    log('\nSaving to database...', colors.dim);

    const savedIngredient = await addIngredient(ingredientData);

    logSuccess(`\nAdded: ${savedIngredient.name}`);
    logInfo(`ID: ${savedIngredient.id}`);

    log('\n');

  } catch (error) {
    logError('\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    console.error(error);
  } finally {
    rl.close();
  }
}

main();
