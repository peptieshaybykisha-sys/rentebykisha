import Dialog from '@/components/ui/Dialog'
import { useSizeGuide } from '@/hooks/useSettings'

export default function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { note, columns, rows } = useSizeGuide()
  return (
    <Dialog open={open} onClose={onClose} title="Size guide">
      {note && <p className="mb-4 text-muted">{note}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left">
          <caption className="sr-only">Measurements by size</caption>
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              {columns.map((c, i) => (
                <th key={i} scope="col" className="py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-line/70">
                {columns.map((_, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row" className="py-3 font-serif text-xl text-burgundy">
                      {r[ci]}
                    </th>
                  ) : (
                    <td key={ci} className="py-3">
                      {r[ci]}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  )
}
