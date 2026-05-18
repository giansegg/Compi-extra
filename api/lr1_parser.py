"""LR(1) parser: canonical LR(1) tables with per-item lookaheads."""
from api.grammar import Grammar, EOF
from api.lr_core import build_lr1_automaton, LR1Item, print_lr1_states
from api.lr_simulator import ActionTable, GotoTable, simulate_lr, print_lr_table


def build_lr1_tables(
    grammar: Grammar,
    *,
    verbose: bool = False,
) -> tuple[ActionTable, GotoTable, list[str]]:
    """Build canonical LR(1) ACTION and GOTO tables."""
    aug = grammar.augment()
    states, transitions = build_lr1_automaton(grammar)

    if verbose:
        print_lr1_states(states)

    aug_start = aug.start
    aug_body = tuple(aug.productions[aug_start][0])

    action: ActionTable = {}
    goto: GotoTable = {}
    conflicts: list[str] = []

    def _add_action(state: int, sym: str, entry: tuple) -> None:
        key = (state, sym)
        if key in action and action[key] != entry:
            conflicts.append(f"  Conflict s{state} on '{sym}': {action[key]} vs {entry}")
        else:
            action[key] = entry

    for si, state in enumerate(states):
        for item in state:
            ns = item.next_symbol()
            if ns is not None:
                if ns in aug.terminals:
                    dest = transitions.get((si, ns))
                    if dest is not None:
                        _add_action(si, ns, ('shift', dest))
            else:
                if item.head == aug_start and item.body == aug_body:
                    _add_action(si, EOF, ('accept',))
                else:
                    # LR(1): reduce only on the item's own lookahead
                    _add_action(si, item.lookahead, ('reduce', item.head, item.body))

    for (si, sym), dest in transitions.items():
        if sym in grammar.non_terminals:
            goto[(si, sym)] = dest

    return action, goto, conflicts


def run_lr1(grammar: Grammar, tokens: list[str], *, show_table: bool = True) -> bool:
    action, goto, conflicts = build_lr1_tables(grammar)
    n = len(build_lr1_automaton(grammar)[0])
    terms = sorted(grammar.terminals)
    nts = sorted(grammar.non_terminals)

    print("\n=== LR(1) ===")
    if conflicts:
        print("Conflicts detected (grammar is NOT LR(1)):")
        for c in conflicts:
            print(c)

    if show_table:
        print_lr_table(action, goto, n, terms, nts, "LR(1)")

    return simulate_lr(action, goto, tokens, "LR(1)")
