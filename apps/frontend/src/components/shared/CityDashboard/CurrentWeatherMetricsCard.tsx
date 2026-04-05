import { Droplets, Gauge, Thermometer, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

function compassFromDegrees(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8] ?? 'N'
}

interface CurrentWeatherMetricsCardProps {
  temperature: number | null
  humidity: number | null
  pressure: number | null
  windDirection: number | null
  windSpeed: number | null
  windCompassLabel: string | null
}

function MetricBlock({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode
  label: string
  value: string
  unit: string | null
}) {
  return (
    <div className="rounded border border-border/60 bg-muted/20 p-3 space-y-1.5 min-h-[88px] flex flex-col justify-center">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-body">{label}</span>
      </div>
      <p className="font-mono text-lg font-semibold text-foreground tabular-nums leading-tight">
        {value}
        {unit != null && unit !== '' && (
          <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
        )}
      </p>
    </div>
  )
}

export const CurrentWeatherMetricsCard = ({
  temperature,
  humidity,
  pressure,
  windDirection,
  windSpeed,
  windCompassLabel,
}: CurrentWeatherMetricsCardProps) => {
  const { t } = useTranslation()

  const dash = '—'

  const tempDisplay =
    temperature != null && Number.isFinite(temperature) ? temperature.toFixed(1) : dash
  const humidityDisplay =
    humidity != null && Number.isFinite(humidity) ? String(Math.round(humidity)) : dash
  const pressureDisplay =
    pressure != null && Number.isFinite(pressure) ? String(Math.round(pressure)) : dash

  const compass =
    windCompassLabel ??
    (windDirection != null && Number.isFinite(windDirection) ? compassFromDegrees(windDirection) : null)
  const hasSpeed = windSpeed != null && Number.isFinite(windSpeed)
  const speedLine = hasSpeed ? `${windSpeed!.toFixed(1)} ${t('cityDashboard.windSpeedUnit')}` : null

  let windBlock: ReactNode
  if (speedLine && compass) {
    windBlock = (
      <div className="space-y-0.5">
        <p className="font-mono text-lg font-semibold text-foreground tabular-nums leading-tight">{speedLine}</p>
        <p className="text-[11px] font-mono text-muted-foreground">{compass}</p>
      </div>
    )
  } else if (speedLine) {
    windBlock = (
      <p className="font-mono text-lg font-semibold text-foreground tabular-nums leading-tight">{speedLine}</p>
    )
  } else if (compass) {
    windBlock = (
      <p className="font-mono text-lg font-semibold text-foreground tabular-nums leading-tight">{compass}</p>
    )
  } else {
    windBlock = <p className="font-mono text-lg font-semibold text-foreground tabular-nums">{dash}</p>
  }

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">
        {t('cityDashboard.currentConditions')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <MetricBlock
          icon={<Thermometer className="w-3.5 h-3.5 shrink-0" />}
          label={t('cityDashboard.temperature')}
          value={tempDisplay}
          unit={tempDisplay === dash ? null : t('cityDashboard.temperatureUnit')}
        />
        <MetricBlock
          icon={<Droplets className="w-3.5 h-3.5 shrink-0" />}
          label={t('cityDashboard.humidity')}
          value={humidityDisplay}
          unit={humidityDisplay === dash ? null : t('cityDashboard.humidityUnit')}
        />
        <MetricBlock
          icon={<Gauge className="w-3.5 h-3.5 shrink-0" />}
          label={t('cityDashboard.pressure')}
          value={pressureDisplay}
          unit={pressureDisplay === dash ? null : t('cityDashboard.pressureUnit')}
        />
        <div className="rounded border border-border/60 bg-muted/20 p-3 space-y-1.5 min-h-[88px] flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wind className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest font-body">{t('cityDashboard.wind')}</span>
          </div>
          {windBlock}
        </div>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground mt-3 leading-relaxed">
        {t('cityDashboard.currentConditionsFooter')}
      </p>
    </div>
  )
}
