import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { ChevronDown } from 'lucide-react'
import logo from '@/assets/logo.jpg'
import { cn } from '@/lib/utils'
import { Bow, Flowers } from './Decor'
import Showroom from './Showroom'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

/** One leaf of the boutique door. `side` decides the hinge. */
function Door({ side, angle, shade, fade }: { side: 'left' | 'right'; angle: MotionValue<number>; shade: MotionValue<number>; fade: MotionValue<number> }) {
  const left = side === 'left'
  const rotateY = useTransform(angle, (a) => (left ? a : -a))
  return (
    <motion.div
      aria-hidden
      className={cn('absolute inset-y-0 w-1/2 bg-ivory [backface-visibility:hidden]', left ? 'left-0 origin-left' : 'right-0 origin-right')}
      style={{ rotateY, opacity: fade }}
    >
      {/* fan-light arc, which meets its twin in the middle */}
      <div className={cn('absolute top-[4%] h-[26%] w-[84%] border-gold/50', left ? 'left-[8%] rounded-tl-full border-l border-t' : 'right-[8%] rounded-tr-full border-r border-t')} />
      <div className={cn('absolute bottom-[5%] top-[31%] flex flex-col gap-[3.5%]', left ? 'left-[8%] right-[6%]' : 'left-[6%] right-[8%]')}>
        <div className="flex-[3] rounded-sm border border-[#e3d6c4] bg-gradient-to-br from-ivory via-[#fbf5ea] to-[#f2e8d9] shadow-[inset_0_0_0_5px_#fffdf8,inset_0_0_0_6px_#e3d6c4,0_1px_2px_rgba(90,16,37,0.1)]">
          <div className="m-[14%] h-[72%] rounded-[2px] border border-blush/60" />
        </div>
        <div className="flex-[2] rounded-sm border border-[#e3d6c4] bg-gradient-to-br from-ivory via-[#fbf5ea] to-[#f2e8d9] shadow-[inset_0_0_0_5px_#fffdf8,inset_0_0_0_6px_#e3d6c4,0_1px_2px_rgba(90,16,37,0.1)]" />
      </div>
      {/* champagne-gold handle */}
      <div
        className={cn(
          'absolute top-[52%] h-[16%] w-[2.6%] min-w-2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#e4c987] via-gold to-[#9a7a35] shadow-[0_2px_5px_rgba(90,16,37,0.35)]',
          left ? 'right-[5%]' : 'left-[5%]',
        )}
      />
      <motion.div className="absolute inset-0 bg-[#3a1a14]" style={{ opacity: shade }} />
    </motion.div>
  )
}

export default function BoutiqueHero() {
  const reduce = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const archRef = useRef<HTMLDivElement>(null)
  const plaqueRef = useRef<HTMLDivElement>(null)
  const [opened, setOpened] = useState(false)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  // Spring smoothing keeps the doors graceful through fast flicks and touch momentum.
  const springed = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 })
  const p = reduce ? scrollYProgress : springed

  const endScale = useMotionValue(1.8)
  const shift = useMotionValue(0)

  useEffect(() => {
    const measure = () => {
      const arch = archRef.current
      const plaque = plaqueRef.current
      if (!arch || !plaque) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const W = arch.offsetWidth
      const H = arch.offsetHeight
      const header = vw >= 768 ? 76 : 64
      const needAbove = header + plaque.offsetHeight + 52
      endScale.set(Math.max(vw / W, vh / H) * 1.04)
      shift.set(Math.max(0, needAbove - (vh - H) / 2))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [endScale, shift])

  useMotionValueEvent(p, 'change', (v) => setOpened(v > 0.82))

  // 0–15% a crack of light, 40% a clear gap, 60% half open, 80% nearly open, 100% fully open.
  const angle = useTransform(p, [0, 0.15, 0.4, 0.6, 0.85, 1], reduce ? [0, 0, 0, 0, 0, 0] : [0, 3, 26, 50, 70, 82])
  const doorShade = useTransform(p, [0, 1], [0, 0.55])
  const doorFade = useTransform(p, reduce ? [0.1, 0.5] : [0, 1], reduce ? [1, 0] : [1, 1])
  const dim = useTransform(p, [0, 0.2, 0.6], [0.75, 0.6, 0])
  const glow = useTransform(p, [0, 0.2, 0.55], [0, 0.9, 0.5])
  const seamW = useTransform(p, [0, 0.12, 0.4], [2, 10, 60])
  const seamOpacity = useTransform(p, [0, 0.04, 0.3, 0.45], [0.35, 1, 0.9, 0])

  const scale = useTransform([p, endScale] as MotionValue<number>[], ([v, e]: number[]) =>
    reduce ? 1 : 1 + (e - 1) * smooth(clamp01((v - 0.2) / 0.8)),
  )
  const y = useTransform([p, shift] as MotionValue<number>[], ([v, s]: number[]) =>
    `calc(-50% + ${reduce ? s : s * (1 - smooth(clamp01((v - 0.2) / 0.8)))}px)`,
  )

  const introOpacity = useTransform(p, [0, 0.12], [1, 0])
  const introY = useTransform(p, [0, 0.12], [0, 16])
  const outroOpacity = useTransform(p, [0.8, 0.95], [0, 1])
  const veilOpacity = useTransform(p, [0.7, 1], [0, 1])

  const openDoors = () => {
    const el = sectionRef.current
    if (!el) return
    const distance = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: el.offsetTop + distance * 0.92, behavior: 'smooth' })
  }
  const goToCollection = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section ref={sectionRef} aria-label="Boutique entrance" className={cn('relative', reduce ? 'h-[150svh]' : 'h-[190svh]')}>
      <h1 className="sr-only">Renté by Kisha — dress rental boutique</h1>
      <div className="sticky top-0 h-svh overflow-hidden bg-cream">
        {/* The stage: wall, sign, doorway. It is dollied toward the doorway as the doors open. */}
        <motion.div className="absolute left-1/2 top-1/2 origin-center" style={{ x: '-50%', y, scale }}>
          <div aria-hidden className="absolute -inset-[200vmax] -z-10 bg-gradient-to-b from-[#fbf3ec] via-blush-soft to-[#f2d7d6]" />

          {/* boutique sign */}
          <div className="absolute bottom-full left-1/2 mb-11 -translate-x-1/2">
            <div
              ref={plaqueRef}
              className="aspect-[2.3/1] w-[min(62vw,16rem)] overflow-hidden rounded-xl border-2 border-gold/70 shadow-lift md:w-[17.5rem]"
            >
              <img src={logo} alt="Renté by Kisha" width={640} height={640} fetchPriority="high" className="size-full object-cover [object-position:50%_52%]" />
            </div>
            <Bow className="absolute -bottom-[2.1rem] left-1/2 w-14 -translate-x-1/2 drop-shadow" />
          </div>

          {/* side flowers */}
          <Flowers className="absolute -left-[22%] bottom-0 hidden h-40 md:block" />
          <Flowers className="absolute -right-[22%] bottom-0 hidden h-40 md:block" />

          {/* doorway */}
          <div
            ref={archRef}
            onClick={opened ? undefined : openDoors}
            className="relative h-[min(54svh,36rem)] w-[min(88vw,26rem)] cursor-pointer overflow-hidden rounded-t-[999px] bg-[#f3dcc0] shadow-[0_0_0_7px_#fffdf8,0_0_0_8px_rgba(201,164,92,0.6),0_0_0_20px_#f6e4e3,0_0_0_21px_#e8dcd2,0_30px_60px_-20px_rgba(90,16,37,0.45)] [perspective:1300px] md:w-[min(46vw,40rem)] md:h-[min(60svh,38rem)]"
          >
            <Showroom />
            <motion.div aria-hidden className="absolute inset-0 bg-[#2b120e]" style={{ opacity: dim }} />
            <motion.div
              aria-hidden
              className="absolute inset-0 [background:radial-gradient(70%_60%_at_50%_58%,rgba(255,224,160,0.85),transparent)] mix-blend-soft-light"
              style={{ opacity: glow }}
            />
            <Door side="left" angle={angle} shade={doorShade} fade={doorFade} />
            <Door side="right" angle={angle} shade={doorShade} fade={doorFade} />
            {/* warm light through the seam */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#ffe9b8] via-[#ffd98a] to-[#ffe9b8] blur-[3px]"
              style={{ width: seamW, opacity: seamOpacity }}
            />
          </div>

          {/* doorstep */}
          <div aria-hidden className="mx-auto -mt-px h-3 w-[calc(100%+3.2rem)] -translate-x-[1.6rem] rounded-b-md bg-gradient-to-b from-[#f5ece0] to-[#e5d6c3] shadow-[0_14px_20px_-10px_rgba(90,16,37,0.3)]" />
        </motion.div>

        {/* opening prompts */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--bottom-nav-h)+0.75rem)] z-10 flex flex-col items-center text-center md:bottom-7"
        >
          <p className="text-[0.8rem] font-medium uppercase tracking-[0.32em] text-burgundy md:text-sm">Discover the collection</p>
          <button
            type="button"
            onClick={openDoors}
            className="pointer-events-auto mt-1 flex min-h-11 flex-col items-center px-6 text-[0.8rem] font-medium uppercase tracking-[0.28em] text-burgundy-soft md:text-sm"
          >
            Scroll to open
            <ChevronDown className="mt-0.5 size-5 animate-nudge" aria-hidden />
          </button>
        </motion.div>

        {/* a veil that melts the showroom into the catalogue */}
        <motion.div aria-hidden style={{ opacity: veilOpacity }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-cream via-cream/80 to-transparent" />
        <motion.div
          style={{ opacity: outroOpacity }}
          className="absolute inset-x-0 bottom-[calc(var(--bottom-nav-h)+1rem)] z-10 flex flex-col items-center text-center md:bottom-10"
          aria-hidden={!opened}
        >
          <p className="font-script-title text-4xl text-burgundy md:text-5xl">Feel Beautiful</p>
          <button
            type="button"
            tabIndex={opened ? 0 : -1}
            onClick={goToCollection}
            className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-burgundy px-7 text-[0.95rem] font-medium tracking-wide text-ivory shadow-soft transition-colors hover:bg-burgundy-soft"
            style={{ pointerEvents: opened ? 'auto' : 'none' }}
          >
            Browse the collection
            <ChevronDown className="size-4" aria-hidden />
          </button>
        </motion.div>

        {/* skip link for keyboard / screen-reader users */}
        <button
          type="button"
          onClick={goToCollection}
          className="sr-only focus:not-sr-only focus:absolute focus:left-1/2 focus:top-24 focus:z-20 focus:-translate-x-1/2 focus:rounded-full focus:bg-burgundy focus:px-5 focus:py-3 focus:text-ivory"
        >
          Skip to the collection
        </button>
      </div>
    </section>
  )
}
