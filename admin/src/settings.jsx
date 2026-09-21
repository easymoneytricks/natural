import React, { useEffect, useState } from "react";
import {
  Globe2,
  Image,
  LoaderCircle,
  Menu,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import { Fragment } from "react";
import { useAuth } from "./main";

const defaults = {
  branding: {
    logo_url: "",
    footer_logo_url: "",
    auth_image_url: "",
    favicon_url: "",
    announcement: "Complimentary shipping on orders above ₹999",
    announcement_secondary: "Thoughtfully made products",
    announcement_tertiary: "Secure checkout",
  },
  seo: {
    site_title: "Your store",
    meta_description: "Thoughtfully made products for everyday use.",
    keywords: "quality products, everyday essentials, considered shopping",
    og_image_url: "",
    robots: "index,follow",
    google_site_verification: "",
  },
  analytics: {
    enabled: "false",
    measurement_id: "",
  },
  shipping: {
    mode: "fixed",
    free_threshold: "999",
    default_rate: "149",
    weight_slabs:
      '[{"up_to_grams":500,"rate":79},{"up_to_grams":1000,"rate":99},{"up_to_grams":2000,"rate":149}]',
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
    seller_legal_name: "Your store",
    seller_address: "",
    seller_state_code: "29",
    reverse_charge: "false",
    hsn_sac: "",
    invoice_note: "Prices and taxes are shown as configured at checkout.",
  },
  homepage: {
    hero_eyebrow: "Thoughtful products · Modern design",
    hero_title: "Healthy skin, beautifully simple.",
    hero_description:
      "Thoughtful products for everyday needs — designed to be useful, clear and easy to enjoy.",
    hero_image_url: "",
    primary_cta_label: "Shop bestsellers",
    primary_cta_url: "/best-sellers",
    secondary_cta_label: "Explore by concern",
    secondary_cta_url: "/concerns",
    hero_proof: "",
    hero_ritual_title: "",
    hero_ritual_text: "",
    hero_image_alt: "",
    category_eyebrow: "Explore the collection",
    category_title: "Shop by product group.",
    category_description: "Browse products by the way you like to shop.",
    category_link_label: "Explore all groups",
    category_link_url: "/shop",
    groups_eyebrow: "Find your fit",
    groups_title: "Shop By Categories",
    groups_description:
      "Explore products grouped around the needs and preferences that matter to you.",
    groups_link_label: "Explore all groups",
    groups_link_url: "/shop",
    brand_eyebrow: "Our philosophy",
    brand_title: "Purpose, refined through thoughtful design.",
    brand_description:
      "We believe products should feel considered, uncomplicated and personal.",
    brand_link_label: "Discover our story",
    brand_link_url: "/about",
    brand_image_url: "local:hero",
    brand_image_alt: "Products in soft natural light",
    brand_note_title: "Designed with purpose",
    brand_note_text: "Designed around skin needs, texture and everyday usability.",
    ingredients_eyebrow: "Details with intention",
    ingredients_title: "Details that make a difference.",
    ingredients_description:
      "Explore the qualities and benefits behind each product.",
    ingredients_image_url: "local:hero",
    ingredients_image_alt: "Products and materials arranged for a considered routine",
    highlight_1_title: "Vitamin C",
    highlight_1_text: "For brighter-looking, more radiant skin",
    highlight_2_title: "Niacinamide",
    highlight_2_text: "Supports balance and smoother-looking texture",
    highlight_3_title: "Hyaluronic Acid",
    highlight_3_text: "Helps maintain skin hydration",
    highlight_4_title: "Ceramides",
    highlight_4_text: "Supports the skin's moisture barrier",
    highlight_5_title: "Salicylic Acid",
    highlight_5_text: "Helps clarify congested-looking skin",
    highlight_6_title: "Retinol",
    highlight_6_text: "Supports smoother, renewed-looking skin",
    principles_title: "Principles",
    principle_1_title: "Purposeful products",
    principle_1_text: "Every product starts with a clear role in your routine.",
    principle_2_title: "Routine-first design",
    principle_2_text: "Products made to work naturally within everyday routines.",
    principle_3_title: "Considered experience",
    principle_3_text:
      "Usability and presentation matter as much as the product story.",
    ritual_eyebrow: "The daily edit",
    ritual_title: "Small choices.\nBeautiful consistency.",
    ritual_description:
      "Build a simple routine for morning, evening and everything in between.",
    ritual_link_label: "Build your routine",
    ritual_link_url: "/shop",
    ritual_image_url: "local:hero",
    ritual_image_alt: "A calm product arrangement in natural light",
    new_eyebrow: "Just in",
    new_title: "New to the collection",
    new_description:
      "Fresh additions designed to find an easy place in your everyday routine.",
    new_link_label: "Shop new arrivals",
    new_link_url: "/new-arrivals",
    routine_eyebrow: "Find your routine",
    routine_title: "Your products.\nYour preferences.\nYour choice.",
    routine_description:
      "Start with what you need today and discover products that fit naturally into your routine.",
    routine_step_1: "Choose a product group",
    routine_step_2: "Choose your preference",
    routine_step_3: "Discover your selection",
    routine_link_label: "Explore products",
    routine_link_url: "/shop",
    routine_secondary_label: "Shop all products",
    routine_secondary_url: "/shop",
    routine_image_url: "local:hero",
    routine_image_alt: "Unbranded products arranged on natural stone",
    testimonials_eyebrow: "Notes from our customers",
    testimonial_1_name: "Aanya Mehta",
    testimonial_1_product: "Barrier Restore Moisturizer",
    testimonial_1_quote:
      "The Barrier Restore Moisturizer became the easiest part of my evening routine. The texture feels rich without feeling heavy.",
    testimonial_2_name: "Riya Kapoor",
    testimonial_2_product: "Vitamin C Radiance Serum",
    testimonial_2_quote:
      "I love how simple the routine feels. The Vitamin C serum layers beautifully under sunscreen in the morning.",
    testimonial_3_name: "Meera Sharma",
    testimonial_3_product: "Gentle Barrier Cleanser",
    testimonial_3_quote:
      "The cleanser and moisturizer combination feels gentle and uncomplicated, which is exactly what I wanted from my routine.",
    testimonial_4_name: "Sara Khan",
    testimonial_4_product: "Niacinamide Balance Serum",
    testimonial_4_quote:
      "The website made it surprisingly easy to browse by concern instead of guessing which product I should start with.",
    newsletter_eyebrow: "The store note",
    newsletter_title: "A little more care,\ndelivered to your inbox.",
    newsletter_description:
      "New products, useful notes, early access and occasional offers — without the noise.",
    newsletter_label: "Your email address",
    newsletter_placeholder: "Your email address",
    newsletter_button_label: "Join the list",
    newsletter_submitting_label: "Joining…",
    newsletter_privacy:
      "By subscribing, you agree to receive store updates. You can unsubscribe at any time.",
    newsletter_success:
      "You’re on the list. Welcome to the store note.",
    featured_eyebrow: "Most loved",
    featured_title: "The best of our store",
    featured_description:
      "Customer favourites selected from the full collection.",
    featured_link_label: "View all products",
    featured_link_url: "/shop",
  },
  trust: {
    item_1_title: "Thoughtful products",
    item_1_text: "Made for everyday use",
    item_2_title: "Skin-first care",
    item_2_text: "Solutions organized around your needs",
    item_3_title: "Secure checkout",
    item_3_text: "Protected and straightforward",
    item_4_title: "Complimentary shipping",
    item_4_text: "On orders above ₹999",
  },
  navigation: {
    header_links:
      "Shop|/shop\nSkin|/skin-types\nConcerns|/concerns\nCollections|/collections\nJournal|/journal\nAbout|/about",
  },
  search: {
    eyebrow: "Search",
    placeholder: "Search products, categories and collections...",
    quick_links:
      "New arrivals\nTop selling\nEveryday essentials\nGift ideas\nBest sellers",
  },
  shop: {
    eyebrow: "The collection",
    title: "Products, considered.",
    description: "Explore products by category, attributes and everyday needs.",
    search_placeholder: "Search within the collection",
    result_product_label: "product",
    result_products_label: "products",
    filter_category_title: "Category",
    filter_brand_title: "Brand",
    filter_price_title: "Price",
    filter_availability_title: "Availability",
  },
  mega_menu: {
    shop: `Shop by category :: Cleansers, Toners & Mists, Serums, Moisturizers, Sunscreens, Masks & Treatments, Eye Care, Lip Care
Shop edits :: New Arrivals, Best Sellers, Daily Essentials, Travel Essentials, Gift Sets, Shop All
feature|The Barrier Edit|Comforting hydration for stressed, dry skin.|Explore collection|https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80`,
    skin: `Shop by type :: New arrivals, Best sellers, Everyday essentials, Seasonal picks
Shop collections :: Featured edit, Daily essentials, Limited edition, Gift sets
feature|Find your favourites|Curated products for every style and routine.|Explore collection|https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80`,
    concerns: `Shop by need :: Trending now, New in, Best sellers, Everyday essentials
Popular picks :: Staff favourites, Gift ideas, Limited edition, Value sets
feature|Made for your routine|Thoughtful products for the moments that matter.|Discover products|https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80`,
    collections: `Curated collections :: Glow Essentials, Clear Skin Edit, Barrier Repair, Hydration Heroes, Sun Defence, Night Renewal
feature|Rituals worth keeping|Curated for the moments your skin needs most.|View all collections|https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80`,
  },
  footer: {
    tagline:
      "Thoughtful products for everyday use, made to feel simple and personal.",
    tagline_secondary:
      "Modern botanical care, made to feel simple and personal.",
    shop_title: "Shop",
    customer_care_title: "Customer Care",
    about_title: "About",
    legal_title: "Legal",
    mobile_guidance_title: "Need a little guidance?",
    mobile_guidance_text: "Speak with our team",
    support_email: "support@example.com",
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
    twitter_url: "",
    payment_methods: "UPI · Cards · Net Banking · COD",
    copyright_text: "© 2026",
  },
  contact: {
    eyebrow: "We would love to hear from you",
    title: "Let’s make your routine feel simple.",
    intro:
      "Questions about a product or an order? Our support team is here Monday–Saturday, 10:00 AM–6:00 PM.",
    email: "support@example.com",
    phone: "+91 98765 43210",
    phone_secondary: "",
    address_name: "Store support",
    address_line: "Indiranagar, Bengaluru 560038",
    cta_label: "Explore products",
    cta_url: "/shop",
    form_eyebrow: "Customer care",
    form_title: "How can we help?",
    form_description: "Send us a note and our team will get back to you shortly.",
    name_label: "Name",
    name_placeholder: "Your name",
    email_label: "Email",
    email_placeholder: "you@example.com",
    order_label: "Order number",
    order_optional_label: "(optional)",
    order_placeholder: "NB-2026-0000",
    message_label: "Message",
    message_placeholder: "How can we help?",
    submit_label: "Send message",
    submitting_label: "Sending…",
    sent_label: "Message sent",
    map_title: "Store location",
    hours: "Monday–Saturday, 10:00 AM–6:00 PM",
    map_url:
      "https://www.openstreetmap.org/export/embed.html?bbox=77.625%2C12.965%2C77.645%2C12.985&layer=mapnik&marker=12.975%2C77.635",
  },
  store: {
    store_name: "Your store",
    currency: "INR",
    support_hours: "Mon–Sat · 10:00 AM–6:00 PM",
    maintenance_mode: "open",
    availability_title: "We are getting ready",
    availability_message:
      "Our store will be available soon. Please check back shortly.",
    availability_countdown: "",
    closed_message:
      "Ordering is temporarily paused · You can still browse our products.",
    maintenance_title: "We will be back shortly",
    maintenance_message:
      "We are making a few improvements. Please check back soon.",
  },
  smtp: {
    host: "",
    port: "587",
    username: "",
    password: "",
    from_email: "",
    from_name: "Your store",
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
  homepage_limits: {
    featured_products_desktop: "4",
    featured_products_mobile: "2",
    new_products_desktop: "4",
    new_products_mobile: "2",
    category_highlights_desktop: "5",
    category_highlights_mobile: "2",
    product_groups_desktop: "5",
    product_groups_mobile: "2",
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
  min,
  max,
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
            min={min}
            max={max}
          />
        )}
      </div>
      {help && <small>{help}</small>}
    </label>
  );
}

const menuTargetOptions = [
  ["", "Choose destination"],
  ["/shop?sort=newest", "New arrivals"],
  ["/shop?sort=best-selling", "Best sellers"],
  ["/shop", "All products"],
  ["/shop?category=cleansers", "Cleansers"],
  ["/shop?category=serums", "Serums"],
  ["/shop?category=moisturizers", "Moisturizers"],
  ["/shop?skin=dry", "Dry skin"],
  ["/shop?skin=oily", "Oily skin"],
  ["/shop?concern=acne-and-breakouts", "Acne & breakouts"],
];

const normalizeMenu = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.toLowerCase().startsWith("feature|"))
    .map((line) => {
      const separator = line.indexOf("::");
      if (separator < 0) return null;
      const title = line.slice(0, separator).trim();
      const links = line
        .slice(separator + 2)
        .split(",")
        .map((link) => {
          const pipe = link.indexOf("|");
          return {
            label: (pipe > 0 ? link.slice(0, pipe) : link).trim(),
            target: pipe > 0 ? link.slice(pipe + 1).trim() : "",
          };
        })
        .filter((link) => link.label);
      return title && links.length ? { title, links } : null;
    })
    .filter(Boolean);
};

function MegaMenuEditor({ name, state, setState }) {
  const columns = normalizeMenu(state.mega_menu?.[name]);
  const update = (next) =>
    setState((current) => ({
      ...current,
      mega_menu: { ...current.mega_menu, [name]: next },
    }));
  const patchColumn = (index, patch) =>
    update(
      columns.map((column, i) =>
        i === index ? { ...column, ...patch } : column,
      ),
    );
  const moveColumn = (from, to) => {
    if (to < 0 || to >= columns.length) return;
    const next = [...columns];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };
  return (
    <div className="mega-menu-editor">
      {columns.map((column, columnIndex) => (
        <fieldset key={`${name}-${columnIndex}`} className="settings-fieldset">
          <legend>Column {columnIndex + 1}</legend>
          <input
            value={column.title}
            placeholder="Column title"
            onChange={(event) =>
              patchColumn(columnIndex, { title: event.target.value })
            }
          />
          <div className="mega-editor-actions">
            <button
              type="button"
              onClick={() => moveColumn(columnIndex, columnIndex - 1)}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveColumn(columnIndex, columnIndex + 1)}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() =>
                update(columns.filter((_, i) => i !== columnIndex))
              }
            >
              Remove column
            </button>
          </div>
          {column.links.map((link, linkIndex) => (
            <div
              className="mega-editor-link"
              key={`${columnIndex}-${linkIndex}`}
            >
              <input
                value={link.label}
                placeholder="Link label"
                onChange={(event) => {
                  const links = column.links.map((item, i) =>
                    i === linkIndex
                      ? { ...item, label: event.target.value }
                      : item,
                  );
                  patchColumn(columnIndex, { links });
                }}
              />
              <select
                value={
                  menuTargetOptions.some(([target]) => target === link.target)
                    ? link.target
                    : ""
                }
                onChange={(event) => {
                  const links = column.links.map((item, i) =>
                    i === linkIndex
                      ? { ...item, target: event.target.value }
                      : item,
                  );
                  patchColumn(columnIndex, { links });
                }}
              >
                {menuTargetOptions.map(([target, label]) => (
                  <option key={target} value={target}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={link.target}
                placeholder="Custom URL, e.g. /shop?category=serums"
                onChange={(event) => {
                  const links = column.links.map((item, i) =>
                    i === linkIndex
                      ? { ...item, target: event.target.value }
                      : item,
                  );
                  patchColumn(columnIndex, { links });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  patchColumn(columnIndex, {
                    links: column.links.filter((_, i) => i !== linkIndex),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patchColumn(columnIndex, {
                links: [
                  ...column.links,
                  { label: "New link", target: "/shop" },
                ],
              })
            }
          >
            + Add link
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() =>
          update([
            ...columns,
            {
              title: "New column",
              links: [{ label: "New link", target: "/shop" }],
            },
          ])
        }
      >
        + Add column
      </button>
    </div>
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
  const [catalogAttributes, setCatalogAttributes] = useState([]);
  const [attributeDraft, setAttributeDraft] = useState({ name: "", displayType: "button", isVariantAxis: true });
  const [valueDrafts, setValueDrafts] = useState({});
  const [attributeSaving, setAttributeSaving] = useState(false);
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
  useEffect(() => {
    if (activeSection !== "catalog") return;
    authFetch("/admin/catalog-attributes")
      .then((response) => setCatalogAttributes(response.data || []))
      .catch((caught) => setError(caught.message || "Unable to load attributes."));
  }, [activeSection]);
  const createCatalogAttribute = async () => {
    if (!attributeDraft.name.trim()) return;
    setAttributeSaving(true); setError("");
    try {
      const response = await authFetch("/admin/catalog-attributes", { method: "POST", body: attributeDraft });
      setCatalogAttributes((current) => [...current, response.data]);
      setAttributeDraft({ name: "", displayType: "button", isVariantAxis: true });
      setNotice("Attribute created.");
    } catch (caught) { setError(caught.message || "Unable to create attribute."); }
    finally { setAttributeSaving(false); }
  };
  const createCatalogValue = async (attributeId) => {
    const draft = valueDrafts[attributeId] || { value: "", colorHex: "#dfe9df" };
    if (!draft.value.trim()) return;
    setAttributeSaving(true); setError("");
    try {
      const response = await authFetch(`/admin/catalog-attributes/${attributeId}/values`, { method: "POST", body: draft });
      setCatalogAttributes((current) => current.map((item) => Number(item.id) === Number(attributeId) ? response.data : item));
      setValueDrafts((current) => ({ ...current, [attributeId]: "" }));
      setNotice("Attribute value created.");
    } catch (caught) { setError(caught.message || "Unable to create value."); }
    finally { setAttributeSaving(false); }
  };
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
      setNotice("Settings saved successfully.");
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
              ["storefront", "Storefront", "Branding, SEO and mega menu"],
              ["shop", "Shop", "Collection page copy and filter labels"],
              [
                "header_footer",
                "Header & footer",
                "Navigation, search and footer",
              ],
              ["homepage", "Homepage", "Hero, Section and Positions"],
              ["contact", "Contact page", "Customer care, address and map"],
              ["commerce", "Commerce", "Shipping, tax and payments"],
              ["communications", "Communications", "Email and security"],
              [
                "catalog",
                "Attributes & variants",
                "Global product options and variant controls",
              ],
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
          {activeSection === "shop" && (
            <div className="settings-tab-panel">
              <SettingsGroup icon={Settings2} title="Shop collection" description="Control the shop page copy and filter headings. Filter values come from your live catalog, categories and global attributes.">
                <Field label="Eyebrow" group="shop" name="eyebrow" state={state} setState={setState} />
                <Field label="Title" group="shop" name="title" state={state} setState={setState} />
                <Field label="Description" group="shop" name="description" type="textarea" state={state} setState={setState} />
                <Field label="Search placeholder" group="shop" name="search_placeholder" state={state} setState={setState} />
                <Field label="Singular result label" group="shop" name="result_product_label" state={state} setState={setState} />
                <Field label="Plural result label" group="shop" name="result_products_label" state={state} setState={setState} />
                <Field label="Category filter label" group="shop" name="filter_category_title" state={state} setState={setState} />
                <Field label="Brand filter label" group="shop" name="filter_brand_title" state={state} setState={setState} />
                <Field label="Price filter label" group="shop" name="filter_price_title" state={state} setState={setState} />
                <Field label="Availability filter label" group="shop" name="filter_availability_title" state={state} setState={setState} />
              </SettingsGroup>
            </div>
          )}
          {activeSection === "catalog" && (
            <div className="settings-tab-panel">
              <SettingsGroup icon={Settings2} title="Attributes & variants" description="Create the global options and values used by products and SKU combinations.">
                <div className="settings-inline-row">
                  <label className="settings-field"><span>New attribute</span><div className="settings-input-wrap"><input value={attributeDraft.name} placeholder="e.g. Finish, Size or Skin type" onChange={(event) => setAttributeDraft((current) => ({ ...current, name: event.target.value }))} /></div></label>
                  <label className="settings-field"><span>Display control</span><div className="settings-input-wrap"><select value={attributeDraft.displayType} onChange={(event) => setAttributeDraft((current) => ({ ...current, displayType: event.target.value }))}><option value="button">Buttons</option><option value="select">Dropdown</option><option value="swatch">Swatches</option></select></div></label>
                  <label className="settings-checkbox"><input type="checkbox" checked={attributeDraft.isVariantAxis} onChange={(event) => setAttributeDraft((current) => ({ ...current, isVariantAxis: event.target.checked }))} /> Use for variants</label>
                  <button type="button" onClick={createCatalogAttribute} disabled={attributeSaving}><Plus size={16} /> Add attribute</button>
                </div>
                <div className="settings-attribute-list">
                  {catalogAttributes.map((attribute) => (
                    <fieldset className="settings-fieldset" key={attribute.id}>
                      <legend>{attribute.name} <small>({attribute.display_type}{Number(attribute.is_variant_axis) ? ", variant option" : ", product detail"})</small></legend>
                      <div className="settings-attribute-values">
                        {(attribute.values || []).map((value) => <span key={value.id} className={Number(value.is_active) ? "attribute-chip" : "attribute-chip is-muted"} style={attribute.display_type === "swatch" ? { backgroundColor: value.metadata?.color || undefined } : undefined}>{value.display_value || value.value}</span>)}
                      </div>
                      <div className="settings-inline-row">
                        <input value={valueDrafts[attribute.id]?.value || ""} placeholder="Add a value" onChange={(event) => setValueDrafts((current) => ({ ...current, [attribute.id]: { ...(current[attribute.id] || {}), value: event.target.value } }))} />
                        {attribute.display_type === "swatch" && (
                          <input aria-label="Swatch color" type="color" value={valueDrafts[attribute.id]?.colorHex || "#dfe9df"} onChange={(event) => setValueDrafts((current) => ({ ...current, [attribute.id]: { ...(current[attribute.id] || {}), colorHex: event.target.value } }))} />
                        )}
                        <button type="button" onClick={() => createCatalogValue(attribute.id)} disabled={attributeSaving}>Add value</button>
                      </div>
                    </fieldset>
                  ))}
                  {!catalogAttributes.length && <p>No global attributes yet. Add the first one above.</p>}
                </div>
              </SettingsGroup>
            </div>
          )}
          {activeSection === "storefront" && (
            <div className="settings-tab-panel storefront-settings-panel">
              <SettingsGroup
                icon={Image}
                title="Branding"
                description="Control the logo, favicon and announcement strip used across the storefront."
              >
                <Field
                  label="Shipping rate mode"
                  group="shipping"
                  name="mode"
                  options={[
                    ["fixed", "Fixed rate"],
                    ["slab", "Weight slabs"],
                  ]}
                  state={state}
                  setState={setState}
                  help="Fixed uses the default rate. Weight slabs use the total SKU weight multiplied by quantity."
                />
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
                  label="Sign-in image URL"
                  group="branding"
                  name="auth_image_url"
                  state={state}
                  setState={setState}
                  placeholder="https://… (optional)"
                  help="Shown on sign-in and registration pages. Leave blank to use the default storefront image."
                />
                <Field
                  label="Announcement message"
                  group="branding"
                  name="announcement"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Announcement message 2"
                  group="branding"
                  name="announcement_secondary"
                  state={state}
                  setState={setState}
                  help="Shown as the second announcement item."
                />
                <Field
                  label="Announcement message 3"
                  group="branding"
                  name="announcement_tertiary"
                  state={state}
                  setState={setState}
                  help="Shown as the third announcement item."
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
                  label="SEO keywords"
                  group="seo"
                  name="keywords"
                  state={state}
                  setState={setState}
                  placeholder="natural skincare, face serum, moisturiser"
                  help="Comma-separated phrases used for the page keywords metadata."
                />
                <Field
                  label="Social share image URL"
                  group="seo"
                  name="og_image_url"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Robots policy"
                  group="seo"
                  name="robots"
                  state={state}
                  setState={setState}
                  placeholder="index,follow"
                  help="Examples: index,follow or noindex,nofollow."
                />
                <Field
                  label="Google site verification"
                  group="seo"
                  name="google_site_verification"
                  state={state}
                  setState={setState}
                  help="Paste the verification token from Google Search Console."
                />
              </SettingsGroup>
              <SettingsGroup
                icon={Settings2}
                title="Store identity"
                description="Control the business identity and availability shown across the storefront."
              >
                <Field
                  label="Business name"
                  group="store"
                  name="store_name"
                  state={state}
                  setState={setState}
                  help="Used across storefront branding and SEO titles."
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
                    ["coming_soon", "Opening soon · unavailable"],
                    ["maintenance", "Maintenance mode · unavailable"],
                  ]}
                  state={state}
                  setState={setState}
                  help="Closed, Opening soon and Maintenance mode block checkout and order placement."
                />
                <Field
                  label="Closed notice"
                  group="store"
                  name="closed_message"
                  type="textarea"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Coming soon title"
                  group="store"
                  name="availability_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Coming soon message"
                  group="store"
                  name="availability_message"
                  type="textarea"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Coming soon countdown date"
                  group="store"
                  name="availability_countdown"
                  type="datetime-local"
                  state={state}
                  setState={setState}
                  help="Optional. The countdown is hidden when this is blank."
                />
                <Field
                  label="Maintenance title"
                  group="store"
                  name="maintenance_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Maintenance message"
                  group="store"
                  name="maintenance_message"
                  type="textarea"
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
                  ["Nav menu 1", "shop"],
                  ["Nav menu 2", "skin"],
                  ["Nav menu 3", "concerns"],
                  ["Nav menu 4", "collections"],
                ].map(([label, name]) => (
                  <Field
                    key={name}
                    label={label}
                    group="mega_menu"
                    name={name}
                    type="textarea"
                    state={state}
                    setState={setState}
                    help="Use up to 4 column lines: Column 1 title :: Link 1, Link 2. Leave a line empty to hide that column. You can also use Label|/shop/path for an explicit destination. Feature format: feature|Title|Description|CTA|Image URL|Target URL."
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
            </div>
          )}
          {activeSection === "contact" && (
            <div className="settings-tab-panel">
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
                  label="Secondary support phone"
                  group="contact"
                  name="phone_secondary"
                  state={state}
                  setState={setState}
                  help="Optional. Leave blank to hide it on the contact page."
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
                  help="Paste any Google Maps Embed URL or OpenStreetMap iframe URL. Use an /embed or /export/embed URL, not a share link."
                />
                <Field label="CTA label" group="contact" name="cta_label" state={state} setState={setState} />
                <Field label="CTA URL" group="contact" name="cta_url" state={state} setState={setState} />
                <Field label="Form eyebrow" group="contact" name="form_eyebrow" state={state} setState={setState} />
                <Field label="Form title" group="contact" name="form_title" state={state} setState={setState} />
                <Field label="Form description" group="contact" name="form_description" type="textarea" state={state} setState={setState} />
                <Field label="Name label" group="contact" name="name_label" state={state} setState={setState} />
                <Field label="Name placeholder" group="contact" name="name_placeholder" state={state} setState={setState} />
                <Field label="Email label" group="contact" name="email_label" state={state} setState={setState} />
                <Field label="Email placeholder" group="contact" name="email_placeholder" state={state} setState={setState} />
                <Field label="Order label" group="contact" name="order_label" state={state} setState={setState} />
                <Field label="Order optional text" group="contact" name="order_optional_label" state={state} setState={setState} />
                <Field label="Order placeholder" group="contact" name="order_placeholder" state={state} setState={setState} />
                <Field label="Message label" group="contact" name="message_label" state={state} setState={setState} />
                <Field label="Message placeholder" group="contact" name="message_placeholder" state={state} setState={setState} />
                <Field label="Submit label" group="contact" name="submit_label" state={state} setState={setState} />
                <Field label="Submitting label" group="contact" name="submitting_label" state={state} setState={setState} />
                <Field label="Sent label" group="contact" name="sent_label" state={state} setState={setState} />
                <Field label="Map title" group="contact" name="map_title" state={state} setState={setState} />
              </SettingsGroup>
            </div>
          )}
          {activeSection === "header_footer" && (
            <div className="settings-tab-panel">
              <SettingsGroup
                icon={Menu}
                title="Header navigation"
                description="Control which links appear in the storefront header and what labels customers see."
              >
                <Field
                  label="Header links"
                  group="navigation"
                  name="header_links"
                  type="textarea"
                  state={state}
                  setState={setState}
                  help="One link per line: Label|/path. Empty lines are hidden."
                />
                <Field
                  label="Search eyebrow"
                  group="search"
                  name="eyebrow"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Search placeholder"
                  group="search"
                  name="placeholder"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Search quick links"
                  group="search"
                  name="quick_links"
                  type="textarea"
                  state={state}
                  setState={setState}
                  help="One quick link per line."
                />
              </SettingsGroup>
              <SettingsGroup
                icon={Menu}
                title="Footer content"
                description="Control footer copy, columns and social links."
              >
                {[
                  ["Footer tagline", "tagline", "textarea"],
                  ["Footer secondary line", "tagline_secondary"],
                  ["Shop column title", "shop_title"],
                  ["Customer care column title", "customer_care_title"],
                  ["About column title", "about_title"],
                  ["Legal column title", "legal_title"],
                  ["Mobile guidance title", "mobile_guidance_title"],
                  ["Mobile guidance text", "mobile_guidance_text"],
                  ["Shop links", "shop_links", "textarea"],
                  ["Customer care links", "customer_care_links", "textarea"],
                  ["About links", "about_links", "textarea"],
                  ["Legal links", "legal_links", "textarea"],
                  ["Instagram URL", "instagram_url"],
                  ["Facebook URL", "facebook_url"],
                  ["YouTube URL", "youtube_url"],
                  ["Pinterest URL", "pinterest_url"],
                  ["Twitter / X URL", "twitter_url"],
                  ["Support email", "support_email"],
                  ["Support phone", "support_phone"],
                  ["Store location", "location"],
                  ["Payment methods text", "payment_methods"],
                  ["Copyright text", "copyright_text"],
                ].map(([label, name, type]) => (
                  <Field
                    key={name}
                    label={label}
                    group="footer"
                    name={name}
                    type={type || "text"}
                    state={state}
                    setState={setState}
                    help={
                      name.endsWith("_links")
                        ? "One link per line: Label|/path."
                        : undefined
                    }
                  />
                ))}
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
                  label="Weight slabs"
                  group="shipping"
                  name="weight_slabs"
                  type="textarea"
                  state={state}
                  setState={setState}
                  placeholder={"500=79, 1000=99, 2000=149"}
                  help="One slab per line in grams=rate format. Example: 500=79 means up to 500g costs ₹79. The first matching slab rate is charged."
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
                  placeholder="Example: 3304 (cosmetics) or applicable SAC"
                  help="Tax classification code printed on invoices. Use the code applicable to your products/services and confirm it with your tax advisor."
                />
                <Field
                  label="Invoice note"
                  group="tax"
                  name="invoice_note"
                  state={state}
                  setState={setState}
                />
              </SettingsGroup>
              <SettingsGroup
                icon={Settings2}
                title="Payment gateway"
                description="Enable one server-configured gateway at a time. Credentials stay in backend/.env and are never exposed to the browser."
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
                  help="Enable only after the selected gateway's *_ENABLED flag and valid server keys are configured in backend/.env."
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
                title="Hero Section Settings"
                description="Configure hero content, imagery and calls to action."
              >
                <Field
                  label="Visibility"
                  group="homepage_sections"
                  name="hero"
                  options={[
                    ["true", "Enabled"],
                    ["false", "Disabled"],
                  ]}
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Position"
                  group="homepage_positions"
                  name="hero"
                  options={Array.from({ length: 13 }, (_, index) => [
                    String(index + 1),
                    `Position ${index + 1}`,
                  ])}
                  state={state}
                  setState={setState}
                />
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
                  placeholder="local:hero or https://..."
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
                  label="Hero image alt text"
                  group="homepage"
                  name="hero_image_alt"
                  state={state}
                  setState={setState}
                  help="Describe the image for accessibility."
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
                <Field
                  label="Hero proof line"
                  group="homepage"
                  name="hero_proof"
                  state={state}
                  setState={setState}
                  help="Optional supporting line below the calls to action."
                />
                <Field
                  label="Hero image label"
                  group="homepage"
                  name="hero_ritual_title"
                  state={state}
                  setState={setState}
                  help="Optional label shown over the hero image."
                />
                <Field
                  label="Hero image caption"
                  group="homepage"
                  name="hero_ritual_text"
                  state={state}
                  setState={setState}
                  help="Optional caption shown over the hero image."
                />
              </SettingsGroup>
              {[
                ["trust", "Trust highlights"],
                ["concerns", "Category highlights", "category_highlights"],
                ["bestsellers", "Featured products", "featured_products"],
                ["skin_types", "Top Level Categories", "product_groups"],
                ["brand_story", "Brand story"],
                ["ingredient", "Product highlights"],
                ["principles", "Principles"],
                ["ritual", "Showcase"],
                ["new_arrivals", "New products", "new_products"],
                ["routine", "Product discovery"],
                ["testimonials", "Testimonials"],
                ["newsletter", "Newsletter"],
              ].map(([name, title, limitKey]) => (
                <SettingsGroup
                  key={name}
                  icon={Settings2}
                  title={title}
                  description="Control visibility and display position for this section."
                >
                  <Field
                    label="Visibility"
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
                    label="Position"
                    group="homepage_positions"
                    name={name}
                    options={Array.from({ length: 13 }, (_, index) => [
                      String(index + 1),
                      `Position ${index + 1}`,
                    ])}
                    state={state}
                    setState={setState}
                  />
                  {limitKey && (
                    <>
                      <Field
                        label="Desktop item count"
                        group="homepage_limits"
                        name={`${limitKey}_desktop`}
                        type="number"
                        state={state}
                        setState={setState}
                        min="0"
                        max="12"
                      />
                      <Field
                        label="Mobile item count"
                        group="homepage_limits"
                        name={`${limitKey}_mobile`}
                        type="number"
                        state={state}
                        setState={setState}
                        min="0"
                        max="12"
                      />
                    </>
                  )}
                  {name === "trust" &&
                    [1, 2, 3, 4]
                      .flatMap((number) => [
                        [`Highlight ${number} title`, `item_${number}_title`],
                        [`Highlight ${number} text`, `item_${number}_text`],
                      ])
                      .map(([label, fieldName]) => (
                        <Field
                          key={fieldName}
                          label={label}
                          group="trust"
                          name={fieldName}
                          state={state}
                          setState={setState}
                        />
                      ))}
                  {name === "concerns" &&
                    [
                      ["Eyebrow", "category_eyebrow"],
                      ["Title", "category_title"],
                      ["Description", "category_description"],
                      ["Link label", "category_link_label"],
                      ["Link URL", "category_link_url"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "category_description"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                      />
                    ))}
                  {name === "skin_types" &&
                    [
                      ["Eyebrow", "groups_eyebrow"],
                      ["Title", "groups_title"],
                      ["Description", "groups_description"],
                      ["Link label", "groups_link_label"],
                      ["Link URL", "groups_link_url"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "groups_description"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                      />
                    ))}
                  {name === "brand_story" &&
                    [
                      ["Eyebrow", "brand_eyebrow"],
                      ["Title", "brand_title"],
                      ["Description", "brand_description"],
                      ["Link label", "brand_link_label"],
                      ["Link URL", "brand_link_url"],
                      ["Image URL", "brand_image_url"],
                      ["Image alt text", "brand_image_alt"],
                      ["Note title", "brand_note_title"],
                      ["Note text", "brand_note_text"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "brand_description"
                            || fieldName === "brand_note_text"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                        placeholder={
                          fieldName === "brand_image_url"
                            ? "local:hero or https://..."
                            : undefined
                        }
                      />
                    ))}
                  {name === "ingredient" &&
                    [
                      ["Eyebrow", "ingredients_eyebrow"],
                      ["Title", "ingredients_title"],
                      ["Description", "ingredients_description"],
                      ["Image URL", "ingredients_image_url"],
                      ["Image alt text", "ingredients_image_alt"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "ingredients_description"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                        placeholder={
                          fieldName === "ingredients_image_url"
                            ? "local:hero or https://..."
                            : undefined
                        }
                      />
                    ))}
                  {name === "ingredient" &&
                    [1, 2, 3, 4, 5, 6].flatMap((number) => [
                      [`Highlight ${number} title`, `highlight_${number}_title`],
                      [`Highlight ${number} text`, `highlight_${number}_text`],
                    ]).map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        state={state}
                        setState={setState}
                      />
                    ))}
                  {name === "principles" && (
                    <>
                      <Field
                        label="Section title"
                        group="homepage"
                        name="principles_title"
                        state={state}
                        setState={setState}
                      />
                      {[1, 2, 3].flatMap((number) => [
                        [`Card ${number} title`, `principle_${number}_title`],
                        [`Card ${number} text`, `principle_${number}_text`],
                      ]).map(([label, fieldName]) => (
                        <Field
                          key={fieldName}
                          label={label}
                          group="homepage"
                          name={fieldName}
                          type={fieldName.endsWith("_text") ? "textarea" : "text"}
                          state={state}
                          setState={setState}
                        />
                      ))}
                    </>
                  )}
                  {name === "ritual" &&
                    [
                      ["Eyebrow", "ritual_eyebrow"],
                      ["Title", "ritual_title"],
                      ["Description", "ritual_description"],
                      ["Link label", "ritual_link_label"],
                      ["Link URL", "ritual_link_url"],
                      ["Image URL", "ritual_image_url"],
                      ["Image alt text", "ritual_image_alt"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "ritual_title" ||
                          fieldName === "ritual_description"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                        placeholder={
                          fieldName === "ritual_image_url"
                            ? "local:hero or https://..."
                            : undefined
                        }
                      />
                    ))}
                  {name === "new_arrivals" &&
                    [
                      ["Eyebrow", "new_eyebrow"],
                      ["Title", "new_title"],
                      ["Description", "new_description"],
                      ["Link label", "new_link_label"],
                      ["Link URL", "new_link_url"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "new_description" ? "textarea" : "text"
                        }
                        state={state}
                        setState={setState}
                      />
                    ))}
                  {name === "routine" &&
                    [
                      ["Eyebrow", "routine_eyebrow"],
                      ["Title", "routine_title"],
                      ["Description", "routine_description"],
                      ["Step 1", "routine_step_1"],
                      ["Step 2", "routine_step_2"],
                      ["Step 3", "routine_step_3"],
                      ["Primary link label", "routine_link_label"],
                      ["Primary link URL", "routine_link_url"],
                      ["Secondary link label", "routine_secondary_label"],
                      ["Secondary link URL", "routine_secondary_url"],
                      ["Image URL", "routine_image_url"],
                      ["Image alt text", "routine_image_alt"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "routine_title" ||
                          fieldName === "routine_description"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                        placeholder={
                          fieldName === "routine_image_url"
                            ? "local:hero or https://..."
                            : undefined
                        }
                      />
                    ))}
                  {name === "testimonials" && (
                    <>
                      <Field
                        label="Eyebrow"
                        group="homepage"
                        name="testimonials_eyebrow"
                        state={state}
                        setState={setState}
                      />
                      {[1, 2, 3, 4].flatMap((number) => [
                        ["Name", `testimonial_${number}_name`],
                        ["Product or label", `testimonial_${number}_product`],
                        ["Quote", `testimonial_${number}_quote`],
                      ]).map(([label, fieldName]) => (
                        <Field
                          key={fieldName}
                          label={`Testimonial ${fieldName.split("_")[1]} ${label}`}
                          group="homepage"
                          name={fieldName}
                          type={fieldName.endsWith("_quote") ? "textarea" : "text"}
                          state={state}
                          setState={setState}
                        />
                      ))}
                    </>
                  )}
                  {name === "newsletter" &&
                    [
                      ["Eyebrow", "newsletter_eyebrow"],
                      ["Title", "newsletter_title"],
                      ["Description", "newsletter_description"],
                      ["Email label", "newsletter_label"],
                      ["Email placeholder", "newsletter_placeholder"],
                      ["Button label", "newsletter_button_label"],
                      ["Submitting label", "newsletter_submitting_label"],
                      ["Privacy note", "newsletter_privacy"],
                      ["Success message", "newsletter_success"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          [
                            "newsletter_title",
                            "newsletter_description",
                            "newsletter_privacy",
                            "newsletter_success",
                          ].includes(fieldName)
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                      />
                    ))}
                  {name === "bestsellers" &&
                    [
                      ["Eyebrow", "featured_eyebrow"],
                      ["Title", "featured_title"],
                      ["Description", "featured_description"],
                      ["Link label", "featured_link_label"],
                      ["Link URL", "featured_link_url"],
                    ].map(([label, fieldName]) => (
                      <Field
                        key={fieldName}
                        label={label}
                        group="homepage"
                        name={fieldName}
                        type={
                          fieldName === "featured_description"
                            ? "textarea"
                            : "text"
                        }
                        state={state}
                        setState={setState}
                      />
                    ))}
                </SettingsGroup>
              ))}
              {false && (
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
                  label="Search eyebrow"
                  group="search"
                  name="eyebrow"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Search placeholder"
                  group="search"
                  name="placeholder"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Search quick links"
                  group="search"
                  name="quick_links"
                  type="textarea"
                  state={state}
                  setState={setState}
                  help="One quick link per line. Empty lines are hidden."
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
                  label="Footer secondary tagline"
                  group="footer"
                  name="tagline_secondary"
                  type="textarea"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Shop column title"
                  group="footer"
                  name="shop_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Customer care column title"
                  group="footer"
                  name="customer_care_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="About column title"
                  group="footer"
                  name="about_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Legal column title"
                  group="footer"
                  name="legal_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Mobile guidance title"
                  group="footer"
                  name="mobile_guidance_title"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Mobile guidance text"
                  group="footer"
                  name="mobile_guidance_text"
                  state={state}
                  setState={setState}
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
                <Field
                  label="Payment methods text"
                  group="footer"
                  name="payment_methods"
                  state={state}
                  setState={setState}
                />
                <Field
                  label="Copyright text"
                  group="footer"
                  name="copyright_text"
                  state={state}
                  setState={setState}
                />
                </SettingsGroup>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
