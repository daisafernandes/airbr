import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface OmsComplianceBadgeProps {
  compliant: boolean
  size?: 'sm' | 'md'
}

export const OmsComplianceBadge = ({ compliant, size = 'sm' }: OmsComplianceBadgeProps) => {
  const isSmall = size === 'sm'

  const badge = compliant ? (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold cursor-help ${
        isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
      } bg-green-500/15 text-green-400 border border-green-500/30`}
    >
      <ShieldCheck className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      Conforme OMS
    </span>
  ) : (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold cursor-help ${
        isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
      } bg-red-500/15 text-red-400 border border-red-500/30`}
    >
      <ShieldAlert className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      Acima do limite
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{badge}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] p-3 space-y-1.5">
        <p className="text-xs font-body font-semibold text-foreground">Diretriz OMS — PM2.5</p>
        <p className="text-xs font-body text-muted-foreground">
          A Organização Mundial da Saúde recomenda concentração de PM2.5 inferior a{' '}
          <strong className="text-foreground">5 µg/m³</strong> (média anual).
        </p>
        {compliant ? (
          <p className="text-xs font-body text-green-400">
            Esta cidade está dentro do limite recomendado.
          </p>
        ) : (
          <p className="text-xs font-body text-red-400">
            A concentração de PM2.5 supera o limite recomendado pela OMS.
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
