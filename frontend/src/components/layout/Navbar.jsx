import { Bell, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore.js'
import { useAuthStore } from '../../store/authStore.js'
import clsx from 'clsx'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { activeDatasetId, setActiveDataset, datasets } = useAppStore()
  const navigate = useNavigate()
  const [datasetOpen, setDatasetOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const datasetRef = useRef(null)
  const userRef = useRef(null)

  const activeDataset = datasets.find((d) => d.id === activeDatasetId)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (datasetRef.current && !datasetRef.current.contains(e.target)) {
        setDatasetOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header className="h-14 bg-surface border-b border-white/5 flex items-center px-4 md:px-6 gap-4 shrink-0">
      {/* Dataset selector */}
      <div ref={datasetRef} className="relative">
        <button
          onClick={() => setDatasetOpen(!datasetOpen)}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm',
            'border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5',
            'transition-all duration-150 text-zinc-300'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
          <span className="max-w-[140px] truncate">
            {activeDataset?.name || 'Select dataset'}
          </span>
          <ChevronDown size={13} className="text-zinc-600 shrink-0" />
        </button>

        {datasetOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-surface border border-white/10 rounded-sm shadow-2xl z-50 py-1 animate-fade-in">
            {datasets.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-zinc-500">
                No datasets — upload one first
              </div>
            ) : (
              datasets.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => {
                    setActiveDataset(ds.id)
                    setDatasetOpen(false)
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm',
                    'hover:bg-white/5 transition-colors',
                    activeDatasetId === ds.id
                      ? 'text-white'
                      : 'text-zinc-400'
                  )}
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      activeDatasetId === ds.id ? 'bg-white' : 'bg-zinc-600'
                    )}
                  />
                  <span className="truncate">{ds.name}</span>
                  {ds.rows && (
                    <span className="ml-auto text-xs text-zinc-600">
                      {ds.rows.toLocaleString()}r
                    </span>
                  )}
                </button>
              ))
            )}
            <div className="border-t border-white/5 mt-1 pt-1">
              <button
                onClick={() => {
                  navigate('/datasets')
                  setDatasetOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Manage datasets →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Notification bell */}
      <button className="p-1.5 rounded-sm text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all relative">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
      </button>

      {/* User menu */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => setUserOpen(!userOpen)}
          className="flex items-center gap-2 p-1 rounded-sm hover:bg-white/5 transition-all"
        >
          <div className="w-7 h-7 rounded-sm bg-white/10 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
            {initials}
          </div>
        </button>

        {userOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-52 bg-surface border border-white/10 rounded-sm shadow-2xl z-50 py-1 animate-fade-in">
            <div className="px-3 py-2.5 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
