import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthShell from '@/components/common/AuthShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { updatePassword } from '@/lib/api'
import { useAuthStore } from '@/stores'

const schema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters.').regex(/\d/, 'Include at least one number.'),
    confirm: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' })

/** The emailed reset link signs the person in briefly; here they choose the new password. */
export default function ResetPassword() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  return (
    <AuthShell title="Choose a New Password">
      {ready && !user ? (
        <Notice>
          This reset link has expired or was already used.{' '}
          <Link to="/forgot-password" className="underline">
            Request a new one
          </Link>
          .
        </Notice>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async (v) => {
            setError('')
            try {
              await updatePassword(v.password)
              navigate('/account', { replace: true })
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
            }
          })}
        >
          {error && <Notice>{error}</Notice>}
          <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters, with a number." error={errors.password?.message} {...register('password')} />
          <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            Save new password
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
