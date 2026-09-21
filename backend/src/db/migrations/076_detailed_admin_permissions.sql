INSERT IGNORE INTO admin_permissions (name, slug, description)
VALUES
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
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.slug = 'super-admin'
  AND p.slug IN (
    'promotions.coupons.view', 'promotions.coupons.create', 'promotions.coupons.update', 'promotions.coupons.delete',
    'promotions.gift-cards.view', 'promotions.gift-cards.create', 'promotions.gift-cards.update',
    'orders.abandoned.view', 'orders.abandoned.manage', 'orders.abandoned.export', 'reports.useful-info.view',
    'staff.users.view', 'staff.users.create', 'staff.users.update', 'staff.users.delete',
    'staff.roles.view', 'staff.roles.create', 'staff.roles.update', 'staff.roles.delete',
    'staff.permissions.view', 'staff.permissions.update', 'settings.general.view', 'settings.general.update',
    'settings.content.view', 'settings.content.update', 'settings.commerce.view', 'settings.commerce.update',
    'settings.critical.manage', 'settings.security.view', 'settings.security.update'
  );
