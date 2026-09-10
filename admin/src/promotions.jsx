import React, { useEffect, useState } from "react";
import { useAuth } from "./main";
export function PromotionsPage() {
  const { authFetch } = useAuth();
  const [coupons, setCoupons] = useState([]),
    [cards, setCards] = useState([]),
    [tab, setTab] = useState("coupons");
  const load = () => {
    authFetch("/admin/promotions/coupons").then((r) => setCoupons(r.data));
    authFetch("/admin/promotions/gift-cards").then((r) => setCards(r.data));
  };
  useEffect(load, []);
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Promotions</h1>
          <p>Manage coupons and stored-value gift cards.</p>
        </div>
      </div>
      <div className="toolbar">
        <button onClick={() => setTab("coupons")}>Coupons</button>
        <button onClick={() => setTab("cards")}>Gift cards</button>
      </div>
      {tab === "coupons" ? (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.code}</b>
                    <small>{c.name}</small>
                  </td>
                  <td>
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}%`
                      : `₹${c.discount_value}`}
                  </td>
                  <td>
                    {c.usage_count}
                    {c.usage_limit_total ? ` / ${c.usage_limit_total}` : ""}
                  </td>
                  <td>{c.is_active ? "Active" : "Disabled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gift card</th>
                <th>Balance</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id}>
                  <td>•••• {c.code_last4}</td>
                  <td>₹{c.currentBalance}</td>
                  <td>
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
