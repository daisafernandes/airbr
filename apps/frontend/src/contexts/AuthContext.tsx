import { createContext, useCallback, useContext, useMemo, useState } from 'react'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('@airbr:token'))

  const signIn = useCallback((newToken: string) => {
    localStorage.setItem('@airbr:token', newToken)
    setToken(newToken)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('@airbr:token')
    setToken(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: !!token,
      signIn,
      signOut,
    }),
    [token, signIn, signOut],
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
