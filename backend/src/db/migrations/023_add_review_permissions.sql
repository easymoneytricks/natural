INSERT IGNORE INTO admin_permissions(name,slug)
VALUES ('reviews.view','reviews.view'),('reviews.manage','reviews.manage');

INSERT IGNORE INTO admin_role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM admin_roles r CROSS JOIN admin_permissions p
WHERE r.slug='super-admin' AND p.slug IN ('reviews.view','reviews.manage');
