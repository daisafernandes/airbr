import { X } from 'lucide-react'
import { useState } from 'react'

import { useCity } from '@hooks/useCity'
import { useCityHistory } from '@hooks/useCityHistory'
import type { AqiReadingApi } from '@app-types/airQuality.types'
import type { Pollutant, AQIHistoryPoint, HealthAlert } from '@app-types/city.types'

import { AQIGauge } from './AQIGauge'
import { AQIHistoryChart } from './AQIHistoryChart'
import { HealthAlertsCard } from './HealthAlertsCard'
import { OutdoorSafetyCard } from './OutdoorSafetyCard'
import { PollutantCards } from './PollutantCards'
import { SmokeSourceCard } from './SmokeSourceCard'

type Period = '7d' | '30d'

interface CityDashboardProps {
  cityId: string
  onClose: () => void
}

function getAQILabel(aqi: number): string {
  if (aqi <= 50) return 'Bom'
  if (aqi <= 100) return 'Moderado'
  if (aqi <= 150) return 'Ruim p/ sensíveis'
  if (aqi <= 200) return 'Ruim'
  if (aqi <= 300) return 'Muito ruim'
  return 'Perigoso'
}

function buildPollutants(reading: AqiReadingApi): Pollutant[] {
  const defs: Array<{ key: Pollutant['key']; label: string; unit: string; whoLimit: number; description: string }> = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', whoLimit: 5, description: 'Partículas finas (< 2,5 µm). Penetram fundo nos pulmões e causam doenças respiratórias e cardiovasculares.' },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³', whoLimit: 15, description: 'Partículas inaláveis (< 10 µm). Irritam vias aéreas superiores e agravam asma e bronquite.' },
    { key: 'no2', label: 'NO₂', unit: 'µg/m³', whoLimit: 10, description: 'Dióxido de nitrogênio. Emitido por motores e indústrias. Agrava asma e aumenta risco de infecções.' },
    { key: 'o3', label: 'O₃', unit: 'µg/m³', whoLimit: 60, description: 'Ozônio troposférico. Formado pela reação de NOx com COV sob luz solar. Irrita olhos e pulmões.' },
    { key: 'co', label: 'CO', unit: 'mg/m³', whoLimit: 4, description: 'Monóxido de carbono. Gás inodoro e incolor que reduz a capacidade do sangue de transportar oxigênio.' },
  ]

  return defs
    .filter(d => reading[d.key] !== null)
    .map(d => ({
      key: d.key,
      label: d.label,
      value: reading[d.key] as number,
      unit: d.unit,
      whoLimit: d.whoLimit,
      description: d.description,
    }))
}

function buildHealthAlerts(aqi: number): HealthAlert[] {
  if (aqi <= 50) return [{ severity: 'info', message: 'Qualidade do ar boa. Sem restrições para atividades ao ar livre.' }]
  if (aqi <= 100) return [
    { severity: 'warning', message: 'Qualidade moderada. Pessoas muito sensíveis podem sentir leve desconforto.' },
  ]
  if (aqi <= 150) return [
    { severity: 'warning', message: 'Ruim para grupos sensíveis: crianças, idosos e asmáticos devem limitar esforços ao ar livre.' },
    { severity: 'info', message: 'Pessoas saudáveis geralmente não são afetadas.' },
  ]
  if (aqi <= 200) return [
    { severity: 'danger', message: 'Qualidade do ar ruim. Evite atividades físicas intensas ao ar livre.' },
    { severity: 'warning', message: 'Grupos de risco: permaneça em ambientes fechados e com janelas fechadas.' },
  ]
  if (aqi <= 300) return [
    { severity: 'critical', message: 'Qualidade muito ruim. Risco à saúde de toda a população.' },
    { severity: 'danger', message: 'Crianças, idosos e doentes cardiorrespiratórios: não saia de casa.' },
  ]
  return [
    { severity: 'critical', message: 'SITUAÇÃO DE EMERGÊNCIA. Qualidade do ar perigosa.' },
    { severity: 'critical', message: 'Toda a população deve evitar qualquer exposição ao ar externo.' },
  ]
}

function buildHistoryPoints(readings: AqiReadingApi[]): AQIHistoryPoint[] {
  return readings.map(r => ({
    day: new Date(r.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    aqi: r.aqi,
  }))
}

function computeOutdoorSafety(aqi: number, uv: number | null, pollen: number | null) {
  const aqiScore = Math.max(0, 10 - (aqi / 50))
  const uvScore = uv !== null ? Math.max(0, 10 - uv) : 5
  const pollenScore = pollen !== null ? Math.max(0, 10 - pollen) : 5
  const score = Math.round(((aqiScore + uvScore + pollenScore) / 3) * 10) / 10
  return { score: Math.min(10, Math.max(0, score)), uvIndex: uv ?? 0, pollenLevel: pollen ?? 0 }
}

export const CityDashboard = ({ cityId, onClose }: CityDashboardProps) => {
  const [period, setPeriod] = useState<Period>('7d')

  const { data: city, isLoading, isError } = useCity(cityId)
  const { data: historyReadings = [], isLoading: historyLoading } = useCityHistory(
    cityId,
    period === '7d' ? '7d' : '30d',
  )

  if (isLoading) {
    return (
      <div className="w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col gap-3 animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-40 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    )
  }

  if (isError || !city) {
    return (
      <div className="w-80 flex-shrink-0 bg-card border border-border rounded p-6 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground font-body text-center">
          Dados não disponíveis para esta cidade.
        </p>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Fechar
        </button>
      </div>
    )
  }

  const aqi = city.latestAqi?.aqi ?? 0
  const aqiLabel = getAQILabel(aqi)
  const pollutants = city.latestAqi ? buildPollutants(city.latestAqi) : []
  const healthAlerts = buildHealthAlerts(aqi)
  const historyData = buildHistoryPoints(historyReadings)
  const { score, uvIndex, pollenLevel } = computeOutdoorSafety(
    aqi,
    city.latestAqi?.uv ?? null,
    city.latestAqi?.pollen ?? null,
  )

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
          <AQIGauge aqi={aqi} label={aqiLabel} />
        </div>
      </div>

      {pollutants.length > 0 && <PollutantCards pollutants={pollutants} />}

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
        {historyLoading ? (
          <div className="h-24 bg-muted animate-pulse rounded" />
        ) : historyData.length > 0 ? (
          <AQIHistoryChart history={historyData} hideTitleBar />
        ) : (
          <p className="text-xs text-muted-foreground font-body text-center py-4">
            Histórico ainda não disponível.
          </p>
        )}
      </div>

      {/* Outdoor safety — computed from API fields */}
      <OutdoorSafetyCard score={score} uvIndex={uvIndex} pollenLevel={pollenLevel} aqi={aqi} />

      {/* Smoke source — TODO Fase 4: requires wind API + INPE fires cross-reference */}
      <SmokeSourceCard
        lat={city.lat}
        lng={city.lng}
        windDirection={45}
        windSpeed={0}
        nearbyFires={[]}
      />

      <HealthAlertsCard alerts={healthAlerts} aqiLabel={aqiLabel} />
    </div>
  )
}
