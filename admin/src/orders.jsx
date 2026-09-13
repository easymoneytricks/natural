import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Eye,
  LoaderCircle,
  PackageCheck,
  Search,
  Truck,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const transitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const dateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "—";

function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{status}</span>;
}

function OrderDetail({ orderNumber, onClose, onUpdated }) {
  const { authFetch, authDownload } = useAuth();
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [returnStatus, setReturnStatus] = useState("none");
  const [refundAmount, setRefundAmount] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await authFetch(
        `/admin/orders/${encodeURIComponent(orderNumber)}`,
      );
      setDetail(response.data);
      setStatus(response.data.order.status);
      setCourier(response.data.shipping?.courier || "");
      setTrackingId(response.data.shipping?.trackingId || "");
      setReturnStatus(response.data.order.returnStatus || "none");
      setRefundAmount(response.data.order.refundAmount || "");
      setReturnReason(
        response.data.order.refundReason ||
          response.data.order.cancellationReason ||
          "",
      );
    } catch (caught) {
      setError(caught.message || "Unable to load order details.");
    }
  };
  useEffect(() => {
    load();
  }, [orderNumber]);

  const updateStatus = async (event) => {
    event.preventDefault();
    if (!status || status === detail?.order.status) return;
    setSaving(true);
    setError("");
    try {
      await authFetch(
        `/admin/orders/${encodeURIComponent(orderNumber)}/status`,
        {
          method: "PATCH",
          body: { status, note: note.trim() || null },
        },
      );
      setNote("");
      await load();
      onUpdated();
    } catch (caught) {
      setError(caught.message || "Unable to update order status.");
    } finally {
      setSaving(false);
    }
  };

  const updateShipping = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(
        `/admin/orders/${encodeURIComponent(orderNumber)}/shipping`,
        {
          method: "PATCH",
          body: {
            courier: courier.trim() || null,
            trackingId: trackingId.trim() || null,
          },
        },
      );
      await load();
      onUpdated();
    } catch (caught) {
      setError(caught.message || "Unable to update shipping details.");
    } finally {
      setSaving(false);
    }
  };

  const updateReturn = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(
        `/admin/orders/${encodeURIComponent(orderNumber)}/return`,
        {
          method: "PATCH",
          body: {
            returnStatus,
            refundAmount: Number(refundAmount || 0),
            reason: returnReason.trim() || null,
          },
        },
      );
      await load();
      onUpdated();
    } catch (caught) {
      setError(caught.message || "Unable to update return or refund state.");
    } finally {
      setSaving(false);
    }
  };

  const downloadInvoice = async () => {
    setError("");
    try {
      const blob = await authDownload(
        `/admin/orders/${encodeURIComponent(orderNumber)}/invoice`,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderNumber}-invoice.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught.message || "Unable to download invoice.");
    }
  };

  return (
    <div
      className="order-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="order-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="order-modal-header">
          <div>
            <span className="section-kicker">ORDER / DETAIL</span>
            <h2>{orderNumber}</h2>
            <p>Review fulfillment, payment and customer information.</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close order details"
          >
            <X size={18} />
          </button>
          <button
            className="button-secondary invoice-button"
            type="button"
            onClick={downloadInvoice}
          >
            Download invoice
          </button>
        </header>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {!detail ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading order…</p>
          </div>
        ) : (
          <div className="order-detail-body">
            <div className="order-detail-grid">
              <div className="order-detail-card">
                <span className="detail-label">Customer</span>
                <strong>{detail.customer.email}</strong>
                <small>
                  {detail.customer.phone || "No phone number"}
                  {detail.customer.guest ? " · Guest checkout" : ""}
                </small>
              </div>
              <div className="order-detail-card">
                <span className="detail-label">Placed</span>
                <strong>{dateTime(detail.order.placedAt)}</strong>
                <small>
                  Payment: {detail.order.paymentMethod} ·{" "}
                  <StatusPill status={detail.order.paymentStatus} />
                </small>
              </div>
              <div className="order-detail-card order-total-card">
                <span className="detail-label">Order total</span>
                <strong>{money(detail.pricing.grandTotal)}</strong>
                <small>
                  {detail.items.length} line item
                  {detail.items.length === 1 ? "" : "s"}
                </small>
              </div>
            </div>
            <div className="order-action-grid">
              <form className="order-action-card" onSubmit={updateStatus}>
                <div className="action-card-heading">
                  <PackageCheck size={17} />
                  <b>Fulfillment status</b>
                </div>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={!transitions[detail.order.status]?.length || saving}
                >
                  <option value={detail.order.status}>
                    {detail.order.status}
                  </option>
                  {(transitions[detail.order.status] || []).map((next) => (
                    <option key={next} value={next}>
                      {next}
                    </option>
                  ))}
                </select>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    status === "cancelled"
                      ? "Cancellation reason (required)"
                      : "Optional timeline note"
                  }
                  disabled={saving}
                />
                <button
                  type="submit"
                  disabled={
                    saving ||
                    status === detail.order.status ||
                    !transitions[detail.order.status]?.length ||
                    (status === "cancelled" && !note.trim())
                  }
                >
                  {saving && <LoaderCircle className="spin" size={15} />} Update
                  status
                </button>
              </form>
              <form className="order-action-card" onSubmit={updateShipping}>
                <div className="action-card-heading">
                  <Truck size={17} />
                  <b>Shipping details</b>
                </div>
                <input
                  value={courier}
                  onChange={(event) => setCourier(event.target.value)}
                  placeholder="Courier name"
                  disabled={saving}
                />
                <input
                  value={trackingId}
                  onChange={(event) => setTrackingId(event.target.value)}
                  placeholder="Tracking ID"
                  disabled={saving}
                />
                <button type="submit" disabled={saving}>
                  Save shipping
                </button>
              </form>
              <form className="order-action-card" onSubmit={updateReturn}>
                <div className="action-card-heading">
                  <PackageCheck size={17} />
                  <b>Returns &amp; refunds</b>
                </div>
                <select
                  value={returnStatus}
                  onChange={(event) => setReturnStatus(event.target.value)}
                  disabled={saving}
                >
                  {[
                    "none",
                    "requested",
                    "approved",
                    "rejected",
                    "received",
                    "refunded",
                  ].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                  placeholder="Refund amount"
                  disabled={saving}
                />
                <input
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value)}
                  placeholder="Reason for return or refund"
                  disabled={saving}
                />
                <button type="submit" disabled={saving}>
                  Save return state
                </button>
              </form>
            </div>
            <div className="order-detail-columns">
              <div>
                <section className="order-section">
                  <h3>Items</h3>
                  <p className="order-snapshot-note">
                    Immutable order snapshot · names, SKU codes, prices and
                    images are preserved exactly as purchased.
                  </p>
                  {detail.items.map((item) => (
                    <div className="order-line-item" key={item.id}>
                      <div>
                        <strong>{item.product_name}</strong>
                        <small>
                          {item.variant_title || item.sku_code} · Qty{" "}
                          {item.quantity}
                        </small>
                      </div>
                      <b>{money(item.line_subtotal)}</b>
                    </div>
                  ))}
                </section>
                <section className="order-section">
                  <h3>Timeline</h3>
                  {detail.timeline.length ? (
                    detail.timeline.map((event, index) => (
                      <div
                        className="order-timeline-item"
                        key={`${event.created_at}-${index}`}
                      >
                        <span className="timeline-dot">
                          <Check size={12} />
                        </span>
                        <div>
                          <strong>{event.status}</strong>
                          <small>
                            {dateTime(event.created_at)}
                            {event.note ? ` · ${event.note}` : ""}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No status history recorded.</p>
                  )}
                </section>
              </div>
              <div>
                <section className="order-section address-section">
                  <h3>Shipping address</h3>
                  {detail.shippingAddress ? (
                    <address>
                      {detail.shippingAddress.first_name}{" "}
                      {detail.shippingAddress.last_name}
                      <br />
                      {detail.shippingAddress.address_line_1}
                      <br />
                      {detail.shippingAddress.address_line_2 && (
                        <>
                          {detail.shippingAddress.address_line_2}
                          <br />
                        </>
                      )}
                      {detail.shippingAddress.city},{" "}
                      {detail.shippingAddress.state}{" "}
                      {detail.shippingAddress.postal_code}
                      <br />
                      {detail.shippingAddress.country_code}
                    </address>
                  ) : (
                    <p className="muted">No shipping address.</p>
                  )}
                </section>
                <section className="order-section price-section">
                  <h3>Payment summary</h3>
                  <div>
                    <span>Subtotal</span>
                    <b>{money(detail.pricing.subtotal)}</b>
                  </div>
                  <div>
                    <span>Coupon</span>
                    <b>−{money(detail.pricing.couponDiscount)}</b>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <b>{money(detail.pricing.shipping)}</b>
                  </div>
                  <div className="price-total">
                    <span>Total</span>
                    <b>{money(detail.pricing.grandTotal)}</b>
                  </div>
                </section>
                {(detail.order.cancellationReason ||
                  detail.order.returnStatus !== "none") && (
                  <section className="order-section">
                    <h3>After-sale record</h3>
                    {detail.order.cancellationReason && (
                      <p>
                        <b>Cancellation:</b> {detail.order.cancellationReason}
                      </p>
                    )}
                    {detail.order.returnStatus !== "none" && (
                      <p>
                        <b>Return:</b> {detail.order.returnStatus} · Refund{" "}
                        {money(detail.order.refundAmount)}
                        {detail.order.refundReason
                          ? ` · ${detail.order.refundReason}`
                          : ""}
                      </p>
                    )}
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function OrdersPage() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: query,
        status,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
      });
      const [listResponse, summaryResponse] = await Promise.all([
        authFetch(`/admin/orders?${params}`),
        authFetch("/admin/orders/summary"),
      ]);
      setOrders(Array.isArray(listResponse.data) ? listResponse.data : []);
      setSummary(summaryResponse.data || {});
    } catch (caught) {
      setError(caught.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query, status, paymentStatus, paymentMethod]);
  const totalOpen = useMemo(
    () =>
      (summary.pending || 0) +
      (summary.confirmed || 0) +
      (summary.processing || 0),
    [summary],
  );

  return (
    <div className="orders-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">OPERATIONS / ORDERS</span>
          <h1>Orders</h1>
          <p>
            Keep every customer purchase moving from confirmation to delivery.
          </p>
        </div>
        <button className="button-secondary" onClick={load}>
          <LoaderCircle size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      <div className="order-summary-grid">
        <div>
          <span>Total orders</span>
          <b>
            {Object.values(summary).reduce(
              (sum, value) => sum + Number(value || 0),
              0,
            )}
          </b>
        </div>
        <div>
          <span>Open orders</span>
          <b>{totalOpen}</b>
        </div>
        <div>
          <span>Delivered</span>
          <b>{summary.delivered || 0}</b>
        </div>
        <div>
          <span>Cancelled</span>
          <b>{summary.cancelled || 0}</b>
        </div>
      </div>
      <div className="orders-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number, email or phone"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
        >
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        >
          <option value="">All methods</option>
          <option value="cod">COD</option>
          <option value="razorpay">Razorpay</option>
        </select>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="card table-wrap order-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading orders…</p>
          </div>
        ) : !orders.length ? (
          <div className="catalog-state">
            <PackageCheck size={28} />
            <h2>No orders found</h2>
            <p>New customer orders will appear here.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderNumber}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                    <small>{dateTime(order.placed_at)}</small>
                  </td>
                  <td>
                    <strong>{order.customer.email}</strong>
                    <small>{order.customer.phone || "Guest customer"}</small>
                  </td>
                  <td>{order.itemCount}</td>
                  <td>
                    <b>{money(order.grandTotal)}</b>
                  </td>
                  <td>
                    <StatusPill status={order.payment_status} />
                    <small>{order.payment_method}</small>
                  </td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setSelected(order.orderNumber)}
                      aria-label={`View ${order.orderNumber}`}
                    >
                      <Eye size={16} />
                    </button>
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected && (
        <OrderDetail
          orderNumber={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}
