import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AQIHistoryPoint } from '@app-types/city.types'

interface AQIHistoryChartProps {
  history: AQIHistoryPoint[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded px-2 py-1.5 text-xs">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-mono font-bold text-foreground">AQI {payload[0]?.value}</p>
      </div>
    )
  }
  return null
}

export const AQIHistoryChart = ({ history }: AQIHistoryChartProps) => {
  return (
    <div className="bg-card border border-border rounded p-4">
      <h3 className="font-heading text-lg tracking-wide text-foreground mb-3">HISTÓRICO 7 DIAS</h3>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={history} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4af0c4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4af0c4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#4af0c4"
            strokeWidth={2}
            fill="url(#aqiGrad)"
            dot={{ r: 3, fill: '#4af0c4', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#4af0c4' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
