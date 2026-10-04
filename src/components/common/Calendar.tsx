import { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WEEKDAYS } from '@/constants/fitting'
import { cn, fromISODate, toISODate } from '@/lib/utils'

interface Props {
  start?: string
  end?: string
  onPick: (iso: string) => void
  isDisabled: (d: Date) => boolean
  isStruck?: (d: Date) => boolean
  minMonth?: Date
  initialMonth?: Date
  className?: string
}

export default function Calendar({ start, end, onPick, isDisabled, isStruck, minMonth = new Date(), initialMonth, className }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(initialMonth ?? (start ? fromISODate(start) : new Date())))
  const days = eachDayOfInterval({ start: startOfWeek(month), end: endOfWeek(endOfMonth(month)) })
  const s = start ? fromISODate(start) : undefined
  const e = end ? fromISODate(end) : s
  const canPrev = startOfMonth(subMonths(month, 1)) >= startOfMonth(minMonth)

  return (
    <div className={cn('rounded-3xl border border-line bg-ivory p-4 sm:p-5', className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          disabled={!canPrev}
          aria-label="Previous month"
          className="grid size-11 place-items-center rounded-full text-burgundy hover:bg-blush-soft disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p aria-live="polite" className="font-serif text-2xl text-burgundy">
          {format(month, 'MMMM yyyy')}
        </p>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Next month"
          className="grid size-11 place-items-center rounded-full text-burgundy hover:bg-blush-soft"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm text-muted" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7" role="group" aria-label={format(month, 'MMMM yyyy')}>
        {days.map((day) => {
          if (!isSameMonth(day, month)) return <span key={day.toISOString()} />
          const disabled = isDisabled(day)
          const struck = isStruck?.(day)
          const isStart = !!s && isSameDay(day, s)
          const isEnd = !!e && isSameDay(day, e)
          const inRange = !!s && !!e && day > s && day < e
          const edge = isStart || isEnd
          return (
            <div key={day.toISOString()} className={cn('relative p-px', inRange && 'bg-blush-soft', isStart && e && !isSameDay(s!, e) && 'rounded-l-full bg-blush-soft', isEnd && s && !isSameDay(s, e) && 'rounded-r-full bg-blush-soft')}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(toISODate(day))}
                aria-pressed={edge || inRange}
                aria-label={`${format(day, 'EEEE, MMMM d')}${struck ? ', reserved' : ''}${isStart ? ', pick-up' : ''}${isEnd && !isStart ? ', return' : ''}`}
                className={cn(
                  'grid aspect-square w-full min-h-10 place-items-center rounded-full text-base transition-colors',
                  edge ? 'bg-burgundy text-ivory' : 'hover:bg-blush-soft',
                  disabled && 'cursor-not-allowed text-muted/45 hover:bg-transparent',
                  struck && 'line-through decoration-burgundy-soft/50',
                  isSameDay(day, new Date()) && !edge && 'font-semibold text-burgundy',
                )}
              >
                {format(day, 'd')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
