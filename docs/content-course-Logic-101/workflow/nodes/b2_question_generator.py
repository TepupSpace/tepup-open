"""B2 — Question Generators (Stage 1B, parallel ×3 tier).

Role: Từ question-plan.yaml + theory final.md → generate full question
(stem + options + correct + explanation + distractor_explanations) cho 1 tier.

Model: claude-sonnet-4-6
Tools: KHÔNG
Input/instance: question-plan.yaml (slice tier), final.md, research-notes.md, style-guide.yaml
Output/instance: questions-{tier}.yaml
Prompt template: workflow/prompts/b2_question_generator.md

Parallelism: 3 instance song song (1 instance / 1 tier: easy/medium/hard).
Trong Claude Code, orchestrator gửi 3 Agent tool calls trong cùng 1 message.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

TIERS = ["easy", "medium", "hard"]


@dataclass
class QuestionGeneratorConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens_per_tier: int = 4000


def run_tier(
    tier: str,
    lesson_dir: Path,
    ctx_dir: Path,
    cfg: QuestionGeneratorConfig | None = None,
) -> Path:
    """Generate 1 tier. Output: lesson_dir/questions-{tier}.yaml."""
    if tier not in TIERS:
        raise ValueError(f"tier must be in {TIERS}, got {tier!r}")
    cfg = cfg or QuestionGeneratorConfig()
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/b2_question_generator.md. Inject tier_level + slice của "
        "question-plan.yaml cho tier này."
    )


def run_all_parallel(
    lesson_dir: Path,
    ctx_dir: Path,
    cfg: QuestionGeneratorConfig | None = None,
) -> list[Path]:
    """Wrapper: chạy 3 tier song song."""
    raise NotImplementedError(
        "V1 prototype: orchestrator (Claude Code) gửi 3 Agent tool calls song song "
        "trong 1 message (1 per tier), sau đó ghép kết quả."
    )
