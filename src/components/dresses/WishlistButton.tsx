import { AnimatePresence, motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/stores'
import { cn } from '@/lib/utils'

export default function WishlistButton({ dressId, name, className }: { dressId: string; name: string; className?: string }) {
  const saved = useWishlistStore((s) => s.ids.includes(dressId))
  const toggle = useWishlistStore((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={() => toggle(dressId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved dresses` : `Save ${name}`}
      className={cn(
        'relative grid size-11 place-items-center rounded-full bg-ivory/85 text-burgundy shadow-sm backdrop-blur transition-colors hover:bg-ivory',
        className,
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
        <Heart className="size-5" strokeWidth={1.6} fill={saved ? 'currentColor' : 'none'} aria-hidden />
      </motion.span>
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
