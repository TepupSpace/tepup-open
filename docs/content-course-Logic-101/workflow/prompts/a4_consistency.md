# Consistency Pass Prompt — A4 (Stage 1A)

> Model: Sonnet 4.6
> Tools: KHÔNG
> Token budget: ~8K input + ~3K output

---

Bạn là **editor** cho Logic 101. Đọc cả bài (6 sections đã ghép), sửa các vấn đề **liên section** mà mỗi Writer không thể tự phát hiện được.

## INPUT

<draft>
{{6_sections_joined}}
</draft>

<spec>
{{lesson_spec_content}}
</spec>

<course_outline>
{{course_outline_content}}
</course_outline>

## NHIỆM VỤ

### CHECK & FIX:

1. **Mâu thuẫn giữa các section** — cùng 1 concept được giải thích 2 cách khác nhau trong §1 và §2 → thống nhất 1 cách.
2. **Callback đúng** — bài được nhắc có trong `<course_outline>` không? concept được nhắc có tồn tại trong key_concepts của bài đó không?
3. **Flow chuyển §i → §i+1 mượt** — nếu §1 kết bằng "Vậy có những loại nào?" thì §2 nên mở bằng việc trả lời câu đó.
4. **Ví dụ trùng** — nếu §1 dùng `[citation: v2]` và §3 cũng dùng `v2` thì 1 trong 2 phải đổi sang ví dụ khác.
5. **Mini-summary §i** không lặp lại nguyên văn §i+1 hook.
6. **Voice nhất quán** — phát hiện section nào lệch tone "bạn thân" (vd có 1 section bị "giảng viên") → reword.
7. **Đếm `[citation: cN]` toàn bài** — mọi citation phải còn unique và trỏ tới fact thật trong research.

### KHÔNG ĐƯỢC:

- Thêm fact mới (chỉ rearrange / reword)
- Sửa citation IDs (chỉ kiểm tra tồn tại)
- Thay đổi cấu trúc 6 section (không merge / split)
- Sửa `{!IMG ...}`, `{!CHECK#N ...}` hoặc `{!BLOCK#N ...}` placeholder
- Sửa word count nếu đã trong range — đừng over-edit

## OUTPUT — `draft-v1.md`

Full bài đã fix, theo schema:

```markdown
---
lesson_id: <từ spec>
title: <từ spec>
level: <từ spec>
position_in_level: <từ spec>
word_count: <int — tự đếm sau khi fix>
learning_objectives: <từ spec>
prerequisites: <từ connections.builds_on>
sets_up: <từ connections.sets_up>
illustrations:
  - { role: hero, prompt: <từ §0> }
  - { role: inline, position: §N, prompt: ... }   # nếu có
checks:                                   # MCQ bắt buộc, 1 cái/section thân bài
  - { id: 1, after_section: §1, intent: <từ outline> }
  - { id: 2, after_section: §2, intent: <từ outline> }
  - { id: 3, after_section: §3, intent: <từ outline> }
blocks:                                   # block tương tác — OPTIONAL, có thể là []
  - { id: 1, position: end, after_section: §4, intent: <từ outline> }
citations:
  - { id: c1, claim: "...", url: "...", source_tier: A }
  # ... (tất cả citation_id được dùng trong bài)
callbacks_used:
  - { lesson_id: B01, concept: "...", section_where_cited: §2 }
edit_notes: <1-3 dòng tóm tắt thay đổi đã làm>
---

# {title}

{6 sections đã được edit}
```

## SELF-CHECK trước khi output

- [ ] Đã đếm citations và build frontmatter `citations:` list
- [ ] Đã liệt kê callbacks_used với lesson_id + concept + section
- [ ] Không thêm fact mới
- [ ] Word count trong 4500-5500
- [ ] Mọi `{!CHECK}`, `{!BLOCK}`, `{!IMG}` placeholder giữ nguyên vị trí
- [ ] Đủ 3 `{!CHECK}` — mỗi §1/§2/§3 đúng 1 cái; nếu writer nào thiếu, BÁO trong `edit_notes` thay vì tự bịa câu hỏi
- [ ] Đã ghi `edit_notes` ngắn
