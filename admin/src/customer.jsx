import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
      <div className="page-head">
        <div>
          <h1>Customers</h1>
          <p>View customer profiles, orders, and account activity safely.</p>
        </div>
        <span className="section-kicker">CUSTOMER DIRECTORY</span>
      </div>
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
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">
                  No customers found for this search.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link
                    className="customer-name-link"
                    to={`/customers/${r.id}`}
                  >
                    <span className="customer-avatar" aria-hidden="true">
                      {(r.name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <b>{r.name}</b>
                  </Link>
                  <small>
                    {r.email} · {r.phone}
                  </small>
                </td>
                <td>
                  <span className={`status-pill status-${r.status}`}>
                    {r.status}
                  </span>
                </td>
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

export function CustomerDetailPage() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  useEffect(() => {
    authFetch(`/admin/customers/${id}`)
      .then((response) => setData(response.data))
      .catch((caught) =>
        setError(caught.message || "Unable to load customer."),
      );
  }, [authFetch, id]);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading customer profile…</p>;
  const { customer, addresses, orders, wishlist, cart, commerce } = data;
  const updateStatus = async (status) => {
    setActionBusy(true);
    setActionError("");
    try {
      await authFetch(`/admin/customers/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => ({
        ...current,
        customer: { ...current.customer, status },
      }));
    } catch (caught) {
      setActionError(caught.message || "Unable to update this account.");
    } finally {
      setActionBusy(false);
    }
  };
  const removeCustomer = async () => {
    if (!window.confirm("Permanently remove this customer account?")) return;
    setActionBusy(true);
    setActionError("");
    try {
      await authFetch(`/admin/customers/${id}`, { method: "DELETE" });
      navigate("/customers", { replace: true });
    } catch (caught) {
      setActionError(caught.message || "Unable to delete this account.");
      setActionBusy(false);
    }
  };
  return (
    <div>
      <div className="page-head customer-profile-head">
        <div>
          <Link to="/customers">← Customer directory</Link>
          <span className="section-kicker">CUSTOMER PROFILE</span>
          <h1>{customer.name}</h1>
          <p>
            {customer.email} · {customer.phone}
          </p>
        </div>
        <div className="customer-admin-actions">
          <span className={`status-pill status-${customer.status}`}>
            {customer.status.replaceAll("_", " ")}
          </span>
          {customer.status !== "active" && (
            <>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => updateStatus("active")}
              >
                Reactivate account
              </button>
              <button
                type="button"
                className="danger"
                disabled={actionBusy}
                onClick={removeCustomer}
              >
                Delete permanently
              </button>
            </>
          )}
        </div>
      </div>
      {actionError && <p className="error customer-action-error">{actionError}</p>}
      <div className="customer-detail-grid">
        <section className="card customer-detail-card">
          <h2>Saved addresses</h2>
          {!addresses.length && <p className="muted">No saved addresses.</p>}
          {addresses.map((address) => (
            <div className="customer-address" key={address.id}>
              <b>
                {address.label}
                {address.is_default ? " · Default" : ""}
              </b>
              <p>
                {address.first_name} {address.last_name}
                <br />
                {address.address_line_1}
                {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                <br />
                {address.city}, {address.state} {address.postal_code}
                <br />
                {address.phone}
              </p>
            </div>
          ))}
        </section>
        <section className="card customer-detail-card">
          <h2>Shopping signals</h2>
          <div className="customer-signal">
            <b>{commerce.cartItemCount}</b>
            <span>Cart lines · {commerce.cartQuantity} units</span>
          </div>
          <div className="customer-signal">
            <b>{commerce.wishlistCount}</b>
            <span>Saved wishlist products</span>
          </div>
          <h3>Current cart</h3>
          {!cart.length && <p className="muted">Cart is empty.</p>}
          {cart.map((item) => (
            <div className="customer-line" key={item.skuId}>
              <span>
                {item.product_name}
                <small>
                  {item.sku} · Qty {item.quantity}
                </small>
              </span>
              <b>₹{item.price.toLocaleString("en-IN")}</b>
            </div>
          ))}
        </section>
        <section className="card customer-detail-card">
          <h2>Wishlist</h2>
          {!wishlist.length && <p className="muted">No saved products.</p>}
          {wishlist.map((item) => (
            <div className="customer-line" key={item.id}>
              <span>
                <b>{item.name}</b>
                <small>{item.slug}</small>
              </span>
              <Link to={`/catalog/products/${item.id}`}>View</Link>
            </div>
          ))}
        </section>
        <section className="card customer-detail-card customer-orders-card">
          <h2>Order history</h2>
          {!orders.length && <p className="muted">No orders yet.</p>}
          {orders.map((order) => (
            <div className="customer-line" key={order.order_number}>
              <span>
                <b>{order.order_number}</b>
                <small>
                  {order.status} · {order.payment_method}
                </small>
              </span>
              <b>₹{Number(order.grandTotal).toLocaleString("en-IN")}</b>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
