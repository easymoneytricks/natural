import React, { useEffect, useState } from "react";
import { useAuth } from "./main";
export function CustomersPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]),
    [q, setQ] = useState("");
  useEffect(() => {
    authFetch(`/admin/customers?q=${encodeURIComponent(q)}`)
      .then((r) => setRows(r.data))
      .catch(() => setRows([]));
  }, [q]);
  return (
    <div>
      <h1>Customers</h1>
      <p>View customer profiles, orders, and account activity safely.</p>
      <div className="toolbar">
        <input
          placeholder="Search name, email, or phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Last login</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.name}</b>
                  <small>
                    {r.email} · {r.phone}
                  </small>
                </td>
                <td>{r.status}</td>
                <td>{r.orderCount}</td>
                <td>
                  {r.last_login_at
                    ? new Date(r.last_login_at).toLocaleDateString()
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
