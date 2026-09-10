import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Scale, X, ZoomIn, MapPin } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { useCart } from '../context/CartContext'
import { products, newArrivals } from '../data/products'
import { getProductBySlug } from '../services/catalogApi'
import { useCompare, useWishlist } from '../context/PreferenceContext'
import './ProductDetail.css'

const catalog = [...products, ...newArrivals]
const money = (value) => `₹${value.toLocaleString('en-IN')}`
const slugify = (value) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '-')

function makeVariants(product, detail) {
  if (detail.skus) return detail.skus.map((sku) => ({ skuId: sku.id, sku: sku.sku, attributes: Object.fromEntries(Object.entries(sku.attributes).map(([key, value]) => [key, value.value])), mrp: sku.mrp, price: sku.price, stock: sku.stock.available ?? 999, image: sku.primaryImage || product.image }))
  if (detail.variants) return detail.variants.map(([sku, size, skinType, concern, mrp, price, stock]) => ({ sku, attributes: { size, skinType, concern }, mrp, price, stock, image: product.image }))
  return product.sizes.map((size) => ({ sku: `NB-${slugify(product.slug)}-${slugify(size)}`, attributes: { size }, mrp: product.mrp, price: product.price, stock: product.availability === 'out-of-stock' ? 0 : 10, image: product.image }))
}

export function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const wishlist = useWishlist()
  const compareList = useCompare()
  const [product, setProduct] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(false)
    getProductBySlug(slug, { signal: controller.signal }).then((apiProduct) => {
      if (controller.signal.aborted) return
      setProduct(apiProduct)
      setDetail({ ...apiProduct, positioning: apiProduct.shortDescription, benefits: (apiProduct.benefits || []).map((benefit) => [benefit, '']), ingredients: (apiProduct.keyIngredients || []).map((ingredient) => [ingredient.name, ingredient.description || '']), fullIngredients: apiProduct.keyIngredients?.map((ingredient) => ingredient.name).join(', ') || '' })
    }).catch((error) => { if (error?.name !== 'AbortError' && !controller.signal.aborted) setLoadError(error?.code === 'PRODUCT_NOT_FOUND' ? 'not-found' : 'error') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [slug])
  const variants = useMemo(() => product ? makeVariants(product, detail) : [], [product, detail])
  const dimensions = product ? [...new Set(variants.flatMap((variant) => Object.keys(variant.attributes)))] : []
  const [selection, setSelection] = useState({})
  const [quantity, setQuantity] = useState(1)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [delivery, setDelivery] = useState(null)
  const [openInfo, setOpenInfo] = useState('Description')
  const [recent, setRecent] = useState([])

  useEffect(() => {
    if (!product) return
    const previous = JSON.parse(localStorage.getItem('natural-beauty-recent') || '[]').filter((item) => item !== product.slug)
    // oxlint-disable-next-line react/set-state-in-effect
    setRecent(previous.slice(0, 4))
    localStorage.setItem('natural-beauty-recent', JSON.stringify([product.slug, ...previous].slice(0, 5)))
  }, [product])

  useEffect(() => {
    if (!viewerOpen) return undefined
    const close = (event) => event.key === 'Escape' && setViewerOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [viewerOpen])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setSelection(dimensions.length ? { [dimensions[0]]: variants[0]?.attributes[dimensions[0]] } : {})
    // oxlint-disable-next-line react/set-state-in-effect
    setQuantity(1)
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (loading) return <section className="product-detail-loading container"><p className="eyebrow">Natural Beauty</p><h1>Finding your formula…</h1></section>
  if (loadError === 'not-found' || !product) return <section className="product-not-found container"><p className="eyebrow">Natural Beauty</p><h1>{loadError === 'error' ? "We couldn't load that formula." : "We couldn't find that formula."}</h1><p>{loadError === 'error' ? 'Please try again in a moment.' : 'This product may have moved, but there are still considered rituals waiting in the collection.'}</p><Link className="button" to="/shop">Return to shop</Link></section>

  const selectedVariant = variants.find((variant) => dimensions.every((dimension) => selection[dimension] && variant.attributes[dimension] === selection[dimension]))
  const gallery = product.gallery?.length ? product.gallery : [product.image, product.hoverImage].filter(Boolean)
  const availableValues = (dimension) => [...new Set(variants.filter((variant) => dimensions.filter((item) => item !== dimension).every((item) => !selection[item] || variant.attributes[item] === selection[item])).map((variant) => variant.attributes[dimension]))]
  const choose = (dimension, value) => {
    const next = { ...selection, [dimension]: value }
    dimensions.slice(dimensions.indexOf(dimension) + 1).forEach((later) => { if (!variants.some((variant) => dimensions.every((item) => !next[item] || variant.attributes[item] === next[item]))) delete next[later] })
    setSelection(next)
    setQuantity(1)
  }
  const price = selectedVariant?.price || Math.min(...variants.map((variant) => variant.price))
  const mrp = selectedVariant?.mrp || Math.min(...variants.map((variant) => variant.mrp))
  const discount = selectedVariant ? Math.round((1 - price / mrp) * 100) : null
  const stock = selectedVariant?.stock
  const addToBag = () => { if (!selectedVariant || stock < 1) return; addItem({ productId: product.id, skuId: selectedVariant.skuId, slug: product.slug, name: product.name, category: product.category, sku: selectedVariant.sku, attributes: selectedVariant.attributes, selectedAttributes: selectedVariant.attributes, price: selectedVariant.price, mrp: selectedVariant.mrp, unitPrice: selectedVariant.price, quantity, stock, availableStock: stock, image: selectedVariant.image }); }
  const related = catalog.filter((item) => item.slug !== product.slug && ['gentle-barrier-cleanser', 'hyaluronic-water-gel', 'daily-defence-spf-50', 'cica-recovery-gel'].includes(item.slug)).slice(0, 4)

  return <>
    <main className="product-detail container"><p className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <Link to="/shop">Shop</Link> <span>/</span> {product.name}</p>
      <div className="product-main"><section className="product-gallery"><div className="gallery-thumbs">{gallery.map((image, index) => <button key={image} className={galleryIndex === index ? 'is-selected' : ''} onClick={() => setGalleryIndex(index)} aria-label={`View product image ${index + 1}`}><img src={image} alt="" loading="lazy" /></button>)}</div><div className="gallery-stage"><button className="gallery-image-button" onClick={() => setViewerOpen(true)} aria-label="Open product image viewer"><img src={gallery[galleryIndex]} alt={product.name} /><span><ZoomIn size={15} /> Inspect image</span></button></div></section>
        <section className="purchase-panel"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="product-positioning">{detail.positioning}</p><p className="detail-rating">★ <strong>{product.rating}</strong> <span>Based on {product.reviews} reviews</span></p><div className="detail-price"><strong>{selectedVariant ? money(price) : `From ${money(price)}`}</strong>{mrp > price && <><s>{money(mrp)}</s>{discount && <em>{discount}% OFF</em>}</>}</div><div className="variant-selector">{dimensions.map((dimension) => <fieldset key={dimension}><legend>Select {dimension === 'skinType' ? 'skin type' : dimension}</legend><div className="variant-options">{[...new Set(variants.map((variant) => variant.attributes[dimension]))].map((value) => { const enabled = availableValues(dimension).includes(value); return <button key={value} className={selection[dimension] === value ? 'is-selected' : ''} disabled={!enabled} aria-pressed={selection[dimension] === value} onClick={() => choose(dimension, value)}>{value}</button> })}</div></fieldset>)}</div><div className={`stock-message ${selectedVariant && stock > 0 ? 'in-stock' : ''}`}>{!selectedVariant ? 'Choose options to resolve an exact SKU.' : stock === 0 ? 'OUT OF STOCK — This SKU is currently unavailable.' : stock <= 3 ? `Only ${stock} left` : 'IN STOCK'}{selectedVariant && <small>SKU: {selectedVariant.sku}</small>}</div><div className="quantity-row"><span>Quantity</span><div className="quantity"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><span>{quantity}</span><button onClick={() => setQuantity((value) => Math.min(stock || 1, value + 1))} disabled={!selectedVariant || quantity >= stock} aria-label="Increase quantity"><Plus size={14} /></button></div></div><div className="purchase-actions"><button className="button" disabled={!selectedVariant || stock < 1} onClick={addToBag}>Add to bag</button><button className="button button-secondary" disabled={!selectedVariant || stock < 1} onClick={() => { addToBag(); navigate('/cart') }}>Buy now</button></div><div className="secondary-actions"><button onClick={() => wishlist.toggle(product, { preferredSku: selectedVariant?.sku, preferredAttributes: selectedVariant?.attributes })} aria-pressed={wishlist.has(product.slug)}><Heart size={17} fill={wishlist.has(product.slug) ? 'currentColor' : 'none'} /> {wishlist.has(product.slug) ? 'Wishlisted' : 'Wishlist'}</button><button onClick={() => compareList.toggle(product)} aria-pressed={compareList.has(product.slug)}><Scale size={17} /> {compareList.has(product.slug) ? 'Added to compare' : 'Add to compare'}</button></div><div className="delivery-check"><p><MapPin size={15} /> Delivery options</p><div><input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter PIN code" aria-label="Enter PIN code" inputMode="numeric" /><button onClick={() => setDelivery(/^\d{6}$/.test(pin))}>Check</button></div>{delivery === true && <small>Delivery estimate: 3–5 business days · Cash on Delivery available · Complimentary shipping on orders above ₹999.</small>}{delivery === false && <small className="error">Enter a valid 6-digit demo PIN code.</small>}</div></section></div>
      <section className="benefits-section">{detail.benefits.map(([title, text]) => <article key={title}><p>{title}</p><span>{text}</span></article>)}</section><section className="editorial-columns"><div><p className="eyebrow">How to use</p><h2>A quiet ritual, morning or evening.</h2><ol className="how-to-use">{['Cleanse|Start with clean, slightly damp or dry skin.', 'Apply|Massage a small amount across face and neck.', 'Layer|Use after serums and before sunscreen in your morning routine.', 'Repeat|Use morning and/or evening according to your routine.'].map((step) => { const [title, text] = step.split('|'); return <li key={title}><b>{String(['Cleanse', 'Apply', 'Layer', 'Repeat'].indexOf(title) + 1).padStart(2, '0')}</b><span><strong>{title}</strong>{text}</span></li> })}</ol></div><div><p className="eyebrow">Key ingredients</p><h2>Comfort, considered.</h2>{detail.ingredients.map(([name, text]) => <div className="ingredient-line" key={name}><strong>{name}</strong><span>{text}</span></div>)}<p className="full-ingredients"><strong>Full ingredient list</strong>{detail.fullIngredients}</p></div></section>
      <section className="info-accordions">{['Description', 'Ingredients', 'How to Use', "Who It's For", 'Shipping & Returns'].map((title) => <div key={title}><button aria-expanded={openInfo === title} onClick={() => setOpenInfo(openInfo === title ? '' : title)}><span>{title}</span><Plus size={16} /></button>{openInfo === title && <p>{title === 'Description' ? detail.positioning : title === 'Ingredients' ? detail.fullIngredients : title === 'Who It\'s For' ? 'For dry, dehydrated and stressed-feeling skin seeking comfortable daily moisture.' : title === 'Shipping & Returns' ? 'Complimentary shipping applies above ₹999. Returns are handled according to the store policy.' : 'Apply after cleansing and serums, morning and/or evening.'}</p>}</div>)}</section>
      <Reviews product={product} /><ProductRail title="Pair it with" items={related} />{recent.length > 0 && <ProductRail title="Recently viewed" items={recent.map((item) => catalog.find((entry) => entry.slug === item)).filter(Boolean)} />}
    </main>{viewerOpen && <div className="image-viewer" role="dialog" aria-modal="true" aria-label="Product image viewer"><button className="viewer-backdrop" onClick={() => setViewerOpen(false)} aria-label="Close image viewer" /><div className="viewer-content"><button onClick={() => setViewerOpen(false)} aria-label="Close image viewer"><X /></button><img src={gallery[galleryIndex]} alt={product.name} /><button onClick={() => setGalleryIndex((galleryIndex + gallery.length - 1) % gallery.length)} aria-label="Previous image"><ChevronLeft /></button><button onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} aria-label="Next image"><ChevronRight /></button></div></div>}
    <div className="mobile-sticky-buy"><span>{selectedVariant ? money(price) : 'Choose options'}</span><button disabled={!selectedVariant || stock < 1} onClick={addToBag}>{!selectedVariant ? 'Choose options' : stock === 0 ? 'Out of stock' : 'Add to bag'}</button></div>
  </>
}

function Reviews({ product }) { return <section className="reviews-section"><div><p className="eyebrow">Reviews</p><h2>{product.rating}</h2><p className="stars">★★★★★</p><span>Based on {product.reviews} reviews</span></div><div className="review-bars">{[5, 4, 3, 2, 1].map((star, index) => <p key={star}><span>{star} stars</span><i><b style={{ width: `${[92, 6, 1, 0, 1][index]}%` }} /></i></p>)}</div><div className="review-quotes"><blockquote>“Comforting without feeling too heavy.”<cite>Aanya M. · 50 ml · Dry · Dryness</cite></blockquote><blockquote>“My skin feels calm and soft by morning.”<cite>Meera K. · 100 ml · Sensitive · Barrier Support</cite></blockquote><blockquote>“A lovely everyday layer under sunscreen.”<cite>Rhea S. · 50 ml · Combination · Barrier Support</cite></blockquote></div></section> }
function ProductRail({ title, items }) { return <section className="product-rail"><div className="section-heading"><p className="eyebrow">{title}</p><Link to="/shop">Shop all <ChevronRight size={15} /></Link></div><div className="product-grid">{items.map((item) => <ProductCard key={item.slug} product={item} onChooseOptions={() => {}} />)}</div></section> }
