"""FIRST and FOLLOW set computation."""
from api.grammar import Grammar, EPSILON, EOF


def compute_first(grammar: Grammar) -> dict[str, frozenset[str]]:
    """Compute FIRST sets for all non-terminals."""
    first: dict[str, set[str]] = {nt: set() for nt in grammar.non_terminals}
    changed = True
    while changed:
        changed = False
        for head, bodies in grammar.productions.items():
            for body in bodies:
                added = _first_of_body(body, first, grammar.non_terminals)
                before = len(first[head])
                first[head] |= added
                if len(first[head]) != before:
                    changed = True
    return {k: frozenset(v) for k, v in first.items()}


def _first_of_body(
    body: list[str],
    first: dict[str, set[str]],
    non_terminals: frozenset[str],
) -> set[str]:
    result: set[str] = set()
    for sym in body:
        if sym == EPSILON:
            result.add(EPSILON)
            return result
        if sym not in non_terminals:
            result.add(sym)
            return result
        # sym is a non-terminal
        result |= first.get(sym, set()) - {EPSILON}
        if EPSILON not in first.get(sym, set()):
            return result
    # All symbols can derive ε
    result.add(EPSILON)
    return result


def first_of_string(
    string: list[str],
    first: dict[str, frozenset[str]],
    non_terminals: frozenset[str],
) -> frozenset[str]:
    """Compute FIRST of an arbitrary string of grammar symbols."""
    result: set[str] = set()
    for sym in string:
        if sym == EPSILON:
            result.add(EPSILON)
            return frozenset(result)
        if sym not in non_terminals:
            result.add(sym)
            return frozenset(result)
        result |= first.get(sym, frozenset()) - {EPSILON}
        if EPSILON not in first.get(sym, frozenset()):
            return frozenset(result)
    result.add(EPSILON)
    return frozenset(result)


def compute_follow(
    grammar: Grammar,
    first: dict[str, frozenset[str]],
) -> dict[str, frozenset[str]]:
    """Compute FOLLOW sets for all non-terminals."""
    follow: dict[str, set[str]] = {nt: set() for nt in grammar.non_terminals}
    follow[grammar.start].add(EOF)

    changed = True
    while changed:
        changed = False
        for head, bodies in grammar.productions.items():
            for body in bodies:
                trailer: set[str] = set(follow[head])
                for sym in reversed(body):
                    if sym == EPSILON:
                        continue
                    if sym in grammar.non_terminals:
                        before = len(follow[sym])
                        follow[sym] |= trailer
                        if len(follow[sym]) != before:
                            changed = True
                        if EPSILON in first.get(sym, frozenset()):
                            trailer = trailer | (first[sym] - {EPSILON})
                        else:
                            trailer = set(first.get(sym, frozenset()) - {EPSILON})
                    else:
                        trailer = {sym}
    return {k: frozenset(v) for k, v in follow.items()}


def print_first_follow(
    first: dict[str, frozenset[str]],
    follow: dict[str, frozenset[str]],
) -> None:
    print("\n=== FIRST sets ===")
    for nt in sorted(first):
        syms = ', '.join(sorted(first[nt]))
        print(f"  FIRST({nt}) = {{ {syms} }}")
    print("\n=== FOLLOW sets ===")
    for nt in sorted(follow):
        syms = ', '.join(sorted(follow[nt]))
        print(f"  FOLLOW({nt}) = {{ {syms} }}")
