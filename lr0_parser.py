"""LR(0) parser: table construction and simulation."""
from grammar import Grammar, EOF
from lr_core import build_lr0_automaton, LR0Item, print_lr0_states
from lr_simulator import ActionTable, GotoTable, simulate_lr, print_lr_table


def build_lr0_tables(
    grammar: Grammar,
    *,
    verbose: bool = False,
) -> tuple[ActionTable, GotoTable, list[str]]:
    """Build LR(0) ACTION and GOTO tables.  Returns (action, goto, conflicts)."""
    aug = grammar.augment()
    states, transitions = build_lr0_automaton(grammar)
    if verbose:
        print_lr0_states(states)

    # Identify the augmented start production
    aug_start = aug.start
    aug_body = tuple(aug.productions[aug_start][0])  # (original_start,)

    action: ActionTable = {}
    goto: GotoTable = {}
    conflicts: list[str] = []

    def _add_action(state: int, sym: str, entry: tuple) -> None:
        key = (state, sym)
        if key in action and action[key] != entry:
            conflicts.append(f"  Conflict s{state} on '{sym}': {action[key]} vs {entry}")
        else:
            action[key] = entry

    terminals = sorted(grammar.terminals)

    for si, state in enumerate(states):
        for item in state:
            ns = item.next_symbol()
            if ns is not None:
                # Shift / Goto
                if ns in aug.terminals:
                    dest = transitions.get((si, ns))
                    if dest is not None:
                        _add_action(si, ns, ('shift', dest))
                elif ns in aug.non_terminals and ns != aug_start:
                    dest = transitions.get((si, ns))
                    if dest is not None:
                        goto[(si, ns)] = dest
            else:
                # Reduce or Accept
                if item.head == aug_start and item.body == aug_body:
                    _add_action(si, EOF, ('accept',))
                else:
                    # LR(0): reduce on ALL terminals (and $)
                    for t in list(grammar.terminals) + [EOF]:
                        _add_action(si, t, ('reduce', item.head, item.body))

    # Also fill goto for original non-terminals from transitions
    for (si, sym), dest in transitions.items():
        if sym in grammar.non_terminals:
            goto[(si, sym)] = dest

    return action, goto, conflicts


def run_lr0(grammar: Grammar, tokens: list[str], *, show_table: bool = True) -> bool:
    action, goto, conflicts = build_lr0_tables(grammar)
    n = len(build_lr0_automaton(grammar)[0])
    terms = sorted(grammar.terminals)
    nts = sorted(grammar.non_terminals)

    print("\n=== LR(0) ===")
    if conflicts:
        print("Conflicts detected (grammar is NOT LR(0)):")
        for c in conflicts:
            print(c)

    if show_table:
        print_lr_table(action, goto, n, terms, nts, "LR(0)")

    return simulate_lr(action, goto, tokens, "LR(0)")
