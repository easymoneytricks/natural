import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const emptyUser = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  status: "active",
  roleIds: [],
};
const emptyRole = { name: "", slug: "", description: "", permissionIds: [] };

const apiError = (caught, fallback) => caught?.message || fallback;

function Modal({ title, eyebrow, description, onClose, children }) {
  return (
    <div
      className="staff-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="staff-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="staff-modal-header">
          <div>
            <span className="section-kicker">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function UserEditor({ editing, roles, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(
    editing ? { ...emptyUser, ...editing, password: "" } : emptyUser,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const toggleRole = (id) =>
    update(
      "roleIds",
      form.roleIds.includes(id)
        ? form.roleIds.filter((roleId) => roleId !== id)
        : [...form.roleIds, id],
    );
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(
        editing ? `/admin/staff/users/${editing.id}` : "/admin/staff/users",
        { method: editing ? "PATCH" : "POST", body: form },
      );
      onSaved();
    } catch (caught) {
      setError(apiError(caught, "Unable to save user."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      title={editing ? "Edit admin user" : "Add admin user"}
      eyebrow="STAFF / USERS"
      description="Control staff access without exposing customer credentials."
      onClose={onClose}
    >
      <form className="staff-form" onSubmit={submit}>
        <div className="staff-form-grid">
          <label>
            First name *
            <input
              required
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
            />
          </label>
          <label>
            Last name *
            <input
              required
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
            />
          </label>
          <label>
            Email address *
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
          <label>
            Password {editing ? "(optional)" : "*"}
            <input
              required={!editing}
              minLength="10"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder={
                editing
                  ? "Leave blank to keep current"
                  : "At least 10 characters"
              }
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend>Assign roles *</legend>
          <div className="staff-role-options">
            {roles.map((role) => (
              <label key={role.id}>
                <input
                  type="checkbox"
                  checked={form.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button className="button-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button disabled={saving}>
            {saving && <LoaderCircle className="spin" size={15} />}{" "}
            {editing ? "Save user" : "Create user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RoleEditor({ editing, permissions, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(
    editing ? { ...emptyRole, ...editing } : emptyRole,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const toggle = (id) =>
    setForm((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(id)
        ? current.permissionIds.filter((value) => value !== id)
        : [...current.permissionIds, id],
    }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authFetch(
        editing ? `/admin/staff/roles/${editing.id}` : "/admin/staff/roles",
        { method: editing ? "PATCH" : "POST", body: form },
      );
      onSaved();
    } catch (caught) {
      setError(apiError(caught, "Unable to save role."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      title={editing ? "Edit role" : "Create role"}
      eyebrow="STAFF / ROLES"
      description="Bundle the exact permissions each team member needs."
      onClose={onClose}
    >
      <form className="staff-form" onSubmit={submit}>
        <div className="staff-form-grid">
          <label>
            Role name *
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label>
            Role slug
            <input
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
              placeholder="Auto-generated if blank"
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description || ""}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
        <fieldset>
          <legend>Permissions</legend>
          <div className="permission-check-grid">
            {permissions.map((permission) => (
              <label key={permission.id}>
                <input
                  type="checkbox"
                  checked={form.permissionIds.includes(permission.id)}
                  onChange={() => toggle(permission.id)}
                />
                {permission.slug}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button className="button-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button disabled={saving}>
            {saving && <LoaderCircle className="spin" size={15} />}{" "}
            {editing ? "Save role" : "Create role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function useStaffData() {
  const { authFetch } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const [roleResponse, permissionResponse] = await Promise.all([
        authFetch("/admin/staff/roles"),
        authFetch("/admin/staff/permissions"),
      ]);
      setRoles(Array.isArray(roleResponse.data) ? roleResponse.data : []);
      setPermissions(
        Array.isArray(permissionResponse.data) ? permissionResponse.data : [],
      );
    } catch (caught) {
      setError(apiError(caught, "Unable to load staff configuration."));
    }
  };
  useEffect(() => {
    load();
  }, []);
  return { roles, permissions, error, reload: load };
}

export function UsersPage() {
  const { authFetch } = useAuth();
  const { roles, error: configError, reload: reloadConfig } = useStaffData();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/admin/staff/users?q=${encodeURIComponent(query)}`,
      );
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (caught) {
      setError(apiError(caught, "Unable to load admin users."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [query]);
  const refresh = () => {
    setEditing(null);
    load();
    reloadConfig();
  };
  return (
    <div className="staff-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">ACCESS / USERS</span>
          <h1>Users</h1>
          <p>Manage super admins, administrators and staff accounts.</p>
        </div>
        <button onClick={() => setEditing({})}>
          <Plus size={17} /> Add user
        </button>
      </div>
      <div className="staff-summary">
        <div>
          <span>Total users</span>
          <b>{users.length}</b>
        </div>
        <div>
          <span>Active</span>
          <b>{users.filter((user) => user.status === "active").length}</b>
        </div>
        <div>
          <span>Roles in use</span>
          <b>{new Set(users.flatMap((user) => user.roles)).size}</b>
        </div>
      </div>
      <div className="staff-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email"
          />
        </div>
      </div>
      {(error || configError) && (
        <div className="error" role="alert">
          {error || configError}
        </div>
      )}
      <div className="card table-wrap staff-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading users…</p>
          </div>
        ) : !users.length ? (
          <div className="catalog-state">
            <UserCog size={28} />
            <h2>No admin users found</h2>
            <p>Create a role-based account to get started.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                    <small>{user.email}</small>
                  </td>
                  <td>{user.roles.join(", ") || "No role"}</td>
                  <td>
                    <span className={`status-pill status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString("en-IN")
                      : "Never"}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setEditing(user)}
                      aria-label={`Edit ${user.email}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editing && (
        <UserEditor
          editing={editing.id ? editing : null}
          roles={roles}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

export function RolesPage() {
  const { authFetch } = useAuth();
  const { permissions, error: configError } = useStaffData();
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const response = await authFetch("/admin/staff/roles");
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (caught) {
      setError(apiError(caught, "Unable to load roles."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="staff-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">ACCESS / ROLES</span>
          <h1>Roles</h1>
          <p>Build reusable access profiles for every internal team.</p>
        </div>
        <button onClick={() => setEditing({})}>
          <Plus size={17} /> Add role
        </button>
      </div>
      {(error || configError) && (
        <div className="error" role="alert">
          {error || configError}
        </div>
      )}
      <div className="card table-wrap staff-table">
        {loading ? (
          <div className="catalog-state">
            <LoaderCircle className="spin" size={24} />
            <p>Loading roles…</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Permissions</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                    <small>
                      {role.slug} · {role.description || "No description"}
                    </small>
                  </td>
                  <td>{role.userCount}</td>
                  <td>{role.permissionCount}</td>
                  <td>
                    <span
                      className={`status-pill ${role.system ? "status-active" : "status-disabled"}`}
                    >
                      {role.system ? "System" : "Custom"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => setEditing(role)}
                      aria-label={`Edit ${role.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editing && (
        <RoleEditor
          editing={editing.id ? editing : null}
          permissions={permissions}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

export function RolePermissionsPage() {
  const { authFetch } = useAuth();
  const { roles, permissions, error: configError } = useStaffData();
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (roles.length && !selected) setSelected(roles[0].id);
  }, [roles, selected]);
  useEffect(() => {
    if (!selected) return;
    authFetch(`/admin/staff/roles/${selected}`)
      .then((response) => setSelectedIds(response.data.permissionIds || []))
      .catch((caught) =>
        setError(apiError(caught, "Unable to load permissions.")),
      );
  }, [selected]);
  const grouped = useMemo(
    () =>
      permissions.reduce((groups, permission) => {
        const parts = permission.slug.split(".");
        const group =
          parts.length > 2
            ? `${parts[0]} / ${parts[1]}`
            : parts[0];
        (groups[group] ||= []).push(permission);
        return groups;
      }, {}),
    [permissions],
  );
  const toggle = (id) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  const save = async () => {
    setSaving(true);
    try {
      await authFetch(`/admin/staff/roles/${selected}/permissions`, {
        method: "PATCH",
        body: { permissionIds: selectedIds },
      });
      setNotice("Permissions saved successfully.");
    } catch (caught) {
      setError(apiError(caught, "Unable to save permissions."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="staff-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">ACCESS / PERMISSIONS</span>
          <h1>Role permissions</h1>
          <p>
            Give each role the minimum access required to operate the store.
          </p>
        </div>
      </div>
      {(error || configError) && (
        <div className="error" role="alert">
          {error || configError}
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      <div className="permission-layout">
        <aside className="card role-list">
          <div className="action-card-heading">
            <ShieldCheck size={17} />
            <b>Select a role</b>
          </div>
          {roles.map((role) => (
            <button
              key={role.id}
              className={selected === role.id ? "is-active" : ""}
              onClick={() => setSelected(role.id)}
            >
              {role.name}
              <small>{role.permissionCount} permissions</small>
            </button>
          ))}
        </aside>
        <section className="card permission-panel">
          <div className="permission-panel-header">
            <div>
              <span className="section-kicker">PERMISSION MATRIX</span>
              <h2>
                {roles.find((role) => role.id === selected)?.name ||
                  "Select a role"}
              </h2>
            </div>
            <button disabled={!selected || saving} onClick={save}>
              {saving && <LoaderCircle className="spin" size={15} />} Save
              permissions
            </button>
          </div>
          <div className="permission-groups">
            {Object.entries(grouped).map(([group, values]) => (
              <fieldset key={group}>
                <legend>{group}</legend>
                {values.map((permission) => (
                  <label key={permission.id}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(permission.id)}
                      onChange={() => toggle(permission.id)}
                    />{" "}
                    <span>
                      <b>{permission.name}</b>
                      <small>{permission.description || permission.slug}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export const StaffIcons = {
  users: UserCog,
  roles: ShieldCheck,
  permissions: KeyRound,
};
