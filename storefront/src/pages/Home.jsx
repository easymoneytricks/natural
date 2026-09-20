import {
  ArrowRight,
  Heart,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { QuickOptions } from "../components/product/QuickOptions";
import { Newsletter } from "../components/layout/Newsletter";
import {
  brandPrinciples,
  concernTiles,
  homeImages,
  ingredients,
  skinTypes,
  trustItems,
} from "../data/home";
import { getProducts } from "../services/catalogApi";
import { useStoreSettings } from "../context/StoreSettingsContext";

const trustIcons = {
  sparkle: Sparkles,
  heart: Heart,
  shield: ShieldCheck,
  package: PackageCheck,
};

export function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [catalogError, setCatalogError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const storeSettings = useStoreSettings();
  const homepage = storeSettings.homepage || {};
  const heroEyebrow = String(homepage.hero_eyebrow || "").trim();
  const heroTitle = String(homepage.hero_title || "").trim();
  const heroDescription = String(homepage.hero_description || "").trim();
  const heroImageSetting = String(homepage.hero_image_url || "").trim();
  const heroImageUrl =
    heroImageSetting === "local:hero" ? homeImages.hero : heroImageSetting;
  const heroImageAlt = String(homepage.hero_image_alt || "").trim();
  const primaryCtaLabel = String(homepage.primary_cta_label || "").trim();
  const primaryCtaUrl = String(homepage.primary_cta_url || "").trim();
  const secondaryCtaLabel = String(homepage.secondary_cta_label || "").trim();
  const secondaryCtaUrl = String(homepage.secondary_cta_url || "").trim();
  const heroProof = String(homepage.hero_proof || "").trim();
  const heroRitualTitle = String(homepage.hero_ritual_title || "").trim();
  const heroRitualText = String(homepage.hero_ritual_text || "").trim();
  const limits = storeSettings.homepage_limits || {};
  const itemLimit = (name, fallback) => {
    const value = Number(limits[`${name}_${isMobile ? "mobile" : "desktop"}`]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };
  const featuredProductLimit = itemLimit("featured_products", 4);
  const newProductLimit = itemLimit("new_products", 4);
  const categoryLimit = itemLimit("category_highlights", concernTiles.length);
  const productGroupLimit = itemLimit("product_groups", skinTypes.length);
  const visible = (section) =>
    storeSettings.homepage_sections?.[section] !== "false";

  const testimonials = [
    {
      name: "Aanya Mehta",
      product: "Barrier Restore Moisturizer",
      quote:
        "The Barrier Restore Moisturizer became the easiest part of my evening routine. The texture feels rich without feeling heavy.",
    },
    {
      name: "Riya Kapoor",
      product: "Vitamin C Radiance Serum",
      quote:
        "I love how simple the routine feels. The Vitamin C serum layers beautifully under sunscreen in the morning.",
    },
    {
      name: "Meera Sharma",
      product: "Gentle Barrier Cleanser",
      quote:
        "The cleanser and moisturizer combination feels gentle and uncomplicated, which is exactly what I wanted from my routine.",
    },
    {
      name: "Sara Khan",
      product: "Niacinamide Balance Serum",
      quote:
        "The website made it surprisingly easy to browse by concern instead of guessing which product I should start with.",
    },
  ];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedProduct(null);
    };

    document.body.classList.add("overlay-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("overlay-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProduct]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getProducts(
        { sort: "best-selling", limit: 12 },
        { signal: controller.signal },
      ),
      getProducts({ sort: "newest", limit: 12 }, { signal: controller.signal }),
    ])
      .then(([best, arrivals]) => {
        if (controller.signal.aborted) return;
        setBestSellers(best.data);
        setNewArrivals(arrivals.data);
      })
      .catch((error) => {
        if (error?.name !== "AbortError" && !controller.signal.aborted)
          setCatalogError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="homepage-hero" hidden={!visible("hero")}>
        <div className="homepage-container hero-layout">
          <div className="hero-copy">
            {heroEyebrow && <p className="eyebrow">{heroEyebrow}</p>}
            {heroTitle && <h1>{heroTitle}</h1>}
            {heroDescription && (
              <p className="hero-description">{heroDescription}</p>
            )}
            {(primaryCtaLabel && primaryCtaUrl) ||
            (secondaryCtaLabel && secondaryCtaUrl) ? (
              <div className="hero-actions">
                {primaryCtaLabel && primaryCtaUrl && (
                  <Link className="button hero-primary" to={primaryCtaUrl}>
                    {primaryCtaLabel} <ArrowRight size={15} />
                  </Link>
                )}
                {secondaryCtaLabel && secondaryCtaUrl && (
                  <Link className="hero-secondary" to={secondaryCtaUrl}>
                    {secondaryCtaLabel} <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            ) : null}
            {heroProof && <p className="hero-proof">{heroProof}</p>}
          </div>

          {heroImageUrl && (
            <div className="hero-visual">
              <img src={heroImageUrl} alt={heroImageAlt} />
              {(heroRitualTitle || heroRitualText) && (
                <div className="ritual-label">
                  {heroRitualTitle && <span>{heroRitualTitle}</span>}
                  {heroRitualText && <p>{heroRitualText}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section
        className="trust-strip"
        aria-label="Natural Beauty commitments"
        hidden={!visible("trust")}
      >
        <div className="homepage-container trust-grid">
          {trustItems.map(({ icon, title, text }) => {
            const Icon = trustIcons[icon];

            return (
              <article className="trust-item" key={title}>
                <Icon aria-hidden="true" size={19} strokeWidth={1.4} />
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="concerns-section homepage-container"
        hidden={!visible("concerns")}
      >
        <header className="section-heading">
          <div>
            <p className="eyebrow">Explore the collection</p>
            <h2>Featured categories</h2>
          </div>
          <div className="section-heading-copy">
            <p>Browse products by the way you like to shop.</p>
            <Link to="/shop">
              View all categories <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <div className="concerns-grid">
          {concernTiles.slice(0, categoryLimit).map((concern) => (
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

      <section
        className="bestsellers-section homepage-container"
        hidden={!visible("bestsellers")}
      >
        <header className="section-heading">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2>The best of Natural Beauty</h2>
          </div>
          <div className="section-heading-copy">
            <p>Customer favourites selected from the full collection.</p>
            <Link to="/shop">
              View all products <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <div className="product-grid">
          {bestSellers.slice(0, featuredProductLimit).map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onChooseOptions={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      <section
        className="skin-types-section homepage-container"
        hidden={!visible("skin_types")}
      >
        <header className="section-heading">
          <div>
            <p className="eyebrow">Find your fit</p>
            <h2>Shop by product group.</h2>
          </div>
          <div className="section-heading-copy">
            <p>
              Explore products grouped around the needs and preferences that
              matter to you.
            </p>
            <Link to="/shop">
              Explore all groups <ArrowRight size={15} />
            </Link>
          </div>
        </header>
        <div className="skin-types-grid">
          {skinTypes.slice(0, productGroupLimit).map((skin, index) => (
            <Link
              className={`skin-type-tile skin-type-${index + 1}`}
              to="/shop"
              key={skin.name}
            >
              <img src={skin.image} alt={skin.name} />
              <div>
                <h3>{skin.name}</h3>
                <p>{skin.description}</p>
                <ArrowRight size={17} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="brand-story-section homepage-container"
        hidden={!visible("brand_story")}
      >
        <div className="brand-story-visual">
          <img
            src={homeImages.hero}
            alt="Botanical skincare bottles in soft natural light"
          />
        </div>
        <div className="brand-story-copy">
          <p className="eyebrow">Our philosophy</p>
          <h2>Nature, refined by thoughtful formulation.</h2>
          <p>
            We believe skincare should feel considered, uncomplicated and
            personal. Natural Beauty brings together botanical inspiration and
            modern cosmetic formulation to create everyday rituals designed
            around real skin needs.
          </p>
          <p>
            No crowded routines. No unnecessary complexity. Just purposeful care
            you can understand and enjoy using every day.
          </p>
          <Link className="hero-secondary" to="/about">
            Discover our story <ArrowRight size={15} />
          </Link>
          <div className="brand-note">
            <strong>Formulated with purpose</strong>
            <span>
              Designed around skin needs, texture and everyday usability.
            </span>
          </div>
        </div>
      </section>

      <section
        className="ingredient-section homepage-container"
        hidden={!visible("ingredient")}
      >
        <div className="ingredient-visual">
          <img
            src={homeImages.hero}
            alt="Unbranded skincare bottles and botanical ingredients prepared for formulation"
          />
        </div>
        <div className="ingredient-copy">
          <p className="eyebrow">Formulas with intention</p>
          <h2>Ingredients your routine will recognize.</h2>
          <p>
            Discover familiar skincare actives and botanical ingredients,
            organized around what they bring to your ritual.
          </p>
          <div className="ingredient-list">
            {ingredients.map((ingredient) => (
              <button key={ingredient.name}>
                <span>
                  <strong>{ingredient.name}</strong>
                  <small>{ingredient.description}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="principles-strip" hidden={!visible("principles")}>
        <div className="homepage-container principles-grid">
          {brandPrinciples.map((principle) => (
            <article key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ritual-banner" hidden={!visible("ritual")}>
        <img
          src={homeImages.hero}
          alt="A calm botanical skincare ritual arranged on stone"
        />
        <div className="ritual-banner-content">
          <p className="eyebrow">The daily ritual</p>
          <h2>
            Small rituals.
            <br />
            Beautiful consistency.
          </h2>
          <p>
            Build a simple routine for morning, evening and everything in
            between.
          </p>
          <Link className="hero-secondary" to="/shop">
            Build your routine <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section
        className="new-arrivals-section homepage-container"
        hidden={!visible("new_arrivals")}
      >
        <header className="section-heading">
          <div>
            <p className="eyebrow">Just in</p>
            <h2>New to the ritual</h2>
          </div>
          <div className="section-heading-copy">
            <p>
              Fresh additions designed to find an easy place in your everyday
              routine.
            </p>
            <Link to="/new-arrivals">
              Shop new arrivals <ArrowRight size={15} />
            </Link>
          </div>
        </header>
        <div className="product-grid">
          {newArrivals.slice(0, newProductLimit).map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onChooseOptions={setSelectedProduct}
            />
          ))}
        </div>
        {catalogError && (
          <p className="account-muted">
            This collection is temporarily unavailable. Please try again
            shortly.
          </p>
        )}
      </section>

      <section
        className="routine-section homepage-container"
        hidden={!visible("routine")}
      >
        <div className="routine-visual">
          <img
            src={homeImages.hero}
            alt="Unbranded skincare ritual products arranged on natural stone"
          />
        </div>
        <div className="routine-copy">
          <p className="eyebrow">Find your routine</p>
          <h2>
            Your products.
            <br />
            Your preferences.
            <br />
            Your choice.
          </h2>
          <p>
            Start with what you need today and discover products that fit
            naturally into your routine.
          </p>
          <ol>
            <li>
              <span>01</span>
              <strong>Choose a product group</strong>
            </li>
            <li>
              <span>02</span>
              <strong>Choose your preference</strong>
            </li>
            <li>
              <span>03</span>
              <strong>Discover your selection</strong>
            </li>
          </ol>
          <Link className="button" to="/shop">
            Explore products <ArrowRight size={15} />
          </Link>
          <Link className="routine-secondary" to="/shop">
            Shop all products
          </Link>
        </div>
      </section>

      <section
        className="testimonials-section homepage-container"
        hidden={!visible("testimonials")}
      >
        <div className="testimonial-feature">
          <p className="eyebrow">Notes from the ritual</p>
          <div className="quote-mark">“</div>
          <blockquote>{testimonials[testimonialIndex].quote}</blockquote>
          <p className="testimonial-name">
            {testimonials[testimonialIndex].name}
          </p>
          <p className="testimonial-product">
            ★★★★★ &nbsp; {testimonials[testimonialIndex].product}
          </p>
        </div>
        <div className="testimonial-list">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              className={testimonialIndex === index ? "is-active" : ""}
              onClick={() => setTestimonialIndex(index)}
            >
              <span>0{index + 1}</span>
              <strong>{testimonial.name}</strong>
              <small>{testimonial.product}</small>
            </button>
          ))}
        </div>
      </section>

      {visible("newsletter") && <Newsletter />}
      <QuickOptions
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
