"""LL(1) predictive parser: table construction and step-by-step simulation."""
from api.grammar import Grammar, EPSILON, EOF
from api.first_follow import compute_first, compute_follow, first_of_string

# (NonTerminal, terminal) -> production body
LL1Table = dict[tuple[str, str], list[str]]


def build_ll1_table(grammar: Grammar) -> tuple[LL1Table, list[str]]:
    """Build the LL(1) prediction table.  Returns (table, conflicts)."""
    first = compute_first(grammar)
    follow = compute_follow(grammar, first)
    table: LL1Table = {}
    conflicts: list[str] = []

    for head, bodies in grammar.productions.items():
        for body in bodies:
            first_body = first_of_string(body, first, grammar.non_terminals)
            for t in first_body - {EPSILON}:
                key = (head, t)
                if key in table:
                    conflicts.append(
                        f"  Conflict ({head}, {t}):  {' '.join(table[key])}  vs  {' '.join(body)}"
                    )
                else:
                    table[key] = body
            if EPSILON in first_body:
                for t in follow[head]:
                    key = (head, t)
                    if key in table:
                        conflicts.append(
                            f"  Conflict ({head}, {t}):  {' '.join(table[key])}  vs  {' '.join(body)}"
                        )
                    else:
                        table[key] = body

    return table, conflicts


def print_ll1_table(grammar: Grammar, table: LL1Table) -> None:
    """Pretty-print the LL(1) prediction table."""
    terminals = sorted(grammar.terminals) + [EOF]
    nts = sorted(grammar.non_terminals)
    col_w = 22
    sep = '-' * (10 + col_w * len(terminals))

    print(f"\n{'NT':<10}" + ''.join(f"{t:^{col_w}}" for t in terminals))
    print(sep)
    for nt in nts:
        row = f"{nt:<10}"
        for t in terminals:
            cell = table.get((nt, t))
            if cell is not None:
                entry = f"{nt}->{' '.join(cell)}"
            else:
                entry = ''
            row += f"{entry:^{col_w}}"
        print(row)
    print(sep)


def simulate_ll1(
    grammar: Grammar,
    table: LL1Table,
    tokens: list[str],
    *,
    verbose: bool = True,
) -> bool:
    """Simulate LL(1) parsing of *tokens* step by step.  Returns True on accept."""
    inp = tokens + [EOF]
    stack: list[str] = [EOF, grammar.start]
    idx = 0
    step = 0

    header = f"{'Step':<6} {'Stack':<35} {'Input':<25} Action"
    print(f"\n{header}")
    print('-' * len(header))

    def _fmt(s: list[str]) -> str:
        return ' '.join(s) if s else '(empty)'

    while stack:
        top = stack[-1]
        curr = inp[idx]
        stk_str = _fmt(list(reversed(stack)))
        inp_str = _fmt(inp[idx:])

        if top == EOF and curr == EOF:
            print(f"{step:<6} {stk_str:<35} {inp_str:<25} ACCEPT")
            return True

        if top == EOF:
            print(f"{step:<6} {stk_str:<35} {inp_str:<25} ERROR – stack exhausted, input remains")
            return False

        if top == curr:
            action = f"Match '{top}'"
            print(f"{step:<6} {stk_str:<35} {inp_str:<25} {action}")
            stack.pop()
            idx += 1

        elif top in grammar.non_terminals:
            key = (top, curr)
            if key not in table:
                print(f"{step:<6} {stk_str:<35} {inp_str:<25} ERROR – no entry for ({top}, {curr})")
                return False
            prod = table[key]
            action = f"Derivar  {top} -> {' '.join(prod)}"
            print(f"{step:<6} {stk_str:<35} {inp_str:<25} {action}")
            stack.pop()
            if prod != [EPSILON]:
                for sym in reversed(prod):
                    stack.append(sym)

        else:
            print(f"{step:<6} {stk_str:<35} {inp_str:<25} ERROR – mismatch '{top}' vs '{curr}'")
            return False

        step += 1

    print("ERROR – unexpected end of stack")
    return False
