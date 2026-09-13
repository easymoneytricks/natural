import React, { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Database,
  LoaderCircle,
  RefreshCw,
  Server,
  Users,
} from "lucide-react";
import { useAuth } from "./main";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const dateLabel = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export function SystemPage() {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch("/admin/system/overview");
      setData(response.data);
    } catch (caught) {
      setError(caught.message || "Unable to load system overview.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="system-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">OPERATIONS / SYSTEM</span>
          <h1>System</h1>
          <p>Monitor the store workspace and its operational services.</p>
        </div>
        <button className="button-secondary" onClick={load}>
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="catalog-state">
          <LoaderCircle className="spin" size={24} />
          <p>Checking system status…</p>
        </div>
      ) : (
        data && (
          <>
            <div className="system-status-banner">
              <div>
                <CheckCircle2 size={24} />
                <div>
                  <strong>All systems operational</strong>
                  <small>
                    Last checked{" "}
                    {new Date(data.database.serverTime).toLocaleString("en-IN")}
                  </small>
                </div>
              </div>
              <span className="status-pill status-active">{data.status}</span>
            </div>
            <div className="system-grid">
              <div className="system-card">
                <Database size={19} />
                <span>Database</span>
                <strong>
                  {data.database.connected ? "Connected" : "Unavailable"}
                </strong>
                <small>MariaDB {data.database.version}</small>
              </div>
              <div className="system-card">
                <Server size={19} />
                <span>Runtime</span>
                <strong>{data.runtime.node}</strong>
                <small>{data.runtime.environment} environment</small>
              </div>
              <div className="system-card">
                <Users size={19} />
                <span>Admin users</span>
                <strong>
                  {data.adminUsers.active} active / {data.adminUsers.total}
                </strong>
                <small>{data.activeSessions} active sessions</small>
              </div>
              <div className="system-card">
                <Activity size={19} />
                <span>Audit activity</span>
                <strong>{data.auditEventsLast24Hours} events</strong>
                <small>Recorded in the last 24 hours</small>
              </div>
            </div>
            <div className="card system-checklist">
              <div>
                <span className="section-kicker">SERVICE CHECKLIST</span>
                <h2>Workspace readiness</h2>
              </div>
              {[
                ["Database connection", data.database.connected],
                ["Admin authentication", data.adminUsers.active > 0],
                ["Audit trail", data.auditEventsLast24Hours >= 0],
                ["Session management", data.activeSessions >= 0],
              ].map(([label, okay]) => (
                <div key={label}>
                  <CheckCircle2 size={17} />
                  <span>{label}</span>
                  <b>{okay ? "Healthy" : "Review"}</b>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}

export function ReportsPage() {
  const { authFetch } = useAuth();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch(`/admin/reports/summary?days=${days}`);
      setData(response.data);
    } catch (caught) {
      setError(caught.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [days]);
  const maxRevenue = Math.max(
    ...(data?.daily || []).map((row) => row.revenue),
    1,
  );
  return (
    <div className="reports-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">INSIGHTS / REPORTS</span>
          <h1>Reports</h1>
          <p>A clear view of sales performance and customer momentum.</p>
        </div>
        <div className="reports-period">
          <select
            value={days}
            onChange={(event) => setDays(event.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="button-secondary" onClick={load}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="catalog-state">
          <LoaderCircle className="spin" size={24} />
          <p>Preparing report…</p>
        </div>
      ) : (
        data && (
          <>
            <div className="report-summary">
              <div>
                <span>Orders</span>
                <b>{data.totals.orders}</b>
                <small>Last {data.days} days</small>
              </div>
              <div>
                <span>Gross revenue</span>
                <b>{money(data.totals.grossRevenue)}</b>
                <small>Before cancellations</small>
              </div>
              <div>
                <span>Paid revenue</span>
                <b>{money(data.totals.paidRevenue)}</b>
                <small>Captured payments</small>
              </div>
              <div>
                <span>New customers</span>
                <b>{data.totals.newCustomers}</b>
                <small>Joined in period</small>
              </div>
            </div>
            <div className="report-columns">
              <section className="card report-chart">
                <div className="report-section-heading">
                  <div>
                    <span className="section-kicker">SALES TREND</span>
                    <h2>Revenue by day</h2>
                  </div>
                  <BarChart3 size={20} />
                </div>
                {data.daily.length ? (
                  <div className="bar-chart" aria-label="Revenue by day">
                    {data.daily.map((row) => (
                      <div className="bar-column" key={String(row.date)}>
                        <div
                          className="bar-value"
                          style={{
                            height: `${Math.max((row.revenue / maxRevenue) * 100, 3)}%`,
                          }}
                          title={`${dateLabel(row.date)}: ${money(row.revenue)}`}
                        />
                        <small>{dateLabel(row.date)}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No sales recorded for this period.</p>
                )}
              </section>
              <section className="card report-status">
                <div className="report-section-heading">
                  <div>
                    <span className="section-kicker">ORDER MIX</span>
                    <h2>Fulfillment status</h2>
                  </div>
                </div>
                {data.statuses.map((row) => (
                  <div className="status-row" key={row.status}>
                    <span>{row.status}</span>
                    <b>{row.count}</b>
                    <div>
                      <i
                        style={{
                          width: `${data.totals.orders ? (row.count / data.totals.orders) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </>
        )
      )}
    </div>
  );
}
