import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useToastStore } from '@/stores'

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+0.75rem)] z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-burgundy py-2 pl-4 pr-2 text-ivory shadow-lift"
          >
            <Check className="size-4 shrink-0 text-gold" aria-hidden />
            <span className="text-[0.95rem]">{t.message}</span>
            {t.to && (
              <Link to={t.to.href} onClick={() => dismiss(t.id)} className="whitespace-nowrap rounded-full bg-blush-soft px-3 py-1.5 text-sm font-medium text-burgundy">
                {t.to.label}
              </Link>
            )}
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid size-9 place-items-center rounded-full hover:bg-burgundy-soft">
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
