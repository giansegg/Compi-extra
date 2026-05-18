export interface LRParsedStep {
  step:     number
  stack:    string[]
  input:    string[]
  action:   string
  topState: number
}

export function parseLROutput(output: string): LRParsedStep[] {
  if (!output) return []
  return output
    .split('\n')
    .filter(l => /^\d+\s/.test(l.trim()))
    .map(line => {
      const trimmed = line.trim()
      const parts   = trimmed.split(/\s{2,}/)

      const step  = parseInt(parts[0] ?? '0')
      const stack = (parts[1] ?? '').trim().split(/\s+/).filter(Boolean)
      const input = (parts[2] ?? '').trim().split(/\s+/).filter(Boolean)
      const action = parts.slice(3).join('  ').trim()

      // Top LR state is the last integer token in the stack
      let topState = 0
      for (let i = stack.length - 1; i >= 0; i--) {
        const n = parseInt(stack[i])
        if (!isNaN(n)) { topState = n; break }
      }

      return {
        step:     isNaN(step) ? 0 : step,
        stack,
        input,
        action:   action || '?',
        topState,
      }
    })
}
