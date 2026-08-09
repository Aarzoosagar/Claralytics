import { useEffect } from 'react'
import AppRouter from './router/index.jsx'
import { useAuthStore } from './store/authStore.js'

export default function App() {
  const { hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <AppRouter />
}
