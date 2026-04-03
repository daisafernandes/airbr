import { Sun, Wind, Flower2, Info, Thermometer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getUVLevels, getPollenLevels } from '@utils/aqiInfo'

/** Mirrors backend `OutdoorSafetyService` tempScore for bar fill and color. */
function tempComfortBarAndColor(temp: number): { barFill: number; color: string } {
  const score =
    temp >= 18 && temp <= 28
      ? 100
      : temp >= 12 && temp < 18
        ? 80
        : temp > 28 && temp <= 34
          ? 70
          : temp >= 8 && temp < 12
            ? 50
            : temp > 34 && temp <= 38
              ? 40
              : 20
  const color =
    score >= 80 ? '#4af0c4' : score >= 50 ? '#facc15' : score >= 40 ? '#ff9f4a' : '#ef4444'
  return { barFill: score, color }
}

interface OutdoorSafetyCardProps {
  score: number
  uvIndex: number
  /** 0–10 index from API; `null` when no pollen data (do not show as 0). */
  pollenLevel: number | null
  aqi: number
  temperature: number | null
}

function getSafetyLabelKey(score: number): keyof { safe: string; moderate: string; caution: string; dangerous: string; critical: string } {
  if (score >= 8) return 'safe'
  if (score >= 6) return 'moderate'
  if (score >= 4) return 'caution'
  if (score >= 2) return 'dangerous'
  return 'critical'
}

function getSafetyColor(score: number): string {
  if (score >= 8) return '#4af0c4'
  if (score >= 6) return '#facc15'
  if (score >= 4) return '#ff9f4a'
  if (score >= 2) return '#ef4444'
  return '#a855f7'
}

interface MetricRowProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sublabel: string
  barFill: number
  color: string
  tooltip?: React.ReactNode
}

const MetricRow = ({ icon, label, value, sublabel, barFill, color, tooltip }: MetricRowProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] p-3">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className="font-mono text-sm font-bold" style={{ color }}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">{sublabel}</span>
      </span>
    </div>
    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${barFill}%`, background: color }} />
    </div>
  </div>
)

function getUVLabel(uv: number, uvLevels: ReturnType<typeof getUVLevels>): string {
  for (const level of uvLevels) {
    if (uv <= level.max) return level.label
  }
  return uvLevels[uvLevels.length - 1]?.label ?? ''
}

function getPollenLabel(level: number, pollenLevels: ReturnType<typeof getPollenLevels>): string {
  for (const pl of pollenLevels) {
    if (level <= pl.max) return pl.label
  }
  return pollenLevels[pollenLevels.length - 1]?.label ?? ''
}

export const OutdoorSafetyCard = ({ score, uvIndex, pollenLevel, aqi, temperature }: OutdoorSafetyCardProps) => {
  const { t } = useTranslation()
  const uvLevels = getUVLevels(t)
  const pollenLevels = getPollenLevels(t)

  const tempVisual =
    temperature !== null && !Number.isNaN(temperature) ? tempComfortBarAndColor(temperature) : null

  const labelKey = getSafetyLabelKey(score)
  const color = getSafetyColor(score)
  const label = t(`cityDashboard.safetyLabel.${labelKey}`)

  const UVTooltip = () => (
    <div className="space-y-1.5">
      <p className="text-xs font-body font-semibold text-foreground">{t('cityDashboard.uvTooltipTitle')}</p>
      <p className="text-xs font-body text-muted-foreground">{t('cityDashboard.uvTooltipDesc')}</p>
      <div className="space-y-0.5 pt-0.5">
        {uvLevels.map(level => (
          <div key={level.label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: level.color }} />
            <span className="text-[10px] font-body" style={{ color: level.color }}>{level.label}</span>
            <span className="text-[10px] text-muted-foreground">— {level.recommendation}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const PollenTooltip = () => (
    <div className="space-y-1.5">
      <p className="text-xs font-body font-semibold text-foreground">{t('cityDashboard.pollenTooltipTitle')}</p>
      <p className="text-xs font-body text-muted-foreground">{t('cityDashboard.pollenTooltipDesc')}</p>
      <div className="space-y-0.5 pt-0.5">
        {pollenLevels.map(level => (
          <div key={level.label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: level.color }} />
            <span className="text-[10px] font-body" style={{ color: level.color }}>{level.label}</span>
            <span className="text-[10px] text-muted-foreground">— {level.recommendation}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const TemperatureTooltip = () => (
    <div className="space-y-1.5">
      <p className="text-xs font-body font-semibold text-foreground">{t('cityDashboard.temperatureTooltipTitle')}</p>
      <p className="text-xs font-body text-muted-foreground">{t('cityDashboard.temperatureTooltipDesc')}</p>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">{t('cityDashboard.outdoorSafety')}</h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl font-bold" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">/ 10</span>
        </div>
        <div>
          <span
            className="text-sm font-body font-bold px-3 py-1 rounded-full uppercase tracking-wide"
            style={{ background: `${color}20`, color }}
          >
            {label}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1 font-body">
            {t('cityDashboard.compositeIndex')}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <MetricRow
          icon={<Wind className="w-3.5 h-3.5" />}
          label={t('cityDashboard.airQuality')}
          value={aqi}
          sublabel="IQAr"
          barFill={Math.min((aqi / 300) * 100, 100)}
          color={aqi <= 50 ? '#4af0c4' : aqi <= 100 ? '#facc15' : aqi <= 150 ? '#ff9f4a' : '#ef4444'}
        />
        <MetricRow
          icon={<Sun className="w-3.5 h-3.5" />}
          label={t('cityDashboard.uvIndex')}
          value={uvIndex}
          sublabel={getUVLabel(uvIndex, uvLevels)}
          barFill={(uvIndex / 11) * 100}
          color={uvIndex <= 2 ? '#4af0c4' : uvIndex <= 5 ? '#facc15' : uvIndex <= 7 ? '#ff9f4a' : '#ef4444'}
          tooltip={<UVTooltip />}
        />
        <MetricRow
          icon={<Flower2 className="w-3.5 h-3.5" />}
          label={t('cityDashboard.pollen')}
          value={pollenLevel === null ? '—' : pollenLevel}
          sublabel={pollenLevel === null ? t('cityDashboard.pollenUnavailable') : getPollenLabel(pollenLevel, pollenLevels)}
          barFill={pollenLevel === null ? 0 : (pollenLevel / 10) * 100}
          color={
            pollenLevel === null
              ? 'rgba(255,255,255,0.2)'
              : pollenLevel <= 2
                ? '#4af0c4'
                : pollenLevel <= 5
                  ? '#facc15'
                  : pollenLevel <= 7
                    ? '#ff9f4a'
                    : '#ef4444'
          }
          tooltip={<PollenTooltip />}
        />
        <MetricRow
          icon={<Thermometer className="w-3.5 h-3.5" />}
          label={t('cityDashboard.temperature')}
          value={tempVisual != null && temperature != null ? temperature.toFixed(1) : '—'}
          sublabel={tempVisual ? t('cityDashboard.temperatureUnit') : ''}
          barFill={tempVisual?.barFill ?? 0}
          color={tempVisual?.color ?? 'rgba(255,255,255,0.15)'}
          tooltip={<TemperatureTooltip />}
        />
      </div>
    </div>
  )
}
