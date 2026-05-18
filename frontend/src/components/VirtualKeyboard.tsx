interface KeyDef {
  label: string
  value: string
  title?: string
  wide?: boolean
}

const GRAMMAR_KEYS: KeyDef[] = [
  { label: 'ε',   value: 'eps', title: 'Épsilon (cadena vacía)' },
  { label: '→',   value: ' -> ', title: 'Flecha de producción' },
  { label: '|',   value: ' | ', title: 'Alternativa' },
  { label: "'",   value: "'", title: "Prima (E')" },
  { label: '(',   value: '(' },
  { label: ')',   value: ')' },
  { label: '$',   value: '$', title: 'Fin de cadena (EOF)' },
  { label: '↵',   value: '\n', title: 'Nueva línea' },
]

const TOKEN_KEYS: KeyDef[] = [
  { label: 'id',  value: 'id ', title: 'Identificador genérico' },
  { label: 'num', value: 'num ', title: 'Número' },
  { label: '+',   value: '+ ' },
  { label: '-',   value: '- ' },
  { label: '*',   value: '* ' },
  { label: '/',   value: '/ ' },
  { label: '(',   value: '( ' },
  { label: ')',   value: ') ' },
  { label: '$',   value: '$', title: 'Fin de cadena (EOF)' },
]

interface Props {
  target: 'grammar' | 'tokens'
  onInsert: (v: string) => void
}

export function VirtualKeyboard({ target, onInsert }: Props) {
  const keys = target === 'grammar' ? GRAMMAR_KEYS : TOKEN_KEYS

  return (
    <div className="flex flex-wrap gap-1">
      {keys.map(k => (
        <button
          key={k.label + k.value}
          type="button"
          title={k.title}
          onClick={() => onInsert(k.value)}
          className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-mono text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 transition-all duration-100 select-none"
        >
          {k.label}
        </button>
      ))}
    </div>
  )
}
