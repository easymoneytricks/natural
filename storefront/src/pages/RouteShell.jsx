import {
  ArrowRight,
  Beaker,
  Leaf,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  RecaptchaWidget,
  isRecaptchaEnabled,
} from "../components/RecaptchaWidget";
import { useStoreSettings } from "../context/StoreSettingsContext";
import heroImage from "../assets/natural-beauty-hero.png";

const content = {
  "gift-cards": {
    eyebrow: "Give the ritual",
    title: "Gift cards for thoughtful care.",
    intro:
      "Let someone choose the formulas that feel right for them. Natural Beauty gift cards are ideal for birthdays, milestones and everyday acts of care.",
    sections: [
      [
        "Choose a considered amount",
        "Gift cards are available in flexible values from ₹500. Our care team can help you choose an amount that suits a complete routine or a single favourite formula.",
      ],
      [
        "How it works",
        "Contact our care team with the recipient name, email address and value you would like to gift. We will issue a secure code and share it with you after payment is confirmed.",
      ],
      [
        "Simple to redeem",
        "The recipient can enter their gift card code in the cart at checkout. Any remaining balance stays available for a future Natural Beauty order until the card expires.",
      ],
      [
        "Need help choosing?",
        "Our team is available Monday–Saturday, 10:00 AM–6:00 PM. Reach out through Contact Us and we will make gifting feel effortless.",
      ],
    ],
  },
  about: {
    eyebrow: "Our approach",
    title: "Skincare, made considered.",
    intro:
      "Natural Beauty brings botanical inspiration and modern formulation together for simple, purposeful rituals.",
    sections: [
      [
        "Formulas with a clear role",
        "Every product is designed to fit naturally into an everyday routine, with considered textures and ingredients you can understand.",
      ],
      [
        "Care that feels personal",
        "We believe good skincare should meet your skin where it is, without unnecessary complexity or overpromising.",
      ],
    ],
  },
  privacy: {
    eyebrow: "Your privacy",
    title: "Privacy policy",
    intro:
      "How Natural Beauty collects, uses and protects information when you browse or shop with us.",
    sections: [
      [
        "Information we collect",
        "We collect details you provide at checkout, account creation or when you contact our team, along with essential device information needed to keep the site secure.",
      ],
      [
        "How we use it",
        "Your information helps us process orders, provide support, improve the storefront and share updates only where you have chosen to receive them.",
      ],
    ],
  },
  terms: {
    eyebrow: "Store terms",
    title: "Terms & conditions",
    intro: "The terms that govern use of our website, products and services.",
    sections: [
      [
        "Using our store",
        "Please provide accurate information, keep account details secure and use this website only for lawful purposes.",
      ],
      [
        "Orders and availability",
        "An order is confirmed after payment or approval. Product availability, pricing and delivery estimates may change before confirmation.",
      ],
    ],
  },
  "refund-policy": {
    eyebrow: "Help centre",
    title: "Refund policy",
    intro: "A clear, considered approach to returns, refunds and order issues.",
    sections: [
      [
        "Eligible returns",
        "Contact us within 7 days of delivery for unopened, unused products in original packaging. Hygiene-sensitive products cannot be accepted after opening.",
      ],
      [
        "Refund timing",
        "Approved refunds are returned to the original payment method after inspection. Your bank may take additional time to post the credit.",
      ],
    ],
  },
  "cancellation-policy": {
    eyebrow: "Help centre",
    title: "Cancellation policy",
    intro: "What to expect when you need to change or cancel an order.",
    sections: [
      [
        "Before dispatch",
        "Contact us as soon as possible with your order number. We will try to cancel before the order enters fulfilment.",
      ],
      [
        "After dispatch",
        "Once dispatched, an order can no longer be cancelled, but eligible returns may be requested after delivery.",
      ],
    ],
  },
  shipping: {
    eyebrow: "Delivery",
    title: "Shipping information",
    intro: "Thoughtful delivery from our studio to your door.",
    sections: [
      [
        "Standard delivery",
        "Orders above ₹999 receive complimentary shipping. Delivery estimates and tracking details are shared by email after dispatch.",
      ],
      [
        "Carefully packed",
        "Every order is packed securely to protect the formulas and reduce unnecessary packaging.",
      ],
    ],
  },
  returns: {
    eyebrow: "Help centre",
    title: "Returns & exchanges",
    intro: "Need help with an order? We are here to make the next step simple.",
    sections: [
      [
        "Start a return",
        "Email hello@naturalbeauty.example with your order number and reason within 7 days of delivery.",
      ],
      [
        "Condition",
        "Items must be unused, unopened and in original packaging. We cannot accept products that have been opened for hygiene reasons.",
      ],
    ],
  },
};

export function RouteShell({ title }) {
  if (title === "contact") return <ContactPage />;
  if (title === "about") return <AboutPage />;
  if (title === "track-order") return <TrackOrderPage />;
  const page = content[title] || {
    eyebrow: "Natural Beauty",
    title: title.replaceAll("-", " "),
    intro: "Thoughtful details for a simpler skincare ritual.",
    sections: [
      [
        "A considered destination",
        "This page is being prepared with the same care as every Natural Beauty formula.",
      ],
    ],
  };
  return (
    <section className="route-shell container">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p className="route-intro">{page.intro}</p>
      <div className="route-sections">
        {page.sections.map(([heading, text]) => (
          <article key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      {title === "gift-cards" && (
        <Link className="button route-cta" to="/contact">
          Request a gift card <ArrowRight size={15} />
        </Link>
      )}
    </section>
  );
}

function TrackOrderPage() {
  const [form, setForm] = useState({
    orderNumber: "",
    trackingId: "",
    email: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(
        `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1").replace(/\/$/, "")}/track-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error?.message || "We could not find that order.",
        );
      setResult(payload.data);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="route-shell track-order-page container">
      <div className="track-order-hero">
        <div>
          <p className="eyebrow">Order support</p>
          <h1>Follow your order, simply.</h1>
          <p className="route-intro">
            Enter the order number or courier tracking ID along with the email
            used at checkout. No account login is needed.
          </p>
        </div>
        <div className="track-order-icon">
          <PackageSearch size={42} strokeWidth={1.2} />
        </div>
      </div>
      <div className="track-order-layout">
        <form className="track-order-form" onSubmit={submit}>
          <h2>Find your order</h2>
          <p>
            Use either your Natural Beauty order number or the tracking ID
            shared by the courier.
          </p>
          <label>
            Order number <span>(optional if tracking ID is provided)</span>
            <input
              value={form.orderNumber}
              onChange={(event) =>
                setForm({ ...form, orderNumber: event.target.value })
              }
              placeholder="NB-2026-0000"
            />
          </label>
          <label>
            Courier tracking ID <span>(optional)</span>
            <input
              value={form.trackingId}
              onChange={(event) =>
                setForm({ ...form, trackingId: event.target.value })
              }
              placeholder="Tracking ID"
            />
          </label>
          <label>
            Email used at checkout
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
            />
          </label>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Finding order…" : "Track order"}{" "}
            <ArrowRight size={15} />
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <div className="track-order-result" aria-live="polite">
          {result ? (
            <>
              <p className="eyebrow">Order {result.orderNumber}</p>
              <h2>{result.status.replaceAll("_", " ")}</h2>
              <p>
                Placed {new Date(result.placedAt).toLocaleDateString("en-IN")}
              </p>
              {result.trackingId && (
                <p>
                  <strong>Tracking ID:</strong> {result.trackingId}
                </p>
              )}
              <div className="track-timeline">
                {(result.timeline || []).map((item) => (
                  <div key={`${item.status}-${item.createdAt}`}>
                    <span>{item.status.replaceAll("_", " ")}</span>
                    <small>
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <PackageSearch size={28} />
              <h2>Your delivery updates will appear here.</h2>
              <p>
                We’ll show the latest order status and tracking details after
                you submit the form.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  const principles = [
    [
      Leaf,
      "Botanical inspiration",
      "We look to plants for comfort, resilience and texture, then pair that inspiration with ingredients selected for a clear, useful role.",
    ],
    [
      Beaker,
      "Modern formulation",
      "Every formula is developed around everyday skin needs, with considered concentrations, pleasant textures and straightforward directions.",
    ],
    [
      ShieldCheck,
      "Honest care",
      "We keep our language clear, our routines practical and our promises grounded in what a product is designed to do.",
    ],
  ];
  return (
    <section className="route-shell about-page container">
      <div className="about-hero">
        <div>
          <p className="eyebrow">Our story</p>
          <h1>Skincare with less noise, and more intention.</h1>
          <p className="route-intro">
            Natural Beauty began with a simple belief: a good routine should
            feel easy to understand, lovely to use and genuinely useful to your
            skin.
          </p>
        </div>
        <figure className="about-hero-image">
          <img
            src={heroImage}
            alt="Natural Beauty skincare bottles and botanicals"
          />
          <figcaption>Botanical inspiration · modern science</figcaption>
        </figure>
      </div>
      <div className="about-story-copy">
        <p className="eyebrow">A considered approach</p>
        <h2>Make space for the rituals that stay.</h2>
        <p>
          We create uncomplicated formulas for real routines: the cleanser you
          reach for every morning, the serum you use when your skin needs
          support, and the moisturiser that brings everything together. Our
          products are designed to work beautifully on their own and even better
          as a thoughtful, flexible ritual.
        </p>
      </div>
      <div className="about-principles">
        {principles.map(([Icon, title, text]) => (
          <article key={title}>
            <Icon size={22} strokeWidth={1.5} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="about-footer-cta">
        <div>
          <p className="eyebrow">Find your everyday ritual</p>
          <h2>Start with what your skin needs today.</h2>
        </div>
        <Link className="button" to="/shop">
          Explore skincare <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

function ContactPage() {
  const settings = useStoreSettings();
  const contact = settings.contact || {};
  const contactEmail = contact.email || "hello@naturalbeauty.example";
  const contactPhone = contact.phone || "+91 98765 43210";
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const submitContact = async (event) => {
    event.preventDefault();
    if (isRecaptchaEnabled(settings) && !recaptchaToken) {
      setError("Please complete the security verification.");
      return;
    }
    setSending(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch(
        `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1").replace(/\/$/, "")}/contact-submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: form.get("name"),
            email: form.get("email"),
            orderNumber: form.get("order"),
            message: form.get("message"),
            recaptchaToken,
          }),
        },
      );
      if (!response.ok)
        throw new Error("We could not send your message. Please try again.");
      setSent(true);
      setRecaptchaToken("");
      formElement.reset();
    } catch (caught) {
      setError(
        caught.message || "We could not send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };
  return (
    <section className="route-shell contact-page container">
      <p className="eyebrow">
        {contact.eyebrow || "We would love to hear from you"}
      </p>
      <h1 className="contact-title-controlled">
        {contact.title || "Let’s make your routine feel simple."}
      </h1>
      <p className="route-intro contact-intro-controlled">
        {contact.intro ||
          "Questions about a product, an order or finding your next formula? Our care team is here Monday–Saturday, 10:00 AM–6:00 PM."}
      </p>
      <h1>Let’s make your routine feel simple.</h1>
      <p className="route-intro contact-intro-fallback">
        Questions about a product, an order or finding your next formula? Our
        care team is here Monday–Saturday, 10:00 AM–6:00 PM.
      </p>
      <div className="contact-grid">
        <div className="contact-info">
          <a href={`mailto:${contactEmail}`}>
            <Mail size={17} />
            {contactEmail}
          </a>
          <a href={`tel:${contactPhone.replace(/\s+/g, "")}`}>
            <Phone size={17} />
            {contactPhone}
          </a>
          <p>
            <MapPin size={17} />
            {contact.address_name || "Natural Beauty Studio"}
            <br />
            {contact.address_line || "Indiranagar, Bengaluru 560038"}
          </p>
          <Link className="button" to="/shop">
            Explore skincare <ArrowRight size={15} />
          </Link>
        </div>
        <form
          className="contact-form contact-form-card"
          onSubmit={submitContact}
        >
          <div className="contact-form-heading">
            <p className="eyebrow">Customer care</p>
            <h2>How can we help?</h2>
            <span>
              Send us a note and our team will get back to you shortly.
            </span>
          </div>
          <label>
            Name
            <input required name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Order number <span>(optional)</span>
            <input name="order" placeholder="NB-2026-0000" />
          </label>
          <label>
            Message
            <textarea
              required
              name="message"
              rows="4"
              placeholder="How can we help?"
            />
          </label>
          <RecaptchaWidget onToken={setRecaptchaToken} />
          <button className="button" type="submit">
            {sending ? "Sending…" : sent ? "Message sent" : "Send message"}{" "}
            <ArrowRight size={15} />
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <iframe
          title="Natural Beauty Studio location"
          src={
            contact.map_url ||
            "https://www.openstreetmap.org/export/embed.html?bbox=77.625%2C12.965%2C77.645%2C12.985&layer=mapnik&marker=12.975%2C77.635"
          }
          loading="lazy"
        />
      </div>
    </section>
  );
}
