import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { MoveButtons, NotConfigured } from '@/components/admin/AdminShell'
import { ShowroomImage } from '@/components/home/Showroom'
import defaultShowroom from '@/assets/closets1.jpg'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { DEFAULT_SHOWROOM, SHOWROOM_LIMITS } from '@/constants/home'
import { DEFAULT_HOW_IT_WORKS, MAX_STEPS, STEP_ICON_NAMES, STEP_ICONS } from '@/constants/howItWorks'
import { deleteImages, saveSetting, uploadShowroomImage, uploadTermsImage } from '@/lib/adminApi'
import { isSupabaseConfigured } from '@/lib/supabase'
import { move } from '@/lib/utils'
import { notify } from '@/lib/toast'
import { useCatalog } from '@/stores/catalog'
import type { HeroContent, HowItWorksContent, NavigationContent, NavItem, StepIconName, TermsContent } from '@/types'
import { DEFAULT_NAVIGATION, MAX_FOOTER_COLUMNS, MAX_FOOTER_ITEMS, MAX_NAV_LINKS } from '@/constants/navigation'

/** Wraps an editor: waits for the saved content, then offers one Save button. */
function EditorFrame({ title, intro, children, onSave, onReset }: { title: string; intro: string; children: ReactNode; onSave: () => Promise<void>; onReset?: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl">{title}</h1>
      <p className="mb-8 mt-1 text-muted">{intro}</p>
      <div className="space-y-8">{children}</div>
      {error && <Notice className="mt-6">{error}</Notice>}
      <div className="sticky bottom-0 -mx-5 mt-8 flex flex-wrap items-center gap-3 border-t border-line bg-cream/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <Button
          size="lg"
          loading={saving}
          onClick={async () => {
            setSaving(true)
            setError('')
            try {
              await onSave()
              notify('Saved. The site is updated.')
            } catch (e) {
              setError(e instanceof Error ? `We could not save: ${e.message}` : 'We could not save.')
            } finally {
              setSaving(false)
            }
          }}
        >
          Save changes
        </Button>
        {onReset && (
          <Button variant="ghost" onClick={onReset}>
            Reset to the original text
          </Button>
        )}
      </div>
    </div>
  )
}

function useReadyGuard() {
  const ready = useCatalog((s) => s.settingsReady)
  return { ready, configured: isSupabaseConfigured }
}

/* ---------------- Showroom photo ---------------- */

export function HeroEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.hero)
  if (!configured) return <NotConfigured />
  if (!ready) return <ListSkeleton rows={3} label="Loading…" />
  return <HeroForm initial={saved} />
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  const id = useId()
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-sm text-muted">
          {format(value)}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full accent-burgundy" />
    </div>
  )
}

function HeroForm({ initial }: { initial: HeroContent | null }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState(initial?.image ?? null)
  const [file, setFile] = useState<File | null>(null)
  const [adj, setAdj] = useState({
    focusX: initial?.focusX ?? DEFAULT_SHOWROOM.focusX,
    focusY: initial?.focusY ?? DEFAULT_SHOWROOM.focusY,
    zoom: initial?.zoom ?? DEFAULT_SHOWROOM.zoom,
    brightness: initial?.brightness ?? DEFAULT_SHOWROOM.brightness,
  })

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const view = { ...adj, src: preview || image?.url || defaultShowroom }
  const usingDefault = !preview && !image
  const set = (k: keyof typeof adj) => (v: number) => setAdj((a) => ({ ...a, [k]: v }))

  const save = async () => {
    const uploaded = file ? await uploadShowroomImage(file) : null
    const next = uploaded ?? image
    await saveSetting('hero', { image: next, ...adj } satisfies HeroContent)
    // Tidy up the previous upload once the new setting is safely saved.
    if (initial?.image && initial.image.path !== next?.path) void deleteImages([initial.image.path])
    setFile(null)
    setImage(next)
  }

  return (
    <EditorFrame
      title="Showroom photo"
      intro="This is the room guests see when the boutique doors open on the home page. Upload your own photo and fine-tune how it sits in the doorway. If there is no photo, we show our default one."
      onSave={save}
    >
      <section aria-labelledby="preview" className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div>
          <h2 id="preview" className="mb-3 font-sans text-lg font-medium text-ink">
            Preview
          </h2>
          <div className="flex items-end gap-4">
            <figure>
              <div className="relative aspect-[5/8] w-40 overflow-hidden rounded-t-full bg-blush-soft ring-1 ring-line">
                <ShowroomImage {...view} />
              </div>
              <figcaption className="mt-1.5 text-center text-xs text-muted">Computer</figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[4/5] w-32 overflow-hidden rounded-t-full bg-blush-soft ring-1 ring-line">
                <ShowroomImage {...view} />
              </div>
              <figcaption className="mt-1.5 text-center text-xs text-muted">Phone</figcaption>
            </figure>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-sans text-lg font-medium text-ink">Photo</h2>
          <p className="text-sm text-muted">{usingDefault ? 'Using the default photo.' : file ? `New photo ready: ${file.name}. Save to publish it.` : 'Using your uploaded photo.'}</p>
          <input ref={fileInput} type="file" accept="image/*" className="sr-only" aria-label="Upload showroom photo" onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = '' }} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
              <ImagePlus className="size-4" aria-hidden />
              {usingDefault ? 'Upload a photo' : 'Replace photo'}
            </Button>
            {!usingDefault && (
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImage(null) }}>
                <Trash2 className="size-4" aria-hidden />
                Remove, use default
              </Button>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="adjust" className="space-y-2">
        <h2 id="adjust" className="font-sans text-lg font-medium text-ink">
          Adjust
        </h2>
        <Slider label="Left / right" value={adj.focusX} min={0} max={100} step={1} onChange={set('focusX')} format={(v) => `${v}%`} />
        <Slider label="Up / down" value={adj.focusY} min={0} max={100} step={1} onChange={set('focusY')} format={(v) => `${v}%`} />
        <Slider label="Zoom" value={adj.zoom} min={SHOWROOM_LIMITS.zoom[0]} max={SHOWROOM_LIMITS.zoom[1]} step={0.05} onChange={set('zoom')} format={(v) => `${v.toFixed(2)}×`} />
        <Slider label="Brightness" value={adj.brightness} min={SHOWROOM_LIMITS.brightness[0]} max={SHOWROOM_LIMITS.brightness[1]} step={0.05} onChange={set('brightness')} format={(v) => `${Math.round(v * 100)}%`} />
        <Button variant="ghost" size="sm" onClick={() => setAdj({ ...DEFAULT_SHOWROOM })}>
          Reset adjustments
        </Button>
      </section>
    </EditorFrame>
  )
}

/* ---------------- Terms and conditions ---------------- */

export function TermsEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.terms)
  if (!configured) return <NotConfigured />
  if (!ready) return <ListSkeleton rows={3} label="Loading…" />
  return <TermsForm initial={saved} />
}

function TermsForm({ initial }: { initial: TermsContent | null }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState(initial?.image ?? null)
  const [file, setFile] = useState<File | null>(null)

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const shown = preview || image?.url

  const save = async () => {
    const uploaded = file ? await uploadTermsImage(file) : null
    const next = uploaded ?? image
    await saveSetting('terms', { image: next } satisfies TermsContent)
    if (initial?.image && initial.image.path !== next?.path) void deleteImages([initial.image.path])
    setFile(null)
    setImage(next)
  }

  return (
    <EditorFrame title="Terms & conditions" intro="Upload an image of your terms and conditions. Guests see it on the Terms & Conditions page. If there is no image, the page says Coming soon." onSave={save}>
      <section aria-labelledby="terms-image" className="space-y-3">
        <h2 id="terms-image" className="font-sans text-lg font-medium text-ink">
          Image
        </h2>
        <p className="text-sm text-muted">{!shown ? 'No image yet. The page shows Coming soon.' : file ? `New image ready: ${file.name}. Save to publish it.` : 'Showing your uploaded image.'}</p>
        {shown && <img src={shown} alt="Terms and conditions preview" className="h-auto w-full max-w-md rounded-2xl ring-1 ring-line" />}
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" aria-label="Upload terms and conditions image" onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = '' }} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
            <ImagePlus className="size-4" aria-hidden />
            {shown ? 'Replace image' : 'Upload an image'}
          </Button>
          {shown && (
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImage(null) }}>
              <Trash2 className="size-4" aria-hidden />
              Remove image
            </Button>
          )}
        </div>
      </section>
    </EditorFrame>
  )
}

/* ---------------- How it works ---------------- */
export function HowItWorksEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.howItWorks)
  if (!configured) return <NotConfigured />
  if (!ready) return <ListSkeleton rows={3} label="Loading…" />
  return <HowItWorksForm initial={saved ?? DEFAULT_HOW_IT_WORKS} />
}

function HowItWorksForm({ initial }: { initial: HowItWorksContent }) {
  const [c, setC] = useState<HowItWorksContent>(() => structuredClone(initial))
  const setStep = (i: number, patch: Partial<HowItWorksContent['steps'][number]>) => setC((s) => ({ ...s, steps: s.steps.map((x, k) => (k === i ? { ...x, ...patch } : x)) }))
  const setFaq = (i: number, patch: Partial<HowItWorksContent['faq'][number]>) => setC((s) => ({ ...s, faq: s.faq.map((x, k) => (k === i ? { ...x, ...patch } : x)) }))

  return (
    <EditorFrame
      title="How it works"
      intro="Edit the steps shown on the home page and the How It Works page, and the questions below them."
      onSave={() => {
        const steps = c.steps.filter((s) => s.title.trim())
        const faq = c.faq.filter((f) => f.q.trim() && f.a.trim())
        return saveSetting('howItWorks', { steps, faq })
      }}
      onReset={() => setC(structuredClone(DEFAULT_HOW_IT_WORKS))}
    >
      <section aria-labelledby="steps" className="space-y-3">
        <h2 id="steps" className="font-sans text-lg font-medium text-ink">
          Steps (up to {MAX_STEPS})
        </h2>
        {c.steps.map((s, i) => {
          const Icon = STEP_ICONS[s.icon]
          return (
            <div key={i} className="rounded-2xl border border-line bg-ivory p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-serif text-xl text-burgundy">
                  <Icon className="size-5" aria-hidden /> Step {i + 1}
                </p>
                <MoveButtons index={i} count={c.steps.length} label={`step ${i + 1}`} onMove={(to) => setC({ ...c, steps: move(c.steps, i, to) })} onRemove={c.steps.length > 1 ? () => setC({ ...c, steps: c.steps.filter((_, k) => k !== i) }) : undefined} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                <Select label="Icon" value={s.icon} onChange={(e) => setStep(i, { icon: e.target.value as StepIconName })}>
                  {STEP_ICON_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
                <Input label="Title" value={s.title} onChange={(e) => setStep(i, { title: e.target.value })} />
              </div>
              <Textarea className="mt-4" label="Description" rows={2} value={s.text} onChange={(e) => setStep(i, { text: e.target.value })} />
            </div>
          )
        })}
        {c.steps.length < MAX_STEPS && (
          <Button variant="secondary" size="sm" onClick={() => setC({ ...c, steps: [...c.steps, { icon: 'sparkles', title: '', text: '' }] })}>
            <Plus className="size-4" aria-hidden /> Add a step
          </Button>
        )}
      </section>

      <section aria-labelledby="faq" className="space-y-3">
        <h2 id="faq" className="font-sans text-lg font-medium text-ink">
          Questions and answers
        </h2>
        {c.faq.map((f, i) => (
          <div key={i} className="rounded-2xl border border-line bg-ivory p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-serif text-xl text-burgundy">Question {i + 1}</p>
              <MoveButtons index={i} count={c.faq.length} label={`question ${i + 1}`} onMove={(to) => setC({ ...c, faq: move(c.faq, i, to) })} onRemove={() => setC({ ...c, faq: c.faq.filter((_, k) => k !== i) })} />
            </div>
            <Input label="Question" value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} />
            <Textarea className="mt-4" label="Answer" rows={3} value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} />
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={() => setC({ ...c, faq: [...c.faq, { q: '', a: '' }] })}>
          <Plus className="size-4" aria-hidden /> Add a question
        </Button>
      </section>
    </EditorFrame>
  )
}

/* ---------------- Navbar and footer ---------------- */
export function NavigationEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.navigation)
  if (!configured) return <NotConfigured />
  if (!ready) return <ListSkeleton rows={3} label="Loading…" />
  return <NavigationForm initial={saved ?? DEFAULT_NAVIGATION} />
}

const clean = (items: NavItem[]) => items.map((i) => ({ label: i.label.trim(), to: i.to.trim() })).filter((i) => i.label)

function ItemRow({ item, index, count, noun, linkRequired, onChange, onMove, onRemove }: { item: NavItem; index: number; count: number; noun: string; linkRequired?: boolean; onChange: (patch: Partial<NavItem>) => void; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-ivory p-3">
      <Input className="min-w-40 flex-1" label="Text" value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
      <Input
        className="min-w-40 flex-1"
        label={linkRequired ? 'Link' : 'Link (leave empty for plain text)'}
        placeholder="/dresses, mailto:…, https://…"
        value={item.to}
        onChange={(e) => onChange({ to: e.target.value })}
      />
      <MoveButtons index={index} count={count} label={`${noun} ${index + 1}`} onMove={onMove} onRemove={onRemove} />
    </div>
  )
}

function NavigationForm({ initial }: { initial: NavigationContent }) {
  const [c, setC] = useState<NavigationContent>(() => structuredClone(initial))
  const setFooter = (patch: Partial<NavigationContent['footer']>) => setC((s) => ({ ...s, footer: { ...s.footer, ...patch } }))
  const setMain = (main: NavItem[]) => setC((s) => ({ ...s, main }))
  const setColumn = (i: number, patch: Partial<NavigationContent['footer']['columns'][number]>) =>
    setFooter({ columns: c.footer.columns.map((x, k) => (k === i ? { ...x, ...patch } : x)) })
  const patchAt = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((x, k) => (k === i ? { ...x, ...patch } : x))

  return (
    <EditorFrame
      title="Navbar & footer"
      intro="Change the links in the top bar and everything in the footer. Links to pages on this site start with a slash, like /dresses."
      onSave={() => {
        const main = clean(c.main).filter((i) => i.to)
        if (!main.length) throw new Error('Keep at least one link in the navbar.')
        const columns = c.footer.columns
          .map((col) => ({ title: col.title.trim(), items: clean(col.items) }))
          .filter((col) => col.title || col.items.length)
        return saveSetting('navigation', { main, footer: { ...c.footer, columns } })
      }}
      onReset={() => setC(structuredClone(DEFAULT_NAVIGATION))}
    >
      <section aria-labelledby="main" className="space-y-3">
        <h2 id="main" className="font-sans text-lg font-medium text-ink">
          Navbar links (up to {MAX_NAV_LINKS})
        </h2>
        {c.main.map((item, i) => (
          <ItemRow key={i} item={item} index={i} count={c.main.length} noun="link" linkRequired onChange={(p) => setMain(patchAt(c.main, i, p))} onMove={(to) => setMain(move(c.main, i, to))} onRemove={() => setMain(c.main.filter((_, k) => k !== i))} />
        ))}
        {c.main.length < MAX_NAV_LINKS && (
          <Button variant="secondary" size="sm" onClick={() => setMain([...c.main, { label: '', to: '' }])}>
            <Plus className="size-4" aria-hidden /> Add a link
          </Button>
        )}
      </section>

      <section aria-labelledby="foot" className="space-y-3">
        <h2 id="foot" className="font-sans text-lg font-medium text-ink">
          Footer
        </h2>
        <Textarea label="Short message under the logo" rows={2} value={c.footer.tagline} onChange={(e) => setFooter({ tagline: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Copyright line (the year is added for you)" value={c.footer.copyright} onChange={(e) => setFooter({ copyright: e.target.value })} />
          <Input label="Bottom right note" value={c.footer.note} onChange={(e) => setFooter({ note: e.target.value })} />
        </div>
      </section>

      <section aria-labelledby="cols" className="space-y-4">
        <h2 id="cols" className="font-sans text-lg font-medium text-ink">
          Footer columns (up to {MAX_FOOTER_COLUMNS})
        </h2>
        {c.footer.columns.map((col, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-line bg-cream p-4">
            <div className="flex items-end gap-3">
              <Input className="flex-1" label={`Column ${i + 1} heading`} value={col.title} onChange={(e) => setColumn(i, { title: e.target.value })} />
              <MoveButtons index={i} count={c.footer.columns.length} label={`column ${i + 1}`} onMove={(to) => setFooter({ columns: move(c.footer.columns, i, to) })} onRemove={() => setFooter({ columns: c.footer.columns.filter((_, k) => k !== i) })} />
            </div>
            {col.items.map((item, k) => (
              <ItemRow
                key={k}
                item={item}
                index={k}
                count={col.items.length}
                noun="line"
                onChange={(p) => setColumn(i, { items: patchAt(col.items, k, p) })}
                onMove={(to) => setColumn(i, { items: move(col.items, k, to) })}
                onRemove={() => setColumn(i, { items: col.items.filter((_, n) => n !== k) })}
              />
            ))}
            {col.items.length < MAX_FOOTER_ITEMS && (
              <Button variant="secondary" size="sm" onClick={() => setColumn(i, { items: [...col.items, { label: '', to: '' }] })}>
                <Plus className="size-4" aria-hidden /> Add a line
              </Button>
            )}
          </div>
        ))}
        {c.footer.columns.length < MAX_FOOTER_COLUMNS && (
          <Button variant="secondary" size="sm" onClick={() => setFooter({ columns: [...c.footer.columns, { title: '', items: [] }] })}>
            <Plus className="size-4" aria-hidden /> Add a column
          </Button>
        )}
      </section>
    </EditorFrame>
  )
}
