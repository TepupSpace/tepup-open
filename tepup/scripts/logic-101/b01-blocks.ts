/**
 * B01 — "Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy"
 *
 * Content source: docs/content-course-Logic-101/lessons/B01-confirmation-bias/01.lesson/final.md
 * Checkpoint questions: .../02.practice/practice-final.md (q1, q2, q3, q4, q5, q10)
 *
 * Structure follows docs/(key-doc)-cấu-trúc-một-bài-học.md:
 *   MỞ    — question (gợi mở) → text (intro) → callout (câu hỏi trung tâm)
 *   THÂN  — mỗi ý chính: text… → question checkpoint (practice loại 1, BẮT BUỘC)
 *   KẾT   — callout (success) → text (conclusion)
 *
 * 6 ý chính → 6 checkpoint. 2 interactive block (practice loại 2, đúng trần cho phép).
 *
 * `[citation: cN]` markers from final.md are rendered as inline source attributions in
 * prose; the underlying papers are surfaced as `library-document` reference blocks.
 */

import type { ContentBlock } from '../../lib/types/content';

/**
 * The bias-detector renderer slices `article.text` with `startIndex`
 * (`text.slice(lastIndex, seg.startIndex)`), so every offset must be the exact
 * character position of `seg.text` inside the article. Hardcoding those numbers
 * is a silent-corruption hazard the moment anyone edits a word of the article,
 * so they are derived here and verified instead.
 */
function withOffsets(
  article: string,
  segments: { id: string; text: string; biasType: string; explanation: string }[]
) {
  let cursor = 0;
  return segments.map((seg) => {
    const startIndex = article.indexOf(seg.text, cursor);
    if (startIndex === -1) {
      throw new Error(`bias-detector segment "${seg.id}" not found in article text: ${seg.text.slice(0, 40)}…`);
    }
    cursor = startIndex + seg.text.length;
    return { ...seg, startIndex };
  });
}

const B01_ARTICLE =
  'Mình đầu tư vào khoá học "tự do tài chính trong 12 tháng" và thật sự đổi đời. ' +
  'Anh T trong nhóm học cùng khoá mình, sau 8 tháng đã bỏ việc văn phòng và giờ thu nhập gấp 3. ' +
  'Cả nhóm 2000 người ai cũng xác nhận phương pháp này hiệu quả, không thấy ai than phiền cả. ' +
  'Có mấy bài báo nói mô hình này rủi ro, nhưng mình nghĩ báo chí thì lúc nào chẳng tiêu cực, họ có đi học đâu mà biết. ' +
  'Ai chưa thành công thì đơn giản là chưa đủ quyết tâm thôi.';

export interface B01Deps {
  /** slug → LibraryDocument.id, resolved against the target DB at seed time. */
  libraryDocId: (slug: string) => string;
  /** Public URLs for the two illustrations. */
  images: { hero: string; loopDiagram: string };
}

export function buildB01Blocks({ libraryDocId, images }: B01Deps): ContentBlock[] {
  return [
    // ─────────────────────────────────────────────────────────────
    // MỞ
    // ─────────────────────────────────────────────────────────────
    {
      type: 'question',
      question:
        'Theo bạn, ai là người dễ mắc thiên kiến xác nhận (confirmation bias) nhất — tức là chỉ nhìn thấy thông tin khớp với điều mình đã tin sẵn?',
      options: [
        { id: 'a', text: 'Người ít học, thiếu kiến thức nền để kiểm chứng thông tin.', isCorrect: false },
        { id: 'b', text: 'Người hay tin vào tâm linh, bói toán, các thuyết chưa được kiểm chứng.', isCorrect: false },
        { id: 'c', text: 'Tất cả mọi người — kể cả nhà khoa học, bác sĩ, và chính bạn.', isCorrect: true },
        { id: 'd', text: 'Người có cảm xúc mạnh, dễ bị chi phối khi tranh luận.', isCorrect: false },
      ],
      explanation:
        'Đáp án là "tất cả mọi người" — và nếu bạn vừa chọn một đáp án khác, đó chính là thiên kiến xác nhận đang chạy: ai cũng muốn tin mình thuộc nhóm "tỉnh táo hơn". Thiên kiến xác nhận không phải dấu hiệu của thiếu thông minh hay thiếu học vấn. Nó là một vòng lặp chạy tự động trong mọi bộ não, kể cả não của các nhà khoa học nhiều chục năm kinh nghiệm — bài này sẽ cho bạn thấy chính xác nó chạy như thế nào.',
    },
    {
      type: 'text',
      title: 'Trong bài học này',
      paragraphs: [
        'Bài này sẽ làm ba việc. Một, bóc tách cách thiên kiến xác nhận hoạt động qua một vòng lặp 3 giai đoạn — dùng ví dụ cung hoàng đạo, vì nó sạch và "vô hại". Hai, chỉ ra các kiểu nhỏ (sub-type) cụ thể: suy luận có động cơ (motivated reasoning), diễn giải lệch (biased interpretation), chọn quả ngon bỏ quả thối (cherry-picking), niềm tin trơ lì (belief perseverance), buồng vọng âm (echo chamber). Ba, đưa bạn một bộ lọc 2 tín hiệu (trigger) ngắn gọn để biết khi nào cần tạm dừng — và áp dụng nó lên những thứ có rủi ro thật (stake) như tiền tiết kiệm hay sức khoẻ.',
        'Vì sao điều này quan trọng: bạn không thể "chữa khỏi" thiên kiến xác nhận. Não vẫn sẽ chạy nó mỗi ngày, mỗi giờ, kể cả lúc bạn đang gõ bình luận phản bác bài viết này. Cái duy nhất bạn có thể làm là nhận diện lúc nó đang chạy mạnh — để bấm tạm dừng vừa đủ trước những quyết định quan trọng.',
      ],
    },
    {
      type: 'callout',
      variant: 'info',
      icon: 'help-circle',
      title: 'Câu hỏi trung tâm của bài',
      text: 'Vì sao một mô tả "sai về mặt khoa học" lại có cảm giác "đúng cá nhân" với hàng triệu người? Và vì sao ngay cả khi bạn vừa đọc xong nghiên cứu phủ định, bạn vẫn tin?',
    },

    // ─────────────────────────────────────────────────────────────
    // §0. Hook
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Sáng nay, cung hoàng đạo đoán đúng',
      paragraphs: [
        'Sáng nay bạn kiểm tra ứng dụng cung hoàng đạo. Cung Bọ Cạp được mô tả "tuần này sẽ gặp cơ hội bất ngờ trong công việc — chuẩn bị tinh thần". Bạn chụp màn hình, vì cảm giác "đúng quá". Chiều, sếp gọi bạn vào phòng họp và đề xuất bạn dẫn dắt một dự án mới. Bạn thầm gật đầu: "Cung hoàng đạo đúng thật."',
        'Một câu chuyện rất phổ biến. Nhưng có một thống kê đáng để dừng lại.',
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      icon: 'bar-chart',
      title: '15.000 người, không một mối tương quan nào',
      text: 'Một nghiên cứu phân tích dữ liệu của hơn 15.000 người, đối chiếu ngày sinh với tính cách, không tìm thấy mối tương quan nào giữa cung hoàng đạo và đặc điểm cá nhân. Nói cách khác, về mặt thống kê, mô tả Bọ Cạp "sâu sắc, đam mê, hay ghen tuông" không khớp với người sinh trong khoảng đó hơn một cách ngẫu nhiên. Khớp với người sinh tháng Một, tháng Sáu, tháng Mười Một cũng tương đương. (Nguồn: Tiền Phong)',
    },
    {
      type: 'image',
      src: images.hero,
      alt: 'Minh hoạ thiên kiến xác nhận: các bài viết khớp niềm tin hiện rõ ở lớp trên, các bài viết ngược chiều mờ dần ở lớp dưới',
      caption:
        'Cùng một bảng tin, hai lớp thông tin: cái khớp niềm tin nổi lên rõ ràng, cái ngược chiều mờ đi — dù cả hai đều ở đó.',
    },
    {
      type: 'text',
      paragraphs: [
        'Nhưng bạn vẫn thấy "đúng với mình ghê". Và bạn cảm nhận điều đó thật — không phải đang giả vờ.',
        'Câu trả lời nằm ở một thứ gọi là **thiên kiến xác nhận** (confirmation bias) — cơ chế não bộ chạy tự động trong đầu mọi người, kể cả các nhà khoa học vài chục năm kinh nghiệm.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 1 — §1. Khái niệm cốt lõi
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Thiên kiến xác nhận là gì?',
      paragraphs: [
        '**Thiên kiến xác nhận** (confirmation bias) là **xu hướng não tự lọc thông tin để khớp với những gì bạn đã tin sẵn**. Định nghĩa này đến từ Raymond Nickerson, người tổng hợp toàn bộ nghiên cứu về hiện tượng này trong một bài tổng quan của tạp chí Review of General Psychology năm 1998.',
        'Nickerson dùng cụm từ "hiện tượng có mặt ở khắp nơi" (ubiquitous phenomenon) để mô tả phạm vi của nó. Không có lĩnh vực nào của đời sống tinh thần thoát khỏi nó: khoa học, chính trị, tôn giáo, đầu tư, tình yêu, kể cả cách bạn nhớ những gì xảy ra trong cuộc cãi nhau với người yêu hôm qua.',
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      icon: 'alert-triangle',
      title: 'Không phải một quyết định có ý thức',
      text: 'Thiên kiến xác nhận KHÔNG phải kiểu "tôi sẽ chỉ nghe người đồng ý với tôi". Nếu là quyết định có ý thức, bạn đã có thể "đổi quyết định". Nó là một quá trình chạy ngầm, trước khi bạn kịp suy nghĩ. Đến lúc bạn nhận ra, kết luận đã hình thành rồi — bạn chỉ thấy mình "đồng ý với điều mình đang đọc" mà không nhận ra mình đã đồng ý trước khi đọc.',
    },
    {
      type: 'text',
      title: 'Vòng lặp 3 giai đoạn',
      paragraphs: [
        '**Giai đoạn 1 — Nạp thông tin (Input).** Bạn chỉ chú ý tới thông tin "khớp" với niềm tin. Cùng một bảng tin Facebook, bạn dừng đọc bài "Scorpio sâu sắc" 30 giây, nhưng lướt qua bài "cung hoàng đạo vô căn cứ" trong 1 giây. Bạn không cố tình tránh — đầu bạn thấy bài kia "kém hấp dẫn" hơn. Đây là **chú ý chọn lọc** (selective attention) và **tiếp xúc chọn lọc** (selective exposure).',
        '**Giai đoạn 2 — Xử lý thông tin (Processing).** Ngay cả khi bằng chứng ngược chiều lọt vào não, bạn diễn giải lại theo hướng có lợi cho niềm tin. "Hôm nay Scorpio không huyền bí lắm" được giải thích bằng "vì Mercury đang nghịch hành", chứ không phải bằng "vì mô tả sai". Bạn xử lý bằng chứng theo cách giữ kết luận, không xét lại kết luận theo bằng chứng.',
        '**Giai đoạn 3 — Xuất ra (Output).** Bạn nhớ rõ những lần "cung hoàng đạo đúng" và quên những lần sai. Khi bị bạn bè phản bác, niềm tin của bạn không yếu đi — thậm chí có khi mạnh hơn. Đây gọi là **niềm tin trơ lì** (belief perseverance). Vòng lặp khép lại bằng cách thay đổi cả đầu vào cho lần sau: bạn theo dõi thêm 3 trang chiêm tinh nữa.',
        'Ba giai đoạn này nuôi lẫn nhau, tạo thành một vòng lặp tự củng cố. **Càng tin, càng lọc; càng lọc, càng tin.** Đó là lý do người mất 5 năm tin cung hoàng đạo rất khó "thoát" chỉ bằng một bài kiểm chứng, dù bài đó có 15.000 mẫu nghiên cứu.',
      ],
    },
    {
      type: 'text',
      title: 'Thí nghiệm 2-4-6 của Wason',
      paragraphs: [
        'Đến đây bạn có thể đang nghĩ: "Cái này chỉ xảy ra với người dễ tin." Lý do bạn nghĩ thế, trớ trêu thay, có thể chính là thiên kiến xác nhận đang chạy — bạn muốn tin mình thuộc loại "không dễ tin". Nhưng một thí nghiệm cổ điển của Peter Wason năm 1960 cho thấy ngay cả sinh viên đại học giỏi cũng mắc, ngay cả khi không có cảm xúc, không có rủi ro, không có ai đang theo dõi.',
        'Wason đưa cho mỗi sinh viên ba số "**2-4-6**" và bảo họ đoán quy tắc đằng sau. Sinh viên được phép kiểm tra giả thuyết bằng cách đề xuất các bộ ba số mới, và Wason sẽ nói "đúng" hoặc "sai". Đa số đoán quy tắc là "số chẵn tăng dần". Và họ kiểm tra bằng cách đề xuất: "4-6-8" → đúng. "10-12-14" → đúng. "20-22-24" → đúng. Vui vẻ kết luận: "Tôi đoán đúng rồi."',
        'Thực ra **quy tắc thật chỉ là "ba số tăng dần"** — bất kỳ ba số nào tăng. Để biết được, sinh viên phải thử các bộ ba phá giả thuyết: "1-2-3" hay "5-7-100". Nếu các bộ này cũng được "đúng", giả thuyết "số chẵn tăng dần" bị bác bỏ. Nhưng hầu như không sinh viên nào làm thế. Họ chỉ thử các bộ ba khẳng định giả thuyết — và càng thử, càng tự tin "tôi đúng".',
        'Đó chính là thiên kiến xác nhận trong phiên bản phòng thí nghiệm sạch nhất. Không có cảm xúc, không có chính trị, không có cung hoàng đạo. Nói cách khác, kể cả khi bạn nghĩ mình đang "kiểm tra" một giả thuyết, có khả năng cao bạn chỉ đang **xác nhận** nó.',
      ],
    },
    {
      type: 'text',
      title: 'Vì sao não làm vậy?',
      paragraphs: [
        'Daniel Kahneman gọi đó là sản phẩm của **Hệ thống 1** (System 1) — kiểu tư duy nhanh, tự động, vận hành không cần năng lượng. Kahneman phân biệt Hệ thống 1 (nhanh, không nỗ lực, dựa trên trực giác và nhận dạng mẫu) với **Hệ thống 2** (chậm, có chủ ý, tốn năng lượng, dùng logic chính thức).',
        'Tin "khớp" thì Hệ thống 1 vẫy tay cho qua — không cần Hệ thống 2 xử lý. Tin "không khớp" thì cần Hệ thống 2 huy động — và Hệ thống 2 thì... lười. Não con người tiến hoá để tiết kiệm calo, không phải để chính xác. Một quyết định "khớp giả thuyết có sẵn" tiết kiệm hơn nhiều một quyết định "đánh giá lại từ đầu".',
        'Thiên kiến xác nhận không phải lỗi của "người kém thông minh" — nó là vòng lặp 3 giai đoạn chạy tự động trong mọi não, kể cả của bạn.',
      ],
    },
    // CHECKPOINT 1 — ý chính: khái niệm + vòng lặp 3 giai đoạn
    {
      type: 'question',
      question:
        'Trong thí nghiệm 2-4-6, sinh viên đoán quy tắc là "số chẵn tăng dần" rồi lần lượt thử "4-6-8", "10-12-14", "20-22-24" — tất cả đều được trả lời "đúng". Sai lầm cốt lõi của họ là gì?',
      options: [
        {
          id: 'a',
          text: 'Họ chỉ thử các bộ ba khẳng định giả thuyết, không bao giờ thử bộ ba có thể phá giả thuyết.',
          isCorrect: true,
        },
        { id: 'b', text: 'Họ thử quá ít bộ ba số — nếu thử thêm 20 bộ nữa thì đã ra quy tắc đúng.', isCorrect: false },
        { id: 'c', text: 'Họ để cảm xúc và mong muốn thắng cuộc chi phối phán đoán.', isCorrect: false },
        { id: 'd', text: 'Họ không đủ kiến thức toán học để nhận ra quy tắc "ba số tăng dần".', isCorrect: false },
      ],
      explanation:
        'Đáp án A. Mọi bộ ba họ thử ("4-6-8", "10-12-14"…) đều là số chẵn tăng dần — nên câu trả lời luôn là "đúng", và mỗi lần "đúng" lại làm họ tự tin hơn. Nhưng một giả thuyết chỉ được kiểm tra thật khi bạn thử phá nó: "1-2-3" hoặc "5-7-100" cũng được trả lời "đúng", và điều đó lập tức bác bỏ "số chẵn tăng dần".\n\nB sai vì thử thêm 20 bộ số chẵn tăng dần nữa cũng không giúp gì — vấn đề là *loại* phép thử, không phải *số lượng*. C sai vì đây chính là điểm mấu chốt của thí nghiệm: không có cảm xúc, không rủi ro, không chính trị — mà não vẫn tự động tìm bằng chứng khẳng định. D sai vì quy tắc "ba số tăng dần" đơn giản hơn "số chẵn tăng dần"; vấn đề nằm ở cách kiểm tra, không phải trình độ toán.',
    },
    {
      type: 'library-document',
      mode: 'reference',
      documentId: libraryDocId('nickerson-1998-confirmation-bias'),
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 2 — §2. Giai đoạn 1: Nạp thông tin
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Giai đoạn 1 — Nạp thông tin: bạn nạp gì thì não tin cái đó',
      paragraphs: [
        'Chú ý chọn lọc và tiếp xúc chọn lọc là hai cơ chế của giai đoạn này. **Chú ý chọn lọc** là chú ý có chọn lọc trong cùng một dòng thông tin (cùng một bảng tin, bạn dừng ở bài này, lướt qua bài kia). **Tiếp xúc chọn lọc** là chủ động chọn trước nguồn thông tin (theo dõi trang nào, tải ứng dụng nào, vào nhóm nào).',
        'Ví dụ cụ thể: bạn theo dõi trang "Astrology Vietnam" trên Facebook và 3 tài khoản chiêm tinh trên Threads. Mỗi sáng bảng tin đẩy 5 bài về chiêm tinh. Bạn dừng đọc bài "Scorpio và cách yêu" trong 2 phút. Bạn lướt qua bài "Nghiên cứu phủ định mọi liên hệ giữa ngày sinh và tính cách" trong gần như tích tắc. Tuần sau, **thuật toán** học bạn thích nội dung nào — đẩy thêm bài chiêm tinh, ít bài phản biện. Đến tháng sau, bảng tin bạn gần như chỉ còn nội dung ủng hộ chiêm tinh. Đến năm sau, bạn nghĩ "ai cũng tin cung hoàng đạo mà" — vì trong môi trường thông tin của bạn, đúng là vậy.',
        'Quan trọng: thuật toán không **tạo** ra tiếp xúc chọn lọc. Người tự xây dựng tiếp xúc chọn lọc trước khi có thuật toán. Trước khi mạng xã hội có bảng tin tự động, người ta vẫn chọn đọc báo nào, mua tạp chí nào, vào hội nhóm ngoài đời nào. Thuật toán chỉ **khuếch đại** — tăng tốc và mở rộng quy mô của xu hướng có sẵn.',
      ],
    },
    // CHECKPOINT 2 — practice-final.md q1
    {
      type: 'question',
      question:
        'Linh follow 5 page astrology. Mỗi sáng feed đẩy 3 bài "Scorpio sẽ gặp may" — Linh dừng đọc kỹ; cùng feed có 1 bài "nghiên cứu 15.000 người phủ định cung hoàng đạo" — Linh lướt qua trong 1 giây. Linh đang mắc lỗi gì?',
      options: [
        { id: 'a', text: 'Cherry-picking evidence — Linh chọn vài bài làm mẫu đại diện để justify niềm tin.', isCorrect: false },
        {
          id: 'b',
          text: 'Selective attention / selective exposure — trong cùng một feed, Linh chú ý có chọn lọc bài khớp niềm tin và lướt qua bài ngược chiều.',
          isCorrect: true,
        },
        {
          id: 'c',
          text: 'Không có lỗi gì — thuật toán Facebook quyết định feed, Linh không có lỗi trong việc đọc gì.',
          isCorrect: false,
        },
        { id: 'd', text: 'Ad hominem — Linh đang công kích nguồn tin ngược chiều thay vì luận điểm.', isCorrect: false },
      ],
      explanation:
        'Đáp án B. Đây là selective attention ở giai đoạn Input — trong cùng một dòng thông tin (cùng feed), Linh tự lọc bài "khớp" đọc kỹ và bài "không khớp" lướt qua. Cô không cố tình tránh — não thấy bài ngược chiều "kém hấp dẫn" hơn nên scroll nhanh. Đây là cơ chế chạy ngầm trước cả thuật toán.\n\nA sai vì cherry-picking là chọn bằng chứng cụ thể để justify trong lập luận; ở đây Linh chưa lập luận gì, mới chỉ chọn lọc cái mình đọc. C sai vì thuật toán không tạo ra selective exposure — Linh đã follow 5 page astrology trước khi có feed, và trong cùng feed Linh vẫn tự lọc cái nào đọc; thuật toán chỉ khuếch đại xu hướng có sẵn. D sai vì Linh không công kích nguồn ngược chiều — cô chỉ lướt qua.',
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 3 — §2. Giai đoạn 2: Xử lý
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Giai đoạn 2 — Xử lý: cùng dữ liệu, hai diễn giải',
      paragraphs: [
        'Khi bằng chứng ngược chiều cuối cùng cũng lọt vào não (ai đó chia sẻ bài phản biện vào nhóm, người yêu cãi với bạn về chiêm tinh), Giai đoạn 2 mới là nơi nhiều thứ thú vị xảy ra. Có ít nhất 3 cơ chế chạy song song: suy luận có động cơ, diễn giải lệch, và chọn quả ngon bỏ quả thối.',
      ],
    },
    {
      type: 'text',
      title: '1. Suy luận có động cơ (motivated reasoning)',
      paragraphs: [
        'Ziva Kunda — nhà tâm lý học người Israel-Canada — chỉ ra trong một bài năm 1990 có ảnh hưởng rất lớn: "người ta có xu hướng đi đến kết luận họ muốn đi, **miễn là** họ có thể xây được một lý lẽ nghe có vẻ hợp lý để biện minh cho kết luận đó".',
        'Cái hay là cụm "miễn là" — nghĩa là suy luận có động cơ không phải "tin bất chấp". Bạn vẫn dùng logic, vẫn nghĩ mình đang suy luận hợp lý. Chỉ là logic được dùng như công cụ phục vụ kết luận, chứ không phải để tìm kết luận.',
        'Ví dụ: bạn đọc cung hoàng đạo thấy "Tuần này Song Tử sẽ gặp chuyện tình cảm bất ngờ". Cả tuần trôi qua, không có chuyện tình cảm nào xảy ra. Thay vì nghĩ "có khi cung hoàng đạo không đúng", bạn tự giải thích: "Chắc \'tình cảm\' không chỉ là yêu đương, có thể là nói chuyện với bạn cũ." / "Có thể sự kiện chưa tới, chắc cuối tuần mới ứng nghiệm." / "Có khi mình đã bỏ lỡ tín hiệu của vũ trụ."',
        'Kết quả: nếu có chuyện xảy ra → "Cung hoàng đạo đúng." Nếu không có gì xảy ra → "Mình chưa hiểu đúng ý cung hoàng đạo." Dù kết quả nào xảy ra, cung hoàng đạo vẫn luôn đúng trong mắt bạn.',
      ],
    },
    // CHECKPOINT 3 — practice-final.md q3
    {
      type: 'question',
      question:
        'An uống nước chanh detox 2 tuần. Bạn cô nói "detox không có cơ sở khoa học, gan thận tự xử lý độc tố rồi". An đáp "nhưng tôi thấy người nhẹ hơn hẳn — nghĩa là nó hoạt động." An đang mắc lỗi gì?',
      options: [
        {
          id: 'a',
          text: 'Motivated reasoning — An xây lập luận "cảm thấy nhẹ → detox hoạt động" để bảo vệ kết luận cô đã muốn tin.',
          isCorrect: true,
        },
        { id: 'b', text: 'Slippery slope — An đang nói chuyện này sẽ dẫn đến chuyện khác.', isCorrect: false },
        { id: 'c', text: 'Biased interpretation — An đang diễn giải dữ liệu mơ hồ theo hướng có lợi.', isCorrect: false },
        { id: 'd', text: 'Không có lỗi gì — cảm nhận cá nhân về cơ thể là evidence hợp lý.', isCorrect: false },
      ],
      explanation:
        'Đáp án A. An đã muốn tin detox hiệu quả, rồi xây ra lập luận nghe có vẻ logic ("người nhẹ → hoạt động") để biện minh. Cô không nói dối, cô thật sự tin lập luận của mình. Nhưng cảm giác "nhẹ" có thể do uống nước nhiều, ăn ít hơn, kỳ vọng tâm lý — An bỏ qua các lý giải khác để giữ kết luận đã muốn.\n\nB sai vì slippery slope là "nếu A thì B rồi C rồi sụp đổ" — An không nói gì sẽ dẫn đến gì. C gần đúng nhưng chưa chính xác: An chưa diễn giải lại một dữ liệu mơ hồ, cô đang *xây lý lẽ mới* để bảo vệ kết luận — đó là motivated reasoning. D sai vì placebo, hydration, ăn ít đều có thể giải thích "nhẹ hơn"; An đã bỏ qua toàn bộ lý giải thay thế.',
    },
    {
      type: 'text',
      title: '2. Diễn giải lệch (biased interpretation)',
      paragraphs: [
        'Cùng một mô tả, hai người đọc khác nhau tuỳ niềm tin có sẵn. Scorpio bị mô tả "hay ghen tuông và thích kiểm soát": người tin cung hoàng đạo đọc thành "đam mê, sâu sắc, biết bảo vệ người mình yêu"; người không tin đọc thành "kiểm soát, độc hại, thiếu an toàn nội tâm".',
        'Charles Lord cùng Lee Ross và Mark Lepper đã thiết kế một thí nghiệm tinh tế năm 1979 để đo hiệu ứng này. Họ tuyển những người có quan điểm mạnh hai phía về một chủ đề nóng (án tử hình), rồi cho cả hai phe đọc cùng **một cặp** nghiên cứu: một ủng hộ, một phản đối.',
        'Logic ngây thơ dự đoán: đọc xong hai bên cân bằng hơn. Thực tế ngược lại — hai phe đọc xong càng cách xa nhau. Người ủng hộ tử hình đọc nghiên cứu ủng hộ kỹ, gật gù; đọc nghiên cứu phản đối lướt qua và chê phương pháp yếu. Người phản đối làm ngược lại. Kết quả: **phân cực thái độ** (attitude polarization) — đọc cùng bằng chứng, niềm tin cực đoan hơn, không ôn hoà hơn.',
        'Phát hiện này quan trọng để hiểu vì sao tranh luận trên mạng xã hội ít khi đổi được ai. Đôi khi bằng chứng còn làm tệ hơn.',
      ],
    },
    // INTERACTIVE 1 (practice loại 2) — trải nghiệm trực tiếp attitude polarization
    {
      type: 'perspective-switch',
      title: 'Thử nghiệm Lord–Ross–Lepper: cùng một bằng chứng, hai cách đọc',
      event:
        'Một nghiên cứu mới được công bố về hiệu quả răn đe của án tử hình. Nghiên cứu có hai phần: phần A so sánh tỉ lệ tội phạm giữa các bang có và không có án tử hình (kết quả ủng hộ răn đe); phần B so sánh tỉ lệ tội phạm trước và sau khi một bang áp dụng án tử hình (kết quả không thấy răn đe). Cùng một tài liệu này được đưa cho hai nhóm có quan điểm trái ngược.',
      perspectives: [
        {
          id: 'ung-ho',
          role: 'Người vốn ủng hộ án tử hình',
          icon: '👍',
          narrative:
            '"Phần A đúng là thứ tôi cần — so sánh giữa các bang, mẫu lớn, khác biệt rõ ràng. Đây mới là cách đo răn đe hợp lý. Còn phần B thì phương pháp yếu: so sánh trước-sau trong cùng một bang thì có quá nhiều yếu tố khác chen vào — kinh tế, dân số, cảnh sát. Không kiểm soát được gì cả. Nói chung nghiên cứu này càng làm tôi chắc chắn hơn: án tử hình có tác dụng răn đe."',
        },
        {
          id: 'phan-doi',
          role: 'Người vốn phản đối án tử hình',
          icon: '👎',
          narrative:
            '"Phần B mới là phần nghiêm túc — so sánh cùng một bang trước và sau, tức là giữ nguyên văn hoá, dân số, hệ thống tư pháp. Đó là cách duy nhất để cô lập tác động của án tử hình. Phần A thì so sánh các bang khác nhau, mà các bang khác nhau về mọi thứ — nghèo đói, giáo dục, súng đạn. So sánh kiểu đó vô nghĩa. Nghiên cứu này càng cho thấy án tử hình không răn đe được gì."',
        },
      ],
      question: {
        text: 'Hai nhóm đọc cùng một tài liệu chứa cả bằng chứng thuận và nghịch. Sau khi đọc, điều gì đã xảy ra với quan điểm của họ?',
        options: [
          {
            id: 'a',
            text: 'Hai nhóm xích lại gần nhau hơn, vì cả hai đều tiếp xúc với bằng chứng của phía đối lập.',
            isCorrect: false,
          },
          {
            id: 'b',
            text: 'Hai nhóm càng cách xa nhau hơn — mỗi bên khen phần khớp niềm tin mình và chê phương pháp của phần ngược chiều.',
            isCorrect: true,
          },
          {
            id: 'c',
            text: 'Cả hai nhóm đều trở nên trung lập, vì bằng chứng mâu thuẫn khiến họ mất niềm tin vào nghiên cứu.',
            isCorrect: false,
          },
        ],
        explanation:
          'Đáp án B — đây chính là **phân cực thái độ** (attitude polarization) mà Lord, Ross và Lepper đo được năm 1979. Để ý là cả hai lập luận phê bình phương pháp ở trên đều *nghe rất hợp lý*: đúng là so sánh giữa các bang có vấn đề nhiễu, và đúng là so sánh trước-sau cũng có vấn đề nhiễu. Thiên kiến xác nhận không làm bạn ngu đi — nó chỉ khiến bạn dồn toàn bộ sự sắc sảo phê bình vào phía bằng chứng mà bạn không thích, và hạ tiêu chuẩn với phía bằng chứng bạn thích. Kết quả: đọc cùng một tài liệu, niềm tin của cả hai bên đều cứng hơn trước.',
      },
    },
    // CHECKPOINT 4 — practice-final.md q10
    {
      type: 'question',
      question:
        'Trang uống collagen 6 tháng, da có vẻ đẹp hơn. Chồng cô nói "da đẹp lên là vì em ngủ đủ + bớt stress sau khi đổi job, không phải collagen". Trang đáp "không, collagen chắc chắn có tác dụng — collagen vốn tốt cho da mà". Trang đang mắc lỗi gì?',
      options: [
        { id: 'a', text: 'Ad hominem — Trang đang bác bỏ ý chồng vì chồng không phải chuyên gia.', isCorrect: false },
        { id: 'b', text: 'Motivated reasoning — Trang xây lý lẽ để justify chi tiền collagen.', isCorrect: false },
        { id: 'c', text: 'Không có lỗi gì — kinh nghiệm cá nhân về da là evidence hợp lý.', isCorrect: false },
        {
          id: 'd',
          text: 'Biased interpretation — cùng một dữ liệu "da đẹp hơn", Trang diễn giải = "collagen tác dụng" trong khi có ít nhất 2 lý giải khác (ngủ, bớt stress) hợp lý ngang nhau.',
          isCorrect: true,
        },
      ],
      explanation:
        'Đáp án D. Cùng một quan sát ("da đẹp hơn sau 6 tháng") có nhiều cách diễn giải: collagen, ngủ đủ, bớt stress, hoặc kết hợp. Trang chọn diễn giải khớp niềm tin có sẵn ("collagen vốn tốt cho da") và bỏ qua các lý giải khác hợp lý ngang. Cùng dữ liệu, hai người khác niềm tin sẽ đọc khác — đó là dấu hiệu diễn giải đã lệch.\n\nA sai vì Trang không công kích chồng, cô chỉ không chấp nhận lập luận. B gần đúng — Trang có động cơ giữ niềm tin — nhưng cơ chế cốt lõi ở đây là *cùng một quan sát* được diễn giải theo một hướng, bỏ qua hướng khác hợp lý ngang; đó chính là biased interpretation kiểu Lord–Ross–Lepper. C sai vì khi có nhiễu rõ ràng (đổi job, ngủ đủ, bớt stress cùng đợt), kinh nghiệm cá nhân không đủ để kết luận nhân quả.',
    },
    {
      type: 'text',
      title: '3. Chọn quả ngon, bỏ quả thối (cherry-picking evidence)',
      paragraphs: [
        '"Bạn thân tôi là Scorpio và rất đáng tin — cung hoàng đạo đúng lắm." Câu này bỏ qua 10 Scorpio khác bạn quen mà không đáng tin, và 20 Sagittarius cực đáng tin.',
        'Trong đầu, bạn chỉ thấy bằng chứng xác nhận. Não rất ít khi tự nhắc "khoan đã, mẫu thử của tôi có đại diện không?".',
      ],
    },
    // CHECKPOINT 5 — practice-final.md q2
    {
      type: 'question',
      question:
        'Minh giữ Bitcoin lỗ 70%. Bạn hỏi vì sao không bán, Minh trả lời: "Trong nhóm Telegram tôi follow, đợt 2017 cũng có người ôm lỗ 80% rồi sau lên 10x. Vậy nên tôi giữ." Minh đang mắc lỗi gì?',
      options: [
        { id: 'a', text: 'Appeal to authority — Minh dựa vào người trong group Telegram để justify quyết định.', isCorrect: false },
        { id: 'b', text: 'Không có lỗi gì — đây là chiến lược hodl hợp lý, đợi chu kỳ phục hồi.', isCorrect: false },
        { id: 'c', text: 'Motivated reasoning — Minh chỉ đang xây lý lẽ để giữ kết luận đã muốn từ trước.', isCorrect: false },
        {
          id: 'd',
          text: 'Cherry-picking evidence — Minh chỉ chọn 1 case lên 10x làm mẫu, bỏ qua hàng ngàn case lỗ 90% không hồi phục.',
          isCorrect: true,
        },
      ],
      explanation:
        'Đáp án D. Minh chọn đúng 1 câu chuyện thắng trong group để biện minh, trong khi bỏ qua mẫu lớn hơn rất nhiều: nhiều coin chu kỳ trước không hồi phục, nhiều người bán đáy đúng lúc. Não chỉ thấy bằng chứng xác nhận, không tự nhắc "mẫu thử của tôi có đại diện không?".\n\nA sai vì Minh không dựa vào uy tín của người nói mà dựa vào *câu chuyện* (1 case lên 10x) — vấn đề là chọn lọc bằng chứng. B sai vì hodl không phải lỗi tự thân; lỗi nằm ở cách biện minh. C gần đúng — Minh có xây lý lẽ để giữ — nhưng cơ chế cốt lõi là chọn 1 case thắng đại diện cho toàn thị trường, nên cherry-picking sát hơn.',
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 4 — §2. Giai đoạn 3: Xuất ra
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Giai đoạn 3 — Xuất ra: niềm tin trơ lì',
      paragraphs: [
        'Đến cuối ngày, bạn nhớ rõ "cung hoàng đạo đoán đúng việc sếp khen tôi tuần này", nhưng đã quên lần đầu năm cung hoàng đạo nói "bạn sẽ gặp người đặc biệt trong tháng 3" mà tháng 3 chẳng có ai. Đây là **nhớ chọn lọc** (selective recall). Càng tích lũy bằng chứng xác nhận trong trí nhớ, càng tin chắc — dù bằng chứng đối lập trong thực tế có thể nhiều ngang ngang.',
        'Khi xem bài kiểm chứng với dữ liệu 15.000 người, bạn không sụp đổ niềm tin. Bạn nghĩ "à có lẽ nghiên cứu chưa đúng cách" hay "cung hoàng đạo cần độ tinh tế hơn thống kê" hay đơn giản là bấm sang bài khác. Đây gọi là **niềm tin trơ lì** (belief perseverance). Niềm tin tồn tại dai dẳng ngay cả khi bằng chứng ban đầu đã bị bác bỏ rõ ràng.',
      ],
    },
    // CHECKPOINT 6 — practice-final.md q5
    {
      type: 'question',
      question:
        'Lan tin "phải làm OT đến 10h tối mới thăng tiến". Đồng nghiệp đưa data — 8/10 manager năm nay không OT thường xuyên. Lan đọc xong vẫn nói "nhưng đó là những trường hợp đặc biệt, nhìn chung muốn lên thì phải hi sinh". Lan đang mắc lỗi gì?',
      options: [
        { id: 'a', text: 'Appeal to authority — Lan dựa vào hệ thống cấp bậc công ty để justify.', isCorrect: false },
        { id: 'b', text: 'Không có lỗi gì — đó là kinh nghiệm cá nhân hợp lý.', isCorrect: false },
        {
          id: 'c',
          text: 'Belief perseverance — Lan giữ niềm tin dai dẳng ngay cả sau khi bằng chứng (8/10 manager) đã bác bỏ.',
          isCorrect: true,
        },
        { id: 'd', text: 'Motivated reasoning — Lan xây lập luận mới để justify niềm tin.', isCorrect: false },
      ],
      explanation:
        'Đáp án C. Lan có 8/10 điểm dữ liệu ngược niềm tin, nhưng niềm tin không suy yếu. Cô gọi 8/10 là "trường hợp đặc biệt" để vô hiệu hoá bằng chứng, giữ kết luận ban đầu. Đây là cơ chế tự động ở giai đoạn Output — không phải cô bướng, mà là niềm tin trơ lì kể cả khi bằng chứng rõ ràng đã có.\n\nA sai vì Lan không dựa vào người có quyền uy nào. B sai vì kinh nghiệm cá nhân không vô hiệu hoá được 8/10 điểm dữ liệu trực tiếp. D gần đúng nhưng chưa trúng: điểm nhấn ở đây là bằng chứng bác bỏ *đã được đưa ra rõ ràng* mà niềm tin vẫn không lay chuyển — đó là đặc trưng của belief perseverance.',
    },
    {
      type: 'text',
      title: 'Buồng vọng âm — khi vòng lặp chạy ở quy mô cộng đồng',
      paragraphs: [
        'Tệ hơn, môi trường xã hội của bạn cũng đã được lọc theo niềm tin: bạn ở trong nhóm Facebook "Chiêm tinh học Việt Nam" với rất đông thành viên, ai cũng chia sẻ bài ủng hộ chiêm tinh, không ai dại đăng nghiên cứu phủ định. Bạn có cảm giác **"mọi người đều đồng ý"** — đây là **buồng vọng âm** (echo chamber).',
        'Trong buồng vọng âm, mỗi người trở thành Giai đoạn 1 cho người khác — họ là nguồn đầu vào của bạn, bạn là nguồn đầu vào của họ, ai cũng nuôi lại đúng cái mọi người đã tin. Vòng lặp tự củng cố giờ chạy ở quy mô cộng đồng, không chỉ một não.',
      ],
    },
    // CHECKPOINT 7 — practice-final.md q4
    {
      type: 'question',
      question:
        'Tuấn tham gia group Facebook "Cha mẹ dạy con kiểu Nhật". Mỗi bài share "IQ con Nhật cao nhất thế giới" được 200 like; mỗi bài phê bình phương pháp Nhật chỉ 5 like và bị down-vote. Tuấn nghĩ "cả group đều đồng ý, chắc đúng". Tuấn đang mắc lỗi gì?',
      options: [
        { id: 'a', text: 'Ad hominem — group đang công kích người phê bình thay vì luận điểm.', isCorrect: false },
        {
          id: 'b',
          text: 'Echo chamber reinforcement — môi trường thông tin của Tuấn đã được lọc, tạo ảo giác "mọi người đều đồng ý".',
          isCorrect: true,
        },
        { id: 'c', text: 'Selective attention / selective exposure — Tuấn chỉ đọc bài khớp niềm tin.', isCorrect: false },
        { id: 'd', text: 'Không có lỗi gì — đám đông đông thường đúng, đó là social proof hợp lý.', isCorrect: false },
      ],
      explanation:
        'Đáp án B. Đây là buồng vọng âm ở giai đoạn Output — group đã lọc sẵn quan điểm đồng thuận (bài ngược bị down-vote, ít tương tác), tạo cho Tuấn cảm giác "mọi người đều đồng ý". Mỗi thành viên trở thành Giai đoạn 1 cho thành viên khác, vòng lặp tự củng cố ở quy mô cộng đồng.\n\nA sai vì down-vote là biểu hiện của động lực echo chamber, không phải công kích cá nhân vào người phê bình. C đúng một phần — Tuấn có chọn lọc — nhưng câu hỏi nhấn vào "cả group đều đồng ý, chắc đúng", tức là động lực ở quy mô cộng đồng. D sai vì 200 vs 5 like không phản ánh đa số đồng ý mà phản ánh việc group đã lọc ai được nói gì; social proof từ một mẫu đã lệch không phải tín hiệu đáng tin về sự thật.',
    },
    {
      type: 'text',
      title: 'Vì sao mô tả chung chung lại có cảm giác "đúng tôi luôn"?',
      paragraphs: [
        'Đây là chỗ **Hiệu ứng Barnum/Forer** xuất hiện. Năm 1949, nhà tâm lý học Bertram Forer làm một thí nghiệm với 39 sinh viên đại học. Forer phát cho mỗi sinh viên một "phân tích tính cách dựa trên trắc nghiệm" — sinh viên tin là cá nhân hoá. Thực ra Forer đưa cho cả 39 người **cùng một mô tả** chung chung, gồm các câu kiểu "Đôi khi bạn thích đám đông, đôi khi muốn ở một mình", "Bạn có nhu cầu được người khác yêu mến", "Bạn có những khả năng chưa được khai thác hết". Sau đó Forer hỏi sinh viên chấm "đúng với mình bao nhiêu" trên thang 0-5. Điểm trung bình: **4.3/5**.',
        'Mô tả chung chung dễ "vừa vặn" với bất kỳ ai — vì ai cũng có lúc thích đám đông, ai cũng có khả năng chưa khai thác hết. Cộng với thiên kiến xác nhận, bạn nhớ phần khớp và quên phần không. Áp dụng cho cung hoàng đạo: "Scorpio sâu sắc và bí ẩn" — ai mà không có lúc cảm thấy sâu sắc, ai mà không có lúc bí ẩn? Bạn nhớ lần thấy mình sâu sắc, quên lần thấy mình nông cạn — và kết luận "đúng tôi luôn".',
      ],
    },
    {
      type: 'image',
      src: images.loopDiagram,
      alt: 'Sơ đồ vòng lặp 3 giai đoạn của thiên kiến xác nhận: Nạp thông tin, Xử lý, Xuất ra, nuôi lẫn nhau quanh niềm tin có sẵn',
      caption:
        '3 giai đoạn nối thành vòng lặp tự củng cố — niềm tin càng cứng, lọc càng mạnh, bằng chứng ngược càng bị xé.',
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 5 — §3. Bộ lọc 2 tín hiệu
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Phát hiện trong đời thường: bộ lọc 2 tín hiệu',
      paragraphs: [
        'Cung hoàng đạo là ví dụ "vô hại" để thấy cơ chế. Trong đời thực, thiên kiến xác nhận gây thiệt hại thật — kể cả trong **khoa học**, **y học** và **sức khỏe**, nơi tưởng như có bình duyệt đồng nghiệp và bằng chứng đầy đủ.',
        'Vấn đề: bạn **không thể "tắt"** thiên kiến xác nhận. Não đó là não bạn, nó sẽ chạy bất kể bạn có muốn hay không. Cái bạn có thể làm là một **bộ lọc 2 tín hiệu**: tạm dừng khi đồng thời thấy hai dấu hiệu sau.',
      ],
    },
    {
      type: 'text',
      title: 'Tín hiệu 1 — Rủi ro (stake) có cao không?',
      paragraphs: [
        'Rủi ro = bạn sắp **hành động** dựa trên niềm tin này. Cụ thể: sắp **chia sẻ** lên mạng xã hội (ảnh hưởng tới mạng lưới của mình), sắp **tranh luận** với người yêu/sếp/đồng nghiệp (ảnh hưởng quan hệ), sắp **chi tiền thật** (mua coin, mua thực phẩm chức năng, bỏ tiền vào khoá học), sắp **bỏ thuốc bác sĩ kê** hoặc đổi cách sống lớn, sắp **ra quyết định nghề nghiệp**.',
        'Nếu chỉ là "à hôm nay cung hoàng đạo nói tôi gặp may, tôi thấy vui" và bạn không quyết định gì khác trong ngày — tin lướt qua (pass-through trust). Đừng kiệt sức kiểm tra mọi thứ trong bảng tin. Năng lượng kiểm tra là tài nguyên hữu hạn, dùng cho lúc thật sự cần.',
      ],
    },
    {
      type: 'text',
      title: 'Tín hiệu 2 — Khớp có quá ngọt không?',
      paragraphs: [
        'Khớp ngọt = bạn đọc xong thấy "đúng rồi!" trong dưới 5 giây, không có một chi tiết nào "cấn", không có một câu hỏi nào nảy ra. Đặc biệt nếu tin đó **xác nhận điều bạn đã bực sẵn** — kiểu "đúng rồi, sếp toàn vô lý" hay "đúng rồi, cách tôi sống là đúng nhất".',
        'Khớp quá ngọt là dấu hiệu **Hệ thống 2 chưa được gọi**. Hệ thống 1 đã xử lý hết — nó đưa bạn một kết luận đẹp đẽ, đóng gói sẵn, bạn chỉ việc đồng ý và chia sẻ. Nếu một bài viết về tài chính, sức khỏe, hay quan hệ làm bạn thấy "đúng rồi" mà không có một câu "ơ nhưng mà..." thoáng qua đầu — đó là cờ đỏ.',
      ],
    },
    {
      type: 'callout',
      variant: 'success',
      icon: 'key',
      title: 'Khi cả 2 tín hiệu cùng bật → Câu hỏi vàng',
      text: '"Mình đang bỏ qua chi tiết nào để tin cái này dễ hơn?"\n\nRồi đọc 1 nguồn nói ngược TRƯỚC khi chia sẻ hoặc hành động. Không cần đọc 10 nguồn, không cần làm bài nghiên cứu, không cần tranh luận trên mạng. Chỉ cần 1 nguồn — đọc kỹ. Nếu sau đó vẫn thấy tin đáng tin, được, cứ tiếp tục. Nếu thấy lung lay, đó là dấu hiệu Hệ thống 2 nên có thêm vài phút.',
    },
    // CHECKPOINT 8 — áp dụng bộ lọc 2 tín hiệu
    {
      type: 'question',
      question:
        'Bạn đọc một bài trên Threads: "Nghiên cứu mới: ngủ 5 tiếng/đêm giúp tăng năng suất, ngủ nhiều là dấu hiệu lười." Bạn vốn hay thức khuya và thấy "đúng quá, đúng kiểu mình luôn" chỉ sau 3 giây. Bạn đang định chia sẻ lên trang cá nhân. Theo bộ lọc 2 tín hiệu, bạn nên làm gì?',
      options: [
        {
          id: 'a',
          text: 'Chia sẻ luôn — cảm giác "đúng quá" là dấu hiệu bài viết khớp với trải nghiệm thực tế của bạn.',
          isCorrect: false,
        },
        {
          id: 'b',
          text: 'Tạm dừng — cả 2 tín hiệu đều bật (sắp chia sẻ = rủi ro; "đúng quá" trong 3 giây = khớp ngọt), nên hỏi "mình đang bỏ qua chi tiết nào?" và đọc 1 nguồn nói ngược trước.',
          isCorrect: true,
        },
        {
          id: 'c',
          text: 'Bỏ qua bài viết và không bao giờ tin bất cứ nghiên cứu nào đọc được trên mạng xã hội.',
          isCorrect: false,
        },
        {
          id: 'd',
          text: 'Đọc thêm ít nhất 10 nguồn khác nhau và tự tổng hợp trước khi quyết định có chia sẻ hay không.',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án B. Tín hiệu 1 bật vì bạn sắp chia sẻ — hành động ảnh hưởng tới mạng lưới của mình, và nội dung liên quan sức khoẻ. Tín hiệu 2 bật vì bạn thấy "đúng quá" trong 3 giây, lại đúng vào thứ xác nhận thói quen sẵn có của bạn. Hai tín hiệu cùng bật → áp câu hỏi vàng và đọc 1 nguồn ngược chiều.\n\nA sai vì "khớp với trải nghiệm của tôi" chính là cảm giác mà thiên kiến xác nhận tạo ra — nó không phải bằng chứng. C sai vì hoài nghi toàn bộ cũng là một cực đoan khác: bộ lọc dạy bạn *phân bổ* năng lượng kiểm tra, không phải từ chối mọi thứ. D sai vì đọc 10 nguồn là không bền — cố làm thế bạn sẽ kiệt sức trong tuần đầu rồi bỏ hẳn. Quy tắc cố tình chỉ yêu cầu 1 nguồn, đọc kỹ.',
    },
    {
      type: 'text',
      title: 'Ví dụ ứng dụng — Barry Marshall và vi khuẩn Helicobacter pylori',
      paragraphs: [
        'Năm 1982, bác sĩ người Úc Barry Marshall và nhà bệnh học Robin Warren phát hiện một loại vi khuẩn — *Helicobacter pylori* — sống được trong dạ dày bệnh nhân loét. Họ đưa ra giả thuyết đi ngược truyền thống: **vi khuẩn này gây loét dạ dày**, không phải áp lực tinh thần hay dư axit như y giới tin gần một thế kỷ.',
        'Khi Marshall gửi bài đến hội nghị tiêu hoá Úc năm 1983, ban giám khảo xếp bài thuộc nhóm tệ nhất năm đó, từ chối cả việc cho ông trình bày dạng áp-phích. Suốt hơn một thập niên sau đó, đa số bác sĩ trên thế giới đều bỏ qua giả thuyết này. Đây là thiên kiến xác nhận chạy ở quy mô cộng đồng khoa học chuyên nghiệp — nơi tưởng như có bình duyệt đồng nghiệp, bằng chứng đầy đủ và nhiều năm đào tạo.',
      ],
    },
    {
      type: 'text',
      title: 'Đúng cả 3 giai đoạn, ở quy mô một ngành',
      paragraphs: [
        '**Giai đoạn 1 (Nạp thông tin lệch)**: y giới đã đọc, viết và dạy hàng nghìn bài về "căng thẳng và axit gây loét" suốt thế kỷ 20. Sách giáo khoa, hội nghị, đào tạo nội trú đều xoay quanh mô hình này. Một bài đi ngược 100 năm đồng thuận xuất hiện — quá dễ để các bác sĩ lướt qua hoặc đọc thoáng rồi quên.',
        '**Giai đoạn 2 (Diễn giải lại bằng chứng)**: khi nhiều nhóm khác cũng tìm thấy vi khuẩn trong dạ dày bệnh nhân loét, họ giải thích là "vi khuẩn nhiễm sau khi loét đã hình thành" (nhân-quả ngược) hoặc "lỗi nhiễm bẩn mẫu". Bằng chứng đối nghịch không bị bác bỏ trực tiếp — nó được diễn giải lại để giữ lý thuyết cũ.',
        '**Giai đoạn 3 (Niềm tin trơ lì)**: tháng 7 năm 1984, tại Bệnh viện Fremantle, Marshall tự uống một dung dịch chứa *Helicobacter pylori*. Ngày thứ ba ông buồn nôn và mất axit dạ dày; ngày thứ tám nội soi xác nhận viêm dạ dày kèm vi khuẩn — đáp ứng đủ định đề Koch. Ông công bố thí nghiệm năm 1985. **Vẫn rất ít bác sĩ tin.** Phải đến năm 1994 — mười hai năm sau giả thuyết ban đầu — Viện Y tế Quốc gia Mỹ (NIH) mới ra khuyến cáo điều trị loét bằng kháng sinh kèm thuốc giảm tiết axit. Marshall và Warren nhận giải Nobel Y học năm 2005 — hai mươi ba năm sau bài báo đầu tiên.',
        'Cả 2 tín hiệu bật rất rõ với y giới khi đó: **rủi ro** — hàng triệu bệnh nhân loét đang được điều trị sai; **khớp ngọt** — thuyết "căng thẳng và axit" khớp quá đẹp với quan sát lâm sàng (bệnh nhân hay căng thẳng thì hay loét) và với mô hình đã được dạy hàng chục năm.',
        'Bài học không phải "khoa học sai" — bài học là **ngay cả cộng đồng khoa học chuyên nghiệp vẫn bị thiên kiến xác nhận**. Não bạn không có "miễn dịch" chỉ vì có học vị hay làm trong lĩnh vực dựa trên bằng chứng.',
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      icon: 'heart-pulse',
      title: 'Một ví dụ gần hơn: thải độc (detox)',
      text: 'VnExpress viết về việc các phương pháp như uống nước chanh, nước kiềm, thụt tháo được lan truyền vì người dùng "thiếu kiến thức, dễ tin quảng cáo sai sự thật". Tín hiệu 1 (rủi ro): đây là sức khoẻ — rất cao. Tín hiệu 2 (khớp ngọt): "tự nhiên chữa bệnh, không hoá chất" — khớp với niềm tin sẵn có rằng cái gì tự nhiên thì tốt. Câu hỏi vàng "mình đang bỏ qua chi tiết nào?" dẫn đến: bỏ qua việc gan thận đã có cơ chế thải độc, bỏ qua việc "thải độc" không phải thuật ngữ y học chính thức, bỏ qua nhiều trường hợp rối loạn điện giải sau thải độc cực đoan.',
    },
    {
      type: 'library-document',
      mode: 'reference',
      documentId: libraryDocId('kahneman-thinking-fast-and-slow'),
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 6 — §4. Tự luyện
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Tự luyện — áp bộ lọc lên một bài đăng thật',
      paragraphs: [
        'Đến đây bạn đã có khái niệm vòng lặp 3 giai đoạn, có cơ chế chi tiết các kiểu nhỏ, và có bộ lọc 2 tín hiệu. Phần cuối là thử áp dụng.',
        'Dưới đây là một bài đăng kiểu rất quen thuộc trên bảng tin. Nhiệm vụ của bạn: đọc kỹ và chỉ ra những đoạn đang kích hoạt thiên kiến xác nhận — đoạn nào là chọn quả ngon bỏ quả thối, đoạn nào là buồng vọng âm, đoạn nào là suy luận có động cơ.',
      ],
    },
    // INTERACTIVE 2 (practice loại 2) — thay cho BLOCK#2 free-text trong final.md
    {
      type: 'bias-detector',
      title: 'Bóc tách một bài đăng thật',
      instruction:
        'Đọc bài đăng dưới đây và chọn từng đoạn được đánh dấu, gán cho nó kiểu thiên kiến xác nhận tương ứng. Gợi ý: áp bộ lọc 2 tín hiệu trước — bài này có rủi ro cao không, và nó có khớp quá ngọt không?',
      article: {
        text: B01_ARTICLE,
        source: 'Bài đăng minh hoạ — tổng hợp từ các mô-típ phổ biến trên mạng xã hội Việt Nam',
      },
      segments: withOffsets(B01_ARTICLE, [
        {
          id: 'seg1',
          text: 'Anh T trong nhóm học cùng khoá mình, sau 8 tháng đã bỏ việc văn phòng và giờ thu nhập gấp 3.',
          biasType: 'cherry-picking',
          explanation:
            'Chọn quả ngon bỏ quả thối. Một trường hợp thành công được nâng lên thành bằng chứng cho cả phương pháp. Câu hỏi không được đặt ra: trong 2000 người, bao nhiêu người KHÔNG đạt kết quả đó? Một mẫu gồm đúng 1 người thắng không nói lên điều gì về tỉ lệ thành công.',
        },
        {
          id: 'seg2',
          text: 'Cả nhóm 2000 người ai cũng xác nhận phương pháp này hiệu quả, không thấy ai than phiền cả.',
          biasType: 'echo-chamber',
          explanation:
            'Buồng vọng âm. "Không thấy ai than phiền" trong một nhóm do chính người bán khoá học lập ra không có nghĩa là không ai thất bại — nghĩa là người thất bại đã rời nhóm, bị xoá bài, hoặc ngại lên tiếng giữa 2000 người đang hào hứng. Môi trường thông tin đã được lọc trước khi bạn quan sát nó.',
        },
        {
          id: 'seg3',
          text: 'Có mấy bài báo nói mô hình này rủi ro, nhưng mình nghĩ báo chí thì lúc nào chẳng tiêu cực, họ có đi học đâu mà biết.',
          biasType: 'biased-interpretation',
          explanation:
            'Diễn giải lệch — đúng kiểu Lord–Ross–Lepper. Bằng chứng ngược chiều không bị bác bỏ bằng lập luận, mà bị hạ giá bằng cách chê nguồn ("báo chí tiêu cực", "họ có đi học đâu"). Để ý tiêu chuẩn kép: lời kể của anh T được nhận không cần kiểm chứng, còn bài báo thì bị đòi hỏi phải "đi học" mới có tư cách nói.',
        },
        {
          id: 'seg4',
          text: 'Ai chưa thành công thì đơn giản là chưa đủ quyết tâm thôi.',
          biasType: 'motivated-reasoning',
          explanation:
            'Suy luận có động cơ. Đây là lập luận không thể sai: thành công → phương pháp tốt; thất bại → tại người học. Mọi kết quả đều xác nhận niềm tin ban đầu, nên niềm tin không bao giờ bị bằng chứng thách thức. Giống hệt "cung hoàng đạo đúng / mình chưa hiểu đúng ý cung hoàng đạo".',
        },
      ]),
      biasOptions: [
        { id: 'cherry-picking', label: 'Chọn quả ngon bỏ quả thối (cherry-picking)' },
        { id: 'echo-chamber', label: 'Buồng vọng âm (echo chamber)' },
        { id: 'biased-interpretation', label: 'Diễn giải lệch (biased interpretation)' },
        { id: 'motivated-reasoning', label: 'Suy luận có động cơ (motivated reasoning)' },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // KẾT
    // ─────────────────────────────────────────────────────────────
    {
      type: 'callout',
      variant: 'success',
      icon: 'check-circle',
      title: 'Bạn đã học được gì?',
      text: '✓ Vòng lặp 3 giai đoạn chạy tự động trong mọi não: Nạp thông tin (tiếp xúc chọn lọc) → Xử lý (suy luận có động cơ, diễn giải lệch, chọn quả ngon bỏ quả thối) → Xuất ra (nhớ chọn lọc, niềm tin trơ lì, buồng vọng âm).\n\n✓ Không phải lỗi cá nhân, không phải dấu hiệu "ngu" — mọi não đều chạy, kể cả não giáo sư, bác sĩ, và bạn. Cái khác nhau là mức độ tự nhận diện, không phải "có chạy hay không".\n\n✓ Bộ lọc 2 tín hiệu: khi rủi ro cao VÀ khớp quá ngọt — tạm dừng, hỏi "Mình đang bỏ qua chi tiết nào để tin cái này dễ hơn?", rồi đọc 1 nguồn nói ngược trước khi chia sẻ hoặc hành động.\n\n✓ Tin lướt qua phần còn lại. Bạn không thể kiểm chứng mọi thứ — tiết kiệm năng lượng kiểm tra cho lúc rủi ro thật sự cao.',
    },
    {
      type: 'text',
      title: 'Một điểm tinh tế cuối',
      paragraphs: [
        'Thiên kiến xác nhận **không** phải kẻ thù. Nó là một phép rút gọn (heuristic) mà não dùng để tiết kiệm calo. Trong phần lớn tình huống đời thường (chọn quán cà phê, quyết định mặc gì hôm nay, nhớ tên người mới gặp), phép rút gọn này đủ tốt. Vấn đề là trong các quyết định rủi ro cao — nó dẫn bạn vào hố. Mục tiêu không phải là **xoá** thiên kiến xác nhận (không thể), mà là **biết khi nào nó đang chạy mạnh** để bấm tạm dừng vừa đủ.',
        'Một sự thật nữa, hơi nghịch lý: ngay cả bài này bạn vừa đọc cũng có thể được "tin theo thiên kiến xác nhận" thay vì hiểu đúng. Nếu bạn đọc xong và nghĩ "đúng rồi, người khác toàn thiên kiến xác nhận chứ mình thì đỡ hơn nhiều" — đó là thiên kiến xác nhận đang chạy ngay trong việc bạn tiếp thu khái niệm thiên kiến xác nhận.',
        'Cách tỉnh hơn: thử nhớ lại 1 lần **bản thân** vừa mắc trong tuần qua. Một bài đăng (status) chia sẻ không kiểm chứng. Một quyết định mua hàng theo người ảnh hưởng (influencer). Một lần bỏ qua góp ý mà nội tâm biết là đúng. Đó là bài thực hành đầu tiên.',
        'Thiên kiến xác nhận là cái lọc trong đầu bạn. Bài tới (**B02: Ngụy biện là gì?**) sẽ học một thứ ngược: cấu trúc một lập luận từ bên ngoài. Khi nào lập luận của người khác — hay của chính bạn — thật sự hỏng cấu trúc, chứ không chỉ là não bạn đang lọc? Tiền đề là gì, kết luận là gì, đâu là chỗ logic gãy? Có ngôn ngữ chung đó, bạn sẽ phân biệt được "tôi không thích" với "lập luận này thật sự không vững" — bước đầu để tranh luận tử tế hơn, thay vì cãi nhau trên Threads tới 2 giờ sáng rồi sáng mai vẫn không ai đổi ý.',
      ],
    },
  ] as ContentBlock[];
}
