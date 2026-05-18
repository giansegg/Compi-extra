import { analyzeRecommendations, type Recommendation } from '@/lib/recommendations'
import { Sparkles, AlertTriangle, Info, Wrench, XCircle } from 'lucide-react'

interface Props {
  grammar: string
  conflicts: string[]
  parserKey: string
}

const SEVERITY_STYLES = {
  info: {
    wrap:  'border-blue-200 bg-blue-50',
    icon:  'text-blue-500',
    title: 'text-blue-800',
    body:  'text-blue-700',
    hint:  'border-blue-200 bg-white/70 text-neutral-700',
  },
  warning: {
    wrap:  'border-amber-200 bg-amber-50',
    icon:  'text-amber-500',
    title: 'text-amber-800',
    body:  'text-amber-700',
    hint:  'border-amber-200 bg-white/70 text-neutral-700',
  },
  error: {
    wrap:  'border-red-200 bg-red-50',
    icon:  'text-red-500',
    title: 'text-red-800',
    body:  'text-red-700',
    hint:  'border-red-200 bg-white/70 text-neutral-700',
  },
}

function RecCard({ rec }: { rec: Recommendation }) {
  const s    = SEVERITY_STYLES[rec.severity]
  const Icon = rec.severity === 'error' ? XCircle : rec.severity === 'warning' ? AlertTriangle : Info

  return (
    <div className={`rounded-lg border p-3 ${s.wrap}`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${s.icon}`} />
        <div className="min-w-0 space-y-1.5">
          <p className={`text-sm font-semibold ${s.title}`}>{rec.title}</p>
          <p className={`text-xs leading-relaxed ${s.body}`}>{rec.description}</p>
          {rec.example && (
            <div className={`mt-2 rounded-md border px-3 py-2 ${s.hint}`}>
              <div className="flex items-center gap-1 mb-1">
                <Wrench className="h-3 w-3 text-neutral-400" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Sugerencia
                </span>
              </div>
              <pre className="text-[10px] font-mono leading-relaxed whitespace-pre-wrap">{rec.example}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SmartRecommendations({ grammar, conflicts, parserKey }: Props) {
  const recs = analyzeRecommendations(grammar, conflicts, parserKey)
  if (!recs.length) return null

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Recomendaciones inteligentes
        </h3>
        <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
          {recs.length}
        </span>
      </div>
      <div className="space-y-2">
        {recs.map((rec, i) => <RecCard key={i} rec={rec} />)}
      </div>
    </div>
  )
}
