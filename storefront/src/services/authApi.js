import { apiRequest } from '../lib/api'

const authOptions = (options = {}) => ({ ...options, credentials: 'include' })

export const registerCustomer = (profile) => apiRequest('/auth/register', authOptions({ method: 'POST', body: {
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  phone: profile.mobile || profile.phone,
  password: profile.password,
} }))

export const loginCustomer = (email, password) => apiRequest('/auth/login', authOptions({ method: 'POST', body: { email, password } }))
export const refreshSession = () => apiRequest('/auth/refresh', authOptions({ method: 'POST' }))
export const getCurrentCustomer = (accessToken) => apiRequest('/auth/me', { credentials: 'include', headers: { Authorization: `Bearer ${accessToken}` } })
export const logoutCustomer = () => apiRequest('/auth/logout', authOptions({ method: 'POST' }))
export const logoutAllSessions = (accessToken) => apiRequest('/auth/logout-all', { method: 'POST', credentials: 'include', headers: { Authorization: `Bearer ${accessToken}` } })
export const getProfile = (authFetch) => authFetch('/customer/profile')
export const updateProfile = (authFetch, profile) => authFetch('/customer/profile', { method: 'PATCH', body: profile })
export const getAddresses = (authFetch) => authFetch('/customer/addresses')
export const createAddress = (authFetch, address) => authFetch('/customer/addresses', { method: 'POST', body: address })
export const updateAddress = (authFetch, id, address) => authFetch(`/customer/addresses/${id}`, { method: 'PATCH', body: address })
export const deleteAddress = (authFetch, id) => authFetch(`/customer/addresses/${id}`, { method: 'DELETE' })
export const setDefaultAddress = (authFetch, id) => authFetch(`/customer/addresses/${id}/default`, { method: 'POST' })

export function authErrorMessage(error, fallback = 'We could not complete that request.') {
  if (error?.status === 429) return 'Too many attempts. Please wait a moment and try again.'
  if (error?.code === 'INVALID_CREDENTIALS') return 'Invalid email or password.'
  if (error?.code === 'EMAIL_ALREADY_EXISTS') return 'An account with this email already exists.'
  if (error?.code === 'PHONE_ALREADY_EXISTS') return 'An account with this phone already exists.'
  if (error?.code === 'VALIDATION_ERROR') return 'Please check your details and try again.'
  return fallback
}
