INSERT IGNORE INTO admin_permissions(name,slug)
VALUES ('catalog.manage','catalog.manage');

INSERT IGNORE INTO admin_role_permissions(role_id,permission_id)
SELECT r.id,p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug='catalog.manage'
WHERE r.slug='super-admin' AND r.deleted_at IS NULL;
