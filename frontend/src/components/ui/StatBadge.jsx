import clsx from 'clsx'

export default function StatBadge({ label, value, variant = 'neutral' }) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-2.5 py-1.5 rounded-sm border text-xs',
        variant === 'neutral' && 'bg-white/3 border-white/5 text-zinc-400',
        variant === 'success' && 'bg-green-500/8 border-green-500/15 text-green-400',
        variant === 'warning' && 'bg-yellow-500/8 border-yellow-500/15 text-yellow-400',
        variant === 'danger' && 'bg-red-500/8 border-red-500/15 text-red-400'
      )}
    >
      <span className="text-zinc-600">{label}</span>
      <span className="font-semibold font-numeric">{value}</span>
    </div>
  )
}
