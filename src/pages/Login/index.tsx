import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthShell from '@/components/common/AuthShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { login } from '@/lib/api'

const schema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('That email does not look right.'),
  password: z.string().min(1, 'Please enter your password.'),
})
type Values = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; reason?: string } | null
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: Values) => {
    setError('')
    try {
      await login(v.email, v.password)
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
    </AuthShell>
  )
}
