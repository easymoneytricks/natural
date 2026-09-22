import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Heart, ArrowRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { useCart } from "../context/CartContext";
import { shippingRules } from "../config/commerce";
import { useWishlist } from "../context/PreferenceContext";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../services/catalogApi";
import "./Cart.css";

const money = (value) => `₹${Math.max(0, value).toLocaleString("en-IN")}`;

const readSavedCoupon = () => {
  try {
    const saved = sessionStorage.getItem("natural-beauty-coupon");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
const readSavedGift = () => {
  try {
    const saved = sessionStorage.getItem("natural-beauty-gift");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { toggle: toggleWishlist } = useWishlist();
  const { authStatus, authFetch } = useAuth();
  const [coupon, setCoupon] = useState(readSavedCoupon);
  const [couponInput, setCouponInput] = useState(
    () => readSavedCoupon()?.code || "",
  );
  const [couponMessage, setCouponMessage] = useState("");
  const [gift, setGift] = useState(readSavedGift);
  const [giftInput, setGiftInput] = useState(
    () => readSavedGift()?.code || "",
  );
  const [giftMessage, setGiftMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    if (authStatus !== "authenticated" || gift) return;
    authFetch("/customer/gift-cards")
      .then((response) => {
        const card = (response.data || []).find(
          (entry) => entry.status === "active" && entry.currentBalance > 0,
        );
        if (card) {
          const saved = { id: card.id, balance: card.currentBalance };
          sessionStorage.setItem("natural-beauty-gift", JSON.stringify(saved));
          setGift(saved);
        }
      })
      .catch(() => {});
  }, [authStatus, authFetch, gift]);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const mrpTotal = items.reduce(
    (sum, item) => sum + (item.mrp || item.price) * item.quantity,
    0,
  );
  const productDiscount = mrpTotal - subtotal;
  const couponDiscount = coupon
    ? Math.min(
        coupon.type === "percentage"
          ? (subtotal * coupon.value) / 100
          : coupon.value,
        coupon.maximum || Infinity,
      )
    : 0;
  const shipping = subtotal >= shippingRules.threshold ? 0 : shippingRules.fee;
  const giftApplied = gift
    ? Math.min(gift.balance, Math.max(0, subtotal - couponDiscount + shipping))
    : 0;
  const total = Math.max(0, subtotal - couponDiscount + shipping - giftApplied);
  const unavailable = items.some((item) => item.stock < 1);
  useEffect(() => {
    let active = true;
    getProducts({ sort: "best-selling", page: 1, limit: 4 })
      .then(({ data }) => {
        if (!active) return;
        const cartSlugs = new Set(items.map((item) => item.slug));
        setRecommendations(data.filter((product) => !cartSlugs.has(product.slug)).slice(0, 4));
      })
      .catch(() => {
        if (active) setRecommendations([]);
      });
    return () => { active = false; };
  }, [items]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    const saved = {
      code,
      label: "Applied · validated at checkout",
      type: "flat",
      value: 0,
      minimum: 0,
    };
    sessionStorage.setItem("natural-beauty-coupon", JSON.stringify(saved));
    setCoupon(saved);
    setCouponMessage("Coupon saved and will stay applied until you remove it.");
  };
  const redeemGift = () => {
    const code = giftInput.trim().toUpperCase();
    if (!code) {
      setGiftMessage("Enter a gift card code first.");
      return;
    }
    const saved = { code, balance: 0 };
    sessionStorage.setItem("natural-beauty-gift", JSON.stringify(saved));
    setGift(saved);
    setGiftMessage("Gift card saved and will stay applied until you remove it.");
  };
  const moveToWishlist = (item) => {
    toggleWishlist(item, {
      preferredSku: item.sku,
      preferredAttributes: item.attributes,
    });
    removeItem(item.sku);
    setWishlistMessage(`${item.name} moved to wishlist.`);
    window.setTimeout(() => setWishlistMessage(""), 2800);
  };

  if (!items.length)
    return (
      <>
        <section className="cart-empty-page container">
          <p className="eyebrow">Your bag</p>
          <h1>Your items are waiting.</h1>
          <p>
            Explore products by category or the needs that matter to you.
          </p>
          <Link className="button" to="/shop">
            Explore products <ArrowRight size={15} />
          </Link>
          <Link className="empty-secondary" to="/best-sellers">
            View best sellers
          </Link>
        </section>
        <Recommendations items={recommendations} />
      </>
    );

  return (
    <>
      <main className="cart-page container">
        <p className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> Bag
        </p>
        <header className="cart-header">
          <p className="eyebrow">Your bag</p>
          <h1>Your cart</h1>
          <p>Review your selections before continuing to checkout.</p>
        </header>
        <ShippingProgress subtotal={subtotal} />
        <div className="cart-layout">
          <section className="cart-lines">
            {items.map((item) => (
              <CartLine
                key={item.sku}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
                onWishlist={moveToWishlist}
              />
            ))}
            <div className="cart-links">
              <Link to="/shop">← Continue shopping</Link>
              <button onClick={clearCart}>Clear bag</button>
            </div>
            <div className="promo-stack">
              <PromoBox
                title="Have a coupon?"
                input={couponInput}
                setInput={setCouponInput}
                action="Apply"
                onAction={applyCoupon}
                message={couponMessage}
                applied={coupon}
                onRemove={() => {
                  sessionStorage.removeItem("natural-beauty-coupon");
                  setCoupon(null);
                  setCouponInput("");
                  setCouponMessage("");
                }}
                saved={couponDiscount}
              />
              <PromoBox
                title="Have a gift card?"
                input={giftInput}
                setInput={setGiftInput}
                action="Redeem"
                onAction={redeemGift}
                message={giftMessage}
                applied={gift}
                onRemove={() => {
                  sessionStorage.removeItem("natural-beauty-gift");
                  setGift(null);
                  setGiftInput("");
                  setGiftMessage("");
                }}
                gift
                saved={giftApplied}
              />
            </div>
          </section>
          <OrderSummary
            subtotal={subtotal}
            productDiscount={productDiscount}
            couponDiscount={couponDiscount}
            giftApplied={giftApplied}
            shipping={shipping}
            total={total}
            unavailable={unavailable}
          />
        </div>
        {wishlistMessage && (
          <p className="cart-toast" role="status">
            <Check size={15} /> {wishlistMessage}
          </p>
        )}
      </main>
      <Recommendations items={recommendations} />
      <div className="mobile-checkout-bar">
        <span>
          {money(total)}
          <small>Total</small>
        </span>
        <Link
          to={unavailable ? "/cart" : "/checkout"}
          aria-disabled={unavailable}
        >
          Proceed to checkout
        </Link>
      </div>
    </>
  );
}

function CartLine({ item, onUpdate, onRemove, onWishlist }) {
  return (
    <article className="cart-line">
      <Link to={`/product/${item.slug}`} className="cart-line-image">
        <img src={item.image} alt={item.name} />
      </Link>
      <div className="cart-line-info">
        <p className="product-category">{item.category || "Product"}</p>
        <Link to={`/product/${item.slug}`}>
          <h2>{item.name}</h2>
        </Link>
        <p className="line-attributes">
          {Object.values(item.attributes).filter(Boolean).join(" · ")}
        </p>
        <p className="line-sku">SKU: {item.sku}</p>
        <div className="line-price">
          <strong>{money(item.price)}</strong>
          {item.mrp > item.price && <s>{money(item.mrp)}</s>}
        </div>
        <div className="line-controls">
          <span>Quantity</span>
          <div className="quantity">
            <button
              onClick={() => onUpdate(item.sku, item.quantity - 1)}
              aria-label={`Decrease ${item.name}`}
            >
              <Minus size={13} />
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.sku, item.quantity + 1)}
              disabled={item.quantity >= item.stock || item.stock < 1}
              aria-label={`Increase ${item.name}`}
            >
              <Plus size={13} />
            </button>
          </div>
          <strong className="line-total">
            {money(item.price * item.quantity)}
          </strong>
        </div>
        {item.stock < 1 ? (
          <p className="line-unavailable">Currently unavailable</p>
        ) : item.stock <= 3 ? (
          <p className="line-low-stock">Only {item.stock} left</p>
        ) : null}
        <div className="line-actions">
          <button onClick={() => onWishlist(item)}>
            <Heart size={14} /> Move to wishlist
          </button>
          <button onClick={() => onRemove(item.sku)}>
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </article>
  );
}
function ShippingProgress({ subtotal }) {
  const progress = Math.min(100, (subtotal / shippingRules.threshold) * 100);
  return (
    <section className="shipping-progress">
      <div>
        <strong>
          {subtotal >= shippingRules.threshold
            ? "You've unlocked complimentary shipping."
            : `You're ${money(shippingRules.threshold - subtotal)} away from complimentary shipping.`}
        </strong>
        <span>
          {money(subtotal)} / {money(shippingRules.threshold)}
        </span>
      </div>
      <i>
        <b style={{ width: `${progress}%` }} />
      </i>
    </section>
  );
}
function PromoBox({
  title,
  input,
  setInput,
  action,
  onAction,
  message,
  applied,
  onRemove,
  gift,
  saved = 0,
}) {
  return (
    <section className="promo-box">
      <p>{title}</p>
      {applied ? (
        <div className="applied-promo">
          <div>
            <strong>{gift ? "Gift card" : applied.code}</strong>
            <span>
              {gift
                ? `Available balance: ${money(applied.balance)} · Applied: ${money(saved)}`
                : `${applied.label} · You saved ${money(saved)}`}
            </span>
          </div>
          <button onClick={onRemove}>Remove</button>
        </div>
      ) : (
        <div className="promo-input">
          <label className="sr-only" htmlFor={`${action}-${title}`}>
            {title}
          </label>
          <input
            id={`${action}-${title}`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={gift ? "Enter gift card code" : "Enter coupon code"}
          />
          <button onClick={onAction}>{action}</button>
        </div>
      )}
      {message && (
        <small className="promo-error" role="status">
          {message}
        </small>
      )}
    </section>
  );
}
function OrderSummary({
  subtotal,
  productDiscount,
  couponDiscount,
  giftApplied,
  shipping,
  total,
  unavailable,
}) {
  return (
    <aside className="order-summary">
      <p className="eyebrow">Order summary</p>
      <div>
        <span>Subtotal</span>
        <strong>{money(subtotal)}</strong>
      </div>
      <div>
        <span>Product discount</span>
        <strong className="saving">−{money(productDiscount)}</strong>
      </div>
      <div>
        <span>Coupon discount</span>
        <strong className="saving">
          {couponDiscount ? `−${money(couponDiscount)}` : "—"}
        </strong>
      </div>
      <div>
        <span>Gift card</span>
        <strong className="saving">
          {giftApplied ? `−${money(giftApplied)}` : "—"}
        </strong>
      </div>
      <div>
        <span>Shipping</span>
        <strong>{shipping ? money(shipping) : "Free"}</strong>
      </div>
      <hr />
      <div className="summary-total">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
      {productDiscount > 0 && (
        <p className="summary-saving">
          You save {money(productDiscount + couponDiscount)} on this order.
        </p>
      )}
      <Link
        className={`button ${unavailable ? "is-disabled" : ""}`}
        to={unavailable ? "/cart" : "/checkout"}
      >
        Proceed to checkout
      </Link>
      {unavailable && (
        <p className="checkout-note">
          Remove unavailable items before checkout.
        </p>
      )}
      <p className="secure-checkout">
        Secure checkout
        <br />
        UPI · Cards · Net Banking · COD
      </p>
    </aside>
  );
}
function Recommendations({ items }) {
  const navigate = useNavigate();
  if (!items.length) return null;
  return (
    <section className="cart-recommendations container">
      <p className="eyebrow">You may also like</p>
      <h2>Explore more from the collection.</h2>
      <div className="product-grid">
        {items.map((item) => (
          <ProductCard
            key={item.slug}
            product={item}
            onChooseOptions={(product) => navigate(`/product/${product.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}
