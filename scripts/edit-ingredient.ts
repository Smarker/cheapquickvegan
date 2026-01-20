#!/usr/bin/env tsx

/**
 * Edit Ingredient CLI Script
 *
 * Edit an existing ingredient in the database
 *
 * Usage: pnpm tsx scripts/edit-ingredient.ts [ingredient name or ID]
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { getIngredient, updateIngredient, searchIngredients } from '../src/lib/db/ingredients';
import { Ingredient } from '../src/types/ingredient';

const rl = readline.createInterface({ input, output });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
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

async function askNumber(prompt: string, currentValue?: number): Promise<number | undefined> {
  const defaultText = currentValue !== undefined ? ` (current: ${currentValue})` : '';
  const answer = await rl.question(prompt + defaultText + ': ');

  if (!answer.trim()) {
    return currentValue;
  }

  const num = parseFloat(answer);

  if (isNaN(num)) {
    logError('Invalid number');
    return askNumber(prompt, currentValue);
  }

  return num;
}

async function main() {
  try {
    console.clear();
    log('\n✏️  Edit Ingredient\n', colors.bright + colors.green);

    // Get ingredient name or ID
    let nameOrId = process.argv[2];

    if (!nameOrId) {
      nameOrId = await rl.question('Ingredient name or ID: ');
    }

    if (!nameOrId.trim()) {
      logError('Name or ID cannot be empty');
      rl.close();
      return;
    }

    // Try to find the ingredient
    let ingredient = await getIngredient(nameOrId);

    // If not found, try searching
    if (!ingredient) {
      log(`\nNot found. Searching for similar ingredients...`, colors.dim);

      const results = await searchIngredients(nameOrId);

      if (results.length === 0) {
        logError('No ingredients found');
        rl.close();
        return;
      }

      log(`\nFound ${results.length} ingredient(s):\n`, colors.green);

      results.forEach((ing, index) => {
        log(`${index + 1}. ${ing.name} (${ing.servingSize})`, colors.cyan);
      });

      const selection = await rl.question('\nSelect (1-' + results.length + '): ');
      const selectedIndex = parseInt(selection) - 1;

      if (selectedIndex < 0 || selectedIndex >= results.length) {
        logError('Invalid selection');
        rl.close();
        return;
      }

      ingredient = results[selectedIndex];
    }

    // Display current values
    log('\n--- Current Values ---\n', colors.bright);
    log(`Name: ${ingredient.name}`, colors.cyan);
    log(`Serving Size: ${ingredient.servingSize}`, colors.dim);
    log(`Serving Weight: ${ingredient.servingWeightGrams}g`, colors.dim);
    log(`Calories: ${ingredient.calories}`, colors.dim);
    if (ingredient.totalFat) log(`Total Fat: ${ingredient.totalFat}g`, colors.dim);
    if (ingredient.saturatedFat) log(`Saturated Fat: ${ingredient.saturatedFat}g`, colors.dim);
    if (ingredient.sodium) log(`Sodium: ${ingredient.sodium}mg`, colors.dim);
    if (ingredient.totalCarbohydrates) log(`Total Carbs: ${ingredient.totalCarbohydrates}g`, colors.dim);
    if (ingredient.dietaryFiber) log(`Fiber: ${ingredient.dietaryFiber}g`, colors.dim);
    if (ingredient.protein) log(`Protein: ${ingredient.protein}g`, colors.dim);
    if (ingredient.brand) log(`Brand: ${ingredient.brand}`, colors.dim);
    if (ingredient.notes) log(`Notes: ${ingredient.notes}`, colors.dim);

    log('\n--- Edit Values (press Enter to keep current) ---\n', colors.bright);

    // Editable fields
    const nameAnswer = await rl.question(`Name (current: ${ingredient.name}): `);
    const name = nameAnswer.trim() || undefined;

    const servingSizeAnswer = await rl.question(`Serving Size (current: ${ingredient.servingSize}): `);
    const servingSize = servingSizeAnswer.trim() || undefined;

    const servingWeightGrams = await askNumber('Serving Weight (g)', ingredient.servingWeightGrams);
    const calories = await askNumber('Calories', ingredient.calories);
    const totalFat = await askNumber('Total Fat (g)', ingredient.totalFat);
    const saturatedFat = await askNumber('Saturated Fat (g)', ingredient.saturatedFat);
    const transFat = await askNumber('Trans Fat (g)', ingredient.transFat);
    const cholesterol = await askNumber('Cholesterol (mg)', ingredient.cholesterol);
    const sodium = await askNumber('Sodium (mg)', ingredient.sodium);
    const totalCarbohydrates = await askNumber('Total Carbohydrates (g)', ingredient.totalCarbohydrates);
    const dietaryFiber = await askNumber('Dietary Fiber (g)', ingredient.dietaryFiber);
    const totalSugars = await askNumber('Total Sugars (g)', ingredient.totalSugars);
    const protein = await askNumber('Protein (g)', ingredient.protein);

    const brandAnswer = await rl.question(`Brand (current: ${ingredient.brand || 'none'}): `);
    const brand = brandAnswer.trim() || undefined;

    const notesAnswer = await rl.question(`Notes (current: ${ingredient.notes || 'none'}): `);
    const notes = notesAnswer.trim() || undefined;

    // Build update data (only include changed fields)
    const updateData: any = {};

    if (name) updateData.name = name.toLowerCase();
    if (servingSize) updateData.servingSize = servingSize;
    if (servingWeightGrams !== undefined && servingWeightGrams !== ingredient.servingWeightGrams) {
      updateData.servingWeightGrams = servingWeightGrams;
    }
    if (calories !== undefined && calories !== ingredient.calories) updateData.calories = calories;
    if (totalFat !== undefined) updateData.totalFat = totalFat;
    if (saturatedFat !== undefined) updateData.saturatedFat = saturatedFat;
    if (transFat !== undefined) updateData.transFat = transFat;
    if (cholesterol !== undefined) updateData.cholesterol = cholesterol;
    if (sodium !== undefined) updateData.sodium = sodium;
    if (totalCarbohydrates !== undefined) updateData.totalCarbohydrates = totalCarbohydrates;
    if (dietaryFiber !== undefined) updateData.dietaryFiber = dietaryFiber;
    if (totalSugars !== undefined) updateData.totalSugars = totalSugars;
    if (protein !== undefined) updateData.protein = protein;
    if (brand) updateData.brand = brand;
    if (notes) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      logInfo('No changes made');
      rl.close();
      return;
    }

    // Confirm update
    const confirm = await rl.question('\nSave changes? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      logError('Cancelled');
      rl.close();
      return;
    }

    log('\nUpdating ingredient...', colors.dim);

    await updateIngredient(ingredient.id, updateData);

    logSuccess('\nIngredient updated successfully!');
    log('');

  } catch (error) {
    logError('\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    console.error(error);
  } finally {
    rl.close();
  }
}

main();
