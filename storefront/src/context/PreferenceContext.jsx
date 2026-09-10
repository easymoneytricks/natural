/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products, newArrivals } from '../data/products'

const validSlugs = new Set([...products, ...newArrivals].map((product) => product.slug))

function read(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] }
}

const WishlistContext = createContext(null)
const CompareContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => read('natural-beauty-wishlist').filter((item) => item && validSlugs.has(item.slug)))
  useEffect(() => { try { localStorage.setItem('natural-beauty-wishlist', JSON.stringify(items)) } catch { /* session-only fallback */ } }, [items])
  const toggle = (product, metadata = {}) => setItems((current) => current.some((item) => item.slug === product.slug) ? current.filter((item) => item.slug !== product.slug) : [...current, { slug: product.slug, ...metadata }])
  const value = useMemo(() => ({ items, count: items.length, has: (slug) => items.some((item) => item.slug === slug), toggle, remove: (slug) => setItems((current) => current.filter((item) => item.slug !== slug)), clear: () => setItems([]) }), [items])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() { const value = useContext(WishlistContext); if (!value) throw new Error('useWishlist must be used within WishlistProvider'); return value }

export function CompareProvider({ children }) {
  const [items, setItems] = useState(() => read('natural-beauty-compare').filter((item) => item && validSlugs.has(item.slug)))
  const [message, setMessage] = useState('')
  useEffect(() => { try { localStorage.setItem('natural-beauty-compare', JSON.stringify(items)) } catch { /* session-only fallback */ } }, [items])
  const toggle = (product) => setItems((current) => {
    if (current.some((item) => item.slug === product.slug)) return current.filter((item) => item.slug !== product.slug)
    if (current.length >= 4) { setMessage('You can compare up to 4 products. Remove one product to add another.'); window.setTimeout(() => setMessage(''), 3200); return current }
    return [...current, { slug: product.slug }]
  })
  const value = useMemo(() => ({ items, count: items.length, message, has: (slug) => items.some((item) => item.slug === slug), toggle, remove: (slug) => setItems((current) => current.filter((item) => item.slug !== slug)), clear: () => setItems([]) }), [items, message])
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() { const value = useContext(CompareContext); if (!value) throw new Error('useCompare must be used within CompareProvider'); return value }
