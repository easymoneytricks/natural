import React, { createContext, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LayoutDashboard, LogOut, Package } from "lucide-react";
import { BrandsPage, CategoriesPage, ProductsPage } from "./catalog";
import { CustomersPage } from "./customer";
import { PromotionsPage } from "./promotions";
import "./styles.css";
const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");
const C = createContext(null);
const request = async (path, opt = {}) => {
  const h = { Accept: "application/json", ...(opt.headers || {}) };
  if (!(opt.body instanceof FormData)) h["Content-Type"] = "application/json";
  const r = await fetch(API + path, {
    ...opt,
    credentials: "include",
    headers: h,
    ...(opt.body && !(opt.body instanceof FormData)
      ? { body: JSON.stringify(opt.body) }
      : {}),
  });
  let p = {};
  try {
    p = await r.json();
  } catch {}
  if (!r.ok)
    throw { status: r.status, code: p.error?.code, message: p.error?.message };
  return p;
};
function Provider({ children }) {
  const [admin, setAdmin] = useState(null),
    [token, setToken] = useState(null),
    [status, setStatus] = useState("checking");
  const apply = (r) => {
    setToken(r.data.accessToken);
    setAdmin(r.data.admin);
    setStatus("authenticated");
    return r.data;
  };
  useEffect(() => {
    request("/admin/auth/refresh", { method: "POST" })
      .then(apply)
      .catch(() => setStatus("unauthenticated"));
  }, []);
  const login = (email, password) =>
      request("/admin/auth/login", {
        method: "POST",
        body: { email, password },
      }).then(apply),
    logout = () =>
      request("/admin/auth/logout", { method: "POST" }).finally(() => {
        setAdmin(null);
        setToken(null);
        setStatus("unauthenticated");
      }),
    authFetch = (path, opt = {}) =>
      request(path, {
        ...opt,
        headers: { ...(opt.headers || {}), Authorization: `Bearer ${token}` },
      });
  return (
    <C.Provider value={{ admin, status, login, logout, authFetch }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
function Login() {
  const { status, login } = useAuth(),
    nav = useNavigate(),
    [f, setF] = useState({ email: "", password: "" }),
    [e, setE] = useState("");
  if (status === "authenticated") {
    nav("/dashboard", { replace: true });
    return null;
  }
  return (
    <main className="login">
      <form
        className="card"
        onSubmit={(x) => {
          x.preventDefault();
          login(f.email, f.password)
            .then(() => nav("/dashboard"))
            .catch(() => setE("Invalid email or password."));
        }}
      >
        <h1>Natural Beauty Admin</h1>
        <label>
          Email
          <input
            type="email"
            required
            value={f.email}
            onChange={(x) => setF({ ...f, email: x.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={f.password}
            onChange={(x) => setF({ ...f, password: x.target.value })}
          />
        </label>
        {e && <div className="error">{e}</div>}
        <button>Sign in</button>
      </form>
    </main>
  );
}
const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard, "dashboard.view"],
  ["Products", "/catalog/products", Package, "catalog.view"],
  ["Brands", "/catalog/brands", Package, "catalog.view"],
  ["Categories", "/catalog/categories", Package, "catalog.view"],
  ["Customers", "/customers", Package, "customers.view"],
  ["Promotions", "/promotions", Package, "promotions.view"],
];
function Shell({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          Natural Beauty<small>Admin Panel</small>
        </div>
        <nav>
          {nav
            .filter((n) => admin?.effectivePermissions?.includes(n[3]))
            .map(([l, t, I]) => (
              <Link to={t} key={t} aria-current={location.pathname === t ? "true" : undefined}>
                <I size={17} />
                {l}
              </Link>
            ))}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
      <main className="main">
        <header>
          Admin workspace{" "}
          <strong>
            {admin?.firstName} {admin?.lastName}
          </strong>
        </header>
        {children}
      </main>
    </div>
  );
}
function Protected({ children, permission = "catalog.view" }) {
  const { status, admin } = useAuth();
  if (status === "checking")
    return <div className="loading">Checking session…</div>;
  if (status !== "authenticated") return <Login />;
  if (permission && !admin.effectivePermissions.includes(permission))
    return (
      <Shell>
        <div className="card">Access denied</div>
      </Shell>
    );
  return <Shell>{children}</Shell>;
}
function Dashboard() {
  return (
    <Protected permission="dashboard.view">
      <h1>Dashboard</h1>
      <div className="card">Welcome to your workspace.</div>
    </Protected>
  );
}
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/catalog/products"
        element={
          <Protected>
            <ProductsPage />
          </Protected>
        }
      />
      <Route
        path="/catalog/brands"
        element={
          <Protected>
            <BrandsPage />
          </Protected>
        }
      />
      <Route
        path="/catalog/categories"
        element={
          <Protected>
            <CategoriesPage />
          </Protected>
        }
      />
      <Route path="/customers" element={<Protected permission="customers.view"><CustomersPage /></Protected>} />
      <Route path="/promotions" element={<Protected permission="promotions.view"><PromotionsPage /></Protected>} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
