import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import clsx from 'clsx'

let toastQueue = []
let listeners = []

function notify(message, type = 'info', duration = 4000) {
  const id = Date.now()
  const toast = { id, message, type, duration }
  toastQueue = [...toastQueue, toast]
  listeners.forEach((fn) => fn(toastQueue))
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    listeners.forEach((fn) => fn(toastQueue))
  }, duration)
}

export const toast = {
  success: (msg) => notify(msg, 'success'),
  error: (msg) => notify(msg, 'error'),
  info: (msg) => notify(msg, 'info'),
  warning: (msg) => notify(msg, 'warning'),
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const fn = (q) => setToasts([...q])
    listeners.push(fn)
    return () => {
      listeners = listeners.filter((l) => l !== fn)
    }
  }, [])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
    warning: AlertCircle,
  }

  const colors = {
    success: 'text-green-400 bg-green-500/10 border-green-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
    info: 'text-zinc-300 bg-white/5 border-white/10',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={clsx(
              'flex items-start gap-3 px-4 py-3 rounded-sm border text-sm',
              'shadow-2xl animate-slide-up',
              colors[t.type]
            )}
          >
            <Icon size={15} className="mt-0.5 shrink-0" />
            <span className="flex-1">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
