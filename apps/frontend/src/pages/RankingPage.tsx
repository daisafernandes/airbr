import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownUp, Wind } from 'lucide-react'

import { useCities } from '@hooks/useCities'
import { useIsMobile } from '@hooks/use-mobile'
import { LiveIndicator } from '@components/shared/LiveIndicator'
import { RankingTable } from '@components/shared/RankingTable'

type SortMode = 'polluted' | 'clean'

const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'] as const

export const RankingPage = () => {
  const isMobile = useIsMobile()
  const [sortMode, setSortMode] = useState<SortMode>('polluted')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')

  const { data: cities = [], isLoading } = useCities()

  const states = useMemo(() => {
    const set = new Set(cities.map(c => c.state))
    return Array.from(set).sort()
  }, [cities])

  const filteredAndSorted = useMemo(() => {
    let list = [...cities]

    if (regionFilter !== 'all') {
      list = list.filter(c => c.region === regionFilter)
    }
    if (stateFilter !== 'all') {
      list = list.filter(c => c.state === stateFilter)
    }

    list.sort((a, b) => {
      const aAqi = a.latestAqi?.aqi ?? 0
      const bAqi = b.latestAqi?.aqi ?? 0
      return sortMode === 'polluted' ? bAqi - aAqi : aAqi - bAqi
    })

    return list
  }, [cities, regionFilter, stateFilter, sortMode])

  const stats = useMemo(() => {
    if (!cities.length) return null
    const withAqi = cities.filter(c => c.latestAqi)
    const avg = withAqi.length
      ? Math.round(withAqi.reduce((s, c) => s + (c.latestAqi?.aqi ?? 0), 0) / withAqi.length)
      : 0
    const compliant = withAqi.filter(c => (c.latestAqi?.pm25 ?? 9999) <= 5).length
    const worst = [...withAqi].sort((a, b) => (b.latestAqi?.aqi ?? 0) - (a.latestAqi?.aqi ?? 0))[0]
    return { avg, compliant, total: cities.length, worst }
  }, [cities])

  return (
    <div className="grain-overlay min-h-screen bg-background relative overflow-hidden">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '20%' }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <Wind className="w-6 h-6 text-primary" />
            <span className="font-heading text-2xl tracking-wider text-foreground">
              Respir<span className="text-primary">A</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link to="/" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              Dashboard
            </Link>
            <span className="px-3 py-1.5 text-xs font-body text-primary border-b border-primary font-semibold">
              Ranking
            </span>
            <Link to="/mapa-queimadas" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              Mapa Queimadas
            </Link>
            <Link to="/guia" className="px-3 py-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted">
              Guia
            </Link>
          </nav>

          <LiveIndicator />
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 max-w-[1400px] mx-auto relative z-10">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wide text-foreground">RANKING NACIONAL</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Qualidade do ar em todas as cidades monitoradas
            {stats && ` · ${stats.total} cidades`}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded p-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">AQI Médio Nacional</p>
            {isLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded w-16" />
            ) : (
              <p className="font-mono font-bold text-2xl text-foreground">{stats?.avg ?? '—'}</p>
            )}
          </div>
          <div className="bg-card border border-border rounded p-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Conformes OMS</p>
            {isLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded w-20" />
            ) : (
              <p className="font-mono font-bold text-2xl text-green-400">
                {stats?.compliant ?? '—'}
                <span className="text-sm text-muted-foreground font-normal">/{stats?.total ?? '—'}</span>
              </p>
            )}
          </div>
          <div className="bg-card border border-border rounded p-3 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Mais Poluída</p>
            {isLoading ? (
              <div className="h-6 bg-muted animate-pulse rounded w-32" />
            ) : (
              <p className="font-body font-semibold text-foreground">
                {stats?.worst?.name ?? '—'}
                {stats?.worst && (
                  <span className="text-sm text-muted-foreground font-normal ml-1.5">AQI {stats.worst.latestAqi?.aqi}</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          {/* Sort toggle */}
          <div className="flex items-center bg-muted border border-border rounded overflow-hidden shrink-0">
            <button
              onClick={() => setSortMode('polluted')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-colors ${
                sortMode === 'polluted'
                  ? 'bg-accent/15 text-accent border-r border-border'
                  : 'text-muted-foreground hover:text-foreground border-r border-border'
              }`}
            >
              Mais Poluídas
            </button>
            <button
              onClick={() => setSortMode('clean')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-colors ${
                sortMode === 'clean' ? 'bg-green-500/15 text-green-400' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mais Limpas
            </button>
          </div>

          {/* Region chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-2.5 py-1 text-xs font-body rounded border transition-colors ${
                regionFilter === 'all'
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas
            </button>
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => { setRegionFilter(r); setStateFilter('all') }}
                className={`px-2.5 py-1 text-xs font-body rounded border transition-colors ${
                  regionFilter === r
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* State select */}
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="bg-muted border border-border rounded px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:ml-auto"
          >
            <option value="all">Todos os estados</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sort indicator */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground font-mono">
          <ArrowDownUp className="w-3.5 h-3.5" />
          {filteredAndSorted.length} cidade{filteredAndSorted.length !== 1 ? 's' : ''} ·{' '}
          {sortMode === 'polluted' ? 'Maior AQI primeiro' : 'Menor AQI primeiro'}
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded p-3 h-14 animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <RankingTable cities={filteredAndSorted} isMobile={isMobile} />
        ) : (
          <div className="bg-card border border-border rounded p-8 text-center">
            <p className="text-muted-foreground font-body">Nenhuma cidade encontrada com os filtros selecionados.</p>
          </div>
        )}

        <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border gap-2">
          <span className="font-mono">
            Última atualização: {new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span>Fontes: IQAir · AQICN · CETESB · DATASUS · IBGE · Open-Meteo</span>
        </footer>
      </main>
    </div>
  )
}
