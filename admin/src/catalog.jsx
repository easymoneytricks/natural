import React, { useEffect, useState } from "react";
import {
  Archive,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const media = (p) =>
  p
    ? p.startsWith("http")
      ? p
      : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1").replace(/\/api\/v1\/?$/, "")}/${p.replace(/^\//, "")}`
    : "";
const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);
function Editor({ type, editing, onDone }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(
    editing || {
      name: "",
      slug: "",
      description: "",
      websiteUrl: "",
      parentId: "",
      sortOrder: 0,
    },
  );
  const [error, setError] = useState("");
  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          await authFetch(
            editing ? `/admin/${type}/${editing.id}` : `/admin/${type}`,
            { method: editing ? "PATCH" : "POST", body: form },
          );
          onDone();
        } catch (x) {
          setError(x.message || "Could not save.");
        }
      }}
    >
      <h2>
        {editing ? "Edit" : "Add"} {type.slice(0, -1)}
      </h2>
      <label>
        Name
        <input
          required
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label>
        Slug
        <input
          value={form.slug || ""}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </label>
      {type === "brands" ? (
        <label>
          Website URL
          <input
            value={form.websiteUrl || ""}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          />
        </label>
      ) : (
        <label>
          Parent ID (optional)
          <input
            value={form.parentId || ""}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          />
        </label>
      )}
      <label>
        Description
        <textarea
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      {error && <div className="error">{error}</div>}
      <div className="actions">
        <button>Save</button>
        <button type="button" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
function Manager({ type }) {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const load = () =>
    authFetch(`/admin/${type}?q=${encodeURIComponent(q)}`)
      .then((r) => setRows(r.data))
      .catch(() => setError("Unable to load records."));
  useEffect(() => {
    load();
  }, [q]);
  const remove = async (r) => {
    try {
      await authFetch(`/admin/${type}/${r.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message || "Delete was blocked.");
    }
  };
  const restore = async (r) => {
    await authFetch(`/admin/${type}/${r.id}/restore`, { method: "POST" });
    load();
  };
  const upload = async (r, file) => {
    const fd = new FormData();
    fd.append("image", file);
    await authFetch(`/admin/${type}/${r.id}/image`, {
      method: "POST",
      headers: {},
      body: fd,
    });
    load();
  };
  return (
    <ProtectedCatalog>
      <div className="page-head">
        <div>
          <h1>{type[0].toUpperCase() + type.slice(1)}</h1>
          <p>Manage active catalog records and media.</p>
        </div>
        <button onClick={() => setEditing({})}>Add {type.slice(0, -1)}</button>
      </div>
      {editing && (
        <Editor
          type={type}
          editing={editing.id ? editing : null}
          onDone={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      <div className="toolbar">
        <input
          placeholder="Search by name or slug"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Usage</th>
              <th>Media</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.name}</b>
                  {type === "categories" && r.parentId && (
                    <small>Parent #{r.parentId}</small>
                  )}
                </td>
                <td>{r.slug}</td>
                <td>{r.productCount} products</td>
                <td>
                  {r.logo || r.image ? (
                    <img className="thumb" src={media(r.logo || r.image)} />
                  ) : (
                    <span>—</span>
                  )}
                  <label className="file">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) =>
                        e.target.files[0] && upload(r, e.target.files[0])
                      }
                    />
                    Upload
                  </label>
                </td>
                <td>
                  <button onClick={() => setEditing(r)}>Edit</button>
                  <button onClick={() => remove(r)}>Archive</button>
                  {r.deletedAt && (
                    <button onClick={() => restore(r)}>Restore</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedCatalog>
  );
}

function BrandEditor({ editing, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(() => ({
    name: editing?.name || "",
    slug: editing?.slug || "",
    websiteUrl: editing?.website_url || editing?.websiteUrl || "",
    description: editing?.description || "",
    seoTitle: editing?.seo_title || "",
    seoDescription: editing?.seo_description || "",
    seoKeywords: editing?.seo_keywords || "",
    canonicalUrl: editing?.canonical_url || "",
    sortOrder: editing?.sort_order ?? 0,
    isActive: editing?.is_active ?? true,
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editing?.slug));

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await authFetch(
        editing?.id ? `/admin/brands/${editing.id}` : "/admin/brands",
        {
          method: editing?.id ? "PATCH" : "POST",
          body: { ...form, sortOrder: Number(form.sortOrder) || 0 },
        },
      );
      onSaved();
    } catch (caught) {
      setError(caught.message || "Unable to save this entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="catalog-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="catalog-modal brand-editor"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="section-kicker">CATALOG / BRANDS</span>
            <h2>{editing?.id ? "Edit entry" : "Add an entry"}</h2>
            <p>
              Manage identity, content and discovery details for this catalog
              entry.
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>
        <div className="editor-grid">
          <label>
            <span className="field-label">
              Name <b>*</b>
            </span>
            <input
              value={form.name}
              required
              onChange={(event) => {
                const name = event.target.value;
                setForm((current) => ({
                  ...current,
                  name,
                  ...(!slugTouched ? { slug: slugify(name) } : {}),
                }));
              }}
              placeholder="e.g. Herb & Hearth"
              autoFocus
            />
          </label>
          <label>
            URL slug
            <input
              value={form.slug}
              onChange={(event) => {
                const slug = event.target.value;
                setSlugTouched(Boolean(slug.trim()));
                update("slug", slug);
              }}
              onBlur={() => {
                if (!form.slug.trim()) {
                  setSlugTouched(false);
                  update("slug", slugify(form.name));
                }
              }}
              placeholder="auto-generated if blank"
            />
          </label>
          <label>
            Website URL
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(event) => update("websiteUrl", event.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <label>
            Sort order
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(event) => update("sortOrder", event.target.value)}
            />
          </label>
          <label className="field-wide">
            Description
            <textarea
              value={form.description}
              rows="4"
              onChange={(event) => update("description", event.target.value)}
              placeholder="A short introduction for this catalog entry."
            />
          </label>
          <label>
            SEO title
            <input
              value={form.seoTitle}
              onChange={(event) => update("seoTitle", event.target.value)}
              placeholder="Page title"
            />
          </label>
          <label>
            SEO description
            <input
              value={form.seoDescription}
              onChange={(event) => update("seoDescription", event.target.value)}
              placeholder="A concise search description"
            />
          </label>
          <label>
            SEO keywords
            <input
              value={form.seoKeywords}
              onChange={(event) => update("seoKeywords", event.target.value)}
              placeholder="keyword, phrase, topic"
            />
          </label>
          <label>
            Canonical URL
            <input
              type="url"
              value={form.canonicalUrl}
              onChange={(event) => update("canonicalUrl", event.target.value)}
              placeholder="https://example.com/catalog/entry"
            />
          </label>
        </div>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update("isActive", event.target.checked)}
          />
          <span>
            <b>Visible in storefront</b>
            <small>
              Inactive entries stay saved but are hidden from customers.
            </small>
          </span>
        </label>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving && <LoaderCircle className="spin" size={16} />}
            {saving ? "Saving…" : editing?.id ? "Save changes" : "Create entry"}
          </button>
        </div>
      </form>
    </div>
  );
}

function BrandsManager() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch(
        `/admin/brands?q=${encodeURIComponent(query)}&deleted=${includeArchived}`,
      );
      setRows(response.data || []);
    } catch (caught) {
      setError(caught.message || "Unable to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query, includeArchived]);

  const archive = async (brand) => {
    if (
      !window.confirm(
        `Archive ${brand.name}? Products will keep their historical brand reference.`,
      )
    )
      return;
    setBusyId(brand.id);
    try {
      await authFetch(`/admin/brands/${brand.id}`, { method: "DELETE" });
      setNotice(`${brand.name} was archived.`);
      await load();
    } catch (caught) {
      setError(caught.message || "Unable to archive this brand.");
    } finally {
      setBusyId(null);
    }
  };

  const restore = async (brand) => {
    setBusyId(brand.id);
    try {
      await authFetch(`/admin/brands/${brand.id}/restore`, { method: "POST" });
      setNotice(`${brand.name} is visible again.`);
      await load();
    } catch (caught) {
      setError(caught.message || "Unable to restore this brand.");
    } finally {
      setBusyId(null);
    }
  };

  const removePermanently = async (brand) => {
    if (
      !window.confirm(
        `Permanently delete ${brand.name}? This cannot be undone.`,
      )
    )
      return;
    setBusyId(brand.id);
    try {
      await authFetch(`/admin/brands/${brand.id}/permanent`, {
        method: "DELETE",
      });
      setNotice(`${brand.name} was permanently deleted.`);
      await load();
    } catch (caught) {
      setError(caught.message || "Permanent deletion was blocked.");
    } finally {
      setBusyId(null);
    }
  };

  const upload = async (brand, file) => {
    if (!file) return;
    setBusyId(brand.id);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      await authFetch(`/admin/brands/${brand.id}/image`, {
        method: "POST",
        body,
        headers: {},
      });
      setNotice(`${brand.name} logo updated.`);
      await load();
    } catch (caught) {
      setError(caught.message || "Unable to upload this logo.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ProtectedCatalog>
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CATALOG MANAGEMENT</span>
          <h1>Brands</h1>
          <p>
            Build a considered brand directory with clean identity, imagery and
            storefront visibility.
          </p>
        </div>
        <button onClick={() => setEditing({})}>
          <Plus size={17} /> Add brand
        </button>
      </div>
      <div className="catalog-summary">
        <div>
          <span>Total brands</span>
          <b>{rows.filter((row) => !row.deletedAt).length}</b>
        </div>
        <div>
          <span>With logo</span>
          <b>{rows.filter((row) => row.logo).length}</b>
        </div>
        <div>
          <span>Products linked</span>
          <b>
            {rows.reduce(
              (total, row) => total + Number(row.productCount || 0),
              0,
            )}
          </b>
        </div>
      </div>
      <div className="catalog-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brands by name or slug"
          />
        </div>
        <label className="archive-toggle">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(event) => setIncludeArchived(event.target.checked)}
          />{" "}
          Show archived
        </label>
      </div>
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="brand-list card">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading brands…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="catalog-state">
            <LeafMark />
            <h2>
              {query ? "No brands found" : "Your brand directory is empty"}
            </h2>
            <p>
              {query
                ? "Try a different search term."
                : "Add your first partner brand to start building the catalog."}
            </p>
            <button onClick={() => setEditing({})}>
              <Plus size={16} /> Add brand
            </button>
          </div>
        ) : (
          <div className="brand-table">
            {rows.map((brand) => (
              <article
                className={`brand-row ${brand.deletedAt ? "is-archived" : ""}`}
                key={brand.id}
              >
                <div className="brand-identity">
                  <div className="brand-logo-frame">
                    {brand.logo ? (
                      <img src={media(brand.logo)} alt={`${brand.name} logo`} />
                    ) : (
                      <LeafMark />
                    )}
                  </div>
                  <div>
                    <h2>{brand.name}</h2>
                    <p>/{brand.slug}</p>
                    {brand.deletedAt && (
                      <span className="status-pill archived">Archived</span>
                    )}
                  </div>
                </div>
                <div className="brand-description">
                  {brand.description || (
                    <span className="muted-copy">No description added</span>
                  )}
                </div>
                <div className="brand-stat">
                  <span>Products</span>
                  <b>{brand.productCount}</b>
                </div>
                <div className="brand-media">
                  <label className="upload-control">
                    <ImagePlus size={16} />
                    <span>{brand.logo ? "Replace logo" : "Add logo"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        upload(brand, event.target.files?.[0])
                      }
                    />
                  </label>
                </div>
                <div className="brand-actions">
                  <button
                    className="icon-button"
                    onClick={() => setEditing(brand)}
                    aria-label={`Edit ${brand.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  {brand.deletedAt ? (
                    <>
                      <button
                        className="icon-button"
                        onClick={() => restore(brand)}
                        disabled={busyId === brand.id}
                        aria-label={`Restore ${brand.name}`}
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => removePermanently(brand)}
                        disabled={busyId === brand.id}
                        aria-label={`Permanently delete ${brand.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="icon-button"
                      onClick={() => archive(brand)}
                      disabled={busyId === brand.id}
                      aria-label={`Archive ${brand.name}`}
                    >
                      <Archive size={16} />
                    </button>
                  )}
                  {brand.website_url && (
                    <a
                      className="icon-button"
                      href={brand.website_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${brand.name} website`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {editing && (
        <BrandEditor
          editing={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setNotice(
              editing.id
                ? "Brand changes saved."
                : "Brand created successfully.",
            );
            load();
          }}
        />
      )}
    </ProtectedCatalog>
  );
}

function LeafMark() {
  return (
    <span className="brand-placeholder" aria-hidden="true">
      NB
    </span>
  );
}
function ProtectedCatalog({ children }) {
  const { admin } = useAuth();
  return admin?.effectivePermissions?.includes("catalog.view") ? (
    children
  ) : (
    <div className="card">
      <h1>Access denied</h1>
    </div>
  );
}
export const BrandsPage = () => <BrandsManager />;
export { CategoriesPage } from "./categories";
export function ProductsPage() {
  const { authFetch } = useAuth();
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]),
    [q, setQ] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    authFetch(`/admin/products?q=${encodeURIComponent(q)}&deleted=${deleted}`)
      .then((r) => setRows(r.data || []))
      .catch((caught) => setError(caught.message || "Unable to load products."))
      .finally(() => setLoading(false));
  }, [q, deleted]);
  return (
    <ProtectedCatalog>
      <div className="page-head catalog-page-head product-list-head">
        <div>
          <span className="section-kicker">CATALOG MANAGEMENT</span>
          <h1>Products</h1>
          <p>Manage products, content, media and explicit sellable SKUs.</p>
          <label className="archive-toggle">
            <input
              type="checkbox"
              checked={deleted}
              onChange={(event) => setDeleted(event.target.checked)}
            />
            Show archived products
          </label>
          {error && <p role="alert">{error}</p>}
        </div>
        <a className="primary-link" href="/catalog/products/new">
          Add product
        </a>
      </div>
      <div className="catalog-toolbar product-list-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search products by name or slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="card table-wrap product-table-wrap">
        {loading && (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading products…</p>
          </div>
        )}
        {!loading && !rows.length && (
          <div className="catalog-state">
            <Package size={26} />
            <h2>{q ? "No products found" : "Your product catalog is empty"}</h2>
            <p>
              {q
                ? "Try a different search term."
                : "Create your first product to start selling."}
            </p>
            <a className="primary-link" href="/catalog/products/new">
              Add product
            </a>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Status</th>
                <th>SKUs</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.primaryImage && (
                      <img
                        className="product-list-thumb"
                        src={media(r.primaryImage)}
                        alt=""
                      />
                    )}
                    <a href={`/catalog/products/${r.id}`}>{r.name}</a>
                    <small>{r.slug}</small>
                  </td>
                  <td>{r.brand?.name || "—"}</td>
                  <td>
                    {r.status}
                    {r.is_active ? "" : " · inactive"}
                  </td>
                  <td>
                    {r.activeSkuCount}/{r.skuCount}
                  </td>
                  <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedCatalog>
  );
}
export function InventoryPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    authFetch("/admin/inventory").then((r) => setRows(r.data));
    authFetch("/admin/inventory/summary").then((r) => setSummary(r.data));
  }, []);
  return (
    <ProtectedCatalog>
      <h1>Inventory</h1>
      <p>
        Track stock availability and inventory movements across product SKUs.
      </p>
      {summary && (
        <div className="metrics">
          <div className="metric">
            <span>Tracked SKUs</span>
            <b>{summary.trackedSkuCount}</b>
          </div>
          <div className="metric">
            <span>Low stock</span>
            <b>{summary.lowStockSkuCount}</b>
          </div>
          <div className="metric">
            <span>Reserved units</span>
            <b>{summary.totalReservedUnits}</b>
          </div>
        </div>
      )}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku_id}>
                <td>
                  <b>{r.product_name}</b>
                  <small>
                    {r.sku}
                    {r.variant_title ? ` · ${r.variant_title}` : ""}
                  </small>
                </td>
                <td>{r.quantity_on_hand}</td>
                <td>{r.reserved_quantity}</td>
                <td>{r.available_quantity}</td>
                <td>{r.stock_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedCatalog>
  );
}
