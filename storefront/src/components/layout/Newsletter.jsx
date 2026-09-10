import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email) {
      setMessage('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.')
      return
    }
    setMessage('You’re on the list. Welcome to the Natural Beauty note.')
    setEmail('')
  }

  return (
    <section className="newsletter-section">
      <div className="homepage-container newsletter-inner">
        <div>
          <p className="eyebrow">The Natural Beauty note</p>
          <h2>A little more care,<br />delivered to your inbox.</h2>
          <p>New formulas, thoughtful skincare notes, early access and occasional offers — without the noise.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="newsletter-email">Your email address</label>
          <div className="newsletter-field">
            <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" aria-describedby="newsletter-message newsletter-privacy" />
            <button type="submit">Join the list</button>
          </div>
          <p id="newsletter-message" className="newsletter-message" role="status">{message}</p>
          <small id="newsletter-privacy">By subscribing, you agree to receive Natural Beauty updates. You can unsubscribe at any time.</small>
        </form>
      </div>
    </section>
  )
}
