import { isAxiosError } from 'axios'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@components/shared/Header'
import { useAuth } from '@contexts/AuthContext'
import { authService } from '@services/authService'

export const ForgotPasswordPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleCitySelect = useCallback(
    (cityId: string) => {
      navigate(`/city/${cityId}`)
    },
    [navigate],
  )
  const { isAuthenticated, authReady } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  if (authReady && isAuthenticated) {
    return <Navigate to="/alerts" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success(t('auth.forgotPasswordToast'))
    } catch (err) {
      const msg =
        isAxiosError<{ message?: string }>(err) && err.response?.data?.message
          ? err.response.data.message
          : t('auth.forgotPasswordError')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background grain-overlay">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />

      <Header onCitySelect={handleCitySelect} />

      <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-lg z-10 mt-8">
        <h1 className="font-heading text-xl text-foreground mb-2">{t('auth.forgotPasswordTitle')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('auth.forgotPasswordDescription')}</p>

        {sent ? (
          <p className="text-sm text-muted-foreground">{t('auth.forgotPasswordFollowUp')}</p>
        ) : (
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
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.forgotPasswordSubmit')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm text-muted-foreground text-center">
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  )
}
