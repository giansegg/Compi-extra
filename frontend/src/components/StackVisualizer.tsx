'use client'

import { useEffect, useRef } from 'react'

interface Props {
  stack:    string[]   // [top, ..., bottom]  (LL(1) convention)
  label?:   string
}

function SymbolBlock({
  sym, isTop, isBottom, index, total,
}: { sym: string; isTop: boolean; isBottom: boolean; index: number; total: number }) {
  const depth = total - 1 - index  // distance from top (0 = top)

  return (
    <div
      className={`
        stack-block-enter relative flex items-center justify-center
        rounded-xl border font-mono text-sm font-semibold
        transition-all duration-200 select-none
        ${isTop
          ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-md z-10 scale-105 ring-2 ring-blue-200 ring-offset-1'
          : 'bg-white border-neutral-200 text-neutral-600 shadow-sm'
        }
      `}
      style={{
        width: '3.5rem',
        height: '2.2rem',
        opacity: isBottom ? 0.55 : Math.max(0.6, 1 - depth * 0.07),
      }}
      title={isTop ? `Cima de la pila: ${sym}` : sym}
    >
      {sym === '$' ? <span className="opacity-60">$</span> : sym}
      {isTop && (
        <span className="absolute -right-8 text-[9px] font-sans font-semibold text-blue-500 uppercase tracking-wider">
          top
        </span>
      )}
    </div>
  )
}

export function StackVisualizer({ stack, label = 'Pila de análisis' }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to show bottom when stack grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [stack.length])

  // Display: bottom of stack at bottom, top at top visually
  // stack[0] = top, stack[last] = bottom
  // We display reversed: stack[last] at bottom → stack[0] at top
  const displayed = [...stack].reverse()  // [bottom, ..., top]

  return (
    <div className="lab-card overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b border-neutral-100">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {label}
        </h3>
      </div>

      {/* Stack tower */}
      <div className="flex-1 flex flex-col items-center justify-end gap-1 px-6 py-4 min-h-[220px] overflow-y-auto">
        {stack.length === 0 ? (
          <p className="text-xs text-neutral-400 mb-4">Pila vacía</p>
        ) : (
          <>
            {/* Render top-to-bottom visually (displayed[last] = top) */}
            {displayed.map((sym, i) => {
              const isTop    = i === displayed.length - 1
              const isBottom = i === 0
              return (
                <SymbolBlock
                  key={`${sym}-${i}`}
                  sym={sym}
                  isTop={isTop}
                  isBottom={isBottom}
                  index={i}
                  total={displayed.length}
                />
              )
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Base label */}
      <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-2">
          <div className="h-1 w-full rounded-full bg-neutral-300" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400 whitespace-nowrap">
            BASE
          </span>
          <div className="h-1 w-full rounded-full bg-neutral-300" />
        </div>
      </div>
    </div>
  )
}
