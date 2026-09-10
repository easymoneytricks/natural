export function normalizeCombination(assignments) {
  return [...assignments]
    .sort((left, right) => left.attributeId - right.attributeId)
    .map(({ attributeId, attributeValueId }) => `${attributeId}:${attributeValueId}`)
    .join('|') || 'simple'
}

export async function validateSkuAttributes(connection, productId, assignments) {
  const [productAttributes] = await connection.execute(`SELECT pa.attribute_id, pa.is_required
    FROM product_attributes pa WHERE pa.product_id = ?`, [productId])
  if (!productAttributes.length) {
    if (assignments.length) throw new Error('This product does not accept attribute assignments.')
    return 'simple'
  }
  const required = new Set(productAttributes.filter((item) => item.is_required).map((item) => item.attribute_id))
  const supplied = new Set()
  for (const assignment of assignments) {
    if (supplied.has(assignment.attributeId)) throw new Error('An SKU may select one value per attribute.')
    supplied.add(assignment.attributeId)
    if (!productAttributes.some((item) => item.attribute_id === assignment.attributeId)) throw new Error('Attribute is not enabled for this product.')
    const [values] = await connection.execute(`SELECT 1 FROM product_attribute_values
      WHERE product_id = ? AND attribute_id = ? AND attribute_value_id = ?`, [productId, assignment.attributeId, assignment.attributeValueId])
    if (!values.length) throw new Error('Attribute value is not allowed for this product.')
    const [belongs] = await connection.execute('SELECT 1 FROM attribute_values WHERE id = ? AND attribute_id = ?', [assignment.attributeValueId, assignment.attributeId])
    if (!belongs.length) throw new Error('Attribute value does not belong to the selected attribute.')
  }
  for (const attributeId of required) if (!supplied.has(attributeId)) throw new Error('All required product attributes must be selected.')
  return normalizeCombination(assignments)
}
