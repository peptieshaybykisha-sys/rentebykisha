import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

const control =
  'w-full rounded-xl border border-line bg-ivory px-4 min-h-12 text-base text-ink placeholder:text-muted/60 transition-colors focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50/40'

interface FieldShell {
  label: string
  error?: string
  hint?: string
  className?: string
}

function Shell({ id, label, error, hint, className, children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}

const describe = (id: string, error?: string, hint?: string) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldShell>(function Input(
  { label, error, hint, className, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <input ref={ref} id={id} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={control} {...rest} />
    </Shell>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldShell>(
  function Textarea({ label, error, hint, className, ...rest }, ref) {
    const id = useId()
    return (
      <Shell id={id} label={label} error={error} hint={hint} className={className}>
        <textarea
          ref={ref}
          id={id}
          rows={3}
          aria-invalid={!!error}
          aria-describedby={describe(id, error, hint)}
          className={cn(control, 'py-3')}
          {...rest}
        />
      </Shell>
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldShell>(function Select(
  { label, error, hint, className, children, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <select ref={ref} id={id} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={control} {...rest}>
        {children}
      </select>
    </Shell>
  )
})
