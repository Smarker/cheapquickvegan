/**
 * Recipe Nutrition Calculation Database Operations
 *
 * Functions for storing and retrieving recipe nutrition calculations
 */

import { sql } from '@vercel/postgres';
import {
  RecipeNutritionCalculation,
  RecipeNutritionCalculationData,
} from '@/types/ingredient';

/**
 * Converts a database row to a RecipeNutritionCalculation object
 */
function rowToCalculation(row: any): RecipeNutritionCalculation {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    recipeSlug: row.recipe_slug,
    ingredientMapping: row.ingredient_mapping,
    calculatedNutrition: row.calculated_nutrition,
    servings: row.servings,
    calculatedAt: new Date(row.calculated_at),
    notes: row.notes,
  };
}

/**
 * Saves a recipe nutrition calculation
 */
export async function saveRecipeCalculation(
  data: RecipeNutritionCalculationData
): Promise<RecipeNutritionCalculation> {
  const result = await sql`
    INSERT INTO recipe_nutrition_calculations (
      recipe_id,
      recipe_slug,
      ingredient_mapping,
      calculated_nutrition,
      servings,
      notes
    ) VALUES (
      ${data.recipeId},
      ${data.recipeSlug},
      ${JSON.stringify(data.ingredientMapping)},
      ${JSON.stringify(data.calculatedNutrition)},
      ${data.servings},
      ${data.notes || null}
    )
    RETURNING *
  `;

  return rowToCalculation(result.rows[0]);
}

/**
 * Gets the most recent calculation for a recipe
 */
export async function getLatestCalculation(
  recipeSlug: string
): Promise<RecipeNutritionCalculation | null> {
  const result = await sql`
    SELECT * FROM recipe_nutrition_calculations
    WHERE recipe_slug = ${recipeSlug}
    ORDER BY calculated_at DESC
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return rowToCalculation(result.rows[0]);
}

/**
 * Gets all calculations for a recipe
 */
export async function getRecipeCalculations(
  recipeSlug: string
): Promise<RecipeNutritionCalculation[]> {
  const result = await sql`
    SELECT * FROM recipe_nutrition_calculations
    WHERE recipe_slug = ${recipeSlug}
    ORDER BY calculated_at DESC
  `;

  return result.rows.map(rowToCalculation);
}

/**
 * Gets a calculation by ID
 */
export async function getCalculationById(
  id: string
): Promise<RecipeNutritionCalculation | null> {
  const result = await sql`
    SELECT * FROM recipe_nutrition_calculations
    WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return rowToCalculation(result.rows[0]);
}

/**
 * Deletes a calculation
 */
export async function deleteCalculation(id: string): Promise<void> {
  await sql`
    DELETE FROM recipe_nutrition_calculations WHERE id = ${id}
  `;
}

/**
 * Gets all calculations (with optional limit)
 */
export async function getAllCalculations(
  limit?: number
): Promise<RecipeNutritionCalculation[]> {
  const result = limit
    ? await sql`
        SELECT * FROM recipe_nutrition_calculations
        ORDER BY calculated_at DESC
        LIMIT ${limit}
      `
    : await sql`
        SELECT * FROM recipe_nutrition_calculations
        ORDER BY calculated_at DESC
      `;

  return result.rows.map(rowToCalculation);
}
