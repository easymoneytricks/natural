import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AccountDashboard.css";
function Guard({ children }) {
  const { isAuthenticated, authStatus } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (authStatus === "unauthenticated")
      navigate(
        `/login?returnTo=${encodeURIComponent(window.location.pathname)}`,
        { replace: true },
      );
  }, [authStatus, navigate]);
  if (authStatus === "checking")
    return (
      <main className="account-page container">
        <p className="eyebrow">My account</p>
        <p className="account-title">Checking your session…</p>
      </main>
    );
  return isAuthenticated ? children : null;
}
function Shell({ children }) {
  const { user } = useAuth();
  return (
    <main className="account-page container">
      <p className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> My Account
      </p>
      <header className="account-header">
        <p className="eyebrow">My account</p>
        <h1>Welcome back, {user.firstName}.</h1>
      </header>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account navigation">
          <Link to="/account">Overview</Link>
          <Link className="active" to="/account/orders">
            Orders
          </Link>
          <Link to="/account/wishlist">Wishlist</Link>
          <Link to="/account/addresses">Addresses</Link>
          <Link to="/account/profile">Profile</Link>
          <Link to="/account/rewards">Rewards</Link>
          <Link to="/account/gift-cards">Gift Cards</Link>
        </nav>
        <section className="account-content">{children}</section>
      </div>
    </main>
  );
}
export function CustomerOrders() {
  const { authFetch, authDownload } = useAuth();
  const [orders, setOrders] = useState(null);
  const [downloading, setDownloading] = useState(null);
  useEffect(() => {
    authFetch("/customer/orders")
      .then((r) => setOrders(r.data || []))
      .catch(() => setOrders([]));
  }, [authFetch]);
  const downloadInvoice = async (orderNumber) => {
    setDownloading(orderNumber);
    try {
      const blob = await authDownload(
        `/customer/orders/${orderNumber}/invoice`,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderNumber}-invoice.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };
  return (
    <Guard>
      <Shell>
        <p className="eyebrow">Your purchases</p>
        <h2 className="account-title">My Orders</h2>
        {orders === null ? (
          <p className="account-muted">Loading orders…</p>
        ) : orders.length ? (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-row" key={order.orderNumber}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <span>
                    {order.status} · {order.paymentMethod}
                  </span>
                  <small>{order.itemCount} items</small>
                </div>
                <b>₹{order.grandTotal.toLocaleString("en-IN")}</b>
                <Link to={`/account/orders/${order.orderNumber}`}>
                  View details <ArrowRight size={13} />
                </Link>
                <button
                  className="text-button"
                  type="button"
                  disabled={downloading === order.orderNumber}
                  onClick={() => downloadInvoice(order.orderNumber)}
                >
                  <ArrowDownToLine size={13} />
                  {downloading === order.orderNumber ? "Preparing…" : "Invoice"}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p>
            No orders yet. <Link to="/shop">Explore skincare</Link>
          </p>
        )}
      </Shell>
    </Guard>
  );
}
export function CustomerOrderDetail() {
  const { orderNumber } = useParams();
  const { authFetch, authDownload } = useAuth();
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    authFetch(`/customer/orders/${orderNumber}`)
      .then((r) => setOrder(r.data.order))
      .catch(() => setOrder(false));
  }, [authFetch, orderNumber]);
  const downloadInvoice = async () => {
    setDownloading(true);
    try {
      const blob = await authDownload(
        `/customer/orders/${orderNumber}/invoice`,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderNumber}-invoice.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Guard>
      <Shell>
        {order === null ? (
          <p className="account-muted">Loading order…</p>
        ) : !order ? (
          <p>Order not found.</p>
        ) : (
          <>
            <p className="eyebrow">Order {order.orderNumber}</p>
            <h2 className="account-title">Order details</h2>
            <p className="account-muted">
              {order.status} ·{" "}
              {order.paymentMethod === "cod"
                ? "Cash on delivery"
                : order.paymentMethod}
            </p>
            <button
              className="button button-secondary"
              type="button"
              disabled={downloading}
              onClick={downloadInvoice}
            >
              <ArrowDownToLine size={15} />
              {downloading ? "Preparing invoice…" : "Download invoice PDF"}
            </button>
            <div className="detail-items">
              {order.items.map((item) => (
                <div key={item.sku}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      SKU: {item.sku} · Qty {item.quantity}
                    </small>
                  </span>
                  <b>₹{item.lineSubtotal.toLocaleString("en-IN")}</b>
                </div>
              ))}
            </div>
            <section className="detail-address">
              <p className="eyebrow">Delivering to</p>
              <span>
                {order.shippingAddress.first_name}{" "}
                {order.shippingAddress.last_name}
              </span>
              <span>
                {order.shippingAddress.address_line_1},{" "}
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postal_code}
              </span>
            </section>
            <p>Total ₹{order.pricing.total.toLocaleString("en-IN")}</p>
            {order.timeline.map((event) => (
              <p key={`${event.status}-${event.createdAt}`}>
                {event.status} · {event.note}
              </p>
            ))}
          </>
        )}
      </Shell>
    </Guard>
  );
}
