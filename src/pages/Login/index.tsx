import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthShell from '@/components/common/AuthShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { DEMO_LOGIN } from '@/constants/business'
import { login } from '@/lib/api'
import { useAuthStore } from '@/stores'

const schema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('That email does not look right.'),
  password: z.string().min(1, 'Please enter your password.'),
})
type Values = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; reason?: string } | null
  const setUser = useAuthStore((s) => s.setUser)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: Values) => {
    setError('')
    try {
      setUser(await login(v.email, v.password))
      navigate(state?.from ?? '/account', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <AuthShell title="Welcome Back">
      {state?.reason === 'auth' && <Notice tone="info" className="mb-5">Please log in to continue.</Notice>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <Notice>{error}</Notice>}
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="text-right">
          <Link to="/forgot-password" className="link-underline text-[0.95rem] text-burgundy">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Login
        </Button>
      </form>

      <p className="mt-8 text-center text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" state={state} className="link-underline font-medium text-burgundy">
          Create Account
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-gold/60 bg-cream p-4 text-sm text-muted">
        <p className="font-medium text-ink">Try the demo account</p>
        <p className="mt-1">
          {DEMO_LOGIN.email} · {DEMO_LOGIN.password}
        </p>
        <button
          type="button"
          className="link-underline mt-1 min-h-11 text-burgundy"
          onClick={() => {
            setValue('email', DEMO_LOGIN.email)
            setValue('password', DEMO_LOGIN.password)
          }}
        >
          Fill it in for me
        </button>
      </div>
    </AuthShell>
  )
}
