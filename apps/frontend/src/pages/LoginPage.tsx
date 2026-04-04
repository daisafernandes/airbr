import { isAxiosError } from 'axios'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@components/shared/Header'
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

  const handleCitySelect = useCallback(
    (cityId: string) => {
      navigate(`/city/${cityId}`)
    },
    [navigate],
  )

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

      <Header onCitySelect={handleCitySelect} />

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
