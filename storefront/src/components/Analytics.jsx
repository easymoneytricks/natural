import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useStoreSettings } from "../context/StoreSettingsContext";

const consentKey = "natural-beauty-cookie-consent";
const measurementPattern = /^G-[A-Z0-9]+$/i;

function hasAnalyticsConsent() {
  try {
    return (
      JSON.parse(window.localStorage.getItem(consentKey) || "{}").analytics ===
      true
    );
  } catch {
    return false;
  }
}

export function Analytics() {
  const settings = useStoreSettings();
  const location = useLocation();
  const [consented, setConsented] = useState(hasAnalyticsConsent);
  const analytics = settings.analytics || {};
  const measurementId = String(analytics.measurement_id || "").trim();
  const enabled = String(analytics.enabled).toLowerCase() === "true";
  const active = enabled && measurementPattern.test(measurementId) && consented;

  useEffect(() => {
    const onConsent = (event) => setConsented(event.detail?.analytics === true);
    window.addEventListener("cookie-consent", onConsent);
    return () => window.removeEventListener("cookie-consent", onConsent);
  }, []);

  useEffect(() => {
    if (!active || document.querySelector("script[data-natural-beauty-ga]"))
      return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.naturalBeautyGa = "true";
    document.head.appendChild(script);
  }, [active, measurementId]);

  useEffect(() => {
    if (active && window.gtag) {
      window.gtag("event", "page_view", { page_path: location.pathname });
    }
  }, [active, location.pathname]);

  return null;
}
