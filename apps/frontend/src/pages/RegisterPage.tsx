import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@components/shared/Header'
import { useAuth } from '@contexts/AuthContext'
import { authService } from '@services/authService'
import { type CreateUserFormData, createUserSchema } from '@utils/validators'

export const RegisterPage = () => {
  const { t } = useTranslation()
  const { signIn, isAuthenticated, authReady } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const handleCitySelect = useCallback(
    (cityId: string) => {
      navigate(`/city/${cityId}`)
    },
    [navigate],
  )

  if (authReady && isAuthenticated) {
    return <Navigate to="/alerts" replace />
  }

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const { token, user } = await authService.register(data.email, data.password, data.name)
      signIn(token, user)
      toast.success(t('auth.registerSuccess'))
      navigate('/alerts', { replace: true })
    } catch (err) {
      const msg =
        isAxiosError<{ message?: string }>(err) && err.response?.data?.message
          ? err.response.data.message
          : t('auth.registerError')
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background grain-overlay">
      <div className="ambient-blob blob-orange" style={{ top: '40%', right: '10%' }} />

      <Header onCitySelect={handleCitySelect} />

      <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-lg z-10 mt-8">
        <h1 className="font-heading text-xl text-foreground mb-6">{t('auth.registerTitle')}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.name')}</Label>
            <Input id="name" autoComplete="name" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.passwordHint')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('auth.createAccount')}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
