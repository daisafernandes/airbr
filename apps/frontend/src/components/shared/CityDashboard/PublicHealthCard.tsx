import { Bar, BarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Activity } from 'lucide-react'

interface PublicHealthCardProps {
  hospitalizations: number
  history: number[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded px-2 py-1 text-xs">
        <span className="font-mono text-foreground">{payload[0].value} intern.</span>
      </div>
    )
  }
  return null
}

export const PublicHealthCard = ({ hospitalizations, history }: PublicHealthCardProps) => {
  const prevMonth = history[history.length - 2] ?? hospitalizations
  const delta = hospitalizations - prevMonth
  const isUp = delta > 0

  const chartData = history.map((v, i) => ({ month: i + 1, value: v }))

  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-red-400" />
        <h3 className="font-heading text-lg tracking-wide text-foreground">SAÚDE PÚBLICA</h3>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">{hospitalizations.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-muted-foreground font-body mt-0.5">
            Internações respiratórias · último mês
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-xs font-mono font-bold"
            style={{ color: isUp ? '#ef4444' : '#4af0c4' }}
          >
            {isUp ? '+' : ''}{delta}
          </span>
          <p className="text-[10px] text-muted-foreground font-body">vs mês ant.</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={48}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" fill="#ef4444" opacity={0.6} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-muted-foreground font-body mt-1 text-right">
        Dados simulados · últimos 12 meses
      </p>
    </div>
  )
}
