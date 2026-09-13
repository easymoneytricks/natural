ALTER TABLE brands
  ADD COLUMN seo_keywords VARCHAR(500) NULL AFTER seo_description,
  ADD COLUMN canonical_url VARCHAR(500) NULL AFTER seo_keywords;

ALTER TABLE categories
  ADD COLUMN seo_keywords VARCHAR(500) NULL AFTER seo_description,
  ADD COLUMN canonical_url VARCHAR(500) NULL AFTER seo_keywords;

ALTER TABLE products
  ADD COLUMN seo_keywords VARCHAR(500) NULL AFTER seo_description,
  ADD COLUMN canonical_url VARCHAR(500) NULL AFTER seo_keywords;
