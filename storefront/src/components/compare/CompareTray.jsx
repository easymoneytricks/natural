import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCompare } from "../../context/PreferenceContext";
import { getProductBySlug } from "../../services/catalogApi";
import "./CompareTray.css";

export function CompareTray() {
  const compare = useCompare();
  const location = useLocation();
  const [selected, setSelected] = useState([]);
  useEffect(() => {
    let active = true;
    Promise.all(
      compare.items
        .filter((entry) => entry.slug)
        .map((entry) => getProductBySlug(entry.slug).catch(() => null)),
    ).then((products) => {
      if (active) setSelected(products.filter(Boolean));
    });
    return () => {
      active = false;
    };
  }, [compare.items]);
  if (
    !selected.length ||
    [
      "/checkout",
      "/order-success",
      "/order-failed",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/account",
    ].includes(location.pathname)
  )
    return null;
  return (
    <aside
      className={`compare-tray ${location.pathname.startsWith("/product/") || location.pathname === "/cart" ? "compare-tray-purchase-page" : ""}`}
      aria-label="Compare products"
    >
      <div className="compare-tray-items">
        {selected.map((product) => (
          <div key={product.slug}>
            <img src={product.image} alt="" />
            <span>{product.name}</span>
            <button
              onClick={() => compare.remove(product.slug)}
              aria-label={`Remove ${product.name} from compare`}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <Link
        className={`button ${selected.length < 2 ? "is-disabled" : ""}`}
        to={selected.length < 2 ? "#" : "/compare"}
      >
        {selected.length < 2 ? "Add 1 more to compare" : "Compare products"}
      </Link>
      <button className="compare-tray-clear" onClick={compare.clear}>
        Clear
      </button>
    </aside>
  );
}
