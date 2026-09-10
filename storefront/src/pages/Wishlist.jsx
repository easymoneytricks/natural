import { useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { useWishlist } from "../context/PreferenceContext";
import { products, newArrivals } from "../data/products";
import "./Wishlist.css";

const catalog = [...products, ...newArrivals];

export function Wishlist() {
  const { items, count, clear } = useWishlist();
  const [confirm, setConfirm] = useState(false);
  const saved = items
    .map((entry) => catalog.find((product) => product.slug === entry.slug))
    .filter(Boolean);
  if (!saved.length)
    return (
      <section className="wishlist-empty container">
        <p className="eyebrow">Your wishlist</p>
        <h1>Nothing saved yet.</h1>
        <p>
          Save the formulas you'd like to come back to and build your ritual at
          your own pace.
        </p>
        <Link className="button" to="/shop">
          Explore skincare <ArrowRight size={15} />
        </Link>
        <Link className="empty-secondary" to="/best-sellers">
          View best sellers
        </Link>
      </section>
    );
  return (
    <main className="wishlist-page container">
      <p className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> Wishlist
      </p>
      <header className="wishlist-header">
        <p className="eyebrow">Saved for later</p>
        <h1>Your wishlist</h1>
        <p>Keep the formulas you're considering close at hand.</p>
      </header>
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
    </main>
  );
}
