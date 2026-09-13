import { audit } from "./adminCatalog.service.js";
import { AuthError } from "./auth.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};
const groups = [
  "branding",
  "seo",
  "shipping",
  "tax",
  "homepage",
  "navigation",
  "footer",
  "store",
  "smtp",
  "homepage_sections",
  "payments",
];

function parse(row) {
  try {
    return JSON.parse(row.value_json);
  } catch {
    return row.value_json;
  }
}

export async function read(pool, publicOnly = false) {
  const [rows] = await pool.execute(
    `SELECT setting_group,setting_key,value_json FROM store_settings ${publicOnly ? "WHERE is_public=1 AND setting_group <> 'smtp'" : ""} ORDER BY setting_group,setting_key`,
  );
  return rows.reduce((result, row) => {
    (result[row.setting_group] ||= {})[row.setting_key] =
      (publicOnly || row.setting_group !== "smtp") &&
      row.setting_group === "smtp" &&
      row.setting_key === "password"
        ? ""
        : parse(row);
    return result;
  }, {});
}

export async function readPrivate(pool) {
  const [rows] = await pool.execute(
    "SELECT setting_group,setting_key,value_json FROM store_settings WHERE setting_group='smtp' ORDER BY setting_key",
  );
  return rows.reduce((result, row) => {
    (result[row.setting_group] ||= {})[row.setting_key] = parse(row);
    return result;
  }, {});
}

export async function update(pool, input, adminId, req) {
  if (!input || typeof input !== "object")
    fail(400, "INVALID_SETTINGS", "Settings payload is invalid.");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [settingGroup, values] of Object.entries(input)) {
      if (
        !groups.includes(settingGroup) ||
        !values ||
        typeof values !== "object"
      )
        continue;
      for (const [settingKey, value] of Object.entries(values)) {
        if (!/^[a-z0-9_]{1,100}$/.test(settingKey)) continue;
        if (
          settingGroup === "smtp" &&
          settingKey === "password" &&
          !String(value || "").trim()
        )
          continue;
        await connection.execute(
          "INSERT INTO store_settings(setting_group,setting_key,value_json,is_public,updated_by) VALUES(?,?,?, ?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),is_public=VALUES(is_public),updated_by=VALUES(updated_by)",
          [
            settingGroup,
            settingKey,
            JSON.stringify(value),
            settingGroup === "smtp" ? 0 : 1,
            adminId,
          ],
        );
      }
    }
    await connection.commit();
    await audit(
      pool,
      adminId,
      "store_settings.updated",
      "store_settings",
      "global",
      req,
    );
    return read(pool);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export { groups };
