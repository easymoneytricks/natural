import { useEffect, useRef } from "react";
import { useStoreSettings } from "../context/StoreSettingsContext";

let scriptPromise;

const waitForCaptcha = (resolve, reject) => {
  const startedAt = Date.now();
  const check = () => {
    if (window.grecaptcha?.render) {
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
      return;
    }
    if (Date.now() - startedAt > 10000) {
      reject(new Error("reCAPTCHA did not initialize."));
      return;
    }
    window.setTimeout(check, 50);
  };
  check();
};

const loadScript = () => {
  if (window.grecaptcha?.render)
    return new Promise((resolve) =>
      window.grecaptcha.ready(() => resolve(window.grecaptcha)),
    );
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        "script[data-natural-beauty-recaptcha]",
      );
      const script = existingScript || document.createElement("script");
      let started = false;
      const finish = () => {
        if (started) return;
        started = true;
        waitForCaptcha(resolve, reject);
      };
      script.dataset.naturalBeautyRecaptcha = "true";
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", finish, { once: true });
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("reCAPTCHA script could not load."));
      };
      if (!script.parentNode) document.head.appendChild(script);
      if (existingScript) finish();
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
      .catch(() => {
        scriptPromise = null;
        onToken("");
      });
    return () => {
      cancelled = true;
      if (elementRef.current) elementRef.current.innerHTML = "";
      widgetRef.current = null;
    };
  }, [enabled, onToken, siteKey]);

  if (!enabled || !siteKey) return null;
  return <div className="recaptcha-widget" ref={elementRef} />;
}

export const isRecaptchaEnabled = (settings) =>
  String(settings.recaptcha?.enabled).toLowerCase() === "true" &&
  Boolean(settings.recaptcha?.site_key);
