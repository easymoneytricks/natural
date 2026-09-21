-- NaturalBeauty consolidated migrations 075 through 083
-- Run this file once on a database where migrations 075-083 have not been applied.

INSERT IGNORE INTO admin_permissions (name, slug, description) VALUES
('Products · view', 'catalog.products.view', 'View product records and details.'),
('Products · create', 'catalog.products.create', 'Create new products.'),
('Products · update', 'catalog.products.update', 'Edit product content, pricing and inventory links.'),
('Products · delete', 'catalog.products.delete', 'Archive or permanently remove products.'),
('Products · export', 'catalog.products.export', 'Export product data.'),
('Categories · view', 'catalog.categories.view', 'View category records and hierarchy.'),
('Categories · create', 'catalog.categories.create', 'Create categories.'),
('Categories · update', 'catalog.categories.update', 'Edit category details and images.'),
('Categories · delete', 'catalog.categories.delete', 'Archive or permanently remove categories.'),
('Brands · view', 'catalog.brands.view', 'View brand records.'),
('Brands · create', 'catalog.brands.create', 'Create brands.'),
('Brands · update', 'catalog.brands.update', 'Edit brand details and logos.'),
('Brands · delete', 'catalog.brands.delete', 'Archive or permanently remove brands.'),
('Media · view', 'catalog.media.view', 'View the media library.'),
('Media · upload', 'catalog.media.upload', 'Upload media assets.'),
('Media · update', 'catalog.media.update', 'Edit media metadata.'),
('Media · delete', 'catalog.media.delete', 'Delete media assets.'),
('Orders · view', 'orders.view.detail', 'View order lists, details and invoices.'),
('Orders · update', 'orders.update', 'Update order status and shipping details.'),
('Orders · returns', 'orders.returns.manage', 'Process returns and refunds.'),
('Orders · export', 'orders.export', 'Export order data.'),
('Customers · view', 'customers.view.detail', 'View customer profiles and history.'),
('Customers · update', 'customers.update', 'Update customer status and details.'),
('Customers · delete', 'customers.delete', 'Remove customer records.'),
('Inventory · view', 'inventory.view.detail', 'View stock levels and movements.'),
('Inventory · adjust', 'inventory.adjust', 'Adjust or correct stock quantities.'),
('Inventory · reorder', 'inventory.reorder.update', 'Update reorder levels.'),
('Promotions · view', 'promotions.view.detail', 'View coupons and gift cards.'),
('Promotions · create', 'promotions.create', 'Create coupons and gift cards.'),
('Promotions · update', 'promotions.update', 'Update promotion status and values.'),
('Settings · view', 'settings.view.detail', 'View store settings.'),
('Settings · update', 'settings.update', 'Change store settings.'),
('Content · view', 'content.view.detail', 'View pages and homepage content.'),
('Content · update', 'content.update', 'Edit pages and homepage content.'),
('Reviews · view', 'reviews.view.detail', 'View customer reviews.'),
('Reviews · moderate', 'reviews.moderate', 'Approve or hide customer reviews.'),
('Reports · view', 'reports.view', 'View reports and analytics.'),
('Contact · view', 'contact.view', 'View contact submissions.'),
('Contact · update', 'contact.update', 'Update contact submission status.'),
('Rewards · view', 'rewards.view', 'View rewards balances and configuration.'),
('Rewards · update', 'rewards.update', 'Update rewards configuration.'),
('Coupons - view', 'promotions.coupons.view', 'View coupon codes and usage.'),
('Coupons - create', 'promotions.coupons.create', 'Create coupon codes.'),
('Coupons - update', 'promotions.coupons.update', 'Edit or disable coupon codes.'),
('Coupons - delete', 'promotions.coupons.delete', 'Remove coupon codes.'),
('Gift cards - view', 'promotions.gift-cards.view', 'View gift cards and balances.'),
('Gift cards - create', 'promotions.gift-cards.create', 'Issue gift cards.'),
('Gift cards - update', 'promotions.gift-cards.update', 'Update gift card status.'),
('Abandoned checkouts - view', 'orders.abandoned.view', 'View abandoned checkout records.'),
('Abandoned checkouts - manage', 'orders.abandoned.manage', 'Recover or manage abandoned checkouts.'),
('Abandoned checkouts - export', 'orders.abandoned.export', 'Export abandoned checkout data.'),
('Useful info - view', 'reports.useful-info.view', 'View useful business information.'),
('Users - view', 'staff.users.view', 'View admin users.'),
('Users - create', 'staff.users.create', 'Create admin users.'),
('Users - update', 'staff.users.update', 'Edit admin users and status.'),
('Users - delete', 'staff.users.delete', 'Remove admin users.'),
('Roles - view', 'staff.roles.view', 'View admin roles.'),
('Roles - create', 'staff.roles.create', 'Create admin roles.'),
('Roles - update', 'staff.roles.update', 'Edit roles and assignments.'),
('Roles - delete', 'staff.roles.delete', 'Remove admin roles.'),
('Permission matrix - view', 'staff.permissions.view', 'View the permission matrix.'),
('Permission matrix - update', 'staff.permissions.update', 'Change role permissions.'),
('General settings - view', 'settings.general.view', 'View normal store settings.'),
('General settings - update', 'settings.general.update', 'Update normal store settings.'),
('Content settings - view', 'settings.content.view', 'View homepage and content settings.'),
('Content settings - update', 'settings.content.update', 'Update homepage and content settings.'),
('Commerce settings - view', 'settings.commerce.view', 'View commerce settings.'),
('Commerce settings - update', 'settings.commerce.update', 'Update commerce settings.'),
('Critical settings - manage', 'settings.critical.manage', 'Change availability, checkout and other critical controls.'),
('Security settings - view', 'settings.security.view', 'View security configuration.'),
('Security settings - update', 'settings.security.update', 'Update security configuration.');

INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r CROSS JOIN admin_permissions p
WHERE r.slug = 'super-admin' AND p.slug LIKE '%.%';

INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r CROSS JOIN admin_permissions p
WHERE r.slug = 'super-admin' AND p.slug IN (
  'promotions.coupons.view','promotions.coupons.create','promotions.coupons.update','promotions.coupons.delete',
  'promotions.gift-cards.view','promotions.gift-cards.create','promotions.gift-cards.update',
  'orders.abandoned.view','orders.abandoned.manage','orders.abandoned.export','reports.useful-info.view',
  'staff.users.view','staff.users.create','staff.users.update','staff.users.delete',
  'staff.roles.view','staff.roles.create','staff.roles.update','staff.roles.delete',
  'staff.permissions.view','staff.permissions.update','settings.general.view','settings.general.update',
  'settings.content.view','settings.content.update','settings.commerce.view','settings.commerce.update',
  'settings.critical.manage','settings.security.view','settings.security.update'
);

CREATE TABLE IF NOT EXISTS category_parent_links (
  category_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id, parent_id),
  KEY idx_category_parent_links_parent (parent_id),
  CONSTRAINT fk_category_parent_links_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_category_parent_links_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT IGNORE INTO category_parent_links (category_id, parent_id, is_primary)
SELECT id, parent_id, 1 FROM categories WHERE parent_id IS NOT NULL;

ALTER TABLE products ADD COLUMN weight_grams INT UNSIGNED NULL AFTER base_mrp;
ALTER TABLE attributes ADD COLUMN is_variant_axis TINYINT(1) NOT NULL DEFAULT 1 AFTER display_type;

INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES ('branding', 'auth_image_url', '""', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);

UPDATE store_settings SET value_json = '"Your store"'
WHERE setting_group = 'store' AND setting_key = 'store_name' AND value_json = '"Natural Beauty"';
UPDATE store_settings SET value_json = '"Your store"'
WHERE setting_group = 'seo' AND setting_key = 'site_title' AND value_json = '"Natural Beauty"';
UPDATE store_settings SET value_json = '"Thoughtfully made products for everyday use."'
WHERE setting_group = 'seo' AND setting_key = 'meta_description'
  AND value_json = '"Thoughtfully formulated skincare for everyday rituals."';
UPDATE store_settings SET value_json = '"Your store"'
WHERE setting_group = 'smtp' AND setting_key = 'from_name' AND value_json = '"Natural Beauty"';
UPDATE store_settings SET value_json = '"Your store"'
WHERE setting_group = 'tax' AND setting_key = 'seller_legal_name' AND value_json = '"Natural Beauty"';
UPDATE store_settings SET value_json = '"Thoughtfully made products"'
WHERE setting_group = 'branding' AND setting_key = 'announcement_secondary'
  AND value_json = '"Thoughtfully formulated skincare"';
UPDATE store_settings SET value_json = '"Products, considered."'
WHERE setting_group = 'shop' AND setting_key = 'title' AND value_json = '"Skincare, considered."';
UPDATE store_settings SET value_json = '"Explore products by category, attributes and everyday needs."'
WHERE setting_group = 'shop' AND setting_key = 'description' AND value_json LIKE '%skincare%';
UPDATE store_settings SET value_json = '"Explore products"'
WHERE setting_group = 'contact' AND setting_key = 'cta_label' AND value_json = '"Explore skincare"';
UPDATE store_settings SET value_json = '"Products with purpose"'
WHERE setting_group = 'homepage' AND setting_key = 'brand_title'
  AND value_json = '"Nature, refined by thoughtful formulation."';
UPDATE store_settings SET value_json = '"support@example.com"'
WHERE setting_group = 'contact' AND setting_key IN ('email', 'support_email')
  AND value_json = '"hello@naturalbeauty.example"';
UPDATE store_settings SET value_json = '"Store support"'
WHERE setting_group = 'contact' AND setting_key = 'address_name'
  AND value_json = '"Natural Beauty Studio"';

INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES ('footer', 'twitter_url', '""', 1), ('contact', 'phone_secondary', '""', 1);

INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
('contact', 'cta_label', '"Explore products"', 1), ('contact', 'cta_url', '"/shop"', 1),
('contact', 'form_eyebrow', '"Customer care"', 1), ('contact', 'form_title', '"How can we help?"', 1),
('contact', 'form_description', '"Send us a note and our team will get back to you shortly."', 1),
('contact', 'name_label', '"Name"', 1), ('contact', 'name_placeholder', '"Your name"', 1),
('contact', 'email_label', '"Email"', 1), ('contact', 'email_placeholder', '"you@example.com"', 1),
('contact', 'order_label', '"Order number"', 1), ('contact', 'order_optional_label', '"(optional)"', 1),
('contact', 'order_placeholder', '"NB-2026-0000"', 1), ('contact', 'message_label', '"Message"', 1),
('contact', 'message_placeholder', '"How can we help?"', 1), ('contact', 'submit_label', '"Send message"', 1),
('contact', 'submitting_label', '"Sending…"', 1), ('contact', 'sent_label', '"Message sent"', 1),
('contact', 'map_title', '"Store location"', 1);
