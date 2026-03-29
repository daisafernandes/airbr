import { ShieldCheck, ShieldAlert } from 'lucide-react'

interface OmsComplianceBadgeProps {
  compliant: boolean
  size?: 'sm' | 'md'
}

export const OmsComplianceBadge = ({ compliant, size = 'sm' }: OmsComplianceBadgeProps) => {
  const isSmall = size === 'sm'

  if (compliant) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold ${
          isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
        } bg-green-500/15 text-green-400 border border-green-500/30`}
      >
        <ShieldCheck className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
        Conforme OMS
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold ${
        isSmall ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
      } bg-red-500/15 text-red-400 border border-red-500/30`}
    >
      <ShieldAlert className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      Acima do limite
    </span>
  )
}
