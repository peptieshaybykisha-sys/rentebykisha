import type { ReactNode } from 'react'

/** A gilded arched cheval mirror in the same inline-SVG style as the rest of the boutique. Uses the brass gradients defined in SideDecor's <Defs />. */

const MX = 68 // centre line of the mirror
const W = 68 // outer width of the frame
const TOP = 190 // apex of the arch
const BOTTOM = 338
const R = W / 2
const FRAME = 4.6
const ARCH_Y = TOP + R // where the arch meets the straight sides

const outer = `M${MX - R} ${BOTTOM} V${ARCH_Y} A${R} ${R} 0 0 1 ${MX + R} ${ARCH_Y} V${BOTTOM}Z`
const glass = `M${MX - R + FRAME} ${BOTTOM - FRAME} V${ARCH_Y} A${R - FRAME} ${R - FRAME} 0 0 1 ${MX + R - FRAME} ${ARCH_Y} V${BOTTOM - FRAME}Z`
const bead = `M${MX - R + FRAME - 1} ${BOTTOM - FRAME + 1} V${ARCH_Y} A${R - FRAME + 1} ${R - FRAME + 1} 0 0 1 ${MX + R - FRAME + 1} ${ARCH_Y} V${BOTTOM - FRAME + 1}Z`
const midBand = `M${MX - R + 2.3} ${BOTTOM - 2} V${ARCH_Y} A${R - 2.3} ${R - 2.3} 0 0 1 ${MX + R - 2.3} ${ARCH_Y} V${BOTTOM - 2}Z`

function Post({ x, side }: { x: number; side: -1 | 1 }) {
  return (
    <g>
      {/* post, finial and the curled foot */}
      <rect x={x - 1.7} y={226} width="3.4" height={122} rx="1.5" fill="url(#sd-brass-h)" />
      <circle cx={x} cy={224} r="3" fill="url(#sd-brass-v)" />
      <circle cx={x - 0.9} cy={223} r="1" fill="#fff8d8" opacity="0.9" />
      <path d={`M${x - 3} 233 H${x + 3} M${x - 3} 300 H${x + 3}`} stroke="url(#sd-brass-v)" strokeWidth="1.6" strokeLinecap="round" />
      <path d={`M${x} 346 C${x + side * 7} 349 ${x + side * 11} 345 ${x + side * 8} 341 C${x + side * 6.4} 339.4 ${x + side * 4.6} 341 ${x + side * 5.6} 342.6`} stroke="url(#sd-brass-v)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx={x + side * 5.6} cy={342.8} r="1.6" fill="url(#sd-brass-v)" />
      {/* pivot knob joining the frame */}
      <path d={`M${x} 268 H${MX + side * (R - 1)}`} stroke="url(#sd-brass-v)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={x} cy={268} r="3" fill="url(#sd-brass-v)" />
      <circle cx={x} cy={268} r="1.2" fill="#6e5116" />
      <circle cx={x - 0.9} cy={267} r="0.9" fill="#fff8d8" opacity="0.9" />
    </g>
  )
}


export function Mirror({ reflection }: { reflection?: ReactNode }) {
  const studs = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (Math.PI * (i + 0.5)) / 9
    return [MX + (R - FRAME / 2 - 0.2) * Math.cos(a), ARCH_Y + (R - FRAME / 2 - 0.2) * Math.sin(a)] as [number, number]
  })
  return (
    <g>
      <defs>
        <clipPath id="mirror-glass">
          <path d={glass} />
        </clipPath>
        <linearGradient id="mirror-pane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fdf3f4" />
          <stop offset="0.55" stopColor="#f3dde1" />
          <stop offset="1" stopColor="#e3c8cf" />
        </linearGradient>
        <linearGradient id="mirror-glare" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mirror-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx={MX} cy="349" rx="46" ry="3.4" fill="url(#sd-contact)" />
      <Post x={MX - R - 6} side={-1} />
      <Post x={MX + R + 6} side={1} />

      {/* the glass */}
      <path d={glass} fill="url(#mirror-pane)" />
      <g clipPath="url(#mirror-glass)">
        <ellipse cx={MX + 4} cy="332" rx="26" ry="6" fill="#efc9d3" opacity="0.7" />
        {/* whatever stands in front of the glass, passed in by the scene */}
        {reflection}
        <rect x={MX - R} y={TOP} width={W} height={BOTTOM - TOP} fill="url(#mirror-fade)" />
        {/* glare */}
        <path d={`M${MX - 22} ${TOP} L${MX - 8} ${TOP} L${MX - 40} ${BOTTOM} L${MX - 54} ${BOTTOM}Z`} fill="url(#mirror-glare)" opacity="0.6" />
        <path d={`M${MX + 2} ${TOP} L${MX + 8} ${TOP} L${MX - 24} ${BOTTOM} L${MX - 30} ${BOTTOM}Z`} fill="url(#mirror-glare)" opacity="0.45" />
        {/* the frame casts a soft shadow just inside the glass */}
        <path d={glass} stroke="#7a3e4c" strokeOpacity="0.28" strokeWidth="2.4" fill="none" />
      </g>

      {/* gilded frame: carved band, beaded inner edge, studs and a highlight along the left */}
      <path d={`${outer} ${glass}`} fillRule="evenodd" fill="url(#sd-gold)" />
      <path d={midBand} stroke="#6e5116" strokeOpacity="0.55" strokeWidth="0.5" fill="none" />
      <path d={midBand} stroke="#fff1bd" strokeOpacity="0.75" strokeWidth="0.35" fill="none" transform="translate(-0.3 -0.3)" />
      <path d={bead} stroke="#fff1bd" strokeWidth="1" strokeDasharray="0.9 0.9" strokeLinecap="round" fill="none" />
      <path d={bead} stroke="#6e5116" strokeOpacity="0.5" strokeWidth="0.3" fill="none" />
      <path d={outer} stroke="#6e5116" strokeOpacity="0.8" strokeWidth="0.6" fill="none" />
      <path d={`M${MX - R + 0.9} ${BOTTOM - 4} V${ARCH_Y} A${R - 0.9} ${R - 0.9} 0 0 1 ${MX - 6} ${TOP + 1.6}`} stroke="#fff8d8" strokeOpacity="0.8" strokeWidth="0.7" strokeLinecap="round" fill="none" />
      {studs.map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r="0.9" fill="#fff1bd" stroke="#8f6f2a" strokeWidth="0.25" />
      ))}
      {[ARCH_Y + 22, ARCH_Y + 54, ARCH_Y + 86].map((y) =>
        [MX - R + FRAME / 2, MX + R - FRAME / 2].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#fff1bd" stroke="#8f6f2a" strokeWidth="0.25" />),
      )}
      {/* the carved crest: a fan of acanthus scrolls round a jewel */}
      <g transform={`translate(${MX} ${TOP + 1.5})`}>
        <path d="M0 -9 C-3.6 -6 -4.2 -2.4 0 1.2 C4.2 -2.4 3.6 -6 0 -9Z" fill="url(#sd-brass-v)" stroke="#6e5116" strokeWidth="0.3" />
        <path d="M-2 0 C-8 -3.6 -14 -1 -12.4 3.6 C-11.4 6.4 -7.6 5.6 -8.6 3 C-9.2 1.6 -10.6 2 -10.2 3" stroke="url(#sd-brass-v)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M2 0 C8 -3.6 14 -1 12.4 3.6 C11.4 6.4 7.6 5.6 8.6 3 C9.2 1.6 10.6 2 10.2 3" stroke="url(#sd-brass-v)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M-5 -2.6 C-8 -7 -12 -7 -14 -4 M5 -2.6 C8 -7 12 -7 14 -4" stroke="url(#sd-brass-v)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <circle cx="0" cy="-3.6" r="1.8" fill="url(#sd-rose)" stroke="#8f6f2a" strokeWidth="0.35" />
        <circle cx="-0.5" cy="-4.1" r="0.5" fill="#fff" opacity="0.9" />
      </g>
    </g>
  )
}
