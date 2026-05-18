"""LALR(1) parser: merges LR(1) states that share the same LR(0) core."""
from collections import defaultdict

from api.grammar import Grammar, EOF
from api.lr_core import (
    LR0Item, LR1Item,
    build_lr0_automaton, build_lr1_automaton,
    State1,
)
from api.lr_simulator import ActionTable, GotoTable, simulate_lr, print_lr_table


def build_lalr1_tables(
    grammar: Grammar,
    *,
    verbose: bool = False,
) -> tuple[ActionTable, GotoTable, list[str]]:
    """Build LALR(1) ACTION and GOTO tables.

    Strategy:
    1. Build the LR(1) canonical collection.
    2. Group states by their LR(0) core (same items ignoring lookaheads).
    3. Merge lookaheads within each group → LALR(1) states.
    4. Remap state numbers, build tables.
    """
    aug = grammar.augment()
    lr1_states, lr1_trans = build_lr1_automaton(grammar)

    # ── step 1: group LR(1) states by core ──────────────────────────────────
    # core -> list of lr1 state indices
    core_to_lr1: dict[frozenset[LR0Item], list[int]] = defaultdict(list)
    for idx, state in enumerate(lr1_states):
        core = frozenset(item.core() for item in state)
        core_to_lr1[core].append(idx)

    # canonical ordering of LALR states (stable: based on min lr1 index)
    sorted_cores = sorted(core_to_lr1.keys(),
                          key=lambda c: min(core_to_lr1[c]))

    # map lr1 state index -> lalr state index
    lr1_to_lalr: dict[int, int] = {}
    for lalr_idx, core in enumerate(sorted_cores):
        for lr1_idx in core_to_lr1[core]:
            lr1_to_lalr[lr1_idx] = lalr_idx

    # ── step 2: build LALR states by merging lookaheads ──────────────────────
    # Each LALR state is a dict: LR0Item -> set[lookahead]
    lalr_states: list[dict[LR0Item, set[str]]] = []
    for core in sorted_cores:
        merged: dict[LR0Item, set[str]] = defaultdict(set)
        for lr1_idx in core_to_lr1[core]:
            for item in lr1_states[lr1_idx]:
                merged[item.core()].add(item.lookahead)
        lalr_states.append(dict(merged))

    n = len(lalr_states)

    # ── step 3: remap transitions ─────────────────────────────────────────────
    lalr_trans: dict[tuple[int, str], int] = {}
    for (lr1_si, sym), lr1_dest in lr1_trans.items():
        lalr_src = lr1_to_lalr[lr1_si]
        lalr_dest = lr1_to_lalr[lr1_dest]
        lalr_trans[(lalr_src, sym)] = lalr_dest

    # ── step 4: build tables ─────────────────────────────────────────────────
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

    for si, la_state in enumerate(lalr_states):
        for lr0_item, lookaheads in la_state.items():
            ns = lr0_item.next_symbol()
            if ns is not None:
                if ns in aug.terminals:
                    dest = lalr_trans.get((si, ns))
                    if dest is not None:
                        _add_action(si, ns, ('shift', dest))
            else:
                if lr0_item.head == aug_start and lr0_item.body == aug_body:
                    _add_action(si, EOF, ('accept',))
                else:
                    for la in lookaheads:
                        _add_action(si, la, ('reduce', lr0_item.head, lr0_item.body))

    for (si, sym), dest in lalr_trans.items():
        if sym in grammar.non_terminals:
            goto[(si, sym)] = dest

    if verbose:
        _print_lalr_states(lalr_states)

    return action, goto, conflicts


def _print_lalr_states(lalr_states: list[dict[LR0Item, set[str]]]) -> None:
    print("\n=== LALR(1) Merged States ===")
    for i, state in enumerate(lalr_states):
        print(f"\n  State {i}:")
        for lr0_item, las in sorted(state.items(), key=lambda kv: str(kv[0])):
            la_str = '/'.join(sorted(las))
            print(f"    {lr0_item}, {la_str}")


def run_lalr1(grammar: Grammar, tokens: list[str], *, show_table: bool = True) -> bool:
    action, goto, conflicts = build_lalr1_tables(grammar)

    # Count LALR states: same as number of unique cores
    from collections import defaultdict
    from api.lr_core import build_lr1_automaton
    lr1_states, _ = build_lr1_automaton(grammar)
    aug = grammar.augment()
    cores: set[frozenset] = set()
    for st in lr1_states:
        cores.add(frozenset(item.core() for item in st))
    n = len(cores)

    terms = sorted(grammar.terminals)
    nts = sorted(grammar.non_terminals)

    print("\n=== LALR(1) ===")
    if conflicts:
        print("Conflicts detected (grammar is NOT LALR(1)):")
        for c in conflicts:
            print(c)

    if show_table:
        print_lr_table(action, goto, n, terms, nts, "LALR(1)")

    return simulate_lr(action, goto, tokens, "LALR(1)")
