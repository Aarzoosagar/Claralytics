import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const CustomTooltip = ({
  active,
  payload,
}) => {

  if (
    !active ||
    !payload?.length
  ) return null

  return (

    <div className="bg-[#0D0D0D] border border-white/10 rounded-sm px-3 py-2 text-xs">

      <p className="text-white font-medium">

        {payload[0].payload.feature}

      </p>

      <p className="text-zinc-400 mt-0.5">

        Importance:
        {' '}
        {(
          payload[0].value * 100
        ).toFixed(1)}%

      </p>

    </div>
  )
}

export default function FeatureImportanceChart({
  data = [],
}) {

  // ------------------------------------------------
  // SUPPORT BOTH:
  // ARRAY FORMAT
  // OBJECT FORMAT
  // ------------------------------------------------

  const normalizedData = Array.isArray(
    data
  )

    ? data

    : Object.entries(
        data || {}
      ).map(
        ([feature, importance]) => ({

          feature,

          importance,
        })
      )

  const sorted = [...normalizedData]

    .sort(
      (a, b) =>
        b.importance -
        a.importance
    )

    .slice(0, 10)

  if (!sorted.length) {

    return (

      <div className="h-[220px] flex items-center justify-center text-sm text-zinc-600">

        No feature importance available

      </div>
    )
  }

  return (

    <ResponsiveContainer
      width="100%"
      height={220}
    >

      <BarChart
        data={sorted}
        layout="vertical"
        margin={{
          left: 16,
          right: 16,
          top: 4,
          bottom: 4,
        }}
      >

        <XAxis
          type="number"
          tickFormatter={(v) =>
            `${(
              v * 100
            ).toFixed(0)}%`
          }
          tick={{
            fill: '#52525B',
            fontSize: 10,
          }}
          axisLine={false}
          tickLine={false}
          domain={[0, 'dataMax']}
        />

        <YAxis
          type="category"
          dataKey="feature"
          tick={{
            fill: '#71717A',
            fontSize: 11,
          }}
          axisLine={false}
          tickLine={false}
          width={90}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={false}
        />

        <Bar
          dataKey="importance"
          radius={[0, 2, 2, 0]}
        >

          {sorted.map((_, i) => (

            <Cell
              key={i}
              fill={`rgba(255,255,255,${
                0.9 - i * 0.07
              })`}
            />

          ))}

        </Bar>

      </BarChart>

    </ResponsiveContainer>
  )
}