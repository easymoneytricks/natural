export async function list(pool, query = {}) {
  const search = String(query.q || "")
    .trim()
    .toLowerCase();
  const type = query.type && query.type !== "all" ? query.type : "all";
  const [brands, categories, products] = await Promise.all([
    pool.execute(
      "SELECT id,name,logo_path file_path,updated_at FROM brands WHERE logo_path IS NOT NULL AND deleted_at IS NULL",
    ),
    pool.execute(
      "SELECT id,name,image_path file_path,updated_at FROM categories WHERE image_path IS NOT NULL AND deleted_at IS NULL",
    ),
    pool.execute(
      "SELECT pm.id,p.name,pm.file_path,pm.alt_text,pm.is_primary,pm.updated_at FROM product_media pm JOIN products p ON p.id=pm.product_id WHERE pm.deleted_at IS NULL AND p.deleted_at IS NULL",
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
