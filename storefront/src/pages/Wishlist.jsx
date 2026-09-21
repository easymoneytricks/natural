import { useEffect, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { useWishlist } from "../context/PreferenceContext";
import { useAuth } from "../context/AuthContext";
import { getProductBySlug } from "../services/catalogApi";
import "./Wishlist.css";

export function Wishlist() {
  const { user } = useAuth();
  const { items, count, clear } = useWishlist();
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    let active = true;
    Promise.all(
      items
        .filter((entry) => entry.slug)
        .map((entry) => getProductBySlug(entry.slug).catch(() => null)),
    ).then((products) => {
      if (active) setSaved(products.filter(Boolean));
    });
    return () => {
      active = false;
    };
  }, [items]);
  if (!saved.length)
    return (
      <main className="wishlist-page wishlist-empty-page container">
        <p className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> My Account
        </p>
        <header className="account-header">
          <p className="eyebrow">My account</p>
          <h1>Welcome back, {user?.firstName || "there"}.</h1>
          <p>Manage your orders, addresses and account details in one place.</p>
        </header>
        <div className="wishlist-empty-layout">
          <nav className="account-nav" aria-label="Account navigation">
            <Link to="/account">Overview</Link>
            <Link to="/account/orders">Orders</Link>
            <Link className="active" to="/account/wishlist">
              Wishlist
            </Link>
            <Link to="/account/addresses">Addresses</Link>
            <Link to="/account/profile">Profile</Link>
            <Link to="/account/rewards">Rewards</Link>
            <Link to="/account/gift-cards">Gift Cards</Link>
          </nav>
          <section className="wishlist-empty">
            <p className="eyebrow">Your wishlist</p>
            <h1>Nothing saved yet.</h1>
            <p>
              Save the products you'd like to come back to and build your collection
              at your own pace.
            </p>
            <Link className="button" to="/shop">
              Explore products <ArrowRight size={15} />
            </Link>
            <Link className="empty-secondary" to="/shop?sort=best-selling">
              View best sellers
            </Link>
          </section>
        </div>
      </main>
    );
  return (
    <main className="wishlist-page container">
      <p className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> Wishlist
      </p>
      <header className="wishlist-header">
        <p className="eyebrow">Saved for later</p>
        <h1>Your wishlist</h1>
        <p>Keep the products you're considering close at hand.</p>
      </header>
      <div className="account-layout wishlist-account-layout">
        <nav className="account-nav" aria-label="Account navigation">
          <Link to="/account">Overview</Link>
          <Link to="/account/orders">Orders</Link>
          <Link className="active" to="/account/wishlist">
            Wishlist
          </Link>
          <Link to="/account/addresses">Addresses</Link>
          <Link to="/account/profile">Profile</Link>
          <Link to="/account/rewards">Rewards</Link>
          <Link to="/account/gift-cards">Gift Cards</Link>
        </nav>
        <section className="account-content">
          <div className="wishlist-utility">
            <strong>
              {count} saved {count === 1 ? "product" : "products"}
            </strong>
            {confirm ? (
              <span className="confirm-clear">
                Clear your wishlist?{" "}
                <button
                  onClick={() => {
                    clear();
                    setConfirm(false);
                  }}
                >
                  Yes, clear
                </button>
                <button onClick={() => setConfirm(false)}>Keep</button>
              </span>
            ) : (
              <button onClick={() => setConfirm(true)}>
                <Trash2 size={14} /> Clear wishlist
              </button>
            )}
          </div>
          <div className="wishlist-grid">
            {saved.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                onChooseOptions={() => {}}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
