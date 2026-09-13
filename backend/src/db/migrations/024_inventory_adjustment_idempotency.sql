ALTER TABLE inventory_movements
  ADD COLUMN idempotency_key CHAR(36) NULL,
  ADD UNIQUE KEY uq_inventory_movements_idempotency (idempotency_key);
