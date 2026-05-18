import type { LRTableData } from '@/lib/types'

function cellStyle(val: string): string {
  if (!val)           return 'text-neutral-300'
  if (val.startsWith('s'))  return 'text-blue-600  font-semibold'
  if (val.startsWith('r'))  return 'text-amber-600 font-semibold'
  if (val === 'acc')        return 'text-emerald-600 font-bold'
  return 'text-neutral-700'
}

export function ActionGotoTable({ data }: { data: LRTableData }) {
  if (!data.table.length) return null

  const first      = data.table[0]
  const actionCols = Object.keys(first.action)
  const gotoCols   = Object.keys(first.goto)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Tabla ACTION / GOTO
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-neutral-500">
          <span><span className="text-blue-600 font-semibold">sN</span> = shift</span>
          <span><span className="text-amber-600 font-semibold">r:X→Y</span> = reduce</span>
          <span><span className="text-emerald-600 font-bold">acc</span> = accept</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs font-mono border-collapse">
          <thead>
            <tr>
              <th className="border border-neutral-200 bg-neutral-50 px-2 py-1.5" rowSpan={2} />
              <th
                colSpan={actionCols.length}
                className="border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 text-center"
              >
                ACTION
              </th>
              <th
                colSpan={gotoCols.length}
                className="border border-neutral-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600/70 text-center"
              >
                GOTO
              </th>
            </tr>
            <tr>
              {actionCols.map(t => (
                <th key={t} className="border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-neutral-600 whitespace-nowrap font-medium">
                  {t}
                </th>
              ))}
              {gotoCols.map(nt => (
                <th key={nt} className="border border-neutral-200 bg-blue-50/60 px-2.5 py-1.5 text-blue-600 whitespace-nowrap font-medium">
                  {nt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.table.map(row => (
              <tr key={row.state} className="hover:bg-neutral-50 transition-colors duration-100">
                <td className="border border-neutral-200 bg-neutral-50/80 px-2.5 py-1.5 text-center text-neutral-500 font-semibold text-[11px]">
                  {row.state}
                </td>
                {actionCols.map(t => (
                  <td key={t} className={`border border-neutral-200 px-2.5 py-1.5 text-center ${cellStyle(row.action[t])}`}>
                    {row.action[t] || ''}
                  </td>
                ))}
                {gotoCols.map(nt => {
                  const v = row.goto[nt]
                  return (
                    <td
                      key={nt}
                      className={`border border-neutral-200 bg-blue-50/30 px-2.5 py-1.5 text-center ${v !== '' ? 'text-neutral-700 font-medium' : 'text-neutral-300'}`}
                    >
                      {v !== '' ? v : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.conflicts.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 space-y-0.5">
          {data.conflicts.map((c, i) => (
            <p key={i} className="text-[11px] font-mono text-amber-700">{c}</p>
          ))}
        </div>
      )}
    </div>
  )
}
