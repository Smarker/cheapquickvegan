#!/usr/bin/env tsx

/**
 * Calculate Recipe Nutrition CLI Script
 *
 * Interactive script to calculate nutrition for a recipe by mapping ingredients
 * from the recipe to the ingredient database.
 *
 * Usage: pnpm tsx scripts/calculate-recipe-nutrition.ts --slug <recipe-slug>
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';
import { searchIngredients, getIngredient } from '../src/lib/db/ingredients';
import { saveRecipeCalculation } from '../src/lib/db/recipe-nutrition';
import { parseAndConvertToGrams } from '../src/lib/unit-converter';
import {
  CalculatedNutrition,
  RecipeIngredientMapping,
  Ingredient,
} from '../src/types/ingredient';
import { Recipe } from '../src/types/recipe';

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

/**
 * Loads recipes from cache
 */
function loadRecipesCache(): Recipe[] {
  const cachePath = path.join(process.cwd(), 'recipes-cache.json');

  if (!fs.existsSync(cachePath)) {
    throw new Error('Recipe cache not found. Run: pnpm run cache:recipes');
  }

  const cacheData = fs.readFileSync(cachePath, 'utf-8');
  return JSON.parse(cacheData);
}

/**
 * Extracts ingredients from recipe content (markdown)
 */
function extractIngredients(content: string): string[] {
  const lines = content.split('\n');
  const ingredients: string[] = [];

  let inIngredientsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for ingredients section
    if (trimmed.startsWith('## Ingredients') || trimmed.startsWith('###')) {
      inIngredientsSection = trimmed.includes('Ingredients');
      continue;
    }

    // Check for next section (end of ingredients)
    if (trimmed.startsWith('##') && inIngredientsSection) {
      inIngredientsSection = false;
      break;
    }

    // Extract ingredient items (lines starting with -)
    if (inIngredientsSection && trimmed.startsWith('-')) {
      const ingredient = trimmed.substring(1).trim();
      if (ingredient) {
        ingredients.push(ingredient);
      }
    }
  }

  return ingredients;
}

/**
 * Extracts servings from recipe content
 */
function extractServings(content: string): number {
  const match = content.match(/Yield:\*\*\s*(\d+)/i);
  return match ? parseInt(match[1]) : 1;
}

/**
 * Calculate nutrition for a single ingredient
 */
function calculateIngredientNutrition(
  ingredient: Ingredient,
  weightGrams: number
): Partial<CalculatedNutrition> {
  const ratio = weightGrams / ingredient.servingWeightGrams;

  return {
    calories: Math.round(ingredient.calories * ratio),
    totalFat: ingredient.totalFat ? Math.round(ingredient.totalFat * ratio * 10) / 10 : 0,
    saturatedFat: ingredient.saturatedFat ? Math.round(ingredient.saturatedFat * ratio * 10) / 10 : 0,
    transFat: ingredient.transFat ? Math.round(ingredient.transFat * ratio * 10) / 10 : 0,
    cholesterol: ingredient.cholesterol ? Math.round(ingredient.cholesterol * ratio) : 0,
    sodium: ingredient.sodium ? Math.round(ingredient.sodium * ratio) : 0,
    totalCarbohydrates: ingredient.totalCarbohydrates ? Math.round(ingredient.totalCarbohydrates * ratio * 10) / 10 : 0,
    dietaryFiber: ingredient.dietaryFiber ? Math.round(ingredient.dietaryFiber * ratio * 10) / 10 : 0,
    totalSugars: ingredient.totalSugars ? Math.round(ingredient.totalSugars * ratio * 10) / 10 : 0,
    protein: ingredient.protein ? Math.round(ingredient.protein * ratio * 10) / 10 : 0,
    vitaminD: ingredient.vitaminD ? Math.round(ingredient.vitaminD * ratio * 10) / 10 : undefined,
    calcium: ingredient.calcium ? Math.round(ingredient.calcium * ratio) : undefined,
    iron: ingredient.iron ? Math.round(ingredient.iron * ratio * 10) / 10 : undefined,
    potassium: ingredient.potassium ? Math.round(ingredient.potassium * ratio) : undefined,
  };
}

/**
 * Sum nutrition values
 */
function sumNutrition(
  total: CalculatedNutrition,
  add: Partial<CalculatedNutrition>
): CalculatedNutrition {
  return {
    calories: total.calories + (add.calories || 0),
    totalFat: total.totalFat + (add.totalFat || 0),
    saturatedFat: total.saturatedFat + (add.saturatedFat || 0),
    transFat: total.transFat + (add.transFat || 0),
    cholesterol: total.cholesterol + (add.cholesterol || 0),
    sodium: total.sodium + (add.sodium || 0),
    totalCarbohydrates: total.totalCarbohydrates + (add.totalCarbohydrates || 0),
    dietaryFiber: total.dietaryFiber + (add.dietaryFiber || 0),
    totalSugars: total.totalSugars + (add.totalSugars || 0),
    protein: total.protein + (add.protein || 0),
    vitaminD: (total.vitaminD || 0) + (add.vitaminD || 0) || undefined,
    calcium: (total.calcium || 0) + (add.calcium || 0) || undefined,
    iron: (total.iron || 0) + (add.iron || 0) || undefined,
    potassium: (total.potassium || 0) + (add.potassium || 0) || undefined,
  };
}

async function main() {
  try {
    console.clear();
    log('\n📊 Calculate Recipe Nutrition\n', colors.bright + colors.green);

    // Get recipe slug from command line
    const slugIndex = process.argv.indexOf('--slug');
    let slug = slugIndex > -1 ? process.argv[slugIndex + 1] : '';

    if (!slug) {
      slug = await rl.question('Recipe slug: ');
    }

    if (!slug.trim()) {
      logError('Recipe slug is required');
      rl.close();
      return;
    }

    // Load recipe from cache
    log('\nLoading recipe from cache...', colors.dim);

    const recipes = loadRecipesCache();
    const recipe = recipes.find((r) => r.slug === slug);

    if (!recipe) {
      logError(`Recipe not found: ${slug}`);
      logInfo('Available recipes: ' + recipes.map(r => r.slug).slice(0, 5).join(', ') + '...');
      rl.close();
      return;
    }

    log(`\nRecipe: ${recipe.title}`, colors.bright + colors.cyan);

    const servings = extractServings(recipe.content);
    log(`Servings: ${servings}`, colors.cyan);

    // Extract ingredients
    const ingredients = extractIngredients(recipe.content);

    if (ingredients.length === 0) {
      logError('No ingredients found in recipe');
      rl.close();
      return;
    }

    log(`\nIngredients found in recipe:`, colors.bright);

    ingredients.forEach((ing, index) => {
      log(`${index + 1}. ${ing}`, colors.dim);
    });

    log('\n' + '─'.repeat(80) + '\n', colors.dim);

    // Process each ingredient
    const mappings: RecipeIngredientMapping[] = [];
    let totalNutrition: CalculatedNutrition = {
      calories: 0,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      totalSugars: 0,
      protein: 0,
    };

    for (let i = 0; i < ingredients.length; i++) {
      const ingredientText = ingredients[i];

      log(`Ingredient ${i + 1}/${ingredients.length}: "${ingredientText}"`, colors.bright + colors.yellow);

      // Ask if user wants to skip this ingredient
      const skipAnswer = await rl.question('Skip this ingredient? (y/n): ');

      if (skipAnswer.toLowerCase() === 'y') {
        logInfo('Skipped\n');
        continue;
      }

      // Extract ingredient name for searching (remove quantities)
      const searchQuery = await rl.question('Search database (or press Enter to search full text): ');
      const query = searchQuery.trim() || ingredientText;

      // Search database
      log(`Searching for: "${query}"`, colors.dim);

      const searchResults = await searchIngredients(query);

      if (searchResults.length === 0) {
        logWarning('No matches found in database');
        const addNew = await rl.question('Add this ingredient to database? (y/n): ');

        if (addNew.toLowerCase() === 'y') {
          log('Please run: pnpm tsx scripts/add-ingredient.ts', colors.cyan);
        }

        log('');
        continue;
      }

      // Display results
      log(`\nFound ${searchResults.length} matches:`, colors.green);

      searchResults.forEach((result, index) => {
        log(`${index + 1}. ${result.name} (${result.servingSize} = ${result.servingWeightGrams}g)`, colors.cyan);
        log(`   ${result.calories} cal | Fat: ${result.totalFat || 0}g | Carbs: ${result.totalCarbohydrates || 0}g | Protein: ${result.protein || 0}g`, colors.dim);
      });

      log(`${searchResults.length + 1}. Skip`, colors.dim);

      // Select ingredient
      const selection = await rl.question('\nSelect (1-' + (searchResults.length + 1) + '): ');
      const selectedIndex = parseInt(selection) - 1;

      if (selectedIndex < 0 || selectedIndex >= searchResults.length + 1) {
        logError('Invalid selection\n');
        continue;
      }

      if (selectedIndex === searchResults.length) {
        logInfo('Skipped\n');
        continue;
      }

      const selectedIngredient = searchResults[selectedIndex];

      // Get quantity used
      const quantityInput = await rl.question('Quantity used (e.g., "1 cup", "2 tbsp", "100g"): ');

      try {
        const conversion = parseAndConvertToGrams(quantityInput, selectedIngredient.name);

        logInfo(`Converted to: ${conversion.grams}g (${conversion.conversionUsed})`);

        // Calculate nutrition for this ingredient
        const ingredientNutrition = calculateIngredientNutrition(selectedIngredient, conversion.grams);

        log(`\nNutrition for ${quantityInput}:`, colors.green);
        log(`  Calories: ${ingredientNutrition.calories}`, colors.dim);
        log(`  Fat: ${ingredientNutrition.totalFat}g | Carbs: ${ingredientNutrition.totalCarbohydrates}g | Protein: ${ingredientNutrition.protein}g`, colors.dim);

        // Add to total
        totalNutrition = sumNutrition(totalNutrition, ingredientNutrition);

        // Save mapping
        const parsed = quantityInput.match(/^([\d.\/\s]+)\s*(.+)$/);
        const quantity = parsed ? parseFloat(parsed[1]) : 1;
        const unit = parsed ? parsed[2].trim() : quantityInput;

        mappings.push({
          ingredientText,
          ingredientId: selectedIngredient.id,
          quantity,
          unit,
          weightGrams: conversion.grams,
        });

        log('');

      } catch (error) {
        logError('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        log('');
        continue;
      }
    }

    // Display totals
    log('\n' + '═'.repeat(80) + '\n', colors.bright);
    logSuccess('✅ Total Nutrition (all ingredients):');
    log('');
    log(`Calories: ${totalNutrition.calories}`, colors.bright);
    log(`Total Fat: ${totalNutrition.totalFat}g`, colors.dim);
    log(`Saturated Fat: ${totalNutrition.saturatedFat}g`, colors.dim);
    log(`Trans Fat: ${totalNutrition.transFat}g`, colors.dim);
    log(`Cholesterol: ${totalNutrition.cholesterol}mg`, colors.dim);
    log(`Sodium: ${totalNutrition.sodium}mg`, colors.dim);
    log(`Total Carbohydrates: ${totalNutrition.totalCarbohydrates}g`, colors.dim);
    log(`Dietary Fiber: ${totalNutrition.dietaryFiber}g`, colors.dim);
    log(`Total Sugars: ${totalNutrition.totalSugars}g`, colors.dim);
    log(`Protein: ${totalNutrition.protein}g`, colors.dim);

    // Calculate per serving
    log('\n' + '─'.repeat(80) + '\n', colors.dim);
    logSuccess(`PER SERVING (÷ ${servings}):`);
    log('');

    const perServing = {
      calories: Math.round(totalNutrition.calories / servings),
      totalFat: Math.round((totalNutrition.totalFat / servings) * 10) / 10,
      saturatedFat: Math.round((totalNutrition.saturatedFat / servings) * 10) / 10,
      transFat: Math.round((totalNutrition.transFat / servings) * 10) / 10,
      cholesterol: Math.round(totalNutrition.cholesterol / servings),
      sodium: Math.round(totalNutrition.sodium / servings),
      totalCarbohydrates: Math.round((totalNutrition.totalCarbohydrates / servings) * 10) / 10,
      dietaryFiber: Math.round((totalNutrition.dietaryFiber / servings) * 10) / 10,
      totalSugars: Math.round((totalNutrition.totalSugars / servings) * 10) / 10,
      protein: Math.round((totalNutrition.protein / servings) * 10) / 10,
    };

    log(`Calories: ${perServing.calories}`, colors.bright + colors.green);
    log(`Total Fat: ${perServing.totalFat}g`, colors.cyan);
    log(`Saturated Fat: ${perServing.saturatedFat}g`, colors.cyan);
    log(`Trans Fat: ${perServing.transFat}g`, colors.cyan);
    log(`Cholesterol: ${perServing.cholesterol}mg`, colors.cyan);
    log(`Sodium: ${perServing.sodium}mg`, colors.cyan);
    log(`Total Carbohydrates: ${perServing.totalCarbohydrates}g`, colors.cyan);
    log(`Dietary Fiber: ${perServing.dietaryFiber}g`, colors.cyan);
    log(`Total Sugars: ${perServing.totalSugars}g`, colors.cyan);
    log(`Protein: ${perServing.protein}g`, colors.cyan);

    // Display Notion-ready format
    log('\n' + '─'.repeat(80) + '\n', colors.dim);
    log('📋 Copy to Notion:\n', colors.bright + colors.cyan);

    log(`Serving Size: 1/${servings} recipe`);
    log(`Servings Per Recipe: ${servings}`);
    log(`Calories: ${perServing.calories}`);
    log(`Total Fat: ${perServing.totalFat}`);
    log(`Saturated Fat: ${perServing.saturatedFat}`);
    log(`Trans Fat: ${perServing.transFat}`);
    log(`Cholesterol: ${perServing.cholesterol}`);
    log(`Sodium: ${perServing.sodium}`);
    log(`Total Carbohydrates: ${perServing.totalCarbohydrates}`);
    log(`Dietary Fiber: ${perServing.dietaryFiber}`);
    log(`Total Sugars: ${perServing.totalSugars}`);
    log(`Protein: ${perServing.protein}`);

    log('\n');

    // Ask to save calculation
    const saveAnswer = await rl.question('Save this calculation to database? (y/n): ');

    if (saveAnswer.toLowerCase() === 'y') {
      await saveRecipeCalculation({
        recipeId: recipe.id,
        recipeSlug: recipe.slug,
        ingredientMapping: mappings,
        calculatedNutrition: totalNutrition,
        servings,
        notes: `Calculated on ${new Date().toISOString()}`,
      });

      logSuccess('✅ Saved calculation for audit trail\n');
    }

  } catch (error) {
    logError('\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    console.error(error);
  } finally {
    rl.close();
  }
}

main();
