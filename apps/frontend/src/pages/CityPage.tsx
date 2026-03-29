import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Wind, ArrowLeft, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCity } from '@hooks/useCity'
import { useCityHistory } from '@hooks/useCityHistory'
import { LiveIndicator } from '@components/shared/LiveIndicator'
import { AQIGauge } from '@components/shared/CityDashboard/AQIGauge'
import { PollutantCards } from '@components/shared/CityDashboard/PollutantCards'
import { AQIHistoryChart } from '@components/shared/CityDashboard/AQIHistoryChart'
import { OutdoorSafetyCard } from '@components/shared/CityDashboard/OutdoorSafetyCard'
import { HealthAlertsCard } from '@components/shared/CityDashboard/HealthAlertsCard'
import { SmokeSourceCard } from '@components/shared/CityDashboard/SmokeSourceCard'
import { OmsComplianceBadge } from '@components/shared/OmsComplianceBadge'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { getAQILabel, getHealthAlerts, getPollutantInfo } from '@utils/aqiInfo'
import { formatDateTime } from '@/utils/formatters'
import type { AqiReadingApi } from '@app-types/airQuality.types'
import type { Pollutant, AQIHistoryPoint } from '@app-types/city.types'

type Period = '7d' | '30d' | '1y'

function buildPollutants(
  reading: AqiReadingApi,
  pollutantInfo: ReturnType<typeof getPollutantInfo>,
): Pollutant[] {
  const keys: Array<Pollutant['key']> = ['pm25', 'pm10', 'no2', 'o3', 'co']
  return keys
    .filter(k => reading[k] !== null)
    .map(k => {
      const info = pollutantInfo[k]!
      return {
        key: k,
        label: info.label,
        value: reading[k] as number,
        unit: info.unit,
        whoLimit: info.whoLimit,
        description: info.shortDesc,
      }
    })
}

function buildHistoryPoints(readings: AqiReadingApi[], locale: string): AQIHistoryPoint[] {
  const localeMap: Record<string, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
  const resolvedLocale = localeMap[locale] ?? 'pt-BR'
  return readings.map(r => ({
    day: new Date(r.timestamp).toLocaleDateString(resolvedLocale, { day: '2-digit', month: '2-digit' }),
    aqi: r.aqi,
  }))
}

function computeOutdoorSafety(aqi: number, uv: number | null, pollen: number | null) {
  const aqiScore = Math.max(0, 10 - aqi / 50)
  const uvScore = uv !== null ? Math.max(0, 10 - uv) : 5
  const pollenScore = pollen !== null ? Math.max(0, 10 - pollen) : 5
  const score = Math.round(((aqiScore + uvScore + pollenScore) / 3) * 10) / 10
  return { score: Math.min(10, Math.max(0, score)), uvIndex: uv ?? 0, pollenLevel: pollen ?? 0 }
}

export const CityPage = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('7d')

  const { data: city, isLoading, isError } = useCity(id ?? null)
  const { data: historyReadings = [], isLoading: historyLoading } = useCityHistory(id ?? null, period === '1y' ? '1y' : period)

  const pollutantInfo = getPollutantInfo(t)
  const aqi = city?.latestAqi?.aqi ?? 0
  const aqiLabel = getAQILabel(aqi, t)
  const pollutants = city?.latestAqi ? buildPollutants(city.latestAqi, pollutantInfo) : []
  const healthAlerts = getHealthAlerts(aqi, t)
  const historyData = buildHistoryPoints(historyReadings, i18n.language)
  const pm25 = city?.latestAqi?.pm25 ?? null
  const omsCompliant = pm25 !== null ? pm25 <= 5 : false
  const safety = city ? computeOutdoorSafety(aqi, city.latestAqi?.uv ?? null, city.latestAqi?.pollen ?? null) : null

  const navLinks = [
    { to: '/', label: t('nav.dashboard') },
    { to: '/ranking', label: t('nav.ranking') },
    { to: '/mapa-queimadas', label: t('nav.fireMap') },
    { to: '/guia', label: t('nav.guide') },
  ]

  return (
    <div className="grain-overlay min-h-screen bg-background relative overflow-hidden">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '-100px' }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Wind className="w-6 h-6 text-primary" />
            <span className="font-heading text-2xl tracking-wider text-foreground">
              Respir<span className="text-primary">A</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <LiveIndicator />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4 max-w-[1000px] mx-auto relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('cityDashboard.back')}
        </button>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded w-64" />
            <div className="h-5 bg-muted animate-pulse rounded w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="h-64 bg-muted animate-pulse rounded" />
              <div className="h-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ) : isError || !city ? (
          <div className="bg-card border border-border rounded p-8 text-center">
            <p className="text-muted-foreground font-body mb-4">{t('cityDashboard.notFound')}</p>
            <Link to="/" className="text-xs text-primary hover:underline">{t('cityDashboard.backToDashboard')}</Link>
          </div>
        ) : (
          <>
            {/* City title */}
            <div className="mb-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-4xl sm:text-5xl tracking-wide text-foreground leading-tight">
                    {city.name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-body uppercase tracking-widest mt-1">
                    {city.state} · {city.region}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <OmsComplianceBadge compliant={omsCompliant} size="md" />
                  <Link
                    to="/"
                    state={{ selectCity: city.id }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-border rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('cityDashboard.seeOnMap')}
                  </Link>
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-2">
                {t('cityDashboard.sourceLabel')}: {city.source} · {t('cityDashboard.lastUpdateLabel')}:{' '}
                {city.latestAqi
                  ? formatDateTime(new Date(city.latestAqi.timestamp), {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* AQI gauge */}
                <div className="bg-card border border-border rounded p-6 flex flex-col items-center">
                  <AQIGauge aqi={aqi} label={aqiLabel} />
                </div>

                {/* Pollutants */}
                {pollutants.length > 0 && <PollutantCards pollutants={pollutants} />}

                {/* Health alerts */}
                <HealthAlertsCard alerts={healthAlerts} aqiLabel={aqiLabel} />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* History chart */}
                <div className="bg-card border border-border rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-lg tracking-wide text-foreground">{t('cityDashboard.history')}</h3>
                    <div className="flex items-center gap-0.5 bg-muted rounded border border-border overflow-hidden">
                      {(['7d', '30d', '1y'] as Period[]).map(p => (
                        <button
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={`px-2.5 py-1 text-[10px] font-mono transition-colors ${
                            period === p ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {p === '7d' ? t('cityDashboard.days7') : p === '30d' ? t('cityDashboard.days30') : t('cityDashboard.year1')}
                        </button>
                      ))}
                    </div>
                  </div>
                  {historyLoading ? (
                    <div className="h-24 bg-muted animate-pulse rounded" />
                  ) : historyData.length > 0 ? (
                    <AQIHistoryChart history={historyData} hideTitleBar />
                  ) : (
                    <p className="text-xs text-muted-foreground font-body text-center py-4">
                      {t('cityDashboard.noHistory')}
                    </p>
                  )}
                </div>

                {/* Outdoor safety */}
                {safety && (
                  <OutdoorSafetyCard
                    score={safety.score}
                    uvIndex={safety.uvIndex}
                    pollenLevel={safety.pollenLevel}
                    aqi={aqi}
                  />
                )}

                {/* Smoke source */}
                <SmokeSourceCard
                  lat={city.lat}
                  lng={city.lng}
                  windDirection={45}
                  windSpeed={0}
                  nearbyFires={[]}
                />

                {/* Metadata */}
                <div className="bg-card border border-border rounded p-4">
                  <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">{t('cityDashboard.information')}</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cityDashboard.coordinates')}</span>
                      <span className="text-foreground">{city.lat.toFixed(4)}, {city.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cityDashboard.state')}</span>
                      <span className="text-foreground">{city.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cityDashboard.region')}</span>
                      <span className="text-foreground">{city.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cityDashboard.dataSource')}</span>
                      <span className="text-foreground">{city.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cityDashboard.whoLimitPM25')}</span>
                      <span className={omsCompliant ? 'text-primary' : 'text-accent'}>
                        {pm25 !== null ? `${pm25.toFixed(1)} µg/m³ (${t('oms.limit').toLowerCase()}: 5)` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="mt-10 text-xs text-muted-foreground text-center font-mono">
              {t('dashboard.sources')}: {city.source} · INPE · DATASUS · Open-Meteo · IQAir
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
