import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@contexts/AuthContext'

/**
 * Login / logout controls for page headers (no duplicate of dashboard search / PWA install).
 */
export const AuthHeaderActions = () => {
  const { t } = useTranslation()
  const { isAuthenticated, authReady, signOut } = useAuth()

  if (!authReady) return null

  if (isAuthenticated) {
    return (
      <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => signOut()}>
        {t('auth.logout')}
      </Button>
    )
  }

  return (
    <Link
      to="/login"
      className="text-xs font-body px-3 py-2 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
    >
      {t('auth.login')}
    </Link>
  )
}
