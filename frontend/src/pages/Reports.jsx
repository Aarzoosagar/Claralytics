import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '../api/reports.js'
import { useAppStore } from '../store/appStore.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import { SkeletonTable } from '../components/ui/SkeletonCard.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import Modal from '../components/ui/Modal.jsx'
import { toast, ToastContainer } from '../components/ui/Toast.jsx'
import {
  FileText,
  Download,
  Eye,
  ChevronDown,
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  report_type: z.enum(['analytics', 'prediction', 'executive', 'full']),
  include_ai_insights: z.boolean(),
  include_predictions: z.boolean(),
})

const TYPE_OPTIONS = [
  { value: 'analytics', label: 'Analytics Report' },
  { value: 'prediction', label: 'Prediction Report' },
  { value: 'executive', label: 'Executive Summary' },
  { value: 'full', label: 'Full Report' },
]

function StatusBadge({ status }) {
  const variants = {
    completed: { cls: 'badge-success', icon: CheckCircle, label: 'Completed' },
    generating: { cls: 'badge-warning', icon: Loader, label: 'Generating' },
    failed: { cls: 'badge-danger', icon: XCircle, label: 'Failed' },
    pending: { cls: 'badge-neutral', icon: Clock, label: 'Pending' },
  }
  const v = variants[status] || variants.pending
  const Icon = v.icon

  return (
    <span className={`badge ${v.cls} gap-1`}>
      <Icon size={10} className={status === 'generating' ? 'animate-spin' : ''} />
      {v.label}
    </span>
  )
}

export default function Reports() {
  const activeDatasetId = useAppStore((s) => s.activeDatasetId)
  const [previewReport, setPreviewReport] = useState(null)
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      report_type: 'analytics',
      include_ai_insights: true,
      include_predictions: false,
    },
  })

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reportsApi.list()
      return res.data?.data || res.data || []
    },
    refetchInterval: (data) => {
      const hasGenerating = Array.isArray(data)
        ? data.some((r) => r.status === 'generating')
        : false
      return hasGenerating ? 3000 : false
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data) =>
      reportsApi.generate({
        ...data,
        dataset_id: activeDatasetId,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report generation started')
      reset()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate report')
    },
  })

  const handleDownload = async (report) => {
    try {
      const res = await reportsApi.download(report.id)
      const url = URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      )
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title || 'report'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const onSubmit = (data) => {
    if (!activeDatasetId) {
      toast.error('No dataset selected')
      return
    }
    generateMutation.mutate(data)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!activeDatasetId) return <EmptyState />

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <ToastContainer />

      {/* Header */}
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Generate and export analysis reports
        </p>
      </div>

      {/* Report builder */}
      <ErrorBoundary fallbackTitle="Report builder failed">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            Generate New Report
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Report Title</label>
                <input
                  type="text"
                  placeholder="Q4 Analytics Report"
                  className={`input ${errors.title ? 'border-red-500/50' : ''}`}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="label">Report Type</label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-8"
                    {...register('report_type')}
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    {...register('include_ai_insights')}
                  />
                  <div className="w-8 h-4 bg-white/10 border border-white/15 rounded-full transition-all peer-checked:bg-white" />
                </div>
                <span className="text-sm text-zinc-400">Include AI insights</span>
              </label>

              

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded-[2px] border border-white/20 bg-transparent accent-white"
                  {...register('include_predictions')}
                />
                <span className="text-sm text-zinc-400">Include predictions</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-black/30 border-t-black rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </ErrorBoundary>

      {/* Reports history */}
      <ErrorBoundary fallbackTitle="Failed to load reports">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">
            Report History
          </h2>

          {isLoading ? (
            <div className="card p-4">
              <SkeletonTable rows={4} />
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="card py-20 px-10 text-center">

  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
    <FileText size={28} className="text-violet-400" />
  </div>

  <h3 className="text-xl font-semibold text-zinc-200 mb-3">
    No reports generated yet
  </h3>

  <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed mb-6">
    Generate AI-powered business reports with
    analytics, predictions, executive summaries,
    and strategic recommendations from your datasets.
  </p>

  <div className="flex items-center justify-center gap-3 flex-wrap">

    <span className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-xs text-zinc-400">
      PDF Export
    </span>

    <span className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-xs text-zinc-400">
      AI Insights
    </span>

    <span className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-xs text-zinc-400">
      Predictions
    </span>

    <span className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-xs text-zinc-400">
      Executive Summary
    </span>

  </div>

</div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Title', 'Type', 'Status', 'Size', 'Created', 'Actions'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-zinc-500 font-medium whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <FileText size={13} className="text-zinc-600 shrink-0" />
                            <span className="text-zinc-300 font-medium">
                              {report.title || 'Untitled Report'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge-neutral capitalize text-[10px]">
                            {report.report_type || report.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={report.status || 'completed'} />
                        </td>
                        <td className="px-4 py-3 text-zinc-500 font-numeric">
                          {formatSize(report.file_size)}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewReport(report)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/5 rounded-sm transition-all"
                              title="Preview"
                            >
                              <Eye size={13} />
                            </button>
                            {report.status === 'completed' && (
                              <button
                                onClick={() => handleDownload(report)}
                                className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/5 rounded-sm transition-all"
                                title="Download PDF"
                              >
                                <Download size={13} />
                              </button>
                            )}
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
      </ErrorBoundary>

      {/* PDF Preview Modal */}
      <Modal
        open={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title={previewReport?.title || 'Report Preview'}
        size="xl"
      >
        <div className="h-96 bg-[#111111] border border-white/5 rounded-sm flex items-center justify-center">
          {previewReport?.status === 'completed' ? (
            <iframe
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reports/download/${previewReport?.id}`}
              className="w-full h-full"
              title="Report preview"
            />
          ) : (
            <div className="text-center">
              <Clock size={24} className="text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">
                Report is {previewReport?.status || 'pending'}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          {previewReport?.status === 'completed' && (
            <button
              onClick={() => handleDownload(previewReport)}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Download size={13} />
              Download PDF
            </button>
          )}
        </div>
      </Modal>
    </div>
  )
}
