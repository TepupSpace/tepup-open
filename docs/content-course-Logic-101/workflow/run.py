"""Logic 101 — Stage 1 Workflow Orchestrator.

V1 (PROTOTYPE): chạy trong Claude Code session. File này document flow,
nhưng các node LLM (A1-A5, B1-B3) thực thi qua Claude Code Agent tool, không
phải qua Anthropic API call direct. Chỉ A6 / B4 Assemble và các Gates chạy code thật.

V2 (PRODUCTION): port từng node sang Anthropic API (anthropic.messages.create
hoặc Claude Agent SDK), giữ nguyên control flow ở đây.

Pipeline:
- Stage 1A (always): A1 Researcher → GATE A.1 → A2 Outliner → GATE A.2 →
  A3 Writers (×6 parallel) → A4 Consistency → A5 Critic (loop ≤2 rounds) → A6 Assemble → final.md
- Stage 1B (conditional, practice_required: true): B1 Question Designer →
  B2 Question Generators (×3 tier parallel) → B3 Practice Critic (loop ≤2 rounds) →
  GATE B.1 → HUMAN GATE C → B4 Assemble → practice-final.md

Usage:
    # V1: từ Claude Code session, gõ:
    #   "Run Logic 101 Stage 1 cho B03. Đọc 02.Workflow.md và run.py để biết steps."
    # → Claude orchestrator sẽ:
    #   1. Đọc lesson-spec.yaml + context files
    #   2. Spawn Agent(subagent_type=..., prompt=prompts/a1_researcher.md filled)
    #      → ghi research-notes.md
    #   3. Run `python workflow/gates.py gate_a1 --lesson-dir lessons/B03-.../` qua Bash
    #   4. HALT for HUMAN GATE A
    #   5. ... tương tự cho các bước sau

    # V2 (after fill in nodes/*.py):
    #   python workflow/run.py --lesson B03 [--auto] [--review-after research,outline]
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LESSONS_DIR = ROOT / "lessons"


def find_lesson_dir(lesson_id: str) -> Path:
    """B03 → lessons/B03-correlation-causation/"""
    matches = list(LESSONS_DIR.glob(f"{lesson_id}-*"))
    if not matches:
        raise FileNotFoundError(f"No lesson folder for {lesson_id}")
    if len(matches) > 1:
        raise ValueError(f"Multiple matches for {lesson_id}: {matches}")
    return matches[0]


def run_pipeline(
    lesson_id: str,
    auto: bool = False,
    review_after: list[str] | None = None,
    max_critic_rounds: int = 2,
) -> Path:
    """V2 orchestrator. V1 — Claude Code session điều phối, file này document logic.

    Returns: path tới final.md.
    """
    review_after = review_after or (["research", "outline"] if not auto else [])
    lesson_dir = find_lesson_dir(lesson_id)
    ctx_dir = ROOT

    print(f"[run] Lesson dir: {lesson_dir}")
    print(f"[run] Auto: {auto}, Review after: {review_after}")

    # ─── A1: Researcher ──────────────────────────────────────────────────
    print("\n[A1] Researcher...")
    # from .nodes import a1_researcher
    # a1_researcher.run(lesson_dir, ctx_dir)

    # ─── GATE A.1 ────────────────────────────────────────────────────────
    print("[GATE A.1] Validating research...")
    from . import gates  # type: ignore
    errs = gates.gate_a1_validate_research(lesson_dir / "research-notes.md")
    if errs:
        print(f"  ✗ GATE A.1 FAIL ({len(errs)} issues):")
        for e in errs:
            print(f"    - {e}")
        # V2: loop back A1 with errs as feedback
        sys.exit(1)
    print("  ✓ GATE A.1 PASS")

    # ─── HUMAN GATE A ────────────────────────────────────────────────────
    if "research" in review_after:
        input(f"\n[HUMAN GATE A] Review {lesson_dir/'research-notes.md'}\n"
              f"Press ENTER to continue, Ctrl+C to abort and edit: ")

    # ─── A2: Outliner ────────────────────────────────────────────────────
    print("\n[A2] Outliner...")
    # from .nodes import a2_outliner
    # a2_outliner.run(lesson_dir, ctx_dir)

    # ─── GATE A.2 ────────────────────────────────────────────────────────
    print("[GATE A.2] Validating outline...")
    errs = gates.gate_a2_validate_outline(
        lesson_dir / "outline.md",
        ctx_dir / "course-outline.yaml",
        lesson_id,
    )
    if errs:
        print(f"  ✗ GATE A.2 FAIL ({len(errs)} issues):")
        for e in errs:
            print(f"    - {e}")
        sys.exit(1)
    print("  ✓ GATE A.2 PASS")

    # ─── HUMAN GATE B ────────────────────────────────────────────────────
    if "outline" in review_after:
        input(f"\n[HUMAN GATE B] Review {lesson_dir/'outline.md'}\n"
              f"Press ENTER to continue: ")

    # ─── A3: Section Writers (parallel ×6) ───────────────────────────────
    print("\n[A3] Section Writers (parallel ×6)...")
    # from .nodes import a3_writer
    # a3_writer.run_all_parallel(lesson_dir, ctx_dir)

    # ─── A4: Consistency Pass ────────────────────────────────────────────
    print("[A4] Consistency Pass...")
    # from .nodes import a4_consistency
    # a4_consistency.run(lesson_dir, ctx_dir)

    # ─── A5: Critic (loop tối đa max_critic_rounds) ──────────────────────
    for round_num in range(1, max_critic_rounds + 1):
        print(f"\n[A5] Critic round {round_num}...")
        # from .nodes import a5_critic
        # report_path, verdict = a5_critic.run(lesson_dir, ctx_dir, round_num=round_num)
        verdict = "PASS"  # stub

        if verdict == "PASS":
            print(f"  ✓ A5 Critic PASS at round {round_num}")
            break
        elif verdict == "HARD-FAIL":
            print(f"  ✗ HARD-FAIL at round {round_num}, looping A3 Writer for flagged sections...")
            # a3_writer.run_section_revise(...) → a4_consistency → continue loop
            continue
        elif verdict == "ESCALATE-HUMAN":
            print("  ⚠ ESCALATE-HUMAN — workflow halted, review critic-report.md")
            sys.exit(2)
    else:
        print(f"  ⚠ Max rounds ({max_critic_rounds}) reached, escalating")
        sys.exit(2)

    # ─── A6: Assemble (code only) ────────────────────────────────────────
    print("\n[A6] Assemble...")
    from .nodes import a6_assemble
    final_path = a6_assemble.run(lesson_dir)
    print(f"  ✓ Wrote {final_path}")

    # ─── Stage 1B (conditional) ──────────────────────────────────────────
    # Đọc lesson-spec.yaml practice_required field. Nếu true, chạy B1-B4.
    # (V1 stub: chưa implement, log placeholder.)
    import yaml as _yaml
    spec_path = lesson_dir / "lesson-spec.yaml"
    if spec_path.exists():
        spec = _yaml.safe_load(spec_path.read_text(encoding="utf-8")) or {}
        if spec.get("practice_required"):
            print("\n[Stage 1B] practice_required=true → chạy B1-B4 (not implemented in V2 yet)")
            # B1 → B2 ×3 → b3_critic_pre_check → B3 Critic → GATE B.1 → HUMAN GATE C → B4 Assemble

    return final_path


def main():
    parser = argparse.ArgumentParser(description="Logic 101 Stage 1 workflow")
    parser.add_argument("--lesson", required=True, help="e.g. B03")
    parser.add_argument("--auto", action="store_true", help="skip human gates")
    parser.add_argument(
        "--review-after",
        default="research,outline",
        help="comma-separated: research, outline (ignored if --auto)",
    )
    parser.add_argument("--max-critic-rounds", type=int, default=2)
    args = parser.parse_args()

    review_after = [s.strip() for s in args.review_after.split(",")] if not args.auto else []
    run_pipeline(
        lesson_id=args.lesson,
        auto=args.auto,
        review_after=review_after,
        max_critic_rounds=args.max_critic_rounds,
    )


if __name__ == "__main__":
    main()
