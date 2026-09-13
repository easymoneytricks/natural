ALTER TABLE orders
  ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER shipping_amount,
  ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER tax_amount,
  ADD COLUMN tax_label VARCHAR(30) NULL AFTER tax_rate,
  ADD COLUMN tax_type ENUM('none','cgst_sgst','igst') NOT NULL DEFAULT 'none' AFTER tax_label,
  ADD COLUMN tax_cgst DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER tax_type,
  ADD COLUMN tax_sgst DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER tax_cgst,
  ADD COLUMN tax_igst DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER tax_sgst,
  ADD COLUMN hsn_sac VARCHAR(20) NULL AFTER tax_igst,
  ADD COLUMN seller_gstin VARCHAR(20) NULL AFTER hsn_sac;

INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('tax', 'enabled', 'false', 1),
  ('tax', 'pricing_mode', '"exclusive"', 1),
  ('tax', 'seller_state', '"Karnataka"', 1),
  ('tax', 'seller_gstin', '""', 0),
  ('tax', 'hsn_sac', '""', 1),
  ('tax', 'invoice_note', '"Prices and taxes are shown as configured at checkout."', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
