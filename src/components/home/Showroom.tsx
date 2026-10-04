import { memo } from 'react'
import DressArt from '@/components/dresses/DressArt'
import { getDress } from '@/hooks/useDresses'
import { cn } from '@/lib/utils'
import { Flowers, Pendant, Rack } from './Decor'

/** The editorial showroom revealed behind the doors. Sized entirely in percentages of its container. */

interface Fig {
  id: string
  left: string
  size: string
  z: number
  hideOnSmall?: boolean
}

// Heights differ on small screens (full-height crop) and md+ (the arch is dollied into, so the centre band shows).
const FIGURES: Fig[] = [
  { id: 'dress-005', left: '-2%', size: 'h-[52%] md:h-[44%]', z: 1, hideOnSmall: true },
  { id: 'dress-010', left: '102%', size: 'h-[52%] md:h-[44%]', z: 1, hideOnSmall: true },
  { id: 'dress-002', left: '19%', size: 'h-[64%] md:h-[54%]', z: 2 },
  { id: 'dress-009', left: '81%', size: 'h-[64%] md:h-[54%]', z: 2 },
  { id: 'dress-001', left: '50%', size: 'h-[76%] md:h-[64%]', z: 3 },
]

function Showroom() {
  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-gradient-to-b from-blush-soft via-[#fbeee9] to-cream">
      {/* arched mirror */}
      <div className="absolute left-1/2 top-[8%] h-[62%] w-[46%] -translate-x-1/2 rounded-t-full border border-gold/60 bg-gradient-to-br from-white/80 via-blush-soft/50 to-white/30 shadow-[inset_0_0_0_6px_rgba(255,253,248,0.7)]" />
      <div className="absolute left-[8%] top-[18%] hidden h-[40%] w-[14%] rounded-t-full border border-gold/40 bg-white/30 md:block" />
      <div className="absolute right-[8%] top-[18%] hidden h-[40%] w-[14%] rounded-t-full border border-gold/40 bg-white/30 md:block" />

      <Pendant className="absolute left-1/2 top-0 h-[16%] -translate-x-1/2" />

      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-b md:h-[27%] from-[#ead6bd] to-[#d8bd9c]">
        <div className="absolute inset-0 opacity-40 [background:repeating-linear-gradient(90deg,transparent_0_46px,rgba(143,111,42,0.35)_46px_47px)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gold/60" />
      </div>

      <Rack className="absolute bottom-[14%] right-[3%] hidden h-[34%] md:block" />
      <Flowers className="absolute bottom-[6%] left-[3%] h-[30%] max-md:left-[-4%]" />
      <Flowers className="absolute bottom-[6%] right-[3%] h-[24%] max-md:right-[-2%] md:hidden" />

      {FIGURES.map((f) => {
        const dress = getDress(f.id)!
        return (
          <div
            key={f.id}
            className={cn('absolute bottom-[3%] aspect-[280/373] -translate-x-1/2 md:bottom-[13%]', f.size, f.hideOnSmall && 'max-md:hidden')}
            style={{ left: f.left, zIndex: f.z }}
          >
            <DressArt dress={dress} bare className="size-full drop-shadow-[0_18px_18px_rgba(90,16,37,0.18)]" />
          </div>
        )
      })}

      {/* soft vignette */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(90,16,37,0.14))]" />
    </div>
  )
}

export default memo(Showroom)
