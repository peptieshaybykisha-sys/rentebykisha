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
import logo from '@/assets/logo.png'
import { DOOR_ANGLES, DOOR_ANGLES_REDUCED, DOOR_PROGRESS } from '@/constants/home'
import { cn } from '@/lib/utils'
import Door, { DoorFrame, Fanlight, Spandrel } from './Door'
import Showroom from './Showroom'
import { WallPoster } from './HeroPosters'
import { LeftSuite, RightSuite } from './SideDecor'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

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

  useEffect(() => {
    const measure = () => {
      const arch = archRef.current
      if (!arch) return
      endScale.set(Math.max(window.innerWidth / arch.offsetWidth, window.innerHeight / arch.offsetHeight) * 1.04)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    if (archRef.current) ro.observe(archRef.current)
    return () => ro.disconnect()
  }, [endScale])

  useMotionValueEvent(p, 'change', (v) => setOpened(v > 0.82))

  // 0–15% a crack of light, 40% a clear gap, 60% half open, 80% nearly open, 100% fully open.
  const angle = useTransform(p, DOOR_PROGRESS, reduce ? DOOR_ANGLES_REDUCED : DOOR_ANGLES)
  const doorShade = useTransform(p, [0, 1], [0, 0.55])
  const doorFade = useTransform(p, reduce ? [0.1, 0.5] : [0, 1], reduce ? [1, 0] : [1, 1])
  // the fixed fanlight and door heads dissolve as the doors swing clear
  const headFade = useTransform(p, reduce ? [0.1, 0.5] : [0.55, 0.85], [1, 0])
  const dim = useTransform(p, [0, 0.2, 0.6], [0.75, 0.6, 0])
  const glow = useTransform(p, [0, 0.2, 0.55], [0, 0.9, 0.5])
  const seamW = useTransform(p, [0, 0.12, 0.4], [2, 10, 60])
  const seamOpacity = useTransform(p, [0, 0.04, 0.3, 0.45], [0.35, 1, 0.9, 0])

  const scale = useTransform([p, endScale] as MotionValue<number>[], ([v, e]: number[]) =>
    reduce ? 1 : 1 + (e - 1) * smooth(clamp01((v - 0.2) / 0.8)),
  )
  // --hero-shift is pure CSS, so it is right on the first paint; it lowers the scene so the sign clears the header.
  const y = useTransform(p, (v) => `calc(-50% + var(--hero-shift) * ${reduce ? 1 : 1 - smooth(clamp01((v - 0.2) / 0.8))})`)

  const introOpacity = useTransform(p, [0, 0.12], [1, 0])
  const vignette = useTransform(p, [0, 0.4], [1, 0])
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
      <div className="sticky top-0 h-svh overflow-hidden bg-cream [--hero-shift:max(0px,calc(64px+4.6rem+80px-(100svh-min(52svh,36rem))/2))] md:[--hero-shift:max(0px,calc(76px+4.8rem+80px-(100svh-min(60svh,40rem))/2))]">
        {/* The stage: wall, sign, doorway. It is dollied toward the doorway as the doors open. */}
        <motion.div className="absolute left-1/2 top-1/2 origin-center" style={{ x: '-50%', y, scale }}>
          <div aria-hidden className="absolute -inset-[200vmax] -z-10 bg-gradient-to-b from-[#faf2f1] via-[#f3e4e4] to-[#ead6d6]" />

          {/* boutique sign: hangs by its chain from the keystone, in front of the fanlight */}
          <div className="absolute left-1/2 top-0 z-20 -mt-[2.6rem] -translate-x-1/2">
            <div ref={plaqueRef} className="dr-sway aspect-square w-[min(40vw,10rem)] md:w-[12rem]">
              <img src={logo} alt="Renté by Kisha" width={500} height={500} fetchPriority="high" className="size-full object-contain drop-shadow-[0_14px_14px_rgba(90,16,37,0.35)]" />
            </div>
          </div>

          {/* wall mouldings, floor and the plaster architrave */}
          <motion.div style={{ opacity: introOpacity }} className="hidden md:block">
            <WallPoster title="Timeless Elegance" caption="From intimate gatherings to life's grandest moments." className="-left-[calc(11rem+9rem)] bottom-0 top-[10%] w-[11rem]" />
            <WallPoster title="Curated Collections" caption="Designer-inspired dresses for every occasion." tone="wine" className="left-[calc(100%+9rem)] bottom-0 top-[10%] w-[11rem]" />
            <LeftSuite className="absolute -bottom-[0.8rem] -left-[32.2rem] z-[1] hidden aspect-[114/198] w-[11rem] xl:block" />
            <RightSuite className="absolute -bottom-[0.8rem] left-[calc(100%+19rem)] z-[1] hidden aspect-[120/222] w-[14.6rem] xl:block" />
          </motion.div>
          <div aria-hidden className="dr-floor" />
          <DoorFrame />

          {/* doorway */}
          <div
            ref={archRef}
            onClick={opened ? undefined : openDoors}
            className="relative flex h-[min(52svh,36rem)] w-[min(88vw,26rem)] cursor-pointer flex-col overflow-hidden rounded-t-[999px] bg-[#f3dcc0] shadow-[inset_0_0_14px_rgba(70,20,34,0.45)] md:aspect-[5/8] md:h-[min(60svh,40rem)] md:w-auto"
          >
            <Showroom />
            <motion.div aria-hidden className="absolute inset-0 bg-[#2b120e]" style={{ opacity: dim }} />
            <motion.div
              aria-hidden
              className="absolute inset-0 [background:radial-gradient(70%_60%_at_50%_58%,rgba(255,224,160,0.85),transparent)] mix-blend-soft-light"
              style={{ opacity: glow }}
            />
            <Fanlight fade={headFade} />
            <div className="relative min-h-0 flex-1 [perspective:1300px]">
              <Spandrel side="left" fade={headFade} />
              <Spandrel side="right" fade={headFade} />
              <Door side="left" angle={angle} shade={doorShade} fade={doorFade} />
              <Door side="right" angle={angle} shade={doorShade} fade={doorFade} />
              {/* warm light through the seam */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#ffe9b8] via-[#ffd98a] to-[#ffe9b8] blur-[3px]"
                style={{ width: seamW, opacity: seamOpacity }}
              />
            </div>
          </div>

          {/* sunlight falling across the doorway */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[30%] -inset-y-[10%] opacity-40 blur-[12px] mix-blend-soft-light [background:repeating-linear-gradient(115deg,transparent_0_9%,rgba(255,255,255,0.95)_9%_17%,transparent_17%_24%,rgba(255,255,255,0.6)_24%_28%)]"
            style={{ maskImage: 'linear-gradient(135deg,transparent 10%,#000 45%,#000 70%,transparent 95%)', WebkitMaskImage: 'linear-gradient(135deg,transparent 10%,#000 45%,#000 70%,transparent 95%)' }}
          />

          {/* doorstep */}
          <div aria-hidden className="absolute left-1/2 top-full mt-[2.3rem] h-3 w-[calc(100%+6.4rem)] md:w-[calc(100%+16rem)] -translate-x-1/2 rounded-b-md bg-gradient-to-b from-[#f8f0ee] to-[#e6d6d4] shadow-[0_14px_20px_-10px_rgba(90,16,37,0.3)]" />
        </motion.div>

        {/* soft vignette: the corners of the room fall into shadow */}
        <motion.div
          aria-hidden
          style={{ opacity: vignette }}
          className="pointer-events-none absolute inset-0 [background:radial-gradient(130%_95%_at_50%_46%,transparent_52%,rgba(90,16,37,0.22)_100%),linear-gradient(180deg,rgba(90,16,37,0.10),transparent_16%)]"
        />

        {/* opening prompts */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--bottom-nav-h)+0.75rem)] z-10 flex flex-col items-center text-center md:bottom-7"
        >
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
