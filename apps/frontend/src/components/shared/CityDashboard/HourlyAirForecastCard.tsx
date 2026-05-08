import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { AirQualityForecastHourApi } from '@app-types/airQuality.types'
import { getAqiBandColorHex } from '@utils/aqiInfo'

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { label: string; aqi: number } }>
}) => {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  if (!p) return null
  return (
    <div className="bg-card border border-border rounded px-2 py-1 text-[10px] font-mono">
      <div className="text-muted-foreground">{p.label}</div>
      <div style={{ color: getAqiBandColorHex(p.aqi) }}>{p.aqi}</div>
    </div>
  )
}

interface HourlyAirForecastCardProps {
  hours: AirQualityForecastHourApi[]
  isLoading?: boolean
}

export const HourlyAirForecastCard = ({ hours, isLoading }: HourlyAirForecastCardProps) => {
  const { t, i18n } = useTranslation()
  const gradId = useId().replace(/:/g, '')

  const chartData = useMemo(() => {
    const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es-ES' : 'pt-BR'
    const filtered = hours.filter(h => h.aqi != null && Number.isFinite(h.aqi))
    return filtered.map((h, idx) => {
      const d = new Date(h.time)
      return {
        idx,
        time: h.time,
        label: d.toLocaleString(locale, { weekday: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        aqi: h.aqi as number,
      }
    })
  }, [hours, i18n.language])

  const tickFormatter = (v: number) => {
    const row = chartData.find(d => d.idx === v)
    if (!row) return ''
    const d = new Date(row.time)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es-ES' : 'pt-BR', {
      hour: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded p-4">
        <div className="h-5 bg-muted animate-pulse rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted animate-pulse rounded w-2/3 mb-4" />
        <div className="h-[140px] bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-card border border-border rounded p-4">
        <h3 className="font-heading text-lg tracking-wide text-foreground mb-1">{t('cityDashboard.hourlyForecast')}</h3>
        <p className="text-xs text-muted-foreground font-body">{t('cityDashboard.hourlyForecastUnavailable')}</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-0.5">{t('cityDashboard.hourlyForecast')}</h3>
      <p className="text-[10px] text-muted-foreground font-body mb-3">{t('cityDashboard.hourlyForecastSubtitle')}</p>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <XAxis
              dataKey="idx"
              type="number"
              domain={[0, chartData.length - 1]}
              ticks={chartData.filter((_, i) => i % 6 === 0).map(d => d.idx)}
              tickFormatter={tickFormatter}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 9 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 9 }} width={28} domain={[0, 'auto']} />
            <Tooltip content={<TooltipContent />} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#4af0c4"
              fill={`url(#${gradId})`}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4af0c4" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#4af0c4" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[9px] text-muted-foreground font-body mt-2 leading-snug">{t('cityDashboard.hourlyForecastFooter')}</p>
    </div>
  )
}
