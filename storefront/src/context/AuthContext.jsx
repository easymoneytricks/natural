/* Demo authentication only. Replace with backend auth when available. */
/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState } from 'react'

const DEMO_EMAIL = 'aanya@example.com'
const DEMO_PASSWORD = 'Natural@123'
const AuthContext = createContext(null)

function readUser() { try { return JSON.parse(localStorage.getItem('natural-beauty-demo-user')) || null } catch { return null } }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)
  const persist = (profile) => { setUser(profile); localStorage.setItem('natural-beauty-demo-user', JSON.stringify(profile)) }
  const login = (email, password) => { if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) return false; persist({ id: 'demo-customer-1', firstName: 'Aanya', lastName: 'Mehta', email: DEMO_EMAIL, mobile: '9876543210' }); return true }
  const register = (profile) => { const next = { id: `demo-${Date.now()}`, firstName: profile.firstName, lastName: profile.lastName, email: profile.email.toLowerCase(), mobile: profile.mobile }; persist(next); return next }
  const logout = () => { setUser(null); localStorage.removeItem('natural-beauty-demo-user') }
  const updateUser = (changes) => persist({ ...user, ...changes })
  const value = { user, isAuthenticated: Boolean(user), login, register, logout, updateUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value }
