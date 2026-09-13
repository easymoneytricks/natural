import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  RecaptchaWidget,
  isRecaptchaEnabled,
} from "../components/RecaptchaWidget";
import { useStoreSettings } from "../context/StoreSettingsContext";

const content = {
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
    </section>
  );
}

function ContactPage() {
  const settings = useStoreSettings();
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
      <p className="eyebrow">We would love to hear from you</p>
      <h1>Let’s make your routine feel simple.</h1>
      <p className="route-intro">
        Questions about a product, an order or finding your next formula? Our
        care team is here Monday–Saturday, 10:00 AM–6:00 PM.
      </p>
      <div className="contact-grid">
        <div className="contact-info">
          <a href="mailto:hello@naturalbeauty.example">
            <Mail size={17} />
            hello@naturalbeauty.example
          </a>
          <a href="tel:+919876543210">
            <Phone size={17} />
            +91 98765 43210
          </a>
          <p>
            <MapPin size={17} />
            Natural Beauty Studio
            <br />
            Indiranagar, Bengaluru 560038
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
          src="https://www.openstreetmap.org/export/embed.html?bbox=77.625%2C12.965%2C77.645%2C12.985&layer=mapnik&marker=12.975%2C77.635"
          loading="lazy"
        />
      </div>
    </section>
  );
}
