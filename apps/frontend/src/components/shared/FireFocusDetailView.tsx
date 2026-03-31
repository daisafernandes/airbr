import { isAxiosError } from 'axios'
import type { TFunction } from 'i18next'
import { Flame } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useCities } from '@hooks/useCities'
import { useFire } from '@hooks/useFire'
import { getTopNearestByHaversine, haversineKm } from '@utils/geoDistance'

const MONITORED_RADIUS_KM = 200

function intensityLabel(intensity: number | null, t: TFunction): string {
  if (intensity === null) return t('firemap.intensityUnknown')
  if (intensity >= 70) return t('firemap.intensityHigh')
  if (intensity >= 40) return t('firemap.intensityMedium')
  return t('firemap.intensityLow')
}

interface FireFocusDetailViewProps {
  fireId: string
}

export const FireFocusDetailView = ({ fireId }: FireFocusDetailViewProps) => {
  const { t, i18n } = useTranslation()
  const { data: fire, isLoading, isError, error } = useFire(fireId)
  const { data: cities = [] } = useCities()

  const ibgeFromApi = fire?.nearestMunicipalities ?? []

  const ibgeApproximate = useMemo(() => {
    if (!fire || ibgeFromApi.length > 0) return null
    const top = getTopNearestByHaversine(fire.lat, fire.lng, cities, 3)
    if (top.length === 0) return null
    return top.map(c => ({
      name: c.name,
      state: c.state,
      distanceKm: haversineKm(fire.lat, fire.lng, c.lat, c.lng),
    }))
  }, [fire, ibgeFromApi.length, cities])

  const monitoredWithin200 = useMemo(() => {
    if (!fire) return []
    return cities
      .map(c => ({ c, d: haversineKm(fire.lat, fire.lng, c.lat, c.lng) }))
      .filter(x => x.d <= MONITORED_RADIUS_KM)
      .sort((a, b) => a.d - b.d)
  }, [fire, cities])

  const notFound = isAxiosError(error) && error.response?.status === 404

  const localeMap: Record<string, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
  const resolvedLocale = localeMap[i18n.language] ?? 'pt-BR'

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <p className="text-sm font-body text-muted-foreground animate-pulse">{t('common.loading')}</p>
      </div>
    )
  }

  if (isError && notFound) {
    return (
      <div className="p-8 text-center space-y-4">
        <Flame className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
        <h2 className="font-heading text-lg text-foreground">{t('fireFocus.notFound')}</h2>
      </div>
    )
  }

  if (isError || !fire) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-destructive font-body">{t('common.error')}</p>
      </div>
    )
  }

  const detectedLabel = new Date(fire.detectedAt).toLocaleString(resolvedLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const ibgeRows = ibgeFromApi.length > 0 ? ibgeFromApi : (ibgeApproximate ?? [])

  return (
    <div className="space-y-6 p-6 pt-10">
      <div className="flex items-start gap-3 pr-6">
        <div className="p-2 rounded-lg bg-accent/15 border border-accent/30 shrink-0">
          <Flame className="w-6 h-6 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-xl sm:text-2xl tracking-wide text-foreground">{t('fireFocus.pageTitle')}</h2>
          <p className="text-xs font-mono text-muted-foreground mt-1">{t('fireFocus.sourceInpe')}</p>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card/60 p-4 sm:p-5 space-y-3 text-sm font-body">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.coordinates')}</dt>
            <dd className="font-mono text-foreground mt-0.5">
              {fire.lat.toFixed(4)}, {fire.lng.toFixed(4)}
            </dd>
          </div>
          {fire.state && (
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.state')}</dt>
              <dd className="text-foreground mt-0.5">{fire.state}</dd>
            </div>
          )}
          {fire.biome && (
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.biome')}</dt>
              <dd className="text-foreground mt-0.5">{fire.biome}</dd>
            </div>
          )}
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.intensity')}</dt>
            <dd className="text-foreground mt-0.5">{intensityLabel(fire.intensity, t)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.detectedAt')}</dt>
            <dd className="text-foreground mt-0.5">{detectedLabel}</dd>
          </div>
          {fire.satellite && (
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.satellite')}</dt>
              <dd className="text-foreground mt-0.5">{fire.satellite}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.ibgeSection')}</h3>
        {ibgeFromApi.length === 0 && ibgeApproximate != null && ibgeApproximate.length > 0 && (
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{t('fireFocus.ibgeApproximateNote')}</p>
        )}
        <ul className="rounded-lg border border-border bg-card/40 divide-y divide-border">
          {ibgeRows.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">{t('common.noData')}</li>
          ) : (
            ibgeRows.map((m, i) => (
              <li key={`${m.name}-${m.state}-${i}`} className="px-4 py-3 text-sm font-body flex justify-between gap-4">
                <span>
                  <span className="font-medium text-foreground">{m.name}</span>
                  <span className="text-muted-foreground"> ({m.state})</span>
                </span>
                <span className="font-mono text-muted-foreground shrink-0">{Math.round(m.distanceKm)} km</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t('fireFocus.monitoredSection')}</h3>
        <p className="text-xs text-muted-foreground font-body">{t('fireFocus.monitoredRadiusNote')}</p>
        {monitoredWithin200.length > 0 ? (
          <ul className="rounded-lg border border-border bg-card/40 divide-y divide-border">
            {monitoredWithin200.map(({ c, d }) => (
              <li key={c.id}>
                <Link
                  to={`/cidade/${c.id}`}
                  className="flex justify-between gap-4 px-4 py-3 text-sm font-body hover:bg-muted/40 transition-colors"
                >
                  <span>
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="text-muted-foreground"> ({c.state})</span>
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0">{Math.round(d)} km</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground font-body">{t('fireFocus.monitoredEmpty')}</p>
        )}
      </section>
    </div>
  )
}
