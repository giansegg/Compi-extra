import type { LL1TableData, GrammarInfoData } from '@/lib/types'

interface Props {
  data: LL1TableData
  grammarInfo: GrammarInfoData
}

export function LL1TableView({ data, grammarInfo }: Props) {
  const nts  = [...grammarInfo.non_terminals].sort()
  const cols = [...grammarInfo.terminals].sort().concat('$')

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Tabla de Predicción LL(1)
        </h3>
        {data.conflicts.length > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
            {data.conflicts.length} conflicto{data.conflicts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs font-mono border-collapse">
          <thead>
            <tr>
              <th className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-neutral-500 font-semibold min-w-[3rem]">
                NT
              </th>
              {cols.map(t => (
                <th
                  key={t}
                  className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-center text-neutral-600 font-semibold whitespace-nowrap min-w-[8rem]"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nts.map(nt => (
              <tr key={nt} className="hover:bg-neutral-50 transition-colors duration-100">
                <td className="border border-neutral-200 bg-neutral-50/60 px-3 py-1.5 text-blue-600 font-semibold">
                  {nt}
                </td>
                {cols.map(t => {
                  const prod = data.table[`${nt}|${t}`]
                  return (
                    <td
                      key={t}
                      className={`border border-neutral-200 px-3 py-1.5 text-center whitespace-nowrap ${
                        prod ? 'text-neutral-800' : 'text-neutral-300'
                      }`}
                    >
                      {prod ? `${nt} → ${prod}` : '—'}
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
