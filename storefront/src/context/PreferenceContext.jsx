/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products, newArrivals } from '../data/products'
import { useAuth } from './AuthContext'
import * as commerceApi from '../services/cartApi'

const validSlugs = new Set([...products, ...newArrivals].map((product) => product.slug))
const catalog = [...products, ...newArrivals]
const decorateWishlist = (lines) => lines.map((line) => { const match = catalog.find((product) => product.slug === line.slug); return { ...match, ...line, image: line.image || match?.image } })

function read(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] }
}

const WishlistContext = createContext(null)
const CompareContext = createContext(null)

export function WishlistProvider({ children }) {
  const { authStatus, authFetch } = useAuth(); const [guestItems, setGuestItems] = useState(() => read('natural-beauty-wishlist').filter((item) => item && validSlugs.has(item.slug))); const [items, setItems] = useState(guestItems); const [serverMode, setServerMode] = useState(false)
  useEffect(() => { if (!serverMode) try { localStorage.setItem('natural-beauty-wishlist', JSON.stringify(guestItems)) } catch {} }, [guestItems, serverMode]); useEffect(() => { if (!serverMode) setItems(guestItems) }, [guestItems, serverMode])
  useEffect(() => { if (authStatus !== 'authenticated') return; let active=true; const load=async()=>{ try { const ids=guestItems.map((item)=>item.id).filter(Boolean); const result=ids.length ? await commerceApi.mergeWishlist(authFetch,ids) : await commerceApi.getWishlist(authFetch); if(!active)return; setItems(decorateWishlist(result.data.items||result.data||[])); setServerMode(true); if(ids.length)setGuestItems([]) } catch {} }; load(); return()=>{active=false} }, [authStatus, authFetch, guestItems])
  useEffect(() => { if (authStatus === 'unauthenticated' && serverMode) { setServerMode(false); setItems(guestItems) } }, [authStatus, serverMode, guestItems])
  const toggle = async (product, metadata = {}) => { const existing=items.find((item)=>item.slug===product.slug); if (serverMode && product.id) { const result=existing ? await commerceApi.removeWishlist(authFetch,product.id) : await commerceApi.addWishlist(authFetch,product.id); setItems(result.data||[]); return } setGuestItems((current) => existing ? current.filter((item) => item.slug !== product.slug) : [...current, { id: product.id, slug: product.slug, ...metadata }]) }
  const value = useMemo(() => ({ items, count: items.length, has: (slug) => items.some((item) => item.slug === slug), toggle, remove: async (slug) => { const line=items.find((item)=>item.slug===slug); if(serverMode&&line?.id){ const result=await commerceApi.removeWishlist(authFetch,line.id); setItems(result.data||[]); return } setGuestItems((current) => current.filter((item) => item.slug !== slug)) }, clear: async () => { if(serverMode){ for(const line of items) if(line.id) await commerceApi.removeWishlist(authFetch,line.id); setItems([]); return } setGuestItems([]) } }), [items, serverMode, authFetch])
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
