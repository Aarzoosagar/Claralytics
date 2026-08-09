import { useNavigate } from 'react-router-dom'
import { Database, Upload } from 'lucide-react'

export default function EmptyState({
  title = 'No dataset selected',
  description = 'Select or upload a dataset to get started',
  showUpload = true,
}) {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-12 h-12 rounded-sm bg-white/3 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <Database size={20} className="text-zinc-600" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
          {description}
        </p>
        {showUpload && (
          <button
            onClick={() => navigate('/datasets')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Upload size={14} />
            Upload Dataset
          </button>
        )}
      </div>
    </div>
  )
}
