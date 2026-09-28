"""A3 — Section Writers (Stage 1A, parallel ×6).

Role: Viết 1 section duy nhất (§0..§5). Mỗi instance song song với 5 instance khác.
Model: claude-sonnet-4-6
Tools: KHÔNG
Input/instance: outline section spec + research-notes.md + style-guide.yaml + course-outline.yaml
Output/instance: 1 section markdown
Prompt template: workflow/prompts/a3_writer.md

Parallelism: 6 instance song song. Trong Claude Code, orchestrator gửi 6 Agent
tool calls trong cùng 1 message (multi tool_use blocks → parallel execution).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

SECTIONS = ["§0", "§1", "§2", "§3", "§4", "§5"]


@dataclass
class WriterConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens_per_section: int = 2500


def run_section(
    section_id: str,
    lesson_dir: Path,
    ctx_dir: Path,
    cfg: WriterConfig | None = None,
) -> Path:
    """Viết 1 section. Output ghi vào lesson_dir/section-{section_id}.md."""
    cfg = cfg or WriterConfig()
    raise NotImplementedError(
        "V1 prototype: gọi 6 Agent tool calls (1 per section) trong 1 message → parallel."
    )


def run_all_parallel(lesson_dir: Path, ctx_dir: Path, cfg: WriterConfig | None = None) -> list[Path]:
    """Wrapper: chạy 6 section song song và ghép lại."""
    raise NotImplementedError(
        "V1 prototype: orchestrator (Claude Code) gửi 6 Agent tool calls song song "
        "trong 1 message, sau đó ghép kết quả thành draft tạm."
    )
