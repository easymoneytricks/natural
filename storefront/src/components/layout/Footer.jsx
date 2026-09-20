import { ChevronDown, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  getBusinessName,
  useStoreSettings,
} from "../../context/StoreSettingsContext";

function parseFooterLinks(value) {
  if (!value || typeof value !== "string") return [];
  const parsed = value
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, path]) => label && path)
    .map(([label, path]) => [label, path]);
  return parsed;
}

function SocialIcon({ name }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    "aria-hidden": true,
    focusable: "false",
  };

  if (name === "instagram") {
    return (
      <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg {...commonProps} fill="currentColor">
        <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.7v8h2.9Z" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg {...commonProps} fill="currentColor">
        <path d="M21.6 7.1a2.8 2.8 0 0 0-2-2C17.9 4.6 12 4.6 12 4.6s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8.8 2 12 2 12s0 3.2.4 4.9a2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.9.4-4.9s0-3.2-.4-4.9ZM10 15.4V8.6l6 3.4-6 3.4Z" />
      </svg>
    );
  }

  if (name === "twitter") {
    return (
      <svg {...commonProps} fill="currentColor">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.4L2.8 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.9h1.7L8.3 4H6.5l11.3 15.9Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps} fill="currentColor">
      <path d="M12.1 2.2c-5.3 0-8.8 3.8-8.8 8.1 0 3.4 1.9 6.4 4.8 7.5-.1-.6-.1-1.5 0-2.1l1-4.2s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.8 0 1.2.6 1.2 1.3 0 .8-.5 1.9-.8 3-.2.9.4 1.6 1.3 1.6 1.6 0 2.8-1.7 2.8-4.2 0-2.2-1.6-3.8-3.9-3.8-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.1.1.1.1.2.1.3l-.3 1.1c-.1.3-.3.4-.6.2-1.2-.5-1.9-2.1-1.9-3.4 0-2.8 2-5.4 5.9-5.4 3.1 0 5.5 2.2 5.5 5.1 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.3c-.2.9-.8 2-1.2 2.7.9.3 1.8.5 2.8.5 5.3 0 8.8-3.8 8.8-8.1s-3.5-8.1-8.8-8.1Z" />
    </svg>
  );
}

export function Footer() {
  const [openGroup, setOpenGroup] = useState(null);
  const settings = useStoreSettings();
  const businessName = getBusinessName(settings);
  const logo =
    settings.branding?.footer_logo_url || settings.branding?.logo_url || "";
  const footerLinks = [
    [
      settings.footer?.shop_title,
      parseFooterLinks(settings.footer?.shop_links),
    ],
    [
      settings.footer?.customer_care_title,
      parseFooterLinks(settings.footer?.customer_care_links),
    ],
    [
      settings.footer?.about_title,
      parseFooterLinks(settings.footer?.about_links),
    ],
    [
      settings.footer?.legal_title,
      parseFooterLinks(settings.footer?.legal_links),
    ],
  ].filter(([title, links]) => title && links.length);

  return (
    <footer className="site-footer">
      <div className="footer-main homepage-container">
        <div className="footer-brand">
          <Link to="/" className="wordmark">
            {logo ? (
              <img
                className="brand-logo"
                src={logo}
                alt={`${businessName} logo`}
              />
            ) : (
              <span className="wordmark-name">{businessName}</span>
            )}
          </Link>
          <p>{settings.footer?.tagline}</p>
          {settings.footer?.tagline_secondary && (
            <span>{settings.footer.tagline_secondary}</span>
          )}
          <div className="footer-socials">
            <a
              href={settings.footer?.instagram_url || "#"}
              aria-label={`${businessName} on Instagram`}
            >
              <SocialIcon name="instagram" />
            </a>
            <a
              href={settings.footer?.facebook_url || "#"}
              aria-label={`${businessName} on Facebook`}
            >
              <SocialIcon name="facebook" />
            </a>
            <a
              href={settings.footer?.youtube_url || "#"}
              aria-label={`${businessName} on YouTube`}
            >
              <SocialIcon name="youtube" />
            </a>
            <a
              href={settings.footer?.pinterest_url || "#"}
              aria-label={`${businessName} on Pinterest`}
            >
              <SocialIcon name="pinterest" />
            </a>
            <a
              href={settings.footer?.twitter_url || "#"}
              aria-label={`${businessName} on Twitter / X`}
            >
              <SocialIcon name="twitter" />
            </a>
          </div>
        </div>
        <div className="footer-links">
          {footerLinks.map(([group, links]) => (
            <section
              key={group}
              className={openGroup === group ? "is-open" : ""}
            >
              <button
                aria-expanded={openGroup === group}
                onClick={() => setOpenGroup(openGroup === group ? null : group)}
              >
                {group}
                <ChevronDown size={16} />
              </button>
              <div>
                {links.map(([label, path]) => (
                  <Link key={`${label}-${path}`} to={path}>
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="footer-contact">
          {settings.footer?.customer_care_title && (
            <p className="eyebrow">{settings.footer.customer_care_title}</p>
          )}
          <a href={`mailto:${settings.footer?.support_email || ""}`}>
            {settings.footer?.support_email}
          </a>
          {settings.footer?.support_phone && (
            <a
              className="footer-contact-detail"
              href={`tel:${settings.footer.support_phone}`}
            >
              <Phone size={14} />
              {settings.footer.support_phone}
            </a>
          )}
          {settings.footer?.location && (
            <span className="footer-contact-detail">
              <MapPin size={14} />
              {settings.footer.location}
            </span>
          )}
          {settings.store?.support_hours && (
            <span>{settings.store.support_hours}</span>
          )}
          {false && (
            <span>
              Mon–Sat
              <br />
              10:00 AM – 6:00 PM
            </span>
          )}
        </div>
      </div>
      <div className="footer-bottom homepage-container">
        <span>{settings.footer?.payment_methods && "Secure payments"}</span>
        <span>{settings.footer?.payment_methods}</span>
        {false && (
          <span>
            UPI <i>•</i> Cards <i>•</i> Net Banking <i>•</i> COD
          </span>
        )}
        <span>
          {settings.footer?.copyright_text} {businessName}
        </span>
      </div>
    </footer>
  );
}
