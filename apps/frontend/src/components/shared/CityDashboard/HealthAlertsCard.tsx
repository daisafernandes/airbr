import { AlertTriangle, Info, ShieldAlert, Skull } from 'lucide-react'

import { HealthAlert, AlertSeverity } from '@app-types/city.types'

interface HealthAlertsCardProps {
  alerts: HealthAlert[]
  aqiLabel: string
}

const severityConfig: Record<AlertSeverity, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: '#4af0c4', bg: '#4af0c420' },
  warning: { icon: AlertTriangle, color: '#facc15', bg: '#facc1520' },
  danger: { icon: ShieldAlert, color: '#ff9f4a', bg: '#ff9f4a20' },
  critical: { icon: Skull, color: '#ef4444', bg: '#ef444420' },
}

export const HealthAlertsCard = ({ alerts, aqiLabel }: HealthAlertsCardProps) => {
  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg tracking-wide text-foreground">ALERTAS DE SAÚDE</h3>
        <span className="text-[10px] font-mono text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded">
          {aqiLabel}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body">Nenhum alerta ativo. Qualidade do ar boa.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const { icon: Icon, color, bg } = severityConfig[alert.severity]
            return (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded text-xs font-body"
                style={{ background: bg }}
              >
                <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color }} />
                <span className="text-foreground leading-relaxed">{alert.message}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
