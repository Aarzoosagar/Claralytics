import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Trash2, MoreHorizontal, Calendar, Rows } from 'lucide-react'
import { useDatasets, useUploadDataset, useDeleteDataset } from '../hooks/useDatasets.js'
import { useAppStore } from '../store/appStore.js'
import DropZone from '../components/upload/DropZone.jsx'
import Modal from '../components/ui/Modal.jsx'
import { SkeletonCard } from '../components/ui/SkeletonCard.jsx'
import { toast, ToastContainer } from '../components/ui/Toast.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'

function QualityRing({ score }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 80 ? 'rgba(255,255,255,0.8)' : score >= 60 ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)'

  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle
        cx="20" cy="20" r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="2.5"
      />
      <circle
        cx="20" cy="20" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      <text
        x="20" y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="9"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {score ?? '—'}
      </text>
    </svg>
  )
}

export default function Datasets() {
  const navigate = useNavigate()
  const { data: datasets, isLoading } = useDatasets()
  const { setActiveDataset, activeDatasetId } = useAppStore()
  const uploadMutation = useUploadDataset()
  const deleteMutation = useDeleteDataset()

  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const handleUpload = async (file) => {
    setUploadProgress(0)
    try {
      await uploadMutation.mutateAsync({
        file,
        onProgress: setUploadProgress,
      })
      toast.success(`${file.name} uploaded successfully`)
      setShowUpload(false)
      setUploadProgress(0)
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Upload failed. Please try again.'
      )
      setUploadProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete dataset')
    }
  }

  const handleCardClick = (dataset) => {
    setActiveDataset(dataset.id)
    navigate('/analytics')
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Datasets</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage and analyze your data sources
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary text-xs"
        >
          {showUpload ? 'Cancel' : '+ Upload Dataset'}
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <ErrorBoundary>
          <div className="card p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-white mb-4">Upload Dataset</h3>
            <DropZone
              onUpload={handleUpload}
              uploading={uploadMutation.isPending}
              progress={uploadProgress}
            />
          </div>
        </ErrorBoundary>
      )}

      {/* Dataset grid */}
      <ErrorBoundary fallbackTitle="Failed to load datasets">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !datasets || datasets.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-10 h-10 rounded-sm bg-white/3 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Database size={18} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-300 mb-2">No datasets yet</p>
            <p className="text-xs text-zinc-600 mb-5">
              Upload a CSV or XLSX file to get started
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary text-xs"
            >
              Upload your first dataset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((ds) => (
              <div
                key={ds.id}
                className={`card-hover p-5 relative group ${
                  activeDatasetId === ds.id ? 'border-white/20' : ''
                }`}
                onClick={() => handleCardClick(ds)}
              >
                {/* Active indicator */}
                {activeDatasetId === ds.id && (
                  <div className="absolute top-3 right-3">
                    <span className="badge-success text-[10px]">Active</span>
                  </div>
                )}

                {/* Delete button */}
                <button
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 
                             p-1 rounded-sm text-zinc-600 hover:text-red-400 hover:bg-red-500/5
                             transition-all duration-150 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(ds)
                  }}
                >
                  <Trash2 size={13} />
                </button>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Database size={14} className="text-zinc-500" />
                  </div>
                  <div className="min-w-0 flex-1 mr-5">
                    <p className="text-sm font-semibold text-white truncate">
                      {ds.name}
                    </p>
                    {ds.description && (
                      <p className="text-xs text-zinc-600 truncate mt-0.5">
                        {ds.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Rows size={11} className="text-zinc-600" />
                    <span className="font-numeric">
                      {ds.rows?.toLocaleString() || '—'}
                      {ds.columns ? ` × ${ds.columns}` : ''}
                    </span>
                  </div>
                  {ds.file_size && (
                    <span className="text-xs text-zinc-600">
                      {formatSize(ds.file_size)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <Calendar size={11} />
                    {formatDate(ds.created_at || ds.upload_date)}
                  </div>

                  <div className="flex items-center gap-2">
                    {ds.quality_score !== undefined && (
                      <QualityRing score={Math.round(ds.quality_score)} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ErrorBoundary>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete dataset"
        description="This action cannot be undone."
        size="sm"
      >
        <p className="text-sm text-zinc-400 mb-5">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{deleteTarget?.name}</span>?
          All associated analytics and predictions will be removed.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setDeleteTarget(null)}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn-danger text-xs"
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete dataset'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
