import { TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useRanking } from '@hooks/useRanking'
import type { RankedCityApi } from '@app-types/airQuality.types'

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return 'text-primary'
  if (aqi <= 100) return 'text-yellow-400'
  if (aqi <= 150) return 'text-accent'
  if (aqi <= 200) return 'text-red-500'
  return 'text-purple-500'
}

function getAQIBg(aqi: number): string {
  if (aqi <= 50) return 'bg-primary/10'
  if (aqi <= 100) return 'bg-yellow-400/10'
  if (aqi <= 150) return 'bg-accent/10'
  if (aqi <= 200) return 'bg-red-500/10'
  return 'bg-purple-500/10'
}

const RankingCard = ({
  title,
  icon,
  data,
  loading,
}: {
  title: string
  icon: React.ReactNode
  data: RankedCityApi[]
  loading: boolean
}) => (
  <div className="bg-card border border-border rounded p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading text-lg tracking-wide text-foreground">{title}</h3>
      </div>
    </div>
    <div className="space-y-2">
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded">
              <div className="h-4 bg-muted animate-pulse rounded w-32" />
              <div className="h-4 bg-muted animate-pulse rounded w-10" />
            </div>
          ))
        : data.map((item, i) => (
            <div
              key={item.cityId}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                <div>
                  <span className="text-sm text-foreground">{item.cityName}</span>
                  <span className="text-xs text-muted-foreground ml-1">{item.state}</span>
                </div>
              </div>
              <span className={`font-mono text-sm font-medium px-2 py-0.5 rounded ${getAQIColor(item.aqi)} ${getAQIBg(item.aqi)}`}>
                {item.aqi}
              </span>
            </div>
          ))}
    </div>
  </div>
)

export const AQISidebar = () => {
  const { data, isLoading } = useRanking()

  const mostPolluted = data?.mostPolluted.slice(0, 5) ?? []
  const leastPolluted = data?.leastPolluted.slice(0, 5) ?? []

  return (
    <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
      <RankingCard
        title="MAIS POLUÍDAS"
        icon={<TrendingUp className="w-4 h-4 text-accent" />}
        data={mostPolluted}
        loading={isLoading}
      />
      <RankingCard
        title="AR MAIS LIMPO"
        icon={<TrendingDown className="w-4 h-4 text-primary" />}
        data={leastPolluted}
        loading={isLoading}
      />

      {/* AQI legend */}
      <div className="bg-card border border-border rounded p-4">
        <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">ÍNDICE AQI</h3>
        <div className="space-y-1.5 text-xs">
          {[
            { label: 'Bom', range: '0–50', color: 'bg-primary' },
            { label: 'Moderado', range: '51–100', color: 'bg-yellow-400' },
            { label: 'Ruim p/ sensíveis', range: '101–150', color: 'bg-accent' },
            { label: 'Ruim', range: '151–200', color: 'bg-red-500' },
            { label: 'Muito ruim', range: '201–300', color: 'bg-purple-500' },
            { label: 'Perigoso', range: '300+', color: 'bg-rose-900' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono text-muted-foreground ml-auto">{item.range}</span>
            </div>
          ))}
        </div>
        <Link
          to="/ranking"
          className="mt-3 flex items-center justify-center w-full px-3 py-2 text-xs font-body border border-border rounded hover:bg-muted hover:text-foreground text-muted-foreground transition-colors"
        >
          Ver ranking completo →
        </Link>
      </div>
    </div>
  )
}
