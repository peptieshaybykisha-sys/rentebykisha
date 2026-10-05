import { cn } from '@/lib/utils'

type Tone = 'blush' | 'wine'
const SILK: Record<Tone, { base: string; light: string; dark: string }> = {
  blush: { base: '#e9bcc6', light: '#fff1f3', dark: '#b9677f' },
  wine: { base: '#7a2038', light: '#c4637f', dark: '#2c0613' },
}

/** Draped satin: a base colour with soft, blurred bands of light and shade, like a photographed length of silk. */
function SilkArt({ tone }: { tone: Tone }) {
  const c = SILK[tone]
  const band = (left: string, w: string, rot: number, color: string, o: number) => (
    <span aria-hidden className="absolute -inset-y-[10%] rounded-full blur-[7px]" style={{ left, width: w, background: color, opacity: o, transform: `rotate(${rot}deg)` }} />
  )
  return (
    <div className="relative size-full overflow-hidden rounded-[999px_999px_2px_2px]" style={{ background: `linear-gradient(170deg, ${c.light}, ${c.base} 45%, ${c.dark})` }}>
      {band('-8%', '26%', 14, c.dark, 0.5)}
      {band('18%', '18%', 9, c.light, 0.75)}
      {band('42%', '24%', 12, c.dark, 0.38)}
      {band('64%', '16%', 8, c.light, 0.6)}
      {band('82%', '26%', 15, c.dark, 0.5)}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 30% 12%, rgba(255,255,255,0.38), transparent 60%), linear-gradient(180deg, transparent 55%, rgba(30,5,15,0.35))' }} />
    </div>
  )
}

/** Arched, gold-framed wall poster that flanks the doorway. A soft spotlight, inner vignette and glass gleam make it read as a framed print. */
export function WallPoster({ title, caption, tone = 'blush', compact, className }: { title: string; caption?: string; tone?: Tone; compact?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('absolute flex flex-col items-center overflow-hidden rounded-t-[999px] px-3 text-center', compact ? 'pb-3 pt-3' : 'pb-4 pt-4', className)}
      style={{
        background: 'radial-gradient(120% 70% at 50% 28%, #fffaf8 0%, #f8e6e6 55%, #ecd0d2 100%)',
        boxShadow: ['0 0 0 2px #c9a45c', '0 0 0 5px #fbf1ee', '0 0 0 6px #b8913f', 'inset 0 0 22px rgba(120,60,72,0.32)', '9px 16px 26px -6px rgba(90,16,37,0.38)'].join(','),
      }}
    >
      <div className="min-h-0 w-full flex-1"><SilkArt tone={tone} /></div>
      <p className={cn('mt-2 whitespace-nowrap font-medium uppercase text-burgundy', compact ? 'text-[0.5rem] tracking-[0.2em]' : 'text-[0.58rem] tracking-[0.2em]')}>{title}</p>
      {caption && (
        <>
          <span className="my-1.5 h-px w-6 bg-gold" />
          <p className="font-serif text-[0.8rem] italic leading-tight text-burgundy-soft">{caption}</p>
        </>
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(118deg,rgba(255,255,255,0.55) 8%,rgba(255,255,255,0) 28%,rgba(255,255,255,0.18) 52%,rgba(255,255,255,0) 60%)' }} />
    </div>
  )
}
