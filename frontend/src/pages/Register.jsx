import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from 'lucide-react'

import { authApi } from '../api/auth.js'
import { useAuthStore } from '../store/authStore.js'

import {
  toast,
  ToastContainer,
} from '../components/ui/Toast.jsx'

const schema = z.object({
  name: z.string().min(
    2,
    'Name must be at least 2 characters'
  ),

  email: z.string().email(
    'Invalid email address'
  ),

  password: z
    .string()
    .min(
      8,
      'Password must be at least 8 characters'
    ),
})

function PasswordStrength({
  password,
}) {

  const checks = [

    {
      label: '8+ characters',
      ok: password.length >= 8,
    },

    {
      label: 'Uppercase',
      ok: /[A-Z]/.test(password),
    },

    {
      label: 'Number',
      ok: /[0-9]/.test(password),
    },

    {
      label: 'Special character',
      ok: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const score =
    checks.filter(
      (c) => c.ok
    ).length

  if (!password) return null

  return (

    <div className="mt-3">

      <div className="flex gap-1">

        {[0, 1, 2, 3].map((i) => (

          <div
            key={i}
            className={`
              h-1
              flex-1
              rounded-full
              transition-all
              ${
                i < score
                  ? 'bg-white'
                  : 'bg-white/10'
              }
            `}
          />

        ))}

      </div>

      <div className="
        mt-3
        flex
        flex-wrap
        gap-3
      ">

        {checks.map((item) => (

          <div
            key={item.label}
            className={`
              flex
              items-center
              gap-1
              text-xs
              ${
                item.ok
                  ? 'text-zinc-300'
                  : 'text-zinc-600'
              }
            `}
          >

            <Check size={11} />

            {item.label}

          </div>

        ))}

      </div>

    </div>
  )
}

export default function Register() {

  const navigate =
    useNavigate()

  const { setAuth } =
    useAuthStore()

  const [loading, setLoading] =
    useState(false)

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver:
      zodResolver(schema),
  })

  const password =
    watch('password', '')

  const onSubmit = async (
    data
  ) => {

    setLoading(true)

    try {

      const payload = {

        full_name:
          data.name,

        email:
          data.email,

        password:
          data.password,

        organization: '',
      }

      console.log(
        'REGISTER PAYLOAD:',
        payload
      )

      const res =
        await authApi.register(
          payload
        )

      const responseData = res.data.data

setAuth(
  responseData.user,
  responseData.access_token
)

      toast.success(
        'Account created successfully'
      )

      navigate('/dashboard')

    } catch (err) {

      console.log(
        'REGISTER ERROR:',
        err.response?.data
      )

      let msg =
        'Registration failed'

      const detail =
        err.response?.data?.detail

      if (
        typeof detail ===
        'string'
      ) {

        msg = detail

      } else if (
        Array.isArray(detail)
      ) {

        msg =
          detail[0]?.msg ||
          'Validation error'

      } else if (
        err.response?.data
          ?.message
      ) {

        msg =
          err.response.data.message
      }

      toast.error(
        String(msg)
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="
      min-h-screen
      bg-[#050505]
      text-white
      flex
    ">

      <ToastContainer />

      {/* LEFT PANEL */}
      <div className="
        hidden
        lg:flex
        lg:w-1/2
        border-r
        border-white/5
        p-14
        flex-col
        justify-between
      ">

        <div>

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-5
              h-5
              bg-white
            " />

            <span className="
              text-sm
              font-medium
            ">
              Claralytics
            </span>

          </div>

        </div>

        <div className="
          max-w-md
        ">

          <h1 className="
            text-5xl
            font-semibold
            leading-tight
            tracking-tight
          ">
            Enterprise analytics
            built for intelligent
            operations.
          </h1>

          <p className="
            mt-6
            text-zinc-500
            leading-8
            text-lg
          ">
            Upload datasets,
            generate insights,
            forecast trends,
            and build analytics
            workflows powered
            by machine learning.
          </p>

        </div>

        <div className="
          border-t
          border-white/5
          pt-8
          space-y-4
        ">

          {[
            'Advanced analytics engine',
            'AI-powered insights',
            'Enterprise-grade dashboards',
          ].map((item) => (

            <div
              key={item}
              className="
                flex
                items-center
                gap-3
                text-zinc-400
              "
            >

              <Check size={14} />

              {item}

            </div>

          ))}

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="
        flex-1
        flex
        items-center
        justify-center
        p-6
      ">

        <div className="
          w-full
          max-w-md
        ">

          <h2 className="
            text-4xl
            font-semibold
            tracking-tight
          ">
            Create account
          </h2>

          <p className="
            mt-3
            text-zinc-500
          ">
            Start building intelligent
            analytics workflows.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="
              mt-10
              space-y-5
            "
          >

            {/* NAME */}
            <div>

              <label className="
                text-sm
                text-zinc-400
              ">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                className="
                  w-full
                  mt-2
                  bg-[#0B0B0B]
                  border
                  border-white/10
                  px-4
                  py-3
                  outline-none
                  focus:border-white/20
                "
                {...register('name')}
              />

              {errors.name && (

                <p className="
                  text-red-400
                  text-xs
                  mt-2
                ">
                  {errors.name.message}
                </p>

              )}

            </div>

            {/* EMAIL */}
            <div>

              <label className="
                text-sm
                text-zinc-400
              ">
                Email
              </label>

              <input
                type="email"
                placeholder="you@company.com"
                className="
                  w-full
                  mt-2
                  bg-[#0B0B0B]
                  border
                  border-white/10
                  px-4
                  py-3
                  outline-none
                  focus:border-white/20
                "
                {...register('email')}
              />

              {errors.email && (

                <p className="
                  text-red-400
                  text-xs
                  mt-2
                ">
                  {errors.email.message}
                </p>

              )}

            </div>

            {/* PASSWORD */}
            <div>

              <label className="
                text-sm
                text-zinc-400
              ">
                Password
              </label>

              <div className="
                relative
                mt-2
              ">

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Minimum 8 characters"
                  className="
                    w-full
                    bg-[#0B0B0B]
                    border
                    border-white/10
                    px-4
                    py-3
                    pr-12
                    outline-none
                    focus:border-white/20
                  "
                  {...register(
                    'password'
                  )}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-500
                  "
                >

                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                </button>

              </div>

              {errors.password && (

                <p className="
                  text-red-400
                  text-xs
                  mt-2
                ">
                  {errors.password.message}
                </p>

              )}

              <PasswordStrength
                password={password}
              />

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                mt-3
                bg-white
                text-black
                py-3
                flex
                items-center
                justify-center
                gap-2
                hover:bg-zinc-200
                transition
              "
            >

              {loading ? (

                <div className="
                  w-4
                  h-4
                  border-2
                  border-black/30
                  border-t-black
                  rounded-full
                  animate-spin
                " />

              ) : (

                <>
                  Create Account
                  <ArrowRight size={15} />
                </>

              )}

            </button>

          </form>

          <p className="
            mt-8
            text-sm
            text-zinc-500
            text-center
          ">

            Already have an account?{' '}

            <Link
              to="/login"
              className="
                text-white
                hover:underline
              "
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  )
}