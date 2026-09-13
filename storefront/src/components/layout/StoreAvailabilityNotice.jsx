import { useStoreSettings } from "../../context/StoreSettingsContext";

export function StoreAvailabilityNotice() {
  const settings = useStoreSettings();
  const mode = settings.store?.maintenance_mode;
  if (mode !== "closed" && mode !== "coming_soon") return null;
  return (
    <div className="store-availability-notice" role="status">
      {mode === "coming_soon"
        ? "Coming soon · Explore our formulas while we prepare to open ordering."
        : "Ordering is temporarily paused · You can still browse our formulas."}
    </div>
  );
}
