'use client'

import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from 'lucide-react'

interface Props {
  stepIdx:      number
  totalSteps:   number
  isPlaying:    boolean
  onFirst:      () => void
  onBack:       () => void
  onTogglePlay: () => void
  onNext:       () => void
  onLast:       () => void
}

function Btn({
  onClick, disabled, active, title, children,
}: { onClick: () => void; disabled?: boolean; active?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150
        ${active
          ? 'border-blue-300 bg-blue-500 text-white shadow-sm hover:bg-blue-600'
          : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
        }
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

export function SimulationControls({
  stepIdx, totalSteps, isPlaying, onFirst, onBack, onTogglePlay, onNext, onLast,
}: Props) {
  if (!totalSteps) return null

  const canPrev = stepIdx > 0
  const canNext = stepIdx < totalSteps - 1

  return (
    <div className="lab-card px-4 py-3 flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 shrink-0">
        Simulación
      </span>

      <div className="flex items-center gap-1.5">
        <Btn onClick={onFirst}       disabled={!canPrev} title="Primer paso">
          <SkipBack      className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={onBack}        disabled={!canPrev} title="Paso anterior">
          <ChevronLeft   className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={onTogglePlay}  active={isPlaying}  title={isPlaying ? 'Pausar' : 'Reproducir automático (1.2 s/paso)'}>
          {isPlaying
            ? <Pause className="h-3.5 w-3.5" />
            : <Play  className="h-3.5 w-3.5" />
          }
        </Btn>
        <Btn onClick={onNext}        disabled={!canNext} title="Paso siguiente">
          <ChevronRight  className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={onLast}        disabled={!canNext} title="Último paso">
          <SkipForward   className="h-3.5 w-3.5" />
        </Btn>
      </div>

      <div className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden mx-1">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${totalSteps > 1 ? ((stepIdx + 1) / totalSteps) * 100 : 100}%` }}
        />
      </div>

      <span className="text-[11px] font-mono text-neutral-500 tabular-nums shrink-0">
        {stepIdx + 1} / {totalSteps}
      </span>
    </div>
  )
}
