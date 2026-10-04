import { AnimatePresence, motion } from 'motion/react'
import type { Dress } from '@/types'
import DressCard from './DressCard'

export default function DressGrid({ dresses }: { dresses: Dress[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      <AnimatePresence mode="popLayout" initial={false}>
        {dresses.map((d) => (
          <motion.li
            key={d.id}
            layout="position"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <DressCard dress={d} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
