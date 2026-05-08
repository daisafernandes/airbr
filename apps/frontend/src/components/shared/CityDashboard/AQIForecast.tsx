import { Cloud, CloudSun, Sun, Wind, CloudLightning } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DayForecast, ForecastIcon } from '@app-types/city.types'
import { getAqiBandColorHex, getAQILabel } from '@utils/aqiInfo'

interface AQIForecastProps {
  forecast: DayForecast[]
}

const IconMap: Record<ForecastIcon, React.ElementType> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  haze: Wind,
  storm: CloudLightning,
}

export const AQIForecast = ({ forecast }: AQIForecastProps) => {
  const { t } = useTranslation()

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">{t('cityDashboard.forecast')}</h3>
      <div className="flex gap-2">
        {forecast.map(day => {
          const color = getAqiBandColorHex(day.aqi)
          const label = getAQILabel(day.aqi, t)
          const Icon = IconMap[day.icon]
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1.5 bg-muted/40 border border-border/50 rounded p-2.5"
            >
              <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                {day.date}
              </span>
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono text-base font-bold" style={{ color }}>
                {day.aqi}
              </span>
              <span
                className="text-[9px] font-body font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                style={{ background: `${color}20`, color }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
