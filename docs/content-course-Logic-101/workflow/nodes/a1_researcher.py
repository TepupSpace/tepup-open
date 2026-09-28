"""A1 — Researcher (Stage 1A).

Role: Thu thập fact + citation cho 1 bài.
Model: claude-sonnet-4-6 with extended thinking
Tools: Firecrawl (search + scrape) + WebSearch
Input: lesson-spec.yaml, course-context.yaml, course-outline.yaml
Output: research-notes.md
Prompt template: workflow/prompts/a1_researcher.md

V1 (Claude Code prototype):
  Trong Claude Code session, orchestrator gọi Agent tool với:
    - subagent_type: "data-researcher" or "general-purpose"
    - prompt: nội dung từ workflow/prompts/researcher.md với {{...}} thay bằng nội dung file
    - tools: firecrawl-search, firecrawl-scrape, WebSearch
  Subagent ghi research-notes.md vào lesson folder.

V2 (Agent SDK):
  Fill in `run()` dùng anthropic.messages.create với:
    - model="claude-sonnet-4-6"
    - thinking={"type": "enabled", "budget_tokens": 5000}
    - tools=[firecrawl, web_search]
    - tool_choice="auto"
    - cache_control trên course_context + course_outline
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class ResearcherConfig:
    model: str = "claude-sonnet-4-6"
    thinking_budget: int = 5000
    max_tool_calls: int = 25
    max_output_tokens: int = 12000


def run(lesson_dir: Path, ctx_dir: Path, cfg: ResearcherConfig | None = None) -> Path:
    """Run Researcher node.

    Args:
        lesson_dir: e.g. lessons/B03-correlation-causation/
        ctx_dir: project root chứa course-context.yaml, course-outline.yaml
        cfg: optional override

    Returns:
        Path tới research-notes.md đã ghi.

    V1: raise NotImplementedError — orchestrator dùng Claude Code Agent tool.
    V2: implement actual API call.
    """
    cfg = cfg or ResearcherConfig()
    raise NotImplementedError(
        "V1 prototype: gọi qua Claude Code Agent tool với prompt từ "
        "workflow/prompts/a1_researcher.md. Không cần implement Python ở stage này."
    )
