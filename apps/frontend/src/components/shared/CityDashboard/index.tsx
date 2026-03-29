import { getCityByName } from '@data/mockCities'
import { X } from 'lucide-react'
import { useState } from 'react'


import { AQIForecast } from './AQIForecast'
import { AQIGauge } from './AQIGauge'
import { AQIHistoryChart } from './AQIHistoryChart'
import { HealthAlertsCard } from './HealthAlertsCard'
import { OutdoorSafetyCard } from './OutdoorSafetyCard'
import { PollutantCards } from './PollutantCards'
import { PublicHealthCard } from './PublicHealthCard'
import { SmokeSourceCard } from './SmokeSourceCard'

type Period = '7d' | '30d'

interface CityDashboardProps {
  cityName: string
  onClose: () => void
}

export const CityDashboard = ({ cityName, onClose }: CityDashboardProps) => {
  const [period, setPeriod] = useState<Period>('7d')
  const city = getCityByName(cityName)

  if (!city) {
    return (
      <div className="w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground font-body text-center">
          Dados não disponíveis para <strong className="text-foreground">{cityName}</strong>.
        </p>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Fechar
        </button>
      </div>
    )
  }

  const historyData = period === '30d' ? city.history30d : city.history

  return (
    <div className="w-80 flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] pr-1 space-y-3 animate-fade-in">
      {/* Header */}
      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl tracking-wide text-foreground leading-tight">
              {city.name}
            </h2>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mt-0.5">
              {city.state} · {city.region}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex justify-center">
          <AQIGauge aqi={city.aqi} label={city.aqiLabel} />
        </div>
      </div>

      <PollutantCards pollutants={city.pollutants} />

      {/* History chart with period toggle */}
      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-lg tracking-wide text-foreground">
            HISTÓRICO
          </h3>
          <div className="flex items-center gap-0.5 bg-muted rounded border border-border overflow-hidden">
            {(['7d', '30d'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-[10px] font-mono transition-colors ${
                  period === p ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === '7d' ? '7 dias' : '30 dias'}
              </button>
            ))}
          </div>
        </div>
        <AQIHistoryChart history={historyData} hideTitleBar />
      </div>

      <AQIForecast forecast={city.forecast} />
      <SmokeSourceCard
        lat={city.lat}
        lng={city.lng}
        windDirection={city.windDirection}
        windSpeed={city.windSpeed}
        nearbyFires={city.nearbyFires.map(f => ({ lat: f.lat, lng: f.lng }))}
      />
      <OutdoorSafetyCard
        score={city.outdoorSafetyScore}
        uvIndex={city.uvIndex}
        pollenLevel={city.pollenLevel}
        aqi={city.aqi}
      />
      <HealthAlertsCard alerts={city.healthAlerts} aqiLabel={city.aqiLabel} />
      <PublicHealthCard
        hospitalizations={city.hospitalizations}
        history={city.hospitalizationHistory}
      />
    </div>
  )
}
