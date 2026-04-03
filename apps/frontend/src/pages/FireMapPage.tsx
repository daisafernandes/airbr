import { Flame, Trees, SlidersHorizontal, Wind } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { LanguageSelector } from '@/components/ui/LanguageSelector'
import type { CityApiData, FireFocusApi } from '@app-types/airQuality.types'
import { AuthHeaderActions } from '@components/shared/AuthHeaderActions'
import { FireFocusDetailDialog } from '@components/shared/FireFocusDetailDialog'
import { FireMap } from '@components/shared/FireMap'
import { LiveIndicator } from '@components/shared/LiveIndicator'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer'
import { useIsMobile } from '@hooks/use-mobile'
import { useCities } from '@hooks/useCities'
import { useFires } from '@hooks/useFires'

type Period = 'hoje' | '7d' | '30d'

const PERIOD_DAYS: Record<Period, number> = {
  hoje: 1,
  '7d': 7,
  '30d': 30,
}

const AFFECTED_CITIES_PREVIEW = 6

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.data)) return record.data as T[]
    if (Array.isArray(record.results)) return record.results as T[]
  }
  return []
}

function ImpactCard({
  showFires,
  fireCount,
  affectedCities,
  affectedCityLabels,
  loading,
}: {
  showFires: boolean
  fireCount: number
  affectedCities: number
  affectedCityLabels: string[]
  loading: boolean
}) {
  const { t } = useTranslation()
  const preview = affectedCityLabels.slice(0, AFFECTED_CITIES_PREVIEW)
  const rest = Math.max(0, affectedCityLabels.length - preview.length)

  return (
    <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl">
      <div className="flex items-start gap-2">
        <Flame className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        {loading ? (
          <div className="h-4 bg-muted animate-pulse rounded w-48" />
        ) : !showFires ? (
          <p className="text-xs font-body text-muted-foreground leading-snug min-w-0 flex-1">
            {t('firemap.fireLayerOffHint')}
          </p>
        ) : fireCount === 0 ? (
          <p className="text-xs font-body text-muted-foreground leading-snug min-w-0 flex-1">
            {t('firemap.noFireFoci')}
          </p>
        ) : (
          <div className="text-xs font-body text-foreground leading-snug min-w-0 flex-1">
            <p>
              <span className="font-mono font-bold text-accent">{fireCount}</span>{' '}
              {t('firemap.activeFires', { cities: affectedCities })}
            </p>
            {preview.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground border-t border-border/60 pt-1.5">
                {preview.map((label, i) => (
                  <li key={`${label}-${i}`} className="truncate" title={label}>
                    {label}
                  </li>
                ))}
                {rest > 0 && (
                  <li className="text-[10px] font-mono italic">{t('firemap.andMoreCities', { count: rest })}</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterControls({
  stateFilter,
  onStateChange,
  period,
  onPeriodChange,
  showFires,
  onToggleFires,
  showDeforestation,
  onToggleDeforestation,
  states,
}: {
  stateFilter: string
  onStateChange: (v: string) => void
  period: Period
  onPeriodChange: (v: Period) => void
  showFires: boolean
  onToggleFires: () => void
  showDeforestation: boolean
  onToggleDeforestation: () => void
  states: string[]
}) {
  const { t } = useTranslation()

  const PERIOD_LABELS: Record<Period, string> = {
    hoje: t('firemap.today'),
    '7d': t('firemap.days7'),
    '30d': t('firemap.days30'),
  }

  return (
    <div className="space-y-4">
      {/* Period */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{t('firemap.period')}</p>
        <div className="flex gap-1.5">
          {(['hoje', '7d', '30d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 text-xs font-body rounded border transition-colors ${
                period === p
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* State */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{t('firemap.state')}</p>
        <select
          value={stateFilter}
          onChange={e => onStateChange(e.target.value)}
          className="w-full bg-muted border border-border rounded px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{t('firemap.allBrazil')}</option>
          {states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Layer toggles */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{t('firemap.layers')}</p>
        <div className="space-y-2">
          <button
            onClick={onToggleFires}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body rounded border transition-colors ${
              showFires
                ? 'bg-accent/15 border-accent/40 text-accent'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {t('firemap.fireFoci')}
            {showFires && <span className="ml-auto text-[9px] font-mono bg-accent/20 px-1.5 py-0.5 rounded">ON</span>}
          </button>
          <button
            onClick={onToggleDeforestation}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body rounded border transition-colors ${
              showDeforestation
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            {t('firemap.deforestation')}
            {showDeforestation && <span className="ml-auto text-[9px] font-mono bg-green-500/20 px-1.5 py-0.5 rounded">ON</span>}
          </button>
        </div>
      </div>

      {/* Fire legend */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{t('firemap.fireIntensity')}</p>
        <div className="space-y-1.5">
          {(
            [
              ['firemap.intensityHigh', '#ef4444'],
              ['firemap.intensityMedium', '#ff9f4a'],
              ['firemap.intensityLow', '#facc15'],
            ] as const
          ).map(([labelKey, color]) => (
            <div key={labelKey} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              {t(labelKey)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const FireMapPage = () => {
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const fireDetailId = searchParams.get('foco')
  const [showFires, setShowFires] = useState(true)
  const [showDeforestation, setShowDeforestation] = useState(false)
  const [stateFilter, setStateFilter] = useState('')
  const [period, setPeriod] = useState<Period>('hoje')
  const { t } = useTranslation()

  const openFireDetail = (id: string) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set('foco', id)
        return next
      },
      { replace: true },
    )
  }

  const { data: firesData = [], isLoading: firesLoading } = useFires({
    ...(stateFilter ? { state: stateFilter } : {}),
    days: PERIOD_DAYS[period],
  })
  const { data: citiesData = [] } = useCities()
  const fires = useMemo(() => toArray<FireFocusApi>(firesData), [firesData])
  const cities = useMemo(() => toArray<CityApiData>(citiesData), [citiesData])

  const states = useMemo(() => {
    const set = new Set(cities.map(c => c.state))
    return Array.from(set).sort()
  }, [cities])

  const impactStats = useMemo(() => {
    const fireCount = fires.length
    const affectedStates = new Set(fires.filter(f => f.state).map(f => f.state!))
    const inImpact = cities.filter(c =>
      stateFilter ? c.state === stateFilter : affectedStates.has(c.state),
    )
    const sorted = [...inImpact].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return {
      fireCount,
      affectedCities: sorted.length,
      affectedCityLabels: sorted.map(c => `${c.name} (${c.state})`),
    }
  }, [fires, cities, stateFilter])

  const filterControls = (
    <FilterControls
      stateFilter={stateFilter}
      onStateChange={setStateFilter}
      period={period}
      onPeriodChange={setPeriod}
      showFires={showFires}
      onToggleFires={() => setShowFires(v => !v)}
      showDeforestation={showDeforestation}
      onToggleDeforestation={() => setShowDeforestation(v => !v)}
      states={states}
    />
  )

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-card/80 backdrop-blur-xl border-b border-border z-40">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <Wind className="w-6 h-6 text-primary" />
            <span className="font-heading text-2xl tracking-wider text-foreground">
              Respir<span className="text-primary">A</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link to="/" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              {t('nav.dashboard')}
            </Link>
            <Link to="/ranking" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              {t('nav.ranking')}
            </Link>
            <span className="px-3 py-1.5 text-xs font-body text-accent border-b border-accent font-semibold">
              {t('nav.fireMap')}
            </span>
            <Link to="/guide" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              {t('nav.guide')}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <LiveIndicator />
            <AuthHeaderActions />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar — desktop only */}
        {!isMobile && (
          <aside className="w-72 shrink-0 bg-card border-r border-border overflow-y-auto p-4 space-y-2 z-10">
            <div className="mb-4">
              <h2 className="font-heading text-2xl tracking-wide text-foreground">{t('firemap.title')}</h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{t('firemap.subtitle')}</p>
            </div>

            <ImpactCard
              showFires={showFires}
              fireCount={impactStats.fireCount}
              affectedCities={impactStats.affectedCities}
              affectedCityLabels={impactStats.affectedCityLabels}
              loading={firesLoading}
            />

            <div className="mt-4">
              {filterControls}
            </div>
          </aside>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <FireFocusDetailDialog
            open={fireDetailId !== null && fireDetailId.length > 0}
            onOpenChange={open => {
              if (!open) {
                setSearchParams(
                  prev => {
                    const next = new URLSearchParams(prev)
                    next.delete('foco')
                    return next
                  },
                  { replace: true },
                )
              }
            }}
            fireId={fireDetailId}
          />
          <FireMap
            showFires={showFires}
            showDeforestation={showDeforestation}
            stateFilter={stateFilter}
            fires={fires}
            onOpenFireDetail={openFireDetail}
          />

          {/* Mobile: floating impact card */}
          {isMobile && (
            <div className="absolute top-4 left-4 right-4 z-20">
              <ImpactCard
                showFires={showFires}
                fireCount={impactStats.fireCount}
                affectedCities={impactStats.affectedCities}
                affectedCityLabels={impactStats.affectedCityLabels}
                loading={firesLoading}
              />
            </div>
          )}

          {/* Mobile: floating filter button */}
          {isMobile && (
            <Drawer>
              <DrawerTrigger asChild>
                <button className="absolute bottom-6 right-4 z-20 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 shadow-xl text-sm font-body text-foreground hover:bg-muted transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {t('firemap.filtersAndLayers')}
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-card border-t border-border">
                <DrawerHeader>
                  <DrawerTitle className="font-heading tracking-wide text-foreground">
                    {t('firemap.filtersAndLayers')}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 overflow-y-auto max-h-[60vh]">
                  {filterControls}
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  )
}
