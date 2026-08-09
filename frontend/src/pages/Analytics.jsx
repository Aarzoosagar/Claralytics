import { useState, useMemo } from 'react'
import { useAppStore } from '../store/appStore.js'
import {
  useAnalyticsSummary,
  useCorrelations,
  useOutliers,
  useQuality,
} from '../hooks/useAnalytics.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import { SkeletonCard, SkeletonTable, SkeletonChart } from '../components/ui/SkeletonCard.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import CorrelationHeatmap from '../components/charts/CorrelationHeatmap.jsx'
import { ToastContainer } from '../components/ui/Toast.jsx'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  AlertTriangle, CheckCircle, Info,
} from 'lucide-react'
import clsx from 'clsx'

const TABS = ['Overview', 'Columns', 'Statistics', 'Correlations', 'Outliers', 'Quality']
function formatBytes(bytes) {

  if (!bytes) return '0 B'

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
  ]

  let value = bytes

  let i = 0

  while (
    value >= 1024 &&
    i < units.length - 1
  ) {

    value /= 1024

    i++
  }

  return `${value.toFixed(1)} ${units[i]}`
}
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-sm px-3 py-2 text-xs">
      <p className="text-zinc-400">{label}</p>
      <p className="text-white font-medium mt-0.5">
        {payload[0].value?.toLocaleString?.() ?? payload[0].value}
      </p>
    </div>
  )
}

function ScoreGauge({ score = 0 }) {
  const radius = 60
  const strokeWidth = 8
  const circumference = Math.PI * radius // half-circle
  const progress = ((score / 100) * circumference)
  const color =
    score >= 80 ? 'rgba(255,255,255,0.9)'
    : score >= 60 ? 'rgba(245,158,11,0.9)'
    : 'rgba(239,68,68,0.9)'

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Background arc */}
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc — using stroke-dashoffset approach */}
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - progress}
        />
        <text
          x="80" y="72"
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
        <text
          x="80" y="84"
          textAnchor="middle"
          fill="#52525B"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          out of 100
        </text>
      </svg>
    </div>
  )
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [outlierMethod, setOutlierMethod] = useState('iqr')
  const [sortCol, setSortCol] = useState('column')
  const [sortDir, setSortDir] = useState('asc')

  const activeDatasetId = useAppStore((s) => s.activeDatasetId)

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(activeDatasetId)
  const { data: correlations, isLoading: corrLoading } = useCorrelations(activeDatasetId)
  const {
  data: outliers,
  isLoading: outliersLoading,
} = useOutliers(activeDatasetId)
  const {
  data: quality,
  isLoading: qualityLoading,
} = useQuality(activeDatasetId)
  const overview = summary?.overview || {}

const columnAnalysis = summary?.column_analysis || {}

const statistics = summary?.descriptive_stats || []
const sortedStatistics = useMemo(() => {

  return [...statistics].sort((a, b) => {

    const av = a?.[sortCol]
    const bv = b?.[sortCol]

    if (typeof av === 'string') {

      return sortDir === 'asc'
        ? av.localeCompare(bv)
        : bv.localeCompare(av)
    }

    return sortDir === 'asc'
      ? (Number(av) || 0) - (Number(bv) || 0)
      : (Number(bv) || 0) - (Number(av) || 0)
  })

}, [statistics, sortCol, sortDir])

  if (!activeDatasetId) return <EmptyState />

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <ToastContainer />

      {/* Header */}
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Statistical analysis and data profiling</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 flex gap-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'tab-active' : 'tab-inactive'}
          >
            {tab}
          </button>
        ))}
      </div>

     {/* Overview */}
{activeTab === 'Overview' && (
  <ErrorBoundary fallbackTitle="Failed to load overview">

    {summaryLoading ? (

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}

      </div>

    ) : summary ? (

      <>

        {/* Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

          {[
            {
              label: 'Rows',
              value:
                overview.rows?.toLocaleString() ?? '—',
            },

            {
              label: 'Columns',
              value:
                overview.columns ?? '—',
            },

            {
              label: 'Missing',
              value:
                `${overview.missing_pct?.toFixed(1) ?? 0}%`,
            },

            {
              label: 'Duplicates',
              value:
                overview.duplicate_count?.toLocaleString() ?? '0',
            },

            {
              label: 'Memory',

              value: formatBytes(
                overview.memory_usage_bytes || 0
              ),
            },

          ].map(({ label, value }) => (

            <div
              key={label}
              className="card p-4"
            >

              <p className="text-xs text-zinc-600 mb-2">
                {label}
              </p>

              <p className="text-xl font-bold text-white font-numeric">
                {value}
              </p>

            </div>

          ))}

        </div>

        {/* Analytics Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">

          {/* Quality */}
          <div className="card p-5 flex flex-col items-center justify-center">

            <p className="section-title mb-4">
              Dataset Quality
            </p>

            <ScoreGauge
              score={Math.round(
                overview.quality_score || 0
              )}
            />

            <p className="text-xs text-zinc-500 mt-2">
              Overall dataset health
            </p>

          </div>

          {/* Composition */}
          <div className="card p-5">

            <p className="section-title mb-4">
              Column Composition
            </p>

            <div className="space-y-4">

              {[
                {
                  label: 'Numeric',
                  count:
                    columnAnalysis?.numeric_columns
                      ?.length || 0,
                },

                {
                  label: 'Categorical',
                  count:
                    columnAnalysis?.categorical_columns
                      ?.length || 0,
                },

                {
                  label: 'Datetime',
                  count:
                    columnAnalysis?.datetime_columns
                      ?.length || 0,
                },

              ].map((item) => {

                const total =
                  overview.columns || 1

                const width =
                  (item.count / total) * 100

                return (

                  <div key={item.label}>

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-sm text-zinc-400">
                        {item.label}
                      </span>

                      <span className="text-sm font-numeric text-white">
                        {item.count}
                      </span>

                    </div>

                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-white/50 rounded-full"
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>

                  </div>
                )
              })}

            </div>

          </div>

          {/* Quick Insights */}
          <div className="card p-5">

            <p className="section-title mb-4">
              Quick Insights
            </p>

            <div className="space-y-3 text-sm">

              <div className="flex items-start gap-2">

                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2" />

                <p className="text-zinc-400">
                  Dataset contains{' '}
                  <span className="text-white font-medium">
                    {overview.rows?.toLocaleString()}
                  </span>{' '}
                  rows and{' '}
                  <span className="text-white font-medium">
                    {overview.columns}
                  </span>{' '}
                  columns.
                </p>

              </div>

              <div className="flex items-start gap-2">

                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2" />

                <p className="text-zinc-400">
                  Missing values affect{' '}
                  <span className="text-white font-medium">
                    {overview.missing_pct?.toFixed(1)}%
                  </span>{' '}
                  of the dataset.
                </p>

              </div>

              <div className="flex items-start gap-2">

                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2" />

                <p className="text-zinc-400">
                  Duplicate rows detected:{' '}
                  <span className="text-white font-medium">
                    {overview.duplicate_count}
                  </span>
                </p>

              </div>

              <div className="flex items-start gap-2">

                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2" />

                <p className="text-zinc-400">
                  Estimated memory usage:{' '}
                  <span className="text-white font-medium">
                    {formatBytes(
                      overview.memory_usage_bytes || 0
                    )}
                  </span>
                </p>

              </div>

            </div>

          </div>

        </div>

      </>

    ) : null}

  </ErrorBoundary>
)}
        

      {/* Columns */}
      {activeTab === 'Columns' && (
        <ErrorBoundary fallbackTitle="Failed to load column info">
          {summaryLoading ? (
            <SkeletonChart />
          ) : summary ? (
            <div className="space-y-6">
              {/* Column type pills */}
              {['numeric', 'categorical', 'datetime'].map((type) => {
                const cols =
  columnAnalysis?.[`${type}_columns`] || []
                if (!cols.length) return null
                const colors = {
                  numeric: 'bg-white/8 text-zinc-300 border-white/10',
                  categorical: 'bg-white/4 text-zinc-400 border-white/8',
                  datetime: 'bg-white/3 text-zinc-500 border-white/6',
                }
                return (
                  <div key={type}>
                    <p className="section-title mb-3 capitalize">{type} Columns ({cols.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {cols.map((col) => (
                        <span
                          key={col}
                          className={`badge border text-xs ${colors[type]}`}
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Cardinality chart */}
              {columnAnalysis.cardinality && (
                <div className="card p-5">
                  <p className="section-title mb-4">Column Cardinality</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
  data={
    Object.entries(columnAnalysis.cardinality)
      .map(([col, count]) => ({ col, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }
>
                      <XAxis
                        dataKey="col"
                        tick={{ fill: '#52525B', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis
                        tick={{ fill: '#52525B', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {Object.keys(columnAnalysis.cardinality).map((_, i) => (
                          <Cell key={i} fill={`rgba(255,255,255,${0.7 - i * 0.02})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : null}
        </ErrorBoundary>
      )}

      {/* Statistics */}
      
{activeTab === 'Statistics' && (

  <ErrorBoundary fallbackTitle="Failed to load statistics">

    {summaryLoading ? (

      <SkeletonTable />

    ) : statistics?.length ? (

      <div className="card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-xs">

            <thead>

              <tr className="border-b border-white/5">

                {[
                  { key: 'column', label: 'Column' },
                  { key: 'mean', label: 'Mean' },
                  { key: 'median', label: 'Median' },
                  { key: 'std', label: 'Std Dev' },
                  { key: 'skewness', label: 'Skewness' },
                  { key: 'kurtosis', label: 'Kurtosis' },
                  { key: 'p25', label: 'P25' },
                  { key: 'p75', label: 'P75' },
                  { key: 'p95', label: 'P95' },
                ].map(({ key, label }) => (

                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 select-none whitespace-nowrap"
                  >

                    {label}

                    {sortCol === key && (

                      <span className="ml-1">

                        {sortDir === 'asc'
                          ? '↑'
                          : '↓'}

                      </span>
                    )}

                  </th>
                ))}

              </tr>

            </thead>

            <tbody className="divide-y divide-white/[0.03]">

              {sortedStatistics.map((row, i) => (

                <tr
                  key={i}
                  className="hover:bg-white/[0.02]"
                >

                  <td className="px-4 py-2.5 font-medium text-zinc-300">

                    {row.column}

                  </td>

                  {[
                    'mean',
                    'median',
                    'std',
                    'skewness',
                    'kurtosis',
                    'p25',
                    'p75',
                    'p95',
                  ].map((k) => (

                    <td
                      key={k}
                      className="px-4 py-2.5 text-zinc-500 font-numeric"
                    >

                      {row[k] !== null &&
                      row[k] !== undefined &&
                      !Number.isNaN(Number(row[k]))
                        ? Number(row[k]).toFixed(3)
                        : '—'}

                    </td>
                  ))}

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    ) : (

      <div className="card p-8 text-center text-sm text-zinc-600">

        No statistics available

      </div>

    )}

  </ErrorBoundary>
)}

      {/* Correlations */}
      {activeTab === 'Correlations' && (
        <ErrorBoundary fallbackTitle="Failed to load correlations">
          {corrLoading ? (
            <SkeletonChart height={300} />
          ) : correlations ? (
            <div className="space-y-6">
              <div className="card p-6">
                <p className="section-title mb-5">Correlation Heatmap</p>
                <CorrelationHeatmap
  data={correlations}
/>
              </div>

              {correlations?.correlations?.strongest_pairs && (
                <div className="card p-5">
                  <p className="section-title mb-4">Strongest Correlations</p>
                  <div className="space-y-2">
                    {correlations.correlations.strongest_pairs
  .slice(0, 10)
  .map((pair, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0"
                      >
                        <span className="text-xs text-zinc-400">
                          <span className="text-white">{pair.col1}</span>
                          {' × '}
                          <span className="text-white">{pair.col2}</span>
                        </span>
                        <span
                          className={clsx(
                            'text-xs font-medium font-numeric',
                            Math.abs(pair.value) > 0.7 ? 'text-white' : 'text-zinc-400'
                          )}
                        >
                          {pair.value?.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ErrorBoundary>
      )}

      {/* Outliers */}
{activeTab === 'Outliers' && (

  <ErrorBoundary fallbackTitle="Failed to load outliers">

    {outliersLoading ? (

      <SkeletonChart />

    ) : outliers ? (

      <div className="space-y-5">

        {/* Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#111111] border border-white/5 rounded-sm w-fit">

          {['iqr', 'zscore'].map((method) => (

            <button
              key={method}
              onClick={() =>
                setOutlierMethod(method)
              }
              className={clsx(
                'px-3 py-1 text-xs rounded-sm transition-all duration-150',

                outlierMethod === method

                  ? 'bg-white text-black font-medium'

                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >

              {method === 'iqr'
                ? 'IQR Method'
                : 'Z-Score Method'}

            </button>

          ))}

        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {(outliers?.results || [])

            .filter(
              (item) =>
                item.method === outlierMethod
            )

            .map((item, i) => (

              <div
                key={i}
                className="card p-5"
              >

                <div className="flex items-center justify-between mb-4">

                  <div>

                    <p className="text-sm font-medium text-white">

                      {item.column}

                    </p>

                    <p className="text-xs text-zinc-500 mt-1">

                      {item.method === 'iqr'

                        ? 'Interquartile Range'

                        : 'Standard Deviation'}

                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-lg font-bold font-numeric text-white">

                      {item.outlier_count ?? 0}

                    </p>

                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">

                      Outliers

                    </p>

                  </div>

                </div>

                {/* Percentage */}
                <div className="mb-4">

                  <div className="flex items-center justify-between mb-1">

                    <span className="text-xs text-zinc-500">

                      Outlier Percentage

                    </span>

                    <span className="text-xs font-numeric text-white">

                      {(
                        item.outlier_pct || 0
                      ).toFixed(2)}%

                    </span>

                  </div>

                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-red-400/70 rounded-full"
                      style={{
                        width: `${Math.min(
                          item.outlier_pct || 0,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                {/* Bounds */}
                <div className="grid grid-cols-2 gap-3">

                  <div className="bg-white/[0.02] border border-white/5 rounded-sm p-3">

                    <p className="text-[10px] uppercase tracking-wide text-zinc-600 mb-1">

                      Lower Bound

                    </p>

                    <p className="text-sm font-numeric text-white">

                      {item.lower_bound !== undefined

                        ? Number(
                            item.lower_bound
                          ).toFixed(2)

                        : '—'}

                    </p>

                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-sm p-3">

                    <p className="text-[10px] uppercase tracking-wide text-zinc-600 mb-1">

                      Upper Bound

                    </p>

                    <p className="text-sm font-numeric text-white">

                      {item.upper_bound !== undefined

                        ? Number(
                            item.upper_bound
                          ).toFixed(2)

                        : '—'}

                    </p>

                  </div>

                </div>

              </div>

            ))}

        </div>

      </div>

    ) : (

      <div className="card p-8 text-center text-sm text-zinc-600">

        No outlier analysis available

      </div>

    )}

  </ErrorBoundary>

)}
      {/* Quality */}
      {activeTab === 'Quality' && (
        <ErrorBoundary fallbackTitle="Failed to load quality data">
          {qualityLoading ? (
            <SkeletonChart height={200} />
          ) : quality ? (
            <div className="space-y-5">
              {/* Score gauge + summary */}
              <div className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex flex-col items-center">
                    <ScoreGauge score={Math.round(quality.overall_score || quality.score || 0)} />
                    <p className="text-xs text-zinc-500 mt-1">Overall Quality</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {quality.dimensions?.map((dim) => (
                      <div key={dim.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">{dim.name}</span>
                          <span className="text-xs font-medium text-white font-numeric">
                            {dim.score}
                          </span>
                        </div>
                        <div className="h-0.5 bg-white/5 rounded-full">
                          <div
                            className="h-full bg-white/50 rounded-full"
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>
                      </div>
                    )) || (
                      <div className="col-span-3 text-sm text-zinc-600">
                        No dimension data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Issues with severity */}
              {quality.issues && quality.issues.length > 0 && (
                <div className="card p-5">
                  <p className="section-title mb-4">Issues</p>
                  <div className="space-y-2">
                    {quality.issues.map((issue, i) => {
                      const Icon =
                        issue.severity === 'high'
                          ? AlertTriangle
                          : issue.severity === 'medium'
                          ? Info
                          : CheckCircle
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 py-2.5 border-b border-white/[0.03] last:border-0"
                        >
                          <Icon
                            size={13}
                            className={clsx(
                              'mt-0.5 shrink-0',
                              issue.severity === 'high' ? 'text-red-400' :
                              issue.severity === 'medium' ? 'text-yellow-400' :
                              'text-zinc-600'
                            )}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-zinc-300">{issue.message || issue.description}</p>
                            {issue.column && (
                              <p className="text-[10px] text-zinc-600 mt-0.5">Column: {issue.column}</p>
                            )}
                          </div>
                          <span
                            className={clsx(
                              'badge text-[10px] shrink-0',
                              issue.severity === 'high' ? 'badge-danger' :
                              issue.severity === 'medium' ? 'badge-warning' :
                              'badge-neutral'
                            )}
                          >
                            {issue.severity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {quality.recommendations && quality.recommendations.length > 0 && (
                <div className="card p-5">
                  <p className="section-title mb-4">Recommendations</p>
                  <ol className="space-y-2">
                    {quality.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                        <span className="text-zinc-700 font-numeric shrink-0 mt-0.5">{i + 1}.</span>
                        {rec.message || rec}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Per-column quality table */}
              {quality.column_quality && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5">
                    <p className="section-title">Per-Column Quality</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Column', 'Missing %', 'Unique', 'Issues', 'Score'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-zinc-500 font-medium">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {quality.column_quality.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5 font-medium text-zinc-300">{row.column}</td>
                            <td className="px-4 py-2.5 text-zinc-500 font-numeric">
                              {row.missing_pct?.toFixed(1) ?? 0}%
                            </td>
                            <td className="px-4 py-2.5 text-zinc-500 font-numeric">
                              {row.unique_count?.toLocaleString() ?? '—'}
                            </td>
                            <td className="px-4 py-2.5">
                              {row.issues?.length > 0 ? (
                                <span className="badge-warning text-[10px]">
                                  {row.issues.length} issues
                                </span>
                              ) : (
                                <span className="badge-success text-[10px]">Clean</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-0.5 bg-white/5 rounded-full">
                                  <div
                                    className="h-full bg-white/50 rounded-full"
                                    style={{ width: `${row.score || 0}%` }}
                                  />
                                </div>
                                <span className="text-zinc-500 font-numeric">{row.score ?? '—'}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ErrorBoundary>
      )}
    </div>
  )
}
