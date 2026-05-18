'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Loader2, Keyboard } from 'lucide-react'
import { VirtualKeyboard } from './VirtualKeyboard'
import { GrammarZooSelector } from './GrammarZooSelector'
import type { GrammarExample } from '@/lib/grammarZoo'

interface Props {
  grammar: string
  tokens: string
  loading: boolean
  parserKey: string
  onGrammarChange: (v: string) => void
  onTokensChange:  (v: string) => void
  onSubmit: () => void
  onLoadExample?: (example: GrammarExample) => void
}

function insertAt(
  el: HTMLTextAreaElement | HTMLInputElement | null,
  sym: string,
  value: string,
  onChange: (v: string) => void,
) {
  if (!el) return
  const s    = el.selectionStart ?? value.length
  const e    = el.selectionEnd   ?? value.length
  const next = value.slice(0, s) + sym + value.slice(e)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(s + sym.length, s + sym.length)
  })
}

export function GrammarPanel({
  grammar, tokens, loading, parserKey,
  onGrammarChange, onTokensChange, onSubmit, onLoadExample,
}: Props) {
  const [focused,   setFocused]   = useState<'grammar' | 'tokens'>('grammar')
  const [kbVisible, setKbVisible] = useState(true)
  const grammarRef = useRef<HTMLTextAreaElement>(null)
  const tokensRef  = useRef<HTMLInputElement>(null)

  const handleInsert = useCallback((sym: string) => {
    if (focused === 'grammar') {
      insertAt(grammarRef.current, sym, grammar, onGrammarChange)
    } else {
      insertAt(tokensRef.current, sym, tokens, onTokensChange)
    }
  }, [focused, grammar, tokens, onGrammarChange, onTokensChange])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSubmit()
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Grammar Zoo Selector */}
      {onLoadExample && (
        <div className="border-b border-neutral-100 px-4 py-3 bg-neutral-50/40">
          <GrammarZooSelector parserKey={parserKey} onSelect={onLoadExample} />
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Keyboard className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Teclado Virtual
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-400">
              Insertando en{' '}
              <span className="font-semibold text-neutral-600">
                {focused === 'grammar' ? 'Gramática' : 'Cadena de prueba'}
              </span>
            </span>
            <button
              onClick={() => setKbVisible(v => !v)}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
            >
              {kbVisible ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        {kbVisible && (
          <VirtualKeyboard target={focused} onInsert={handleInsert} />
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Grammar */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-2">
            Gramática
          </label>
          <textarea
            ref={grammarRef}
            value={grammar}
            onChange={e => onGrammarChange(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused('grammar')}
            rows={6}
            spellCheck={false}
            className={`w-full rounded-lg border bg-neutral-50 px-3 py-2.5 font-mono text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 resize-none transition-all duration-150 ${
              focused === 'grammar'
                ? 'border-neutral-400 ring-2 ring-neutral-900/5'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
            placeholder={"E  -> T E'\nE' -> + T E' | eps\nT  -> F T'\nT' -> * F T' | eps\nF  -> ( E ) | id"}
          />
        </div>

        {/* Tokens */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-2">
            Cadena de prueba{' '}
            <span className="normal-case font-normal tracking-normal text-neutral-400">
              (tokens separados por espacios)
            </span>
          </label>
          <input
            ref={tokensRef}
            value={tokens}
            onChange={e => onTokensChange(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused('tokens')}
            placeholder="id + id * id"
            className={`w-full rounded-lg border bg-neutral-50 px-3 py-2.5 font-mono text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:outline-none transition-all duration-150 ${
              focused === 'tokens'
                ? 'border-neutral-400 ring-2 ring-neutral-900/5'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          />
          <p className="mt-1.5 text-[10px] text-neutral-400">Ctrl+Enter para ejecutar</p>
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={loading || !grammar.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Play className="h-3.5 w-3.5" />}
          {loading ? 'Procesando…' : 'Ejecutar Parser'}
        </button>
      </div>
    </div>
  )
}
