import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, Check, ImagePlus, Truck, Store } from 'lucide-react'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { DELIVERY_FEE, GCASH, STUDIO } from '@/constants/business'
import { CHECKOUT_STEP_LABELS } from '@/constants/checkout'
import { receiptToDataUrl } from '@/lib/image'
import { customerSchema } from '@/lib/validation'
import { cn, formatPeso, formatRange } from '@/lib/utils'
import { useDressLookup } from '@/hooks/useDresses'
import type { CartItem, CustomerInfo, Fulfillment } from '@/types'

/* ---------- Stepper ---------- */
export function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4" aria-label="Checkout progress">
      {CHECKOUT_STEP_LABELS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const current = n === step
        return (
          <li key={label} aria-current={current ? 'step' : undefined} className="flex items-center gap-2 sm:gap-4">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-full border text-sm font-medium transition-colors',
                  done && 'border-burgundy bg-burgundy text-ivory',
                  current && 'border-burgundy text-burgundy',
                  !done && !current && 'border-line text-muted',
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : n}
              </span>
              <span className={cn('text-[0.95rem] max-sm:sr-only', current ? 'font-medium text-burgundy' : 'text-muted')}>{label}</span>
            </span>
            {n < CHECKOUT_STEP_LABELS.length && <span aria-hidden className="h-px w-6 bg-line sm:w-12" />}
          </li>
        )
      })}
    </ol>
  )
}

/* ---------- Step 1 ---------- */
export function CustomerStep({ defaults, onNext }: { defaults: CustomerInfo; onNext: (c: CustomerInfo) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfo>({ resolver: zodResolver(customerSchema), defaultValues: defaults })
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5">
      <h2 className="text-4xl">Your details</h2>
      <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input label="Phone" type="tel" autoComplete="tel" placeholder="0917 123 4567" hint="We will text you about pickup and delivery." error={errors.phone?.message} {...register('phone')} />
      <Button type="submit" size="lg" className="w-full sm:w-auto sm:px-12">
        Continue
      </Button>
    </form>
  )
}

/* ---------- Step 2 ---------- */
const detailsSchema = z
  .object({ fulfillment: z.enum(['delivery', 'pickup']), address: z.string(), notes: z.string() })
  .refine((v) => v.fulfillment === 'pickup' || v.address.trim().length >= 8, {
    path: ['address'],
    message: 'Please enter a complete delivery address.',
  })
type DetailsValues = z.infer<typeof detailsSchema>

export function DetailsStep({
  items,
  defaults,
  onBack,
  onNext,
}: {
  items: CartItem[]
  defaults: DetailsValues
  onBack: () => void
  onNext: (v: DetailsValues) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema), defaultValues: defaults })
  const fulfillment = watch('fulfillment')
  const getDress = useDressLookup()

  const options: { value: Fulfillment; title: string; text: string; icon: typeof Truck }[] = [
    { value: 'delivery', title: 'Delivery', text: `${formatPeso(DELIVERY_FEE)} · Metro Manila`, icon: Truck },
    { value: 'pickup', title: 'Studio pickup', text: `Free · ${STUDIO.hours}`, icon: Store },
  ]

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-8">
      <h2 className="text-4xl">Rental details</h2>

      <fieldset>
        <legend className="mb-3 font-medium">How would you like to receive your dress?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map(({ value, title, text, icon: Icon }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" value={value} className="peer sr-only" {...register('fulfillment')} />
              <span className="flex min-h-20 items-center gap-4 rounded-2xl border border-line bg-ivory p-4 transition-colors peer-checked:border-burgundy peer-checked:bg-blush-soft/60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-burgundy">
                <Icon className="size-6 shrink-0 text-burgundy" strokeWidth={1.4} aria-hidden />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="text-[0.95rem] text-muted">{text}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {fulfillment === 'delivery' ? (
        <Textarea label="Delivery address" autoComplete="street-address" placeholder="House no., street, barangay, city" error={errors.address?.message} {...register('address')} />
      ) : (
        <Notice tone="info">Pick up at {STUDIO.name} during {STUDIO.hours}. We will message you the address and a time once your rental is confirmed.</Notice>
      )}

      <section aria-labelledby="your-dates">
        <h3 id="your-dates" className="mb-3 font-sans text-base font-medium text-ink">
          Your rental dates
        </h3>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-ivory">
          {items.map((it) => {
            const d = getDress(it.dressId)
            return (
              <li key={it.dressId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>
                  <span className="font-serif text-xl text-burgundy">{d?.name}</span>
                  <span className="text-muted"> · Size {it.size}</span>
                </span>
                <span className="flex items-center gap-2 text-[0.95rem]">
                  <CalendarDays className="size-4 text-burgundy-soft" aria-hidden />
                  {formatRange(it.startDate, it.endDate)}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-sm text-muted">Need different dates? Change them in your rental cart.</p>
      </section>

      <Textarea label="Notes for our team (optional)" placeholder="Event date, preferred time, alterations…" {...register('notes')} />

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none sm:px-12">
          Continue to payment
        </Button>
      </div>
    </form>
  )
}

/* ---------- Step 3 ---------- */
export function PaymentStep({
  total,
  receipt,
  onReceipt,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  total: number
  receipt: { name: string; dataUrl: string } | null
  onReceipt: (r: { name: string; dataUrl: string } | null) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  error: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')
  const [missing, setMissing] = useState(false)

  const pick = async (file?: File) => {
    if (!file) return
    setUploadError('')
    try {
      onReceipt({ name: file.name, dataUrl: await receiptToDataUrl(file) })
      setMissing(false)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-4xl">Payment</h2>

      <div className="rounded-3xl bg-burgundy p-6 text-blush-soft sm:p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-blush">GCash manual payment</p>
        <p className="mt-4 font-serif text-5xl text-ivory">GCash</p>
        <p className="mt-3 text-3xl tracking-wider tabular-nums text-ivory">{GCASH.number}</p>
        <p className="mt-1 text-lg">{GCASH.name}</p>
        <p className="mt-5 border-t border-blush-soft/20 pt-4">
          Please send <strong className="font-semibold text-ivory">{formatPeso(total)}</strong>, then upload your receipt below.
        </p>
      </div>

      <div>
        <p id="receipt-label" className="mb-2 font-medium">
          Upload Payment Receipt
        </p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-labelledby="receipt-label"
          onChange={(e) => {
            void pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {receipt ? (
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-ivory p-3">
            <img src={receipt.dataUrl} alt="Your uploaded receipt" className="h-24 w-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{receipt.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-sage">
                <Check className="size-4" aria-hidden /> Receipt attached
              </p>
              <div className="mt-1 flex gap-4">
                <button type="button" onClick={() => input.current?.click()} className="link-underline min-h-11 text-[0.95rem] text-burgundy">
                  Replace
                </button>
                <button type="button" onClick={() => onReceipt(null)} className="min-h-11 text-[0.95rem] text-muted hover:text-burgundy">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn(
              'flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-ivory px-4 text-center transition-colors hover:border-burgundy hover:bg-blush-soft/40',
              missing ? 'border-red-700' : 'border-blush',
            )}
          >
            <ImagePlus className="size-8 text-burgundy" strokeWidth={1.3} aria-hidden />
            <span className="font-medium text-burgundy">Choose a screenshot or photo</span>
            <span className="text-sm text-muted">JPG or PNG, up to 8 MB</span>
          </button>
        )}
        {(uploadError || missing) && (
          <p role="alert" className="mt-2 text-sm text-red-800">
            {uploadError || 'Please upload your GCash receipt to continue.'}
          </p>
        )}
        <p className="mt-3 text-sm text-muted">Payment will be manually verified by our team.</p>
      </div>

      {error && (
        <Notice>
          <strong className="font-medium">We could not submit your rental.</strong> {error}
        </Notice>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="lg" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button
          size="lg"
          loading={submitting}
          className="flex-1 sm:flex-none sm:px-12"
          onClick={() => {
            if (!receipt) return setMissing(true)
            onSubmit()
          }}
        >
          Submit Rental Request
        </Button>
      </div>
    </div>
  )
}
