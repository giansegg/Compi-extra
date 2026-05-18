import { AlertTriangle, X } from 'lucide-react'

interface Props {
  error: string
  onDismiss?: () => void
}

export function ErrorAlert({ error, onDismiss }: Props) {
  const lines = error.split('\n').filter(Boolean)
  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-300 mb-1.5">Error sintáctico</p>
          {lines.map((line, i) => (
            <p key={i} className="text-xs font-mono text-red-400/80">{line}</p>
          ))}
          <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
            Verifica la gramática. Usa{' '}
            <code className="text-neutral-400 bg-neutral-800 px-1 rounded">eps</code> o{' '}
            <code className="text-neutral-400 bg-neutral-800 px-1 rounded">ε</code> para épsilon.
            Formato: <code className="text-neutral-400 bg-neutral-800 px-1 rounded">NT -{'>'} cuerpo1 | cuerpo2</code>
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-neutral-600 hover:text-neutral-400 transition-colors flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
