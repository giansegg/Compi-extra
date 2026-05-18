import type { ParserConfig } from './types'

const LL_GRAMMAR = `E  -> T E'
E' -> + T E' | eps
T  -> F T'
T' -> * F T' | eps
F  -> ( E ) | id`

const LR_GRAMMAR = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`

export const PARSERS: Record<string, ParserConfig> = {
  ll1:   { key: 'll1',   label: 'LL(1)',              type: 'top-down',  hasTable: true,  defaultGrammar: LL_GRAMMAR },
  rd:    { key: 'rd',    label: 'Recursive Descent',  type: 'top-down',  hasTable: false, defaultGrammar: LL_GRAMMAR },
  lr0:   { key: 'lr0',   label: 'LR(0)',              type: 'bottom-up', hasTable: true,  defaultGrammar: LR_GRAMMAR },
  slr1:  { key: 'slr1',  label: 'SLR(1)',             type: 'bottom-up', hasTable: true,  defaultGrammar: LR_GRAMMAR },
  lr1:   { key: 'lr1',   label: 'LR(1)',              type: 'bottom-up', hasTable: true,  defaultGrammar: LR_GRAMMAR },
  lalr1: { key: 'lalr1', label: 'LALR(1)',            type: 'bottom-up', hasTable: true,  defaultGrammar: LR_GRAMMAR },
}

export const TOP_DOWN_PARSERS  = ['ll1', 'rd']
export const BOTTOM_UP_PARSERS = ['lr0', 'slr1', 'lr1', 'lalr1']
