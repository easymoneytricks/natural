const slugify = (value) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const categories = new Set(['cleansers', 'toners & mists', 'serums', 'moisturizers', 'sunscreens', 'masks & treatments', 'eye care', 'lip care'])
const concerns = new Set(['acne & breakouts', 'dark spots', 'pigmentation', 'dryness', 'dullness', 'fine lines', 'uneven texture', 'redness', 'oil control', 'dehydration', 'sun protection', 'barrier support', 'damaged skin barrier'])

export function linkTarget(label) {
  if (categories.has(label.toLowerCase())) return `/shop?category=${slugify(label)}`
  if (label.toLowerCase().endsWith(' skin')) return `/shop?skin=${slugify(label.replace(/ skin$/i, ''))}`
  if (concerns.has(label.toLowerCase())) return `/shop?concern=${label.toLowerCase() === 'damaged skin barrier' ? 'barrier-support' : slugify(label)}`
  if (label === 'New Arrivals') return '/shop?sort=newest'
  if (label === 'Best Sellers') return '/shop?sort=best-selling'
  return '/shop'
}
