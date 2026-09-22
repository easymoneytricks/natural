/* oxlint-disable react/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { shippingRules } from "../config/commerce";
import { useAuth } from "../context/AuthContext";
import { getAddresses } from "../services/authApi";
import { getQuote, getShippingMethods } from "../services/checkoutApi";
import { createOrder } from "../services/orderApi";
import { createCashfreeOrder, createRazorpayOrder, verifyRazorpay } from "../services/paymentApi";
import { apiRequest } from "../lib/api";
import { getBusinessName, useStoreSettings } from "../context/StoreSettingsContext";
import "./Checkout.css";

const money = (value) => `₹${Math.max(0, value).toLocaleString("en-IN")}`;
const states = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
const blankAddress = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  landmark: "",
  pin: "",
  city: "",
  state: "",
  country: "India",
  mobile: "",
};
const readSession = (key, fallback) => {
  try {
    return JSON.parse(sessionStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export function Checkout() {
  const businessName = getBusinessName(useStoreSettings());
  const { items, clearCart, serverMode } = useCart();
  const { user, isAuthenticated, authFetch } = useAuth();
  const navigate = useNavigate();
  const firstError = useRef(null);
  const [draft, setDraft] = useState(() =>
    readSession("natural-beauty-checkout-draft", {
      email: "",
      mobile: "",
      address: blankAddress,
      billingSame: true,
      billing: blankAddress,
      shippingMethod: "standard",
      payment: "cod",
      terms: false,
    }),
  );
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  useEffect(() => {
    apiRequest("/checkout/payment-methods")
      .then((result) => setPaymentProvider(result.data || null))
      .catch(() => setPaymentProvider(null));
  }, []);
  useEffect(() => {
    getShippingMethods()
      .then((result) => setShippingMethods(result.data || []))
      .catch(() => setShippingMethods([]));
  }, []);
  useEffect(() => {
    if (paymentProvider && !paymentProvider.online && draft.payment === "online")
      update("payment", "cod");
  }, [paymentProvider]);
  const [placing, setPlacing] = useState(false);
  const [abandonedSessionKey] = useState(() => {
    const existing = localStorage.getItem("natural-beauty-abandoned-checkout");
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem("natural-beauty-abandoned-checkout", created);
    return created;
  });
  const idempotencyRef = useRef(null);
  const subtotal =
    quote?.pricing?.subtotal ??
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal =
    quote?.pricing?.mrpTotal ??
    items.reduce(
      (sum, item) => sum + (item.mrp || item.price) * item.quantity,
      0,
    );
  const productDiscount =
    quote?.pricing?.productDiscount ?? mrpTotal - subtotal;
  const coupon = readSession("natural-beauty-coupon", null);
  const standardMethod = shippingMethods.find((method) => method.code === "STANDARD");
  const expressMethod = shippingMethods.find((method) => method.code === "EXPRESS");
  const gift = readSession("natural-beauty-gift", null);
  const activeCoupon =
    coupon && !coupon.expired && subtotal >= coupon.minimum ? coupon : null;
  const couponDiscount =
    quote?.pricing?.coupon?.discount ??
    (activeCoupon
      ? Math.min(
          activeCoupon.type === "percentage"
            ? (subtotal * activeCoupon.value) / 100
            : activeCoupon.value,
          activeCoupon.maximum || Infinity,
        )
      : 0);
  const shipping =
    quote?.pricing?.shipping?.fee ??
    (draft.shippingMethod === "express"
      ? 149
      : subtotal >= shippingRules.threshold
        ? 0
        : shippingRules.fee);
  const giftApplied =
    quote?.pricing?.giftCard?.applied ??
    (gift && !gift.expired
      ? Math.min(
          gift.balance,
          Math.max(0, subtotal - couponDiscount + shipping),
        )
      : 0);
  const total =
    quote?.pricing?.payableTotal ??
    Math.max(0, subtotal - couponDiscount + shipping - giftApplied);
  useEffect(() => {
    sessionStorage.setItem(
      "natural-beauty-checkout-draft",
      JSON.stringify(draft),
    );
  }, [draft]);
  useEffect(() => {
    if (!items.length) return undefined;
    const timer = window.setTimeout(() => {
      const payload = {
        sessionKey: abandonedSessionKey,
        email: draft.email,
        phone: draft.mobile,
        estimatedTotal: total,
        items: items.map((item) => ({
          skuId: item.skuId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        checkout: {
          shippingMethod: draft.shippingMethod,
          payment: draft.payment,
          address: draft.address,
        },
      };
      const request = isAuthenticated
        ? authFetch("/checkout/abandoned", { method: "POST", body: payload })
        : apiRequest("/checkout/abandoned", {
            method: "POST",
            body: payload,
            credentials: "include",
          });
      request.catch(() => {});
    }, 800);
    return () => window.clearTimeout(timer);
  }, [abandonedSessionKey, authFetch, draft, isAuthenticated, items, total]);
  useEffect(() => {
    if (!isAuthenticated)
      sessionStorage.setItem("natural-beauty-auth-return", "/checkout");
  }, [isAuthenticated]);
  useEffect(() => {
    if (!user) return;
    setDraft((current) => ({
      ...current,
      email: current.email || user.email,
      mobile: current.mobile || user.mobile,
      address: {
        ...current.address,
        firstName: current.address.firstName || user.firstName,
        lastName: current.address.lastName || user.lastName,
        mobile: current.address.mobile || user.mobile,
      },
    }));
  }, [user]);
  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    setQuoteLoading(true);
    setQuoteError("");
    const body = {
      shippingMethod: draft.shippingMethod.toUpperCase(),
      destination: {
        countryCode: "IN",
        state: draft.address.state,
        postalCode: draft.address.pin,
      },
      ...(serverMode
        ? {}
        : {
            items: items.map((item) => ({
              skuId: item.skuId,
              sku: item.sku,
              quantity: item.quantity,
            })),
          }),
      ...(coupon?.code ? { couponCode: coupon.code } : {}),
      ...(gift?.code ? { giftCardCode: gift.code } : {}),
      ...(gift?.id ? { giftCardId: gift.id } : {}),
    };
    getQuote(body, serverMode ? authFetch : null)
      .then((result) => {
        if (!controller.signal.aborted) {
          setQuote(result.data);
          setQuoteError(
            result.data.checkoutReady
              ? ""
              : result.data.issues?.[0]?.message ||
                  "Some items in your bag need attention before checkout.",
          );
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setQuote(null);
          setQuoteError(
            "We couldn't verify your order total. Please try again.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setQuoteLoading(false);
      });
    return () => controller.abort();
  }, [
    items,
    serverMode,
    authFetch,
    draft.shippingMethod,
    draft.address.state,
    draft.address.pin,
    coupon?.code,
    gift?.code,
  ]);
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let active = true;
    const load = async () => {
      try {
        const result = await getAddresses(authFetch);
        if (!active) return;
        const address =
          (result.data || []).find((item) => item.isDefault) ||
          result.data?.[0];
        if (!address) return;
        setDraft((current) => {
          if (
            current.address.firstName ||
            current.address.address1 ||
            current.address.city ||
            current.address.pin
          )
            return current;
          return {
            ...current,
            address: {
              ...current.address,
              firstName: address.firstName,
              lastName: address.lastName,
              mobile: address.phone,
              address1: address.addressLine1,
              address2: address.addressLine2,
              landmark: address.landmark,
              city: address.city,
              state: address.state,
              pin: address.postalCode,
              country:
                address.countryCode === "IN" ? "India" : address.countryCode,
            },
          };
        });
      } catch {
        /* saved addresses are optional in checkout */
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [authFetch, isAuthenticated, user]);
  const update = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const updateAddress = (which, key, value) =>
    setDraft((current) => ({
      ...current,
      [which]: { ...current[which], [key]: value },
    }));
  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(draft.email))
      next.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(draft.mobile.replace(/\D/g, "")))
      next.mobile = "Enter a valid 10-digit mobile number.";
    Object.entries(draft.address).forEach(([key, value]) => {
      if (
        [
          "firstName",
          "lastName",
          "address1",
          "pin",
          "city",
          "state",
          "mobile",
        ].includes(key) &&
        !String(value).trim()
      )
        next[`address.${key}`] = "This field is required.";
    });
    if (draft.address.pin && !/^\d{6}$/.test(draft.address.pin))
      next["address.pin"] = "Enter a valid 6-digit PIN code.";
    if (
      draft.address.mobile &&
      !/^\d{10}$/.test(draft.address.mobile.replace(/\D/g, ""))
    )
      next["address.mobile"] = "Enter a valid 10-digit mobile number.";
    if (!draft.billingSame)
      Object.entries(draft.billing).forEach(([key, value]) => {
        if (
          [
            "firstName",
            "lastName",
            "address1",
            "pin",
            "city",
            "state",
            "mobile",
          ].includes(key) &&
          !String(value).trim()
        )
          next[`billing.${key}`] = "This field is required.";
      });
    if (!draft.payment) next.payment = "Select a payment method.";
    if (!draft.terms)
      next.terms = "Please accept the Terms & Conditions to continue.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first)
      firstError.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    return !first;
  };
  const placeOrder = async (event) => {
    event.preventDefault();
    if (placing || quoteLoading || !quote || !quote.checkoutReady) {
      if (!quote?.issues?.length)
        setQuoteError("We couldn't verify your order total. Please try again.");
      return;
    }
    if (!validate()) return;
    setPlacing(true);
    idempotencyRef.current ||= crypto.randomUUID();
    const body = {
      idempotencyKey: idempotencyRef.current,
      paymentMethod: draft.payment,
      shippingMethod: draft.shippingMethod.toUpperCase(),
      shippingAddress: {
        firstName: draft.address.firstName,
        lastName: draft.address.lastName,
        phone: draft.address.mobile,
        addressLine1: draft.address.address1,
        addressLine2: draft.address.address2,
        landmark: draft.address.landmark,
        city: draft.address.city,
        state: draft.address.state,
        postalCode: draft.address.pin,
        countryCode: "IN",
      },
      contact: { email: draft.email, phone: draft.mobile },
      abandonedSessionKey,
      couponCode: coupon?.code,
      giftCardCode: gift?.code,
      giftCardId: gift?.id,
      ...(serverMode
        ? {}
        : {
            items: items.map((item) => ({
              skuId: item.skuId,
              sku: item.sku,
              quantity: item.quantity,
            })),
          }),
    };
    try {
      const result = await createOrder(body, serverMode ? authFetch : null);
      const created = result.data.order;
      if (draft.payment === "online") {
        const createPayment = paymentProvider?.provider === "razorpay"
          ? createRazorpayOrder
          : createCashfreeOrder;
        const onlineOrder = await createPayment(
          {
            orderNumber: created.orderNumber,
            customer: { email: draft.email, phone: draft.mobile },
          },
          serverMode ? authFetch : null,
        );
        if (paymentProvider?.provider === "razorpay") {
          if (!window.Razorpay) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://checkout.razorpay.com/v1/checkout.js";
              script.onload = resolve;
              script.onerror = () => reject(new Error("Razorpay checkout could not load."));
              document.head.appendChild(script);
            });
          }
          await new Promise((resolve, reject) => {
            const razorpay = new window.Razorpay({
              key: onlineOrder.data.keyId,
              amount: onlineOrder.data.amount,
              currency: onlineOrder.data.currency,
              name: businessName,
              order_id: onlineOrder.data.orderId,
              prefill: { email: draft.email, contact: draft.mobile },
              handler: async (response) => {
                try {
                  await verifyRazorpay(response, serverMode ? authFetch : null);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
              modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
            });
            razorpay.open();
          });
        } else {
          if (!window.Cashfree) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Cashfree checkout could not load."));
            document.head.appendChild(script);
          });
        }
        const cashfree = window.Cashfree({
          mode: cashfreeOrder.data.cashfreeMode || "sandbox",
        });
          await cashfree.checkout({
          paymentSessionId: onlineOrder.data.paymentSessionId,
          redirectTarget: "_self",
          });
          localStorage.removeItem("natural-beauty-abandoned-checkout");
          return;
        }
      }
      sessionStorage.setItem(
        "natural-beauty-order",
        JSON.stringify({
          ...created,
          total: created.pricing.total,
          deliveryAddress: {
            firstName: draft.address.firstName,
            lastName: draft.address.lastName,
            address1: draft.address.address1,
            city: draft.address.city,
            state: draft.address.state,
            pin: draft.address.pin,
          },
          items: items.map((item) => ({
            ...item,
            price: item.price,
            mrp: item.mrp,
          })),
        }),
      );
      sessionStorage.removeItem("natural-beauty-checkout-draft");
      sessionStorage.removeItem("natural-beauty-coupon");
      sessionStorage.removeItem("natural-beauty-gift");
      await clearCart();
      localStorage.removeItem("natural-beauty-abandoned-checkout");
      idempotencyRef.current = null;
      navigate("/order-success");
    } catch (error) {
      setQuoteError(
        error?.code === "INSUFFICIENT_STOCK"
          ? "Some items are no longer available in the requested quantity."
          : error?.message || "We could not place your order right now. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };
  if (!items.length) return <EmptyCheckout />;
  if (items.some((item) => item.stock < 1))
    return (
      <section className="checkout-guard container">
        <p className="eyebrow">Your bag needs attention</p>
        <h1>One or more items are unavailable.</h1>
        <p>Review your bag before continuing to checkout.</p>
        <Link className="button" to="/cart">
          Review bag
        </Link>
      </section>
    );
  return (
    <main className="checkout-page container">
      <div className="checkout-top">
        <Link to="/" className="wordmark">
          {businessName}
        </Link>
        <span>
          <Lock size={13} /> Secure checkout
        </span>
      </div>
      <p className="checkout-steps">
        <Link to="/cart">Bag</Link> <span>→</span> Checkout <span>→</span>{" "}
        Confirmation
      </p>
      {quoteError && (
        <p className="checkout-error" role="alert">
          {quoteError}
        </p>
      )}
      <form onSubmit={placeOrder} className="checkout-layout">
        <section className="checkout-form">
          <CheckoutSection title="Contact">
            <Field
              label="Email address"
              value={draft.email}
              onChange={(value) => update("email", value)}
              error={errors.email}
              type="email"
              autoComplete="email"
              inputRef={firstError}
            />
            <Field
              label="Mobile number"
              value={draft.mobile}
              onChange={(value) => update("mobile", value)}
              error={errors.mobile}
              inputMode="numeric"
            />
          </CheckoutSection>
          <p
            className="guest-note"
            style={{ display: isAuthenticated ? "none" : undefined }}
          >
            Guest checkout · Already have an account?{" "}
            <Link to="/account">Sign in</Link>
          </p>
          {isAuthenticated && (
            <p className="guest-note">Signed in as {user?.email}</p>
          )}
          <CheckoutSection title="Delivery address">
            <AddressFields
              address={draft.address}
              update={(key, value) => updateAddress("address", key, value)}
              errors={errors}
              inputRef={firstError}
            />
          </CheckoutSection>
          <label className="check-row">
            <input
              type="checkbox"
              checked={draft.billingSame}
              onChange={(event) => update("billingSame", event.target.checked)}
            />{" "}
            Billing address is the same as delivery address
          </label>
          {!draft.billingSame && (
            <CheckoutSection title="Billing address">
              <AddressFields
                address={draft.billing}
                update={(key, value) => updateAddress("billing", key, value)}
                errors={errors}
              />
            </CheckoutSection>
          )}
          <CheckoutSection title="Delivery method">
            <div className="method-list">
              <Method
                checked={draft.shippingMethod === "standard"}
                onChange={() => update("shippingMethod", "standard")}
                title={
                  subtotal >= Number(standardMethod?.freeShippingThreshold || shippingRules.threshold)
                    ? "Complimentary standard delivery"
                    : standardMethod?.name || "Standard delivery"
                }
                text={standardMethod ? `Estimated ${standardMethod.estimatedDaysMin}–${standardMethod.estimatedDaysMax} business days` : "Estimated 3–5 business days"}
                price={
                  subtotal >= Number(standardMethod?.freeShippingThreshold || shippingRules.threshold)
                    ? "Free"
                    : money(standardMethod?.fee ?? shippingRules.fee)
                }
              />
              <Method
                checked={draft.shippingMethod === "express"}
                onChange={() => update("shippingMethod", "express")}
                title={expressMethod?.name || "Express delivery"}
                text={expressMethod ? `Estimated ${expressMethod.estimatedDaysMin}–${expressMethod.estimatedDaysMax} business days` : "Estimated 1–2 business days"}
                price={money(expressMethod?.fee ?? 149)}
              />
            </div>
          </CheckoutSection>
          <CheckoutSection title="Payment">
            <div className="method-list">
              <Method
                checked={draft.payment === "online"}
                onChange={() => update("payment", "online")}
                title={paymentProvider?.provider ? `Online payment · ${paymentProvider.provider}` : "Online payment"}
                text="UPI · Cards · Net Banking"
                price={paymentProvider?.online ? "Secure" : "Unavailable"}
                disabled={!paymentProvider?.online}
              />
              <Method
                checked={draft.payment === "cod"}
                onChange={() => update("payment", "cod")}
                title="Cash on delivery"
                text="Pay when your order arrives"
                price="Available"
              />
            </div>
            {draft.payment === "online" && (
              <p className="payment-note">
                You will be securely redirected to our payment partner to
                complete your payment after reviewing this order.
              </p>
            )}
            {errors.payment && <p className="field-error">{errors.payment}</p>}
          </CheckoutSection>
          <CheckoutSection title="Review your order">
            <div className="review-items">
              {items.map((item) => (
                <div key={item.sku}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {Object.values(item.attributes)
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <small>
                      SKU: {item.sku} · Qty {item.quantity}
                    </small>
                  </div>
                  <b>{money(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>
            <Link className="edit-bag" to="/cart">
              Edit bag <ArrowRight size={14} />
            </Link>
          </CheckoutSection>
          <label className="check-row terms-row">
            <input
              type="checkbox"
              checked={draft.terms}
              onChange={(event) => update("terms", event.target.checked)}
            />{" "}
            I agree to the <Link to="/terms">Terms & Conditions</Link> and
            acknowledge the <Link to="/privacy">Privacy Policy</Link>.
          </label>
          {errors.terms && (
            <p className="field-error" ref={firstError}>
              {errors.terms}
            </p>
          )}
          <button className="button place-order" type="submit">
            {draft.payment === "online"
              ? "Place order & pay"
              : "Place COD order"}
          </button>
        </section>
        <Summary
          subtotal={subtotal}
          productDiscount={productDiscount}
          couponDiscount={couponDiscount}
          shipping={shipping}
          giftApplied={giftApplied}
          total={total}
          coupon={activeCoupon}
          gift={gift}
        />
      </form>
    </main>
  );
}

function CheckoutSection({ title, children }) {
  return (
    <section className="checkout-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  inputRef,
}) {
  return (
    <label className="field">
      {label} <span>*</span>
      <input
        ref={error ? inputRef : null}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
function AddressFields({ address, update, errors, inputRef }) {
  return (
    <div className="address-grid">
      <Field
        label="First name"
        value={address.firstName}
        onChange={(value) => update("firstName", value)}
        error={errors["address.firstName"]}
        inputRef={inputRef}
      />
      <Field
        label="Last name"
        value={address.lastName}
        onChange={(value) => update("lastName", value)}
        error={errors["address.lastName"]}
      />
      <Field
        label="Address line 1"
        value={address.address1}
        onChange={(value) => update("address1", value)}
        error={errors["address.address1"]}
      />
      <Field
        label="Address line 2"
        value={address.address2}
        onChange={(value) => update("address2", value)}
      />
      <Field
        label="Landmark"
        value={address.landmark}
        onChange={(value) => update("landmark", value)}
      />
      <Field
        label="PIN code"
        value={address.pin}
        onChange={(value) =>
          update("pin", value.replace(/\D/g, "").slice(0, 6))
        }
        error={errors["address.pin"]}
        inputMode="numeric"
      />
      <Field
        label="City"
        value={address.city}
        onChange={(value) => update("city", value)}
        error={errors["address.city"]}
      />
      <label className="field">
        State <span>*</span>
        <select
          value={address.state}
          onChange={(event) => update("state", event.target.value)}
        >
          <option value="">Select state</option>
          {states.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
        {errors["address.state"] && (
          <small className="field-error">{errors["address.state"]}</small>
        )}
      </label>
      <Field
        label="Country"
        value={address.country}
        onChange={(value) => update("country", value)}
      />
      <Field
        label="Mobile number"
        value={address.mobile}
        onChange={(value) =>
          update("mobile", value.replace(/\D/g, "").slice(0, 10))
        }
        error={errors["address.mobile"]}
        inputMode="numeric"
      />
    </div>
  );
}
function Method({ checked, onChange, title, text, price, disabled = false }) {
  return (
    <label className={`method-row${disabled ? " is-disabled" : ""}`}>
      <input type="radio" checked={checked} onChange={onChange} disabled={disabled} />
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <b>{price}</b>
    </label>
  );
}
function Summary({
  subtotal,
  productDiscount,
  couponDiscount,
  shipping,
  giftApplied,
  total,
  coupon,
  gift,
}) {
  return (
    <aside className="checkout-summary">
      <p className="eyebrow">Order summary</p>
      <div>
        <span>Subtotal</span>
        <b>{money(subtotal)}</b>
      </div>
      <div>
        <span>Product discount</span>
        <b className="saving">−{money(productDiscount)}</b>
      </div>
      {coupon && (
        <div>
          <span>Coupon · {coupon.code}</span>
          <b className="saving">−{money(couponDiscount)}</b>
        </div>
      )}
      <div>
        <span>Shipping</span>
        <b>{shipping ? money(shipping) : "Free"}</b>
      </div>
      {gift && (
        <div>
          <span>Gift card</span>
          <b className="saving">−{money(giftApplied)}</b>
        </div>
      )}
      <hr />
      <div className="checkout-total">
        <span>Total</span>
        <b>{money(total)}</b>
      </div>
      <p className="secure-copy">
        Secure checkout
        <br />
        Payment information will be handled by the configured payment provider
        in production.
      </p>
    </aside>
  );
}
function EmptyCheckout() {
  return (
    <section className="checkout-guard container">
      <p className="eyebrow">Your bag is empty</p>
      <h1>Add something to your cart first.</h1>
      <Link className="button" to="/shop">
        Explore products
      </Link>
      <Link className="empty-secondary" to="/cart">
        Return to bag
      </Link>
    </section>
  );
}

export function OrderSuccess() {
  const businessName = getBusinessName(useStoreSettings());
  const order = readSession("natural-beauty-order", null);
  if (!order)
    return (
      <section className="checkout-guard container">
        <p className="eyebrow">{businessName}</p>
        <h1>No recent order found.</h1>
        <Link className="button" to="/shop">
          Return to shop
        </Link>
      </section>
    );
  return (
    <main className="order-page container">
      <p className="eyebrow">Order confirmed</p>
      <h1>Your order is on its way.</h1>
      <p>
        Thank you for choosing {businessName}. We've received your order and
        will keep you updated as it moves along.
      </p>
      <div className="order-meta">
        <span>
          Order number<strong>{order.orderNumber}</strong>
        </span>
        <span>
          Order total<strong>{money(order.total)}</strong>
        </span>
        <span>
          Payment
          <strong>
            {order.paymentMethod === "online"
              ? "Online payment"
              : "Cash on delivery"}
          </strong>
        </span>
        <span>
          Status<strong>{order.paymentStatus}</strong>
        </span>
      </div>
      <div className="order-timeline">
        <span className="active">
          <Check size={14} /> Order confirmed
        </span>
        <span>Preparing your order</span>
        <span>Shipped</span>
        <span>Delivered</span>
      </div>
      <section className="delivery-card">
        <p className="eyebrow">Delivering to</p>
        <strong>
          {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
        </strong>
        <span>
          {order.deliveryAddress.address1}, {order.deliveryAddress.city},{" "}
          {order.deliveryAddress.state} {order.deliveryAddress.pin}, India
        </span>
      </section>
      <section className="success-items">
        {order.items.map((item) => (
          <div key={item.sku}>
            <img src={item.image} alt="" />
            <span>
              <strong>{item.name}</strong>
              {Object.values(item.attributes).filter(Boolean).join(" · ")} · Qty{" "}
              {item.quantity}
            </span>
            <b>{money(item.price * item.quantity)}</b>
          </div>
        ))}
      </section>
      <Link className="button" to="/shop">
        Continue shopping <ArrowRight size={15} />
      </Link>
    </main>
  );
}
export function OrderFailed() {
  return (
    <section className="checkout-guard order-failed container">
      <p className="eyebrow">Payment not completed</p>
      <h1>Payment wasn't completed.</h1>
      <p>Your order hasn't been placed and your bag is still saved.</p>
      <Link className="button" to="/checkout">
        Try again
      </Link>
      <Link className="empty-secondary" to="/cart">
        Return to bag
      </Link>
    </section>
  );
}
