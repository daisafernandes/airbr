import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Header } from '@components/shared/Header'

export const NotFoundPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleCitySelect = useCallback(
    (cityId: string) => {
      navigate(`/city/${cityId}`)
    },
    [navigate],
  )

  return (
    <div className="min-h-screen grain-overlay bg-background flex flex-col">
      <Header onCitySelect={handleCitySelect} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 px-4 text-center pt-16">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl text-gray-600">{t('notFound.title')}</p>
        <Link to="/">
          <Button>{t('notFound.backHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
