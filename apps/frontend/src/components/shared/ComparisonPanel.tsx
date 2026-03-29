import { getCityByName, getAQIColor } from '@data/mockCities'
import { X } from 'lucide-react'

import { CitySearchBar } from './CitySearchBar'
import { OmsComplianceBadge } from './OmsComplianceBadge'

interface ComparisonPanelProps {
  cityA: string | null
  cityB: string | null
  onChangeCityA: (name: string) => void
  onChangeCityB: (name: string) => void
  onClose: () => void
}

function MiniGauge({ aqi, label }: { aqi: number; label: string }) {
  const color = getAQIColor(aqi)
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
          AQI
        </text>
      </svg>
      <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: `${color}20`, color }}>
        {label}
      </span>
    </div>
  )
}

function PollutantBar({ label, valueA, valueB, unit, limit }: { label: string; valueA: number; valueB: number; unit: string; limit: number }) {
  const max = Math.max(valueA, valueB, limit) * 1.2
  const colorA = valueA > limit ? '#ef4444' : '#4af0c4'
  const colorB = valueB > limit ? '#ef4444' : '#facc15'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-[9px]">OMS: {limit} {unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-right font-mono text-xs" style={{ color: colorA }}>{valueA}</span>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(valueA / max) * 100}%`, background: colorA, opacity: 0.7 }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-right font-mono text-xs" style={{ color: colorB }}>{valueB}</span>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(valueB / max) * 100}%`, background: colorB, opacity: 0.7 }} />
        </div>
      </div>
    </div>
  )
}

export const ComparisonPanel = ({ cityA, cityB, onChangeCityA, onChangeCityB, onClose }: ComparisonPanelProps) => {
  const dataA = cityA ? getCityByName(cityA) : null
  const dataB = cityB ? getCityByName(cityB) : null

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
            <CitySearchBar onSelect={onChangeCityA} placeholder="Selecionar..." />
          </div>
          <div>
            <p className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-1.5">Cidade B</p>
            <CitySearchBar onSelect={onChangeCityB} placeholder="Selecionar..." />
          </div>
        </div>
      </div>

      {/* AQI gauges side by side */}
      {(dataA || dataB) && (
        <div className="bg-card border border-border rounded p-4">
          <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">ÍNDICE DE QUALIDADE DO AR</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              {dataA ? (
                <>
                  <p className="text-xs font-body font-semibold text-foreground text-center truncate w-full">{dataA.name}</p>
                  <MiniGauge aqi={dataA.aqi} label={dataA.aqiLabel} />
                  <OmsComplianceBadge compliant={dataA.omsCompliant} size="md" />
                </>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">Selecione a cidade A</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {dataB ? (
                <>
                  <p className="text-xs font-body font-semibold text-foreground text-center truncate w-full">{dataB.name}</p>
                  <MiniGauge aqi={dataB.aqi} label={dataB.aqiLabel} />
                  <OmsComplianceBadge compliant={dataB.omsCompliant} size="md" />
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
      {dataA && dataB && (
        <div className="bg-card border border-border rounded p-4 space-y-3">
          <h3 className="font-heading text-lg tracking-wide text-foreground">POLUENTES</h3>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-primary inline-block" />{dataA.name}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-yellow-400 inline-block" />{dataB.name}</span>
          </div>
          {dataA.pollutants.map(pA => {
            const pB = dataB.pollutants.find(p => p.key === pA.key)
            if (!pB) return null
            return (
              <PollutantBar
                key={pA.key}
                label={pA.label}
                valueA={pA.value}
                valueB={pB.value}
                unit={pA.unit}
                limit={pA.whoLimit}
              />
            )
          })}
        </div>
      )}

      {/* Outdoor safety comparison */}
      {dataA && dataB && (
        <div className="bg-card border border-border rounded p-4">
          <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">SEGURANÇA AO AR LIVRE</h3>
          <div className="grid grid-cols-2 gap-4">
            {[dataA, dataB].map((city, i) => {
              const scoreColor = city.outdoorSafetyScore >= 7 ? '#4af0c4' : city.outdoorSafetyScore >= 4 ? '#facc15' : '#ef4444'
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <p className="text-[10px] font-mono text-muted-foreground text-center truncate w-full">{city.name}</p>
                  <span className="font-mono font-bold text-3xl" style={{ color: scoreColor }}>
                    {city.outdoorSafetyScore}
                    <span className="text-sm text-muted-foreground">/10</span>
                  </span>
                  <div className="text-xs text-muted-foreground text-center space-y-0.5">
                    <p>UV: {city.uvIndex}</p>
                    <p>Pólen: {city.pollenLevel}/10</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
