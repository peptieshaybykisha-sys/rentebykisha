/** Hand-drawn boutique furnishings for either side of the entrance: floor-to-ceiling drapes, a gold garment rack of gowns,
 *  an ottoman, side table, a gilded mirror and flowers. Pure inline SVG/CSS, so it needs no image files and scales with the viewport.
 *  Light falls from the doorway outward, so every piece is lit on its door-facing side and throws a soft shadow away from it. */

import { Lady, ShoppingBags } from './Lady'
import { Mirror } from './Mirror'

const GOLD = 'url(#sd-gold)'
const SHADOW = 'drop-shadow(5px 9px 9px rgba(90,16,37,0.30)) drop-shadow(1px 2px 2px rgba(90,16,37,0.25))'

function Defs() {
  return (
    <defs>
      <filter id="sd-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.45" />
      </filter>
      <linearGradient id="sd-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff0b8" />
        <stop offset="0.5" stopColor="#c9a45c" />
        <stop offset="1" stopColor="#8f6f2a" />
      </linearGradient>
      {/* tubular brass: dark edge, bright highlight, dark edge */}
      <linearGradient id="sd-brass-h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7a5c19" />
        <stop offset="0.35" stopColor="#fff1bd" />
        <stop offset="0.65" stopColor="#d4ae5a" />
        <stop offset="1" stopColor="#6e5116" />
      </linearGradient>
      <linearGradient id="sd-brass-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff1bd" />
        <stop offset="0.45" stopColor="#c9a45c" />
        <stop offset="1" stopColor="#6e5116" />
      </linearGradient>
      <radialGradient id="sd-rose" cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#fff1f3" />
        <stop offset="0.55" stopColor="#f2b6c6" />
        <stop offset="1" stopColor="#d97c98" />
      </radialGradient>
      <radialGradient id="sd-white" cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#efd9d6" />
      </radialGradient>
      <linearGradient id="sd-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9ab86e" />
        <stop offset="1" stopColor="#4f7035" />
      </linearGradient>
      <linearGradient id="sd-cushion" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbeaea" />
        <stop offset="0.6" stopColor="#ecc9cc" />
        <stop offset="1" stopColor="#cf9ea4" />
      </linearGradient>
      <linearGradient id="sd-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.5" stopColor="#f4eae6" stopOpacity="0.7" />
        <stop offset="1" stopColor="#d9c9c4" stopOpacity="0.8" />
      </linearGradient>
      {/* folds across a hanging gown: shade, then a satin highlight, then shade again */}
      <linearGradient id="sd-fold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3a0f1c" stopOpacity="0.32" />
        <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="0.55" stopColor="#3a0f1c" stopOpacity="0.08" />
        <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="1" stopColor="#3a0f1c" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id="sd-hem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a0f1c" stopOpacity="0" />
        <stop offset="1" stopColor="#3a0f1c" stopOpacity="0.25" />
      </linearGradient>
      <radialGradient id="sd-contact" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#3a0f1c" stopOpacity="0.45" />
        <stop offset="1" stopColor="#3a0f1c" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

type Style = 'princess' | 'mermaid' | 'empire' | 'slip' | 'tiered' | 'pleated'

type GownSpec = {
  x: number
  style: Style
  light: string
  mid: string
  dark: string
  h: number
}

const g_rnd = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

type Op = ['L', number, number] | ['C', number, number, number, number, number, number]

/** The cut of each dress: neckline (left corner, top edge, right corner), the right-hand side down to the hem as path ops,
 *  the hem's scallop count and depth, the waist line and half-widths at given depths (used to place folds and sparkles). */
function cut(style: Style, h: number) {
  switch (style) {
    case 'princess':
      return {
        leftTop: [-9.5, 18], top: 'C-7 15.5 -4 17 -2.4 19.5 Q0 22.5 2.4 19.5 C4 17 7 15.5 9.5 18', rightTop: [9.5, 18],
        ops: [['L', 5.8, 29], ['L', 4.2, 34], ['C', 7, 46, 18, 82, 25, h]] as Op[],
        hem: [25, 6, 3.5], wy: 34, wide: [[18, 9], [29, 5.8], [34, 4.2], [60, 11], [100, 18], [h, 25]],
      }
    case 'mermaid':
      return {
        leftTop: [-5.4, 17], top: 'L0 30 L5.4 17', rightTop: [5.4, 17],
        ops: [['C', 5.4, 24, 4.6, 30, 4.3, 36], ['C', 7, 52, 6.2, 84, 5, 98], ['C', 5, 116, 15, 132, 17, h]] as Op[],
        hem: [17, 5, 4.5], wy: 36, wide: [[17, 5.4], [36, 4.3], [60, 6.4], [98, 5], [h, 17]],
      }
    case 'empire':
      return {
        leftTop: [-6, 17], top: 'L6 17', rightTop: [6, 17],
        ops: [['L', 5.4, 26], ['C', 6.5, 44, 12, 100, 17.5, h]] as Op[],
        hem: [17.5, 4, 2.6], wy: 26, wide: [[17, 6], [26, 5.2], [60, 8.5], [h, 17.5]],
      }
    case 'slip':
      return {
        leftTop: [-5, 17], top: 'Q0 27 5 17', rightTop: [5, 17],
        ops: [['L', 4.3, 36], ['C', 5.2, 62, 7.5, 112, 10.8, h]] as Op[],
        hem: [10.8, 2, 2], wy: 36, wide: [[17, 5], [36, 4.3], [80, 6.5], [h, 10.8]],
      }
    case 'tiered':
      return {
        leftTop: [-5, 17], top: 'L0 26 L5 17', rightTop: [5, 17],
        ops: [['L', 4.3, 35], ['C', 7, 52, 12, 92, 20, h]] as Op[],
        hem: [20, 6, 3], wy: 35, wide: [[17, 5], [35, 4.3], [84, 9.4], [h, 20]],
      }
    default:
      return {
        leftTop: [-4.4, 17], top: 'L5.8 27.5', rightTop: [5.8, 27.5],
        ops: [['L', 4.3, 35], ['C', 6, 54, 12, 102, 15.5, h]] as Op[],
        hem: [15.5, 3, 1.6], wy: 35, wide: [[17, 5], [35, 4.3], [70, 10], [h, 15.5]],
      }
  }
}

/** Half-width of the dress at depth y, interpolated from the cut's table. */
function halfWidth(table: number[][], y: number) {
  for (let i = 1; i < table.length; i++) {
    if (y <= table[i][0]) {
      const [y0, w0] = table[i - 1]
      const [y1, w1] = table[i]
      return w0 + ((w1 - w0) * (y - y0)) / (y1 - y0)
    }
  }
  return table[table.length - 1][1]
}

/** A scalloped hem running right to left from (hx, h). */
function hemWave(hx: number, n: number, amp: number, h: number) {
  let d = ''
  let prev = hx
  for (let i = 1; i <= n; i++) {
    const x = hx - (2 * hx * i) / n
    d += ` Q${(prev + x) / 2} ${h + amp} ${x} ${h}`
    prev = x
  }
  return d
}

/** Closed outline, mirrored left/right; the one-shoulder cut sets its own left corner. */
function outline(style: Style, h: number, grow = 0) {
  const c = cut(style, h)
  const start = [c.leftTop[0], c.leftTop[1]]
  const widen = (v: number) => (v > 0 ? v + grow : v)
  const ops = c.ops.map((o) => (o[0] === 'L' ? (['L', widen(o[1]), o[2]] as Op) : (['C', widen(o[1]), o[2], widen(o[3]), o[4], widen(o[5]), o[6]] as Op)))
  let d = `M${start[0]} ${start[1]} ${c.top}`
  for (const o of ops) d += o[0] === 'L' ? ` L${o[1]} ${o[2]}` : ` C${o.slice(1).join(' ')}`
  d += hemWave(widen(c.hem[0]), c.hem[1], c.hem[2], h)
  let sx = c.rightTop[0]
  let sy = c.rightTop[1]
  const starts: number[][] = []
  for (const o of ops) {
    starts.push([sx, sy])
    sx = o[0] === 'L' ? o[1] : o[5]
    sy = o[0] === 'L' ? o[2] : o[6]
  }
  for (let i = ops.length - 1; i >= 0; i--) {
    const o = ops[i]
    d += o[0] === 'L' ? ` L${-starts[i][0]} ${starts[i][1]}` : ` C${-o[3]} ${o[4]} ${-o[1]} ${o[2]} ${-starts[i][0]} ${starts[i][1]}`
  }
  return d + ` L${start[0]} ${start[1]}Z`
}

/** Panels of cloth running waist to hem, alternately lit and shaded: this is what makes a skirt read as fabric with weight. */
function gores(style: Style, h: number, n: number) {
  const c = cut(style, h)
  const ww = halfWidth(c.wide, c.wy)
  const hh = halfWidth(c.wide, h) * 0.97
  const lit: string[] = []
  const shade: string[] = []
  for (let k = 0; k < n; k++) {
    const t0 = k / n
    const t1 = (k + 1) / n
    const wx0 = -ww + 2 * ww * t0
    const wx1 = -ww + 2 * ww * t1
    const hx0 = -hh + 2 * hh * t0
    const hx1 = -hh + 2 * hh * t1
    const bow = (hx0 - wx0) * 0.12
    const q = `M${wx0} ${c.wy} C${wx0 + bow} ${c.wy + (h - c.wy) * 0.4} ${hx0 - bow} ${c.wy + (h - c.wy) * 0.8} ${hx0} ${h} L${hx1} ${h} C${hx1 - bow} ${c.wy + (h - c.wy) * 0.8} ${wx1 + bow} ${c.wy + (h - c.wy) * 0.4} ${wx1} ${c.wy}Z`
    ;(k % 2 ? shade : lit).push(q)
  }
  return { lit: lit.join(' '), shade: shade.join(' ') }
}

/** Soft vertical gleam down a satin skirt. */
const sheen = (wy: number, h: number, x = -3) => `M${x} ${wy} C${x - 1} ${h * 0.5} ${x - 2} ${h * 0.8} ${x - 3} ${h} L${x + 3} ${h} C${x + 4} ${h * 0.8} ${x + 4} ${h * 0.5} ${x + 3} ${wy}Z`

const STRAPS: Record<Style, string> = {
  princess: '',
  mermaid: 'M-4.6 17.2 L-4.2 8.8 M4.6 17.2 L4.2 8.8',
  empire: '',
  slip: 'M-4.6 18 L-4.3 8.8 M4.6 18 L4.3 8.8',
  tiered: 'M-4.7 17.4 L-1.7 8.8 M4.7 17.4 L1.7 8.8',
  pleated: 'M-4.4 17 L-4.2 8.8',
}

/** One gown on a wooden hanger, hooked to the rail at (x, 0). Every dress is its own cut, with folds, depth and a cast shadow. */
function Gown({ spec, seed }: { spec: GownSpec; seed: number }) {
  const { x, style, light, mid, dark, h } = spec
  const id = `gw${seed}`
  const c = cut(style, h)
  const body = outline(style, h)
  const g = gores(style, h, style === 'pleated' ? 18 : style === 'slip' ? 4 : style === 'empire' ? 7 : 8)
  const sparkle: [number, number][] = []
  if (style === 'princess' || style === 'mermaid') {
    for (let i = 0; i < (style === 'mermaid' ? 70 : 38); i++) {
      const y = 20 + (h - 24) * g_rnd(seed * 13 + i)
      sparkle.push([(g_rnd(seed * 7 + i * 5) * 2 - 1) * (halfWidth(c.wide, y) - 1), y])
    }
  }
  const tiers = style === 'tiered' ? [[126, h, 3], [112, 134, 3], [98, 120, 2.8], [84, 106, 2.6]] : []
  return (
    <g transform={`translate(${x} 0)`} style={{ filter: 'drop-shadow(1.6px 3px 2px rgba(48,14,24,0.42))' }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.3" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* hook, and the wooden hanger */}
      <path d="M0 0 V-5 a2.2 2.2 0 1 1 2.2 -2.2" fill="none" stroke={GOLD} strokeWidth="1.2" />
      <path d="M-9 15.5 L-1.4 6.5 Q0 5.5 1.4 6.5 L9 15.5" fill="none" stroke="#8f6238" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-8.6 14.8 L-1.2 6.8 M1.2 6.8 L8.6 14.8" fill="none" stroke="#e6c294" strokeWidth="0.8" strokeLinecap="round" opacity="0.85" />
      {STRAPS[style] && <path d={STRAPS[style]} stroke={dark} strokeWidth={style === 'pleated' ? 1.6 : style === 'tiered' ? 2 : 1} strokeLinecap="round" />}
      {style === 'empire' && <path d="M-4.6 17 L-4.4 8.8 M4.6 17 L4.4 8.8" stroke={mid} strokeWidth="2.4" strokeLinecap="round" />}
      {/* tulle: sheer underskirts that make a princess gown billow */}
      {style === 'princess' && (
        <>
          <path d={outline(style, h, 4.5)} fill={light} opacity="0.5" />
          <path d={outline(style, h, 2.2)} fill={light} opacity="0.7" />
        </>
      )}
      {/* the dress */}
      <path d={body} fill={`url(#${id}-g)`} />
      <g clipPath={`url(#${id}-c)`}>
        <path d={g.lit} fill="#fff" opacity={style === 'pleated' ? 0.2 : 0.17} />
        <path d={g.shade} fill="#2a0612" opacity={style === 'pleated' ? 0.2 : 0.16} />
        <rect x="-30" y="16" width="60" height={h} fill="url(#sd-fold)" opacity="0.6" />
        <rect x="-30" y={h - 30} width="60" height="34" fill="url(#sd-hem)" />
        {(style === 'slip' || style === 'mermaid' || style === 'empire') && <path d={sheen(c.wy, h, style === 'slip' ? -2 : -3.4)} fill="#fff" opacity={style === 'slip' ? 0.4 : 0.26} />}
        {/* cast shadow of the bodice on the skirt */}
        <ellipse cx="0" cy={c.wy + 1.5} rx="9" ry="2.4" fill="#2a0612" opacity="0.2" />
      </g>
      {/* tiers */}
      {tiers.map(([y0, y1, amp], i) => {
        const wt = halfWidth(c.wide, y0) - 0.2
        const wb = halfWidth(c.wide, y1) + 1.6
        const tier = `M${-wt} ${y0} L${wt} ${y0} L${wb} ${y1}${hemWave(wb, 6, amp, y1)} Z`
        return (
          <g key={i}>
            <path d={tier} transform="translate(0 2.2)" fill="#2a0612" opacity="0.22" />
            <path d={tier} fill={`url(#${id}-g)`} stroke={dark} strokeOpacity="0.5" strokeWidth="0.4" />
            <path d={tier} fill="url(#sd-fold)" opacity="0.7" />
            <path d={`M${-wt} ${y0 + 0.8} H${wt}`} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
            <path d={`M${-wt} ${y0 + 2.2} H${wt}`} stroke={dark} strokeOpacity="0.35" strokeWidth="1.6" strokeDasharray="1 1.3" />
          </g>
        )
      })}
      {/* outline: a fine dark edge so each dress stays crisp against its neighbours */}
      <path d={body} fill="none" stroke={dark} strokeOpacity="0.55" strokeWidth="0.55" strokeLinejoin="round" />
      {/* style details */}
      {style === 'princess' && (
        <>
          <ellipse cx="-9.4" cy="19.8" rx="3.6" ry="2.4" fill={mid} stroke={dark} strokeOpacity="0.5" strokeWidth="0.4" />
          <ellipse cx="9.4" cy="19.8" rx="3.6" ry="2.4" fill={mid} stroke={dark} strokeOpacity="0.5" strokeWidth="0.4" />
          <path d="M-3 22 L-3.6 33 M0 23 V34 M3 22 L3.6 33" stroke={dark} strokeOpacity="0.4" strokeWidth="0.5" />
          <path d={`M${-4.4} ${c.wy} H4.4`} stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {style === 'empire' && (
        <>
          <path d="M-5.6 26 H5.6" stroke={dark} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
          <path d="M-5.6 25.2 H5.6" stroke="#fff" strokeWidth="0.6" opacity="0.55" />
          <g transform="translate(2.6 27)">
            <path d="M0 0 C-5 -3 -7 2 -3 3 C-1 3.4 0 1 0 0Z M0 0 C5 -3 7 2 3 3 C1 3.4 0 1 0 0Z" fill={dark} />
            <path d="M-1 2 C-3 9 -2 16 -5 22 M1 2 C3 9 2 17 5 24" stroke={dark} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <circle r="1.3" fill={mid} />
          </g>
          <path d="M-5 17.5 C-3 22 -2 24 -1 26 M0 17.5 V26 M5 17.5 C3 22 2 24 1 26" stroke={dark} strokeOpacity="0.4" strokeWidth="0.5" />
        </>
      )}
      {style === 'slip' && <path d="M-3.8 18.4 C-2 24 2 24 3.8 18.4 M-3 20 C-1.6 25 1.6 25 3 20" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" fill="none" />}
      {style === 'mermaid' && (
        <>
          <path d={`M${-17} ${h - 12} L17 ${h - 12}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.7" />
          <path d="M-5 20 L0 30 L5 20" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" fill="none" />
        </>
      )}
      {style === 'pleated' && (
        <>
          <path d="M-4.4 17 L5.8 27.5" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" />
          <path d="M-4.3 35 H4.3" stroke={dark} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <circle cx="-1" cy="35" r="1.8" fill={GOLD} />
        </>
      )}
      {style === 'tiered' && (
        <>
          <g clipPath={`url(#${id}-c)`} stroke={dark} strokeOpacity="0.55" strokeWidth="0.5">
            {Array.from({ length: 9 }, (_, k) => -14 + k * 2.6).map((x0) => (
              <path key={x0} d={`M${x0} 19 L${x0 + 13} 32 M${x0 + 13} 19 L${x0} 32`} />
            ))}
          </g>
          <path d="M0 37 C-4 58 -4 78 0 92 C4 78 4 58 0 37Z" fill="#2a0612" opacity="0.16" />
          <rect x="-4.7" y="32.4" width="9.4" height="3.6" rx="0.8" fill={dark} opacity="0.9" />
          <rect x="-4.7" y="32.4" width="9.4" height="0.9" rx="0.4" fill="#fff" opacity="0.5" />
        </>
      )}
      {sparkle.map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={style === 'mermaid' ? 0.5 : 0.8} fill={i % 3 ? '#fff7e0' : '#ffd9a0'} opacity={style === 'mermaid' ? 0.8 : 0.7} />
      ))}
    </g>
  )
}

const RACK: GownSpec[] = [
  { x: 75, style: 'pleated', light: '#c4607a', mid: '#8a2f4a', dark: '#42112a', h: 144 },
  { x: 92, style: 'slip', light: '#fff1d6', mid: '#e8d0a4', dark: '#a8895a', h: 148 },
  { x: 109, style: 'princess', light: '#fdeaee', mid: '#f1bccb', dark: '#c4809a', h: 140 },
  { x: 126, style: 'empire', light: '#ecdde6', mid: '#b79bab', dark: '#6f536a', h: 146 },
  { x: 143, style: 'mermaid', light: '#bfe8dc', mid: '#5fb39c', dark: '#24665a', h: 146 },
  { x: 159, style: 'tiered', light: '#fde9a6', mid: '#f4c04e', dark: '#b4791d', h: 148 },
]
// back to front: outer gowns first, the full princess gown last so it hangs in front
const GOWNS = [0, 5, 1, 4, 3, 2]


/** Left of the doorway: a gold rack of gowns. */
export function LeftSuite({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <svg viewBox="56 158 114 198" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 size-full overflow-visible" fill="none" style={{ filter: SHADOW }}>
        <Defs />
        {/* contact shadows on the floor */}
        <ellipse cx="112" cy="346" rx="64" ry="7" fill="url(#sd-contact)" />
        {/* rack: round brass tube, lit down the centre */}
        <rect x="64" y="176" width="4.5" height="158" rx="2" fill="url(#sd-brass-h)" />
        <rect x="153.5" y="176" width="4.5" height="158" rx="2" fill="url(#sd-brass-h)" />
        <rect x="60" y="174.5" width="102" height="4.5" rx="2.2" fill="url(#sd-brass-v)" />
        <rect x="64" y="330" width="94" height="3" rx="1.5" fill="url(#sd-brass-v)" />
        {[66, 156].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="340" r="5" fill="url(#sd-brass-v)" />
            <circle cx={cx} cy="340" r="1.8" fill="#6e5116" />
            <circle cx={cx - 1.2} cy="338.6" r="1.1" fill="#fff8d8" opacity="0.9" />
          </g>
        ))}
        {/* gowns: seven cuts and fabrics, the showpiece ball gown hung last so it sits in front */}
        <g transform="translate(0 178)">
          {GOWNS.map((i) => (
            <Gown key={i} spec={RACK[i]} seed={i + 1} />
          ))}
        </g>
      </svg>
    </div>
  )
}

/** A round faux-fur pouf: a fuzzy silhouette, plush strands on the top that fan out from the centre, and strands combed downward on the side. */
function FurPouf() {
  const cx = 50
  const topY = 140
  const rx = 31
  const ry = 7.4
  const botY = 157
  // silhouette: back rim, right side, front bottom arc, left side, each point nudged outward for a shaggy edge
  const pts: [number, number][] = []
  for (let a = Math.PI; a <= 2 * Math.PI; a += 0.09) pts.push([cx + rx * Math.cos(a), topY + ry * Math.sin(a)])
  for (let y = topY; y <= botY; y += 1.6) pts.push([cx + rx, y])
  for (let a = 0; a <= Math.PI; a += 0.09) pts.push([cx + rx * Math.cos(a), botY + ry * Math.sin(a)])
  for (let y = botY; y >= topY; y -= 1.6) pts.push([cx - rx, y])
  const shaggy = pts.map(([x, y], i) => {
    const out = 0.3 + 1.5 * g_rnd(i * 3.1)
    return [x + (x - cx) * (out / rx), y + (y - (topY + botY) / 2) * (out / 14)] as [number, number]
  })
  const outline = `M${shaggy.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')}Z`
  const LIGHT = '#fffaf6'
  const MID = '#f5dcdc'
  const SHADE = '#d9aab4'
  const strands: { d: string; c: string; o: number; w: number }[] = []
  const strand = (x: number, y: number, ang: number, len: number, seed: number, shadeBias: number) => {
    const bend = (g_rnd(seed + 7) - 0.5) * 1.6
    const ex = x + Math.cos(ang) * len
    const ey = y + Math.sin(ang) * len
    const cxm = (x + ex) / 2 - Math.sin(ang) * bend
    const cym = (y + ey) / 2 + Math.cos(ang) * bend
    const r = g_rnd(seed + 13)
    strands.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cxm.toFixed(1)} ${cym.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, c: r < 0.3 + shadeBias * 0.2 ? SHADE : r < 0.7 ? MID : LIGHT, o: 0.42 + 0.38 * g_rnd(seed + 29), w: 0.28 + 0.22 * g_rnd(seed + 41) })
  }
  for (let i = 0; i < 620; i++) {
    const r = Math.sqrt(g_rnd(i * 5 + 1))
    const th = g_rnd(i * 5 + 2) * Math.PI * 2
    const x = cx + rx * 0.97 * r * Math.cos(th)
    const y = topY + ry * 0.97 * r * Math.sin(th)
    strand(x, y, Math.atan2(Math.sin(th) * ry, Math.cos(th) * rx) + (g_rnd(i * 5 + 3) - 0.5) * 0.9, 1.8 + 1.8 * g_rnd(i * 5 + 4), i * 11, r)
  }
  for (let i = 0; i < 1100; i++) {
    const x = cx - rx + 2 * rx * g_rnd(i * 7 + 100)
    const edge = Math.abs(x - cx) / rx
    const frontTop = topY + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2))
    const y = frontTop + (botY - frontTop + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2))) * g_rnd(i * 7 + 101)
    strand(x, y, Math.PI / 2 + (g_rnd(i * 7 + 102) - 0.5) * 0.8 + (x - cx) * 0.012, 2 + 2.2 * g_rnd(i * 7 + 103), i * 17 + 3, edge + (y - frontTop) / 14)
  }
  // a longer fringe where the top meets the side, and round the base
  for (let i = 0; i < 150; i++) {
    const a = (i / 149) * Math.PI
    strand(cx + rx * Math.cos(a), topY + ry * Math.sin(a), Math.PI / 2 + (g_rnd(i * 3) - 0.5) * 0.7 + Math.cos(a) * 0.35, 2.4 + 1.8 * g_rnd(i * 3 + 1), i * 23 + 5, 0.4)
    strand(cx + rx * Math.cos(a), botY + ry * Math.sin(a), Math.PI / 2 + (g_rnd(i * 3 + 2) - 0.5) * 0.7 + Math.cos(a) * 0.4, 2.2 + 1.8 * g_rnd(i * 3 + 3), i * 29 + 9, 1)
  }
  return (
    <g>
      <defs>
        <linearGradient id="fp-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8e8e6" />
          <stop offset="1" stopColor="#d7a9b2" />
        </linearGradient>
        <linearGradient id="fp-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a3e4c" stopOpacity="0.4" />
          <stop offset="0.22" stopColor="#7a3e4c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.78" stopColor="#7a3e4c" stopOpacity="0" />
          <stop offset="1" stopColor="#7a3e4c" stopOpacity="0.46" />
        </linearGradient>
        <radialGradient id="fp-top" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fffbf8" />
          <stop offset="1" stopColor="#f0d3d3" />
        </radialGradient>
        <clipPath id="fp-clip">
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill="url(#fp-side)" />
      <g clipPath="url(#fp-clip)">
        <rect x={cx - rx - 3} y={topY} width={2 * rx + 6} height={botY - topY + ry + 3} fill="url(#fp-round)" />
        <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="url(#fp-top)" />
        <path d={`M${cx - rx} ${topY + 1} Q${cx} ${topY + ry * 2.1} ${cx + rx} ${topY + 1} L${cx + rx} ${topY + 6} L${cx - rx} ${topY + 6}Z`} fill="#7a3e4c" opacity="0.1" />
      </g>
      {strands.map((s, i) => (
        <path key={i} d={s.d} stroke={s.c} strokeOpacity={s.o} strokeWidth={s.w} strokeLinecap="round" fill="none" />
      ))}
    </g>
  )
}

/** Right of the doorway: a round faux-fur pouf. */
export function RightSuite({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <svg viewBox="6 140 120 222" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 size-full overflow-visible" fill="none" style={{ filter: SHADOW }}>
        <Defs />
        <ellipse cx="52" cy="352" rx="38" ry="5" fill="url(#sd-contact)" />
        {/* a gilded standing mirror behind her, with her reflection */}
        <Mirror />
        <g transform="translate(1 189)">
          <FurPouf />
        </g>
        {/* the lady stands on the pouf as her plinth; her feet sit on its top at y = 332 */}
        <Lady transform="translate(52 332) scale(0.82)" />
        <ShoppingBags />
      </svg>
    </div>
  )
}
