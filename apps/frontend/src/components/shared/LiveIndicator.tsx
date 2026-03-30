import { useTranslation } from 'react-i18next'

export const LiveIndicator = () => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-[10px] font-mono font-bold text-green-400 tracking-widest hidden sm:inline">
        {t('header.live')}
      </span>
    </div>
  )
}
