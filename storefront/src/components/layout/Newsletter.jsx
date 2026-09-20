import { useState } from "react";
import { useStoreSettings } from "../../context/StoreSettingsContext";

export function Newsletter() {
  const settings = useStoreSettings();
  const homepage = settings.homepage || {};
  const eyebrow = String(homepage.newsletter_eyebrow || "").trim();
  const title = String(homepage.newsletter_title || "").trim();
  const description = String(homepage.newsletter_description || "").trim();
  const label = String(homepage.newsletter_label || "").trim();
  const placeholder = String(homepage.newsletter_placeholder || "").trim();
  const buttonLabel = String(homepage.newsletter_button_label || "").trim();
  const submittingLabel = String(
    homepage.newsletter_submitting_label || "",
  ).trim();
  const privacy = String(homepage.newsletter_privacy || "").trim();
  const successMessage = String(homepage.newsletter_success || "").trim();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage("Please enter your email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const api = (
        import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
      ).replace(/\/$/, "");
      const response = await fetch(`${api}/newsletter-subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, source: "homepage" }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          payload?.error?.message || "We could not add you to the list.",
        );
      setMessage(successMessage);
      setEmail("");
    } catch (error) {
      setMessage(error.message || "We could not add you to the list.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="homepage-container newsletter-inner">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <h2>
              {title.split("\n").map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          )}
          {description && <p>{description}</p>}
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {label && <label htmlFor="newsletter-email">{label}</label>}
          <div className="newsletter-field">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={placeholder}
              required
              aria-describedby="newsletter-message newsletter-privacy"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? submittingLabel : buttonLabel}
            </button>
          </div>
          <p
            id="newsletter-message"
            className="newsletter-message"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
          {privacy && <small id="newsletter-privacy">{privacy}</small>}
        </form>
      </div>
    </section>
  );
}
