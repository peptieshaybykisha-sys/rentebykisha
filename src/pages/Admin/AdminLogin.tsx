import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NotConfigured } from '@/components/admin/AdminShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { isFirebaseConfigured } from '@/lib/firebase'
import { adminSignIn, startAdminAuth, useAdmin } from '@/stores/admin'

const schema = z.object({ email: z.string().email('Enter your admin email.'), password: z.string().min(1, 'Enter your password.') })

export default function AdminLogin() {
  const { ready, uid } = useAdmin()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  useEffect(() => {
    void startAdminAuth()
  }, [])

  if (ready && uid) return <Navigate to="/admin" replace />

  return (
    <div className="grid min-h-svh place-items-center bg-cream px-5 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-ivory p-7 sm:p-10">
        <p className="font-script-title text-3xl text-burgundy-soft">Renté by Kisha</p>
        <h1 className="text-5xl">Admin sign in</h1>
        <div className="mt-8">
          {!isFirebaseConfigured ? (
            <NotConfigured />
          ) : (
            <form
              noValidate
              className="space-y-5"
              onSubmit={handleSubmit(async (v) => {
                setError('')
                try {
                  await adminSignIn(v.email, v.password)
                } catch {
                  setError('That email and password do not match.')
                }
              })}
            >
              {error && <Notice>{error}</Notice>}
              <Input label="Email" type="email" autoComplete="username" error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
              <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
                Sign in
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
