CREATE TABLE IF NOT EXISTS content_page_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  page_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  intro TEXT NULL,
  content_json JSON NOT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(320) NULL,
  status ENUM('draft','published','archived') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_content_page_versions_page (page_id, created_at),
  CONSTRAINT fk_content_page_versions_page FOREIGN KEY (page_id) REFERENCES content_pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
