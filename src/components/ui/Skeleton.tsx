import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/** A softly pulsing placeholder shaped like the content that is about to appear. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-xl bg-blush/40', className)} />
}

/** Wrap placeholder groups so screen readers announce loading once, not every block. */
function Busy({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function DressCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[3/4] rounded-[1.75rem]" />
      <Skeleton className="mt-4 h-7 w-4/5" />
      <Skeleton className="mt-2 h-4 w-2/5" />
      <Skeleton className="mt-4 h-5 w-1/3" />
    </div>
  )
}

export function DressGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Busy label="Loading dresses…" className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {Array.from({ length: count }, (_, i) => (
        <DressCardSkeleton key={i} />
      ))}
    </Busy>
  )
}

export function FeaturedRowSkeleton() {
  return (
    <Busy label="Loading dresses…" className="flex gap-5 overflow-hidden px-5 pb-4 sm:px-8 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="w-[72vw] max-w-[21rem] shrink-0 sm:w-[21rem]">
          <DressCardSkeleton />
        </div>
      ))}
    </Busy>
  )
}

/** Stacked rows for lists of rentals, fittings, users and so on. */
export function ListSkeleton({ rows = 4, label = 'Loading…', className }: { rows?: number; label?: string; className?: string }) {
  return (
    <Busy label={label} className={cn('space-y-3', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="flex items-center gap-4 rounded-[1.75rem] border border-line bg-ivory p-4 sm:p-5">
          <Skeleton className="hidden h-24 w-20 shrink-0 sm:block" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </Busy>
  )
}

/** Detail pages: a heading block plus two content columns. */
export function DetailSkeleton({ label = 'Loading…' }: { label?: string }) {
  return (
    <Busy label={label} className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12">
      <Skeleton className="aspect-[3/4] rounded-[2rem]" />
      <div aria-hidden className="space-y-5">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-14 w-4/5" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="size-14 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    </Busy>
  )
}

/** Centered spinner for whole-page waits (checking a session, loading a route). */
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[60svh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-burgundy-soft">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <span className="text-sm text-muted">{label}</span>
      </div>
    </div>
  )
}
