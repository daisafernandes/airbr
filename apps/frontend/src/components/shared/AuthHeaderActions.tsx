import { ChevronDown, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@contexts/AuthContext'

/**
 * Login / account menu for page headers (no duplicate of dashboard search).
 */
export const AuthHeaderActions = () => {
  const { t } = useTranslation()
  const { isAuthenticated, authReady, user, signOut } = useAuth()

  if (!authReady) return null

  if (isAuthenticated) {
    if (!user) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs shrink-0 gap-1 max-w-[200px]"
            aria-label={t('auth.accountMenu')}
            title={user.name || user.email}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate hidden sm:inline">{user.name.trim() ? user.name : user.email}</span>
            <ChevronDown className="w-3 h-3 shrink-0 opacity-70" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              {user.name.trim() ? (
                <>
                  <span className="font-medium text-foreground truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </>
              ) : (
                <span className="font-medium text-foreground truncate">{user.email}</span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">{t('profile.title')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/alerts">{t('nav.alerts')}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => signOut()}
          >
            {t('auth.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
