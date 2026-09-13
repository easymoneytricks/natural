import { useEffect, useRef } from "react";
import { useStoreSettings } from "../context/StoreSettingsContext";

let scriptPromise;
const loadScript = () => {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.grecaptcha);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

export function RecaptchaWidget({ onToken }) {
  const settings = useStoreSettings();
  const elementRef = useRef(null);
  const widgetRef = useRef(null);
  const enabled = String(settings.recaptcha?.enabled).toLowerCase() === "true";
  const siteKey = settings.recaptcha?.site_key;

  useEffect(() => {
    if (!enabled || !siteKey || !elementRef.current) return undefined;
    let cancelled = false;
    loadScript()
      .then((captcha) => {
        if (cancelled || !elementRef.current || widgetRef.current !== null)
          return;
        widgetRef.current = captcha.render(elementRef.current, {
          sitekey: siteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      })
      .catch(() => onToken(""));
    return () => {
      cancelled = true;
    };
  }, [enabled, onToken, siteKey]);

  if (!enabled || !siteKey) return null;
  return <div className="recaptcha-widget" ref={elementRef} />;
}

export const isRecaptchaEnabled = (settings) =>
  String(settings.recaptcha?.enabled).toLowerCase() === "true" &&
  Boolean(settings.recaptcha?.site_key);
