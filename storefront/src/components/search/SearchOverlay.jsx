import { useState, useRef } from 'react'
import { Search, X, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFocusTrap } from '../ui/useFocusTrap'

const terms = ['Vitamin C', 'Sunscreen', 'Acne', 'Dry Skin', 'Niacinamide']

export function SearchOverlay({ open, onClose }) {
  const ref = useRef(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  useFocusTrap(ref, open, onClose)
  const submit = (value = query) => {
    const next = value.trim()
    if (!next) return
    onClose()
    navigate(`/shop?q=${encodeURIComponent(next)}`)
  }
  return <div className={`overlay search-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}>
    <button className="scrim" onClick={onClose} aria-label="Close search" />
    <section ref={ref} className="search-panel" role="dialog" aria-modal="true" aria-label="Search products">
      <button className="close-button" onClick={onClose} aria-label="Close search"><X /></button>
      <p className="eyebrow">Find your ritual</p>
      <form className="search-field" onSubmit={(event) => { event.preventDefault(); submit() }}>
        <Search aria-hidden="true" />
        <input autoFocus={open} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skincare, ingredients, concerns..." aria-label="Search products" />
      </form>
      <div className="trending"><p>Trending searches</p><div>{terms.map((term) => <button type="button" key={term} onClick={() => submit(term)}>{term}<ArrowUpRight size={14} /></button>)}</div></div>
    </section>
  </div>
}
