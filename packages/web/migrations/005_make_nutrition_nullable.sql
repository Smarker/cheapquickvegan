-- Migration: Make nutrition columns nullable
-- Description: Auto-extracted ingredients have no nutrition data yet;
--              these columns are filled later via USDA or manual entry
-- Date: 2026-02-28

ALTER TABLE ingredients
  ALTER COLUMN serving_size DROP NOT NULL,
  ALTER COLUMN serving_weight_grams DROP NOT NULL,
  ALTER COLUMN calories DROP NOT NULL;
