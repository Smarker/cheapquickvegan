/**
 * USDA FoodData Central API Client
 *
 * Fetches ingredient nutrition data from the USDA FoodData Central database.
 * API Documentation: https://fdc.nal.usda.gov/api-guide.html
 *
 * Note: The API is free and does not require an API key for basic usage,
 * but rate limits may apply. Optional API key can be obtained from:
 * https://fdc.nal.usda.gov/api-key-signup.html
 */

import {
  USDAFood,
  USDAFoodDetails,
  USDASearchResult,
  IngredientData,
} from '@/types/ingredient';

const USDA_API_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_API_KEY || '';

/**
 * Searches the USDA FoodData Central database
 */
export async function searchFoods(
  query: string,
  options?: {
    pageSize?: number;
    pageNumber?: number;
    dataType?: string[]; // e.g., ['Foundation', 'SR Legacy', 'Branded']
  }
): Promise<USDASearchResult> {
  const pageSize = options?.pageSize || 10;
  const pageNumber = options?.pageNumber || 1;
  const dataType = options?.dataType || ['Foundation', 'SR Legacy'];

  const params = new URLSearchParams({
    query,
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
  });

  if (dataType.length > 0) {
    dataType.forEach((type) => params.append('dataType', type));
  }

  if (USDA_API_KEY) {
    params.append('api_key', USDA_API_KEY);
  }

  const url = `${USDA_API_BASE_URL}/foods/search?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      totalHits: data.totalHits || 0,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1,
      foods: data.foods || [],
    };
  } catch (error) {
    console.error('Error searching USDA database:', error);
    throw new Error('Failed to search USDA database. Please try again.');
  }
}

/**
 * Gets detailed nutrition information for a specific food item
 */
export async function getFoodDetails(fdcId: string): Promise<USDAFoodDetails> {
  const params = new URLSearchParams();

  if (USDA_API_KEY) {
    params.append('api_key', USDA_API_KEY);
  }

  const url = `${USDA_API_BASE_URL}/food/${fdcId}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as USDAFoodDetails;
  } catch (error) {
    console.error('Error fetching food details:', error);
    throw new Error('Failed to fetch food details from USDA. Please try again.');
  }
}

/**
 * USDA nutrient number mappings
 * Based on USDA nutrient database: https://fdc.nal.usda.gov/
 */
const NUTRIENT_MAPPINGS: Record<string, string> = {
  '208': 'calories', // Energy (kcal)
  '204': 'totalFat', // Total lipid (fat)
  '606': 'saturatedFat', // Fatty acids, total saturated
  '605': 'transFat', // Fatty acids, total trans
  '601': 'cholesterol', // Cholesterol
  '307': 'sodium', // Sodium
  '205': 'totalCarbohydrates', // Carbohydrate, by difference
  '291': 'dietaryFiber', // Fiber, total dietary
  '269': 'totalSugars', // Sugars, total including NLEA
  '203': 'protein', // Protein
  '324': 'vitaminD', // Vitamin D (D2 + D3)
  '301': 'calcium', // Calcium, Ca
  '303': 'iron', // Iron, Fe
  '306': 'potassium', // Potassium, K
};

/**
 * Extracts nutrition value from USDA food details
 */
function getNutrientValue(
  foodDetails: USDAFoodDetails,
  nutrientNumber: string
): number | undefined {
  const nutrient = foodDetails.foodNutrients.find(
    (n) => n.nutrientNumber === nutrientNumber
  );
  return nutrient ? nutrient.value : undefined;
}

/**
 * Converts USDA food details to our IngredientData format
 * Note: USDA nutrition is per 100g, so serving size defaults to 100g
 */
export function parseUSDAToIngredient(
  usdaFood: USDAFoodDetails,
  options?: {
    servingSize?: string;
    servingWeightGrams?: number;
    brand?: string;
    notes?: string;
    aliases?: string[];
  }
): IngredientData {
  // Extract nutrition per 100g from USDA data
  const per100gNutrition = {
    calories: getNutrientValue(usdaFood, '208') || 0,
    totalFat: getNutrientValue(usdaFood, '204'),
    saturatedFat: getNutrientValue(usdaFood, '606'),
    transFat: getNutrientValue(usdaFood, '605'),
    cholesterol: getNutrientValue(usdaFood, '601'),
    sodium: getNutrientValue(usdaFood, '307'),
    totalCarbohydrates: getNutrientValue(usdaFood, '205'),
    dietaryFiber: getNutrientValue(usdaFood, '291'),
    totalSugars: getNutrientValue(usdaFood, '269'),
    protein: getNutrientValue(usdaFood, '203'),
    vitaminD: getNutrientValue(usdaFood, '324'),
    calcium: getNutrientValue(usdaFood, '301'),
    iron: getNutrientValue(usdaFood, '303'),
    potassium: getNutrientValue(usdaFood, '306'),
  };

  // If custom serving size is provided, scale the nutrition
  const servingWeightGrams = options?.servingWeightGrams || 100;
  const scaleFactor = servingWeightGrams / 100;

  const scaledNutrition = {
    calories: Math.round(per100gNutrition.calories * scaleFactor),
    totalFat: per100gNutrition.totalFat
      ? Math.round(per100gNutrition.totalFat * scaleFactor * 10) / 10
      : undefined,
    saturatedFat: per100gNutrition.saturatedFat
      ? Math.round(per100gNutrition.saturatedFat * scaleFactor * 10) / 10
      : undefined,
    transFat: per100gNutrition.transFat
      ? Math.round(per100gNutrition.transFat * scaleFactor * 10) / 10
      : undefined,
    cholesterol: per100gNutrition.cholesterol
      ? Math.round(per100gNutrition.cholesterol * scaleFactor)
      : undefined,
    sodium: per100gNutrition.sodium
      ? Math.round(per100gNutrition.sodium * scaleFactor)
      : undefined,
    totalCarbohydrates: per100gNutrition.totalCarbohydrates
      ? Math.round(per100gNutrition.totalCarbohydrates * scaleFactor * 10) / 10
      : undefined,
    dietaryFiber: per100gNutrition.dietaryFiber
      ? Math.round(per100gNutrition.dietaryFiber * scaleFactor * 10) / 10
      : undefined,
    totalSugars: per100gNutrition.totalSugars
      ? Math.round(per100gNutrition.totalSugars * scaleFactor * 10) / 10
      : undefined,
    protein: per100gNutrition.protein
      ? Math.round(per100gNutrition.protein * scaleFactor * 10) / 10
      : undefined,
    vitaminD: per100gNutrition.vitaminD
      ? Math.round(per100gNutrition.vitaminD * scaleFactor * 10) / 10
      : undefined,
    calcium: per100gNutrition.calcium
      ? Math.round(per100gNutrition.calcium * scaleFactor)
      : undefined,
    iron: per100gNutrition.iron
      ? Math.round(per100gNutrition.iron * scaleFactor * 10) / 10
      : undefined,
    potassium: per100gNutrition.potassium
      ? Math.round(per100gNutrition.potassium * scaleFactor)
      : undefined,
  };

  return {
    name: usdaFood.description.toLowerCase(),
    aliases: options?.aliases || [],
    usdaFdcId: usdaFood.fdcId,
    brand: options?.brand || usdaFood.brandOwner,
    notes: options?.notes,
    servingSize: options?.servingSize || '100g',
    servingWeightGrams,
    ...scaledNutrition,
    source: 'usda',
  };
}

/**
 * Helper function to format USDA food for display
 */
export function formatUSDAFood(food: USDAFood): string {
  const brand = food.brandOwner ? ` (${food.brandOwner})` : '';
  return `${food.description}${brand} [FDC: ${food.fdcId}]`;
}

/**
 * Helper function to format nutrition summary
 */
export function formatNutritionSummary(
  usdaFood: USDAFoodDetails,
  per100g: boolean = true
): string {
  const calories = getNutrientValue(usdaFood, '208') || 0;
  const fat = getNutrientValue(usdaFood, '204') || 0;
  const carbs = getNutrientValue(usdaFood, '205') || 0;
  const fiber = getNutrientValue(usdaFood, '291') || 0;
  const protein = getNutrientValue(usdaFood, '203') || 0;

  const unit = per100g ? 'per 100g' : '';

  return `${unit}: ${Math.round(calories)} cal, ${fat.toFixed(1)}g fat, ${carbs.toFixed(1)}g carbs, ${fiber.toFixed(1)}g fiber, ${protein.toFixed(1)}g protein`;
}
