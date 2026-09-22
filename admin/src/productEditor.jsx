import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./main";
import { SkuFields } from "./skuFields";
import { ProductContentFields } from "./productContentFields";
import { ConfirmAction } from "./ConfirmAction";
import { ProductMediaCard } from "./ProductMediaCard";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/api\/v1\/?$/, "");

const imageUrl = (path) =>
  path
    ? path.startsWith("http")
      ? path
      : `${API_ROOT}/${path.replace(/^\//, "")}`
    : "";
const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 190);

const emptyProduct = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  ingredientsText: "",
  howToUse: "",
  texture: "",
  usageTime: "",
  status: "draft",
  productType: "simple",
  basePrice: 0,
  baseMrp: 0,
  weightGrams: "",
  isActive: true,
  brandId: "",
  categories: [],
  benefits: [],
  ingredients: [],
  attributes: [],
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  hsnSac: "",
};

const emptySku = {
  mediaIds: [],
  sku: "",
  title: "",
  price: 0,
  mrp: 0,
  barcode: "",
  weightGrams: "",
  isActive: true,
  trackInventory: true,
  allowBackorder: false,
  attributes: [],
};

const normalizeAttributes = (items = []) =>
  items.map((item) => ({
    attributeId: item.attributeId ?? item.attribute_id ?? item.id,
    isRequired: Boolean(item.isRequired ?? item.is_required ?? true),
    values: (item.values || []).map((value) => ({
      valueId: value.valueId ?? value.attribute_value_id ?? value.id ?? value,
    })),
  }));

const normalizeSku = (item) => ({
  ...emptySku,
  mediaIds: item.mediaIds || [],
  sku: item.sku || "",
  title: item.title || "",
  price: item.price ?? 0,
  mrp: item.mrp ?? 0,
  barcode: item.barcode || "",
  weightGrams: item.weight_grams ?? "",
  isActive: item.is_active !== false && Number(item.is_active) !== 0,
  trackInventory:
    item.track_inventory !== false && Number(item.track_inventory) !== 0,
  allowBackorder: !!item.allow_backorder,
  attributes: (item.attributes || []).map((attribute) => ({
    attributeId: attribute.attributeId ?? attribute.attribute_id,
    valueId:
      attribute.valueId ??
      attribute.attributeValueId ??
      attribute.attribute_value_id,
  })),
});

export function ProductEditor() {
  const { authFetch, admin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(emptyProduct);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [media, setMedia] = useState([]);
  const [skus, setSkus] = useState([]);
  const [editingSkuId, setEditingSkuId] = useState(null);
  const [sku, setSku] = useState(emptySku);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [libraryAssets, setLibraryAssets] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const canManage = admin?.effectivePermissions?.includes("catalog.manage");
  const canViewInventory =
    admin?.effectivePermissions?.includes("inventory.view");

  const updateForm = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateAttributeValues = (attributeId, valueIds) =>
    updateForm(
      "attributes",
      form.attributes.map((item) =>
        Number(item.attributeId) === Number(attributeId)
          ? { ...item, values: valueIds.map((valueId) => ({ valueId })) }
          : item,
      ),
    );

  const load = async () => {
    const [brandResponse, categoryResponse, attributeResponse] =
      await Promise.all([
        authFetch("/admin/brands"),
        authFetch("/admin/categories"),
        authFetch("/admin/attributes"),
      ]);
    setBrands(brandResponse.data);
    setCategories(categoryResponse.data);
    setAttributes(attributeResponse.data);

    if (!id) {
      setForm(emptyProduct);
      setDeleted(false);
      return;
    }
    const { data: product } = await authFetch(`/admin/products/${id}`);
    setForm({
      ...emptyProduct,
      name: product.name,
      slug: product.slug,
      shortDescription: product.short_description || "",
      description: product.description || "",
      ingredientsText: product.ingredients_text || "",
      howToUse: product.how_to_use || "",
      texture: product.texture || "",
      usageTime: product.usage_time || "",
      status: product.status,
      productType: product.product_type,
      basePrice: product.base_price,
      baseMrp: product.base_mrp,
      weightGrams: product.weight_grams ?? "",
      isActive: !!product.is_active,
      isFeatured: !!product.featured,
      isBestSeller: !!product.best_seller,
      isNewArrival: !!product.new_arrival,
      seoTitle: product.seo_title || "",
      seoDescription: product.seo_description || "",
      seoKeywords: product.seo_keywords || "",
      canonicalUrl: product.canonical_url || "",
      hsnSac: product.hsn_sac || "",
      brandId: product.brand_id || "",
      categories: (product.categories || []).map((category) => ({
        id: category.id,
        isPrimary: !!category.is_primary,
        sortOrder: category.sort_order,
      })),
      benefits: product.benefits || [],
      ingredients: product.ingredients || [],
      attributes: normalizeAttributes(product.attributes),
    });
    setMedia(product.media || []);
    setSkus(product.skus || []);
    setDeleted(!!product.deleted_at);
  };

  useEffect(() => {
    setLoading(true);
    setEditingSkuId(null);
    setSku(emptySku);
    setSlugTouched(Boolean(id));
    load()
      .catch(() => setError("Unable to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const saveProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const response = await authFetch(
        id ? `/admin/products/${id}` : "/admin/products",
        {
          method: id ? "PATCH" : "POST",
          body: form,
        },
      );
      const productId = id || response.data.id;
      setMessage("Item saved successfully.");
      if (id) await load();
      navigate(`/catalog/products/${productId}`);
    } catch (caught) {
      setError(caught.message || "Could not save entry.");
    } finally {
      setBusy(false);
    }
  };

  const uploadMedia = async (event) => {
    const input = event.target;
    if (!id || !input.files.length) return;
    setMessage("");
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      [...input.files].forEach((file) => body.append("images", file));
      await authFetch(`/admin/products/${id}/media`, {
        method: "POST",
        body,
      });
      await refreshChildren();
      setMessage("Gallery images uploaded.");
    } catch (caught) {
      setError(caught.message || "Upload failed.");
    } finally {
      input.value = "";
      setBusy(false);
    }
  };
  const openLibrary = async () => {
    setError("");
    try {
      const response = await authFetch("/admin/media?type=all");
      setLibraryAssets(response.data || []);
      setShowLibrary(true);
    } catch (caught) {
      setError(caught.message || "Unable to load media library.");
    }
  };
  const attachLibraryAsset = async (asset) => {
    setBusy(true);
    setError("");
    try {
      const response = await authFetch(`/admin/products/${id}/media/library`, {
        method: "POST",
        body: { assetId: asset.id, altText: asset.altText },
      });
      setMedia((current) => [...current, response.data]);
      setShowLibrary(false);
    } catch (caught) {
      if (caught.code === "MEDIA_ASSET_NOT_FOUND") {
        setError(
          "This media item is no longer available. The library has been refreshed; please choose another image.",
        );
        try {
          const response = await authFetch("/admin/media?type=all");
          setLibraryAssets(response.data || []);
          setShowLibrary(true);
        } catch {
          setShowLibrary(false);
        }
      } else {
        setError(caught.message || "Unable to attach library image.");
      }
    } finally {
      setBusy(false);
    }
  };

  const refreshChildren = async () => {
    const { data } = await authFetch(`/admin/products/${id}`);
    setMedia(data.media || []);
    setSkus(data.skus || []);
  };

  const updateMedia = async (item, changes) => {
    setMessage("");
    setBusy(true);
    setError("");
    try {
      await authFetch(`/admin/products/${id}/media/${item.id}`, {
        method: "PATCH",
        body: changes,
      });
      await refreshChildren();
      setMessage("Image updated.");
    } catch (caught) {
      setError(caught.message || "Could not update media.");
    } finally {
      setBusy(false);
    }
  };

  const removeMedia = (item) =>
    setConfirmation({
      title: "Remove gallery image?",
      description:
        "The image will be removed from the gallery and SKU selection. Historical records are retained.",
      onConfirm: async () => {
        await authFetch(`/admin/products/${id}/media/${item.id}`, {
          method: "DELETE",
        });
        await refreshChildren();
      },
    });

  const saveSku = async () => {
    setMessage("");
    setBusy(true);
    setError("");
    try {
      await authFetch(
        `/admin/products/${id}/skus${editingSkuId ? `/${editingSkuId}` : ""}`,
        {
          method: editingSkuId ? "PATCH" : "POST",
          body: sku,
        },
      );
      setSku(emptySku);
      setEditingSkuId(null);
      await refreshChildren();
      setMessage("SKU saved. Inventory quantities are unchanged.");
    } catch (caught) {
      setError(caught.message || "Could not save SKU.");
    } finally {
      setBusy(false);
    }
  };

  const changeSkuLifecycle = (item, restore) =>
    setConfirmation({
      title: restore ? "Restore this inventory item?" : "Archive this inventory item?",
      description: restore
        ? "The SKU returns as inactive. Review it before activating."
        : "This hides the SKU from sale. Inventory and historical order records are retained.",
      onConfirm: async () => {
        await authFetch(
          `/admin/products/${id}/skus/${item.id}${restore ? "/restore" : ""}`,
          { method: restore ? "POST" : "DELETE" },
        );
        setEditingSkuId(null);
        setSku(emptySku);
        await refreshChildren();
      },
    });

  const permanentlyDeleteSku = (item) =>
    setConfirmation({
      title: "Permanently delete this SKU?",
      description: "This cannot be undone. SKUs with inventory movement history will be kept for records.",
      onConfirm: async () => {
        await authFetch(`/admin/products/${id}/skus/${item.id}/permanent`, { method: "DELETE" });
        await refreshChildren();
      },
    });

  const changeProductLifecycle = () =>
    setConfirmation({
      title: deleted ? "Restore this item?" : "Archive this item?",
      description: deleted
        ? "The item returns as a draft for review."
        : "The item is hidden from sale. Order snapshots and inventory records remain intact.",
      onConfirm: async () => {
        await authFetch(`/admin/products/${id}${deleted ? "/restore" : ""}`, {
          method: deleted ? "POST" : "DELETE",
        });
        await load();
      },
    });

  const permanentlyDeleteProduct = () =>
    setConfirmation({
      title: "Permanently delete this item?",
      description:
        "This removes the product from the catalogue and preserves order snapshots, sales history, and inventory movements. This action cannot be undone.",
      onConfirm: async () => {
        await authFetch(`/admin/products/${id}/permanent`, {
          method: "DELETE",
        });
        navigate("/catalog/products");
      },
    });

  const skuValueUsage = new Set(
    skus.flatMap((item) =>
      (item.attributes || []).map(
        (assignment) =>
          `${assignment.attribute_id ?? assignment.attributeId}:${assignment.attribute_value_id ?? assignment.valueId}`,
      ),
    ),
  );
  const skuAttributeUsage = new Set(
    skus.flatMap((item) =>
      (item.attributes || []).map((assignment) =>
        Number(assignment.attribute_id ?? assignment.attributeId),
      ),
    ),
  );

  if (loading) return <div className="loading">Loading item editor…</div>;
  return (
    <div className="product-editor-page">
      <div className="page-head product-page-head">
        <div>
          <h1>{id ? "Edit item" : "New item"}</h1>
          <p>
            Manage content, options, media and inventory identifiers.
          </p>
        </div>
        <Link to="/catalog/products">Back to products</Link>
      </div>
      <div className="actions">
        {id && canManage && (
          <button type="button" onClick={changeProductLifecycle}>
            {deleted ? "Restore item" : "Archive item"}
          </button>
        )}
        {id && deleted && canManage && (
          <button
            type="button"
            className="danger-action"
            onClick={permanentlyDeleteProduct}
          >
            Permanently delete
          </button>
        )}
        {id &&
          form.slug &&
          !deleted &&
          form.status === "active" &&
          form.isActive && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`${(import.meta.env.VITE_STOREFRONT_URL || "http://localhost:5173").replace(/\/$/, "")}/product/${encodeURIComponent(form.slug)}`}
            >
              View storefront
            </a>
          )}
      </div>
      {deleted && (
        <p role="status">
          This item is archived. Restore it before editing.
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {confirmation && (
        <ConfirmAction
          {...confirmation}
          onClose={() => setConfirmation(null)}
        />
      )}
      <form className="product-editor-form" onSubmit={saveProduct}>
        <fieldset
          disabled={busy || deleted || !canManage}
          className="product-fields"
        >
          <section className="card">
            <h2>General</h2>
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateForm("isActive", event.target.checked)
                }
              />
              Enabled for sale (requires Active status)
            </label>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name,
                    ...(!slugTouched ? { slug: slugify(name) } : {}),
                  }));
                }}
              />
            </label>
            <label>
              Slug
              <input
                value={form.slug}
                onChange={(event) => {
                  const slug = event.target.value;
                  setSlugTouched(Boolean(slug.trim()));
                  updateForm("slug", slug);
                }}
                onBlur={() => {
                  if (!form.slug.trim()) {
                    setSlugTouched(false);
                    updateForm("slug", slugify(form.name));
                  }
                }}
                placeholder="auto-generated from item name"
              />
            </label>
            <label>
              Brand
              <select
                value={form.brandId}
                onChange={(event) => updateForm("brandId", event.target.value)}
              >
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item type
              <select
                value={form.productType}
                onChange={(event) =>
                  updateForm("productType", event.target.value)
                }
              >
                <option value="simple">Simple</option>
                <option value="variant">Variant</option>
              </select>
              {form.productType === "simple" && (
                <small>
                  A standard SKU is created automatically when you save this
                  product.
                </small>
              )}
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
              >
                <option>draft</option>
                <option>active</option>
                <option>archived</option>
              </select>
            </label>
            <label>
              Base price
              <input
                type="number"
                min="0"
                step=".01"
                value={form.basePrice}
                onChange={(event) =>
                  updateForm("basePrice", event.target.value)
                }
              />
            </label>
            <label>
              Base MRP
              <input
                type="number"
                min="0"
                step=".01"
                value={form.baseMrp}
                onChange={(event) => updateForm("baseMrp", event.target.value)}
              />
            </label>
            <label>
              Weight (grams)
              <input
                type="number"
                min="0"
                step="1"
                value={form.weightGrams}
                onChange={(event) =>
                  updateForm("weightGrams", event.target.value)
                }
                placeholder="e.g. 100"
              />
              <small>Used when the item does not have variant-level weights.</small>
            </label>
            <label>
              HSN / SAC code
              <input
                value={form.hsnSac || ""}
                onChange={(event) => updateForm("hsnSac", event.target.value)}
                placeholder="Example: 3304"
              />
              <small>
                Tax classification printed on invoices.
              </small>
            </label>
          </section>
          <section className="card">
            <h2>Content</h2>
            {[
              ["isFeatured", "Featured"],
              ["isBestSeller", "Best seller"],
              ["isNewArrival", "New arrival"],
            ].map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(event) => updateForm(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
            <label>
              SEO title
              <input
                value={form.seoTitle || ""}
                onChange={(event) => updateForm("seoTitle", event.target.value)}
              />
            </label>
            <label>
              SEO description
              <textarea
                value={form.seoDescription || ""}
                onChange={(event) =>
                  updateForm("seoDescription", event.target.value)
                }
              />
            </label>
            <label>
              SEO keywords
              <input
                value={form.seoKeywords || ""}
                onChange={(event) =>
                  updateForm("seoKeywords", event.target.value)
                }
                placeholder="keyword, phrase, topic"
              />
            </label>
            <label>
              Canonical URL
              <input
                type="url"
                value={form.canonicalUrl || ""}
                onChange={(event) =>
                  updateForm("canonicalUrl", event.target.value)
                }
                placeholder="https://example.com/catalog/item-slug"
              />
            </label>
            {[
              ["shortDescription", "Short description"],
              ["description", "Description"],
              ["howToUse", "Instructions (left side)"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                {key === "howToUse" && (
                  <small className="field-help">
                    Add one step per line. Example: Step 1: Enter the first instruction. Step 2: Enter the next instruction.
                  </small>
                )}
                <textarea
                  value={form[key] || ""}
                  placeholder={
                    key === "howToUse"
                      ? "Step 1: ...\nStep 2: ..."
                      : undefined
                  }
                  onChange={(event) => updateForm(key, event.target.value)}
                />
              </label>
            ))}
            <div className="product-editor-detail-group">
              <div className="product-editor-detail-group-heading">
                <strong>Product details (right side)</strong>
                <small>Shown together in the product details area.</small>
              </div>
              {[
                ["ingredientsText", "Components & details"],
                ["texture", "Specifications"],
                ["usageTime", "Usage notes"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    value={form[key] || ""}
                    onChange={(event) => updateForm(key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
          <section className="card">
            <h2>Categories</h2>
            <strong className="product-category-heading">Primary</strong>
            <div className="product-category-primary-list">
                {categories
                  .filter(
                    (category) =>
                      !category.parentId && !(category.parentIds || []).length,
                  )
                  .map((category) => (
                    <label key={category.id}>
                      <input
                        type="checkbox"
                        checked={form.categories.some(
                          (item) => Number(item.id) === Number(category.id),
                        )}
                        onChange={(event) => {
                          if (event.target.checked) {
                            updateForm("categories", [
                              ...form.categories,
                              {
                                id: category.id,
                                isPrimary: !form.categories.some(
                                  (item) => item.isPrimary,
                                ),
                              },
                            ]);
                          } else {
                            updateForm(
                              "categories",
                              form.categories.filter(
                                (item) =>
                                  Number(item.id) !== Number(category.id),
                              ),
                            );
                          }
                        }}
                      />
                      {category.name}
                    </label>
                  ))}
                {!categories.some(
                  (category) =>
                    !category.parentId && !(category.parentIds || []).length,
                ) && <span>Not available</span>}
            </div>
            <strong className="product-category-heading">Categories</strong>
            {categories
              .filter(
                (category) =>
                  category.parentId || (category.parentIds || []).length,
              )
              .map((category) => (
              <label key={category.id}>
                <input
                  type="checkbox"
                  checked={form.categories.some(
                    (item) => Number(item.id) === Number(category.id),
                  )}
                  onChange={(event) =>
                    updateForm(
                      "categories",
                      event.target.checked
                          ? [
                              ...form.categories,
                              {
                              id: category.id,
                              isPrimary: false,
                            },
                          ]
                        : form.categories.filter(
                            (item) => Number(item.id) !== Number(category.id),
                          ),
                    )
                  }
                />
                {category.name}
              </label>
            ))}
          </section>
          {form.productType === "variant" && (
          <section className="card">
            <h2>Attributes</h2>
            <p>
              Allowed values do not automatically create variants. Save the item
              attribute changes before adding or editing a SKU combination.
            </p>
            {attributes.map((attribute) => {
              const assignment = form.attributes.find(
                (item) => Number(item.attributeId) === Number(attribute.id),
              );
              return (
                <fieldset
                  className={`product-attribute-group${assignment ? " is-selected" : ""}`}
                  key={attribute.id}
                >
                  <legend>
                    <label className="product-attribute-title">
                    <input
                      type="checkbox"
                      checked={!!assignment}
                      disabled={skuAttributeUsage.has(Number(attribute.id))}
                      onChange={(event) =>
                        updateForm(
                          "attributes",
                          event.target.checked
                            ? [
                                ...form.attributes,
                                {
                                  attributeId: attribute.id,
                                  isRequired: true,
                                  values: [],
                                },
                              ]
                            : form.attributes.filter(
                                (item) =>
                                  Number(item.attributeId) !==
                                  Number(attribute.id),
                              ),
                        )
                      }
                    />
                      <span>{attribute.name}</span>
                      <small>
                        {skuAttributeUsage.has(Number(attribute.id))
                          ? "Used by an SKU"
                          : assignment
                            ? "Selected"
                            : "Available"}
                      </small>
                    </label>
                  </legend>
                  {assignment && (
                    <label className="product-attribute-required">
                      <input
                        type="checkbox"
                        checked={assignment.isRequired}
                        onChange={(event) =>
                          updateForm(
                            "attributes",
                            form.attributes.map((item) =>
                              Number(item.attributeId) === Number(attribute.id)
                                ? { ...item, isRequired: event.target.checked }
                                : item,
                            ),
                          )
                        }
                      />
                      Required for SKU combinations
                    </label>
                  )}
                  {assignment && (
                    <div className={`product-attribute-values is-${attribute.display_type || "button"}`}>
                      {attribute.display_type === "select" ? (
                        <select
                          multiple
                          value={(assignment.values || []).map((item) => String(item.valueId ?? item.id ?? item))}
                          onChange={(event) =>
                            updateAttributeValues(
                              attribute.id,
                              Array.from(event.target.selectedOptions, (option) => Number(option.value)),
                            )
                          }
                        >
                          {(attribute.values || []).map((value) => (
                            <option
                              key={value.id}
                              value={value.id}
                              disabled={skuValueUsage.has(`${attribute.id}:${value.id}`)}
                            >
                              {value.display_value || value.value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        (attribute.values || []).map((value) => {
                          const selected = (assignment.values || []).some(
                            (item) => Number(item.valueId ?? item.id ?? item) === Number(value.id),
                          );
                          return (
                            <label key={value.id} className="product-attribute-value">
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={skuValueUsage.has(`${attribute.id}:${value.id}`)}
                                onChange={(event) =>
                                  updateAttributeValues(
                                    attribute.id,
                                    event.target.checked
                                      ? [...(assignment.values || []).map((item) => Number(item.valueId ?? item.id ?? item)), Number(value.id)]
                                      : (assignment.values || []).map((item) => Number(item.valueId ?? item.id ?? item)).filter((id) => id !== Number(value.id)),
                                  )
                                }
                              />
                              <span
                                style={
                                  attribute.display_type === "swatch"
                                    ? { backgroundColor: value.metadata?.color || "#dfe9df" }
                                    : undefined
                                }
                              >
                                {value.display_value || value.value}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                  {assignment && skuAttributeUsage.has(Number(attribute.id)) && (
                    <p className="product-attribute-hint">
                      Values used by existing SKUs are locked. Update or archive those SKUs before removing them.
                    </p>
                  )}
                  {!assignment && <p className="product-attribute-hint">Select this option to choose allowed values.</p>}
                </fieldset>
              );
            })}
          </section>
          )}
          <section className="card">
            <h2>Gallery</h2>
            {id ? (
              <>
                <input
                  aria-label="Upload gallery images"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={uploadMedia}
                />
                <button type="button" onClick={openLibrary} disabled={busy}>
                  Choose from media library
                </button>
                {showLibrary && (
                  <div className="media-library-picker">
                    <div className="media-library-picker-head">
                      <b>Choose an image</b>
                      <button type="button" onClick={() => setShowLibrary(false)}>Close</button>
                    </div>
                    <div className="media-library-picker-grid">
                      {libraryAssets.map((asset) => (
                        <button type="button" key={`${asset.type}-${asset.id}`} onClick={() => attachLibraryAsset(asset)}>
                          <img src={imageUrl(asset.path)} alt={asset.altText || asset.name} />
                          <span>{asset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="media-grid">
                  {media.map((item) => (
                    <ProductMediaCard
                      key={item.id}
                      item={item}
                      src={imageUrl(item.file_path || item.path)}
                      onSave={updateMedia}
                      onRemove={removeMedia}
                      disabled={busy}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p>Save the item before uploading gallery media.</p>
            )}
          </section>
          {form.productType === "variant" && (
          <section className="card">
            <h2>Explicit SKUs</h2>
            <p>
              Safe deletion hides a SKU from storefront and retains history; any
              reserved stock is released and recorded before permanent deletion.
            </p>
            {skus.map((item) => (
              <div className="sku-editor" key={item.id}>
                <b>{item.sku}</b> · ₹{item.price} · On hand {item.on_hand ?? 0},
                reserved {item.reserved ?? 0} {item.deleted_at && "· Deleted"}
                <p>
                  Available:{" "}
                  {item.available ??
                    Number(item.on_hand || 0) - Number(item.reserved || 0)}{" "}
                  ·{" "}
                  {!item.track_inventory
                    ? "Not tracked"
                    : Number(item.available) > 0
                      ? "In stock"
                      : item.allow_backorder
                        ? "Backorder"
                        : "Out of stock"}
                </p>
                <p>
                  {(item.attributes || [])
                    .map((selection) => {
                      const attribute = attributes.find(
                        (entry) =>
                          Number(entry.id) === Number(selection.attribute_id),
                      );
                      const value = attribute?.values.find(
                        (entry) =>
                          Number(entry.id) ===
                          Number(selection.attribute_value_id),
                      );
                      return `${attribute?.name || selection.attribute_id}: ${value?.display_value || value?.value || selection.attribute_value_id}`;
                    })
                    .join(" / ")}
                </p>
                {canViewInventory && !item.deleted_at && (
                  <Link to={`/inventory/${item.id}`}>Manage inventory</Link>
                )}
                <button
                  type="button"
                  onClick={() =>
                    item.deleted_at
                      ? changeSkuLifecycle(item, true)
                      : (setEditingSkuId(item.id), setSku(normalizeSku(item)))
                  }
                >
                  {item.deleted_at ? "Restore" : "Edit"}
                </button>
                {!item.deleted_at && (
                  <button
                    type="button"
                    onClick={() => changeSkuLifecycle(item, false)}
                  >
                    Safe delete
                  </button>
                )}
                {item.deleted_at && (
                  <button
                    type="button"
                    className="sku-permanent-delete"
                    onClick={() => permanentlyDeleteSku(item)}
                  >
                    Permanently delete
                  </button>
                )}
                {editingSkuId === item.id && !item.deleted_at && (
                  <div className="sku-form">
                    <SkuFields
                      sku={sku}
                      onChange={setSku}
                      assignments={form.attributes}
                      attributes={attributes}
                      media={media}
                    />
                    <input
                      aria-label="SKU code"
                      value={sku.sku}
                      onChange={(event) =>
                        setSku({ ...sku, sku: event.target.value })
                      }
                    />
                    <input
                      aria-label="SKU title"
                      placeholder="Title"
                      value={sku.title}
                      onChange={(event) =>
                        setSku({ ...sku, title: event.target.value })
                      }
                    />
                    <input
                      aria-label="SKU price"
                      min="0"
                      step="0.01"
                      type="number"
                      value={sku.price}
                      onChange={(event) =>
                        setSku({ ...sku, price: event.target.value })
                      }
                    />
                    <input
                      aria-label="SKU MRP"
                      min="0"
                      step="0.01"
                      type="number"
                      value={sku.mrp}
                      onChange={(event) =>
                        setSku({ ...sku, mrp: event.target.value })
                      }
                    />
                    <button type="button" onClick={saveSku}>
                      Save SKU
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkuId(null);
                        setSku(emptySku);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
            {id && !editingSkuId && (
              <div className="sku-form">
                <SkuFields
                  sku={sku}
                  onChange={setSku}
                  assignments={form.attributes}
                  attributes={attributes}
                  media={media}
                />
                <input
                  aria-label="SKU code"
                  placeholder="SKU code"
                  value={sku.sku}
                  onChange={(event) =>
                    setSku({ ...sku, sku: event.target.value })
                  }
                />
                <input
                  aria-label="SKU title"
                  placeholder="SKU title"
                  value={sku.title}
                  onChange={(event) =>
                    setSku({ ...sku, title: event.target.value })
                  }
                />
                <input
                  aria-label="SKU price"
                  min="0"
                  step="0.01"
                  type="number"
                  placeholder="Price"
                  value={sku.price}
                  onChange={(event) =>
                    setSku({ ...sku, price: event.target.value })
                  }
                />
                <input
                  aria-label="SKU MRP"
                  min="0"
                  step="0.01"
                  type="number"
                  placeholder="MRP"
                  value={sku.mrp}
                  onChange={(event) =>
                    setSku({ ...sku, mrp: event.target.value })
                  }
                />
                <button type="button" onClick={saveSku}>
                  Add SKU
                </button>
              </div>
            )}
          </section>
          )}
          <ProductContentFields
            items={form.benefits}
            onChange={(items) => updateForm("benefits", items)}
          />
          <ProductContentFields
            ingredients
            items={form.ingredients}
            onChange={(items) => updateForm("ingredients", items)}
          />
          {error && <div className="error">{error}</div>}
          <button>{busy ? "Saving…" : "Save item"}</button>
        </fieldset>
      </form>
    </div>
  );
}
