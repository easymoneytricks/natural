import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { QuickOptions } from '../components/product/QuickOptions'
import { products, newArrivals } from '../data/products'

const catalog = [...products, ...newArrivals].map((product) => ({
  ...product,
  availability: product.availability || 'in-stock',
  bestSeller: product.badge === 'Bestseller',
  newArrival: product.badge === 'New',
}))

const filterGroups = [
  { key: 'category', title: 'Category', options: ['Cleansers', 'Toners', 'Serums', 'Moisturizers', 'Sunscreens', 'Treatments'] },
  { key: 'skin', title: 'Skin type', options: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Acne-Prone'] },
  { key: 'concern', title: 'Concern', options: ['Acne & Breakouts', 'Dark Spots', 'Pigmentation', 'Dryness', 'Dullness', 'Fine Lines', 'Uneven Texture', 'Redness', 'Oil Control', 'Dehydration', 'Sun Protection', 'Barrier Support'] },
  { key: 'size', title: 'Pack size', options: ['15 ml', '30 ml', '50 ml', '100 ml', '150 ml', '200 ml', '30 g', '50 g', '100 g'] },
  { key: 'price', title: 'Price', options: ['under-500', '500-799', '800-999', '1000-1499', '1500-plus'], labels: ['Under ₹500', '₹500 – ₹799', '₹800 – ₹999', '₹1,000 – ₹1,499', '₹1,500 & Above'] },
  { key: 'availability', title: 'Availability', options: ['in-stock', 'out-of-stock'], labels: ['In Stock', 'Out of Stock'] },
]

const categories = ['All', 'Cleansers', 'Toners', 'Serums', 'Moisturizers', 'Sunscreens', 'Treatments']

function matchesPrice(product, range) {
  if (range === 'under-500') return product.price < 500
  if (range === '500-799') return product.price >= 500 && product.price <= 799
  if (range === '800-999') return product.price >= 800 && product.price <= 999
  if (range === '1000-1499') return product.price >= 1000 && product.price <= 1499
  if (range === '1500-plus') return product.price >= 1500
  return true
}

function valueMatches(product, key, value) {
  if (key === 'category') return product.category === value
  if (key === 'skin') return product.skinTypes.includes(value)
  if (key === 'concern') return product.concerns.includes(value)
  if (key === 'size') return product.sizes.includes(value)
  if (key === 'price') return matchesPrice(product, value)
  return product.availability === value
}

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [openGroups, setOpenGroups] = useState({ category: true, skin: true, concern: true })
  const sort = searchParams.get('sort') || 'featured'
  const search = searchParams.get('q') || ''
  const selected = Object.fromEntries(filterGroups.map(({ key }) => [key, searchParams.getAll(key)]))

  useEffect(() => {
    document.body.classList.toggle('overlay-open', mobileFiltersOpen)
    return () => document.body.classList.remove('overlay-open')
  }, [mobileFiltersOpen])

  useEffect(() => {
    if (!mobileFiltersOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileFiltersOpen])

  const updateParams = (key, value, checked) => {
    const next = new URLSearchParams(searchParams)
    const current = next.getAll(key).filter((item) => item !== value)
    if (checked) current.push(value)
    next.delete(key)
    current.forEach((item) => next.append(key, item))
    setSearchParams(next)
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (search) next.set('q', search)
    setSearchParams(next)
  }

  const filteredProducts = useMemo(() => {
    const visible = catalog.filter((product) => {
      const haystack = [product.name, product.category, ...product.concerns, ...product.skinTypes].join(' ').toLowerCase()
      const searchMatch = !search || haystack.includes(search.toLowerCase())
      const groupsMatch = filterGroups.every(({ key }) => !selected[key].length || selected[key].some((value) => valueMatches(product, key, value)))
      return searchMatch && groupsMatch
    })
    return [...visible].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price
      if (sort === 'price-high') return b.price - a.price
      if (sort === 'rated') return b.rating - a.rating || b.reviews - a.reviews
      if (sort === 'selling') return Number(b.bestSeller) - Number(a.bestSeller) || b.reviews - a.reviews
      if (sort === 'newest') return Number(b.newArrival) - Number(a.newArrival)
      return Number(b.bestSeller) - Number(a.bestSeller)
    })
  }, [search, selected, sort])

  const activeFilters = filterGroups.flatMap(({ key, title }) => selected[key].map((value) => ({ key, title, value })))
  const resultLabel = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`

  return (
    <>
      <section className="shop-page-header homepage-container">
        <p className="breadcrumb"><Link to="/">Home</Link> <span>/</span> Shop</p>
        <p className="eyebrow">The collection</p>
        <h1>Skincare, considered.</h1>
        <p>Explore formulas by skin type, concern and the role they play in your everyday ritual.</p>
      </section>
      <main className="shop-content homepage-container">
        <nav className="category-strip" aria-label="Shop categories">{categories.map((category) => <button className={(selected.category.includes(category) || (category === 'All' && !selected.category.length)) ? 'is-active' : ''} key={category} onClick={() => category === 'All' ? updateParams('category', '', false) : updateParams('category', category, true)}>{category}</button>)}</nav>
        <div className="shop-toolbar"><span><strong>{resultLabel}</strong></span><button className="mobile-filter-trigger" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={15} /> Filter {activeFilters.length > 0 && `(${activeFilters.length})`}</button><label className="sort-control">Sort by <select aria-label="Sort products" value={sort} onChange={(event) => { const next = new URLSearchParams(searchParams); next.set('sort', event.target.value); setSearchParams(next) }}><option value="featured">Featured</option><option value="selling">Best selling</option><option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rated">Highest rated</option></select></label></div>
        <div className="shop-search"><Search size={17} /><input value={search} onChange={(event) => { const next = new URLSearchParams(searchParams); if (event.target.value) next.set('q', event.target.value); else next.delete('q'); setSearchParams(next) }} placeholder="Search within skincare" aria-label="Search within skincare" /></div>
        {activeFilters.length > 0 && <div className="active-filters"><span>Filtered by</span>{activeFilters.map(({ key, value }) => <button key={`${key}-${value}`} onClick={() => updateParams(key, value, false)}>{filterGroups.find((group) => group.key === key)?.labels?.[filterGroups.find((group) => group.key === key).options.indexOf(value)] || value}<X size={13} /></button>)}<button className="clear-filters" onClick={clearFilters}>Clear all</button></div>}
        <div className="shop-layout"><aside className="filter-sidebar"><FilterPanel selected={selected} openGroups={openGroups} setOpenGroups={setOpenGroups} updateParams={updateParams} clearFilters={clearFilters} /></aside><section className="shop-results" aria-live="polite">{filteredProducts.length ? <div className="shop-grid">{filteredProducts.map((product) => <ProductCard key={product.slug} product={product} onChooseOptions={setSelectedProduct} />)}</div> : <EmptyState clearFilters={clearFilters} search={search} />}</section></div>
      </main>
      {mobileFiltersOpen && <div className="mobile-filter-overlay"><button className="mobile-filter-scrim" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" /><aside className="mobile-filter-drawer"><header><h2>Filters</h2><button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X /></button></header><FilterPanel selected={selected} openGroups={openGroups} setOpenGroups={setOpenGroups} updateParams={updateParams} clearFilters={clearFilters} /><footer><button onClick={clearFilters}>Clear all</button><button className="button" onClick={() => setMobileFiltersOpen(false)}>Show {resultLabel}</button></footer></aside></div>}
      <QuickOptions product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  )
}

function FilterPanel({ selected, openGroups, setOpenGroups, updateParams, clearFilters }) {
  return <div className="filter-panel">{filterGroups.map(({ key, title, options, labels }) => <section key={key}><button className="filter-group-heading" aria-expanded={openGroups[key] || false} onClick={() => setOpenGroups((current) => ({ ...current, [key]: !current[key] }))}><span>{title}</span><ChevronDown size={15} /></button>{openGroups[key] && <div className="filter-options">{options.map((option, index) => <label key={option}><input type="checkbox" checked={selected[key].includes(option)} onChange={(event) => updateParams(key, option, event.target.checked)} /><span>{labels?.[index] || option}</span></label>)}</div>}</section>)}<button className="sidebar-clear" onClick={clearFilters}>Clear all filters</button></div>
}

function EmptyState({ clearFilters, search }) {
  return <div className="empty-shop"><p className="eyebrow">{search ? 'No matching formulas' : 'A quieter selection'}</p><h2>No formulas found</h2><p>We couldn't find products matching all of those selections.</p><button className="button" onClick={clearFilters}>Clear filters</button><Link to="/shop">Shop all</Link></div>
}
