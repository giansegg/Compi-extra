/**
 * Grammar Zoo — colección de gramáticas clásicas listas para demo.
 *
 * Cada entrada incluye:
 *   - grammar:      texto de la gramática
 *   - validTokens:  cadena de tokens que la gramática acepta
 *   - invalidTokens (opcional): cadena que la gramática rechaza
 *   - notes:        explicación pedagógica corta
 *   - compatibility: parsers donde tiene sentido probarla
 */

export type ParserKind = 'll1' | 'rd' | 'lr0' | 'slr1' | 'lr1' | 'lalr1'

export interface GrammarExample {
  id: string
  name: string
  category:
    | 'classic'        // gramáticas clásicas de compiladores
    | 'ambiguous'      // gramáticas con ambigüedad intencional
    | 'left-recursive' // con recursión izquierda
    | 'factoring'      // requiere factorización para LL(1)
    | 'minimal'        // ejemplos minimalistas
  description: string
  grammar: string
  validTokens: string
  invalidTokens?: string
  notes: string
  compatibleWith: ParserKind[]
  incompatibleWith: ParserKind[]   // dónde fallará a propósito (didáctico)
}

export const GRAMMAR_ZOO: GrammarExample[] = [
  // ─────────────────────────────────────────── 1
  {
    id: 'arith-ll',
    name: 'Aritmética (LL-friendly)',
    category: 'classic',
    description: 'Expresiones aritméticas factorizadas, sin recursión izquierda',
    grammar: `E  -> T E'
E' -> + T E' | eps
T  -> F T'
T' -> * F T' | eps
F  -> ( E ) | id`,
    validTokens: 'id + id * id',
    invalidTokens: 'id + + id',
    notes:
      'Versión transformada de la gramática aritmética clásica. Se eliminó la recursión izquierda introduciendo E\' y T\'. Compatible con LL(1) y Descenso Recursivo.',
    compatibleWith: ['ll1', 'rd', 'lr0', 'slr1', 'lr1', 'lalr1'],
    incompatibleWith: [],
  },

  // ─────────────────────────────────────────── 2
  {
    id: 'arith-lr',
    name: 'Aritmética (LR-friendly)',
    category: 'left-recursive',
    description: 'Expresiones aritméticas con recursión izquierda clásica',
    grammar: `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`,
    validTokens: 'id + id * id',
    invalidTokens: 'id * * id',
    notes:
      'La forma natural de la gramática aritmética: recursión izquierda directa. Los parsers Bottom-Up (LR) la manejan sin problema. LL(1) entrará en loop infinito.',
    compatibleWith: ['lr0', 'slr1', 'lr1', 'lalr1'],
    incompatibleWith: ['ll1', 'rd'],
  },

  // ─────────────────────────────────────────── 3
  {
    id: 'parens',
    name: 'Paréntesis balanceados',
    category: 'minimal',
    description: 'Lenguaje de paréntesis bien anidados, gramática mínima',
    grammar: `S -> ( S ) S | eps`,
    validTokens: '( ( ) ( ) )',
    invalidTokens: '( ( )',
    notes:
      'Ejemplo minimalista. Es LL(1) (factorizada) y a la vez LR. Demuestra cómo se maneja épsilon en ambas familias de parsers.',
    compatibleWith: ['ll1', 'rd', 'lr0', 'slr1', 'lr1', 'lalr1'],
    incompatibleWith: [],
  },

  // ─────────────────────────────────────────── 4
  {
    id: 'dangling-else',
    name: 'If-Else colgante (ambigua)',
    category: 'ambiguous',
    description: 'El clásico problema del else colgante en C/Java',
    grammar: `S -> if E then S else S
S -> if E then S
S -> id
E -> id`,
    validTokens: 'if id then if id then id else id',
    notes:
      'Gramática AMBIGUA: la cadena "if E then if E then S else S" tiene dos árboles de derivación distintos. Los parsers LR la rechazan por conflicto Shift/Reduce. Es el ejemplo más famoso de ambigüedad en lenguajes de programación.',
    compatibleWith: [],
    incompatibleWith: ['ll1', 'rd', 'lr0', 'slr1', 'lr1', 'lalr1'],
  },

  // ─────────────────────────────────────────── 5
  {
    id: 'common-prefix',
    name: 'Prefijos comunes (necesita factorización)',
    category: 'factoring',
    description: 'Producciones con prefijo común — falla en LL(1) hasta factorizar',
    grammar: `S -> if E then S
S -> if E then S else S
S -> id
E -> id`,
    validTokens: 'if id then id',
    notes:
      'Las dos primeras producciones comparten el prefijo "if E then S". LL(1) no puede decidir cuál aplicar con un solo lookahead → conflicto en la tabla. La solución es FACTORIZACIÓN IZQUIERDA. Las recomendaciones inteligentes deberían sugerirlo.',
    compatibleWith: ['lr0', 'slr1', 'lr1', 'lalr1'],
    incompatibleWith: ['ll1', 'rd'],
  },

  // ─────────────────────────────────────────── 6
  {
    id: 'lr1-not-slr',
    name: 'Gramática LR(1) pero NO SLR(1)',
    category: 'classic',
    description: 'Muestra la diferencia de potencia entre SLR(1) y LR(1)',
    grammar: `S -> L = R
S -> R
L -> * R
L -> id
R -> L`,
    validTokens: 'id = id',
    notes:
      'Esta gramática (Dragon Book, ej. 4.39) NO es SLR(1) porque FOLLOW(R) genera un conflicto Shift/Reduce en el estado donde L ya se reconoció. PERO sí es LR(1) gracias al lookahead por contexto. Demuestra cuándo necesitas pasar de SLR a LR(1)/LALR.',
    compatibleWith: ['lr1', 'lalr1'],
    incompatibleWith: ['ll1', 'rd', 'lr0', 'slr1'],
  },

  // ─────────────────────────────────────────── 7
  {
    id: 'list-comma',
    name: 'Lista separada por comas',
    category: 'left-recursive',
    description: 'Listas con recursión izquierda — ejemplo clásico de LR',
    grammar: `L -> L , E | E
E -> id | num`,
    validTokens: 'id , num , id',
    invalidTokens: 'id , , num',
    notes:
      'Patrón super común en lenguajes reales: argumentos de funciones, elementos de un array, etc. La recursión izquierda es natural y los parsers LR la manejan eficientemente.',
    compatibleWith: ['lr0', 'slr1', 'lr1', 'lalr1'],
    incompatibleWith: ['ll1', 'rd'],
  },

  // ─────────────────────────────────────────── 8
  {
    id: 'assign-stmt',
    name: 'Asignaciones (statement-list)',
    category: 'classic',
    description: 'Lista de asignaciones separadas por punto y coma',
    grammar: `P  -> S P'
P' -> ; S P' | eps
S  -> id = E
E  -> E + T | T
T  -> id | num`,
    validTokens: 'id = id + num ; id = num',
    notes:
      'Gramática mixta: la lista de statements está factorizada (estilo LL), pero las expresiones usan recursión izquierda (estilo LR). Es LR(1) y LALR(1), pero NO LL(1) por la recursión izquierda en E.',
    compatibleWith: ['lr0', 'slr1', 'lr1', 'lalr1'],
    incompatibleWith: ['ll1', 'rd'],
  },
]

export function findExample(id: string): GrammarExample | undefined {
  return GRAMMAR_ZOO.find(g => g.id === id)
}

export const CATEGORY_LABELS: Record<GrammarExample['category'], string> = {
  classic:           'Clásica',
  ambiguous:         'Ambigua',
  'left-recursive':  'Recursión izquierda',
  factoring:         'Necesita factorización',
  minimal:           'Minimalista',
}
