import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Trash2, Wind } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProtectedRoute } from '@components/layout/ProtectedRoute'
import { CitySearchBar } from '@components/shared/CitySearchBar'
import { useAuth } from '@contexts/AuthContext'
import { alertsService, type AlertChannel } from '@services/alertsService'
import { registerPushNotifications } from '@utils/pushNotifications'

const AlertsContent = () => {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const queryClient = useQueryClient()

  const [cityId, setCityId] = useState<string | null>(null)
  const [cityLabel, setCityLabel] = useState('')
  const [threshold, setThreshold] = useState('100')
  const [emailChannel, setEmailChannel] = useState(true)
  const [pushChannel, setPushChannel] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsService.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const channels: AlertChannel[] = []
      if (emailChannel) channels.push('EMAIL')
      if (pushChannel) channels.push('PUSH')
      const n = parseInt(threshold, 10)
      if (!cityId) {
        return Promise.reject(new Error('no_city'))
      }
      if (!channels.length) {
        return Promise.reject(new Error('no_channels'))
      }
      if (Number.isNaN(n) || n < 0 || n > 500) {
        return Promise.reject(new Error('bad_threshold'))
      }
      return alertsService.create({
        cityId,
        thresholdAqi: n,
        channels,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success(t('alerts.created'))
      setCityId(null)
      setCityLabel('')
    },
    onError: (err: Error) => {
      if (err.message === 'no_city') {
        toast.error(t('alerts.selectCity'))
        return
      }
      if (err.message === 'no_channels') {
        toast.error(t('alerts.needChannel'))
        return
      }
      if (err.message === 'bad_threshold') {
        toast.error(t('alerts.badThreshold'))
        return
      }
      toast.error(t('alerts.createError'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success(t('alerts.removed'))
    },
    onError: () => toast.error(t('alerts.removeError')),
  })

  const handleEnablePush = async () => {
    setPushBusy(true)
    try {
      const result = await registerPushNotifications()
      if (!result.ok) {
        if (result.reason === 'denied') {
          toast.error(t('alerts.pushDenied'))
        } else if (result.reason === 'no_vapid') {
          toast.error(t('alerts.pushNoVapid'))
        } else {
          toast.error(t('alerts.pushError'))
        }
        return
      }
      setPushChannel(true)
      toast.success(t('alerts.pushReady'))
    } finally {
      setPushBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1200px] mx-auto gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Wind className="w-6 h-6 text-primary" />
            <span className="font-heading text-2xl tracking-wider text-foreground">
              Respir<span className="text-primary">A</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground px-2">
              {t('nav.dashboard')}
            </Link>
            <Link to="/ranking" className="text-xs text-muted-foreground hover:text-foreground px-2">
              {t('nav.ranking')}
            </Link>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => signOut()}>
              {t('auth.logout')}
            </Button>
          </nav>
        </div>
      </header>

      <main className="pt-24 px-4 pb-12 max-w-[1200px] mx-auto relative z-10">
        <h1 className="font-heading text-2xl text-foreground mb-2">{t('alerts.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xl">{t('alerts.subtitle')}</p>

        <section className="rounded-xl border border-border bg-card/60 p-6 mb-10">
          <h2 className="font-heading text-lg mb-4">{t('alerts.newAlert')}</h2>
          <div className="grid gap-4 max-w-lg">
            <div>
              <Label className="mb-2 block">{t('alerts.city')}</Label>
              <CitySearchBar
                onSelect={(id, name) => {
                  setCityId(id)
                  setCityLabel(name)
                }}
                placeholder={t('common.search')}
                className="w-full max-w-md"
              />
              {cityLabel && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('alerts.selected')}: {cityLabel}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="threshold">{t('alerts.threshold')}</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                max={500}
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="max-w-xs mt-2"
              />
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">{t('alerts.channels')}</span>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={emailChannel} onCheckedChange={v => setEmailChannel(!!v)} />
                {t('alerts.channelEmail')}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={pushChannel} onCheckedChange={v => setPushChannel(!!v)} />
                {t('alerts.channelPush')}
              </label>
              {pushChannel && (
                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleEnablePush} disabled={pushBusy}>
                  <Bell className="w-4 h-4 mr-1" />
                  {pushBusy ? t('common.loading') : t('alerts.enablePushBrowser')}
                </Button>
              )}
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !cityId}
            >
              {t('alerts.save')}
            </Button>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-4">{t('alerts.yourAlerts')}</h2>
          {isLoading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : alerts.length === 0 ? (
            <p className="text-muted-foreground">{t('alerts.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {alerts.map(a => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {a.cityName ?? a.cityId}
                      {a.state ? `, ${a.state}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('alerts.threshold')}: {a.thresholdAqi} ·{' '}
                      {a.channels.map(c => (c === 'EMAIL' ? t('alerts.channelEmail') : t('alerts.channelPush'))).join(', ')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(a.id)}
                    disabled={deleteMutation.isPending}
                    aria-label={t('alerts.remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export const AlertsPage = () => (
  <ProtectedRoute>
    <AlertsContent />
  </ProtectedRoute>
)
