-- Migration: Create Comment System Schema
-- Description: Creates tables for comments, rate limiting, and admin configuration
-- Date: 2026-01-17

-- Comments table: stores all comments and replies
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id VARCHAR(255) NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  comment_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- NULL for replies, required for top-level
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  ownership_token VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_recipe_status ON comments(recipe_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Rate limiting table: tracks comment submissions by IP
CREATE TABLE IF NOT EXISTS comment_rate_limits (
  ip_address INET PRIMARY KEY,
  comment_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin configuration table: stores admin settings
CREATE TABLE IF NOT EXISTS admin_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin configuration
-- NOTE: Replace the password hash with your own bcrypt hash
-- Generate with: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(console.log)"
INSERT INTO admin_config (key, value) VALUES
  ('admin_password_hash', '$2a$10$rZ8eH8Y5L1zM5QxH0YqH0O4J5fH0Y5L1zM5QxH0YqH0O4J5fH0Y5L'),  -- CHANGE THIS!
  ('admin_email', 'cheapquickvegan@gmail.com'),
  ('rate_limit_max', '5'),
  ('rate_limit_window_hours', '1')
ON CONFLICT (key) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on comments table
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on admin_config table
CREATE TRIGGER update_admin_config_updated_at BEFORE UPDATE ON admin_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
