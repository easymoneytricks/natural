import { useEffect, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { useWishlist } from "../context/PreferenceContext";
import { getProductBySlug } from "../services/catalogApi";
import "./Wishlist.css";

export function Wishlist() {
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
          <Link to="/">Home</Link> <span>/</span> Wishlist
        </p>
        <section className="wishlist-empty">
          <p className="eyebrow">Saved for later</p>
          <h1>Nothing saved yet.</h1>
          <p>
            Save products while you browse and keep your favourites together.
          </p>
          <Link className="button" to="/shop">
            Explore products <ArrowRight size={15} />
          </Link>
          <Link className="empty-secondary" to="/shop?sort=best-selling">
            View best sellers
          </Link>
        </section>
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
      <div className="wishlist-content">
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
      </div>
    </main>
  );
}
