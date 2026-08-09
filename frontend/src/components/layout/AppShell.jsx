import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import { useAppStore } from '../../store/appStore.js'
import { useDatasets } from '../../hooks/useDatasets.js'

export default function AppShell() {
  // Prefetch datasets on shell mount
  useDatasets()
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-200`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-6 md:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
