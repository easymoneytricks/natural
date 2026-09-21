import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompare, useWishlist } from "../context/PreferenceContext";
import { getProductBySlug } from "../services/catalogApi";
import "./Compare.css";

const money = (value) => `₹${value.toLocaleString("en-IN")}`;
function details(product) {
  return {
    prices: [product.price],
    sizes: product.sizes || [],
    skin: product.skinTypes || [],
    concerns: product.concerns || [],
    ingredients: product.keyIngredients?.map((item) => item.name) || [],
    benefits: product.benefits || [],
    texture: product.texture || "",
    usage: product.usage || "",
    available: product.available !== false,
  };
}

export function Compare() {
  const compare = useCompare();
  const wishlist = useWishlist();
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
  const [differences, setDifferences] = useState(false);
  const rows = useMemo(
    () => [
      {
        label: "Price",
        values: selected.map((product) => {
          const info = details(product);
          return info.prices.length > 1
            ? `${money(Math.min(...info.prices))} – ${money(Math.max(...info.prices))}`
            : `From ${money(info.prices[0])}`;
        }),
      },
      {
        label: "Rating",
        values: selected.map(
          (product) => `${product.rating} (${product.reviews})`,
        ),
      },
      {
        label: "Category",
        values: selected.map((product) => product.category),
      },
      {
        label: "Available pack sizes",
        values: selected.map((product) => details(product).sizes.join(" · ")),
      },
      {
        label: "Suitable skin types",
        values: selected.map((product) => details(product).skin.join(" · ")),
      },
      {
        label: "Target concerns",
        values: selected.map((product) =>
          details(product).concerns.join(" · "),
        ),
      },
      {
        label: "Key ingredients",
        values: selected.map((product) =>
          details(product).ingredients.join(" · "),
        ),
      },
      {
        label: "Key benefits",
        values: selected.map((product) =>
          details(product).benefits.join(" · "),
        ),
      },
      {
        label: "Texture / format",
        values: selected.map((product) => details(product).texture),
      },
      {
        label: "When to use",
        values: selected.map((product) => details(product).usage),
      },
      {
        label: "Availability",
        values: selected.map((product) =>
          details(product).available ? "IN STOCK" : "OUT OF STOCK",
        ),
      },
    ],
    [selected],
  );
  return (
    <main className="compare-page container">
      <p className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> Compare
      </p>
      {compare.message && (
        <p className="compare-toast" role="status">
          {compare.message}
        </p>
      )}
      {!selected.length ? (
        <EmptyCompare />
      ) : (
        <>
          <div className="compare-tools">
            <span>{selected.length} of 4 products</span>
            <div>
              <button
                onClick={() => setDifferences((value) => !value)}
                aria-pressed={differences}
              >
                Highlight differences
              </button>
              <button onClick={compare.clear}>Clear all</button>
            </div>
          </div>
          <div className="compare-scroll">
            <div className="compare-matrix">
              <div className="compare-row compare-products">
                <div className="compare-label">Products</div>
                {selected.map((product) => (
                  <article key={product.slug}>
                    <Link to={`/product/${product.slug}`}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                    <button
                      className="compare-remove"
                      onClick={() => compare.remove(product.slug)}
                      aria-label={`Remove ${product.name} from compare`}
                    >
                      <X size={15} />
                    </button>
                    <p className="product-category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <button
                      className="compare-wishlist"
                      onClick={() => wishlist.toggle(product)}
                      aria-pressed={wishlist.has(product.slug)}
                    >
                      <Heart
                        size={14}
                        fill={
                          wishlist.has(product.slug) ? "currentColor" : "none"
                        }
                      />{" "}
                      {wishlist.has(product.slug) ? "Saved" : "Wishlist"}
                    </button>
                    <Link
                      className="compare-view"
                      to={`/product/${product.slug}`}
                    >
                      View product <ArrowRight size={14} />
                    </Link>
                  </article>
                ))}
              </div>
              {rows.map((row) => (
                <div
                  className={`compare-row ${differences && new Set(row.values).size > 1 ? "is-different" : ""}`}
                  key={row.label}
                >
                  <div className="compare-label">{row.label}</div>
                  {row.values.map((value, index) => (
                    <div key={`${row.label}-${index}`}>{value}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
function EmptyCompare() {
  return (
    <section className="compare-empty">
      <p className="eyebrow">Side by side</p>
      <h2>Nothing to compare yet.</h2>
      <p>
        Choose products while you browse and we'll line up the details for you.
      </p>
      <Link className="button" to="/shop">
        Explore products <ArrowRight size={15} />
      </Link>
    </section>
  );
}
