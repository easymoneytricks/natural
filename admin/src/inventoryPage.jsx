import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  LoaderCircle,
  PackageOpen,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./main";

export function InventoryPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  const [tracking, setTracking] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const exportCsv = () => {
    const headers = [
      "Product",
      "SKU",
      "On hand",
      "Reserved",
      "Available",
      "Status",
    ];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      headers,
      ...rows.map((row) => [
        row.product_name,
        row.sku,
        row.quantity_on_hand,
        row.reserved_quantity,
        row.available_quantity,
        row.stock_status,
      ]),
    ]
      .map((line) => line.map(escape).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ q: query, stockStatus, limit: "100" });
    if (tracking !== "all") params.set("tracking", tracking);

    Promise.all([
      authFetch(`/admin/inventory?${params}`),
      authFetch("/admin/inventory/summary"),
    ])
      .then(([list, totals]) => {
        setRows(list.data);
        setSummary(totals.data);
      })
      .catch((caught) =>
        setError(caught.message || "Unable to load inventory."),
      )
      .finally(() => setLoading(false));
  }, [query, stockStatus, tracking]);

  return (
    <div>
      <div className="page-head inventory-page-head">
        <div>
          <span className="section-kicker">OPERATIONS / INVENTORY</span>
          <h1>Inventory</h1>
          <p>Keep every sellable SKU accurate, available and ready to ship.</p>
        </div>
      </div>

      {summary && (
        <div className="metrics">
          <div className="metric metric-primary">
            <span>Tracked SKUs</span>
            <b>{summary.trackedSkuCount}</b>
          </div>
          <div className="metric">
            <span>In stock</span>
            <b>{summary.inStockSkuCount}</b>
          </div>
          <div className="metric">
            <span>Low stock</span>
            <b>{summary.lowStockSkuCount}</b>
          </div>
          <div className="metric">
            <span>Reserved units</span>
            <b>{summary.totalReservedUnits}</b>
          </div>
          <div className="metric">
            <span>Available units</span>
            <b>{summary.totalAvailableUnits}</b>
          </div>
        </div>
      )}

      <div className="inventory-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search product, SKU, barcode"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="inventory-filters">
          <button
            className={`filter-chip ${stockStatus === "low_stock" ? "active" : ""}`}
            aria-pressed={stockStatus === "low_stock"}
            onClick={() =>
              setStockStatus((current) =>
                current === "low_stock" ? "all" : "low_stock",
              )
            }
          >
            <AlertTriangle size={15} /> Low stock
          </button>
          <select
            value={stockStatus}
            onChange={(event) => setStockStatus(event.target.value)}
          >
            <option value="all">All stock statuses</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="not_tracked">Not tracked</option>
          </select>
          <select
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
          >
            <option value="all">All tracking modes</option>
            <option value="tracked">Tracked</option>
            <option value="not_tracked">Not tracked</option>
          </select>
          <button
            className="button-secondary inventory-export"
            onClick={exportCsv}
            disabled={!rows.length}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      <div className="card table-wrap inventory-table-wrap">
        {loading && (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading inventory…</p>
          </div>
        )}
        {!loading && !rows.length && (
          <div className="catalog-state">
            <PackageOpen size={26} />
            <h2>No inventory records found</h2>
            <p>Try changing the search or stock filters.</p>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available to sell</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sku_id}>
                  <td>
                    <b>{row.product_name}</b>
                    <small>
                      {row.sku}
                      {row.variant_title ? ` · ${row.variant_title}` : ""}
                    </small>
                  </td>
                  <td>{row.quantity_on_hand}</td>
                  <td>{row.reserved_quantity}</td>
                  <td>{row.available_quantity}</td>
                  <td>
                    <span className={`inventory-status ${row.stock_status}`}>
                      {row.stock_status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="inventory-manage-link"
                      to={`/inventory/${row.sku_id}`}
                    >
                      Manage
                      <span aria-hidden="true">→</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
