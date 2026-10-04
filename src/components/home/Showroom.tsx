import { memo } from 'react'
import DressPhoto from '@/components/dresses/DressPhoto'
import { SHOWROOM_SLOTS } from '@/constants/home'
import { useCatalogStatus } from '@/hooks/useDresses'
import { useHeroDresses } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import { Flowers, Pendant, Rack } from './Decor'

/** The editorial showroom revealed behind the doors. The dresses shown are chosen in /admin > Hero. */
function Showroom() {
  const dresses = useHeroDresses()
  const loading = useCatalogStatus() === 'loading'
  // Show the attached dresses, or three "Coming soon" frames when none are attached yet.
  const slots = dresses.length ? SHOWROOM_SLOTS.slice(0, dresses.length) : SHOWROOM_SLOTS.slice(0, 3)
  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-gradient-to-b from-blush-soft via-[#fbeee9] to-cream">
      <div className="absolute left-1/2 top-[8%] h-[62%] w-[46%] -translate-x-1/2 rounded-t-full border border-gold/60 bg-gradient-to-br from-white/80 via-blush-soft/50 to-white/30 shadow-[inset_0_0_0_6px_rgba(255,253,248,0.7)]" />
      <div className="absolute left-[8%] top-[18%] hidden h-[40%] w-[14%] rounded-t-full border border-gold/40 bg-white/30 md:block" />
      <div className="absolute right-[8%] top-[18%] hidden h-[40%] w-[14%] rounded-t-full border border-gold/40 bg-white/30 md:block" />

      <Pendant className="absolute left-1/2 top-0 h-[16%] -translate-x-1/2" />

      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-b from-[#ead6bd] to-[#d8bd9c] md:h-[27%]">
        <div className="absolute inset-0 opacity-40 [background:repeating-linear-gradient(90deg,transparent_0_46px,rgba(143,111,42,0.35)_46px_47px)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gold/60" />
      </div>

      <Rack className="absolute bottom-[14%] right-[3%] hidden h-[34%] md:block" />
      <Flowers className="absolute bottom-[6%] left-[3%] h-[30%] max-md:left-[-4%]" />
      <Flowers className="absolute bottom-[6%] right-[3%] h-[24%] max-md:right-[-2%] md:hidden" />

      {/* With no dress attached in the admin, the three front frames say "Coming soon". */}
      {slots.map((slot, i) => {
        const dress = dresses[i]
        return (
          <div
            key={dress?.id ?? `soon-${i}`}
            className={cn(
              'absolute bottom-[4%] aspect-[3/4] -translate-x-1/2 overflow-hidden rounded-t-[999px] rounded-b-xl border-2 border-ivory bg-blush-soft shadow-[0_22px_30px_-12px_rgba(90,16,37,0.45)] ring-1 ring-gold/50 md:bottom-[12%]',
              slot.size,
              slot.hideOnSmall && 'max-md:hidden',
            )}
            style={{ left: slot.left, zIndex: slot.z }}
          >
            {dress ? (
              <DressPhoto dress={dress} priority className="size-full object-cover" />
            ) : loading ? (
              <div aria-hidden className="size-full animate-pulse bg-blush/50" />
            ) : (
              <div className="size-full bg-gradient-to-b from-blush-soft via-[#f8e8e4] to-blush">
                {/* SVG text scales with the frame, so it always fits at any size */}
                <svg viewBox="0 0 120 160" className="size-full" role="img" aria-label="Coming soon">
                  <g fill="currentColor" className="text-burgundy/80" textAnchor="middle" style={{ fontFamily: 'var(--font-script)' }} fontSize="19">
                    <text x="60" y="66">Coming</text>
                    <text x="60" y="88">soon</text>
                  </g>
                </svg>
              </div>
            )}
          </div>
        )
      })}

      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(90,16,37,0.14))]" />
    </div>
  )
}

export default memo(Showroom)
