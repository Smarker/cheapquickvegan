-- Migration: Create Recipe Shares Tracking Schema
-- Description: Creates table for tracking recipe shares across social platforms
-- Date: 2026-01-31

-- Shares table: tracks when recipes are shared on different platforms
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id VARCHAR(255) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'whatsapp', 'email', 'native', 'pinterest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shares_recipe_id ON shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_recipe_platform ON shares(recipe_id, platform);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_shares_recipe_created ON shares(recipe_id, created_at DESC);
