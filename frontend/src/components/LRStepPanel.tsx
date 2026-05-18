'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { StackVisualizer } from './StackVisualizer'
import type { LRParsedStep } from '@/lib/lrStepParser'

function actionColor(action: string): string {
  const a = action.toLowerCase()
  if (a === 'acc' || a.startsWith('accept'))  return 'text-emerald-700'
  if (a.startsWith('error'))                   return 'text-red-600'
  if (action.startsWith('s'))                  return 'text-blue-700'
  if (action.startsWith('r'))                  return 'text-amber-700'
  return 'text-neutral-700'
}

function actionBg(action: string): string {
  const a = action.toLowerCase()
  if (a === 'acc' || a.startsWith('accept'))  return 'bg-emerald-50  border-emerald-200'
  if (a.startsWith('error'))                   return 'bg-red-50      border-red-200'
  if (action.startsWith('s'))                  return 'bg-blue-50     border-blue-200'
  if (action.startsWith('r'))                  return 'bg-amber-50    border-amber-200'
  return 'bg-neutral-50 border-neutral-200'
}

interface Props {
  steps:    LRParsedStep[]
  stepIdx:  number
  accepted: boolean | undefined
}

export function LRStepPanel({ steps, stepIdx, accepted }: Props) {
  if (!steps.length) return null

  const idx  = Math.max(0, Math.min(stepIdx, steps.length - 1))
  const step = steps[idx]

  // Stack is stored left=bottom, right=top; StackVisualizer wants [0]=top
  const visualStack = [...step.stack].reverse()

  return (
    <div className="lab-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Estado actual del parser LR
        </h3>
        {accepted !== undefined && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
            accepted
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50    border-red-200    text-red-700'
          }`}>
            {accepted ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
            {accepted ? 'Aceptado' : 'Rechazado'}
          </span>
        )}
      </div>

      <div className="p-4 grid grid-cols-[auto_1fr] gap-6">
        {/* Left: visual stack tower */}
        <div className="w-28">
          <StackVisualizer stack={visualStack} label="Pila" />
        </div>

        {/* Right: input + action + current state badge */}
        <div className="flex flex-col gap-4 min-w-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-2">
              Entrada restante
            </p>
            <div className="flex flex-wrap gap-1">
              {step.input.length > 0 ? step.input.map((tok, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-mono transition-all duration-200 ${
                    i === 0
                      ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm scale-105 font-semibold'
                      : 'bg-neutral-100 border-neutral-200 text-neutral-500'
                  }`}
                >
                  {tok}
                </span>
              )) : (
                <span className="text-xs text-neutral-400 italic">vacía</span>
              )}
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-3 transition-all duration-200 ${actionBg(step.action)}`}>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mr-2">
              Acción:
            </span>
            <span className={`text-sm font-mono font-semibold ${actionColor(step.action)}`}>
              {step.action}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-1.5">
              Estado en cima de la pila
            </p>
            <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-mono font-bold text-blue-700">
              I{step.topState}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
