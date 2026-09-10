/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('natural-beauty-cart') || '[]')
      return Array.isArray(stored) ? stored.filter((item) => item && item.sku && item.quantity > 0) : []
    } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('natural-beauty-cart', JSON.stringify(items)) }, [items])

  const addItem = (item) => {
    setItems((current) => {
      const existing = current.find((line) => line.sku === item.sku)
      if (existing) {
        return current.map((line) => line.sku === item.sku
          ? { ...line, quantity: Math.min(line.quantity + item.quantity, line.stock) }
          : line)
      }
      return [...current, item]
    })
  }

  const updateQuantity = (sku, quantity) => {
    setItems((current) => current.map((line) => line.sku === sku
      ? { ...line, quantity: Math.max(1, Math.min(quantity, line.stock)) }
      : line))
  }

  const removeItem = (sku) => setItems((current) => current.filter((line) => line.sku !== sku))
  const clearCart = () => setItems([])
  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart, count: items.reduce((sum, item) => sum + item.quantity, 0) }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within CartProvider')
  return value
}
