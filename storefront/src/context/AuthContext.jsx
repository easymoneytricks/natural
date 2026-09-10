/* oxlint-disable react/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiRequest } from "../lib/api";
import {
  authErrorMessage,
  getCurrentCustomer,
  loginCustomer,
  logoutAllSessions as apiLogoutAll,
  logoutCustomer,
  refreshSession,
  registerCustomer,
} from "../services/authApi";

const AuthContext = createContext(null);
let sharedRefreshPromise = null;
const shapeCustomer = (customer) =>
  customer
    ? { ...customer, mobile: customer.mobile || customer.phone || "" }
    : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");
  const mounted = useRef(true);
  const applySession = useCallback((result) => {
    const token = result?.data?.accessToken;
    if (!token) throw { status: 401, code: "SESSION_EXPIRED" };
    const customer = shapeCustomer(result.data.customer);
    setAccessToken(token);
    setUser(customer);
    setAuthStatus("authenticated");
    return { accessToken: token, customer };
  }, []);
  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!sharedRefreshPromise)
        sharedRefreshPromise = refreshSession()
          .then(applySession)
          .finally(() => {
            sharedRefreshPromise = null;
          });
      try {
        return await sharedRefreshPromise;
      } catch (error) {
        if (silent && error?.status === 401) return null;
        throw error;
      }
    },
    [applySession],
  );
  useEffect(() => {
    mounted.current = true;
    refresh({ silent: true })
      .catch(() => {
        if (mounted.current) {
          setAccessToken(null);
          setUser(null);
          setAuthStatus("unauthenticated");
        }
      })
      .finally(() => {
        if (mounted.current)
          setAuthStatus((status) =>
            status === "checking" ? "unauthenticated" : status,
          );
      });
    return () => {
      mounted.current = false;
    };
  }, [refresh]);
  const login = useCallback(
    async (email, password) =>
      applySession(await loginCustomer(email.trim(), password)),
    [applySession],
  );
  const register = useCallback(
    async (profile) => applySession(await registerCustomer(profile)),
    [applySession],
  );
  const logout = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    setAuthStatus("unauthenticated");
    try {
      await logoutCustomer();
    } catch {}
  }, []);
  const logoutAllSessions = useCallback(async () => {
    const token = accessToken;
    setAccessToken(null);
    setUser(null);
    setAuthStatus("unauthenticated");
    if (token) {
      try {
        await apiLogoutAll(token);
      } catch {}
    }
  }, [accessToken]);
  const authFetch = useCallback(
    async (path, options = {}) => {
      const token = accessToken;
      if (!token) throw { status: 401, code: "UNAUTHENTICATED" };
      const request = (bearer) =>
        apiRequest(path, {
          ...options,
          credentials: "include",
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${bearer}`,
          },
        });
      try {
        return await request(token);
      } catch (error) {
        if (error?.status !== 401) throw error;
        try {
          const refreshed = await refresh();
          return request(refreshed.accessToken);
        } catch (refreshError) {
          if (refreshError?.status === 401) {
            setAccessToken(null);
            setUser(null);
            setAuthStatus("unauthenticated");
          }
          throw refreshError;
        }
      }
    },
    [accessToken, refresh],
  );
  const updateUser = useCallback(
    (changes) =>
      setUser((current) => (current ? { ...current, ...changes } : current)),
    [],
  );
  const value = {
    user,
    customer: user,
    accessToken,
    authStatus,
    isAuthenticated: authStatus === "authenticated" && Boolean(user),
    login,
    register,
    logout,
    logoutAllSessions,
    refreshSession: refresh,
    getCurrentCustomer: () =>
      accessToken ? getCurrentCustomer(accessToken) : null,
    authFetch,
    getAccessToken: () => accessToken,
    updateUser,
    authErrorMessage,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
