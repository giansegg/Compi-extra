import type { LL1Step } from '@/lib/types'

type Kind = 'derive' | 'match' | 'accept' | 'error'

interface Entry { kind: Kind; text: string }

function buildTrace(steps: LL1Step[]): Entry[] {
  return steps.map(s => {
    const a = s.action
    if (a === 'ACCEPT')          return { kind: 'accept', text: 'Cadena aceptada ✓'      }
    if (a.startsWith('ERROR'))   return { kind: 'error',  text: a                        }
    if (a.startsWith('Derivar')) return { kind: 'derive', text: a.replace('Derivar ', '') }
    return { kind: 'match', text: a }
  })
}

const STYLES: Record<Kind, { text: string; icon: string }> = {
  derive: { text: 'text-blue-700',    icon: '⟹' },
  match:  { text: 'text-amber-700',   icon: '✔' },
  accept: { text: 'text-emerald-700 font-semibold', icon: '✓' },
  error:  { text: 'text-red-600',     icon: '✗' },
}

export function DerivationTrace({ steps }: { steps: LL1Step[] }) {
  const trace = buildTrace(steps)
  if (!trace.length) return null

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-3">
        Traza de Derivación
      </h3>
      <div className="max-h-64 overflow-y-auto space-y-0 font-mono text-xs">
        {trace.map((entry, i) => {
          const s = STYLES[entry.kind]
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 py-0.5 hover:bg-neutral-50 rounded px-1 transition-colors duration-100"
            >
              <span className="text-neutral-400 w-5 text-right tabular-nums flex-shrink-0 pt-px">{i + 1}</span>
              <span className="w-4 flex-shrink-0 text-neutral-400 pt-px">{s.icon}</span>
              <span className={s.text}>{entry.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
