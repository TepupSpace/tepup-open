"""Sinh 20 lesson-spec.yaml stubs từ course-outline.yaml.

Mỗi stub có sẵn:
- lesson_id, title, slug, level, position_in_level
- connections (builds_on, sets_up — suy ra từ thứ tự trong level)

Phần TODO bạn fill bằng tay:
- learning_objectives (3 cái, Bloom verbs)
- key_examples_seed (2-3 ví dụ bạn đã nghĩ ra)
- anchor_refs_seed (1-2 paper/framework bạn muốn neo)
- target_takeaway (1 câu, sau bài này học viên làm gì khác)
- forbidden_examples (nếu có)
- callbacks (callback explicit — Writer cũng có thể tự sinh)

Chạy:  python3 workflow/scripts/init_lesson_specs.py
       (from TEP04. Course-Logic-101/ directory)

Idempotent: nếu lesson-spec.yaml đã tồn tại → skip (không overwrite).
"""

import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTLINE_PATH = ROOT / "course-outline.yaml"
LESSONS_DIR = ROOT / "lessons"


def main():
    outline = yaml.safe_load(OUTLINE_PATH.read_text(encoding="utf-8"))

    # Group by level để tính position_in_level + builds_on + sets_up
    by_level = {}
    for lid, info in outline.items():
        by_level.setdefault(info["level"], []).append(lid)
    for lvl in by_level:
        by_level[lvl].sort()

    created, skipped = 0, 0

    for lid, info in outline.items():
        slug = info["slug"]
        folder_name = f"{lid}-{slug}"
        # Stage 1A output nằm trong 01.lesson/; Stage 1B (nếu có) trong 02.practice/
        folder = LESSONS_DIR / folder_name / "01.lesson"
        folder.mkdir(parents=True, exist_ok=True)

        spec_path = folder / "lesson-spec.yaml"
        legacy_spec_path = LESSONS_DIR / folder_name / "lesson-spec.yaml"
        if spec_path.exists() or legacy_spec_path.exists():
            skipped += 1
            continue

        level_lessons = by_level[info["level"]]
        position = level_lessons.index(lid) + 1
        position_total = len(level_lessons)

        idx = level_lessons.index(lid)
        builds_on = level_lessons[:idx] if idx > 0 else []
        # sets_up = bài kế tiếp trong cùng level (đơn giản hoá)
        sets_up = [level_lessons[idx + 1]] if idx + 1 < len(level_lessons) else []

        # Cross-level builds_on: lesson đầu mỗi level builds_on bài cuối level trước
        if idx == 0 and info["level"] > 1:
            prev_level = info["level"] - 1
            if prev_level in by_level:
                builds_on = [by_level[prev_level][-1]]

        spec = {
            "lesson_id": lid,
            "title": info["title"],
            "slug": slug,
            "level": info["level"],
            "position_in_level": f"{position} of {position_total}",
            "one_line_summary_from_outline": info["one_line_summary"],
            "key_concepts_from_outline": info["key_concepts"],
            "practice_required": False,  # TODO: đặt true nếu bài cần Stage 1B question bank
            "learning_objectives": [
                "# TODO: fill 3 Bloom-verb objectives",
                "# eg. 'Phân biệt được X và Y trong 1 phát biểu cụ thể'",
            ],
            "key_examples_seed": [
                "# TODO: fill 2-3 ví dụ bạn đã nghĩ ra (Researcher sẽ bổ sung thêm)",
            ],
            "anchor_refs_seed": [
                {"type": "paper", "hint": "# TODO: paper/study gốc bạn muốn cite"},
                {"type": "framework", "hint": "# TODO: framework name"},
            ],
            "connections": {
                "builds_on": builds_on,
                "sets_up": sets_up,
                "callbacks": [
                    "# TODO: callback explicit (vd 'Nhắc lại confirmation bias B01 ở §2')",
                    "# AI cũng được phép tự sinh callback ngoài list này",
                ],
            },
            "target_takeaway": "# TODO: 1 câu — sau bài này học viên sẽ làm gì khác?",
            "forbidden_examples": [
                "# TODO (optional): ví dụ politically sensitive cần tránh",
            ],
        }

        spec_path.write_text(
            yaml.dump(spec, allow_unicode=True, sort_keys=False, width=120),
            encoding="utf-8",
        )
        created += 1
        print(f"  ✓ {folder_name}/01.lesson/lesson-spec.yaml")

    print(f"\nDone. Created: {created}, Skipped (already exist): {skipped}")


if __name__ == "__main__":
    main()
