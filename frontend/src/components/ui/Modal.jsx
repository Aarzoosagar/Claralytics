import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full ${sizes[size]} bg-[#0D0D0D] border border-white/10 rounded-sm shadow-2xl animate-slide-up`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/5">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-white">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-zinc-500 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-white/5 rounded-sm transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
