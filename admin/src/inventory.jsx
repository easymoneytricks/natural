import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./main";

export function InventoryDetail() {
  const { authFetch, admin } = useAuth();
  const id = window.location.pathname.split("/").pop();
  const [data, setData] = useState(null);
  const [change, setChange] = useState("");
  const [actual, setActual] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const response = await authFetch(`/admin/inventory/${id}`);
    setData(response.data);
  };

  useEffect(() => {
    load().catch((caught) =>
      setError(caught.message || "Unable to load inventory."),
    );
  }, [id]);

  useEffect(() => {
    if (!data) return;
    setActual(String(data.quantity_on_hand ?? ""));
    setReorderLevel(String(data.reorder_level ?? ""));
  }, [data]);

  const save = async (path, body, success) => {
    setSaving(true);
    setError("");
    try {
      await authFetch(`/admin/inventory/${id}${path}`, {
        method: "POST",
        body,
      });
      setMessage(success);
      setChange("");
      setReason("");
      await load();
    } catch (caught) {
      setError(caught.message || "Inventory update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!data && !error) return <div className="loading">Loading inventory…</div>;
  if (error && !data)
    return (
      <div className="error" role="alert">
        {error}
      </div>
    );

  return (
    <div className="inventory-detail-page">
      <div className="page-head inventory-page-head">
        <div>
          <Link className="back-link" to="/inventory">
            <ArrowLeft size={15} /> Back to inventory
          </Link>
          <span className="section-kicker">INVENTORY / SKU DETAIL</span>
          <h1>{data.product_name}</h1>
          <p>
            {data.sku}
            {data.variant_title ? ` · ${data.variant_title}` : ""}
          </p>
        </div>
      </div>
      <div className="metrics inventory-detail-metrics">
        <div className="metric">
          <span>On hand</span>
          <b>{data.quantity_on_hand}</b>
        </div>
        <div className="metric">
          <span>Reserved</span>
          <b>{data.reserved_quantity}</b>
        </div>
        <div className="metric">
          <span>Available</span>
          <b>{data.availableQuantity}</b>
        </div>
        <div className="metric">
          <span>Reorder level</span>
          <b>{data.reorder_level}</b>
        </div>
      </div>
      {message && (
        <div className="notice" role="status">
          <CheckCircle2 size={17} /> {message}
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {admin?.effectivePermissions?.includes("inventory.manage") && (
        <div className="inventory-action-grid">
          <section className="card inventory-action-card">
            <div className="action-card-heading">
              <PackageCheck size={19} />
              <div>
                <h2>Adjust stock</h2>
                <p>Record deliveries, damages or manual movements.</p>
              </div>
            </div>
            <label>
              Quantity change
              <input
                type="number"
                step="1"
                value={change}
                onChange={(event) => setChange(event.target.value)}
                placeholder="+10 or -3"
              />
            </label>
            <label>
              Reason
              <textarea
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Physical count correction"
              />
            </label>
            <button
              disabled={saving || !change || !reason}
              onClick={() =>
                save(
                  "/adjust",
                  { quantityChange: Number(change), reason },
                  "Stock adjusted successfully.",
                )
              }
            >
              {saving && <LoaderCircle className="spin" size={16} />} Save
              adjustment
            </button>
          </section>
          <section className="card inventory-action-card">
            <div className="action-card-heading">
              <CheckCircle2 size={19} />
              <div>
                <h2>Set actual count</h2>
                <p>Reconcile inventory after a physical stocktake.</p>
              </div>
            </div>
            <label>
              Actual on-hand units
              <input
                type="number"
                min="0"
                step="1"
                value={actual}
                onChange={(event) => setActual(event.target.value)}
              />
            </label>
            <label>
              Reason
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Weekly stocktake"
              />
            </label>
            <button
              disabled={saving || actual === "" || !reason}
              onClick={() =>
                save(
                  "/correct",
                  { actualOnHand: Number(actual), reason },
                  "Physical count saved successfully.",
                )
              }
            >
              Save count
            </button>
          </section>
          <section className="card inventory-action-card">
            <div className="action-card-heading">
              <PackageCheck size={19} />
              <div>
                <h2>Reorder level</h2>
                <p>Choose when this SKU should be flagged low stock.</p>
              </div>
            </div>
            <label>
              Alert below
              <input
                type="number"
                min="0"
                step="1"
                value={reorderLevel}
                onChange={(event) => setReorderLevel(event.target.value)}
              />
            </label>
            <button
              disabled={saving || reorderLevel === ""}
              onClick={() =>
                save(
                  "/reorder-level",
                  { reorderLevel: Number(reorderLevel) },
                  "Reorder level updated.",
                )
              }
            >
              Save threshold
            </button>
          </section>
        </div>
      )}
      <section className="card movement-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">AUDIT TRAIL</span>
            <h2>Movement history</h2>
          </div>
          <span>Latest 50 movements</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Change</th>
                <th>Before</th>
                <th>After</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {!data.movements.length && (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
              {data.movements.map((movement) => (
                <tr key={movement.id}>
                  <td>{movement.movement_type}</td>
                  <td>{movement.quantity_change}</td>
                  <td>{movement.quantity_before}</td>
                  <td>{movement.quantity_after}</td>
                  <td>{movement.note || "—"}</td>
                  <td>{new Date(movement.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
