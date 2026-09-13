import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const statuses = ["new", "in_progress", "resolved", "spam"];
const dateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "—";

function SubmissionDetail({ submission, onClose, onUpdated }) {
  const { authFetch } = useAuth();
  const [status, setStatus] = useState(submission.status);
  const [adminNote, setAdminNote] = useState(submission.adminNote || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(`/admin/contact-submissions/${submission.id}`, {
        method: "PATCH",
        body: { status, adminNote },
      });
      onUpdated();
    } catch (caught) {
      setError(caught.message || "Unable to update submission.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="contact-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="contact-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="contact-modal-header">
          <div>
            <span className="section-kicker">CONTACT / MESSAGE</span>
            <h2>{submission.name}</h2>
            <p>{dateTime(submission.createdAt)}</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close contact message"
          >
            <X size={18} />
          </button>
        </header>
        <div className="contact-message-meta">
          <a href={`mailto:${submission.email}`}>
            <Mail size={16} /> {submission.email}
          </a>
          {submission.orderNumber && (
            <span>
              <MessageSquare size={16} /> Order {submission.orderNumber}
            </span>
          )}
        </div>
        <div className="contact-message-body">
          <h3>Customer message</h3>
          <p>{submission.message}</p>
        </div>
        <form className="contact-status-form" onSubmit={save}>
          <label>
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Internal note
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder="Add a private note for your team"
            />
          </label>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <button disabled={saving}>
            {saving && <LoaderCircle className="spin" size={15} />} Save message
          </button>
        </form>
      </section>
    </div>
  );
}

export function ContactSubmissionsPage() {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch(
        `/admin/contact-submissions?q=${encodeURIComponent(query)}&status=${status}`,
      );
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (caught) {
      setError(caught.message || "Unable to load contact submissions.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query, status]);
  const counts = useMemo(
    () =>
      statuses.reduce(
        (result, value) => ({
          ...result,
          [value]: rows.filter((row) => row.status === value).length,
        }),
        {},
      ),
    [rows],
  );
  const updateDone = () => {
    setSelected(null);
    load();
  };
  return (
    <div className="contact-admin-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CUSTOMER CARE / INBOX</span>
          <h1>Contact</h1>
          <p>
            Respond to customer questions, order requests and product guidance.
          </p>
        </div>
        <button className="button-secondary" onClick={load}>
          <LoaderCircle size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      <div className="contact-summary">
        <div>
          <span>New messages</span>
          <b>{counts.new || 0}</b>
        </div>
        <div>
          <span>In progress</span>
          <b>{counts.in_progress || 0}</b>
        </div>
        <div>
          <span>Resolved</span>
          <b>{counts.resolved || 0}</b>
        </div>
        <div>
          <span>Total shown</span>
          <b>{rows.length}</b>
        </div>
      </div>
      <div className="contact-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, order or message"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="card table-wrap contact-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading customer messages…</p>
          </div>
        ) : !rows.length ? (
          <div className="catalog-state">
            <MapPin size={28} />
            <h2>No messages found</h2>
            <p>Contact form submissions will appear here.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Message</th>
                <th>Order</th>
                <th>Status</th>
                <th>Received</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <small>{row.email}</small>
                  </td>
                  <td className="message-preview">{row.message}</td>
                  <td>{row.orderNumber || "—"}</td>
                  <td>
                    <span className={`status-pill status-${row.status}`}>
                      {row.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>{dateTime(row.createdAt)}</td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setSelected(row)}
                      aria-label={`View message from ${row.name}`}
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
        <SubmissionDetail
          submission={selected}
          onClose={() => setSelected(null)}
          onUpdated={updateDone}
        />
      )}
    </div>
  );
}
