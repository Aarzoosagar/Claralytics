import { create } from 'zustand'

const TOKEN_KEY = 'claralytics_token'
const USER_KEY = 'claralytics_user'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token, remember = true) => {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.setItem(TOKEN_KEY, token)
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },

  hydrate: () => {
    const token =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    const userRaw =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw)
        set({ user, token, isAuthenticated: true })
      } catch {
        // corrupted storage
      }
    }
  },
}))
