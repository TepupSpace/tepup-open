"""A4 — Consistency Pass (Stage 1A).

Role: Đọc 6 section ghép lại, fix mâu thuẫn / callback / flow.
Model: claude-sonnet-4-6
Tools: KHÔNG
Input: 6 section drafts (ghép thành 1), lesson-spec.yaml, course-outline.yaml
Output: draft-v1.md (full bài + frontmatter)
Prompt template: workflow/prompts/a4_consistency.md
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class ConsistencyConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens: int = 4000


def run(lesson_dir: Path, ctx_dir: Path, cfg: ConsistencyConfig | None = None) -> Path:
    cfg = cfg or ConsistencyConfig()
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/a4_consistency.md. Input là 6 section đã ghép."
    )
