import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const ACCEPTED_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
}

const MAX_SIZE = 100 * 1024 * 1024 // 100MB

export default function DropZone({ onUpload, uploading, progress }) {
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const onDrop = useCallback(
    (accepted, rejected) => {
      setError(null)
      if (rejected.length > 0) {
        const err = rejected[0].errors[0]
        if (err.code === 'file-too-large') {
          setError('File exceeds 100MB limit')
        } else if (err.code === 'file-invalid-type') {
          setError('Only CSV and XLSX files are accepted')
        } else {
          setError(err.message)
        }
        return
      }
      if (accepted.length > 0) {
        const file = accepted[0]
        setSelectedFile(file)
        onUpload(file)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  })

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'border border-dashed rounded-sm p-10 text-center cursor-pointer',
          'transition-all duration-150',
          isDragActive
            ? 'border-white/30 bg-white/5'
            : uploading
            ? 'border-white/10 bg-white/2 cursor-not-allowed'
            : 'border-white/10 hover:border-white/20 hover:bg-white/3',
          error && 'border-red-500/30'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
            <Upload size={18} className="text-zinc-500" />
          </div>

          {isDragActive ? (
            <p className="text-sm text-zinc-300">Drop your file here</p>
          ) : (
            <div>
              <p className="text-sm text-zinc-300">
                Drag & drop a file, or{' '}
                <span className="text-white underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                CSV, XLSX — max 100 MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 px-1">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Upload progress */}
      {uploading && selectedFile && (
        <div className="card p-4 space-y-2.5">
          <div className="flex items-center gap-3">
            <File size={14} className="text-zinc-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300 truncate">{selectedFile.name}</p>
              <p className="text-xs text-zinc-600">{formatSize(selectedFile.size)}</p>
            </div>
            <span className="text-xs text-zinc-400 font-numeric shrink-0">
              {progress}%
            </span>
          </div>
          <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success */}
      {!uploading && selectedFile && progress === 100 && (
        <div className="flex items-center gap-2 text-xs text-green-400 px-1">
          <CheckCircle size={12} />
          {selectedFile.name} uploaded successfully
        </div>
      )}
    </div>
  )
}
