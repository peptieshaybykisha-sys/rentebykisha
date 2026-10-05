import type { CSSProperties } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'
import './door.css'

/** One leaf of the boutique door: marbled pink paint, shaped raised panels with gold fillets and brass. `side` decides the hinge. */
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
      {/* tall panel with the shaped "cathedral" head, then the lower panel */}
      <div className="dr-panel dr-panel--top">
        <div className="dr-panel__field" />
      </div>
      <div className="dr-panel dr-panel--bottom">
        <div className="dr-panel__field" />
      </div>
      {/* hinges */}
      {[0.14, 0.5, 0.86].map((t) => (
        <div key={t} className="dr-hinge" style={{ top: `${t * 100}%`, [left ? 'left' : 'right']: '0.6%' }} />
      ))}
      {/* brass lever handle on the meeting stile */}
      <div className="dr-pull" style={{ top: '57%', [left ? 'right' : 'left']: '5.5%' }} />
      <motion.div className="absolute inset-0 bg-[#3a1a14]" style={{ opacity: shade }} />
    </motion.div>
  )
}

/** Fixed gold-leaf fanlight that fills the arch above the doors. */
export function Fanlight({ fade }: { fade: MotionValue<number> }) {
  return (
    <motion.div aria-hidden className="dr-fanlight aspect-[2/1] w-full flex-none" style={{ opacity: fade }}>
      <svg viewBox="0 0 200 100" className="size-full" fill="none" strokeLinecap="round">
        <defs>
          <linearGradient id="dr-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0b8" />
            <stop offset="0.5" stopColor="#c9a45c" />
            <stop offset="1" stopColor="#8f6f2a" />
          </linearGradient>
          <g id="dr-orn" stroke="url(#dr-gold)" strokeWidth="1.5">
            <path d="M100 94 C92 80 80 76 68 66 C58 58 60 44 72 46 C82 48 80 60 72 58" />
            <path d="M100 95 C84 92 66 90 52 78 C40 68 42 52 54 54 C62 56 60 66 52 64" />
            <path d="M100 97 C74 98 46 94 28 80 C18 72 20 58 31 60 C39 62 37 72 30 70" />
            <path d="M84 74 C80 66 84 58 90 56 C92 64 90 70 84 74Z" fill="url(#dr-gold)" strokeWidth="0.6" />
            <path d="M62 84 C56 78 56 70 62 65 C66 71 66 78 62 84Z" fill="url(#dr-gold)" strokeWidth="0.6" />
            <circle cx="72" cy="52" r="1.8" fill="url(#dr-gold)" strokeWidth="0" />
          </g>
        </defs>
        <use href="#dr-orn" />
        <use href="#dr-orn" transform="translate(200 0) scale(-1 1)" />
        {/* central palmette */}
        <path d="M100 98 V40" stroke="url(#dr-gold)" strokeWidth="1.5" />
        <path d="M100 36 C89 47 89 66 100 78 C111 66 111 47 100 36Z" fill="url(#dr-gold)" opacity="0.92" />
        <path d="M100 44 V72" stroke="#fff0b8" strokeWidth="0.7" opacity="0.8" />
        <circle cx="100" cy="30" r="2.4" fill="url(#dr-gold)" />
      </svg>
    </motion.div>
  )
}

/** The cathedral-curved gap above a leaf, filled with painted wall so the head of the door reads as shaped. */
export function Spandrel({ side, fade }: { side: 'left' | 'right'; fade: MotionValue<number> }) {
  return <motion.div aria-hidden className={cn('dr-spandrel', side === 'left' ? 'dr-spandrel--left' : 'dr-spandrel--right')} style={{ opacity: fade }} />
}

/* ---------- climbing roses ---------- */

function Bloom({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.55} cy={Math.sin((a * Math.PI) / 180) * r * 0.55} r={r * 0.62} fill="url(#dr-petal)" />
      ))}
      <circle r={r * 0.46} fill="#e0728f" />
      <circle r={r * 0.2} fill="#c24c70" />
    </g>
  )
}

function Leaf({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  return <ellipse cx={x} cy={y} rx={6 * s} ry={2.6 * s} transform={`rotate(${rot} ${x} ${y})`} fill="url(#dr-leafg)" />
}

/* A rose vine spiralling up ONE column. x swings across the 2rem shaft as y climbs; where the stem is crossing the face it is drawn
   solid with leaves and buds, and where it passes round the back it is a faint line, so it reads as wrapped round the stone.
   Sized to match the fine vines on the wall: small three-leaf sets, tiny buds, a few small open roses. */
const W = 32
const H = 380
const PERIOD = 78
const hx = (y: number, ph: number) => W / 2 + 14.5 * Math.sin(((y + ph) / PERIOD) * Math.PI * 2)
const facing = (y: number, ph: number) => Math.cos(((y + ph) / PERIOD) * Math.PI * 2) > 0
const rnd = (n: number) => {
  const v = Math.sin(n * 127.1) * 43758.5453
  return v - Math.floor(v)
}

function buildVine(ph: number) {
  const front: string[] = []
  const back: string[] = []
  for (let y = 0; y <= H; y += 2) {
    const target = facing(y, ph) ? front : back
    const cmd = target.length && facing(y - 2, ph) === facing(y, ph) ? 'L' : 'M'
    target.push(`${cmd}${hx(y, ph).toFixed(1)} ${y}`)
  }
  const leaves: { x: number; y: number; rot: number; s: number }[] = []
  const buds: { x: number; y: number; r: number; open: boolean }[] = []
  for (let y = 6, i = 0; y < H; y += 8, i++) {
    if (!facing(y, ph)) continue
    const dx = hx(y + 1, ph) - hx(y - 1, ph)
    const tangent = (Math.atan2(2, dx) * 180) / Math.PI
    const side = i % 2 ? 1 : -1
    leaves.push({
      x: hx(y, ph),
      y,
      rot: tangent + side * (50 + rnd(i + ph) * 25),
      s: 0.8 + rnd(i + 30 + ph) * 0.35,
    })
    if (i % 4 === 1)
      buds.push({
        x: hx(y, ph) - side * 3.4,
        y: y - 1,
        r: i % 8 === 1 ? 4.2 : 2.6,
        open: i % 8 === 1,
      })
  }
  return { front: front.join(' '), back: back.join(' '), leaves, buds }
}
const VINES = [buildVine(0), buildVine(31)]

function LeafSet({ x, y, rot, s }: { x: number; y: number; rot: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[-40, 0, 40].map((ang, i) => (
        <g key={ang} transform={`rotate(${ang})`}>
          <path
            d={i === 1 ? 'M0 0 C2 -2 5 -2 8 0 C5 2 2 2 0 0Z' : 'M0 0 C1.6 -1.6 4 -1.6 6.4 0 C4 1.6 1.6 1.6 0 0Z'}
            fill={i === 1 ? 'url(#dr-leafg)' : 'url(#dr-leafd)'}
            stroke="#2c4a22"
            strokeOpacity="0.3"
            strokeWidth="0.25"
          />
        </g>
      ))}
    </g>
  )
}

/** A rose vine twined round one column. Pass the column's own offset via style. */
export function ColumnVine({ className, style, variant = 0 }: { className?: string; style?: CSSProperties; variant?: 0 | 1 }) {
  const v = VINES[variant]
  return (
    <div aria-hidden className={cn('overflow-hidden', className)} style={style}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="size-full" style={{ filter: 'drop-shadow(1px 1.5px 1px rgba(40,18,22,0.3))' }} fill="none">
        <path d={v.back} stroke="#5d5a33" strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d={v.front} stroke="#5d5a33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {v.leaves.map((l) => (
          <LeafSet key={l.y} {...l} />
        ))}
        {v.buds.map((b) => (
          <g key={b.y}>
            {b.open ? (
              <>
                {[0, 72, 144, 216, 288].map((r) => (
                  <circle key={r} cx={b.x + Math.cos((r * Math.PI) / 180) * b.r * 0.55} cy={b.y + Math.sin((r * Math.PI) / 180) * b.r * 0.55} r={b.r * 0.55} fill="#e9a9b3" />
                ))}
                <circle cx={b.x} cy={b.y} r={b.r * 0.35} fill="#c4687c" />
              </>
            ) : (
              <>
                <circle cx={b.x} cy={b.y} r={b.r} fill="#f0b4c2" />
                <circle cx={b.x - 0.5} cy={b.y - 0.5} r={b.r * 0.45} fill="#fbe0e6" />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

/** A spray of roses spilling over the shoulder of the arch. */
function Garland({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 160 90" className={className} fill="none">
      <path d="M4 70 C30 70 40 40 70 38 S112 30 130 8" stroke="#6f8f4a" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 52 C48 66 62 70 74 66" stroke="#6f8f4a" strokeWidth="1.4" strokeLinecap="round" />
      {[
        [16, 66, -20],
        [30, 56, -50],
        [50, 44, 30],
        [64, 52, 60],
        [82, 38, -30],
        [98, 44, 40],
        [114, 24, -40],
        [126, 14, 20],
        [58, 68, 25],
      ].map(([x, y, r]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} rot={r} s={1.15} />
      ))}
      {[
        [24, 62, 6],
        [58, 42, 7.5],
        [86, 36, 6.5],
        [112, 28, 5.5],
        [132, 12, 4.5],
        [72, 64, 4.5],
      ].map(([x, y, r]) => (
        <Bloom key={`${x}-${y}`} x={x} y={y} r={r} />
      ))}
    </svg>
  )
}

const RINGS = [
  [2.2, '#ecdfc9'],
  [1.7, '#d9c9ae'],
  [1.25, '#f6efe1'],
  [0.8, '#d4c3a6'],
  [0.4, '#efe2cb'],
  [0.12, '#c9a45c'],
] as const

function Column({ style }: { style: CSSProperties }) {
  return <div className="dr-column" style={style} />
}

/** Stone surround behind the doorway: concentric archivolts, keystone, entablature, paired fluted columns and climbing roses.
 *  It fills the same box as the doorway and uses the same "half-disc then doors" split so the arch springs exactly where the doors begin. */
export function DoorFrame() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col">
      <div className="relative aspect-[2/1] w-full flex-none">
        {RINGS.map(([d, c]) => (
          <div
            key={c}
            className="dr-ring dr-stone"
            style={{
              ['--c' as string]: c,
              top: `-${d}rem`,
              left: `-${d}rem`,
              right: `-${d}rem`,
              bottom: 0,
            }}
          />
        ))}
        <div className="dr-keystone dr-stone" />
        <Garland className="absolute -left-12 -top-5 z-[3] w-40" />
        <Garland className="absolute -right-12 -top-5 z-[3] w-40 -scale-x-100" />
        {/* entablature at the springing line */}
        <div className="dr-cornice dr-stone hidden md:block" style={{ left: '-7.4rem' }} />
        <div className="dr-cornice dr-stone hidden md:block" style={{ right: '-7.4rem' }} />
      </div>
      <div className="relative min-h-0 flex-1">
        {(['left', 'right'] as const).map((s) => (
          <div key={s} className="hidden md:block">
            <div className="dr-plinth dr-stone" style={{ [s]: '-7.4rem' }} />
            <Column style={{ [s]: '-7rem' }} />
            <Column style={{ [s]: '-4.5rem' }} />
            <ColumnVine variant={0} className="absolute bottom-[1.6rem] top-[3rem] z-[3] w-8" style={{ [s]: '-7rem' }} />
            <ColumnVine variant={1} className="absolute bottom-[1.6rem] top-[3rem] z-[3] w-8" style={{ [s]: '-4.5rem' }} />
          </div>
        ))}
      </div>
      {/* shared paint for the roses */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <radialGradient id="dr-petal" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#fde4ea" />
            <stop offset="1" stopColor="#ec8aa4" />
          </radialGradient>
          <linearGradient id="dr-leafd" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6f9a52" />
            <stop offset="1" stopColor="#2f5a2c" />
          </linearGradient>
          <radialGradient id="dr-rosed" cx="0.38" cy="0.32" r="0.8">
            <stop offset="0" stopColor="#f6cfd0" />
            <stop offset="0.6" stopColor="#dc9aa0" />
            <stop offset="1" stopColor="#bd6a76" />
          </radialGradient>
          <linearGradient id="dr-leafg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9ab86e" />
            <stop offset="1" stopColor="#5f8240" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
