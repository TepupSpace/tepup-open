import { LessonContent } from './courses';

// ============================================================
// CÂU CHUYỆN VỀ THUẾ CỦA MINH (Sinh viên mới ra trường, lương 8 triệu)
// ============================================================

export const minhThueContents: Record<string, LessonContent> = {
  // Chapter 1: Ngày nhận lương
  'minh-thue-1': {
    lessonId: 'minh-thue-1',
    title: 'Ngày nhận lương',
    blocks: [
      {
        type: 'text',
        title: 'Câu chuyện của Minh',
        paragraphs: [
          'Minh vừa tốt nghiệp đại học ngành Công nghệ Thông tin và nhận được công việc đầu tiên tại một công ty startup.',
          'Hôm nay là ngày đặc biệt - ngày nhận lương đầu tiên trong đời!',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Tin nhắn từ ngân hàng',
        text: 'Bạn vừa nhận được 8.000.000 VND từ CÔNG TY ABC. Số dư hiện tại: 8.245.000 VND.',
        variant: 'info',
      },
      {
        type: 'text',
        paragraphs: [
          'Minh vui mừng khoe với bạn bè. Nhưng Hùng - một người bạn đã đi làm 2 năm - hỏi:',
          '"Ê, mày đã tính thuế chưa? Lương gross hay net vậy?"',
          'Minh ngớ người. Thuế? Gross? Net? Những khái niệm này hoàn toàn xa lạ.',
        ],
      },
      {
        type: 'question',
        question: 'Theo bạn, với mức lương 8 triệu/tháng, Minh có phải đóng thuế TNCN không?',
        options: [
          { id: 'a', text: 'Có, phải đóng thuế ngay từ đồng đầu tiên', isCorrect: false },
          { id: 'b', text: 'Không, vì chưa đến mức chịu thuế', isCorrect: true },
          { id: 'c', text: 'Tùy thuộc vào công ty', isCorrect: false },
          { id: 'd', text: 'Chỉ đóng thuế khi làm đủ 1 năm', isCorrect: false },
        ],
        explanation: 'Với mức giảm trừ gia cảnh bản thân là 15,5 triệu đồng/tháng (từ 01/01/2026), thu nhập 8 triệu của Minh chưa đến mức chịu thuế.',
      },
      {
        type: 'text',
        title: 'Mức giảm trừ gia cảnh',
        paragraphs: [
          'Đây là điều Minh cần biết đầu tiên: không phải ai cũng phải đóng thuế TNCN.',
          'Mức giảm trừ gia cảnh cho bản thân người nộp thuế hiện nay là 15,5 triệu đồng/tháng (186 triệu đồng/năm).',
          'Nghĩa là nếu thu nhập tính thuế của bạn dưới 15,5 triệu/tháng, bạn không phải đóng thuế TNCN.',
        ],
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'giam-tru-gia-canh',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tin vui cho Minh!',
        text: 'Lương 8 triệu < 15,5 triệu (mức giảm trừ) → Minh không phải đóng thuế TNCN tại thời điểm này. Nhưng Minh vẫn cần hiểu về thuế để chuẩn bị cho tương lai khi lương tăng.',
        variant: 'success',
      },
    ],
  },

  // Chapter 2: Thuế là gì nhỉ?
  'minh-thue-2': {
    lessonId: 'minh-thue-2',
    title: 'Thuế là gì nhỉ?',
    blocks: [
      {
        type: 'text',
        title: 'Minh bắt đầu tìm hiểu',
        paragraphs: [
          'Sau cuộc trò chuyện với Hùng, Minh quyết định tìm hiểu về thuế.',
          '"Thuế là khoản tiền mà công dân phải nộp cho nhà nước. Nhưng tại sao phải nộp? Tiền đó đi đâu?"',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Thuế dùng để làm gì?',
        text: 'Thuế là nguồn thu chính của ngân sách nhà nước, dùng để: xây dựng đường sá, bệnh viện, trường học; trả lương cho giáo viên, bác sĩ, công an; hỗ trợ người nghèo, người già, trẻ em...',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Các loại thuế phổ biến',
        paragraphs: [
          'Có nhiều loại thuế khác nhau, nhưng với người đi làm như Minh, quan trọng nhất là:',
          '• Thuế Thu nhập Cá nhân (TNCN): Đánh trên thu nhập từ lương, thưởng, làm thêm...',
          '• Bảo hiểm xã hội (BHXH): Không phải thuế nhưng cũng bị trừ từ lương, để hưởng lương hưu sau này.',
          '• Bảo hiểm y tế (BHYT): Để được khám chữa bệnh với chi phí thấp.',
        ],
      },
      {
        type: 'question',
        question: 'Khoản nào sau đây KHÔNG được trừ trực tiếp từ lương của người lao động?',
        options: [
          { id: 'a', text: 'Thuế TNCN', isCorrect: false },
          { id: 'b', text: 'Bảo hiểm xã hội (8%)', isCorrect: false },
          { id: 'c', text: 'Thuế Giá trị Gia tăng (VAT)', isCorrect: true },
          { id: 'd', text: 'Bảo hiểm y tế (1.5%)', isCorrect: false },
        ],
        explanation: 'VAT là thuế gián thu, người tiêu dùng trả khi mua hàng hóa/dịch vụ, không trừ từ lương.',
      },
      {
        type: 'text',
        title: 'Lương Gross vs Lương Net',
        paragraphs: [
          'Minh nhận ra mình cần phân biệt hai khái niệm quan trọng:',
          '• Lương Gross (lương gộp): Tổng lương trước khi trừ thuế và bảo hiểm.',
          '• Lương Net (lương thực nhận): Lương sau khi đã trừ thuế TNCN, BHXH, BHYT, BHTN.',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Minh hỏi HR công ty',
        text: '"Chị ơi, lương em 8 triệu là gross hay net ạ?" - "Em ơi, lương của em là net nhé. Công ty đóng BHXH, BHYT cho em rồi, nên em nhận đủ 8 triệu."',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Nếu lương gross của một người là 15 triệu và tổng các khoản trừ là 2 triệu, lương net là bao nhiêu?',
        options: [
          { id: 'a', text: '15 triệu', isCorrect: false },
          { id: 'b', text: '17 triệu', isCorrect: false },
          { id: 'c', text: '13 triệu', isCorrect: true },
          { id: 'd', text: '12 triệu', isCorrect: false },
        ],
        explanation: 'Lương Net = Lương Gross - Các khoản trừ = 15 - 2 = 13 triệu đồng.',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'gross-vs-net',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Thuế TNCN là thuế đánh trên thu nhập cá nhân, dùng để đóng góp cho xã hội. Lương Gross là lương gộp, lương Net là lương thực nhận sau khi trừ các khoản.',
        variant: 'success',
      },
    ],
  },

  // Chapter 3: Tính thuế như thế nào?
  'minh-thue-3': {
    lessonId: 'minh-thue-3',
    title: 'Tính thuế như thế nào?',
    blocks: [
      {
        type: 'text',
        title: '1 năm sau...',
        paragraphs: [
          'Minh được tăng lương lên 20 triệu/tháng nhờ làm việc tốt và có thêm kinh nghiệm!',
          'Lần này, HR thông báo: "Lương gross 20 triệu, em sẽ phải đóng thuế TNCN."',
          'Minh quyết định học cách tính thuế để biết mình sẽ nhận được bao nhiêu.',
        ],
      },
      {
        type: 'text',
        title: 'Công thức tính thuế TNCN',
        paragraphs: [
          'Thuế TNCN được tính theo các bước sau:',
          '1. Tính thu nhập chịu thuế = Tổng thu nhập - Các khoản được miễn',
          '2. Trừ các khoản bảo hiểm bắt buộc: BHXH (8%) + BHYT (1,5%) + BHTN (1%) = 10,5%',
          '3. Tính thu nhập tính thuế = Thu nhập chịu thuế - BHXH, BHYT, BHTN - Giảm trừ gia cảnh',
          '4. Áp dụng biểu thuế lũy tiến từng phần 5 bậc',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Biểu thuế lũy tiến 5 bậc (từ 01/01/2026)',
        text: '• Đến 10 triệu: 5%\n• Trên 10 - 30 triệu: 15%\n• Trên 30 - 50 triệu: 20%\n• Trên 50 - 100 triệu: 30%\n• Trên 100 triệu: 35%',
        variant: 'info',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'bieu-thue-luy-tien-2026',
      },
      {
        type: 'text',
        title: 'Tính thuế cho Minh',
        paragraphs: [
          'Áp dụng cho trường hợp của Minh (lương gross 20 triệu, độc thân):',
          '• BHXH + BHYT + BHTN người lao động đóng: 20.000.000 × 10,5% = 2.100.000đ',
          '• Thu nhập sau bảo hiểm: 20.000.000 - 2.100.000 = 17.900.000đ',
          '• Giảm trừ gia cảnh bản thân: 15.500.000đ',
          '• Thu nhập tính thuế = 17.900.000 - 15.500.000 = 2.400.000đ',
          '• Thuế TNCN = 2.400.000 × 5% = 120.000đ',
        ],
      },
      {
        type: 'question',
        question: 'Với thu nhập tính thuế là 2.400.000đ, Minh thuộc mức thuế suất nào?',
        options: [
          { id: 'a', text: '0% - Không phải đóng thuế', isCorrect: false },
          { id: 'b', text: '5% - Bậc đầu tiên (đến 10 triệu)', isCorrect: true },
          { id: 'c', text: '15% - Bậc thứ hai', isCorrect: false },
          { id: 'd', text: '20% - Bậc thứ ba', isCorrect: false },
        ],
        explanation: 'Thu nhập tính thuế 2.400.000đ nằm trong bậc 1 (đến 10 triệu), áp dụng thuế suất 5%.',
      },
      {
        type: 'text',
        title: 'Lương thực nhận của Minh',
        paragraphs: [
          'Tổng các khoản trừ:',
          '• BHXH + BHYT + BHTN: 2.100.000đ',
          '• Thuế TNCN: 120.000đ',
          '• Tổng: 2.220.000đ',
          '',
          'Lương Net = 20.000.000 - 2.220.000 = 17.780.000đ',
        ],
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Kết quả',
        text: 'Với lương gross 20 triệu, Minh thực nhận khoảng 17,78 triệu/tháng. Thuế TNCN chỉ chiếm 120.000đ/tháng - không nhiều như Minh tưởng!',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'Nếu Minh có người phụ thuộc (ví dụ: nuôi mẹ già), mức giảm trừ sẽ thay đổi thế nào?',
        options: [
          { id: 'a', text: 'Vẫn giữ nguyên 15,5 triệu', isCorrect: false },
          { id: 'b', text: 'Tăng thêm 6,2 triệu/người phụ thuộc', isCorrect: true },
          { id: 'c', text: 'Tăng thêm 4,4 triệu/người phụ thuộc', isCorrect: false },
          { id: 'd', text: 'Giảm đi vì có thêm gánh nặng', isCorrect: false },
        ],
        explanation: 'Mỗi người phụ thuộc được giảm trừ thêm 6,2 triệu đồng/tháng (từ 01/01/2026). Nếu Minh nuôi mẹ già, tổng giảm trừ sẽ là 15,5 + 6,2 = 21,7 triệu/tháng → Minh không phải đóng thuế TNCN.',
      },
    ],
  },

  // Chapter 4: Kê khai lần đầu
  'minh-thue-4': {
    lessonId: 'minh-thue-4',
    title: 'Kê khai lần đầu',
    blocks: [
      {
        type: 'text',
        title: 'Cuối năm - Mùa quyết toán thuế',
        paragraphs: [
          'Tháng 3 năm sau, HR gửi email cho Minh: "Em cần quyết toán thuế TNCN năm vừa rồi."',
          'Minh hoang mang: "Quyết toán là gì? Em đã đóng thuế hàng tháng rồi mà?"',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Quyết toán thuế là gì?',
        text: 'Quyết toán thuế là việc tính lại tổng thu nhập và thuế phải nộp cả năm, sau đó so sánh với số thuế đã đóng hàng tháng. Nếu đóng thừa → được hoàn thuế. Nếu đóng thiếu → phải nộp thêm.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Ai cần quyết toán thuế?',
        paragraphs: [
          'Không phải ai cũng cần tự quyết toán. Minh thuộc trường hợp:',
          '• Chỉ có thu nhập từ một nơi (công ty ABC)',
          '• Công ty đã khấu trừ thuế hàng tháng',
          '→ Minh có thể ủy quyền cho công ty quyết toán thay!',
        ],
      },
      {
        type: 'question',
        question: 'Trường hợp nào sau đây BẮT BUỘC phải tự quyết toán thuế?',
        options: [
          { id: 'a', text: 'Chỉ có thu nhập từ một công ty', isCorrect: false },
          { id: 'b', text: 'Có thu nhập từ 2 nơi trở lên trong năm', isCorrect: true },
          { id: 'c', text: 'Thu nhập dưới 11 triệu/tháng', isCorrect: false },
          { id: 'd', text: 'Mới đi làm năm đầu tiên', isCorrect: false },
        ],
        explanation: 'Người có thu nhập từ 2 nơi trở lên phải tự quyết toán thuế, vì mỗi nơi chỉ tính giảm trừ một phần.',
      },
      {
        type: 'text',
        title: 'Cách đăng ký thuế',
        paragraphs: [
          'Minh cần có mã số thuế cá nhân. May mắn là công ty đã đăng ký cho Minh khi ký hợp đồng.',
          'Mã số thuế gồm 10 chữ số, ví dụ: 8123456789',
          'Có thể tra cứu tại: https://tracuunnt.gdt.gov.vn',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Email từ HR',
        text: '"Em Minh ơi, em ký vào giấy ủy quyền quyết toán thuế này nhé. Công ty sẽ quyết toán và gửi kết quả cho em sau. Thuế của em năm nay khoảng 600.000đ, công ty đã khấu trừ đủ rồi nên em không cần nộp thêm."',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thời hạn quyết toán',
        paragraphs: [
          'Một số mốc thời gian quan trọng:',
          '• Doanh nghiệp quyết toán thay: Hạn 31/03 năm sau',
          '• Cá nhân tự quyết toán: Hạn 30/04 năm sau (90 ngày kể từ kết thúc năm)',
          '• Thời gian hoàn thuế: 10-45 ngày tùy trường hợp',
        ],
      },
      {
        type: 'question',
        question: 'Minh đóng thuế TNCN qua công ty hàng tháng nhưng cuối năm tính lại thì đóng thừa 500.000đ. Điều gì sẽ xảy ra?',
        options: [
          { id: 'a', text: 'Mất luôn số tiền thừa', isCorrect: false },
          { id: 'b', text: 'Được hoàn lại 500.000đ', isCorrect: true },
          { id: 'c', text: 'Chuyển sang năm sau để trừ dần', isCorrect: false },
          { id: 'd', text: 'Phải đóng thêm phí xử lý', isCorrect: false },
        ],
        explanation: 'Nếu đóng thừa thuế, bạn có quyền yêu cầu hoàn thuế. Số tiền sẽ được chuyển vào tài khoản ngân hàng của bạn.',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'quyet-toan-thue',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Minh đã hoàn thành hành trình!',
        text: 'Từ một sinh viên mới ra trường không biết gì về thuế, Minh đã hiểu được: thuế là gì, cách tính thuế, và cách quyết toán. Giờ đây Minh tự tin quản lý tài chính cá nhân hơn!',
        variant: 'success',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ THUẾ CỦA HƯƠNG (Nhân viên kế toán, lương 22 triệu)
// ============================================================

export const huongThueContents: Record<string, LessonContent> = {
  // Chapter 1: Bảng lương của Hương
  'huong-thue-1': {
    lessonId: 'huong-thue-1',
    title: 'Bảng lương của Hương',
    blocks: [
      {
        type: 'text',
        title: 'Hương và bảng lương tháng này',
        paragraphs: [
          'Hương, 28 tuổi, làm kế toán tại một công ty thương mại được 3 năm.',
          'Lương gross của Hương là 22 triệu/tháng, nhưng thực nhận chỉ khoảng 19 triệu.',
          '"Tiền của mình đi đâu hết vậy?" - Hương quyết định xem kỹ bảng lương.',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Bảng lương tháng 1/2026',
        text: 'Lương cơ bản: 20.000.000đ\nPhụ cấp ăn trưa: 730.000đ\nPhụ cấp điện thoại: 500.000đ\nPhụ cấp xăng xe: 770.000đ\n─────────────\nTổng thu nhập: 22.000.000đ',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Các khoản trừ trên bảng lương',
        paragraphs: [
          'Hương nhìn xuống phần "Các khoản trừ":',
          '• BHXH (8%): 1.600.000đ (tính trên lương cơ bản 20 triệu)',
          '• BHYT (1.5%): 300.000đ',
          '• BHTN (1%): 200.000đ',
          '• Thuế TNCN: 197.500đ',
          '• Tổng trừ: 2.297.500đ',
        ],
      },
      {
        type: 'question',
        question: 'Tổng tỷ lệ BHXH, BHYT, BHTN mà người lao động phải đóng là bao nhiêu?',
        options: [
          { id: 'a', text: '8%', isCorrect: false },
          { id: 'b', text: '10%', isCorrect: false },
          { id: 'c', text: '10.5%', isCorrect: true },
          { id: 'd', text: '21.5%', isCorrect: false },
        ],
        explanation: 'Người lao động đóng: BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5%. Công ty còn đóng thêm 21.5% nữa.',
      },
      {
        type: 'text',
        title: 'Cách tính thuế TNCN của Hương',
        paragraphs: [
          'Hãy xem thuế 197.500đ được tính thế nào:',
          '• Tổng thu nhập: 22.000.000đ',
          '• Trừ phụ cấp ăn trưa không chịu thuế: -730.000đ',
          '• Thu nhập chịu thuế: 21.270.000đ',
          '• Trừ BHXH, BHYT, BHTN (10.5% × 20 triệu): -2.100.000đ',
          '• Trừ giảm trừ gia cảnh bản thân: -15.500.000đ',
          '• Thu nhập tính thuế: 3.670.000đ',
          '• Thuế TNCN (bậc 1, 5%): 3.670.000 × 5% ≈ 183.500đ',
          '(Lưu ý: con số 197.500đ trên bảng lương có thể chênh nhẹ do cách làm tròn)',
        ],
      },
      {
        type: 'text',
        title: 'Lương thực nhận',
        paragraphs: [
          'Lương Net = 22.000.000 - 2.297.500 ≈ 19.702.500đ',
          'Hương nhận ra: Mỗi tháng cô "mất" gần 2.3 triệu cho các khoản bắt buộc.',
          'Nhưng đây không phải là "mất" - đây là đầu tư cho tương lai và xã hội.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Bạn có biết?',
        text: 'BHXH bạn đóng hôm nay sẽ thành lương hưu khi về già. BHYT giúp bạn chỉ trả 20% chi phí khi khám chữa bệnh. BHTN hỗ trợ bạn khi mất việc.',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Công ty của Hương phải đóng bao nhiêu cho BHXH, BHYT, BHTN của Hương?',
        options: [
          { id: 'a', text: 'Không đóng, người lao động tự đóng hết', isCorrect: false },
          { id: 'b', text: 'Đóng bằng với người lao động (10.5%)', isCorrect: false },
          { id: 'c', text: 'Đóng 21.5% trên lương đóng bảo hiểm', isCorrect: true },
          { id: 'd', text: 'Đóng 30% trên lương đóng bảo hiểm', isCorrect: false },
        ],
        explanation: 'Công ty đóng: BHXH 17.5% + BHYT 3% + BHTN 1% = 21.5%. Gấp đôi số người lao động đóng!',
      },
    ],
  },

  // Chapter 2: Các khoản khấu trừ
  'huong-thue-2': {
    lessonId: 'huong-thue-2',
    title: 'Các khoản khấu trừ',
    blocks: [
      {
        type: 'text',
        title: 'Hương muốn tối ưu thuế',
        paragraphs: [
          'Hương nghe đồng nghiệp nói có thể "tối ưu thuế hợp pháp".',
          '"Tối ưu thuế không phải là trốn thuế, mà là sử dụng đúng các quyền lợi mà pháp luật cho phép."',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Các khoản được khấu trừ khi tính thuế',
        text: '1. Giảm trừ gia cảnh bản thân: 15,5 triệu/tháng (từ 01/01/2026)\n2. Giảm trừ người phụ thuộc: 6,2 triệu/người/tháng\n3. Các khoản bảo hiểm bắt buộc (BHXH, BHYT, BHTN)\n4. Các khoản đóng góp từ thiện, nhân đạo\n5. Phí công đoàn',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Phụ cấp nào không chịu thuế?',
        paragraphs: [
          'Hương xem lại các khoản phụ cấp của mình:',
          '• Phụ cấp ăn trưa: 730.000đ - KHÔNG chịu thuế (dưới mức 730.000đ)',
          '• Phụ cấp điện thoại: 500.000đ - CÓ chịu thuế (vượt mức quy định)',
          '• Phụ cấp xăng xe: 770.000đ - CÓ chịu thuế',
        ],
      },
      {
        type: 'question',
        question: 'Phụ cấp ăn trưa được miễn thuế tối đa bao nhiêu/tháng?',
        options: [
          { id: 'a', text: '500.000đ', isCorrect: false },
          { id: 'b', text: '680.000đ', isCorrect: false },
          { id: 'c', text: '730.000đ', isCorrect: true },
          { id: 'd', text: '1.000.000đ', isCorrect: false },
        ],
        explanation: 'Phụ cấp ăn trưa/ăn giữa ca được miễn thuế tối đa 730.000đ/tháng (tương đương mức lương tối thiểu vùng I).',
      },
      {
        type: 'text',
        title: 'Thu nhập chịu thuế của Hương',
        paragraphs: [
          'Tính lại thu nhập chịu thuế:',
          '• Tổng thu nhập: 22.000.000đ',
          '• Trừ phụ cấp ăn trưa không chịu thuế: -730.000đ',
          '• Thu nhập chịu thuế: 21.270.000đ',
        ],
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'giam-tru-gia-canh',
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Hương trao đổi với HR',
        text: '"Chị ơi, em có thể chuyển phụ cấp xăng xe thành công tác phí thực tế được không ạ? Em đi công tác nhiều mà." - "Được em, công tác phí thực tế có hóa đơn thì không chịu thuế đâu."',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Khoản nào sau đây được miễn thuế TNCN hoàn toàn?',
        options: [
          { id: 'a', text: 'Tiền thưởng Tết', isCorrect: false },
          { id: 'b', text: 'Tiền làm thêm giờ (phần vượt 200 giờ/năm)', isCorrect: false },
          { id: 'c', text: 'Tiền công tác phí theo chế độ', isCorrect: true },
          { id: 'd', text: 'Tiền hoa hồng bán hàng', isCorrect: false },
        ],
        explanation: 'Công tác phí, tiền tàu xe đi lại theo chế độ quy định không tính vào thu nhập chịu thuế.',
      },
    ],
  },

  // Chapter 3: Giảm trừ gia cảnh
  'huong-thue-3': {
    lessonId: 'huong-thue-3',
    title: 'Giảm trừ gia cảnh',
    blocks: [
      {
        type: 'text',
        title: 'Hương có mẹ già và em nhỏ',
        paragraphs: [
          'Hương đang nuôi mẹ già 65 tuổi không có lương hưu và em trai đang học đại học.',
          'Đồng nghiệp mách: "Bạn có thể đăng ký người phụ thuộc để giảm thuế!"',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Người phụ thuộc là ai?',
        text: '• Con dưới 18 tuổi hoặc đang học đại học (dưới 25 tuổi)\n• Cha mẹ/ông bà trên 60 tuổi (nam) hoặc 55 tuổi (nữ) không có thu nhập\n• Cha mẹ/ông bà dưới tuổi trên nhưng bị tàn tật, không có khả năng lao động\n• Vợ/chồng không có thu nhập hoặc thu nhập dưới 1 triệu/tháng',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Đăng ký người phụ thuộc',
        paragraphs: [
          'Hương có thể đăng ký 2 người phụ thuộc:',
          '• Mẹ: 65 tuổi, không có lương hưu ✓',
          '• Em trai: 20 tuổi, đang học đại học ✓',
          '',
          'Mức giảm trừ mới = 15,5 + 6,2 × 2 = 27,9 triệu/tháng',
        ],
      },
      {
        type: 'question',
        question: 'Với 2 người phụ thuộc, thu nhập tính thuế của Hương sẽ thay đổi thế nào?',
        options: [
          { id: 'a', text: 'Không đổi, vẫn phải đóng thuế như cũ', isCorrect: false },
          { id: 'b', text: 'Giảm mạnh, có thể không phải đóng thuế', isCorrect: true },
          { id: 'c', text: 'Tăng lên vì có thêm người trong gia đình', isCorrect: false },
          { id: 'd', text: 'Chỉ giảm một chút, khoảng 500.000đ', isCorrect: false },
        ],
        explanation: 'Thu nhập tính thuế = 21.270.000 - 2.100.000 (BH) - 27.900.000 (giảm trừ) < 0 → Không phải đóng thuế TNCN!',
      },
      {
        type: 'text',
        title: 'Hồ sơ đăng ký người phụ thuộc',
        paragraphs: [
          'Để đăng ký người phụ thuộc, Hương cần chuẩn bị:',
          '• Bản photo CMND/CCCD của người phụ thuộc',
          '• Giấy khai sinh (chứng minh quan hệ)',
          '• Xác nhận của địa phương (không có thu nhập)',
          '• Giấy xác nhận đang học (với em trai)',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Lưu ý quan trọng',
        text: 'Mỗi người phụ thuộc chỉ được 1 người đăng ký. Nếu Hương có anh chị em khác cũng muốn đăng ký mẹ, cần thống nhất ai sẽ đăng ký. Khai man người phụ thuộc có thể bị phạt!',
        variant: 'warning',
      },
      {
        type: 'question',
        question: 'Em trai Hương 20 tuổi, đang học đại học năm 2. Nếu em tốt nghiệp năm 23 tuổi, Hương còn được giảm trừ không?',
        options: [
          { id: 'a', text: 'Được, vì em vẫn dưới 25 tuổi', isCorrect: false },
          { id: 'b', text: 'Không, vì em đã tốt nghiệp và có thể đi làm', isCorrect: true },
          { id: 'c', text: 'Được, cho đến khi em 25 tuổi', isCorrect: false },
          { id: 'd', text: 'Tùy thuộc vào thu nhập của em', isCorrect: false },
        ],
        explanation: 'Con/em từ 18-25 tuổi chỉ được tính là người phụ thuộc nếu ĐANG HỌC. Sau khi tốt nghiệp, không còn được giảm trừ nữa.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Kết quả của Hương',
        text: 'Sau khi đăng ký 2 người phụ thuộc, Hương không phải đóng thuế TNCN nữa! Mỗi tháng tiết kiệm được khoảng 197.500đ, cả năm là gần 2,4 triệu đồng.',
        variant: 'success',
      },
    ],
  },

  // Chapter 4: Quyết toán cuối năm
  'huong-thue-4': {
    lessonId: 'huong-thue-4',
    title: 'Quyết toán cuối năm',
    blocks: [
      {
        type: 'text',
        title: 'Tháng 3 - Mùa quyết toán',
        paragraphs: [
          'Năm ngoái Hương chưa đăng ký người phụ thuộc, nên công ty đã khấu trừ thuế hàng tháng.',
          'Giờ đây, Hương có thể quyết toán để lấy lại số thuế đã đóng thừa!',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Trường hợp được hoàn thuế',
        text: '• Đăng ký người phụ thuộc muộn (giữa năm hoặc cuối năm)\n• Thu nhập giảm vào những tháng cuối năm\n• Có các khoản đóng góp từ thiện được trừ thuế\n• Công ty tính thuế sai',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Tính lại thuế cả năm của Hương',
        paragraphs: [
          'Giả sử năm 2026 Hương chưa đăng ký người phụ thuộc:',
          '• Tổng thu nhập năm: 22 triệu × 12 = 264 triệu',
          '• Tổng thuế đã khấu trừ: ~197.500 × 12 ≈ 2.370.000đ',
          '',
          'Nếu đăng ký đủ 2 người phụ thuộc từ đầu năm:',
          '• Thu nhập tính thuế = 0 → Thuế phải nộp = 0',
          '• Số tiền được hoàn: ~2.370.000đ',
        ],
      },
      {
        type: 'question',
        question: 'Hương muốn hoàn thuế ~2.370.000đ. Cô cần làm gì?',
        options: [
          { id: 'a', text: 'Chờ công ty tự động hoàn', isCorrect: false },
          { id: 'b', text: 'Gửi hồ sơ quyết toán đến cơ quan thuế', isCorrect: true },
          { id: 'c', text: 'Không thể hoàn vì đã qua năm', isCorrect: false },
          { id: 'd', text: 'Liên hệ ngân hàng để yêu cầu hoàn', isCorrect: false },
        ],
        explanation: 'Để được hoàn thuế, Hương cần nộp hồ sơ quyết toán thuế đến Chi cục Thuế nơi cư trú hoặc qua mạng tại thuedientu.gdt.gov.vn.',
      },
      {
        type: 'text',
        title: 'Quy trình quyết toán online',
        paragraphs: [
          'Bước 1: Đăng ký tài khoản tại thuedientu.gdt.gov.vn',
          'Bước 2: Lấy chứng từ khấu trừ thuế từ công ty',
          'Bước 3: Điền tờ khai quyết toán (mẫu 02/QTT-TNCN)',
          'Bước 4: Đính kèm hồ sơ người phụ thuộc',
          'Bước 5: Nộp tờ khai và chờ kết quả',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Thông báo từ cơ quan thuế',
        text: '"Hồ sơ quyết toán thuế TNCN của bà Nguyễn Thị Hương đã được xử lý. Số tiền hoàn: 2.370.000đ. Tiền sẽ được chuyển vào tài khoản ngân hàng trong vòng 10 ngày làm việc."',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'Hạn cuối nộp hồ sơ quyết toán thuế TNCN cho cá nhân tự quyết toán là ngày nào?',
        options: [
          { id: 'a', text: '31/01 năm sau', isCorrect: false },
          { id: 'b', text: '28/02 năm sau', isCorrect: false },
          { id: 'c', text: '31/03 năm sau', isCorrect: false },
          { id: 'd', text: '30/04 năm sau', isCorrect: true },
        ],
        explanation: 'Doanh nghiệp quyết toán thay cho nhân viên: hạn 31/03. Cá nhân tự quyết toán: hạn 30/04 năm sau (90 ngày kể từ khi kết thúc năm).',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Bài học của Hương',
        text: 'Đăng ký người phụ thuộc đúng hạn và quyết toán thuế kịp thời giúp Hương tiết kiệm gần 2,4 triệu đồng/năm. Đây là quyền lợi hợp pháp mà nhiều người bỏ qua!',
        variant: 'success',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'quyet-toan-thue',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ THUẾ CỦA BÁC TƯ (Chủ xe bánh mì, thu 5 triệu/ngày)
// ============================================================

export const bacTuThueContents: Record<string, LessonContent> = {
  // Chapter 1: Doanh thu hàng ngày
  'bactu-thue-1': {
    lessonId: 'bactu-thue-1',
    title: 'Doanh thu hàng ngày',
    blocks: [
      {
        type: 'text',
        title: 'Bác Tư và xe bánh mì',
        paragraphs: [
          'Bác Tư, 52 tuổi, bán bánh mì ở góc phố quận Bình Thạnh đã 10 năm.',
          'Mỗi ngày bác bán được khoảng 100 ổ bánh mì, giá trung bình 50.000đ/ổ.',
          'Doanh thu hàng ngày: 100 × 50.000 = 5.000.000đ (5 triệu)',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Bác Tư kể',
        text: '"Tui bán bánh mì cả chục năm nay, chưa bao giờ ai hỏi thuế má gì hết. Nhưng dạo này nghe nói phải đăng ký kinh doanh, đóng thuế gì đó. Tui cũng không biết bắt đầu từ đâu."',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Tính doanh thu năm',
        paragraphs: [
          'Bác Tư bán 26 ngày/tháng (nghỉ 4 ngày/tháng):',
          '• Doanh thu tháng: 5.000.000 × 26 = 130 triệu',
          '• Doanh thu năm: 130 triệu × 12 = 1.56 tỷ đồng',
          '',
          'Đây là doanh thu, không phải lợi nhuận. Bác Tư còn phải trừ chi phí nguyên liệu, thuê chỗ...',
        ],
      },
      {
        type: 'question',
        question: 'Với doanh thu 1.56 tỷ/năm, bác Tư có phải đăng ký kinh doanh không?',
        options: [
          { id: 'a', text: 'Không, vì đây là buôn bán nhỏ lẻ', isCorrect: false },
          { id: 'b', text: 'Có, vì doanh thu vượt mức quy định', isCorrect: true },
          { id: 'c', text: 'Tùy thuộc vào địa phương', isCorrect: false },
          { id: 'd', text: 'Chỉ cần đăng ký khi có nhân viên', isCorrect: false },
        ],
        explanation: 'Theo quy định, cá nhân kinh doanh có doanh thu trên 100 triệu đồng/năm phải đăng ký kinh doanh và nộp thuế.',
      },
      {
        type: 'text',
        title: 'Chi phí của bác Tư',
        paragraphs: [
          'Bác Tư tính toán chi phí hàng tháng:',
          '• Nguyên liệu (bột, thịt, rau...): 70 triệu',
          '• Tiền thuê mặt bằng: 5 triệu',
          '• Điện, gas, nước: 3 triệu',
          '• Chi phí khác: 2 triệu',
          '• Tổng chi phí: 80 triệu/tháng',
          '',
          'Lợi nhuận = 130 - 80 = 50 triệu/tháng',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Thuế tính trên doanh thu hay lợi nhuận?',
        text: 'Với hộ kinh doanh nhỏ như bác Tư, thuế được tính theo tỷ lệ % trên doanh thu (gọi là thuế khoán), không cần chứng minh chi phí phức tạp.',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Tại sao hộ kinh doanh nhỏ tính thuế trên doanh thu thay vì lợi nhuận?',
        options: [
          { id: 'a', text: 'Vì Nhà nước muốn thu thuế nhiều hơn', isCorrect: false },
          { id: 'b', text: 'Vì hộ kinh doanh nhỏ khó giữ sổ sách, hóa đơn chi tiết', isCorrect: true },
          { id: 'c', text: 'Vì lợi nhuận luôn cao hơn doanh thu', isCorrect: false },
          { id: 'd', text: 'Vì đây là quy định quốc tế', isCorrect: false },
        ],
        explanation: 'Hộ kinh doanh nhỏ thường không có sổ sách kế toán đầy đủ. Tính thuế trên doanh thu đơn giản hơn và dễ quản lý.',
      },
    ],
  },

  // Chapter 2: Thuế khoán là gì?
  'bactu-thue-2': {
    lessonId: 'bactu-thue-2',
    title: 'Thuế khoán là gì?',
    blocks: [
      {
        type: 'text',
        title: 'Bác Tư tìm hiểu về thuế khoán',
        paragraphs: [
          'Bác Tư đến Chi cục Thuế để hỏi. Cán bộ thuế giải thích:',
          '"Bác thuộc diện hộ kinh doanh, sẽ nộp thuế khoán. Đây là cách tính thuế đơn giản nhất cho người buôn bán nhỏ."',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Thuế khoán là gì?',
        text: 'Thuế khoán là mức thuế cố định hàng tháng/quý, được tính dựa trên doanh thu ước tính. Hộ kinh doanh nộp thuế theo mức cố định này, không cần làm sổ sách phức tạp.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Các loại thuế bác Tư phải nộp',
        paragraphs: [
          '1. Thuế Giá trị Gia tăng (VAT): 1% doanh thu',
          '2. Thuế Thu nhập Cá nhân (TNCN): 0.5% doanh thu',
          '',
          'Tổng: 1.5% doanh thu',
          '',
          'Với doanh thu 130 triệu/tháng:',
          'Thuế hàng tháng = 130 triệu × 1.5% = 1.950.000đ',
        ],
      },
      {
        type: 'question',
        question: 'Tại sao tỷ lệ thuế của hộ kinh doanh thấp hơn doanh nghiệp (1.5% so với 20%)?',
        options: [
          { id: 'a', text: 'Vì Nhà nước ưu đãi người nghèo', isCorrect: false },
          { id: 'b', text: 'Vì thuế tính trên doanh thu, không phải lợi nhuận', isCorrect: true },
          { id: 'c', text: 'Vì hộ kinh doanh không cần nộp nhiều', isCorrect: false },
          { id: 'd', text: 'Vì quy mô nhỏ nên thuế thấp', isCorrect: false },
        ],
        explanation: 'Doanh nghiệp nộp 20% trên LỢI NHUẬN (sau khi trừ chi phí). Hộ kinh doanh nộp 1.5% trên DOANH THU. Nếu tính ra, có thể tương đương nhau.',
      },
      {
        type: 'text',
        title: 'Ngưỡng doanh thu chịu thuế',
        paragraphs: [
          'Không phải ai bán hàng cũng phải nộp thuế:',
          '• Doanh thu dưới 100 triệu/năm: Không phải nộp thuế GTGT và TNCN',
          '• Doanh thu từ 100 triệu/năm trở lên: Phải đăng ký và nộp thuế',
          '',
          'Bác Tư doanh thu 1.56 tỷ/năm → Bắt buộc phải nộp thuế',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Bác Tư thắc mắc',
        text: '"Vậy nếu tui khai doanh thu thấp hơn thực tế thì đóng thuế ít hơn phải không?" - "Dạ không được bác ơi. Cơ quan thuế có cách kiểm tra, nếu phát hiện khai sai sẽ bị phạt rất nặng, có thể gấp 3 lần số thuế trốn."',
        variant: 'warning',
      },
      {
        type: 'question',
        question: 'Bà Ba bán rau ở chợ, doanh thu khoảng 80 triệu/năm. Bà có phải nộp thuế không?',
        options: [
          { id: 'a', text: 'Có, vì bà đang kinh doanh', isCorrect: false },
          { id: 'b', text: 'Không, vì doanh thu dưới 100 triệu/năm', isCorrect: true },
          { id: 'c', text: 'Có, nhưng được giảm 50%', isCorrect: false },
          { id: 'd', text: 'Tùy vào số năm kinh doanh', isCorrect: false },
        ],
        explanation: 'Cá nhân kinh doanh có doanh thu dưới 100 triệu đồng/năm thuộc diện không chịu thuế GTGT và không phải nộp thuế TNCN.',
      },
    ],
  },

  // Chapter 3: Đăng ký kinh doanh
  'bactu-thue-3': {
    lessonId: 'bactu-thue-3',
    title: 'Đăng ký kinh doanh',
    blocks: [
      {
        type: 'text',
        title: 'Bác Tư quyết định đăng ký chính thức',
        paragraphs: [
          'Sau khi hiểu về thuế, bác Tư quyết định đăng ký hộ kinh doanh chính thức.',
          '"Đăng ký rồi mình yên tâm buôn bán, không sợ bị phạt. Với lại có giấy phép thì khách cũng tin tưởng hơn."',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Lợi ích của việc đăng ký kinh doanh',
        text: '• Hoạt động hợp pháp, không lo bị phạt\n• Có thể vay vốn ngân hàng\n• Được tham gia BHXH tự nguyện\n• Khách hàng tin tưởng hơn\n• Có thể mở rộng quy mô',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Hồ sơ đăng ký hộ kinh doanh',
        paragraphs: [
          'Bác Tư cần chuẩn bị:',
          '1. Giấy đề nghị đăng ký hộ kinh doanh',
          '2. Bản sao CMND/CCCD',
          '3. Biên bản họp hộ gia đình (nếu có nhiều thành viên góp vốn)',
          '4. Giấy xác nhận đủ điều kiện ATTP (nếu bán thực phẩm)',
        ],
      },
      {
        type: 'question',
        question: 'Bác Tư nên đăng ký kinh doanh ở đâu?',
        options: [
          { id: 'a', text: 'Sở Kế hoạch và Đầu tư', isCorrect: false },
          { id: 'b', text: 'Phòng Đăng ký Kinh doanh cấp Quận/Huyện', isCorrect: true },
          { id: 'c', text: 'Chi cục Thuế quận', isCorrect: false },
          { id: 'd', text: 'UBND phường/xã', isCorrect: false },
        ],
        explanation: 'Theo Nghị định 01/2021/NĐ-CP, hộ kinh doanh đăng ký tại Phòng Đăng ký Kinh doanh (hoặc Phòng Tài chính - Kế hoạch) thuộc UBND cấp Quận/Huyện nơi đặt trụ sở.',
      },
      {
        type: 'text',
        title: 'Chi phí đăng ký',
        paragraphs: [
          '• Lệ phí đăng ký hộ kinh doanh: 100.000đ',
          '• Giấy chứng nhận ATTP: 150.000đ',
          '• Làm biển hiệu (nếu cần): 500.000 - 2.000.000đ',
          '',
          'Tổng chi phí ban đầu: Khoảng 1-2 triệu đồng',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: '1 tuần sau...',
        text: '"Bác Tư ơi, hồ sơ của bác đã được duyệt. Đây là Giấy chứng nhận đăng ký hộ kinh doanh. Bác nhớ treo ở chỗ bán hàng nhé. Còn đây là thông báo mức thuế khoán: 1.950.000đ/tháng, nộp theo quý."',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Lịch nộp thuế',
        paragraphs: [
          'Bác Tư nộp thuế theo quý:',
          '• Quý 1: Hạn nộp 30/04',
          '• Quý 2: Hạn nộp 31/07',
          '• Quý 3: Hạn nộp 31/10',
          '• Quý 4: Hạn nộp 31/01 năm sau',
          '',
          'Mỗi quý nộp: 1.950.000 × 3 = 5.850.000đ',
        ],
      },
      {
        type: 'question',
        question: 'Nếu bác Tư nộp thuế chậm 1 tháng, điều gì sẽ xảy ra?',
        options: [
          { id: 'a', text: 'Không sao, chỉ cần nộp đủ số tiền', isCorrect: false },
          { id: 'b', text: 'Bị phạt tiền và phải nộp tiền chậm nộp', isCorrect: true },
          { id: 'c', text: 'Bị thu hồi giấy phép kinh doanh', isCorrect: false },
          { id: 'd', text: 'Được gia hạn tự động thêm 1 tháng', isCorrect: false },
        ],
        explanation: 'Nộp thuế chậm sẽ bị tính tiền chậm nộp 0.03%/ngày và có thể bị phạt hành chính. Bác Tư nên nộp đúng hạn!',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'dang-ky-kinh-doanh-ho-ca-the',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'thue-khoan',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Bác Tư đã chính thức kinh doanh hợp pháp!',
        text: 'Với giấy phép kinh doanh và nộp thuế đầy đủ, bác Tư giờ đây yên tâm buôn bán. Bác còn tính sẽ mở thêm 2 xe bánh mì nữa vào năm sau - đó sẽ là câu chuyện trong bài học tiếp theo!',
        variant: 'success',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ KINH TẾ CỦA MINH (Hiểu về giá cả và kinh tế)
// ============================================================

export const minhKinhTeContents: Record<string, LessonContent> = {
  // Chapter 1: Tại sao giá xăng tăng?
  'minh-kt-1': {
    lessonId: 'minh-kt-1',
    title: 'Tại sao giá xăng tăng?',
    blocks: [
      {
        type: 'text',
        title: 'Một ngày đi đổ xăng',
        paragraphs: [
          'Minh chạy xe đến cây xăng và giật mình: "Sao xăng hôm nay tăng 2.000đ/lít vậy?"',
          'Tuần trước mới đổ 80.000đ được đầy bình, hôm nay phải 95.000đ.',
          '"Tại sao giá xăng cứ lên xuống hoài vậy?" - Minh tự hỏi.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Giá xăng phụ thuộc vào gì?',
        text: 'Giá xăng Việt Nam phụ thuộc vào: giá dầu thô thế giới, tỷ giá USD/VND, thuế và phí (chiếm ~40% giá xăng), và chi phí vận chuyển, phân phối.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuế và phí trong giá xăng',
        paragraphs: [
          'Khi bạn đổ 1 lít xăng RON 95 giá 25.000đ, thực ra bạn đang trả:',
          '• Giá gốc (CIF): ~14.000đ (56%)',
          '• Thuế nhập khẩu: ~1.500đ (6%)',
          '• Thuế tiêu thụ đặc biệt: ~1.400đ (5.6%)',
          '• Thuế VAT (10%): ~2.500đ (10%)',
          '• Thuế bảo vệ môi trường: ~4.000đ (16%)',
          '• Chi phí kinh doanh + lợi nhuận: ~1.600đ (6.4%)',
        ],
      },
      {
        type: 'question',
        question: 'Loại thuế nào chiếm tỷ trọng lớn nhất trong giá xăng?',
        options: [
          { id: 'a', text: 'Thuế VAT', isCorrect: false },
          { id: 'b', text: 'Thuế nhập khẩu', isCorrect: false },
          { id: 'c', text: 'Thuế bảo vệ môi trường', isCorrect: true },
          { id: 'd', text: 'Thuế tiêu thụ đặc biệt', isCorrect: false },
        ],
        explanation: 'Thuế bảo vệ môi trường với xăng là 4.000đ/lít (mức trần), chiếm tỷ trọng lớn nhất trong các loại thuế.',
      },
      {
        type: 'text',
        title: 'Tại sao có thuế bảo vệ môi trường?',
        paragraphs: [
          'Xăng dầu khi đốt cháy tạo ra khí CO2 gây ô nhiễm và biến đổi khí hậu.',
          'Thuế bảo vệ môi trường nhằm:',
          '• Khuyến khích tiết kiệm nhiên liệu',
          '• Tạo nguồn thu để xử lý ô nhiễm',
          '• Thúc đẩy sử dụng năng lượng sạch',
        ],
      },
      {
        type: 'question',
        question: 'Nếu giá dầu thế giới giảm 10% nhưng giá xăng Việt Nam chỉ giảm 5%, nguyên nhân có thể là gì?',
        options: [
          { id: 'a', text: 'Cây xăng ăn lãi', isCorrect: false },
          { id: 'b', text: 'Tỷ giá USD/VND tăng hoặc thuế không đổi', isCorrect: true },
          { id: 'c', text: 'Nhà nước muốn thu thêm tiền', isCorrect: false },
          { id: 'd', text: 'Không có nguyên nhân hợp lý', isCorrect: false },
        ],
        explanation: 'Thuế (đặc biệt thuế bảo vệ môi trường) là số tiền cố định, không phụ thuộc giá dầu. Khi giá dầu giảm, tỷ trọng thuế tăng lên, nên giá xăng không giảm tương ứng.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Bài học của Minh',
        text: 'Giá xăng không chỉ phụ thuộc vào giá dầu thế giới mà còn chịu ảnh hưởng lớn từ thuế và phí. Hiểu điều này giúp Minh không còn bất ngờ khi giá xăng biến động.',
        variant: 'success',
      },
    ],
  },

  // Chapter 2: Cung và cầu
  'minh-kt-2': {
    lessonId: 'minh-kt-2',
    title: 'Cung và cầu',
    blocks: [
      {
        type: 'text',
        title: 'Câu chuyện về giá khẩu trang',
        paragraphs: [
          'Minh nhớ lại năm 2020, khi dịch COVID bùng phát:',
          'Khẩu trang y tế từ 30.000đ/hộp tăng vọt lên 200.000đ/hộp chỉ trong 1 tuần.',
          '"Tại sao giá tăng kinh khủng vậy?" - Đây là bài học về Cung và Cầu.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Quy luật Cung - Cầu',
        text: '• Cầu (Demand): Số lượng hàng hóa người mua MUỐN mua ở một mức giá\n• Cung (Supply): Số lượng hàng hóa người bán SẴN SÀNG bán ở một mức giá\n• Khi Cầu > Cung → Giá TĂNG\n• Khi Cung > Cầu → Giá GIẢM',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Phân tích trường hợp khẩu trang',
        paragraphs: [
          'Trước dịch COVID:',
          '• Cầu: Chỉ bệnh viện và một số người dùng → Thấp',
          '• Cung: Các nhà máy sản xuất ổn định → Đủ',
          '• Kết quả: Giá 30.000đ/hộp',
          '',
          'Khi dịch bùng phát:',
          '• Cầu: Mọi người đều cần → Tăng vọt 10 lần',
          '• Cung: Nhà máy không kịp sản xuất → Không đổi',
          '• Kết quả: Giá tăng lên 200.000đ/hộp',
        ],
      },
      {
        type: 'question',
        question: 'Để giá khẩu trang giảm xuống, cần làm gì?',
        options: [
          { id: 'a', text: 'Cấm bán khẩu trang', isCorrect: false },
          { id: 'b', text: 'Tăng sản xuất (tăng Cung) hoặc hết dịch (giảm Cầu)', isCorrect: true },
          { id: 'c', text: 'Chính phủ in thêm tiền', isCorrect: false },
          { id: 'd', text: 'Phạt người bán giá cao', isCorrect: false },
        ],
        explanation: 'Giá chỉ giảm khi Cung tăng (sản xuất nhiều hơn) hoặc Cầu giảm (hết dịch, ít người cần). Biện pháp hành chính có thể gây khan hiếm hàng hóa.',
      },
      {
        type: 'text',
        title: 'Điểm cân bằng thị trường',
        paragraphs: [
          'Thị trường tự điều chỉnh theo quy luật Cung - Cầu:',
          '• Giá cao → Nhiều người muốn bán, ít người muốn mua → Cung > Cầu → Giá giảm',
          '• Giá thấp → Ít người muốn bán, nhiều người muốn mua → Cầu > Cung → Giá tăng',
          '',
          'Cuối cùng, giá sẽ dừng ở "điểm cân bằng" - nơi Cung = Cầu.',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Minh suy ngẫm',
        text: '"À, vậy ra khi giá vé máy bay Tết tăng gấp 3 lần cũng là vì Cầu tăng (nhiều người về quê) mà Cung không đổi (số chuyến bay có hạn). Hiểu rồi!"',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Tại sao giá rau củ thường rẻ vào mùa thu hoạch?',
        options: [
          { id: 'a', text: 'Vì nông dân tốt bụng', isCorrect: false },
          { id: 'b', text: 'Vì Cung tăng mạnh (thu hoạch nhiều) trong khi Cầu không đổi', isCorrect: true },
          { id: 'c', text: 'Vì chính phủ trợ giá', isCorrect: false },
          { id: 'd', text: 'Vì chi phí vận chuyển giảm', isCorrect: false },
        ],
        explanation: 'Mùa thu hoạch, sản lượng rau củ tăng mạnh (Cung tăng) trong khi nhu cầu tiêu dùng không thay đổi nhiều (Cầu ổn định) → Cung > Cầu → Giá giảm.',
      },
    ],
  },

  // Chapter 3: Lạm phát là gì?
  'minh-kt-3': {
    lessonId: 'minh-kt-3',
    title: 'Lạm phát là gì?',
    blocks: [
      {
        type: 'text',
        title: 'Tô phở ngày xưa và bây giờ',
        paragraphs: [
          'Minh nhớ lại lời bà ngoại: "Hồi bà còn trẻ, tô phở chỉ có 500 đồng!"',
          'Bây giờ tô phở đã 50.000 - 70.000đ, tăng gần 100 lần.',
          '"Vậy 500 đồng ngày xưa bằng 50.000đ ngày nay sao?" - Đây chính là lạm phát.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Lạm phát là gì?',
        text: 'Lạm phát là sự tăng giá liên tục của hàng hóa và dịch vụ theo thời gian. Khi lạm phát xảy ra, cùng một số tiền sẽ mua được ít hàng hóa hơn trước.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Nguyên nhân gây lạm phát',
        paragraphs: [
          '1. Lạm phát do cầu kéo: Người dân có nhiều tiền hơn, mua sắm nhiều hơn → Cầu tăng → Giá tăng',
          '2. Lạm phát do chi phí đẩy: Chi phí sản xuất tăng (xăng dầu, nguyên liệu) → Giá bán tăng',
          '3. Lạm phát do tiền tệ: Nhà nước in quá nhiều tiền → Tiền mất giá',
        ],
      },
      {
        type: 'question',
        question: 'Nếu Nhà nước in thêm tiền để phát cho dân, điều gì sẽ xảy ra?',
        options: [
          { id: 'a', text: 'Mọi người giàu hơn', isCorrect: false },
          { id: 'b', text: 'Giá cả tăng, tiền mất giá, sức mua không đổi', isCorrect: true },
          { id: 'c', text: 'Kinh tế phát triển mạnh', isCorrect: false },
          { id: 'd', text: 'Không có gì thay đổi', isCorrect: false },
        ],
        explanation: 'Khi tiền nhiều hơn nhưng hàng hóa không tăng, giá cả sẽ tăng tương ứng. Cuối cùng, sức mua thực tế không thay đổi - đây gọi là "ảo tưởng tiền tệ".',
      },
      {
        type: 'text',
        title: 'Tỷ lệ lạm phát Việt Nam',
        paragraphs: [
          'Quốc hội đặt mục tiêu kiểm soát lạm phát ở mức 4-4,5%/năm.',
          'Điều này có nghĩa:',
          '• 100.000đ hôm nay ≈ 95.500đ năm sau (về sức mua)',
          '• Gửi tiết kiệm 5%/năm thì lãi thực = 5% - 4,5% = 0,5%/năm',
          '• Lương không tăng = lương thực tế giảm ~4,5%/năm',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Siêu lạm phát - Bài học từ Venezuela',
        text: 'Năm 2018, Venezuela có lạm phát 1.000.000%/năm. Giá 1 ổ bánh mì tăng từ 7 triệu bolivar lên 200 triệu bolivar chỉ trong 6 tháng. Người dân phải cân tiền thay vì đếm!',
        variant: 'warning',
      },
      {
        type: 'question',
        question: 'Để bảo vệ tiền khỏi lạm phát, Minh nên làm gì?',
        options: [
          { id: 'a', text: 'Giữ tiền mặt trong tủ', isCorrect: false },
          { id: 'b', text: 'Đầu tư vào tài sản có lợi suất cao hơn lạm phát', isCorrect: true },
          { id: 'c', text: 'Chi tiêu hết tiền ngay', isCorrect: false },
          { id: 'd', text: 'Đổi sang ngoại tệ', isCorrect: false },
        ],
        explanation: 'Để tiền không mất giá, cần đầu tư vào các kênh có lợi suất cao hơn lạm phát: gửi tiết kiệm, mua vàng, đầu tư chứng khoán, bất động sản...',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Minh đã hiểu về kinh tế cơ bản!',
        text: 'Từ giá xăng, cung cầu đến lạm phát - Minh giờ đã có nền tảng để hiểu các tin tức kinh tế và đưa ra quyết định tài chính thông minh hơn.',
        variant: 'success',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ ĐẦU TƯ CỦA HƯƠNG (Đầu tư và thuế đầu tư)
// ============================================================

export const huongDauTuContents: Record<string, LessonContent> = {
  // Chapter 1: 50 triệu để làm gì?
  'huong-dt-1': {
    lessonId: 'huong-dt-1',
    title: '50 triệu để làm gì?',
    blocks: [
      {
        type: 'text',
        title: 'Hương và khoản tiết kiệm',
        paragraphs: [
          'Sau 3 năm đi làm, Hương đã tiết kiệm được 50 triệu đồng.',
          'Số tiền này đang nằm trong tài khoản ngân hàng, lãi suất 0.1%/năm - gần như bằng 0.',
          '"50 triệu để trong tài khoản 1 năm chỉ được 50.000đ tiền lãi. Phải làm gì để tiền sinh lời?"',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Sức mạnh của lãi kép',
        text: 'Nếu đầu tư 50 triệu với lãi 10%/năm trong 20 năm:\n• Không có lãi kép: 50tr + (50tr × 10% × 20) = 150 triệu\n• Có lãi kép: 50tr × (1.1)^20 = 336 triệu\nLãi kép giúp tiền tăng gấp đôi mỗi 7-10 năm!',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Các lựa chọn của Hương',
        paragraphs: [
          'Hương liệt kê các cách có thể dùng 50 triệu:',
          '1. Gửi tiết kiệm ngân hàng: An toàn, lãi 5-6%/năm',
          '2. Mua vàng: Bảo toàn giá trị, lãi không cố định',
          '3. Đầu tư chứng khoán: Rủi ro cao, lợi nhuận cao',
          '4. Góp vốn kinh doanh: Tùy thuộc vào dự án',
          '5. Bất động sản: Cần vốn lớn hơn',
        ],
      },
      {
        type: 'question',
        question: 'Với 50 triệu và muốn AN TOÀN, Hương nên chọn phương án nào?',
        options: [
          { id: 'a', text: 'All-in vào 1 cổ phiếu hot', isCorrect: false },
          { id: 'b', text: 'Gửi tiết kiệm ngân hàng có bảo hiểm tiền gửi', isCorrect: true },
          { id: 'c', text: 'Cho vay ngang hàng P2P', isCorrect: false },
          { id: 'd', text: 'Mua tiền điện tử', isCorrect: false },
        ],
        explanation: 'Gửi tiết kiệm tại ngân hàng được Bảo hiểm Tiền gửi Việt Nam bảo vệ tối đa 125 triệu đồng/người/ngân hàng. Đây là lựa chọn an toàn nhất.',
      },
      {
        type: 'text',
        title: 'Nguyên tắc đầu tư cơ bản',
        paragraphs: [
          'Trước khi đầu tư, Hương cần hiểu các nguyên tắc:',
          '• Quỹ khẩn cấp: Luôn giữ 3-6 tháng chi tiêu bằng tiền mặt',
          '• Đa dạng hóa: Không bỏ tất cả trứng vào 1 giỏ',
          '• Hiểu rõ trước khi đầu tư: Không đầu tư vào thứ không hiểu',
          '• Đầu tư dài hạn: Tiền nhàn rỗi, không cần dùng trong 3-5 năm',
        ],
      },
      {
        type: 'question',
        question: 'Hương có 50 triệu tiết kiệm và chi tiêu 10 triệu/tháng. Cô nên giữ bao nhiêu làm quỹ khẩn cấp?',
        options: [
          { id: 'a', text: '10 triệu (1 tháng)', isCorrect: false },
          { id: 'b', text: '30-60 triệu (3-6 tháng)', isCorrect: true },
          { id: 'c', text: 'Không cần, đầu tư hết', isCorrect: false },
          { id: 'd', text: '100 triệu (10 tháng)', isCorrect: false },
        ],
        explanation: 'Quỹ khẩn cấp nên bằng 3-6 tháng chi tiêu để đối phó với các tình huống bất ngờ (mất việc, bệnh tật...). Với Hương là 30-60 triệu.',
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Hương quyết định',
        text: '"Mình sẽ chia 50 triệu thành: 30 triệu quỹ khẩn cấp (gửi tiết kiệm 6 tháng) và 20 triệu để học đầu tư chứng khoán!"',
        variant: 'info',
      },
    ],
  },

  // Chapter 2: Các kênh đầu tư
  'huong-dt-2': {
    lessonId: 'huong-dt-2',
    title: 'Các kênh đầu tư',
    blocks: [
      {
        type: 'text',
        title: 'So sánh các kênh đầu tư',
        paragraphs: [
          'Hương tìm hiểu chi tiết từng kênh đầu tư phổ biến tại Việt Nam.',
          'Mỗi kênh có ưu nhược điểm và mức thuế khác nhau.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: '1. Gửi tiết kiệm ngân hàng',
        text: '• Lãi suất: 4-6%/năm\n• Rủi ro: Rất thấp (được bảo hiểm 125 triệu)\n• Thuế: 5% trên tiền lãi\n• Phù hợp: Người mới bắt đầu, tiền cần dùng trong 1-2 năm',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuế tiền gửi tiết kiệm',
        paragraphs: [
          'Theo Luật Thuế TNCN, lãi tiền gửi ngân hàng chịu thuế 5%.',
          'Ví dụ: Gửi 100 triệu, lãi suất 6%/năm',
          '• Lãi trước thuế: 6.000.000đ',
          '• Thuế TNCN (5%): 300.000đ',
          '• Lãi thực nhận: 5.700.000đ (tương đương 5.7%/năm)',
          '',
          'Ngân hàng tự động khấu trừ thuế trước khi trả lãi.',
        ],
      },
      {
        type: 'question',
        question: 'Hương gửi tiết kiệm 50 triệu với lãi suất 6%/năm. Sau 1 năm, cô thực nhận bao nhiêu tiền lãi?',
        options: [
          { id: 'a', text: '3.000.000đ', isCorrect: false },
          { id: 'b', text: '2.850.000đ', isCorrect: true },
          { id: 'c', text: '2.700.000đ', isCorrect: false },
          { id: 'd', text: '3.150.000đ', isCorrect: false },
        ],
        explanation: 'Lãi trước thuế = 50tr × 6% = 3 triệu. Thuế 5% = 150.000đ. Lãi thực nhận = 3 triệu - 150.000 = 2.850.000đ.',
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: '2. Đầu tư chứng khoán',
        text: '• Lợi nhuận kỳ vọng: 10-20%/năm (không cố định)\n• Rủi ro: Cao, có thể lỗ vốn\n• Thuế: 0.1% trên giá trị bán (thuế chuyển nhượng)\n• Phù hợp: Người có kiến thức, tiền nhàn rỗi 3-5 năm',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuế chứng khoán tại Việt Nam',
        paragraphs: [
          'Khi bán cổ phiếu, bạn phải nộp:',
          '• Thuế TNCN: 0.1% trên tổng giá trị bán (không phải lợi nhuận)',
          '• Phí giao dịch: 0.15-0.25% (tùy công ty chứng khoán)',
          '',
          'Ví dụ: Mua cổ phiếu 100 triệu, bán được 120 triệu',
          '• Thuế: 120 triệu × 0.1% = 120.000đ',
          '• Phí: 120 triệu × 0.15% = 180.000đ',
          '• Lợi nhuận thực: 20 triệu - 300.000 = 19.7 triệu',
        ],
      },
      {
        type: 'question',
        question: 'Điểm đặc biệt của thuế chứng khoán Việt Nam là gì?',
        options: [
          { id: 'a', text: 'Tính trên lợi nhuận', isCorrect: false },
          { id: 'b', text: 'Tính trên tổng giá trị bán, dù lãi hay lỗ', isCorrect: true },
          { id: 'c', text: 'Không phải đóng thuế', isCorrect: false },
          { id: 'd', text: 'Chỉ đóng khi lãi trên 100 triệu', isCorrect: false },
        ],
        explanation: 'Thuế chứng khoán Việt Nam tính 0.1% trên giá trị bán, không phân biệt lãi hay lỗ. Đây là khác biệt lớn so với nhiều nước tính thuế trên lợi nhuận.',
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: '3. Đầu tư vàng',
        text: '• Lợi nhuận: Không cố định, phụ thuộc giá vàng thế giới\n• Rủi ro: Trung bình (giá có thể giảm ngắn hạn)\n• Thuế: 20% trên lợi nhuận (hoặc 2% trên giá bán nếu không xác định được giá mua)\n• Lưu ý: Trên thực tế, thuế mua bán vàng ít được áp dụng nhưng theo luật vẫn phải nộp\n• Phù hợp: Bảo toàn giá trị dài hạn, chống lạm phát',
        variant: 'info',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'thue-dau-tu',
      },
    ],
  },

  // Chapter 3: Rủi ro và lợi nhuận
  'huong-dt-3': {
    lessonId: 'huong-dt-3',
    title: 'Rủi ro và lợi nhuận',
    blocks: [
      {
        type: 'text',
        title: 'Quy luật vàng của đầu tư',
        paragraphs: [
          'Hương học được nguyên tắc quan trọng nhất:',
          '"Lợi nhuận cao đi kèm rủi ro cao. Không có bữa trưa miễn phí!"',
          'Ai hứa lợi nhuận cao mà không có rủi ro = Lừa đảo.',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Dấu hiệu lừa đảo đầu tư',
        text: '🚩 Hứa lợi nhuận cố định 20-30%/tháng\n🚩 Không giải thích được nguồn lợi nhuận\n🚩 Áp lực rủ thêm người tham gia\n🚩 Không có giấy phép hoạt động\n🚩 Tiền gửi vào tài khoản cá nhân',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Ma trận Rủi ro - Lợi nhuận',
        paragraphs: [
          'Phân loại các kênh đầu tư theo rủi ro:',
          '',
          '📗 Rủi ro thấp (3-6%/năm): Tiết kiệm, trái phiếu chính phủ',
          '📙 Rủi ro trung bình (8-12%/năm): Quỹ đầu tư, vàng, trái phiếu doanh nghiệp',
          '📕 Rủi ro cao (>15%/năm hoặc lỗ): Cổ phiếu, crypto, forex, startup',
        ],
      },
      {
        type: 'question',
        question: 'Một người giới thiệu cho Hương "đầu tư crypto lãi 5%/ngày, cam kết không lỗ". Hương nên làm gì?',
        options: [
          { id: 'a', text: 'Đầu tư ngay vì lãi quá hấp dẫn', isCorrect: false },
          { id: 'b', text: 'Đầu tư thử 1 triệu xem sao', isCorrect: false },
          { id: 'c', text: 'Từ chối vì đây là dấu hiệu lừa đảo', isCorrect: true },
          { id: 'd', text: 'Hỏi thêm thông tin rồi quyết định', isCorrect: false },
        ],
        explanation: '5%/ngày = 1825%/năm - con số phi thực tế. "Cam kết không lỗ" là dấu hiệu lừa đảo điển hình. Đây là mô hình Ponzi, trả lãi bằng tiền người mới.',
      },
      {
        type: 'text',
        title: 'Đa dạng hóa danh mục',
        paragraphs: [
          'Cách giảm rủi ro hiệu quả nhất là đa dạng hóa:',
          '',
          'Hương phân bổ 50 triệu như sau:',
          '• 30 triệu (60%): Tiết kiệm 6 tháng - An toàn',
          '• 10 triệu (20%): Quỹ ETF VN30 - Trung bình',
          '• 10 triệu (20%): Cổ phiếu riêng lẻ - Rủi ro cao',
          '',
          'Nếu cổ phiếu lỗ 50%, Hương chỉ mất 5 triệu (10% tổng danh mục).',
        ],
      },
      {
        type: 'question',
        question: 'Tại sao nên đa dạng hóa danh mục đầu tư?',
        options: [
          { id: 'a', text: 'Để khoe với bạn bè', isCorrect: false },
          { id: 'b', text: 'Để giảm rủi ro tổng thể khi một kênh thua lỗ', isCorrect: true },
          { id: 'c', text: 'Để đóng nhiều loại thuế hơn', isCorrect: false },
          { id: 'd', text: 'Vì pháp luật bắt buộc', isCorrect: false },
        ],
        explanation: 'Đa dạng hóa giúp giảm rủi ro: khi một kênh lỗ, các kênh khác có thể bù đắp. "Đừng bỏ tất cả trứng vào một giỏ".',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Ghi nhớ của Hương',
        text: '• Lợi nhuận cao = Rủi ro cao\n• Hứa lợi nhuận "chắc chắn" = Lừa đảo\n• Đa dạng hóa để giảm rủi ro\n• Chỉ đầu tư tiền nhàn rỗi, không vay để đầu tư',
        variant: 'success',
      },
    ],
  },

  // Chapter 4: Mua cổ phiếu đầu tiên
  'huong-dt-4': {
    lessonId: 'huong-dt-4',
    title: 'Mua cổ phiếu đầu tiên',
    blocks: [
      {
        type: 'text',
        title: 'Hương mở tài khoản chứng khoán',
        paragraphs: [
          'Hương quyết định mở tài khoản tại một công ty chứng khoán.',
          'Quy trình đơn giản: Đăng ký online với CCCD, xác thực khuôn mặt, ký hợp đồng điện tử.',
          'Chỉ mất 30 phút, tài khoản đã sẵn sàng!',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Chi phí giao dịch chứng khoán',
        text: '• Phí mở tài khoản: Miễn phí\n• Phí mua: 0.15-0.25% giá trị giao dịch\n• Phí bán: 0.15-0.25% + Thuế 0.1%\n• Phí lưu ký: ~5.000đ/tháng nếu có cổ phiếu',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Hương chọn cổ phiếu đầu tiên',
        paragraphs: [
          'Với 10 triệu, Hương quyết định mua chứng chỉ quỹ ETF VN30 (E1VFVN30).',
          'Lý do chọn ETF:',
          '• Đa dạng hóa: ETF đầu tư vào 30 cổ phiếu lớn nhất',
          '• Rủi ro thấp hơn: Không phụ thuộc vào 1 công ty',
          '• Dễ hiểu: Không cần phân tích từng cổ phiếu',
        ],
      },
      {
        type: 'question',
        question: 'ETF (Exchange-Traded Fund) là gì?',
        options: [
          { id: 'a', text: 'Một loại cổ phiếu của công ty công nghệ', isCorrect: false },
          { id: 'b', text: 'Quỹ đầu tư được giao dịch như cổ phiếu, đầu tư vào nhiều tài sản', isCorrect: true },
          { id: 'c', text: 'Tài khoản tiết kiệm đặc biệt', isCorrect: false },
          { id: 'd', text: 'Loại tiền điện tử', isCorrect: false },
        ],
        explanation: 'ETF là quỹ đầu tư mô phỏng chỉ số (như VN30), được giao dịch trên sàn như cổ phiếu. Mua 1 ETF = sở hữu gián tiếp nhiều cổ phiếu.',
      },
      {
        type: 'text',
        title: 'Lệnh mua đầu tiên',
        paragraphs: [
          'Hương đặt lệnh mua E1VFVN30:',
          '• Giá: 18.500đ/chứng chỉ quỹ',
          '• Số lượng: 500 CCQ (tối thiểu 100 CCQ)',
          '• Giá trị: 18.500 × 500 = 9.250.000đ',
          '• Phí mua (0.15%): 13.875đ',
          '• Tổng: 9.263.875đ',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Thông báo khớp lệnh',
        text: '✅ Lệnh mua E1VFVN30 đã khớp!\nSố lượng: 500 CCQ\nGiá khớp: 18.500đ\nTổng giá trị: 9.250.000đ\nPhí: 13.875đ',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'Nếu sau 1 năm, giá E1VFVN30 tăng từ 18.500đ lên 22.000đ và Hương bán, cô lãi bao nhiêu sau thuế và phí?',
        options: [
          { id: 'a', text: '1.750.000đ', isCorrect: false },
          { id: 'b', text: '1.708.625đ', isCorrect: true },
          { id: 'c', text: '1.695.000đ', isCorrect: false },
          { id: 'd', text: '1.650.000đ', isCorrect: false },
        ],
        explanation: 'Giá trị bán = 22.000 × 500 = 11.000.000đ. Lãi gộp = 11tr - 9.25tr = 1.75 triệu. Thuế 0.1% trên giá bán = 11.000đ. Phí bán 0.15% = 16.500đ. Phí mua = 13.875đ. Lãi ròng = 1.750.000 - 11.000 - 16.500 - 13.875 = 1.708.625đ.',
      },
    ],
  },

  // Chapter 5: Theo dõi danh mục
  'huong-dt-5': {
    lessonId: 'huong-dt-5',
    title: 'Theo dõi danh mục',
    blocks: [
      {
        type: 'text',
        title: '3 tháng sau...',
        paragraphs: [
          'Hương kiểm tra danh mục đầu tư của mình:',
          '• Tiết kiệm 30 triệu: Lãi 3 tháng trước thuế = 450.000đ, thuế 5% = 22.500đ → Lãi thực nhận: 427.500đ → 30.4275 triệu',
          '• ETF VN30 (10 triệu): Tăng 8% → 10.8 triệu',
          '• Tổng: ~41.23 triệu (tăng ~3% trong 3 tháng)',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Báo cáo thuế đầu tư',
        text: 'Cuối năm, Hương cần khai báo thu nhập từ đầu tư:\n• Lãi tiết kiệm: Ngân hàng đã khấu trừ thuế 5%\n• Lãi chứng khoán: Công ty CK khấu trừ thuế 0.1% khi bán\n→ Hương không cần làm gì thêm, thuế đã được khấu trừ tại nguồn!',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Nguyên tắc theo dõi danh mục',
        paragraphs: [
          'Hương học được cách quản lý danh mục hiệu quả:',
          '• Kiểm tra 1-2 lần/tháng, không theo dõi hàng ngày',
          '• Ghi chép lại các giao dịch để tính thuế dễ dàng',
          '• Không hoảng loạn khi thị trường giảm ngắn hạn',
          '• Tái cân bằng danh mục mỗi 6-12 tháng',
        ],
      },
      {
        type: 'question',
        question: 'Thị trường chứng khoán giảm 20% trong 1 tháng. Hương nên làm gì?',
        options: [
          { id: 'a', text: 'Bán tháo hết để cắt lỗ', isCorrect: false },
          { id: 'b', text: 'Vay thêm tiền để mua vào', isCorrect: false },
          { id: 'c', text: 'Giữ nguyên nếu không cần tiền, có thể mua thêm nếu có tiền nhàn rỗi', isCorrect: true },
          { id: 'd', text: 'Rút hết tiền khỏi thị trường', isCorrect: false },
        ],
        explanation: 'Biến động ngắn hạn là bình thường. Nếu đầu tư dài hạn và không cần tiền, hãy kiên nhẫn. Nhiều nhà đầu tư thành công mua vào khi thị trường giảm.',
      },
      {
        type: 'text',
        title: 'Kế hoạch dài hạn của Hương',
        paragraphs: [
          'Hương đặt mục tiêu đầu tư cho 10 năm tới:',
          '• Mỗi tháng đầu tư thêm 3 triệu (DCA - Dollar Cost Averaging)',
          '• Mục tiêu 500 triệu khi 38 tuổi',
          '• Phân bổ: 50% tiết kiệm, 30% ETF, 20% cổ phiếu',
          '',
          'Với lãi kép 10%/năm, mục tiêu này hoàn toàn khả thi!',
        ],
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'dau-tu-ca-nhan',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Hương đã trở thành nhà đầu tư!',
        text: 'Từ 50 triệu tiết kiệm, Hương đã học được: cách phân bổ tài sản, các loại thuế đầu tư, quản lý rủi ro, và xây dựng kế hoạch dài hạn. Hành trình tài chính của Hương mới chỉ bắt đầu!',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'DCA (Dollar Cost Averaging) là chiến lược gì?',
        options: [
          { id: 'a', text: 'Đầu tư một lần số tiền lớn', isCorrect: false },
          { id: 'b', text: 'Đầu tư định kỳ số tiền cố định, không quan tâm giá', isCorrect: true },
          { id: 'c', text: 'Chỉ mua khi giá thấp nhất', isCorrect: false },
          { id: 'd', text: 'Vay tiền để đầu tư', isCorrect: false },
        ],
        explanation: 'DCA là đầu tư số tiền cố định đều đặn (VD: 3 triệu/tháng) bất kể giá cao hay thấp. Chiến lược này giúp giảm rủi ro mua đỉnh và phù hợp với người mới.',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ MỞ RỘNG KINH DOANH CỦA BÁC TƯ
// ============================================================

export const bacTuKinhDoanhContents: Record<string, LessonContent> = {
  // Chapter 1: Ước mơ 3 xe bánh mì
  'bactu-kd-1': {
    lessonId: 'bactu-kd-1',
    title: 'Ước mơ 3 xe bánh mì',
    blocks: [
      {
        type: 'text',
        title: 'Bác Tư và ước mơ mở rộng',
        paragraphs: [
          'Sau 1 năm kinh doanh hợp pháp, xe bánh mì của bác Tư đông khách hơn.',
          'Nhiều khách quen hỏi: "Bác có mở thêm chi nhánh không? Chỗ em ở xa quá!"',
          'Bác Tư bắt đầu mơ về việc có 3 xe bánh mì thay vì 1.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Tình hình hiện tại của bác Tư',
        text: '• Doanh thu: 130 triệu/tháng\n• Chi phí: 80 triệu/tháng\n• Lợi nhuận: 50 triệu/tháng\n• Thuế đã nộp: 1.95 triệu/tháng\n• Tiền tiết kiệm sau 1 năm: ~400 triệu',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Tại sao nên mở rộng?',
        paragraphs: [
          'Bác Tư suy nghĩ về lý do mở rộng:',
          '• Thu nhập tăng: 3 xe = 3 lần lợi nhuận (về lý thuyết)',
          '• Thương hiệu mạnh: "Bánh mì Bác Tư" được nhiều người biết',
          '• Giảm rủi ro: Nếu 1 điểm vắng khách, còn 2 điểm khác',
          '• Để dành cho con: Xây dựng cơ nghiệp bền vững',
        ],
      },
      {
        type: 'question',
        question: 'Với 400 triệu tiết kiệm, bác Tư nên mở rộng như thế nào?',
        options: [
          { id: 'a', text: 'Mở ngay 5 xe cùng lúc để nhanh giàu', isCorrect: false },
          { id: 'b', text: 'Mở thêm 1 xe trước, ổn định rồi mới mở tiếp', isCorrect: true },
          { id: 'c', text: 'Không mở thêm, giữ nguyên', isCorrect: false },
          { id: 'd', text: 'Vay ngân hàng 1 tỷ để mở 10 xe', isCorrect: false },
        ],
        explanation: 'Mở rộng từ từ giúp bác Tư học hỏi kinh nghiệm quản lý nhiều điểm, kiểm soát chất lượng và giảm rủi ro tài chính.',
      },
      {
        type: 'text',
        title: 'Những thách thức khi mở rộng',
        paragraphs: [
          'Bác Tư liệt kê các vấn đề cần giải quyết:',
          '1. Vốn đầu tư: Cần bao nhiêu tiền?',
          '2. Nhân sự: Ai sẽ bán ở xe mới?',
          '3. Địa điểm: Mở ở đâu?',
          '4. Thuế: Thuế có tăng không?',
          '5. Chất lượng: Làm sao giữ vị bánh mì đồng nhất?',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Bác Tư tâm sự',
        text: '"Tui bán bánh mì 10 năm, chỉ biết làm một mình. Giờ mở thêm xe, phải thuê người, quản lý nhiều chỗ - tui lo lắm. Nhưng không thử thì sao biết được!"',
        variant: 'info',
      },
    ],
  },

  // Chapter 2: Tính toán chi phí
  'bactu-kd-2': {
    lessonId: 'bactu-kd-2',
    title: 'Tính toán chi phí',
    blocks: [
      {
        type: 'text',
        title: 'Chi phí mở 1 xe bánh mì mới',
        paragraphs: [
          'Bác Tư nhờ cậu con trai tính toán chi phí:',
          '',
          '🚗 Chi phí cố định (đầu tư 1 lần):',
          '• Xe đẩy bánh mì inox: 15 triệu',
          '• Dụng cụ, thiết bị: 10 triệu',
          '• Biển hiệu, bảng giá: 3 triệu',
          '• Giấy phép ATTP mới: 2 triệu',
          '• Vốn lưu động ban đầu: 20 triệu',
          '→ Tổng: 50 triệu',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Chi phí hàng tháng (xe mới)',
        text: '• Thuê mặt bằng: 8 triệu (vị trí tốt hơn)\n• Lương nhân viên: 8 triệu + ăn trưa\n• Nguyên liệu: 50 triệu (dự kiến bán 80 ổ/ngày)\n• Điện, gas, nước: 2 triệu\n• Chi phí khác: 2 triệu\n→ Tổng chi phí: 70 triệu/tháng',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Dự kiến doanh thu xe mới',
        paragraphs: [
          'Con trai bác Tư ước tính:',
          '• Ban đầu (tháng 1-3): 80 ổ/ngày × 50.000đ × 26 ngày = 104 triệu/tháng',
          '• Ổn định (từ tháng 4): 100 ổ/ngày × 50.000đ × 26 ngày = 130 triệu/tháng',
          '',
          'Lợi nhuận dự kiến:',
          '• Tháng 1-3: 104 - 70 = 34 triệu/tháng',
          '• Từ tháng 4: 130 - 70 = 60 triệu/tháng',
        ],
      },
      {
        type: 'question',
        question: 'Với chi phí đầu tư 50 triệu và lợi nhuận 34-60 triệu/tháng, bao lâu bác Tư hoàn vốn?',
        options: [
          { id: 'a', text: '1 tuần', isCorrect: false },
          { id: 'b', text: '1-2 tháng', isCorrect: true },
          { id: 'c', text: '6 tháng', isCorrect: false },
          { id: 'd', text: '1 năm', isCorrect: false },
        ],
        explanation: 'Với lợi nhuận 34-60 triệu/tháng, vốn đầu tư 50 triệu sẽ được hoàn trong khoảng 1-2 tháng. Đây là ngành có vòng quay vốn nhanh!',
      },
      {
        type: 'text',
        title: 'Thuế khi mở rộng kinh doanh',
        paragraphs: [
          'Khi có thêm xe, thuế của bác Tư sẽ thay đổi:',
          '',
          '📊 Hiện tại (1 xe):',
          '• Doanh thu: 130 triệu/tháng',
          '• Thuế khoán: 1.95 triệu/tháng (1.5%)',
          '',
          '📊 Sau mở rộng (2 xe):',
          '• Doanh thu: 260 triệu/tháng',
          '• Thuế khoán: 3.9 triệu/tháng (1.5%)',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Lưu ý về ngưỡng doanh thu',
        text: 'Nếu doanh thu năm > 1 tỷ đồng, bác Tư có thể phải chuyển sang phương pháp kê khai thuế thay vì thuế khoán. Cần theo dõi và chuẩn bị sổ sách.',
        variant: 'warning',
      },
      {
        type: 'question',
        question: 'Doanh thu 2 xe là 260 triệu/tháng = 3.12 tỷ/năm. Bác Tư cần lưu ý gì về thuế?',
        options: [
          { id: 'a', text: 'Không cần lo, vẫn đóng thuế khoán', isCorrect: false },
          { id: 'b', text: 'Có thể phải chuyển sang kê khai thuế, cần giữ hóa đơn chi phí', isCorrect: true },
          { id: 'c', text: 'Phải đóng thuế gấp 10 lần', isCorrect: false },
          { id: 'd', text: 'Được miễn thuế vì là hộ kinh doanh', isCorrect: false },
        ],
        explanation: 'Với doanh thu > 1 tỷ/năm, cơ quan thuế có thể yêu cầu chuyển sang phương pháp kê khai. Bác Tư cần giữ hóa đơn chi phí để được khấu trừ thuế.',
      },
    ],
  },

  // Chapter 3: Tìm vị trí mới
  'bactu-kd-3': {
    lessonId: 'bactu-kd-3',
    title: 'Tìm vị trí mới',
    blocks: [
      {
        type: 'text',
        title: 'Bác Tư đi khảo sát',
        paragraphs: [
          'Bác Tư dành 2 tuần đi khảo sát các vị trí tiềm năng:',
          '• Vị trí A: Gần trường đại học, giá thuê 5 triệu/tháng',
          '• Vị trí B: Khu văn phòng, giá thuê 10 triệu/tháng',
          '• Vị trí C: Chợ đêm, giá thuê 8 triệu/tháng',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Tiêu chí chọn vị trí',
        text: '✅ Đông người qua lại (khách tiềm năng)\n✅ Gần đối tượng khách hàng mục tiêu\n✅ Không quá nhiều đối thủ cạnh tranh\n✅ Giá thuê hợp lý (< 10% doanh thu dự kiến)\n✅ Có giấy phép kinh doanh thực phẩm được',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Phân tích từng vị trí',
        paragraphs: [
          '📍 Vị trí A - Gần trường đại học:',
          '• Ưu điểm: Sinh viên đông, thích ăn vặt rẻ',
          '• Nhược điểm: Nghỉ hè 3 tháng, sinh viên ít tiền',
          '• Doanh thu dự kiến: Cao vào học kỳ, thấp vào hè',
          '',
          '📍 Vị trí B - Khu văn phòng:',
          '• Ưu điểm: Nhân viên văn phòng mua sức, giá cao hơn được',
          '• Nhược điểm: Chỉ bán được buổi sáng và trưa, cuối tuần vắng',
          '• Doanh thu dự kiến: Ổn định nhưng chỉ 5 ngày/tuần',
        ],
      },
      {
        type: 'question',
        question: 'Bác Tư nên chọn vị trí nào?',
        options: [
          { id: 'a', text: 'Vị trí A - Rẻ nhất', isCorrect: false },
          { id: 'b', text: 'Vị trí B - Khách có tiền', isCorrect: true },
          { id: 'c', text: 'Vị trí C - Chợ đêm vui', isCorrect: false },
          { id: 'd', text: 'Không mở nữa', isCorrect: false },
        ],
        explanation: 'Vị trí B có khách hàng ổn định, thu nhập cao. Dù giá thuê cao hơn nhưng có thể bán giá cao hơn và khách trung thành. Chỉ bán 5 ngày/tuần cũng giảm chi phí nhân công.',
      },
      {
        type: 'text',
        title: 'Thủ tục pháp lý khi mở điểm mới',
        paragraphs: [
          'Bác Tư cần làm các thủ tục sau:',
          '1. Đăng ký bổ sung địa điểm kinh doanh tại Phòng ĐKKD cấp Quận/Huyện',
          '2. Xin giấy chứng nhận ATTP cho điểm mới',
          '3. Thông báo với cơ quan thuế về việc mở rộng',
          '4. Điều chỉnh mức thuế khoán (tăng doanh thu)',
          '',
          'Chi phí thủ tục: ~500.000đ',
          'Thời gian: 5-7 ngày làm việc',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Cảnh báo về việc không đăng ký',
        text: 'Nếu mở điểm mới mà không đăng ký, bác Tư có thể bị:\n• Phạt hành chính: 1-5 triệu đồng\n• Bị yêu cầu ngừng kinh doanh\n• Không được khấu trừ chi phí khi tính thuế',
        variant: 'warning',
      },
    ],
  },

  // Chapter 4: Thuê người phụ
  'bactu-kd-4': {
    lessonId: 'bactu-kd-4',
    title: 'Thuê người phụ',
    blocks: [
      {
        type: 'text',
        title: 'Bác Tư tuyển nhân viên',
        paragraphs: [
          'Xe mới cần có người bán. Bác Tư quyết định thuê 1 nhân viên chính và 1 phụ việc.',
          'Đây là lần đầu bác làm chủ và trả lương cho người khác.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Chi phí nhân công',
        text: '👨‍🍳 Nhân viên chính (bán hàng):\n• Lương: 7 triệu/tháng\n• BHXH, BHYT (nếu có): +1.5 triệu\n• Ăn trưa: 700.000đ\n→ Tổng: ~9 triệu/tháng\n\n👦 Phụ việc (part-time):\n• Công nhật: 200.000đ/ngày × 15 ngày = 3 triệu/tháng',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Nghĩa vụ của người sử dụng lao động',
        paragraphs: [
          'Khi thuê nhân viên, bác Tư cần biết:',
          '',
          '📋 Hợp đồng lao động:',
          '• Làm việc từ 1 tháng trở lên phải có hợp đồng',
          '• Ghi rõ lương, thời gian làm việc, công việc',
          '',
          '🏥 Bảo hiểm (nếu thuê chính thức):',
          '• BHXH: Người lao động 8%, Bác Tư đóng 17.5%',
          '• BHYT: NLĐ 1.5%, Bác Tư 3%',
          '• BHTN: NLĐ 1%, Bác Tư 1%',
        ],
      },
      {
        type: 'question',
        question: 'Bác Tư thuê nhân viên lương 7 triệu, nếu đóng BHXH đầy đủ, tổng chi phí là bao nhiêu?',
        options: [
          { id: 'a', text: '7 triệu', isCorrect: false },
          { id: 'b', text: '7.7 triệu (thêm 10%)', isCorrect: false },
          { id: 'c', text: '8.5 triệu (thêm 21.5%)', isCorrect: true },
          { id: 'd', text: '10 triệu', isCorrect: false },
        ],
        explanation: 'Ngoài lương 7 triệu, bác Tư phải đóng thêm 21.5% cho BHXH (17.5%), BHYT (3%), BHTN (1%) = 7 × 21.5% = 1.505 triệu. Tổng: ~8.5 triệu.',
      },
      {
        type: 'text',
        title: 'Lựa chọn của bác Tư',
        paragraphs: [
          'Bác Tư cân nhắc 2 phương án:',
          '',
          '📌 Phương án 1: Thuê chính thức (có BHXH)',
          '• Chi phí cao hơn (~8.5 triệu/tháng)',
          '• Nhân viên yên tâm, gắn bó lâu dài',
          '• Đúng quy định pháp luật',
          '',
          '📌 Phương án 2: Thuê thời vụ (không BHXH)',
          '• Chi phí thấp hơn (7 triệu/tháng)',
          '• Nhân viên có thể nghỉ bất cứ lúc nào',
          '• Rủi ro pháp lý nếu bị kiểm tra',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Bác Tư quyết định',
        text: '"Tui chọn thuê chính thức, đóng BHXH cho người ta. Tốn thêm 1.5 triệu/tháng nhưng người ta yên tâm làm việc. Với lại làm đúng luật, ngủ ngon hơn!"',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuế TNCN cho nhân viên',
        paragraphs: [
          'Với lương 7 triệu/tháng, nhân viên của bác Tư:',
          '• Thu nhập: 7.000.000đ',
          '• Trừ BHXH, BHYT, BHTN (10.5%): -735.000đ',
          '• Thu nhập còn lại: 6.265.000đ',
          '• Giảm trừ gia cảnh: 15.500.000đ',
          '• Thu nhập tính thuế: 6.265.000 - 15.500.000 < 0',
          '',
          '→ Nhân viên không phải đóng thuế TNCN!',
        ],
      },
      {
        type: 'question',
        question: 'Bác Tư có cần khấu trừ thuế TNCN từ lương nhân viên không?',
        options: [
          { id: 'a', text: 'Có, luôn phải khấu trừ 10%', isCorrect: false },
          { id: 'b', text: 'Không, vì lương dưới mức chịu thuế', isCorrect: true },
          { id: 'c', text: 'Tùy thuộc vào nhân viên', isCorrect: false },
          { id: 'd', text: 'Chỉ khấu trừ khi nhân viên yêu cầu', isCorrect: false },
        ],
        explanation: 'Lương 7 triệu - BHXH = 6.265 triệu < 15,5 triệu (giảm trừ gia cảnh). Nhân viên không phải đóng thuế TNCN, bác Tư không cần khấu trừ.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Bác Tư đã sẵn sàng mở rộng!',
        text: 'Với kế hoạch chi tiết, địa điểm tốt và nhân viên tin cậy, bác Tư tự tin mở xe bánh mì thứ 2. Ước mơ 3 xe bánh mì đang dần thành hiện thực!',
        variant: 'success',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ LAO ĐỘNG SỐ CỦA ĐỨC (Tài xế công nghệ, chạy xe ôm app)
// ============================================================

export const ducCanhLaoContents: Record<string, LessonContent> = {
  // Chapter 1: Một ngày của tài xế công nghệ
  'duc-cl-1': {
    lessonId: 'duc-cl-1',
    title: 'Một ngày của tài xế công nghệ',
    blocks: [
      {
        type: 'text',
        title: 'Câu chuyện của Đức',
        paragraphs: [
          'Đức, 35 tuổi, từng là công nhân nhà máy giày ở Bình Dương. Khi nhà máy cắt giảm nhân sự, anh quyết định lên Sài Gòn chạy xe ôm công nghệ.',
          'Mỗi ngày, Đức thức dậy lúc 5 giờ sáng, bật app và bắt đầu nhận cuốc. Anh thường chạy đến 9 giờ tối mới về - 14 tiếng trên đường.',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Thông báo từ app',
        text: 'Bạn đã hoàn thành 15 cuốc hôm nay. Thu nhập: 380.000đ. Phí dịch vụ: 95.000đ. Thực nhận: 285.000đ.',
        variant: 'info',
      },
      {
        type: 'text',
        paragraphs: [
          'Đức nhìn con số 285.000đ và thở dài. Nghe thì có vẻ ổn, nhưng anh biết thu nhập thực sự thấp hơn nhiều:',
          '• Xăng xe: 80.000đ/ngày',
          '• Data điện thoại: 10.000đ/ngày',
          '• Bảo trì xe (thay nhớt, vá lốp, sửa chữa...): trung bình 15.000đ/ngày',
          'Thu nhập thực tế: 285.000 - 80.000 - 10.000 - 15.000 = 180.000đ cho 14 giờ làm việc.',
        ],
      },
      {
        type: 'question',
        question: 'Với thu nhập thực tế 180.000đ cho 14 giờ làm việc, thu nhập theo giờ của Đức là bao nhiêu? So sánh với mức lương tối thiểu giờ?',
        options: [
          { id: 'a', text: '25.000đ/giờ - cao hơn lương tối thiểu', isCorrect: false },
          { id: 'b', text: '12.800đ/giờ - thấp hơn lương tối thiểu vùng I', isCorrect: true },
          { id: 'c', text: '18.000đ/giờ - bằng lương tối thiểu', isCorrect: false },
          { id: 'd', text: '30.000đ/giờ - gấp đôi lương tối thiểu', isCorrect: false },
        ],
        explanation: 'Lương tối thiểu vùng I (TP.HCM) là 23.800đ/giờ. Đức chỉ kiếm được 12.800đ/giờ (180.000 ÷ 14), thấp hơn gần một nửa so với lương tối thiểu.',
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Thực trạng',
        text: 'Nhiều tài xế công nghệ làm việc nhiều giờ hơn công nhân nhà máy nhưng thu nhập thực tế thấp hơn lương tối thiểu. Với tài xế, chưa bao giờ guồng quay lao động khắc nghiệt đến vậy.',
        variant: 'warning',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Câu chuyện của Đức đại diện cho hàng trăm nghìn tài xế công nghệ. Thu nhập thực tế sau chi phí thấp hơn nhiều so với con số app hiển thị, và thường thấp hơn cả lương tối thiểu.',
        variant: 'success',
      },
    ],
  },

  // Chapter 2: Nền kinh tế Gig là gì?
  'duc-cl-2': {
    lessonId: 'duc-cl-2',
    title: 'Nền kinh tế Gig là gì?',
    blocks: [
      {
        type: 'text',
        title: 'Đức không đơn độc',
        paragraphs: [
          'Đức không phải người duy nhất trong tình cảnh này. Trên toàn thế giới, hàng trăm triệu người đang làm việc trong cái gọi là "Nền kinh tế Gig" (Gig Economy).',
          'Từ "gig" ban đầu dùng trong ngành âm nhạc - chỉ những buổi biểu diễn ngắn hạn. Giờ đây, nó mô tả một hệ thống kinh tế nơi người lao động làm việc theo từng nhiệm vụ ngắn hạn thay vì công việc cố định.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Nền kinh tế Gig (Gig Economy)',
        text: 'Là hệ thống kinh tế mà người lao động làm việc theo từng "gig" (nhiệm vụ ngắn hạn) thông qua nền tảng số, thay vì làm việc cố định với hợp đồng lao động truyền thống.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Gig Economy ở Việt Nam',
        paragraphs: [
          'Tại Việt Nam, nền kinh tế Gig phát triển mạnh với:',
          '• 200.000+ tài xế xe ôm công nghệ (Grab, Be, Gojek)',
          '• Hàng trăm nghìn shipper giao hàng (ShopeeFood, GrabFood)',
          '• Freelancer trên các nền tảng (Fiverr, Upwork)',
          '',
          'So sánh với việc làm truyền thống:',
          '• Việc làm truyền thống: Ổn định, có BHXH, lương cố định, nghỉ phép',
          '• Gig Economy: Linh hoạt giờ giấc, KHÔNG có BHXH, thu nhập bấp bênh, không nghỉ phép',
        ],
      },
      {
        type: 'question',
        question: 'Điều gì KHÔNG phải là đặc điểm của nền kinh tế Gig?',
        options: [
          { id: 'a', text: 'Làm việc linh hoạt về thời gian', isCorrect: false },
          { id: 'b', text: 'Được đóng bảo hiểm xã hội bắt buộc', isCorrect: true },
          { id: 'c', text: 'Thu nhập phụ thuộc vào số đơn', isCorrect: false },
          { id: 'd', text: 'Không có hợp đồng lao động truyền thống', isCorrect: false },
        ],
        explanation: 'Người lao động trong Gig Economy thường KHÔNG được đóng BHXH bắt buộc vì họ bị phân loại là "đối tác độc lập" chứ không phải nhân viên.',
      },
      {
        type: 'text',
        title: '"Đối tác" hay "Nhân viên"?',
        paragraphs: [
          'Các công ty công nghệ luôn gọi tài xế là "đối tác" (partner) chứ không phải "nhân viên" (employee). Tại sao?',
          'Vì nếu tài xế là nhân viên, công ty phải:',
          '• Đóng BHXH, BHYT, BHTN (21,5% lương: BHXH 17,5% + BHYT 3% + BHTN 1%)',
          '• Trả phép năm, lễ tết',
          '• Bồi thường tai nạn lao động',
          '• Trả trợ cấp thôi việc',
          'Gọi tài xế là "đối tác" giúp công ty tiết kiệm 30-40% chi phí lao động.',
        ],
      },
      {
        type: 'question',
        question: 'Tại sao các công ty gọi xe muốn gọi tài xế là "đối tác" thay vì "nhân viên"?',
        options: [
          { id: 'a', text: 'Vì tôn trọng tài xế', isCorrect: false },
          { id: 'b', text: 'Vì không phải đóng BHXH, BHYT, trả phép năm, bồi thường tai nạn...', isCorrect: true },
          { id: 'c', text: 'Vì tài xế thích được gọi như vậy', isCorrect: false },
          { id: 'd', text: 'Vì luật bắt buộc phải gọi như vậy', isCorrect: false },
        ],
        explanation: 'Phân loại tài xế là "đối tác" giúp công ty né tránh mọi nghĩa vụ của người sử dụng lao động theo Bộ Luật Lao Động, tiết kiệm khoảng 30-40% chi phí.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Nền kinh tế Gig mang lại sự linh hoạt nhưng đánh đổi bằng sự bấp bênh. Cách phân loại "đối tác" thay vì "nhân viên" là chiến lược để công ty né tránh nghĩa vụ lao động.',
        variant: 'success',
      },
    ],
  },

  // Chapter 3: Khi thuật toán làm sếp
  'duc-cl-3': {
    lessonId: 'duc-cl-3',
    title: 'Khi thuật toán làm sếp',
    blocks: [
      {
        type: 'text',
        title: 'Người sếp vô hình',
        paragraphs: [
          'Đức không có sếp, không có quản lý. Nhưng anh bị kiểm soát chặt hơn bất kỳ nhân viên văn phòng nào.',
          'Người "sếp" của Đức là thuật toán - một hệ thống tự động quyết định mọi thứ trong công việc của anh:',
          '• Cuốc nào Đức được nhận',
          '• Giá cuốc bao nhiêu',
          '• Mức thưởng/phạt ra sao',
          '• Liệu Đức có bị "ẩn" khỏi hệ thống hay không',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Quản lý bằng thuật toán (Algorithmic Management)',
        text: 'Là hình thức quản lý lao động thông qua phần mềm tự động, nơi thuật toán đưa ra quyết định về phân công việc, đánh giá hiệu suất, và kỷ luật - thay cho con người.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuật toán kiểm soát Đức như thế nào?',
        paragraphs: [
          '📍 Phân cuốc: Thuật toán quyết định ai nhận cuốc nào. Tài xế "ngoan" (ít từ chối) được ưu tiên.',
          '💰 Định giá: Surge pricing - giá tăng vào giờ cao điểm, nhưng Đức không được quyết định giá.',
          '⭐ Chấm điểm: Khách hàng đánh giá từ 1-5 sao. Dưới 4.5 sao, Đức bị giảm cuốc.',
          '🚫 Phạt: Từ chối cuốc liên tiếp → bị "ẩn" khỏi hệ thống, không nhận được cuốc mới.',
        ],
      },
      {
        type: 'question',
        question: 'Nếu Đức từ chối 3 cuốc liên tiếp, app sẽ làm gì?',
        options: [
          { id: 'a', text: 'Không làm gì, đó là quyền của Đức', isCorrect: false },
          { id: 'b', text: 'Gọi điện nhắc nhở Đức', isCorrect: false },
          { id: 'c', text: 'Giảm số cuốc được phân phối, "ẩn" Đức khỏi hệ thống một thời gian', isCorrect: true },
          { id: 'd', text: 'Khóa tài khoản vĩnh viễn', isCorrect: false },
        ],
        explanation: 'Thuật toán "phạt ngầm" tài xế từ chối cuốc bằng cách giảm tần suất phân phối đơn, thậm chí "ẩn" tài xế khỏi hệ thống. Đây gọi là shadow banning.',
      },
      {
        type: 'text',
        title: 'Sếp thuật toán vs Sếp con người',
        paragraphs: [
          'So sánh hai kiểu quản lý:',
          '',
          '👤 Sếp con người (công việc truyền thống):',
          '• Có thể nói chuyện, thương lượng',
          '• Quyết định có lý do rõ ràng',
          '• Có thể khiếu nại, kháng cáo',
          '',
          '🤖 Sếp thuật toán (nền tảng số):',
          '• Không thể đối thoại',
          '• Quyết định là "hộp đen" - không giải thích',
          '• Không có cơ chế khiếu nại hiệu quả',
          '• Kiểm soát 24/7 qua GPS, thời gian phản hồi, tỷ lệ chấp nhận',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Nghịch lý',
        text: 'Tài xế được gọi là "đối tác độc lập" - nghĩa là tự do, tự chủ. Nhưng thực tế, thuật toán kiểm soát họ chặt hơn cả một ông sếp truyền thống. Đây là nghịch lý lớn nhất của nền kinh tế Gig.',
        variant: 'warning',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Thuật toán tạo ra mối quan hệ quyền lực bất đối xứng: công ty kiểm soát mọi khía cạnh công việc qua thuật toán, nhưng không nhận trách nhiệm của người sử dụng lao động. Tài xế bị quản lý chặt nhưng không có bất kỳ quyền lợi nào của người được quản lý.',
        variant: 'success',
      },
    ],
  },

  // Chapter 4: Tầng lớp lao động mới
  'duc-cl-4': {
    lessonId: 'duc-cl-4',
    title: 'Tầng lớp lao động mới',
    blocks: [
      {
        type: 'text',
        title: 'Lịch sử lặp lại?',
        paragraphs: [
          'Vào thế kỷ 19, cuộc Cách mạng Công nghiệp tạo ra một tầng lớp mới: công nhân nhà máy. Họ làm việc 14-16 giờ/ngày, lương thấp, không bảo hiểm, không nghỉ phép.',
          'Hôm nay, cuộc Cách mạng Số đang tạo ra tầng lớp tương tự: "cần lao thời đại số" - những người như Đức, làm việc dưới sự kiểm soát của thuật toán thay vì ông chủ nhà máy.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Tầng lớp cần lao thời đại số',
        text: 'Giống như công nhân nhà máy thế kỷ 19 bị bóc lột bởi chủ nhà máy, tài xế công nghệ ngày nay bị vắt kiệt bởi thuật toán. Công cụ bóc lột thay đổi, nhưng bản chất vẫn giống nhau.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Điểm tương đồng đáng kinh ngạc',
        paragraphs: [
          '⚙️ Công nhân TK19 → 🏍️ Tài xế công nghệ:',
          '• Làm việc 14-16 giờ/ngày → Làm việc 12-14 giờ/ngày',
          '• Lương thấp hơn mức sống → Thu nhập thực dưới lương tối thiểu',
          '• Không có bảo hiểm → Không có BHXH, BHYT',
          '• Bị sa thải không lý do → Bị "khóa tài khoản" không giải thích',
          '• Không có quyền đàm phán → Thuật toán không thể đàm phán',
        ],
      },
      {
        type: 'question',
        question: 'Điểm giống nhau lớn nhất giữa công nhân nhà máy thế kỷ 19 và tài xế công nghệ ngày nay là gì?',
        options: [
          { id: 'a', text: 'Đều làm việc ngoài trời', isCorrect: false },
          { id: 'b', text: 'Đều sử dụng máy móc', isCorrect: false },
          { id: 'c', text: 'Đều bị kiểm soát chặt nhưng không được bảo vệ bởi luật lao động', isCorrect: true },
          { id: 'd', text: 'Đều được trả lương theo tháng', isCorrect: false },
        ],
        explanation: 'Cả hai đều nằm trong tình trạng: bị kiểm soát như nhân viên nhưng pháp luật chưa công nhận họ là người lao động cần được bảo vệ. Thế kỷ 19 cần 50 năm đấu tranh để có luật lao động đầu tiên.',
      },
      {
        type: 'text',
        title: 'Thế giới đang thay đổi',
        paragraphs: [
          'Nhiều quốc gia đã bắt đầu hành động:',
          '',
          '🇬🇧 Vương quốc Anh (2021): Tòa án Tối cao phán quyết tài xế Uber là "người lao động" (worker), không phải nhà thầu độc lập. Họ được hưởng lương tối thiểu và nghỉ phép.',
          '',
          '🇪🇺 Liên minh Châu Âu (2024): Chỉ thị mới yêu cầu các nền tảng phải chứng minh tài xế KHÔNG phải là nhân viên, thay vì ngược lại.',
          '',
          '🇻🇳 Việt Nam: Bộ Luật Lao Động 2019 đã có khái niệm "quan hệ lao động" rộng hơn, nhưng việc áp dụng cho kinh tế Gig vẫn còn nhiều khoảng trống.',
        ],
      },
      {
        type: 'question',
        question: 'Nước nào đã phân loại tài xế công nghệ là "người lao động" thay vì "nhà thầu độc lập" qua phán quyết tòa án?',
        options: [
          { id: 'a', text: 'Mỹ', isCorrect: false },
          { id: 'b', text: 'Trung Quốc', isCorrect: false },
          { id: 'c', text: 'Vương quốc Anh', isCorrect: true },
          { id: 'd', text: 'Nhật Bản', isCorrect: false },
        ],
        explanation: 'Năm 2021, Tòa án Tối cao Anh trong vụ Uber BV v. Aslam đã phán quyết rằng tài xế Uber là "worker" - có quyền hưởng lương tối thiểu và nghỉ phép có lương.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Tài xế công nghệ là "tầng lớp cần lao" của thời đại số - bị kiểm soát bởi thuật toán thay vì ông chủ nhà máy. Lịch sử cho thấy cần có luật pháp mới để bảo vệ họ, giống như luật lao động ra đời để bảo vệ công nhân thế kỷ 19.',
        variant: 'success',
      },
    ],
  },
};

// ============================================================
// CÂU CHUYỆN VỀ PHÁP LUẬT LAO ĐỘNG CỦA ĐỨC (Vùng xám pháp lý)
// ============================================================

export const ducThuatToanContents: Record<string, LessonContent> = {
  // Chapter 1: Tai nạn lúc giao hàng
  'duc-tt-1': {
    lessonId: 'duc-tt-1',
    title: 'Tai nạn lúc giao hàng',
    blocks: [
      {
        type: 'text',
        title: 'Ngày xui xẻo của Đức',
        paragraphs: [
          'Một buổi trưa nắng gắt, Đức đang giao đơn hàng thứ 10 trong ngày. Anh vội vã vì app hiển thị "Giao trong 15 phút để giữ điểm đánh giá".',
          'Tại ngã tư, một chiếc ô tô bất ngờ mở cửa. Đức phanh gấp, ngã xe. Kết quả: gãy tay phải, xe hỏng nặng.',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Thông báo từ app',
        text: 'Đơn hàng #2847 bị giao trễ. Điểm đánh giá của bạn giảm từ 4.7 xuống 4.5. Khách hàng đã hủy đơn.',
        variant: 'warning',
      },
      {
        type: 'text',
        paragraphs: [
          'Đức nằm viện 3 ngày. Chi phí:',
          '• Viện phí + phẫu thuật: 12.000.000đ',
          '• Thuốc và vật tư: 2.000.000đ',
          '• Sửa xe: 3.500.000đ',
          '• Tổng: 17.500.000đ',
          '',
          'Đức liên hệ công ty app. Câu trả lời: "Anh Đức là đối tác độc lập, không phải nhân viên của chúng tôi. Chúng tôi không chịu trách nhiệm về tai nạn trong quá trình anh tự kinh doanh."',
          'Không ai từ công ty gọi hỏi thăm. Không bảo hiểm. Không hỗ trợ.',
        ],
      },
      {
        type: 'question',
        question: 'Nếu Đức là nhân viên chính thức (có hợp đồng lao động), doanh nghiệp phải làm gì khi anh bị tai nạn lao động?',
        options: [
          { id: 'a', text: 'Không cần làm gì vì Đức tự gây tai nạn', isCorrect: false },
          { id: 'b', text: 'Trả toàn bộ chi phí y tế và lương trong thời gian nghỉ điều trị', isCorrect: true },
          { id: 'c', text: 'Chỉ hỗ trợ 50% chi phí', isCorrect: false },
          { id: 'd', text: 'Cho Đức nghỉ việc vì không thể làm việc', isCorrect: false },
        ],
        explanation: 'Theo Luật An toàn Vệ sinh Lao động 2015 và Điều 132-135 Bộ Luật Lao Động 2019, người sử dụng lao động phải trả toàn bộ chi phí y tế, trả lương trong thời gian điều trị, và bồi thường cho người lao động bị tai nạn lao động.',
      },
      {
        type: 'text',
        title: 'Đức phải tự gánh chịu tất cả',
        paragraphs: [
          'Vì Đức là "đối tác", anh phải:',
          '• Tự trả 17.500.000đ chi phí (gần 3 tháng thu nhập)',
          '• Nghỉ 6 tuần không thu nhập (tay gãy không chạy xe được)',
          '• Mất điểm đánh giá trên app',
          '• Không có bảo hiểm y tế để giảm viện phí',
          '',
          'Tổng thiệt hại ước tính: 17.500.000đ + 6 tuần × 180.000đ/ngày × 42 ngày = ~25.060.000đ',
        ],
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Tai nạn của Đức phơi bày lỗ hổng lớn nhất của kinh tế Gig: người lao động gánh chịu mọi rủi ro trong khi công ty hưởng lợi nhuận. Không bảo hiểm, không bồi thường, không ai chịu trách nhiệm.',
        variant: 'success',
      },
    ],
  },

  // Chapter 2: Đối tác hay Nhân viên?
  'duc-tt-2': {
    lessonId: 'duc-tt-2',
    title: 'Đối tác hay Nhân viên?',
    blocks: [
      {
        type: 'text',
        title: 'Câu hỏi pháp lý quan trọng',
        paragraphs: [
          'Sau tai nạn, Đức bắt đầu tìm hiểu: theo pháp luật Việt Nam, anh thực sự là "đối tác" hay "nhân viên"?',
          'Bộ Luật Lao Động 2019 định nghĩa "quan hệ lao động" dựa trên 3 tiêu chí:',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: '3 tiêu chí xác định quan hệ lao động (Điều 13, BLLĐ 2019)',
        text: '1. Có sự quản lý, điều hành của bên thuê lao động\n2. Được trả lương/thù lao\n3. Làm việc theo điều kiện do bên thuê quy định',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Áp dụng 3 tiêu chí vào trường hợp Đức',
        paragraphs: [
          '✅ Tiêu chí 1 - Quản lý, điều hành:',
          '• App phân cuốc cho Đức (Đức không tự tìm khách)',
          '• App theo dõi GPS, thời gian phản hồi, tỷ lệ chấp nhận',
          '• App xử phạt khi Đức từ chối cuốc hoặc bị đánh giá thấp',
          '',
          '✅ Tiêu chí 2 - Trả lương/thù lao:',
          '• App tính tiền cuốc và trả cho Đức sau khi trừ phí dịch vụ',
          '• Đức không được tự đặt giá',
          '',
          '✅ Tiêu chí 3 - Điều kiện làm việc:',
          '• App quy định đồng phục (áo khoác có logo)',
          '• App yêu cầu xe phải đạt tiêu chuẩn',
          '• App quy định quy trình phục vụ khách',
        ],
      },
      {
        type: 'question',
        question: 'Theo 3 tiêu chí của Bộ Luật Lao Động, tài xế công nghệ có dấu hiệu của quan hệ lao động không?',
        options: [
          { id: 'a', text: 'Không, vì tài xế tự chọn giờ làm', isCorrect: false },
          { id: 'b', text: 'Chỉ đáp ứng 1 trong 3 tiêu chí', isCorrect: false },
          { id: 'c', text: 'Có, đáp ứng cả 3 tiêu chí quan hệ lao động', isCorrect: true },
          { id: 'd', text: 'Không thể xác định được', isCorrect: false },
        ],
        explanation: 'Phân tích cho thấy tài xế công nghệ đáp ứng cả 3 tiêu chí: bị quản lý bởi thuật toán, được trả thù lao qua app, và làm việc theo điều kiện app đặt ra. Tuy nhiên, các nền tảng vẫn phân loại họ là "đối tác" để né tránh nghĩa vụ.',
      },
      {
        type: 'text',
        title: 'Vùng xám pháp lý',
        paragraphs: [
          'Dù tài xế đáp ứng cả 3 tiêu chí, thực tế việc áp dụng luật vẫn gặp nhiều khó khăn:',
          '',
          '• Hợp đồng ký là "hợp đồng hợp tác kinh doanh", không phải hợp đồng lao động',
          '• Tài xế có thể "linh hoạt" bật/tắt app (dù bị phạt nếu tắt)',
          '• Chưa có án lệ hoặc hướng dẫn cụ thể cho kinh tế nền tảng',
          '',
          'Đây chính là "vùng xám pháp lý" - khoảng trống mà luật chưa theo kịp thực tế.',
        ],
      },
      {
        type: 'question',
        question: 'Tại sao các công ty gọi xe muốn ký "hợp đồng hợp tác kinh doanh" thay vì "hợp đồng lao động"?',
        options: [
          { id: 'a', text: 'Vì loại hợp đồng này tốt hơn cho tài xế', isCorrect: false },
          { id: 'b', text: 'Vì không phải đóng BHXH, BHYT, trả phép năm, bồi thường tai nạn, trợ cấp thôi việc...', isCorrect: true },
          { id: 'c', text: 'Vì luật bắt buộc phải ký loại này', isCorrect: false },
          { id: 'd', text: 'Vì tài xế yêu cầu ký loại này', isCorrect: false },
        ],
        explanation: 'Hợp đồng hợp tác kinh doanh thuộc Luật Dân sự, không phải Luật Lao động. Điều này giúp công ty không phải thực hiện bất kỳ nghĩa vụ nào theo Bộ Luật Lao Động: BHXH (~17.5%), BHYT (3%), BHTN (1%), phép năm, bồi thường tai nạn.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Trên thực tế, tài xế công nghệ đáp ứng đầy đủ tiêu chí "người lao động" theo Bộ Luật Lao Động 2019. Nhưng thông qua hợp đồng hợp tác kinh doanh, các nền tảng tận dụng vùng xám pháp lý để né tránh nghĩa vụ. Thuật toán vắt kiệt con người, trong khi pháp luật chưa theo kịp.',
        variant: 'success',
      },
    ],
  },

  // Chapter 3: Quyền lợi bị đánh cắp
  'duc-tt-3': {
    lessonId: 'duc-tt-3',
    title: 'Quyền lợi bị đánh cắp',
    blocks: [
      {
        type: 'text',
        title: 'Đức đang mất gì?',
        paragraphs: [
          'Mỗi ngày Đức chạy xe, anh đang mất đi những quyền lợi mà bất kỳ người lao động chính thức nào cũng có. Hãy cùng tính toán:',
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Quyền lợi Đức bị mất (nếu lương 8 triệu/tháng)',
        text: '• BHXH (người sử dụng lao động đóng 17.5%): 1.400.000đ/tháng\n• BHYT (người SDLĐ đóng 3%): 240.000đ/tháng\n• BHTN (người SDLĐ đóng 1%): 80.000đ/tháng\n• Phép năm có lương: 12 ngày/năm ≈ 360.000đ/tháng\n• Tổng: ~2.080.000đ/tháng mà Đức KHÔNG được nhận',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Hậu quả sau 20 năm',
        paragraphs: [
          'Hãy so sánh hai kịch bản sau 20 năm:',
          '',
          '👤 Kịch bản A - Đức là nhân viên chính thức:',
          '• Đóng BHXH 15 năm → Đủ điều kiện hưởng lương hưu (theo Luật BHXH 2024)',
          '• Lương hưu ước tính: ~3.600.000đ/tháng (45% × lương bình quân 8 triệu, suốt đời)',
          '• Có thẻ BHYT → giảm 80% chi phí khám chữa bệnh',
          '• Được bồi thường nếu bị tai nạn lao động',
          '',
          '👤 Kịch bản B - Đức là "đối tác" app (thực tế):',
          '• Không đóng BHXH → KHÔNG có lương hưu',
          '• Không có BHYT → trả 100% chi phí y tế',
          '• Về già không có thu nhập → phụ thuộc con cái hoặc trợ cấp xã hội',
        ],
      },
      {
        type: 'question',
        question: 'Nếu Đức chạy xe 20 năm mà không đóng BHXH, khi về già (60 tuổi) anh sẽ nhận được gì từ nhà nước?',
        options: [
          { id: 'a', text: 'Lương hưu hàng tháng', isCorrect: false },
          { id: 'b', text: 'Không nhận được gì (không đủ 15 năm đóng BHXH)', isCorrect: true },
          { id: 'c', text: 'Trợ cấp thất nghiệp', isCorrect: false },
          { id: 'd', text: 'Bảo hiểm y tế miễn phí', isCorrect: false },
        ],
        explanation: 'Theo Luật BHXH 2024, cần đóng BHXH tối thiểu 15 năm để hưởng lương hưu (giảm từ 20 năm trước đây). Nếu Đức không đóng BHXH (vì là "đối tác"), anh sẽ KHÔNG có lương hưu, KHÔNG có thẻ BHYT khi về già. Đây là cái giá thực sự của vùng xám pháp lý.',
      },
      {
        type: 'text',
        title: 'Giải pháp: Thế giới đang làm gì?',
        paragraphs: [
          'Các quốc gia đang tìm cách bảo vệ người lao động nền tảng:',
          '',
          '🔹 BHXH bắt buộc cho lao động nền tảng:',
          'Buộc nền tảng đóng BHXH cho tài xế, giống nhân viên chính thức.',
          '',
          '🔹 Luật trách nhiệm nền tảng:',
          'Nền tảng phải chịu một phần trách nhiệm về tai nạn, bảo hiểm.',
          '',
          '🔹 Hệ thống phúc lợi linh hoạt (Portable Benefits):',
          'Quyền lợi gắn với cá nhân người lao động, không phụ thuộc vào một công ty cụ thể. Nhiều nền tảng cùng đóng góp.',
          '',
          '🇻🇳 Tại Việt Nam, Luật BHXH 2024 đã bắt đầu mở rộng đối tượng tham gia, tạo tiền đề cho việc bảo vệ lao động nền tảng.',
        ],
      },
      {
        type: 'question',
        question: 'Giải pháp nào sẽ công bằng nhất cho cả tài xế lẫn công ty công nghệ?',
        options: [
          { id: 'a', text: 'Giữ nguyên hiện trạng, tài xế tự lo', isCorrect: false },
          { id: 'b', text: 'Buộc tài xế phải là nhân viên chính thức 100%', isCorrect: false },
          { id: 'c', text: 'Chia sẻ trách nhiệm: nền tảng đóng BHXH, tài xế giữ sự linh hoạt', isCorrect: true },
          { id: 'd', text: 'Cấm hoàn toàn mô hình kinh tế Gig', isCorrect: false },
        ],
        explanation: 'Giải pháp cân bằng nhất là hệ thống phúc lợi linh hoạt: nền tảng đóng BHXH tương ứng thu nhập tài xế, tài xế vẫn giữ sự linh hoạt về giờ giấc. Đây là hướng đi mà EU và nhiều quốc gia đang theo đuổi.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Kết luận',
        text: 'Vùng xám pháp lý không phải ngẫu nhiên - nó là đặc điểm có chủ đích của kinh tế nền tảng. Thuật toán vắt kiệt con người trong khi pháp luật chưa theo kịp. Người lao động như Đức cần những khung pháp lý mới, phù hợp với thực tế thời đại số, để quyền lợi của họ không bị đánh cắp.',
        variant: 'success',
      },
    ],
  },
};

// Merge tất cả story contents
export const allStoryContents: Record<string, LessonContent> = {
  ...minhThueContents,
  ...huongThueContents,
  ...bacTuThueContents,
  ...minhKinhTeContents,
  ...huongDauTuContents,
  ...bacTuKinhDoanhContents,
  ...ducCanhLaoContents,
  ...ducThuatToanContents,
};
