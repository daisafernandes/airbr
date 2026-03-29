import { Sun, Wind, Flower2 } from 'lucide-react'

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
}

const MetricRow = ({ icon, label, value, sublabel, barFill, color }: MetricRowProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
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
        />
        <MetricRow
          icon={<Flower2 className="w-3.5 h-3.5" />}
          label="Pólen"
          value={pollenLevel}
          sublabel={getPollenLabel(pollenLevel)}
          barFill={(pollenLevel / 10) * 100}
          color={pollenLevel <= 2 ? '#4af0c4' : pollenLevel <= 5 ? '#facc15' : '#ff9f4a'}
        />
      </div>
    </div>
  )
}
