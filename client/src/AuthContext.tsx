import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore } from './api'
import type { User } from './types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(tokenStore.get()))

  // Restore the session from a saved token on first load.
  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const value: AuthState = {
    user,
    loading,
    login: async (email, password) => {
      const res = await api.login(email, password)
      tokenStore.set(res.token)
      setUser(res.user)
    },
    register: async (name, email, password) => {
      const res = await api.register(name, email, password)
      tokenStore.set(res.token)
      setUser(res.user)
    },
    logout: () => {
      tokenStore.clear()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
