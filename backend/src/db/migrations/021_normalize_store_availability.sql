INSERT INTO store_settings(setting_group,setting_key,value_json,is_public)
VALUES ('store','maintenance_mode','"open"',1)
ON DUPLICATE KEY UPDATE
  value_json=IF(value_json='"false"' OR value_json='false','"open"',value_json),
  is_public=1;
