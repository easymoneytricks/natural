import React, { useEffect, useState } from "react";
import {
  Archive,
  ImagePlus,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const media = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const api = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
  ).replace(/\/api\/v1\/?$/, "");
  return `${api}/${path.replace(/^\//, "")}`;
};
const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);

function Protected({ children }) {
  const { admin } = useAuth();
  if (admin?.effectivePermissions?.includes("catalog.view")) return children;
  return (
    <div className="card">
      <h1>Access denied</h1>
    </div>
  );
}

function CategoryEditor({ editing, categories, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({
    name: editing?.name || "",
    slug: editing?.slug || "",
    parentId: editing?.parentId || "",
    description: editing?.description || "",
    seoTitle: editing?.seo_title || "",
    seoDescription: editing?.seo_description || "",
    seoKeywords: editing?.seo_keywords || "",
    canonicalUrl: editing?.canonical_url || "",
    sortOrder: editing?.sort_order ?? 0,
    isActive: editing?.is_active ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editing?.slug));
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(
        editing?.id ? `/admin/categories/${editing.id}` : "/admin/categories",
        {
          method: editing?.id ? "PATCH" : "POST",
          body: {
            ...form,
            parentId: form.parentId || null,
            sortOrder: Number(form.sortOrder) || 0,
          },
        },
      );
      onSaved();
    } catch (caught) {
      setError(caught.message || "Unable to save this category.");
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
            <span className="section-kicker">CATALOG / CATEGORIES</span>
            <h2>{editing?.id ? "Edit category" : "Add a category"}</h2>
            <p>
              Organise products into a clear, customer-friendly discovery
              hierarchy.
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
              Category name <b>*</b>
            </span>
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
              placeholder="e.g. Cleansers"
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
            Parent category
            <select
              value={form.parentId}
              onChange={(event) => update("parentId", event.target.value)}
            >
              <option value="">Top-level category</option>
              {categories
                .filter(
                  (category) =>
                    category.id !== editing?.id && !category.deletedAt,
                )
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
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
            Category description
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="A short introduction for this category."
            />
          </label>
          <label>
            SEO title
            <input
              value={form.seoTitle}
              onChange={(event) => update("seoTitle", event.target.value)}
              placeholder="Category | Natural Beauty"
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
              placeholder="cleanser, sensitive skin, skincare"
            />
          </label>
          <label>
            Canonical URL
            <input
              type="url"
              value={form.canonicalUrl}
              onChange={(event) => update("canonicalUrl", event.target.value)}
              placeholder="https://example.com/shop/category"
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
              Inactive categories stay saved but are hidden from customers.
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
            {saving
              ? "Saving…"
              : editing?.id
                ? "Save changes"
                : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CategoriesPage() {
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
        `/admin/categories?q=${encodeURIComponent(query)}&deleted=${includeArchived}`,
      );
      setRows(response.data || []);
    } catch (caught) {
      setError(caught.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query, includeArchived]);
  const action = async (category, path, method, message) => {
    setBusyId(category.id);
    try {
      await authFetch(`/admin/categories/${category.id}${path}`, { method });
      setNotice(message);
      await load();
    } catch (caught) {
      setError(
        caught.message || "This category action could not be completed.",
      );
    } finally {
      setBusyId(null);
    }
  };
  const archive = (category) => {
    if (
      window.confirm(
        `Archive ${category.name}? Child categories must be moved first.`,
      )
    )
      action(category, "", "DELETE", `${category.name} was archived.`);
  };
  const permanentlyDelete = (category) => {
    if (
      window.confirm(
        `Permanently delete ${category.name}? This cannot be undone.`,
      )
    )
      action(
        category,
        "/permanent",
        "DELETE",
        `${category.name} was permanently deleted.`,
      );
  };
  const upload = async (category, file) => {
    if (!file) return;
    setBusyId(category.id);
    try {
      const body = new FormData();
      body.append("image", file);
      await authFetch(`/admin/categories/${category.id}/image`, {
        method: "POST",
        body,
        headers: {},
      });
      setNotice(`${category.name} image updated.`);
      await load();
    } catch (caught) {
      setError(caught.message || "Unable to upload this image.");
    } finally {
      setBusyId(null);
    }
  };
  return (
    <Protected>
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CATALOG MANAGEMENT</span>
          <h1>Categories</h1>
          <p>
            Shape a simple hierarchy that helps customers find the right routine
            faster.
          </p>
        </div>
        <button onClick={() => setEditing({})}>
          <Plus size={17} /> Add category
        </button>
      </div>
      <div className="catalog-summary">
        <div>
          <span>Total categories</span>
          <b>{rows.filter((row) => !row.deletedAt).length}</b>
        </div>
        <div>
          <span>Parent categories</span>
          <b>{rows.filter((row) => !row.parentId && !row.deletedAt).length}</b>
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
            placeholder="Search categories by name or slug"
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
            <p>Loading categories…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="catalog-state">
            <Layers size={26} />
            <h2>
              {query ? "No categories found" : "Your category tree is empty"}
            </h2>
            <p>
              {query
                ? "Try a different search term."
                : "Add a top-level category to start organising products."}
            </p>
            <button onClick={() => setEditing({})}>
              <Plus size={16} /> Add category
            </button>
          </div>
        ) : (
          <div className="brand-table">
            {rows.map((category) => (
              <article
                className={`brand-row ${category.deletedAt ? "is-archived" : ""}`}
                key={category.id}
              >
                <div className="brand-identity">
                  <div className="brand-logo-frame">
                    {category.image ? (
                      <img
                        src={media(category.image)}
                        alt={`${category.name} category`}
                      />
                    ) : (
                      <Layers size={20} />
                    )}
                  </div>
                  <div>
                    <h2>
                      {category.parentId ? (
                        <span className="tree-indent">↳ </span>
                      ) : null}
                      {category.name}
                    </h2>
                    <p>/{category.slug}</p>
                    {category.deletedAt && (
                      <span className="status-pill archived">Archived</span>
                    )}
                  </div>
                </div>
                <div className="brand-description">
                  {category.description || (
                    <span className="muted-copy">No description added</span>
                  )}
                </div>
                <div className="brand-stat">
                  <span>Products / children</span>
                  <b>
                    {category.productCount} / {category.childCount}
                  </b>
                </div>
                <div className="brand-media">
                  <label className="upload-control">
                    <ImagePlus size={16} />
                    <span>
                      {category.image ? "Replace image" : "Add image"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        upload(category, event.target.files?.[0])
                      }
                    />
                  </label>
                </div>
                <div className="brand-actions">
                  <button
                    className="icon-button"
                    onClick={() => setEditing(category)}
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  {category.deletedAt ? (
                    <>
                      <button
                        className="icon-button"
                        onClick={() =>
                          action(
                            category,
                            "/restore",
                            "POST",
                            `${category.name} is visible again.`,
                          )
                        }
                        disabled={busyId === category.id}
                        aria-label={`Restore ${category.name}`}
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => permanentlyDelete(category)}
                        disabled={busyId === category.id}
                        aria-label={`Permanently delete ${category.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="icon-button"
                      onClick={() => archive(category)}
                      disabled={busyId === category.id}
                      aria-label={`Archive ${category.name}`}
                    >
                      <Archive size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {editing && (
        <CategoryEditor
          editing={editing.id ? editing : null}
          categories={rows}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setNotice(
              editing.id
                ? "Category changes saved."
                : "Category created successfully.",
            );
            load();
          }}
        />
      )}
    </Protected>
  );
}
