/**
 * Script to ADD "Logic 101 ver 2 — Hệ miễn dịch thông tin" course to STAGING DB.
 *
 * Source materials:
 * - docs/01.lesson/final.md (theory text — 4577 words on Confirmation bias)
 * - docs/01.lesson/conversion-rules.md (rules for converting final.md → blocks)
 * - docs/01.lesson/block-plan.md (table of confirmed blocks)
 *
 * Scope of this run (Phase 1):
 * - Create category "Nền tảng Khoa học Xã hội" (if missing)
 * - Create course `logic-101-v2` (parallel to v1 `logic-101`)
 * - Create Level 1 "Lớp phòng thủ #1 — Nhận diện bias"
 * - Create Lesson 1 "Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy"
 *   with 32 confirmed content blocks (§0 + §1 + first half of §2)
 * - Seed 5 LibraryDocument records: Nickerson [c1], Wason [c2], Kahneman [c5],
 *   Kunda [c6], Tienphong cung hoàng đạo [v4]
 *
 * Out of scope (TODO future phases):
 * - Block 34+ (biased interpretation, Lord/Ross/Lepper, cherry-picking, Stage 3,
 *   §3, §4 interactive, §5)
 * - Image upload to Supabase Storage — placeholder URLs used; admin can
 *   replace via UI or via separate upload script later
 * - Library documents c3, c4 (only added when Block 34+ is grilled)
 *
 * Run with: cd tepup && npx tsx scripts/add-logic-101-v2-course.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// Course / Level / Lesson definitions
// ─────────────────────────────────────────────
const COURSE = {
  slug: 'logic-101-v2',
  name: 'Logic 101 ver 2 — Hệ miễn dịch thông tin',
  description:
    'Your Information Immune System — khoá nền tảng tư duy phản biện. Nhận diện bias, đọc thông tin tỉnh táo. Ví dụ trung tính (cung hoàng đạo, đầu tư, sức khỏe), không chính trị, không tôn giáo.',
  icon: 'brain',
};

const CATEGORY = {
  slug: 'nen-tang-khoa-hoc-xa-hoi',
  name: 'Nền tảng Khoa học Xã hội',
  description:
    'Các môn học nền tảng về xã hội, tư duy, chính trị — giúp người học hiểu cách xã hội vận hành và đọc thông tin tỉnh táo.',
  icon: 'brain',
};

const LEVEL_1_NAME = 'Lớp phòng thủ #1 — Nhận diện bias';

const LESSON_1 = {
  slug: 'logic101v2-1-confirmation-bias',
  name: 'Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy',
  contentTitle: 'Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy',
};

// ─────────────────────────────────────────────
// Image placeholders
// TODO: replace with Supabase Storage URLs after upload
// ─────────────────────────────────────────────
const IMG_SCATTER_NO_CORRELATION =
  'https://upload.wikimedia.org/wikipedia/commons/3/3a/Correlation_examples2.svg';
// Wikimedia generic correlation/no-correlation visual.
// Used for Block #5 (after the 15.000 people callout).
// Caption explains it represents the concept, not literal data.

const IMG_WASON_6_PANEL = '/images/placeholder/wason-2-4-6.png';
// User-provided 6-panel illustration of the Wason 2-4-6 experiment.
// File needs to be saved + uploaded to Supabase Storage.
// Until then, lesson page will show broken image at this position.

// ─────────────────────────────────────────────
// Library documents to seed
// ─────────────────────────────────────────────
const LIBRARY_DOCS = [
  {
    slug: 'tienphong-cung-hoang-dao',
    title: 'Xét tính cách theo cung hoàng đạo không đáng tin',
    description:
      'Bài báo Tienphong (2016) tổng hợp nghiên cứu phân tích dữ liệu hơn 15.000 người, không tìm thấy mối tương quan giữa ngày sinh và tính cách.',
    category: 'Báo VN — Tâm lý học đại chúng',
    icon: 'newspaper',
    sortOrder: 0,
    content: {
      sections: [
        {
          heading: 'Tóm tắt',
          paragraphs: [
            'Nghiên cứu dùng phương pháp thống kê và phân tích máy tính để kiểm tra dữ liệu chiêm tinh học của hơn 15.000 người. Kết quả: không tìm thấy mối tương quan nào giữa ngày sinh và tính cách của họ.',
            'Ý nghĩa: mô tả cung hoàng đạo về tính cách (vd. "Bọ Cạp sâu sắc, đam mê") không khớp với người sinh trong khoảng đó hơn một cách ngẫu nhiên.',
          ],
        },
        {
          heading: 'Nguồn',
          paragraphs: [
            'Tienphong: https://tienphong.vn/xet-tinh-cach-theo-cung-hoang-dao-khong-dang-tin-post45246.tpo',
          ],
        },
      ],
    },
  },
  {
    slug: 'nickerson-1998-confirmation-bias',
    title: 'Confirmation Bias: A Ubiquitous Phenomenon in Many Guises',
    description:
      'Bài review canonical của Raymond Nickerson (1998) tổng hợp toàn bộ nghiên cứu về thiên kiến xác nhận. Cover trọn 3 stage Input/Processing/Output.',
    category: 'Paper academic — Tâm lý học',
    icon: 'book-open',
    sortOrder: 1,
    content: {
      sections: [
        {
          heading: 'Tác giả & xuất bản',
          paragraphs: [
            'Raymond S. Nickerson, Tufts University.',
            'Review of General Psychology, 1998, Vol. 2, No. 2, 175-220.',
          ],
        },
        {
          heading: 'Tóm tắt',
          paragraphs: [
            'Nickerson định nghĩa confirmation bias là "xu hướng tìm kiếm hoặc diễn giải bằng chứng theo cách thiên về niềm tin sẵn có, kỳ vọng, hoặc giả thuyết đang xem xét".',
            'Ông gọi đây là "ubiquitous phenomenon" — hiện tượng có mặt khắp nơi, từ khoa học, chính trị, tôn giáo đến đầu tư và quan hệ cá nhân.',
            'Bài review tổng hợp các thí nghiệm classic (Wason 2-4-6, Lord/Ross/Lepper death penalty, Snyder/Swann hypothesis testing) và các sub-mechanism (selective exposure, biased interpretation, belief perseverance).',
          ],
        },
        {
          heading: 'Nguồn',
          paragraphs: [
            'SAGE Journals: https://journals.sagepub.com/doi/abs/10.1037/1089-2680.2.2.175',
          ],
        },
      ],
    },
  },
  {
    slug: 'wason-1960-2-4-6-task',
    title: 'On the failure to eliminate hypotheses in a conceptual task',
    description:
      'Thí nghiệm 2-4-6 cổ điển của Peter Wason (1960). Sinh viên đoán quy tắc đằng sau dãy số "2-4-6" — đa số chỉ test các bộ ba khẳng định giả thuyết, hiếm khi test bộ phá giả thuyết.',
    category: 'Paper academic — Tâm lý học',
    icon: 'flask-conical',
    sortOrder: 2,
    content: {
      sections: [
        {
          heading: 'Tác giả & xuất bản',
          paragraphs: [
            'Peter C. Wason, University College London.',
            'Quarterly Journal of Experimental Psychology, 1960, Vol. 12, No. 3, 129-140.',
          ],
        },
        {
          heading: 'Thí nghiệm',
          paragraphs: [
            'Wason đưa cho mỗi sinh viên dãy "2-4-6" và bảo họ đoán quy tắc đằng sau. Sinh viên được test giả thuyết bằng cách đề xuất các bộ ba số mới và Wason sẽ nói "đúng" hoặc "sai".',
            'Đa số sinh viên đoán "số chẵn tăng dần" rồi test bằng các bộ "4-6-8", "10-12-14", "20-22-24" — đều khớp với giả thuyết của họ.',
            'Quy tắc thật chỉ là "ba số tăng dần" — bất kỳ ba số nào tăng. Sinh viên hiếm khi thử các bộ phá giả thuyết (vd. "1-2-3", "5-7-100"). Kết quả: chỉ 6/29 sinh viên ra quy tắc đúng ngay lần đầu.',
          ],
        },
        {
          heading: 'Ý nghĩa',
          paragraphs: [
            'Đây là phiên bản phòng thí nghiệm sạch nhất của confirmation bias — không cảm xúc, không chính trị, không stake. Não vẫn tự động tìm bằng chứng "khớp" và bỏ qua bằng chứng phủ định.',
          ],
        },
        {
          heading: 'Nguồn',
          paragraphs: [
            'SAGE Journals: https://journals.sagepub.com/doi/10.1080/17470216008416717',
          ],
        },
      ],
    },
  },
  {
    slug: 'kahneman-thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    description:
      'Sách của Daniel Kahneman (2011) — phân biệt System 1 (Hệ 1, tư duy nhanh, tự động) với System 2 (Hệ 2, tư duy chậm, có chủ ý). Nền tảng cơ chế giải thích vì sao confirmation bias chạy ngầm.',
    category: 'Sách — Tâm lý học hành vi',
    icon: 'book',
    sortOrder: 3,
    content: {
      sections: [
        {
          heading: 'Tác giả & xuất bản',
          paragraphs: [
            'Daniel Kahneman — Nobel Prize Economics 2002.',
            'Farrar, Straus and Giroux, 2011.',
          ],
        },
        {
          heading: 'Khái niệm chính',
          paragraphs: [
            'Hệ 1 (System 1): nhanh, tự động, không nỗ lực — dựa trên trực giác và pattern matching. Chạy mặc định trong não, không cần "huy động".',
            'Hệ 2 (System 2): chậm, có chủ ý, tốn năng lượng — dùng logic chính thức. Chỉ kích hoạt khi cần.',
            'Tin "khớp" thì Hệ 1 vẫy tay cho qua. Tin "không khớp" thì cần Hệ 2 xử lý — nhưng Hệ 2 lười, nên thường bypass. Đây là lý do confirmation bias chạy tự động.',
          ],
        },
        {
          heading: 'Nguồn',
          paragraphs: [
            'Wikipedia: https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow',
          ],
        },
      ],
    },
  },
  {
    slug: 'kunda-1990-motivated-reasoning',
    title: 'The case for motivated reasoning',
    description:
      'Bài 1990 của Ziva Kunda chỉ ra: người ta đi đến kết luận họ muốn đi, miễn là có thể xây được lý lẽ nghe có vẻ hợp lý để biện minh kết luận đó.',
    category: 'Paper academic — Tâm lý học',
    icon: 'brain-circuit',
    sortOrder: 4,
    content: {
      sections: [
        {
          heading: 'Tác giả & xuất bản',
          paragraphs: [
            'Ziva Kunda — nhà tâm lý học người Israel-Canada, University of Waterloo.',
            'Psychological Bulletin, 1990, Vol. 108, No. 3, 480-498.',
          ],
        },
        {
          heading: 'Luận điểm chính',
          paragraphs: [
            'Quote nguyên văn: "people are more likely to arrive at conclusions that they want to arrive at, but their ability to do so is constrained by their ability to construct seemingly reasonable justifications for these conclusions."',
            'Cụm "miễn là" (constrained by) là điểm then chốt: motivated reasoning không phải "tin bất chấp" — bạn vẫn dùng logic, vẫn nghĩ mình suy luận hợp lý. Chỉ là logic được dùng theo kiểu công cụ phục vụ kết luận, chứ không phải để tìm kết luận.',
          ],
        },
        {
          heading: 'Nguồn',
          paragraphs: [
            'PubMed: https://pubmed.ncbi.nlm.nih.gov/2270237/',
          ],
        },
      ],
    },
  },
];

// ─────────────────────────────────────────────
// Lesson 1 content blocks (32 blocks per block-plan.md)
// ─────────────────────────────────────────────
const LESSON_1_BLOCKS: any[] = [
  // ============= §0 HOOK =============

  // Block 1
  {
    type: 'text',
    paragraphs: [
      "Sáng nay bạn check ứng dụng tử vi. Cung Bọ Cạp được mô tả \"tuần này sẽ gặp cơ hội bất ngờ trong công việc — chuẩn bị tinh thần\". Bạn screenshot, vì cảm giác \"đúng quá\". Chiều, sếp gọi bạn vào phòng họp và đề xuất bạn lead một dự án mới. Bạn thầm gật đầu: \"Tử vi đúng thật.\"",
    ],
  },

  // Block 2
  {
    type: 'text',
    paragraphs: [
      'Một câu chuyện rất phổ biến. Nhưng có một thống kê đáng để dừng lại.',
    ],
  },

  // Block 3
  {
    type: 'callout',
    variant: 'info',
    icon: 'bar-chart-3',
    text: 'Một nghiên cứu phân tích dữ liệu của hơn 15.000 người, đối chiếu ngày sinh với tính cách, **không tìm thấy mối tương quan nào** giữa cung hoàng đạo và đặc điểm cá nhân. [citation: v4]',
  },

  // Block 4
  {
    type: 'text',
    paragraphs: [
      'Nói cách khác, về mặt thống kê, mô tả Bọ Cạp "sâu sắc, đam mê, hay ghen tuông" không khớp với người sinh trong khoảng đó hơn một cách ngẫu nhiên. Khớp với người sinh tháng Một, tháng Sáu, tháng Mười Một cũng tương đương.',
    ],
  },

  // Block 5
  {
    type: 'image',
    src: IMG_SCATTER_NO_CORRELATION,
    alt: 'Biểu đồ scatter plot không có pattern — minh hoạ "không tương quan"',
    caption:
      'Phân tích 15.000 người: ngày sinh và tính cách không có mối liên hệ thống kê. (Hình minh hoạ ý niệm — đại diện cho kết quả nghiên cứu, không phải data thật từ paper.)',
  },

  // Block 6
  {
    type: 'library-document',
    mode: 'reference',
    documentSlug: 'tienphong-cung-hoang-dao',
  },

  // Block 7
  {
    type: 'text',
    paragraphs: [
      'Nhưng bạn vẫn thấy "đúng với mình ghê". Và bạn cảm nhận điều đó thật — không phải đang giả vờ.',
    ],
  },

  // Block 8
  {
    type: 'callout',
    variant: 'info',
    icon: 'help-circle',
    text: "Câu hỏi: vì sao một mô tả \"sai về mặt khoa học\" lại cảm giác \"đúng cá nhân\" với hàng triệu người? Và vì sao ngay cả khi bạn vừa đọc xong nghiên cứu phủ định, bạn vẫn tin? Câu trả lời nằm ở một thứ gọi là **confirmation bias** (tạm dịch: thiên kiến xác nhận) — cơ chế não bộ chạy tự động trong đầu mọi người, kể cả các nhà khoa học vài chục năm kinh nghiệm.",
  },

  // Block 9 — Roadmap
  {
    type: 'text',
    title: 'Bài này sẽ làm 3 việc',
    paragraphs: [
      'Một, bóc tách cách confirmation bias hoạt động qua một vòng lặp 3 giai đoạn — dùng đúng ví dụ cung hoàng đạo bạn vừa đọc, vì nó sạch và "vô hại".',
      'Hai, chỉ ra các sub-type cụ thể: motivated reasoning, biased interpretation, cherry-picking, belief perseverance, echo chamber.',
      'Ba, đưa bạn một bộ lọc 2 trigger ngắn gọn để biết khi nào cần pause — và áp dụng nó lên những thứ có stake thật như tiền tiết kiệm hay sức khoẻ.',
    ],
  },

  // ============= §1 KHÁI NIỆM CỐT LÕI =============

  // Block 10
  {
    type: 'text',
    title: '§1. Khái niệm cốt lõi',
    paragraphs: [
      "**Confirmation bias** — gọi cho gọn là **thiên kiến xác nhận** — là **xu hướng não tự lọc thông tin để khớp với những gì bạn đã tin sẵn**. Định nghĩa này đến từ Raymond Nickerson, người tổng hợp toàn bộ nghiên cứu về hiện tượng này trong một bài review của Review of General Psychology năm 1998 [citation: c1]. Nickerson dùng cụm từ \"ubiquitous phenomenon\" — hiện tượng có mặt ở khắp nơi — để mô tả phạm vi của nó. Không có lĩnh vực nào của đời sống tinh thần thoát khỏi nó: khoa học, chính trị, tôn giáo, đầu tư, tình yêu, kể cả cách bạn nhớ những gì xảy ra trong cuộc cãi nhau với người yêu hôm qua.",
    ],
  },

  // Block 11
  {
    type: 'library-document',
    mode: 'reference',
    documentSlug: 'nickerson-1998-confirmation-bias',
  },

  // Block 12
  {
    type: 'callout',
    variant: 'info',
    icon: 'alert-circle',
    text: "Quan trọng để nắm trước khi đi sâu: confirmation bias **không** phải là quyết định có ý thức kiểu \"tôi sẽ chỉ nghe người đồng ý với tôi\". Nếu là quyết định có ý thức, bạn đã có thể \"đổi quyết định\". Nó là một quá trình **chạy ngầm**, trước khi bạn kịp suy nghĩ. Đến lúc bạn nhận ra, kết luận đã hình thành rồi — bạn chỉ thấy mình \"đồng ý với điều mình đang đọc\" mà không nhận ra mình đã đồng ý trước khi đọc.",
  },

  // Block 13
  {
    type: 'text',
    paragraphs: [
      'Để hình dung cụ thể, có thể nhìn confirmation bias như một **vòng lặp 3 giai đoạn**:',
    ],
  },

  // Block 14 — Stage 1
  {
    type: 'text',
    title: 'Stage 1 — Input (nạp thông tin)',
    paragraphs: [
      "Bạn chỉ chú ý tới thông tin \"khớp\" với niềm tin. Cùng một feed Facebook, bạn dừng đọc bài \"Scorpio sâu sắc\" 30 giây, nhưng scroll qua bài \"tử vi vô căn cứ\" trong 1 giây. Bạn không cố tình tránh — đầu bạn thấy bài kia \"kém hấp dẫn\" hơn. Nó cũng có thể là chuyện chủ động: tìm kiếm trên Google \"Scorpio personality\" và không bao giờ search \"astrology debunked\". Đây là **selective attention** (chọn lọc chú ý) và **selective exposure** (chọn lọc tiếp xúc).",
    ],
  },

  // Block 15 — Stage 2
  {
    type: 'text',
    title: 'Stage 2 — Processing (xử lý thông tin)',
    paragraphs: [
      "Ngay cả khi bằng chứng ngược chiều lọt vào não, bạn diễn giải lại theo hướng có lợi cho niềm tin. \"Hôm nay Scorpio không huyền bí lắm\" được giải thích bằng \"vì Mercury đang nghịch hành\" hay \"vì Mặt trăng ở vị trí khác\", chứ không phải bằng \"vì mô tả sai\". Bạn xử lý bằng chứng theo cách giữ kết luận, không xét lại kết luận theo bằng chứng.",
    ],
  },

  // Block 16 — Stage 3
  {
    type: 'text',
    title: 'Stage 3 — Output (xuất ra: nhớ, hành động, củng cố)',
    paragraphs: [
      "Bạn nhớ rõ những lần \"tử vi đúng\" và quên những lần sai. Khi bị bạn bè phản bác, niềm tin của bạn không yếu đi — thậm chí có khi mạnh hơn. Đây gọi là **belief perseverance** (niềm tin trơ lì). Vòng lặp khép lại bằng cách thay đổi cả Input cho lần sau: bạn follow thêm 3 page astrology nữa.",
    ],
  },

  // Block 17 — Synthesis 3-stage
  {
    type: 'callout',
    variant: 'info',
    icon: 'repeat',
    text: "Ba giai đoạn này feed lẫn nhau, tạo thành một vòng lặp tự củng cố. **Càng tin, càng lọc; càng lọc, càng tin.** Đó là lý do người mất 5 năm tin cung hoàng đạo rất khó \"thoát\" chỉ bằng một bài fact-check, dù bài đó có 15.000 mẫu nghiên cứu.",
  },

  // Block 18 — Meta moment + Wason intro (thuần Việt)
  {
    type: 'text',
    paragraphs: [
      "Đến đây bạn có thể đang nghĩ: \"Cái này chỉ xảy ra với người dễ tin.\" Trớ trêu thay, lý do bạn nghĩ thế có thể chính là thiên kiến xác nhận đang chạy — bạn muốn tin rằng mình thuộc loại \"không dễ tin\". Nhưng có một thí nghiệm cổ điển của Peter Wason năm 1960 cho thấy ngay cả sinh viên đại học giỏi cũng mắc, ngay cả khi không có cảm xúc, không có gì đáng để mất, không có ai đang theo dõi [citation: c2].",
    ],
  },

  // Block 19 — Wason 6-panel image (placeholder until upload)
  {
    type: 'image',
    src: IMG_WASON_6_PANEL,
    alt: 'Thí nghiệm 2-4-6 của Wason — 6-panel illustration',
    caption:
      'Thí nghiệm 2-4-6 của Wason — sinh viên giỏi vẫn chỉ test bộ ba khẳng định giả thuyết, hiếm khi test bộ phá giả thuyết.',
  },

  // Block 20
  {
    type: 'library-document',
    mode: 'reference',
    documentSlug: 'wason-1960-2-4-6-task',
  },

  // Block 21 — Wason synthesis
  {
    type: 'text',
    paragraphs: [
      "Đó chính là confirmation bias trong phiên bản phòng thí nghiệm sạch nhất. Không có cảm xúc, không có chính trị, không có cung hoàng đạo. Não vẫn tự động tìm bằng chứng \"khớp\" và bỏ qua bằng chứng phủ định. Nói cách khác, kể cả khi bạn nghĩ mình đang \"kiểm tra\" một giả thuyết, có khả năng cao bạn chỉ đang **xác nhận** nó.",
    ],
  },

  // Block 22 — Kahneman System 1/2 (thuần Việt)
  {
    type: 'text',
    title: 'Tại sao não làm vậy? Hệ 1 vs Hệ 2',
    paragraphs: [
      "Tại sao não làm vậy? Daniel Kahneman gọi đó là sản phẩm của **Hệ 1 (System 1)** — kiểu tư duy nhanh, tự động, vận hành không cần năng lượng [citation: c5]. Kahneman phân biệt Hệ 1 (nhanh, không nỗ lực, dựa trên trực giác và khớp mẫu) với **Hệ 2 (System 2)** (chậm, có chủ ý, tốn năng lượng, dùng logic chính thức). Tin \"khớp\" thì Hệ 1 vẫy tay cho qua — không cần Hệ 2 xử lý. Tin \"không khớp\" thì cần Hệ 2 huy động — và Hệ 2 thì... lười. Não con người tiến hoá để tiết kiệm calo, không phải để chính xác. Một quyết định \"khớp giả thuyết có sẵn\" tiết kiệm hơn nhiều một quyết định \"đánh giá lại từ đầu\".",
    ],
  },

  // Block 23
  {
    type: 'library-document',
    mode: 'reference',
    documentSlug: 'kahneman-thinking-fast-and-slow',
  },

  // Block 24 — §1 closing
  {
    type: 'callout',
    variant: 'success',
    icon: 'check-circle-2',
    text: "Thiên kiến xác nhận không phải lỗi của \"người kém thông minh\" — nó là vòng lặp 3 giai đoạn chạy tự động trong mọi não, kể cả của bạn.",
  },

  // ============= §2 ĐÀO SÂU (partial — Block 25-32) =============

  // Block 25 — Stage 1 detailed (user wording)
  {
    type: 'text',
    title: 'Stage 1 — Input: bạn nạp gì thì não tin cái đó',
    paragraphs: [
      '**Tiếp xúc chọn lọc (selective exposure)** và **chú ý chọn lọc (selective attention)** là hai cơ chế của giai đoạn này.',
      '- Tiếp xúc chọn lọc là chủ động chọn trước nguồn thông tin (follow page nào, tải app nào, vào group nào).',
      '- Chú ý chọn lọc là chú ý có chọn lọc trong cùng một dòng thông tin (cùng feed, bạn dừng ở bài này, scroll qua bài kia).',
    ],
  },

  // Block 26 — Facebook feed evolution
  {
    type: 'text',
    paragraphs: [
      "Ví dụ cụ thể: bạn follow page \"Astrology Vietnam\" trên Facebook và 3 account astrology trên Threads. Mỗi sáng feed đẩy 5 bài về tử vi, có khi nhiều hơn. Bạn dừng đọc bài \"Scorpio và cách yêu\" trong 2 phút. Bạn lướt qua bài \"Nghiên cứu phủ định mọi liên hệ giữa ngày sinh và tính cách\" trong gần như tích tắc. Tuần sau, **thuật toán** học bạn thích nội dung nào — đẩy thêm bài astrology, ít bài debunk. Đến tháng sau, feed bạn gần như chỉ còn ủng hộ tử vi (pro-astrology). Đến năm sau, bạn nghĩ \"ai cũng tin tử vi mà\" — vì trong môi trường thông tin của bạn, đúng là vậy.",
    ],
  },

  // Block 27 — Algorithm warning
  {
    type: 'callout',
    variant: 'warning',
    icon: 'alert-triangle',
    text: 'Quan trọng: thuật toán không **tạo ra** tiếp xúc chọn lọc. Người tự xây tiếp xúc chọn lọc trước khi có thuật toán. Trước khi mạng xã hội có news feed, người ta vẫn chọn đọc báo nào, mua tạp chí nào, vào hội nhóm offline nào. Thuật toán chỉ **khuếch đại (amplify)** — tăng tốc và mở rộng quy mô của xu hướng có sẵn.',
  },

  // Block 28 — Stage 2 intro
  {
    type: 'text',
    title: 'Stage 2 — Processing: cùng dữ liệu, hai diễn giải',
    paragraphs: [
      'Khi bằng chứng ngược chiều cuối cùng cũng lọt vào não (ai đó share bài debunk vào group, người yêu cãi với bạn về tử vi), Stage 2 mới là nơi nhiều thứ thú vị xảy ra. Có ít nhất 3 cơ chế chạy song song:',
    ],
  },

  // Block 29 — Motivated reasoning intro + Kunda quote (user wording)
  {
    type: 'text',
    title: 'Motivated reasoning (suy luận có động cơ)',
    paragraphs: [
      "Ziva Kunda — nhà tâm lý học người Israel-Canada — chỉ ra trong một bài 1990 có ảnh hưởng rất lớn: \"người ta có xu hướng đi đến kết luận họ muốn đi, miễn là họ có thể xây được một lý lẽ nghe có vẻ hợp lý để biện minh kết luận đó\" [citation: c6]",
    ],
  },

  // Block 30 — Motivated reasoning explanation (user wording)
  {
    type: 'text',
    paragraphs: [
      "Cái hay là cụm \"miễn là\" — nghĩa là motivated reasoning không phải \"tin bất chấp\". Bạn vẫn dùng logic, vẫn nghĩ mình đang suy luận hợp lý. Chỉ là logic được dùng theo kiểu công cụ phục vụ kết luận, chứ không phải để tìm kết luận.",
    ],
  },

  // Block 31 — Song Tử example (user wording, 1 paragraph dài)
  {
    type: 'text',
    paragraphs: [
      "Ví dụ: Bạn đọc tử vi thấy: \"Tuần này Song Tử sẽ gặp chuyện tình cảm bất ngờ.\" Cả tuần trôi qua, không có chuyện tình cảm nào xảy ra. Thay vì nghĩ: \"Có khi tử vi không đúng.\" Bạn tự giải thích: \"Chắc 'tình cảm' không chỉ là yêu đương, có thể là nói chuyện với bạn cũ.\" / \"Có thể sự kiện chưa tới, chắc cuối tuần mới ứng nghiệm.\" / \"Có khi mình đã bỏ lỡ tín hiệu của vũ trụ.\" Kết quả: Nếu có chuyện xảy ra → \"Tử vi đúng.\" Nếu không có gì xảy ra → \"Mình chưa hiểu đúng ý tử vi.\" Vậy nên dù kết quả nào xảy ra, tử vi vẫn luôn đúng trong mắt bạn.",
    ],
  },

  // Block 32 — Library-doc Kunda (placed AFTER example per user)
  {
    type: 'library-document',
    mode: 'reference',
    documentSlug: 'kunda-1990-motivated-reasoning',
  },
];

// ─────────────────────────────────────────────
// Main seeding function
// ─────────────────────────────────────────────
async function main() {
  console.log('=== Seeding "Logic 101 ver 2 — Hệ miễn dịch thông tin" course ===\n');

  // 1. Ensure category exists
  console.log(`Setting up category "${CATEGORY.slug}"...`);
  let category = await prisma.category.findUnique({ where: { slug: CATEGORY.slug } });
  if (!category) {
    const maxSortOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
    category = await prisma.category.create({
      data: {
        slug: CATEGORY.slug,
        name: CATEGORY.name,
        description: CATEGORY.description,
        icon: CATEGORY.icon,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: true,
      },
    });
    console.log(`  ✅ Created category: ${category.name}\n`);
  } else {
    console.log(`  Found existing category: ${category.name} (${category.id})\n`);
  }

  // 2. Seed library documents (idempotent)
  console.log(`Seeding ${LIBRARY_DOCS.length} library documents...`);
  for (const doc of LIBRARY_DOCS) {
    const existing = await prisma.libraryDocument.findUnique({
      where: { slug: doc.slug },
    });
    if (existing) {
      console.log(`  ⏭️  ${doc.slug} — exists, skipping`);
      continue;
    }
    await prisma.libraryDocument.create({
      data: {
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        icon: doc.icon,
        sortOrder: doc.sortOrder,
        content: doc.content as any,
        isActive: true,
      },
    });
    console.log(`  ✅ Created: ${doc.slug} — ${doc.title}`);
  }
  console.log('');

  // 3. Check duplicate course
  const existingCourse = await prisma.course.findUnique({
    where: { slug: COURSE.slug },
  });
  if (existingCourse) {
    console.log(`⚠️  Course "${COURSE.slug}" already exists. Aborting to avoid duplicates.`);
    console.log('   Delete it manually first if you want to recreate it.');
    return;
  }

  // 4. Get sortOrder for new course within category
  const maxCourseSortOrder = await prisma.course.aggregate({
    where: { categoryId: category.id },
    _max: { sortOrder: true },
  });
  const courseSortOrder = (maxCourseSortOrder._max.sortOrder ?? -1) + 1;

  // 5. Create course
  const course = await prisma.course.create({
    data: {
      slug: COURSE.slug,
      name: COURSE.name,
      description: COURSE.description,
      icon: COURSE.icon,
      isNew: true,
      isActive: true,
      categoryId: category.id,
      sortOrder: courseSortOrder,
    },
  });
  console.log(`✅ Created course: ${course.name} (slug: ${course.slug})\n`);

  // 6. Create Level 1
  const level1 = await prisma.level.create({
    data: {
      name: LEVEL_1_NAME,
      courseId: course.id,
      sortOrder: 0,
    },
  });
  console.log(`  📁 Level 1: ${level1.name}`);

  // 7. Create Lesson 1
  const lesson1 = await prisma.lesson.create({
    data: {
      slug: LESSON_1.slug,
      name: LESSON_1.name,
      levelId: level1.id,
      courseId: level1.courseId,
      sortOrder: 0,
      isActive: true,
    },
  });
  console.log(`    📄 Lesson 1: ${lesson1.name} (slug: ${lesson1.slug})`);

  // 8. Create LessonContent
  await prisma.lessonContent.create({
    data: {
      lessonId: lesson1.id,
      title: LESSON_1.contentTitle,
      blocks: LESSON_1_BLOCKS as any,
    },
  });
  console.log(`      ✍️  Content added (${LESSON_1_BLOCKS.length} blocks)\n`);

  console.log('🎉 Done.\n');
  console.log('Next steps:');
  console.log('  1. Open course on web: visit /courses/logic-101-v2');
  console.log('  2. Replace placeholder image for Wason 6-panel (Block 19)');
  console.log('     — upload to Supabase Storage bucket course_images,');
  console.log('       then update IMG_WASON_6_PANEL constant.');
  console.log('  3. Continue grilling Block 34+ (biased interpretation, etc.).');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
