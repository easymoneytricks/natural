ALTER TABLE products ADD COLUMN hsn_sac VARCHAR(20) NULL AFTER canonical_url;
ALTER TABLE order_items ADD COLUMN hsn_sac VARCHAR(20) NULL AFTER image_path;
