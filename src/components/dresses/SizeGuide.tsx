import Dialog from '@/components/ui/Dialog'

const ROWS = [
  ['XS', '80–84', '60–64', '86–90', '4'],
  ['S', '85–89', '65–69', '91–95', '6'],
  ['M', '90–94', '70–74', '96–100', '8'],
  ['L', '95–99', '75–79', '101–105', '10'],
  ['XL', '100–106', '80–86', '106–112', '12'],
]

export default function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Size guide">
      <p className="mb-4 text-muted">Measurements are body measurements in centimetres. If you are between sizes, choose the larger one or book a fitting.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] text-left">
          <caption className="sr-only">Body measurements by size</caption>
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th scope="col" className="py-2 font-medium">Size</th>
              <th scope="col" className="py-2 font-medium">Bust</th>
              <th scope="col" className="py-2 font-medium">Waist</th>
              <th scope="col" className="py-2 font-medium">Hips</th>
              <th scope="col" className="py-2 font-medium">US</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([s, ...rest]) => (
              <tr key={s} className="border-b border-line/70">
                <th scope="row" className="py-3 font-serif text-xl text-burgundy">{s}</th>
                {rest.map((c, i) => (
                  <td key={i} className="py-3">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  )
}
