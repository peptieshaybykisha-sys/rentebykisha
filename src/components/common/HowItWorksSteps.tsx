import { useHowItWorks } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import { STEP_ICONS } from './StepIcon'

export default function HowItWorksSteps() {
  const { steps } = useHowItWorks()
  return (
    <ol
      className={cn(
        'relative mx-auto grid max-w-6xl gap-9 lg:gap-6',
        steps.length >= 5 ? 'lg:grid-cols-5' : steps.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
      )}
    >
      {/* connecting thread */}
      <span aria-hidden className="absolute bottom-6 left-[1.75rem] top-6 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent lg:hidden" />
      <span aria-hidden className="absolute left-[10%] right-[10%] top-[1.75rem] hidden h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent lg:block" />
      {steps.map(({ icon, title, text }, i) => {
        const Icon = STEP_ICONS[icon] ?? STEP_ICONS.sparkles
        return (
          <li key={`${title}-${i}`} className="relative flex items-start gap-5 lg:flex-col lg:items-center lg:text-center">
            <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-gold/50 bg-cream text-burgundy">
              <Icon className="size-6" strokeWidth={1.3} aria-hidden />
            </span>
            <div>
              <p className="font-serif text-lg italic text-gold-deep">0{i + 1}</p>
              <h3 className="text-2xl">{title}</h3>
              <p className="mt-1 max-w-[16rem] text-[0.95rem] text-muted">{text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
