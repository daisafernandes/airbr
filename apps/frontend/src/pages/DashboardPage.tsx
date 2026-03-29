import { useState } from 'react'
import { Flame, Trees } from 'lucide-react'

import { Header } from '@components/shared/Header'
import { BrazilMap } from '@components/shared/BrazilMap'
import { AQISidebar } from '@components/shared/AQISidebar'
import { CityDashboard } from '@components/shared/CityDashboard'

export const DashboardPage = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [showFires, setShowFires] = useState(false)
  const [showDeforestation, setShowDeforestation] = useState(false)

  const lastUpdate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="grain-overlay min-h-screen bg-background relative overflow-hidden">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '-100px' }} />
      <div className="ambient-blob blob-orange" style={{ top: '40%', right: '20%' }} />

      <Header onCitySelect={setSelectedCity} />

      <main className="pt-16 px-4 pb-4 max-w-[1800px] mx-auto relative z-10">
        <div className="flex items-center gap-3 py-3">
          <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Camadas:</span>
          <button
            onClick={() => setShowFires(!showFires)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded border transition-all ${
              showFires
                ? 'bg-accent/15 border-accent/40 text-accent'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Queimadas
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
            Desmatamento
          </button>
        </div>

        <div className="flex gap-4">
          <BrazilMap
            selectedCity={selectedCity}
            showFires={showFires}
            showDeforestation={showDeforestation}
          />
          <div className="hidden lg:block">
            {selectedCity
              ? <CityDashboard cityName={selectedCity} onClose={() => setSelectedCity(null)} />
              : <AQISidebar />}
          </div>
        </div>

        <footer className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground py-3 border-t border-border">
          <span className="font-mono">
            Última atualização: {lastUpdate}
          </span>
          <span>
            Fontes: CETESB · INPE · IBAMA · OpenAQ
          </span>
        </footer>
      </main>
    </div>
  )
}
