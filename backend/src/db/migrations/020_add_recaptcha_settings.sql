INSERT IGNORE INTO store_settings(setting_group,setting_key,value_json,is_public)
VALUES
  ('recaptcha','enabled','false',1),
  ('recaptcha','site_key','""',1),
  ('recaptcha','secret_key','""',0);
