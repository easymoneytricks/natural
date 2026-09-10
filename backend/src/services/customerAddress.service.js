import { AuthError } from "./auth.service.js";

const fields = [
  "label",
  "firstName",
  "lastName",
  "phone",
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "postalCode",
  "countryCode",
  "addressType",
];
const normalize = (input = {}, partial = false) => {
  const out = {};
  for (const field of fields)
    if (!partial || Object.prototype.hasOwnProperty.call(input, field))
      out[field] = String(input[field] ?? "").trim();
  if (out.phone) out.phone = out.phone.replace(/\D/g, "");
  if (out.countryCode) out.countryCode = out.countryCode.toUpperCase();
  if (out.addressType && !["home", "work", "other"].includes(out.addressType))
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "Please provide a valid address type.",
    );
  const required = [
    "label",
    "firstName",
    "lastName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
    "countryCode",
  ];
  if (
    !partial &&
    (required.some((key) => !out[key]) ||
      !/^\d{10}$/.test(out.phone) ||
      !/^\d{6}$/.test(out.postalCode) ||
      out.countryCode.length !== 2)
  )
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "Please provide a complete valid address.",
    );
  if (partial && out.phone && !/^\d{10}$/.test(out.phone))
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "Please provide a valid 10-digit phone number.",
    );
  if (partial && out.postalCode && !/^\d{6}$/.test(out.postalCode))
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "Please provide a valid 6-digit PIN code.",
    );
  return out;
};

const map = (row) => ({
  id: row.id,
  label: row.label,
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone,
  addressLine1: row.address_line_1,
  addressLine2: row.address_line_2 || "",
  landmark: row.landmark || "",
  city: row.city,
  state: row.state,
  postalCode: row.postal_code,
  countryCode: row.country_code,
  addressType: row.address_type,
  isDefault: Boolean(row.is_default),
});
const find = async (connection, customerId, id, lock = false) => {
  const [rows] = await connection.execute(
    `SELECT * FROM customer_addresses WHERE id = ? AND customer_id = ? AND deleted_at IS NULL${lock ? " FOR UPDATE" : ""}`,
    [id, customerId],
  );
  return rows[0] || null;
};

export async function listAddresses(pool, customerId) {
  const [rows] = await pool.execute(
    "SELECT * FROM customer_addresses WHERE customer_id = ? AND deleted_at IS NULL ORDER BY is_default DESC, updated_at DESC",
    [customerId],
  );
  return rows.map(map);
}
export async function createAddress(pool, customerId, input) {
  const data = normalize(input);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [countRows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM customer_addresses WHERE customer_id = ? AND deleted_at IS NULL FOR UPDATE",
      [customerId],
    );
    const isDefault = countRows[0].count === 0 || Boolean(input.isDefault);
    if (isDefault)
      await connection.execute(
        "UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND deleted_at IS NULL",
        [customerId],
      );
    const [result] = await connection.execute(
      "INSERT INTO customer_addresses (customer_id,label,first_name,last_name,phone,address_line_1,address_line_2,landmark,city,state,postal_code,country_code,address_type,is_default) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        customerId,
        data.label,
        data.firstName,
        data.lastName,
        data.phone,
        data.addressLine1,
        data.addressLine2 || null,
        data.landmark || null,
        data.city,
        data.state,
        data.postalCode,
        data.countryCode,
        data.addressType || "home",
        isDefault ? 1 : 0,
      ],
    );
    await connection.commit();
    return map(await find(connection, customerId, result.insertId));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function updateAddress(pool, customerId, id, input) {
  const data = normalize(input, true);
  const keys = Object.keys(data);
  if (!keys.length)
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "No address changes provided.",
    );
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (!(await find(connection, customerId, id, true)))
      throw new AuthError(404, "ADDRESS_NOT_FOUND", "Address not found.");
    const sqlKeys = {
      label: "label",
      firstName: "first_name",
      lastName: "last_name",
      phone: "phone",
      addressLine1: "address_line_1",
      addressLine2: "address_line_2",
      landmark: "landmark",
      city: "city",
      state: "state",
      postalCode: "postal_code",
      countryCode: "country_code",
      addressType: "address_type",
    };
    const assignments = keys.map((key) => `${sqlKeys[key]} = ?`);
    await connection.execute(
      `UPDATE customer_addresses SET ${assignments.join(", ")} WHERE id = ? AND customer_id = ? AND deleted_at IS NULL`,
      [...keys.map((key) => data[key] || null), id, customerId],
    );
    await connection.commit();
    return map(await find(connection, customerId, id));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function setDefaultAddress(pool, customerId, id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (!(await find(connection, customerId, id, true)))
      throw new AuthError(404, "ADDRESS_NOT_FOUND", "Address not found.");
    await connection.execute(
      "UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND deleted_at IS NULL",
      [customerId],
    );
    await connection.execute(
      "UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND customer_id = ?",
      [id, customerId],
    );
    await connection.commit();
    return map(await find(connection, customerId, id));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function deleteAddress(pool, customerId, id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const row = await find(connection, customerId, id, true);
    if (!row)
      throw new AuthError(404, "ADDRESS_NOT_FOUND", "Address not found.");
    await connection.execute(
      "UPDATE customer_addresses SET deleted_at = NOW(), is_default = 0 WHERE id = ? AND customer_id = ?",
      [id, customerId],
    );
    if (row.is_default) {
      const [remaining] = await connection.execute(
        "SELECT id FROM customer_addresses WHERE customer_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC, id DESC LIMIT 1 FOR UPDATE",
        [customerId],
      );
      if (remaining[0])
        await connection.execute(
          "UPDATE customer_addresses SET is_default = 1 WHERE id = ?",
          [remaining[0].id],
        );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
