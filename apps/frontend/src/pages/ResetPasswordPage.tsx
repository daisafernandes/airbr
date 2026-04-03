import { isAxiosError } from 'axios'
import { Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { AuthHeaderActions } from '@components/shared/AuthHeaderActions'
import { useAuth } from '@contexts/AuthContext'
import { authService } from '@services/authService'

export const ResetPasswordPage = () => {
  const { t } = useTranslation()
  const { isAuthenticated, authReady } = useAuth()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (authReady && isAuthenticated) {
    return <Navigate to="/alerts" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error(t('auth.resetPasswordMissingToken'))
      return
    }
    if (password !== confirm) {
      toast.error(t('auth.resetPasswordMismatch'))
      return
    }
    setSubmitting(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      toast.success(t('auth.resetPasswordSuccess'))
    } catch (err) {
      const msg =
        isAxiosError<{ message?: string }>(err) && err.response?.data?.message
          ? err.response.data.message
          : t('auth.resetPasswordError')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background grain-overlay">
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
        <h1 className="font-heading text-xl text-foreground mb-2">{t('auth.resetPasswordTitle')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('auth.resetPasswordDescription')}</p>

        {!token ? (
          <p className="text-sm text-muted-foreground mb-4">{t('auth.resetPasswordMissingToken')}</p>
        ) : done ? (
          <p className="text-sm text-muted-foreground mb-4">{t('auth.resetPasswordDone')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.passwordHint')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.resetPasswordSubmit')}
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
