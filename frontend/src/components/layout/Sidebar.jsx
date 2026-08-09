import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Cpu,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore.js'
import { useAuthStore } from '../../store/authStore.js'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/predictions', icon: Cpu, label: 'Predictions' },
  { to: '/ai', icon: Sparkles, label: 'AI Insights' },
  { to: '/reports', icon: FileText, label: 'Reports' },
]

export default function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col h-screen bg-surface border-r border-white/5',
          'transition-all duration-200 ease-in-out shrink-0',
          collapsed ? 'w-14' : 'w-52'
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            'flex items-center h-14 px-4 border-b border-white/5 shrink-0',
            collapsed ? 'justify-center' : 'gap-2.5'
          )}
        >
          <div className="w-6 h-6 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="16" width="3" height="6" fill="white" />
              <rect x="8" y="11" width="3" height="11" fill="white" />
              <rect x="14" y="6" width="3" height="16" fill="white" />
              <rect x="20" y="2" width="3" height="20" fill="white" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-white tracking-tight">
              Claralytics
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-2 py-2 rounded-sm text-sm',
                  'transition-all duration-150 group',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={clsx(
                      'shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate font-medium">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/5 p-2 space-y-0.5 shrink-0">
          {/* User */}
          {!collapsed && user && (
            <div className="px-2 py-2 mb-1">
              <p className="text-xs font-medium text-white truncate">
                {user.name || user.email}
              </p>
              {user.organization && (
                <p className="text-xs text-zinc-600 truncate mt-0.5">
                  {user.organization}
                </p>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={clsx(
              'flex items-center gap-2.5 w-full px-2 py-2 rounded-sm text-sm',
              'text-zinc-500 hover:text-red-400 hover:bg-red-500/5',
              'transition-all duration-150',
              collapsed ? 'justify-center' : ''
            )}
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            className={clsx(
              'flex items-center gap-2.5 w-full px-2 py-2 rounded-sm text-sm',
              'text-zinc-600 hover:text-zinc-400 hover:bg-white/5',
              'transition-all duration-150',
              collapsed ? 'justify-center' : ''
            )}
          >
            {collapsed ? (
              <ChevronRight size={15} />
            ) : (
              <>
                <ChevronLeft size={15} />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-sm',
                  'transition-all duration-150',
                  isActive ? 'text-white' : 'text-zinc-600'
                )
              }
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
