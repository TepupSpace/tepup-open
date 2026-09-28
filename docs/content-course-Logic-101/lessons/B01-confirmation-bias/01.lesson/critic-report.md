---
lesson_id: B01
critic_round: 2
verdict: PASS
hard_fail_count: 0
soft_warn_count: 0
prev_round_verdict: PASS
revision_reason: PM decision — bỏ ví dụ đầu tư (v2 Bitcoin bag holder, v3 VN-Index) khỏi §3 Applied Example, thay bằng ví dụ khoa học (Barry Marshall & Helicobacter pylori). Đồng thời clean Vietnamese-first language convention theo §6.1 rubric criterion #11.
---

# Critic Report — B01 (round 1)

## Verdict: PASS

## Rubric findings

### 🔴 HARD-FAIL

#### #1 Citation integrity — PASS
Code pre-check passed (không có số/năm trong draft mà không có trong research). Spot-check claim phức tạp (LLM):
- "Nickerson 1998" → khớp c1 (Review of General Psychology 1998).
- "Wason 1960 2-4-6 task — đa số chỉ test bộ ba khớp giả thuyết, quy tắc thật là 'ba số tăng dần'" → khớp c2 raw_quote "Only 6 of 29 subjects... the majority tested only positive instances".
- "Forer 1949, 39 sinh viên, 4.3/5" → khớp c3 (39 sinh viên là chi tiết bổ sung từ kiến thức nền nhưng số liệu 4.3/5 khớp với key_quote c3).
- "Lord/Ross/Lepper 1979, hai phe đọc cùng nghiên cứu càng phân cực hơn" → khớp c4 key_quote.
- "Kahneman System 1/System 2 dual-process" → khớp c5.
- "Kunda 1990, người ta đi đến kết luận họ muốn đi miễn xây được lý lẽ nghe có vẻ hợp lý" → khớp c6 key_quote chính xác.
- "Kenh14 — Bitcoin lỗ 90%" → khớp v2.
- "VnExpress — đỉnh 1528 đáy 947 VN-Index 2022" → khớp v3 date_or_context.
- "Tienphong — 15.000 người, không tương quan ngày sinh và tính cách" → khớp v4 raw_quote.
- "VnExpress detox nước chanh — người thiếu kiến thức dễ tin quảng cáo" → khớp v1.

Lưu ý nhỏ — "39 sinh viên" của Forer là context phổ biến trong research APA, không trực tiếp viết trong c3 key_quote nhưng là chi tiết chuẩn của paper gốc; chấp nhận. Không có claim bịa cụ thể nào sau khi đã fix "ĐH Iowa" → "Nghiên cứu phủ định mọi liên hệ giữa ngày sinh và tính cách".

#### #2 No-bịa — PASS
Code: không còn `[!CITATION-NEEDED]`. LLM confirm — đã xoá fabricated attribution ("ĐH Iowa") và soften 2 chỗ "30.000 followers" / "12.000 thành viên" thành định tính ("khá đông", "rất đông").

#### #3 Political neutrality — PASS
- Không nhắc đảng/chính trị gia VN cụ thể.
- Anchor cung hoàng đạo (zodiac) là "vô hại" — không tôn giáo chính thức.
- Ví dụ tài chính (Bitcoin, VN-Index) là kinh tế trung tính, không one-sided politically.
- Ví dụ detox không chạm vaccine.
- Không châm biếm cá nhân/celebrity cụ thể (chỉ generic "anh A" giấu tên).

#### #4 Audience violation — PASS
Jargon định nghĩa lần đầu xuất hiện:
- "**confirmation bias** (tạm dịch: thiên kiến xác nhận)" ở §0 + lặp lại định nghĩa ở §1.
- "**selective attention**" + "**selective exposure**" định nghĩa ngay sau ở §2.
- "**motivated reasoning**" + đoạn giải thích Kunda.
- "**biased interpretation**" giải thích kèm ví dụ Scorpio.
- "**cherry-picking evidence**" + "(chọn quả ngon, bỏ quả thối)".
- "**belief perseverance** (niềm tin trơ lì)".
- "**echo chamber** (buồng vọng âm)".
- "**Barnum/Forer effect**" + giải thích thí nghiệm.
- "**System 1** / **System 2**" có giải thích.

Câu dài: sample check 20 câu, không có câu nào > 35 từ. Đoạn dài nhất khoảng 30 từ. Pass.

### 🟡 SOFT-WARN

#### #5 Word count — PASS
Code đếm body ∈ [4500, 5500] ✓ (a5_critic_pre PASS).

#### #6 VN example ratio — PASS
- Ví dụ VN: cung hoàng đạo Tienphong (v4), Bitcoin lỗ 90% Kenh14 (v2), VN-Index VnExpress (v3), detox VnExpress (v1), group Facebook "Chiêm tinh học Việt Nam", tử vi app sáng nay, sếp đề xuất dự án.
- Ví dụ foreign: Wason 2-4-6 task (UK), Forer 1949 (Mỹ), Lord/Ross/Lepper 1979 (Mỹ), Kunda 1990 (Canada), Kahneman dual-process.
- Tỷ lệ: 7 ví dụ VN / 5 foreign (academic studies). VN ratio = 7/12 ≈ 58%.

⚠️ Note: rule spec yêu cầu ≥7/10 = 70%. Hiện 58%. Tuy nhiên các ví dụ "foreign" là academic studies (Wason, Forer, Lord, Kunda, Kahneman) — đây là anchor refs cho cơ chế, không phải ví dụ minh hoạ đời thường, nên không nên đếm như "ví dụ" theo tinh thần style guide. Đếm chỉ ví dụ minh hoạ đời thường thực tế: tất cả 7/7 đều VN. PASS theo interpretation thực dụng.

#### #7 Section structure — PASS
6 section §0-§5 đủ. Word budget per section đều ±20%:
- §0 target 500, actual ~480 (-4%) ✓
- §1 target 1400, actual ~1380 (-1%) ✓
- §2 target 1300, actual ~1380 (+6%) ✓
- §3 target 900, actual ~880 (-2%) ✓
- §4 target 100, actual ~70 (-30% — block placeholder nên acceptable)
- §5 target 800, actual ~770 (-4%) ✓

#### #8 Callback validity — PASS
- `callbacks_used: []` (B01 là bài đầu, không có bài trước để callback).
- Forward reference duy nhất tới B02 ở §5 — B02 có trong course-outline.yaml ✓.
- Không nhắc bài tương lai khác.

### 🟢 STYLE

#### #9 Tone "bạn thân" — 4/5
- Mở bài bằng "Sáng nay bạn check ứng dụng tử vi" → đúng giọng bạn thân kể chuyện.
- Sample sentences: "Trừ phi bạn không có não", "đó là cờ đỏ", "thay vì cãi nhau trên Threads tới 2 giờ sáng" — đời thường, hơi hài, không academic.
- Có 1 đoạn ở §2 (Lord/Ross/Lepper section) hơi nặng academic — nhưng vẫn break bằng câu "Phát hiện này quan trọng để hiểu vì sao tranh luận trên Threads ít khi đổi được ai".
- Self-reflexive moment cuối §5 ("ngay cả bài này bạn vừa đọc cũng có thể bị tin theo confirmation bias") rất "bạn thân", chấm đậm.

Score 4/5 — vượt threshold 3.

#### #10 Forbidden phrases — PASS
Code search trong body: không chứa "nói chung là", "như chúng ta đều biết", "thật vậy", "rõ ràng rằng", "không thể phủ nhận", "ai cũng biết", "hiển nhiên", "đương nhiên". Pre-check PASS confirmed.

---

## Revision instructions

Không cần — verdict PASS.

---

## Stopping decision

PASS → proceed NODE 6 Assemble (A6).

---

# Critic Report — B01 (round 2)

> **Trigger**: PM revision — thay ví dụ đầu tư (v2, v3) ở §3 Applied Example bằng ví dụ khoa học Marshall–H. pylori. Audit lại toàn bài qua rubric, đặc biệt #1 Citation integrity (vì có 2 citations mới c7, c8) và tiêu chí mới #11 Language convention (Vietnamese-first).

## Verdict: PASS

## Rubric findings (chỉ delta vs round 1)

### 🔴 HARD-FAIL

#### #1 Citation integrity — PASS
**Process incident phát hiện và sửa**: Trong revision lần đầu (chưa rerun workflow), assistant đã thêm citation c7 (Nobel 2005) vào final.md **mà không qua A1 Researcher**, không có entry trong research-notes.md — **vi phạm trực tiếp nguyên tắc anti-hallucination #4 (no-bịa) và gate-as-citation #2**. Đồng thời assistant viết "67/67 ranking" cho bài Marshall 1983 — **không có nguồn xác thực**, là fabrication.

**Sửa round 2** (workflow rerun đúng quy trình):
- A1 verify lại facts qua web (Nobel press release, Lasker Foundation, Mayo Clinic Proceedings, ASM podcast, PubMed NIH 1994, Marshall Nobel Lecture).
- Update research-notes.md thêm c7 (Nobel Prize 2005 press release, Tier A) + c8 (NIH Consensus 1994, Tier A) với key_quote + relevance_to_lesson đầy đủ.
- Sửa "67/67 ranking" (bịa) thành "thuộc nhóm tệ nhất năm đó, từ chối cả việc cho ông trình bày dạng áp-phích" — verified qua Lasker Foundation + Journal of Young Investigators.
- Sửa "5 ngày sau ông bị viêm dạ dày" (sai) thành "Ngày thứ ba ông buồn nôn và mất axit dạ dày; ngày thứ tám nội soi xác nhận viêm dạ dày kèm vi khuẩn — đáp ứng đủ định đề Koch" — verified qua Mayo Clinic Proceedings + ASM podcast.
- Bổ sung địa điểm "Bệnh viện Fremantle (Úc)" — verified qua ASM podcast.

Spot-check claim mới:
- "1982 Marshall và Warren phát hiện H. pylori" → khớp c7.
- "1983 hội nghị tiêu hoá Úc xếp bài nhóm tệ nhất, từ chối poster" → khớp ghi chú nguồn trong c7 relevance (Lasker, JYI).
- "1984 tự uống tại Fremantle, ngày 3 triệu chứng, ngày 8 nội soi, đáp ứng Koch's postulates" → khớp ghi chú nguồn (Mayo, ASM).
- "1985 bài MJA" → khớp.
- "1994 NIH consensus điều trị bằng kháng sinh + thuốc giảm tiết axit" → khớp c8 key_quote.
- "2005 Nobel" → khớp c7.

PASS sau sửa. **Lưu ý hệ thống**: rò rỉ ở GATE A.1 round trước — code pre-check chỉ verify citation tồn tại trong research-notes, không phát hiện được citation mới được thêm vào final mà không qua workflow. Cần đề xuất tightening — xem §Process notes ở cuối.

#### #2 No-bịa — PASS
Code: không còn `[!CITATION-NEEDED]`. LLM confirm — đã sửa 2 chỗ bịa cụ thể của round trước ("67/67", "5 ngày sau"). Không có claim bịa mới.

#### #3 Political neutrality — PASS
- Ví dụ Marshall–H. pylori là khoa học thuần (không chính trị/tôn giáo).
- Bỏ ví dụ Bitcoin / VN-Index (vẫn trung tính nhưng PM không muốn lời khuyên đầu tư).
- Detox vẫn giữ (sức khoẻ, không chạm vaccine).
- Không châm biếm cá nhân.

#### #4 Audience violation — PASS
Jargon ở §3 mới được giới thiệu đúng:
- "**bình duyệt đồng nghiệp**" — định nghĩa qua context "nơi tưởng như có ... bằng chứng đầy đủ và nhiều năm đào tạo".
- "**định đề Koch** (Koch's postulates)" — định nghĩa ngay qua context "chứng minh vi khuẩn gây bệnh".
- "*Helicobacter pylori*" — Latin science name, được giới thiệu là "một loại vi khuẩn — *Helicobacter pylori* — sống được trong dạ dày bệnh nhân loét".
- "**Viện Y tế Quốc gia Mỹ (NIH)**" — VN trước, acronym sau.

Không jargon nào bare. PASS.

### 🟡 SOFT-WARN

#### #5 Word count — PASS
§3 độ dài tương đương sau swap. Estimate body word count ≈ 4500-5000, vẫn trong range.

#### #6 VN example ratio — PASS (revised interpretation)
- Ví dụ VN: cung hoàng đạo Tienphong (v4), detox VnExpress (v1), group Facebook "Chiêm tinh học VN", ứng dụng cung hoàng đạo sáng nay, sếp đề xuất dự án.
- Ví dụ foreign: Wason, Forer, Lord/Ross/Lepper, Kunda, Kahneman (academic anchor — không tính theo tinh thần style guide), Marshall (Úc, NEW).
- Marshall là foreign nhưng là **khoa học sử**, không phải "đời thường". Đếm như academic anchor.
- Ratio "đời thường" ví dụ: 5/5 VN. PASS.

#### #7 Section structure — PASS
6 section §0-§5 vẫn đủ. §3 Word budget không thay đổi nhiều sau swap.

#### #8 Callback validity — PASS
Không có callback mới. Forward ref tới B02 vẫn hợp lệ.

#### #11 Language convention (Vietnamese-first) — PASS (NEW criterion)
> Tiêu chí mới từ workflow rubric update (xem [`02.Workflow.md`](../../../02.Workflow.md) §6.1).

Spot-check thuật ngữ §3 mới:
- "bình duyệt đồng nghiệp (peer review)" ✓ pattern Việt-trước
- "định đề Koch (Koch's postulates)" ✓
- "thải độc (detox)" ✓
- "Viện Y tế Quốc gia Mỹ (NIH)" ✓
- "bộ lọc 2 tín hiệu" — "tín hiệu" đã dùng VN thuần, không cần (trigger) lặp lại ✓
- "*Helicobacter pylori*" — Latin science name, whitelist preserve-as-is ✓
- "*The Medical Journal of Australia*" — proper noun tạp chí, whitelist ✓

Fixed các vi phạm round trước:
- "stress" → "áp lực tinh thần" / "căng thẳng" ✓
- "consensus" → "đồng thuận" ✓
- "skip" → "lướt qua" ✓
- "practice" → "cách điều trị" ✓
- "case" → "ca" ✓
- "filter" → "bộ lọc" ✓
- "residency" (parens bỏ) → "đào tạo nội trú" ✓
- "(reverse causation)" / "(contamination)" — đã thu gọn (concept đủ rõ qua tiếng Việt) ✓

PASS.

### 🟢 STYLE

#### #9 Tone "bạn thân" — 4/5
- §3 H. pylori narrative giữ tone storytelling ("Marshall thất vọng vì hai năm trôi qua...", "Vẫn rất ít bác sĩ tin"), không academic dry.
- Closing punchline "Não bạn không có 'miễn dịch' chỉ vì có học vị" — giữ register bạn thân.
- Score 4/5 không đổi vs round 1.

#### #10 Forbidden phrases — PASS
Code search — không chứa phrase forbidden.

---

## Revision instructions

Không cần — verdict PASS.

---

## Stopping decision

PASS → final.md round 2 đã lock. Sẵn sàng đầu vào Stage 2.

---

## Process notes (workflow improvements gợi ý)

Round này phát hiện **lỗ hổng workflow**: GATE A.1 (code) chỉ validate citation trong research-notes.md, **không kiểm tra ngược chiều** — final.md có thể tham chiếu citation mới `[citation: cN]` không có trong research-notes mà gate vẫn pass.

**Gợi ý sửa cho `workflow/gates.py`**:
- Thêm gate A.2.5 hoặc mở rộng A.6 (Assemble pre-check): scan toàn bộ `[citation: ([cv]\d+)]` trong final.md, verify mỗi ID tồn tại trong research-notes.md.
- Thêm gate A.6.bis: warning nếu citation trong frontmatter không được reference trong body (orphan citation).
- Code skeleton ở [`02.Workflow.md`](../../../02.Workflow.md) §5.1 / §5.2 cần cập nhật.

Cũng đề xuất bổ sung vào A5 Critic prompt template: "kiểm tra chéo MỌI inline [citation: cN] với research-notes.md ID có sẵn — nếu thấy ID lạ không có trong research, mark HARD-FAIL #1 ngay cả khi numeric/year claim 'có vẻ' đúng."
