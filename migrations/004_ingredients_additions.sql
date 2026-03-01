-- Migration: Ingredient additions and recipe-ingredient junction
-- Description: Adds slug, category_tags, parent_id to ingredients;
--              creates recipe_ingredients junction table
-- Date: 2026-02-28

-- Add slug for future URL use and stable references
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Add category tags for ingredient-based roundup queries
-- e.g. {"protein", "dairy-alternative", "grain", "legume"}
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS category_tags TEXT[];

-- Add parent_id for ingredient hierarchy
-- e.g. "vegan mozzarella" -> parent: "vegan cheese"
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES ingredients(id) ON DELETE SET NULL;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_ingredients_slug ON ingredients(slug);
CREATE INDEX IF NOT EXISTS idx_ingredients_category_tags ON ingredients USING GIN(category_tags);
CREATE INDEX IF NOT EXISTS idx_ingredients_parent_id ON ingredients(parent_id);

-- Recipe-ingredient junction table
-- Links recipes to canonical ingredients; raw_text preserves the original display line
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id     VARCHAR(255) NOT NULL,  -- Notion page ID
  recipe_slug   VARCHAR(255) NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,

  raw_text      TEXT NOT NULL,         -- "- 2 cups shredded vegan mozzarella"
  quantity      VARCHAR(100),          -- "2 cups"
  notes         TEXT,                  -- "shredded", "diced", etc.
  display_order INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(recipe_slug, display_order)
);

-- Indexes for recipe_ingredients
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_slug ON recipe_ingredients(recipe_slug);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
