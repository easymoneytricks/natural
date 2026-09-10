import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/PreferenceContext";
import "./AuthPages.css";

const safeReturn = (value, fallback = "/account") => {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return fallback;
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !/^(javascript|data|https?):/i.test(decoded)
      ? decoded
      : fallback;
  } catch {
    return fallback;
  }
};
const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value);
const validPassword = (value) =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /\d/.test(value);

function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <label className="auth-field">
      {label}
      <span>*</span>
      <div>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
function TextField({ label, value, onChange, type = "text", error }) {
  return (
    <label className="auth-field">
      {label}
      <span>*</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <small>{error}</small>}
    </label>
  );
}

export function Login() {
  const { login, isAuthenticated, authStatus, authErrorMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = safeReturn(
    new URLSearchParams(location.search).get("returnTo"),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (authStatus === "authenticated" && isAuthenticated)
      navigate(returnTo, { replace: true });
  }, [authStatus, isAuthenticated, navigate, returnTo]);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validEmail(email) || !password)
      return setError("Enter a valid email and password.");
    setLoading(true);
    try {
      await login(email, password);
      setPassword("");
      navigate(returnTo);
    } catch (requestError) {
      setError(
        authErrorMessage(
          requestError,
          requestError?.code === "NETWORK_ERROR"
            ? "We couldn't sign you in right now. Please try again."
            : "We could not sign you in right now. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };
  if (authStatus === "checking")
    return (
      <AuthLayout
        eyebrow="Welcome back"
        heading="Return to your ritual."
        copy="Sign in to view your orders, saved addresses and account details."
      >
        <p className="auth-loading">Checking your session…</p>
      </AuthLayout>
    );
  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Return to your ritual."
      copy="Sign in to view your orders, saved addresses and account details."
    >
      <form className="auth-form" onSubmit={submit}>
        <TextField
          label="Email address"
          value={email}
          onChange={setEmail}
          type="email"
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <div className="auth-row">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="auth-switch">
          New to Natural Beauty?{" "}
          <Link to={`/register?returnTo=${encodeURIComponent(returnTo)}`}>
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const { register, authErrorMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = safeReturn(
    new URLSearchParams(location.search).get("returnTo"),
  );
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
    terms: false,
    marketing: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (
      !form.firstName ||
      !form.lastName ||
      !validEmail(form.email) ||
      !/^\d{10}$/.test(form.mobile.replace(/\D/g, "")) ||
      !validPassword(form.password) ||
      form.password !== form.confirm ||
      !form.terms
    )
      return setError(
        "Please complete all required fields and accept the terms.",
      );
    setLoading(true);
    try {
      await register(form);
      setForm((current) => ({ ...current, password: "", confirm: "" }));
      navigate(returnTo);
    } catch (requestError) {
      setError(
        authErrorMessage(
          requestError,
          requestError?.code === "NETWORK_ERROR"
            ? "We couldn't create your account right now. Please try again."
            : "We could not create your account right now. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      eyebrow="Join Natural Beauty"
      heading="Make your ritual yours."
      copy="Create an account to keep track of orders, addresses and the products you love."
    >
      <form className="auth-form register-form" onSubmit={submit}>
        <div className="auth-two">
          <TextField
            label="First name"
            value={form.firstName}
            onChange={(value) => update("firstName", value)}
          />
          <TextField
            label="Last name"
            value={form.lastName}
            onChange={(value) => update("lastName", value)}
          />
        </div>
        <TextField
          label="Email address"
          value={form.email}
          onChange={(value) => update("email", value)}
          type="email"
        />
        <TextField
          label="Mobile number"
          value={form.mobile}
          onChange={(value) =>
            update("mobile", value.replace(/\D/g, "").slice(0, 10))
          }
        />
        <PasswordField
          label="Password"
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
        />
        <p className="password-note">
          Use at least 8 characters with uppercase, lowercase and a number.
        </p>
        <PasswordField
          label="Confirm password"
          value={form.confirm}
          onChange={(value) => update("confirm", value)}
          autoComplete="new-password"
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <label className="auth-check">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(event) => update("terms", event.target.checked)}
          />{" "}
          I agree to the <Link to="/terms">Terms & Conditions</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </label>
        <label className="auth-check">
          <input
            type="checkbox"
            checked={form.marketing}
            onChange={(event) => update("marketing", event.target.checked)}
          />{" "}
          Send me Natural Beauty skincare notes and offers.
        </label>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create an account"}
        </button>
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout
      eyebrow="Account recovery"
      heading="Reset your password."
      copy="Enter your email address and we'll send you instructions to reset your password."
    >
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (validEmail(email)) setSent(true);
        }}
      >
        <TextField
          label="Email address"
          value={email}
          onChange={setEmail}
          type="email"
        />
        {sent && (
          <p className="auth-success" role="status">
            If an account exists for this email, reset instructions have been
            sent.
          </p>
        )}
        <button className="button" type="submit">
          Send reset link
        </button>
        {sent && (
          <Link className="demo-link" to="/reset-password">
            Demo only · Continue to reset password <ArrowRight size={14} />
          </Link>
        )}
        <p className="auth-switch">
          <Link to="/login">Return to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  return (
    <AuthLayout
      eyebrow="Demo password reset"
      heading="Choose a new password."
      copy="This frontend demo shows the reset journey without changing a real account password."
    >
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (validPassword(password) && password === confirm) setDone(true);
        }}
      >
        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <p className="password-note">
          Use at least 8 characters with uppercase, lowercase and a number.
        </p>
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {done && (
          <p className="auth-success" role="status">
            Password updated for demo.
          </p>
        )}
        <button className="button" type="submit">
          Reset password
        </button>
        {done && (
          <Link className="demo-link" to="/login">
            Return to sign in <ArrowRight size={14} />
          </Link>
        )}
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ eyebrow, heading, copy, children }) {
  return (
    <main className="auth-page">
      <div className="auth-visual" aria-hidden="true" />
      <section className="auth-panel">
        <Link className="wordmark" to="/">
          Natural Beauty
        </Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{heading}</h1>
        <p className="auth-copy">{copy}</p>
        {children}
      </section>
    </main>
  );
}

export function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      const returnTo = safeReturn(
        sessionStorage.getItem("natural-beauty-auth-return"),
        "/account",
      );
      sessionStorage.removeItem("natural-beauty-auth-return");
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);
  if (!user) return null;
  return (
    <main className="account-page container">
      <p className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> My Account
      </p>
      <header className="account-header">
        <p className="eyebrow">My account</p>
        <h1>Welcome back, {user.firstName}.</h1>
        <p>Manage your orders, addresses and account details in one place.</p>
      </header>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account navigation">
          <Link className="active" to="/account">
            Overview
          </Link>
          <Link to="/account/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/account/addresses">Addresses</Link>
          <Link to="/account/profile">Profile</Link>
          <Link to="/account/rewards">Rewards</Link>
          <Link to="/account/gift-cards">Gift Cards</Link>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </nav>
        <section className="account-content">
          <p className="account-mobile-label">My account</p>
          <div className="account-welcome">
            <span>{user.email}</span>
            <Link to="/account/profile">
              Account details <ArrowRight size={14} />
            </Link>
          </div>
          <div className="account-sections">
            <article>
              <p>Orders</p>
              <h2>No saved orders yet.</h2>
              <span>
                Order history will appear here after your first purchase.
              </span>
            </article>
            <article>
              <p>Saved items</p>
              <h2>
                {wishlistCount} {wishlistCount === 1 ? "product" : "products"}{" "}
                in your wishlist.
              </h2>
              <Link to="/wishlist">
                View wishlist <ArrowRight size={14} />
              </Link>
            </article>
            <article>
              <p>Addresses</p>
              <h2>Keep delivery details ready.</h2>
              <span>Your saved addresses will appear here.</span>
            </article>
            <article>
              <p>Rewards</p>
              <h2>A little something to look forward to.</h2>
              <span>Your Natural Beauty rewards will appear here.</span>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
