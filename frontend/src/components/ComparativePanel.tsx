import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, BookOpen } from 'lucide-react'

type ParserKey = 'll1' | 'rd' | 'lr0' | 'slr1' | 'lr1' | 'lalr1'

interface ParserProfile {
  name:     string
  power:    number   // 1–6 (relative parsing power)
  handles:  string[]
  struggles: string[]
  fixFor:   Partial<Record<ParserKey, string>>   // how THIS parser fixes issues of another
}

const PROFILES: Record<ParserKey, ParserProfile> = {
  ll1: {
    name: 'LL(1)',
    power: 2,
    handles:   ['Gramáticas sin recursión izquierda', 'Gramáticas factorizadas', 'Lenguajes simples'],
    struggles: ['Recursión izquierda directa/indirecta', 'Gramáticas ambiguas', 'Conflictos FIRST/FOLLOW'],
    fixFor:    {},
  },
  rd: {
    name: 'Desc. Recursivo',
    power: 2,
    handles:   ['Gramáticas LL(1)', 'Implementación intuitiva', 'Mensajes de error claros'],
    struggles: ['Recursión izquierda', 'Gramáticas ambiguas', 'Requiere refactorización manual'],
    fixFor:    {},
  },
  lr0: {
    name: 'LR(0)',
    power: 3,
    handles:   ['Recursión izquierda', 'Más lenguajes que LL(1)'],
    struggles: ['Conflictos Shift/Reduce', 'Conflictos Reduce/Reduce', 'Gramáticas ambiguas'],
    fixFor:    {
      ll1: 'Maneja recursión izquierda (ej. E→E+T) sin refactorizar la gramática.',
      rd:  'Maneja recursión izquierda directamente.',
    },
  },
  slr1: {
    name: 'SLR(1)',
    power: 4,
    handles:   ['Todo LR(0)', 'Usa FOLLOW para resolver conflictos S/R'],
    struggles: ['Conflictos donde FOLLOW no es suficiente', 'Gramáticas con ambigüedad local'],
    fixFor:    {
      lr0: 'Usa FOLLOW(A) para decidir cuándo reducir, eliminando muchos conflictos S/R de LR(0).',
    },
  },
  lr1: {
    name: 'LR(1)',
    power: 6,
    handles:   ['Casi todos los lenguajes de programación', 'Lookahead preciso por contexto'],
    struggles: ['Tablas muy grandes', 'Mayor costo de memoria'],
    fixFor:    {
      slr1: 'Lookahead calculado por contexto (no solo FOLLOW global), resuelve conflictos que SLR(1) no puede.',
      lr0:  'Máxima precisión: lookahead es específico al item, no al no-terminal completo.',
    },
  },
  lalr1: {
    name: 'LALR(1)',
    power: 5,
    handles:   ['La mayoría de lenguajes reales (Java, C)', 'Tablas compactas como LR(0)'],
    struggles: ['Conflictos R/R que LR(1) sí resuelve', 'Gramáticas muy ambiguas'],
    fixFor:    {
      slr1: 'Fusiona estados LR(1) con el mismo núcleo: más preciso que SLR(1), más compacto que LR(1).',
      lr0:  'Comparte el tamaño de tablas con LR(0)/SLR(1) pero con lookahead contextual.',
    },
  },
}

const UPGRADE_PATH: Partial<Record<ParserKey, ParserKey>> = {
  ll1: 'slr1',
  rd:  'slr1',
  lr0: 'slr1',
  slr1: 'lalr1',
  lalr1: 'lr1',
}

interface Props {
  parserKey: ParserKey | string
  conflicts: string[]
  hasConflicts: boolean
}

export function ComparativePanel({ parserKey, conflicts, hasConflicts }: Props) {
  const key     = parserKey as ParserKey
  const profile = PROFILES[key]
  if (!profile) return null

  const upgradeKey  = UPGRADE_PATH[key]
  const upgradeProf = upgradeKey ? PROFILES[upgradeKey] : null
  const fixMessage  = upgradeKey && upgradeProf ? upgradeProf.fixFor[key] : null

  return (
    <div className="lab-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-4 w-4 text-violet-500" />
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Análisis Comparativo — {profile.name}
        </h3>
        {/* Power bar */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-400">Potencia:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-3 rounded-sm transition-colors ${
                  i < profile.power ? 'bg-blue-500' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Lo que maneja bien
          </p>
          <ul className="space-y-1">
            {profile.handles.map((h, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-800">
                <span className="mt-0.5 text-emerald-500">•</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Sus limitaciones
          </p>
          <ul className="space-y-1">
            {profile.struggles.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-red-800">
                <span className="mt-0.5 text-red-400">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conflict explanation */}
      {hasConflicts && conflicts.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Conflictos detectados en esta gramática
          </p>
          <div className="space-y-0.5 mb-2 max-h-24 overflow-y-auto">
            {conflicts.map((c, i) => (
              <p key={i} className="text-[11px] font-mono text-amber-800">{c}</p>
            ))}
          </div>
          {fixMessage && upgradeProf && (
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-amber-200">
              <ArrowRight className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-blue-700">{upgradeProf.name} lo soluciona: </span>
                <span className="text-xs text-neutral-700">{fixMessage}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade suggestion */}
      {upgradeProf && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
          <span className="text-xs font-semibold text-blue-700">{profile.name}</span>
          <ArrowRight className="h-3 w-3 text-blue-400" />
          <span className="text-xs font-semibold text-blue-700">{upgradeProf.name}</span>
          <span className="text-xs text-neutral-600 ml-1">
            — siguiente nivel de potencia en la jerarquía de parsers
          </span>
        </div>
      )}
    </div>
  )
}
