import React, { useEffect, useMemo, useState } from "react";
import { FileText, LoaderCircle, Plus, Search, X } from "lucide-react";
import { useAuth } from "./main";

const emptyPage = {
  title: "",
  slug: "",
  eyebrow: "",
  intro: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  content: [["Overview", ""]],
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function PageEditor({ page, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(page || emptyPage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }));
  const updateSection = (index, key, value) => {
    setForm((current) => ({
      ...current,
      content: current.content.map((section, itemIndex) =>
        itemIndex === index
          ? section.map((item, itemKey) => (itemKey === key ? value : item))
          : section,
      ),
    }));
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const path = page?.id ? `/admin/pages/${page.id}` : "/admin/pages";
      await authFetch(path, {
        method: page?.id ? "PATCH" : "POST",
        body: form,
      });
      onSaved();
    } catch (caught) {
      setError(caught.message || "Unable to save page.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="page-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="page-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="page-modal-header">
          <div>
            <span className="section-kicker">CONTENT / PAGES</span>
            <h2>{page ? "Edit page" : "Create page"}</h2>
            <p>Publish a clear, useful page for your customers.</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X size={19} />
          </button>
        </header>
        <form onSubmit={save} className="page-editor-form">
          <div className="form-grid two">
            <label>
              Title *
              <input
                required
                value={form.title}
                onChange={(event) => {
                  set("title", event.target.value);
                  if (!page) set("slug", slugify(event.target.value));
                }}
              />
            </label>
            <label>
              URL slug *
              <input
                required
                value={form.slug}
                onChange={(event) => set("slug", slugify(event.target.value))}
              />
            </label>
          </div>
          <div className="form-grid two">
            <label>
              Eyebrow
              <input
                value={form.eyebrow}
                onChange={(event) => set("eyebrow", event.target.value)}
                placeholder="THE NATURAL BEAUTY NOTE"
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => set("status", event.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <label>
            Intro
            <textarea
              rows="3"
              value={form.intro}
              onChange={(event) => set("intro", event.target.value)}
              placeholder="A short introduction for this page"
            />
          </label>
          <div className="page-sections-heading">
            <div>
              <span className="section-kicker">PAGE CONTENT</span>
              <h3>Editorial sections</h3>
            </div>
            <button
              type="button"
              className="button-secondary"
              onClick={() => set("content", [...form.content, ["", ""]])}
            >
              <Plus size={15} /> Add section
            </button>
          </div>
          <div className="page-section-editor">
            {form.content.map((section, index) => (
              <div className="page-section-row" key={`${index}-${section[0]}`}>
                <label>
                  Heading
                  <input
                    value={section[0]}
                    onChange={(event) =>
                      updateSection(index, 0, event.target.value)
                    }
                  />
                </label>
                <label>
                  Body
                  <textarea
                    rows="4"
                    value={section[1]}
                    onChange={(event) =>
                      updateSection(index, 1, event.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() =>
                    set(
                      "content",
                      form.content.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                  aria-label="Remove section"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="page-sections-heading">
            <div>
              <span className="section-kicker">SEARCH PREVIEW</span>
              <h3>SEO metadata</h3>
            </div>
          </div>
          <div className="form-grid two">
            <label>
              SEO title
              <input
                value={form.seoTitle}
                onChange={(event) => set("seoTitle", event.target.value)}
              />
            </label>
            <label>
              SEO description
              <textarea
                rows="2"
                value={form.seoDescription}
                onChange={(event) => set("seoDescription", event.target.value)}
              />
            </label>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <footer className="page-modal-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button disabled={saving}>
              {saving && <LoaderCircle className="spin" size={15} />}{" "}
              {page ? "Save changes" : "Create page"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export function PagesPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/admin/pages?q=${encodeURIComponent(query)}&status=${status}`,
      );
      setRows(response.data || []);
    } catch (caught) {
      setError(caught.message || "Unable to load pages.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query, status]);
  const counts = useMemo(
    () => ({
      total: rows.length,
      published: rows.filter((row) => row.status === "published").length,
      drafts: rows.filter((row) => row.status === "draft").length,
    }),
    [rows],
  );
  return (
    <div className="pages-admin-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CONTENT / PAGES</span>
          <h1>Pages</h1>
          <p>Manage legal, help and editorial pages from one place.</p>
        </div>
        <button onClick={() => setEditing(emptyPage)}>
          <Plus size={17} /> Add page
        </button>
      </div>
      <div className="pages-summary">
        <div>
          <span>Total pages</span>
          <b>{counts.total}</b>
        </div>
        <div>
          <span>Published</span>
          <b>{counts.published}</b>
        </div>
        <div>
          <span>Drafts</span>
          <b>{counts.drafts}</b>
        </div>
      </div>
      <div className="pages-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages by title or slug"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="card pages-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading pages…</p>
          </div>
        ) : !rows.length ? (
          <div className="catalog-state">
            <FileText size={25} />
            <h3>No pages yet</h3>
            <p>Create your first legal or editorial page.</p>
          </div>
        ) : (
          <>
            {rows.map((row) => (
              <div className="pages-table-row" key={row.id}>
                <div className="page-row-title">
                  <div className="page-row-icon">
                    <FileText size={18} />
                  </div>
                  <div>
                    <strong>{row.title}</strong>
                    <small>/pages/{row.slug}</small>
                  </div>
                </div>
                <span className={`status-pill ${row.status}`}>
                  {row.status}
                </span>
                <span className="page-seo-state">
                  {row.seoTitle ? "SEO ready" : "SEO missing"}
                </span>
                <time>
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleDateString("en-IN")
                    : "—"}
                </time>
                <button
                  className="icon-button"
                  onClick={async () => {
                    const detail = await authFetch(`/admin/pages/${row.id}`);
                    setEditing(detail.data);
                  }}
                  aria-label={`Edit ${row.title}`}
                >
                  ✎
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      {editing && (
        <PageEditor
          page={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
