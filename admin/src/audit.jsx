import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Eye,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "—";

function AuditDetail({ entry, onClose }) {
  return (
    <div
      className="audit-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="audit-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="audit-modal-header">
          <div>
            <span className="section-kicker">AUDIT / EVENT DETAIL</span>
            <h2>{entry.action}</h2>
            <p>
              {formatDate(entry.createdAt)} ·{" "}
              {entry.entityType || "System event"}
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close audit detail"
          >
            <X size={18} />
          </button>
        </header>
        <dl className="audit-detail-list">
          <div>
            <dt>Actor</dt>
            <dd>
              {entry.actor
                ? `${entry.actor.name} · ${entry.actor.email}`
                : "System"}
            </dd>
          </div>
          <div>
            <dt>Entity</dt>
            <dd>
              {entry.entityType || "—"}{" "}
              {entry.entityId ? `#${entry.entityId}` : ""}
            </dd>
          </div>
          <div>
            <dt>IP address</dt>
            <dd>{entry.ipAddress || "Not recorded"}</dd>
          </div>
          <div>
            <dt>User agent</dt>
            <dd>{entry.userAgent || "Not recorded"}</dd>
          </div>
        </dl>
        <div className="audit-metadata">
          <h3>Event metadata</h3>
          <pre>
            {entry.metadata
              ? JSON.stringify(entry.metadata, null, 2)
              : "No metadata recorded."}
          </pre>
        </div>
      </section>
    </div>
  );
}

export function AuditPage() {
  const { authFetch } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({ actions: [], entities: [] });
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q: query, action, entity });
      const [logResponse, filterResponse] = await Promise.all([
        authFetch(`/admin/audit-logs?${params}`),
        authFetch("/admin/audit-logs/filters"),
      ]);
      setEntries(Array.isArray(logResponse.data) ? logResponse.data : []);
      setFilters(filterResponse.data || { actions: [], entities: [] });
    } catch (caught) {
      setError(caught.message || "Unable to load audit log.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query, action, entity]);
  const actorCount = useMemo(
    () =>
      new Set(entries.map((entry) => entry.actor?.email).filter(Boolean)).size,
    [entries],
  );
  return (
    <div className="audit-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">SECURITY / AUDIT TRAIL</span>
          <h1>Audit log</h1>
          <p>
            Trace staff activity across catalog, orders, customers and settings.
          </p>
        </div>
        <button className="button-secondary" onClick={load}>
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      <div className="audit-summary">
        <div>
          <span>Events shown</span>
          <b>{entries.length}</b>
        </div>
        <div>
          <span>Active actors</span>
          <b>{actorCount}</b>
        </div>
        <div>
          <span>Event types</span>
          <b>{new Set(entries.map((entry) => entry.action)).size}</b>
        </div>
      </div>
      <div className="audit-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search action, entity, ID or email"
          />
        </div>
        <select
          value={action}
          onChange={(event) => setAction(event.target.value)}
        >
          <option value="">All actions</option>
          {filters.actions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={entity}
          onChange={(event) => setEntity(event.target.value)}
        >
          <option value="">All entities</option>
          {filters.entities.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="card table-wrap audit-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading audit events…</p>
          </div>
        ) : !entries.length ? (
          <div className="catalog-state">
            <ClipboardList size={28} />
            <h2>No audit events found</h2>
            <p>Activity will appear here as staff make changes.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>When</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.action}</strong>
                    <small>
                      {entry.metadata ? "Metadata attached" : "No metadata"}
                    </small>
                  </td>
                  <td>
                    {entry.actor ? (
                      <>
                        <strong>{entry.actor.name}</strong>
                        <small>{entry.actor.email}</small>
                      </>
                    ) : (
                      "System"
                    )}
                  </td>
                  <td>
                    {entry.entityType || "—"}
                    {entry.entityId && <small>#{entry.entityId}</small>}
                  </td>
                  <td>{formatDate(entry.createdAt)}</td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setSelected(entry)}
                      aria-label={`View ${entry.action}`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected && (
        <AuditDetail entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
