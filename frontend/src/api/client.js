import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// ─── Request Interceptor ─────────────────────
apiClient.interceptors.request.use(
  (config) => {

    // Public routes
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
    ]

    const isPublicRoute =
      publicRoutes.some((route) =>
        config.url?.includes(route)
      )

    // Attach token ONLY for protected routes
    if (!isPublicRoute) {

      const token =
        localStorage.getItem(
          'claralytics_token'
        )

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`
      }
    }

    return config
  },

  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────
apiClient.interceptors.response.use(

  (response) => response,

  (error) => {

    // Auto logout on unauthorized
    if (error.response?.status === 401) {

      localStorage.removeItem(
        'claralytics_token'
      )

      localStorage.removeItem(
        'claralytics_user'
      )

      // Prevent redirect loop
      const currentPath =
        window.location.pathname

      if (
        currentPath !== '/login' &&
        currentPath !== '/register'
      ) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient