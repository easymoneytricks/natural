import { X } from "lucide-react";
import { Link } from "react-router-dom";

const formatPrice = (value) => `₹${value.toLocaleString("en-IN")}`;

export function QuickOptions({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="quick-options-overlay" role="presentation">
      <button
        className="quick-options-scrim"
        type="button"
        aria-label="Close options"
        onClick={onClose}
      />
      <section
        className="quick-options"
        role="dialog"
        aria-modal="true"
        aria-label={`Options for ${product.name}`}
      >
        <button
          className="quick-options-close"
          type="button"
          aria-label="Close options"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <img src={product.image} alt={product.name} />
        <div>
          <p className="product-category">{product.category}</p>
          <h2>{product.name}</h2>
          <strong>{formatPrice(product.price)}</strong>
          <p className="quick-options-label">Available sizes</p>
          <div className="quick-options-sizes">
            {product.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
          <Link
            className="button"
            to={`/product/${product.slug}`}
            onClick={onClose}
          >
            View product
          </Link>
        </div>
      </section>
    </div>
  );
}
