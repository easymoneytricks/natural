import { ArrowRight, Heart, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { QuickOptions } from '../components/product/QuickOptions'
import { concernTiles, homeImages, trustItems } from '../data/home'
import { products } from '../data/products'

const trustIcons = {
  sparkle: Sparkles,
  heart: Heart,
  shield: ShieldCheck,
  package: PackageCheck,
}

export function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)

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
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onChooseOptions={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      <section className="editorial-teaser skin-teaser">
        <div className="homepage-container">
          <p className="eyebrow">Skin, understood</p>
          <h2>Care that starts with your skin.</h2>
          <p>
            Build a routine around your skin type, not around trends.
          </p>
          <Link className="hero-secondary" to="/shop">Shop by skin type <ArrowRight size={15} /></Link>
        </div>
      </section>

      <QuickOptions product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  )
}
