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
  const [loading, setLoading] = useState(true);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const canManage = admin?.effectivePermissions?.includes("catalog.manage");
  const canViewInventory =
    admin?.effectivePermissions?.includes("inventory.view");

  const updateForm = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

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
      isActive: !!product.is_active,
      isFeatured: !!product.featured,
      isBestSeller: !!product.best_seller,
      isNewArrival: !!product.new_arrival,
      seoTitle: product.seo_title || "",
      seoDescription: product.seo_description || "",
      seoKeywords: product.seo_keywords || "",
      canonicalUrl: product.canonical_url || "",
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
      setMessage("Product saved successfully.");
      if (id) await load();
      navigate(`/catalog/products/${productId}`);
    } catch (caught) {
      setError(caught.message || "Could not save product.");
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
      title: restore ? "Restore this SKU?" : "Archive this SKU?",
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

  const changeProductLifecycle = () =>
    setConfirmation({
      title: deleted ? "Restore this product?" : "Archive this product?",
      description: deleted
        ? "The product returns as a draft for review."
        : "The product is hidden from sale. Order snapshots and inventory records remain intact.",
      onConfirm: async () => {
        await authFetch(`/admin/products/${id}${deleted ? "/restore" : ""}`, {
          method: deleted ? "POST" : "DELETE",
        });
        await load();
      },
    });

  if (loading) return <div className="loading">Loading product editor…</div>;
  return (
    <div className="product-editor-page">
      <div className="page-head product-page-head">
        <div>
          <h1>{id ? "Edit product" : "New product"}</h1>
          <p>
            Manage content, allowed values, media, and explicit sellable SKUs.
          </p>
        </div>
        <Link to="/catalog/products">Back to products</Link>
      </div>
      <div className="actions">
        {id && canManage && (
          <button type="button" onClick={changeProductLifecycle}>
            {deleted ? "Restore product" : "Archive product"}
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
          This product is archived. Restore it before editing.
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
                placeholder="auto-generated from product name"
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
              Product type
              <select
                value={form.productType}
                onChange={(event) =>
                  updateForm("productType", event.target.value)
                }
              >
                <option value="simple">Simple</option>
                <option value="variant">Variant</option>
              </select>
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
                placeholder="hydration, barrier care, moisturizer"
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
                placeholder="https://example.com/product/product-slug"
              />
            </label>
            {[
              ["shortDescription", "Short description"],
              ["description", "Description"],
              ["ingredientsText", "Ingredients text"],
              ["howToUse", "How to use"],
              ["texture", "Texture"],
              ["usageTime", "Usage time"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <textarea
                  value={form[key] || ""}
                  onChange={(event) => updateForm(key, event.target.value)}
                />
              </label>
            ))}
          </section>
          <section className="card">
            <h2>Categories</h2>
            <label>
              Primary category
              <select
                value={form.categories.find((item) => item.isPrimary)?.id || ""}
                onChange={(event) =>
                  updateForm(
                    "categories",
                    form.categories.map((item) => ({
                      ...item,
                      isPrimary: Number(item.id) === Number(event.target.value),
                    })),
                  )
                }
              >
                <option value="">Select primary category</option>
                {categories
                  .filter((category) =>
                    form.categories.some(
                      (item) => Number(item.id) === Number(category.id),
                    ),
                  )
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </label>
            {categories.map((category) => (
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
                              isPrimary: form.categories.length === 0,
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
          <section className="card">
            <h2>Product attributes</h2>
            <p>
              Allowed values do not automatically create variants. Save product
              attribute changes before adding or editing a SKU combination.
            </p>
            {attributes.map((attribute) => {
              const assignment = form.attributes.find(
                (item) => Number(item.attributeId) === Number(attribute.id),
              );
              return (
                <div key={attribute.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!assignment}
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
                    {attribute.name}
                  </label>
                  {assignment && (
                    <label>
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
                  {assignment &&
                    (attribute.values || []).map((value) => (
                      <label key={value.id}>
                        <input
                          type="checkbox"
                          checked={(assignment.values || []).some(
                            (item) =>
                              Number(item.valueId ?? item.id ?? item) ===
                              Number(value.id),
                          )}
                          onChange={(event) =>
                            updateForm(
                              "attributes",
                              form.attributes.map((item) =>
                                Number(item.attributeId) !==
                                Number(attribute.id)
                                  ? item
                                  : {
                                      ...item,
                                      values: event.target.checked
                                        ? [
                                            ...(item.values || []),
                                            { valueId: value.id },
                                          ]
                                        : (item.values || []).filter(
                                            (entry) =>
                                              Number(
                                                entry.valueId ??
                                                  entry.id ??
                                                  entry,
                                              ) !== Number(value.id),
                                          ),
                                    },
                              ),
                            )
                          }
                        />
                        {value.display_value || value.value}
                      </label>
                    ))}
                </div>
              );
            })}
          </section>
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
              <p>Save the product before uploading gallery media.</p>
            )}
          </section>
          <section className="card">
            <h2>Explicit SKUs</h2>
            <p>
              Safe deletion hides a SKU from storefront and retains history;
              reserved stock blocks deletion.
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
          <button>{busy ? "Saving…" : "Save product"}</button>
        </fieldset>
      </form>
    </div>
  );
}
