import { Link } from 'react-router-dom'
import { Wind, ExternalLink, Info, Droplets, Sun, Flower2 } from 'lucide-react'

import { LiveIndicator } from '@components/shared/LiveIndicator'
import {
  AQI_BANDS,
  POLLUTANT_INFO,
  UV_LEVELS,
  POLLEN_LEVELS,
  DATA_SOURCES,
} from '@utils/aqiInfo'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/mapa-queimadas', label: 'Mapa Queimadas' },
  { to: '/guia', label: 'Guia' },
]

const POLLUTANTS_ORDER = ['pm25', 'pm10', 'no2', 'o3', 'co'] as const

export const GlossaryPage = () => {
  return (
    <div className="grain-overlay min-h-screen bg-background relative overflow-hidden">
      <div className="ambient-blob blob-cyan" style={{ top: '-200px', left: '-100px' }} />
      <div className="ambient-blob blob-blue" style={{ bottom: '-150px', right: '-100px' }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Wind className="w-6 h-6 text-primary" />
            <span className="font-heading text-2xl tracking-wider text-foreground">
              Respir<span className="text-primary">A</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:block">AirBR</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-xs font-body rounded transition-colors ${
                  link.to === '/guia'
                    ? 'text-primary border-b border-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <LiveIndicator />
        </div>
      </header>

      <main className="pt-20 pb-12 px-4 max-w-[900px] mx-auto relative z-10">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wide text-foreground">GUIA DE QUALIDADE DO AR</h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Entenda os índices, siglas e métricas utilizadas na plataforma.
          </p>
        </div>

        {/* AQI Section */}
        <section className="mb-10" id="aqi">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-2xl tracking-wide text-foreground">O QUE É O AQI?</h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground mb-4">Índice de Qualidade do Ar / Air Quality Index</p>

          <p className="text-sm font-body text-muted-foreground mb-4 leading-relaxed">
            O <strong className="text-foreground">AQI (Air Quality Index)</strong> é um índice padronizado que transforma as concentrações de múltiplos poluentes atmosféricos em um único número de <strong className="text-foreground">0 a 500</strong>. Quanto maior o valor, pior a qualidade do ar e maior o risco à saúde. Foi desenvolvido pela EPA (Agência de Proteção Ambiental dos EUA) e é adotado internacionalmente com adaptações.
          </p>

          <p className="text-sm font-body text-muted-foreground mb-6 leading-relaxed">
            O índice é calculado com base nos poluentes: PM2.5, PM10, O₃, NO₂ e CO — o valor final corresponde ao <strong className="text-foreground">poluente com maior concentração relativa ao seu limite</strong>.
          </p>

          {/* AQI Scale */}
          <div className="space-y-2">
            {AQI_BANDS.map(band => (
              <div
                key={band.label}
                className="flex items-start gap-3 bg-card border border-border rounded p-3"
              >
                <div
                  className="shrink-0 w-14 text-center rounded py-1"
                  style={{ background: `${band.color}20`, color: band.color }}
                >
                  <span className="font-mono font-bold text-sm block">{band.min}–{band.max === 500 ? '500+' : band.max}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-body font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ background: `${band.color}20`, color: band.color }}
                    >
                      {band.label}
                    </span>
                  </div>
                  <p className="text-xs font-body text-muted-foreground">{band.healthImpact}</p>
                  <p className="text-xs font-mono text-muted-foreground/60 mt-0.5">{band.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pollutants Section */}
        <section className="mb-10" id="poluentes">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-2xl tracking-wide text-foreground">POLUENTES</h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground mb-4">Compostos monitorados e seus efeitos na saúde</p>

          <div className="grid grid-cols-1 gap-4">
            {POLLUTANTS_ORDER.map(key => {
              const p = POLLUTANT_INFO[key]
              return (
                <div key={key} className="bg-card border border-border rounded p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="font-mono font-bold text-lg text-foreground">{p.label}</span>
                      <span className="text-xs text-muted-foreground font-body ml-2">{p.fullName}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-mono text-muted-foreground block">Limite OMS</span>
                      <span className="font-mono font-bold text-primary">
                        {p.whoLimit} {p.unit}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">{p.whoLimitPeriod}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm font-body text-muted-foreground leading-relaxed">
                    <p>{p.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="bg-muted/40 border border-border/50 rounded p-2.5">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Principais fontes</p>
                        <p className="text-xs">{p.sources}</p>
                      </div>
                      <div className="bg-muted/40 border border-border/50 rounded p-2.5">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Efeitos na saúde</p>
                        <p className="text-xs">{p.effects}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* UV Index Section */}
        <section className="mb-10" id="uv">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-2xl tracking-wide text-foreground">ÍNDICE UV</h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground mb-3">Intensidade da radiação ultravioleta solar</p>

          <p className="text-sm font-body text-muted-foreground mb-4 leading-relaxed">
            O <strong className="text-foreground">Índice UV</strong> mede a intensidade da radiação ultravioleta que chega à superfície terrestre. Valores altos aumentam o risco de queimaduras solares, danos oculares e câncer de pele.
          </p>

          <div className="overflow-hidden rounded border border-border">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider">Faixa</th>
                  <th className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider">Classificação</th>
                  <th className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {UV_LEVELS.map((level, i) => {
                  const min = i === 0 ? 0 : UV_LEVELS[i - 1].max + 1
                  return (
                    <tr key={level.label} className="border-b border-border last:border-0 bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-mono" style={{ color: level.color }}>
                        {min}–{level.max === 11 ? '11+' : level.max}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: `${level.color}20`, color: level.color }}
                        >
                          {level.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{level.recommendation}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pollen Section */}
        <section className="mb-10" id="polen">
          <div className="flex items-center gap-2 mb-1">
            <Flower2 className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-2xl tracking-wide text-foreground">NÍVEL DE PÓLEN</h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground mb-3">Concentração de pólen no ar</p>

          <p className="text-sm font-body text-muted-foreground mb-4 leading-relaxed">
            O <strong className="text-foreground">nível de pólen</strong> indica a quantidade de grãos de pólen por metro cúbico de ar. Alta concentração pode desencadear alergias respiratórias, rinite e agravamento de asma em pessoas sensíveis.
          </p>

          <div className="overflow-hidden rounded border border-border">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider">Faixa</th>
                  <th className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider">Classificação</th>
                  <th className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {POLLEN_LEVELS.map((level, i) => {
                  const min = i === 0 ? 0 : POLLEN_LEVELS[i - 1].max + 1
                  return (
                    <tr key={level.label} className="border-b border-border last:border-0 bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-mono" style={{ color: level.color }}>
                        {min}–{level.max}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: `${level.color}20`, color: level.color }}
                        >
                          {level.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{level.recommendation}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sources Section */}
        <section className="mb-10" id="fontes">
          <div className="flex items-center gap-2 mb-1">
            <ExternalLink className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-2xl tracking-wide text-foreground">FONTES DE DADOS</h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground mb-4">Referências científicas e institucionais utilizadas</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DATA_SOURCES.map(source => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card border border-border rounded p-4 hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-body font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {source.name}
                  </span>
                  <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{source.description}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-10 text-xs text-muted-foreground text-center font-mono border-t border-border pt-6">
          RespirA · AirBR — dados atualizados continuamente via INPE, IQAir, CETESB e parceiros.
        </footer>
      </main>
    </div>
  )
}
