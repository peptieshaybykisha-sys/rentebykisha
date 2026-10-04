import { motion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'
import './door.css'

/** A glazed section: pebbled glass divided by bevelled mullions. */
function Glazing({ cols, rows, className }: { cols: number; rows: number; className: string }) {
  return (
    <div className={cn('dr-glazing', className)} style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <div key={i} className="dr-pane" />
      ))}
    </div>
  )
}

/** One leaf of the boutique door: painted wood, glazing, raised panels and brass. `side` decides the hinge. */
export default function Door({ side, angle, shade, fade }: { side: 'left' | 'right'; angle: MotionValue<number>; shade: MotionValue<number>; fade: MotionValue<number> }) {
  const left = side === 'left'
  const rotateY = useTransform(angle, (a) => (left ? a : -a))
  return (
    <motion.div
      aria-hidden
      className={cn('dr-leaf absolute inset-y-0 w-1/2 [backface-visibility:hidden]', left ? 'dr-leaf--left left-0 origin-left' : 'dr-leaf--right right-0 origin-right')}
      style={{ rotateY, opacity: fade }}
    >
      <div className="dr-meeting" style={left ? { right: 0 } : { left: 0 }} />
      {/* transom glass, cropped by the arch */}
      <Glazing cols={2} rows={2} className="inset-x-[7%] top-[3%] h-[19%]" />
      <div className="dr-rail top-[24.5%] h-[2%]" />
      {/* tall glazed section */}
      <Glazing cols={2} rows={4} className="inset-x-[10%] top-[29.5%] h-[38%]" />
      {/* raised panels */}
      <div className="dr-panel top-[70%] h-[5.5%]" />
      <div className="dr-panel top-[78%] h-[18%]">
        <div className="dr-panel__field" />
      </div>
      {/* hinges */}
      {[0.14, 0.5, 0.86].map((t) => (
        <div key={t} className="dr-hinge" style={{ top: `${t * 100}%`, [left ? 'left' : 'right']: '0.6%' }} />
      ))}
      {/* ornate brass pull */}
      <div className="dr-pull" style={{ top: '62%', [left ? 'right' : 'left']: '5%' }} />
      <motion.div className="absolute inset-0 bg-[#3a1a14]" style={{ opacity: shade }} />
    </motion.div>
  )
}

const RINGS = ['#fbf3f2', '#e2cdce', '#fdf8f7', '#d9c2c4', '#f4d3d7']

/** Plaster architrave around the arch: concentric mouldings, keystone and pilasters. Sits behind the doorway. */
export function DoorFrame() {
  return (
    <div aria-hidden className="dr-frame -inset-[2.4rem]">
      {RINGS.map((c, i) => (
        <div key={c} className="dr-ring" style={{ ['--c' as string]: c, inset: `${i * 0.45}rem` }} />
      ))}
      <div className="dr-keystone" />
      <div className="dr-pilaster hidden md:block" style={{ left: '-2.6rem' }} />
      <div className="dr-pilaster hidden md:block" style={{ right: '-2.6rem' }} />
    </div>
  )
}
