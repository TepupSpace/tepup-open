---
lesson_id: B02
critic_round: 2
prev_round_verdict: HARD-FAIL
revision_reason: "Round 1 HARD-FAIL #4 (13 câu >35 từ) + 2 SOFT-WARN (#7 §4 vượt budget, #11 language convention) + 1 MUST-FIX precision [P1] trích Nghị định 81/2018 thiếu vế khoản 2"
verdict: PASS
hard_fail_count: 0
soft_warn_count: 0
---

# Critic Report — B02 (round 2)

## Verdict: PASS

Cả 4 tiêu chí HARD-FAIL và cả 4 tiêu chí SOFT-WARN đều PASS. Hai tiêu chí STYLE đều đạt.
**Bài đi tiếp NODE 6 Assemble.**

Đã verify độc lập từng finding round 1 — không tin báo cáo của Reviser, tự đếm lại và tự
đối chiếu research-notes. **6/6 việc làm đúng.** Ba fix ngoài list ([P2], [P3], [P4]) đều
khớp research-notes, không cái nào tạo claim mới.

Quan trọng: tôi cũng đã **đọc lại toàn bài** để bắt regression do tách câu, đúng như
coordinator yêu cầu. Kết quả: **không có regression làm hỏng nghĩa hay hỏng citation.**
Tìm được **1 chỗ mạch văn bị mờ đi** (§1 dòng 138) — chỉ ở mức STYLE, không block, fix 3 chữ.

---

## Verify từng việc round 1

| # | Việc | Reviser báo | Tôi đếm/đối chiếu độc lập | Kết |
|---|---|---|---|---|
| 1 | [P1] Nghị định 81/2018 | đã sửa | đối chiếu nguyên văn entry v2 — xem phân tích dưới | ✅ ĐẠT, còn tốt hơn bản tôi đề xuất |
| 2 | Câu dài | 13/13, còn 0 câu >35 | **0 câu >35**; dài nhất đúng 35; avg 14.3 (round 1: 14.9) | ✅ ĐẠT |
| 3 | Language convention | 4/4 | quét lại: `section` 0 hit, `Hook` 0 hit, §2 B01 đã Việt hoá, B03 đã Việt-trước | ✅ ĐẠT 4/4 |
| 4 | §4 | 129 → 93 từ | tôi đếm **97** (khác cách bóc directive), range 80-120 | ✅ ĐẠT |
| 5 | [c3] tier B ở §1 | 2 chỗ → `[c3, c2]` | dòng 94 ✓, dòng 102 ✓; `c2` từ 2 → **4** lượt dùng | ✅ ĐẠT |
| 6 | [P2] [P3] [P4] | làm thêm | đối chiếu v6 / c6 / c1 — xem dưới | ✅ cả 3 khớp research |

### VIỆC 1 — [P1] Nghị định 81/2018: ĐẠT, và ĐẠT tốt hơn bản tôi đề xuất

Câu mới (§2 dòng 225):
> *"Pháp luật Việt Nam đã định nghĩa sẵn mốc so sánh hợp lệ. Nghị định 81/2018/NĐ-CP, Điều 7
> lấy mốc để so là 'giá hàng hóa, dịch vụ đó ngay trước thời gian khuyến mại'. Mức giảm tối
> đa là 50%, riêng chương trình khuyến mại tập trung thì được tới 100% [citation: v2]."*

Đối chiếu từng mảnh với `research-notes.md::v2` (không tin lời Reviser):

| Mảnh trong bài | research v2 | Kết |
|---|---|---|
| "giá hàng hóa, dịch vụ đó ngay trước thời gian khuyến mại" | có nguyên văn trong `raw_quote` | khớp từng chữ |
| "Mức giảm tối đa là 50%" | `raw_quote` khoản 1 | khớp |
| "riêng chương trình khuyến mại tập trung thì được tới 100%" | `raw_quote`: *"(Khoản 2 cho phép mức tối đa 100% trong chương trình khuyến mại tập trung.)"* | khớp |
| bỏ chữ "khoản 1", để "Điều 7" | khoản 1 **và** khoản 2 đều nằm trong Điều 7 | **chính xác hơn bản cũ** — vì câu giờ gánh cả hai khoản |

**Hàm ý sai đã biến mất — verify bằng cách đọc liền mạch hai đoạn.** Dòng 225 nói rõ khuyến
mại tập trung được giảm tới 100%; dòng 227 ngay sau đó trích [v3] "giảm sâu 50-70%". Người
đọc bây giờ không còn cách nào suy ra "giảm 70% là phạm luật" — con số 70% nằm gọn trong
biên độ mà chính đoạn trên vừa nói là hợp pháp. Lỗi "bài logic tự mắc đúng lỗi nó đang dạy
cách bắt" đã được gỡ.

**Không thêm fact ngoài research.** Không có số, điều khoản, hay diễn giải pháp lý nào không
truy được về entry v2.

Thêm một điểm Reviser làm tốt mà không báo: dòng 227 đổi thành *"…đã cảnh báo về đúng chiêu
này. **Nguyên văn:** '…'"*. Chữ "Nguyên văn" làm rõ đây là trích dẫn chứ không phải diễn
giải — tăng độ minh bạch của citation. Giữ.

### VIỆC 2 — câu dài: ĐẠT, đếm lại độc lập

Tôi đếm lại từ đầu (bóc frontmatter, bóc text trong `{!IMG}`/`{!CHECK}`, bóc marker
`[citation: …]` và ký tự markdown, tách câu theo `.!?…` trong từng đoạn):

- **350 câu, 0 câu vượt 35 từ.** Câu dài nhất đúng **35** — chạm trần, hợp lệ.
- Chỉ còn 6 câu trong khoảng 33-35.
- Trung bình **14.3 từ/câu** (round 1: 14.9), vẫn nằm trong `target_avg_words: 15-20` và
  thiên về phía ngắn — đúng hướng cho audience Spiderum.

**Kiểm regression trên cả 13 chỗ tách — không chỗ nào đổi nghĩa, không chỗ nào rớt citation.**
Ba chỗ đáng chú ý:

- **§1 d.102 (Toulmin)** — tách thành 3 câu, `[citation: c3, c2]` giờ nằm ở câu cuối. Cả ba
  câu vẫn trong **cùng một đoạn**, nên Stage 2 map thành cùng một content block và citation
  vẫn phủ đúng phạm vi. Hai trích nguyên văn ground/claim còn nguyên từng chữ. ✅
- **§2 d.188 ([c5] Aristotle — điểm rủi ro cao)** — chỉ tách ở dấu gạch ngang, **giữ nguyên
  từng chữ** bản an toàn đã duyệt. Câu sau bắt đầu bằng "Vì…" (dạng câu rút gọn) — hợp giọng
  đời thường, không phải lỗi. Vẫn **không có** chữ "enthymeme", **không có** "tam đoạn luận".
  ✅ Đây là chỗ tôi soi kỹ nhất vì tách câu là lúc dễ vô tình "làm rõ nghĩa" thành câu khẳng
  định mà SEP đang tranh cãi. Reviser không đụng vào. Đúng.
- **§1 d.154 (mini-summary §1)** — "…kết luận vẫn sai. Đó là ngụy biện — lỗi ở CÁCH SUY chứ
  không phải ở sự thật." Vẫn khớp `outline.md::§1 Mini-summary draft`. ✅

### VIỆC 3 — language convention: ĐẠT 4/4

| Chỗ | Trạng thái | Verify |
|---|---|---|
| §2 d.219 "cả section này" | → **"Nhớ mỗi dòng này thôi cũng được:"** | quét `section` toàn bài: **0 hit** ✅ |
| §2 d.235 "B01: Confirmation bias" | → **"B01 — thiên kiến xác nhận"** | ✅ đúng `first_introduction_only` |
| §5 d.357 "B03: Correlation ≠ Causation" | → **"B03: Tương quan ≠ Nhân quả (Correlation ≠ Causation)"** | ✅ đúng `technical_term_pattern` Việt-trước |
| d.52 heading "§0. Hook" | → **"§0. Mở đầu"** | quét `Hook`: **0 hit** ✅ |

Reviser gộp luôn đề xuất reword tone của tôi ở #9 vào chỗ đầu — hai vấn đề, một sửa. Tốt.

### VIỆC 4 — §4: ĐẠT

97 từ prose (Reviser báo 93 — chênh do cách bóc directive, không quan trọng), target 100,
range 80-120. Đoạn chép lại nguyên 3 câu hỏi của §3 đã nén thành 1 câu, **và chỗ lặp cũng
biến mất** — đúng hai mục tiêu tôi đặt ra. Ba câu dẫn còn lại vẫn đủ để mời học viên thực
hành, không mất chức năng của §4.

### VIỆC 5 — chống lưng [c3] tier B: ĐẠT

- d.94 (*"…mới có một lập luận"*): `[citation: c3]` → `[citation: c3, c2]` ✅
- d.102 (định nghĩa ground/claim): `[citation: c3]` → `[citation: c3, c2]` ✅
- `c2` giờ được dùng **4 lượt** (round 1: 2).

Pre-authorize kiểm lại: `research-notes.md §3 concept *tiền đề*` ghi
`cited_from: [c3] Toulmin 1958 …; [c2] IEP Validity and Soundness` — đúng cặp vừa được ghép.
**Không còn claim lõi nào ở §1 chỉ dựa mỗi nguồn tier B.** Điểm yếu A4 nêu ở bàn giao #2 đã
được xử lý ở mức có thể xử lý trong round này.

### VIỆC 6 — ba fix ngoài list: cả 3 KHỚP research (đây là chỗ dễ thành #1 HARD-FAIL nhất, đã soi từng cái)

**[P2] §0 d.62 — mẫu số của 9%.** Bản mới:
> *"…đã vượt mốc 25 tỷ USD. Con số đó chiếm khoảng 9% tổng mức bán lẻ hàng hoá và dịch vụ
> tiêu dùng [citation: v6]. Nghĩa là cứ mười đồng chi cho mua sắm hàng hoá và dịch vụ tiêu
> dùng, gần một đồng đi qua một màn hình như màn hình bạn vừa lướt."*

v6 `raw_quote`: *"Quy mô thị trường TMĐT sớm vượt mốc 25 tỷ USD"* + *"TMĐT chiếm khoảng 9%
tổng mức bán lẻ hàng hóa và dịch vụ tiêu dùng"*. Kiểm cả mạch đại từ: "Con số đó" trỏ về
25 tỷ USD = quy mô TMĐT, và 9% đúng là tỷ trọng của TMĐT → **quy chiếu đúng, không lệch**.
Mẫu số giờ trùng khít tên chỉ tiêu trong nguồn. ✅ Không còn overreach.

**[P3] §3 d.303 — Urbany 1988.** Bản mới: *"đem so **ba** kiểu quảng cáo. Một kiểu **không
ghi giá tham chiếu**, một kiểu ghi giá tham chiếu hợp lý, một kiểu ghi giá tham chiếu bị
thổi phồng."* — c6 `key_quote` mô tả đúng ba nhánh này (*"so với quảng cáo không có giá tham
chiếu, quảng cáo có giá tham chiếu HỢP LÝ … và giá tham chiếu PHÓNG ĐẠI …"*). ✅
Tên tác giả (Urbany, Bearden, Weilbaker) và năm (1988) không đổi, vẫn khớp c6. Kết luận phía
sau (*"kể cả ở nhóm người vốn đa nghi hơn"*) giữ nguyên, vẫn khớp *"even for the more
skeptical subjects"*. ✅

**[P4] §1 d.136 — diễn giải lại c1.** Bản mới:
> *"Trong triết học cũng có hai cách hiểu 'ngụy biện' đứng cạnh nhau. Một cách coi nó là
> 'niềm tin sai nhưng phổ biến', cách kia coi nó là 'lập luận tồi có tính đánh lừa'
> [citation: c1]. Bài này dùng cách hiểu thứ hai."*

c1 `key_quote`: *"Two competing conceptions of fallacies are that they are false but popular
beliefs and that they are deceptively bad arguments."* → "hai cách hiểu đứng cạnh nhau" =
"two competing conceptions" ✅. Câu cũ *"Giới nghiên cứu triết học cũng tách đôi **đúng theo
ranh giới này**"* — vốn ngầm khẳng định giới triết học dùng ranh giới nói-dối/ngụy-biện của
bài — **đã biến mất**. Câu *"Bài này dùng cách hiểu thứ hai"* là cách khai báo lựa chọn trung
thực, không mượn uy tín học thuật cho một ranh giới học thuật không có. ✅ **Cải thiện thật,
không phải sửa cho có.**

---

## Rubric findings — áp lại đủ 11 tiêu chí

### 🔴 HARD-FAIL

#### #1 Citation integrity (forward + backward) — PASS

**Backward:** 14 id dùng trong bài (c1-c7, v1-v7), 14/14 có entry trong research-notes.
Không id lạ. Không id nào bị bỏ quên. Phân bố sau revise: c1×3, c2×**4**, c3×3, c4×2, c5×1,
c6×1, c7×2, v1×1, v2×3, v3×1, v4×2, v5×2, v6×1, v7×2.

**Forward:** đã đối chiếu lại **toàn bộ** số/năm/tên, không chỉ mấy chỗ sửa — vì tách câu là
thao tác dễ làm rớt hoặc lệch số. Tất cả khớp: 25 tỷ USD / 9% (v6) · 1958 + ground/claim +
warrant (c3) · 50% + 100% + mốc "giá ngay trước thời gian khuyến mại" (v2) · 50-70% (v3) ·
1988 + Urbany/Bearden/Weilbaker + 3 nhánh (c6) · cơ chế neo + "trả thưởng không làm giảm"
(c7) · Habernal + "mặc định và để ngầm" (c4) · Aristotle bản an toàn (c5) · valid/sound (c2)
· "vẫn chẳng khác gì ngày thường" (v1) · "chưa từng tồn tại" + "Chỉ còn 2 sản phẩm trong
kho" (v4) · "làm giả giá cả… / thông báo giả…" (v5) · phí giao hàng + phụ phí (v7) ·
2.000.000 / 599.000 / 1.401.000 / 25.000 / 1,2kg / 70% / 3 suất.

**Không còn precision item nào tồn đọng.** [P1] [P2] [P3] [P4] đã đóng cả bốn.

#### #2 No-bịa — PASS

0 `[!CITATION-NEEDED]`. 0 citation id tự chế. 0 tên tác giả / năm / nghiên cứu không truy
được về research-notes.

#### #3 Political neutrality — PASS

Quét lại sau revise (revise có thể vô tình thêm ví dụ): **0 hit** cho Shopee / Lazada / Tiki
/ Sendo / TikTok / Temu / Amazon; 0 tên shop, 0 tên nhãn hàng, 0 tên người nổi tiếng, 0 đảng
/ chính trị gia. Mọi quảng cáo vẫn ở dạng mẫu chung. Bộ Công Thương và Ủy ban Cạnh tranh
Quốc gia vẫn chỉ đứng ở vai nguồn số liệu / nguồn cảnh báo tiêu dùng, không kèm bình luận
chính sách. Điểm rủi ro cao "tên sàn TMĐT trong [v4]" — vẫn CLEAR.

#### #4 Audience violation — PASS *(round 1: FAIL)*

- **Jargon:** kiểm lại từng gloss sau khi tách câu — cả 8 thuật ngữ vẫn còn định nghĩa đời
  thường ở lần đầu xuất hiện: tiền đề (premise) d.98 · kết luận (conclusion) d.100 · ngụy
  biện (fallacy) d.126 · tiền đề ẩn (hidden premise) d.168 · đúng cấu trúc (valid) d.209 ·
  vững (sound) d.213 · neo giá (anchoring) d.233 · thiên kiến xác nhận (confirmation bias)
  d.72. **Không gloss nào bị tách rời khỏi thuật ngữ của nó.** ✅
- **`max_words_per_sentence: 35`:** **0 vi phạm** (round 1: 13). Dài nhất = 35.
- **Reading level:** avg 14.3 từ/câu; đoạn 3-5 dòng, không đoạn nào >8 dòng.
- `forbidden_devices` vẫn sạch: 0 "tam đoạn luận", 0 "enthymeme", 0 bảng chân trị, 0 ký hiệu
  hình thức.

### 🟡 SOFT-WARN — 0 FAIL *(round 1: 2)*

#### #5 Word count — PASS

**5442** / target 4500-5500 (đếm theo đúng phương pháp `gates.py::_word_count` trên raw
body). Tăng 8 từ so với round 1 — chi phí của 13 lần tách câu + 4 fix precision, rẻ hơn tôi
dự trù. Còn **58 từ** headroom.

#### #6 VN example ratio — PASS

Không đổi: **20/21 ≈ 95%** (yêu cầu ≥70%). Revise không thêm/bớt ví dụ nào; [P3] chỉ mô tả
lại thiết kế nghiên cứu Urbany chứ không biến nó thành ví dụ minh hoạ. Ba nguồn nước ngoài
có ví dụ gốc nhạy cảm (c7 Liên Hợp Quốc, c3 Bermuda, c2/c5 tam đoạn luận) vẫn **chỉ được lấy
cơ chế**, không bê ví dụ. ✅

#### #7 Section structure + block policy — PASS *(round 1: FAIL)*

| § | Prose | Target | Range ±20% | Kết |
|---|---|---|---|---|
| §0 | 538 | 500 | 400-600 | OK |
| §1 | 1367 | 1400 | 1120-1680 | OK |
| §2 | 1308 | 1300 | 1040-1560 | OK |
| §3 | 915 | 900 | 720-1080 | OK |
| §4 | **97** | 100 | 80-120 | **OK** (round 1: 129, OUT) |
| §5 | 824 | 800 | 640-960 | OK |
| tổng | **5049** | 5000 | — | +1.0% |

**6/6 section trong ±20%.** Raw body 5442 ≤ 5500. Cả hai ràng buộc đều đạt — đúng như phán
quyết round 1 về đơn vị đo (xem "Ba điểm A4" dưới).

**3 `{!CHECK}`** — vẫn đủ 3, vẫn nằm ở **dòng cuối** của §1 (d.156) / §2 (d.245) / §3
(d.313), intent không bị sửa, vẫn test 3 ý khác nhau (nhận diện loại lỗi → giải thích cơ chế
→ áp dụng lên ca mới), vẫn phủ đúng LO1/LO2/LO3. ✅
**`blocks: []`** — giữ nguyên, lý do trong lesson-spec vẫn đứng vững. ✅
**`{!IMG}`** — 1 hero + 1 inline, đúng policy. ✅

#### #8 Callback validity — PASS

Cả hai callback B01 vẫn hợp lệ sau khi §2 đổi cách gọi tên: B01 có trong course-outline,
`lesson_id` < B02, và concept được nhắc đúng là `key_concept` của B01 (`confirmation bias`).
`callbacks_used` ở frontmatter vẫn mô tả đúng thực tế bài. Tham chiếu B03 ở §5 vẫn là câu
chuyển tiếp bắt buộc theo outline, không phải callback bài tương lai. ✅

### 🟢 STYLE

#### #9 Tone "bạn thân" — **4/5** (giữ nguyên round 1, yêu cầu ≥3)

Tách 13 câu **không** làm giọng bị vụn hay bị khô — đây là rủi ro chính của round này và nó
không xảy ra. Câu ngắn hơn thực ra hợp giọng "bạn thân" hơn: *"Vì người nói tin rằng người
nghe sẽ tự điền phần thiếu."* (§2) đọc gọn hơn bản dính liền cũ.

Hai trong ba chỗ "giảng viên" tôi nêu round 1 đã tự hết nhờ revise: d.136 (c1) và d.180
(Habernal) giờ đọc mượt hơn. Chỗ thứ ba đã được sửa thẳng: *"Bài học lõi của cả section
này"* → *"Nhớ mỗi dòng này thôi cũng được"* — câu này hợp giọng hơn hẳn.

#### #10 Forbidden phrases — PASS

Quét lại đủ 8 cụm: **0 hit**. Đọc lại các câu mới sinh ra do tách — không câu nào rơi vào
dạng cliché. ✅

#### #11 Language convention (Vietnamese-first) — PASS *(round 1: FAIL)*

Cả 4 điểm [L1]-[L4] đã đóng (bảng ở VIỆC 3). `technical_term_pattern` vẫn chuẩn ở toàn bộ
thuật ngữ lõi, không có `examples_wrong` (không đảo Anh-trước-Việt). `casual_english_words`
sạch. Bare English còn lại đều nằm trong whitelist hoặc là tên thuật ngữ gốc được định nghĩa
tiếng Việt tại chỗ (*ground* / *claim* / *warrant*), `logic` và `nhóm chat` là từ đã Việt hoá
phổ thông.

---

## Ba điểm A4 bàn giao — trạng thái sau round 2

1. **[c7] ở §2 + §3 — GIỮ CẢ HAI (phán quyết round 1, không đổi).** Revise không đụng vào cấu
   trúc này. Gloss "neo giá (anchoring)" vẫn ở §2 d.233, và §3 d.307 (*"Cái neo vẫn kéo…"*)
   vẫn phụ thuộc vào nó. Ràng buộc round 1 vẫn còn hiệu lực: **ai cắt mục neo giá ở §2 phải
   chuyển gloss sang §3, không được cắt trơn.**
2. **[c3] tier B — ĐÃ XỬ LÝ ở mức round này cho phép.** Hai chỗ ở §1 đã có c2 (tier A) chống
   lưng; §2 đã sẵn có c4 (tier A). Không còn claim lõi nào đứng một mình trên tier B. Việc
   còn lại là *cấp course*: nếu có ngân sách research, xin A1 bổ sung một nguồn tier A cho bộ
   Toulmin để thay c3 — **không phải việc của B02.**
3. **Word count — KHÔNG có xung đột (phán quyết round 1, xác nhận lại bằng số round 2).**
   Raw body 5442 ≤ 5500 (ràng buộc cứng, `gates.py` enforce). Prose 5049 vs outline 5000 =
   +1.0%. Chênh 393 từ vẫn đúng bằng lượng metadata trong `{!IMG}` + `{!CHECK}`.
   **Đề nghị cấp workflow vẫn còn nguyên giá trị** (ghi rõ đơn vị đo vào outline template +
   cho `gates.py` in cả hai con số) để B03-B20 khỏi lặp lại câu hỏi này.

---

## Findings còn lại — 3 mục, KHÔNG mục nào block

### [R1] STYLE — §1 dòng 138: "Loại thứ hai" bị mờ quy chiếu *(mới, sinh ra từ [P4])*

Mạch hiện tại:
- d.132: NASA → nói dối (loại lỗi 1)
- d.134: giá gạch ngang → lỗi ở cách suy (loại lỗi 2)
- d.136: *"…Bài này dùng **cách hiểu thứ hai**."*
- d.138: *"**Loại thứ hai** nguy hiểm hơn, và có một câu trên báo…"*

"Loại thứ hai" muốn trỏ về **loại lỗi** ở d.134, nhưng ngay câu trước vừa có "cách hiểu thứ
hai" — hai cụm "thứ hai" đứng sát nhau, người đọc dễ hiểu thành "cách hiểu thứ hai nguy hiểm
hơn", mà một *cách hiểu* thì không "nguy hiểm" được. Vấn đề này đã lấp ló ở bản cũ (câu cũ
kết bằng "vế thứ hai") nhưng [P4] làm nó rõ hơn.

**Fix 3 chữ:** d.138 → *"**Loại lỗi thứ hai — ngụy biện — mới là loại** nguy hiểm hơn, và có
một câu trên báo diễn tả chuyện đó gọn đến mức khó chịu."*
Chi phí +5 từ (còn 53 từ headroom). Không đụng citation.

### [R2] HANDOFF — intent CHECK#3 lệch giữa frontmatter d.21 và body d.313

Bản body có thêm đuôi *"(bám [v7]: phí vận chuyển và phụ phí phát sinh lúc thanh toán)"*,
bản frontmatter không có. **Reviser từ chối sửa là ĐÚNG** — brief cấm đụng `{!CHECK}`, và
tự ý sửa block ở round revise là rủi ro lớn hơn lợi ích.

Phán quyết: **chấp nhận, không block.** Regex của `gates.py` bắt bản **body**, nên gate không
sai. Nhưng đây là dữ liệu lệch thật, và NODE 6 cần biết đọc bản nào.
→ **Chuyển thành việc của NODE 6 Assemble:** lấy intent từ **body (d.313)** làm bản chuẩn,
đồng bộ ngược lên frontmatter khi assemble. Ghi vào handoff note, không cần quay lại Writer.

### [R3] CHẤP NHẬN — §0 dòng 72 vẫn là "**B01: Confirmation bias**"

**Phán quyết: chấp nhận được, giữ nguyên. Tôi giữ nguyên kết luận round 1, không đổi ý.**

Lý do đây không phải lỗi mà là convention chạy đúng:
- §0 là **lần đầu** B01 xuất hiện, và bài gọi bằng **title chính thức trong
  `course-outline.yaml`** ("Confirmation bias"), rồi gloss ngay trong cùng câu:
  *"…nói về **thiên kiến xác nhận (confirmation bias)**"* — đúng `technical_term_pattern`.
- §2 là lần nhắc **thứ hai**, và giờ dùng **tiếng Việt thuần** ("B01 — thiên kiến xác nhận")
  — đúng `first_introduction_only: true`.
- Tức là sau round 2, hai lần nhắc B01 tạo thành đúng cặp mà style-guide mô tả: lần đầu
  Việt-kèm-Anh, lần sau Việt thuần. **Sửa thêm §0 sẽ phá đúng cái pattern này.**

Việc duy nhất còn treo ở đây là **cấp course, không phải cấp bài**: `course-outline.yaml`
đang đặt title B01/B03 bằng tiếng Anh. B02 vừa tạo tiền lệ Việt-trước cho B03
(*"Tương quan ≠ Nhân quả (Correlation ≠ Causation)"*). **Cần PM chốt** có chuẩn hoá cách hiển
thị title cho cả 20 bài hay không — nếu có thì làm ở `course-outline.yaml`, không phải sửa
lẻ trong từng draft.

---

## Stopping decision

- **Round 2 = PASS** → **tiếp NODE 6 Assemble.** Không cần round 3.
- [R1] là fix tuỳ chọn 3 chữ: Writer có thể làm kèm lúc handoff, hoặc bỏ qua. Không block.
- [R2] chuyển thẳng cho NODE 6 (lấy intent bản body làm chuẩn).
- [R3] chuyển cho PM ở dạng quyết định cấp course; **không ảnh hưởng B02**.
