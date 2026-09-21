ALTER TABLE attributes
  ADD COLUMN is_variant_axis TINYINT(1) NOT NULL DEFAULT 1 AFTER display_type;
