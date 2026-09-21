INSERT IGNORE INTO admin_permissions (name, slug, description)
VALUES
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
  ('Rewards · update', 'rewards.update', 'Update rewards configuration.');

INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.slug = 'super-admin'
  AND p.slug LIKE '%.%';
