import { AnimatePresence, motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/stores'
import { cn } from '@/lib/utils'

/** Callers must position it (e.g. `absolute right-3 top-3`); `cn` does not merge conflicting classes. */
export default function WishlistButton({ dressId, name, className, showLabel = false }: { dressId: string; name: string; className?: string; showLabel?: boolean }) {
  const saved = useWishlistStore((s) => s.ids.includes(dressId))
  const toggle = useWishlistStore((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={() => toggle(dressId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved dresses` : `Save ${name}`}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ivory/85 text-burgundy shadow-sm backdrop-blur transition-colors hover:bg-ivory',
        showLabel ? 'px-4' : 'w-11',
        className,
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
        <Heart className="size-5" strokeWidth={1.6} fill={saved ? 'currentColor' : 'none'} aria-hidden />
      </motion.span>
      {showLabel && <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>}
      <AnimatePresence>
        {saved && (
          <motion.span
            key="ring"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-burgundy-soft"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.7, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          />
        )}
      </AnimatePresence>
    </button>
  )
}
