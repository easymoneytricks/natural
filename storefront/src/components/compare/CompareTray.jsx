import { X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCompare } from '../../context/PreferenceContext'
import { products, newArrivals } from '../../data/products'
import './CompareTray.css'

const catalog = [...products, ...newArrivals]

export function CompareTray() {
  const compare = useCompare()
  const location = useLocation()
  const selected = compare.items.map((entry) => catalog.find((product) => product.slug === entry.slug)).filter(Boolean)
  if (!selected.length || ['/checkout', '/order-success', '/order-failed', '/login', '/register', '/forgot-password', '/reset-password', '/account'].includes(location.pathname)) return null
  return <aside className={`compare-tray ${location.pathname.startsWith('/product/') || location.pathname === '/cart' ? 'compare-tray-purchase-page' : ''}`} aria-label="Compare products"><div className="compare-tray-items">{selected.map((product) => <div key={product.slug}><img src={product.image} alt="" /><span>{product.name}</span><button onClick={() => compare.remove(product.slug)} aria-label={`Remove ${product.name} from compare`}><X size={13} /></button></div>)}</div><Link className={`button ${selected.length < 2 ? 'is-disabled' : ''}`} to={selected.length < 2 ? '#' : '/compare'}>{selected.length < 2 ? 'Add 1 more to compare' : 'Compare products'}</Link><button className="compare-tray-clear" onClick={compare.clear}>Clear</button></aside>
}
