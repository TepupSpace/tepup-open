"""B1 — Question Designer (Stage 1B kickoff).

Role: Đọc theory final.md + practice-spec.yaml → plan question matrix per tier
(stem draft + type_tested + situation + ref_citation_id cho mỗi câu).

Model: claude-sonnet-4-6
Tools: KHÔNG (chỉ đọc files local)
Input: final.md, practice-spec.yaml, research-notes.md, course-outline.yaml
Output: question-plan.yaml
Prompt template: workflow/prompts/b1_question_designer.md
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class QuestionDesignerConfig:
    model: str = "claude-sonnet-4-6"
    max_output_tokens: int = 3000


def run(
    lesson_dir: Path,
    ctx_dir: Path,
    cfg: QuestionDesignerConfig | None = None,
) -> Path:
    """Run B1 Question Designer.

    Returns:
        Path tới question-plan.yaml đã ghi.
    """
    cfg = cfg or QuestionDesignerConfig()
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/b1_question_designer.md. Output ghi vào "
        "lesson_dir/question-plan.yaml."
    )
