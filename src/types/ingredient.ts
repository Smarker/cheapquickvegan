/**
 * Ingredient Types
 *
 * TypeScript interfaces for ingredient-based nutrition system
 */

/**
 * Ingredient source types
 */
export type IngredientSource = 'usda' | 'manual' | 'packaging';

/**
 * Complete ingredient with nutrition data
 */
export interface Ingredient {
  id: string;

  // Identification
  name: string;
  aliases: string[];
  usdaFdcId?: string;
  brand?: string;
  notes?: string;

  // Serving information
  servingSize: string;
  servingWeightGrams: number;

  // Nutrition per serving
  calories: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  totalSugars?: number;
  protein?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;

  // Metadata
  source: IngredientSource;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data for creating or updating an ingredient
 */
export interface IngredientData {
  // Identification
  name: string;
  aliases?: string[];
  usdaFdcId?: string;
  brand?: string;
  notes?: string;

  // Serving information
  servingSize: string;
  servingWeightGrams: number;

  // Nutrition per serving
  calories: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  totalSugars?: number;
  protein?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;

  // Metadata
  source: IngredientSource;
}

/**
 * USDA FoodData Central API types
 */

export interface USDAFood {
  fdcId: string;
  description: string;
  dataType: string;
  publicationDate: string;
  brandOwner?: string;
  ingredients?: string;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDAFoodDetails {
  fdcId: string;
  description: string;
  dataType: string;
  publicationDate: string;
  brandOwner?: string;
  ingredients?: string;
  foodNutrients: USDAFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

export interface USDASearchResult {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

/**
 * Recipe nutrition calculation types
 */

export interface RecipeIngredientMapping {
  ingredientText: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  weightGrams: number;
}

export interface CalculatedNutrition {
  calories: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbohydrates: number;
  dietaryFiber: number;
  totalSugars: number;
  protein: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
}

export interface RecipeNutritionCalculation {
  id: string;
  recipeId: string;
  recipeSlug: string;
  ingredientMapping: RecipeIngredientMapping[];
  calculatedNutrition: CalculatedNutrition;
  servings: number;
  calculatedAt: Date;
  notes?: string;
}

export interface RecipeNutritionCalculationData {
  recipeId: string;
  recipeSlug: string;
  ingredientMapping: RecipeIngredientMapping[];
  calculatedNutrition: CalculatedNutrition;
  servings: number;
  notes?: string;
}

/**
 * Nutrition info for recipes (matches what goes in Notion)
 */
export interface NutritionInfo {
  servingSize?: string;
  servingsPerRecipe?: number;
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  totalSugars?: number;
  protein?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
}

/**
 * Unit conversion types
 */

export interface ParsedQuantity {
  quantity: number;
  unit: string;
  ingredientText?: string;
}

export interface ConversionResult {
  grams: number;
  originalQuantity: number;
  originalUnit: string;
  conversionUsed: string;
}
