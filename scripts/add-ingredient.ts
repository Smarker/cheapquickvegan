#!/usr/bin/env tsx

/**
 * Add Ingredient CLI Script
 *
 * Interactive script to add ingredients from USDA FoodData Central to the database.
 *
 * Usage: pnpm tsx scripts/add-ingredient.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local if not in production
if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
  config({ path: path.resolve(process.cwd(), '.env.local') });
}

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { searchFoods, getFoodDetails, formatUSDAFood, formatNutritionSummary, parseUSDAToIngredient } from '../src/lib/usda-api';
import { addIngredient } from '../src/lib/db/ingredients';
import { convertToGrams } from '../src/lib/unit-converter';

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

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function main() {
  try {
    console.clear();
    log('\n🥗 Add Ingredient to Database\n', colors.bright + colors.green);

    // Step 1: Get ingredient name
    const ingredientName = await rl.question('Ingredient name: ');

    if (!ingredientName.trim()) {
      logError('Ingredient name cannot be empty');
      rl.close();
      return;
    }

    // Step 2: Search USDA database
    log('\nSearching USDA database...', colors.dim);

    const searchResults = await searchFoods(ingredientName, { pageSize: 10 });

    if (searchResults.foods.length === 0) {
      logWarning('No results found in USDA database.');
      const useManual = await rl.question('\nWould you like to enter nutrition manually? (y/n): ');

      if (useManual.toLowerCase() === 'y') {
        log('\nPlease use the manual entry script:', colors.cyan);
        log('pnpm tsx scripts/add-ingredient-manual.ts\n', colors.bright);
      }

      rl.close();
      return;
    }

    // Step 3: Display results
    log(`\nFound ${searchResults.foods.length} results:\n`, colors.green);

    searchResults.foods.forEach((food, index) => {
      log(`${index + 1}. ${formatUSDAFood(food)}`, colors.cyan);
    });

    log(`${searchResults.foods.length + 1}. Skip - Enter manually`, colors.dim);

    // Step 4: Select food
    const selection = await rl.question('\nSelect (1-' + (searchResults.foods.length + 1) + '): ');
    const selectedIndex = parseInt(selection) - 1;

    if (selectedIndex < 0 || selectedIndex >= searchResults.foods.length + 1) {
      logError('Invalid selection');
      rl.close();
      return;
    }

    if (selectedIndex === searchResults.foods.length) {
      log('\nPlease use the manual entry script:', colors.cyan);
      log('pnpm tsx scripts/add-ingredient-manual.ts\n', colors.bright);
      rl.close();
      return;
    }

    const selectedFood = searchResults.foods[selectedIndex];

    // Step 5: Fetch detailed nutrition
    log('\nFetching nutrition data...', colors.dim);

    const foodDetails = await getFoodDetails(selectedFood.fdcId.toString());

    log(`\nFetched: ${foodDetails.description}`, colors.green);
    log(formatNutritionSummary(foodDetails), colors.cyan);

    // Step 6: Choose serving size
    log('\n\nServing size options:', colors.bright);
    log('1. 1 cup (240g)');
    log('2. 1/2 cup (120g)');
    log('3. 100g');
    log('4. Custom');

    const servingChoice = await rl.question('\nSelect: ');

    let servingSize = '100g';
    let servingWeightGrams = 100;

    switch (servingChoice) {
      case '1':
        servingSize = '1 cup';
        servingWeightGrams = 240;
        break;
      case '2':
        servingSize = '1/2 cup';
        servingWeightGrams = 120;
        break;
      case '3':
        servingSize = '100g';
        servingWeightGrams = 100;
        break;
      case '4':
        const customServing = await rl.question('Enter serving size (e.g., "1 cup", "2 tbsp", "50g"): ');
        servingSize = customServing.trim();

        try {
          const conversion = convertToGrams(1, customServing.replace(/^\d+\s*/, ''), ingredientName);
          servingWeightGrams = conversion.grams;
          logInfo(`Converted to ${servingWeightGrams}g`);
        } catch (error) {
          logWarning('Could not auto-convert. Please enter weight in grams:');
          const weightInput = await rl.question('Weight (g): ');
          servingWeightGrams = parseFloat(weightInput);
        }
        break;
      default:
        servingSize = '100g';
        servingWeightGrams = 100;
    }

    // Step 7: Parse USDA data to ingredient format
    const ingredientData = parseUSDAToIngredient(foodDetails, {
      servingSize,
      servingWeightGrams,
    });

    // Step 8: Display calculated nutrition
    log('\n\nCalculated nutrition per ' + servingSize + ':', colors.bright + colors.green);
    log(`- Calories: ${ingredientData.calories}`);
    if (ingredientData.totalFat) log(`- Total Fat: ${ingredientData.totalFat}g`);
    if (ingredientData.saturatedFat) log(`- Saturated Fat: ${ingredientData.saturatedFat}g`);
    if (ingredientData.sodium) log(`- Sodium: ${ingredientData.sodium}mg`);
    if (ingredientData.totalCarbohydrates) log(`- Total Carbs: ${ingredientData.totalCarbohydrates}g`);
    if (ingredientData.dietaryFiber) log(`- Fiber: ${ingredientData.dietaryFiber}g`);
    if (ingredientData.totalSugars) log(`- Sugars: ${ingredientData.totalSugars}g`);
    if (ingredientData.protein) log(`- Protein: ${ingredientData.protein}g`);

    // Step 9: Get aliases
    const aliasesInput = await rl.question('\n\nAliases (comma-separated, optional): ');
    const aliases = aliasesInput
      ? aliasesInput.split(',').map(a => a.trim()).filter(a => a.length > 0)
      : [];

    ingredientData.aliases = aliases;

    // Step 10: Get brand (optional)
    const brand = await rl.question('Brand (optional): ');
    if (brand.trim()) {
      ingredientData.brand = brand.trim();
    }

    // Step 11: Get notes (optional)
    const notes = await rl.question('Notes (optional): ');
    if (notes.trim()) {
      ingredientData.notes = notes.trim();
    }

    // Step 12: Confirm and save
    const confirm = await rl.question('\n\nSave this ingredient? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      logWarning('Cancelled');
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
