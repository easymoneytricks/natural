import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "natural-beauty-cookie-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(!window.localStorage.getItem(CONSENT_KEY));
  }, []);
  const choose = (analytics) => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        necessary: true,
        analytics,
        timestamp: new Date().toISOString(),
      }),
    );
    window.dispatchEvent(
      new CustomEvent("cookie-consent", { detail: { analytics } }),
    );
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <aside className="consent-banner" aria-label="Cookie preferences">
      <div>
        <p className="eyebrow">Your privacy matters</p>
        <p>
          We use necessary storage for sign-in, cart continuity and security.
          Optional analytics stays off unless you choose it. Read our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
      <div className="consent-actions">
        <button type="button" onClick={() => choose(false)}>
          Only necessary
        </button>
        <button
          type="button"
          className="consent-primary"
          onClick={() => choose(true)}
        >
          Allow optional analytics
        </button>
      </div>
    </aside>
  );
}
