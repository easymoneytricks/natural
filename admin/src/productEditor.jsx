import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./main";
import { SkuFields } from "./skuFields";
import { ProductContentFields } from "./productContentFields";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/api\/v1\/?$/, "");

const imageUrl = (path) =>
  path
    ? path.startsWith("http")
      ? path
      : `${API_ROOT}/${path.replace(/^\//, "")}`
    : "";

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
    isRequired: item.isRequired ?? item.is_required ?? true,
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
  const { authFetch } = useAuth();
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

    if (!id) return;
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
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load product."));
  }, [id]);

  const saveProduct = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await authFetch(
        id ? `/admin/products/${id}` : "/admin/products",
        {
          method: id ? "PATCH" : "POST",
          body: form,
        },
      );
      const productId = id || response.data.id;
      await authFetch(`/admin/products/${productId}/content`, {
        method: "PUT",
        body: {
          benefits: form.benefits,
          ingredients: form.ingredients,
          attributes: form.attributes,
        },
      });
      navigate(`/catalog/products/${productId}`);
    } catch (caught) {
      setError(caught.message || "Could not save product.");
    }
  };

  const uploadMedia = async (event) => {
    if (!id) return;
    try {
      const body = new FormData();
      [...event.target.files].forEach((file) => body.append("images", file));
      const response = await authFetch(`/admin/products/${id}/media`, {
        method: "POST",
        body,
      });
      setMedia((current) => [...response.data, ...current]);
    } catch (caught) {
      setError(caught.message || "Upload failed.");
    }
  };

  const updateMedia = async (item, changes) => {
    try {
      await authFetch(`/admin/products/${id}/media/${item.id}`, {
        method: "PATCH",
        body: changes,
      });
      await load();
    } catch (caught) {
      setError(caught.message || "Could not update media.");
    }
  };

  const removeMedia = async (item) => {
    if (!window.confirm("Remove this image from the product gallery?")) return;
    try {
      await authFetch(`/admin/products/${id}/media/${item.id}`, {
        method: "DELETE",
      });
      await load();
    } catch (caught) {
      setError(caught.message || "Could not remove media.");
    }
  };

  const saveSku = async () => {
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
      await load();
    } catch (caught) {
      setError(caught.message || "Could not save SKU.");
    }
  };

  const changeSkuLifecycle = async (item, restore) => {
    if (
      !restore &&
      !window.confirm(
        `Safe-delete SKU ${item.sku}? It will be hidden from the storefront.`,
      )
    )
      return;
    try {
      await authFetch(
        `/admin/products/${id}/skus/${item.id}${restore ? "/restore" : ""}`,
        {
          method: restore ? "POST" : "DELETE",
        },
      );
      await load();
    } catch (caught) {
      setError(caught.message || "SKU lifecycle action failed.");
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{id ? "Edit product" : "New product"}</h1>
          <p>
            Manage content, allowed values, media, and explicit sellable SKUs.
          </p>
        </div>
        <Link to="/catalog/products">Back to products</Link>
      </div>
      <form onSubmit={saveProduct}>
        <section className="card">
          <h2>General</h2>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(event) => updateForm("slug", event.target.value)}
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
              onChange={(event) => updateForm("basePrice", event.target.value)}
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
          <p>Allowed values do not automatically create variants.</p>
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
                              Number(item.attributeId) !== Number(attribute.id)
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
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadMedia}
              />
              <div className="media-grid">
                {media.map((item) => (
                  <div className="media-item" key={item.id}>
                    <img
                      className="thumb"
                      src={imageUrl(item.file_path || item.path)}
                      alt={item.alt_text || ""}
                    />
                    <label>
                      Alt text
                      <input
                        defaultValue={item.alt_text || ""}
                        onBlur={(event) =>
                          updateMedia(item, {
                            altText: event.target.value,
                            sortOrder: item.sort_order,
                            primary: !!item.is_primary,
                          })
                        }
                      />
                    </label>
                    <label>
                      Order
                      <input
                        type="number"
                        min="0"
                        defaultValue={item.sort_order || 0}
                        onBlur={(event) =>
                          updateMedia(item, {
                            sortOrder: event.target.value,
                            altText: item.alt_text,
                            primary: !!item.is_primary,
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateMedia(item, {
                          sortOrder: item.sort_order,
                          altText: item.alt_text,
                          primary: true,
                        })
                      }
                    >
                      {item.is_primary ? "Primary image" : "Make primary"}
                    </button>
                    <button type="button" onClick={() => removeMedia(item)}>
                      Remove
                    </button>
                  </div>
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
                    value={sku.sku}
                    onChange={(event) =>
                      setSku({ ...sku, sku: event.target.value })
                    }
                  />
                  <input
                    placeholder="Title"
                    value={sku.title}
                    onChange={(event) =>
                      setSku({ ...sku, title: event.target.value })
                    }
                  />
                  <input
                    type="number"
                    value={sku.price}
                    onChange={(event) =>
                      setSku({ ...sku, price: event.target.value })
                    }
                  />
                  <input
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
                placeholder="SKU code"
                value={sku.sku}
                onChange={(event) =>
                  setSku({ ...sku, sku: event.target.value })
                }
              />
              <input
                type="number"
                placeholder="Price"
                value={sku.price}
                onChange={(event) =>
                  setSku({ ...sku, price: event.target.value })
                }
              />
              <input
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
        <button>Save product</button>
      </form>
    </div>
  );
}
