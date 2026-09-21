import { useStoreSettings } from "../../context/StoreSettingsContext";

export function AnnouncementBar() {
  const settings = useStoreSettings();
  const branding = settings.branding || {};
  const messages = [
    branding.announcement ?? "Complimentary shipping on orders above ₹999",
    branding.announcement_secondary ?? "Thoughtfully made products",
    branding.announcement_tertiary ?? "Secure checkout",
  ].filter((message) => String(message || "").trim());

  return (
    <aside className="announcement">
      <div className="container">
        {messages.map((message, index) => (
          <span
            className={index ? "announcement-extra" : ""}
            key={`${message}-${index}`}
          >
            {message}
          </span>
        ))}
      </div>
    </aside>
  );
}
