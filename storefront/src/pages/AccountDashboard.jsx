/* oxlint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/PreferenceContext";
import { products, newArrivals } from "../data/products";
import {
  demoOrders,
  defaultAddresses,
  demoRewards,
  demoGiftCards,
} from "../data/accountData";
import "./AccountDashboard.css";

const catalog = [...products, ...newArrivals];
const isDemoCustomer = (user) =>
  user?.email?.toLowerCase() === "aanya@example.com";
const money = (value) => `₹${value.toLocaleString("en-IN")}`;
function Guard({ children }) {
  const { isAuthenticated, authStatus } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      const returnTo =
        sessionStorage.getItem("natural-beauty-auth-return") ||
        window.location.pathname;
      sessionStorage.removeItem("natural-beauty-auth-return");
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    }
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
function Layout({ children, active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <main className="account-page container">
      <p className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> My Account
      </p>
      <header className="account-header">
        <p className="eyebrow">My account</p>
        <h1>Welcome back, {user.firstName}.</h1>
        <p>Manage your orders, addresses and account details in one place.</p>
      </header>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account navigation">
          {[
            ["Overview", "/account"],
            ["Orders", "/account/orders"],
            ["Wishlist", "/wishlist"],
            ["Addresses", "/account/addresses"],
            ["Profile", "/account/profile"],
            ["Rewards", "/account/rewards"],
            ["Gift Cards", "/account/gift-cards"],
          ].map(([label, href]) => (
            <Link
              className={active === label ? "active" : ""}
              key={label}
              to={href}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </nav>
        <section className="account-content">{children}</section>
      </div>
    </main>
  );
}
export function AccountOverview() {
  const { user } = useAuth();
  const { count } = useWishlist();
  const latest = demoOrders[2];
  return (
    <Guard>
      <Layout active="Overview">
        <p className="eyebrow">Account overview</p>
        <h2 className="account-title">Here's a quick look at your account.</h2>
        <section className="latest-order">
          <div>
            <p className="eyebrow">Your latest order</p>
            <h3>{latest.orderNumber}</h3>
            <span>
              {latest.status} · Placed {latest.date}
            </span>
          </div>
          <div className="latest-thumbs">
            {latest.items.map((item) => (
              <img
                key={item.sku}
                src={catalog.find((p) => p.slug === item.slug)?.image}
                alt=""
              />
            ))}
          </div>
          <Link to={`/account/orders/${latest.orderNumber}`}>
            View order <ArrowRight size={14} />
          </Link>
        </section>
        <div className="account-sections">
          <article>
            <p>Orders</p>
            <h2>{demoOrders.length} orders</h2>
            <Link to="/account/orders">
              View orders <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <p>Wishlist</p>
            <h2>{count} saved products</h2>
            <Link to="/wishlist">
              View wishlist <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <p>Addresses</p>
            <h2>{defaultAddresses.length} saved addresses</h2>
            <Link to="/account/addresses">
              Manage addresses <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <p>Rewards</p>
            <h2>{demoRewards.available} points available</h2>
            <Link to="/account/rewards">
              View rewards <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </Layout>
    </Guard>
  );
}
export function Orders() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const active = [
    "Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
  ];
  const visible = (isDemoCustomer(user) ? demoOrders : []).filter(
    (order) =>
      filter === "All" ||
      (filter === "Active" && active.includes(order.status)) ||
      order.status === filter,
  );
  return (
    <Guard>
      <Layout active="Orders">
        <p className="eyebrow">Your purchases</p>
        <h2 className="account-title">My Orders</h2>
        <p className="account-muted">
          View your purchases and follow each order from confirmation to
          delivery.
        </p>
        <div className="order-filters">
          {["All", "Active", "Delivered", "Cancelled"].map((item) => (
            <button
              className={filter === item ? "active" : ""}
              key={item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="order-list">
          {visible.length ? (
            visible.map((order) => (
              <OrderRow key={order.orderNumber} order={order} />
            ))
          ) : (
            <p>
              No orders yet. <Link to="/shop">Explore skincare</Link>
            </p>
          )}
        </div>
      </Layout>
    </Guard>
  );
}
function OrderRow({ order }) {
  return (
    <article className="order-row">
      <div>
        <strong>{order.orderNumber}</strong>
        <span>
          {order.date} · {order.status}
        </span>
        <small>
          {order.paymentStatus} · {order.items.length}{" "}
          {order.items.length === 1 ? "item" : "items"}
        </small>
      </div>
      <div className="order-row-images">
        {order.items.map((item) => (
          <img
            key={item.sku}
            src={catalog.find((p) => p.slug === item.slug)?.image}
            alt=""
          />
        ))}
      </div>
      <b>{money(order.total)}</b>
      <div className="order-row-actions">
        <Link to={`/account/orders/${order.orderNumber}`}>
          View details <ArrowRight size={13} />
        </Link>
        {order.status === "Shipped" && (
          <Link to={`/account/orders/${order.orderNumber}`}>Track order</Link>
        )}
      </div>
    </article>
  );
}
export function OrderDetail() {
  const { orderNumber } = useParams();
  const [orders, setOrders] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("natural-beauty-demo-orders")) ||
        demoOrders
      );
    } catch {
      return demoOrders;
    }
  });
  const order = orders.find((item) => item.orderNumber === orderNumber);
  const [cancelOpen, setCancelOpen] = useState(false);
  if (!order)
    return (
      <Guard>
        <Layout>
          <h2 className="account-title">Order not found.</h2>
          <Link to="/account/orders">Return to orders</Link>
        </Layout>
      </Guard>
    );
  const stages = [
    "Order Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];
  const current =
    order.status === "Delivered"
      ? 5
      : order.status === "Shipped"
        ? 3
        : order.status === "Processing"
          ? 1
          : -1;
  return (
    <Guard>
      <Layout active="Orders">
        <p className="eyebrow">Order {order.orderNumber}</p>
        <h2 className="account-title">Placed {order.date}</h2>
        <p className={`order-status status-${order.status.toLowerCase()}`}>
          {order.status} · {order.paymentStatus}
        </p>
        {order.status === "Cancelled" ? (
          <section className="cancelled-state">
            <h3>Order cancelled</h3>
            <p>
              Payment: {order.paymentStatus}. Refund details will appear with
              the live order system.
            </p>
          </section>
        ) : (
          <>
            <section className="tracking">
              <p className="eyebrow">Order journey</p>
              {stages.map((stage, index) => (
                <div
                  className={
                    index < current
                      ? "complete"
                      : index === current
                        ? "current"
                        : ""
                  }
                  key={stage}
                >
                  <span>{index <= current ? "✓" : index + 1}</span>
                  <strong>{stage}</strong>
                </div>
              ))}
            </section>
            {order.courier && (
              <section className="shipment">
                <p className="eyebrow">Shipment</p>
                <strong>{order.courier}</strong>
                <span>Tracking ID: {order.trackingId}</span>
                <span>Expected delivery: {order.expected}</span>
                <small>
                  Courier tracking integration will be available when live
                  orders are connected.
                </small>
              </section>
            )}
          </>
        )}
        <section className="detail-items">
          {order.items.map((item) => (
            <div key={item.sku}>
              <img
                src={catalog.find((p) => p.slug === item.slug)?.image}
                alt=""
              />
              <span>
                <strong>{item.name}</strong>
                {item.variant}
                <small>
                  SKU: {item.sku} · Qty {item.quantity}
                </small>
              </span>
              <b>{money(item.price * item.quantity)}</b>
            </div>
          ))}
        </section>
        <section className="detail-address">
          <p className="eyebrow">Delivering to</p>
          <span>Aanya Mehta</span>
          <span>{order.address}</span>
        </section>
        <div className="detail-actions">
          {["Confirmed", "Processing"].includes(order.status) && (
            <button onClick={() => setCancelOpen(true)}>Cancel order</button>
          )}
          {order.status === "Delivered" && (
            <button onClick={() => setCancelOpen(true)}>
              Return / replacement
            </button>
          )}
          <Link to="/shop">Continue shopping</Link>
        </div>
        {cancelOpen && (
          <div className="account-dialog">
            <div>
              <h3>
                {order.status === "Delivered"
                  ? "Need help with this order?"
                  : "Cancel this order?"}
              </h3>
              <p>
                {order.status === "Delivered"
                  ? "Return requests will be available when the live order system is connected."
                  : "Choose a reason for this demo cancellation."}
              </p>
              {order.status !== "Delivered" && (
                <select>
                  <option>Ordered by mistake</option>
                  <option>Want to change items</option>
                  <option>Delivery time</option>
                  <option>Other</option>
                </select>
              )}
              <button
                onClick={() => {
                  if (order.status !== "Delivered") {
                    const next = orders.map((item) =>
                      item.orderNumber === orderNumber
                        ? {
                            ...item,
                            status: "Cancelled",
                            paymentStatus: "Refunded",
                          }
                        : item,
                    );
                    setOrders(next);
                    localStorage.setItem(
                      "natural-beauty-demo-orders",
                      JSON.stringify(next),
                    );
                  }
                  setCancelOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Layout>
    </Guard>
  );
}
export function Addresses() {
  const [addresses, setAddresses] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("natural-beauty-addresses")) ||
        defaultAddresses
      );
    } catch {
      return defaultAddresses;
    }
  });
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [address1, setAddress1] = useState("");
  const save = () => {
    if (!label || !address1) return;
    const next = [
      ...addresses,
      {
        id: Date.now(),
        label,
        firstName: "Aanya",
        lastName: "Mehta",
        mobile: "9876543210",
        address1,
        address2: "",
        city: "Bengaluru",
        state: "Karnataka",
        pin: "560038",
        country: "India",
        isDefault: addresses.length === 0,
      },
    ];
    setAddresses(next);
    localStorage.setItem("natural-beauty-addresses", JSON.stringify(next));
    setAdding(false);
    setLabel("");
    setAddress1("");
  };
  return (
    <Guard>
      <Layout active="Addresses">
        <p className="eyebrow">Your details</p>
        <h2 className="account-title">Saved addresses</h2>
        <button className="account-action" onClick={() => setAdding(true)}>
          Add new address
        </button>
        {adding && (
          <div className="address-add">
            <label>
              Label
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Home / Work"
              />
            </label>
            <label>
              Address line 1
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </label>
            <button className="button" onClick={save}>
              Save address
            </button>
          </div>
        )}
        <div className="address-list">
          {addresses.map((address) => (
            <article key={address.id}>
              <p>{address.label}</p>
              <strong>
                {address.firstName} {address.lastName}
              </strong>
              <span>
                {address.address1}
                <br />
                {address.address2}
                <br />
                {address.city}, {address.state} {address.pin}
                <br />
                {address.country}
                <br />
                {address.mobile}
              </span>
              {address.isDefault && <small>Default address</small>}
              <div>
                <button
                  onClick={() => {
                    const next = addresses.map((item) => ({
                      ...item,
                      isDefault: item.id === address.id,
                    }));
                    setAddresses(next);
                    localStorage.setItem(
                      "natural-beauty-addresses",
                      JSON.stringify(next),
                    );
                  }}
                >
                  Set as default
                </button>
                <button
                  onClick={() => {
                    const next = addresses.filter(
                      (item) => item.id !== address.id,
                    );
                    if (address.isDefault && next[0]) next[0].isDefault = true;
                    setAddresses(next);
                    localStorage.setItem(
                      "natural-beauty-addresses",
                      JSON.stringify(next),
                    );
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </Layout>
    </Guard>
  );
}
export function Profile() {
  const { user } = useAuth();
  const form = user || {};
  return (
    <Guard>
      <Layout active="Profile">
        <p className="eyebrow">Your details</p>
        <h2 className="account-title">Profile</h2>
        <div className="profile-form">
          {["firstName", "lastName", "email", "mobile"].map((key) => (
            <label key={key}>
              {key === "firstName"
                ? "First name"
                : key === "lastName"
                  ? "Last name"
                  : key === "email"
                    ? "Email address"
                    : "Mobile number"}
              <input value={form[key] || ""} readOnly />
            </label>
          ))}
          <p>
            Your profile details are managed securely with your Natural Beauty
            account.
          </p>
          <Link to="/reset-password" className="account-action">
            Change password
          </Link>
        </div>
      </Layout>
    </Guard>
  );
}
export function Rewards() {
  const { authFetch } = useAuth();
  const [rewards, setRewards] = useState(null);
  useEffect(() => {
    authFetch("/customer/rewards")
      .then((r) => setRewards(r.data))
      .catch(() => setRewards(false));
  }, [authFetch]);
  return (
    <Guard>
      <Layout active="Rewards">
        <p className="eyebrow">A little something back</p>
        <h2 className="account-title">Natural Beauty Rewards</h2>
        <p className="account-muted">
          A little something back for the rituals you return to.
        </p>
        {rewards === false ? (
          <p className="field-error">Rewards are temporarily unavailable.</p>
        ) : (
          <>
            <div className="rewards-balance">
              <span>
                Available points
                <strong>{rewards?.availablePoints ?? "…"}</strong>
              </span>
              <span>
                Approximate value
                <strong>
                  {rewards ? money(rewards.availablePoints / 10) : "…"}
                </strong>
              </span>
            </div>
            <div className="rewards-stats">
              <span>
                Lifetime earned<strong>{rewards?.lifetimeEarned ?? "…"}</strong>
              </span>
              <span>
                Redeemed<strong>{rewards?.lifetimeRedeemed ?? "…"}</strong>
              </span>
            </div>
            <h3>Reward history</h3>
            <div className="reward-history">
              {(rewards?.transactions || []).map((t) => (
                <div key={t.created_at + t.points}>
                  <strong>{t.points > 0 ? `+${t.points}` : t.points}</strong>
                  <span>
                    {t.note || t.transaction_type}
                    <small>{t.transaction_type}</small>
                  </span>
                  <time>{new Date(t.created_at).toLocaleDateString()}</time>
                </div>
              ))}
            </div>
          </>
        )}
      </Layout>
    </Guard>
  );
}
export function GiftCards() {
  const [cards, setCards] = useState(demoGiftCards);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const add = () => {
    const known = {
      "NB-GIFT-500": { original: 500, balance: 500 },
      "NB-GIFT-1000": { original: 1000, balance: 650 },
      "NB-GIFT-2000": { original: 2000, balance: 2000 },
      "NB-GIFT-USED": { original: 500, balance: 0 },
      "NB-GIFT-EXPIRED": { original: 1000, balance: 750, expired: true },
    }[code.trim().toUpperCase()];
    if (!known) return setMessage("This gift card code isn't valid.");
    if (known.expired) return setMessage("This gift card has expired.");
    if (!known.balance)
      return setMessage("This gift card has no remaining balance.");
    if (cards.some((card) => card.code === code.trim().toUpperCase()))
      return setMessage("This gift card is already in your account.");
    setCards((current) => [
      ...current,
      { ...known, code: code.trim().toUpperCase(), status: "Active" },
    ]);
    setMessage("Gift card added.");
    setCode("");
  };
  return (
    <Guard>
      <Layout active="Gift Cards">
        <p className="eyebrow">Your wallet</p>
        <h2 className="account-title">Gift Cards</h2>
        <p className="account-muted">
          Keep track of your Natural Beauty gift-card balances.
        </p>
        <div className="gift-add">
          <input
            aria-label="Gift card code"
            placeholder="Gift card code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={add}>Add</button>
        </div>
        {message && (
          <p className="field-error" role="status">
            {message}
          </p>
        )}
        <div className="gift-list">
          {cards.map((card) => (
            <article key={card.code}>
              <strong>{card.code}</strong>
              <span>Original value {money(card.original)}</span>
              <b>Remaining {money(card.balance)}</b>
              <small>{card.status}</small>
            </article>
          ))}
        </div>
        <h3>Recent activity</h3>
        <p className="account-muted">
          NB-GIFT-1000 · Applied to Order NB-2026-10421 · −₹350 · Remaining ₹650
        </p>
      </Layout>
    </Guard>
  );
}
