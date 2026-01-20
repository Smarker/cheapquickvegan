/**
 * Unit Conversion Utility
 *
 * Converts common cooking measurements to grams for nutrition calculations.
 * Includes density-based conversions for volume measurements.
 */

import { ParsedQuantity, ConversionResult } from '@/types/ingredient';

/**
 * Volume to milliliters conversions (US measurements)
 */
const VOLUME_TO_ML: Record<string, number> = {
  // Cups
  cup: 240,
  cups: 240,
  c: 240,

  // Tablespoons
  tablespoon: 15,
  tablespoons: 15,
  tbsp: 15,
  tbs: 15,
  T: 15,

  // Teaspoons
  teaspoon: 5,
  teaspoons: 5,
  tsp: 5,
  t: 5,

  // Fluid ounces
  'fluid ounce': 30,
  'fluid ounces': 30,
  'fl oz': 30,
  'fl. oz.': 30,

  // Pints, quarts, gallons
  pint: 473,
  pints: 473,
  pt: 473,
  quart: 946,
  quarts: 946,
  qt: 946,
  gallon: 3785,
  gallons: 3785,
  gal: 3785,

  // Milliliters (passthrough)
  milliliter: 1,
  milliliters: 1,
  ml: 1,
  mL: 1,

  // Liters
  liter: 1000,
  liters: 1000,
  l: 1000,
  L: 1000,
};

/**
 * Weight to grams conversions
 */
const WEIGHT_TO_GRAMS: Record<string, number> = {
  // Grams (passthrough)
  gram: 1,
  grams: 1,
  g: 1,

  // Kilograms
  kilogram: 1000,
  kilograms: 1000,
  kg: 1000,

  // Ounces
  ounce: 28.35,
  ounces: 28.35,
  oz: 28.35,
  'oz.': 28.35,

  // Pounds
  pound: 453.59,
  pounds: 453.59,
  lb: 453.59,
  lbs: 453.59,
  '#': 453.59,
};

/**
 * Approximate densities for common ingredient types (grams per mL)
 * These are rough averages for conversion purposes
 */
const INGREDIENT_DENSITIES: Record<string, number> = {
  // Water-based (density ~1.0)
  water: 1.0,
  broth: 1.0,
  stock: 1.0,
  milk: 1.03,
  yogurt: 1.04,
  'soy milk': 1.03,
  'almond milk': 1.03,
  'oat milk': 1.04,

  // Oils (density ~0.9)
  oil: 0.92,
  'olive oil': 0.92,
  'coconut oil': 0.92,
  'vegetable oil': 0.92,
  'canola oil': 0.92,

  // Sauces and liquids
  'soy sauce': 1.15,
  vinegar: 1.01,
  'lemon juice': 1.03,
  'lime juice': 1.03,

  // Syrups and thick liquids
  'maple syrup': 1.37,
  'agave nectar': 1.38,
  molasses: 1.4,
  tahini: 1.4,
  'peanut butter': 1.1,
  'almond butter': 1.06,

  // Flours and powders
  flour: 0.53,
  'all-purpose flour': 0.53,
  'whole wheat flour': 0.53,
  'almond flour': 0.48,
  'coconut flour': 0.48,
  'nutritional yeast': 0.3,

  // Sugars
  sugar: 0.85,
  'brown sugar': 0.92,
  'powdered sugar': 0.5,

  // Grains and legumes (dry)
  rice: 0.8,
  quinoa: 0.75,
  oats: 0.35,
  lentils: 0.85,
  chickpeas: 0.85,
  beans: 0.85,

  // Nuts and seeds
  nuts: 0.55,
  almonds: 0.55,
  walnuts: 0.5,
  cashews: 0.6,
  'chia seeds': 0.6,
  'flax seeds': 0.65,
  'hemp seeds': 0.6,

  // Vegetables (chopped/diced)
  onion: 0.55,
  garlic: 0.6,
  tomato: 0.6,
  cucumber: 0.5,
  spinach: 0.16,
  kale: 0.18,

  // Fruits
  banana: 0.6,
  apple: 0.55,
  berries: 0.6,

  // Default for unknown ingredients
  default: 0.8,
};

/**
 * Parses a quantity string like "1 cup", "2 tbsp", "250g"
 */
export function parseQuantity(input: string): ParsedQuantity {
  // Clean up the input
  const cleaned = input.trim().toLowerCase();

  // Try to match pattern: number + unit
  const match = cleaned.match(/^([\d.\/\s]+)\s*([a-zA-Z.]+)?$/);

  if (!match) {
    throw new Error(`Unable to parse quantity: ${input}`);
  }

  // Parse the quantity (handle fractions like "1 1/2" or "1/2")
  const quantityStr = match[1].trim();
  const quantity = parseFraction(quantityStr);

  // Extract unit (or empty string)
  const unit = match[2]?.trim() || '';

  return { quantity, unit, ingredientText: input };
}

/**
 * Parses a fraction string like "1/2", "1 1/2", "0.5", "2"
 */
function parseFraction(str: string): number {
  const cleaned = str.trim();

  // Check for mixed fraction: "1 1/2"
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + numerator / denominator;
  }

  // Check for simple fraction: "1/2"
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    return numerator / denominator;
  }

  // Otherwise parse as decimal
  return parseFloat(cleaned);
}

/**
 * Gets the density for an ingredient (grams per mL)
 */
function getIngredientDensity(ingredientName: string): number {
  const lowerName = ingredientName.toLowerCase();

  // Check for exact matches
  if (INGREDIENT_DENSITIES[lowerName]) {
    return INGREDIENT_DENSITIES[lowerName];
  }

  // Check for partial matches
  for (const [key, density] of Object.entries(INGREDIENT_DENSITIES)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return density;
    }
  }

  // Return default density
  return INGREDIENT_DENSITIES.default;
}

/**
 * Converts a volume measurement to grams using ingredient density
 */
function volumeToGrams(ml: number, ingredientName: string): number {
  const density = getIngredientDensity(ingredientName);
  return Math.round(ml * density * 10) / 10;
}

/**
 * Converts a quantity with unit to grams
 *
 * @param quantity - The numeric quantity
 * @param unit - The unit (cup, tbsp, g, oz, etc.)
 * @param ingredientName - The ingredient name (for density-based conversions)
 * @returns The weight in grams
 */
export function convertToGrams(
  quantity: number,
  unit: string,
  ingredientName: string = ''
): ConversionResult {
  const lowerUnit = unit.toLowerCase().trim();

  // If no unit provided, assume grams
  if (!lowerUnit) {
    return {
      grams: quantity,
      originalQuantity: quantity,
      originalUnit: 'g',
      conversionUsed: 'assumed grams',
    };
  }

  // Check if it's a weight unit (direct conversion)
  if (WEIGHT_TO_GRAMS[lowerUnit]) {
    const grams = Math.round(quantity * WEIGHT_TO_GRAMS[lowerUnit] * 10) / 10;
    return {
      grams,
      originalQuantity: quantity,
      originalUnit: unit,
      conversionUsed: `weight conversion (${WEIGHT_TO_GRAMS[lowerUnit]}g per ${unit})`,
    };
  }

  // Check if it's a volume unit (density-based conversion)
  if (VOLUME_TO_ML[lowerUnit]) {
    const ml = quantity * VOLUME_TO_ML[lowerUnit];
    const grams = volumeToGrams(ml, ingredientName);
    const density = getIngredientDensity(ingredientName);
    return {
      grams,
      originalQuantity: quantity,
      originalUnit: unit,
      conversionUsed: `volume conversion (${VOLUME_TO_ML[lowerUnit]}mL per ${unit}, ${density}g/mL density)`,
    };
  }

  // Unknown unit - throw error
  throw new Error(`Unknown unit: ${unit}. Please use standard cooking measurements (cup, tbsp, g, oz, etc.)`);
}

/**
 * Parses and converts a quantity string to grams
 *
 * @param input - String like "1 cup", "2 tbsp", "250g"
 * @param ingredientName - The ingredient name (for density-based conversions)
 * @returns Conversion result with grams and details
 */
export function parseAndConvertToGrams(
  input: string,
  ingredientName: string = ''
): ConversionResult {
  const parsed = parseQuantity(input);
  return convertToGrams(parsed.quantity, parsed.unit, ingredientName);
}

/**
 * Formats grams to a friendly display string
 */
export function formatGrams(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`;
  }
  return `${grams.toFixed(1)}g`;
}

/**
 * Estimates grams from count-based quantities (e.g., "2 cloves garlic")
 * This is very approximate and should be used as a fallback
 */
export function estimateGramsFromCount(
  count: number,
  itemType: string
): ConversionResult {
  const estimates: Record<string, number> = {
    // Garlic
    'clove': 3,
    'cloves': 3,
    'garlic clove': 3,
    'garlic cloves': 3,

    // Onions
    'small onion': 100,
    'medium onion': 150,
    'large onion': 200,
    'onion': 150, // default to medium

    // Tomatoes
    'small tomato': 100,
    'medium tomato': 150,
    'large tomato': 200,
    'tomato': 150, // default to medium

    // Bananas
    'small banana': 100,
    'medium banana': 120,
    'large banana': 140,
    'banana': 120, // default to medium

    // Potatoes
    'small potato': 150,
    'medium potato': 200,
    'large potato': 300,
    'potato': 200, // default to medium
  };

  const lowerType = itemType.toLowerCase().trim();
  const gramsPerItem = estimates[lowerType] || 100; // default estimate
  const grams = count * gramsPerItem;

  return {
    grams,
    originalQuantity: count,
    originalUnit: itemType,
    conversionUsed: `estimated ${gramsPerItem}g per ${itemType} (approximate!)`,
  };
}
