# Guideline: Cấu trúc nội dung bài học

Mọi bài học trên Tepup phải tuân theo cấu trúc **Mở - Thân - Kết** dưới đây. Đây là tiêu chuẩn bắt buộc khi tạo mới hoặc chỉnh sửa nội dung khoá học.

## Cấu trúc bài học

### MỞ (Opening)

| # | Block type | Mô tả |
|---|-----------|-------|
| 1 | `question` (gợi mở) | **Đặt ở trên cùng.** Câu hỏi bias/misconception — hỏi điều người học **thường trả lời sai** nếu chưa học bài này. Phần `explanation` của câu hỏi này phải là **câu mô tả dẫn nhập** sang nội dung bài học (block tiếp theo), không chỉ giải thích đáp án |
| 2 | `text` (intro) | "Trong bài học này..." — mục tiêu bài học + tại sao kiến thức này quan trọng |
| 3 | `callout` (info) | Câu hỏi trung tâm của bài — câu hỏi lớn mà bài học sẽ trả lời |

### THÂN (Body)

| # | Block type | Mô tả |
|---|-----------|-------|
| 4 | `text` (body1) | Nội dung chính phần 1. **Có thể chia thành nhiều block text** nếu nội dung dài — đừng nén quá nhiều ý vào một block |
| 4.1 | `text` / **block giải thích** (optional) | Tiếp tục nội dung phần 1. Chỗ nào mô phỏng dễ hiểu hơn chữ thì **thay đoạn text bằng block giải thích** (xem §"Block giải thích") |
| 4.n | `text` / **block giải thích** (optional) | Chunking thêm nếu cần — đảm bảo đủ ý, không compress |
| 4.Q | **block câu hỏi** (**checkpoint**) | **BẮT BUỘC.** Chốt lại ý chính phần 1. Chọn bất kỳ type nào trong nhóm câu hỏi. Xem §"Checkpoint" |
| 5 | `callout` (info/warning) | Khái niệm quan trọng hoặc lưu ý cần nhấn mạnh |
| 6 | `text` (body2) | Nội dung chính phần 2. **Tương tự phần 1, có thể chia nhiều block** |
| 6.1 | `text` / **block giải thích** (optional) | Tiếp tục nội dung phần 2 nếu cần |
| 6.n | `text` / **block giải thích** (optional) | Chunking thêm nếu cần |
| 6.Q | **block câu hỏi** (**checkpoint**) | **BẮT BUỘC.** Chốt lại ý chính phần 2 |
| 7 | `library-document` | Đọc thêm (mode: `inline`) — mở rộng kiến thức, trích dẫn nguồn |

> Bài dài có nhiều hơn 2 ý chính thì lặp lại mẫu `nội dung… → checkpoint` cho **từng** ý — không giới hạn ở 2.

### KẾT (Closing)

| # | Block type | Mô tả |
|---|-----------|-------|
| 8 | `callout` (success) | Tóm tắt "Bạn đã học được gì?" — liệt kê các điểm chính bằng ✓ |
| 9 | `text` (conclusion) | Kết luận + dẫn dắt sang bài tiếp theo |

## Hai nhóm block tương tác

Block tương tác chia làm 2 nhóm với vai trò khác hẳn nhau. Trong admin editor (menu `/`), chúng nằm ở 2 nhóm riêng: **Câu hỏi · checkpoint** và **Giải thích · mô phỏng**.

| Nhóm | Vai trò | Có đúng/sai? | Vị trí |
|---|---|---|---|
| **Câu hỏi** | Kiểm tra — gợi mở đầu bài, checkpoint sau mỗi ý | Có | Sau phần nội dung của một ý (hoặc đầu bài) |
| **Giải thích** | Minh hoạ — thay một đoạn text bằng mô phỏng | Không | **Bên trong** phần nội dung của một ý |

### Checkpoint — block câu hỏi (BẮT BUỘC)

**Quy tắc: mỗi ý chính của bài phải có ít nhất 1 block thuộc nhóm câu hỏi, đặt ngay sau phần nội dung của ý đó.** Không bắt buộc phải là `question` — có thể mix các type trong nhóm (`pair-match`, `sort-bucket`, `bias-detector`, `perspective-switch`, `hot-cold-guess`…) để bài đỡ đơn điệu.

Mục đích là **nhắc lại và củng cố** (reminds user học), không phải đánh đố. Bài có 6 ý chính thì có 6 checkpoint.

| Yêu cầu | Chi tiết |
|---|---|
| Vị trí | Ngay sau block nội dung cuối cùng của ý chính đó — không dồn hết xuống cuối bài |
| Nội dung | Kiểm tra **đúng ý vừa đọc**, không hỏi kiến thức chưa dạy hoặc kiến thức từ bài khác |
| Chọn type | Chọn type khớp với dạng kiến thức: phân biệt khái niệm → `sort-bucket`; khái niệm ↔ định nghĩa → `pair-match`; ước lượng con số → `hot-cold-guess`; nhận diện thiên lệch → `bias-detector`; một sự kiện nhiều bên → `perspective-switch`; còn lại → `question` |
| Riêng `question` | 4 option (3 nhiễu + 1 đúng), nhiễu phải hợp lý. `explanation` giải thích **vì sao đáp án đúng đúng**, và nếu được thì vì sao các nhiễu sai — đây là nơi dạy thêm, không chỉ chấm điểm |

**Phân biệt với câu gợi mở ở đầu bài:** câu gợi mở khai thác misconception **trước khi** học và người học *nên* trả lời sai; checkpoint kiểm tra kiến thức **vừa** học và người học *nên* trả lời đúng. Hai loại này không thay thế nhau — một bài cần cả hai.

### Block giải thích — mô phỏng (OPTIONAL)

Block giải thích (`flip-card`, `calculator`, `slider-simulator`, `budget-allocator`) **không phải câu hỏi** và **không tính là checkpoint**. Nó là một phần của nội dung chính: khi một ý dễ hiểu hơn nếu người học tự kéo, tự bấm, tự thấy kết quả thay đổi, hãy **thay đoạn text mô tả ý đó** bằng block giải thích.

- Đặt ở vị trí mà đoạn text đó lẽ ra nằm — giữa các block text của ý chính, trước checkpoint.
- Giữ lại 1-2 câu text dẫn vào ("Thử kéo thanh trượt để thấy…") và/hoặc 1 câu chốt sau đó — không để block đứng trơ trọi.
- Dùng khi mô phỏng thật sự giải thích tốt hơn chữ — không nhét cho đủ số lượng.

Danh sách sẽ được mở rộng dần. Khi cần một dạng tương tác chưa có, cân nhắc bổ sung block type mới vào code (xem cảnh báo bên dưới) thay vì dùng tạm một type không khớp ngữ nghĩa.

## Quy tắc quan trọng

- **Đủ ý, không compress**: Phần text body có thể dài — hãy chia thành nhiều block text thay vì nhồi nhét vào một block. Mỗi block text nên tập trung vào 1-2 ý chính.
- **Checkpoint cho mọi ý chính**: Mỗi ý chính = ít nhất 1 block thuộc nhóm câu hỏi. Bắt buộc. Nên mix nhiều type thay vì toàn `question`.
- **Block giải thích: 0-2/bài, optional**: Chỉ dùng khi mô phỏng giải thích tốt hơn chữ, và đặt thay cho đoạn text trong nội dung chính. Bài không có block giải thích nào vẫn hợp lệ. Trần 2 cái để không loãng nội dung.
- **Chỉ dùng type đã triển khai** (xem cảnh báo ở §"Danh sách block types") — dùng type chưa triển khai thì block biến mất im lặng.
- **Question gợi mở**: Đặt ở **trên cùng** bài học. Phải khai thác bias/misconception — không phải câu hỏi kiểm tra kiến thức. Phần `explanation` phải dẫn nhập tự nhiên sang nội dung bài học.
- **Tiếng Việt**: Giữ nguyên dấu tiếng Việt. Viết dễ hiểu, tránh thuật ngữ phức tạp không cần thiết.
- **Giọng văn**: Khách quan, trung lập. Không tuyên truyền một chiều.
- **Trích dẫn**: Nêu nguồn rõ ràng khi sử dụng số liệu hoặc sự kiện.

## Danh sách block types

### Block cơ bản
| Type | Mô tả |
|------|-------|
| `text` | Nội dung văn bản — title + paragraphs[] |
| `callout` | Hộp nhấn mạnh — variant: `info` / `warning` / `success` |
| `image` | Hình minh họa — src, alt, caption |
| `library-document` | Tài liệu đọc thêm — mode: `inline` / `reference` |

### Block tương tác

> ⚠️ **CẢNH BÁO — chỉ các type có trong `INTERACTIVE_BLOCK_MAP` mới hiển thị được.**
>
> `components/learn/BlockRenderer.tsx` chỉ map các type liệt kê bên dưới. Mọi type khác rơi vào `return null` — block **biến mất im lặng** trên trang học: không lỗi, không cảnh báo, người học chỉ đơn giản là không thấy gì.
>
> Đây không phải rủi ro lý thuyết. Trên staging, `logic-101` bài B02/B03/B04 đang dùng `argument-mapper`, `fact-or-opinion`, `correlation-causation`, `cause-effect-chain`, `stat-trick` — **tất cả đều vô hình**, mỗi bài mất 2 block mà không ai biết.
>
> **Trước khi dùng một interactive type, kiểm tra nó có trong `INTERACTIVE_BLOCK_MAP` không.** Muốn dùng type chưa có: phải viết component + đăng ký vào map + thêm interface vào `lib/types/content.ts` + xếp nó vào một nhóm trong `components/admin/editor/block-utils.ts` (`group: 'question' | 'explainer'`).

**Nhóm câu hỏi — dùng cho checkpoint / gợi mở:**

| Type | Mô tả | Ví dụ sử dụng |
|------|-------|---------------|
| `question` | Trắc nghiệm — options[], explanation | Mọi loại kiến thức |
| `pair-match` | Nối cặp | Khái niệm ↔ định nghĩa |
| `sort-bucket` | Phân loại thẻ vào rổ | Thuế trực thu / gián thu |
| `bias-detector` | Phát hiện thiên lệch truyền thông | Phân tích bài báo |
| `perspective-switch` | Chuyển đổi góc nhìn | Sự kiện từ nhiều bên |
| `hot-cold-guess` | Đoán số với gợi ý nóng/lạnh | GDP, tỷ lệ thuế |

**Nhóm giải thích — mô phỏng, thay đoạn text:**

| Type | Mô tả | Ví dụ sử dụng |
|------|-------|---------------|
| `flip-card` | Lật thẻ — mặt trước khái niệm, mặt sau giải thích | Trình bày 3-4 khái niệm song song |
| `calculator` | Máy tính tương tác | Tính thuế TNCN, lãi kép |
| `slider-simulator` | Mô phỏng kéo thanh trượt | Đường cong Laffer, lạm phát |
| `budget-allocator` | Phân bổ ngân sách | Chi tiêu công |

**Tùy chỉnh:** `custom` — block tự tạo qua Sandpack (admin studio), khi các type trên không khớp. Có thể đóng vai câu hỏi hoặc giải thích tuỳ nội dung.

**CHƯA triển khai — dùng là block biến mất:**

`stat-trick` · `propaganda-detector` · `redacted-document` · `debate-arena` · `argument-mapper` · `fact-or-opinion` · `decision-tree` · `prisoner-dilemma` · `policy-lab` · `source-ranker` · `correlation-causation` · `timeline-sorter` · `cause-effect-chain` · `spectrum-placer`

**Chưa có block nhập text tự do.** `question` chỉ hỗ trợ trắc nghiệm, và `UserProgress` chỉ lưu `completed` + `score` ở cấp bài — không lưu câu trả lời từng block. Nếu spec bài học yêu cầu "free-text response", phải hạ spec hoặc viết block type mới trước.

## Ví dụ tham khảo

- Script mẫu: `tepup/scripts/add-thue101v2-course.ts` (11 bài, đầy đủ Mở-Thân-Kết + interactive blocks)
- Block demo: `/contributor-guide/block-demo` (xem tất cả interactive blocks)
- Type definitions: `tepup/lib/types/content.ts`
