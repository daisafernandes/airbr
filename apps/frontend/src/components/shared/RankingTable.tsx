import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import type { CityApiData } from '@app-types/airQuality.types'
import { OmsComplianceBadge } from './OmsComplianceBadge'
import { getAQILabel } from '@utils/aqiInfo'

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#7f1d1d'
}

interface RankingTableProps {
  cities: CityApiData[]
  onCityClick?: (cityId: string) => void
  isMobile?: boolean
}

export const RankingTable = ({ cities, onCityClick, isMobile = false }: RankingTableProps) => {
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <div className="space-y-2">
        {cities.map((city, idx) => {
          const aqi = city.latestAqi?.aqi ?? 0
          const color = getAQIColor(aqi)
          const pm25 = city.latestAqi?.pm25 ?? null
          const omsCompliant = pm25 !== null ? pm25 <= 5 : false
          return (
            <button
              key={city.id}
              onClick={() => onCityClick?.(city.id)}
              className="w-full bg-card border border-border rounded p-3 flex items-center gap-3 hover:border-primary/30 transition-colors text-left"
            >
              <span className="w-7 text-center font-mono text-sm text-muted-foreground shrink-0">
                #{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-foreground text-sm truncate">{city.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {city.state} · {city.region}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-mono font-bold text-base" style={{ color }}>
                  {aqi}
                </span>
                <OmsComplianceBadge compliant={omsCompliant} />
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 border-b border-border">
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider w-12">#</th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t('ranking.city')}</th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t('ranking.state')}</th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t('ranking.region')}</th>
            <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">{t('ranking.aqi')}</th>
            <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">PM2.5</th>
            <th className="text-center px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">OMS</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city, idx) => {
            const aqi = city.latestAqi?.aqi ?? 0
            const color = getAQIColor(aqi)
            const pm25 = city.latestAqi?.pm25 ?? null
            const omsCompliant = pm25 !== null ? pm25 <= 5 : false
            return (
              <tr
                key={city.id}
                onClick={() => onCityClick?.(city.id)}
                className={`border-b border-border/50 transition-colors ${onCityClick ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <Link
                      to={`/cidade/${city.id}`}
                      className="font-body font-medium text-foreground hover:text-primary transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      {city.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{city.state}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-body text-muted-foreground">{city.region}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-bold text-base" style={{ color }}>
                    {aqi}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1 hidden xl:inline">{getAQILabel(aqi, t)}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                  {pm25 !== null ? `${pm25.toFixed(1)} µg/m³` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <OmsComplianceBadge compliant={omsCompliant} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
