import React, { useEffect, useState } from "react";
import {
  Globe2,
  Image,
  LoaderCircle,
  Menu,
  Save,
  Settings2,
} from "lucide-react";
import { Fragment } from "react";
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
  mega_menu: {
    shop: `Shop by category :: Cleansers, Toners & Mists, Serums, Moisturizers, Sunscreens, Masks & Treatments, Eye Care, Lip Care
Shop edits :: New Arrivals, Best Sellers, Daily Essentials, Travel Essentials, Gift Sets, Shop All
feature|The Barrier Edit|Comforting hydration for stressed, dry skin.|Explore collection|https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80`,
    skin: `Shop by skin type :: Normal Skin, Dry Skin, Oily Skin, Combination Skin, Sensitive Skin, Acne-Prone Skin
Find your routine :: Morning Essentials, Night Routine, Hydration Routine, Barrier Repair, Beginner Routine
feature|Not sure about your skin type?|Find products designed around your skin's needs.|Explore skin guide|https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80`,
    concerns: `Shop by concern :: Acne & Breakouts, Dark Spots, Pigmentation, Dryness, Dullness, Fine Lines, Uneven Texture, Redness, Oil Control, Dehydration, Sun Protection, Damaged Skin Barrier
Popular solutions :: Brightening, Deep Hydration, Barrier Support, Clarifying Care, Age Support
feature|Care with intention|Thoughtful formulas for every skin concern.|Discover solutions|https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80`,
    collections: `Curated collections :: Glow Essentials, Clear Skin Edit, Barrier Repair, Hydration Heroes, Sun Defence, Night Renewal
feature|Rituals worth keeping|Curated for the moments your skin needs most.|View all collections|https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80`,
  },
  footer: {
    tagline:
      "Thoughtful skincare for everyday rituals. Modern botanical care, made to feel simple and personal.",
    support_email: "hello@naturalbeauty.example",
    support_phone: "+91 98765 43210",
    location: "Bengaluru, Karnataka",
    footer_links:
      "FAQs|/faq\nShipping|/shipping\nReturns|/returns\nContact|/contact",
    shop_links:
      "Shop All|/shop\nNew Arrivals|/new-arrivals\nBest Sellers|/best-sellers\nSkin Types|/skin-types\nConcerns|/concerns\nGift Cards|/gift-cards",
    customer_care_links:
      "Contact Us|/contact\nFAQs|/faq\nShipping|/shipping\nReturns & Refunds|/returns\nTrack Order|/track-order\nMy Account|/account",
    about_links:
      "Our Story|/about\nIngredients|/about\nJournal|/journal\nContact|/contact",
    legal_links:
      "Privacy Policy|/privacy\nTerms & Conditions|/terms\nShipping Policy|/shipping\nReturn Policy|/returns\nRefund Policy|/refund-policy\nCancellation Policy|/cancellation-policy",
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
  homepage_positions: {
    hero: "1",
    trust: "2",
    concerns: "3",
    bestsellers: "4",
    skin_types: "5",
    brand_story: "6",
    ingredient: "7",
    principles: "8",
    ritual: "9",
    new_arrivals: "10",
    routine: "11",
    testimonials: "12",
    newsletter: "13",
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

const rewardDefaults = {
  enabled: "true",
  points_per_rupee: "0.1",
  rupees_per_point: "0.1",
  min_points_to_redeem: "100",
  max_redemption_percent: "20",
  expiry_enabled: "false",
  expiry_days: "365",
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
  placeholder,
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
            placeholder={placeholder}
          />
        )}
      </div>
      {help && <small>{help}</small>}
    </label>
  );
}

function RewardField({ rewardState, setRewardField, ...props }) {
  return (
    <Field
      {...props}
      group="reward"
      state={{ reward: rewardState }}
      setState={setRewardField}
    />
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
  const [rewardState, setRewardState] = useState(rewardDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [activeSection, setActiveSection] = useState("storefront");
  useEffect(() => {
    Promise.all([
      authFetch("/admin/settings"),
      authFetch("/admin/rewards/config"),
    ])
      .then(([response, rewardResponse]) => {
        setState((current) =>
          Object.keys(defaults).reduce(
            (result, group) => ({
              ...result,
              [group]: { ...result[group], ...(response.data?.[group] || {}) },
            }),
            current,
          ),
        );
        const reward = rewardResponse.data || {};
        setRewardState({
          enabled: String(Boolean(Number(reward.enabled))),
          points_per_rupee: String(
            reward.points_per_rupee ?? rewardDefaults.points_per_rupee,
          ),
          rupees_per_point: String(
            reward.rupees_per_point ?? rewardDefaults.rupees_per_point,
          ),
          min_points_to_redeem: String(
            reward.min_points_to_redeem ?? rewardDefaults.min_points_to_redeem,
          ),
          max_redemption_percent: String(
            reward.max_redemption_percent ??
              rewardDefaults.max_redemption_percent,
          ),
          expiry_enabled: String(Boolean(Number(reward.expiry_enabled))),
          expiry_days: String(reward.expiry_days ?? rewardDefaults.expiry_days),
        });
      })
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
      await authFetch("/admin/rewards/config", {
        method: "PATCH",
        body: {
          enabled: rewardState.enabled,
          pointsPerRupee: rewardState.points_per_rupee,
          rupeesPerPoint: rewardState.rupees_per_point,
          minPointsToRedeem: rewardState.min_points_to_redeem,
          maxRedemptionPercent: rewardState.max_redemption_percent,
          expiryEnabled: rewardState.expiry_enabled,
          expiryDays: rewardState.expiry_days,
        },
      });
      setNotice("Storefront settings saved successfully.");
    } catch (caught) {
      setError(caught.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };
  const setRewardField = (update) =>
    setRewardState((current) => update({ reward: current }).reward);
  const sendTest = async () => {
    setTestingEmail(true);
    setNotice("");
    setError("");
    try {
      await authFetch("/admin/system/email-test", {
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
          <nav className="settings-section-tabs" aria-label="Settings sections">
            {[
              ["storefront", "Storefront", "Branding, SEO and content"],
              ["commerce", "Commerce", "Shipping, tax and payments"],
              ["communications", "Communications", "Email and security"],
              ["homepage", "Homepage", "Hero, sections and navigation"],
              ["rewards", "Rewards", "Points, value and expiry"],
            ].map(([value, label, description]) => (
              <button
                key={value}
                type="button"
                className={activeSection === value ? "is-active" : ""}
                aria-selected={activeSection === value}
                onClick={() => setActiveSection(value)}
              >
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </nav>
          {activeSection === "storefront" && (
            <div className="settings-tab-panel">
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
                  placeholder="https://… (recommended: 240 × 64 px, transparent PNG/SVG)"
                  help="Recommended: 240 × 64 px with transparent background for a crisp header logo."
                />
                <Field
                  label="Favicon URL"
                  group="branding"
                  name="favicon_url"
                  state={state}
                  setState={setState}
                  placeholder="https://… (recommended: 48 × 48 px PNG/ICO)"
                  help="Recommended: square 48 × 48 px PNG or ICO."
                />
                <Field
                  label="Footer logo URL"
                  group="branding"
                  name="footer_logo_url"
                  state={state}
                  setState={setState}
                  placeholder="https://… (recommended: 240 × 64 px, transparent PNG/SVG)"
                  help="Recommended: 240 × 64 px transparent logo; leave blank to reuse the header logo."
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
                icon={Menu}
                title="Mega menu content"
                description="Control each dropdown's columns and feature card. Keep one column per line using Title :: Link 1, Link 2, then add a feature line."
              >
                {[
                  ["Shop mega menu", "shop"],
                  ["Skin mega menu", "skin"],
                  ["Concerns mega menu", "concerns"],
                  ["Collections mega menu", "collections"],
                ].map(([label, name]) => (
                  <Field
                    key={name}
                    label={label}
                    group="mega_menu"
                    name={name}
                    type="textarea"
                    state={state}
                    setState={setState}
                    help="Column format: Heading :: Link 1, Link 2. Feature format: feature|Title|Description|CTA|Image URL."
                  />
                ))}
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
            </div>
          )}
          {activeSection === "commerce" && (
            <div className="settings-tab-panel">
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
                  label="Business name"
                  group="store"
                  name="store_name"
                  state={state}
                  setState={setState}
                  help="Used across the admin panel, storefront branding and SEO titles."
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
            </div>
          )}
          {activeSection === "rewards" && (
            <div className="settings-tab-panel">
              <SettingsGroup
                icon={Settings2}
                title="Reward points"
                description="Decide how customers earn, redeem and retain reward points."
              >
                <RewardField
                  label="Enable reward points"
                  name="enabled"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                  options={[
                    ["true", "Enabled"],
                    ["false", "Disabled"],
                  ]}
                  help="Pause earning and redemption without removing existing balances."
                />
                <RewardField
                  label="Points earned per ₹1 spent"
                  name="points_per_rupee"
                  type="number"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                  help="Example: 0.1 gives 10 points on a ₹100 order."
                />
                <RewardField
                  label="Value of 1 point (₹)"
                  name="rupees_per_point"
                  type="number"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                  help="Used to calculate the checkout discount."
                />
                <RewardField
                  label="Minimum points to redeem"
                  name="min_points_to_redeem"
                  type="number"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                />
                <RewardField
                  label="Maximum order discount (%)"
                  name="max_redemption_percent"
                  type="number"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                />
                <RewardField
                  label="Expire unused points"
                  name="expiry_enabled"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                  options={[
                    ["false", "Never expire"],
                    ["true", "Expire automatically"],
                  ]}
                />
                <RewardField
                  label="Expiry period (days)"
                  name="expiry_days"
                  type="number"
                  rewardState={rewardState}
                  setRewardField={setRewardField}
                  help="Applied when expiry is enabled."
                />
              </SettingsGroup>
            </div>
          )}
          {activeSection === "communications" && (
            <div className="settings-tab-panel">
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
                  options={[
                    ["true", "Yes — use SSL/TLS"],
                    ["false", "No — use STARTTLS/plain"],
                  ]}
                  help="Choose Yes for secure SSL/TLS connections such as SMTP port 465."
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
                  options={[
                    ["true", "Enabled"],
                    ["false", "Disabled"],
                  ]}
                  help="Enable after CASHFREE_ENABLED=true and valid keys are configured on the server."
                />
                <Field
                  label="Provider"
                  group="payments"
                  name="provider"
                  state={state}
                  setState={setState}
                  options={[
                    ["cashfree", "Cashfree"],
                    ["razorpay", "Razorpay"],
                  ]}
                  help="Choose the provider whose server credentials are configured in backend/.env."
                />
                <Field
                  label="Gateway mode"
                  group="payments"
                  name="mode"
                  state={state}
                  setState={setState}
                  options={[
                    ["sandbox", "Sandbox — testing"],
                    ["production", "Production — live payments"],
                  ]}
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
                  options={[
                    ["true", "Enabled"],
                    ["false", "Disabled"],
                  ]}
                  help="Enable after adding a reCAPTCHA v2 Checkbox site key and secret key."
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
            </div>
          )}
          {activeSection === "homepage" && (
            <div className="settings-tab-panel">
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
                  placeholder="https://… (recommended: 1600 × 700 px landscape)"
                  help="Recommended: 1600 × 700 px landscape image (roughly 2.3:1) for desktop and mobile crops."
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
                title="Homepage sections"
                description="Choose visibility and display position for each homepage section."
              >
                {Object.entries(defaults.homepage_sections).map(([name]) => (
                  <Fragment key={name}>
                    <Field
                      label={`${name.replaceAll("_", " ")} visibility`}
                      group="homepage_sections"
                      name={name}
                      options={[
                        ["true", "Enabled"],
                        ["false", "Disabled"],
                      ]}
                      state={state}
                      setState={setState}
                    />
                    <Field
                      label={`${name.replaceAll("_", " ")} position`}
                      group="homepage_positions"
                      name={name}
                      options={Array.from({ length: 13 }, (_, index) => [
                        String(index + 1),
                        `Position ${index + 1}`,
                      ])}
                      state={state}
                      setState={setState}
                    />
                  </Fragment>
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
                  label="Footer column 2 — Shop"
                  group="footer"
                  name="shop_links"
                  type="textarea"
                  state={state}
                  setState={setState}
                  help="One link per line in the format Label|/path."
                />
                <Field
                  label="Footer column 3 — Customer Care"
                  group="footer"
                  name="customer_care_links"
                  type="textarea"
                  state={state}
                  setState={setState}
                  help="One link per line in the format Label|/path."
                />
                <Field
                  label="Footer column 4 — About"
                  group="footer"
                  name="about_links"
                  type="textarea"
                  state={state}
                  setState={setState}
                  help="One link per line in the format Label|/path."
                />
                <Field
                  label="Footer column 5 — Legal"
                  group="footer"
                  name="legal_links"
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
                <Field
                  label="Store location"
                  group="footer"
                  name="location"
                  state={state}
                  setState={setState}
                  placeholder="Bengaluru, Karnataka"
                />
              </SettingsGroup>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
