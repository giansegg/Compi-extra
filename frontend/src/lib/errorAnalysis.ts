export type ErrorCategory = 'missing_production' | 'mismatch' | 'exhausted' | 'grammar' | 'lr_state' | 'unknown'

export interface ErrorAnalysis {
  title: string
  explanation: string
  hint: string
  category: ErrorCategory
}

export function analyzeError(errorMsg: string, parserKey: string): ErrorAnalysis {
  const msg = errorMsg

  // LL(1): no entry (NT, terminal)
  const noEntry = msg.match(/no entry \(([^,]+),\s*'?([^)']+)'?\)/i)
  if (noEntry) {
    const [, nt, term] = noEntry
    return {
      title: 'Producción no encontrada en la tabla',
      explanation: `Cuando la pila contiene el no-terminal '${nt.trim()}' y el siguiente token de entrada es '${term.trim()}', no existe ninguna entrada en la tabla de predicción. El parser no sabe qué producción aplicar.`,
      hint: `Verifica que la gramática sea LL(1) y que la cadena pertenezca al lenguaje. Si la gramática tiene ambigüedad o recursión izquierda, el token '${term.trim()}' puede estar causando un conflicto no visible.`,
      category: 'missing_production',
    }
  }

  // LL(1): mismatch
  const mismatch = msg.match(/mismatch '([^']+)' vs '([^']+)'/i)
  if (mismatch) {
    const [, expected, found] = mismatch
    return {
      title: 'Discrepancia de símbolos terminales',
      explanation: `El parser intentó emparejar (hacer "match") el terminal '${expected}' que estaba en la cima de la pila con el símbolo '${found}' que viene en la entrada, y no coinciden.`,
      hint: `Revisa el orden y contenido de los tokens en la cadena de prueba. El paso anterior probablemente predijo un '${expected}' pero la cadena continúa con '${found}'.`,
      category: 'mismatch',
    }
  }

  // Stack exhausted
  if (/exhausted|stack.*empty/i.test(msg)) {
    return {
      title: 'Pila agotada antes de consumir la entrada',
      explanation: 'La pila del parser quedó vacía pero todavía quedaban tokens por consumir. La gramática no genera suficientes derivaciones para cubrir toda la cadena.',
      hint: 'Comprueba que la cadena de prueba no tenga tokens extra al final, o que la gramática genere efectivamente ese lenguaje.',
      category: 'exhausted',
    }
  }

  // LR: no action for (state, symbol)
  const noAction = msg.match(/no action for \(s?(\d+),\s*'?([^)']+)'?\)/i)
  if (noAction) {
    const [, state, sym] = noAction
    return {
      title: `Sin acción en estado ${state} para '${sym.trim()}'`,
      explanation: `El autómata LR llegó al estado ${state} y encontró el símbolo '${sym.trim()}' en la entrada, pero la tabla ACTION no tiene ninguna entrada definida para esa combinación. El análisis no puede continuar.`,
      hint: `La cadena no pertenece al lenguaje de la gramática, o la gramática tiene conflictos que impiden al parser ${parserKey.toUpperCase()} manejar este caso. Prueba con un parser más potente (ej. LR(1) o LALR(1)).`,
      category: 'lr_state',
    }
  }

  // LR: no goto
  const noGoto = msg.match(/no goto for \(s?(\d+),\s*([^)]+)\)/i)
  if (noGoto) {
    const [, state, nt] = noGoto
    return {
      title: `Tabla GOTO incompleta en estado ${state}`,
      explanation: `Después de una reducción, el parser intentó consultar GOTO[${state}, ${nt.trim()}] y no encontró un estado destino. Esto indica un problema estructural en la gramática.`,
      hint: 'Revisa las producciones de tu gramática. Es posible que falte alguna regla o que haya un símbolo no definido como no-terminal.',
      category: 'lr_state',
    }
  }

  // Grammar parse error
  if (/grammar parse error|missing.?grammar|missing.?field/i.test(msg)) {
    const detail = msg.replace(/grammar parse error:\s*/i, '')
    return {
      title: 'Error de sintaxis en la gramática',
      explanation: detail || 'La gramática no pudo ser interpretada por el backend.',
      hint: "Formato correcto: 'NT -> cuerpo1 | cuerpo2'. Usa 'eps' o 'ε' para épsilon. Cada producción en una línea separada.",
      category: 'grammar',
    }
  }

  return {
    title: 'Error del parser',
    explanation: errorMsg,
    hint: 'Verifica la gramática y la cadena de prueba. Asegúrate de que el backend Flask esté corriendo en localhost:5000.',
    category: 'unknown',
  }
}
