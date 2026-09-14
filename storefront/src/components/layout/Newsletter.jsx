import { useState } from "react";

export function Newsletter() {
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
      setMessage("You’re on the list. Welcome to the Natural Beauty note.");
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
          <p className="eyebrow">The Natural Beauty note</p>
          <h2>
            A little more care,
            <br />
            delivered to your inbox.
          </h2>
          <p>
            New formulas, thoughtful skincare notes, early access and occasional
            offers — without the noise.
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="newsletter-email">Your email address</label>
          <div className="newsletter-field">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              required
              aria-describedby="newsletter-message newsletter-privacy"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Joining…" : "Join the list"}
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
          <small id="newsletter-privacy">
            By subscribing, you agree to receive Natural Beauty updates. You can
            unsubscribe at any time.
          </small>
        </form>
      </div>
    </section>
  );
}
