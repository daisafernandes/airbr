import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AQI_BANDS, getAqiBandColorHex } from '@utils/aqiInfo'

interface AQIGaugeProps {
  aqi: number
  label: string
}

export const AQIGauge = ({ aqi, label }: AQIGaugeProps) => {
  const size = 180
  const cx = size / 2
  const cy = size / 2 + 10
  const r = 72

  // Arc spans 240° — from 210° to 30° (going clockwise through the top)
  const startAngle = 210
  const totalDeg = 240
  const clampedAqi = Math.min(aqi, 500)
  const fillDeg = (clampedAqi / 500) * totalDeg
  const color = getAqiBandColorHex(aqi)

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const pointOnArc = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })

  const arcPath = (deg: number, stroke: string, opacity = 1) => {
    const start = pointOnArc(startAngle)
    const end = pointOnArc(startAngle + deg)
    const largeArc = deg > 180 ? 1 : 0
    return (
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={stroke}
        strokeWidth={10}
        strokeLinecap="round"
        opacity={opacity}
      />
    )
  }

  // Tick marks at major levels: 0, 100, 200, 300, 400, 500
  const ticks = [0, 100, 200, 300, 400, 500].map(val => {
    const deg = startAngle + (val / 500) * totalDeg
    const inner = { x: cx + (r - 7) * Math.cos(toRad(deg)), y: cy + (r - 7) * Math.sin(toRad(deg)) }
    const outer = { x: cx + (r + 2) * Math.cos(toRad(deg)), y: cy + (r + 2) * Math.sin(toRad(deg)) }
    return { inner, outer, val }
  })

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size - 10} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        {arcPath(totalDeg, 'rgba(255,255,255,0.08)')}

        {/* Filled arc */}
        {fillDeg > 0 && (
          <path
            d={(() => {
              const start = pointOnArc(startAngle)
              const end = pointOnArc(startAngle + fillDeg)
              const largeArc = fillDeg > 180 ? 1 : 0
              return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
            })()}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}

        {/* Tick marks */}
        {ticks.map(({ inner, outer, val }) => (
          <line
            key={val}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.5}
          />
        ))}

        {/* Center AQI value */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={38}
          fontWeight="700"
          fontFamily="'DM Mono', monospace"
          fill={color}
        >
          {aqi}
        </text>
        <text
          x={cx}
          y={cy + 26}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontFamily="'DM Sans', sans-serif"
          fill="rgba(255,255,255,0.5)"
          letterSpacing="0.08em"
        >
          IQAr
        </text>
      </svg>

      {/* Label badge */}
      <span
        className="mt-1 text-xs font-body font-semibold px-3 py-1 rounded-full tracking-wide uppercase"
        style={{ background: `${color}20`, color }}
      >
        {label}
      </span>

      {/* AQI info tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <Info className="w-3 h-3" />
            O que é IQAr/AQI?
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] p-3 space-y-2">
          <p className="text-xs font-body font-semibold text-foreground">Índice de Qualidade do Ar (IQAr)</p>
          <p className="text-xs font-body text-muted-foreground">
            Escala de 0 a 500 que resume a concentração dos principais poluentes. Quanto maior, pior a qualidade do ar.
          </p>
          <div className="space-y-1 pt-1">
            {AQI_BANDS.map(band => (
              <div key={band.label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: band.color }}
                />
                <span className="text-[10px] font-mono" style={{ color: band.color }}>
                  {band.min}–{band.max === 500 ? '500+' : band.max}
                </span>
                <span className="text-[10px] text-muted-foreground">{band.label}</span>
              </div>
            ))}
          </div>
          <Link to="/guide" className="text-[10px] text-primary hover:underline block pt-1">
            Ver guia completo →
          </Link>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
