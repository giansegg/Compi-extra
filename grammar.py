"""Grammar representation and parsing utilities."""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional

EPSILON = 'eps'
EOF = '$'


@dataclass
class Grammar:
    productions: dict[str, list[list[str]]]  # NT -> list of bodies
    start: str

    @property
    def non_terminals(self) -> frozenset[str]:
        return frozenset(self.productions.keys())

    @property
    def terminals(self) -> frozenset[str]:
        nts = self.non_terminals
        syms: set[str] = set()
        for bodies in self.productions.values():
            for body in bodies:
                for sym in body:
                    if sym not in nts and sym != EPSILON:
                        syms.add(sym)
        return frozenset(syms)

    def augment(self) -> Grammar:
        """Return new grammar with augmented start S' -> S."""
        new_start = self.start + "'"
        while new_start in self.productions:
            new_start += "'"
        new_prods: dict[str, list[list[str]]] = {new_start: [[self.start]]}
        new_prods.update(self.productions)
        return Grammar(new_prods, new_start)

    @staticmethod
    def parse(text: str, start: Optional[str] = None) -> Grammar:
        """Parse grammar text.  Each line: NT -> body1 | body2 ...
        Symbols are whitespace-separated.  Use 'ε' or 'eps' for epsilon.
        """
        productions: dict[str, list[list[str]]] = {}
        first_nt: Optional[str] = None

        for line in text.strip().splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '->' not in line:
                continue
            head, _, rest = line.partition('->')
            head = head.strip()
            if first_nt is None:
                first_nt = head
            if head not in productions:
                productions[head] = []
            for alt in rest.split('|'):
                body = alt.strip().split()
                # normalize 'eps' -> EPSILON
                body = [EPSILON if s in ('eps', 'epsilon', 'ε') else s for s in body]
                if not body:
                    body = [EPSILON]
                productions[head].append(body)

        if start is None:
            start = first_nt or ''
        return Grammar(productions, start)

    def __str__(self) -> str:
        lines: list[str] = []
        for head, bodies in self.productions.items():
            mark = ' (start)' if head == self.start else ''
            alts = ' | '.join(' '.join(b) for b in bodies)
            lines.append(f"  {head} -> {alts}{mark}")
        return '\n'.join(lines)
