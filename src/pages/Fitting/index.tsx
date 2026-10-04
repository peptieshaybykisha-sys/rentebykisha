import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, getDay, isBefore, startOfDay } from 'date-fns'
import { z } from 'zod'
import { CalendarCheck } from 'lucide-react'
import Calendar from '@/components/common/Calendar'
import Container from '@/components/common/Container'
import { Notice } from '@/components/common/States'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { useDressList } from '@/hooks/useDresses'
import { bookFitting, bookedSlots } from '@/lib/api'
import { STUDIO } from '@/lib/config'
import { phoneSchema } from '@/lib/validation'
import { cn, formatLong } from '@/lib/utils'
import { useAuthStore, useMockDb } from '@/stores'
import type { FittingAppointment } from '@/types'

const SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

/** Deterministic "already taken" slots so the demo always shows some variety. */
const hashTaken = (date: string, slot: string) => [...(date + slot)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 7, 0) === 0

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.'),
  phone: phoneSchema,
  dressId: z.string(),
  date: z.string().min(1, 'Please choose a date.'),
  time: z.string().min(1, 'Please choose a time.'),
})
type Values = z.infer<typeof schema>

export default function Fitting() {
  const dresses = useDressList()
  const user = useAuthStore((s) => s.user)
  useMockDb((s) => s.fittings) // re-render when slots change
  const [booked, setBooked] = useState<FittingAppointment | null>(null)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '', dressId: '', date: '', time: '' },
  })
  const date = watch('date')
  const time = watch('time')
  const taken = date ? bookedSlots(date) : []
  const earliest = addDays(startOfDay(new Date()), 1)

  const onSubmit = async (v: Values) => {
    setError('')
    try {
      setBooked(await bookFitting({ ...v, dressId: v.dressId || undefined, userId: user?.id }))
    } catch (e) {
      setValue('time', '')
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  if (booked) {
    const dress = dresses.find((d) => d.id === booked.dressId)
    return (
      <Container className="max-w-xl py-20 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-burgundy text-ivory">
          <CalendarCheck className="size-8" aria-hidden />
        </span>
        <h1 className="mt-6 text-5xl">Your fitting is booked.</h1>
        <p className="mt-4 font-serif text-3xl text-burgundy-soft">
          {formatLong(booked.date)} at {booked.time}
        </p>
        <p className="mt-3 text-muted">
          {STUDIO.name}{dress ? ` · We will have the ${dress.name} ready for you` : ''}. We will text {booked.phone} to confirm.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/dresses" size="lg">
            Browse dresses
          </ButtonLink>
          {user && (
            <ButtonLink to="/account?tab=fittings" variant="secondary" size="lg">
              My fittings
            </ButtonLink>
          )}
        </div>
      </Container>
    )
  }

  return (
    <Container className="max-w-5xl pb-8">
      <header className="pb-10 pt-10 text-center sm:pt-14">
        <p className="font-script-title text-5xl text-burgundy-soft sm:text-6xl">Schedule My Fitting</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Try it on before you decide</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          Fittings take about 30 minutes at {STUDIO.name} ({STUDIO.hours}). Closed on Sundays.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Input label="Phone" type="tel" autoComplete="tel" placeholder="0917 123 4567" error={errors.phone?.message} {...register('phone')} />
          <Select label="Preferred dress (optional)" {...register('dressId')}>
            <option value="">I would like to see a few</option>
            {dresses
              .filter((d) => d.status === 'available')
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </Select>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Time</legend>
            {!date ? (
              <p className="text-muted">Choose a date to see available times.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                {SLOTS.map((s) => {
                  const unavailable = taken.includes(s) || hashTaken(date, s)
                  return (
                    <label key={s} className={cn(unavailable ? 'cursor-not-allowed' : 'cursor-pointer')}>
                      <input
                        type="radio"
                        className="peer sr-only"
                        disabled={unavailable}
                        checked={time === s}
                        onChange={() => setValue('time', s, { shouldValidate: true })}
                      />
                      <span
                        className={cn(
                          'grid min-h-11 place-items-center rounded-full border text-[0.95rem] transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-burgundy',
                          unavailable
                            ? 'border-line bg-cream text-muted/50 line-through'
                            : 'border-line bg-ivory hover:border-burgundy peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-ivory',
                        )}
                      >
                        {s}
                        {unavailable && <span className="sr-only"> (unavailable)</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
            {errors.time && date && (
              <p role="alert" className="mt-2 text-sm text-red-800">
                {errors.time.message}
              </p>
            )}
          </fieldset>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Date</p>
          <Calendar
            start={date || undefined}
            onPick={(iso) => {
              setValue('date', iso, { shouldValidate: true })
              setValue('time', '')
            }}
            isDisabled={(d) => isBefore(d, earliest) || getDay(d) === 0}
            minMonth={earliest}
          />
          {errors.date && (
            <p role="alert" className="mt-2 text-sm text-red-800">
              {errors.date.message}
            </p>
          )}
          {error && <Notice className="mt-4">{error}</Notice>}
          <Button type="submit" size="lg" loading={isSubmitting} className="mt-6 w-full">
            Book my fitting
          </Button>
          {!user && (
            <p className="mt-3 text-center text-sm text-muted">
              <Link to="/login" className="link-underline text-burgundy">
                Log in
              </Link>{' '}
              to see your fittings in your account.
            </p>
          )}
        </div>
      </form>
    </Container>
  )
}
