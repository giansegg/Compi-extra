export interface HistoryEntry {
  id: string
  timestamp: number
  parserKey: string
  grammar: string
  tokens: string
  accepted: boolean | null
}

const KEY      = 'parser_lab_history'
const MAX_SIZE = 8

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export function pushHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return
  const existing = getHistory()
  const next: HistoryEntry = { ...entry, id: crypto.randomUUID(), timestamp: Date.now() }
  localStorage.setItem(KEY, JSON.stringify([next, ...existing].slice(0, MAX_SIZE)))
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
