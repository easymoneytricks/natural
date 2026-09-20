import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Tags,
  Users,
  Layers,
  Warehouse,
  Leaf,
  Images,
  ShoppingBag,
  UserCog,
  ShieldCheck,
  KeyRound,
  ClipboardList,
  MessageSquare,
  Star,
  Settings,
  Settings2,
  BarChart3,
  FileText,
} from "lucide-react";
import { BrandsPage, CategoriesPage, ProductsPage } from "./catalog";
import { CustomerDetailPage, CustomersPage } from "./customer";
import { ReviewsPage } from "./reviews";
import { PromotionsPage } from "./promotions";
import { ProductEditor } from "./productEditor";
import { InventoryDetail } from "./inventory";
import { InventoryPage as InventoryManagementPage } from "./inventoryPage";
import { MediaLibrary } from "./mediaLibrary";
import { OrdersPage } from "./orders";
import { RolePermissionsPage, RolesPage, UsersPage } from "./staff";
import { AuditPage } from "./audit";
import { ContactSubmissionsPage } from "./contactSubmissions";
import { ReportsPage, SystemPage } from "./systemReports";
import { SettingsPage } from "./settings";
import { PagesPage } from "./pages";
import { UsefulInfoPage } from "./usefulInfo";
import { AbandonedCheckoutsPage } from "./abandonedCheckouts";
import "./styles.css";
import "./workspace.css";
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
// StrictMode mounts effects twice in development. Share refresh rotation so
// concurrent callers cannot invalidate each other's one-time refresh cookie.
let refreshRequest;
const refreshSession = () => {
  if (!refreshRequest) {
    refreshRequest = request("/admin/auth/refresh", { method: "POST" }).finally(
      () => {
        refreshRequest = null;
      },
    );
  }
  return refreshRequest;
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
    refreshSession()
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
      }),
    authDownload = async (path) => {
      const response = await fetch(`${API}${path}`, {
        credentials: "include",
        headers: {
          Accept: "application/pdf",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let payload = {};
        try {
          payload = await response.json();
        } catch {
          // Keep the HTTP status as the useful fallback for non-JSON errors.
        }
        throw new Error(payload.error?.message || "Unable to download file.");
      }
      return response.blob();
    };
  return (
    <C.Provider
      value={{ admin, status, login, logout, authFetch, authDownload }}
    >
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
        <div className="login-mark">
          <Leaf size={28} />
        </div>
        <span className="section-kicker">NATURAL BEAUTY / ADMINISTRATION</span>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your store.</p>
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
  ["Inventory", "/inventory", Warehouse, "inventory.view"],
  ["Categories", "/catalog/categories", Layers, "catalog.view"],
  ["Brands", "/catalog/brands", Leaf, "catalog.view"],
  ["Orders", "/orders", ShoppingBag, "orders.view"],
  ["Abandoned checkouts", "/abandoned-checkouts", ShoppingBag, "orders.view"],
  ["Customers", "/customers", Users, "customers.view"],
  ["Useful Info", "/useful-info", BarChart3, "dashboard.view"],
  ["Reviews", "/reviews", Star, "reviews.view"],
  ["Contact", "/contact", MessageSquare, "customers.view"],
  ["Promotions", "/promotions", Tags, "promotions.view"],
  ["Media library", "/media", Images, "catalog.view"],
  ["Reports", "/reports", BarChart3, "dashboard.view"],
  ["Pages", "/pages", FileText, "content.view"],
  ["Users", "/staff/users", UserCog, "staff.view"],
  ["Roles", "/staff/roles", ShieldCheck, "staff.view"],
  ["Role permissions", "/staff/permissions", KeyRound, "staff.view"],
  ["Settings", "/settings", Settings2, "settings.view"],
  ["Audit log", "/audit-logs", ClipboardList, "audit.view"],
  ["System", "/system", Settings, "settings.view"],
];
const dashboardCardCopy = {
  Products: "Curate your product catalogue →",
  Inventory: "Track stock and fulfilment →",
  Categories: "Organise paths to discovery →",
  Brands: "Shape your brand directory →",
  Orders: "Review and fulfil customer orders →",
  "Abandoned checkouts": "Recover unfinished checkouts →",
  Customers: "Understand customer relationships →",
  "Useful Info": "See what shoppers prefer →",
  Reviews: "Moderate customer feedback →",
  Contact: "Respond to customer enquiries →",
  Promotions: "Create offers and gift cards →",
  "Media library": "Manage your visual assets →",
  Reports: "Measure store performance →",
  Pages: "Publish storefront content →",
  Users: "Manage staff access →",
  Roles: "Define staff roles →",
  "Role permissions": "Control module permissions →",
  Settings: "Configure storefront and commerce →",
  "Audit log": "Review every admin action →",
  System: "Monitor platform health →",
};
function Shell({ children }) {
  const { admin, logout, authFetch } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const [storeSettings, setStoreSettings] = useState({});
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    authFetch("/admin/settings")
      .then((response) => setStoreSettings(response.data || {}))
      .catch(() => setStoreSettings({}));
  }, []);

  const branding = storeSettings.branding || {};
  const logoUrl = branding.logo_url;
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const businessName =
    storeSettings.store?.store_name ||
    storeSettings.seo?.site_title ||
    "Natural Beauty";

  useEffect(() => {
    document.title = "Admin Panel";
    const favicon = document.head.querySelector("link[rel='icon']");
    if (favicon) favicon.href = branding.favicon_url || "/favicon.svg";
  }, [branding.favicon_url]);
  useEffect(() => {
    const element = navRef.current;
    if (!element) return;
    requestAnimationFrame(() => {
      const activeLink = element.querySelector('[aria-current="true"]');
      activeLink?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "center",
      });
    });
  }, [location.pathname]);
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          {showLogo ? (
            <img
              className="admin-brand-logo"
              src={logoUrl}
              alt={businessName}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            businessName
          )}
        </div>
        <nav ref={navRef}>
          {nav
            .filter((n) => admin?.effectivePermissions?.includes(n[3]))
            .map(([l, t, I]) => (
              <Link
                to={t}
                key={t}
                aria-current={
                  location.pathname === t ||
                  location.pathname.startsWith(`${t}/`)
                    ? "true"
                    : undefined
                }
              >
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
        <header className="admin-topbar">
          <div className="admin-topbar-context">
            <span className="admin-topbar-kicker">
              {businessName.toUpperCase()} / ADMIN PANEL
            </span>
          </div>
          <div className="admin-topbar-account">
            <span className="admin-topbar-user">
              {admin?.firstName} {admin?.lastName}
            </span>
          </div>
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
  const { admin } = useAuth();
  return (
    <Protected permission="dashboard.view">
      <div className="page-head">
        <div>
          <span className="section-kicker">TODAY AT A GLANCE</span>
          <h1>
            {admin?.firstName
              ? `Good to see you, ${admin.firstName}.`
              : "Your store, at a glance."}
          </h1>
          <p>
            Manage products, customers, fulfilment, and growth from one place.
          </p>
        </div>
      </div>
      <div className="dashboard-links">
        {nav
          .filter(
            ([label, path, Icon, permission]) =>
              path !== "/dashboard" &&
              admin?.effectivePermissions?.includes(permission),
          )
          .map(([label, path, Icon]) => (
            <Link key={path} to={path}>
              <Icon size={28} aria-hidden="true" />
              <div>
                <strong>{label}</strong>
                <small>
                  {dashboardCardCopy[label] ||
                    `Manage ${label.toLowerCase()} →`}
                </small>
              </div>
            </Link>
          ))}
      </div>
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
        path="/catalog/products/new"
        element={
          <Protected>
            <ProductEditor />
          </Protected>
        }
      />
      <Route
        path="/catalog/products/:id"
        element={
          <Protected>
            <ProductEditor />
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
      <Route
        path="/customers"
        element={
          <Protected permission="customers.view">
            <CustomersPage />
          </Protected>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <Protected permission="customers.view">
            <CustomerDetailPage />
          </Protected>
        }
      />
      <Route
        path="/reviews"
        element={
          <Protected permission="reviews.view">
            <ReviewsPage />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected permission="settings.view">
            <SettingsPage />
          </Protected>
        }
      />
      <Route
        path="/pages"
        element={
          <Protected permission="content.view">
            <PagesPage />
          </Protected>
        }
      />
      <Route
        path="/system"
        element={
          <Protected permission="settings.view">
            <SystemPage />
          </Protected>
        }
      />
      <Route
        path="/reports"
        element={
          <Protected permission="dashboard.view">
            <ReportsPage />
          </Protected>
        }
      />
      <Route
        path="/useful-info"
        element={
          <Protected permission="dashboard.view">
            <UsefulInfoPage />
          </Protected>
        }
      />
      <Route
        path="/contact"
        element={
          <Protected permission="customers.view">
            <ContactSubmissionsPage />
          </Protected>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <Protected permission="audit.view">
            <AuditPage />
          </Protected>
        }
      />
      <Route
        path="/staff/users"
        element={
          <Protected permission="staff.view">
            <UsersPage />
          </Protected>
        }
      />
      <Route
        path="/staff/roles"
        element={
          <Protected permission="staff.view">
            <RolesPage />
          </Protected>
        }
      />
      <Route
        path="/staff/permissions"
        element={
          <Protected permission="staff.view">
            <RolePermissionsPage />
          </Protected>
        }
      />
      <Route
        path="/orders"
        element={
          <Protected permission="orders.view">
            <OrdersPage />
          </Protected>
        }
      />
      <Route
        path="/abandoned-checkouts"
        element={
          <Protected permission="orders.view">
            <AbandonedCheckoutsPage />
          </Protected>
        }
      />
      <Route
        path="/promotions"
        element={
          <Protected permission="promotions.view">
            <PromotionsPage />
          </Protected>
        }
      />
      <Route
        path="/inventory/:skuId"
        element={
          <Protected permission="inventory.view">
            <InventoryDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory"
        element={
          <Protected permission="inventory.view">
            <InventoryManagementPage />
          </Protected>
        }
      />
      <Route
        path="/media"
        element={
          <Protected>
            <MediaLibrary />
          </Protected>
        }
      />
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
