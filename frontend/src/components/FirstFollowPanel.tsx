import type { FirstFollowData } from '@/lib/types'

export function FirstFollowPanel({ data }: { data: FirstFollowData }) {
  const nts = Object.keys(data.first).sort()
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-3">
        Conjuntos FIRST / FOLLOW
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="pb-2 pr-6 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-500">NT</th>
              <th className="pb-2 pr-6 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-500">FIRST</th>
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-500">FOLLOW</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {nts.map(nt => (
              <tr key={nt} className="hover:bg-neutral-50 transition-colors duration-100">
                <td className="py-1.5 pr-6 font-semibold text-blue-600">{nt}</td>
                <td className="py-1.5 pr-6 text-neutral-700">{`{ ${data.first[nt].join(', ')} }`}</td>
                <td className="py-1.5 text-neutral-700">{`{ ${(data.follow[nt] ?? []).join(', ')} }`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
