export async function getInventoryBySku(connection, sku) {
  const [rows] = await connection.execute(
    `SELECT ps.sku, i.quantity_on_hand, i.reserved_quantity,
    i.quantity_on_hand - i.reserved_quantity AS available_quantity
    FROM product_skus ps JOIN inventory i ON i.sku_id = ps.id WHERE ps.sku = ?`,
    [sku],
  );
  return rows[0] || null;
}

export async function adjustStock(
  connection,
  sku,
  quantityChange,
  note = null,
) {
  if (!Number.isInteger(quantityChange) || quantityChange === 0)
    throw new Error("Stock adjustment must be a non-zero integer.");
  await connection.beginTransaction();
  try {
    const [rows] = await connection.execute(
      `SELECT i.id, i.sku_id, i.quantity_on_hand, i.reserved_quantity
      FROM inventory i JOIN product_skus ps ON ps.id = i.sku_id WHERE ps.sku = ? FOR UPDATE`,
      [sku],
    );
    if (!rows.length) throw new Error("Inventory record not found for SKU.");
    const current = rows[0];
    const nextQuantity = current.quantity_on_hand + quantityChange;
    if (nextQuantity < 0)
      throw new Error("Stock adjustment cannot make quantity negative.");
    if (nextQuantity < current.reserved_quantity)
      throw new Error("Stock adjustment cannot be below reserved quantity.");
    await connection.execute(
      "UPDATE inventory SET quantity_on_hand = ? WHERE id = ?",
      [nextQuantity, current.id],
    );
    await connection.execute(
      `INSERT INTO inventory_movements
      (sku_id, movement_type, quantity_change, quantity_before, quantity_after, note)
      VALUES (?, 'adjustment', ?, ?, ?, ?)`,
      [
        current.sku_id,
        quantityChange,
        current.quantity_on_hand,
        nextQuantity,
        note,
      ],
    );
    await connection.commit();
    return {
      sku,
      quantityBefore: current.quantity_on_hand,
      quantityAfter: nextQuantity,
      quantityChange,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
