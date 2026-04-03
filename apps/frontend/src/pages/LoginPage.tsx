import { isAxiosError } from 'axios'
import { Wind } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { AuthHeaderActions } from '@components/shared/AuthHeaderActions'
import { useAuth } from '@contexts/AuthContext'
import { authService } from '@services/authService'


export const LoginPage = () => {
  const { t } = useTranslation()
  const { signIn, isAuthenticated, authReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/alerts'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (authReady && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { token, user } = await authService.login(email, password)
      signIn(token, user)
      toast.success(t('auth.loginSuccess'))
      navigate(from, { replace: true })
    } catch (err) {
      const msg =
        isAxiosError<{ message?: string }>(err) && err.response?.data?.message
          ? err.response.data.message
          : t('auth.loginError')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background grain-overlay">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '-100px' }} />

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 text-foreground shrink-0">
          <Wind className="w-7 h-7 text-primary" />
          <span className="font-heading text-xl sm:text-2xl tracking-wider">
            Respir<span className="text-primary">A</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <AuthHeaderActions />
        </div>
      </header>

      <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-lg z-10 mt-8">
        <h1 className="font-heading text-xl text-foreground mb-6">{t('auth.loginTitle')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline shrink-0">
                {t('auth.forgotPasswordLink')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('common.loading') : t('auth.login')}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
