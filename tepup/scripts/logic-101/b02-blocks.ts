/**
 * B02 — "Ngụy biện là gì? — Tiền đề, kết luận, valid & sound"
 *
 * Content source: docs/content-course-Logic-101/lessons/B02-nguy-bien-la-gi/01.lesson/final.md
 *
 * Checkpoint questions: unlike B01 there is no 02.practice/ folder, but final.md's
 * frontmatter carries an explicit `checks:` array — three questions with `after_section`
 * and a detailed `intent`, each mapped 1:1 to a learning objective. Those are authored
 * verbatim to intent below as CHECK#1/#2/#3.
 *
 * Two extra checkpoints (marked EXTRA) were added at the end of long stretches that would
 * otherwise run 1200+ words with no pause, per the "mỗi ý chính = 1 checkpoint" rule in
 * docs/(key-doc)-cấu-trúc-một-bài-học.md. The spec's own three remain the backbone.
 *
 * The spec sets `blocks: []` (no interactive block required). One `bias-detector` is used
 * in §4 anyway — it is the only renderable block that reproduces the lesson's core drill
 * (label each fragment as kết luận / căn cứ hiển thị / căn cứ bị giấu), and the guideline
 * permits 0–2 optional interactive blocks.
 */

import type { ContentBlock } from '../../lib/types/content';

/**
 * See the note in b01-blocks.ts — the bias-detector renderer slices `article.text`
 * by `startIndex`, so offsets are derived rather than hardcoded.
 */
function withOffsets(
  article: string,
  segments: { id: string; text: string; biasType: string; explanation: string }[]
) {
  let cursor = 0;
  return segments.map((seg) => {
    const startIndex = article.indexOf(seg.text, cursor);
    if (startIndex === -1) {
      throw new Error(`bias-detector segment "${seg.id}" not found in article: ${seg.text.slice(0, 40)}…`);
    }
    cursor = startIndex + seg.text.length;
    return { ...seg, startIndex };
  });
}

const B02_ARTICLE =
  'Khoá học tiếng Anh giao tiếp — giá gốc 12.000.000đ, hôm nay chỉ còn 2.990.000đ. ' +
  'Đã có hơn 5.000 học viên đăng ký. ' +
  'Chỉ còn 4 suất cuối trong tháng này, nhanh tay kẻo lỡ! ' +
  'Đăng ký ngay để tiết kiệm 9.010.000đ cho tương lai của bạn.';

export interface B02Deps {
  libraryDocId: (slug: string) => string;
  images: { hero: string; bridgeDiagram: string };
}

export function buildB02Blocks({ libraryDocId, images }: B02Deps): ContentBlock[] {
  return [
    // ─────────────────────────────────────────────────────────────
    // MỞ
    // ─────────────────────────────────────────────────────────────
    {
      type: 'question',
      question:
        'Một trang bán hàng ghi: "Giá gốc 2.000.000đ — nay còn 599.000đ. Mua ngay, tiết kiệm 1.401.000đ!" Bạn kiểm tra và thấy trang đúng là có ghi 2.000.000đ, và bạn đúng là trả 599.000đ. Vậy câu quảng cáo này có vấn đề gì không?',
      options: [
        {
          id: 'a',
          text: 'Không có vấn đề gì — mọi con số đều kiểm tra được và đều khớp.',
          isCorrect: false,
        },
        {
          id: 'b',
          text: 'Có — chắc chắn họ đã bịa con số 2.000.000đ, vì không món nào giảm sâu tới vậy.',
          isCorrect: false,
        },
        {
          id: 'c',
          text: 'Có — kết luận "tiết kiệm 1.401.000đ" vẫn có thể sai, ngay cả khi không một con số nào bị bịa.',
          isCorrect: true,
        },
        {
          id: 'd',
          text: 'Không đủ dữ kiện để nói gì — phải xem sản phẩm cụ thể mới đánh giá được.',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án C — và đây chính là chỗ khó chịu nhất của cả bài. Nếu bạn chọn A, bạn vừa làm đúng điều bộ phận kiểm tra trong đầu được huấn luyện: soi xem có ai nói dối không, thấy không có, rồi cho qua. Nếu bạn chọn B, bạn đang đoán về sự thật — mà đoán thì có thể trúng, nhưng nó bỏ lỡ điều thú vị hơn nhiều.\n\nSự thật là: kể cả khi KHÔNG một con số nào bị bịa, kết luận vẫn có thể sai. Lỗi không nằm ở dữ kiện — nó nằm ở đường đi từ dữ kiện tới kết luận. Bài này sẽ chỉ cho bạn chính xác chỗ đó nằm ở đâu, và cách moi nó ra bằng ba câu hỏi mất chưa tới mười giây.',
    },
    {
      type: 'text',
      title: 'Trong bài học này',
      paragraphs: [
        'Bài trước (**B01 — Thiên kiến xác nhận**) giải thích **vì sao** ta lười kiểm tra: khi một kết luận khớp đúng thứ mình đang muốn tin, chẳng ai đi lục lọi một tin vui bao giờ.',
        'Bài này đưa cho bạn **công cụ** để kiểm tra. Công cụ đó nhỏ đến mức bất ngờ: đúng ba câu hỏi, mất chưa tới mười giây. Nhưng trước khi cầm công cụ, ta cần một bộ từ vựng chung — **tiền đề**, **kết luận**, và cái mảnh mà không ai phát biểu ra.',
      ],
    },
    {
      type: 'callout',
      variant: 'info',
      icon: 'help-circle',
      title: 'Câu hỏi trung tâm của bài',
      text: 'Trong câu quảng cáo đó, không có câu nào nói dối — con số nào cũng đúng như bạn nhìn thấy trên màn hình. Vậy vì sao dòng "tiết kiệm 1.401.000đ" vẫn có thể sai?',
    },

    // ─────────────────────────────────────────────────────────────
    // §0. Mở đầu
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Chín giờ tối',
      paragraphs: [
        'Chín giờ tối. Bạn nằm dài trên giường, ngón tay lướt điện thoại mà chẳng định mua gì cụ thể.',
        'Rồi một tấm ảnh làm ngón tay bạn dừng lại. Con số đầu tiên bị gạch ngang bằng một nét xám mảnh, con số thứ hai đỏ chót nằm ngay bên dưới: **"Giá gốc 2.000.000đ — nay còn 599.000đ. Mua ngay, tiết kiệm 1.401.000đ!"**',
        'Ba mươi giây sau, đơn hàng đặt xong. Bạn úp điện thoại xuống, thấy trong người dễ chịu hẳn. Cái cảm giác quen thuộc đó: hôm nay mình vừa khôn ra được một triệu tư.',
        'Chuyện vừa rồi không phải một buổi tối cá biệt của riêng bạn. Theo số liệu Bộ Công Thương công bố đầu năm 2025, quy mô thị trường thương mại điện tử Việt Nam đã vượt mốc 25 tỷ USD — khoảng 9% tổng mức bán lẻ hàng hoá và dịch vụ tiêu dùng. Nghĩa là cứ mười đồng chi cho mua sắm, gần một đồng đi qua một màn hình như màn hình bạn vừa lướt.',
      ],
    },
    {
      type: 'image',
      src: images.hero,
      alt: 'Màn hình bán hàng với giá gốc bị gạch ngang, nối bằng sợi dây xuống một tấm biển để trống',
      caption:
        'Mọi con số hiện trên màn hình đều thật. Chỗ hỏng nằm ở tấm biển không ai viết gì lên đó.',
    },
    {
      type: 'text',
      paragraphs: [
        'Bây giờ đọc lại câu quảng cáo đó thêm lần nữa, chậm thôi. Và thử soi từng chữ xem có chỗ nào bịa không.',
        '"Giá gốc 2.000.000đ" — trên trang bán hàng đúng là có ghi con số ấy, bạn nhìn thấy tận mắt. "Nay còn 599.000đ" — cũng đúng nốt, đúng bằng số tiền vừa bị trừ khỏi tài khoản. Hai dữ kiện, cả hai đều kiểm tra được ngay trên màn hình, cả hai đều khớp.',
        'Không ai nói dối bạn câu nào. Vậy mà dòng cuối cùng — "tiết kiệm 1.401.000đ" — vẫn có thể sai.',
        'Chỗ này mới là chỗ khó chịu. Nếu ai đó nói dối, bạn còn có cái để bắt. Đằng này mọi con số đều thật, mọi thứ đều kiểm tra được, mà kết luận thì vẫn hỏng. Và bạn thậm chí không nhận ra để mà đi kiểm tra.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 1 — §1. Tiền đề và kết luận
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Không phải câu nào cũng có gì để mổ',
      paragraphs: [
        '"Hôm nay trời mưa." Câu này không đòi bạn tin thêm điều gì. Nó chỉ mô tả. "Sản phẩm này nặng 1,2kg" cũng vậy — một thông tin thuần tuý, bạn nhận hoặc không nhận, hết chuyện.',
        'Chỉ khi xuất hiện quan hệ **vì cái này nên cái kia** thì mới có một **lập luận**, và mới có gì đó để tách ra. Đây là bước đầu tiên, và nhiều người bỏ qua: đi cãi một câu mô tả thì chẳng có gì để cãi, còn đi cãi một lập luận thì phải biết cãi vào mảnh nào.',
      ],
    },
    {
      type: 'text',
      title: 'Hai từ: tiền đề và kết luận',
      paragraphs: [
        '**Tiền đề (premise)** là cái người ta đưa ra làm bằng chứng, để bạn tin theo.',
        '**Kết luận (conclusion)** là điều người nói muốn bạn tin sau khi nghe xong.',
        'Stephen Toulmin viết cuốn sách về lập luận của ông năm 1958. Ở đó, tiền đề được gọi là *căn cứ* (ground) — "sự kiện được viện đến làm nền cho tuyên bố". Còn kết luận là *tuyên bố* (claim) — "tuyên bố cần được chứng minh". Nghe hàn lâm vậy thôi, chứ về bản chất nó đúng là chuyện người ta làm hàng ngày: đưa ra vài thứ để chống đỡ cho một thứ khác.',
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      icon: 'alert-triangle',
      title: 'Hai cái bẫy khi nhận diện',
      text: 'Bẫy 1 — Tiền đề không phải lúc nào cũng đứng trước chữ "cho nên". Trong nói chuyện đời thường, thứ tự bị đảo liên tục. "Mua đi, đang giảm 70% đấy" — kết luận ("mua đi") nhảy lên đứng đầu, tiền đề ("đang giảm 70%") lẽo đẽo phía sau. Phải nhận theo VAI TRÒ: cái nào đang chống đỡ cho cái nào?\n\nBẫy 2 — Trong quảng cáo, kết luận hay đội lốt một dữ kiện. "Tiết kiệm 1.401.000đ" trông y như một con số được thông báo. Thực ra nó là kết luận — nó đòi bạn tin một điều.',
    },
    {
      type: 'text',
      title: 'Mổ mẫu quảng cáo ra',
      paragraphs: [
        'Giờ đặt nguyên câu lên thớt: *"Giá gốc 2.000.000đ — nay còn 599.000đ. Mua ngay, tiết kiệm 1.401.000đ!"*',
        '**Tiền đề 1**: trang bán hàng có ghi 2.000.000đ. → **ĐÚNG.** Bạn đang nhìn thấy nó trên màn hình.\n**Tiền đề 2**: bạn trả 599.000đ. → **ĐÚNG.** Đúng bằng số tiền bị trừ khỏi tài khoản.\n**Kết luận**: bạn lợi 1.401.000đ.',
        'Đọc lại hai dòng đầu một lần nữa. Không có câu nào nói dối. Không có con số nào bị chỉnh. Vậy mà kết luận vẫn có thể sai — sai theo nghĩa bạn chẳng lợi đồng nào. Báo chí đã tổng hợp chuyện này nhiều lần: có những nơi nâng giá lên rồi mới thông báo giảm sâu, khiến "mức giá sau giảm vẫn chẳng khác gì ngày thường".',
        'Và đây là cú "aha" của cả bài: **chính vì không ai nói dối, nên ta mới không đề phòng.** Bộ phận kiểm tra trong đầu bạn được huấn luyện để bắt lời nói dối. Gặp một câu mà mọi dữ kiện đều thật, nó không có gì để báo động, nên nó im lặng cho qua.',
      ],
    },
    // EXTRA CHECKPOINT — kỹ năng tách tiền đề / kết luận
    {
      type: 'question',
      question:
        'Trong câu "Mua đi, đang giảm 70% đấy!", đâu là kết luận và đâu là tiền đề?',
      options: [
        {
          id: 'a',
          text: 'Kết luận là "đang giảm 70%", tiền đề là "mua đi" — vì kết luận luôn đứng sau.',
          isCorrect: false,
        },
        {
          id: 'b',
          text: 'Kết luận là "mua đi", tiền đề là "đang giảm 70%" — dù kết luận đứng trước trong câu.',
          isCorrect: true,
        },
        {
          id: 'c',
          text: 'Cả hai đều là tiền đề — câu này chưa có kết luận nào cả.',
          isCorrect: false,
        },
        {
          id: 'd',
          text: 'Đây chỉ là một câu mô tả, không phải lập luận, nên không tách được.',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án B. "Mua đi" là điều người nói muốn bạn tin và làm — đó là kết luận. "Đang giảm 70%" là thứ được đưa ra để chống đỡ cho nó — đó là tiền đề.\n\nA sai vì đây đúng là bẫy thứ nhất: thứ tự trong câu không quyết định vai trò. Trong nói chuyện đời thường, kết luận nhảy lên đứng đầu liên tục. Phải hỏi "cái nào đang chống đỡ cho cái nào?" chứ không đếm vị trí. C sai vì đã có quan hệ "vì cái này nên cái kia" (ngầm), tức đã là một lập luận. D sai vì câu này không mô tả một sự việc — nó đang thuyết phục bạn làm một điều, dựa trên một căn cứ.',
    },
    {
      type: 'text',
      title: 'Ngụy biện là gì — và nó KHÔNG phải là gì',
      paragraphs: [
        '**Ngụy biện (fallacy)** là một lập luận trông có vẻ tốt hơn thực tế của nó. Lỗi không nằm ở các mảnh, mà nằm ở **đường đi** từ mảnh này sang mảnh kia. Thêm một điều kiện nữa: đây là lỗi có hệ thống, lặp đi lặp lại theo khuôn, chứ không phải một cú lỡ lời ngẫu nhiên.',
        'Bây giờ tới đoạn quan trọng nhất, và cũng là đoạn hay bị hiểu lẫn nhất: **nói sai sự thật không phải là ngụy biện.**',
        'Giả sử một trang bán hàng ghi "Sản phẩm này được NASA chứng nhận" — trong khi chuyện đó không hề có. Đấy là nói dối. Cách xử lý cũng đơn giản đến mức nhàm: bạn đi kiểm tra, không tìm thấy chứng nhận nào, thế là bắt được quả tang. Lỗi nằm ở **dữ kiện**, và dữ kiện thì tra ra được.',
        'Còn mẫu giá gạch ngang thì khác hẳn. Bạn đi kiểm tra từng căn cứ, và mọi căn cứ đều khớp. Không có gì để bắt quả tang cả, vì không ai phát biểu một điều sai nào. Lỗi nằm ở **cách suy** — ở chỗ hai con số đúng được nối vào một kết luận mà chúng không đủ sức đỡ.',
      ],
    },
    {
      type: 'callout',
      variant: 'warning',
      icon: 'gavel',
      title: 'Vì sao loại thứ hai nguy hiểm hơn',
      text: '"Làm giả giá cả là bất hợp pháp, nhưng làm giả sự khan hiếm của món hàng thì không vi phạm pháp luật."\n\nNói sai sự thật thì có luật xử. Còn để bạn tự suy ra một kết luận sai từ những dữ kiện đúng thì thường chẳng ai xử được ai. Nên công cụ duy nhất của bạn là tự mình tách ra mà nhìn.',
    },
    {
      type: 'text',
      title: 'Nhưng khoan — không phải quảng cáo nào cũng có bẫy',
      paragraphs: [
        'Học tới đây rất dễ sinh ra phản ứng ngược: nghi ngờ tất cả, gặp câu nào cũng soi, mua cái gì cũng mệt. Không phải mục tiêu của bài này.',
        'Vẫn ở đúng bối cảnh mua sắm đó, đây là một lập luận **đứng vững**: *"Sàn ghi phí giao hàng là 25.000đ. Đơn của tôi không đạt mốc miễn phí giao hàng. → Tôi sẽ bị tính 25.000đ."*',
        'Tách y hệt cách vừa làm. Tiền đề 1: mức phí được ghi công khai, mở giỏ hàng ra là thấy. Tiền đề 2: giá trị đơn hàng của bạn, cũng hiện ngay trên màn hình. Kết luận: bạn bị tính phí.',
        'Cả hai căn cứ đều thật và đều kiểm tra được trong mười giây. Đường đi từ căn cứ sang kết luận thì chặt — bạn không phải tin thêm bất cứ điều gì nằm ngoài màn hình. Nó có thể làm bạn tiếc tiền, nhưng nó không lừa bạn.',
        '**Khác biệt giữa hai ca vừa xem không nằm ở chuyện bên nào tử tế hơn.** Nó nằm ở chỗ: một bên đòi bạn tin thêm một điều không hiện trên màn hình, còn một bên thì không.',
      ],
    },
    // CHECK#1 — theo spec frontmatter
    {
      type: 'question',
      question:
        'Bốn phát biểu quảng cáo dưới đây. Cái nào là NGỤY BIỆN — tức lỗi nằm ở cách suy, chứ không phải ở chuyện nói sai sự thật?',
      options: [
        {
          id: 'a',
          text: '"Sản phẩm này được NASA chứng nhận" — trong khi không hề có chứng nhận nào.',
          isCorrect: false,
        },
        {
          id: 'b',
          text: '"Giá gốc 2.000.000đ — nay còn 599.000đ, tiết kiệm 1.401.000đ!" — trang đúng là ghi 2.000.000đ, bạn đúng là trả 599.000đ.',
          isCorrect: true,
        },
        {
          id: 'c',
          text: '"Sản phẩm nặng 1,2kg" — trong khi cân lên chỉ được 900g.',
          isCorrect: false,
        },
        {
          id: 'd',
          text: '"Sàn ghi phí giao hàng 25.000đ, đơn của bạn không đạt mốc miễn phí → bạn bị tính 25.000đ."',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án B. Mọi căn cứ hiển thị đều đúng và đều kiểm tra được — không ai phát biểu một điều sai nào. Nhưng kết luận "tiết kiệm 1.401.000đ" vẫn có thể sai. Lỗi nằm ở đường đi, không nằm ở dữ kiện. Đó chính là định nghĩa của ngụy biện.\n\nA là **nói dối**, không phải ngụy biện — lỗi nằm ở dữ kiện, và dữ kiện thì tra ra được: đi tìm chứng nhận, không thấy, bắt quả tang. C cũng vậy: một con số bị khai sai, cân lên là biết. D thì **không có lỗi gì cả** — hai căn cứ đều thật, đường đi chặt, bạn không phải tin thêm điều gì nằm ngoài màn hình. Nó làm bạn tiếc tiền chứ không lừa bạn.',
    },
    {
      type: 'library-document',
      mode: 'reference',
      documentId: libraryDocId('stanford-fallacies'),
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 2 — §2. Tiền đề ẩn
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Mảnh ghép không ai phát biểu',
      paragraphs: [
        'Quay lại câu quảng cáo. Ta vừa tách xong: hai căn cứ đều đúng, mà kết luận vẫn sai. Chỗ hỏng không nằm ở bất cứ thứ gì bạn nhìn thấy trên màn hình. Nó nằm ở một mảnh mà không ai nói ra.',
        '**Tiền đề ẩn (hidden premise)** là điều bạn phải tin thêm — mà không ai nêu ra — thì mấy căn cứ kia mới dẫn tới kết luận được. Nó không bị giấu bằng cách nói dối. Nó bị giấu bằng cách **không nhắc tới**.',
        'Trong mô hình mổ xẻ lập luận mà Toulmin dựng năm 1958, mảnh này có tên riêng: *warrant* — "câu cho phép đi từ căn cứ sang tuyên bố". Nó là nhịp cầu. Hai bên bờ thì ai cũng thấy, còn nhịp giữa thì trong suốt.',
        'Với câu quảng cáo trên, tiền đề ẩn là: **"món này TỪNG được bán thật ở mức 2.000.000đ."** Đọc lại màn hình mà xem — không dòng nào nói điều đó. Nhưng nếu điều đó không đúng, phép trừ "2.000.000 − 599.000" chẳng còn nghĩa gì cả.',
      ],
    },
    {
      type: 'callout',
      variant: 'info',
      icon: 'info',
      title: 'Có tiền đề ẩn KHÔNG đồng nghĩa với có bẫy',
      text: 'Tiền đề ẩn là trạng thái mặc định của mọi lời nói bình thường, không phải dấu hiệu của kẻ gian.\n\nVí dụ vô hại: "Trời đang mưa nên tôi mang ô." Ở đây vẫn có một mảnh bị bỏ qua — "mang ô thì đỡ ướt". Nó đúng, gần như ai cũng gật, và nêu ra chỉ tốn thời gian của cả hai bên.\n\nNếu bắt buộc phải phát biểu hết mọi mảnh, không ai nói chuyện được với ai. Vấn đề chỉ phát sinh khi cái bị bỏ đi lại đúng là cái sai.',
    },
    {
      type: 'text',
      title: 'Vì sao kiểu nói ngắn này phổ biến đến thế',
      paragraphs: [
        'Chuyện này cũ hơn quảng cáo rất nhiều. Từ thời Aristotle, người ta đã nhận ra rằng lập luận nói trước đám đông thường được phát biểu ngắn hơn số bước thật sự cần — vì người nói tin rằng người nghe sẽ tự điền phần thiếu.',
        'Quảng cáo là bản cực đoan của kiểu nói ngắn đó. Mươi mấy chữ, hai con số, một nút bấm. Phần còn lại người mua tự lắp vào — nhanh, êm, và không hề cảm thấy mình vừa lắp cái gì.',
        '**Thao tác lõi của cả bài chỉ có một: viết mảnh bị giấu ra thành một câu tử tế, ngang hàng với các căn cứ kia.** Lập luận đầy đủ trông như sau:',
        '1. Trang bán hàng ghi 2.000.000đ.\n2. Bạn trả 599.000đ.\n3. Món này từng được bán thật ở mức 2.000.000đ.\n→ Nên bạn lợi 1.401.000đ.',
      ],
    },
    {
      type: 'image',
      src: images.bridgeDiagram,
      alt: 'Sơ đồ cây cầu: hai trụ căn cứ nhìn thấy được, nhịp cầu ở giữa vẽ nét đứt là điều phải tin thêm',
      caption:
        'Hai bên bờ thì ai cũng thấy. Nhịp giữa thì trong suốt — và đó là chỗ lỗi ngồi trốn.',
    },
    // EXTRA CHECKPOINT — nhận diện tiền đề ẩn
    {
      type: 'question',
      question:
        'Một người nói: "Quán này lúc nào cũng đông, chắc chắn đồ ăn ngon." Đâu là tiền đề ẩn — điều bạn phải tin thêm thì căn cứ mới dẫn tới kết luận được?',
      options: [
        { id: 'a', text: 'Quán này lúc nào cũng đông khách.', isCorrect: false },
        { id: 'b', text: 'Đồ ăn ở quán này ngon.', isCorrect: false },
        {
          id: 'c',
          text: 'Quán đông khách thì đồ ăn ngon — tức là người ta chỉ xếp hàng vì chất lượng món ăn.',
          isCorrect: true,
        },
        {
          id: 'd',
          text: 'Người nói câu này đã từng ăn ở quán đó rồi.',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án C. Đó là nhịp cầu: nếu "đông ⇒ ngon" không đúng thì căn cứ không đỡ nổi kết luận. Và nó đúng là đáng chất vấn — quán có thể đông vì rẻ, vì gần trường học, vì đang có khuyến mãi, vì vừa lên xu hướng mạng xã hội, hoặc vì chỗ đó không có lựa chọn nào khác.\n\nA là **căn cứ hiển thị** — người nói đã phát biểu ra rồi, nên nó không "ẩn". B là **kết luận** — điều họ muốn bạn tin. D không phải tiền đề của lập luận này: lập luận không dựa vào trải nghiệm của người nói, nó dựa vào chuyện quán đông.\n\nĐể ý: nêu tiền đề ẩn ra không có nghĩa là bác bỏ. Rất có thể quán đó ngon thật. Nhưng giờ bạn đã có một câu cụ thể để kiểm tra, thay vì một niềm tin ngầm.',
    },
    {
      type: 'text',
      title: 'Hai câu hỏi khác nhau, đừng trộn vào nhau',
      paragraphs: [
        'Khi đã có đủ ba căn cứ trên giấy, bạn hỏi được hai câu hoàn toàn tách bạch.',
        '**Câu thứ nhất: suy có chặt không?** Nếu mọi căn cứ đều đúng thì kết luận có buộc phải đúng theo không, hay vẫn còn đường thoát? Chặt tới mức không còn đường thoát thì gọi là **đúng cấu trúc (valid)**. Chú ý: câu này chỉ hỏi về cách nối các mảnh với nhau. Nó **không** hỏi các mảnh có thật hay không.',
        '**Câu thứ hai: căn cứ có thật không?** Chỉ khi vừa suy chặt vừa mọi căn cứ đều có thật, lập luận mới **vững (sound)**. Đây mới là thứ đáng để bạn gật đầu.',
        'Và đúng ở câu thứ hai này thì mẫu quảng cáo của chúng ta trượt. Căn cứ (1) đúng. Căn cứ (2) đúng. Căn cứ (3) — cái không ai phát biểu — mới là cái sai.',
        '**Nghịch lý đắt giá: làm cho lập luận chặt hơn lại chính là cách phơi ra chỗ nó hỏng.** Chừng nào mảnh (3) còn nằm ngầm, bạn không có gì để chất vấn. Viết nó ra thành một câu, bạn lập tức có một câu để kiểm tra.',
      ],
    },
    {
      type: 'callout',
      variant: 'success',
      icon: 'quote',
      title: 'Nếu cả bài chỉ nhớ một dòng',
      text: 'Lỗi trốn ở chỗ không ai nói ra, không phải ở chỗ ai cũng nhìn thấy.',
    },
    {
      type: 'text',
      title: '"Biết đâu đó chỉ là bạn suy diễn thôi?"',
      paragraphs: [
        'Phản ứng này hợp lý, và câu trả lời cũng gọn: **nêu ra được thì kiểm chứng được.**',
        'Pháp luật Việt Nam đã định nghĩa sẵn mốc so sánh hợp lệ. Nghị định 81/2018/NĐ-CP, Điều 7 lấy mốc để so là "giá hàng hóa, dịch vụ đó ngay trước thời gian khuyến mại". Tức là câu "món này từng được bán thật ở 2.000.000đ" có tiêu chí rõ ràng, đúng được và sai được — không phải chuyện cảm tính.',
        'Ở cấp hệ thống, Ủy ban Cạnh tranh Quốc gia đã cảnh báo về đúng chiêu này: "nâng giá gốc lên cao rồi mới áp dụng mức giảm sâu 50-70%, tạo cảm giác ưu đãi lớn nhưng giá sau giảm thực chất không rẻ hơn thị trường". Cụm "tạo cảm giác ưu đãi lớn" chỉ đúng chỗ lập luận gãy: cái được tạo ra là **cảm giác lợi**, không phải khoản lợi.',
      ],
    },
    {
      type: 'text',
      title: 'Vì sao ta không tự động chất vấn con số bị gạch ngang',
      paragraphs: [
        'Vì bộ não không xử lý con số đó như một tuyên bố cần kiểm tra. Nó xử lý như một **điểm xuất phát**.',
        'Cơ chế này có tên: **neo giá (anchoring)**. Con người ước lượng bằng cách bắt đầu từ một giá trị ban đầu rồi chỉnh dần, và phần chỉnh gần như luôn thiếu. Nên ước lượng cuối cùng bị kéo lệch về phía con số ban đầu.',
        'Đặt vào chuyện mua sắm: con số 2.000.000đ hiện lên trước, thế là mọi ước lượng của bạn về "món này đáng bao nhiêu tiền" bị kéo về phía nó. **Bạn không đang tin nó. Bạn đang đứng lên nó mà đo.**',
        'Và đây là chỗ nối lại bài trước, **B01 — thiên kiến xác nhận**: khi kết luận khớp đúng thứ ta đang muốn tin, rằng mình vừa mua hời, ta lại càng không đi tìm mảnh bị giấu.',
      ],
    },
    // CHECK#2 — theo spec frontmatter
    {
      type: 'question',
      question:
        'Lập luận giá gạch ngang, đã viết đủ cả mảnh bị giấu:\n\n(1) Trang bán hàng ghi 2.000.000đ. (2) Bạn trả 599.000đ. (3) Món này từng được bán thật ở mức 2.000.000đ. → Nên bạn lợi 1.401.000đ.\n\nVì sao lập luận này ĐÚNG CẤU TRÚC (valid) nhưng KHÔNG VỮNG (sound)?',
      options: [
        {
          id: 'a',
          text: 'Vì cách nối các căn cứ với kết luận thì chặt — nếu cả ba đều đúng thì kết luận buộc phải đúng — nhưng căn cứ (3), cái không ai phát biểu, lại không có thật.',
          isCorrect: true,
        },
        {
          id: 'b',
          text: 'Vì căn cứ (1) và (2) đều sai, nên dù cách nối có chặt thì kết luận vẫn không đứng được.',
          isCorrect: false,
        },
        {
          id: 'c',
          text: 'Vì lập luận thiếu mất một bước — phải có thêm căn cứ thứ tư nữa thì mới đủ chặt.',
          isCorrect: false,
        },
        {
          id: 'd',
          text: 'Vì phép trừ 2.000.000 − 599.000 cho ra kết quả không đúng bằng 1.401.000đ.',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án A. Hai câu hỏi hoàn toàn tách bạch. **Valid** chỉ hỏi về cách nối: nếu cả ba căn cứ đều đúng thì kết luận có buộc phải đúng theo không? Ở đây là có — không cãi vào đâu được. **Sound** đòi thêm một điều nữa: mọi căn cứ phải có thật. Và đúng ở đây thì nó trượt, vì căn cứ (3) mới là căn cứ sai.\n\nB sai vì (1) và (2) đều đúng — bạn kiểm tra được cả hai ngay trên màn hình. C sai vì lập luận đã đủ chặt sau khi viết (3) ra; vấn đề không phải thiếu bước mà là một bước không có thật. D sai vì phép trừ đúng về số học — lỗi không nằm ở tính toán.\n\nĐây chính là nghịch lý đắt giá: viết mảnh bị giấu ra làm lập luận chặt hơn, và đúng lúc đó chỗ hỏng mới lộ ra.',
    },
    {
      type: 'library-document',
      mode: 'reference',
      documentId: libraryDocId('valid-vs-sound-argument'),
    },

    // ─────────────────────────────────────────────────────────────
    // Ý CHÍNH 3 — §3. Ba câu hỏi
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Ba câu hỏi mang theo được',
      paragraphs: [
        'Hai phần vừa rồi, chúng ta mổ đúng một câu quảng cáo, và mổ khá kỹ. Nhưng chín giờ tối, ngón tay đang lướt, bạn sẽ không dựng lại nguyên cái quy trình đó trong đầu. Nên phần này rút gọn tất cả xuống thành thứ mang theo được.',
        'Khi nghe một câu dạng "A, cho nên B" mà thấy mình gật đầu hơi nhanh, dừng lại một nhịp và hỏi:',
        '1. **Kết luận là gì?** — người này muốn mình tin điều gì?\n2. **Căn cứ là gì?** — họ đưa ra cái gì làm bằng chứng?\n3. **Căn cứ nào bị giấu?** — phải tin thêm điều gì nữa thì (2) mới dẫn tới (1)?',
        'Để ý thứ tự. Bạn không đọc từ đầu câu xuống cuối câu, mà bắt đầu từ chỗ người ta muốn bạn đi đến. Biết đích trước thì mới thấy con đường nào đang được dùng để đưa bạn tới đó.',
        'Và **câu số ba là câu đắt nhất**. Hai câu đầu chỉ sắp xếp lại những thứ đã hiện sẵn trên màn hình. Câu thứ ba đi tìm thứ không hiện ở đâu cả — đúng chỗ lỗi ngồi trốn. Ba câu này không đòi bạn thông minh hơn. Chúng chỉ đòi bạn dừng lại.',
      ],
    },
    {
      type: 'text',
      title: 'Chạy thử: ba lần trên hàng thật',
      paragraphs: [
        '**Lần một — "Giá gốc 2.000.000đ, nay còn 599.000đ, tiết kiệm 1.401.000đ!"**\nKết luận: bạn lợi 1.401.000đ, nên bạn nên mua. Căn cứ: trang ghi 2.000.000đ; bạn trả 599.000đ — cả hai đều đúng. Căn cứ bị giấu: *món này từng được bán thật ở mức 2.000.000đ.*',
        '**Lần hai — "Chỉ còn 3 suất cuối, nhanh tay kẻo lỡ!"**\nKết luận: bạn phải quyết ngay bây giờ. Căn cứ: trên trang có hiện dòng đó — đúng, nó hiện thật. Căn cứ bị giấu: *con số 3 suất phản ánh tồn kho thật.*\nVẫn đúng cái khuôn lúc nãy, chỉ thay vỏ: thứ hiển thị trên màn hình là thật, còn con số nền phía sau nó thì do bên bán dựng. Nhưng nói cho công bằng — có những lúc hàng sắp hết thật. Câu hỏi số ba không kết tội ai cả.',
        '**Lần ba — "Giá này chỉ áp dụng hôm nay, mai về giá niêm yết."**\nKết luận: mua hôm nay, đừng để sang mai. Căn cứ: hôm nay bạn trả ít hơn con số được gọi là giá niêm yết. Căn cứ bị giấu: *có tồn tại một "giá niêm yết", và ngày mai giá thực sự sẽ quay về mức đó.*\nVí dụ này dễ thương ở chỗ nó tự đưa cho bạn cách kiểm tra. Mai mở lại trang đó là biết. Mà nếu hôm sau giá lên thật thì cũng tốt: bạn vừa xác nhận được một lập luận vững.',
      ],
    },
    {
      type: 'text',
      title: 'Vì sao phải là một thao tác, chứ không phải "hãy tỉnh táo hơn"',
      paragraphs: [
        'Đọc tới đây rất dễ nghĩ: biết rồi thì lần sau khỏi dính. Tiếc là không.',
        'Năm 1988, nhóm Urbany, Bearden và Weilbaker đem so ba kiểu quảng cáo: không ghi giá tham chiếu, ghi giá tham chiếu hợp lý, và ghi giá tham chiếu bị thổi phồng. Kết quả: con số bị thổi phồng vẫn tạo ra cảm nhận về món hời gần y hệt con số hợp lý — **kể cả ở nhóm người vốn đa nghi hơn**.',
        'Nghiên cứu gốc về neo giá còn một chi tiết khó chịu hơn: ngay cả khi người tham gia được **trả thưởng cho độ chính xác**, hiệu ứng vẫn không giảm. Cố gắng nhiều hơn không phải là lời giải.',
        'Cái neo vẫn kéo, kể cả khi bạn thừa biết con số đó có thể là số dựng. **Cảnh giác không phải áo giáp.** Thứ thay thế được cảnh giác chỉ là một thao tác cố định: ba câu hỏi, chạy đủ, mỗi lần bắt gặp mình gật đầu hơi nhanh. Thao tác thì không đòi bạn phải đang ở phong độ tốt — nó chỉ cần lặp đủ nhiều để thành phản xạ, giống chuyện liếc gương chiếu hậu trước khi rẽ.',
      ],
    },
    {
      type: 'library-document',
      mode: 'reference',
      documentId: libraryDocId('anchoring-neo-gia'),
    },
    // CHECK#3 — theo spec frontmatter, dùng lập luận MỚI
    {
      type: 'question',
      question:
        'Áp câu hỏi số 3 lên một lập luận mới:\n\n*"Món này trên sàn ghi 300.000đ, ngoài cửa hàng 350.000đ, nên mua trên sàn tôi lợi 50.000đ."*\n\nCăn cứ nào đang bị giấu?',
      options: [
        {
          id: 'a',
          text: 'Cửa hàng ngoài đang cố tình bán đắt hơn giá thị trường.',
          isCorrect: false,
        },
        {
          id: 'b',
          text: 'Con số 300.000đ đã là toàn bộ số tiền bạn phải trả — không phát sinh thêm phí vận chuyển hay phụ phí lúc thanh toán.',
          isCorrect: true,
        },
        {
          id: 'c',
          text: 'Món trên sàn và món ngoài cửa hàng là hai sản phẩm khác nhau.',
          isCorrect: false,
        },
        {
          id: 'd',
          text: 'Không có căn cứ nào bị giấu — cả hai con số đều kiểm tra được, phép trừ cũng đúng.',
          isCorrect: false,
        },
      ],
      explanation:
        'Đáp án B. Phép trừ 350.000 − 300.000 chỉ có nghĩa nếu 300.000đ đúng là toàn bộ số tiền rời khỏi tài khoản bạn. Nhưng phí vận chuyển và các phụ phí thường chỉ hiện ra ở bước thanh toán — cơ quan bảo vệ người tiêu dùng đã cảnh báo riêng về khoản "chi phí ẩn" này. Nếu ship là 30.000đ thì khoản lợi tụt còn 20.000đ; nếu 60.000đ thì bạn đang lỗ.\n\nA là một phỏng đoán về động cơ người bán, không phải mảnh cần thiết để lập luận chạy được. C có thể đúng trong thực tế nhưng không phải nhịp cầu của lập luận này — lập luận đã mặc định là cùng một món. D sai vì đúng là mọi con số hiển thị đều kiểm tra được và phép trừ cũng đúng — nhưng đó chính xác là cái bẫy của cả bài: căn cứ đúng vẫn dẫn tới kết luận sai, khi mảnh bị giấu mới là mảnh hỏng.',
    },

    // ─────────────────────────────────────────────────────────────
    // §4. Tự luyện
    // ─────────────────────────────────────────────────────────────
    {
      type: 'text',
      title: 'Tự luyện',
      paragraphs: [
        'Dưới đây là một mẩu quảng cáo gộp nhiều chiêu cùng lúc. Chạy ba câu hỏi lên nó: đâu là kết luận, đâu là căn cứ hiển thị được, và đâu là mảnh bạn phải tin thêm.',
        'Sau khi làm xong, thử đúng việc này một lần nữa trên hàng thật: mở một trang mua sắm bất kỳ trên điện thoại, dừng ở quảng cáo đầu tiên đập vào mắt, rồi chạy ba câu hỏi. Không cần viết ra giấy — chạy một lần trên hàng thật là ba câu hỏi bắt đầu dính vào đầu.',
      ],
    },
    {
      type: 'bias-detector',
      title: 'Mổ một mẩu quảng cáo có thật',
      instruction:
        'Chọn từng cụm được đánh dấu và gán đúng vai trò của nó trong lập luận: đâu là kết luận, đâu là căn cứ hiển thị được, đâu là mảnh phải tin thêm mà không ai nói ra.',
      article: {
        text: B02_ARTICLE,
        source: 'Mẩu quảng cáo minh hoạ — tổng hợp từ các khuôn phổ biến trên sàn thương mại điện tử',
      },
      segments: withOffsets(B02_ARTICLE, [
        {
          id: 'b02s1',
          text: 'giá gốc 12.000.000đ, hôm nay chỉ còn 2.990.000đ',
          biasType: 'can-cu-hien-thi',
          explanation:
            'Căn cứ hiển thị được. Hai con số này nằm ngay trên màn hình, bạn kiểm tra được cả hai trong vài giây — trang đúng là ghi 12.000.000đ, và bạn đúng là trả 2.990.000đ. Không ai nói dối ở đây. Đây chính là lý do bộ phận kiểm tra trong đầu bạn im lặng cho qua.',
        },
        {
          id: 'b02s2',
          text: 'Đã có hơn 5.000 học viên đăng ký.',
          biasType: 'can-cu-hien-thi',
          explanation:
            'Cũng là căn cứ hiển thị. Con số này có thể đúng hoặc sai, nhưng nó được PHÁT BIỂU ra — nghĩa là nếu sai thì đó là chuyện nói sai sự thật, tra ra được, chứ không phải ngụy biện. Nhớ phân biệt: mảnh được nói ra thì đi kiểm chứng; mảnh không được nói ra mới là chỗ cần moi.',
        },
        {
          id: 'b02s3',
          text: 'Chỉ còn 4 suất cuối trong tháng này, nhanh tay kẻo lỡ!',
          biasType: 'can-cu-bi-giau',
          explanation:
            'Đây là chỗ có mảnh bị giấu. Dòng chữ đúng là hiện trên màn hình — nhưng để nó đẩy bạn tới chỗ "phải quyết ngay", bạn phải tin thêm một điều không ai nói ra: **con số 4 suất phản ánh tồn kho thật**. Đúng khuôn "chỉ còn 3 suất cuối" trong bài. Có thể hết thật — câu hỏi số ba không kết tội ai, nó chỉ đổi một niềm tin ngầm thành một câu kiểm tra được.',
        },
        {
          id: 'b02s4',
          text: 'Đăng ký ngay để tiết kiệm 9.010.000đ cho tương lai của bạn.',
          biasType: 'ket-luan',
          explanation:
            'Kết luận — điều họ muốn bạn tin và làm. Để ý nó đội lốt một con số được thông báo, đúng bẫy thứ hai trong bài: "tiết kiệm 9.010.000đ" trông như dữ kiện, thực ra là tuyên bố cần chứng minh. Nó chỉ đứng được nếu tiền đề ẩn "khoá này từng được bán thật ở 12.000.000đ" là đúng — mà điều đó không dòng nào nói tới.',
        },
      ]),
      biasOptions: [
        { id: 'ket-luan', label: 'Kết luận — điều họ muốn bạn tin' },
        { id: 'can-cu-hien-thi', label: 'Căn cứ hiển thị được — kiểm tra ngay trên màn hình' },
        { id: 'can-cu-bi-giau', label: 'Có căn cứ bị giấu — phải tin thêm mới xuôi' },
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
      text: '✓ Một lập luận luôn có hai phần: tiền đề và kết luận. Không phải câu nào cũng là lập luận — "Hôm nay trời mưa" chỉ mô tả. Và tiền đề không nhất thiết đứng trước chữ "cho nên": phải nhận theo vai trò.\n\n✓ Căn cứ đúng sự thật vẫn có thể dẫn tới một kết luận sai. Nói sai sự thật thì kiểm tra là bắt được quả tang; ngụy biện thì mọi thứ bạn kiểm tra đều khớp mà kết luận vẫn hỏng — vì lỗi nằm ở cách suy.\n\n✓ Một lập luận có thể đúng cấu trúc (valid) mà vẫn không vững (sound), chỉ cần một căn cứ không có thật.\n\n✓ Căn cứ sai đó thường là cái không ai phát biểu ra: tiền đề ẩn. Cách moi nó ra là ba câu hỏi — kết luận là gì? căn cứ là gì? căn cứ nào bị giấu?',
    },
    {
      type: 'text',
      title: 'Một lời dặn quan trọng không kém',
      paragraphs: [
        'Có một cách hiểu sai bài này, và nó khá phổ biến: biến ba câu hỏi thành cây búa, gặp gì cũng nện. Nghe ai nói cũng đi lùng tiền đề ẩn, mua gì cũng ngờ, đọc gì cũng thấy bẫy. Được vài tuần thì kiệt sức, rồi bỏ luôn cả thói quen kiểm tra.',
        'Thứ nhất, tiền đề ẩn có mặt trong gần như mọi câu nói bình thường, và phần lớn hoàn toàn vô hại. Chuyện mang ô lúc trời mưa cũng giấu một mảnh, nhưng mảnh đó đúng và không ai tranh cãi.',
        'Thứ hai, giảm giá thật vẫn tồn tại. Pháp luật còn định nghĩa sẵn mốc so sánh hợp lệ. Chính vì có một mốc thật để so, việc kiểm tra mới có nghĩa.',
        'Thứ ba, và đây là cái đáng nhớ nhất: có những lập luận mua sắm **đứng vững hoàn toàn** — như phản ví dụ phí giao hàng 25.000đ ở đầu bài. Ở đó không có mảnh nào bị giấu để mà chất vấn.',
        'Nên mục tiêu của bộ công cụ này **không phải là bác bỏ**. Mục tiêu chỉ gồm hai bước: nêu mảnh bị giấu ra thành một câu tử tế, rồi hỏi nó có đúng không. Rất nhiều lần câu trả lời sẽ là "có" — và bạn bấm mua, nhẹ nhõm như thường, chỉ khác là lần này sự nhẹ nhõm có căn cứ.',
      ],
    },
    {
      type: 'text',
      title: 'Bài tới',
      paragraphs: [
        'Ba câu hỏi này dùng được cho mọi loại lập luận. Nhưng có một loại tiền đề ẩn xuất hiện thường xuyên tới mức xứng đáng được mổ riêng một bài.',
        'Bài tới (**B03: Tương quan ≠ Nhân quả**) chúng ta sẽ mở đúng loại đó ra xem. Đó là niềm tin ngầm rằng "cái này gây ra cái kia", chỉ vì hai thứ tình cờ đi cùng nhau. Đó là mảnh bị giấu phổ biến nhất mỗi khi bạn đọc một con số hay một biểu đồ — và cũng là mảnh khiến người ta gật đầu nhanh nhất.',
      ],
    },
  ] as ContentBlock[];
}
