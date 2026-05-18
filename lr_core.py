"""Core LR machinery: items, closure, goto, automaton construction."""
from __future__ import annotations
from dataclasses import dataclass
from typing import NamedTuple

from grammar import Grammar, EPSILON, EOF
from first_follow import compute_first, first_of_string


# ─────────────────────────────────────────── item definitions

class LR0Item(NamedTuple):
    head: str
    body: tuple[str, ...]
    dot: int

    def next_symbol(self) -> str | None:
        return self.body[self.dot] if self.dot < len(self.body) else None

    def advance(self) -> LR0Item:
        return LR0Item(self.head, self.body, self.dot + 1)

    def is_complete(self) -> bool:
        return self.dot >= len(self.body)

    def __str__(self) -> str:
        b = list(self.body)
        b.insert(self.dot, '·')
        return f"[{self.head} → {' '.join(b) if b else '·'}]"


class LR1Item(NamedTuple):
    head: str
    body: tuple[str, ...]
    dot: int
    lookahead: str

    def next_symbol(self) -> str | None:
        return self.body[self.dot] if self.dot < len(self.body) else None

    def advance(self) -> LR1Item:
        return LR1Item(self.head, self.body, self.dot + 1, self.lookahead)

    def is_complete(self) -> bool:
        return self.dot >= len(self.body)

    def core(self) -> LR0Item:
        return LR0Item(self.head, self.body, self.dot)

    def __str__(self) -> str:
        b = list(self.body)
        b.insert(self.dot, '·')
        return f"[{self.head} → {' '.join(b) if b else '·'}, {self.lookahead}]"


# helper: normalize epsilon bodies to empty tuple
def _normalize_body(body: list[str]) -> tuple[str, ...]:
    return () if body == [EPSILON] else tuple(body)


# ─────────────────────────────────────────── LR(0) automaton

State0 = frozenset[LR0Item]


def _closure0(items: set[LR0Item], grammar: Grammar) -> State0:
    result = set(items)
    worklist = list(items)
    while worklist:
        item = worklist.pop()
        B = item.next_symbol()
        if B is not None and B in grammar.non_terminals:
            for prod in grammar.productions[B]:
                new_item = LR0Item(B, _normalize_body(prod), 0)
                if new_item not in result:
                    result.add(new_item)
                    worklist.append(new_item)
    return frozenset(result)


def _goto0(state: State0, symbol: str, grammar: Grammar) -> State0:
    kernel = {item.advance() for item in state if item.next_symbol() == symbol}
    return _closure0(kernel, grammar) if kernel else frozenset()


def build_lr0_automaton(
    grammar: Grammar,
) -> tuple[list[State0], dict[tuple[int, str], int]]:
    """Return (states, transitions) for the augmented grammar's LR(0) automaton."""
    aug = grammar.augment()
    start_body = _normalize_body(aug.productions[aug.start][0])
    initial = _closure0({LR0Item(aug.start, start_body, 0)}, aug)

    states: list[State0] = [initial]
    state_idx: dict[State0, int] = {initial: 0}
    transitions: dict[tuple[int, str], int] = {}
    worklist: list[State0] = [initial]

    all_symbols = aug.non_terminals | aug.terminals

    while worklist:
        s = worklist.pop()
        si = state_idx[s]
        for sym in all_symbols:
            ns = _goto0(s, sym, aug)
            if not ns:
                continue
            if ns not in state_idx:
                state_idx[ns] = len(states)
                states.append(ns)
                worklist.append(ns)
            transitions[(si, sym)] = state_idx[ns]

    return states, transitions


# ─────────────────────────────────────────── LR(1) automaton

State1 = frozenset[LR1Item]


def _closure1(items: set[LR1Item], grammar: Grammar,
              first: dict[str, frozenset[str]]) -> State1:
    result = set(items)
    worklist = list(items)
    while worklist:
        item = worklist.pop()
        B = item.next_symbol()
        if B is None or B not in grammar.non_terminals:
            continue
        # β is the rest of the body after B, plus the lookahead
        beta = list(item.body[item.dot + 1:]) + [item.lookahead]
        lookaheads = first_of_string(beta, first, grammar.non_terminals) - {EPSILON}
        for prod in grammar.productions[B]:
            nb = _normalize_body(prod)
            for la in lookaheads:
                new_item = LR1Item(B, nb, 0, la)
                if new_item not in result:
                    result.add(new_item)
                    worklist.append(new_item)
    return frozenset(result)


def _goto1(state: State1, symbol: str, grammar: Grammar,
           first: dict[str, frozenset[str]]) -> State1:
    kernel = {item.advance() for item in state if item.next_symbol() == symbol}
    return _closure1(kernel, grammar, first) if kernel else frozenset()


def build_lr1_automaton(
    grammar: Grammar,
) -> tuple[list[State1], dict[tuple[int, str], int]]:
    """Return (states, transitions) for the augmented grammar's LR(1) automaton."""
    aug = grammar.augment()
    first = compute_first(aug)
    start_body = _normalize_body(aug.productions[aug.start][0])
    initial_item = LR1Item(aug.start, start_body, 0, EOF)
    initial = _closure1({initial_item}, aug, first)

    states: list[State1] = [initial]
    state_idx: dict[State1, int] = {initial: 0}
    transitions: dict[tuple[int, str], int] = {}
    worklist: list[State1] = [initial]

    all_symbols = aug.non_terminals | aug.terminals

    while worklist:
        s = worklist.pop()
        si = state_idx[s]
        for sym in all_symbols:
            ns = _goto1(s, sym, aug, first)
            if not ns:
                continue
            if ns not in state_idx:
                state_idx[ns] = len(states)
                states.append(ns)
                worklist.append(ns)
            transitions[(si, sym)] = state_idx[ns]

    return states, transitions


# ─────────────────────────────────────────── printing helpers

def print_lr0_states(states: list[State0]) -> None:
    print("\n=== LR(0) Canonical Collection ===")
    for i, state in enumerate(states):
        print(f"\n  State {i}:")
        for item in sorted(state, key=str):
            print(f"    {item}")


def print_lr1_states(states: list[State1]) -> None:
    print("\n=== LR(1) Canonical Collection ===")
    for i, state in enumerate(states):
        print(f"\n  State {i}:")
        for item in sorted(state, key=str):
            print(f"    {item}")
