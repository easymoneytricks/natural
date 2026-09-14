import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Eye,
  Gift,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const emptyCoupon = {
  code: "",
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumCartAmount: 0,
  maximumDiscountAmount: "",
  startsAt: "",
  expiresAt: "",
  usageLimitTotal: "",
  usageLimitPerCustomer: "",
  firstOrderOnly: false,
  isActive: true,
};

function CouponEditor({ editing, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(
    editing
      ? {
          ...emptyCoupon,
          code: editing.code || "",
          name: editing.name || "",
          description: editing.description || "",
          discountType: editing.discount_type,
          discountValue: editing.discount_value,
          minimumCartAmount: editing.minimum_cart_amount,
          maximumDiscountAmount: editing.maximum_discount_amount ?? "",
          startsAt: editing.starts_at
            ? String(editing.starts_at).slice(0, 16)
            : "",
          expiresAt: editing.expires_at
            ? String(editing.expires_at).slice(0, 16)
            : "",
          usageLimitTotal: editing.usage_limit_total || "",
          usageLimitPerCustomer: editing.usage_limit_per_customer || "",
          firstOrderOnly: !!editing.first_order_only,
          isActive: !!editing.is_active,
        }
      : emptyCoupon,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(
        editing
          ? `/admin/promotions/coupons/${editing.id}`
          : "/admin/promotions/coupons",
        {
          method: editing ? "PATCH" : "POST",
          body: { ...form, code: form.code.toUpperCase().replace(/\s+/g, "") },
        },
      );
      onSaved();
    } catch (caught) {
      setError(caught.message || "Unable to save coupon.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="promotion-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="promotion-modal"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="section-kicker">PROMOTIONS / COUPONS</span>
            <h2>{editing ? "Edit coupon" : "Create coupon"}</h2>
            <p>Create a clear offer with rules your customers can trust.</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close coupon editor"
          >
            <X size={18} />
          </button>
        </div>
        <div className="editor-grid">
          <label>
            Coupon code <b>*</b>
            <input
              required
              value={form.code}
              disabled={!!editing}
              onChange={(event) => update("code", event.target.value)}
              placeholder="WELCOME10"
            />
          </label>
          <label>
            Internal name
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Welcome offer"
            />
          </label>
          <label>
            Discount type
            <select
              value={form.discountType}
              onChange={(event) => update("discountType", event.target.value)}
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
          </label>
          <label>
            Discount value <b>*</b>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.discountValue}
              onChange={(event) => update("discountValue", event.target.value)}
            />
          </label>
          <label>
            Minimum cart amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minimumCartAmount}
              onChange={(event) =>
                update("minimumCartAmount", event.target.value)
              }
            />
          </label>
          <label>
            Maximum discount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.maximumDiscountAmount}
              onChange={(event) =>
                update("maximumDiscountAmount", event.target.value)
              }
              placeholder="No cap"
            />
          </label>
          <label>
            Starts at
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => update("startsAt", event.target.value)}
            />
          </label>
          <label>
            Expires at
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => update("expiresAt", event.target.value)}
            />
          </label>
          <label>
            Usage limit
            <input
              type="number"
              min="1"
              value={form.usageLimitTotal}
              onChange={(event) =>
                update("usageLimitTotal", event.target.value)
              }
              placeholder="Unlimited"
            />
          </label>
          <label>
            Per-customer limit
            <input
              type="number"
              min="1"
              value={form.usageLimitPerCustomer}
              onChange={(event) =>
                update("usageLimitPerCustomer", event.target.value)
              }
              placeholder="Unlimited"
            />
          </label>
          <label className="field-wide">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Shown to your team, not customers."
            />
          </label>
        </div>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={form.firstOrderOnly}
            onChange={(event) => update("firstOrderOnly", event.target.checked)}
          />
          <span>
            <b>First order only</b>
            <small>
              Restrict this coupon to customers placing their first order.
            </small>
          </span>
        </label>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update("isActive", event.target.checked)}
          />
          <span>
            <b>Active at checkout</b>
            <small>
              Turn this off any time without deleting redemption history.
            </small>
          </span>
        </label>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving && <LoaderCircle className="spin" size={16} />}
            {saving ? "Saving…" : editing ? "Save changes" : "Create coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}

function GiftCardEditor({ onClose, onCreated }) {
  const { authFetch } = useAuth();
  const [amount, setAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await authFetch("/admin/promotions/gift-cards", {
        method: "POST",
        body: { amount: Number(amount), expiresAt: expiresAt || null },
      });
      onCreated(response.data);
    } catch (caught) {
      setError(caught.message || "Unable to generate gift card.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="promotion-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="promotion-modal gift-editor"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="section-kicker">PROMOTIONS / GIFT CARDS</span>
            <h2>Issue a gift card</h2>
            <p>Generate a secure gift card code for customer purchases.</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close gift card editor"
          >
            <X size={18} />
          </button>
        </div>
        <label>
          Gift card value <b>*</b>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1000"
          />
        </label>
        <label>
          Expiry date
          <input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </label>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving && <LoaderCircle className="spin" size={16} />}Generate card
          </button>
        </div>
      </form>
    </div>
  );
}

function GiftCardDetail({ card, onClose }) {
  const { authFetch } = useAuth();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch(`/admin/promotions/gift-cards/${card.id}`)
      .then((response) => setDetail(response.data))
      .catch((caught) =>
        setError(caught.message || "Unable to load card history."),
      );
  }, [card.id]);

  return (
    <div
      className="promotion-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="promotion-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="section-kicker">PROMOTIONS / GIFT CARDS</span>
            <h2>Gift card details</h2>
            <p>
              Review the balance and immutable transaction history for this
              card.
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close gift card details"
          >
            <X size={18} />
          </button>
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {!detail && !error ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={22} />
            <p>Loading card history…</p>
          </div>
        ) : detail ? (
          <>
            <div className="gift-detail-summary">
              <div>
                <span>Card</span>
                <b>•••• {detail.code_last4}</b>
              </div>
              <div>
                <span>Balance</span>
                <b>₹{Number(detail.currentBalance).toLocaleString("en-IN")}</b>
              </div>
              <div>
                <span>Status</span>
                <b>{detail.status}</b>
              </div>
            </div>
            <div className="gift-detail-history">
              <h3>Transaction history</h3>
              {detail.transactions?.length ? (
                detail.transactions.map((transaction, index) => (
                  <div
                    className="gift-transaction"
                    key={`${transaction.created_at}-${index}`}
                  >
                    <span>{transaction.transaction_type}</span>
                    <b>₹{Number(transaction.amount).toLocaleString("en-IN")}</b>
                    <small>
                      {new Date(transaction.created_at).toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className="muted">No transactions recorded.</p>
              )}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

export function PromotionsPage() {
  const { authFetch } = useAuth();
  const [coupons, setCoupons] = useState([]),
    [cards, setCards] = useState([]),
    [tab, setTab] = useState("coupons"),
    [query, setQuery] = useState(""),
    [editing, setEditing] = useState(null),
    [giftEditor, setGiftEditor] = useState(false),
    [giftDetail, setGiftDetail] = useState(null),
    [revealed, setRevealed] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [couponResponse, cardResponse] = await Promise.all([
        authFetch(`/admin/promotions/coupons?q=${encodeURIComponent(query)}`),
        authFetch("/admin/promotions/gift-cards"),
      ]);
      setCoupons(Array.isArray(couponResponse.data) ? couponResponse.data : []);
      setCards(Array.isArray(cardResponse.data) ? cardResponse.data : []);
    } catch (caught) {
      setError(caught.message || "Unable to load promotions.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query]);
  const toggleCard = async (card) => {
    try {
      await authFetch(`/admin/promotions/gift-cards/${card.id}/status`, {
        method: "PATCH",
        body: { status: card.status === "active" ? "disabled" : "active" },
      });
      setNotice("Gift card status updated.");
      load();
    } catch (caught) {
      setError(caught.message || "Unable to update gift card.");
    }
  };
  return (
    <div className="promotions-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">REVENUE / PROMOTIONS</span>
          <h1>Promotions</h1>
          <p>
            Design thoughtful offers and manage stored-value gift cards safely.
          </p>
        </div>
        <button
          onClick={() =>
            tab === "coupons" ? setEditing({}) : setGiftEditor(true)
          }
        >
          <Plus size={17} />{" "}
          {tab === "coupons" ? "Create coupon" : "Issue gift card"}
        </button>
      </div>
      <div className="promotion-summary">
        <div>
          <span>Active coupons</span>
          <b>{coupons.filter((coupon) => coupon.is_active).length}</b>
        </div>
        <div>
          <span>Gift cards issued</span>
          <b>{cards.length}</b>
        </div>
        <div>
          <span>Gift balance outstanding</span>
          <b>
            ₹
            {cards
              .reduce((sum, card) => sum + Number(card.currentBalance || 0), 0)
              .toLocaleString("en-IN")}
          </b>
        </div>
      </div>
      <div className="promotion-toolbar">
        <div className="promotion-tabs">
          <button
            className={tab === "coupons" ? "is-active" : ""}
            onClick={() => setTab("coupons")}
          >
            {" "}
            <CreditCard size={16} /> Coupons
          </button>
          <button
            className={tab === "cards" ? "is-active" : ""}
            onClick={() => setTab("cards")}
          >
            <Gift size={16} /> Gift cards
          </button>
        </div>
        {tab === "coupons" && (
          <div className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search coupon code or name"
            />
          </div>
        )}
      </div>
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="card table-wrap promotion-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading promotions…</p>
          </div>
        ) : tab === "coupons" ? (
          <table>
            <thead>
              <tr>
                <th>Offer</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Window</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!coupons.length && (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No coupons found.
                  </td>
                </tr>
              )}
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <b>{coupon.code}</b>
                    <small>{coupon.name || "No internal name"}</small>
                  </td>
                  <td>
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `₹${coupon.discount_value}`}
                  </td>
                  <td>
                    {coupon.usage_count}
                    {coupon.usage_limit_total
                      ? ` / ${coupon.usage_limit_total}`
                      : " / unlimited"}
                  </td>
                  <td>
                    {coupon.expires_at
                      ? `Until ${new Date(coupon.expires_at).toLocaleDateString()}`
                      : "No expiry"}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${coupon.is_active ? "status-active" : "status-disabled"}`}
                    >
                      {coupon.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setEditing(coupon)}
                      aria-label={`Edit ${coupon.code}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Card</th>
                <th>Balance</th>
                <th>Issued</th>
                <th>Expiry</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!cards.length && (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No gift cards issued yet.
                  </td>
                </tr>
              )}
              {cards.map((card) => (
                <tr key={card.id}>
                  <td>
                    <b>•••• {card.code_last4}</b>
                    <small>Secure code hidden after issue</small>
                  </td>
                  <td>
                    <b>
                      ₹{Number(card.currentBalance).toLocaleString("en-IN")}
                    </b>
                    <small>
                      of ₹{Number(card.initialValue).toLocaleString("en-IN")}
                    </small>
                  </td>
                  <td>{new Date(card.created_at).toLocaleDateString()}</td>
                  <td>
                    {card.expires_at
                      ? new Date(card.expires_at).toLocaleDateString()
                      : "No expiry"}
                  </td>
                  <td>
                    <span className={`status-pill status-${card.status}`}>
                      {card.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setGiftDetail(card)}
                      aria-label={`View gift card ending ${card.code_last4}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="button-secondary compact-button"
                      onClick={() => toggleCard(card)}
                    >
                      {card.status === "active" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {revealed && (
        <div className="reveal-code">
          <b>New gift card created</b>
          <code>{revealed.code}</code>
          <p>Copy this code now. It is never shown again.</p>
          <button onClick={() => setRevealed(null)}>Done</button>
        </div>
      )}
      {editing && (
        <CouponEditor
          editing={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setNotice("Coupon saved successfully.");
            load();
          }}
        />
      )}
      {giftEditor && (
        <GiftCardEditor
          onClose={() => setGiftEditor(false)}
          onCreated={(card) => {
            setGiftEditor(false);
            setRevealed(card);
            setNotice("Gift card issued successfully.");
            load();
          }}
        />
      )}
      {giftDetail && (
        <GiftCardDetail card={giftDetail} onClose={() => setGiftDetail(null)} />
      )}
    </div>
  );
}
