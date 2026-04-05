import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import i18n from '@/lib/i18n'
import { authService, type AuthUser } from '@services/authService'
import { normalizeAppLocale } from '@utils/appLocale'

interface AuthState {
  token: string | null
  user: AuthUser | null
  authReady: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (token: string, user: AuthUser) => void
  signOut: () => void
  applySessionUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function applyPreferredLocale(user: AuthUser): void {
  void i18n.changeLanguage(normalizeAppLocale(user.preferredLocale))
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('@airbr:token'))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setAuthReady(true)
      return
    }

    let cancelled = false

    authService
      .me()
      .then(u => {
        if (!cancelled) {
          setUser(u)
          applyPreferredLocale(u)
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('@airbr:token')
          localStorage.removeItem('@airbr:user')
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const signIn = useCallback((newToken: string, u: AuthUser) => {
    localStorage.setItem('@airbr:token', newToken)
    localStorage.setItem('@airbr:user', JSON.stringify(u))
    setToken(newToken)
    setUser(u)
    applyPreferredLocale(u)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('@airbr:token')
    localStorage.removeItem('@airbr:user')
    setToken(null)
    setUser(null)
  }, [])

  const applySessionUser = useCallback((u: AuthUser) => {
    setUser(u)
    localStorage.setItem('@airbr:user', JSON.stringify(u))
    applyPreferredLocale(u)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      authReady,
      isAuthenticated: !!token && !!user,
      signIn,
      signOut,
      applySessionUser,
    }),
    [token, user, authReady, signIn, signOut, applySessionUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
