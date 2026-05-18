export type RecSeverity = 'info' | 'warning' | 'error'
export type RecType = 'left_recursion' | 'ambiguity' | 'factorization' | 'll_with_lr_grammar'

export interface Recommendation {
  type: RecType
  title: string
  description: string
  example?: string
  severity: RecSeverity
}

function parseProductions(grammar: string): Array<{ nt: string; bodies: string[][] }> {
  return grammar
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('->'))
    .map(line => {
      const [lhs, rhs] = line.split('->')
      if (!lhs || !rhs) return null
      const nt    = lhs.trim()
      const bodies = rhs
        .split('|')
        .map(alt => alt.trim().split(/\s+/).filter(Boolean))
        .filter(b => b.length > 0)
      return { nt, bodies }
    })
    .filter((x): x is { nt: string; bodies: string[][] } => x !== null)
}

export function analyzeRecommendations(
  grammar: string,
  conflicts: string[],
  parserKey: string,
): Recommendation[] {
  const recs: Recommendation[] = []
  const prods = parseProductions(grammar)
  const isTopDown = parserKey === 'll1' || parserKey === 'rd'

  // 1. Detect direct left recursion
  const leftRecursive: string[] = []
  for (const { nt, bodies } of prods) {
    for (const body of bodies) {
      if (body[0] === nt) {
        leftRecursive.push(nt)
        break
      }
    }
  }
  if (leftRecursive.length > 0) {
    recs.push({
      type: 'left_recursion',
      title: 'Recursión izquierda directa detectada',
      description: `Los no-terminales [${leftRecursive.join(', ')}] se producen a sí mismos como primer símbolo. ${isTopDown ? 'Esto hace que LL(1) y el Descenso Recursivo entren en un bucle infinito.' : 'Los parsers LR lo manejan bien, pero puede indicar un diseño a revisar.'}`,
      example: leftRecursive[0]
        ? `Para eliminarla en ${leftRecursive[0]}:\n${leftRecursive[0]}  -> β ${leftRecursive[0]}'\n${leftRecursive[0]}' -> α ${leftRecursive[0]}' | eps\n\n(donde α es el sufijo recursivo y β el resto)`
        : undefined,
      severity: isTopDown ? 'error' : 'info',
    })
  }

  // 2. Detect common prefix (factorization needed)
  const factorizationNeeded: string[] = []
  for (const { nt, bodies } of prods) {
    const firstSyms = bodies.map(b => b[0]).filter(Boolean)
    const seen = new Set<string>()
    for (const sym of firstSyms) {
      if (seen.has(sym)) {
        factorizationNeeded.push(`${nt} (prefijo: '${sym}')`)
        break
      }
      seen.add(sym)
    }
  }
  if (factorizationNeeded.length > 0 && isTopDown) {
    recs.push({
      type: 'factorization',
      title: 'Factorización izquierda recomendada',
      description: `Las producciones de [${factorizationNeeded.join(', ')}] tienen alternativas con el mismo símbolo inicial. Esto genera conflictos en la tabla LL(1) porque el parser no puede decidir qué producción aplicar.`,
      example: 'Aplica factorización izquierda: extrae el prefijo común en una nueva producción y deja que la siguiente decisión se tome con el siguiente símbolo.',
      severity: 'warning',
    })
  }

  // 3. Conflicts from API
  if (conflicts.length > 0) {
    recs.push({
      type: 'ambiguity',
      title: `${conflicts.length} conflicto${conflicts.length !== 1 ? 's' : ''} en la tabla`,
      description: `El parser reportó: ${conflicts.slice(0, 3).join(' · ')}${conflicts.length > 3 ? ` y ${conflicts.length - 3} más…` : ''}`,
      example: conflicts.length > 0
        ? 'Considera reestructurar la gramática eliminando la ambigüedad, o usa un parser más potente (LR(1) o LALR(1)) que puede manejar más conflictos.'
        : undefined,
      severity: 'warning',
    })
  }

  // 4. LL parser with typical LR grammar
  if (isTopDown && leftRecursive.length > 0) {
    recs.push({
      type: 'll_with_lr_grammar',
      title: 'Considera usar un parser LR',
      description: 'Estás usando un parser descendente con una gramática que parece diseñada para parsers ascendentes (tiene recursión izquierda). Los parsers LR(0), SLR(1), LR(1) o LALR(1) son más adecuados para este tipo de gramáticas.',
      severity: 'info',
    })
  }

  return recs
}
