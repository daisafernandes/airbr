import { AQIGauge } from './CityDashboard/AQIGauge'
import { OmsComplianceBadge } from '@components/ui/OmsComplianceBadge'
import type { CityData } from '@app-types/city.types'
import { cn } from '@/lib/utils'

function getBarColor(ratio: number): string {
  if (ratio <= 0.5) return '#4af0c4'
  if (ratio <= 1.0) return '#facc15'
  if (ratio <= 1.5) return '#ff9f4a'
  if (ratio <= 2.0) return '#ef4444'
  return '#a855f7'
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#4af0c4'
  if (aqi <= 100) return '#facc15'
  if (aqi <= 150) return '#ff9f4a'
  if (aqi <= 200) return '#ef4444'
  return '#a855f7'
}

interface CityColumnProps {
  city: CityData
}

const CityColumn = ({ city }: CityColumnProps) => (
  <div className="flex-1 min-w-0 flex flex-col items-center gap-3">
    <div className="text-center">
      <h3 className="font-heading text-xl tracking-wide text-foreground leading-tight">{city.name}</h3>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
        {city.state} · {city.region}
      </p>
    </div>
    <AQIGauge aqi={city.aqi} label={city.aqiLabel} />
    <OmsComplianceBadge compliant={city.omsCompliant} />
    <div className="w-full space-y-2">
      {city.pollutants.map(p => {
        const ratio = p.value / p.whoLimit
        const color = getBarColor(ratio)
        return (
          <div key={p.key} className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-muted-foreground uppercase">{p.label}</span>
              <span style={{ color }}>
                {p.value} {p.unit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min((ratio / 2) * 100, 100)}%`, background: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
    <div className="w-full bg-muted/40 border border-border/50 rounded p-3 space-y-1.5">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted-foreground">Segurança outdoor</span>
        <span className="text-foreground font-semibold">{city.outdoorSafetyScore}/10</span>
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted-foreground">Índice UV</span>
        <span className="text-foreground">{city.uvIndex}</span>
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted-foreground">Pólen</span>
        <span className="text-foreground">{city.pollenLevel}/10</span>
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted-foreground">Hospitalizações</span>
        <span className="text-foreground">{city.hospitalizations}</span>
      </div>
    </div>
  </div>
)

interface ComparisonPanelProps {
  cityA: CityData
  cityB: CityData
  className?: string
}

export const ComparisonPanel = ({ cityA, cityB, className }: ComparisonPanelProps) => {
  const colorA = getAQIColor(cityA.aqi)
  const colorB = getAQIColor(cityB.aqi)
  const winner = cityA.aqi <= cityB.aqi ? cityA : cityB

  return (
    <div className={cn('bg-card border border-border rounded p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-wide text-foreground">COMPARAR CIDADES</h2>
        <div className="text-xs font-mono text-muted-foreground text-right">
          Ar mais limpo:{' '}
          <span className="font-semibold" style={{ color: winner === cityA ? colorA : colorB }}>
            {winner.name}
          </span>
        </div>
      </div>

      <div className="flex gap-4 relative">
        <CityColumn city={cityA} />
        <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-px flex-1 bg-border" />
          <span className="text-xs font-mono text-muted-foreground px-1">VS</span>
          <div className="w-px flex-1 bg-border" />
        </div>
        <CityColumn city={cityB} />
      </div>
    </div>
  )
}
