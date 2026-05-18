"""
The Ultimate Parser App – demo entry point.

Grammars used:
  G_LL  – non-left-recursive arithmetic grammar (for LL(1) and Recursive Descent)
  G_LR  – classic left-recursive arithmetic grammar  (for LR family)
"""
import sys
import io

# Force UTF-8 output so special characters print correctly on Windows.
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from grammar import Grammar
from first_follow import compute_first, compute_follow, print_first_follow
from ll1_parser import build_ll1_table, print_ll1_table, simulate_ll1
from recursive_descent import RecursiveDescentParser
from lr0_parser import run_lr0
from slr1_parser import run_slr1
from lr1_parser import run_lr1
from lalr1_parser import run_lalr1

# ─────────────────────────────── grammars

G_LL_TEXT = """
E  -> T E'
E' -> + T E' | ε
T  -> F T'
T' -> * F T' | ε
F  -> ( E ) | id
"""

G_LR_TEXT = """
E -> E + T | T
T -> T * F | F
F -> ( E ) | id
"""

# ─────────────────────────────── helpers

DIVIDER = "=" * 70


def section(title: str) -> None:
    print(f"\n{DIVIDER}")
    print(f"  {title}")
    print(DIVIDER)


# ─────────────────────────────── main

def main() -> None:
    g_ll = Grammar.parse(G_LL_TEXT)
    g_lr = Grammar.parse(G_LR_TEXT)

    # ── Grammar info ────────────────────────────────────────────────────────
    section("Grammar G_LL (non-left-recursive, for LL parsers)")
    print(g_ll)
    print(f"\n  Terminals    : {sorted(g_ll.terminals)}")
    print(f"  Non-Terminals: {sorted(g_ll.non_terminals)}")
    print(f"  Start symbol : {g_ll.start}")

    section("Grammar G_LR (left-recursive, for LR parsers)")
    print(g_lr)
    print(f"\n  Terminals    : {sorted(g_lr.terminals)}")
    print(f"  Non-Terminals: {sorted(g_lr.non_terminals)}")
    print(f"  Start symbol : {g_lr.start}")

    # ── FIRST / FOLLOW ───────────────────────────────────────────────────────
    section("FIRST and FOLLOW sets for G_LL")
    first_ll = compute_first(g_ll)
    follow_ll = compute_follow(g_ll, first_ll)
    print_first_follow(first_ll, follow_ll)

    # ── LL(1) table ──────────────────────────────────────────────────────────
    section("LL(1) Prediction Table for G_LL")
    ll1_table, ll1_conflicts = build_ll1_table(g_ll)
    if ll1_conflicts:
        print("Conflicts:"); [print(c) for c in ll1_conflicts]
    print_ll1_table(g_ll, ll1_table)

    # ── LL(1) simulation ─────────────────────────────────────────────────────
    section("LL(1) Simulation: id + id * id")
    simulate_ll1(g_ll, ll1_table, ["id", "+", "id", "*", "id"])

    section("LL(1) Simulation: ( id )")
    simulate_ll1(g_ll, ll1_table, ["(", "id", ")"])

    # ── Recursive Descent ────────────────────────────────────────────────────
    section("Recursive Descent: id * id + id")
    rd = RecursiveDescentParser(g_ll)
    rd.parse(["id", "*", "id", "+", "id"])

    # ── LR(0) ────────────────────────────────────────────────────────────────
    section("LR(0) on G_LR: id + id * id")
    run_lr0(g_lr, ["id", "+", "id", "*", "id"])

    # ── SLR(1) ───────────────────────────────────────────────────────────────
    section("SLR(1) on G_LR: id + id * id")
    run_slr1(g_lr, ["id", "+", "id", "*", "id"])

    # ── LR(1) ────────────────────────────────────────────────────────────────
    section("LR(1) on G_LR: id + id * id")
    run_lr1(g_lr, ["id", "+", "id", "*", "id"])

    # ── LALR(1) ──────────────────────────────────────────────────────────────
    section("LALR(1) on G_LR: id + id * id")
    run_lalr1(g_lr, ["id", "+", "id", "*", "id"])

    # ── Rejection test ───────────────────────────────────────────────────────
    section("SLR(1) rejection test on G_LR: id + + id  (invalid)")
    run_slr1(g_lr, ["id", "+", "+", "id"], show_table=False)


if __name__ == "__main__":
    main()
