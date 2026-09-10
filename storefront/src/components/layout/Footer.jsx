import { Bookmark, Camera, ChevronDown, Globe, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const groups = {
  Shop: ['Shop All', 'New Arrivals', 'Best Sellers', 'Skin Types', 'Concerns', 'Gift Cards'],
  'Customer Care': ['Contact Us', 'FAQs', 'Shipping', 'Returns & Refunds', 'Track Order', 'My Account'],
  About: ['Our Story', 'Ingredients', 'Journal', 'Contact'],
  Legal: ['Privacy Policy', 'Terms & Conditions', 'Shipping Policy', 'Return Policy', 'Refund Policy', 'Cancellation Policy'],
}

const routeMap = {
  'Shop All': '/shop', 'New Arrivals': '/new-arrivals', 'Best Sellers': '/best-sellers', 'Skin Types': '/skin-types', 'Concerns': '/concerns', 'Gift Cards': '/gift-cards',
  'Contact Us': '/contact', FAQs: '/faq', Shipping: '/shipping', 'Returns & Refunds': '/returns', 'Track Order': '/track-order', 'My Account': '/account',
  'Our Story': '/about', Ingredients: '/about', Journal: '/journal', Contact: '/contact', 'Privacy Policy': '/privacy', 'Terms & Conditions': '/terms', 'Shipping Policy': '/shipping', 'Return Policy': '/returns', 'Refund Policy': '/refund-policy', 'Cancellation Policy': '/cancellation-policy',
}

export function Footer() {
  const [openGroup, setOpenGroup] = useState(null)

  return (
    <footer className="site-footer">
      <div className="footer-main homepage-container">
        <div className="footer-brand">
          <Link to="/" className="wordmark">Natural Beauty</Link>
          <p>Thoughtful skincare for everyday rituals.</p>
          <span>Modern botanical care, made to feel simple and personal.</span>
          <div className="footer-socials">
            <a href="#" aria-label="Natural Beauty on Instagram"><Camera size={17} /></a>
            <a href="#" aria-label="Natural Beauty on Facebook"><Globe size={17} /></a>
            <a href="#" aria-label="Natural Beauty on YouTube"><Play size={17} /></a>
            <a href="#" aria-label="Natural Beauty on Pinterest"><Bookmark size={17} /></a>
          </div>
        </div>
        <div className="footer-links">
          {Object.entries(groups).map(([group, links]) => (
            <section key={group} className={openGroup === group ? 'is-open' : ''}>
              <button aria-expanded={openGroup === group} onClick={() => setOpenGroup(openGroup === group ? null : group)}>{group}<ChevronDown size={16} /></button>
              <div>{links.map((link) => <Link key={link} to={routeMap[link] || '/about'}>{link}</Link>)}</div>
            </section>
          ))}
        </div>
        <div className="footer-contact">
          <p className="eyebrow">Customer care</p>
          <a href="mailto:hello@naturalbeauty.example">hello@naturalbeauty.example</a>
          <span>Mon–Sat<br />10:00 AM – 6:00 PM</span>
        </div>
      </div>
      <div className="footer-bottom homepage-container">
        <span>Secure payments</span><span>UPI <i>•</i> Cards <i>•</i> Net Banking <i>•</i> COD</span><span>© 2026 Natural Beauty</span>
      </div>
    </footer>
  )
}
