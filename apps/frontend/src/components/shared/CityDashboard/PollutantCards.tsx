import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Pollutant } from '@app-types/city.types'

interface PollutantCardsProps {
  pollutants: Pollutant[]
}

function getBarColor(ratio: number): string {
  if (ratio <= 0.5) return '#4af0c4'
  if (ratio <= 1.0) return '#facc15'
  if (ratio <= 1.5) return '#ff9f4a'
  if (ratio <= 2.0) return '#ef4444'
  return '#a855f7'
}

export const PollutantCards = ({ pollutants }: PollutantCardsProps) => {
  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">POLUENTES</h3>
      <div className="grid grid-cols-2 gap-2">
        {pollutants.map(p => {
          const ratio = p.value / p.whoLimit
          const barWidth = Math.min(ratio * 100, 200)
          const color = getBarColor(ratio)
          const overLimit = ratio > 1

          return (
            <div
              key={p.key}
              className="bg-muted/40 border border-border/50 rounded p-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                    {p.label}
                  </span>
                  {p.description && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                          <Info className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px] text-xs">
                        {p.description}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {overLimit && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded shrink-0" style={{ background: `${color}20`, color }}>
                    acima OMS
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-bold" style={{ color }}>
                  {p.value}
                </span>
                <span className="text-[10px] text-muted-foreground">{p.unit}</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(barWidth, 100)}%`, background: color }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">
                OMS: {p.whoLimit} {p.unit}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
