import { useEffect, useMemo, useState } from "react";
import { useStoreSettings } from "../../context/StoreSettingsContext";

const getRemaining = (target) => {
  const distance = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(distance) || distance <= 0) return null;
  const totalSeconds = Math.floor(distance / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

export function StoreAvailabilityNotice() {
  const settings = useStoreSettings();
  const store = settings.store || {};
  const mode = store.maintenance_mode;
  const [remaining, setRemaining] = useState(null);
  const target = String(store.availability_countdown || "").trim();
  const isComingSoon = mode === "coming_soon";
  const isMaintenance = mode === "maintenance";
  const isClosed = mode === "closed";

  useEffect(() => {
    if (!isComingSoon || !target) {
      setRemaining(null);
      return undefined;
    }
    const update = () => setRemaining(getRemaining(target));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [isComingSoon, target]);

  const content = useMemo(() => {
    if (isComingSoon) {
      return {
        title: String(store.availability_title || "").trim(),
        message: String(store.availability_message || "").trim(),
      };
    }
    if (isMaintenance) {
      return {
        title: String(store.maintenance_title || "").trim(),
        message: String(store.maintenance_message || "").trim(),
      };
    }
    return { title: "", message: "" };
  }, [isComingSoon, isMaintenance, store]);

  if (isClosed) {
    const message = String(store.closed_message || "").trim();
    return message ? (
      <div className="store-availability-notice" role="status">
        {message}
      </div>
    ) : null;
  }
  if (!isComingSoon && !isMaintenance) return null;
  if (!content.title && !content.message) return null;

  return (
    <div className="store-availability-screen" role="status">
      <div className="store-availability-card">
        <p className="eyebrow">
          {isMaintenance ? "Maintenance" : "Coming soon"}
        </p>
        {content.title && <h1>{content.title}</h1>}
        {content.message && <p>{content.message}</p>}
        {isComingSoon && remaining && (
          <div className="store-countdown" aria-label="Countdown">
            {Object.entries(remaining).map(([unit, value]) => (
              <div key={unit}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
