import { X } from 'lucide-react'

import { useCity } from '@hooks/useCity'
import type { CityApiData } from '@app-types/airQuality.types'
import { CitySearchBar } from './CitySearchBar'
import { OmsComplianceBadge } from './OmsComplianceBadge'

interface ComparisonPanelProps {
  cityA: string | null
  cityB: string | null
  onChangeCityA: (cityId: string) => void
  onChangeCityB: (cityId: string) => void
  onClose: () => void
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#7f1d1d'
}

function getAQILabel(aqi: number): string {
  if (aqi <= 50) return 'Bom'
  if (aqi <= 100) return 'Moderado'
  if (aqi <= 150) return 'Sensíveis'
  if (aqi <= 200) return 'Ruim'
  if (aqi <= 300) return 'Muito ruim'
  return 'Perigoso'
}

function MiniGauge({ aqi }: { aqi: number }) {
  const color = getAQIColor(aqi)
  const label = getAQILabel(aqi)
  const size = 120
  const cx = size / 2
  const cy = size / 2 + 8
  const r = 46
  const startAngle = 210
  const totalDeg = 240
  const fillDeg = (Math.min(aqi, 500) / 500) * totalDeg
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const pointOnArc = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })
  const trackStart = pointOnArc(startAngle)
  const trackEnd = pointOnArc(startAngle + totalDeg)
  const fillEnd = pointOnArc(startAngle + fillDeg)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size - 8} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {fillDeg > 0 && (
          <path
            d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${fillDeg > 180 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
          />
        )}
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize={22} fontWeight="700" fontFamily="'DM Mono',monospace" fill={color}>
          {aqi}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontFamily="'DM Sans',sans-serif" fill="rgba(255,255,255,0.4)" letterSpacing="0.08em">
          IQAr
        </text>
      </svg>
      <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: `${color}20`, color }}>
        {label}
      </span>
    </div>
  )
}

function PollutantBar({ label, valueA, valueB, unit, limit }: { label: string; valueA: number | null; valueB: number | null; unit: string; limit: number }) {
  const vA = valueA ?? 0
  const vB = valueB ?? 0
  const max = Math.max(vA, vB, limit) * 1.2
  const colorA = vA > limit ? '#ef4444' : '#4af0c4'
  const colorB = vB > limit ? '#ef4444' : '#facc15'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-[9px]">OMS: {limit} {unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-right font-mono text-xs" style={{ color: colorA }}>{vA > 0 ? vA.toFixed(1) : '—'}</span>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(vA / max) * 100}%`, background: colorA, opacity: 0.7 }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-right font-mono text-xs" style={{ color: colorB }}>{vB > 0 ? vB.toFixed(1) : '—'}</span>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(vB / max) * 100}%`, background: colorB, opacity: 0.7 }} />
        </div>
      </div>
    </div>
  )
}

function CityColumn({ city }: { city: CityApiData }) {
  const aqi = city.latestAqi?.aqi ?? 0
  const pm25 = city.latestAqi?.pm25 ?? null
  const omsCompliant = pm25 !== null ? pm25 <= 5 : false
  return { city, aqi, pm25, omsCompliant }
}

export const ComparisonPanel = ({ cityA, cityB, onChangeCityA, onChangeCityB, onClose }: ComparisonPanelProps) => {
  const { data: dataA, isLoading: loadingA } = useCity(cityA)
  const { data: dataB, isLoading: loadingB } = useCity(cityB)

  const colA = dataA ? CityColumn({ city: dataA }) : null
  const colB = dataB ? CityColumn({ city: dataB }) : null

  const pollutants = [
    { key: 'pm25' as const, label: 'PM2.5', unit: 'µg/m³', limit: 5 },
    { key: 'pm10' as const, label: 'PM10', unit: 'µg/m³', limit: 15 },
    { key: 'no2' as const, label: 'NO₂', unit: 'µg/m³', limit: 10 },
    { key: 'o3' as const, label: 'O₃', unit: 'µg/m³', limit: 60 },
    { key: 'co' as const, label: 'CO', unit: 'mg/m³', limit: 4 },
  ]

  return (
    <div className="w-[360px] flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)] space-y-3 animate-fade-in">
      {/* Header */}
      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl tracking-wide text-foreground">COMPARAR CIDADES</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1.5">Cidade A</p>
            <CitySearchBar onSelect={(id) => onChangeCityA(id)} placeholder="Selecionar..." useFixedDropdown />
          </div>
          <div>
            <p className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-1.5">Cidade B</p>
            <CitySearchBar onSelect={(id) => onChangeCityB(id)} placeholder="Selecionar..." useFixedDropdown />
          </div>
        </div>
      </div>

      {/* AQI gauges side by side */}
      {(colA || colB || loadingA || loadingB) && (
        <div className="bg-card border border-border rounded p-4">
          <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">ÍNDICE DE QUALIDADE DO AR</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              {loadingA ? (
                <div className="h-32 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-mono animate-pulse">Carregando...</span>
                </div>
              ) : colA ? (
                <>
                  <p className="text-xs font-body font-semibold text-foreground text-center truncate w-full">{colA.city.name}</p>
                  <MiniGauge aqi={colA.aqi} />
                  <OmsComplianceBadge compliant={colA.omsCompliant} size="md" />
                </>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">Selecione a cidade A</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {loadingB ? (
                <div className="h-32 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-mono animate-pulse">Carregando...</span>
                </div>
              ) : colB ? (
                <>
                  <p className="text-xs font-body font-semibold text-foreground text-center truncate w-full">{colB.city.name}</p>
                  <MiniGauge aqi={colB.aqi} />
                  <OmsComplianceBadge compliant={colB.omsCompliant} size="md" />
                </>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">Selecione a cidade B</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pollutants comparison */}
      {colA && colB && (
        <div className="bg-card border border-border rounded p-4 space-y-3">
          <h3 className="font-heading text-lg tracking-wide text-foreground">POLUENTES</h3>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-primary inline-block" />{colA.city.name}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-yellow-400 inline-block" />{colB.city.name}</span>
          </div>
          {pollutants.map(p => (
            <PollutantBar
              key={p.key}
              label={p.label}
              valueA={colA.city.latestAqi?.[p.key] ?? null}
              valueB={colB.city.latestAqi?.[p.key] ?? null}
              unit={p.unit}
              limit={p.limit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
