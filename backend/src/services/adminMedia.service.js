import { removeManagedFile } from "./mediaStorage.service.js";

export async function list(pool, query = {}) {
  const search = String(query.q || "")
    .trim()
    .toLowerCase();
  const type = query.type && query.type !== "all" ? query.type : "all";
  const [brands, categories, products, unassigned] = await Promise.all([
    pool.execute(
      "SELECT id,name,logo_path file_path,updated_at FROM brands WHERE logo_path IS NOT NULL AND deleted_at IS NULL",
    ),
    pool.execute(
      "SELECT id,name,image_path file_path,updated_at FROM categories WHERE image_path IS NOT NULL AND deleted_at IS NULL",
    ),
    pool.execute(
      "SELECT pm.id,p.name,pm.file_path,pm.alt_text,pm.is_primary,pm.updated_at FROM product_media pm JOIN products p ON p.id=pm.product_id WHERE pm.deleted_at IS NULL AND p.deleted_at IS NULL",
    ),
    pool.execute(
      "SELECT id,file_path,alt_text,created_at updated_at FROM media_assets WHERE deleted_at IS NULL",
    ),
  ]);
  const assets = [
    ...brands[0].map((row) => ({
      ...row,
      asset_type: "brand",
      asset_name: row.name,
    })),
    ...categories[0].map((row) => ({
      ...row,
      asset_type: "category",
      asset_name: row.name,
    })),
    ...products[0].map((row) => ({
      ...row,
      asset_type: "product",
      asset_name: row.name,
    })),
    ...unassigned[0].map((row) => ({
      ...row,
      asset_type: "unassigned",
      asset_name: row.file_path.split("/").pop(),
    })),
  ];
  return assets
    .filter((asset) => type === "all" || asset.asset_type === type)
    .filter(
      (asset) =>
        !search ||
        `${asset.asset_name} ${asset.file_path} ${asset.alt_text || ""}`
          .toLowerCase()
          .includes(search),
    )
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
    .map((asset) => ({
      id: Number(asset.id),
      type: asset.asset_type,
      name: asset.asset_name,
      path: asset.file_path,
      altText: asset.alt_text || "",
      primary: Boolean(asset.is_primary),
      updatedAt: asset.updated_at,
    }));
}

export async function remove(pool, id, type) {
  const assetId = Number(id);
  if (!Number.isInteger(assetId) || assetId <= 0) {
    const error = new Error("A valid media asset is required.");
    error.statusCode = 400;
    throw error;
  }
  const connection = await pool.getConnection();
  let filePath = null;
  try {
    await connection.beginTransaction();
    if (type === "product") {
      const [[asset]] = await connection.execute(
        "SELECT file_path FROM product_media WHERE id=? AND deleted_at IS NULL",
        [assetId],
      );
      if (!asset)
        throw Object.assign(new Error("Media asset not found."), {
          statusCode: 404,
        });
      filePath = asset.file_path;
      await connection.execute(
        "UPDATE product_media SET deleted_at=NOW(),is_primary=0 WHERE id=?",
        [assetId],
      );
    } else if (type === "brand" || type === "category") {
      const table = type === "brand" ? "brands" : "categories";
      const column = type === "brand" ? "logo_path" : "image_path";
      const [[asset]] = await connection.execute(
        `SELECT ${column} file_path FROM ${table} WHERE id=? AND deleted_at IS NULL`,
        [assetId],
      );
      if (!asset)
        throw Object.assign(new Error("Media asset not found."), {
          statusCode: 404,
        });
      filePath = asset.file_path;
      await connection.execute(
        `UPDATE ${table} SET ${column}=NULL WHERE id=?`,
        [assetId],
      );
    } else {
      const [[asset]] = await connection.execute(
        "SELECT file_path FROM media_assets WHERE id=? AND deleted_at IS NULL",
        [assetId],
      );
      if (!asset)
        throw Object.assign(new Error("Media asset not found."), {
          statusCode: 404,
        });
      filePath = asset.file_path;
      await connection.execute(
        "UPDATE media_assets SET deleted_at=NOW() WHERE id=?",
        [assetId],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await removeManagedFile(filePath);
  return { id: assetId, deleted: true };
}
