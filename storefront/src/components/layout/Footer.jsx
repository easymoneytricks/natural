import { ChevronDown, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useStoreSettings } from "../../context/StoreSettingsContext";

const routeMap = {
  "Shop All": "/shop",
  "New Arrivals": "/new-arrivals",
  "Best Sellers": "/best-sellers",
  "Skin Types": "/skin-types",
  Concerns: "/concerns",
  "Gift Cards": "/gift-cards",
  "Contact Us": "/contact",
  FAQs: "/faq",
  Shipping: "/shipping",
  "Returns & Refunds": "/returns",
  "Track Order": "/track-order",
  "My Account": "/account",
  "Our Story": "/about",
  Ingredients: "/about",
  Journal: "/journal",
  Contact: "/contact",
  "Privacy Policy": "/privacy",
  "Terms & Conditions": "/terms",
  "Shipping Policy": "/shipping",
  "Return Policy": "/returns",
  "Refund Policy": "/refund-policy",
  "Cancellation Policy": "/cancellation-policy",
};

const defaultFooterLinks = {
  Shop: [
    ["Shop All", "/shop"],
    ["New Arrivals", "/new-arrivals"],
    ["Best Sellers", "/best-sellers"],
    ["Skin Types", "/skin-types"],
    ["Concerns", "/concerns"],
    ["Gift Cards", "/gift-cards"],
  ],
  "Customer Care": [
    ["Contact Us", "/contact"],
    ["FAQs", "/faq"],
    ["Shipping", "/shipping"],
    ["Returns & Refunds", "/returns"],
    ["Track Order", "/track-order"],
    ["My Account", "/account"],
  ],
  About: [
    ["Our Story", "/about"],
    ["Ingredients", "/about"],
    ["Journal", "/journal"],
    ["Contact", "/contact"],
  ],
  Legal: [
    ["Privacy Policy", "/privacy"],
    ["Terms & Conditions", "/terms"],
    ["Shipping Policy", "/shipping"],
    ["Return Policy", "/returns"],
    ["Refund Policy", "/refund-policy"],
    ["Cancellation Policy", "/cancellation-policy"],
  ],
};

function parseFooterLinks(value, fallback) {
  if (!value || typeof value !== "string") return fallback;
  const parsed = value
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, path]) => label && path)
    .map(([label, path]) => [label, path]);
  return parsed.length ? parsed : fallback;
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

  return (
    <svg {...commonProps} fill="currentColor">
      <path d="M12.1 2.2c-5.3 0-8.8 3.8-8.8 8.1 0 3.4 1.9 6.4 4.8 7.5-.1-.6-.1-1.5 0-2.1l1-4.2s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.8 0 1.2.6 1.2 1.3 0 .8-.5 1.9-.8 3-.2.9.4 1.6 1.3 1.6 1.6 0 2.8-1.7 2.8-4.2 0-2.2-1.6-3.8-3.9-3.8-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.1.1.1.1.2.1.3l-.3 1.1c-.1.3-.3.4-.6.2-1.2-.5-1.9-2.1-1.9-3.4 0-2.8 2-5.4 5.9-5.4 3.1 0 5.5 2.2 5.5 5.1 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.3c-.2.9-.8 2-1.2 2.7.9.3 1.8.5 2.8.5 5.3 0 8.8-3.8 8.8-8.1s-3.5-8.1-8.8-8.1Z" />
    </svg>
  );
}

export function Footer() {
  const [openGroup, setOpenGroup] = useState(null);
  const settings = useStoreSettings();
  const logo =
    settings.branding?.footer_logo_url ||
    settings.branding?.logo_url ||
    "https://www.svgrepo.com/show/42722/skincare.svg";
  const footerLinks = {
    Shop: parseFooterLinks(
      settings.footer?.shop_links,
      defaultFooterLinks.Shop,
    ),
    "Customer Care": parseFooterLinks(
      settings.footer?.customer_care_links,
      defaultFooterLinks["Customer Care"],
    ),
    About: parseFooterLinks(
      settings.footer?.about_links,
      defaultFooterLinks.About,
    ),
    Legal: parseFooterLinks(
      settings.footer?.legal_links,
      defaultFooterLinks.Legal,
    ),
  };

  return (
    <footer className="site-footer">
      <div className="footer-main homepage-container">
        <div className="footer-brand">
          <Link to="/" className="wordmark">
            <img className="brand-logo" src={logo} alt="Natural Beauty logo" />
          </Link>
          <p>
            {settings.footer?.tagline ||
              "Thoughtful skincare for everyday rituals."}
          </p>
          <span>Modern botanical care, made to feel simple and personal.</span>
          <div className="footer-socials">
            <a
              href={settings.footer?.instagram_url || "#"}
              aria-label="Natural Beauty on Instagram"
            >
              <SocialIcon name="instagram" />
            </a>
            <a
              href={settings.footer?.facebook_url || "#"}
              aria-label="Natural Beauty on Facebook"
            >
              <SocialIcon name="facebook" />
            </a>
            <a
              href={settings.footer?.youtube_url || "#"}
              aria-label="Natural Beauty on YouTube"
            >
              <SocialIcon name="youtube" />
            </a>
            <a
              href={settings.footer?.pinterest_url || "#"}
              aria-label="Natural Beauty on Pinterest"
            >
              <SocialIcon name="pinterest" />
            </a>
          </div>
        </div>
        <div className="footer-links">
          {Object.entries(footerLinks).map(([group, links]) => (
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
                  <Link
                    key={`${label}-${path}`}
                    to={path || routeMap[label] || "/about"}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="footer-contact">
          <p className="eyebrow">Customer care</p>
          <a
            href={`mailto:${settings.footer?.support_email || "hello@naturalbeauty.example"}`}
          >
            {settings.footer?.support_email || "hello@naturalbeauty.example"}
          </a>
          <a
            className="footer-contact-detail"
            href={`tel:${settings.footer?.support_phone || ""}`}
          >
            <Phone size={14} />
            {settings.footer?.support_phone || "Add support number"}
          </a>
          <span className="footer-contact-detail">
            <MapPin size={14} />
            {settings.footer?.location || "Bengaluru, Karnataka"}
          </span>
          <span>
            Mon–Sat
            <br />
            10:00 AM – 6:00 PM
          </span>
        </div>
      </div>
      <div className="footer-bottom homepage-container">
        <span>Secure payments</span>
        <span>
          UPI <i>•</i> Cards <i>•</i> Net Banking <i>•</i> COD
        </span>
        <span>© 2026 Natural Beauty</span>
      </div>
    </footer>
  );
}
