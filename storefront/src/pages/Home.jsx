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
  homeImages,
} from "../data/home";
import { getCategories, getProducts } from "../services/catalogApi";
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
  const [categories, setCategories] = useState([]);
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
  const categoryEyebrow = String(homepage.category_eyebrow || "").trim();
  const categoryTitle = String(homepage.category_title || "").trim();
  const categoryDescription = String(
    homepage.category_description || "",
  ).trim();
  const categoryLinkLabel = String(homepage.category_link_label || "").trim();
  const categoryLinkUrl = String(homepage.category_link_url || "").trim();
  const groupsEyebrow = String(homepage.groups_eyebrow || "").trim();
  const groupsTitle = String(homepage.groups_title || "").trim();
  const groupsDescription = String(homepage.groups_description || "").trim();
  const groupsLinkLabel = String(homepage.groups_link_label || "").trim();
  const groupsLinkUrl = String(homepage.groups_link_url || "").trim();
  const brandEyebrow = String(homepage.brand_eyebrow || "").trim();
  const brandTitle = String(homepage.brand_title || "").trim();
  const brandDescription = String(homepage.brand_description || "").trim();
  const brandLinkLabel = String(homepage.brand_link_label || "").trim();
  const brandLinkUrl = String(homepage.brand_link_url || "").trim();
  const brandImageSetting = String(homepage.brand_image_url || "").trim();
  const brandImageUrl =
    brandImageSetting === "local:hero" ? homeImages.hero : brandImageSetting;
  const brandImageAlt = String(homepage.brand_image_alt || "").trim();
  const brandNoteTitle = String(homepage.brand_note_title || "").trim();
  const brandNoteText = String(homepage.brand_note_text || "").trim();
  const ingredientsEyebrow = String(homepage.ingredients_eyebrow || "").trim();
  const ingredientsTitle = String(homepage.ingredients_title || "").trim();
  const ingredientsDescription = String(
    homepage.ingredients_description || "",
  ).trim();
  const ingredientsImageSetting = String(
    homepage.ingredients_image_url || "",
  ).trim();
  const ingredientsImageUrl =
    ingredientsImageSetting === "local:hero"
      ? homeImages.hero
      : ingredientsImageSetting;
  const ingredientsImageAlt = String(
    homepage.ingredients_image_alt || "",
  ).trim();
  const productHighlights = [1, 2, 3, 4, 5, 6]
    .map((number) => ({
      name: String(homepage[`highlight_${number}_title`] || "").trim(),
      description: String(homepage[`highlight_${number}_text`] || "").trim(),
    }))
    .filter(({ name, description }) => name && description);
  const principlesTitle = String(homepage.principles_title || "").trim();
  const principles = [1, 2, 3]
    .map((number) => ({
      title: String(homepage[`principle_${number}_title`] || "").trim(),
      text: String(homepage[`principle_${number}_text`] || "").trim(),
    }))
    .filter(({ title, text }) => title && text);
  const ritualEyebrow = String(homepage.ritual_eyebrow || "").trim();
  const ritualTitle = String(homepage.ritual_title || "").trim();
  const ritualDescription = String(homepage.ritual_description || "").trim();
  const ritualLinkLabel = String(homepage.ritual_link_label || "").trim();
  const ritualLinkUrl = String(homepage.ritual_link_url || "").trim();
  const ritualImageSetting = String(homepage.ritual_image_url || "").trim();
  const ritualImageUrl =
    ritualImageSetting === "local:hero"
      ? homeImages.hero
      : ritualImageSetting;
  const ritualImageAlt = String(homepage.ritual_image_alt || "").trim();
  const newEyebrow = String(homepage.new_eyebrow || "").trim();
  const newTitle = String(homepage.new_title || "").trim();
  const newDescription = String(homepage.new_description || "").trim();
  const newLinkLabel = String(homepage.new_link_label || "").trim();
  const newLinkUrl = String(homepage.new_link_url || "").trim();
  const routineEyebrow = String(homepage.routine_eyebrow || "").trim();
  const routineTitle = String(homepage.routine_title || "").trim();
  const routineDescription = String(homepage.routine_description || "").trim();
  const routineSteps = [1, 2, 3].map((step) =>
    String(homepage[`routine_step_${step}`] || "").trim(),
  );
  const routineLinkLabel = String(homepage.routine_link_label || "").trim();
  const routineLinkUrl = String(homepage.routine_link_url || "").trim();
  const routineSecondaryLabel = String(
    homepage.routine_secondary_label || "",
  ).trim();
  const routineSecondaryUrl = String(
    homepage.routine_secondary_url || "",
  ).trim();
  const routineImageSetting = String(homepage.routine_image_url || "").trim();
  const routineImageUrl =
    routineImageSetting === "local:hero" ? homeImages.hero : routineImageSetting;
  const routineImageAlt = String(homepage.routine_image_alt || "").trim();
  const featuredEyebrow = String(homepage.featured_eyebrow || "").trim();
  const featuredTitle = String(homepage.featured_title || "").trim();
  const featuredDescription = String(
    homepage.featured_description || "",
  ).trim();
  const featuredLinkLabel = String(homepage.featured_link_label || "").trim();
  const featuredLinkUrl = String(homepage.featured_link_url || "").trim();
  const limits = storeSettings.homepage_limits || {};
  const parentCategories = categories.filter(
    (category) => category.parentId === null || category.parentId === undefined,
  );
  const childCategories = categories.filter(
    (category) => category.parentId !== null && category.parentId !== undefined,
  );
  const itemLimit = (name, fallback) => {
    const value = Number(limits[`${name}_${isMobile ? "mobile" : "desktop"}`]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };
  const featuredProductLimit = itemLimit("featured_products", 4);
  const newProductLimit = itemLimit("new_products", 4);
  const categoryLimit = itemLimit("category_highlights", childCategories.length);
  const productGroupLimit = itemLimit("product_groups", parentCategories.length);
  const trustHighlights = ["sparkle", "heart", "shield", "package"]
    .map((icon, index) => ({
      icon,
      title: String(
        storeSettings.trust?.[`item_${index + 1}_title`] || "",
      ).trim(),
      text: String(
        storeSettings.trust?.[`item_${index + 1}_text`] || "",
      ).trim(),
    }))
    .filter(({ title, text }) => title && text);
  const visible = (section) =>
    storeSettings.homepage_sections?.[section] !== "false";

  const testimonialsEyebrow = String(
    homepage.testimonials_eyebrow || "",
  ).trim();
  const testimonials = [1, 2, 3, 4]
    .map((number) => ({
      name: String(homepage[`testimonial_${number}_name`] || "").trim(),
      product: String(homepage[`testimonial_${number}_product`] || "").trim(),
      quote: String(homepage[`testimonial_${number}_quote`] || "").trim(),
    }))
    .filter(({ name, product, quote }) => name && product && quote);
  const activeTestimonial =
    testimonials[testimonialIndex] || testimonials[0] || {
      name: "",
      product: "",
      quote: "",
    };

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
      getCategories({ signal: controller.signal }),
      getProducts(
        { sort: "best-selling", limit: 12 },
        { signal: controller.signal },
      ),
      getProducts({ sort: "newest", limit: 12 }, { signal: controller.signal }),
    ])
      .then(([categoryPayload, best, arrivals]) => {
        if (controller.signal.aborted) return;
        setCategories(categoryPayload.data);
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
          {trustHighlights.map(({ icon, title, text }) => {
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
            {categoryEyebrow && <p className="eyebrow">{categoryEyebrow}</p>}
            {categoryTitle && <h2>{categoryTitle}</h2>}
          </div>
          <div className="section-heading-copy">
            {categoryDescription && <p>{categoryDescription}</p>}
            {categoryLinkLabel && categoryLinkUrl && (
              <Link to={categoryLinkUrl}>
                {categoryLinkLabel} <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </header>

        <div className="concerns-grid">
          {childCategories.slice(0, categoryLimit).map((category) => (
            <Link
              className="concern-tile"
              to={`/shop?category=${encodeURIComponent(category.slug)}`}
              key={category.id || category.slug}
            >
              {category.image && (
                <img src={category.image} alt={category.name} />
              )}
              <div className="concern-tile-content">
                <h3>{category.name}</h3>
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
            {featuredEyebrow && <p className="eyebrow">{featuredEyebrow}</p>}
            {featuredTitle && <h2>{featuredTitle}</h2>}
          </div>
          <div className="section-heading-copy">
            {featuredDescription && <p>{featuredDescription}</p>}
            {featuredLinkLabel && featuredLinkUrl && (
              <Link to={featuredLinkUrl}>
                {featuredLinkLabel} <ArrowRight size={15} />
              </Link>
            )}
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
            {groupsEyebrow && <p className="eyebrow">{groupsEyebrow}</p>}
            {groupsTitle && <h2>{groupsTitle}</h2>}
          </div>
          <div className="section-heading-copy">
            <p>{groupsDescription}</p>
            {groupsLinkLabel && groupsLinkUrl && (
              <Link to={groupsLinkUrl}>
                {groupsLinkLabel} <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </header>
        <div className="skin-types-grid">
          {parentCategories
            .slice(0, productGroupLimit)
            .map((category, index) => (
              <Link
                className={`skin-type-tile skin-type-${index + 1}`}
                to={`/shop?category=${encodeURIComponent(category.slug)}`}
                key={category.id || category.slug}
              >
                {category.image && (
                  <img src={category.image} alt={category.name} />
                )}
                <div>
                  <h3>{category.name}</h3>
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
          {brandImageUrl && <img src={brandImageUrl} alt={brandImageAlt} />}
        </div>
        <div className="brand-story-copy">
          {brandEyebrow && <p className="eyebrow">{brandEyebrow}</p>}
          {brandTitle && <h2>{brandTitle}</h2>}
          {brandDescription && <p>{brandDescription}</p>}
          {brandLinkLabel && brandLinkUrl && (
            <Link className="hero-secondary" to={brandLinkUrl}>
              {brandLinkLabel} <ArrowRight size={15} />
            </Link>
          )}
          {(brandNoteTitle || brandNoteText) && (
            <div className="brand-note">
              {brandNoteTitle && <strong>{brandNoteTitle}</strong>}
              {brandNoteText && <span>{brandNoteText}</span>}
            </div>
          )}
        </div>
      </section>

      <section
        className="ingredient-section homepage-container"
        hidden={!visible("ingredient")}
      >
        <div className="ingredient-visual">
          {ingredientsImageUrl && (
            <img src={ingredientsImageUrl} alt={ingredientsImageAlt} />
          )}
        </div>
        <div className="ingredient-copy">
          {ingredientsEyebrow && (
            <p className="eyebrow">{ingredientsEyebrow}</p>
          )}
          {ingredientsTitle && <h2>{ingredientsTitle}</h2>}
          {ingredientsDescription && <p>{ingredientsDescription}</p>}
          <div className="ingredient-list">
            {productHighlights.map((highlight) => (
              <button key={highlight.name}>
                <span>
                  <strong>{highlight.name}</strong>
                  <small>{highlight.description}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="principles-strip"
        aria-label={principlesTitle || undefined}
        hidden={!visible("principles") || principles.length === 0}
      >
        <div className="homepage-container principles-grid">
          {principles.map((principle) => (
            <article key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ritual-banner" hidden={!visible("ritual")}>
        {ritualImageUrl && <img src={ritualImageUrl} alt={ritualImageAlt} />}
        <div className="ritual-banner-content">
          {ritualEyebrow && <p className="eyebrow">{ritualEyebrow}</p>}
          {ritualTitle && (
            <h2>
              {ritualTitle.split("\n").map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          )}
          {ritualDescription && <p>{ritualDescription}</p>}
          {ritualLinkLabel && ritualLinkUrl && (
            <Link className="hero-secondary" to={ritualLinkUrl}>
              {ritualLinkLabel} <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </section>

      <section
        className="new-arrivals-section homepage-container"
        hidden={!visible("new_arrivals")}
      >
        <header className="section-heading">
          <div>
            {newEyebrow && <p className="eyebrow">{newEyebrow}</p>}
            {newTitle && <h2>{newTitle}</h2>}
          </div>
          <div className="section-heading-copy">
            {newDescription && <p>{newDescription}</p>}
            {newLinkLabel && newLinkUrl && (
              <Link to={newLinkUrl}>
                {newLinkLabel} <ArrowRight size={15} />
              </Link>
            )}
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
          {routineImageUrl && <img src={routineImageUrl} alt={routineImageAlt} />}
        </div>
        <div className="routine-copy">
          {routineEyebrow && <p className="eyebrow">{routineEyebrow}</p>}
          {routineTitle && (
            <h2>
              {routineTitle.split("\n").map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          )}
          {routineDescription && <p>{routineDescription}</p>}
          {routineSteps.some(Boolean) && (
            <ol>
              {routineSteps.map(
                (step, index) =>
                  step && (
                    <li key={`${step}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{step}</strong>
                    </li>
                  ),
              )}
            </ol>
          )}
          {routineLinkLabel && routineLinkUrl && (
            <Link className="button" to={routineLinkUrl}>
              {routineLinkLabel} <ArrowRight size={15} />
            </Link>
          )}
          {routineSecondaryLabel && routineSecondaryUrl && (
            <Link className="routine-secondary" to={routineSecondaryUrl}>
              {routineSecondaryLabel}
            </Link>
          )}
        </div>
      </section>

      <section
        className="testimonials-section homepage-container"
        hidden={!visible("testimonials") || testimonials.length === 0}
      >
        <div className="testimonial-feature">
          {testimonialsEyebrow && (
            <p className="eyebrow">{testimonialsEyebrow}</p>
          )}
          <div className="quote-mark">“</div>
          <blockquote>{activeTestimonial.quote}</blockquote>
          <p className="testimonial-name">
            {activeTestimonial.name}
          </p>
          <p className="testimonial-product">
            ★★★★★ &nbsp; {activeTestimonial.product}
          </p>
        </div>
        <div className="testimonial-list">
          {testimonials.map((testimonial, index) => (
            <button
              key={`${testimonial.name}-${index}`}
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
