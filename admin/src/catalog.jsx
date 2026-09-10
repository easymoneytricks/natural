import React, { useEffect, useState } from "react";
import { useAuth } from "./main";

const media = (p) =>
  p
    ? p.startsWith("http")
      ? p
      : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1").replace(/\/api\/v1\/?$/, "")}/${p.replace(/^\//, "")}`
    : "";
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
export const BrandsPage = () => <Manager type="brands" />;
export const CategoriesPage = () => <Manager type="categories" />;
export function ProductsPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]),
    [q, setQ] = useState("");
  useEffect(() => {
    authFetch(`/admin/products?q=${encodeURIComponent(q)}`)
      .then((r) => setRows(r.data))
      .catch(() => setRows([]));
  }, [q]);
  return (
    <ProtectedCatalog>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>Manage products and explicit sellable SKUs.</p>
        </div>
        <a href="/catalog/products/new">
          <button>Add product</button>
        </a>
      </div>
      <div className="toolbar">
        <input
          placeholder="Search products"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="card table-wrap">
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
      </div>
    </ProtectedCatalog>
  );
}
export function InventoryPage() { const { authFetch } = useAuth(); const [rows, setRows] = useState([]); const [summary, setSummary] = useState(null); useEffect(() => { authFetch('/admin/inventory').then(r => setRows(r.data)); authFetch('/admin/inventory/summary').then(r => setSummary(r.data)); }, []); return <ProtectedCatalog><h1>Inventory</h1><p>Track stock availability and inventory movements across product SKUs.</p>{summary && <div className="metrics"><div className="metric"><span>Tracked SKUs</span><b>{summary.trackedSkuCount}</b></div><div className="metric"><span>Low stock</span><b>{summary.lowStockSkuCount}</b></div><div className="metric"><span>Reserved units</span><b>{summary.totalReservedUnits}</b></div></div>}<div className="card table-wrap"><table><thead><tr><th>Product / SKU</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Status</th></tr></thead><tbody>{rows.map(r => <tr key={r.sku_id}><td><b>{r.product_name}</b><small>{r.sku}{r.variant_title ? ` · ${r.variant_title}` : ''}</small></td><td>{r.quantity_on_hand}</td><td>{r.reserved_quantity}</td><td>{r.available_quantity}</td><td>{r.stock_status}</td></tr>)}</tbody></table></div></ProtectedCatalog>; }
