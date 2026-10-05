import { Plus } from 'lucide-react'
import { MoveButtons } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { move } from '@/lib/utils'
import type { SizeGuideContent } from '@/types'

const cell = 'min-h-11 w-full min-w-24 rounded-lg border border-line bg-ivory px-3 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20'

/** Controlled editor for one dress's size guide table. */
export default function SizeGuideEditor({ value: g, onChange: setG }: { value: SizeGuideContent; onChange: (v: SizeGuideContent) => void }) {
  const setCell = (r: number, c: number, v: string) => setG({ ...g, rows: g.rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) })

  return (
    <div className="space-y-4">
      <Textarea label="Note above the table" rows={2} value={g.note} onChange={(e) => setG({ ...g, note: e.target.value })} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-ivory p-3">
        <table className="w-full border-separate border-spacing-2">
          <caption className="sr-only">Editable size guide</caption>
          <thead>
            <tr>
              {g.columns.map((c, ci) => (
                <th key={ci} scope="col" className="align-top">
                  <input aria-label={`Column ${ci + 1} name`} value={c} onChange={(e) => setG({ ...g, columns: g.columns.map((x, j) => (j === ci ? e.target.value : x)) })} className={`${cell} font-medium text-burgundy`} />
                  {ci > 0 && g.columns.length > 2 && (
                    <button type="button" className="mt-1 text-xs text-muted hover:text-burgundy" onClick={() => setG({ ...g, columns: g.columns.filter((_, j) => j !== ci), rows: g.rows.map((r) => r.filter((_, j) => j !== ci)) })}>
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
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={() => setG({ ...g, rows: [...g.rows, g.columns.map(() => '')] })}>
          <Plus className="size-4" aria-hidden /> Add a size row
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setG({ ...g, columns: [...g.columns, 'New'], rows: g.rows.map((r) => [...r, '']) })}>
          <Plus className="size-4" aria-hidden /> Add a column
        </Button>
      </div>
    </div>
  )
}
