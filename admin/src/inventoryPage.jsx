import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const params = new URLSearchParams({ q: query, stockStatus });
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
      );
  }, [query, stockStatus, tracking]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Inventory</h1>
          <p>
            Track stock availability and inventory movements across product
            SKUs.
          </p>
        </div>
      </div>

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

      <div className="toolbar">
        <input
          placeholder="Search product, SKU, barcode"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
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
      </div>

      {error && <div className="error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Available</th>
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
                <td>{row.stock_status}</td>
                <td>
                  <Link to={`/inventory/${row.sku_id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
