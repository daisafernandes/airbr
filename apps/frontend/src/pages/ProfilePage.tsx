import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IMaskInput } from 'react-imask'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProtectedRoute } from '@components/layout/ProtectedRoute'
import { CitySearchBar } from '@components/shared/CitySearchBar'
import { Header } from '@components/shared/Header'
import { useAuth } from '@contexts/AuthContext'
import { airQualityService } from '@services/airQualityService'
import { authService } from '@services/authService'
import { brMaskedToE164, e164ToBrMasked } from '@utils/brPhoneE164'

const profileFormSchema = z.object({
  name: z.string().min(1).max(120),
  preferredLocale: z.enum(['pt', 'en', 'es']),
})

type ProfileForm = z.infer<typeof profileFormSchema>

const ProfileContent = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, applySessionUser } = useAuth()
  const [phoneValue, setPhoneValue] = useState('')
  const [defaultCityId, setDefaultCityId] = useState<string | null>(null)
  const [defaultCityLabel, setDefaultCityLabel] = useState('')

  const { data: resolvedCity } = useQuery({
    queryKey: ['city', defaultCityId],
    queryFn: () => airQualityService.getCity(defaultCityId!),
    enabled: !!defaultCityId,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      preferredLocale: 'pt',
    },
  })

  const preferredLocale = watch('preferredLocale')

  useEffect(() => {
    if (!user) return
    reset({
      name: user.name,
      preferredLocale:
        user.preferredLocale === 'en' || user.preferredLocale === 'es' ? user.preferredLocale : 'pt',
    })
    setPhoneValue(e164ToBrMasked(user.phone))
    setDefaultCityId(user.defaultCityId)
    if (!user.defaultCityId) setDefaultCityLabel('')
  }, [user, reset])

  useEffect(() => {
    if (resolvedCity) {
      setDefaultCityLabel(`${resolvedCity.name} (${resolvedCity.state})`)
    }
  }, [resolvedCity])

  const mutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: updated => {
      applySessionUser(updated)
      toast.success(t('profile.saved'))
    },
    onError: () => toast.error(t('profile.saveError')),
  })

  const onSubmit = (data: ProfileForm) => {
    const digitsOnly = phoneValue.replace(/\D/g, '')
    let phone: string | null = null
    if (digitsOnly.length > 0) {
      const e164 = brMaskedToE164(phoneValue)
      if (!e164) {
        toast.error(t('profile.phoneInvalid'))
        return
      }
      phone = e164
    }

    mutation.mutate({
      name: data.name,
      phone,
      defaultCityId,
      preferredLocale: data.preferredLocale,
    })
  }

  const handleCitySelect = (cityId: string) => {
    navigate(`/city/${cityId}`)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <Header onCitySelect={handleCitySelect} />

      <main className="pt-16 px-4 pb-12 max-w-[640px] mx-auto relative z-10">
        <h1 className="font-heading text-2xl text-foreground mb-2">{t('profile.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t('profile.subtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-border bg-card/60 p-6">
          <div>
            <Label htmlFor="profile-name">{t('auth.name')}</Label>
            <Input id="profile-name" className="mt-2" {...register('name')} autoComplete="name" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-phone">{t('profile.phone')}</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">{t('profile.phoneHint')}</p>
            <IMaskInput
              id="profile-phone"
              type="tel"
              inputMode="tel"
              mask={['+{55} (00) 0000-0000', '+{55} (00) 00000-0000']}
              value={phoneValue}
              unmask={false}
              onAccept={value => setPhoneValue(value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="+55 (11) 98765-4320"
            />
          </div>

          <div>
            <Label className="mb-2 block">{t('profile.defaultCity')}</Label>
            <CitySearchBar
              onSelect={(id, name) => {
                setDefaultCityId(id)
                setDefaultCityLabel(name)
              }}
              placeholder={t('common.search')}
              className="w-full"
              testId="profile-city-search"
            />
            {defaultCityLabel && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">
                  {t('profile.citySelected')}: {defaultCityLabel}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setDefaultCityId(null)
                    setDefaultCityLabel('')
                  }}
                >
                  {t('profile.clearCity')}
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="profile-locale">{t('profile.preferredLanguage')}</Label>
            <Select
              value={preferredLocale}
              onValueChange={v => setValue('preferredLocale', v as ProfileForm['preferredLocale'])}
            >
              <SelectTrigger id="profile-locale" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">{t('profile.langPt')}</SelectItem>
                <SelectItem value="en">{t('profile.langEn')}</SelectItem>
                <SelectItem value="es">{t('profile.langEs')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('common.loading') : t('profile.save')}
          </Button>
        </form>
      </main>
    </div>
  )
}

export const ProfilePage = () => (
  <ProtectedRoute>
    <ProfileContent />
  </ProtectedRoute>
)
