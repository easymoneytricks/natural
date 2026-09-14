CREATE TABLE IF NOT EXISTS customer_gift_cards (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  gift_card_id BIGINT UNSIGNED NOT NULL,
  claimed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customer_gift_card (gift_card_id),
  KEY idx_customer_gift_cards_customer (customer_id),
  CONSTRAINT fk_customer_gift_cards_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_gift_cards_card FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
