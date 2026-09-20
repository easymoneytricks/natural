ALTER TABLE media_assets
  ADD COLUMN usage_type VARCHAR(32) NOT NULL DEFAULT 'general' AFTER alt_text;
