import { TrendingUp, TrendingDown } from 'lucide-react'

interface CityAQI {
  city: string
  state: string
  aqi: number
}

const mostPolluted: CityAQI[] = [
  { city: 'Cubatão', state: 'SP', aqi: 156 },
  { city: 'Manaus', state: 'AM', aqi: 142 },
  { city: 'São Paulo', state: 'SP', aqi: 128 },
  { city: 'Porto Velho', state: 'RO', aqi: 119 },
  { city: 'Rio Branco', state: 'AC', aqi: 108 },
]

const cleanest: CityAQI[] = [
  { city: 'Florianópolis', state: 'SC', aqi: 18 },
  { city: 'Campos do Jordão', state: 'SP', aqi: 22 },
  { city: 'Gramado', state: 'RS', aqi: 25 },
  { city: 'Bonito', state: 'MS', aqi: 28 },
  { city: 'Chapada dos Veadeiros', state: 'GO', aqi: 31 },
]

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return 'text-primary'
  if (aqi <= 100) return 'text-yellow-400'
  if (aqi <= 150) return 'text-accent'
  if (aqi <= 200) return 'text-red-500'
  return 'text-purple-500'
}

function getAQIBg(aqi: number): string {
  if (aqi <= 50) return 'bg-primary/10'
  if (aqi <= 100) return 'bg-yellow-400/10'
  if (aqi <= 150) return 'bg-accent/10'
  if (aqi <= 200) return 'bg-red-500/10'
  return 'bg-purple-500/10'
}

const RankingCard = ({ title, icon, data }: { title: string; icon: React.ReactNode; data: CityAQI[] }) => (
  <div className="bg-card border border-border rounded p-4">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-heading text-lg tracking-wide text-foreground">{title}</h3>
    </div>
    <div className="space-y-2">
      {data.map((item, i) => (
        <div
          key={item.city}
          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
            <div>
              <span className="text-sm text-foreground">{item.city}</span>
              <span className="text-xs text-muted-foreground ml-1">{item.state}</span>
            </div>
          </div>
          <span className={`font-mono text-sm font-medium px-2 py-0.5 rounded ${getAQIColor(item.aqi)} ${getAQIBg(item.aqi)}`}>
            {item.aqi}
          </span>
        </div>
      ))}
    </div>
  </div>
)

export const AQISidebar = () => {
  return (
    <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
      <RankingCard
        title="MAIS POLUÍDAS"
        icon={<TrendingUp className="w-4 h-4 text-accent" />}
        data={mostPolluted}
      />
      <RankingCard
        title="AR MAIS LIMPO"
        icon={<TrendingDown className="w-4 h-4 text-primary" />}
        data={cleanest}
      />

      <div className="bg-card border border-border rounded p-4">
        <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">ÍNDICE AQI</h3>
        <div className="space-y-1.5 text-xs">
          {[
            { label: 'Bom', range: '0–50', color: 'bg-primary' },
            { label: 'Moderado', range: '51–100', color: 'bg-yellow-400' },
            { label: 'Ruim p/ sensíveis', range: '101–150', color: 'bg-accent' },
            { label: 'Ruim', range: '151–200', color: 'bg-red-500' },
            { label: 'Muito ruim', range: '201–300', color: 'bg-purple-500' },
            { label: 'Perigoso', range: '300+', color: 'bg-rose-900' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono text-muted-foreground ml-auto">{item.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
