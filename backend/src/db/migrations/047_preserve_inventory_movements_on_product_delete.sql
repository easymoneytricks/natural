ALTER TABLE inventory_movements
  MODIFY sku_id BIGINT UNSIGNED NULL;

ALTER TABLE inventory_movements
  DROP FOREIGN KEY fk_inventory_movements_sku;

ALTER TABLE inventory_movements
  ADD CONSTRAINT fk_inventory_movements_sku
    FOREIGN KEY (sku_id) REFERENCES product_skus(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
