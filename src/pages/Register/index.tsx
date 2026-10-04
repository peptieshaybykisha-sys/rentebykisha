import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthShell from '@/components/common/AuthShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { notify } from '@/lib/toast'
import { Input } from '@/components/ui/Field'
import { register as registerUser } from '@/lib/api'
import { phoneSchema } from '@/lib/validation'

const schema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name.'),
    email: z.string().min(1, 'Please enter your email.').email('That email does not look right.'),
    phone: phoneSchema,
    password: z.string().min(8, 'Use at least 8 characters.').regex(/\d/, 'Include at least one number.'),
    confirm: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' })
type Values = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ name, email, phone, password }: Values) => {
    setError('')
    try {
      const { needsConfirmation } = await registerUser({ name, email, phone, password })
      if (needsConfirmation) {
        setConfirmEmail(email)
        notify('Account created. Check your email to confirm it.')
      } else {
        notify('Account created. Welcome to Rente by Kisha!')
        navigate(from ?? '/account', { replace: true })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      toast.error(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  if (confirmEmail)
    return (
      <AuthShell title="Check Your Email" script="Almost there">
        <Notice tone="success">
          We sent a confirmation link to <strong>{confirmEmail}</strong>. Open it to activate your account, then log in.
        </Notice>
        <p className="mt-8 text-center">
          <Link to="/login" state={{ from }} className="link-underline font-medium text-burgundy">
            Go to login
          </Link>
        </p>
      </AuthShell>
    )

  return (
    <AuthShell title="Create Your Account" script="Welcome to Renté">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <Notice>{error}</Notice>}
        <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" type="tel" autoComplete="tel" placeholder="0917 123 4567" error={errors.phone?.message} {...register('phone')} />
        <Input label="Password" type="password" autoComplete="new-password" hint="At least 8 characters, with a number." error={errors.password?.message} {...register('password')} />
        <Input label="Confirm Password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Create Account
        </Button>
      </form>
      <p className="mt-8 text-center text-muted">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="link-underline font-medium text-burgundy">
          Login
        </Link>
      </p>
    </AuthShell>
  )
}
