import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/PreferenceContext";
import { getAddresses } from "../services/authApi";
import "./AccountDashboard.css";

function Guard({ children }) {
  const { isAuthenticated, authStatus } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate(
        `/login?returnTo=${encodeURIComponent(window.location.pathname)}`,
        {
          replace: true,
        },
      );
    }
  }, [authStatus, navigate]);
  if (authStatus === "checking") {
    return (
      <main className="account-page container">
        <p className="eyebrow">My account</p>
        <p className="account-title">Checking your session…</p>
      </main>
    );
  }
  return isAuthenticated ? children : null;
}

function Layout({ children, active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    ["Overview", "/account"],
    ["Orders", "/account/orders"],
    ["Wishlist", "/account/wishlist"],
    ["Addresses", "/account/addresses"],
    ["Profile", "/account/profile"],
    ["Rewards", "/account/rewards"],
    ["Gift Cards", "/account/gift-cards"],
  ];
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
          {links.map(([label, href]) => (
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
  const { authFetch } = useAuth();
  const { count } = useWishlist();
  const [orders, setOrders] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [rewards, setRewards] = useState(null);
  useEffect(() => {
    Promise.allSettled([
      authFetch("/customer/orders"),
      getAddresses(authFetch),
      authFetch("/customer/rewards"),
    ]).then(([ordersResult, addressesResult, rewardsResult]) => {
      setOrders(
        ordersResult.status === "fulfilled"
          ? ordersResult.value.data || []
          : [],
      );
      setAddresses(
        addressesResult.status === "fulfilled"
          ? addressesResult.value.data || []
          : [],
      );
      setRewards(
        rewardsResult.status === "fulfilled" ? rewardsResult.value.data : null,
      );
    });
  }, [authFetch]);
  return (
    <Guard>
      <Layout active="Overview">
        <p className="eyebrow">Account overview</p>
        <section className="latest-order">
          <div>
            <p className="eyebrow">Your latest order</p>
            {orders === null ? (
              <p>Loading your orders…</p>
            ) : orders[0] ? (
              <>
                <h3>{orders[0].orderNumber}</h3>
                <span>
                  {orders[0].status} · {orders[0].itemCount} items
                </span>
              </>
            ) : (
              <p>
                No orders yet. <Link to="/shop">Explore skincare</Link>
              </p>
            )}
          </div>
          {orders?.[0] && (
            <Link to={`/account/orders/${orders[0].orderNumber}`}>
              View order <ArrowRight size={14} />
            </Link>
          )}
        </section>
        <div className="account-sections">
          <article>
            <p>Orders</p>
            <h2>{orders === null ? "…" : orders.length}</h2>
            <Link to="/account/orders">
              View orders <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <p>Wishlist</p>
            <h2>{count} saved products</h2>
            <Link to="/account/wishlist">
              View wishlist <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <p>Addresses</p>
            <h2>{addresses === null ? "…" : addresses.length}</h2>
            <Link to="/account/addresses">
              Manage addresses <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <p>Rewards</p>
            <h2>{rewards ? rewards.available : "—"} points</h2>
            <Link to="/account/rewards">
              View rewards <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </Layout>
    </Guard>
  );
}

export function Rewards() {
  const { authFetch } = useAuth();
  const [account, setAccount] = useState(null);
  useEffect(() => {
    authFetch("/customer/rewards")
      .then((response) => setAccount(response.data))
      .catch(() => setAccount(false));
  }, [authFetch]);
  return (
    <Guard>
      <Layout active="Rewards">
        <p className="eyebrow">Natural Beauty rewards</p>
        <h2 className="account-title">Your rewards</h2>
        {account === null ? (
          <p className="account-muted">Loading rewards…</p>
        ) : account === false ? (
          <section className="rewards-empty card">
            <strong>Rewards are getting ready</strong>
            <p>We could not load your points right now. Please refresh and try again.</p>
          </section>
        ) : (
          <>
            <section className="rewards-balance">
              <span>Available points<strong>{account.availablePoints}</strong></span>
              <span>Lifetime earned<strong>{account.lifetimeEarned}</strong></span>
              <span>Redeemed<strong>{account.lifetimeRedeemed}</strong></span>
            </section>
            <section className="rewards-history">
              <div className="rewards-history-head">
                <h3>Points activity</h3>
                <span>Every earn and redemption in one place</span>
              </div>
              {account.transactions?.length ? account.transactions.map((transaction, index) => (
                <div className="reward-history-row" key={`${transaction.created_at}-${index}`}>
                  <span>
                    <strong>{transaction.note || transaction.transaction_type}</strong>
                    <small>{new Date(transaction.created_at).toLocaleDateString()}</small>
                  </span>
                  <b className={transaction.points < 0 ? "points-negative" : ""}>
                    {transaction.points > 0 ? "+" : ""}{transaction.points} pts
                  </b>
                </div>
              )) : <p className="account-muted">No points activity yet. Complete an order to start earning.</p>}
            </section>
          </>
        )}
      </Layout>
    </Guard>
  );
}

export function GiftCards() {
  const { authFetch } = useAuth();
  const [cards, setCards] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const load = () => authFetch("/customer/gift-cards").then((response) => setCards(response.data || [])).catch(() => setCards(false));
  useEffect(() => { load(); }, [authFetch]);
  const claim = async (event) => {
    event.preventDefault();
    setClaiming(true); setError(""); setMessage("");
    try {
      const response = await authFetch("/customer/gift-cards/claim", { method: "POST", body: { code } });
      sessionStorage.setItem("natural-beauty-gift", JSON.stringify({
        code: code.trim().toUpperCase(),
        balance: Number(response.data?.currentBalance || 0),
      }));
      setCode(""); setMessage("Gift card added to your account and ready for checkout."); await load();
    } catch (caught) { setError(caught.message || "We could not add this gift card."); }
    finally { setClaiming(false); }
  };
  return (
    <Guard>
      <Layout active="Gift Cards">
        <p className="eyebrow">Gift cards</p>
        <h2 className="account-title">Your gift cards</h2>
        <p className="account-muted">Add a gift card code to keep its balance ready for checkout.</p>
        <form className="gift-card-claim" onSubmit={claim}>
          <label>Gift card code<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="NBGC-XXXXXXXXXXXXXXXX" required /></label>
          <button className="button" disabled={claiming}>{claiming ? "Adding…" : "Add gift card"}</button>
        </form>
        {message && <p className="auth-success" role="status">{message}</p>}
        {error && <p className="field-error" role="alert">{error}</p>}
        {cards === null ? <p className="account-muted">Loading gift cards…</p> : cards === false ? <p className="account-muted">Gift cards are temporarily unavailable. Please try again.</p> : cards.length ? <div className="gift-card-list">{cards.map((card) => <article key={card.id}><span>•••• {card.codeLast4}</span><strong>₹{card.currentBalance.toLocaleString("en-IN")}</strong><small>{card.status === "active" ? "Ready to use at checkout" : card.status}</small></article>)}</div> : <p className="account-muted">No gift cards added yet. Have a code? Add it above.</p>}
      </Layout>
    </Guard>
  );
}
