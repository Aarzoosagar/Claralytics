import { useAppStore } from '../store/appStore.js'
import { useKpis, useTrends, useDashboardMetrics } from '../hooks/useAnalytics.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import KpiCard from '../components/ui/KpiCard.jsx'
import { SkeletonCard, SkeletonChart } from '../components/ui/SkeletonCard.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { Database, BarChart3, Clock, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDatasets } from '../hooks/useDatasets.js'
import { ToastContainer } from '../components/ui/Toast.jsx'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-sm px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-white font-medium font-numeric">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const activeDatasetId = useAppStore((s) => s.activeDatasetId)
  const { data: datasets } = useDatasets()
  const navigate = useNavigate()

  const { data: kpis, isLoading: kpisLoading } = useKpis(activeDatasetId)
  const { data: trends, isLoading: trendsLoading } = useTrends(activeDatasetId)
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(activeDatasetId)

  if (!activeDatasetId) return <EmptyState />

  const kpiCards = kpis
  ? [

      {
        title: 'Total Records',

        value:
          kpis.rows ||
          kpis.total_records ||
          0,

        format: 'number',

        icon: Database,

        trend: 'up',

        trendValue:
          '+2.4% this week',
      },

      {
        title: 'Features',

        value:
          kpis.columns ||
          kpis.total_features ||
          0,

        format: 'number',

        icon: BarChart3,

        trend: 'flat',

        trendValue:
          'No change',
      },

      {
        title: 'Completeness',

        value:
          (
            100 -
            (
              kpis.missing_pct || 0
            )
          ).toFixed(1),

        format: 'percent',

        trend:
          (
            100 -
            (
              kpis.missing_pct || 0
            )
          ) > 90
            ? 'up'
            : 'down',

        trendValue:
          (
            100 -
            (
              kpis.missing_pct || 0
            )
          ) > 90
            ? 'Excellent quality'
            : 'Needs attention',
      },

      {
        title: 'Quality Score',

        value:
          kpis.quality_score || 0,

        subtitle:
          'out of 100',

        trend:
          (
            kpis.quality_score || 0
          ) > 80
            ? 'up'
            : 'down',

        trendValue:
          (
            kpis.quality_score || 0
          ) > 80
            ? 'Good'
            : 'Review needed',
      },
    ]
  : []

  const trendLines =

  Array.isArray(
    trends?.numeric_columns
  )
    ? trends.numeric_columns.slice(0, 6)

    : Object.keys(
        trends?.data || {}
      ).slice(0, 6)
  const categoricalDists =

  metrics?.categorical_distributions ||

  metrics?.distributions ||

  []

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Dataset overview and key metrics
          </p>
        </div>
        <button
          onClick={() => navigate('/analytics')}
          className="btn-secondary text-xs"
        >
          Full analytics →
        </button>
      </div>

      {/* KPI Cards */}
      <ErrorBoundary fallbackTitle="Failed to load KPI metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpisLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : kpiCards.map((card) => <KpiCard key={card.title} {...card} />)}
        </div>
      </ErrorBoundary>

      {/* Trends */}
      <ErrorBoundary fallbackTitle="Failed to load trend charts">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-zinc-600" />
            Numeric Trends
          </h2>

          {trendsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonChart />
              <SkeletonChart />
            </div>
          ) : trendLines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendLines.map((col) => {
                const colData =

  trends?.data?.[col] ||

  trends?.trends?.[col] ||

  trends?.[col] ||

  []
                const chartData = colData.map((v, i) => ({ i, v }))
                return (
                  <div key={col} className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-medium text-zinc-400 truncate">
                        {col}
                      </p>
                      <span className="text-xs text-zinc-600 font-numeric">
                        {colData.length} pts
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="1 0"
                          stroke="rgba(255,255,255,0.03)"
                          horizontal
                          vertical={false}
                        />
                        <XAxis
                          dataKey="i"
                          tick={false}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#52525B', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth={1.5}
                          dot={false}
                          name={col}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm text-zinc-600">No numeric columns found</p>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* Categorical Distributions */}
      {!metricsLoading && categoricalDists.length > 0 && (
        <ErrorBoundary fallbackTitle="Failed to load distributions">
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-zinc-600" />
              Top Categorical Distributions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoricalDists.slice(0, 4).map((dist) => {
                const chartData = Object.entries(dist.counts || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([label, count]) => ({ label, count }))

                return (
                  <div key={dist.column} className="card p-5">
                    <p className="text-xs font-medium text-zinc-400 mb-4 truncate">
                      {dist.column}
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData} layout="vertical">
                        <XAxis
                          type="number"
                          tick={{ fill: '#52525B', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          tick={{ fill: '#71717A', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                          {chartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={`rgba(255,255,255,${0.8 - i * 0.08})`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              })}
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* Recent activity */}
      <ErrorBoundary fallbackTitle="Failed to load activity">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Clock size={14} className="text-zinc-600" />
            Recent Activity
          </h2>
          <div className="card divide-y divide-white/5">
            {(metrics?.recent_activity ||
metrics?.activity || datasets?.slice(0, 5) || []).map(
              (item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                      {item.type === 'upload' || item.rows ? (
                        <Upload size={11} className="text-zinc-500" />
                      ) : (
                        <Database size={11} className="text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-300">
                        {item.description || item.name || `Dataset ${i + 1}`}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleDateString()
                          : item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <span className="badge-neutral text-[10px]">
                    {item.action || 'Uploaded'}
                  </span>
                </div>
              )
            )}
            {!(
  (metrics?.recent_activity?.length > 0) ||
  (metrics?.activity?.length > 0) ||
  (datasets?.length > 0)
) && (

  <div className="px-5 py-8 text-center text-sm text-zinc-600">

    No recent activity

  </div>
)}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  )
}
