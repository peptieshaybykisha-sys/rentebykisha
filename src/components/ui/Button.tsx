import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium tracking-wide transition-all duration-300 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

const variants = {
  primary: 'bg-burgundy text-ivory hover:bg-burgundy-soft shadow-soft',
  secondary: 'border border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-ivory hover:border-burgundy',
  soft: 'bg-blush-soft text-burgundy hover:bg-blush',
  ghost: 'text-burgundy hover:bg-blush-soft',
} as const

const sizes = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-6 text-[0.95rem]',
  lg: 'min-h-14 px-8 text-base',
} as const

type Common = { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string }

// eslint-disable-next-line react-refresh/only-export-components
export const buttonClass = ({ variant = 'primary', size = 'md', className }: Common = {}) =>
  cn(base, variants[variant], sizes[size], className)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Common & { loading?: boolean }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, loading, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, className })}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
})

export function ButtonLink({ variant, size, className, ...rest }: LinkProps & Common) {
  return <Link className={buttonClass({ variant, size, className })} {...rest} />
}
