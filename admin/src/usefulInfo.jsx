import { useEffect, useState } from "react";
import { RefreshCw, Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "./main";

function InsightList({ title, icon: Icon, rows, countKey, label }) {
  return (
    <section className="card insight-card">
      <header>
        <div>
          <Icon size={18} />
          <span className="section-kicker">CUSTOMER SIGNAL</span>
          <h2>{title}</h2>
        </div>
      </header>
      {!rows.length ? (
        <p className="muted">No customer activity yet.</p>
      ) : (
        rows.map((row, index) => (
          <div className="insight-row" key={row.id}>
            <span className="insight-rank">0{index + 1}</span>
            <span>
              <b>{row.name}</b>
              <small>
                {row.shoppers} unique shopper{row.shoppers === 1 ? "" : "s"}
              </small>
            </span>
            <strong>
              {row[countKey]}
              <small>{label}</small>
            </strong>
          </div>
        ))
      )}
    </section>
  );
}

export function UsefulInfoPage() {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () =>
    authFetch("/admin/useful-info")
      .then((response) => setData(response.data))
      .catch((caught) =>
        setError(caught.message || "Unable to load customer insights."),
      );
  useEffect(() => {
    load();
  }, []);
  return (
    <div>
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CUSTOMER INTELLIGENCE</span>
          <h1>Useful Info</h1>
          <p>Understand what customers are saving and considering right now.</p>
        </div>
        <button className="button-secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <div className="insight-summary">
            <div>
              <b>{data.totals.wishlist_lines}</b>
              <span>Wishlist saves</span>
            </div>
            <div>
              <b>{data.totals.cart_units}</b>
              <span>Units in carts</span>
            </div>
            <div>
              <b>{data.totals.wishlist_shoppers}</b>
              <span>Wishlist shoppers</span>
            </div>
            <div>
              <b>{data.totals.cart_shoppers}</b>
              <span>Cart shoppers</span>
            </div>
          </div>
          <div className="insight-grid">
            <InsightList
              title="Most wishlisted"
              icon={Heart}
              rows={data.mostWishlisted}
              countKey="wishlistCount"
              label="saves"
            />
            <InsightList
              title="Most in customer carts"
              icon={ShoppingBag}
              rows={data.mostInCart}
              countKey="cartQuantity"
              label="units"
            />
          </div>
        </>
      )}
    </div>
  );
}
