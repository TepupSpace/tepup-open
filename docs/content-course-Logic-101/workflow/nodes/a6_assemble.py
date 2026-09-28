"""A6 — Assemble (Stage 1A, pure code, NO LLM).

Role: Lấy draft-v1.md (đã pass A5 Critic), build final.md đầy đủ frontmatter + body
theo Output(1A) schema (xem 02.Workflow.md §3).

Input: draft-v1.md, lesson-spec.yaml, outline.md, research-notes.md
Output: final.md
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

import yaml


def _extract_frontmatter_and_body(md_text: str) -> tuple[dict, str]:
    if not md_text.startswith("---"):
        return {}, md_text
    parts = md_text.split("---", 2)
    if len(parts) < 3:
        return {}, md_text
    fm = yaml.safe_load(parts[1]) or {}
    return fm, parts[2].lstrip()


def _build_citations_list(draft_body: str, research_md: str) -> list[dict]:
    """Build citation list từ những id được dùng trong draft, lookup metadata trong research."""
    ids_in_draft = sorted(set(re.findall(r"\[citation:\s*([cv]\d+)\s*\]", draft_body)))

    citations = []
    for cid in ids_in_draft:
        pattern = rf"^###\s+{cid}\s*\n(.*?)(?=^###\s|\Z)"
        m = re.search(pattern, research_md, re.MULTILINE | re.DOTALL)
        if not m:
            continue
        block = m.group(1)
        url = re.search(r"url:\s*(\S+)", block)
        tier = re.search(r"tier:\s*([ABC])", block)
        quote = re.search(r"(?:key_quote|raw_quote):\s*[\"\']?(.+?)[\"\']?\s*$", block, re.MULTILINE)

        citations.append({
            "id": cid,
            "url": url.group(1).strip() if url else None,
            "source_tier": tier.group(1) if tier else None,
            "claim": (quote.group(1).strip()[:200] if quote else None),
        })
    return citations


def _extract_blocks_from_body(body: str) -> list[dict]:
    """Extract {!BLOCK#N ...} placeholders → metadata list.

    Block tương tác sâu — OPTIONAL (0-2 cái/bài). Stage 2 chọn 1 trong 23
    interactive block type. Xem {!CHECK#N} cho MCQ bắt buộc.
    """
    blocks = []
    for m in re.finditer(
        r"\{\!BLOCK#(\d+)\s+position=(\w+)\s+intent=\"([^\"]+)\"(?:\s+skill=(\w+))?\}",
        body,
    ):
        blocks.append({
            "id": int(m.group(1)),
            "position": m.group(2),
            "intent": m.group(3),
            "skill": m.group(4) if m.group(4) else None,
        })
    return blocks


def _extract_checks_from_body(body: str) -> list[dict]:
    """Extract {!CHECK#N ...} placeholders → metadata list.

    MCQ chốt kiến thức — BẮT BUỘC 1 cái ở cuối mỗi section thân bài (§1, §2, §3).
    Stage 2 map thẳng sang block type `question`.
    `position` là section chứa nó (vd `§1`); nếu placeholder không ghi thì suy ra từ id.
    """
    checks = []
    for m in re.finditer(
        r"\{\!CHECK#(\d+)(?:\s+position=§?(\d+))?\s+intent=\"([^\"]+)\"\}",
        body,
    ):
        cid = int(m.group(1))
        section = m.group(2) if m.group(2) else str(cid)
        checks.append({
            "id": cid,
            "after_section": f"§{section}",
            "intent": m.group(3),
        })
    return checks


def _extract_illustrations_from_body(body: str) -> list[dict]:
    """Extract {!IMG ...} placeholders."""
    illos = []
    for m in re.finditer(r"\{\!IMG\s+(hero|inline)(?::\s*\"([^\"]+)\")?\}", body):
        illos.append({
            "role": m.group(1),
            "prompt": m.group(2) if m.group(2) else None,
        })
    return illos


def run(lesson_dir: Path) -> Path:
    """Build final.md từ draft-v1.md.

    Returns path tới final.md.
    """
    draft_path = lesson_dir / "draft-v1.md"
    spec_path = lesson_dir / "lesson-spec.yaml"
    research_path = lesson_dir / "research-notes.md"

    if not draft_path.exists():
        raise FileNotFoundError(f"Missing {draft_path}")

    spec = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    research_md = research_path.read_text(encoding="utf-8")
    draft_fm, draft_body = _extract_frontmatter_and_body(
        draft_path.read_text(encoding="utf-8")
    )

    # Build final frontmatter
    citations = _build_citations_list(draft_body, research_md)
    checks = _extract_checks_from_body(draft_body)
    blocks = _extract_blocks_from_body(draft_body)
    illustrations = _extract_illustrations_from_body(draft_body)

    word_count = len(draft_body.split())

    final_fm = {
        "lesson_id": spec["lesson_id"],
        "title": spec["title"],
        "level": spec["level"],
        "position_in_level": spec["position_in_level"],
        "duration_min": 12,  # default; có thể tinh chỉnh sau
        "word_count": word_count,
        "learning_objectives": spec.get("learning_objectives", []),
        "prerequisites": spec.get("connections", {}).get("builds_on", []),
        "sets_up": spec.get("connections", {}).get("sets_up", []),
        "illustrations": illustrations,
        "checks": checks,
        "blocks": blocks,
        "citations": citations,
        "callbacks_used": draft_fm.get("callbacks_used", []),
    }

    final_text = "---\n" + yaml.dump(
        final_fm, allow_unicode=True, sort_keys=False, width=120
    ) + "---\n\n" + draft_body.lstrip()

    out_path = lesson_dir / "final.md"
    out_path.write_text(final_text, encoding="utf-8")
    return out_path


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument("--lesson-dir", required=True, type=Path)
    args = p.parse_args()
    out = run(args.lesson_dir)
    print(f"✓ Wrote {out}")
