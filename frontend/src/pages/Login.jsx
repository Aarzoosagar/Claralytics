import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authApi } from '../api/auth.js'
import { useAuthStore } from '../store/authStore.js'
import { toast } from '../components/ui/Toast.jsx'
import { ToastContainer } from '../components/ui/Toast.jsx'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: true },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      })
      const responseData =
  res.data.data

setAuth(
  responseData.user,
  responseData.access_token,
  data.rememberMe
)
      navigate('/dashboard')
    } catch (err) {
      let msg = 'Invalid credentials'

const detail =
  err.response?.data?.detail

if (typeof detail === 'string') {

  msg = detail

} else if (Array.isArray(detail)) {

  msg =
    detail[0]?.msg ||
    'Validation error'

} else if (
  err.response?.data?.message
) {

  msg =
    err.response.data.message
}

toast.error(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <ToastContainer />

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-white/5 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="2" y="16" width="3" height="6" fill="white" />
              <rect x="8" y="11" width="3" height="11" fill="white" />
              <rect x="14" y="6" width="3" height="16" fill="white" />
              <rect x="20" y="2" width="3" height="20" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Claralytics</span>
        </div>

        {/* Center quote */}
        <div className="max-w-sm">
          <blockquote className="text-3xl font-bold tracking-tight leading-tight text-white mb-4">
            "Precision analytics for teams that move fast."
          </blockquote>
          <p className="text-sm text-zinc-500">
            Upload data, surface insights, forecast outcomes, and export
            board-ready reports in minutes.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
          {[
            { val: '2.4M+', label: 'Datasets analyzed' },
            { val: '98.4%', label: 'Data accuracy' },
            { val: '< 2s', label: 'Avg insight time' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-xl font-bold text-white font-numeric">{val}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-5 h-5">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="16" width="3" height="6" fill="white" />
                <rect x="8" y="11" width="3" height="11" fill="white" />
                <rect x="14" y="6" width="3" height="16" fill="white" />
                <rect x="20" y="2" width="3" height="20" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Claralytics</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 mb-8">
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={`input ${errors.email ? 'border-red-500/50' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded-[2px] border border-white/20 bg-transparent 
                             accent-white cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-zinc-500">Remember me</span>
              </label>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
