import React, { useEffect, useState } from "react";
import { useAuth } from "./main";
export function InventoryDetail() {
  const { authFetch, admin } = useAuth();
  const id = window.location.pathname.split("/").pop(),
    [data, setData] = useState(null),
    [change, setChange] = useState(""),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState("");
  const load = () =>
    authFetch(`/admin/inventory/${id}`).then((r) => setData(r.data));
  useEffect(load, []);
  if (!data) return <div className="loading">Loading inventory…</div>;
  const save = async () => {
    try {
      await authFetch(`/admin/inventory/${id}/adjust`, {
        method: "POST",
        body: { quantityChange: Number(change), reason },
      });
      setMessage("Stock adjusted.");
      setChange("");
      setReason("");
      load();
    } catch (e) {
      setMessage(e.message || "Adjustment failed.");
    }
  };
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{data.product_name}</h1>
          <p>
            {data.sku} {data.variant_title && `· ${data.variant_title}`}
          </p>
        </div>
      </div>
      <div className="metrics">
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
      </div>
      {admin?.effectivePermissions?.includes("inventory.manage") && (
        <section className="card">
          <h2>Adjust stock</h2>
          <label>
            Signed quantity change
            <input
              type="number"
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="+10 or -3"
            />
          </label>
          <label>
            Reason
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Physical count correction"
            />
          </label>
          <button disabled={!change || !reason} onClick={save}>
            Save adjustment
          </button>
          {message && <p>{message}</p>}
        </section>
      )}
      <section className="card">
        <h2>Movement history</h2>
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
              {data.movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.movement_type}</td>
                  <td>{m.quantity_change}</td>
                  <td>{m.quantity_before}</td>
                  <td>{m.quantity_after}</td>
                  <td>{m.note || "—"}</td>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
