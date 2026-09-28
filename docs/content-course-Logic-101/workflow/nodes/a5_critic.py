"""A5 — Critic (Stage 1A, Evaluator-Optimizer).

Role: Apply 10-criteria rubric, đưa feedback cụ thể.
Model: claude-sonnet-4-6
Tools: KHÔNG (LLM phần). Code pre-check chạy TRƯỚC qua gates.a5_critic_pre_check.
Input: draft-v1.md, research-notes.md, style-guide.yaml, course-outline.yaml, code_findings
Output: critic-report.md
Prompt template: workflow/prompts/a5_critic.md

Loop: max 2 vòng cho HARD-FAIL. Sau 2 vòng → ESCALATE-HUMAN.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .. import gates  # type: ignore[attr-defined]


@dataclass
class CriticConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens: int = 3000
    max_rounds: int = 2


def run(
    lesson_dir: Path,
    ctx_dir: Path,
    round_num: int = 1,
    cfg: CriticConfig | None = None,
) -> tuple[Path, str]:
    """Run A5 Critic + return (critic_report_path, verdict).

    Verdict ∈ {"PASS", "HARD-FAIL", "ESCALATE-HUMAN"}.
    """
    cfg = cfg or CriticConfig()

    # Step 1 — code pre-check
    code_findings = gates.a5_critic_pre_check(
        lesson_dir / "draft-v1.md",
        lesson_dir / "research-notes.md",
    )

    # Step 2 — LLM apply rubric với code_findings làm input
    # V1: gọi qua Claude Code Agent tool. V2: anthropic.messages.create.
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/a5_critic.md. Inject code_findings vào <code_findings> tag. "
        f"(Hiện tại code_findings có {len(code_findings)} items, có thể dùng để debug.)"
    )
