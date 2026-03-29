import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface OmsComplianceBadgeProps {
  compliant: boolean
  size?: 'sm' | 'md'
}

export const OmsComplianceBadge = ({ compliant, size = 'sm' }: OmsComplianceBadgeProps) => {
  const { t } = useTranslation()
  const isSmall = size === 'sm'

  const badge = compliant ? (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold cursor-help ${
        isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
      } bg-green-500/15 text-green-400 border border-green-500/30`}
    >
      <ShieldCheck className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      {t('oms.badgeCompliant')}
    </span>
  ) : (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold cursor-help ${
        isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
      } bg-red-500/15 text-red-400 border border-red-500/30`}
    >
      <ShieldAlert className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      {t('oms.badgeAboveLimit')}
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{badge}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] p-3 space-y-1.5">
        <p className="text-xs font-body font-semibold text-foreground">{t('oms.tooltipTitle')}</p>
        <p className="text-xs font-body text-muted-foreground">{t('oms.tooltipDesc')}</p>
        {compliant ? (
          <p className="text-xs font-body text-green-400">{t('oms.tooltipCompliant')}</p>
        ) : (
          <p className="text-xs font-body text-red-400">{t('oms.tooltipNonCompliant')}</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
