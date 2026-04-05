import { HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ExplainAirTodayKey } from '@utils/explainAirToday'

interface ExplainAirTodayCardProps {
  explainKey: ExplainAirTodayKey
}

export const ExplainAirTodayCard = ({ explainKey }: ExplainAirTodayCardProps) => {
  const { t } = useTranslation()
  const bodyKey = `cityDashboard.explainAir.${explainKey}` as const

  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        <h3 className="font-heading text-sm tracking-wide text-foreground">{t('cityDashboard.explainAir.title')}</h3>
      </div>
      <p className="text-xs text-foreground font-body leading-relaxed">{t(bodyKey)}</p>
      <p className="text-[9px] text-muted-foreground font-body mt-2 leading-snug">{t('cityDashboard.explainAir.disclaimer')}</p>
    </div>
  )
}
