import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-sm px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ForecastChart({ data = [], splitIndex }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: '#52525B', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#52525B', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />

        {splitIndex !== undefined && (
          <ReferenceLine
            x={data[splitIndex]?.label}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
            label={{ value: 'Forecast', fill: '#71717A', fontSize: 10 }}
          />
        )}

        <Area
          type="monotone"
          dataKey="upper"
          fill="rgba(255,255,255,0.03)"
          stroke="none"
        />
        <Area
          type="monotone"
          dataKey="lower"
          fill="rgba(255,255,255,0)"
          stroke="none"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
          dot={false}
          name="Actual"
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          name="Predicted"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
