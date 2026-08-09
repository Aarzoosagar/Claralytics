import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const GRAYS = [
  '#FFFFFF',
  '#A1A1AA',
  '#71717A',
  '#52525B',
  '#3F3F46',
  '#27272A',
  '#18181B',
  '#09090B',
  '#E4E4E7',
  '#D4D4D8',
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-sm px-3 py-2 text-xs">
      <p className="text-white font-medium">{d.name}</p>
      <p className="text-zinc-400 mt-0.5">
        {d.value} members ({((d.value / d.payload.total) * 100).toFixed(1)}%)
      </p>
    </div>
  )
}

export default function SegmentPieChart({ data = [] }) {
  const total = data.reduce((s, d) => s + (d.size || d.value || 0), 0)
  const chartData = data.map((d, i) => ({
    name: d.name || `Segment ${i + 1}`,
    value: d.size || d.value || 0,
    total,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={GRAYS[i % GRAYS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-zinc-400">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
