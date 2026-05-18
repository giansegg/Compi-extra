'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Download, FileText, Trash2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react'
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history'
import { PARSERS } from '@/lib/parsers'
import type { ParseResult } from '@/lib/types'

interface Props {
  grammar:   string
  tokens:    string
  parserKey: string
  result:    ParseResult | null
  onLoad:    (grammar: string, tokens: string) => void
}

function relTime(ts: number): string {
  const d = Date.now() - ts
  if (d < 60_000)     return 'ahora'
  if (d < 3_600_000)  return `${Math.floor(d / 60_000)} min`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} h`
  return new Date(ts).toLocaleDateString()
}

// ── Plain-text export ──────────────────────────────────────────────────────────
function buildTxtContent(
  parserKey: string, grammar: string, tokens: string, result: ParseResult
): string {
  const label = PARSERS[parserKey]?.label ?? parserKey
  const lines = [
    '╔══════════════════════════════════╗',
    '║       PARSER LAB — REPORTE       ║',
    '╚══════════════════════════════════╝',
    `Parser  : ${label}`,
    `Fecha   : ${new Date().toLocaleString()}`,
    '',
    '── GRAMÁTICA ─────────────────────',
    grammar,
    '',
    `── CADENA DE PRUEBA ──────────────`,
    tokens,
    '',
  ]
  if (result.ll1Simulate) {
    const { accepted, steps } = result.ll1Simulate
    lines.push(`── RESULTADO: ${accepted ? 'ACEPTADO ✓' : 'RECHAZADO ✗'} ──`)
    lines.push('')
    lines.push('── TRAZA PASO A PASO ─────────────')
    steps.forEach((s, i) => {
      lines.push(`  ${String(i + 1).padStart(2)}. ${s.action}`)
      lines.push(`      Pila   : ${s.stack.join(' ')}`)
      lines.push(`      Entrada: ${s.input.join(' ')}`)
    })
  } else if (result.textSimulate) {
    lines.push(`── RESULTADO: ${result.textSimulate.accepted ? 'ACEPTADO ✓' : 'RECHAZADO ✗'} ──`)
    lines.push('')
    lines.push('── TRAZA ─────────────────────────')
    lines.push(result.textSimulate.output)
  }
  return lines.join('\n')
}

// ── PDF export using jsPDF ─────────────────────────────────────────────────────
async function exportPDF(
  parserKey: string, grammar: string, tokens: string, result: ParseResult
) {
  const { default: jsPDF } = await import('jspdf')
  // @ts-ignore – autotable augments jsPDF prototype
  const { default: autoTable } = await import('jspdf-autotable')

  const label = PARSERS[parserKey]?.label ?? parserKey
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 0

  // ── Header banner ──
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, W, 22, 'F')
  doc.setTextColor(248, 250, 252)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Parser Lab', 14, 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte de análisis sintáctico', 14, 16)
  doc.setTextColor(148, 163, 184)
  doc.text(new Date().toLocaleString(), W - 14, 16, { align: 'right' })
  y = 30

  // ── Meta row ──
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Parser:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(label, 36, y)

  const accepted = result.ll1Simulate?.accepted ?? result.textSimulate?.accepted
  if (accepted !== undefined) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(accepted ? 22 : 220, accepted ? 163 : 38, accepted ? 74 : 38)
    doc.text(accepted ? '✓ ACEPTADO' : '✗ RECHAZADO', W - 14, y, { align: 'right' })
    doc.setTextColor(15, 23, 42)
  }
  y += 8

  // ── Divider ──
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(14, y, W - 14, y)
  y += 6

  // ── Grammar ──
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('GRAMÁTICA', 14, y)
  y += 4
  doc.setFont('courier', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  const gramLines = grammar.split('\n')
  gramLines.forEach(line => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.text(line, 14, y)
    y += 4.5
  })
  y += 2

  // ── Tokens ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('CADENA DE PRUEBA', 14, y)
  y += 4
  doc.setFont('courier', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(tokens, 14, y)
  y += 8

  // ── ACTION/GOTO table ──
  if (result.lrTable && result.lrTable.table.length) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('TABLA ACTION / GOTO', 14, y)
    y += 2

    const rows   = result.lrTable.table
    const first  = rows[0]
    const aCols  = Object.keys(first.action)
    const gCols  = Object.keys(first.goto)
    const head   = ['St', ...aCols, ...gCols]
    const body   = rows.map(r => [
      String(r.state),
      ...aCols.map(c => r.action[c] || ''),
      ...gCols.map(c => (r.goto[c] !== '' ? String(r.goto[c]) : '')),
    ])

    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      styles: { fontSize: 6.5, font: 'courier', cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [15, 23, 42], textColor: [248, 250, 252], fontStyle: 'bold' },
      columnStyles: { 0: { fillColor: [248, 250, 252], fontStyle: 'bold', halign: 'center' } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    })
    y = (doc as any).lastAutoTable.finalY + 6
  }

  // ── LL(1) step trace ──
  if (result.ll1Simulate?.steps) {
    const steps = result.ll1Simulate.steps
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    if (y > 240) { doc.addPage(); y = 20 }
    doc.text('TRAZA DE SIMULACIÓN LL(1)', 14, y)
    y += 2

    const body = steps.map((s, i) => [
      String(i + 1),
      s.stack.join(' '),
      s.input.join(' '),
      s.action,
    ])

    autoTable(doc, {
      startY: y,
      head: [['#', 'Pila', 'Entrada', 'Acción']],
      body,
      styles: { fontSize: 6.5, font: 'courier', cellPadding: 1.5 },
      headStyles: { fillColor: [15, 23, 42], textColor: [248, 250, 252], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 6
  }

  // ── LR text trace ──
  if (result.textSimulate?.output) {
    if (y > 220) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('TRAZA DE SIMULACIÓN', 14, y)
    y += 4
    doc.setFont('courier', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(15, 23, 42)
    const traceLines = result.textSimulate.output.split('\n').slice(0, 60)
    traceLines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(line.slice(0, 100), 14, y)
      y += 3.5
    })
  }

  // ── Footer ──
  const pages = (doc.internal as any).getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.text(`Parser Lab — ${label}`, 14, 290)
    doc.text(`Página ${p} / ${pages}`, W - 14, 290, { align: 'right' })
  }

  doc.save(`parser-lab-${parserKey}-${Date.now()}.pdf`)
}

// ── Component ─────────────────────────────────────────────────────────────────
export function HistoryExport({ grammar, tokens, parserKey, result, onLoad }: Props) {
  const [history,    setHistory]    = useState<HistoryEntry[]>([])
  const [open,       setOpen]       = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => { setHistory(getHistory()) }, [result])

  const handleTxt = useCallback(() => {
    if (!result) return
    const content = buildTxtContent(parserKey, grammar, tokens, result)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `parser-lab-${parserKey}-${Date.now()}.txt`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }, [grammar, tokens, parserKey, result])

  const handlePdf = useCallback(async () => {
    if (!result) return
    setPdfLoading(true)
    try { await exportPDF(parserKey, grammar, tokens, result) }
    catch (e) { console.error(e) }
    finally { setPdfLoading(false) }
  }, [grammar, tokens, parserKey, result])

  return (
    <div className="lab-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Historial & Exportación
          </span>
          {history.length > 0 && (
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500">
              {history.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <>
              <button
                onClick={e => { e.stopPropagation(); handleTxt() }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 shadow-sm"
              >
                <Download className="h-3 w-3" />
                .txt
              </button>
              <button
                onClick={e => { e.stopPropagation(); handlePdf() }}
                disabled={pdfLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-all duration-150 shadow-sm"
              >
                <FileText className="h-3 w-3" />
                {pdfLoading ? 'Generando…' : 'PDF'}
              </button>
            </>
          )}
          <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-4 pb-4">
          {history.length === 0 ? (
            <p className="pt-4 text-xs text-neutral-400 text-center">
              Sin historial. Las ejecuciones aparecerán aquí automáticamente.
            </p>
          ) : (
            <>
              <div className="pt-2 space-y-0.5 max-h-52 overflow-y-auto -mx-1 px-1">
                {history.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => { onLoad(entry.grammar, entry.tokens); setOpen(false) }}
                    className="w-full flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-neutral-50 transition-colors duration-150 group"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {entry.accepted === true
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        : entry.accepted === false
                        ? <XCircle className="h-3.5 w-3.5 text-red-400" />
                        : <div className="h-3.5 w-3.5 rounded-full border-2 border-neutral-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-neutral-600 uppercase">
                          {PARSERS[entry.parserKey]?.label ?? entry.parserKey}
                        </span>
                        <span className="text-[10px] text-neutral-400">{relTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-700 truncate">{entry.tokens || '(sin tokens)'}</p>
                      <p className="text-[10px] font-mono text-neutral-400 truncate">{entry.grammar.split('\n')[0]}</p>
                    </div>
                    <span className="text-[10px] text-neutral-300 group-hover:text-neutral-500 transition-colors duration-150 self-center flex-shrink-0">→</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { clearHistory(); setHistory([]) }}
                className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-500 transition-colors duration-150"
              >
                <Trash2 className="h-3 w-3" /> Limpiar historial
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
