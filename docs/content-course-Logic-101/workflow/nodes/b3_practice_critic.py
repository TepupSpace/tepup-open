"""B3 — Practice Critic (Stage 1B, Evaluator-Optimizer, deep mirror A5).

Role: Apply 10-criteria practice rubric (P1-P10) cho question bank.
Đặc biệt deep ở P1 Answer key integrity — LLM phải actively verify từng câu.

Model: claude-sonnet-4-6
Tools: KHÔNG (LLM phần). Code pre-check chạy TRƯỚC qua gates.b3_critic_pre_check.
Input: questions-{easy,medium,hard}.yaml, final.md (theory), practice-spec.yaml,
       research-notes.md, code_findings
Output: practice-critic-report.md
Prompt template: workflow/prompts/b3_practice_critic.md

Loop: max 2 vòng cho HARD-FAIL. Sau 2 vòng → ESCALATE-HUMAN.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .. import gates  # type: ignore[attr-defined]


@dataclass
class PracticeCriticConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens: int = 6000
    max_rounds: int = 2


def run(
    lesson_dir: Path,
    ctx_dir: Path,
    round_num: int = 1,
    cfg: PracticeCriticConfig | None = None,
) -> tuple[Path, str]:
    """Run B3 Practice Critic + return (critic_report_path, verdict).

    Verdict ∈ {"PASS", "HARD-FAIL", "ESCALATE-HUMAN"}.
    """
    cfg = cfg or PracticeCriticConfig()

    questions_files = [
        lesson_dir / f"questions-{tier}.yaml" for tier in ("easy", "medium", "hard")
    ]

    # Step 1 — code pre-check
    code_findings = gates.b3_critic_pre_check(
        questions_files,
        lesson_dir / "practice-spec.yaml",
        lesson_dir / "research-notes.md",
    )

    # Step 2 — LLM apply rubric với code_findings làm input
    # V1: gọi qua Claude Code Agent tool. V2: anthropic.messages.create.
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/b3_practice_critic.md. Inject code_findings vào "
        "<output_from_b3_critic_pre_check> tag. "
        f"(Hiện tại code_findings có {len(code_findings)} items.)"
    )
