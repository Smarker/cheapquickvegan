/**
 * Ingredient Database Operations
 *
 * Functions for interacting with the ingredients table in the database.
 */

import { sql } from '@vercel/postgres';
import {
  Ingredient,
  IngredientData,
  RecipeNutritionCalculation,
  RecipeNutritionCalculationData,
} from '@/types/ingredient';

/**
 * Converts a database row to an Ingredient object
 */
function rowToIngredient(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    aliases: row.aliases || [],
    usdaFdcId: row.usda_fdc_id,
    brand: row.brand,
    notes: row.notes,
    servingSize: row.serving_size,
    servingWeightGrams: parseFloat(row.serving_weight_grams),
    calories: parseFloat(row.calories),
    totalFat: row.total_fat ? parseFloat(row.total_fat) : undefined,
    saturatedFat: row.saturated_fat ? parseFloat(row.saturated_fat) : undefined,
    transFat: row.trans_fat ? parseFloat(row.trans_fat) : undefined,
    cholesterol: row.cholesterol ? parseFloat(row.cholesterol) : undefined,
    sodium: row.sodium ? parseFloat(row.sodium) : undefined,
    totalCarbohydrates: row.total_carbohydrates ? parseFloat(row.total_carbohydrates) : undefined,
    dietaryFiber: row.dietary_fiber ? parseFloat(row.dietary_fiber) : undefined,
    totalSugars: row.total_sugars ? parseFloat(row.total_sugars) : undefined,
    protein: row.protein ? parseFloat(row.protein) : undefined,
    vitaminD: row.vitamin_d ? parseFloat(row.vitamin_d) : undefined,
    calcium: row.calcium ? parseFloat(row.calcium) : undefined,
    iron: row.iron ? parseFloat(row.iron) : undefined,
    potassium: row.potassium ? parseFloat(row.potassium) : undefined,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Creates a new ingredient in the database
 */
export async function addIngredient(data: IngredientData): Promise<Ingredient> {
  const result = await sql`
    INSERT INTO ingredients (
      name,
      aliases,
      usda_fdc_id,
      brand,
      notes,
      serving_size,
      serving_weight_grams,
      calories,
      total_fat,
      saturated_fat,
      trans_fat,
      cholesterol,
      sodium,
      total_carbohydrates,
      dietary_fiber,
      total_sugars,
      protein,
      vitamin_d,
      calcium,
      iron,
      potassium,
      source
    ) VALUES (
      ${data.name},
      ${data.aliases || []},
      ${data.usdaFdcId || null},
      ${data.brand || null},
      ${data.notes || null},
      ${data.servingSize},
      ${data.servingWeightGrams},
      ${data.calories},
      ${data.totalFat || null},
      ${data.saturatedFat || null},
      ${data.transFat || null},
      ${data.cholesterol || null},
      ${data.sodium || null},
      ${data.totalCarbohydrates || null},
      ${data.dietaryFiber || null},
      ${data.totalSugars || null},
      ${data.protein || null},
      ${data.vitaminD || null},
      ${data.calcium || null},
      ${data.iron || null},
      ${data.potassium || null},
      ${data.source}
    )
    ON CONFLICT (name) DO UPDATE SET
      aliases = EXCLUDED.aliases,
      usda_fdc_id = EXCLUDED.usda_fdc_id,
      brand = EXCLUDED.brand,
      notes = EXCLUDED.notes,
      serving_size = EXCLUDED.serving_size,
      serving_weight_grams = EXCLUDED.serving_weight_grams,
      calories = EXCLUDED.calories,
      total_fat = EXCLUDED.total_fat,
      saturated_fat = EXCLUDED.saturated_fat,
      trans_fat = EXCLUDED.trans_fat,
      cholesterol = EXCLUDED.cholesterol,
      sodium = EXCLUDED.sodium,
      total_carbohydrates = EXCLUDED.total_carbohydrates,
      dietary_fiber = EXCLUDED.dietary_fiber,
      total_sugars = EXCLUDED.total_sugars,
      protein = EXCLUDED.protein,
      vitamin_d = EXCLUDED.vitamin_d,
      calcium = EXCLUDED.calcium,
      iron = EXCLUDED.iron,
      potassium = EXCLUDED.potassium,
      source = EXCLUDED.source,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return rowToIngredient(result.rows[0]);
}

/**
 * Gets an ingredient by ID or name
 */
export async function getIngredient(nameOrId: string): Promise<Ingredient | null> {
  // Try to find by ID first (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(nameOrId)) {
    const result = await sql`
      SELECT * FROM ingredients WHERE id = ${nameOrId}
    `;

    if (result.rows.length > 0) {
      return rowToIngredient(result.rows[0]);
    }
  }

  // Try to find by name (case-insensitive)
  const result = await sql`
    SELECT * FROM ingredients
    WHERE LOWER(name) = LOWER(${nameOrId})
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return rowToIngredient(result.rows[0]);
}

/**
 * Searches ingredients by name or aliases
 */
export async function searchIngredients(query: string): Promise<Ingredient[]> {
  const searchPattern = `%${query.toLowerCase()}%`;

  const result = await sql`
    SELECT * FROM ingredients
    WHERE LOWER(name) LIKE ${searchPattern}
      OR EXISTS (
        SELECT 1 FROM unnest(aliases) AS alias
        WHERE LOWER(alias) LIKE ${searchPattern}
      )
    ORDER BY
      CASE
        WHEN LOWER(name) = LOWER(${query}) THEN 1
        WHEN LOWER(name) LIKE LOWER(${query} || '%') THEN 2
        ELSE 3
      END,
      name ASC
    LIMIT 20
  `;

  return result.rows.map(rowToIngredient);
}

/**
 * Lists all ingredients with optional pagination
 */
export async function listAllIngredients(options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}): Promise<Ingredient[]> {
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;
  const sortBy = options?.sortBy || 'name';
  const sortOrder = options?.sortOrder || 'asc';

  // Note: We can't use template literals for column names in sql tagged templates
  // So we'll build the query string carefully
  let orderByClause = 'name ASC';
  if (sortBy === 'created_at') {
    orderByClause = sortOrder === 'desc' ? 'created_at DESC' : 'created_at ASC';
  } else if (sortBy === 'updated_at') {
    orderByClause = sortOrder === 'desc' ? 'updated_at DESC' : 'updated_at ASC';
  } else {
    orderByClause = sortOrder === 'desc' ? 'name DESC' : 'name ASC';
  }

  const result = await sql.query(
    `SELECT * FROM ingredients ORDER BY ${orderByClause} LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows.map(rowToIngredient);
}

/**
 * Updates an existing ingredient
 */
export async function updateIngredient(
  id: string,
  data: Partial<IngredientData>
): Promise<Ingredient> {
  // Build the SET clause dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.aliases !== undefined) {
    updates.push(`aliases = $${paramIndex++}`);
    values.push(data.aliases);
  }
  if (data.usdaFdcId !== undefined) {
    updates.push(`usda_fdc_id = $${paramIndex++}`);
    values.push(data.usdaFdcId);
  }
  if (data.brand !== undefined) {
    updates.push(`brand = $${paramIndex++}`);
    values.push(data.brand);
  }
  if (data.notes !== undefined) {
    updates.push(`notes = $${paramIndex++}`);
    values.push(data.notes);
  }
  if (data.servingSize !== undefined) {
    updates.push(`serving_size = $${paramIndex++}`);
    values.push(data.servingSize);
  }
  if (data.servingWeightGrams !== undefined) {
    updates.push(`serving_weight_grams = $${paramIndex++}`);
    values.push(data.servingWeightGrams);
  }
  if (data.calories !== undefined) {
    updates.push(`calories = $${paramIndex++}`);
    values.push(data.calories);
  }
  if (data.totalFat !== undefined) {
    updates.push(`total_fat = $${paramIndex++}`);
    values.push(data.totalFat);
  }
  if (data.saturatedFat !== undefined) {
    updates.push(`saturated_fat = $${paramIndex++}`);
    values.push(data.saturatedFat);
  }
  if (data.transFat !== undefined) {
    updates.push(`trans_fat = $${paramIndex++}`);
    values.push(data.transFat);
  }
  if (data.cholesterol !== undefined) {
    updates.push(`cholesterol = $${paramIndex++}`);
    values.push(data.cholesterol);
  }
  if (data.sodium !== undefined) {
    updates.push(`sodium = $${paramIndex++}`);
    values.push(data.sodium);
  }
  if (data.totalCarbohydrates !== undefined) {
    updates.push(`total_carbohydrates = $${paramIndex++}`);
    values.push(data.totalCarbohydrates);
  }
  if (data.dietaryFiber !== undefined) {
    updates.push(`dietary_fiber = $${paramIndex++}`);
    values.push(data.dietaryFiber);
  }
  if (data.totalSugars !== undefined) {
    updates.push(`total_sugars = $${paramIndex++}`);
    values.push(data.totalSugars);
  }
  if (data.protein !== undefined) {
    updates.push(`protein = $${paramIndex++}`);
    values.push(data.protein);
  }
  if (data.vitaminD !== undefined) {
    updates.push(`vitamin_d = $${paramIndex++}`);
    values.push(data.vitaminD);
  }
  if (data.calcium !== undefined) {
    updates.push(`calcium = $${paramIndex++}`);
    values.push(data.calcium);
  }
  if (data.iron !== undefined) {
    updates.push(`iron = $${paramIndex++}`);
    values.push(data.iron);
  }
  if (data.potassium !== undefined) {
    updates.push(`potassium = $${paramIndex++}`);
    values.push(data.potassium);
  }
  if (data.source !== undefined) {
    updates.push(`source = $${paramIndex++}`);
    values.push(data.source);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE ingredients
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await sql.query(query, values);

  if (result.rows.length === 0) {
    throw new Error('Ingredient not found');
  }

  return rowToIngredient(result.rows[0]);
}

/**
 * Deletes an ingredient
 */
export async function deleteIngredient(id: string): Promise<void> {
  await sql`
    DELETE FROM ingredients WHERE id = ${id}
  `;
}

/**
 * Gets the total count of ingredients
 */
export async function getIngredientCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM ingredients
  `;

  return parseInt(result.rows[0].count);
}
