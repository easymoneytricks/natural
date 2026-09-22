import { createContext, useContext, useEffect, useState } from "react";

const StoreSettingsContext = createContext({});
const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    fetch(`${API}/store-settings`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => payload?.data && setSettings(payload.data))
      .catch(() => {});
  }, []);
  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export const useStoreSettings = () => useContext(StoreSettingsContext);

export const getBusinessName = (settings = {}) =>
  String(
    settings.store?.store_name || settings.seo?.site_title || "",
  ).trim();
