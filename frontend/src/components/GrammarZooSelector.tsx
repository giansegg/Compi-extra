'use client'

import { useState, useRef, useEffect } from 'react'
import { BookMarked, ChevronDown, Check, AlertTriangle, Sparkles } from 'lucide-react'
import { GRAMMAR_ZOO, CATEGORY_LABELS, type GrammarExample, type ParserKind } from '@/lib/grammarZoo'

interface Props {
  parserKey: string
  onSelect: (example: GrammarExample) => void
}

const CATEGORY_COLORS: Record<GrammarExample['category'], string> = {
  classic:           'bg-blue-50    text-blue-700    border-blue-200',
  ambiguous:         'bg-red-50     text-red-700     border-red-200',
  'left-recursive':  'bg-violet-50  text-violet-700  border-violet-200',
  factoring:         'bg-amber-50   text-amber-700   border-amber-200',
  minimal:           'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export function GrammarZooSelector({ parserKey, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click-outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handlePick = (ex: GrammarExample) => {
    onSelect(ex)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-all duration-150"
      >
        <span className="inline-flex items-center gap-1.5">
          <BookMarked className="h-3.5 w-3.5" />
          Cargar gramática de ejemplo
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full max-h-[28rem] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl ring-1 ring-black/5">
          <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-violet-500" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Grammar Zoo — {GRAMMAR_ZOO.length} ejemplos clásicos
              </p>
            </div>
          </div>

          <ul className="divide-y divide-neutral-100">
            {GRAMMAR_ZOO.map(ex => {
              const isCompatible   = ex.compatibleWith.includes(parserKey as ParserKind)
              const isIncompatible = ex.incompatibleWith.includes(parserKey as ParserKind)

              return (
                <li key={ex.id}>
                  <button
                    onClick={() => handlePick(ex)}
                    className="w-full text-left px-3 py-2.5 hover:bg-neutral-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-900">
                        {ex.name}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isCompatible && (
                          <span title="Compatible con este parser"
                            className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100 text-emerald-600">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                        {isIncompatible && (
                          <span title="Este parser fallará a propósito (didáctico)"
                            className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-100 text-amber-600">
                            <AlertTriangle className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 mb-1.5 leading-snug">
                      {ex.description}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[ex.category]}`}>
                        {CATEGORY_LABELS[ex.category]}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 truncate">
                        {ex.validTokens}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="px-3 py-2 border-t border-neutral-100 bg-neutral-50">
            <p className="text-[9px] text-neutral-400 leading-tight">
              <Check className="inline h-2.5 w-2.5 text-emerald-500" /> compatible con el parser actual ·
              <AlertTriangle className="inline h-2.5 w-2.5 text-amber-500 ml-1" /> fallará a propósito (útil para entender limitaciones)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
