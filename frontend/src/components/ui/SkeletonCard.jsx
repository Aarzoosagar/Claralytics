export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-8 w-1/2 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full rounded" />
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 240 }) {
  return (
    <div className="card p-5">
      <div className="skeleton h-3 w-1/4 rounded mb-4" />
      <div className={`skeleton rounded`} style={{ height }} />
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  )
}
