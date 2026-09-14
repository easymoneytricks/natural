ALTER TABLE reward_transactions
  ADD COLUMN expires_at TIMESTAMP NULL,
  ADD COLUMN expired_at TIMESTAMP NULL;
