import { CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  output:   string
  accepted: boolean
  title?:   string
}

export function RawOutputView({ output, accepted, title = 'Traza de Simulación' }: Props) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {title}
        </h3>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
          accepted
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50    border-red-200    text-red-700'
        }`}>
          {accepted ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
          {accepted ? 'Aceptado' : 'Rechazado'}
        </span>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-[11px] font-mono text-neutral-700 leading-relaxed max-h-80 overflow-y-auto whitespace-pre">
        {output || '(sin salida)'}
      </pre>
    </div>
  )
}
