import { ArrowRight, Heart, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { QuickOptions } from '../components/product/QuickOptions'
import { Footer } from '../components/layout/Footer'
import { Newsletter } from '../components/layout/Newsletter'
import { brandPrinciples, concernTiles, homeImages, ingredients, skinTypes, trustItems } from '../data/home'
import { getProducts } from '../services/catalogApi'

const trustIcons = {
  sparkle: Sparkles,
  heart: Heart,
  shield: ShieldCheck,
  package: PackageCheck,
}

export function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [catalogError, setCatalogError] = useState(false)

  const testimonials = [
    { name: 'Aanya Mehta', product: 'Barrier Restore Moisturizer', quote: 'The Barrier Restore Moisturizer became the easiest part of my evening routine. The texture feels rich without feeling heavy.' },
    { name: 'Riya Kapoor', product: 'Vitamin C Radiance Serum', quote: 'I love how simple the routine feels. The Vitamin C serum layers beautifully under sunscreen in the morning.' },
    { name: 'Meera Sharma', product: 'Gentle Barrier Cleanser', quote: 'The cleanser and moisturizer combination feels gentle and uncomplicated, which is exactly what I wanted from my routine.' },
    { name: 'Sara Khan', product: 'Niacinamide Balance Serum', quote: 'The website made it surprisingly easy to browse by concern instead of guessing which product I should start with.' },
  ]

  useEffect(() => {
    if (!selectedProduct) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedProduct(null)
    }

    document.body.classList.add('overlay-open')
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.classList.remove('overlay-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedProduct])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getProducts({ sort: 'best-selling', limit: 4 }, { signal: controller.signal }),
      getProducts({ sort: 'newest', limit: 4 }, { signal: controller.signal }),
    ]).then(([best, arrivals]) => {
      if (controller.signal.aborted) return
      setBestSellers(best.data)
      setNewArrivals(arrivals.data)
    }).catch((error) => {
      if (error?.name !== 'AbortError' && !controller.signal.aborted) setCatalogError(true)
    })
    return () => controller.abort()
  }, [])

  return (
    <>
      <section className="homepage-hero">
        <div className="homepage-container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">
              Botanical skincare <span>•</span> Modern science
            </p>
            <h1>
              Healthy skin,
              <br />
              beautifully simple.
            </h1>
            <p className="hero-description">
              Thoughtful formulas for everyday concerns — designed to hydrate,
              restore and bring out your natural glow.
            </p>
            <div className="hero-actions">
              <Link className="button hero-primary" to="/shop">
                Shop bestsellers <ArrowRight size={15} />
              </Link>
              <Link className="hero-secondary" to="/shop">
                Explore by concern <ArrowRight size={15} />
              </Link>
            </div>
            <p className="hero-proof">
              Dermatologically considered <span>•</span> Cruelty-free <span>•</span>
              Thoughtfully formulated
            </p>
          </div>

          <div className="hero-visual">
            <img
              src={homeImages.hero}
              alt="Natural Beauty skincare bottles in soft botanical studio light"
            />
            <div className="ritual-label">
              <span>The daily ritual</span>
              <p>Cleanse <i>•</i> Treat <i>•</i> Hydrate <i>•</i> Protect</p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Natural Beauty commitments">
        <div className="homepage-container trust-grid">
          {trustItems.map(({ icon, title, text }) => {
            const Icon = trustIcons[icon]

            return (
              <article className="trust-item" key={title}>
                <Icon aria-hidden="true" size={19} strokeWidth={1.4} />
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="concerns-section homepage-container">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Find your formula</p>
            <h2>Shop by concern</h2>
          </div>
          <div className="section-heading-copy">
            <p>Target your routine around what your skin needs today.</p>
            <Link to="/shop">
              View all concerns <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <div className="concerns-grid">
          {concernTiles.map((concern) => (
            <Link className="concern-tile" to="/shop" key={concern.title}>
              <img src={concern.image} alt={concern.title} />
              <div className="concern-tile-content">
                <h3>{concern.title}</h3>
                <p>{concern.description}</p>
                <span aria-hidden="true">
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bestsellers-section homepage-container">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2>The best of Natural Beauty</h2>
          </div>
          <div className="section-heading-copy">
            <p>Everyday formulas our routines keep coming back to.</p>
            <Link to="/shop">
              View all products <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <div className="product-grid">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onChooseOptions={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      <section className="skin-types-section homepage-container">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Skin, understood</p>
            <h2>Care that starts with your skin.</h2>
          </div>
          <div className="section-heading-copy">
            <p>Build a routine around your skin type, its changing needs, and the concerns that matter to you.</p>
            <Link to="/shop">Explore all skin types <ArrowRight size={15} /></Link>
          </div>
        </header>
        <div className="skin-types-grid">
          {skinTypes.map((skin, index) => (
            <Link className={`skin-type-tile skin-type-${index + 1}`} to="/shop" key={skin.name}>
              <img src={skin.image} alt={`${skin.name} skin care`} />
              <div><h3>{skin.name}</h3><p>{skin.description}</p><ArrowRight size={17} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="brand-story-section homepage-container">
        <div className="brand-story-visual"><img src={homeImages.hero} alt="Botanical skincare bottles in soft natural light" /></div>
        <div className="brand-story-copy">
          <p className="eyebrow">Our philosophy</p>
          <h2>Nature, refined by thoughtful formulation.</h2>
          <p>We believe skincare should feel considered, uncomplicated and personal. Natural Beauty brings together botanical inspiration and modern cosmetic formulation to create everyday rituals designed around real skin needs.</p>
          <p>No crowded routines. No unnecessary complexity. Just purposeful care you can understand and enjoy using every day.</p>
          <Link className="hero-secondary" to="/about">Discover our story <ArrowRight size={15} /></Link>
          <div className="brand-note"><strong>Formulated with purpose</strong><span>Designed around skin needs, texture and everyday usability.</span></div>
        </div>
      </section>

      <section className="ingredient-section homepage-container">
        <div className="ingredient-visual"><img src={homeImages.hero} alt="Unbranded skincare bottles and botanical ingredients prepared for formulation" /></div>
        <div className="ingredient-copy">
          <p className="eyebrow">Formulas with intention</p>
          <h2>Ingredients your routine will recognize.</h2>
          <p>Discover familiar skincare actives and botanical ingredients, organized around what they bring to your ritual.</p>
          <div className="ingredient-list">
            {ingredients.map((ingredient) => <button key={ingredient.name}><span><strong>{ingredient.name}</strong><small>{ingredient.description}</small></span><ArrowRight size={16} /></button>)}
          </div>
        </div>
      </section>

      <section className="principles-strip"><div className="homepage-container principles-grid">{brandPrinciples.map((principle) => <article key={principle.title}><h3>{principle.title}</h3><p>{principle.text}</p></article>)}</div></section>

      <section className="ritual-banner"><img src={homeImages.hero} alt="A calm botanical skincare ritual arranged on stone" /><div className="ritual-banner-content"><p className="eyebrow">The daily ritual</p><h2>Small rituals.<br />Beautiful consistency.</h2><p>Build a simple routine for morning, evening and everything in between.</p><Link className="hero-secondary" to="/shop">Build your routine <ArrowRight size={15} /></Link></div></section>

      <section className="new-arrivals-section homepage-container">
        <header className="section-heading"><div><p className="eyebrow">Just in</p><h2>New to the ritual</h2></div><div className="section-heading-copy"><p>Fresh additions designed to find an easy place in your everyday routine.</p><Link to="/new-arrivals">Shop new arrivals <ArrowRight size={15} /></Link></div></header>
        <div className="product-grid">{newArrivals.map((product) => <ProductCard key={product.slug} product={product} onChooseOptions={setSelectedProduct} />)}</div>
        {catalogError && <p className="account-muted">This collection is temporarily unavailable. Please try again shortly.</p>}
      </section>

      <section className="routine-section homepage-container">
        <div className="routine-visual"><img src={homeImages.hero} alt="Unbranded skincare ritual products arranged on natural stone" /></div>
        <div className="routine-copy"><p className="eyebrow">Find your routine</p><h2>Your skin.<br />Your concerns.<br />Your ritual.</h2><p>Start with what your skin feels like today and discover products that fit naturally into your routine.</p><ol><li><span>01</span><strong>Choose your skin type</strong></li><li><span>02</span><strong>Tell us your main concern</strong></li><li><span>03</span><strong>Discover your routine</strong></li></ol><Link className="button" to="/shop">Find my routine <ArrowRight size={15} /></Link><Link className="routine-secondary" to="/shop">Shop all products</Link></div>
      </section>

      <section className="testimonials-section homepage-container">
        <div className="testimonial-feature"><p className="eyebrow">Notes from the ritual <span>• Demo content</span></p><div className="quote-mark">“</div><blockquote>{testimonials[testimonialIndex].quote}</blockquote><p className="testimonial-name">{testimonials[testimonialIndex].name}</p><p className="testimonial-product">★★★★★ &nbsp; {testimonials[testimonialIndex].product}</p></div>
        <div className="testimonial-list">{testimonials.map((testimonial, index) => <button key={testimonial.name} className={testimonialIndex === index ? 'is-active' : ''} onClick={() => setTestimonialIndex(index)}><span>0{index + 1}</span><strong>{testimonial.name}</strong><small>{testimonial.product}</small></button>)}</div>
      </section>

      <Newsletter />
      <Footer />

      <QuickOptions product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  )
}
