-- Migration: Create Ingredient-Based Nutrition System Schema
-- Description: Creates tables for ingredients and recipe nutrition calculations
-- Date: 2026-01-19

-- Ingredients table: stores nutrition data for reusable ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name VARCHAR(255) UNIQUE NOT NULL,
  aliases TEXT[], -- e.g., ["chickpeas", "garbanzo beans"]
  usda_fdc_id VARCHAR(50), -- USDA FoodData Central ID
  brand VARCHAR(100), -- Optional: "Silk", "Bob's Red Mill"
  notes TEXT, -- e.g., "Use raw weight, not cooked"

  -- Serving information
  serving_size VARCHAR(100) NOT NULL, -- "1 cup" or "100g"
  serving_weight_grams DECIMAL(10,2) NOT NULL, -- 240.0

  -- Nutrition per serving
  calories DECIMAL(10,2) NOT NULL,
  total_fat DECIMAL(10,2), -- grams
  saturated_fat DECIMAL(10,2),
  trans_fat DECIMAL(10,2),
  cholesterol DECIMAL(10,2), -- mg
  sodium DECIMAL(10,2), -- mg
  total_carbohydrates DECIMAL(10,2), -- grams
  dietary_fiber DECIMAL(10,2),
  total_sugars DECIMAL(10,2),
  protein DECIMAL(10,2), -- grams
  vitamin_d DECIMAL(10,2), -- mcg
  calcium DECIMAL(10,2), -- mg
  iron DECIMAL(10,2), -- mg
  potassium DECIMAL(10,2), -- mg

  -- Metadata
  source VARCHAR(50) NOT NULL, -- 'usda', 'manual', 'packaging'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_aliases ON ingredients USING GIN(aliases);
CREATE INDEX IF NOT EXISTS idx_ingredients_usda_fdc_id ON ingredients(usda_fdc_id);

-- Recipe nutrition calculations table: audit trail for recipe calculations
CREATE TABLE IF NOT EXISTS recipe_nutrition_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id VARCHAR(255) NOT NULL,
  recipe_slug VARCHAR(255) NOT NULL,

  -- Calculation details
  ingredient_mapping JSONB NOT NULL, -- { "1 cup chickpeas": "ingredient-uuid" }
  calculated_nutrition JSONB NOT NULL,
  servings INTEGER NOT NULL,

  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Indexes for recipe calculations
CREATE INDEX IF NOT EXISTS idx_recipe_calculations_slug ON recipe_nutrition_calculations(recipe_slug);
CREATE INDEX IF NOT EXISTS idx_recipe_calculations_recipe_id ON recipe_nutrition_calculations(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_calculations_calculated_at ON recipe_nutrition_calculations(calculated_at DESC);

-- Trigger to update updated_at on ingredients table
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
