"""Recursive-descent parser driven by the LL(1) table.

Instead of hand-writing one function per non-terminal, we build a
generic interpreter that consults the LL(1) table at each step and
recursively 'executes' the chosen production.  This cleanly separates
the grammar from the parsing logic.
"""
from grammar import Grammar, EPSILON, EOF
from ll1_parser import build_ll1_table, LL1Table


class RecursiveDescentParser:
    def __init__(self, grammar: Grammar) -> None:
        self.grammar = grammar
        self.table, self.conflicts = build_ll1_table(grammar)
        self._tokens: list[str] = []
        self._pos: int = 0
        self._depth: int = 0
        self._steps: list[str] = []

    # ------------------------------------------------------------------ public

    def parse(self, tokens: list[str]) -> bool:
        """Parse *tokens*; print trace and return True on success."""
        if self.conflicts:
            print("WARNING: grammar is not LL(1); conflicts detected:")
            for c in self.conflicts:
                print(c)

        self._tokens = tokens + [EOF]
        self._pos = 0
        self._depth = 0
        self._steps = []

        print(f"\n=== Recursive Descent: {' '.join(tokens)} ===")
        ok = self._parse_nt(self.grammar.start)
        remaining = self._tokens[self._pos:]

        if ok and remaining == [EOF]:
            self._log("<<< ACCEPT")
            print('\n'.join(self._steps))
            return True
        else:
            self._log(f"<<< REJECT – remaining: {remaining}")
            print('\n'.join(self._steps))
            return False

    # ----------------------------------------------------------------- private

    def _current(self) -> str:
        return self._tokens[self._pos]

    def _consume(self, expected: str) -> bool:
        curr = self._current()
        if curr == expected:
            self._log(f"{'  ' * self._depth}match  '{expected}'")
            self._pos += 1
            return True
        self._log(f"{'  ' * self._depth}ERROR – expected '{expected}', got '{curr}'")
        return False

    def _parse_nt(self, nt: str) -> bool:
        curr = self._current()
        key = (nt, curr)
        if key not in self.table:
            self._log(f"{'  ' * self._depth}ERROR – no rule for ({nt}, {curr})")
            return False

        prod = self.table[key]
        prod_str = ' '.join(prod) if prod != [EPSILON] else 'ε'
        self._log(f"{'  ' * self._depth}call   {nt}  →  {prod_str}  [lookahead='{curr}']")
        self._depth += 1

        if prod == [EPSILON]:
            self._log(f"{'  ' * self._depth}derive ε  (no consumption)")
            self._depth -= 1
            return True

        for sym in prod:
            if sym in self.grammar.non_terminals:
                if not self._parse_nt(sym):
                    self._depth -= 1
                    return False
            else:
                if not self._consume(sym):
                    self._depth -= 1
                    return False

        self._depth -= 1
        return True

    def _log(self, msg: str) -> None:
        self._steps.append(msg)
