import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')

  const setToken = (token) => {
    window.__accessToken = token || null
  }

  // Restore session silently on app load
  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await api.post('/auth/refresh')
        setToken(data.accessToken)
        setUser(data.user)
      } catch {
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    setToken(data.accessToken)
    setUser(data.user)
    return data
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.accessToken)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setToken(null)
    setUser(null)
    setAuthModalOpen(false)
    window.location.href = '/'
  }

  const updateUser = (updated) => setUser(updated)

  const openModal = (mode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const value = {
    user, loading, login, register, logout, updateUser,
    isAuthenticated: !!user,
    isAuthModalOpen, setAuthModalOpen,
    authModalMode, setAuthModalMode,
    openModal
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
