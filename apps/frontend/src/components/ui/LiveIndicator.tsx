import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  className?: string
}

export const LiveIndicator = ({ className }: LiveIndicatorProps) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-[10px] font-mono font-semibold tracking-widest text-emerald-400 uppercase">
        Ao vivo
      </span>
    </div>
  )
}
