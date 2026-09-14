/* oxlint-disable react/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  authErrorMessage,
  deleteAccount,
  exportAccount,
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  updateProfile,
} from "../services/authApi";
import "./AccountDashboard.css";

const emptyAddress = {
  label: "",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "IN",
  addressType: "home",
  isDefault: false,
};
const internalError = (error) =>
  authErrorMessage(
    error,
    error?.code === "NETWORK_ERROR"
      ? "We could not reach your account right now. Please try again."
      : "We could not save your changes. Please try again.",
  );
function Guard({ children }) {
  const { isAuthenticated, authStatus } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (authStatus === "unauthenticated")
      navigate(
        `/login?returnTo=${encodeURIComponent(window.location.pathname)}`,
        { replace: true },
      );
  }, [authStatus, navigate]);
  if (authStatus === "checking")
    return (
      <main className="account-page container">
        <p className="eyebrow">My account</p>
        <p className="account-title">Checking your session…</p>
      </main>
    );
  return isAuthenticated ? children : null;
}
function Shell({ children, active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
          {[
            ["Overview", "/account"],
            ["Orders", "/account/orders"],
            ["Wishlist", "/account/wishlist"],
            ["Addresses", "/account/addresses"],
            ["Profile", "/account/profile"],
            ["Rewards", "/account/rewards"],
            ["Gift Cards", "/account/gift-cards"],
          ].map(([label, href]) => (
            <Link
              className={active === label ? "active" : ""}
              key={label}
              to={href}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </nav>
        <section className="account-content">{children}</section>
      </div>
    </main>
  );
}

export function CustomerProfile() {
  const { user, authFetch, updateUser, logout } = useAuth();
  const [form, setForm] = useState(user || {});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  useEffect(() => setForm(user || {}), [user]);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const result = await updateProfile(authFetch, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || form.mobile,
      });
      const customer = result.data.customer;
      updateUser({ ...customer, mobile: customer.phone });
      setStatus("Profile saved.");
    } catch (requestError) {
      setError(internalError(requestError));
    } finally {
      setSaving(false);
    }
  };
  const downloadData = async () => {
    const result = await exportAccount(authFetch);
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "natural-beauty-account-export.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const removeAccount = async () => {
    if (
      !accountPassword ||
      !window.confirm("Delete your account and revoke all sessions?")
    )
      return;
    try {
      await deleteAccount(authFetch, accountPassword);
      setStatus(
        "Your account closure request was submitted. You have been signed out; an administrator will review it.",
      );
      setAccountPassword("");
      await logout();
    } catch (requestError) {
      setError(internalError(requestError));
    }
  };
  return (
    <Guard>
      <Shell active="Profile">
        <p className="eyebrow">Your details</p>
        <h2 className="account-title">Profile</h2>
        <p className="profile-intro">
          Keep your contact details current so we can keep every order and update connected.
        </p>
        <form className="profile-form" onSubmit={submit}>
          <div className="profile-fields">
            {["firstName", "lastName", "phone"].map((key) => (
              <label key={key}>
                {key === "firstName"
                  ? "First name"
                  : key === "lastName"
                    ? "Last name"
                    : "Phone"}
              <input
                type={key === "phone" ? "tel" : "text"}
                inputMode={key === "phone" ? "numeric" : undefined}
                maxLength={key === "phone" ? 10 : undefined}
                pattern={key === "phone" ? "[0-9]{10}" : undefined}
                value={form[key] || form.mobile || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: key === "phone" ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value,
                    }))
                  }
                  required
                />
              </label>
            ))}
          </div>
          <label>
            Email address
            <input value={form.email || ""} readOnly />
          </label>
          <p>Email changes require verification and are not available here.</p>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {status && (
            <p className="auth-success" role="status">
              {status}
            </p>
          )}
          <button className="button" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link to="/reset-password" className="account-action">
            Change password
          </Link>
          <button
            type="button"
            className="account-action"
            onClick={downloadData}
          >
            Download my data
          </button>
          <div className="profile-danger-zone">
            <strong>Close your account</strong>
            <p>This sends a request to our team and locks sign-in while it is reviewed.</p>
            <label>
              Confirm your password
              <input
                type="password"
                value={accountPassword}
                onChange={(event) => setAccountPassword(event.target.value)}
              />
            </label>
            <button type="button" className="account-action danger" onClick={removeAccount}>
              Request account closure
            </button>
          </div>
        </form>
      </Shell>
    </Guard>
  );
}

export function CustomerAddresses() {
  const { authFetch } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const result = await getAddresses(authFetch);
      setAddresses(result.data || []);
      setError("");
    } catch (requestError) {
      setError(internalError(requestError));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [authFetch]);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = form.id
        ? await updateAddress(authFetch, form.id, form)
        : await createAddress(authFetch, form);
      setAddresses((current) =>
        form.id
          ? current.map((item) => (item.id === form.id ? result.data : item))
          : [...current, result.data],
      );
      setForm(null);
    } catch (requestError) {
      setError(internalError(requestError));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      await deleteAddress(authFetch, id);
      await load();
    } catch (requestError) {
      setError(internalError(requestError));
    }
  };
  const makeDefault = async (id) => {
    try {
      const result = await setDefaultAddress(authFetch, id);
      setAddresses((current) =>
        current.map((item) => ({
          ...item,
          isDefault: item.id === result.data.id,
        })),
      );
    } catch (requestError) {
      setError(internalError(requestError));
    }
  };
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const addressLabels = {
    label: "Address label",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    addressLine1: "Address line 1",
    addressLine2: "Address line 2 (optional)",
    landmark: "Landmark (optional)",
    city: "City",
    state: "State",
    postalCode: "Postal code",
  };
  return (
    <Guard>
      <Shell active="Addresses">
        <p className="eyebrow">Your details</p>
        <h2 className="account-title">Saved addresses</h2>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="account-muted">Loading saved addresses…</p>
        ) : (
          <div className="address-list">
            {addresses.length ? (
              addresses.map((address) => (
                <article key={address.id}>
                  <p>{address.label}</p>
                  <strong>
                    {address.firstName} {address.lastName}
                  </strong>
                  <span>
                    {address.phone}
                    <br />
                    {address.addressLine1}
                    <br />
                    {address.addressLine2 && (
                      <>
                        {address.addressLine2}
                        <br />
                      </>
                    )}
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.countryCode}
                  </span>
                  {address.isDefault && <small>Default address</small>}
                  <div>
                    <button
                      disabled={address.isDefault}
                      onClick={() => makeDefault(address.id)}
                    >
                      Set as default
                    </button>
                    <button onClick={() => setForm(address)}>Edit</button>
                    <button onClick={() => remove(address.id)}>Remove</button>
                  </div>
                </article>
              ))
            ) : (
              <p className="account-muted">No saved addresses yet.</p>
            )}
          </div>
        )}
        <button
          className="account-action"
          onClick={() => setForm(emptyAddress)}
        >
          Add new address
        </button>
        {form && (
          <form className="address-add" onSubmit={save}>
            {[
              "label",
              "firstName",
              "lastName",
              "phone",
              "addressLine1",
              "addressLine2",
              "landmark",
              "city",
              "state",
              "postalCode",
            ].map((key) => (
              <label key={key}>
                {addressLabels[key]}
                <input
                  type={key === "phone" || key === "postalCode" ? "tel" : "text"}
                  inputMode={key === "phone" || key === "postalCode" ? "numeric" : undefined}
                  maxLength={key === "phone" ? 10 : key === "postalCode" ? 6 : undefined}
                  pattern={key === "phone" ? "[0-9]{10}" : key === "postalCode" ? "[0-9]{6}" : undefined}
                  value={form[key] || ""}
                  onChange={(event) => update(key, ["phone", "postalCode"].includes(key) ? event.target.value.replace(/\D/g, "").slice(0, key === "phone" ? 10 : 6) : event.target.value)}
                  required={!["addressLine2", "landmark"].includes(key)}
                />
              </label>
            ))}
            <label>
              Address type
              <select
                value={form.addressType}
                onChange={(event) => update("addressType", event.target.value)}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(form.isDefault)}
                onChange={(event) => update("isDefault", event.target.checked)}
              />{" "}
              Make default
            </label>
            <button className="button" disabled={saving}>
              {saving ? "Saving…" : "Save address"}
            </button>
            <button type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
          </form>
        )}
      </Shell>
    </Guard>
  );
}
