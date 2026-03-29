import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OmsComplianceBadge } from '@components/ui/OmsComplianceBadge'
import type { CityData } from '@app-types/city.types'
import { useIsMobile } from '@hooks/use-mobile'

type SortKey = 'aqi' | 'name' | 'state' | 'region'
type SortDir = 'asc' | 'desc'

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#4af0c4'
  if (aqi <= 100) return '#facc15'
  if (aqi <= 150) return '#ff9f4a'
  if (aqi <= 200) return '#ef4444'
  return '#a855f7'
}

interface RankingTableProps {
  cities: CityData[]
  className?: string
}

export const RankingTable = ({ cities, className }: RankingTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('aqi')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const isMobile = useIsMobile()

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'aqi' ? 'desc' : 'asc')
    }
  }

  const sorted = [...cities].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'aqi') cmp = a.aqi - b.aqi
    else if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortKey === 'state') cmp = a.state.localeCompare(b.state)
    else if (sortKey === 'region') cmp = a.region.localeCompare(b.region)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (k !== sortKey) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      className={cn(
        'flex items-center gap-1 text-xs font-mono uppercase tracking-wider transition-colors',
        k === sortKey ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      <SortIcon k={k} />
    </button>
  )

  if (isMobile) {
    return (
      <div className={cn('space-y-2', className)}>
        {sorted.map((city, idx) => {
          const color = getAQIColor(city.aqi)
          return (
            <div
              key={city.name}
              className="bg-card border border-border rounded p-3 flex items-center gap-3"
            >
              <span className="text-lg font-mono font-bold text-muted-foreground w-7 text-right flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body font-semibold text-foreground text-sm">{city.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {city.state} · {city.region}
                  </span>
                </div>
                <OmsComplianceBadge compliant={city.omsCompliant} size="sm" className="mt-1" />
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="font-mono text-2xl font-bold leading-none" style={{ color }}>
                  {city.aqi}
                </span>
                <p className="text-[9px] font-mono text-muted-foreground mt-0.5">AQI</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('bg-card border border-border rounded overflow-hidden', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left w-12">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">#</span>
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn k="name" label="Cidade" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn k="state" label="Estado" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn k="region" label="Região" />
            </th>
            <th className="px-4 py-3 text-right">
              <SortBtn k="aqi" label="AQI" />
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">PM2.5</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">OMS</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((city, idx) => {
            const color = getAQIColor(city.aqi)
            const pm25 = city.pollutants.find(p => p.key === 'pm25')
            return (
              <tr
                key={city.name}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0"
              >
                <td className="px-4 py-3 font-mono text-muted-foreground text-sm">{idx + 1}</td>
                <td className="px-4 py-3 font-body font-semibold text-foreground">{city.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{city.state}</td>
                <td className="px-4 py-3 font-body text-xs text-muted-foreground">{city.region}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-bold text-lg leading-none" style={{ color }}>
                    {city.aqi}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {pm25 ? `${pm25.value} µg/m³` : '—'}
                </td>
                <td className="px-4 py-3">
                  <OmsComplianceBadge compliant={city.omsCompliant} size="sm" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
