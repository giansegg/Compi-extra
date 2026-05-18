import { analyzeError } from '@/lib/errorAnalysis'
import { Bot, AlertCircle, Lightbulb, X } from 'lucide-react'

interface Props {
  error: string
  parserKey: string
  onDismiss?: () => void
}

export function ErrorAssistant({ error, parserKey, onDismiss }: Props) {
  const a = analyzeError(error, parserKey)

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden shadow-sm">
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-red-100/70 border-b border-red-200">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
            <Bot className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-red-800">Asistente de errores sintácticos</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-300 hover:text-red-600 transition-colors duration-150"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Explanation */}
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800 mb-0.5">{a.title}</p>
            <p className="text-sm text-red-700 leading-relaxed">{a.explanation}</p>
          </div>
        </div>

        {/* Hint */}
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-white/60 px-3 py-2.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-neutral-700 leading-relaxed">{a.hint}</p>
        </div>

        {/* Raw error (collapsed) */}
        <details className="group">
          <summary className="cursor-pointer list-none text-[10px] text-red-400 hover:text-red-600 transition-colors duration-150 select-none">
            Ver detalle técnico ↓
          </summary>
          <pre className="mt-1.5 overflow-x-auto rounded-md border border-red-200 bg-white/60 px-2.5 py-1.5 text-[10px] font-mono text-red-600 leading-relaxed">
            {error}
          </pre>
        </details>
      </div>
    </div>
  )
}
