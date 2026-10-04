/** Small illustrative pieces for the boutique: bow, flowers, rack. Kept as light inline SVG. */

export function Bow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 50" className={className} aria-hidden focusable="false">
      <g fill="#e9b7bc" stroke="#c9949c" strokeWidth="1">
        <path d="M40 22C30 6 6 4 5 18c-1 14 22 14 35 4Z" />
        <path d="M40 22C50 6 74 4 75 18c1 14-22 14-35 4Z" />
        <path d="M37 26 26 47l11-6 3 7zM43 26l11 21-11-6-3 7z" />
      </g>
      <path d="M40 22C28 12 14 11 10 17" fill="none" stroke="#fff" strokeOpacity="0.6" />
      <circle cx="40" cy="23" r="5" fill="#c9a45c" stroke="#9a7a35" />
    </svg>
  )
}

export function Flowers({ className }: { className?: string }) {
  const blooms: [number, number, number, string][] = [
    [30, 34, 13, '#f6e4e3'],
    [52, 22, 15, '#e9b7bc'],
    [72, 38, 12, '#fffdf8'],
    [42, 52, 11, '#e9b7bc'],
    [64, 58, 10, '#f6e4e3'],
  ]
  return (
    <svg viewBox="0 0 100 150" className={className} aria-hidden focusable="false">
      <g stroke="#6f8f66" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M50 120C46 90 34 60 30 34" />
        <path d="M52 120C52 90 54 50 52 22" />
        <path d="M54 120C60 90 70 60 72 38" />
        <path d="M50 120C48 100 42 80 42 52" />
        <path d="M54 120C58 100 64 80 64 58" />
      </g>
      <g>
        {blooms.map(([x, y, r, c], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={c} stroke="#d9949c" strokeOpacity="0.45" />
            <circle cx={x} cy={y} r={r * 0.38} fill="#c9a45c" opacity="0.7" />
          </g>
        ))}
        <ellipse cx="22" cy="78" rx="9" ry="4.5" fill="#8aa782" transform="rotate(-30 22 78)" />
        <ellipse cx="80" cy="80" rx="9" ry="4.5" fill="#8aa782" transform="rotate(30 80 80)" />
      </g>
      <path d="M36 118h30l-4 28H40z" fill="#fffdf8" stroke="#c9a45c" strokeOpacity="0.7" />
      <path d="M38 126h26" stroke="#e9b7bc" strokeWidth="3" />
    </svg>
  )
}

export function Rack({ className }: { className?: string }) {
  const hung = [
    { x: 24, c: '#7a2940', h: 70 },
    { x: 52, c: '#f4ece0', h: 82 },
    { x: 80, c: '#e9b7bc', h: 66 },
    { x: 108, c: '#1f5b47', h: 76 },
    { x: 136, c: '#d8bd8d', h: 84 },
  ]
  return (
    <svg viewBox="0 0 170 200" className={className} aria-hidden focusable="false">
      <path d="M6 24h158" stroke="#c9a45c" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 24v168M158 24v168" stroke="#c9a45c" strokeWidth="3" />
      {hung.map((d) => (
        <g key={d.x}>
          <path d={`M${d.x} 24v-6`} stroke="#9a7a35" strokeWidth="1.5" />
          <path d={`M${d.x - 10} 32l10-10 10 10`} fill="none" stroke="#9a7a35" strokeWidth="1.5" />
          <path d={`M${d.x - 9} 32h18l${d.h > 74 ? 8 : 5} ${d.h}h-${d.h > 74 ? 42 : 36}z`} fill={d.c} opacity="0.95" />
        </g>
      ))}
    </svg>
  )
}

export function Pendant({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden focusable="false">
      <path d="M30 0v70" stroke="#c9a45c" strokeWidth="1.5" />
      <path d="M18 70h24l4 12H14z" fill="#c9a45c" />
      <ellipse cx="30" cy="92" rx="16" ry="18" fill="#fff4d8" stroke="#c9a45c" strokeOpacity="0.6" />
    </svg>
  )
}
