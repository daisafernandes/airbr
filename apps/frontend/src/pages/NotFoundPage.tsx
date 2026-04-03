import { Wind } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { AuthHeaderActions } from '@components/shared/AuthHeaderActions'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen grain-overlay bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 text-foreground shrink-0">
          <Wind className="w-6 h-6 text-primary" />
          <span className="font-heading text-xl tracking-wider">
            Respir<span className="text-primary">A</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <AuthHeaderActions />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 px-4 text-center pt-24">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl text-gray-600">{t('notFound.title')}</p>
        <Link to="/">
          <Button>{t('notFound.backHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
