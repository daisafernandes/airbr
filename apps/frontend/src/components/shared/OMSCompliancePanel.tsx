import { Link } from 'react-router-dom'
import { ShieldCheck, ShieldAlert } from 'lucide-react'

import { useOMSCompliance } from '@hooks/useOMSCompliance'
import type { OMSComplianceCityApi } from '@app-types/airQuality.types'

const OMS_LIMIT = 5

function getPM25Color(pm25: number): string {
  if (pm25 <= OMS_LIMIT) return '#4af0c4'
  if (pm25 <= 15) return '#facc15'
  if (pm25 <= 35) return '#ff9f4a'
  return '#ef4444'
}

export const OMSCompliancePanel = () => {
  const { data, isLoading } = useOMSCompliance()

  const nonCompliant = data?.cities.filter(c => !c.compliant).slice(0, 10) ?? []
  const compliantPct = data?.compliantPct ?? 0

  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-xl tracking-wide text-foreground">CONFORMIDADE OMS — PM2.5</h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Limite OMS: {OMS_LIMIT} µg/m³ · Cidades brasileiras monitoradas
          </p>
        </div>
        {!isLoading && data && (
          <div className="text-right">
            <div className="font-mono text-2xl font-bold" style={{ color: compliantPct >= 50 ? '#4af0c4' : '#ef4444' }}>
              {compliantPct}%
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">dentro do limite</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!isLoading && data && (
        <div className="mb-4">
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${compliantPct}%`,
                background: compliantPct >= 50 ? '#4af0c4' : '#ff9f4a',
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              {data.cities.filter(c => c.compliant).length} conformes
            </span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              {data.cities.filter(c => !c.compliant).length} acima do limite
            </span>
          </div>
        </div>
      )}

      {/* Top offenders table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : nonCompliant.length > 0 ? (
        <>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
            Maiores concentrações de PM2.5
          </p>
          <div className="space-y-1.5">
            {nonCompliant.map((city: OMSComplianceCityApi, i: number) => {
              const color = getPM25Color(city.pm25)
              const barWidth = Math.min((city.pm25 / 50) * 100, 100)
              return (
                <Link
                  key={city.cityId}
                  to={`/cidade/${city.cityId}`}
                  className="flex items-center gap-2 group hover:bg-muted/40 rounded px-2 py-1 transition-colors"
                >
                  <span className="text-[10px] font-mono text-muted-foreground w-4 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-body text-foreground truncate group-hover:text-primary transition-colors">
                        {city.cityName}
                        <span className="text-muted-foreground ml-1 text-[10px]">· {city.state}</span>
                      </span>
                      <span className="font-mono text-xs font-bold ml-2 shrink-0" style={{ color }}>
                        {city.pm25.toFixed(1)} µg/m³
                      </span>
                    </div>
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: color }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : data && data.cities.length > 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-400 font-body py-2">
          <ShieldCheck className="w-4 h-4" />
          Todas as cidades monitoradas estão dentro do limite OMS
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-body text-center py-4">
          Dados de PM2.5 ainda não disponíveis.
        </p>
      )}

      <p className="text-[9px] text-muted-foreground font-mono mt-3 text-right">
        Limite OMS PM2.5: {OMS_LIMIT} µg/m³ · WHO Air Quality Guidelines 2021
      </p>
    </div>
  )
}
