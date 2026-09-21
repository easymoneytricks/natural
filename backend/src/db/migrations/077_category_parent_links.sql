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
