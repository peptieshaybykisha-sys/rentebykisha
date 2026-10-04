import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthShell from '@/components/common/AuthShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { sleep } from '@/lib/utils'

const schema = z.object({ email: z.string().min(1, 'Please enter your email.').email('That email does not look right.') })

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  return (
    <AuthShell title="Reset Password">
      {sent ? (
        <Notice tone="success">If an account exists for that email, we have sent a link to reset your password.</Notice>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async () => {
            await sleep(600)
            setSent(true)
          })}
        >
          <p className="text-muted">Enter your email and we will send you a link to choose a new password.</p>
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-8 text-center">
        <Link to="/login" className="link-underline text-burgundy">
          ← Back to login
        </Link>
      </p>
    </AuthShell>
  )
}
