"""B4 — Practice Assemble (Stage 1B, pure code, NO LLM).

Role: Lấy 3 tier YAML (đã pass B3 Critic + GATE B.1 + HUMAN GATE C),
ghép thành practice-final.md theo Output(1B) schema (xem 02.Workflow.md §3.3).

Input: questions-{easy,medium,hard}.yaml, practice-spec.yaml, research-notes.md
Output: practice-final.md
"""

from __future__ import annotations

import re
from pathlib import Path

import yaml

TIERS = ("easy", "medium", "hard")


def _load_tier(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Missing tier file: {path}")
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def _build_citations_from_research(used_ids: set[str], research_md: str) -> list[dict]:
    citations: list[dict] = []
    for cid in sorted(used_ids):
        pattern = rf"^###\s+{cid}\s*\n(.*?)(?=^###\s|\Z)"
        m = re.search(pattern, research_md, re.MULTILINE | re.DOTALL)
        if not m:
            continue
        block = m.group(1)
        url = re.search(r"url:\s*(\S+)", block)
        tier = re.search(r"tier:\s*([ABC])", block)
        quote = re.search(
            r"(?:key_quote|raw_quote):\s*[\"\']?(.+?)[\"\']?\s*$",
            block,
            re.MULTILINE,
        )
        citations.append({
            "id": cid,
            "url": url.group(1).strip() if url else None,
            "source_tier": tier.group(1) if tier else None,
            "claim": (quote.group(1).strip()[:200] if quote else None),
        })
    return citations


def run(lesson_dir: Path) -> Path:
    """Build practice-final.md từ 3 tier YAML.

    Returns path tới practice-final.md.
    """
    spec_path = lesson_dir / "practice-spec.yaml"
    research_path = lesson_dir / "research-notes.md"
    spec = yaml.safe_load(spec_path.read_text(encoding="utf-8")) or {}
    research_md = research_path.read_text(encoding="utf-8") if research_path.exists() else ""

    # Load 3 tiers
    tiers_data: dict[str, list[dict]] = {}
    for tier in TIERS:
        data = _load_tier(lesson_dir / f"questions-{tier}.yaml")
        tiers_data[tier] = data.get("questions", []) or []

    total = sum(len(qs) for qs in tiers_data.values())

    # Coverage tổng kết
    types_covered = sorted({
        q.get("type_tested") for qs in tiers_data.values() for q in qs if q.get("type_tested")
    })
    sits_covered = sorted({
        q.get("situation") for qs in tiers_data.values() for q in qs if q.get("situation")
    })

    # Citations dùng trong question (ref_citation_id field)
    used_cids = {
        q.get("ref_citation_id")
        for qs in tiers_data.values()
        for q in qs
        if q.get("ref_citation_id")
    }
    citations = _build_citations_from_research(used_cids, research_md)

    # Build frontmatter
    fm = {
        "lesson_id": spec.get("lesson_id"),
        "references_theory": "final.md",
        "total_questions": total,
        "target_score": spec.get("target_score", 0.70),
        "coverage": {
            "types": types_covered,
            "situations": sits_covered,
        },
        "citations": citations,
    }

    # Build body
    lines = []
    lesson_id = spec.get("lesson_id", "B??")
    lines.append(f"# Practice — {lesson_id}\n")
    for tier in TIERS:
        qs = tiers_data[tier]
        lines.append(f"\n## TIER — {tier.upper()} ({len(qs)} câu)\n")
        for q in qs:
            qid = q.get("q_id", "?")
            lines.append(f"\n### {qid}")
            for key in ("stem", "type_tested", "situation"):
                if key in q:
                    lines.append(f"{key}: {q[key]!r}" if isinstance(q[key], str) else f"{key}: {q[key]}")
            if "options" in q:
                lines.append("options:")
                for opt_key, opt_val in (q["options"] or {}).items():
                    lines.append(f"  {opt_key}: {opt_val!r}")
            for key in ("correct", "explanation"):
                if key in q:
                    val = q[key]
                    lines.append(f"{key}: {val!r}" if isinstance(val, str) else f"{key}: {val}")
            if "distractor_explanations" in q and q["distractor_explanations"]:
                lines.append("distractor_explanations:")
                for opt_key, exp in q["distractor_explanations"].items():
                    lines.append(f"  {opt_key}: {exp!r}")

    body = "\n".join(lines) + "\n"
    final_text = (
        "---\n"
        + yaml.dump(fm, allow_unicode=True, sort_keys=False, width=120)
        + "---\n\n"
        + body
    )

    out_path = lesson_dir / "practice-final.md"
    out_path.write_text(final_text, encoding="utf-8")
    return out_path


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument("--lesson-dir", required=True, type=Path)
    args = p.parse_args()
    out = run(args.lesson_dir)
    print(f"✓ Wrote {out}")
