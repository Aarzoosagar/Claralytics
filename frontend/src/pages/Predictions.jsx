import { useState } from 'react'
import { useAppStore } from '../store/appStore.js'
import { useAnalyticsSummary } from '../hooks/useAnalytics.js'
import {
  useForecast,
  useChurn,
  useSegmentation,
  useAnomalyDetection,
} from '../hooks/usePredictions.js'

import EmptyState from '../components/ui/EmptyState.jsx'
import StatBadge from '../components/ui/StatBadge.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import { toast, ToastContainer } from '../components/ui/Toast.jsx'

import ForecastChart from '../components/charts/ForecastChart.jsx'
import FeatureImportanceChart from '../components/charts/FeatureImportanceChart.jsx'
import SegmentPieChart from '../components/charts/SegmentPieChart.jsx'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import {
  TrendingUp,
  Users,
  PieChart as PieIcon,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'

/* ───────────────────────────────────────────────────────────── */

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-sm px-3 py-2 text-xs">
      <p className="text-zinc-400">{label}</p>

      <p className="text-white font-medium font-numeric mt-0.5">
        {typeof payload[0].value === 'number'
          ? payload[0].value.toLocaleString()
          : payload[0].value}
      </p>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */

function PredictionCard({
  title,
  description,
  icon: Icon,
  children,
}) {
  const [expanded, setExpanded] =
    useState(false)

  return (
    <div className="card overflow-hidden">

      <button
        onClick={() =>
          setExpanded(!expanded)
        }
        className="
          w-full
          flex
          items-center
          justify-between
          p-5
          hover:bg-white/[0.02]
          transition-colors
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              w-8
              h-8
              rounded-sm
              bg-white/5
              border
              border-white/10
              flex
              items-center
              justify-center
            "
          >

            <Icon
              size={15}
              className="text-zinc-400"
            />

          </div>

          <div className="text-left">

            <p className="text-sm font-semibold text-white">

              {title}

            </p>

            <p className="text-xs text-zinc-500 mt-0.5">

              {description}

            </p>

          </div>

        </div>

        {expanded ? (

          <ChevronUp
            size={15}
            className="text-zinc-600 shrink-0"
          />

        ) : (

          <ChevronDown
            size={15}
            className="text-zinc-600 shrink-0"
          />

        )}

      </button>

      {expanded && (

        <div className="border-t border-white/5 p-5 animate-fade-in">

          {children}

        </div>
      )}

    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */
/* Forecast Panel */
/* ───────────────────────────────────────────────────────────── */

function ForecastPanel({
  datasetId,
  summary,
}) {

  const columns =
  summary?.column_analysis
    ?.numeric_columns || []

  const [target, setTarget] =
    useState(columns[0] || '')

  const [periods, setPeriods] =
    useState(30)

  const forecast =
    useForecast()

  const handleRun = () => {

    if (!target) {
      return toast.error(
        'Select a target column'
      )
    }

    forecast.mutate({
      datasetId,
      targetColumn: target,
      periods,
    })
  }

  const result = forecast.data

  return (

    <div className="space-y-5">

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>

          <label className="label">

            Target Column

          </label>

          <select
            value={target}
            onChange={(e) =>
              setTarget(
                e.target.value
              )
            }
            className="input"
          >

            <option value="">

              Select column...

            </option>

            {columns.map((c) => (

              <option
                key={c}
                value={c}
              >

                {c}

              </option>
            ))}

          </select>

        </div>

        <div>

          <label className="label">

            Forecast Periods:
            {' '}
            {periods}

          </label>

          <input
            type="range"
            min={7}
            max={365}
            step={7}
            value={periods}
            onChange={(e) =>
              setPeriods(
                +e.target.value
              )
            }
            className="w-full mt-2 accent-white"
          />

        </div>

        <div className="flex items-end">

          <button
            onClick={handleRun}
            disabled={
              forecast.isPending ||
              !target
            }
            className="
              btn-primary
              w-full
              flex
              items-center
              justify-center
              gap-2
            "
          >

            {forecast.isPending ? (

              <div
                className="
                  w-3.5
                  h-3.5
                  border
                  border-black/30
                  border-t-black
                  rounded-full
                  animate-spin
                "
              />

            ) : (

              'Run Forecast'

            )}

          </button>

        </div>

      </div>

      {/* Error */}
      {forecast.isError && (

        <p className="text-xs text-red-400">

          {forecast.error?.response
            ?.data?.message ||
            'Forecast failed'}

        </p>
      )}

      {/* Results */}
      {result && (

        <div className="space-y-4 animate-fade-in">

          <div className="flex flex-wrap gap-2">

            {result.metrics?.mae !== undefined && (

              <StatBadge
                label="MAE"
                value={result.metrics.mae.toFixed(4)}
              />
            )}

            {result.metrics?.rmse !== undefined && (

              <StatBadge
                label="RMSE"
                value={result.metrics.rmse.toFixed(4)}
              />
            )}

            {result.metrics?.r2 !== undefined && (

              <StatBadge
                label="R²"
                value={result.metrics.r2.toFixed(4)}
                variant={
                  result.metrics.r2 > 0.8
                    ? 'success'
                    : result.metrics.r2 > 0.5
                      ? 'warning'
                      : 'danger'
                }
              />
            )}

          </div>

          <div className="card p-5">

            <p className="text-xs text-zinc-500 mb-4">

              Actual vs Predicted

            </p>

            <ForecastChart
              data={
                result.actual_vs_predicted ||
                result.forecast_values ||
                []
              }
            />

          </div>

        </div>
      )}

    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */
/* Churn Panel */
/* ───────────────────────────────────────────────────────────── */

function ChurnPanel({
  datasetId,
  summary,
}) {

  const numericColumns = Array.isArray(
  summary?.column_analysis
    ?.numeric_columns
)
  ? summary.column_analysis.numeric_columns
  : []

const categoricalColumns = Array.isArray(
  summary?.column_analysis
    ?.categorical_columns
)
  ? summary.column_analysis.categorical_columns
  : []

const columns = [
  ...numericColumns,
  ...categoricalColumns,
]

  const [target, setTarget] =
    useState('')

  const churn =
    useChurn()

  const handleRun = () => {

    if (!target) {
      return toast.error(
        'Select a target column'
      )
    }

    churn.mutate({
      datasetId,
      targetColumn: target,
    })
  }

  const result = churn.data

  const donutData = result
    ? [
        {
          name: 'Low',
          value:
            result.risk_distribution?.low || 0,
          color:
            'rgba(255,255,255,0.9)',
        },

        {
          name: 'Medium',
          value:
            result.risk_distribution?.medium || 0,
          color:
            'rgba(245,158,11,0.9)',
        },

        {
          name: 'High',
          value:
            result.risk_distribution?.high || 0,
          color:
            'rgba(239,68,68,0.9)',
        },
      ]
    : []

  return (

    <div className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>

          <label className="label">

            Target Column

          </label>

          <select
            value={target}
            onChange={(e) =>
              setTarget(
                e.target.value
              )
            }
            className="input"
          >

            <option value="">

              Select column...

            </option>

            {columns.map((c) => (

              <option
                key={c}
                value={c}
              >

                {c}

              </option>
            ))}

          </select>

        </div>

        <div className="flex items-end">

          <button
            onClick={handleRun}
            disabled={
              churn.isPending ||
              !target
            }
            className="
              btn-primary
              w-full
            "
          >

            {churn.isPending
              ? 'Running...'
              : 'Analyze Churn'}

          </button>

        </div>

      </div>

      {result && (

        <div className="space-y-4 animate-fade-in">

          <div className="flex flex-wrap gap-2">

            {result.metrics?.accuracy !== undefined && (

              <StatBadge
                label="Accuracy"
                value={`${(
                  result.metrics.accuracy * 100
                ).toFixed(1)}%`}
              />
            )}

            {result.metrics?.precision !== undefined && (

              <StatBadge
                label="Precision"
                value={`${(
                  result.metrics.precision * 100
                ).toFixed(1)}%`}
              />
            )}

            {result.metrics?.recall !== undefined && (

              <StatBadge
                label="Recall"
                value={`${(
                  result.metrics.recall * 100
                ).toFixed(1)}%`}
              />
            )}

            {result.metrics?.f1 !== undefined && (

              <StatBadge
                label="F1"
                value={result.metrics.f1.toFixed(4)}
              />
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="card p-5">

              <p className="text-xs text-zinc-500 mb-3">

                Risk Distribution

              </p>

              <ResponsiveContainer
                width="100%"
                height={220}
              >

                <PieChart>

                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={80}
                  >

                    {donutData.map(
                      (entry, i) => (

                        <Cell
                          key={i}
                          fill={entry.color}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {result.feature_importance && (

              <div className="card p-5">

                <p className="text-xs text-zinc-500 mb-3">

                  Feature Importance

                </p>

                <FeatureImportanceChart
                  data={result.feature_importance}
                />

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */
/* Segmentation Panel */
/* ───────────────────────────────────────────────────────────── */

function SegmentationPanel({
  datasetId,
}) {

  const [nClusters, setNClusters] =
    useState(4)

  const segmentation =
    useSegmentation()

  const result =
    segmentation.data?.data

  const handleRun = () => {

    segmentation.mutate({

      datasetId,

      nClusters,
    })
  }

  return (

    <div className="space-y-6">

      {/* Controls */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">

        <div>

          <label className="block text-xs text-zinc-500 mb-3 uppercase tracking-wide">

            Clusters:
            {' '}
            {nClusters}

          </label>

          <input
            type="range"
            min={2}
            max={10}
            value={nClusters}
            onChange={(e) =>
              setNClusters(
                Number(e.target.value)
              )
            }
            className="w-full"
          />

        </div>

        <button
          onClick={handleRun}
          className="btn-primary h-[44px]"
          disabled={
            segmentation.isPending
          }
        >

          {segmentation.isPending
            ? 'Running...'
            : 'Run Segmentation'}

        </button>

      </div>

      {/* Error */}

      {segmentation.isError && (

        <div className="card p-4 border border-red-500/20">

          <p className="text-red-400 text-sm font-medium">

            Segmentation failed

          </p>

          <p className="text-zinc-500 text-xs mt-1">

            {
              segmentation.error
                ?.response?.data
                ?.message ||

              segmentation.error
                ?.message ||

              'Unknown error'
            }

          </p>

        </div>

      )}

      {/* Results */}

      {result?.clusters && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {result.clusters.map(
            (cluster, idx) => (

              <div
                key={idx}
                className="card p-4"
              >

                <div className="flex items-center justify-between mb-4">

                  <h4 className="text-sm font-semibold text-white">

                    Cluster
                    {' '}
                    {idx + 1}

                  </h4>

                  <span className="text-xs text-zinc-500">

                    {
                      cluster.size
                    }
                    {' '}
                    records

                  </span>

                </div>

                <div className="space-y-2">

                  {Object.entries(
                    cluster.centroid || {}
                  )

                    .slice(0, 6)

                    .map(
                      ([k, v]) => (

                        <div
                          key={k}
                          className="flex items-center justify-between text-xs"
                        >

                          <span className="text-zinc-500">

                            {k}

                          </span>

                          <span className="text-white font-mono">

                            {Number(v)
                              .toFixed(2)}

                          </span>

                        </div>
                      )
                    )}

                </div>

              </div>
            )
          )}

        </div>

      )}

    </div>
  )
}
/* ───────────────────────────────────────────────────────────── */
/* Anomalies Panel */
/* ───────────────────────────────────────────────────────────── */

function AnomaliesPanel({
  datasetId,
}) {

  const anomalies =
    useAnomalyDetection()

  const handleRun = () => {
    anomalies.mutate({
      datasetId,
      contamination: 0.05,
    })
  }

  const result =
    anomalies.data

  return (

    <div className="space-y-5">

      <button
        onClick={handleRun}
        className="btn-primary"
      >

        Detect Anomalies

      </button>

      {result && (

        <div className="space-y-4">

          <div className="flex gap-2 flex-wrap">

            <StatBadge
              label="Anomalies"
              value={
                result.anomaly_count
              }
            />

            <StatBadge
              label="Total"
              value={
                result.total_samples
              }
            />

          </div>

          {result.score_distribution && (

            <div className="card p-5">

              <ResponsiveContainer
                width="100%"
                height={200}
              >

                <BarChart
                  data={
                    result.score_distribution
                  }
                >

                  <XAxis dataKey="bin" />

                  <YAxis />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Bar
                    dataKey="count"
                    fill="rgba(255,255,255,0.5)"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          )}

        </div>
      )}

    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */
/* MAIN PAGE */
/* ───────────────────────────────────────────────────────────── */

export default function Predictions() {

  const activeDatasetId =
    useAppStore(
      (s) => s.activeDatasetId
    )

  const { data: summary } =
    useAnalyticsSummary(
      activeDatasetId
    )

  if (!activeDatasetId) {
    return <EmptyState />
  }

  return (

    <div className="space-y-6 pb-20 md:pb-0">

      <ToastContainer />

      <div>

        <h1 className="page-title">

          Predictions

        </h1>

        <p className="text-sm text-zinc-500 mt-1">

          Configure and run ML models

        </p>

      </div>

      <div className="space-y-3">

        <ErrorBoundary fallbackTitle="Forecast failed">

          <PredictionCard
            title="Forecast"
            description="Time-series prediction"
            icon={TrendingUp}
          >

            <ForecastPanel
              datasetId={activeDatasetId}
              summary={summary}
            />

          </PredictionCard>

        </ErrorBoundary>

        <ErrorBoundary fallbackTitle="Churn failed">

          <PredictionCard
            title="Churn Prediction"
            description="Customer risk scoring"
            icon={Users}
          >

            <ChurnPanel
              datasetId={activeDatasetId}
              summary={summary}
            />

          </PredictionCard>

        </ErrorBoundary>

        <ErrorBoundary fallbackTitle="Segmentation failed">

          <PredictionCard
            title="Segmentation"
            description="KMeans clustering"
            icon={PieIcon}
          >

            <SegmentationPanel
              datasetId={activeDatasetId}
            />

          </PredictionCard>

        </ErrorBoundary>

        <ErrorBoundary fallbackTitle="Anomaly failed">

          <PredictionCard
            title="Anomaly Detection"
            description="Isolation Forest"
            icon={AlertOctagon}
          >

            <AnomaliesPanel
              datasetId={activeDatasetId}
            />

          </PredictionCard>

        </ErrorBoundary>

      </div>

    </div>
  )
}