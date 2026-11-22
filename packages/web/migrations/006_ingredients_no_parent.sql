-- Add a flag to mark ingredients that have been reviewed and confirmed to have no parent.
-- This lets the admin UI distinguish "not yet reviewed" from "reviewed, no parent needed".
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS no_parent boolean NOT NULL DEFAULT false;
