import { motion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'

const PINK = 'bg-gradient-to-br from-[#f4d6d9] via-[#efc8cc] to-[#e9bcc1]'
const FROST =
  'bg-[radial-gradient(circle_at_20%_30%,#fff_0_1px,transparent_2px),radial-gradient(circle_at_70%_60%,#fff_0_1px,transparent_2px),linear-gradient(160deg,#fdf6f4,#efe3e1_60%,#f9efed)] [background-size:7px_7px,9px_9px,100%_100%]'
const RAISED =
  'rounded-[2px] border border-[#dca9b0]/70 shadow-[inset_0_0_0_3px_#f1cdd1,inset_0_0_0_4px_#dba5ac,inset_3px_3px_6px_rgba(150,70,85,0.18),0_1px_0_rgba(255,255,255,0.6)]'

/** A glazed section: frosted glass divided by pink mullions. */
function Glazing({ cols, rows, className }: { cols: number; rows: number; className?: string }) {
  return (
    <div
      className={cn('grid gap-[3px] rounded-[2px] bg-[#e2adb4] p-[3px] shadow-[inset_0_0_0_1px_#d79ca4,0_0_0_3px_#f1cdd1,0_0_0_4px_#dba5ac]', className)}
      style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <div key={i} className={cn(FROST, 'shadow-[inset_0_0_8px_rgba(190,120,130,0.25)]')} />
      ))}
    </div>
  )
}

/** One leaf of the boutique door: pink, frosted glazing, raised panels, gold hardware. `side` decides the hinge. */
export default function Door({ side, angle, shade, fade }: { side: 'left' | 'right'; angle: MotionValue<number>; shade: MotionValue<number>; fade: MotionValue<number> }) {
  const left = side === 'left'
  const rotateY = useTransform(angle, (a) => (left ? a : -a))
  return (
    <motion.div
      aria-hidden
      className={cn('absolute inset-y-0 w-1/2 [backface-visibility:hidden]', PINK, left ? 'left-0 origin-left' : 'right-0 origin-right')}
      style={{ rotateY, opacity: fade }}
    >
      <div className={cn('absolute inset-y-0 w-px bg-[#d79ca4]', left ? 'right-0' : 'left-0')} />
      {/* transom glass, cropped by the arch */}
      <Glazing cols={2} rows={2} className="absolute inset-x-[7%] top-[3%] h-[19%]" />
      <div className="absolute inset-x-0 top-[24%] h-[1.5%] bg-[#e4b0b7] shadow-[0_1px_0_#f8dde0]" />
      {/* tall glazed section */}
      <Glazing cols={2} rows={4} className="absolute inset-x-[10%] top-[29%] h-[38%]" />
      {/* raised panels */}
      <div className={cn('absolute inset-x-[10%] top-[70%] h-[5%]', RAISED)} />
      <div className={cn('absolute inset-x-[10%] top-[78%] h-[18%]', RAISED)}>
        <div className={cn('absolute inset-[16%]', RAISED)} />
      </div>
      {/* hinges */}
      {[0.14, 0.5, 0.86].map((t) => (
        <div
          key={t}
          className={cn('absolute h-[4%] w-[1.6%] rounded-[1px] bg-gradient-to-r from-[#e4c987] via-gold to-[#9a7a35]', left ? 'left-[1%]' : 'right-[1%]')}
          style={{ top: `${t * 100}%` }}
        />
      ))}
      {/* ornate gold pull */}
      <div
        className={cn(
          'absolute top-[62%] h-[19%] w-[5%] min-w-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#9a7a35] via-[#f0d68f] to-[#a8842f] shadow-[0_3px_6px_rgba(90,16,37,0.35)]',
          left ? 'right-[4%]' : 'left-[4%]',
        )}
      />
      <motion.div className="absolute inset-0 bg-[#3a1a14]" style={{ opacity: shade }} />
    </motion.div>
  )
}

/** Burgundy bow and gold chains from which the sign hangs. */
export function HangingBow() {
  return (
    <svg viewBox="0 0 120 70" className="relative z-10 mx-auto -mb-1 h-14 w-24 md:h-16 md:w-28" aria-hidden focusable="false">
      <g stroke="#d9b765" strokeWidth="1.4" strokeDasharray="1.5 3.5" strokeLinecap="round">
        <path d="M52 34 46 70" />
        <path d="M68 34 74 70" />
      </g>
      <g fill="#4a0d1d" stroke="#2c0610" strokeWidth="0.8">
        <path d="M60 24C48 4 14 2 12 18c-1 16 32 14 48 6Z" />
        <path d="M60 24C72 4 106 2 108 18c1 16-32 14-48 6Z" />
        <path d="M56 28 44 56l14-8 3 9zM64 28l12 28-14-8-3 9z" />
        <rect x="53" y="17" width="14" height="14" rx="5" />
      </g>
      <path d="M58 22C44 10 26 8 20 14M62 22c14-12 32-14 38-8" fill="none" stroke="#a8556a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
