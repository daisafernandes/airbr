import type { TFunction } from 'i18next'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CityApiData } from '@app-types/airQuality.types'
import { useCity } from '@hooks/useCity'

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

function getAQILabel(aqi: number, t: TFunction): string {
  if (aqi <= 50) return t('aqi.bands.good.label')
  if (aqi <= 100) return t('aqi.bands.moderate.label')
  if (aqi <= 150) return t('aqi.sensitiveShortAlt')
  if (aqi <= 200) return t('aqi.bands.unhealthy.label')
  if (aqi <= 300) return t('aqi.bands.veryUnhealthy.label')
  return t('aqi.bands.hazardous.label')
}

// Colors used only to identify which city row belongs to which city.
// Pollutant status colors (below/above limit) are handled separately.
const CITY_A_COLOR = 'hsl(214 100% 65%)' // matches --secondary
const CITY_B_COLOR = 'hsl(30 100% 65%)' // matches --accent

// Pollutant status colors.
// Pollutant status colors (used only inside the bars).
const STATUS_GOOD_COLOR = '#4af0c4' // green-cyan (OK / below moderate range)
const STATUS_MODERATE_COLOR = '#eab308' // yellow (Moderado)
const STATUS_LIMIT_EXCEEDED_COLOR = '#ef4444' // red-500

function getPollutantStatusColor(value: number, limit: number): string {
  if (limit <= 0) return STATUS_GOOD_COLOR
  // Define "Moderado" as being close to the WHO limit (tunable threshold).
  // Example: value >= 70% of limit => Moderado (yellow)
  if (value > limit) return STATUS_LIMIT_EXCEEDED_COLOR
  if (value >= limit * 0.7) return STATUS_MODERATE_COLOR
  return STATUS_GOOD_COLOR
}

function MiniGauge({ aqi, t }: { aqi: number; t: TFunction }) {
  const color = getAQIColor(aqi)
  const label = getAQILabel(aqi, t)
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
          {t('comparisonPanel.aqiAbbr')}
        </text>
      </svg>
      <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: `${color}20`, color }}>
        {label}
      </span>
    </div>
  )
}

function PollutantBar({
  label,
  valueA,
  valueB,
  limit,
  whoLabel,
}: {
  label: string
  valueA: number | null
  valueB: number | null
  limit: number
  whoLabel: string
}) {
  const vA = valueA ?? 0
  const vB = valueB ?? 0
  const max = Math.max(vA, vB, limit) * 1.2
  const statusColorA = getPollutantStatusColor(vA, limit)
  const statusColorB = getPollutantStatusColor(vB, limit)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-[9px]">{whoLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 flex justify-center">
          <span className="w-2 h-2 rounded-full" style={{ background: CITY_A_COLOR }} />
        </span>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(vA / max) * 100}%`, background: statusColorA, opacity: 0.7 }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 flex justify-center">
          <span className="w-2 h-2 rounded-full" style={{ background: CITY_B_COLOR }} />
        </span>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(vB / max) * 100}%`, background: statusColorB, opacity: 0.7 }} />
        </div>
      </div>
    </div>
  )
}

function TemperatureCompareRow({
  valueA,
  valueB,
  label,
  unit,
}: {
  valueA: number | null | undefined
  valueB: number | null | undefined
  label: string
  unit: string
}) {
  const fmt = (v: number | null | undefined) =>
    v != null && !Number.isNaN(v) ? v.toFixed(1) : '—'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-[9px]">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-right font-mono text-xs" style={{ color: CITY_A_COLOR }}>{fmt(valueA)}</span>
        <div className="flex-1 h-px bg-border" />
        <span className="w-10 text-right font-mono text-xs" style={{ color: CITY_B_COLOR }}>{fmt(valueB)}</span>
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
  const { t } = useTranslation()
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
    <div className="w-[360px] flex-shrink-0 flex flex-col space-y-3 animate-fade-in">
      {/* Header */}
      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl tracking-wide text-foreground">{t('comparisonPanel.title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: CITY_A_COLOR }}>{t('comparisonPanel.cityA')}</p>
            <CitySearchBar onSelect={(id) => onChangeCityA(id)} placeholder={t('common.selectPlaceholder')} useFixedDropdown />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: CITY_B_COLOR }}>{t('comparisonPanel.cityB')}</p>
            <CitySearchBar onSelect={(id) => onChangeCityB(id)} placeholder={t('common.selectPlaceholder')} useFixedDropdown />
          </div>
        </div>
      </div>

      {/* AQI gauges side by side */}
      {(colA || colB || loadingA || loadingB) && (
        <div className="bg-card border border-border rounded p-4">
          <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">{t('comparisonPanel.airQualityIndex')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              {loadingA ? (
                <div className="h-32 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-mono animate-pulse">{t('common.loading')}</span>
                </div>
              ) : colA ? (
                <>
                  <p className="text-xs font-body font-semibold text-foreground text-center truncate w-full">{colA.city.name}</p>
                  <MiniGauge aqi={colA.aqi} t={t} />
                  <OmsComplianceBadge compliant={colA.omsCompliant} size="md" />
                </>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">{t('comparisonPanel.pickCityA')}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {loadingB ? (
                <div className="h-32 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-mono animate-pulse">{t('common.loading')}</span>
                </div>
              ) : colB ? (
                <>
                  <p className="text-xs font-body font-semibold text-foreground text-center truncate w-full">{colB.city.name}</p>
                  <MiniGauge aqi={colB.aqi} t={t} />
                  <OmsComplianceBadge compliant={colB.omsCompliant} size="md" />
                </>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">{t('comparisonPanel.pickCityB')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pollutants comparison */}
      {colA && colB && (
        <div className="bg-card border border-border rounded p-4 space-y-3">
          <h3 className="font-heading text-lg tracking-wide text-foreground">{t('comparisonPanel.pollutantsHeading')}</h3>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full" style={{ background: CITY_A_COLOR }} />
              {colA.city.name}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full" style={{ background: CITY_B_COLOR }} />
              {colB.city.name}
            </span>
          </div>
          {pollutants.map(p => (
            <PollutantBar
              key={p.key}
              label={p.label}
              valueA={colA.city.latestAqi?.[p.key] ?? null}
              valueB={colB.city.latestAqi?.[p.key] ?? null}
              limit={p.limit}
              whoLabel={t('comparisonPanel.whoLimit', { limit: p.limit, unit: p.unit })}
            />
          ))}
          <TemperatureCompareRow
            label={t('cityDashboard.temperature')}
            unit={t('cityDashboard.temperatureUnit')}
            valueA={colA.city.latestAqi?.temperature}
            valueB={colB.city.latestAqi?.temperature}
          />
        </div>
      )}
    </div>
  )
}
