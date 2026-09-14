ALTER TABLE product_skus
  MODIFY product_id BIGINT UNSIGNED NULL;

ALTER TABLE product_skus
  DROP FOREIGN KEY fk_product_skus_product;

ALTER TABLE product_skus
  ADD CONSTRAINT fk_product_skus_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
