"""Code-defined gates cho Logic 101 workflow.

Mỗi gate function:
- Input: file path(s) cần validate
- Output: list[str] of error messages. Empty list = PASS.

Stage 1A (theory):
- GATE A.1 (gate_a1_validate_research) — sau A1 Researcher
- GATE A.2 (gate_a2_validate_outline) — sau A2 Outliner
- a5_critic_pre_check — code-side pre-check trước khi gọi A5 Critic LLM

Stage 1B (practice, conditional):
- GATE B.1 (gate_b1_validate_practice_questions) — sau B2 Question Generators / trước HUMAN GATE C
- b3_critic_pre_check — code-side pre-check trước khi gọi B3 Practice Critic LLM
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

import yaml

# ─── Config ──────────────────────────────────────────────────────────────────

FORBIDDEN_PHRASES = [
    "nói chung là",
    "như chúng ta đều biết",
    "thật vậy",
    "rõ ràng rằng",
    "không thể phủ nhận",
    "ai cũng biết",
    "hiển nhiên",
    "đương nhiên",
]

WORD_COUNT_MIN = 4500
WORD_COUNT_MAX = 5500

ANCHOR_REFS_MIN = 3
VN_EXAMPLES_MIN = 5

# Chính sách block (course-wide) — xem course-context.yaml
# {!CHECK#N}: MCQ chốt kiến thức, BẮT BUỘC 1 cái ở cuối mỗi section thân bài.
# {!BLOCK#N}: block tương tác sâu, OPTIONAL.
BODY_SECTIONS = ["1", "2", "3"]
CHECKS_MIN = 3
CHECKS_MAX = 5
INTERACTIVE_BLOCKS_MAX = 2

VALID_TIERS = {"A", "B", "C"}


# ─── Helpers ─────────────────────────────────────────────────────────────────


def _word_count(text: str) -> int:
    """Đếm word theo whitespace split (tốt đủ cho VN có dấu)."""
    return len(text.split())


def _lesson_id_from_dir(lesson_dir: Path) -> str:
    """Suy lesson_id (vd 'B02') từ --lesson-dir.

    --lesson-dir trỏ tới sub-folder stage (`lessons/B02-nguy-bien-la-gi/01.lesson`),
    nên tên thư mục cuối là '01.lesson' chứ không phải id bài. Đi ngược lên tìm
    thư mục đầu tiên khớp dạng B<NN>-<slug>.
    """
    for part in [lesson_dir, *lesson_dir.parents]:
        m = re.match(r"^(B\d{2})-", part.name)
        if m:
            return m.group(1)
    return lesson_dir.name.split("-")[0]


def _extract_frontmatter_and_body(md_text: str) -> tuple[dict, str]:
    """Tách YAML frontmatter và body. Trả về ({}, full_text) nếu không có frontmatter."""
    if not md_text.startswith("---"):
        return {}, md_text
    parts = md_text.split("---", 2)
    if len(parts) < 3:
        return {}, md_text
    fm = yaml.safe_load(parts[1]) or {}
    return fm, parts[2]


def _extract_citation_ids_from_research(research_md: str) -> set[str]:
    """Tìm các citation_id trong research-notes (c1, c2, v1, v2, ...).

    Match heading 3 dạng `### c1` hoặc `### v3` ở các phần ## 1, ## 2.
    """
    ids = set()
    for m in re.finditer(r"^###\s+([cv]\d+)\s*$", research_md, re.MULTILINE):
        ids.add(m.group(1))
    return ids


def _extract_citation_refs_from_text(text: str) -> set[str]:
    """Tìm `[citation: cN]` hoặc `[citation: vN]` inline trong draft."""
    ids = set()
    for m in re.finditer(r"\[citation:\s*([cv]\d+)\s*\]", text):
        ids.add(m.group(1))
    return ids


def _extract_numbers_years(text: str) -> set[str]:
    """Extract năm 4-digit, số % và số có đơn vị triệu/tỷ."""
    nums = set()
    nums.update(re.findall(r"\b(19\d{2}|20\d{2})\b", text))  # năm
    nums.update(re.findall(r"\b(\d{1,3}(?:[\.,]\d+)?\s*%)", text))  # phần trăm
    nums.update(re.findall(r"\b(\d+\s*(?:triệu|tỷ|nghìn))\b", text))
    return nums


# ─── GATE A.1 — Research validation (sau A1 Researcher) ─────────────────────


def gate_a1_validate_research(research_path: Path) -> list[str]:
    errors: list[str] = []
    text = research_path.read_text(encoding="utf-8")

    # 1. No [!CITATION-NEEDED] residue
    if "[!CITATION-NEEDED" in text:
        n = text.count("[!CITATION-NEEDED")
        errors.append(f"GATE_A.1.1: Còn {n} marker [!CITATION-NEEDED] trong research-notes")

    # 2. ≥3 anchor refs (heading ### c1, c2, c3, ...)
    anchor_ids = re.findall(r"^###\s+(c\d+)\s*$", text, re.MULTILINE)
    if len(anchor_ids) < ANCHOR_REFS_MIN:
        errors.append(
            f"GATE_A.1.2: Chỉ có {len(anchor_ids)} anchor refs (cần ≥{ANCHOR_REFS_MIN})"
        )

    # 3. ≥5 VN examples (heading ### v1, v2, ...)
    vn_ids = re.findall(r"^###\s+(v\d+)\s*$", text, re.MULTILINE)
    if len(vn_ids) < VN_EXAMPLES_MIN:
        errors.append(
            f"GATE_A.1.3: Chỉ có {len(vn_ids)} VN examples (cần ≥{VN_EXAMPLES_MIN})"
        )

    # 4. Anchor refs phải có tier A hoặc B (không C)
    # Match block dạng "### c1\n... tier: X"
    for m in re.finditer(r"^###\s+(c\d+)\s*\n(.*?)(?=^###\s|\Z)", text, re.MULTILINE | re.DOTALL):
        cid, block = m.group(1), m.group(2)
        tier_match = re.search(r"^\s*-?\s*tier:\s*([ABC])", block, re.MULTILINE)
        if not tier_match:
            errors.append(f"GATE_A.1.4: Anchor {cid} thiếu field 'tier'")
        elif tier_match.group(1) == "C":
            errors.append(f"GATE_A.1.4: Anchor {cid} là tier C (anchor phải A hoặc B)")

    # 5. Mọi citation phải có URL trông hợp lệ
    for m in re.finditer(
        r"^###\s+([cv]\d+)\s*\n(.*?)(?=^###\s|\Z)", text, re.MULTILINE | re.DOTALL
    ):
        cid, block = m.group(1), m.group(2)
        url_match = re.search(r"url:\s*(\S+)", block)
        if not url_match:
            errors.append(f"GATE_A.1.5: Citation {cid} thiếu URL")
        else:
            url = url_match.group(1).strip()
            if not (url.startswith("http://") or url.startswith("https://")):
                errors.append(f"GATE_A.1.5: Citation {cid} URL không hợp lệ: {url}")

    return errors


# ─── GATE A.2 — Outline validation (sau A2 Outliner) ─────────────────────────


def gate_a2_validate_outline(outline_path: Path, course_outline_path: Path, current_lesson_id: str) -> list[str]:
    errors: list[str] = []
    text = outline_path.read_text(encoding="utf-8")
    course = yaml.safe_load(course_outline_path.read_text(encoding="utf-8"))

    # 1. Đủ 6 section
    sections = re.findall(r"^##\s+§(\d+)\s+", text, re.MULTILINE)
    expected = {"0", "1", "2", "3", "4", "5"}
    found = set(sections)
    missing = expected - found
    if missing:
        errors.append(f"GATE_A.2.1: Thiếu section §{sorted(missing)}")

    # 2. Word budget cộng đúng range
    word_targets = []
    for m in re.finditer(r"\*\*Word target\*\*:\s*(\d+)", text):
        word_targets.append(int(m.group(1)))
    if word_targets:
        total = sum(word_targets)
        if not (WORD_COUNT_MIN <= total <= WORD_COUNT_MAX):
            errors.append(
                f"GATE_A.2.2: Tổng word budget {total} ngoài range [{WORD_COUNT_MIN}, {WORD_COUNT_MAX}]"
            )

    # 3. Callbacks ref bài tồn tại + lesson_id nhỏ hơn
    callback_lessons = re.findall(r"Callback\s+prev\s+lesson.*?\b(B\d{2})\b", text, re.IGNORECASE)
    callback_lessons += re.findall(r"callback.*?\b(B\d{2})\b", text, re.IGNORECASE)
    for cb in set(callback_lessons):
        if cb not in course:
            errors.append(f"GATE_A.2.3: Callback ref bài không tồn tại: {cb}")
        elif cb >= current_lesson_id:
            errors.append(f"GATE_A.2.3: Callback ref bài tương lai/hiện tại: {cb} (current: {current_lesson_id})")

    # 4. CHECK (MCQ) bắt buộc — 1 cái cho mỗi section thân bài §1, §2, §3
    #
    # Dedupe theo id, giữ lần xuất hiện đầu. Template outline nhắc lại 3 dòng CHECK trong
    # mục "## Meta" ở cuối file; không dedupe thì mỗi CHECK bị đếm 2 lần → vượt CHECKS_MAX
    # và bị báo trùng wording với chính nó. Bản trong section là bản chuẩn (đứng trước Meta).
    _raw_checks = re.findall(r"CHECK\s*#(\d)\s+intent[^:]*:\s*\"?([^\"\n]+)", text)
    _by_id: dict[str, str] = {}
    for cid, intent in _raw_checks:
        _by_id.setdefault(cid, intent)
    check_intents = sorted(_by_id.items())
    check_ids = set(_by_id)
    for sec in BODY_SECTIONS:
        if sec not in check_ids:
            errors.append(
                f"GATE_A.2.4: Thiếu CHECK#{sec} — mỗi section thân bài §{sec} bắt buộc có 1 MCQ chốt kiến thức"
            )
    if not (CHECKS_MIN <= len(check_intents) <= CHECKS_MAX):
        errors.append(
            f"GATE_A.2.4: Số CHECK = {len(check_intents)}, ngoài range [{CHECKS_MIN}, {CHECKS_MAX}]"
        )

    # 5. CHECK intent không trùng wording (3 MCQ phải test 3 ý khác nhau)
    seen_check: dict[str, str] = {}
    for cid, intent in check_intents:
        norm = intent.strip().lower()
        if norm in seen_check:
            errors.append(
                f"GATE_A.2.5: CHECK#{cid} trùng intent với CHECK#{seen_check[norm]} — phải test ý khác nhau"
            )
        else:
            seen_check[norm] = cid

    # 6. BLOCK tương tác là OPTIONAL nhưng có trần, và intent không trùng nhau
    #    Dedupe theo id như check #4 — Meta cũng liệt kê lại Block intent.
    _raw_blocks = re.findall(r"Block\s*#(\d)\s+intent[^:]*:\s*\"?([^\"\n]+)", text)
    _blocks_by_id: dict[str, str] = {}
    for bid, intent in _raw_blocks:
        _blocks_by_id.setdefault(bid, intent)
    block_intents = [
        (bid, intent)
        for bid, intent in sorted(_blocks_by_id.items())
        if intent.strip().lower() not in ("none", "n/a", "-")
    ]
    if len(block_intents) > INTERACTIVE_BLOCKS_MAX:
        errors.append(
            f"GATE_A.2.6: {len(block_intents)} block tương tác, vượt trần {INTERACTIVE_BLOCKS_MAX}"
        )
    seen_block: dict[str, str] = {}
    for bid, intent in block_intents:
        norm = intent.strip().lower()
        if norm in seen_block:
            errors.append(
                f"GATE_A.2.6: Block #{bid} trùng intent với Block #{seen_block[norm]} — phải khác nhau"
            )
        else:
            seen_block[norm] = bid

    return errors


# ─── GATE A.3 — citation cross-reference (sau A5 Critic, trước A6 Assemble) ──


def gate_a3_citation_xref(draft_path: Path, research_path: Path) -> tuple[list[str], list[str]]:
    """Cross-reference citation giữa draft-v1.md và research-notes.md.

    Spec: 02.Workflow.md §5.2.5. Lý do tồn tại: GATE A.1 chỉ validate xuôi chiều
    (research-notes có citation hợp lệ), không kiểm ngược. Writer hoặc vòng revise của
    Critic có thể chèn `[citation: cN]` với id không tồn tại. Đã xảy ra ở B01 round 1 —
    citation c7 (Nobel 2005) được thêm thẳng vào bài mà không có entry trong research.

    Returns (errors, warnings). errors → HARD-FAIL, chặn A6. warnings → SOFT, A6 tự xử lý.
    """
    errors: list[str] = []
    warnings: list[str] = []

    _, draft_body = _extract_frontmatter_and_body(draft_path.read_text(encoding="utf-8"))
    research = research_path.read_text(encoding="utf-8")

    body_ids = _extract_citation_refs_from_text(draft_body)
    research_ids = _extract_citation_ids_from_research(research)

    # 1. HARD — inline citation trỏ tới id không tồn tại trong research
    missing = sorted(body_ids - research_ids)
    if missing:
        errors.append(
            f"GATE_A.3.1: Bài reference citation không có trong research-notes: {missing}"
        )

    # 2. SOFT — citation có trong research nhưng không được dùng trong bài.
    #    A6 sẽ tự drop khỏi frontmatter (chỉ build citations thực sự được reference).
    orphans = sorted(research_ids - body_ids)
    if orphans:
        warnings.append(f"GATE_A.3.2: Citation không dùng trong bài, A6 sẽ drop: {orphans}")

    # 3. HARD — no-bịa marker (trùng GATE A.1 nhưng là lưới an toàn cuối)
    if "[!CITATION-NEEDED" in draft_body:
        n = draft_body.count("[!CITATION-NEEDED")
        errors.append(f"GATE_A.3.3: Còn {n} marker [!CITATION-NEEDED] trong bài")

    # 4. SOFT — số/năm xuất hiện trong bài mà không thấy trong research.
    #    Chỉ spot-flag để người đọc soi, không chặn: A5 Critic LLM đã verify phần này.
    stray = sorted(_extract_numbers_years(draft_body) - _extract_numbers_years(research))
    if stray:
        warnings.append(f"GATE_A.3.4: Số/năm trong bài không thấy trong research: {stray}")

    return errors, warnings


# ─── A5 Critic pre-check (code-side, trước khi gọi A5 Critic LLM) ───────────


def a5_critic_pre_check(draft_path: Path, research_path: Path) -> list[str]:
    """Code pre-check trước khi gọi A5 Critic LLM. Output đi vào <code_findings> tag."""
    findings: list[str] = []
    draft_fm, draft_body = _extract_frontmatter_and_body(draft_path.read_text(encoding="utf-8"))
    research = research_path.read_text(encoding="utf-8")

    # HARD #1 — Citation integrity (numbers/years)
    nums_draft = _extract_numbers_years(draft_body)
    nums_research = _extract_numbers_years(research)
    for n in nums_draft:
        if n not in nums_research:
            findings.append(f"HARD#1: '{n}' trong draft nhưng KHÔNG có trong research")

    # HARD #1.b — Citation IDs referenced phải tồn tại
    ids_in_draft = _extract_citation_refs_from_text(draft_body)
    ids_in_research = _extract_citation_ids_from_research(research)
    for cid in ids_in_draft:
        if cid not in ids_in_research:
            findings.append(f"HARD#1: [citation: {cid}] ref không tồn tại trong research")

    # HARD #2 — No-bịa
    if "[!CITATION-NEEDED" in draft_body:
        n = draft_body.count("[!CITATION-NEEDED")
        findings.append(f"HARD#2: Còn {n} marker [!CITATION-NEEDED]")

    # SOFT #5 — Word count
    wc = _word_count(draft_body)
    if not (WORD_COUNT_MIN <= wc <= WORD_COUNT_MAX):
        findings.append(f"SOFT#5: word count {wc} ngoài range [{WORD_COUNT_MIN}, {WORD_COUNT_MAX}]")

    # SOFT #7 — Section structure
    sections = re.findall(r"^##\s+§(\d+)\.\s+", draft_body, re.MULTILINE)
    expected = {"0", "1", "2", "3", "4", "5"}
    missing = expected - set(sections)
    if missing:
        findings.append(f"SOFT#7: Thiếu section §{sorted(missing)}")

    # STYLE #10 — Forbidden phrases
    for phrase in FORBIDDEN_PHRASES:
        if phrase.lower() in draft_body.lower():
            findings.append(f"STYLE#10: chứa forbidden phrase '{phrase}'")

    return findings


# ─── Helpers for practice gates ──────────────────────────────────────────────


def _load_practice_questions(questions_files: list[Path]) -> dict[str, list[dict]]:
    """Load 3 tier YAML files → {'easy': [...], 'medium': [...], 'hard': [...]}.

    Mỗi file YAML expect cấu trúc:
        tier: easy
        questions:
          - q_id: q1
            stem: "..."
            type_tested: "..."
            situation: "..."
            options: { A: "...", B: "...", ... }
            correct: A
            explanation: "..."
            distractor_explanations: { B: "...", ... }
    """
    out: dict[str, list[dict]] = {"easy": [], "medium": [], "hard": []}
    for path in questions_files:
        if not path.exists():
            continue
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        tier = data.get("tier")
        if tier in out:
            out[tier] = data.get("questions", []) or []
    return out


def _load_practice_spec(path: Path) -> dict:
    """Load practice-spec.yaml, trả về {} nếu không tồn tại."""
    if not path.exists():
        return {}
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


# ─── GATE B.1 — Practice questions validation (sau B2 Question Generators) ──


def gate_b1_validate_practice_questions(
    questions_files: list[Path], practice_spec_path: Path
) -> list[str]:
    """GATE B.1 — pre HUMAN GATE C.

    Validate:
    - Mọi file YAML parse được
    - Count đúng tier (easy=N, medium=N, hard=N) theo practice-spec.tiers
    - Mỗi q có correct key + correct key có trong options
    - Distractor count đúng options_per_mcq (nếu MCQ)
    - Coverage type + situation đầy đủ theo practice-spec
    - Không còn [!CITATION-NEEDED]
    """
    errors: list[str] = []
    spec = _load_practice_spec(practice_spec_path)
    if not spec:
        errors.append(f"GATE_B.1.0: practice-spec.yaml không tồn tại hoặc rỗng: {practice_spec_path}")
        return errors

    tiers_cfg = {t["level"]: t for t in spec.get("tiers", [])}
    qs_by_tier = _load_practice_questions(questions_files)

    # 1. No [!CITATION-NEEDED] residue trong bất kỳ file nào
    for path in questions_files:
        if path.exists() and "[!CITATION-NEEDED" in path.read_text(encoding="utf-8"):
            errors.append(f"GATE_B.1.1: Còn [!CITATION-NEEDED] trong {path.name}")

    # 2. Count per tier
    for tier, qs in qs_by_tier.items():
        expected = tiers_cfg.get(tier, {}).get("count")
        if expected is not None and len(qs) != expected:
            errors.append(
                f"GATE_B.1.2: Tier {tier} có {len(qs)} câu, spec yêu cầu {expected}"
            )

    fmt = spec.get("question_format", "MCQ")
    options_per_mcq = spec.get("options_per_mcq", 4)

    # 3. Mỗi q có correct key + correct trong options + distractor count đúng
    for tier, qs in qs_by_tier.items():
        for q in qs:
            qid = q.get("q_id", "?")
            if "correct" not in q or q["correct"] is None:
                errors.append(f"GATE_B.1.3: {tier}/{qid} thiếu 'correct' key")
                continue
            if fmt == "MCQ":
                opts = q.get("options") or {}
                if len(opts) != options_per_mcq:
                    errors.append(
                        f"GATE_B.1.3: {tier}/{qid} có {len(opts)} options, cần {options_per_mcq}"
                    )
                if q["correct"] not in opts:
                    errors.append(
                        f"GATE_B.1.3: {tier}/{qid} correct='{q['correct']}' KHÔNG có trong options {list(opts.keys())}"
                    )

    # 4. Coverage type + situation
    types_required = set(spec.get("type_coverage_required", []) or [])
    sits_required = set(spec.get("situation_coverage_required", []) or [])
    types_present = {
        q.get("type_tested") for qs in qs_by_tier.values() for q in qs if q.get("type_tested")
    }
    sits_present = {
        q.get("situation") for qs in qs_by_tier.values() for q in qs if q.get("situation")
    }
    missing_types = types_required - types_present
    missing_sits = sits_required - sits_present
    if missing_types:
        errors.append(f"GATE_B.1.4: Thiếu type coverage: {sorted(missing_types)}")
    if missing_sits:
        errors.append(f"GATE_B.1.4: Thiếu situation coverage: {sorted(missing_sits)}")

    return errors


# ─── B3 Practice Critic pre-check (code-side, trước khi gọi B3 LLM) ─────────


def b3_critic_pre_check(
    questions_files: list[Path],
    practice_spec_path: Path,
    research_path: Path,
) -> list[str]:
    """Mirror a5_critic_pre_check, áp dụng cho practice question bank.

    Output đi vào <code_findings> tag của prompt b3_practice_critic.md.
    """
    findings: list[str] = []
    spec = _load_practice_spec(practice_spec_path)
    qs_by_tier = _load_practice_questions(questions_files)

    # P-HARD#2: No-bịa
    for path in questions_files:
        if path.exists() and "[!CITATION-NEEDED" in path.read_text(encoding="utf-8"):
            findings.append(f"P-HARD#2: Còn [!CITATION-NEEDED] trong {path.name}")

    # P-SOFT#5: Count per tier
    for tier_cfg in spec.get("tiers", []):
        level = tier_cfg["level"]
        expected = tier_cfg.get("count")
        actual = len(qs_by_tier.get(level, []))
        if expected is not None and actual != expected:
            findings.append(f"P-SOFT#5: Tier {level} có {actual} câu, spec {expected}")

    # P-HARD#4: Distractor count + correct key in options
    fmt = spec.get("question_format", "MCQ")
    options_per_mcq = spec.get("options_per_mcq", 4)
    if fmt == "MCQ":
        for tier, qs in qs_by_tier.items():
            for q in qs:
                qid = q.get("q_id", "?")
                opts = q.get("options") or {}
                if len(opts) != options_per_mcq:
                    findings.append(
                        f"P-HARD#4: {tier}/{qid} có {len(opts)} options, cần {options_per_mcq}"
                    )
                if q.get("correct") not in opts:
                    findings.append(
                        f"P-HARD#4: {tier}/{qid} correct='{q.get('correct')}' không có trong options"
                    )

    # P-SOFT#7: Type coverage
    types_required = set(spec.get("type_coverage_required", []) or [])
    types_present = {
        q.get("type_tested") for qs in qs_by_tier.values() for q in qs if q.get("type_tested")
    }
    missing_types = types_required - types_present
    if missing_types:
        findings.append(f"P-SOFT#7: Thiếu type coverage: {sorted(missing_types)}")

    # P-SOFT#8: Situation coverage
    sits_required = set(spec.get("situation_coverage_required", []) or [])
    sits_present = {
        q.get("situation") for qs in qs_by_tier.values() for q in qs if q.get("situation")
    }
    missing_sits = sits_required - sits_present
    if missing_sits:
        findings.append(f"P-SOFT#8: Thiếu situation coverage: {sorted(missing_sits)}")

    # P-STYLE#10: Forbidden phrases trong stem/explanation
    for path in questions_files:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8").lower()
        for phrase in FORBIDDEN_PHRASES:
            if phrase.lower() in text:
                findings.append(
                    f"P-STYLE#10: {path.name} chứa forbidden phrase '{phrase}'"
                )

    return findings


# ─── CLI for ad-hoc testing ──────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse, sys

    parser = argparse.ArgumentParser(description="Run a gate on a lesson")
    parser.add_argument(
        "gate",
        choices=["gate_a1", "gate_a2", "gate_a3", "a5_critic_pre", "gate_b1", "b3_critic_pre"],
    )
    parser.add_argument("--lesson-dir", required=True, type=Path)
    parser.add_argument(
        "--course-outline",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "course-outline.yaml",
    )
    parser.add_argument(
        "--practice-spec",
        type=Path,
        help="Path tới practice-spec.yaml (chỉ cần cho gate_b1 / b3_critic_pre)",
    )
    args = parser.parse_args()

    if args.gate == "gate_a1":
        errs = gate_a1_validate_research(args.lesson_dir / "research-notes.md")
    elif args.gate == "gate_a2":
        errs = gate_a2_validate_outline(
            args.lesson_dir / "outline.md", args.course_outline, _lesson_id_from_dir(args.lesson_dir)
        )
    elif args.gate == "gate_a3":
        errs, warns = gate_a3_citation_xref(
            args.lesson_dir / "draft-v1.md", args.lesson_dir / "research-notes.md"
        )
        for w in warns:
            print(f"⚠ {w}")
    elif args.gate == "a5_critic_pre":
        errs = a5_critic_pre_check(
            args.lesson_dir / "draft-v1.md", args.lesson_dir / "research-notes.md"
        )
    elif args.gate == "gate_b1":
        if not args.practice_spec:
            args.practice_spec = args.lesson_dir / "practice-spec.yaml"
        questions_files = [
            args.lesson_dir / f"questions-{tier}.yaml"
            for tier in ("easy", "medium", "hard")
        ]
        errs = gate_b1_validate_practice_questions(questions_files, args.practice_spec)
    else:  # b3_critic_pre
        if not args.practice_spec:
            args.practice_spec = args.lesson_dir / "practice-spec.yaml"
        questions_files = [
            args.lesson_dir / f"questions-{tier}.yaml"
            for tier in ("easy", "medium", "hard")
        ]
        errs = b3_critic_pre_check(
            questions_files,
            args.practice_spec,
            args.lesson_dir / "research-notes.md",
        )

    if not errs:
        print(f"✓ {args.gate} PASS")
        sys.exit(0)
    print(f"✗ {args.gate} FAIL ({len(errs)} issues):")
    for e in errs:
        print(f"  - {e}")
    sys.exit(1)
