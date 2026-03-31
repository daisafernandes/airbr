import { useState } from 'react'
import { Flame, Trees, Radio, GitCompare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BrazilMap } from '@components/shared/BrazilMap'
import { FireFocusDetailDialog } from '@components/shared/FireFocusDetailDialog'
import { Header } from '@components/shared/Header'
import { AQISidebar } from '@components/shared/AQISidebar'
import { CityDashboard } from '@components/shared/CityDashboard'
import { ComparisonPanel } from '@components/shared/ComparisonPanel'
import { useFires } from '@hooks/useFires'
import { formatDateTime } from '@utils/formatters'

type ViewMode = 'city' | 'compare' | 'sidebar'

export const DashboardPage = () => {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
  const [compareCityA, setCompareCityA] = useState<string | null>(null)
  const [compareCityB, setCompareCityB] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('sidebar')
  const [showFires, setShowFires] = useState(false)
  const [showDeforestation, setShowDeforestation] = useState(false)
  const [showStations, setShowStations] = useState(false)
  const [fireDetailId, setFireDetailId] = useState<string | null>(null)
  const { t } = useTranslation()

  const { data: fires = [] } = useFires()

  const lastUpdate = formatDateTime(new Date(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId)
    if (viewMode === 'compare') {
      if (!compareCityA) {
        setCompareCityA(cityId)
      } else {
        setCompareCityB(cityId)
      }
    } else {
      setViewMode('city')
    }
  }

  const handleCloseCity = () => {
    setSelectedCityId(null)
    setViewMode('sidebar')
  }

  const handleEnterCompare = () => {
    setViewMode('compare')
    setSelectedCityId(null)
  }

  const handleCloseCompare = () => {
    setViewMode('sidebar')
    setCompareCityA(null)
    setCompareCityB(null)
    setSelectedCityId(null)
  }

  return (
    <div className="grain-overlay min-h-screen bg-background relative overflow-hidden">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '-100px' }} />
      <div className="ambient-blob blob-orange" style={{ top: '40%', right: '20%' }} />

      <Header onCitySelect={handleCitySelect} />

      <FireFocusDetailDialog
        open={fireDetailId !== null && fireDetailId.length > 0}
        onOpenChange={open => {
          if (!open) setFireDetailId(null)
        }}
        fireId={fireDetailId}
      />

      <main className="pt-16 px-4 pb-4 max-w-[1800px] mx-auto relative z-10">
        <div className="flex items-center gap-3 py-3 flex-wrap">
          <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">{t('dashboard.layers')}:</span>
          <button
            onClick={() => setShowFires(!showFires)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${
              showFires
                ? 'bg-accent/15 border-accent/40 text-accent'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {t('dashboard.fires')}
          </button>
          <button
            onClick={() => setShowDeforestation(!showDeforestation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${
              showDeforestation
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            {t('dashboard.deforestation')}
          </button>
          <button
            onClick={() => setShowStations(!showStations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${
              showStations
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {t('dashboard.stations')}
          </button>

          <div className="ml-auto">
            <button
              onClick={viewMode === 'compare' ? handleCloseCompare : handleEnterCompare}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${
                viewMode === 'compare'
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              {viewMode === 'compare' ? t('dashboard.exitComparison') : t('dashboard.compareCities')}
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <BrazilMap
            selectedCityId={selectedCityId}
            showFires={showFires}
            showDeforestation={showDeforestation}
            showStations={showStations}
            fires={fires}
            onOpenFireDetail={id => setFireDetailId(id)}
          />
          <div className="hidden lg:block">
            {viewMode === 'compare' ? (
              <ComparisonPanel
                cityA={compareCityA}
                cityB={compareCityB}
                onChangeCityA={setCompareCityA}
                onChangeCityB={setCompareCityB}
                onClose={handleCloseCompare}
              />
            ) : viewMode === 'city' && selectedCityId ? (
              <CityDashboard cityId={selectedCityId} onClose={handleCloseCity} />
            ) : (
              <AQISidebar />
            )}
          </div>
        </div>

        <footer className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border">
          <span className="font-mono">{t('dashboard.lastUpdate')}: {lastUpdate}</span>
          <span>{t('dashboard.sources')}: CETESB · INPE · IBAMA · IQAir · DATASUS · Open-Meteo</span>
        </footer>
      </main>
    </div>
  )
}
