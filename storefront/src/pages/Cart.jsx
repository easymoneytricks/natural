import { useState } from 'react'
import { Minus, Plus, Trash2, Heart, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { useCart } from '../context/CartContext'
import { products, newArrivals } from '../data/products'
import { demoCoupons, demoGiftCards, shippingRules } from '../data/promotions'
import './Cart.css'

const money = (value) => `₹${Math.max(0, value).toLocaleString('en-IN')}`
const catalog = [...products, ...newArrivals]

export function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [giftInput, setGiftInput] = useState('')
  const [gift, setGift] = useState(null)
  const [giftMessage, setGiftMessage] = useState('')
  const [wishlistMessage, setWishlistMessage] = useState('')
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const mrpTotal = items.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0)
  const productDiscount = mrpTotal - subtotal
  const couponDiscount = coupon ? Math.min(coupon.type === 'percentage' ? subtotal * coupon.value / 100 : coupon.value, coupon.maximum || Infinity) : 0
  const shipping = subtotal >= shippingRules.threshold ? 0 : shippingRules.fee
  const giftApplied = gift ? Math.min(gift.balance, Math.max(0, subtotal - couponDiscount + shipping)) : 0
  const total = Math.max(0, subtotal - couponDiscount + shipping - giftApplied)
  const unavailable = items.some((item) => item.stock < 1)
  const recommendations = catalog.filter((product) => !items.some((item) => item.slug === product.slug)).slice(0, 4)

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    const candidate = demoCoupons[code]
    if (!candidate) return setCouponMessage("This coupon code isn't valid.")
    if (candidate.expired) return setCouponMessage('This coupon has expired.')
    if (subtotal < candidate.minimum) return setCouponMessage(`Add ${money(candidate.minimum - subtotal)} more to use this coupon.`)
    setCoupon({ ...candidate, code }); setCouponMessage('')
  }
  const redeemGift = () => {
    const code = giftInput.trim().toUpperCase()
    const candidate = demoGiftCards[code]
    if (!candidate) return setGiftMessage("This gift card code isn't valid.")
    if (candidate.expired) return setGiftMessage('This gift card has expired.')
    if (!candidate.balance) return setGiftMessage('This gift card has no available balance.')
    setGift({ ...candidate, code }); setGiftMessage('')
  }
  const moveToWishlist = (item) => {
    try {
      const current = JSON.parse(localStorage.getItem('natural-beauty-wishlist') || '[]')
      if (!current.some((entry) => entry.sku === item.sku)) localStorage.setItem('natural-beauty-wishlist', JSON.stringify([...current, { slug: item.slug, sku: item.sku, attributes: item.attributes }]))
    } catch { localStorage.setItem('natural-beauty-wishlist', JSON.stringify([{ slug: item.slug, sku: item.sku, attributes: item.attributes }])) }
    removeItem(item.sku); setWishlistMessage(`${item.name} moved to wishlist.`); window.setTimeout(() => setWishlistMessage(''), 2800)
  }

  if (!items.length) return <><section className="cart-empty-page container"><p className="eyebrow">Your bag</p><h1>Your ritual is waiting.</h1><p>Explore skincare by concern, skin type or the formulas that catch your eye.</p><Link className="button" to="/shop">Explore skincare <ArrowRight size={15} /></Link><Link className="empty-secondary" to="/best-sellers">View best sellers</Link></section><Recommendations items={recommendations} /></>

  return <><main className="cart-page container"><p className="breadcrumb"><Link to="/">Home</Link> <span>/</span> Bag</p><header className="cart-header"><p className="eyebrow">Your bag</p><h1>Your skincare ritual</h1><p>Review your selections before continuing to checkout.</p></header><ShippingProgress subtotal={subtotal} /><div className="cart-layout"><section className="cart-lines">{items.map((item) => <CartLine key={item.sku} item={item} onUpdate={updateQuantity} onRemove={removeItem} onWishlist={moveToWishlist} />)}<div className="cart-links"><Link to="/shop">← Continue shopping</Link><button onClick={clearCart}>Clear bag</button></div><div className="promo-stack"><PromoBox title="Have a coupon?" input={couponInput} setInput={setCouponInput} action="Apply" onAction={applyCoupon} message={couponMessage} applied={coupon} onRemove={() => setCoupon(null)} saved={couponDiscount} /><PromoBox title="Have a gift card?" input={giftInput} setInput={setGiftInput} action="Redeem" onAction={redeemGift} message={giftMessage} applied={gift} onRemove={() => setGift(null)} gift saved={giftApplied} /></div></section><OrderSummary subtotal={subtotal} productDiscount={productDiscount} couponDiscount={couponDiscount} giftApplied={giftApplied} shipping={shipping} total={total} unavailable={unavailable} /></div>{wishlistMessage && <p className="cart-toast" role="status"><Check size={15} /> {wishlistMessage}</p>}</main><Recommendations items={recommendations} /><div className="mobile-checkout-bar"><span>{money(total)}<small>Total</small></span><Link to={unavailable ? '/cart' : '/checkout'} aria-disabled={unavailable}>Proceed to checkout</Link></div></>
}

function CartLine({ item, onUpdate, onRemove, onWishlist }) { return <article className="cart-line"><Link to={`/product/${item.slug}`} className="cart-line-image"><img src={item.image} alt={item.name} /></Link><div className="cart-line-info"><p className="product-category">{item.category || 'Skincare'}</p><Link to={`/product/${item.slug}`}><h2>{item.name}</h2></Link><p className="line-attributes">{Object.values(item.attributes).filter(Boolean).join(' · ')}</p><p className="line-sku">SKU: {item.sku}</p><div className="line-price"><strong>{money(item.price)}</strong>{item.mrp > item.price && <s>{money(item.mrp)}</s>}</div><div className="line-controls"><span>Quantity</span><div className="quantity"><button onClick={() => onUpdate(item.sku, item.quantity - 1)} aria-label={`Decrease ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => onUpdate(item.sku, item.quantity + 1)} disabled={item.quantity >= item.stock || item.stock < 1} aria-label={`Increase ${item.name}`}><Plus size={13} /></button></div><strong className="line-total">{money(item.price * item.quantity)}</strong></div>{item.stock < 1 ? <p className="line-unavailable">Currently unavailable</p> : item.stock <= 3 ? <p className="line-low-stock">Only {item.stock} left</p> : null}<div className="line-actions"><button onClick={() => onWishlist(item)}><Heart size={14} /> Move to wishlist</button><button onClick={() => onRemove(item.sku)}><Trash2 size={14} /> Remove</button></div></div></article> }
function ShippingProgress({ subtotal }) { const progress = Math.min(100, subtotal / shippingRules.threshold * 100); return <section className="shipping-progress"><div><strong>{subtotal >= shippingRules.threshold ? 'You\'ve unlocked complimentary shipping.' : `You're ${money(shippingRules.threshold - subtotal)} away from complimentary shipping.`}</strong><span>{money(subtotal)} / {money(shippingRules.threshold)}</span></div><i><b style={{ width: `${progress}%` }} /></i></section> }
function PromoBox({ title, input, setInput, action, onAction, message, applied, onRemove, gift, saved = 0 }) { return <section className="promo-box"><p>{title}</p>{applied ? <div className="applied-promo"><div><strong>{gift ? 'Gift card' : applied.code}</strong><span>{gift ? `Available balance: ${money(applied.balance)} · Applied: ${money(saved)}` : `${applied.label} · You saved ${money(saved)}`}</span></div><button onClick={onRemove}>Remove</button></div> : <div className="promo-input"><label className="sr-only" htmlFor={`${action}-${title}`}>{title}</label><input id={`${action}-${title}`} value={input} onChange={(event) => setInput(event.target.value)} placeholder={gift ? 'Enter gift card code' : 'Enter coupon code'} /><button onClick={onAction}>{action}</button></div>}{message && <small className="promo-error" role="status">{message}</small>}</section> }
function OrderSummary({ subtotal, productDiscount, couponDiscount, giftApplied, shipping, total, unavailable }) { return <aside className="order-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Product discount</span><strong className="saving">−{money(productDiscount)}</strong></div><div><span>Coupon discount</span><strong className="saving">{couponDiscount ? `−${money(couponDiscount)}` : '—'}</strong></div><div><span>Gift card</span><strong className="saving">{giftApplied ? `−${money(giftApplied)}` : '—'}</strong></div><div><span>Shipping</span><strong>{shipping ? money(shipping) : 'Free'}</strong></div><hr /><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>{productDiscount > 0 && <p className="summary-saving">You save {money(productDiscount + couponDiscount)} on this order.</p>}<Link className={`button ${unavailable ? 'is-disabled' : ''}`} to={unavailable ? '/cart' : '/checkout'}>Proceed to checkout</Link>{unavailable && <p className="checkout-note">Remove unavailable items before checkout.</p>}<p className="secure-checkout">Secure checkout<br />UPI · Cards · Net Banking · COD</p></aside> }
function Recommendations({ items }) { return <section className="cart-recommendations container"><p className="eyebrow">You may also like</p><h2>Complete the ritual.</h2><div className="product-grid">{items.map((item) => <ProductCard key={item.slug} product={item} onChooseOptions={() => {}} />)}</div></section> }
