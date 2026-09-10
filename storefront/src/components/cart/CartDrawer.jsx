import { useRef } from "react";
import { Minus, Plus, X, Trash2, ShoppingBag } from "lucide-react";
import { useFocusTrap } from "../ui/useFocusTrap";
import { useCart } from "../../context/CartContext";

const formatPrice = (value) => `₹${value.toLocaleString("en-IN")}`;

export function CartDrawer({ open, onClose }) {
  const ref = useRef(null);
  const { items, count, updateQuantity, removeItem } = useCart();
  useFocusTrap(ref, open, onClose);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <div
      className={`overlay cart-overlay ${open ? "is-open" : ""}`}
      aria-hidden={!open}
    >
      <button
        className="scrim"
        onClick={onClose}
        aria-label="Close shopping bag"
      />
      <aside
        ref={ref}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <header>
          <span>
            <ShoppingBag size={18} /> Your bag <em>{count}</em>
          </span>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close shopping bag"
          >
            <X />
          </button>
        </header>
        <div className="shipping-note">
          <span>
            {subtotal >= 999
              ? "You have complimentary shipping"
              : `You're ${formatPrice(999 - subtotal)} away from complimentary shipping`}
          </span>
          <div>
            <i style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }} />
          </div>
        </div>
        <div className="cart-items">
          {items.length ? (
            items.map((item) => (
              <article className="cart-item" key={item.sku}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.attributes.size}
                    {item.attributes.skinType
                      ? ` • ${item.attributes.skinType}`
                      : ""}
                    {item.attributes.concern
                      ? ` • ${item.attributes.concern}`
                      : ""}
                  </p>
                  <b>{formatPrice(item.price)}</b>
                  <div className="quantity">
                    <button
                      aria-label={`Decrease ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.sku, item.quantity - 1)
                      }
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.sku, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <button
                  className="remove"
                  onClick={() => removeItem(item.sku)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          ) : (
            <p className="cart-empty">
              Your bag is ready for something considered.
            </p>
          )}
        </div>
        <footer>
          <div className="subtotal">
            <span>Subtotal</span>
            <b>{formatPrice(subtotal)}</b>
          </div>
          <p>Taxes and shipping calculated at checkout.</p>
          <button className="button button-secondary" onClick={onClose}>
            View Bag
          </button>
          <button className="button" onClick={onClose}>
            Checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}
