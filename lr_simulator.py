"""Generic LR simulation engine shared by LR(0), SLR(1), LR(1), LALR(1)."""
from grammar import EOF

ActionEntry = tuple   # ('shift', s) | ('reduce', head, body_tuple) | ('accept',)
ActionTable = dict[tuple[int, str], ActionEntry]
GotoTable = dict[tuple[int, str], int]


def simulate_lr(
    action: ActionTable,
    goto: GotoTable,
    tokens: list[str],
    parser_name: str = "LR",
) -> bool:
    """Step-by-step LR simulation.  Returns True on accept."""
    inp = tokens + [EOF]
    stack: list[int] = [0]
    idx = 0
    step = 0

    header = f"{'Step':<5} {'Stack':<30} {'Input':<25} Action"
    print(f"\n=== {parser_name} – parsing: {' '.join(tokens)} ===")
    print(header)
    print('-' * 80)

    def _stk_str() -> str:
        return ' '.join(str(s) for s in stack)

    def _inp_str() -> str:
        return ' '.join(inp[idx:])

    while True:
        state = stack[-1]
        curr = inp[idx]
        entry = action.get((state, curr))

        stk_str = _stk_str()
        inp_str = _inp_str()

        if entry is None:
            print(f"{step:<5} {stk_str:<30} {inp_str:<25} ERROR – no action for (s{state}, '{curr}')")
            return False

        if entry[0] == 'shift':
            _, next_state = entry
            print(f"{step:<5} {stk_str:<30} {inp_str:<25} Shift  → s{next_state}")
            stack.append(next_state)
            idx += 1

        elif entry[0] == 'reduce':
            _, head, body = entry
            body_str = ' '.join(body) if body else 'ε'
            print(f"{step:<5} {stk_str:<30} {inp_str:<25} Reduce {head} → {body_str}")
            # pop |body| states
            for _ in body:
                stack.pop()
            top = stack[-1]
            g = goto.get((top, head))
            if g is None:
                print(f"       ERROR – no goto for (s{top}, {head})")
                return False
            stack.append(g)

        elif entry[0] == 'accept':
            print(f"{step:<5} {stk_str:<30} {inp_str:<25} ACCEPT")
            return True

        else:
            print(f"ERROR – unknown action entry: {entry}")
            return False

        step += 1


def print_lr_table(
    action: ActionTable,
    goto: GotoTable,
    n_states: int,
    terminals: list[str],
    non_terminals: list[str],
    parser_name: str = "LR",
) -> None:
    """Pretty-print ACTION and GOTO tables."""
    col_w = 14

    def _fmt(entry: ActionEntry | None) -> str:
        if entry is None:
            return ''
        if entry[0] == 'shift':
            return f"s{entry[1]}"
        if entry[0] == 'reduce':
            body = ' '.join(entry[2]) if entry[2] else 'ε'
            return f"r:{entry[1]}→{body}"
        if entry[0] == 'accept':
            return 'acc'
        return str(entry)

    terms = terminals + [EOF]
    header = (f"{'St':>4}  "
              + ''.join(f"{t:^{col_w}}" for t in terms)
              + "  ||  "
              + ''.join(f"{nt:^{col_w}}" for nt in non_terminals))
    sep = '-' * len(header)

    print(f"\n=== {parser_name} Tables ===")
    print(f"{'':>4}  " + ''.join(f"{'ACTION':^{col_w * len(terms)}}")
          + "  ||  " + ''.join(f"{'GOTO':^{col_w * len(non_terminals)}}"))
    print(header)
    print(sep)

    for st in range(n_states):
        row = f"{st:>4}  "
        for t in terms:
            row += f"{_fmt(action.get((st, t))):^{col_w}}"
        row += "  ||  "
        for nt in non_terminals:
            g = goto.get((st, nt))
            row += f"{str(g) if g is not None else '':^{col_w}}"
        print(row)
    print(sep)
