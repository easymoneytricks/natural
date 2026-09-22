import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { createCashfreeOrder, createRazorpayOrder, verifyRazorpay } from "../services/paymentApi";
import { getBusinessName, useStoreSettings } from "../context/StoreSettingsContext";
import "./GiftCards.css";

const money = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

export function GiftCards() {
  const businessName = getBusinessName(useStoreSettings());
  const { user, isAuthenticated, authFetch } = useAuth();
  const navigate = useNavigate();
  const [amounts, setAmounts] = useState([]);
  const [amount, setAmount] = useState(500);
  const [mode, setMode] = useState("self");
  const [form, setForm] = useState({ buyerEmail: user?.email || "", recipientEmail: "", recipientName: "", message: "" });
  const [provider, setProvider] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/gift-cards/denominations").then((r) => { const values = r.data || []; setAmounts(values); setAmount(values[0] || 500); }).catch(() => setError("Gift card values are unavailable right now.")); }, []);
  useEffect(() => { apiRequest("/checkout/payment-methods").then((r) => setProvider(r.data)).catch(() => setProvider(null)); }, []);
  useEffect(() => { if (user?.email) setForm((current) => ({ ...current, buyerEmail: current.buyerEmail || user.email })); }, [user]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const pay = async (event) => {
    event.preventDefault(); setError("");
    if (!provider?.online) return setError("Online payment is not available yet.");
    if (mode === "gift" && !form.recipientEmail) return setError("Enter the recipient email address.");
    setBusy(true);
    try {
      const request = isAuthenticated ? authFetch : apiRequest;
      const created = await request("/gift-cards/purchase", { method: "POST", body: { amount, deliveryMode: mode, ...form } });
      const orderNumber = created.data.orderNumber;
      if (provider.provider === "razorpay") {
        const order = await (isAuthenticated ? createRazorpayOrder({ orderNumber }, authFetch) : createRazorpayOrder({ orderNumber }));
        if (!window.Razorpay) await new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
        await new Promise((resolve, reject) => { const razorpay = new window.Razorpay({ key: order.data.keyId, amount: order.data.amount, currency: order.data.currency, name: businessName, order_id: order.data.orderId, prefill: { email: form.buyerEmail }, handler: async (response) => { try { await verifyRazorpay(response, isAuthenticated ? authFetch : null); resolve(); } catch (e) { reject(e); } }, modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) } }); razorpay.open(); });
        navigate(`/gift-cards/success?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(form.buyerEmail)}`);
      } else {
        const returnPath = `/gift-cards/success?email=${encodeURIComponent(form.buyerEmail)}`;
        const order = await (isAuthenticated ? createCashfreeOrder({ orderNumber, customer: { email: form.buyerEmail }, returnPath }, authFetch) : createCashfreeOrder({ orderNumber, customer: { email: form.buyerEmail }, returnPath }));
        if (!window.Cashfree) await new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"; script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
        await window.Cashfree({ mode: order.data.cashfreeMode || "sandbox" }).checkout({ paymentSessionId: order.data.paymentSessionId, redirectTarget: "_self" });
      }
    } catch (e) { setError(e?.message || "We could not start the payment."); } finally { setBusy(false); }
  };
  return <main className="gift-card-page container"><p className="eyebrow">Give something thoughtful</p><h1>Gift cards for every occasion.</h1><p className="gift-card-intro">Choose a fixed value and send it by email, or keep it for your own account.</p><form className="gift-card-form" onSubmit={pay}><fieldset><legend>Choose a value</legend><div className="gift-card-options">{amounts.map((value) => <button type="button" className={amount === value ? "selected" : ""} key={value} onClick={() => setAmount(value)}>{money(value)}</button>)}</div></fieldset><fieldset><legend>Who is it for?</legend><div className="gift-card-options"><button type="button" className={mode === "self" ? "selected" : ""} onClick={() => setMode("self")}>For myself</button><button type="button" className={mode === "gift" ? "selected" : ""} onClick={() => setMode("gift")}>Send as a gift</button></div></fieldset><label>Your email<input type="email" required value={form.buyerEmail} onChange={(e) => update("buyerEmail", e.target.value)} /></label>{mode === "gift" && <><label>Recipient email<input type="email" required value={form.recipientEmail} onChange={(e) => update("recipientEmail", e.target.value)} /></label><label>Recipient name<input value={form.recipientName} onChange={(e) => update("recipientName", e.target.value)} /></label><label>Message (optional)<textarea rows="3" value={form.message} onChange={(e) => update("message", e.target.value)} /></label></>} {error && <p className="form-error">{error}</p>}<button className="button" disabled={busy || !amounts.length}>{busy ? "Opening secure payment…" : `Pay ${money(amount)}`}</button></form><p className="gift-card-note">Gift cards are delivered after payment is confirmed. <Link to="/shop">Continue shopping</Link></p></main>;
}

export function GiftCardSuccess() {
  const [params] = useSearchParams(); const { isAuthenticated, authFetch } = useAuth(); const [data, setData] = useState(null); const [error, setError] = useState(""); const [redeemed, setRedeemed] = useState(false);
  const order = params.get("order"); const email = params.get("email");
  useEffect(() => { let timer; const load = async () => { try { const result = await apiRequest(`/gift-cards/purchase/${encodeURIComponent(order)}?email=${encodeURIComponent(email || "")}`); setData(result.data); if (!result.data.code && result.data.paymentStatus !== "failed") timer = setTimeout(load, 2500); } catch (e) { setError(e.message); } }; if (order && email) load(); return () => clearTimeout(timer); }, [order, email]);
  const redeem = async () => { try { await authFetch("/customer/gift-cards/claim", { method: "POST", body: { code: data.code } }); setRedeemed(true); } catch (e) { setError(e.message); } };
  return <main className="gift-card-page container gift-card-success"><p className="eyebrow">Payment complete</p><h1>{data?.code ? "Your gift card is ready." : "Preparing your gift card…"}</h1>{error && <p className="form-error">{error}</p>}{data?.code && <><p>Value: <strong>{money(data.amount)}</strong></p><div className="gift-card-code">{data.code}</div>{data.deliveryMode === "gift" ? <p>The gift card was sent to {data.recipientEmail}.</p> : <p>Keep this code safe, or redeem it in your account.</p>}{isAuthenticated && <button className="button" onClick={redeem} disabled={redeemed}>{redeemed ? "Redeemed in your account" : "Redeem in my account"}</button>}</>}</main>;
}
