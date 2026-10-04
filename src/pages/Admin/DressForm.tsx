import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Loader2, Plus, X } from 'lucide-react'
import { MoveButtons, NotConfigured } from '@/components/admin/AdminShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { CATEGORIES, SIZE_PRESETS } from '@/constants/catalog'
import { useDress } from '@/hooks/useDresses'
import { deleteDress, deleteImages, newDressId, saveDress, uploadDressImage } from '@/lib/adminApi'
import { isFirebaseConfigured } from '@/lib/firebase'
import { cn, formatShort, move } from '@/lib/utils'
import { useToastStore } from '@/stores'
import type { Category, DateRange, Dress, DressImage } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Give the dress a name.'),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  colorName: z.string().trim(),
  price: z.number('Enter the rental price.').min(0, 'Price cannot be negative.'),
  deposit: z.number('Enter the security deposit.').min(0, 'Deposit cannot be negative.'),
  description: z.string().trim().min(10, 'Add a short description (at least 10 characters).'),
  details: z.string(),
  status: z.enum(['available', 'unavailable']),
  featured: z.boolean(),
})
type Values = z.infer<typeof schema>

export default function DressForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const { dress, loading } = useDress(isNew ? undefined : id)
  if (!isFirebaseConfigured) return <NotConfigured />
  if (!isNew && loading) return <p className="text-muted">Loading…</p>
  if (!isNew && !dress)
    return (
      <Notice>
        We could not find that dress. <Link to="/admin" className="underline">Back to dresses</Link>
      </Notice>
    )
  return <Editor key={dress?.id ?? 'new'} dress={dress} />
}

function Editor({ dress }: { dress?: Dress }) {
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)
  const [dressId] = useState(() => dress?.id ?? newDressId())
  const [images, setImages] = useState<DressImage[]>(dress?.images ?? [])
  const [removed, setRemoved] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>(dress?.sizes ?? [])
  const [sizeInput, setSizeInput] = useState('')
  const [blocked, setBlocked] = useState<DateRange[]>(dress?.bookedRanges ?? [])
  const [range, setRange] = useState({ start: '', end: '' })
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const [sizeError, setSizeError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: dress?.name ?? '',
      category: dress?.category ?? 'Evening',
      colorName: dress?.colorName ?? '',
      price: dress?.price,
      deposit: dress?.deposit,
      description: dress?.description ?? '',
      details: dress?.details.join('\n') ?? '',
      status: dress?.status ?? 'available',
      featured: dress?.featured ?? false,
    },
  })

  const addSize = (raw: string) => {
    const s = raw.trim()
    if (!s) return
    setSizeError('')
    setSizes((cur) => (cur.some((x) => x.toLowerCase() === s.toLowerCase()) ? cur : [...cur, s]))
    setSizeInput('')
  }

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError('')
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1)
      try {
        const img = await uploadDressImage(dressId, file)
        setImages((cur) => [...cur, img])
      } catch (e) {
        setError(e instanceof Error ? `Photo upload failed: ${e.message}` : 'Photo upload failed.')
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const removeImage = (i: number) => {
    const img = images[i]
    setImages((cur) => cur.filter((_, k) => k !== i))
    if (dress?.images.some((x) => x.path === img.path)) setRemoved((r) => [...r, img.path])
    else void deleteImages([img.path])
  }

  const onSubmit = async (v: Values) => {
    setError('')
    if (!sizes.length) return setSizeError('Add at least one size.')
    try {
      await saveDress(dressId, {
        name: v.name,
        category: v.category,
        colorName: v.colorName,
        price: v.price,
        deposit: v.deposit,
        description: v.description,
        details: v.details.split('\n').map((l) => l.trim()).filter(Boolean),
        sizes,
        status: v.status,
        featured: v.featured,
        images: images.map((im) => ({ ...im, alt: im.alt || v.name })),
        bookedRanges: blocked,
        createdAt: dress?.createdAt
      })
      if (removed.length) await deleteImages(removed)
      push(dress ? 'Dress updated.' : 'Dress added.')
      navigate('/admin')
    } catch (e) {
      setError(e instanceof Error ? `We could not save: ${e.message}` : 'We could not save this dress.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-3xl space-y-10">
      <div>
        <Link to="/admin" className="link-underline text-[0.95rem] text-burgundy">
          ← All dresses
        </Link>
        <h1 className="mt-2 text-4xl">{dress ? dress.name : 'Add a dress'}</h1>
      </div>

      {error && <Notice>{error}</Notice>}

      <section aria-labelledby="photos" className="space-y-3">
        <h2 id="photos" className="font-sans text-lg font-medium text-ink">
          Photos
        </h2>
        <p className="text-sm text-muted">The first photo is the cover. Use clear, vertical photos. They are resized automatically.</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((im, i) => (
            <li key={im.path} className="rounded-2xl border border-line bg-ivory p-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-blush-soft">
                <img src={im.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-burgundy px-2.5 py-0.5 text-xs text-ivory">Cover</span>}
              </div>
              <div className="mt-1 flex justify-between">
                <MoveButtons index={i} count={images.length} label={`photo ${i + 1}`} onMove={(to) => setImages((c) => move(c, i, to))} onRemove={() => removeImage(i)} />
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`up-${i}`} className="grid aspect-[3/4] place-items-center rounded-2xl border border-dashed border-blush bg-blush-soft/40 text-burgundy" aria-label="Uploading photo">
              <Loader2 className="size-6 animate-spin" aria-hidden />
            </li>
          ))}
          <li>
            <input ref={fileInput} type="file" accept="image/*" multiple className="sr-only" aria-label="Upload photos" onChange={(e) => { void onFiles(e.target.files); e.target.value = '' }} />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blush bg-ivory text-burgundy transition-colors hover:bg-blush-soft/40"
            >
              <ImagePlus className="size-7" strokeWidth={1.3} aria-hidden />
              Add photos
            </button>
          </li>
        </ul>
      </section>

      <section aria-labelledby="basics" className="space-y-5">
        <h2 id="basics" className="font-sans text-lg font-medium text-ink">
          Details
        </h2>
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Category" {...register('category')}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Input label="Colour" placeholder="Burgundy" {...register('colorName')} />
          <Input label="Rental price (₱)" type="number" inputMode="numeric" min={0} error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
          <Input label="Security deposit (₱)" type="number" inputMode="numeric" min={0} error={errors.deposit?.message} {...register('deposit', { valueAsNumber: true })} />
        </div>
        <Textarea label="Description" rows={4} error={errors.description?.message} {...register('description')} />
        <Textarea label="Fabric and care notes" rows={4} hint="One note per line, like “Hidden back zip” or “Floor length”." {...register('details')} />
      </section>

      <fieldset className="space-y-3">
        <legend className="font-sans text-lg font-medium text-ink">Sizes this dress comes in</legend>
        <ul className="flex flex-wrap gap-2" aria-label="Selected sizes">
          {sizes.map((s) => (
            <li key={s} className="flex items-center gap-1 rounded-full bg-burgundy py-1 pl-4 pr-1 text-ivory">
              {s}
              <button type="button" onClick={() => setSizes((c) => c.filter((x) => x !== s))} aria-label={`Remove size ${s}`} className="grid size-8 place-items-center rounded-full hover:bg-burgundy-soft">
                <X className="size-4" />
              </button>
            </li>
          ))}
          {sizes.length === 0 && <li className="text-muted">No sizes yet.</li>}
        </ul>
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.filter((p) => !sizes.includes(p)).map((p) => (
            <button key={p} type="button" onClick={() => addSize(p)} className="min-h-10 rounded-full border border-line bg-ivory px-4 text-sm hover:border-burgundy">
              + {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label htmlFor="custom-size" className="sr-only">
            Custom size
          </label>
          <input
            id="custom-size"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSize(sizeInput)
              }
            }}
            placeholder="Custom size, like 6 or S/M"
            className="min-h-12 flex-1 rounded-xl border border-line bg-ivory px-4 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          />
          <Button variant="secondary" onClick={() => addSize(sizeInput)}>
            Add size
          </Button>
        </div>
        {sizeError && (
          <p role="alert" className="text-sm text-red-800">
            {sizeError}
          </p>
        )}
      </fieldset>

      <section aria-labelledby="avail" className="space-y-4">
        <h2 id="avail" className="font-sans text-lg font-medium text-ink">
          Availability
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Status" {...register('status')}>
            <option value="available">Available to rent</option>
            <option value="unavailable">Unavailable (hidden from booking)</option>
          </Select>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 self-end">
            <input type="checkbox" className="size-5 accent-[var(--color-burgundy)]" {...register('featured')} />
            Show in “Featured dresses”
          </label>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Blocked dates</p>
          <p className="mb-2 text-sm text-muted">Block dates when this dress cannot be rented, like cleaning or an outside booking.</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              From
              <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="mt-1 block min-h-12 rounded-xl border border-line bg-ivory px-3" />
            </label>
            <label className="text-sm">
              To
              <input type="date" value={range.end} min={range.start} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="mt-1 block min-h-12 rounded-xl border border-line bg-ivory px-3" />
            </label>
            <Button
              variant="secondary"
              disabled={!range.start || !range.end || range.end < range.start}
              onClick={() => {
                setBlocked((b) => [...b, range])
                setRange({ start: '', end: '' })
              }}
            >
              <Plus className="size-4" aria-hidden /> Block
            </Button>
          </div>
          {blocked.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {blocked.map((b, i) => (
                <li key={i} className="flex items-center gap-1 rounded-full bg-blush-soft py-1 pl-4 pr-1 text-burgundy">
                  {b.start === b.end ? formatShort(b.start) : `${formatShort(b.start)} – ${formatShort(b.end)}`}
                  <button type="button" onClick={() => setBlocked((c) => c.filter((_, k) => k !== i))} aria-label="Remove blocked dates" className="grid size-8 place-items-center rounded-full hover:bg-blush">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className={cn('sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-line bg-cream/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8')}>
        <Button type="submit" size="lg" loading={isSubmitting} disabled={uploading > 0}>
          {dress ? 'Save changes' : 'Add dress'}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Cancel
        </Button>
        {dress && (
          <Button variant="ghost" className="ml-auto text-red-800" onClick={() => setConfirmDelete(true)}>
            Delete dress
          </Button>
        )}
      </div>

      {dress && (
        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this dress?">
          <p className="text-muted">
            {dress.name} and its photos will be removed from the site. Existing rentals keep their record.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              className="bg-red-800 hover:bg-red-900"
              onClick={async () => {
                await deleteDress(dress)
                push('Dress deleted.')
                navigate('/admin')
              }}
            >
              Yes, delete
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
          </div>
        </Dialog>
      )}
    </form>
  )
}
