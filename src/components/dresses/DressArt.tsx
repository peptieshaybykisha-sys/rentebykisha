import { useId } from 'react'
import { shade } from '@/lib/utils'
import type { Dress, DressImage, Silhouette } from '@/types'

/**
 * Vector "photography" for the mock catalogue. Each dress is drawn on a boutique form so the
 * gallery, cards and showroom all feel like one shoot. Real photos can replace it via DressImage.src.
 */

interface Shape {
  body: string
  hem: number
  spread: number
  straps?: boolean
  sleeves?: boolean
  puff?: boolean
}

const SHAPES: Record<Silhouette, Shape> = {
  ballgown: {
    body: 'M92 80 Q120 96 148 80 L143 142 C195 185 222 270 232 336 Q120 352 8 336 C18 270 45 185 97 142 Z',
    hem: 336,
    spread: 110,
    straps: true,
  },
  mermaid: {
    body: 'M92 80 Q120 96 148 80 L144 140 C153 190 151 240 150 266 C176 292 192 318 200 340 Q120 352 40 340 C48 318 64 292 90 266 C89 240 87 190 96 140 Z',
    hem: 340,
    spread: 78,
    straps: true,
  },
  aline: {
    body: 'M92 80 Q120 94 148 80 L143 142 C168 205 190 275 202 336 Q120 346 38 336 C50 275 72 205 97 142 Z',
    hem: 336,
    spread: 76,
    straps: true,
  },
  column: {
    body: 'M95 78 Q120 92 145 78 L147 140 C152 200 152 285 154 338 Q120 345 86 338 C88 285 88 200 93 140 Z',
    hem: 338,
    spread: 28,
    straps: true,
  },
  mini: {
    body: 'M91 80 Q120 94 149 80 L143 140 C168 158 180 200 186 236 Q120 248 54 236 C60 200 72 158 97 140 Z',
    hem: 238,
    spread: 62,
    puff: true,
  },
  sleeved: {
    body: 'M90 72 Q120 84 150 72 L143 142 C168 205 190 275 202 336 Q120 346 38 336 C50 275 72 205 97 142 Z',
    hem: 336,
    spread: 76,
    sleeves: true,
  },
}

const VIEWBOX: Record<DressImage['view'], string> = {
  front: '-20 -4 280 373',
  studio: '-20 -4 280 373',
  bodice: '58 36 124 165',
  hem: '36 160 168 224',
}

interface Props {
  dress: Pick<Dress, 'art'>
  view?: DressImage['view']
  bare?: boolean
  className?: string
  title?: string
}

export default function DressArt({ dress, view = 'front', bare = false, className, title }: Props) {
  const uid = useId().replace(/:/g, '')
  const { color, silhouette, texture, accent } = dress.art
  const s = SHAPES[silhouette]
  const light = shade(color, 0.22)
  const dark = shade(color, -0.3)
  const isLight = parseInt(color.slice(1, 3), 16) > 200
  const hi = isLight ? '#ffffff' : shade(color, 0.55)
  const sparkle = isLight ? '#c9a45c' : '#ffffff'
  const folds = Array.from({ length: 9 }, (_, i) => i - 4)
  const full = view === 'front' || view === 'studio'

  return (
    <svg
      viewBox={VIEWBOX[view]}
      preserveAspectRatio={full ? 'xMidYMid meet' : 'xMidYMid slice'}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={`f${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.38" stopColor={light} />
          <stop offset="0.62" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`sh${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0.15" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.38" stopColor="#fff" stopOpacity={texture === 'satin' ? 0.4 : 0.14} />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`bg${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6e4e3" />
          <stop offset="1" stopColor="#fbf7f0" />
        </linearGradient>
        <linearGradient id={`vel${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <pattern id={`seq${uid}`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={sparkle} opacity="0.7" />
          <circle cx="5.5" cy="5.5" r="1" fill={sparkle} opacity="0.4" />
        </pattern>
        <pattern id={`lace${uid}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="4" fill="none" stroke={accent ?? '#c9a45c'} strokeOpacity="0.45" />
          <circle cx="8" cy="8" r="1.2" fill={accent ?? '#c9a45c'} opacity="0.5" />
          <circle cx="0" cy="0" r="1.2" fill="#fff" opacity="0.8" />
          <circle cx="16" cy="16" r="1.2" fill="#fff" opacity="0.8" />
        </pattern>
        <pattern id={`tul${uid}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3h6M3 0v6" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.5" />
        </pattern>
        <clipPath id={`c${uid}`}>
          <path d={s.body} />
        </clipPath>
      </defs>

      {/* backdrop */}
      {!bare && (
        <g>
          <rect x="-30" y="-10" width="300" height="390" fill={`url(#bg${uid})`} />
          {view === 'studio' && (
            <g>
              <path d="M10 360V120C10 62 60 24 120 24s110 38 110 96v240Z" fill="#fffaf2" stroke="#c9a45c" strokeOpacity="0.5" />
              <path d="M24 360V122C24 72 66 40 120 40s96 32 96 82v238Z" fill="none" stroke="#e9b7bc" strokeOpacity="0.6" />
              <g transform="translate(196 318)">
                <path d="M-10 30 L-6 0 H6 L10 30Z" fill="#e9b7bc" />
                {[-12, -3, 8, 0, -8].map((x, i) => (
                  <circle key={i} cx={x} cy={-4 - (i % 3) * 9} r={7 - (i % 2)} fill={i % 2 ? '#f6e4e3' : '#e9b7bc'} stroke="#d9949c" strokeOpacity="0.4" />
                ))}
                <path d="M0 0v-6" stroke="#6a8b62" />
              </g>
            </g>
          )}
        </g>
      )}
      <ellipse cx="120" cy="352" rx={s.spread + 10} ry="7" fill="#5a1025" opacity="0.12" />

      {/* mannequin stand */}
      <rect x="118.5" y={s.hem - 20} width="3" height={352 - s.hem + 20} fill="#b9954f" />
      <ellipse cx="120" cy="351" rx="34" ry="5" fill="#c9a45c" />
      <path d="M112 38c0-9 16-9 16 0v26h-16z" fill="#efe0d6" />
      <ellipse cx="120" cy="36" rx="9" ry="4" fill="#c9a45c" />
      <path d="M80 70c10-8 30-12 40-12s30 4 40 12l-6 20H86z" fill="#efe0d6" />

      {/* sleeves sit behind the bodice */}
      {s.sleeves && (
        <g fill={`url(#f${uid})`}>
          <path d="M90 72 L70 76 C64 110 60 150 58 172 L76 176 C84 140 90 112 96 90Z" />
          <path d="M150 72 L170 76 C176 110 180 150 182 172 L164 176 C156 140 150 112 144 90Z" />
        </g>
      )}
      {s.puff && (
        <g fill={`url(#f${uid})`}>
          <ellipse cx="86" cy="80" rx="15" ry="13" />
          <ellipse cx="154" cy="80" rx="15" ry="13" />
        </g>
      )}
      {s.straps && (
        <g stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M100 62 L98 82" />
          <path d="M140 62 L142 82" />
        </g>
      )}

      {/* the dress */}
      <path d={s.body} fill={`url(#f${uid})`} />
      <g clipPath={`url(#c${uid})`}>
        {folds.map((i) => {
          const x1 = 120 + (i / 4) * s.spread
          return (
            <path
              key={i}
              d={`M${120 + i * 3.5} 146 Q${120 + i * 8 + (i % 2 ? 6 : -6)} ${(146 + s.hem) / 2} ${x1} ${s.hem + 8}`}
              fill="none"
              stroke={i % 2 ? hi : dark}
              strokeOpacity={i % 2 ? 0.2 : 0.14}
              strokeWidth={i % 2 ? 4 : 3}
            />
          )
        })}
        <rect x="0" y="60" width="240" height="300" fill={`url(#sh${uid})`} />
        {texture === 'sequin' && <rect x="0" y="60" width="240" height="300" fill={`url(#seq${uid})`} />}
        {texture === 'lace' && <rect x="0" y="60" width="240" height="300" fill={`url(#lace${uid})`} />}
        {texture === 'tulle' && (
          <>
            <rect x="0" y="60" width="240" height="300" fill={`url(#tul${uid})`} />
            <path d={`M20 ${s.hem - 40}Q120 ${s.hem - 15} 220 ${s.hem - 40}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
            <path d={`M30 ${s.hem - 80}Q120 ${s.hem - 56} 210 ${s.hem - 80}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="2" fill="none" />
          </>
        )}
        {texture === 'velvet' && <rect x="0" y="60" width="240" height="300" fill={`url(#vel${uid})`} />}
        {texture === 'chiffon' && <rect x="0" y="60" width="240" height="300" fill="#fff" opacity="0.1" />}
      </g>

      {/* neckline and waist details */}
      <path d={s.sleeves ? 'M90 72 Q120 84 150 72' : 'M92 80 Q120 96 148 80'} fill="none" stroke={hi} strokeOpacity="0.6" strokeWidth="1.4" />
      <path d="M97 142 Q120 148 143 142" fill="none" stroke={dark} strokeOpacity="0.35" strokeWidth="1.5" />
      {accent && (
        <g transform="translate(120 142)" fill={accent} stroke={shade(accent, -0.25)} strokeOpacity="0.5" strokeWidth="0.8">
          <path d="M0 0C-8-10-20-9-20-1c0 8 12 8 20 1Z" />
          <path d="M0 0C8-10 20-9 20-1c0 8-12 8-20 1Z" />
          <path d="M-2 3l-7 14 7-4 2 6zM2 3l7 14-7-4-2 6z" />
          <circle r="3.2" />
        </g>
      )}
    </svg>
  )
}
