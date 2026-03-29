import { Sun, Wind, Flower2, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { UV_LEVELS, POLLEN_LEVELS } from '@utils/aqiInfo'

interface OutdoorSafetyCardProps {
  score: number
  uvIndex: number
  pollenLevel: number
  aqi: number
}

function getSafetyLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Seguro', color: '#4af0c4' }
  if (score >= 6) return { label: 'Moderado', color: '#facc15' }
  if (score >= 4) return { label: 'Atenção', color: '#ff9f4a' }
  if (score >= 2) return { label: 'Perigoso', color: '#ef4444' }
  return { label: 'Crítico', color: '#a855f7' }
}

function getUVLabel(uv: number): string {
  if (uv <= 2) return 'Baixo'
  if (uv <= 5) return 'Moderado'
  if (uv <= 7) return 'Alto'
  if (uv <= 10) return 'Muito Alto'
  return 'Extremo'
}

function getPollenLabel(level: number): string {
  if (level <= 2) return 'Baixo'
  if (level <= 5) return 'Moderado'
  if (level <= 7) return 'Alto'
  return 'Muito Alto'
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

const UVTooltip = () => (
  <div className="space-y-1.5">
    <p className="text-xs font-body font-semibold text-foreground">Índice UV</p>
    <p className="text-xs font-body text-muted-foreground">
      Mede a intensidade da radiação ultravioleta solar. Valores altos aumentam o risco de queimaduras e danos à pele.
    </p>
    <div className="space-y-0.5 pt-0.5">
      {UV_LEVELS.map(level => (
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
    <p className="text-xs font-body font-semibold text-foreground">Nível de Pólen</p>
    <p className="text-xs font-body text-muted-foreground">
      Concentração de grãos de pólen no ar. Pode desencadear alergias respiratórias e agravar asma.
    </p>
    <div className="space-y-0.5 pt-0.5">
      {POLLEN_LEVELS.map(level => (
        <div key={level.label} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: level.color }} />
          <span className="text-[10px] font-body" style={{ color: level.color }}>{level.label}</span>
          <span className="text-[10px] text-muted-foreground">— {level.recommendation}</span>
        </div>
      ))}
    </div>
  </div>
)

export const OutdoorSafetyCard = ({ score, uvIndex, pollenLevel, aqi }: OutdoorSafetyCardProps) => {
  const { label, color } = getSafetyLabel(score)

  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">SEGURANÇA AO AR LIVRE</h3>

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
            Índice composto: AQI + UV + Pólen
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <MetricRow
          icon={<Wind className="w-3.5 h-3.5" />}
          label="Qualidade do ar"
          value={aqi}
          sublabel="AQI"
          barFill={Math.min((aqi / 300) * 100, 100)}
          color={aqi <= 50 ? '#4af0c4' : aqi <= 100 ? '#facc15' : aqi <= 150 ? '#ff9f4a' : '#ef4444'}
        />
        <MetricRow
          icon={<Sun className="w-3.5 h-3.5" />}
          label="Índice UV"
          value={uvIndex}
          sublabel={getUVLabel(uvIndex)}
          barFill={(uvIndex / 11) * 100}
          color={uvIndex <= 2 ? '#4af0c4' : uvIndex <= 5 ? '#facc15' : uvIndex <= 7 ? '#ff9f4a' : '#ef4444'}
          tooltip={<UVTooltip />}
        />
        <MetricRow
          icon={<Flower2 className="w-3.5 h-3.5" />}
          label="Pólen"
          value={pollenLevel}
          sublabel={getPollenLabel(pollenLevel)}
          barFill={(pollenLevel / 10) * 100}
          color={pollenLevel <= 2 ? '#4af0c4' : pollenLevel <= 5 ? '#facc15' : '#ff9f4a'}
          tooltip={<PollenTooltip />}
        />
      </div>
    </div>
  )
}
