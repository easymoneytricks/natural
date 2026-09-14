ALTER TABLE customers
  MODIFY status ENUM('active', 'disabled', 'deletion_requested') NOT NULL DEFAULT 'active';

ALTER TABLE customers
  ADD COLUMN deletion_requested_at TIMESTAMP NULL AFTER status;

CREATE INDEX idx_customers_deletion_request
  ON customers (status, deletion_requested_at);
