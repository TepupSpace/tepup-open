"""A2 — Outliner (Stage 1A).

Role: Tạo outline 6-section từ research + spec.
Model: claude-sonnet-4-6
Tools: KHÔNG
Input: lesson-spec.yaml, research-notes.md, course-outline.yaml, style-guide.yaml
Output: outline.md
Prompt template: workflow/prompts/a2_outliner.md
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class OutlinerConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens: int = 3000


def run(lesson_dir: Path, ctx_dir: Path, cfg: OutlinerConfig | None = None) -> Path:
    cfg = cfg or OutlinerConfig()
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/a2_outliner.md. Subagent đọc research-notes.md + spec + context."
    )
