import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Trees, Radio, SlidersHorizontal, Wind } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FireMap } from '@components/shared/FireMap'
import { LiveIndicator } from '@components/shared/LiveIndicator'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer'
import { useFires } from '@hooks/useFires'
import { useCities } from '@hooks/useCities'
import { useIsMobile } from '@hooks/use-mobile'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

type Period = 'hoje' | '7d' | '30d'

function ImpactCard({
  fireCount,
  affectedCities,
  loading,
}: {
  fireCount: number
  affectedCities: number
  loading: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl">
      <div className="flex items-start gap-2">
        <Flame className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        {loading ? (
          <div className="h-4 bg-muted animate-pulse rounded w-48" />
        ) : (
          <p className="text-xs font-body text-foreground leading-snug">
            <span className="font-mono font-bold text-accent">{fireCount}</span>{' '}
            {t('firemap.activeFires', { count: fireCount, cities: affectedCities })}
          </p>
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
  showStations,
  onToggleStations,
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
  showStations: boolean
  onToggleStations: () => void
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
          <button
            onClick={onToggleStations}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body rounded border transition-colors ${
              showStations
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {t('firemap.officialStations')}
            {showStations && <span className="ml-auto text-[9px] font-mono bg-blue-500/20 px-1.5 py-0.5 rounded">ON</span>}
          </button>
        </div>
      </div>

      {/* Fire legend */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{t('firemap.fireIntensity')}</p>
        <div className="space-y-1.5">
          {[
            { labelKey: 'firemap.intensityHigh',   color: '#ef4444' },
            { labelKey: 'firemap.intensityMedium', color: '#ff9f4a' },
            { labelKey: 'firemap.intensityLow',    color: '#facc15' },
          ].map(({ labelKey, color }) => (
            <div key={labelKey} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              {t(labelKey as Parameters<typeof t>[0])}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const FireMapPage = () => {
  const isMobile = useIsMobile()
  const [showFires, setShowFires] = useState(true)
  const [showDeforestation, setShowDeforestation] = useState(false)
  const [showStations, setShowStations] = useState(false)
  const [stateFilter, setStateFilter] = useState('')
  const [period, setPeriod] = useState<Period>('hoje')
  const { t } = useTranslation()

  const { data: fires = [], isLoading: firesLoading } = useFires(
    stateFilter ? { state: stateFilter } : undefined,
  )
  const { data: cities = [] } = useCities()

  const states = useMemo(() => {
    const set = new Set(cities.map(c => c.state))
    return Array.from(set).sort()
  }, [cities])

  const impactStats = useMemo(() => {
    const fireCount = fires.length
    const affectedStates = new Set(fires.filter(f => f.state).map(f => f.state!))
    const affectedCities = cities.filter(c =>
      stateFilter ? c.state === stateFilter : affectedStates.has(c.state),
    ).length
    return { fireCount, affectedCities }
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
      showStations={showStations}
      onToggleStations={() => setShowStations(v => !v)}
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
            <Link to="/guia" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              {t('nav.guide')}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <LiveIndicator />
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
              fireCount={impactStats.fireCount}
              affectedCities={impactStats.affectedCities}
              loading={firesLoading}
            />

            <div className="mt-4">
              {filterControls}
            </div>
          </aside>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <FireMap
            showFires={showFires}
            showDeforestation={showDeforestation}
            showStations={showStations}
            stateFilter={stateFilter}
            periodDays={period === 'hoje' ? 1 : period === '7d' ? 7 : 30}
            fires={fires}
          />

          {/* Mobile: floating impact card */}
          {isMobile && (
            <div className="absolute top-4 left-4 right-4 z-20">
              <ImpactCard
                fireCount={impactStats.fireCount}
                affectedCities={impactStats.affectedCities}
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
