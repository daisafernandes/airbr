import { Link } from 'react-router-dom'
import { Wind } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LiveIndicator } from '@components/shared/LiveIndicator'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

export const MethodologyPage = () => {
  const { t } = useTranslation()

  const navLinks = [
    { to: '/', label: t('nav.dashboard') },
    { to: '/ranking', label: t('nav.ranking') },
    { to: '/mapa-queimadas', label: t('nav.fireMap') },
    { to: '/guia', label: t('nav.guide') },
    { to: '/metodologia', label: t('nav.methodology') },
  ]

  return (
    <div className="grain-overlay min-h-screen bg-background relative overflow-hidden">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '-100px' }} />

      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Wind className="w-6 h-6 text-primary" />
            <span className="font-heading text-2xl tracking-wider text-foreground">
              Respir<span className="text-primary">A</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 flex-wrap justify-end">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-xs font-body rounded transition-colors ${
                  link.to === '/metodologia'
                    ? 'text-primary border-b border-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <LiveIndicator />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4 max-w-[900px] mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wide text-foreground">{t('methodology.title')}</h1>
          <p className="text-sm text-muted-foreground font-body mt-2">{t('methodology.subtitle')}</p>
        </div>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl tracking-wide text-foreground">{t('methodology.sections.overview.title')}</h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{t('methodology.sections.overview.body')}</p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl tracking-wide text-foreground">{t('methodology.sections.collectors.title')}</h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{t('methodology.sections.collectors.body')}</p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl tracking-wide text-foreground">{t('methodology.sections.sources.title')}</h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{t('methodology.sections.sources.body')}</p>
          <Link
            to="/guia"
            className="inline-flex text-sm font-body text-primary hover:underline"
          >
            {t('methodology.sections.sources.guideCta')} →
          </Link>
        </section>
      </main>
    </div>
  )
}
