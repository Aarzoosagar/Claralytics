import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  sparklineData,
  icon: Icon,
  format = 'text',
}) {
  const trendDir = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'flat'

  const formatValue = (v) => {
    if (format === 'percent') return `${v}%`
    if (format === 'number' && typeof v === 'number') return v.toLocaleString()
    return v ?? '—'
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
          {title}
        </span>
        {Icon && <Icon size={14} className="text-zinc-600" />}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-white font-numeric tracking-tight">
            {formatValue(value)}
          </div>
          {subtitle && (
            <div className="text-xs text-zinc-600 mt-0.5">{subtitle}</div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-10 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {trendValue !== undefined && (
        <div className="flex items-center gap-1.5">
          {trendDir === 'up' && (
            <TrendingUp size={12} className="text-green-400" />
          )}
          {trendDir === 'down' && (
            <TrendingDown size={12} className="text-red-400" />
          )}
          {trendDir === 'flat' && (
            <Minus size={12} className="text-zinc-600" />
          )}
          <span
            className={clsx(
              'text-xs font-medium',
              trendDir === 'up' && 'text-green-400',
              trendDir === 'down' && 'text-red-400',
              trendDir === 'flat' && 'text-zinc-600'
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )
}
