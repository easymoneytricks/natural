import { useEffect, useState } from "react";
import { RefreshCw, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "./main";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export function AbandonedCheckoutsPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    authFetch(
      `/admin/abandoned-checkouts?q=${encodeURIComponent(query)}&status=${status}`,
    )
      .then((response) => setRows(response.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [query, status]);
  const open = (id) =>
    authFetch(`/admin/abandoned-checkouts/${id}`).then((response) =>
      setSelected(response.data),
    );
  return (
    <div>
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">RECOVERY WORKSPACE</span>
          <h1>Abandoned checkouts</h1>
          <p>See what shoppers left behind before placing an order.</p>
        </div>
        <button className="button-secondary" onClick={load} type="button">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="card abandoned-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search email, phone or product"
          aria-label="Search abandoned checkouts"
        />
        <span className="muted">
          {rows.length} {status} checkout{rows.length === 1 ? "" : "s"}
        </span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Checkout status"
        >
          <option value="active">Active</option>
          <option value="converted">Converted</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      {loading ? (
        <p className="muted">Loading checkout activity…</p>
      ) : !rows.length ? (
        <div className="card empty-state">
          <ShoppingBag size={28} />
          <h2>No abandoned checkouts</h2>
          <p>
            New checkout sessions appear here after a shopper enters the
            checkout.
          </p>
        </div>
      ) : (
        <div className="card abandoned-table">
          <div className="abandoned-table-head">
            <span>SHOPPER</span>
            <span>ITEMS</span>
            <span>ESTIMATED TOTAL</span>
            <span>LAST ACTIVE</span>
          </div>
          {rows.map((row) => (
            <button
              className="abandoned-row"
              key={row.id}
              onClick={() => open(row.id)}
              type="button"
            >
              <span>
                <strong>
                  {row.first_name || row.last_name
                    ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
                    : row.email || "Guest shopper"}
                </strong>
                <small>{row.email || row.phone || "Contact not entered"}</small>
              </span>
              <span>{row.items}</span>
              <span>{money(row.estimatedTotal)}</span>
              <span>
                {new Date(row.last_seen_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <section
            className="modal-card abandoned-detail"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              type="button"
              aria-label="Close"
            >
              ×
            </button>
            <span className="section-kicker">CHECKOUT DETAILS</span>
            <h2>{selected.email || "Guest checkout"}</h2>
            <p className="muted">
              {selected.phone || "No phone provided"} · Last active{" "}
              {new Date(selected.last_seen_at).toLocaleString("en-IN")}
            </p>
            <h3>Items left in bag</h3>
            {selected.cart.map((item) => (
              <div
                className="abandoned-item"
                key={`${item.skuId}-${item.name}`}
              >
                <span>
                  {item.name}
                  <small>Qty {item.quantity}</small>
                </span>
                <strong>{money(item.price * item.quantity)}</strong>
              </div>
            ))}
            <div className="abandoned-total">
              <span>Estimated total</span>
              <strong>{money(selected.estimatedTotal)}</strong>
            </div>
            {selected.checkout?.address?.city && (
              <p className="muted">
                <UserRound size={15} /> Delivery area:{" "}
                {selected.checkout.address.city},{" "}
                {selected.checkout.address.state}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
