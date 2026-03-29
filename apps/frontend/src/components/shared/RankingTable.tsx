import { CityData } from '@app-types/city.types'
import { getAQIColor } from '@data/mockCities'
import { MapPin } from 'lucide-react'

import { OmsComplianceBadge } from './OmsComplianceBadge'

interface RankingTableProps {
  cities: CityData[]
  onCityClick?: (name: string) => void
  isMobile?: boolean
}

export const RankingTable = ({ cities, onCityClick, isMobile = false }: RankingTableProps) => {
  if (isMobile) {
    return (
      <div className="space-y-2">
        {cities.map((city, idx) => {
          const color = getAQIColor(city.aqi)
          const pm25 = city.pollutants.find(p => p.key === 'pm25')
          return (
            <button
              key={city.name}
              onClick={() => onCityClick?.(city.name)}
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
                  {city.aqi}
                </span>
                <OmsComplianceBadge compliant={city.omsCompliant} />
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
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Cidade</th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Estado</th>
            <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Região</th>
            <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">AQI</th>
            <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">PM2.5</th>
            <th className="text-center px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">OMS</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city, idx) => {
            const color = getAQIColor(city.aqi)
            const pm25 = city.pollutants.find(p => p.key === 'pm25')
            return (
              <tr
                key={city.name}
                onClick={() => onCityClick?.(city.name)}
                className={`border-b border-border/50 transition-colors ${onCityClick ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-body font-medium text-foreground">{city.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{city.state}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-body text-muted-foreground">{city.region}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-bold text-base" style={{ color }}>
                    {city.aqi}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1 hidden xl:inline">{city.aqiLabel}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                  {pm25 ? `${pm25.value} µg/m³` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <OmsComplianceBadge compliant={city.omsCompliant} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
