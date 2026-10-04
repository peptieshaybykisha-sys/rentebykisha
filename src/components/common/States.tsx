import { AlertCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/Button'

interface EmptyProps {
  icon?: LucideIcon
  title: string
  to?: string
  cta?: string
  children?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, to, cta, children, className }: EmptyProps) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center', className)}>
      {Icon && (
        <div className="mb-6 grid size-16 place-items-center rounded-full bg-blush-soft text-burgundy">
          <Icon className="size-7" strokeWidth={1.4} aria-hidden />
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-muted">{children}</p>}
      {to && cta && (
        <Link to={to} className="link-underline mt-6 text-lg font-medium text-burgundy">
          {cta} →
        </Link>
      )}
    </div>
  )
}

export function ErrorState({ title, children, to, cta, className }: Omit<EmptyProps, 'icon'>) {
  return (
    <div role="alert" className={cn('mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center', className)}>
      <AlertCircle className="mb-5 size-10 text-burgundy-soft" strokeWidth={1.3} aria-hidden />
      <h1 className="text-4xl">{title}</h1>
      {children && <p className="mt-3 text-muted">{children}</p>}
      {to && cta && (
        <ButtonLink to={to} className="mt-8">
          {cta}
        </ButtonLink>
      )}
    </div>
  )
}

/** Inline message used in forms and checkout. */
export function Notice({
  tone = 'error',
  children,
  className,
}: {
  tone?: 'error' | 'success' | 'info'
  children: ReactNode
  className?: string
}) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    info: 'border-blush bg-blush-soft/70 text-burgundy',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-2xl border px-4 py-3 text-[0.95rem]', tones[tone], className)}>
      {children}
    </div>
  )
}
