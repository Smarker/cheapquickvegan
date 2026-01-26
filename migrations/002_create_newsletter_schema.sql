-- Migration: Create Newsletter Subscription Schema
-- Description: Creates tables for newsletter subscriptions and rate limiting
-- Date: 2026-01-26

-- Newsletter subscriptions table: stores email subscribers with double opt-in verification
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'active', 'unsubscribed'
  verification_token VARCHAR(500),
  subscribed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_verification_token ON newsletter_subscriptions(verification_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at DESC);

-- Rate limiting table: tracks newsletter signup attempts by IP (3 per 24 hours)
CREATE TABLE IF NOT EXISTS newsletter_rate_limits (
  ip_address INET PRIMARY KEY,
  attempt_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_newsletter_rate_limit_window ON newsletter_rate_limits(window_start);

-- Trigger to update updated_at on newsletter_subscriptions table
CREATE TRIGGER update_newsletter_subscriptions_updated_at BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
