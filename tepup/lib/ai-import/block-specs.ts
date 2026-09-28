/**
 * Mô tả từng loại block cho AI bên ngoài (ChatGPT, Claude, Gemini…).
 *
 * JSON Schema chỉ nói được "trường nào, kiểu gì". Phần này bổ sung cái schema không
 * nói được: block dùng để làm gì, ý nghĩa từng trường, luật viết, và một ví dụ điền
 * đầy đủ. Block vừa tạo trong editor chỉ có giá trị rỗng, nên thiếu phần này AI sẽ
 * đoán mò.
 *
 * Ràng buộc máy kiểm được đã nằm trong `lib/schemas/blocks.ts`; ở đây chỉ nhắc lại
 * bằng lời để AI làm đúng ngay lần đầu.
 */
import { FLIP_CARD_LIMITS, PAIR_MATCH_LIMITS } from '@/lib/blockLimits';

export interface BlockSpec {
  label: string;
  purpose: string;
  fields: string[];
  rules: string[];
  example: Record<string, unknown>;
}

const FORMULA_RULE =
  'Công thức/điều kiện là biểu thức JavaScript CHỈ gồm: số, biến đã khai báo, + - * / %, ngoặc, so sánh (< <= > >= === !==), && ||, `? :` và Math.abs/min/max/round/floor/ceil/pow/sqrt/log/log10/exp/sign/trunc, Math.PI, Math.E. Không dùng chuỗi, dấu chấm phẩy, phép gán hay hàm khác.';

export const BLOCK_SPECS: Record<string, BlockSpec> = {
  text: {
    label: 'Văn bản',
    purpose: 'Đoạn văn giảng giải. Mỗi phần tử của `paragraphs` là một đoạn.',
    fields: [
      '`title` (tuỳ chọn): tiêu đề nhỏ của đoạn.',
      '`paragraphs`: mảng các đoạn văn. Hỗ trợ **in đậm** và *in nghiêng* kiểu Markdown.',
    ],
    rules: ['Mỗi đoạn 2–4 câu, một ý chính.', 'Không dùng trường `html`.'],
    example: {
      type: 'text',
      title: 'Thuế gián tiếp là gì?',
      paragraphs: [
        'Thuế gián tiếp là loại thuế **cộng vào giá** hàng hoá, dịch vụ. Người mua trả, người bán nộp thay.',
        'Ví dụ quen thuộc nhất là VAT: mỗi ly cà phê 30.000đ thường đã gồm khoảng 2.700đ thuế.',
      ],
    },
  },

  image: {
    label: 'Hình ảnh',
    purpose: 'Một hình minh hoạ.',
    fields: [
      '`src`: URL ảnh. Để chuỗi rỗng nếu chưa có — người soạn sẽ tự upload.',
      '`alt`: mô tả ảnh cho người khiếm thị (bắt buộc).',
      '`caption` (tuỳ chọn): chú thích hiển thị dưới ảnh.',
    ],
    rules: ['Không bịa URL. Nếu không có URL thật, để `src: ""` và mô tả kỹ ảnh cần có trong `alt`.'],
    example: {
      type: 'image',
      src: '',
      alt: 'Biểu đồ cột so sánh tỉ lệ VAT trên thu nhập của nhóm thu nhập thấp và cao',
      caption: 'Cùng một mức VAT, người thu nhập thấp chịu tỉ lệ cao hơn.',
    },
  },

  callout: {
    label: 'Callout',
    purpose: 'Hộp nhấn mạnh: câu hỏi trung tâm của bài, lưu ý quan trọng hoặc tóm tắt cuối bài.',
    fields: [
      '`variant`: "info" (thông tin, câu hỏi trung tâm), "warning" (cảnh báo, hiểu lầm), "success" (tóm tắt cuối bài).',
      '`icon` (tuỳ chọn): "lightbulb" | "message" | "warning" | "check".',
      '`title` (tuỳ chọn): tiêu đề hộp.',
      '`text`: nội dung. Xuống dòng bằng \\n, gạch đầu dòng bằng "• " hoặc "✓ ".',
    ],
    rules: ['Callout tóm tắt cuối bài dùng variant "success" và các dòng bắt đầu bằng "✓ ".'],
    example: {
      type: 'callout',
      variant: 'success',
      icon: 'check',
      title: 'Điều cần nhớ',
      text: '✓ Thuế gián tiếp nằm sẵn trong giá bạn trả\n✓ VAT phổ thông ở Việt Nam là 10%\n✓ Người thu nhập thấp chịu tỉ lệ VAT cao hơn',
    },
  },

  question: {
    label: 'Câu hỏi trắc nghiệm',
    purpose: 'Câu hỏi kiểm tra hiểu bài hoặc câu hỏi "thiên kiến" mở đầu bài để lật lại một hiểu lầm phổ biến.',
    fields: [
      '`question`: nội dung câu hỏi.',
      '`mode`: "single" (một đáp án đúng) hoặc "multiple" (nhiều đáp án đúng).',
      '`options`: danh sách lựa chọn, mỗi lựa chọn có `id` ("a", "b", …), `text`, `isCorrect`.',
      '`explanation`: lời giải thích hiện sau khi trả lời — dạy lại kiến thức, không chỉ nói đúng/sai.',
    ],
    rules: [
      'Nên có 4 lựa chọn.',
      'mode "single": đúng MỘT lựa chọn có isCorrect: true. mode "multiple": ít nhất HAI.',
      'Các phương án sai phải hợp lý, phản ánh hiểu lầm có thật.',
    ],
    example: {
      type: 'question',
      question: 'Bạn nghĩ người có thu nhập thấp có phải đóng thuế không?',
      mode: 'single',
      options: [
        { id: 'a', text: 'Không, vì họ chưa đến ngưỡng đóng thuế thu nhập cá nhân', isCorrect: false },
        { id: 'b', text: 'Có, qua thuế gián tiếp như VAT mỗi lần mua hàng', isCorrect: true },
        { id: 'c', text: 'Chỉ khi họ kinh doanh', isCorrect: false },
        { id: 'd', text: 'Chỉ khi họ sở hữu nhà đất', isCorrect: false },
      ],
      explanation:
        'Ai mua hàng cũng trả VAT, kể cả người chưa phải đóng thuế thu nhập. Vì vậy gần như mọi người dân đều là người đóng thuế.',
    },
  },

  'library-document': {
    label: 'Tài liệu đọc thêm',
    purpose: 'Tài liệu đọc thêm đặt cuối bài, viết trực tiếp (mode "inline").',
    fields: [
      '`mode`: luôn là "inline".',
      '`title`, `description`, `category`, `estimatedReadTime` (vd "5 phút").',
      '`documentContent.sections`: các mục, mỗi mục có `heading` và `paragraphs`.',
      '`documentContent.relatedConcepts` (tuỳ chọn): khái niệm liên quan.',
      '`documentContent.furtherReading` (tuỳ chọn): nguồn tham khảo — ghi rõ tên nguồn thật, không bịa.',
    ],
    rules: ['Không dùng `documentId`/`documentSlug`.', 'Chỉ trích nguồn có thật.'],
    example: {
      type: 'library-document',
      mode: 'inline',
      title: 'Đọc thêm: Hệ thống thuế Việt Nam',
      description: 'Tổng quan các loại thuế chính tại Việt Nam',
      category: 'Kinh tế học',
      estimatedReadTime: '5 phút',
      documentContent: {
        sections: [
          {
            heading: 'Thuế trực tiếp',
            paragraphs: ['Thuế thu nhập cá nhân có 7 bậc lũy tiến từ 5% đến 35%.'],
          },
          {
            heading: 'Thuế gián tiếp',
            paragraphs: ['VAT phổ thông là 10%; một số mặt hàng thiết yếu chịu 5%.'],
          },
        ],
        relatedConcepts: ['Thuế lũy tiến', 'Thuế lũy thoái'],
        furtherReading: ['Luật Thuế giá trị gia tăng 2008 (sửa đổi)'],
      },
    },
  },

  calculator: {
    label: 'Máy tính',
    purpose: 'Người học nhập vài con số và thấy kết quả tính ngay (thuế, lãi kép, lạm phát…).',
    fields: [
      '`calculatorType`: "tax" | "compound-interest" | "inflation" | "custom".',
      '`inputs`: các ô nhập. `id` là TÊN BIẾN dùng trong công thức (chỉ chữ, số, _). `type` "number" hoặc "select" (select cần `options: [{ value, label }]`). `defaultValue`, `min`, `max`, `step`, `unit`.',
      '`formula`: công thức chính (dùng các id của inputs).',
      '`outputs`: các dòng kết quả, mỗi dòng có `formula` riêng; `highlight: true` cho kết quả quan trọng nhất.',
      '`presets` (tuỳ chọn): bộ giá trị mẫu, `values` là object { idInput: số }.',
      '`insight` (tuỳ chọn): nhận xét rút ra từ máy tính.',
    ],
    rules: [FORMULA_RULE, 'Kết quả hiển thị được làm tròn về số nguyên — chọn đơn vị phù hợp (vd "triệu").'],
    example: {
      type: 'calculator',
      title: 'Lãi kép sau N năm',
      description: 'Xem khoản tiết kiệm tăng thế nào khi lãi được cộng dồn.',
      calculatorType: 'compound-interest',
      inputs: [
        { id: 'principal', label: 'Số tiền gửi', type: 'number', unit: 'triệu', defaultValue: 100, min: 1, max: 10000, step: 1 },
        { id: 'rate', label: 'Lãi suất/năm', type: 'number', unit: '%', defaultValue: 6, min: 0, max: 20, step: 0.5 },
        { id: 'years', label: 'Số năm', type: 'number', unit: 'năm', defaultValue: 10, min: 1, max: 40, step: 1 },
      ],
      formula: 'principal * Math.pow(1 + rate / 100, years)',
      outputs: [
        { id: 'total', label: 'Tổng sau kỳ hạn', formula: 'principal * Math.pow(1 + rate / 100, years)', unit: 'triệu', highlight: true },
        { id: 'interest', label: 'Tiền lãi', formula: 'principal * Math.pow(1 + rate / 100, years) - principal', unit: 'triệu' },
      ],
      presets: [
        { label: 'Gửi ngắn hạn', values: { principal: 100, rate: 5, years: 3 } },
        { label: 'Tích luỹ dài hạn', values: { principal: 100, rate: 7, years: 30 } },
      ],
      insight: 'Thời gian quan trọng hơn lãi suất: gấp đôi số năm thường tạo ra nhiều hơn gấp đôi tiền lãi.',
    },
  },

  'slider-simulator': {
    label: 'Simulator (thanh trượt)',
    purpose: 'Người học kéo thanh trượt và xem các chỉ số, biểu đồ cột, thông điệp thay đổi theo.',
    fields: [
      '`sliders`: thanh trượt. `id` là TÊN BIẾN (chữ, số, _); `min`, `max`, `step`, `defaultValue`, `unit`.',
      '`outputs`: chỉ số, mỗi cái có `formula` và `format` "number" | "percent" | "currency".',
      '`chart` (tuỳ chọn): `{ type: "bar", bars: [{ label, formula, color }] }`. `color` là class Tailwind như "bg-red-400".',
      '`breakpoints` (tuỳ chọn): thông điệp hiện khi `condition` đúng; `variant` "info" | "warning" | "success".',
    ],
    rules: [FORMULA_RULE, '`defaultValue` phải nằm trong [min, max].', 'Breakpoints nên phủ các vùng giá trị khác nhau và kể một câu chuyện.'],
    example: {
      type: 'slider-simulator',
      title: 'VAT chiếm bao nhiêu phần thu nhập?',
      description: 'Kéo thu nhập để so sánh gánh nặng VAT và thuế TNCN.',
      sliders: [{ id: 'income', label: 'Thu nhập hàng tháng', min: 4, max: 80, step: 1, defaultValue: 15, unit: 'triệu' }],
      outputs: [
        { id: 'vatPercent', label: 'VAT / Thu nhập', formula: '(income * 0.06 + 0.06) / income * 100', format: 'percent' },
        { id: 'pitPercent', label: 'TNCN / Thu nhập', formula: 'income <= 12.3 ? 0 : Math.min(35, (income - 12.3) * 0.8)', format: 'percent' },
      ],
      chart: {
        type: 'bar',
        bars: [
          { label: 'VAT (%)', formula: '(income * 0.06 + 0.06) / income * 100', color: 'bg-red-400' },
          { label: 'TNCN (%)', formula: 'income <= 12.3 ? 0 : Math.min(35, (income - 12.3) * 0.8)', color: 'bg-blue-500' },
        ],
      },
      breakpoints: [
        { condition: 'income <= 8', message: 'Thu nhập thấp: VAT chiếm tỉ lệ lớn nhưng TNCN bằng 0.', variant: 'warning' },
        { condition: 'income >= 50', message: 'Thu nhập cao: TNCN chiếm phần lớn, VAT giảm dần theo tỉ lệ.', variant: 'success' },
      ],
    },
  },

  'budget-allocator': {
    label: 'Phân bổ ngân sách',
    purpose: 'Người học chia một ngân sách cố định vào các hạng mục rồi xem hệ quả.',
    fields: [
      '`totalBudget`: tổng ngân sách (số dương); `unit`: đơn vị.',
      '`categories`: hạng mục. `id` là TÊN BIẾN (chữ, số, _); `label`, `icon` (emoji), `color`, `defaultValue`, `minValue`, `description`.',
      '`color`: một trong "blue" | "red" | "green" | "amber" | "purple" | "pink" | "cyan" | "orange".',
      '`outcomes`: kết quả hiện khi `condition` đúng (dùng id hạng mục làm biến); `variant` "good" | "neutral" | "bad".',
      '`comparison` (tuỳ chọn): phân bổ thực tế để so sánh, `values` là { idHạngMục: số }.',
    ],
    rules: [FORMULA_RULE, 'Tổng các `defaultValue` nên bằng `totalBudget`.', 'Có ít nhất 2 hạng mục; outcomes nên phủ cả kết quả tốt và xấu.'],
    example: {
      type: 'budget-allocator',
      title: 'Bạn là Bộ trưởng Tài chính',
      description: 'Chia 100 đơn vị ngân sách cho ba lĩnh vực.',
      totalBudget: 100,
      unit: 'nghìn tỷ',
      categories: [
        { id: 'health', label: 'Y tế', icon: '🏥', color: 'red', defaultValue: 30, minValue: 0 },
        { id: 'education', label: 'Giáo dục', icon: '🎓', color: 'blue', defaultValue: 40, minValue: 0 },
        { id: 'infra', label: 'Hạ tầng', icon: '🛣️', color: 'amber', defaultValue: 30, minValue: 0 },
      ],
      outcomes: [
        { condition: 'health < 15', title: 'Bệnh viện quá tải', description: 'Chi y tế quá thấp khiến chất lượng khám chữa bệnh giảm.', variant: 'bad' },
        { condition: 'education >= 35 && health >= 20', title: 'Đầu tư cho con người', description: 'Nền tảng tốt cho tăng trưởng dài hạn.', variant: 'good' },
      ],
      comparison: { label: 'Dự toán thực tế (ước tính)', values: { health: 25, education: 45, infra: 30 } },
    },
  },

  'bias-detector': {
    label: 'Phát hiện thiên lệch',
    purpose: 'Người học đọc một đoạn tin, bấm vào các cụm từ được đánh dấu và chọn loại thiên lệch.',
    fields: [
      '`instruction`: hướng dẫn cho người học.',
      '`article.text`: đoạn tin (tự viết, có thiên lệch rõ); `article.source` (tuỳ chọn).',
      '`biasOptions`: các loại thiên lệch để chọn, mỗi loại có `id` và `label`.',
      '`segments`: cụm từ được đánh dấu. `text` phải là TRÍCH NGUYÊN VĂN từ `article.text`; `biasType` là một `id` trong biasOptions; `explanation` giải thích vì sao.',
      '`startIndex`: để 0 — hệ thống tự tính lại vị trí.',
    ],
    rules: ['Mỗi `segments[].text` phải xuất hiện y hệt (kể cả dấu) trong `article.text`.', '3–5 segments, 3–4 biasOptions.'],
    example: {
      type: 'bias-detector',
      title: 'Soi một bài viết về giá xăng',
      instruction: 'Bấm vào từng cụm từ được đánh dấu và chọn kiểu thiên lệch.',
      article: {
        text: 'Giá xăng lại tăng phi mã, người dân khốn đốn. Mọi chuyên gia đều nói đây là lỗi của thuế.',
        source: 'Bài viết mẫu',
      },
      biasOptions: [
        { id: 'emotional', label: 'Ngôn ngữ cảm xúc' },
        { id: 'overgeneral', label: 'Khái quát quá mức' },
      ],
      segments: [
        { id: 's1', text: 'tăng phi mã', startIndex: 0, biasType: 'emotional', explanation: '"Phi mã" phóng đại mức tăng mà không đưa ra con số.' },
        { id: 's2', text: 'Mọi chuyên gia đều nói', startIndex: 0, biasType: 'overgeneral', explanation: 'Không có "mọi chuyên gia"; bài không dẫn ai cụ thể.' },
      ],
    },
  },

  'perspective-switch': {
    label: 'Đa góc nhìn',
    purpose: 'Một sự kiện được kể lại từ nhiều vai khác nhau, sau đó là một câu hỏi tổng hợp.',
    fields: [
      '`event`: mô tả ngắn sự kiện.',
      '`perspectives`: các góc nhìn, mỗi góc nhìn có `id`, `role`, `icon` (emoji), `narrative` (lời kể ngôi thứ nhất).',
      '`question`: `{ text, options: [{ id, text, isCorrect }], explanation }` — đúng MỘT đáp án đúng.',
    ],
    rules: ['2–4 góc nhìn, mỗi narrative 2–4 câu, giọng khác nhau rõ rệt.', 'Câu hỏi kiểm tra điều rút ra từ việc so sánh các góc nhìn.'],
    example: {
      type: 'perspective-switch',
      title: 'Tăng thuế thuốc lá',
      event: 'Nhà nước tăng thuế tiêu thụ đặc biệt với thuốc lá thêm 20%.',
      perspectives: [
        { id: 'p1', role: 'Người hút thuốc', icon: '🚬', narrative: 'Mỗi bao đắt thêm vài nghìn. Tôi đang cân nhắc hút ít đi.' },
        { id: 'p2', role: 'Bác sĩ', icon: '🩺', narrative: 'Giá cao hơn là một trong những cách hiệu quả nhất để giảm số người hút, nhất là người trẻ.' },
        { id: 'p3', role: 'Chủ tiệm tạp hoá', icon: '🏪', narrative: 'Doanh thu thuốc lá giảm, và tôi lo hàng lậu giá rẻ sẽ tràn vào.' },
      ],
      question: {
        text: 'Điều gì cho thấy chính sách này có đánh đổi?',
        options: [
          { id: 'a', text: 'Mọi nhóm đều được lợi như nhau', isCorrect: false },
          { id: 'b', text: 'Lợi ích sức khoẻ đi kèm rủi ro buôn lậu và thiệt hại cho người bán', isCorrect: true },
          { id: 'c', text: 'Chính sách không ảnh hưởng tới ai', isCorrect: false },
          { id: 'd', text: 'Chỉ người hút thuốc bị ảnh hưởng', isCorrect: false },
        ],
        explanation: 'Mỗi vai nhìn thấy một mặt khác: sức khoẻ cộng đồng, chi phí cá nhân và rủi ro thị trường ngầm.',
      },
    },
  },

  'hot-cold-guess': {
    label: 'Đoán số Nóng/Lạnh',
    purpose: 'Người học đoán một con số; hệ thống báo "nóng/lạnh" theo độ gần đúng.',
    fields: [
      '`question`: câu hỏi yêu cầu đoán số.',
      '`answer`: đáp án (số); `unit`: đơn vị.',
      '`tolerance`: sai số chấp nhận (cùng đơn vị với answer).',
      '`hints`: các gợi ý mở dần.',
      '`context`: giải thích hiện sau khi đoán đúng.',
    ],
    rules: ['Con số phải có nguồn thật và ghi nguồn trong `context`.', '2–3 gợi ý, từ rộng đến hẹp.'],
    example: {
      type: 'hot-cold-guess',
      title: 'Đoán nhanh',
      question: 'Thuế suất VAT phổ thông ở Việt Nam là bao nhiêu phần trăm?',
      answer: 10,
      unit: '%',
      tolerance: 1,
      hints: ['Con số nằm trong khoảng 5–20%.', 'Là một số tròn chục.'],
      context: 'Theo Luật Thuế GTGT, mức phổ thông là 10%; một số giai đoạn được giảm tạm thời còn 8%.',
    },
  },

  'pair-match': {
    label: 'Nối cặp',
    purpose: 'Người học nối mỗi mục cột trái (khái niệm) với mục đúng ở cột phải (định nghĩa/ví dụ).',
    fields: ['`instruction` (tuỳ chọn): hướng dẫn.', '`pairs`: mỗi cặp có `id`, `left` (ngắn), `right` (dài hơn).'],
    rules: [
      `left tối đa ${PAIR_MATCH_LIMITS.left} ký tự, right tối đa ${PAIR_MATCH_LIMITS.right} ký tự.`,
      'Hai vế của một cặp không chênh nhau quá nhiều về độ dài.',
      '3–6 cặp; các vế phải không bị nhầm lẫn với nhau.',
    ],
    example: {
      type: 'pair-match',
      title: 'Nối loại thuế với ví dụ',
      instruction: 'Nối mỗi loại thuế với tình huống phù hợp.',
      pairs: [
        { id: 'p1', left: 'VAT', right: 'Cộng vào giá ly cà phê bạn mua' },
        { id: 'p2', left: 'Thuế TNCN', right: 'Trừ vào lương hằng tháng' },
        { id: 'p3', left: 'Thuế tiêu thụ đặc biệt', right: 'Làm bia, rượu, thuốc lá đắt hơn' },
      ],
    },
  },

  'flip-card': {
    label: 'Lật thẻ',
    purpose: 'Thẻ ghi nhớ hai mặt: mặt trước là câu hỏi/khái niệm, mặt sau là đáp án/giải thích.',
    fields: [
      '`instruction` (tuỳ chọn).',
      '`cards`: mỗi thẻ có `id`, `front`, `back`. Mỗi mặt là `{ "kind": "text", "text": "…" }` hoặc `{ "kind": "image", "src": "…", "alt": "…" }`.',
    ],
    rules: [`Mỗi mặt tối đa ${FLIP_CARD_LIMITS.face} ký tự.`, '3–8 thẻ. Chỉ dùng mặt ảnh khi có URL thật.'],
    example: {
      type: 'flip-card',
      title: 'Ôn nhanh khái niệm',
      instruction: 'Bấm vào thẻ để lật.',
      cards: [
        { id: 'c1', front: { kind: 'text', text: 'Thuế lũy tiến' }, back: { kind: 'text', text: 'Thu nhập càng cao, thuế suất càng cao.' } },
        { id: 'c2', front: { kind: 'text', text: 'Thuế lũy thoái' }, back: { kind: 'text', text: 'Người thu nhập thấp chịu tỉ lệ thuế trên thu nhập cao hơn.' } },
      ],
    },
  },

  'sort-bucket': {
    label: 'Phân loại vào rổ',
    purpose: 'Người học kéo từng thẻ vào đúng rổ.',
    fields: [
      '`instruction` (tuỳ chọn).',
      '`buckets`: các rổ, mỗi rổ có `id` và `label`.',
      '`items`: các thẻ, mỗi thẻ có `id`, `text`, `bucketId` (id của rổ đúng).',
    ],
    rules: ['2–4 rổ, 4–10 thẻ, rổ nào cũng có ít nhất một thẻ.', 'Mỗi `bucketId` phải trùng một `buckets[].id`.'],
    example: {
      type: 'sort-bucket',
      title: 'Trực tiếp hay gián tiếp?',
      instruction: 'Xếp mỗi loại thuế vào đúng nhóm.',
      buckets: [
        { id: 'direct', label: 'Thuế trực tiếp' },
        { id: 'indirect', label: 'Thuế gián tiếp' },
      ],
      items: [
        { id: 'i1', text: 'Thuế thu nhập cá nhân', bucketId: 'direct' },
        { id: 'i2', text: 'VAT', bucketId: 'indirect' },
        { id: 'i3', text: 'Thuế thu nhập doanh nghiệp', bucketId: 'direct' },
        { id: 'i4', text: 'Thuế tiêu thụ đặc biệt', bucketId: 'indirect' },
      ],
    },
  },

  custom: {
    label: 'Block tùy chỉnh',
    purpose: 'Block tương tác do admin tạo riêng. AI chỉ cần điền các trường trong `fields`.',
    fields: ['`fields`: object gồm đúng các khoá được liệt kê trong schema bên dưới.'],
    rules: ['Chỉ trả về `{ "type": "custom", "fields": { … } }`. Không thêm `customBlockTypeId` hay `configSnapshot`.'],
    example: { type: 'custom', fields: {} },
  },
};

/** Thứ tự hiển thị trên trang hướng dẫn và trong file bộ đầy đủ. */
export const SPEC_TYPES = Object.keys(BLOCK_SPECS).filter((t) => t !== 'custom');
