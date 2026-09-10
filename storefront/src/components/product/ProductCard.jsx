import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/PreferenceContext";

const formatPrice = (value) => `₹${value.toLocaleString("en-IN")}`;

export function ProductCard({ product, onChooseOptions }) {
  const { has, toggle } = useWishlist();
  const wishlisted = has(product.slug);
  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const priceLabel =
    product.maxPrice && product.maxPrice !== product.price
      ? `From ${formatPrice(product.price)}`
      : formatPrice(product.price);

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(product);
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/product/${product.slug}`} className="product-image-link">
          {product.badge && (
            <span className="product-badge">{product.badge}</span>
          )}
          <img src={product.image} alt={product.name} />
          <img
            className="product-hover-image"
            src={product.hoverImage}
            alt=""
          />
        </Link>
        <button
          className={`product-wishlist ${wishlisted ? "is-active" : ""}`}
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          onClick={toggleWishlist}
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <button
          className="product-quick-action"
          type="button"
          onClick={() => onChooseOptions(product)}
        >
          Choose options
        </button>
      </div>
      <div className="product-details">
        <p className="product-category">{product.category}</p>
        <Link to={`/product/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        <p className="product-concerns">
          For {product.concerns.join(" & ").toLowerCase()}
        </p>
        <p
          className="product-rating"
          aria-label={`${product.rating} out of 5 from ${product.reviews} reviews`}
        >
          <Star size={13} fill="currentColor" /> {product.rating}{" "}
          <span>({product.reviews})</span>
        </p>
        <p className="product-price">
          <strong>{priceLabel}</strong>
          <s>{formatPrice(product.mrp)}</s>
          <em>{discount}% off</em>
        </p>
        <p className="product-sizes">{product.sizes.join("  •  ")}</p>
      </div>
    </article>
  );
}
