INSERT INTO inventory (sku_id)
SELECT s.id
FROM product_skus s
LEFT JOIN inventory i ON i.sku_id = s.id
WHERE i.sku_id IS NULL;
