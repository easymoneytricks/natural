import { apiRequest } from '../lib/api'
export const getShippingMethods = () => apiRequest('/checkout/shipping-methods')
export const getQuote = (body, authFetch) => authFetch ? authFetch('/checkout/quote', { method: 'POST', body }) : apiRequest('/checkout/quote', { method: 'POST', body })
