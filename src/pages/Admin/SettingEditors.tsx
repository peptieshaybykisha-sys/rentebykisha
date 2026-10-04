import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { MoveButtons, NotConfigured } from '@/components/admin/AdminShell'
import { Notice } from '@/components/common/States'
import DressPhoto from '@/components/dresses/DressPhoto'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { HERO_MAX_DRESSES, HERO_SLOT_NAMES } from '@/constants/home'
import { DEFAULT_HOW_IT_WORKS, MAX_STEPS, STEP_ICON_NAMES, STEP_ICONS } from '@/constants/howItWorks'
import { DEFAULT_SIZE_GUIDE } from '@/constants/sizeGuide'
import { useDressList } from '@/hooks/useDresses'
import { saveSetting } from '@/lib/adminApi'
import { isFirebaseConfigured } from '@/lib/firebase'
import { move } from '@/lib/utils'
import { useToastStore } from '@/stores'
import { useCatalog } from '@/stores/catalog'
import type { HowItWorksContent, SizeGuideContent, StepIconName } from '@/types'

/** Wraps an editor: waits for the saved content, then offers one Save button. */
function EditorFrame({ title, intro, children, onSave, onReset }: { title: string; intro: string; children: ReactNode; onSave: () => Promise<void>; onReset?: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const push = useToastStore((s) => s.push)
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
              push('Saved. The site is updated.')
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
  return { ready, configured: isFirebaseConfigured }
}

/* ---------------- Size guide ---------------- */
export function SizeGuideEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.sizeGuide)
  if (!configured) return <NotConfigured />
  if (!ready) return <p className="text-muted">Loading…</p>
  return <SizeGuideForm initial={saved ?? DEFAULT_SIZE_GUIDE} />
}

function SizeGuideForm({ initial }: { initial: SizeGuideContent }) {
  const [g, setG] = useState<SizeGuideContent>(() => structuredClone(initial))
  const setCell = (r: number, c: number, v: string) => setG((s) => ({ ...s, rows: s.rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) }))
  const cell = 'min-h-11 w-full min-w-24 rounded-lg border border-line bg-ivory px-3 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20'

  return (
    <EditorFrame
      title="Size guide"
      intro="This table opens from “Size Guide” on every dress page. Rename columns, add measurements or change any value."
      onSave={() => saveSetting('sizeGuide', g)}
      onReset={() => setG(structuredClone(DEFAULT_SIZE_GUIDE))}
    >
      <Textarea label="Note above the table" rows={3} value={g.note} onChange={(e) => setG({ ...g, note: e.target.value })} />
      <div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-ivory p-3">
          <table className="w-full border-separate border-spacing-2">
            <caption className="sr-only">Editable size guide</caption>
            <thead>
              <tr>
                {g.columns.map((c, ci) => (
                  <th key={ci} scope="col" className="align-top">
                    <input aria-label={`Column ${ci + 1} name`} value={c} onChange={(e) => setG({ ...g, columns: g.columns.map((x, j) => (j === ci ? e.target.value : x)) })} className={`${cell} font-medium text-burgundy`} />
                    {ci > 0 && g.columns.length > 2 && (
                      <button type="button" className="mt-1 text-xs text-muted hover:text-burgundy" onClick={() => setG({ columns: g.columns.filter((_, j) => j !== ci), rows: g.rows.map((r) => r.filter((_, j) => j !== ci)), note: g.note })}>
                        Remove column
                      </button>
                    )}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {g.rows.map((row, ri) => (
                <tr key={ri}>
                  {g.columns.map((_, ci) => (
                    <td key={ci}>
                      <input aria-label={`${g.columns[ci]}, row ${ri + 1}`} value={row[ci] ?? ''} onChange={(e) => setCell(ri, ci, e.target.value)} className={cell} />
                    </td>
                  ))}
                  <td>
                    <MoveButtons index={ri} count={g.rows.length} label={`row ${ri + 1}`} onMove={(to) => setG({ ...g, rows: move(g.rows, ri, to) })} onRemove={() => setG({ ...g, rows: g.rows.filter((_, k) => k !== ri) })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => setG({ ...g, rows: [...g.rows, g.columns.map(() => '')] })}>
            <Plus className="size-4" aria-hidden /> Add a size row
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setG({ ...g, columns: [...g.columns, 'New'], rows: g.rows.map((r) => [...r, '']) })}>
            <Plus className="size-4" aria-hidden /> Add a column
          </Button>
        </div>
      </div>
    </EditorFrame>
  )
}

/* ---------------- Hero dresses ---------------- */

export function HeroEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.hero)
  if (!configured) return <NotConfigured />
  if (!ready) return <p className="text-muted">Loading…</p>
  return <HeroForm initial={saved?.dressIds ?? []} />
}

function HeroForm({ initial }: { initial: string[] }) {
  const dresses = useDressList()
  const [ids, setIds] = useState<string[]>(() => initial.filter((id) => dresses.some((d) => d.id === id)))
  const chosen = ids.map((id) => dresses.find((d) => d.id === id)!).filter(Boolean)
  const options = dresses.filter((d) => !ids.includes(d.id))

  return (
    <EditorFrame
      title="Hero dresses"
      intro="These dresses stand behind the boutique doors on the home page. The first is the centre piece. Up to five. If you choose none, we show your featured dresses."
      onSave={() => saveSetting('hero', { dressIds: ids })}
    >
      <section aria-labelledby="chosen">
        <h2 id="chosen" className="mb-3 font-sans text-lg font-medium text-ink">
          On display ({ids.length}/{HERO_MAX_DRESSES})
        </h2>
        {chosen.length === 0 ? (
          <p className="text-muted">Nothing chosen yet.</p>
        ) : (
          <ol className="space-y-2">
            {chosen.map((d, i) => (
              <li key={d.id} className="flex items-center gap-3 rounded-2xl border border-line bg-ivory p-2 pr-3">
                <span className="block h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-blush-soft">
                  <DressPhoto dress={d} className="size-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-xl text-burgundy">{d.name}</span>
                  <span className="text-sm text-muted">{HERO_SLOT_NAMES[i]}</span>
                </span>
                <MoveButtons index={i} count={ids.length} label={d.name} onMove={(to) => setIds(move(ids, i, to))} onRemove={() => setIds(ids.filter((x) => x !== d.id))} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="add">
        <h2 id="add" className="mb-3 font-sans text-lg font-medium text-ink">
          Add a dress
        </h2>
        {options.length === 0 ? (
          <p className="text-muted">Every dress is already chosen, or you have not added any dresses yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {options.map((d) => {
              const noPhoto = d.images.length === 0
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={noPhoto || ids.length >= HERO_MAX_DRESSES}
                    onClick={() => setIds([...ids, d.id])}
                    className="block w-full rounded-2xl border border-line bg-ivory p-2 text-left transition-colors hover:border-burgundy disabled:opacity-50 disabled:hover:border-line"
                  >
                    <span className="block aspect-[3/4] overflow-hidden rounded-xl bg-blush-soft">
                      <DressPhoto dress={d} className="size-full object-cover" />
                    </span>
                    <span className="mt-2 block truncate text-sm font-medium">{d.name}</span>
                    {noPhoto && <span className="text-xs text-muted">Needs a photo</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </EditorFrame>
  )
}

/* ---------------- How it works ---------------- */
export function HowItWorksEditor() {
  const { ready, configured } = useReadyGuard()
  const saved = useCatalog((s) => s.howItWorks)
  if (!configured) return <NotConfigured />
  if (!ready) return <p className="text-muted">Loading…</p>
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
