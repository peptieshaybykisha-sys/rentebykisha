/** A hand-drawn fashion-illustration lady in a blush-pink mini dress, standing on the fur pouf, plus the shopping bags at her feet.
 *  Pure inline SVG (no image files). She faces the viewer and is built on the nine-head fashion croquis: with head height H = 16.6 and her feet at
 *  y = 0, the chin is at 1H, shoulders at 1⅓H, bust at 2H, waist and elbows at 3H, hips at 4H, knees at 6H and ankles at 8½H (y grows downward, x = 0 is her centre line).
 *  Lit from the left, the side the doorway is on. Colour ids are prefixed "lady-" / "bag-" to stay unique on the page. */

const SKIN_LIGHT = '#f7dcc6'
const SKIN_MID = '#eab99c'
const GOLD = '#c9a45c'

const wiggle = (n: number) => {
  const v = Math.sin(n * 91.7 + 17.3) * 9301.3
  return v - Math.floor(v)
}

function Defs() {
  return (
    <defs>
      <linearGradient id="lady-skin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f5d5bd" />
        <stop offset="0.5" stopColor="#f7dcc6" />
        <stop offset="1" stopColor="#dca98c" />
      </linearGradient>
      <radialGradient id="lady-face" cx="0.42" cy="0.42" r="0.7">
        <stop offset="0" stopColor="#fbe6d4" />
        <stop offset="0.6" stopColor="#f3cfb5" />
        <stop offset="1" stopColor="#dca98c" />
      </radialGradient>
      <linearGradient id="lady-leg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d8a384" />
        <stop offset="0.38" stopColor="#f9dfca" />
        <stop offset="0.66" stopColor="#edc2a6" />
        <stop offset="1" stopColor="#cb957a" />
      </linearGradient>
      <linearGradient id="lady-hair" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbefb9" />
        <stop offset="0.5" stopColor="#e9d089" />
        <stop offset="1" stopColor="#bf9c4c" />
      </linearGradient>
      <linearGradient id="lady-dress" x1="0" y1="0" x2="1" y2="0.1">
        <stop offset="0" stopColor="#fddbe6" />
        <stop offset="0.5" stopColor="#f4a9c0" />
        <stop offset="1" stopColor="#d4708f" />
      </linearGradient>
      <radialGradient id="lady-ruffle" cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#fff3f7" />
        <stop offset="1" stopColor="#ee9db7" />
      </radialGradient>
      <linearGradient id="lady-hair-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9ac5c" />
        <stop offset="1" stopColor="#9a7a34" />
      </linearGradient>
      <linearGradient id="lady-shoe" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5a4a4e" />
        <stop offset="0.4" stopColor="#241619" />
        <stop offset="1" stopColor="#0f0809" />
      </linearGradient>
    </defs>
  )
}

/** One leg, seen from the front: thigh, knee, calf and a fine ankle. This is the leg on her left (viewer's left); the other is its mirror. */
const LEG =
  'M-9.6 -80 C-9.8 -72 -8.6 -62 -6.6 -53 C-5.8 -50.6 -5.8 -48.4 -6 -46.4 C-6.8 -43 -7 -40.2 -6.6 -37 C-6 -31.6 -5.2 -22 -4.4 -14 C-4.2 -12 -4.2 -10.4 -4.4 -8.6 L-2.2 -8.6 C-2.2 -12 -1.9 -16 -1.8 -22 C-1.7 -30 -1.5 -38 -1.6 -44 C-1.7 -48 -1.5 -52 -1.3 -56 C-0.8 -64 -0.4 -72 0 -80Z'

/** A pointed pump seen from the front, toe towards us, with an ankle strap and a hint of toe cleavage. Drawn for the left foot. */
function Shoe() {
  return (
    <g>
      <path d="M-4.9 -8.6 C-5.5 -5 -5.7 -2.4 -4.9 -0.2 C-4.3 1 -3 1.1 -2.4 0.3 C-1.6 -1.4 -1.4 -5 -1.8 -8.6Z" fill="url(#lady-shoe)" />
      <path d="M-4.4 -2.6 Q-3.5 -1.2 -2.6 -2.6Z" fill={SKIN_MID} />
      <path d="M-4.2 -7 C-4.4 -5 -4.4 -3.6 -4 -2.4" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.45" strokeLinecap="round" fill="none" />
      <path d="M-5.1 -9.8 L-1.6 -9.8 L-1.6 -8.2 L-5.1 -8.2Z" fill="#150b0d" />
      <path d="M-3.4 -9.8 C-4.8 -11.2 -5.8 -10.4 -5 -9.4 C-4.4 -8.8 -3.8 -9.2 -3.4 -9.8Z M-3.4 -9.8 C-2 -11.2 -1 -10.4 -1.8 -9.4 C-2.4 -8.8 -3 -9.2 -3.4 -9.8Z" fill="#150b0d" />
    </g>
  )
}

const HEM_Y = -62
const SCALLOPS = 8
const HEM_X = 11.8
// scallops run from the right hem corner to the left one
const hem = (() => {
  let d = ''
  let prev = HEM_X
  for (let i = 1; i <= SCALLOPS; i++) {
    const x = HEM_X - (2 * HEM_X * i) / SCALLOPS
    d += ` Q${((prev + x) / 2).toFixed(2)} ${HEM_Y + 2.4} ${x.toFixed(2)} ${HEM_Y}`
    prev = x
  }
  return d
})()
/** Sweetheart strapless bodice, a pinched waist, then a fitted skirt that skims the hips. */
const DRESS = `M-9.2 -119.6 C-5.6 -122.4 -2.4 -121.4 0 -117.2 C2.4 -121.4 5.6 -122.4 9.2 -119.6 C10.6 -115 10.8 -111 9.6 -107.6 C8 -105 6.2 -102.4 5.4 -99.4 C5.8 -92 12 -89 12.4 -82.5 C12.6 -76 12.2 -68 ${HEM_X} ${HEM_Y}${hem} C-12.2 -68 -12.6 -76 -12.4 -82.5 C-12 -89 -5.8 -92 -5.4 -99.4 C-6.2 -102.4 -8 -105 -9.6 -107.6 C-10.8 -111 -10.6 -115 -9.2 -119.6Z`

const ARM_L =
  'M-12.6 -125.2 C-15.2 -124.8 -16.8 -122 -16.6 -118.6 C-16.4 -112 -16.8 -106 -16.8 -100.4 C-17 -94 -18.6 -88 -19 -80 L-16.6 -79.6 C-16 -86 -14.4 -93 -14 -100.4 C-13.6 -106 -12 -112 -11.4 -117.5 C-11.6 -121 -12 -123.6 -12.6 -125.2Z'
const ARM_R =
  'M12.6 -125.2 C15.2 -124.8 16.8 -122 16.6 -118.6 C16.4 -112 17 -106 17.4 -100.4 C17.8 -94 20 -88 21.6 -80.4 L19.2 -79.8 C18.2 -86 16 -93 15 -100.4 C14 -106 12.2 -112 11.4 -117.5 C11.6 -121 12 -123.6 12.6 -125.2Z'

/** `back` draws her seen from behind, for her reflection in the mirror: no face or bust, and the hair falls over her back. */
export function Lady({ className, transform, back }: { className?: string; transform?: string; back?: boolean }) {
  // tulle ruffles following the sweetheart neckline
  const topY = (x: number) => -117.2 - 3.7 * Math.sin((Math.PI * Math.abs(x)) / 9.6)
  const ruffles: { cx: number; cy: number; r: number }[] = []
  for (let i = 0; i < 7; i++) {
    const x = -8.4 + i * 2.8
    ruffles.push({ cx: x, cy: topY(x) + 2.2 + (wiggle(i) - 0.5) * 0.8, r: 2.6 + wiggle(i + 9) * 0.5 })
  }
  for (let i = 0; i < 6; i++) {
    const x = -7 + i * 2.8 + (wiggle(i + 3) - 0.5) * 0.6
    ruffles.push({ cx: x, cy: topY(x) + 5 + (wiggle(i + 20) - 0.5) * 0.8, r: 2.5 + wiggle(i + 30) * 0.5 })
  }
  const dots: [number, number][] = []
  for (let i = 0; i < 34; i++) dots.push([-HEM_X + 0.8 + wiggle(i * 3) * (2 * HEM_X - 1.6), -67 + wiggle(i * 3 + 1) * 8.4])

  return (
    <g className={className} transform={transform}>
      <Defs />
      {/* where she stands: the fur is pressed down under her shoes */}
      <ellipse cx="0" cy="0.8" rx="15" ry="3.2" fill="#7a3e4c" opacity="0.32" />
      <ellipse cx="0" cy="0.6" rx="9" ry="1.8" fill="#4a1a28" opacity="0.28" />

      {/* legs and shoes: feet turned out a touch */}
      <g>
        <g>
          <path d={LEG} fill="url(#lady-leg)" />
          <path d="M-4.2 -62 C-4.4 -58 -3.8 -54 -3.4 -50 M-4 -34 C-3.8 -28 -3.4 -22 -3 -15" stroke="#fff" strokeOpacity="0.38" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <ellipse cx="-3.6" cy="-48.6" rx="1.2" ry="2.4" fill="#fff" opacity="0.2" />
          <path d="M-6 -45 C-5.6 -40 -5.6 -36 -5.2 -32" stroke="#a96a50" strokeOpacity="0.25" strokeWidth="0.8" fill="none" />
          <g transform="rotate(-6 -3.3 -8.6) translate(-3.3 -8.6) scale(1.35 1.1) translate(3.3 8.6)">
            <Shoe />
          </g>
        </g>
        <g transform="scale(-1 1)">
          <path d={LEG} fill="url(#lady-leg)" />
          <path d={LEG} fill="#6a3322" opacity="0.1" />
          <g transform="rotate(-6 -3.3 -8.6) translate(-3.3 -8.6) scale(1.35 1.1) translate(3.3 8.6)">
            <Shoe />
          </g>
        </g>
      </g>

      {/* the hair behind her neck and shoulders, in shadow */}
      <path d="M-11.2 -146 C-15.4 -138 -16 -126 -18.2 -118 C-19.6 -112 -20 -104 -17 -96 L17 -92 C20 -104 20.6 -112 19.4 -119 C16.4 -127 16 -138 11.2 -146 C8 -152 -8 -152 -11.2 -146Z" fill="url(#lady-hair-back)" />

      {/* neck, collarbone and shoulders */}
      <path d="M-2.7 -136 C-2.8 -132 -3 -130 -3.5 -128 C-7 -127.4 -10.4 -126.6 -12.8 -124.8 C-13.4 -122 -12 -119 -10.6 -116 L10.6 -116 C12 -119 13.4 -122 12.8 -124.8 C10.4 -126.6 7 -127.4 3.5 -128 C3 -130 2.8 -132 2.7 -136Z" fill="url(#lady-skin)" />
      <path d="M-2.8 -131.4 C-1 -129.6 1 -129.6 2.8 -131.4 L2.8 -134.6 L-2.8 -134.6Z" fill="#a8654a" opacity="0.2" />
      <path d="M-3.4 -126.6 C-6.4 -126 -9 -125.4 -11 -124.4 M3.4 -126.6 C6.4 -126 9 -125.4 11 -124.4" stroke="#b9775a" strokeOpacity="0.32" strokeWidth="0.5" fill="none" />

      {/* the mini dress */}
      <path d={DRESS} fill="url(#lady-dress)" />
      <clipPath id="lady-dress-clip">
        <path d={DRESS} />
      </clipPath>
      <g clipPath="url(#lady-dress-clip)">
        <rect x="-14" y="-124" width="9" height="66" fill="#fff" opacity="0.14" />
        <path d="M7.6 -124 C9 -100 11 -90 13 -60 L16 -60 L16 -124Z" fill="#8f2a52" opacity="0.2" />
        {/* princess seams and the pinch of the waist */}
        <path d="M-5.6 -112 C-5.4 -108 -5.6 -104 -5.4 -99.6 C-7.4 -92 -9.6 -86 -9.6 -80 M5.6 -112 C5.4 -108 5.6 -104 5.4 -99.6 C7.4 -92 9.6 -86 9.6 -80" stroke="#b9577a" strokeOpacity="0.4" strokeWidth="0.45" fill="none" />
        <path d="M-2.6 -96 C-3.4 -90 -4.4 -80 -5 -62 M2.6 -96 C3.4 -90 4.4 -80 5 -62" stroke="#fff" strokeOpacity="0.32" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        <path d="M-12 -86 C-6 -82 6 -82 12 -86" stroke="#8f2a52" strokeOpacity="0.16" strokeWidth="0.8" fill="none" />
        {/* lace hem */}
        <rect x="-16" y="-67.4" width="32" height="12" fill="#ffeef3" opacity="0.92" />
        <path d="M-16 -67.4 H16" stroke="#e58aa6" strokeWidth="0.5" strokeOpacity="0.8" />
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r="0.45" fill="#e6a0b6" opacity="0.8" />
        ))}
        {Array.from({ length: SCALLOPS }, (_, i) => HEM_X - (2 * HEM_X * (i + 0.5)) / SCALLOPS).map((cx) => (
          <path key={cx} d={`M${cx - 1.2} ${-64.2} Q${cx} ${-62.2} ${cx + 1.2} ${-64.2}`} stroke="#e58aa6" strokeWidth="0.35" fill="none" />
        ))}
      </g>
      <path d={DRESS} fill="none" stroke="#b9577a" strokeOpacity="0.5" strokeWidth="0.35" strokeLinejoin="round" />
      {/* satin sash with a bow at the waist */}
      <path d="M-6.2 -101.6 C-3 -100.4 3 -100.4 6.2 -101.6 L5.8 -98 C3 -96.8 -3 -96.8 -5.8 -98Z" fill="#e57a9e" stroke="#b9577a" strokeOpacity="0.5" strokeWidth="0.3" />
      <path d="M-6.2 -101.2 C-3 -100 3 -100 6.2 -101.2" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.4" fill="none" />
      <path d="M2 -99.4 C4.6 -103.4 7 -102 6 -99.4 C5.2 -97.4 3 -98.2 2 -99.4Z M2 -99.4 C4.4 -96 7 -97 6.2 -99.6" fill="#e57a9e" stroke="#b9577a" strokeOpacity="0.5" strokeWidth="0.3" />
      <path d="M2.6 -98.8 C2 -95.6 1.2 -93.4 0.2 -91.4 M3.4 -98.6 C3.6 -95.6 3.4 -93.4 3.2 -91.2" stroke="#e57a9e" strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle cx="2.8" cy="-99.2" r="1" fill="#d4608a" />

      {/* tulle ruffles across the bust */}
      {!back && (
      <g>
        {ruffles.map((r, i) => (
          <circle key={i} cx={r.cx} cy={r.cy} r={r.r} fill="url(#lady-ruffle)" stroke="#d9789a" strokeOpacity="0.5" strokeWidth="0.3" />
        ))}
        {ruffles.map((r, i) => (
          <path key={i} d={`M${r.cx - r.r * 0.6} ${r.cy + r.r * 0.25} Q${r.cx} ${r.cy + r.r * 0.9} ${r.cx + r.r * 0.6} ${r.cy + r.r * 0.25}`} stroke="#d9789a" strokeOpacity="0.4" strokeWidth="0.3" fill="none" />
        ))}
      </g>

      )}
      {back && (
        <>
          <path d="M-11.2 -146 C-15.4 -138 -16 -126 -18.2 -118 C-19.6 -112 -20 -104 -17 -96 C-12 -92 -4 -91 0 -92 C4 -91 12 -92 17 -96 C20 -104 20.6 -112 19.4 -119 C16.4 -127 16 -138 11.2 -146 C8 -152 -8 -152 -11.2 -146Z" fill="url(#lady-hair)" />
          <path d="M-8 -140 C-9 -126 -10 -112 -9 -96 M-3 -146 C-3.6 -128 -4 -112 -3.4 -94 M3 -146 C3.6 -128 4 -112 3.4 -94 M8 -140 C9 -126 10 -112 9 -96 M-13 -134 C-14.6 -122 -15.4 -108 -14 -98 M13 -134 C14.6 -122 15.4 -108 14 -98" stroke="#fffbe0" strokeOpacity="0.55" strokeWidth="0.5" strokeLinecap="round" fill="none" />
          <path d="M-6 -140 C-6.6 -124 -6.6 -110 -6 -95 M6 -140 C6.6 -124 6.6 -110 6 -95 M-11 -128 C-12 -116 -12 -106 -11 -96 M11 -128 C12 -116 12 -106 11 -96" stroke="#a47e30" strokeOpacity="0.4" strokeWidth="0.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* arms: rounded shoulder, elbow at waist level, slim wrist */}
      <g>
        <path d={ARM_L} fill="url(#lady-skin)" />
        <path d="M-15.4 -120 C-15.4 -112 -15.6 -106 -15.6 -100.6" stroke="#fff" strokeOpacity="0.32" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d={ARM_R} fill="url(#lady-skin)" />
        <path d="M13.6 -120 C14 -112 14.2 -106 14.8 -100.6" stroke="#fff" strokeOpacity="0.28" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M-19 -80.4 L-16.6 -80 M19.2 -80.2 L21.6 -80.8" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
        {/* hands */}
        <path d="M-19 -79.6 L-16.6 -79.2 C-16.4 -76.6 -16.2 -74 -17 -71 C-17.4 -69.6 -18.6 -69.6 -19.2 -71 C-19.8 -73.6 -19.4 -76.6 -19 -79.6Z" fill="url(#lady-skin)" />
        <path d="M-17.8 -75 V-71.6 M-18.6 -75 V-71.4" stroke="#c9856a" strokeOpacity="0.6" strokeWidth="0.35" strokeLinecap="round" />
        <path d="M21.6 -79.8 L19.2 -79.4 C19.2 -76.8 19.4 -74.2 20 -71.4 C20.4 -70 21.6 -70 22.2 -71.4 C22.8 -74 22.4 -77 21.6 -79.8Z" fill="url(#lady-skin)" />
        <path d="M20.6 -75 V-71.6 M21.4 -75 V-71.4" stroke="#c9856a" strokeOpacity="0.6" strokeWidth="0.35" strokeLinecap="round" />
      </g>

      {/* the paper bag swinging from her right hand (viewer's right) */}
      <Bag spec={HELD} i={9} hold={[21, -72.4]} held />

      {/* face: a soft oval with a delicate chin, defined cheekbones, almond eyes, a fine nose and glossy red lips */}
      {back ? (
        <path d="M0 -149.6 C4.4 -149.6 5.8 -146 5.7 -142.4 C5.6 -139.4 4.4 -136.6 2.8 -134.6 C1.8 -133.4 0.8 -132.9 0 -132.9 C-0.8 -132.9 -1.8 -133.4 -2.8 -134.6 C-4.4 -136.6 -5.6 -139.4 -5.7 -142.4 C-5.8 -146 -4.4 -149.6 0 -149.6Z" fill="#e8d08a" />
      ) : (
        <>
      <path d="M0 -149.6 C4.4 -149.6 5.8 -146 5.7 -142.4 C5.6 -139.4 4.4 -136.6 2.8 -134.6 C1.8 -133.4 0.8 -132.9 0 -132.9 C-0.8 -132.9 -1.8 -133.4 -2.8 -134.6 C-4.4 -136.6 -5.6 -139.4 -5.7 -142.4 C-5.8 -146 -4.4 -149.6 0 -149.6Z" fill="url(#lady-face)" />
      {/* contour: a soft shadow under the cheekbones and along the jaw, a light on the forehead and nose */}
      <path d="M-5.4 -141.2 C-4.6 -139.6 -3.8 -138.4 -2.8 -137.2 M5.4 -141.2 C4.6 -139.6 3.8 -138.4 2.8 -137.2" stroke="#c9876c" strokeOpacity="0.18" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M-4.6 -137.2 C-3.6 -135.6 -2.4 -134.4 -1 -133.8 M4.6 -137.2 C3.6 -135.6 2.4 -134.4 1 -133.8" stroke="#c9876c" strokeOpacity="0.14" strokeWidth="0.6" strokeLinecap="round" fill="none" />
      <ellipse cx="0" cy="-147" rx="2.4" ry="1.4" fill="#fff" opacity="0.28" />
      <ellipse cx="-3.7" cy="-139.4" rx="1.9" ry="1.1" fill="#f08aa4" opacity="0.32" />
      <ellipse cx="3.7" cy="-139.4" rx="1.9" ry="1.1" fill="#f08aa4" opacity="0.26" />
      {/* brows, just above the shades */}
      <path d="M-4.6 -145.2 C-3.8 -146.4 -2.2 -146.7 -0.8 -145.9 M4.6 -145.2 C3.8 -146.4 2.2 -146.7 0.8 -145.9" stroke="#a9843c" strokeWidth="0.55" strokeLinecap="round" fill="none" />
      {/* nose */}
      <path d="M-0.8 -141.6 C-0.9 -140.4 -1.3 -139.7 -1.2 -139.1" stroke="#b9775a" strokeOpacity="0.4" strokeWidth="0.4" strokeLinecap="round" fill="none" />
      <path d="M-1.2 -138.9 C-0.7 -138.3 0.7 -138.3 1.2 -138.9" stroke="#a8654a" strokeOpacity="0.55" strokeWidth="0.4" strokeLinecap="round" fill="none" />
      <circle cx="-0.6" cy="-138.9" r="0.25" fill="#a8654a" opacity="0.5" />
      <circle cx="0.6" cy="-138.9" r="0.25" fill="#a8654a" opacity="0.5" />
      <path d="M0.1 -142 V-139.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.35" strokeLinecap="round" />
      {/* cat-eye sunglasses */}
      <path d="M-6.6 -145.6 C-4.6 -145.2 -2.4 -144.6 -0.8 -144.2 C-0.6 -142.2 -1.6 -140.8 -3.2 -140.7 C-5 -140.6 -6.3 -142.4 -6.6 -145.6Z" fill="#0d0809" />
      <path d="M6.6 -145.6 C4.6 -145.2 2.4 -144.6 0.8 -144.2 C0.6 -142.2 1.6 -140.8 3.2 -140.7 C5 -140.6 6.3 -142.4 6.6 -145.6Z" fill="#0d0809" />
      <path d="M-0.9 -144.2 Q0 -144.9 0.9 -144.2" stroke="#0d0809" strokeWidth="0.7" fill="none" />
      <path d="M-6.6 -145.6 L-7 -146 M6.6 -145.6 L7 -146" stroke="#0d0809" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M-5.4 -144.6 C-4.4 -144.4 -3.4 -144.1 -2.6 -143.8 M2.6 -143.8 C3.4 -144.1 4.4 -144.4 5.4 -144.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.45" strokeLinecap="round" fill="none" />
      <path d="M-3.4 -141.6 C-2.4 -141.5 -1.8 -142 -1.6 -142.8 M3.4 -141.6 C2.4 -141.5 1.8 -142 1.6 -142.8" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.35" strokeLinecap="round" fill="none" />
      {/* glossy red lips */}
      <g transform="translate(0 -135.6) scale(0.68) translate(0 135.6)">
      <path d="M-2.7 -136.1 C-1.7 -137 -0.8 -137.2 0 -136.6 C0.8 -137.2 1.7 -137 2.7 -136.1 C1.5 -135.9 0.7 -136 0 -135.95 C-0.7 -136 -1.5 -135.9 -2.7 -136.1Z" fill="#c4122f" />
      <path d="M-2.6 -136 C-1.5 -136.1 1.5 -136.1 2.6 -136 C1.8 -134.6 0.9 -134.2 0 -134.2 C-0.9 -134.2 -1.8 -134.6 -2.6 -136Z" fill="#da2142" />
      <path d="M-1 -135.2 C-0.4 -134.9 0.4 -134.9 1 -135.2" stroke="#fff" strokeOpacity="0.65" strokeWidth="0.35" strokeLinecap="round" fill="none" />
      <path d="M-2.4 -136.05 C-1 -135.9 1 -135.9 2.4 -136.05" stroke="#7d0a1c" strokeOpacity="0.7" strokeWidth="0.25" fill="none" />
      <path d="M-1.4 -133.6 C-0.5 -133.2 0.5 -133.2 1.4 -133.6" stroke="#b9775a" strokeOpacity="0.22" strokeWidth="0.4" fill="none" />
      </g>
      {/* tassel earrings */}
      <circle cx="-5.8" cy="-140.2" r="0.6" fill={GOLD} />
      <path d="M-5.8 -139.6 L-5.9 -136" stroke="#b5436a" strokeWidth="0.7" strokeLinecap="round" />
      <circle cx="5.8" cy="-140.2" r="0.6" fill={GOLD} />
      <path d="M5.8 -139.6 L5.9 -136" stroke="#b5436a" strokeWidth="0.7" strokeLinecap="round" />

        </>
      )}

      {/* hair: long, loose waves parted in the centre, falling over both shoulders; the right side sweeps fuller and longer */}
      <path d="M0 -152.4 C-4 -152.4 -8.6 -150.8 -11 -145.6 C-13.2 -141 -13.6 -137 -14.2 -133 C-14.8 -129 -16.4 -126.4 -15.6 -122.4 C-14.8 -119 -12.6 -118 -13.6 -114.6 C-14.6 -111.4 -18 -111 -18.6 -107.6 C-19.2 -104 -16.4 -102.4 -17.4 -99 C-18.2 -96 -16.6 -93.2 -14.2 -91.8 C-13 -91.2 -11.8 -92.2 -11.8 -93.6 C-11.6 -97 -12.8 -99.6 -12 -102.4 C-11.2 -105.4 -9.2 -107.2 -9.6 -110.6 C-10 -114 -8 -116.4 -7.6 -120.4 C-7.2 -125 -6.4 -130 -6.1 -135 C-5.9 -139.6 -6.3 -142.6 -5.6 -144.8 C-4.4 -148 -2.2 -150 0 -150.8Z" fill="url(#lady-hair)" />
      <path d="M0 -152.4 C4 -152.4 8.6 -150.8 11 -145.6 C13.4 -141 14 -137 14.6 -133 C15.2 -128.6 17 -126 16.4 -122 C15.8 -118.6 13.4 -117.4 14.4 -114 C15.4 -110.6 19 -109.6 19.4 -106 C19.8 -102 16.6 -100.4 17.4 -96.6 C18 -93.4 16.2 -90.6 13.6 -89.2 C12.2 -88.6 11 -89.6 11 -91.2 C11 -95 12.2 -97.6 11.4 -100.8 C10.6 -104 8.8 -106 9.4 -109.6 C10 -113.4 8 -116.2 7.8 -120.4 C7.6 -125 6.6 -130 6.2 -135 C6 -139.4 6.4 -142.4 5.8 -144.8 C4.6 -148 2.2 -150 0 -150.8Z" fill="url(#lady-hair)" />
      <clipPath id="lady-hair-clip">
        <path d="M0 -152.4 C-4 -152.4 -8.6 -150.8 -11 -145.6 C-13.2 -141 -13.6 -137 -14.2 -133 C-14.8 -129 -16.4 -126.4 -15.6 -122.4 C-14.8 -119 -12.6 -118 -13.6 -114.6 C-14.6 -111.4 -18 -111 -18.6 -107.6 C-19.2 -104 -16.4 -102.4 -17.4 -99 C-18.2 -96 -16.6 -93.2 -14.2 -91.8 C-13 -91.2 -11.8 -92.2 -11.8 -93.6 C-11.6 -97 -12.8 -99.6 -12 -102.4 C-11.2 -105.4 -9.2 -107.2 -9.6 -110.6 C-10 -114 -8 -116.4 -7.6 -120.4 C-7.2 -125 -6.4 -130 -6.1 -135 C-5.9 -139.6 -6.3 -142.6 -5.6 -144.8 C-4.4 -148 -2.2 -150 0 -150.8Z M0 -152.4 C4 -152.4 8.6 -150.8 11 -145.6 C13.4 -141 14 -137 14.6 -133 C15.2 -128.6 17 -126 16.4 -122 C15.8 -118.6 13.4 -117.4 14.4 -114 C15.4 -110.6 19 -109.6 19.4 -106 C19.8 -102 16.6 -100.4 17.4 -96.6 C18 -93.4 16.2 -90.6 13.6 -89.2 C12.2 -88.6 11 -89.6 11 -91.2 C11 -95 12.2 -97.6 11.4 -100.8 C10.6 -104 8.8 -106 9.4 -109.6 C10 -113.4 8 -116.2 7.8 -120.4 C7.6 -125 6.6 -130 6.2 -135 C6 -139.4 6.4 -142.4 5.8 -144.8 C4.6 -148 2.2 -150 0 -150.8Z" />
      </clipPath>
      {/* the centre parting and the crown's sheen */}
      <path d="M0 -152.2 C0.2 -151.4 0.2 -150.8 0 -150.6" stroke="#a47e30" strokeOpacity="0.6" strokeWidth="0.45" fill="none" />
      <path d="M-1.6 -151.8 C-5.6 -151.4 -8.6 -149 -10 -145.6 M1.6 -151.8 C5.6 -151.4 8.6 -149 10 -145.6" stroke="#fffbe0" strokeOpacity="0.75" strokeWidth="0.6" strokeLinecap="round" fill="none" />
      {/* strands: light ribbons of shine and darker hollows between the waves */}
      <g fill="none" strokeLinecap="round" clipPath="url(#lady-hair-clip)">
        {/* wave crests: bright S-shaped ribbons that follow each swing of the hair, with a shaded trough under each */}
        <path d="M-14 -131 C-16 -126 -13 -122 -14.6 -117 C-16.4 -112 -18 -111 -17.8 -107 M-13 -118 C-14 -114 -17 -113 -17.6 -109 M-16.4 -104 C-17.6 -101 -16.4 -98 -15.4 -95" stroke="#fffbe0" strokeOpacity="0.8" strokeWidth="0.7" />
        <path d="M14.6 -130 C16.6 -125 14.4 -121 15.4 -117 C16.6 -113 19 -112 18.8 -108 M14 -118 C13.4 -114 17 -112.6 18.2 -109 M17 -104 C17.4 -101 16.6 -98 15.6 -95 M12.4 -99 C12.8 -96 12.6 -93.4 12.4 -91.6" stroke="#fffbe0" strokeOpacity="0.8" strokeWidth="0.7" />
        <path d="M-13.2 -113.6 C-15.4 -113 -17.4 -112 -18.4 -108.4 M-15.2 -101 C-13.8 -100 -12.6 -99 -12.4 -96.4 M-13 -122 C-12.4 -120 -11.6 -119 -10.6 -118.4" stroke="#8a6a26" strokeOpacity="0.5" strokeWidth="0.7" />
        <path d="M14 -113.6 C16.4 -113 18.4 -111.6 19 -108 M15.6 -100.6 C14 -99.6 12.8 -98.6 12.4 -96 M13.6 -121.6 C13 -119.6 12.2 -118.6 11 -118" stroke="#8a6a26" strokeOpacity="0.5" strokeWidth="0.7" />
        <path d="M-9 -148 C-11 -142 -11.4 -134 -12.8 -127 C-14 -121 -14.2 -116 -13.2 -112 M-7.4 -146 C-9 -138 -9 -130 -10.6 -124 C-12 -118 -11.8 -112 -12.4 -106 M-10.4 -144 C-12.4 -136 -12.6 -128 -14.4 -122 C-15.2 -118 -14.6 -114 -14.2 -111 M-13.8 -108 C-14.6 -106 -15 -104.6 -15.2 -102.4" stroke="#fffbe0" strokeOpacity="0.7" strokeWidth="0.5" />
        <path d="M9.4 -148 C11.4 -142 12 -134 13.4 -127 C14.6 -121 14.6 -116 13.8 -112 M7.6 -146 C9.4 -138 9.4 -130 10.8 -124 C12.2 -118 11.6 -112 12 -106 M10.8 -144 C12.8 -136 13.4 -128 14.8 -122 C15.4 -118 15 -114 14.6 -110 M14.4 -107 C14.8 -104.6 14.6 -102 13.8 -99.4 M11.4 -101 C11.8 -98.6 11.4 -96.4 10.8 -94.6" stroke="#fffbe0" strokeOpacity="0.7" strokeWidth="0.5" />
        <path d="M-8 -143 C-9.4 -136 -8.8 -128 -9.2 -120 C-9.6 -114 -10.4 -108 -10.6 -100 M-11.6 -130 C-13 -122 -14.6 -116 -14.4 -110 C-14.4 -106 -15.4 -104 -15 -100 M-15.8 -104 C-13.6 -102 -11.8 -100 -11 -97" stroke="#a47e30" strokeOpacity="0.45" strokeWidth="0.5" />
        <path d="M8.4 -143 C9.6 -136 8.6 -128 9 -121 C9.4 -115 9.4 -110 9.8 -104 M12.2 -131 C13.4 -124 15 -118 14.8 -112 C14.8 -108 15.4 -105 14.8 -101 M10.4 -97 C11.8 -96.8 12.6 -96 13 -94.4 M15.2 -104 C13.4 -102 12.2 -100 11.6 -97.4" stroke="#a47e30" strokeOpacity="0.45" strokeWidth="0.5" />
        <path d="M-12 -138 C-13.4 -134 -13.4 -131 -12.6 -128 M12.6 -138 C14 -134 14.2 -130.6 13.4 -127.6 M-14.6 -118 C-15.4 -115 -14.8 -113 -14 -111.4 M15 -119 C15.8 -116 15.4 -114 14.6 -112" stroke="#8a6a26" strokeOpacity="0.35" strokeWidth="0.4" />
      </g>
      {/* a few stray wisps at the ends */}
      <path d="M-14.4 -97.6 C-15.4 -95.4 -14.4 -93.8 -13.4 -93.4 M13.4 -94 C14.6 -91.4 13.6 -89.8 12 -89.4" stroke="#d8bd72" strokeWidth="0.35" strokeLinecap="round" fill="none" />
    </g>
  )
}

/** The bag in her hand, in the same design as the ones on the floor. */

type BagSpec = {
  x: number
  base: number
  w: number
  h: number
  /** depth of the side gusset */
  d: number
  color: string
  shade: string
  light: string
  /** the paper inside, seen over the rim */
  inner: string
  /** foil colour of the logo */
  accent: string
  handle: string
  tissue: string
  /** flat satin ribbon handles instead of twisted rope */
  ribbon?: boolean
  tilt?: number
}

const BAGS: BagSpec[] = [
  { x: 88, base: 356, w: 15, h: 20, d: 5, color: '#8a2547', shade: '#4d1128', light: '#b64468', inner: '#3d0e20', accent: '#ecd391', handle: '#e5c882', tissue: '#fff1f5' },
  { x: 102.5, base: 354.6, w: 12, h: 14.5, d: 4, color: '#f6c3d1', shade: '#cf8aa2', light: '#fff0f4', inner: '#d39aae', accent: '#a9772f', handle: '#ffffff', tissue: '#ffffff', ribbon: true, tilt: 3 },
  { x: 71, base: 360.6, w: 11.5, h: 12.5, d: 3.6, color: '#fff5ef', shade: '#dcc2ba', light: '#ffffff', inner: '#cfaea4', accent: '#8a2547', handle: '#8a2547', tissue: '#f6c3d1', tilt: -4 },
]

/** A boutique paper bag in three-quarter view, lit from the left and seen from slightly above: a folded top cuff with punched eyelets, the inside back wall
 *  over the rim, tissue paper, a pleated side gusset, a thick base, and twisted-rope or satin handles. With `hold`, both handles gather to that point (a hand). */
function Bag({ spec, i, hold, held, back }: { spec: BagSpec; i: number; hold?: [number, number]; held?: boolean; back?: boolean }) {
  const { x, base, w, h, d, color, shade, light, inner, accent, handle, tissue, ribbon, tilt = 0 } = spec
  const t = base - h
  const k = d * 0.32 // how far the far edge rises: we look slightly down into the bag
  const cuff = h * 0.09
  const gl = x + w * 0.27
  const gr = x + w * 0.73
  const gy = t + cuff * 0.5
  const bl = gl + d
  const br = gr + d
  const by = t - k
  const lift = h * 0.6
  const [hx, hy] = hold ?? [0, 0]
  const frontHandle = hold
    ? `M${gl} ${gy} C${gl} ${t - 3} ${hx - 0.8} ${hy + 4} ${hx - 0.3} ${hy} M${gr} ${gy} C${gr} ${t - 3} ${hx + 0.8} ${hy + 4} ${hx + 0.3} ${hy}`
    : `M${gl} ${gy} C${gl - w * 0.05} ${t - lift} ${gr + w * 0.05} ${t - lift} ${gr} ${gy}`
  const backHandle = hold
    ? `M${bl} ${by} C${bl} ${t - 4} ${hx - 0.4} ${hy + 4.5} ${hx} ${hy} M${br} ${by} C${br} ${t - 4} ${hx + 0.4} ${hy + 4.5} ${hx} ${hy}`
    : `M${bl} ${by} C${bl - w * 0.04} ${t - lift * 1.12} ${br + w * 0.04} ${t - lift * 1.12} ${br} ${by}`
  const rope = (d: string, back = false) =>
    ribbon ? (
      <>
        <path d={d} stroke={handle} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={back ? 0.8 : 1} />
        <path d={d} stroke="#e9c9d3" strokeWidth="0.35" strokeLinecap="round" fill="none" />
      </>
    ) : (
      <>
        <path d={d} stroke={handle} strokeWidth="1" strokeLinecap="round" fill="none" opacity={back ? 0.85 : 1} />
        <path d={d} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.45" strokeDasharray="0.5 0.55" strokeLinecap="round" fill="none" />
        <path d={d} stroke="#000" strokeOpacity="0.28" strokeWidth="0.3" strokeDasharray="0.5 0.55" strokeDashoffset="0.5" strokeLinecap="round" fill="none" />
      </>
    )
  // tissue paper puffing out of the top, behind the front rim
  const tp = (fx: number, fy: number) => `${(x + d * 0.5 + w * fx).toFixed(2)} ${(t + fy * h).toFixed(2)}`
  const tissuePath = `M${tp(0.1, 0.02)} L${tp(0.16, -0.17)} L${tp(0.27, -0.06)} L${tp(0.38, -0.24)} L${tp(0.5, -0.09)} L${tp(0.62, -0.27)} L${tp(0.73, -0.1)} L${tp(0.84, -0.2)} L${tp(0.92, 0.02)}Z`
  const mid = x + w / 2
  const gx = x + w + d / 2
  return (
    <g transform={`rotate(${tilt} ${x + w / 2} ${base})${back ? ` translate(${2 * x + w + d} 0) scale(-1 1)` : ''}`}>
      <defs>
        <linearGradient id={`${id(i)}-f`} x1="0" y1="0" x2="1" y2="0.12">
          <stop offset="0" stopColor={light} />
          <stop offset="0.42" stopColor={color} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
        <linearGradient id={`${id(i)}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade} />
          <stop offset="1" stopColor={shade} stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={`${id(i)}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={`${id(i)}-c`}>
          <path d={`M${x} ${t} H${x + w} V${base} H${x} Z`} />
        </clipPath>
      </defs>
      {!held && <ellipse cx={x + w * 0.62 + d * 0.5} cy={base + 0.4} rx={w * 0.85} ry={1.9} fill="url(#sd-contact)" />}
      {/* back handle, then the inside of the bag */}
      {rope(backHandle, true)}
      <path d={`M${x} ${t} L${x + w} ${t} L${x + w + d} ${by} L${x + d} ${by}Z`} fill={inner} />
      <path d={`M${x + d} ${by} L${x + w + d} ${by}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.35" />
      <path d={tissuePath} fill={tissue} stroke="#e2bcc8" strokeWidth="0.25" strokeLinejoin="round" />
      <path d={`M${tp(0.27, -0.05)} L${tp(0.3, 0.02)} M${tp(0.5, -0.08)} L${tp(0.52, 0.02)} M${tp(0.73, -0.09)} L${tp(0.7, 0.02)}`} stroke="#d9a9b9" strokeWidth="0.25" fill="none" />
      {/* the gusset on the shaded side, with its inward fold */}
      <path d={`M${x + w} ${t} L${x + w + d} ${by} L${x + w + d} ${base - k} L${x + w} ${base}Z`} fill={`url(#${id(i)}-g)`} />
      <path d={`M${gx} ${t - k / 2 + cuff * 0.3} V${base - h * 0.28 - k / 2} L${x + w + d} ${base - k} M${gx} ${base - h * 0.28 - k / 2} L${x + w} ${base}`} stroke="#000" strokeOpacity="0.28" strokeWidth="0.35" fill="none" />
      <path d={`M${gx - 0.35} ${t - k / 2 + cuff * 0.5} V${base - h * 0.3 - k / 2}`} stroke="#fff" strokeOpacity="0.18" strokeWidth="0.3" />
      {/* the front face */}
      <path d={`M${x} ${t} H${x + w} V${base} H${x} Z`} fill={`url(#${id(i)}-f)`} />
      <g clipPath={`url(#${id(i)}-c)`}>
        <rect x={x} y={t + cuff} width={w} height={h - cuff} fill={`url(#${id(i)}-b)`} />
        <rect x={x} y={t} width={w} height={cuff} fill="#fff" opacity="0.1" />
        <path d={`M${x} ${t + cuff} H${x + w}`} stroke="#000" strokeOpacity="0.2" strokeWidth="0.3" />
        <path d={`M${x} ${t + cuff + 0.35} H${x + w}`} stroke="#fff" strokeOpacity="0.28" strokeWidth="0.25" />
        <path d={`M${mid + w * 0.12} ${t + cuff} V${base}`} stroke="#000" strokeOpacity="0.06" strokeWidth="1.2" />
        <rect x={x} y={t} width={0.55} height={h} fill="#fff" opacity="0.4" />
      </g>
      {/* rim highlight and the thick base */}
      <path d={`M${x} ${t} H${x + w}`} stroke="#fff" strokeOpacity="0.75" strokeWidth="0.4" />
      <path d={`M${x} ${base} H${x + w} L${x + w + d} ${base - k} V${base - k + 0.7} L${x + w} ${base + 0.7} H${x}Z`} fill={shade} opacity="0.85" />
      {/* gold-foil logo */}
      {!back && (
        <g>
      <text x={mid} y={t + h * 0.56} textAnchor="middle" fontSize={w * 0.21} fontStyle="italic" fontFamily="'Cormorant Garamond', Georgia, serif" fill={accent}>
        Renté
      </text>
      <text x={mid} y={t + h * 0.56 + w * 0.12} textAnchor="middle" fontSize={w * 0.065} letterSpacing={w * 0.012} fontFamily="'Jost', Arial, sans-serif" fill={accent} opacity="0.9">
        BY KISHA
      </text>
      <path d={`M${mid - w * 0.14} ${t + h * 0.34} H${mid + w * 0.14}`} stroke={accent} strokeWidth="0.25" opacity="0.8" />
        </g>
      )}
      {/* eyelets, then the front handle through them */}
      {[gl, gr].map((ex) => (
        <g key={ex}>
          <circle cx={ex} cy={gy} r="0.7" fill="#e8cf8f" stroke="#8f6f2a" strokeWidth="0.2" />
          <circle cx={ex} cy={gy} r="0.3" fill="#3a1a1a" />
        </g>
      ))}
      {rope(frontHandle)}
    </g>
  )
}

/** Shopping bags standing on the floor beside the pouf. With `back`, seen from behind (as in the mirror): flipped, with no logo. */
export function ShoppingBags({ back }: { back?: boolean }) {
  return (
    <g>
      {BAGS.map((b, i) => (
        <Bag key={i} spec={b} i={i} back={back} />
      ))}
    </g>
  )
}

const id = (i: number) => `bag-${i}`

const HELD: BagSpec = { x: 17.2, base: -51, w: 13, h: 17.5, d: 4, color: '#fbe0e8', shade: '#d890a9', light: '#ffffff', inner: '#d49aae', accent: '#9c1f45', handle: '#c9a45c', tissue: '#ffffff' }
