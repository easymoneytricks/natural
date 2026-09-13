ALTER TABLE orders
  ADD COLUMN cancellation_reason VARCHAR(500) NULL,
  ADD COLUMN return_status ENUM('none','requested','approved','rejected','received','refunded') NOT NULL DEFAULT 'none',
  ADD COLUMN refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN refund_reason VARCHAR(500) NULL;
