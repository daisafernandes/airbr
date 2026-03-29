import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-xl text-gray-600">{t('notFound.title')}</p>
      <Link to="/">
        <Button>{t('notFound.backHome')}</Button>
      </Link>
    </div>
  )
}
