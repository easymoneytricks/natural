import React, { useEffect, useState } from "react";
import { Globe2, Image, LoaderCircle, Save, Settings2 } from "lucide-react";
import { useAuth } from "./main";

const defaults = {
  branding: {
    logo_url: "",
    footer_logo_url: "",
    favicon_url: "",
    announcement: "Complimentary shipping on orders above ₹999",
  },
  seo: {
    site_title: "Natural Beauty",
    meta_description: "Thoughtfully formulated skincare for everyday rituals.",
    og_image_url: "",
  },
  analytics: {
    enabled: "false",
    measurement_id: "",
  },
  shipping: {
    free_threshold: "999",
    default_rate: "149",
    processing_days: "1-2",
    delivery_days: "3-5",
  },
  tax: {
    enabled: "false",
    default_rate: "18",
    tax_label: "GST",
    pricing_mode: "exclusive",
    seller_state: "Karnataka",
    seller_gstin: "",
    seller_legal_name: "Natural Beauty",
    seller_address: "",
    seller_state_code: "29",
    reverse_charge: "false",
    hsn_sac: "",
    invoice_note: "Prices and taxes are shown as configured at checkout.",
  },
  homepage: {
    hero_eyebrow: "Botanical skincare · Modern science",
    hero_title: "Healthy skin, beautifully simple.",
    hero_description:
      "Thoughtful formulas for everyday concerns — designed to hydrate, restore and bring out your natural glow.",
    hero_image_url: "",
    primary_cta_label: "Shop bestsellers",
    primary_cta_url: "/best-sellers",
    secondary_cta_label: "Explore by concern",
    secondary_cta_url: "/concerns",
  },
  navigation: {
    header_links:
      "Shop|/shop\nSkin|/skin-types\nConcerns|/concerns\nCollections|/collections\nJournal|/journal\nAbout|/about",
  },
  footer: {
    tagline:
      "Thoughtful skincare for everyday rituals. Modern botanical care, made to feel simple and personal.",
    support_email: "hello@naturalbeauty.example",
    support_phone: "+91 98765 43210",
    footer_links:
      "FAQs|/faq\nShipping|/shipping\nReturns|/returns\nContact|/contact",
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    pinterest_url: "",
  },
  contact: {
    eyebrow: "We would love to hear from you",
    title: "Let’s make your routine feel simple.",
    intro:
      "Questions about a product, an order or finding your next formula? Our care team is here Monday–Saturday, 10:00 AM–6:00 PM.",
    email: "hello@naturalbeauty.example",
    phone: "+91 98765 43210",
    address_name: "Natural Beauty Studio",
    address_line: "Indiranagar, Bengaluru 560038",
    hours: "Monday–Saturday, 10:00 AM–6:00 PM",
    map_url:
      "https://www.openstreetmap.org/export/embed.html?bbox=77.625%2C12.965%2C77.645%2C12.985&layer=mapnik&marker=12.975%2C77.635",
  },
  store: {
    store_name: "Natural Beauty",
    currency: "INR",
    support_hours: "Mon–Sat · 10:00 AM–6:00 PM",
    maintenance_mode: "open",
  },
  smtp: {
    host: "",
    port: "587",
    username: "",
    password: "",
    from_email: "",
    from_name: "Natural Beauty",
    secure: "false",
  },
  homepage_sections: {
    hero: "true",
    trust: "true",
    concerns: "true",
    bestsellers: "true",
    skin_types: "true",
    brand_story: "true",
    ingredient: "true",
    principles: "true",
    ritual: "true",
    new_arrivals: "true",
    routine: "true",
    testimonials: "true",
    newsletter: "true",
  },
  payments: {
    enabled: "false",
    provider: "cashfree",
    mode: "sandbox",
  },
  recaptcha: {
    enabled: "false",
    site_key: "",
    secret_key: "",
  },
};

function Field({
  label,
  group,
  name,
  type = "text",
  state,
  setState,
  help,
  options,
}) {
  const value = state[group]?.[name] ?? "";
  const update = (next) =>
    setState((current) => ({
      ...current,
      [group]: { ...current[group], [name]: next },
    }));
  return (
    <label className="settings-field">
      {label}
      <div className="settings-input-wrap">
        {options ? (
          <select
            value={value}
            onChange={(event) => update(event.target.value)}
          >
            {options.map(([optionValue, optionLabel]) => (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(event) => update(event.target.value)}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(event) => update(event.target.value)}
          />
        )}
      </div>
      {help && <small>{help}</small>}
    </label>
  );
}

function SettingsGroup({ icon: Icon, title, description, children }) {
  return (
    <section className="card settings-group">
      <header>
        <div className="settings-group-icon">
          <Icon size={18} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="settings-fields">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const { authFetch } = useAuth();
  const [state, setState] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  useEffect(() => {
    authFetch("/admin/settings")
      .then((response) =>
        setState((current) =>
          Object.keys(defaults).reduce(
            (result, group) => ({
              ...result,
              [group]: { ...result[group], ...(response.data?.[group] || {}) },
            }),
            current,
          ),
        ),
      )
      .catch((caught) => setError(caught.message || "Unable to load settings."))
      .finally(() => setLoading(false));
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await authFetch("/admin/settings", { method: "PATCH", body: state });
      setNotice("Storefront settings saved successfully.");
    } catch (caught) {
      setError(caught.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };
  const sendTest = async () => {
    setTestingEmail(true);
    setNotice("");
    setError("");
    try {
      await authFetch("/system/email-test", {
        method: "POST",
        body: { recipient: testRecipient },
      });
      setNotice("SMTP test email sent successfully.");
    } catch (caught) {
      setError(caught.message || "SMTP test email could not be sent.");
    } finally {
      setTestingEmail(false);
    }
  };
  return (
    <div className="settings-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CONTROL CENTER / SETTINGS</span>
          <h1>Settings</h1>
          <p>
            Shape your storefront identity, content, commerce rules and customer
            touchpoints.
          </p>
        </div>
        <button type="submit" form="store-settings" disabled={saving}>
          <Save size={16} /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="catalog-state">
          <LoaderCircle className="spin" size={24} />
          <p>Loading storefront settings…</p>
        </div>
      ) : (
        <form id="store-settings" onSubmit={save} className="settings-form">
          <SettingsGroup
            icon={Image}
            title="Branding"
            description="Control the logo, favicon and announcement strip used across the storefront."
          >
            <Field
              label="Logo URL"
              group="branding"
              name="logo_url"
              state={state}
              setState={setState}
              help="Use a hosted image or a path from the media library."
            />
            <Field
              label="Favicon URL"
              group="branding"
              name="favicon_url"
              state={state}
              setState={setState}
            />
            <Field
              label="Footer logo URL"
              group="branding"
              name="footer_logo_url"
              state={state}
              setState={setState}
              help="Optional separate logo for the footer. Leave blank to reuse the header logo."
            />
            <Field
              label="Announcement message"
              group="branding"
              name="announcement"
              state={state}
              setState={setState}
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Globe2}
            title="SEO and sharing"
            description="Set the default metadata customers and search engines see."
          >
            <Field
              label="Site title"
              group="seo"
              name="site_title"
              state={state}
              setState={setState}
            />
            <Field
              label="Meta description"
              group="seo"
              name="meta_description"
              type="textarea"
              state={state}
              setState={setState}
            />
            <Field
              label="Social share image URL"
              group="seo"
              name="og_image_url"
              state={state}
              setState={setState}
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Globe2}
            title="Analytics"
            description="Connect Google Analytics 4 without loading it before visitor consent."
          >
            <Field
              label="Enable Google Analytics"
              group="analytics"
              name="enabled"
              state={state}
              setState={setState}
              options={[
                ["false", "Disabled"],
                ["true", "Enabled"],
              ]}
              help="The storefront still waits for optional analytics consent."
            />
            <Field
              label="GA4 Measurement ID"
              group="analytics"
              name="measurement_id"
              state={state}
              setState={setState}
              help="Example: G-XXXXXXXXXX"
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Globe2}
            title="Contact page"
            description="Control the customer-care details, address and map shown on the storefront contact page."
          >
            <Field
              label="Eyebrow"
              group="contact"
              name="eyebrow"
              state={state}
              setState={setState}
            />
            <Field
              label="Page title"
              group="contact"
              name="title"
              state={state}
              setState={setState}
            />
            <Field
              label="Intro"
              group="contact"
              name="intro"
              type="textarea"
              state={state}
              setState={setState}
            />
            <Field
              label="Support email"
              group="contact"
              name="email"
              type="email"
              state={state}
              setState={setState}
            />
            <Field
              label="Support phone"
              group="contact"
              name="phone"
              state={state}
              setState={setState}
            />
            <Field
              label="Address name"
              group="contact"
              name="address_name"
              state={state}
              setState={setState}
            />
            <Field
              label="Address line"
              group="contact"
              name="address_line"
              state={state}
              setState={setState}
            />
            <Field
              label="Support hours"
              group="contact"
              name="hours"
              state={state}
              setState={setState}
            />
            <Field
              label="Map embed URL"
              group="contact"
              name="map_url"
              state={state}
              setState={setState}
              help="Use a trusted map embed URL, not a regular map share page."
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Settings2}
            title="Commerce rules"
            description="Configure delivery, tax and day-to-day store defaults."
          >
            <Field
              label="Free shipping threshold (₹)"
              group="shipping"
              name="free_threshold"
              type="number"
              state={state}
              setState={setState}
            />
            <Field
              label="Default shipping rate (₹)"
              group="shipping"
              name="default_rate"
              type="number"
              state={state}
              setState={setState}
            />
            <Field
              label="Processing time"
              group="shipping"
              name="processing_days"
              state={state}
              setState={setState}
            />
            <Field
              label="Delivery estimate"
              group="shipping"
              name="delivery_days"
              state={state}
              setState={setState}
            />
            <Field
              label="Apply tax at checkout"
              group="tax"
              name="enabled"
              state={state}
              setState={setState}
              options={[
                ["false", "Disabled"],
                ["true", "Enabled"],
              ]}
              help="Keep disabled until your GST registration, rates and invoice review are approved."
            />
            <Field
              label="Default tax rate (%)"
              group="tax"
              name="default_rate"
              type="number"
              state={state}
              setState={setState}
            />
            <Field
              label="Tax label"
              group="tax"
              name="tax_label"
              state={state}
              setState={setState}
            />
            <Field
              label="Seller GSTIN"
              group="tax"
              name="seller_gstin"
              state={state}
              setState={setState}
            />
            <Field
              label="Legal business name"
              group="tax"
              name="seller_legal_name"
              state={state}
              setState={setState}
            />
            <Field
              label="Registered business address"
              group="tax"
              name="seller_address"
              type="textarea"
              state={state}
              setState={setState}
            />
            <Field
              label="Seller state code"
              group="tax"
              name="seller_state_code"
              state={state}
              setState={setState}
            />
            <Field
              label="Reverse charge"
              group="tax"
              name="reverse_charge"
              state={state}
              setState={setState}
              options={[
                ["false", "No"],
                ["true", "Yes"],
              ]}
            />
            <Field
              label="Tax pricing mode"
              group="tax"
              name="pricing_mode"
              state={state}
              setState={setState}
              options={[["exclusive", "Tax added at checkout"]]}
            />
            <Field
              label="Seller state"
              group="tax"
              name="seller_state"
              state={state}
              setState={setState}
              help="Used to split intra-state GST into CGST and SGST; other states use IGST."
            />
            <Field
              label="HSN / SAC code"
              group="tax"
              name="hsn_sac"
              state={state}
              setState={setState}
            />
            <Field
              label="Invoice note"
              group="tax"
              name="invoice_note"
              state={state}
              setState={setState}
            />
            <Field
              label="Currency"
              group="store"
              name="currency"
              state={state}
              setState={setState}
            />
            <Field
              label="Support hours"
              group="store"
              name="support_hours"
              state={state}
              setState={setState}
            />
            <Field
              label="Store availability"
              group="store"
              name="maintenance_mode"
              options={[
                ["open", "Open · customers can order"],
                ["closed", "Closed · browse only"],
                ["coming_soon", "Coming soon · browse only"],
              ]}
              state={state}
              setState={setState}
              help="Closed and Coming soon keep products visible but block checkout and order placement."
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Settings2}
            title="SMTP email delivery"
            description="Configure transactional order, contact and account emails. Credentials are stored server-side and never displayed publicly."
          >
            <Field
              label="SMTP host"
              group="smtp"
              name="host"
              state={state}
              setState={setState}
            />
            <Field
              label="SMTP port"
              group="smtp"
              name="port"
              type="number"
              state={state}
              setState={setState}
            />
            <Field
              label="SMTP username"
              group="smtp"
              name="username"
              state={state}
              setState={setState}
            />
            <Field
              label="SMTP password"
              group="smtp"
              name="password"
              type="password"
              state={state}
              setState={setState}
              help="Leave blank to keep the existing password."
            />
            <Field
              label="From email"
              group="smtp"
              name="from_email"
              type="email"
              state={state}
              setState={setState}
            />
            <Field
              label="From name"
              group="smtp"
              name="from_name"
              state={state}
              setState={setState}
            />
            <Field
              label="Secure connection"
              group="smtp"
              name="secure"
              state={state}
              setState={setState}
              help="Use true for SSL/TLS SMTP providers."
            />
            <label className="settings-field">
              Test recipient
              <div className="settings-input-wrap">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(event) => setTestRecipient(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="button"
                className="button-secondary settings-test-button"
                disabled={testingEmail || !testRecipient}
                onClick={sendTest}
              >
                {testingEmail ? "Sending…" : "Send test email"}
              </button>
            </label>
          </SettingsGroup>
          <SettingsGroup
            icon={Settings2}
            title="Payment gateway"
            description="Enable Cashfree after adding the server-side credentials to backend/.env. Never place secret keys in the browser."
          >
            <Field
              label="Enable online payments"
              group="payments"
              name="enabled"
              state={state}
              setState={setState}
              help="Set true only after CASHFREE_ENABLED=true and valid keys are configured on the server."
            />
            <Field
              label="Provider"
              group="payments"
              name="provider"
              state={state}
              setState={setState}
              help="Cashfree is the supported online provider in this integration."
            />
            <Field
              label="Gateway mode"
              group="payments"
              name="mode"
              state={state}
              setState={setState}
              help="Use sandbox while testing and production only for live credentials."
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Settings2}
            title="reCAPTCHA v2 protection"
            description="Protect signup and contact submissions with Google's checkbox challenge. The secret key stays server-side."
          >
            <Field
              label="Enable reCAPTCHA"
              group="recaptcha"
              name="enabled"
              state={state}
              setState={setState}
              help="Set true only after adding a reCAPTCHA v2 Checkbox site key and secret key."
            />
            <Field
              label="Site key"
              group="recaptcha"
              name="site_key"
              state={state}
              setState={setState}
              help="Public key displayed in the storefront checkbox."
            />
            <Field
              label="Secret key"
              group="recaptcha"
              name="secret_key"
              type="password"
              state={state}
              setState={setState}
              help="Private Google verification key. Leave blank to keep the saved key."
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Globe2}
            title="Homepage hero and calls to action"
            description="Update the first impression without changing code."
          >
            <Field
              label="Eyebrow"
              group="homepage"
              name="hero_eyebrow"
              state={state}
              setState={setState}
            />
            <Field
              label="Hero title"
              group="homepage"
              name="hero_title"
              state={state}
              setState={setState}
            />
            <Field
              label="Hero description"
              group="homepage"
              name="hero_description"
              type="textarea"
              state={state}
              setState={setState}
            />
            <Field
              label="Hero image URL"
              group="homepage"
              name="hero_image_url"
              state={state}
              setState={setState}
            />
            <Field
              label="Primary CTA label"
              group="homepage"
              name="primary_cta_label"
              state={state}
              setState={setState}
            />
            <Field
              label="Primary CTA URL"
              group="homepage"
              name="primary_cta_url"
              state={state}
              setState={setState}
            />
            <Field
              label="Secondary CTA label"
              group="homepage"
              name="secondary_cta_label"
              state={state}
              setState={setState}
            />
            <Field
              label="Secondary CTA URL"
              group="homepage"
              name="secondary_cta_url"
              state={state}
              setState={setState}
            />
          </SettingsGroup>
          <SettingsGroup
            icon={Settings2}
            title="Homepage section visibility"
            description="Choose which homepage sections are visible. Use true or false for each section."
          >
            {Object.entries(defaults.homepage_sections).map(([name]) => (
              <Field
                key={name}
                label={name.replaceAll("_", " ")}
                group="homepage_sections"
                name={name}
                state={state}
                setState={setState}
              />
            ))}
          </SettingsGroup>
          <SettingsGroup
            icon={Globe2}
            title="Header and footer navigation"
            description="Maintain visible menu labels and customer-care links."
          >
            <Field
              label="Header links"
              group="navigation"
              name="header_links"
              type="textarea"
              state={state}
              setState={setState}
              help="One link per line in the format Label|/path."
            />
            <Field
              label="Footer tagline"
              group="footer"
              name="tagline"
              type="textarea"
              state={state}
              setState={setState}
            />
            <Field
              label="Footer links"
              group="footer"
              name="footer_links"
              type="textarea"
              state={state}
              setState={setState}
              help="One link per line in the format Label|/path."
            />
            <Field
              label="Instagram URL"
              group="footer"
              name="instagram_url"
              state={state}
              setState={setState}
              placeholder="https://instagram.com/yourbrand"
            />
            <Field
              label="Facebook URL"
              group="footer"
              name="facebook_url"
              state={state}
              setState={setState}
              placeholder="https://facebook.com/yourbrand"
            />
            <Field
              label="YouTube URL"
              group="footer"
              name="youtube_url"
              state={state}
              setState={setState}
              placeholder="https://youtube.com/@yourbrand"
            />
            <Field
              label="Pinterest URL"
              group="footer"
              name="pinterest_url"
              state={state}
              setState={setState}
              placeholder="https://pinterest.com/yourbrand"
            />
            <Field
              label="Support email"
              group="footer"
              name="support_email"
              state={state}
              setState={setState}
            />
            <Field
              label="Support phone"
              group="footer"
              name="support_phone"
              state={state}
              setState={setState}
            />
          </SettingsGroup>
        </form>
      )}
    </div>
  );
}
