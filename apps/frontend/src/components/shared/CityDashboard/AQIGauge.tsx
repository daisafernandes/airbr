interface AQIGaugeProps {
  aqi: number
  label: string
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#4af0c4'
  if (aqi <= 100) return '#facc15'
  if (aqi <= 150) return '#ff9f4a'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#be123c'
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
  const color = getAQIColor(aqi)

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
          AQI
        </text>
      </svg>

      {/* Label badge */}
      <span
        className="mt-1 text-xs font-body font-semibold px-3 py-1 rounded-full tracking-wide uppercase"
        style={{ background: `${color}20`, color }}
      >
        {label}
      </span>
    </div>
  )
}
