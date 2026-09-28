/**
 * Script to ADD "Thuế 101 (ver2)" course to the database.
 *
 * Based on: MassEdu (an earlier team prototype)
 * Content: Vietnamese Tax 101 course — comprehensive tax education
 *
 * This is a SEPARATE course from existing "thue-101".
 * Slug: thue-101-v2
 *
 * Structure: 4 Levels, 11 Lessons
 *   Level 1: Thuế ơi thuế à (4 lessons)
 *   Level 2: Tại sao đóng thuế? (2 lessons)
 *   Level 3: Thuế, Minh bạch & Chính trị (2 lessons)
 *   Level 4: Thuế trong đời sống thực (3 lessons)
 *
 * Run with: npx tsx scripts/add-thue101v2-course.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// Course structure definition
// ─────────────────────────────────────────────
const THUE101V2_COURSE = {
  slug: 'thue-101-v2',
  name: 'Thuế 101 (ver2)',
  description: 'Khóa học thuế toàn diện: từ khái niệm cơ bản, phân loại thuế, đến tính thuế TNCN thực tế',
  icon: 'receipt',
  isNew: true,
  levels: [
    {
      name: 'Thuế ơi thuế à',
      lessons: [
        { id: 'thuev2-1', name: 'Thuế là gì?' },
        { id: 'thuev2-2', name: 'Phân loại thuế' },
        { id: 'thuev2-3', name: 'Ai thực sự gánh thuế?' },
        { id: 'thuev2-4', name: 'Suy ngẫm về thuế' },
      ],
    },
    {
      name: 'Tại sao đóng thuế?',
      lessons: [
        { id: 'thuev2-5', name: 'Mục đích của thuế' },
        { id: 'thuev2-6', name: 'Nguyên tắc thu thuế' },
      ],
    },
    {
      name: 'Thuế, Minh bạch & Chính trị',
      lessons: [
        { id: 'thuev2-7', name: 'Thuế và minh bạch' },
        { id: 'thuev2-8', name: 'Thuế và chính trị' },
      ],
    },
    {
      name: 'Thuế trong đời sống thực',
      lessons: [
        { id: 'thuev2-9', name: 'Nhận diện thuế hàng ngày' },
        { id: 'thuev2-10', name: 'Mã số thuế & Thuế TNCN' },
        { id: 'thuev2-11', name: 'Tính thuế TNCN từ lương' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// Lesson contents — all 11 lessons inline
// ─────────────────────────────────────────────
const lessonContents: Record<string, { title: string; blocks: any[] }> = {
  // ════════════════════════════════════════════════════════════════
  // LEVEL 1: THUẾ ƠI THUẾ À
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // LESSON 1: Thuế là gì?
  // Source: MassEdu 1e (Thuế Là Gì) + 1a (Bạn Đang Đóng Thuế Gì)
  // ────────────────────────────────────────────────────────────────
  'thuev2-1': {
    title: 'Thuế là gì?',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Mỗi ngày, bạn đều đóng thuế — dù có thể bạn không hề biết. Khi mua một ổ bánh mì 25.000 đồng, một phần trong số đó là thuế. Khi đổ xăng, mua cà phê, hay thanh toán hóa đơn điện — tất cả đều có thuế ẩn bên trong.',
          'Nhưng thuế thực sự là gì? Tại sao nó tồn tại? Và nó khác gì so với việc bạn trả tiền mua hàng thông thường?',
          'Bài học này sẽ giúp bạn hiểu bản chất của thuế — từ định nghĩa, đặc điểm, đến cách thuế len lỏi vào mọi giao dịch hàng ngày.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Thuế là gì, và điều gì khiến nó khác biệt hoàn toàn so với việc bạn tự nguyện trả tiền mua một món hàng?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Khi bạn mua một ổ bánh mì 25.000 đồng, bạn có đang đóng thuế không?',
        options: [
          { id: 'a', text: 'Không — tôi chỉ trả tiền cho người bán bánh mì', isCorrect: false },
          { id: 'b', text: 'Có — một phần tiền tôi trả bao gồm thuế VAT (thuế giá trị gia tăng)', isCorrect: true },
          { id: 'c', text: 'Chỉ khi tôi mua ở cửa hàng có hóa đơn', isCorrect: false },
          { id: 'd', text: 'Thuế chỉ áp dụng cho hàng xa xỉ, không áp dụng cho bánh mì', isCorrect: false },
        ],
        explanation: 'Mỗi khi bạn mua bất kỳ hàng hóa nào, thuế VAT đã được tính vào giá bán. Với ổ bánh mì 25.000 đồng, khoảng 2.273 đồng trong đó là thuế VAT 10%. Bạn đóng thuế mỗi ngày mà có thể không hề nhận ra!',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Thuế là gì?',
        paragraphs: [
          'Thuế là khoản tiền bắt buộc mà Nhà nước thu từ cá nhân và tổ chức. Đây là định nghĩa đơn giản nhất, nhưng chứa hai đặc điểm quan trọng:',
          'Thứ nhất, thuế mang tính bắt buộc. Bạn không có lựa chọn "không đóng thuế" — đó là nghĩa vụ pháp lý. Nhà nước có quyền cưỡng chế thu thuế, và việc trốn thuế là vi phạm pháp luật.',
          'Thứ hai, thuế không mang lại lợi ích trực tiếp cho người đóng. Khi bạn mua cà phê, bạn nhận được ly cà phê ngay lập tức. Nhưng khi bạn đóng thuế, bạn không nhận lại thứ gì cụ thể — thuế được dùng để tài trợ cho các dịch vụ công cộng mà tất cả mọi người cùng hưởng lợi: đường xá, bệnh viện, trường học, quốc phòng.',
          'Như Oliver Wendell Holmes Jr. từng nói: "Thuế là giá mà chúng ta trả cho một xã hội văn minh."',
        ],
      },
      {
        type: 'hot-cold-guess',
        title: 'Bạn đoán xem: VAT chiếm bao nhiêu phần trăm giá ổ bánh mì?',
        question: 'Thuế VAT (thuế giá trị gia tăng) tại Việt Nam hiện nay là bao nhiêu phần trăm?',
        answer: 10,
        unit: '%',
        tolerance: 15,
        hints: [
          'VAT tại Việt Nam áp dụng chung cho hầu hết hàng hóa và dịch vụ.',
          'Mức thuế này nằm trong khoảng 5% đến 15%.',
          'Nhiều nước ASEAN cũng áp dụng mức tương tự.',
        ],
        context: 'Thuế VAT tại Việt Nam hiện là 10% (có thể giảm còn 8% trong một số giai đoạn theo chính sách hỗ trợ). Với ổ bánh mì 25.000 đồng, khoảng 2.273 đồng là thuế VAT. Mỗi ngày, mỗi giao dịch mua bán, bạn đều đang đóng thuế mà có thể không hề nhận ra.',
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Lịch sử thuế — Từ Mesopotamia đến hiện đại',
        text: 'Thuế không phải phát minh hiện đại. Từ khoảng 3.000 năm TCN tại Mesopotamia, các thành bang đã thu thuế dưới dạng nông sản. Ai Cập cổ đại thu thuế bằng lao động (xây kim tự tháp). Trong Kinh Thánh, "thuế thập phân" (tithe) yêu cầu dâng 1/10 thu nhập. Thuế luôn tồn tại — chỉ hình thức thay đổi.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuế ẩn trong mọi giao dịch hàng ngày',
        paragraphs: [
          'Hãy theo dõi một ngày bình thường của Tép — sinh viên năm 3 tại TP.HCM:',
          'Buổi sáng, Tép mua ổ bánh mì 25.000 đồng — trong đó có ~2.273 đồng thuế VAT. Tép đổ xăng xe máy — giá xăng đã bao gồm thuế VAT, thuế tiêu thụ đặc biệt, thuế bảo vệ môi trường. Tép ghé quán cà phê — ly cà phê 30.000 đồng cũng có ~2.727 đồng VAT.',
          'Chỉ trong một buổi sáng, Tép đã đóng ít nhất 3 lần thuế mà không hề nhận ra. Đó là bản chất của thuế gián tiếp — nó "vô hình", được tính vào giá bán và người mua gánh chịu một cách thầm lặng.',
        ],
      },
      {
        type: 'cause-effect-chain',
        title: 'Thuế hoạt động như thế nào?',
        instruction: 'Nối các bước trong chuỗi vận hành của thuế — từ khi bạn mua hàng đến khi thuế được sử dụng.',
        nodes: [
          { id: 'buy', text: 'Bạn mua hàng hóa (ví dụ: ổ bánh mì)', category: 'Hành động' },
          { id: 'vat', text: 'Thuế VAT được tính vào giá bán', category: 'Thuế' },
          { id: 'seller', text: 'Người bán thu tiền (bao gồm thuế)', category: 'Trung gian' },
          { id: 'gov', text: 'Người bán nộp phần thuế cho Nhà nước', category: 'Thu thuế' },
          { id: 'budget', text: 'Thuế vào ngân sách quốc gia', category: 'Ngân sách' },
          { id: 'service', text: 'Nhà nước chi cho dịch vụ công (đường, trường, bệnh viện)', category: 'Dịch vụ công' },
        ],
        correctConnections: [
          { fromId: 'buy', toId: 'vat' },
          { fromId: 'vat', toId: 'seller' },
          { fromId: 'seller', toId: 'gov' },
          { fromId: 'gov', toId: 'budget' },
          { fromId: 'budget', toId: 'service' },
        ],
        explanation: 'Thuế hoạt động như một vòng tuần hoàn: bạn trả tiền mua hàng → thuế được tính vào giá → người bán nộp thuế cho Nhà nước → Nhà nước dùng tiền thuế để xây dựng và duy trì dịch vụ công mà bạn sử dụng mỗi ngày.',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Thuế — Khái niệm nền tảng',
        description: 'Định nghĩa, đặc điểm, và vai trò của thuế trong nền kinh tế',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'Hai đặc điểm cốt lõi của thuế',
              paragraphs: [
                'Tính bắt buộc: Thuế không phải tự nguyện. Nhà nước có quyền lực cưỡng chế để đảm bảo mọi cá nhân và tổ chức thực hiện nghĩa vụ thuế. Đây là điểm khác biệt căn bản giữa thuế và các khoản đóng góp tự nguyện.',
                'Không đối giá trực tiếp: Khi đóng thuế, bạn không nhận lại một hàng hóa hay dịch vụ cụ thể. Thay vào đó, tiền thuế được sử dụng cho lợi ích chung của toàn xã hội — điều này hoàn toàn khác với giao dịch mua bán thông thường.',
              ],
            },
            {
              heading: 'Thuế trong lịch sử',
              paragraphs: [
                'Thuế xuất hiện từ khi con người bắt đầu tổ chức thành xã hội có nhà nước. Ở Mesopotamia cổ đại (~3.000 TCN), thuế được thu bằng nông sản. Ai Cập cổ đại thu thuế bằng lao động — và từ đó mà kim tự tháp ra đời.',
                'Thuế thập phân (tithe) trong Kinh Thánh yêu cầu dâng 1/10 thu nhập cho nhà thờ — một hình thức thuế tôn giáo. Ở Việt Nam phong kiến, thuế đinh (thuế thân) và thuế điền (thuế ruộng đất) là hai loại thuế chính.',
              ],
            },
          ],
          relatedConcepts: ['VAT', 'Thuế trực tiếp', 'Thuế gián tiếp', 'Ngân sách nhà nước'],
          furtherReading: [
            'https://vi.wikipedia.org/wiki/Thu%E1%BA%BF',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Thuế là khoản tiền bắt buộc Nhà nước thu từ cá nhân và tổ chức\n✓ Hai đặc điểm: bắt buộc + không đối giá trực tiếp\n✓ Thuế VAT ẩn trong mọi giao dịch mua bán hàng ngày\n✓ Thuế đã tồn tại từ hàng nghìn năm — chỉ hình thức thay đổi\n✓ Tiền thuế được dùng cho dịch vụ công: đường, trường, bệnh viện',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học tiếp theo',
        paragraphs: [
          'Giờ bạn đã biết thuế là gì và nó ẩn trong mọi giao dịch hàng ngày. Nhưng "thuế" không phải là một khái niệm đơn lẻ — có rất nhiều loại thuế khác nhau, và mỗi loại ảnh hưởng đến bạn theo cách khác nhau.',
          'Bài học tiếp theo sẽ giúp bạn phân biệt các loại thuế: thuế trực tiếp vs gián tiếp, thuế lũy tiến vs lũy thoái — và tại sao cách phân loại này lại quan trọng với túi tiền của bạn.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 2: Phân loại thuế
  // Source: MassEdu 1f (Phân Loại Thuế)
  // ────────────────────────────────────────────────────────────────
  'thuev2-2': {
    title: 'Phân loại thuế',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Không phải tất cả các loại thuế đều giống nhau. Có loại thuế bạn nhìn thấy rõ ràng trên bảng lương, có loại thuế ẩn trong giá cà phê bạn uống mỗi sáng. Có loại thuế khiến người giàu đóng nhiều hơn, nhưng cũng có loại thuế khiến người nghèo gánh nặng hơn.',
          'Bài học này sẽ giúp bạn phân biệt các loại thuế theo hai tiêu chí: cách thu (trực tiếp vs gián tiếp) và mức độ công bằng (lũy tiến, lũy thoái, đồng nhất).',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Thuế có nhiều loại — nhưng loại nào công bằng hơn? Và "công bằng" có nghĩa là gì khi nói về thuế?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Thuế VAT (thuế giá trị gia tăng) có công bằng không, khi cả người giàu lẫn người nghèo đều trả cùng một mức %?',
        options: [
          { id: 'a', text: 'Rất công bằng — ai cũng trả như nhau, không phân biệt', isCorrect: false },
          { id: 'b', text: 'Không công bằng — vì cùng 10% nhưng tác động lên người nghèo nặng hơn nhiều', isCorrect: true },
          { id: 'c', text: 'Chỉ công bằng nếu thuế suất dưới 5%', isCorrect: false },
          { id: 'd', text: 'Thuế VAT không liên quan đến công bằng, nó chỉ là công cụ thu ngân sách', isCorrect: false },
        ],
        explanation: 'Cùng 10% VAT trên 500.000 đồng hóa đơn siêu thị = 50.000 đồng thuế. Với người thu nhập 5 triệu/tháng, 50.000 đồng = 1% thu nhập. Nhưng với người thu nhập 50 triệu/tháng, 50.000 đồng chỉ = 0.1% thu nhập. Cùng một mức thuế, nhưng gánh nặng thực tế khác nhau rất nhiều!',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Thuế trực tiếp vs Thuế gián tiếp',
        paragraphs: [
          'Thuế trực tiếp là thuế đánh trực tiếp lên thu nhập, lợi nhuận, hoặc tài sản của bạn. Bạn nhìn thấy rõ ràng khoản thuế mình phải trả. Ví dụ:',
          '• Thuế thu nhập cá nhân (TNCN): đánh lên lương, thưởng của người lao động\n• Thuế thu nhập doanh nghiệp (TNDN): đánh lên lợi nhuận của công ty\n• Thuế tài sản / bất động sản: đánh lên giá trị nhà đất bạn sở hữu',
          'Thuế gián tiếp là thuế đánh lên hàng hóa và dịch vụ — được tính vào giá bán, và người mua là người gánh chịu cuối cùng. Bạn thường không nhận ra mình đang đóng thuế. Ví dụ:',
          '• Thuế VAT (giá trị gia tăng): áp dụng cho hầu hết hàng hóa và dịch vụ\n• Thuế tiêu thụ đặc biệt: đánh lên rượu, bia, thuốc lá, ô tô\n• Thuế xuất nhập khẩu: đánh lên hàng hóa qua biên giới',
        ],
      },
      {
        type: 'spectrum-placer',
        title: 'Xếp các loại thuế trên phổ Trực tiếp ↔ Gián tiếp',
        instruction: 'Kéo mỗi loại thuế vào vị trí phù hợp trên phổ. Bên trái = Trực tiếp (đánh lên thu nhập/tài sản), bên phải = Gián tiếp (đánh lên hàng hóa/dịch vụ).',
        spectrum: {
          leftLabel: 'Trực tiếp',
          rightLabel: 'Gián tiếp',
          leftDescription: 'Đánh lên thu nhập, lợi nhuận, tài sản — người nộp = người chịu thuế',
          rightDescription: 'Đánh lên hàng hóa, dịch vụ — người mua chịu thuế thông qua giá',
        },
        items: [
          { id: 'tncn', label: 'Thuế thu nhập cá nhân', correctPosition: 10, tolerance: 15, explanation: 'Thuế TNCN đánh trực tiếp lên lương của bạn — bạn nhìn thấy rõ trên bảng lương.' },
          { id: 'vat', label: 'Thuế VAT', correctPosition: 90, tolerance: 15, explanation: 'VAT được tính vào giá bán — người mua gánh chịu gián tiếp qua giá hàng hóa.' },
          { id: 'tndn', label: 'Thuế thu nhập doanh nghiệp', correctPosition: 15, tolerance: 15, explanation: 'Đánh trực tiếp lên lợi nhuận công ty — nhưng gánh nặng có thể lan sang nhân viên và khách hàng.' },
          { id: 'ttdb', label: 'Thuế tiêu thụ đặc biệt', correctPosition: 85, tolerance: 15, explanation: 'Đánh lên rượu, bia, thuốc lá — tính vào giá bán, người mua chịu.' },
          { id: 'bds', label: 'Thuế bất động sản', correctPosition: 5, tolerance: 15, explanation: 'Đánh trực tiếp lên tài sản (nhà đất) — chủ sở hữu trực tiếp chịu.' },
          { id: 'xnk', label: 'Thuế xuất nhập khẩu', correctPosition: 80, tolerance: 15, explanation: 'Đánh lên hàng hóa qua biên giới — cuối cùng người tiêu dùng chịu qua giá cao hơn.' },
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Thuế lũy tiến vs Lũy thoái — Khác biệt quan trọng',
        text: 'Thuế lũy tiến (progressive): Người thu nhập cao đóng thuế suất cao hơn. Ví dụ: thuế TNCN Việt Nam có 7 bậc, từ 5% đến 35%.\n\nThuế lũy thoái (regressive): Tuy cùng thuế suất, nhưng người nghèo gánh nặng hơn theo tỷ lệ thu nhập. VAT là ví dụ điển hình — 10% cho tất cả, nhưng 10% của 5 triệu khác xa 10% của 50 triệu.\n\nThuế đồng nhất (flat): Một mức thuế suất duy nhất cho mọi người, bất kể thu nhập cao hay thấp.',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Tại sao cách phân loại này quan trọng?',
        paragraphs: [
          'Cách một quốc gia thiết kế hệ thống thuế phản ánh giá trị và ưu tiên của quốc gia đó:',
          'Nếu dựa nhiều vào thuế gián tiếp (VAT): Dễ thu, khó trốn — nhưng người nghèo gánh nặng hơn vì phần lớn thu nhập của họ dùng cho tiêu dùng.',
          'Nếu dựa nhiều vào thuế trực tiếp (thu nhập cá nhân): Công bằng hơn vì người giàu đóng nhiều hơn — nhưng khó thu và dễ bị lách.',
          'Ở Việt Nam, hệ thống thuế TNCN có 7 bậc lũy tiến: 5%, 10%, 15%, 20%, 25%, 30%, 35%. Mỗi bậc chỉ áp dụng cho phần thu nhập vượt quá ngưỡng trước đó — nghĩa là không phải toàn bộ lương bạn đều bị đánh thuế 35%.',
          'Ví dụ: Giấy phép xe máy (lệ phí) là 200.000 đồng cho mọi người — dù thu nhập 5 triệu hay 50 triệu đều trả bằng nhau. Đây là thuế đồng nhất (flat), và nó ảnh hưởng đến người thu nhập thấp nhiều hơn.',
        ],
      },
      {
        type: 'slider-simulator',
        title: 'Thuế lũy tiến vs Lũy thoái — Ai gánh nặng hơn?',
        description: 'Kéo thanh trượt thu nhập và xem VAT vs TNCN chiếm bao nhiêu % thu nhập của bạn.',
        sliders: [
          { id: 'income', label: 'Thu nhập hàng tháng', min: 4, max: 80, step: 1, defaultValue: 15, unit: 'triệu' },
        ],
        outputs: [
          { id: 'vatAmount', label: 'VAT đóng/tháng (ước tính)', formula: 'income * 0.06 + 0.06', unit: 'triệu', format: 'number' },
          { id: 'vatPercent', label: 'VAT / Thu nhập', formula: '(income * 0.06 + 0.06) / income * 100', format: 'percent' },
          { id: 'tncnPercent', label: 'TNCN / Thu nhập', formula: 'income <= 12.3 ? 0 : Math.min(35, (income - 12.3) * 0.8)', format: 'percent' },
        ],
        chart: {
          type: 'bar',
          bars: [
            { label: 'VAT (% thu nhập)', formula: '(income * 0.06 + 0.06) / income * 100', color: 'bg-red-400' },
            { label: 'TNCN (% thu nhập)', formula: 'income <= 12.3 ? 0 : Math.min(35, (income - 12.3) * 0.8)', color: 'bg-blue-500' },
          ],
        },
        breakpoints: [
          { condition: 'income <= 8', message: 'Thu nhập thấp: VAT chiếm tỷ lệ lớn (6-7%) nhưng TNCN = 0%. Đây là bằng chứng VAT mang tính lũy thoái — người nghèo gánh nặng hơn.', variant: 'warning' },
          { condition: 'income >= 12 && income <= 20', message: 'Thu nhập trung bình: bắt đầu đóng TNCN, nhưng tỷ lệ còn thấp. VAT vẫn chiếm tỷ lệ đáng kể.', variant: 'info' },
          { condition: 'income >= 50', message: '💡 Thu nhập cao: TNCN chiếm tỷ lệ lớn (lũy tiến), trong khi VAT giảm dần theo % thu nhập. Hai loại thuế bù trừ cho nhau — đó là lý do hệ thống cần cả hai.', variant: 'success' },
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Hệ thống thuế Việt Nam',
        description: 'Tổng quan các loại thuế chính tại Việt Nam và cách chúng tương tác',
        category: 'Kinh tế học',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Thuế trực tiếp tại Việt Nam',
              paragraphs: [
                'Thuế thu nhập cá nhân (TNCN): 7 bậc lũy tiến từ 5% đến 35%. Giảm trừ gia cảnh: 11 triệu/tháng cho bản thân, 4.4 triệu/người phụ thuộc.',
                'Thuế thu nhập doanh nghiệp (TNDN): thuế suất phổ thông 20%. Doanh nghiệp nhỏ và vừa có thể được ưu đãi thuế suất thấp hơn.',
              ],
            },
            {
              heading: 'Thuế gián tiếp tại Việt Nam',
              paragraphs: [
                'Thuế VAT: mức phổ thông 10% (có thể giảm 8% theo chính sách hỗ trợ). Một số mặt hàng thiết yếu được áp thuế suất 5% hoặc không chịu thuế.',
                'Thuế tiêu thụ đặc biệt: áp dụng cho rượu (35-65%), bia (65%), thuốc lá (75%), ô tô (từ 15-150% tùy dung tích). Mục đích: hạn chế tiêu dùng hàng hóa không khuyến khích.',
                'Thuế bảo vệ môi trường: áp dụng cho xăng dầu, than đá, túi nilon — nhằm khuyến khích sử dụng năng lượng sạch.',
              ],
            },
          ],
          relatedConcepts: ['Thuế lũy tiến', 'Thuế lũy thoái', 'Thuế đồng nhất', 'Gánh nặng thuế'],
          furtherReading: [
            'https://vi.wikipedia.org/wiki/Thu%E1%BA%BF_gi%C3%A1_tr%E1%BB%8B_gia_t%C4%83ng',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Thuế trực tiếp: đánh lên thu nhập/tài sản — nhìn thấy rõ (TNCN, TNDN, bất động sản)\n✓ Thuế gián tiếp: ẩn trong giá hàng hóa — người mua gánh chịu (VAT, tiêu thụ đặc biệt)\n✓ Thuế lũy tiến: người giàu đóng % cao hơn (công bằng hơn)\n✓ Thuế lũy thoái: cùng %, nhưng người nghèo gánh nặng hơn\n✓ Hệ thống thuế VN kết hợp cả hai để cân bằng',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học tiếp theo',
        paragraphs: [
          'Bạn đã biết cách phân loại thuế. Nhưng có một câu hỏi sâu hơn: khi Nhà nước đánh thuế lên một mặt hàng, ai thực sự gánh chịu khoản thuế đó? Người mua, người bán, hay cả hai?',
          'Bài học tiếp theo sẽ khám phá khái niệm "gánh thuế" (tax incidence) — và tại sao câu trả lời không đơn giản như bạn nghĩ.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 3: Ai thực sự gánh thuế?
  // Source: MassEdu 1b (Ai Thực Sự Đóng Thuế) + 1c (Gánh Thuế)
  // ────────────────────────────────────────────────────────────────
  'thuev2-3': {
    title: 'Ai thực sự gánh thuế?',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Khi Nhà nước tăng thuế VAT lên 2%, ai chịu thiệt? Người tiêu dùng phải trả giá cao hơn? Hay doanh nghiệp phải chấp nhận lợi nhuận giảm? Hay công nhân bị cắt lương?',
          'Câu trả lời không đơn giản — và nó phụ thuộc vào một nguyên tắc bất ngờ: "Ai có ít lựa chọn thay thế hơn sẽ gánh nặng thuế nhiều hơn."',
          'Bài học này sẽ giúp bạn phân biệt giữa người nộp thuế theo luật và người thực sự chịu gánh nặng thuế — hai khái niệm tưởng giống nhau nhưng hoàn toàn khác.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Người nộp thuế theo luật (legal taxpayer) có phải là người thực sự gánh chịu thuế (tax bearer) không? Và điều gì quyết định ai gánh nặng hơn?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Khi Nhà nước đánh thuế tiêu thụ đặc biệt lên rượu bia, ai thực sự chịu thuế?',
        options: [
          { id: 'a', text: 'Nhà sản xuất bia — vì họ là người nộp thuế cho Nhà nước', isCorrect: false },
          { id: 'b', text: 'Người uống bia — vì thuế được cộng vào giá bán', isCorrect: false },
          { id: 'c', text: 'Tùy thuộc — ai có ít lựa chọn thay thế hơn sẽ gánh nhiều hơn', isCorrect: true },
          { id: 'd', text: 'Nhà nước — vì họ phải chi phí quản lý thu thuế', isCorrect: false },
        ],
        explanation: 'Đây là khái niệm "tax incidence" (gánh thuế). Nếu người uống bia không thể bỏ bia (ít thay thế), họ chấp nhận giá cao hơn → gánh phần lớn thuế. Nếu người uống có thể chuyển sang nước ngọt (nhiều thay thế), nhà sản xuất phải giữ giá và hấp thụ thuế vào lợi nhuận.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Ba loại người nộp thuế theo luật',
        paragraphs: [
          'Theo pháp luật, có ba nhóm chính phải nộp thuế cho Nhà nước:',
          '1. Người lao động: đóng thuế thu nhập cá nhân (TNCN) trên lương, thưởng. Thuế được khấu trừ trực tiếp từ bảng lương mỗi tháng.',
          '2. Người tiêu dùng: gánh chịu thuế VAT thông qua giá hàng hóa. Dù trên hóa đơn ghi "người bán nộp VAT", nhưng người mua mới là người trả khoản thuế đó qua giá cao hơn.',
          '3. Doanh nghiệp: đóng thuế thu nhập doanh nghiệp (TNDN) trên lợi nhuận, thuế môn bài, và nhiều loại thuế khác.',
          'Nhưng đây chỉ là "người nộp thuế theo luật" — người ký tờ khai và chuyển tiền cho cơ quan thuế. Người thực sự gánh chịu thuế có thể hoàn toàn khác.',
        ],
      },
      {
        type: 'perspective-switch',
        title: 'Thuế tăng — Ai chịu thiệt?',
        event: 'Nhà nước quyết định tăng thuế VAT từ 8% lên 10% cho tất cả hàng hóa. Quyết định này ảnh hưởng đến nhiều bên khác nhau.',
        perspectives: [
          {
            id: 'consumer',
            role: 'Người tiêu dùng',
            icon: '🛒',
            narrative: 'Giá mọi thứ tăng 2% ngay lập tức. Với thu nhập 8 triệu/tháng và chi tiêu 6 triệu cho sinh hoạt, tôi phải trả thêm 120.000 đồng/tháng. Nghe ít, nhưng cả năm là gần 1.5 triệu — bằng nửa tháng tiền ăn. Tôi không thể "không mua gạo" hay "không đổ xăng" — nên tôi buộc phải chịu.',
          },
          {
            id: 'business',
            role: 'Chủ cửa hàng tạp hóa',
            icon: '🏪',
            narrative: 'Nếu tôi tăng giá 2%, khách sẽ chuyển sang mua ở chỗ khác hoặc giảm mua. Nếu không tăng giá, lợi nhuận giảm 2% — vốn đã mỏng. Tôi phải cân nhắc: tăng giá một phần (1%) và chịu phần còn lại (1%) từ lợi nhuận. Cuối cùng cả hai bên đều thiệt.',
          },
          {
            id: 'government',
            role: 'Nhà nước',
            icon: '🏛️',
            narrative: 'Tăng VAT 2% dự kiến thu thêm 60.000 tỷ đồng/năm cho ngân sách. Số tiền này cần cho y tế, giáo dục, hạ tầng. Tuy nhiên, nếu người dân giảm chi tiêu vì giá cao, tổng thu thực tế có thể thấp hơn dự kiến. Và người nghèo sẽ chịu ảnh hưởng nhiều hơn vì dành phần lớn thu nhập cho tiêu dùng.',
          },
        ],
        question: {
          text: 'Nguyên tắc nào quyết định ai gánh thuế nhiều hơn?',
          options: [
            { id: 'a', text: 'Ai có nhiều tiền hơn sẽ gánh nhiều hơn', isCorrect: false },
            { id: 'b', text: 'Ai có ít lựa chọn thay thế hơn sẽ gánh nhiều hơn', isCorrect: true },
            { id: 'c', text: 'Ai được luật quy định nộp thuế sẽ gánh toàn bộ', isCorrect: false },
            { id: 'd', text: 'Gánh thuế luôn chia đều 50-50 giữa người mua và người bán', isCorrect: false },
          ],
          explanation: 'Nguyên tắc cốt lõi: "Whoever has fewer alternatives will ultimately shoulder the tax burden." Người tiêu dùng không thể bỏ gạo, xăng → họ gánh phần lớn VAT trên hàng thiết yếu. Ngược lại, thuế trên hàng xa xỉ (túi hiệu) → người bán/nhà sản xuất phải hấp thụ nhiều hơn vì khách có thể không mua.',
        },
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Nguyên tắc vàng về gánh thuế',
        text: '"Ai có ít lựa chọn thay thế hơn sẽ gánh nặng thuế nhiều hơn."\n\n• Hàng thiết yếu (gạo, xăng, điện): Người tiêu dùng gánh phần lớn — vì không thể không mua\n• Hàng xa xỉ (túi hiệu, du thuyền): Nhà sản xuất/người bán gánh nhiều hơn — vì khách có thể không mua\n• Thuế doanh nghiệp: Gánh nặng lan tỏa sang nhân viên (lương thấp hơn), khách hàng (giá cao hơn), và cổ đông (lợi nhuận giảm)',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Thuế doanh nghiệp — Ai thực sự chịu?',
        paragraphs: [
          'Một ví dụ thú vị về gánh thuế là thuế thu nhập doanh nghiệp (TNDN). Trên giấy tờ, công ty nộp thuế 20% lợi nhuận. Nhưng thực tế, gánh nặng này được chia cho ba nhóm:',
          '• Cổ đông/chủ doanh nghiệp: lợi nhuận sau thuế giảm → cổ tức thấp hơn',
          '• Nhân viên: công ty có ít tiền hơn → lương, thưởng, phúc lợi bị cắt giảm',
          '• Khách hàng: công ty tăng giá sản phẩm để bù thuế → người tiêu dùng trả nhiều hơn',
          'Tỷ lệ chia sẻ gánh nặng giữa ba nhóm này phụ thuộc vào sức mạnh thương lượng của mỗi bên. Nếu nhân viên khó tìm việc khác, họ chấp nhận lương thấp hơn. Nếu khách hàng không có sản phẩm thay thế, họ chấp nhận giá cao hơn.',
        ],
      },
      {
        type: 'slider-simulator',
        title: 'Mô phỏng: Thuế tác động lên giá hàng thiết yếu vs xa xỉ',
        description: 'Kéo thanh trượt thuế suất và xem ai gánh nặng hơn — người tiêu dùng hay nhà sản xuất.',
        sliders: [
          { id: 'taxRate', label: 'Thuế suất', min: 0, max: 50, step: 1, defaultValue: 10, unit: '%' },
        ],
        outputs: [
          { id: 'essentialConsumer', label: 'Gánh thuế người mua (hàng thiết yếu)', formula: 'taxRate * 0.85', unit: '%', format: 'number' },
          { id: 'essentialProducer', label: 'Gánh thuế người bán (hàng thiết yếu)', formula: 'taxRate * 0.15', unit: '%', format: 'number' },
          { id: 'luxuryConsumer', label: 'Gánh thuế người mua (hàng xa xỉ)', formula: 'taxRate * 0.3', unit: '%', format: 'number' },
          { id: 'luxuryProducer', label: 'Gánh thuế người bán (hàng xa xỉ)', formula: 'taxRate * 0.7', unit: '%', format: 'number' },
        ],
        chart: {
          type: 'bar',
          bars: [
            { label: 'Người mua - Thiết yếu', formula: 'taxRate * 0.85', color: 'bg-red-500' },
            { label: 'Người bán - Thiết yếu', formula: 'taxRate * 0.15', color: 'bg-red-300' },
            { label: 'Người mua - Xa xỉ', formula: 'taxRate * 0.3', color: 'bg-blue-500' },
            { label: 'Người bán - Xa xỉ', formula: 'taxRate * 0.7', color: 'bg-blue-300' },
          ],
        },
        breakpoints: [
          { condition: 'taxRate <= 5', message: 'Thuế suất thấp: tác động chênh lệch giữa hai loại hàng chưa rõ.', variant: 'info' },
          { condition: 'taxRate >= 20 && taxRate <= 30', message: '💡 Ở mức thuế 20-30%, sự chênh lệch gánh thuế giữa hàng thiết yếu và xa xỉ rất rõ ràng. Người mua hàng thiết yếu gánh ~85% thuế, trong khi người mua hàng xa xỉ chỉ gánh ~30%.', variant: 'success' },
          { condition: 'taxRate >= 40', message: '⚠️ Thuế suất rất cao: với hàng xa xỉ, nhà sản xuất phải hấp thụ phần lớn thuế hoặc dừng sản xuất. Với hàng thiết yếu, người tiêu dùng nghèo chịu ảnh hưởng nặng nề.', variant: 'warning' },
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Tax Incidence — Gánh nặng thuế thực sự',
        description: 'Phân tích ai thực sự chịu thuế và tại sao nó khác với người nộp thuế theo luật',
        category: 'Kinh tế học',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Tax Incidence là gì?',
              paragraphs: [
                'Tax incidence (gánh thuế) là khái niệm kinh tế học phân tích ai thực sự chịu gánh nặng kinh tế của một khoản thuế — không phải ai nộp thuế theo luật, mà ai mất tiền thật sự.',
                'Ví dụ: Nhà nước đánh thuế 10.000 đồng/lít xăng lên nhà phân phối. Nhưng nhà phân phối tăng giá bán lẻ thêm 9.000 đồng và chịu 1.000 đồng từ lợi nhuận. Kết quả: người tiêu dùng gánh 90% thuế, nhà phân phối chỉ gánh 10%.',
              ],
            },
            {
              heading: 'Yếu tố quyết định gánh thuế',
              paragraphs: [
                'Độ co giãn của cung và cầu (price elasticity) là yếu tố chính. Bên nào ít co giãn hơn (ít thay thế) sẽ gánh nặng hơn.',
                'Cầu không co giãn (hàng thiết yếu: gạo, xăng, thuốc): người tiêu dùng gánh phần lớn. Cầu co giãn (hàng xa xỉ: du thuyền, túi hiệu): nhà sản xuất/người bán gánh nhiều hơn.',
              ],
            },
          ],
          relatedConcepts: ['Elasticity', 'VAT', 'Consumer surplus', 'Deadweight loss'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/Tax_incidence',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Người nộp thuế theo luật ≠ người thực sự gánh thuế\n✓ Nguyên tắc: ai có ít thay thế hơn → gánh nặng hơn\n✓ Hàng thiết yếu: người mua gánh phần lớn (không thể không mua)\n✓ Hàng xa xỉ: nhà sản xuất gánh nhiều hơn (khách có thể bỏ)\n✓ Thuế doanh nghiệp lan tỏa sang cả nhân viên và khách hàng',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học tiếp theo',
        paragraphs: [
          'Bạn đã hiểu ai thực sự gánh chịu thuế — và tại sao thiết kế thuế xấu có thể làm hại người nghèo. Đây là nền tảng để suy nghĩ sâu hơn về thuế.',
          'Bài học tiếp theo sẽ đặt những câu hỏi lớn hơn: Thuế có thực sự cần thiết? Một công dân nên hỏi những gì về chính sách thuế? Và bạn — với tư cách công dân — có vai trò gì?',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 4: Suy ngẫm về thuế
  // Source: MassEdu 1d (Suy Ngẫm Về Thuế)
  // ────────────────────────────────────────────────────────────────
  'thuev2-4': {
    title: 'Suy ngẫm về thuế',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Sau ba bài học, bạn đã biết thuế là gì, các loại thuế, và ai thực sự gánh chịu thuế. Giờ là lúc dừng lại và suy ngẫm: với tất cả những gì bạn đã học, bạn nên đặt những câu hỏi gì khi nghe tin "Nhà nước sắp tăng thuế"?',
          'Bài học này không cung cấp thêm kiến thức mới — mà giúp bạn rèn luyện tư duy phản biện về thuế. Bạn sẽ học cách phân biệt sự thật và ý kiến, và nắm được 4 câu hỏi mà mọi công dân nên hỏi khi đánh giá chính sách thuế.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Thuế là một cơ chế phức tạp ảnh hưởng đến giá cả, quyết định kinh doanh, và cuộc sống hàng ngày. Làm sao để một công dân bình thường có thể đánh giá liệu một chính sách thuế tốt hay xấu?',
        variant: 'info',
      },
      {
        type: 'question',
        question: '"Thuế VAT 10% là hợp lý vì mọi người đều trả bằng nhau" — câu này là sự thật hay ý kiến?',
        options: [
          { id: 'a', text: 'Sự thật — vì đúng là mọi người đều trả 10%', isCorrect: false },
          { id: 'b', text: 'Ý kiến — "hợp lý" là đánh giá chủ quan, và "bằng nhau" bỏ qua tác động lũy thoái', isCorrect: true },
          { id: 'c', text: 'Sai hoàn toàn — vì VAT không phải 10%', isCorrect: false },
          { id: 'd', text: 'Sự thật — vì đây là quy định pháp luật', isCorrect: false },
        ],
        explanation: 'Câu này chứa cả sự thật (VAT 10% áp dụng cho mọi người) lẫn ý kiến ("hợp lý"). Từ "bằng nhau" gây hiểu nhầm: đúng là bằng nhau về thuế suất, nhưng KHÔNG bằng nhau về tác động thực tế — người nghèo mất % thu nhập nhiều hơn. Đây là bài học về tư duy phản biện: cần tách sự thật khỏi đánh giá.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: '4 câu hỏi mọi công dân nên hỏi về chính sách thuế',
        paragraphs: [
          'Khi nghe tin về bất kỳ thay đổi thuế nào, hãy tự hỏi 4 câu:',
          '1. Ai thực sự gánh chịu thuế này? Không phải ai nộp theo luật, mà ai mất tiền thực sự. Nhớ nguyên tắc: ai có ít thay thế hơn sẽ gánh nhiều hơn.',
          '2. Họ có lựa chọn thay thế không? Nếu thuế đánh lên hàng thiết yếu (gạo, xăng), người nghèo không có lựa chọn và sẽ chịu ảnh hưởng nặng nhất.',
          '3. Tiền thuế sẽ được phân bổ như thế nào? Thu thêm 10.000 tỷ nghe ấn tượng — nhưng nó sẽ đi đâu? Giáo dục? Y tế? Hay các dự án kém hiệu quả?',
          '4. Công dân có thể tham gia giám sát ở đâu? Một hệ thống thuế tốt không chỉ cần thu đúng — mà cần minh bạch để người dân biết tiền đi đâu và có cơ chế phản hồi.',
        ],
      },
      {
        type: 'fact-or-opinion',
        title: 'Phân biệt Sự thật vs Ý kiến về thuế',
        instruction: 'Đọc các câu phát biểu dưới đây và xác định đâu là sự thật (fact), ý kiến (opinion), hay thông tin gây hiểu nhầm (misleading).',
        statements: [
          {
            id: 's1',
            text: 'Thuế VAT tại Việt Nam hiện là 10%.',
            correctAnswer: 'fact',
            explanation: 'Đây là sự thật — mức thuế suất VAT phổ thông theo luật là 10%.',
            source: 'Luật Thuế GTGT 2008, sửa đổi 2013',
          },
          {
            id: 's2',
            text: 'Thuế cao làm giảm động lực lao động của mọi người.',
            correctAnswer: 'opinion',
            explanation: 'Đây là ý kiến. Nghiên cứu cho thấy tác động phụ thuộc vào mức thuế, loại thuế, và bối cảnh. Nhiều nước Bắc Âu có thuế cao nhưng năng suất lao động hàng đầu thế giới.',
          },
          {
            id: 's3',
            text: 'Người nghèo không đóng thuế vì thu nhập quá thấp.',
            correctAnswer: 'misleading',
            explanation: 'Gây hiểu nhầm! Đúng là người nghèo có thể không đóng thuế TNCN (thu nhập dưới ngưỡng). Nhưng họ vẫn đóng thuế gián tiếp (VAT) mỗi khi mua hàng — và VAT chiếm tỷ lệ thu nhập cao hơn so với người giàu.',
          },
          {
            id: 's4',
            text: 'Thuế thu nhập cá nhân ở Việt Nam có 7 bậc thuế suất, từ 5% đến 35%.',
            correctAnswer: 'fact',
            explanation: 'Đây là sự thật theo quy định pháp luật hiện hành.',
            source: 'Luật Thuế TNCN 2007, sửa đổi 2012',
          },
          {
            id: 's5',
            text: 'Tăng thuế luôn luôn tốt vì Nhà nước có thêm tiền đầu tư cho xã hội.',
            correctAnswer: 'opinion',
            explanation: 'Đây là ý kiến. Tăng thuế CÓ THỂ tốt nếu tiền được sử dụng hiệu quả, nhưng cũng có thể xấu nếu gây gánh nặng cho người nghèo hoặc tiền thuế bị lãng phí.',
          },
        ],
        passingScore: 4,
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Thuế không chỉ là con số — nó là quyết định chính trị',
        text: 'Mỗi chính sách thuế đều là một lựa chọn: ưu tiên thu ngân sách hay bảo vệ người yếu thế? Khuyến khích tiêu dùng hay tiết kiệm? Hỗ trợ doanh nghiệp hay tái phân phối thu nhập?\n\nKhông có câu trả lời "đúng" duy nhất — nhưng có những câu trả lời được đưa ra dựa trên bằng chứng và có sự tham gia của công dân, và những câu trả lời bị áp đặt mà không ai được hỏi ý kiến.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Tư duy phản biện — Công cụ của công dân',
        paragraphs: [
          'Bạn không cần trở thành chuyên gia thuế để có ý kiến về chính sách thuế. Nhưng bạn cần trang bị tư duy phản biện:',
          'Khi đọc tin "Nhà nước sắp tăng thuế X", đừng chỉ hỏi "tăng bao nhiêu?" — mà hãy hỏi: Ai gánh? Họ có lựa chọn không? Tiền đi đâu? Ai giám sát?',
          'Khi nghe ai đó nói "thuế cao là tốt" hay "thuế cao là xấu", hãy nhận ra đó là ý kiến — và yêu cầu bằng chứng. "Tốt cho ai? Xấu cho ai? Dựa trên dữ liệu nào?"',
          'Đây chính là vai trò của một công dân có hiểu biết: không phải biết tất cả, mà biết cách hỏi đúng câu hỏi.',
        ],
      },
      {
        type: 'decision-tree',
        title: 'Đánh giá chính sách thuế: VAT tăng từ 10% lên 12%',
        scenario: 'Bạn vừa đọc tin: "Nhà nước dự kiến tăng thuế VAT từ 10% lên 12% để tăng ngân sách cho y tế công." Hãy đánh giá chính sách này bằng 4 câu hỏi công dân.',
        role: 'Công dân đánh giá chính sách',
        nodes: [
          {
            id: 'q1',
            text: 'Câu hỏi 1: Ai thực sự gánh chịu thuế VAT tăng thêm 2%?',
            choices: [
              { id: 'q1a', text: 'Chủ yếu người tiêu dùng — vì VAT tính vào giá bán', nextNodeId: 'q2', consequence: 'Đúng! Người tiêu dùng, đặc biệt người thu nhập thấp, gánh phần lớn vì không thể "không mua" gạo hay xăng.' },
              { id: 'q1b', text: 'Chỉ doanh nghiệp — họ nộp thuế cho Nhà nước', nextNodeId: 'q2', consequence: 'Không hoàn toàn. Doanh nghiệp nộp VAT theo luật, nhưng cộng thuế vào giá bán. Người mua mới gánh chịu thực tế.' },
            ],
          },
          {
            id: 'q2',
            text: 'Câu hỏi 2: Người gánh thuế có lựa chọn thay thế không?',
            choices: [
              { id: 'q2a', text: 'Hàng thiết yếu: KHÔNG — người nghèo không thể bỏ gạo, xăng, điện', nextNodeId: 'q3', consequence: 'Đúng! Đây là lý do VAT bị coi là thuế lũy thoái — người nghèo bị ảnh hưởng nhiều hơn.' },
              { id: 'q2b', text: 'Có — người ta có thể mua ít hơn hoặc chuyển hàng rẻ', nextNodeId: 'q3', consequence: 'Chỉ đúng với hàng không thiết yếu. Với gạo, xăng, điện — "mua ít hơn" không thực sự là lựa chọn.' },
            ],
          },
          {
            id: 'q3',
            text: 'Câu hỏi 3: Tiền thuế tăng thêm sẽ dùng cho y tế — có đảm bảo?',
            choices: [
              { id: 'q3a', text: 'Cần xem cơ chế giám sát — tiền có thể bị chuyển hướng', nextNodeId: 'q4', consequence: 'Tư duy tốt! Không phải cứ nói "cho y tế" là tiền thực sự đến y tế. Cần minh bạch ngân sách và giám sát độc lập.' },
              { id: 'q3b', text: 'Nhà nước đã nói thì chắc chắn đúng', nextNodeId: 'q4', consequence: 'Ý định tốt, nhưng không giám sát thì tiền có thể bị phân bổ sang mục đích khác.' },
            ],
          },
          {
            id: 'q4',
            text: 'Câu hỏi 4: Công dân có thể giám sát ở đâu?',
            choices: [
              { id: 'q4a', text: 'Qua đại biểu quốc hội, hội nghị lấy ý kiến, yêu cầu công khai ngân sách', nextNodeId: 'end-good' },
              { id: 'q4b', text: 'Công dân bình thường không thể làm gì', nextNodeId: 'end-passive' },
            ],
          },
          {
            id: 'end-good',
            text: 'Bạn đã sử dụng đủ 4 câu hỏi công dân!',
            choices: [],
            isEnding: true,
            endingType: 'good',
            endingSummary: 'Bốn câu hỏi — Ai gánh? Có thay thế? Tiền đi đâu? Ai giám sát? — là bộ công cụ tối thiểu để đánh giá bất kỳ chính sách thuế nào. Bạn không cần là chuyên gia, nhưng cần biết cách hỏi đúng.',
          },
          {
            id: 'end-passive',
            text: 'Tư duy này cần xem xét lại.',
            choices: [],
            isEnding: true,
            endingType: 'neutral',
            endingSummary: 'Công dân CÓ quyền và trách nhiệm giám sát qua đại biểu quốc hội, hội nghị lấy ý kiến, và yêu cầu công khai ngân sách. Sự tham gia chính là động lực cho minh bạch.',
          },
        ],
        startNodeId: 'q1',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Quyền và trách nhiệm của công dân về thuế',
        description: 'Vai trò của công dân trong việc giám sát và tham gia chính sách thuế',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'Thuế và sự tham gia của công dân',
              paragraphs: [
                'Một hệ thống thuế công bằng và hiệu quả không chỉ phụ thuộc vào thiết kế kỹ thuật — mà cần sự tham gia giám sát của công dân. Khi người dân hiểu và quan tâm đến thuế, họ có động lực yêu cầu minh bạch và trách nhiệm giải trình.',
                'Nguyên tắc "No taxation without representation" (Không đánh thuế mà không có đại diện) là nền tảng của nhiều cuộc cách mạng dân chủ, từ Cách mạng Mỹ (1776) đến các phong trào thuế ở châu Âu.',
              ],
            },
            {
              heading: 'Thiết kế thuế xấu — hậu quả thực tế',
              paragraphs: [
                'Thuế thiết kế xấu có thể gây hại nghiêm trọng cho nhóm dân cư yếu thế. Ví dụ: thuế đồng nhất (flat tax) trên hàng thiết yếu khiến người nghèo gánh nặng % thu nhập nhiều hơn người giàu.',
                'Ngược lại, thuế thiết kế tốt có thể đồng thời tăng ngân sách VÀ bảo vệ công bằng xã hội — ví dụ thuế lũy tiến kết hợp với giảm trừ gia cảnh.',
              ],
            },
          ],
          relatedConcepts: ['Công bằng thuế', 'Minh bạch ngân sách', 'Tham gia công dân'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/No_taxation_without_representation',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ 4 câu hỏi công dân: Ai gánh? Có thay thế? Tiền đi đâu? Ai giám sát?\n✓ Phân biệt sự thật vs ý kiến khi đánh giá chính sách thuế\n✓ Thuế là quyết định chính trị — không chỉ bài toán kỹ thuật\n✓ Công dân có quyền và trách nhiệm giám sát chính sách thuế\n✓ Thiết kế thuế tốt cần cân bằng giữa thu ngân sách và công bằng xã hội',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết Level 1 — Và Level 2',
        paragraphs: [
          'Chúc mừng bạn đã hoàn thành Level 1! Bạn đã nắm được nền tảng: thuế là gì, các loại thuế, ai gánh thuế, và cách tư duy phản biện về thuế.',
          'Level 2 sẽ đi sâu hơn: TẠI SAO chúng ta đóng thuế? Thuế phục vụ mục đích gì cho xã hội? Và một hệ thống thuế "tốt" cần tuân theo những nguyên tắc nào?',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // LEVEL 2: TẠI SAO ĐÓNG THUẾ?
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // LESSON 5: Mục đích của thuế
  // Source: MassEdu Lesson 2 (Tại Sao Đóng Thuế)
  // ────────────────────────────────────────────────────────────────
  'thuev2-5': {
    title: 'Mục đích của thuế',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Hãy tưởng tượng một ngày không có thuế: không có cảnh sát, không có bệnh viện công, không có đường giao thông, không có trường học miễn phí. Bạn phải tự bảo vệ mình, tự thuê bác sĩ riêng, tự xây đường trước nhà.',
          'Thuế tồn tại vì một lý do đơn giản: có những thứ mà cá nhân không thể tự cung cấp cho mình — nhưng cả xã hội cùng cần. Bài học này sẽ giúp bạn hiểu 4 chức năng chính của thuế và khái niệm "khế ước xã hội" — thỏa thuận ngầm giữa công dân và Nhà nước.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Nếu thuế là bắt buộc và không mang lại lợi ích trực tiếp, tại sao chúng ta vẫn đóng thuế? Và đổi lại, chúng ta có quyền đòi hỏi gì?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Nếu không có thuế, dịch vụ nào sau đây vẫn tồn tại?',
        options: [
          { id: 'a', text: 'Đường giao thông công cộng', isCorrect: false },
          { id: 'b', text: 'Quân đội và cảnh sát', isCorrect: false },
          { id: 'c', text: 'Tất cả đều biến mất — vì chúng được tài trợ bằng thuế', isCorrect: true },
          { id: 'd', text: 'Bệnh viện công', isCorrect: false },
        ],
        explanation: 'Đường xá, cảnh sát, quân đội, bệnh viện công, trường học — tất cả đều được tài trợ bởi ngân sách nhà nước, mà nguồn thu chính là thuế. Không có thuế = không có dịch vụ công. Đây gọi là "hàng hóa công" (public goods) — thứ mà thị trường tự do không thể cung cấp hiệu quả.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: '4 chức năng chính của thuế',
        paragraphs: [
          '1. An ninh và trật tự: Thuế tài trợ cho quân đội, cảnh sát, tòa án — bộ máy đảm bảo an toàn và công lý cho mọi người. Không có thuế, không có luật pháp.',
          '2. Dịch vụ công: Trường học, bệnh viện, đường xá, cầu cống, điện nước — tất cả hạ tầng thiết yếu mà cá nhân không thể tự xây. Thuế là nguồn tài chính cho tất cả những thứ này.',
          '3. Bảo vệ môi trường: Thuế được dùng để hạn chế hành vi gây hại (thuế thuốc lá, bia rượu, ô nhiễm) và khuyến khích hành vi tốt (ưu đãi thuế cho năng lượng sạch, xe điện).',
          '4. Công bằng xã hội: Thuế lũy tiến giúp tái phân phối thu nhập — người giàu đóng nhiều hơn, tiền được dùng cho phúc lợi xã hội, hỗ trợ người yếu thế, giảm bất bình đẳng.',
        ],
      },
      {
        type: 'policy-lab',
        title: 'Phòng thí nghiệm chính sách thuế',
        description: 'Điều chỉnh chính sách thuế và xem tác động lên ngân sách, bất bình đẳng, và dịch vụ công.',
        context: 'Bạn là cố vấn thuế cho Chính phủ. Hãy điều chỉnh các thông số thuế và xem hệ quả đối với các chỉ số kinh tế-xã hội.',
        policies: [
          { id: 'vatRate', label: 'Thuế suất VAT', icon: '🛒', min: 5, max: 20, step: 1, defaultValue: 10, unit: '%' },
          { id: 'tncnTopRate', label: 'Thuế suất TNCN cao nhất', icon: '💰', min: 15, max: 50, step: 5, defaultValue: 35, unit: '%' },
          { id: 'tndnRate', label: 'Thuế suất doanh nghiệp', icon: '🏢', min: 10, max: 30, step: 1, defaultValue: 20, unit: '%' },
        ],
        indicators: [
          { id: 'revenue', label: 'Thu ngân sách (tỷ VNĐ)', icon: '📊', formula: 'vatRate * 80 + tncnTopRate * 15 + tndnRate * 30', format: 'number', goodRange: [1500, 2500] },
          { id: 'inequality', label: 'Chỉ số bất bình đẳng', icon: '⚖️', formula: '100 - tncnTopRate * 1.2 + vatRate * 2', format: 'number', goodRange: [30, 50] },
          { id: 'businessClimate', label: 'Môi trường kinh doanh', icon: '🏗️', formula: '100 - tndnRate * 2 - vatRate * 0.5', format: 'number', goodRange: [50, 80] },
        ],
        populations: [
          { id: 'poor', label: 'Người thu nhập thấp', impactFormula: '100 - vatRate * 5', description: 'VAT cao ảnh hưởng mạnh vì phần lớn thu nhập dùng cho tiêu dùng' },
          { id: 'middle', label: 'Tầng lớp trung lưu', impactFormula: '100 - vatRate * 2 - tncnTopRate * 0.5', description: 'Chịu cả VAT và TNCN, nhạy cảm với thay đổi' },
          { id: 'business', label: 'Doanh nghiệp', impactFormula: '100 - tndnRate * 3', description: 'Thuế doanh nghiệp cao → giảm đầu tư, có thể dời sang nước khác' },
        ],
        insight: 'Không có bộ thông số "hoàn hảo". Tăng VAT → thu nhiều nhưng bất công với người nghèo. Tăng TNCN → công bằng hơn nhưng người giàu có thể tìm cách lách. Tăng thuế DN → ngân sách tăng nhưng đầu tư giảm. Đây là "tam giác bất khả thi" của thuế.',
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Khế ước xã hội — Thỏa thuận ngầm giữa công dân và Nhà nước',
        text: 'Thuế không phải Nhà nước "lấy" tiền của bạn. Đó là một thỏa thuận ngầm: bạn đóng góp một phần thu nhập, đổi lại Nhà nước cung cấp dịch vụ công và bảo vệ quyền lợi của bạn.\n\nThỏa thuận này tạo ra mối quan hệ hai chiều: công dân có nghĩa vụ đóng thuế, nhưng đồng thời có QUYỀN yêu cầu Nhà nước sử dụng tiền thuế một cách hiệu quả và minh bạch.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Khế ước xã hội — Quyền đi kèm nghĩa vụ',
        paragraphs: [
          'Khái niệm "khế ước xã hội" (social contract) xuất phát từ các triết gia như John Locke, Jean-Jacques Rousseau, và Thomas Hobbes. Ý tưởng cốt lõi: con người đồng ý từ bỏ một phần tự do cá nhân (đóng thuế, tuân thủ luật pháp) để đổi lấy sự bảo vệ và lợi ích từ xã hội có tổ chức.',
          'Khi bạn đóng thuế, bạn không chỉ thực hiện nghĩa vụ — bạn đang "mua" quyền yêu cầu Nhà nước phải giải trình: Tiền thuế đi đâu? Được dùng hiệu quả không? Ai giám sát?',
          'Đây là lý do tại sao các nền dân chủ luôn gắn thuế với đại diện: "No taxation without representation" — không đánh thuế mà không có tiếng nói của người đóng thuế.',
        ],
      },
      {
        type: 'perspective-switch',
        title: 'Thuế dưới 3 góc nhìn',
        event: 'Nhà nước thu 100 tỷ đồng tiền thuế trong một năm. Ba góc nhìn khác nhau về ý nghĩa của số tiền này.',
        perspectives: [
          {
            id: 'citizen',
            role: 'Công dân',
            icon: '👤',
            narrative: 'Tôi đóng thuế mỗi tháng, mỗi khi mua hàng. Đổi lại, con tôi được học trường công miễn phí, gia đình được khám bệnh ở bệnh viện công, và đường từ nhà đến chỗ làm được trải nhựa. Tôi muốn biết chính xác tiền thuế của tôi được dùng thế nào — và có quyền yêu cầu điều đó.',
          },
          {
            id: 'business',
            role: 'Doanh nghiệp',
            icon: '🏢',
            narrative: 'Chúng tôi đóng thuế TNDN 20% lợi nhuận. Đổi lại, Nhà nước cung cấp hạ tầng (đường xá, cảng biển), hệ thống pháp luật bảo vệ hợp đồng, và nguồn nhân lực được đào tạo từ hệ thống giáo dục công. Thuế là chi phí, nhưng cũng là đầu tư vào môi trường kinh doanh.',
          },
          {
            id: 'government',
            role: 'Nhà nước',
            icon: '🏛️',
            narrative: '100 tỷ là ngân sách để vận hành toàn bộ: trả lương giáo viên, bác sĩ, cảnh sát; xây cầu đường; mua vắc-xin; trả nợ công. Nếu không thu đủ thuế, chúng tôi phải vay nợ — và thế hệ sau sẽ phải trả. Minh bạch trong sử dụng ngân sách là trách nhiệm của chúng tôi.',
          },
        ],
        question: {
          text: 'Khế ước xã hội về thuế tạo ra quan hệ gì?',
          options: [
            { id: 'a', text: 'Một chiều — công dân đóng thuế, Nhà nước quyết định', isCorrect: false },
            { id: 'b', text: 'Hai chiều — công dân đóng thuế + Nhà nước có trách nhiệm giải trình', isCorrect: true },
            { id: 'c', text: 'Không có quan hệ — thuế là bắt buộc, không cần giải trình', isCorrect: false },
            { id: 'd', text: 'Quan hệ kinh doanh — trả bao nhiêu nhận bấy nhiêu', isCorrect: false },
          ],
          explanation: 'Khế ước xã hội tạo ra quan hệ hai chiều: công dân đóng góp (thuế + tuân thủ luật), đổi lại Nhà nước có nghĩa vụ cung cấp dịch vụ công và minh bạch trong sử dụng ngân sách. Đây là nền tảng của dân chủ — quyền đi kèm trách nhiệm cho CẢ HAI bên.',
        },
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Khế ước xã hội và thuế',
        description: 'Mối quan hệ triết học giữa nghĩa vụ thuế và quyền công dân',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'Thuế như một "hợp đồng" xã hội',
              paragraphs: [
                'John Locke (1632-1704) cho rằng chính phủ tồn tại để bảo vệ "quyền tự nhiên" của con người: sống, tự do, tài sản. Thuế là cái giá hợp lý để duy trì sự bảo vệ này.',
                'Jean-Jacques Rousseau (1712-1778) phát triển ý tưởng này thành "khế ước xã hội": mỗi cá nhân từ bỏ một phần tự do (đóng thuế, tuân thủ luật) để đổi lấy lợi ích từ cuộc sống có tổ chức.',
              ],
            },
            {
              heading: '"No taxation without representation"',
              paragraphs: [
                'Nguyên tắc này bắt nguồn từ Cách mạng Mỹ (1776): thuộc địa Mỹ phản đối việc Anh đánh thuế mà không cho họ đại diện trong Quốc hội Anh.',
                'Nguyên tắc này vẫn là nền tảng của các nền dân chủ hiện đại: người đóng thuế có quyền tham gia quyết định cách tiền thuế được sử dụng, thông qua đại diện dân cử và giám sát ngân sách.',
              ],
            },
          ],
          relatedConcepts: ['Social contract', 'Public goods', 'Fiscal policy'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/Social_contract',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ 4 chức năng của thuế: an ninh, dịch vụ công, môi trường, công bằng xã hội\n✓ Thuế tài trợ cho "hàng hóa công" — thứ thị trường không thể cung cấp\n✓ Khế ước xã hội: đóng thuế = nghĩa vụ, yêu cầu giải trình = quyền\n✓ "No taxation without representation" — nền tảng dân chủ\n✓ Phân bổ ngân sách luôn là sự đánh đổi giữa các ưu tiên',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học tiếp theo',
        paragraphs: [
          'Bạn đã hiểu TẠI SAO chúng ta đóng thuế. Nhưng biết mục đích chưa đủ — cần biết THU THUẾ NHƯ THẾ NÀO mới đúng.',
          'Bài học tiếp theo sẽ phân tích 3 nguyên tắc nền tảng mà một hệ thống thuế tốt cần tuân theo: hiệu quả kinh tế, công bằng xã hội, và tính khả thi trong quản lý.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 6: Nguyên tắc thu thuế
  // Source: MassEdu Lesson 4 (Nguyên Tắc Thu Thuế)
  // ────────────────────────────────────────────────────────────────
  'thuev2-6': {
    title: 'Nguyên tắc thu thuế',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Không phải cứ thu nhiều thuế là tốt, và không phải cứ thuế thấp là tốt. Một hệ thống thuế cần được thiết kế dựa trên các nguyên tắc rõ ràng để đảm bảo vừa hiệu quả, vừa công bằng, vừa khả thi.',
          'Bài học này trình bày 3 nguyên tắc nền tảng: hiệu quả kinh tế, công bằng xã hội, và tính khả thi trong quản lý — và tại sao vi phạm bất kỳ nguyên tắc nào cũng có thể gây hậu quả nghiêm trọng.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Một hệ thống thuế "tốt" cần tuân theo những nguyên tắc nào? Và điều gì xảy ra khi một trong các nguyên tắc bị vi phạm?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Nhà nước đánh thuế 200% lên xăng để tăng ngân sách. Điều gì xảy ra?',
        options: [
          { id: 'a', text: 'Ngân sách tăng gấp đôi vì thuế cao hơn', isCorrect: false },
          { id: 'b', text: 'Người dân trốn thuế, buôn lậu xăng tăng, ngân sách có thể GIẢM', isCorrect: true },
          { id: 'c', text: 'Không ảnh hưởng gì — xăng là hàng thiết yếu, mọi người vẫn phải mua', isCorrect: false },
          { id: 'd', text: 'Giá xăng giảm vì cạnh tranh', isCorrect: false },
        ],
        explanation: 'Đây là ví dụ về vi phạm nguyên tắc "hiệu quả kinh tế". Thuế quá cao tạo ra méo mó thị trường: buôn lậu tăng, kinh tế ngầm phát triển, chi phí hành chính để chống trốn thuế tăng vọt. Kết quả: ngân sách thực thu có thể GIẢM thay vì tăng — hiện tượng "vượt đỉnh Laffer".',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: '3 nguyên tắc nền tảng của hệ thống thuế tốt',
        paragraphs: [
          '1. Hiệu quả kinh tế: Thuế nên tối đa hóa phúc lợi xã hội trong khi giảm thiểu méo mó thị trường. Điều này có nghĩa: thuế không nên thay đổi hành vi kinh tế một cách quá mức (trừ khi có chủ đích, như thuế thuốc lá); chi phí hành chính và tuân thủ thuế nên thấp; hệ thống thuế nên linh hoạt để thích ứng với thay đổi kinh tế.',
          '2. Công bằng xã hội: Gồm hai chiều — công bằng ngang (horizontal equity): người có khả năng đóng thuế như nhau thì đóng bằng nhau; và công bằng dọc (vertical equity): người thu nhập cao đóng tỷ lệ cao hơn (thuế lũy tiến). Ngoài ra, hệ thống thuế phải minh bạch để công dân hiểu tại sao mình đóng thuế.',
          '3. Tính khả thi trong quản lý: "Các quy định thuế không nên thay đổi thường xuyên" — vì doanh nghiệp và cá nhân cần sự ổn định để lập kế hoạch dài hạn. Hệ thống cũng phải đơn giản đủ để thực thi, phù hợp với năng lực quản lý và văn hóa của quốc gia.',
        ],
      },
      {
        type: 'perspective-switch',
        title: 'Flat tax 15% — Ai được, ai mất?',
        event: 'Nhà nước đề xuất thay thuế TNCN lũy tiến (7 bậc, 5-35%) bằng flat tax 15% cho tất cả. Nga từng áp dụng flat tax 13% (2001-2020) rồi bỏ. Mỗi bên nhìn nhận khác nhau.',
        perspectives: [
          {
            id: 'rich',
            role: 'Người thu nhập cao (80 triệu/tháng)',
            icon: '💼',
            narrative: 'Hiện tôi đóng thuế suất biên 35%, thuế thực tế khoảng 17% lương. Flat tax 15% giúp tôi tiết kiệm đáng kể — hàng chục triệu mỗi tháng. Tôi ủng hộ vì nó đơn giản, minh bạch, khuyến khích làm việc chăm chỉ. Các nước như Estonia, Nga từng áp dụng thành công.',
          },
          {
            id: 'poor',
            role: 'Người thu nhập thấp (8 triệu/tháng)',
            icon: '👷',
            narrative: 'Hiện tôi đóng thuế TNCN 0% vì lương dưới ngưỡng giảm trừ. Flat tax 15% nghĩa là tôi phải đóng 1.2 triệu/tháng — gần bằng tiền ăn cả tuần. Tôi không phản đối đóng thuế, nhưng tăng gấp 3 lần (từ 5% lên 15%) trong khi người giàu GIẢM thuế thì không công bằng.',
          },
          {
            id: 'economist',
            role: 'Nhà kinh tế',
            icon: '📊',
            narrative: 'Flat tax đơn giản về hành chính nhưng có 3 vấn đề: (1) Ngân sách giảm nếu không mở rộng cơ sở thuế; (2) Bất bình đẳng tăng vì mất công cụ tái phân phối; (3) Tiêu dùng nội địa giảm vì người thu nhập thấp mất nhiều hơn. Nga đã bỏ flat tax năm 2021 để quay về lũy tiến. Bắc Âu duy trì lũy tiến cao — bất bình đẳng thấp, chất lượng sống cao.',
          },
        ],
        question: {
          text: 'Tại sao hầu hết nước phát triển không áp dụng flat tax?',
          options: [
            { id: 'a', text: 'Vì flat tax đơn giản nhưng bỏ qua nguyên tắc công bằng dọc — người nghèo gánh nặng hơn, bất bình đẳng tăng', isCorrect: true },
            { id: 'b', text: 'Vì flat tax luôn thu ít ngân sách hơn', isCorrect: false },
            { id: 'c', text: 'Vì flat tax quá phức tạp để thực hiện', isCorrect: false },
            { id: 'd', text: 'Vì người giàu phản đối flat tax', isCorrect: false },
          ],
          explanation: 'Nguyên tắc công bằng không chỉ là lý thuyết đạo đức — nó có hệ quả kinh tế thực tế. Bỏ công bằng dọc → bất bình đẳng tăng → tiêu dùng nội địa giảm → tăng trưởng chậm. Thiết kế thuế luôn là sự cân bằng giữa hiệu quả và công bằng.',
        },
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Tam giác bất khả thi của thuế',
        text: 'Rất khó để đồng thời đạt cả 3 nguyên tắc ở mức tối đa:\n• Quá công bằng → phức tạp, khó quản lý\n• Quá hiệu quả → có thể bất công (flat tax)\n• Quá đơn giản → bỏ qua nhu cầu riêng của từng nhóm\n\nMỗi quốc gia phải tìm điểm cân bằng phù hợp với bối cảnh riêng.',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Ổn định — Yếu tố thường bị bỏ qua',
        paragraphs: [
          '"Các quy định thuế không nên thay đổi thường xuyên." Đây là nguyên tắc tưởng đơn giản nhưng cực kỳ quan trọng.',
          'Khi luật thuế thay đổi liên tục, doanh nghiệp không dám đầu tư dài hạn vì không biết chính sách thuế năm sau sẽ ra sao. Cá nhân khó lập kế hoạch tài chính. Chi phí tuân thủ tăng vì phải liên tục cập nhật.',
          'Ổn định thuế tạo ra niềm tin — và niềm tin là nền tảng cho hoạt động kinh tế. Ngay cả một hệ thống thuế "không hoàn hảo" nhưng ổn định vẫn tốt hơn một hệ thống "tốt" nhưng thay đổi liên tục.',
        ],
      },
      {
        type: 'source-ranker',
        title: 'Đánh giá: Nguồn nào đáng tin khi tìm hiểu về hệ thống thuế?',
        event: 'Bạn muốn tìm hiểu xem hệ thống thuế Việt Nam có công bằng không. Bạn tìm được 4 nguồn thông tin.',
        sources: [
          {
            id: 's1',
            name: 'Báo cáo của Ngân hàng Thế giới (World Bank)',
            excerpt: 'Hệ thống thuế Việt Nam dựa nhiều vào thuế gián tiếp (VAT), chiếm khoảng 30% tổng thu ngân sách. Điều này có thể tạo gánh nặng tương đối lớn hơn cho nhóm thu nhập thấp.',
            credibilityScore: 90,
            explanation: 'Tổ chức quốc tế uy tín, dữ liệu dựa trên nghiên cứu thực nghiệm, phương pháp minh bạch.',
            greenFlags: ['Dữ liệu thực nghiệm', 'Phương pháp công khai', 'Uy tín quốc tế'],
          },
          {
            id: 's2',
            name: 'Bài báo mạng: "Thuế Việt Nam bóp nghẹt người nghèo"',
            excerpt: 'Hệ thống thuế bất công đang giết chết tầng lớp lao động! 90% người nghèo phải gánh thuế nặng hơn tỷ phú!',
            credibilityScore: 20,
            explanation: 'Ngôn ngữ cảm xúc quá mức, số liệu không rõ nguồn (90% từ đâu?), thiếu phân tích.',
            redFlags: ['Ngôn ngữ kích động', 'Số liệu không nguồn', 'Kết luận cực đoan'],
          },
          {
            id: 's3',
            name: 'Tổng cục Thuế Việt Nam — Báo cáo thường niên',
            excerpt: 'Tổng thu ngân sách năm 2023 đạt 1.752 nghìn tỷ đồng, vượt 8,8% dự toán. Thuế VAT chiếm 28,5% tổng thu.',
            credibilityScore: 75,
            explanation: 'Nguồn chính thức, dữ liệu chính xác. Tuy nhiên là cơ quan thu thuế nên có thể thiên về góc nhìn tích cực.',
            greenFlags: ['Dữ liệu chính thức', 'Số liệu cụ thể'],
            redFlags: ['Có thể thiếu khách quan về tác động tiêu cực'],
          },
          {
            id: 's4',
            name: 'Blog cá nhân của chuyên gia kinh tế',
            excerpt: 'Dựa trên phân tích dữ liệu Tổng cục Thuế và World Bank, hệ thống thuế VN có tính lũy thoái ở phần gián tiếp nhưng lũy tiến ở phần trực tiếp. Cần cải cách để cân bằng hơn.',
            credibilityScore: 65,
            explanation: 'Phân tích dựa trên dữ liệu, có trích dẫn nguồn. Nhưng là ý kiến cá nhân, cần đối chiếu thêm.',
            greenFlags: ['Trích dẫn nguồn', 'Phân tích cân bằng'],
            redFlags: ['Ý kiến cá nhân', 'Chưa qua peer review'],
          },
        ],
        instruction: 'Xếp hạng 4 nguồn từ đáng tin nhất đến kém tin cậy nhất.',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Nguyên tắc thuế của Adam Smith',
        description: 'Bốn nguyên tắc thuế cổ điển từ "The Wealth of Nations" (1776)',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: '4 nguyên tắc thuế của Adam Smith',
              paragraphs: [
                'Trong "The Wealth of Nations" (1776), Adam Smith đề xuất 4 nguyên tắc thuế cổ điển mà nhiều hệ thống thuế hiện đại vẫn dựa trên:',
                '1. Equity (Công bằng): Mỗi người đóng góp tương ứng với khả năng. 2. Certainty (Rõ ràng): Người đóng thuế biết rõ khi nào, bao nhiêu, và cách nộp. 3. Convenience (Thuận tiện): Thu thuế vào thời điểm và theo cách thuận tiện nhất cho người nộp. 4. Economy (Tiết kiệm): Chi phí thu thuế phải nhỏ so với số thu được.',
              ],
            },
          ],
          relatedConcepts: ['Tax efficiency', 'Tax equity', 'Laffer curve'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/The_Wealth_of_Nations',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ 3 nguyên tắc: hiệu quả kinh tế, công bằng xã hội, tính khả thi\n✓ Công bằng ngang (cùng khả năng = cùng thuế) + công bằng dọc (thu nhập cao = thuế suất cao)\n✓ Thuế quá cao có thể khiến ngân sách GIẢM (Laffer curve)\n✓ Ổn định thuế quan trọng hơn sự hoàn hảo\n✓ Đánh giá nguồn thông tin về thuế cần tư duy phản biện',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết Level 2 — Và Level 3',
        paragraphs: [
          'Bạn đã hiểu TẠI SAO đóng thuế (khế ước xã hội, dịch vụ công) và THU THẾ NÀO mới đúng (3 nguyên tắc). Level 3 sẽ đặt câu hỏi khó hơn: Làm sao biết tiền thuế được dùng đúng? Và thuế liên quan gì đến dân chủ?',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // LEVEL 3: THUẾ, MINH BẠCH & CHÍNH TRỊ
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // LESSON 7: Thuế và minh bạch
  // Source: MassEdu Lesson 5 (Thuế Và Minh Bạch)
  // ────────────────────────────────────────────────────────────────
  'thuev2-7': {
    title: 'Thuế và minh bạch',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Mỗi năm, ngân sách Việt Nam thu hơn 1.700 nghìn tỷ đồng tiền thuế. Con số khổng lồ này đi đâu? Ai quyết định? Và bạn — người đóng thuế — có quyền biết không?',
          'Thiếu minh bạch trong sử dụng ngân sách thuế không chỉ gây lãng phí — nó phá hủy niềm tin giữa công dân và Nhà nước. Bài học này sẽ phân tích tại sao minh bạch thuế quan trọng, và 3 cách để đạt được nó.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Khi công dân không biết tiền thuế đi đâu, điều gì xảy ra với niềm tin và sự tuân thủ thuế?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Nếu bạn biết chính xác tiền thuế của mình được dùng cho gì, bạn có sẵn lòng đóng thuế hơn không?',
        options: [
          { id: 'a', text: 'Không — thuế là bắt buộc, minh bạch không ảnh hưởng', isCorrect: false },
          { id: 'b', text: 'Có — nghiên cứu cho thấy minh bạch tăng tỷ lệ tuân thủ thuế tự nguyện', isCorrect: true },
          { id: 'c', text: 'Chỉ khi tiền được dùng cho thứ tôi muốn', isCorrect: false },
          { id: 'd', text: 'Minh bạch chỉ quan trọng với người giàu', isCorrect: false },
        ],
        explanation: 'Nhiều nghiên cứu (World Bank, OECD) cho thấy: khi công dân hiểu và tin tưởng cách sử dụng ngân sách, tỷ lệ tuân thủ thuế tự nguyện tăng đáng kể. Thiếu minh bạch → mất niềm tin → trốn thuế tăng → ngân sách giảm → dịch vụ công kém hơn → mất niềm tin thêm. Đây là vòng xoáy tiêu cực.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Tại sao minh bạch thuế quan trọng?',
        paragraphs: [
          'Thiếu minh bạch trong thuế và ngân sách gây ra ít nhất 3 vấn đề nghiêm trọng:',
          '1. Thất thoát ngân sách: Khi không ai giám sát, tiền thuế dễ bị lãng phí hoặc tham nhũng. Theo nhiều báo cáo, thiếu minh bạch là nguyên nhân hàng đầu của thất thoát ngân sách công.',
          '2. Mất niềm tin: Khi công dân không biết tiền thuế đi đâu, họ mất niềm tin vào hệ thống → trốn thuế tăng → ngân sách giảm → dịch vụ công kém → mất niềm tin thêm. Vòng xoáy tiêu cực.',
          '3. Bất bình đẳng ẩn: Khi "chi phí thuế" (tax expenditures) — tức các khoản miễn, giảm, ưu đãi thuế — không được tính vào ngân sách tổng, thì những khoản ưu đãi cho nhóm đặc quyền bị che giấu khỏi sự giám sát.',
        ],
      },
      {
        type: 'bias-detector',
        title: 'Phát hiện thiên lệch trong bài báo về thuế',
        instruction: 'Đọc đoạn tin dưới đây. Click vào các cụm từ được highlight và chọn loại thiên lệch phù hợp.',
        article: {
          text: 'Chính sách tăng thuế VAT lên 12% là một đòn giáng mạnh vào túi tiền người dân. Trong khi tất cả các chuyên gia kinh tế đều phản đối, Nhà nước vẫn cố tình bỏ qua ý kiến phản biện. Một cuộc khảo sát online cho thấy 95% người dân phản đối — con số áp đảo chứng minh chính sách này hoàn toàn sai lầm.',
          source: 'Bài báo mẫu — Phân tích thiên lệch',
        },
        segments: [
          { id: 's1', text: 'đòn giáng mạnh vào túi tiền', startIndex: 43, biasType: 'emotional', explanation: '"Đòn giáng mạnh" là ngôn ngữ cảm xúc phóng đại. Tăng VAT 2% có ảnh hưởng, nhưng mức độ cần dựa trên phân tích, không phải tu từ.' },
          { id: 's2', text: 'tất cả các chuyên gia kinh tế đều phản đối', startIndex: 95, biasType: 'cherry-pick', explanation: 'Chọn lọc thông tin: không phải "tất cả" chuyên gia đều phản đối. Nhiều chuyên gia ủng hộ vì lý do ngân sách. Từ "tất cả" tạo cảm giác đồng thuận giả.' },
          { id: 's3', text: 'cố tình bỏ qua', startIndex: 140, biasType: 'loaded', explanation: '"Cố tình bỏ qua" gán ý đồ xấu mà không có bằng chứng. Có thể Nhà nước đã cân nhắc nhưng có lý do khác.' },
          { id: 's4', text: 'Một cuộc khảo sát online cho thấy 95%', startIndex: 172, biasType: 'cherry-pick', explanation: 'Khảo sát online không đại diện cho dân số — chỉ người có internet và quan tâm mới tham gia. 95% trong mẫu thiên lệch không = 95% dân số.' },
        ],
        biasOptions: [
          { id: 'emotional', label: 'Ngôn ngữ cảm xúc' },
          { id: 'cherry-pick', label: 'Chọn lọc thông tin' },
          { id: 'loaded', label: 'Gán ý đồ (Loaded language)' },
          { id: 'ad-hominem', label: 'Tấn công cá nhân' },
          { id: 'false-eq', label: 'Đánh đồng sai' },
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: '3 cách đạt được minh bạch thuế',
        text: '1. Thông tin dễ tiếp cận: Nghĩa vụ thuế, tổng thu, phân bổ ngân sách phải được công khai và viết bằng ngôn ngữ dễ hiểu — không chỉ cho chuyên gia mà cho mọi công dân.\n\n2. Diễn đàn tham gia: Người dân cần có nơi để nêu ý kiến, phản hồi, và nhận được phản hồi từ Nhà nước. Xã hội dân sự đóng vai trò cầu nối quan trọng.\n\n3. Cải cách thể chế: Cấu trúc thuế cần được luật hóa minh bạch. "Tax expenditures" (các khoản miễn giảm) cần được tính vào ngân sách tổng, không giấu.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Sự tham gia của công dân — Chìa khóa minh bạch',
        paragraphs: [
          'Minh bạch không tự đến — nó cần sự tham gia của công dân. Khi người dân quan tâm, đặt câu hỏi, và yêu cầu giải trình, Nhà nước có động lực mạnh hơn để minh bạch.',
          'Ngược lại, khi công dân thờ ơ với thuế ("cứ để Nhà nước lo"), thì không có ai giám sát → lãng phí và tham nhũng dễ xảy ra.',
          'Nghiên cứu cho thấy: ở các quốc gia có mức tham gia công dân cao (Bắc Âu, New Zealand), mức minh bạch ngân sách cũng cao nhất — và mức hài lòng với dịch vụ công cũng cao nhất. Tham gia giám sát thuế chính là cách bạn thực hiện quyền công dân.',
        ],
      },
      {
        type: 'debate-arena',
        title: 'Tranh luận: Minh bạch thuế — Quyền hay Đặc ân?',
        topic: 'Công dân có QUYỀN biết chính xác tiền thuế của mình được dùng cho gì, hay đây chỉ là "đặc ân" mà Nhà nước ban cho?',
        stances: [
          { id: 'right', label: 'Đó là QUYỀN', description: 'Công dân đóng thuế → có quyền đòi minh bạch. Đây là nền tảng của khế ước xã hội.' },
          { id: 'privilege', label: 'Đó là ĐẶC ÂN', description: 'Nhà nước có nghĩa vụ tổng thể, không cần giải trình từng khoản. Minh bạch quá mức gây tốn kém.' },
        ],
        rounds: [
          {
            opponentArgument: 'Minh bạch hoàn toàn rất tốn kém — chi phí công khai và kiểm toán từng khoản ngân sách có thể lên đến hàng nghìn tỷ đồng. Tiền đó nên dùng cho dịch vụ công thay vì cho báo cáo.',
            responseOptions: [
              { id: 'r1', text: 'Chi phí minh bạch nhỏ hơn rất nhiều so với chi phí tham nhũng và lãng phí mà nó ngăn chặn', score: 3, feedback: 'Lập luận mạnh! Nghiên cứu cho thấy mỗi đồng đầu tư vào minh bạch có thể tiết kiệm 5-10 đồng lãng phí.' },
              { id: 'r2', text: 'Đúng, nên chỉ minh bạch những khoản lớn, không cần chi tiết hết', score: 2, feedback: 'Thỏa hiệp hợp lý. Nhưng "lớn" là bao nhiêu? Ai quyết định ngưỡng?' },
              { id: 'r3', text: 'Minh bạch là nguyên tắc, không thể đặt giá trị tiền lên nó', score: 1, feedback: 'Quá cứng nhắc. Trong thực tế, mọi chính sách đều cần cân nhắc chi phí-lợi ích.' },
            ],
          },
          {
            opponentArgument: 'Nhiều thông tin ngân sách liên quan đến an ninh quốc gia — công khai có thể gây nguy hiểm.',
            responseOptions: [
              { id: 'r1', text: 'Đồng ý ngân sách quốc phòng cần bảo mật hợp lý — nhưng phần lớn ngân sách (giáo dục, y tế, hạ tầng) không liên quan an ninh', score: 3, feedback: 'Phân biệt đúng! Chi quốc phòng chỉ chiếm ~5-8% ngân sách. 92% còn lại hoàn toàn có thể công khai.' },
              { id: 'r2', text: 'An ninh quốc gia chỉ là cái cớ — tất cả phải minh bạch', score: 1, feedback: 'Quá cực đoan. Một số thông tin quốc phòng thực sự cần bảo mật.' },
              { id: 'r3', text: 'Vậy nên để giám sát cho Quốc hội, không cần công dân biết', score: 2, feedback: 'Quốc hội giám sát là cần thiết nhưng chưa đủ. Công dân cũng cần thông tin để giám sát Quốc hội.' },
            ],
          },
        ],
        conclusion: 'Minh bạch thuế là QUYỀN của công dân — được thừa nhận bởi luật pháp quốc tế và là nền tảng của khế ước xã hội. Tuy nhiên, quyền này cần được thực hiện một cách thực tế: tập trung vào phần lớn ngân sách phi an ninh, sử dụng công nghệ để giảm chi phí, và xây dựng năng lực giám sát cho công dân.',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Minh bạch ngân sách trên thế giới',
        description: 'So sánh mức độ minh bạch ngân sách giữa các quốc gia',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'Open Budget Index',
              paragraphs: [
                'International Budget Partnership (IBP) đánh giá minh bạch ngân sách của 120+ quốc gia qua Open Budget Survey. Điểm từ 0-100, với 60+ được coi là "đủ minh bạch".',
                'Các nước đạt điểm cao: New Zealand (87), Nam Phi (86), Thụy Điển (83). Các nước điểm thấp thường là các chế độ độc tài hoặc quốc gia xung đột.',
              ],
            },
            {
              heading: 'Tax expenditures — Chi phí thuế ẩn',
              paragraphs: [
                '"Tax expenditures" là các khoản miễn, giảm, ưu đãi thuế. Ví dụ: miễn VAT cho gạo, giảm thuế TNDN cho doanh nghiệp FDI, ưu đãi thuế cho khu công nghiệp.',
                'Những khoản này có tác động tương đương chi ngân sách (Nhà nước mất thu nhập) nhưng thường KHÔNG được đưa vào báo cáo ngân sách chính thức — tạo ra một "ngân sách ẩn" khó giám sát.',
              ],
            },
          ],
          relatedConcepts: ['Open Budget Survey', 'Fiscal transparency', 'Tax expenditures'],
          furtherReading: [
            'https://internationalbudget.org/',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Thiếu minh bạch → thất thoát, mất niềm tin, bất bình đẳng ẩn\n✓ 3 cách đạt minh bạch: thông tin dễ tiếp cận + diễn đàn tham gia + cải cách thể chế\n✓ Minh bạch thuế là QUYỀN công dân, không phải đặc ân\n✓ Sự tham gia giám sát của công dân là chìa khóa\n✓ Cần nhận diện thiên lệch truyền thông khi đọc tin về thuế',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học tiếp theo',
        paragraphs: [
          'Minh bạch thuế là nền tảng cho niềm tin và tuân thủ. Nhưng thuế còn liên quan đến một chủ đề rộng hơn: chính trị.',
          'Bài học cuối Level 3 sẽ khám phá mối quan hệ giữa thuế và dân chủ: Tại sao không có hệ thống thuế hoàn hảo? VAT có thực sự "công bằng" không? Và nguồn tài nguyên thiên nhiên dồi dào có thể làm suy yếu dân chủ như thế nào?',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 8: Thuế và chính trị
  // Source: MassEdu Lesson 6 (Thuế Và Chính Trị)
  // ────────────────────────────────────────────────────────────────
  'thuev2-8': {
    title: 'Thuế và chính trị',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Không có hệ thống thuế hoàn hảo. Mỗi quốc gia thiết kế thuế dựa trên giá trị và ưu tiên chính trị của mình: Đức nhấn mạnh tái phân phối, Mỹ ưu tiên khuyến khích tạo tài sản, Singapore giữ thuế thấp để hút đầu tư.',
          'Bài học này khám phá mối quan hệ sâu sắc giữa thuế và chính trị: thuế ảnh hưởng đến bất bình đẳng như thế nào, và tại sao các quốc gia giàu tài nguyên thiên nhiên thường có ít dân chủ hơn.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Thuế không chỉ là công cụ kinh tế — nó phản ánh và định hình mối quan hệ quyền lực giữa Nhà nước và công dân. Khi Nhà nước không cần tiền thuế của dân, điều gì xảy ra với dân chủ?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Quốc gia nào dưới đây có xu hướng dân chủ YẾU hơn?',
        options: [
          { id: 'a', text: 'Quốc gia phụ thuộc vào thuế thu nhập từ công dân', isCorrect: false },
          { id: 'b', text: 'Quốc gia phụ thuộc vào doanh thu từ dầu mỏ và khoáng sản', isCorrect: true },
          { id: 'c', text: 'Quốc gia có thuế suất cao', isCorrect: false },
          { id: 'd', text: 'Quốc gia có GDP cao', isCorrect: false },
        ],
        explanation: 'Đây là "Resource Curse" (lời nguyền tài nguyên). Nguyên tắc "No taxation without representation": khi Nhà nước phụ thuộc vào thuế từ công dân, họ cần sự ủng hộ và đồng thuận → thúc đẩy dân chủ. Khi Nhà nước có nguồn thu từ tài nguyên, họ ít cần công dân → ít áp lực dân chủ hóa.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Thuế gián tiếp và bất bình đẳng',
        paragraphs: [
          'Thuế gián tiếp (VAT) nhìn bề ngoài có vẻ "công bằng" vì ai cũng trả cùng tỷ lệ. Nhưng thực tế, nó tạo ra bất bình đẳng ẩn.',
          'Ví dụ: hóa đơn siêu thị 500.000 đồng, VAT 10% = 50.000 đồng thuế. Với người thu nhập 5 triệu/tháng, 50.000 đồng = 1% thu nhập. Với người thu nhập 50 triệu/tháng, 50.000 đồng = 0.1% thu nhập. Cùng số tiền thuế, nhưng gánh nặng thực tế chênh lệch 10 lần.',
          'Ngược lại, thuế trực tiếp lũy tiến (thu nhập cá nhân) phân bổ gánh nặng theo khả năng chi trả. Người giàu đóng thuế suất cao hơn, tiền thuế được dùng cho phúc lợi xã hội — tạo ra hiệu ứng tái phân phối.',
          'Mỗi quốc gia chọn tỷ lệ khác nhau giữa thuế trực tiếp và gián tiếp: các nước Bắc Âu (Thụy Điển, Đan Mạch) dựa nhiều vào thuế trực tiếp lũy tiến → bất bình đẳng thấp. Nhiều nước đang phát triển dựa nhiều vào VAT → dễ thu nhưng kém công bằng.',
        ],
      },
      {
        type: 'slider-simulator',
        title: 'Đường cong Laffer — Thuế suất vs Thu ngân sách',
        description: 'Thuế suất cao hơn có luôn mang lại nhiều tiền hơn cho Nhà nước? Kéo thanh trượt để khám phá.',
        sliders: [
          { id: 'taxRate', label: 'Thuế suất', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%' },
        ],
        outputs: [
          { id: 'revenue', label: 'Thu ngân sách', formula: 'taxRate * (100 - taxRate) * 0.4', unit: 'tỷ VNĐ', format: 'number' },
          { id: 'evasion', label: 'Tỷ lệ trốn thuế', formula: 'Math.min(95, Math.max(0, (taxRate - 30) * 2))', format: 'percent' },
        ],
        chart: {
          type: 'bar',
          bars: [
            { label: 'Thu ngân sách', formula: 'taxRate * (100 - taxRate) * 0.4', color: 'bg-emerald-500' },
            { label: 'Trốn thuế', formula: 'Math.min(95, Math.max(0, (taxRate - 30) * 2)) * 10', color: 'bg-red-400' },
          ],
        },
        breakpoints: [
          { condition: 'taxRate <= 10', message: 'Thuế suất quá thấp: Nhà nước không đủ ngân sách cho dịch vụ công cơ bản.', variant: 'warning' },
          { condition: 'taxRate >= 45 && taxRate <= 55', message: '💡 Đây là "đỉnh Laffer" — thu ngân sách đạt tối đa. Nhiều nhà kinh tế cho rằng điểm tối ưu nằm quanh 50%.', variant: 'success' },
          { condition: 'taxRate >= 70', message: 'Thuế suất quá cao: người dân trốn thuế hoặc giảm lao động. Tổng thu ngân sách giảm mạnh — "vượt đỉnh Laffer".', variant: 'warning' },
          { condition: 'taxRate >= 90', message: '⚠️ Thuế 90%+: Gần như không ai muốn làm việc hợp pháp. Kinh tế ngầm phát triển. Mức thuế phi thực tế.', variant: 'warning' },
        ],
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Resource Curse — Lời nguyền tài nguyên',
        text: 'Nguyên tắc "No taxation without representation": Khi Nhà nước phụ thuộc vào thuế từ công dân, họ CẦN sự đồng thuận → dân chủ hóa.\n\nNhưng khi Nhà nước có nguồn thu khổng lồ từ dầu mỏ, khoáng sản, hoặc viện trợ nước ngoài, họ KHÔNG CẦN thuế từ dân → ít áp lực dân chủ hóa → quyền công dân yếu đi.\n\nVí dụ: Saudi Arabia, UAE (giàu dầu, không thu thuế TNCN, ít dân chủ) vs Thụy Điển (ít tài nguyên, thuế cao, dân chủ mạnh).',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Thuế và sức khỏe dân chủ',
        paragraphs: [
          'Mối quan hệ giữa thuế và dân chủ không phải ngẫu nhiên. Lịch sử cho thấy: các cuộc cách mạng dân chủ lớn nhất thường bắt đầu từ tranh chấp về thuế.',
          'Cách mạng Mỹ (1776): "No taxation without representation" — thuộc địa phản đối Anh đánh thuế mà không cho đại diện. Cách mạng Pháp (1789): bất bình về thuế bất công giữa các giai cấp.',
          'Nguyên tắc cốt lõi: khi hệ thống thuế phụ thuộc vào đóng góp của công dân, cả hai bên đều có động lực duy trì quan hệ lành mạnh. Công dân đóng thuế → có quyền đòi hỏi → Nhà nước phải lắng nghe. Đây là vòng tuần hoàn tích cực của dân chủ.',
          'Ngược lại, khi Nhà nước không cần tiền thuế (nhờ tài nguyên hoặc viện trợ), mối quan hệ này bị đứt gãy. Công dân mất đòn bẩy thương lượng. Dân chủ suy yếu.',
        ],
      },
      {
        type: 'correlation-causation',
        title: 'Tài nguyên thiên nhiên vs Dân chủ — Tương quan hay Nhân quả?',
        instruction: 'Quan sát dữ liệu và xác định mối quan hệ giữa hai yếu tố.',
        pairs: [
          {
            id: 'resource-democracy',
            factA: { label: 'Thu nhập từ tài nguyên (% GDP)', data: [45, 38, 5, 2, 50, 8, 3, 42] },
            factB: { label: 'Chỉ số dân chủ (0-100)', data: [15, 25, 85, 90, 10, 82, 88, 20] },
            labels: ['Saudi Arabia', 'Russia', 'Thụy Điển', 'Đan Mạch', 'Qatar', 'New Zealand', 'Đức', 'Venezuela'],
            correctAnswer: 'correlation',
            explanation: 'Có tương quan rõ ràng: quốc gia giàu tài nguyên thường có dân chủ yếu hơn. Nhưng đây là TƯƠNG QUAN, không nhất thiết là nhân quả — có nhiều yếu tố khác (lịch sử, văn hóa, thể chế). Norway là ngoại lệ: rất giàu dầu nhưng rất dân chủ nhờ thể chế mạnh.',
            confoundingFactor: 'Norway là phản ví dụ quan trọng: giàu dầu mỏ nhưng có nền dân chủ mạnh. Yếu tố then chốt không chỉ là tài nguyên, mà là THỂ CHẾ có trước khi phát hiện tài nguyên hay không.',
          },
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Thuế và dân chủ',
        description: 'Mối quan hệ lịch sử giữa hệ thống thuế và thể chế chính trị',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'Thuế như nền tảng dân chủ',
              paragraphs: [
                'Mối quan hệ giữa thuế và đại diện chính trị được ghi nhận từ thế kỷ 13 ở Anh (Magna Carta, 1215). Nhà vua cần tiền từ quý tộc → phải nhượng bộ quyền lực → Quốc hội ra đời.',
                'Nguyên tắc này vẫn đúng trong thế giới hiện đại: các quốc gia phụ thuộc vào thuế từ công dân có xu hướng dân chủ hơn, minh bạch hơn, và phản ứng nhanh hơn với nhu cầu của dân.',
              ],
            },
            {
              heading: 'Resource Curse — Chi tiết hơn',
              paragraphs: [
                '"Lời nguyền tài nguyên" không chỉ về dân chủ — nó còn liên quan đến phát triển kinh tế. Nhiều nước giàu tài nguyên có tăng trưởng kém hơn nước nghèo tài nguyên, do: (1) bệnh Hà Lan (Dutch disease) — tài nguyên khiến các ngành khác mất cạnh tranh; (2) thiếu áp lực đổi mới; (3) tham nhũng và tranh giành tài nguyên.',
                'Norway thoát "lời nguyền" nhờ: (1) có nền dân chủ mạnh TRƯỚC khi phát hiện dầu; (2) lập Quỹ Đầu tư Chính phủ (Government Pension Fund) để quản lý thu nhập dầu một cách minh bạch.',
              ],
            },
          ],
          relatedConcepts: ['Resource curse', 'Dutch disease', 'Fiscal social contract'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/Resource_curse',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Không có hệ thống thuế hoàn hảo — mỗi nước chọn theo giá trị riêng\n✓ Thuế gián tiếp "trông" công bằng nhưng thực tế bất công với người nghèo\n✓ Đường cong Laffer: thuế quá cao → ngân sách giảm thay vì tăng\n✓ Resource Curse: nước giàu tài nguyên thường ít dân chủ hơn\n✓ Thuế + đại diện = nền tảng dân chủ ("No taxation without representation")',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết Level 3 — Và Level 4',
        paragraphs: [
          'Level 3 đã kết nối thuế với minh bạch và chính trị — hai chủ đề lớn vượt xa bài toán "thu bao nhiêu, chi bao nhiêu".',
          'Level 4 — level cuối cùng — sẽ đưa bạn trở lại thực tế: Thuế ẩn ở đâu trong cuộc sống hàng ngày? Bạn có cần mã số thuế không? Và lương 15 triệu/tháng thì thực nhận bao nhiêu? Tất cả sẽ được giải đáp.',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // LEVEL 4: THUẾ TRONG ĐỜI SỐNG THỰC
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // LESSON 9: Nhận diện thuế hàng ngày
  // Source: MassEdu Module A (Recognizing Daily Taxes)
  // ────────────────────────────────────────────────────────────────
  'thuev2-9': {
    title: 'Nhận diện thuế hàng ngày',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Từ Level 1-3, bạn đã nắm lý thuyết. Giờ là lúc áp dụng vào thực tế: trong một ngày bình thường, bạn đóng bao nhiêu thuế? Thuế ẩn ở đâu trong mỗi giao dịch?',
          'Bài học này sẽ giúp bạn nhận diện thuế trong sinh hoạt hàng ngày — từ ổ bánh mì buổi sáng đến hóa đơn điện cuối tháng.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Mỗi tháng, bạn đóng tổng cộng bao nhiêu thuế gián tiếp mà không hề nhận ra?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Lít xăng bạn đổ mỗi ngày chứa bao nhiêu loại thuế?',
        options: [
          { id: 'a', text: 'Chỉ 1 — thuế VAT', isCorrect: false },
          { id: 'b', text: '2 — VAT và thuế tiêu thụ đặc biệt', isCorrect: false },
          { id: 'c', text: 'Ít nhất 3 — VAT, thuế tiêu thụ đặc biệt, và thuế bảo vệ môi trường', isCorrect: true },
          { id: 'd', text: 'Xăng không bị đánh thuế ở Việt Nam', isCorrect: false },
        ],
        explanation: 'Mỗi lít xăng tại Việt Nam chứa ít nhất 3 loại thuế: VAT (10%), thuế tiêu thụ đặc biệt (10%), và thuế bảo vệ môi trường (3.800-4.000 đồng/lít). Thuế chiếm khoảng 35-40% giá xăng bạn trả!',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Một ngày của bạn — và thuế đi kèm',
        paragraphs: [
          'Hãy theo dõi chi tiêu trong một ngày bình thường và xem thuế ẩn ở đâu:',
          'Buổi sáng: Cà phê 30.000đ (VAT ~2.727đ) + Bánh mì 25.000đ (VAT ~2.273đ) = ~5.000đ thuế.',
          'Di chuyển: Đổ 3 lít xăng ~75.000đ — trong đó ~27.000đ là thuế (VAT + TTĐB + BVMT). Thuế chiếm 36% giá xăng.',
          'Buổi trưa: Cơm văn phòng 45.000đ (VAT ~4.091đ). Mua chai nước ngọt 10.000đ (VAT ~909đ).',
          'Buổi tối: Siêu thị 200.000đ (VAT ~18.182đ). Nếu mua bia: thêm thuế tiêu thụ đặc biệt 65%.',
          'Cuối tháng: Hóa đơn điện 500.000đ (VAT ~45.455đ). Internet 200.000đ (VAT ~18.182đ).',
          'Tổng thuế gián tiếp ước tính: 500.000 - 800.000đ/tháng cho sinh viên, 1-2 triệu/tháng cho gia đình.',
        ],
      },
      {
        type: 'stat-trick',
        title: 'Biểu đồ thuế ẩn — Bạn có nhận ra thủ thuật?',
        instruction: 'Nhìn biểu đồ so sánh "thuế ẩn" trong các sản phẩm hàng ngày. Biểu đồ này có đang lừa mắt bạn không?',
        chart: {
          type: 'bar',
          title: 'Thuế ẩn trong chi tiêu hàng ngày (đồng)',
          data: [
            { label: 'Hóa đơn điện', value: 45455, displayValue: '45.455đ' },
            { label: 'Đổ xăng', value: 27000, displayValue: '27.000đ' },
            { label: 'Bia (2 lon)', value: 18400, displayValue: '18.400đ' },
            { label: 'Thuốc lá', value: 13750, displayValue: '13.750đ' },
            { label: 'Cơm trưa', value: 4091, displayValue: '4.091đ' },
            { label: 'Cà phê', value: 2727, displayValue: '2.727đ' },
          ],
          yAxisStart: 0,
        },
        question: 'Biểu đồ này gây hiểu nhầm bằng cách nào?',
        options: [
          { id: 'a', text: 'So sánh theo SỐ TIỀN tuyệt đối — sản phẩm đắt hơn tự nhiên có thuế cao hơn, nhưng TỶ LỆ thuế mới là điều quan trọng', isCorrect: true },
          { id: 'b', text: 'Trục Y không bắt đầu từ 0', isCorrect: false },
          { id: 'c', text: 'Số liệu bị làm giả', isCorrect: false },
          { id: 'd', text: 'Biểu đồ hoàn toàn chính xác, không gây hiểu nhầm', isCorrect: false },
        ],
        reveal: {
          explanation: 'Hóa đơn điện có thuế ẩn cao nhất (45.455đ) nhưng chỉ vì giá gốc lớn (500.000đ) — tỷ lệ thuế chỉ 9.1%. Ngược lại, thuốc lá chỉ 13.750đ thuế nhưng tỷ lệ lên đến 55% (TTĐB 75% + VAT)! Xăng: 36%, Bia: 46%. Khi đọc số liệu thuế, luôn hỏi: "Số tuyệt đối hay tỷ lệ?" — vì chúng kể hai câu chuyện hoàn toàn khác nhau.',
          correctedChart: {
            type: 'bar',
            title: 'Tỷ lệ thuế ẩn (% giá sản phẩm) — Bức tranh thực',
            data: [
              { label: 'Thuốc lá', value: 55, displayValue: '55%' },
              { label: 'Bia', value: 46, displayValue: '46%' },
              { label: 'Xăng', value: 36, displayValue: '36%' },
              { label: 'Cà phê', value: 9.1, displayValue: '9.1%' },
              { label: 'Cơm trưa', value: 9.1, displayValue: '9.1%' },
              { label: 'Hóa đơn điện', value: 9.1, displayValue: '9.1%' },
            ],
            yAxisStart: 0,
          },
        },
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Thuế có chủ đích (Pigouvian tax)',
        text: 'Một số thuế cao KHÔNG nhằm tăng ngân sách — mà nhằm thay đổi hành vi:\n• Thuế thuốc lá 75%: giảm hút thuốc → bảo vệ sức khỏe\n• Thuế BVMT trên xăng: giảm ô nhiễm → bảo vệ môi trường\n• Thuế bia 65%: giảm lạm dụng rượu bia\n\nĐây gọi là thuế Pigouvian — đặt theo tên nhà kinh tế Arthur Pigou.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Tại sao nhận diện thuế hàng ngày quan trọng?',
        paragraphs: [
          'Khi bạn không biết mình đang đóng thuế, bạn không có động lực giám sát cách tiền thuế được sử dụng. "Tôi có đóng thuế đâu" là câu nói phổ biến — nhưng hoàn toàn sai.',
          'Mỗi người Việt Nam, dù là sinh viên hay giám đốc, đều đóng thuế gián tiếp mỗi ngày. Nhận ra điều này là bước đầu tiên để thực hiện quyền công dân: yêu cầu minh bạch, giám sát ngân sách, và tham gia vào quyết định chính sách.',
        ],
      },
      {
        type: 'hot-cold-guess',
        title: 'Đoán xem: Tổng thuế gián tiếp bạn đóng mỗi tháng?',
        question: 'Một sinh viên chi tiêu khoảng 5 triệu/tháng đóng tổng cộng bao nhiêu nghìn đồng thuế gián tiếp?',
        answer: 500,
        unit: 'nghìn đồng',
        tolerance: 20,
        hints: [
          'VAT trung bình chiếm khoảng 8-10% chi tiêu.',
          'Nếu chi 5 triệu/tháng, VAT khoảng 400-500 nghìn.',
          'Cộng thêm thuế TTĐB nếu uống bia hoặc đổ xăng.',
        ],
        context: 'Với chi tiêu 5 triệu/tháng, thuế gián tiếp ước tính khoảng 450-600 nghìn đồng — tức khoảng 10-12% tổng chi tiêu. Mỗi năm, bạn đóng khoảng 5-7 triệu đồng thuế gián tiếp mà có thể không hề nhận ra. Bạn KHÔNG phải "người không đóng thuế" — bạn đóng thuế mỗi ngày!',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Thuế ẩn trong đời sống',
        description: 'Các loại thuế gián tiếp phổ biến tại Việt Nam và cách nhận diện',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'VAT — Thuế phổ biến nhất',
              paragraphs: [
                'Thuế giá trị gia tăng (VAT) áp dụng cho hầu hết hàng hóa và dịch vụ. Mức phổ thông: 10% (có thể giảm 8% theo chính sách). Một số hàng thiết yếu (gạo, rau quả tươi, giáo dục, y tế) được miễn hoặc áp thuế 5%.',
                'VAT được tính vào giá bán — bạn không thấy nó trên hóa đơn thông thường (chỉ thấy trên hóa đơn VAT/hóa đơn đỏ).',
              ],
            },
            {
              heading: 'Thuế tiêu thụ đặc biệt — Thuế "hạn chế"',
              paragraphs: [
                'Áp dụng cho hàng hóa Nhà nước muốn hạn chế tiêu dùng: rượu (35-65%), bia (65%), thuốc lá (75%), ô tô (15-150% tùy dung tích). Mục đích: giảm tác hại sức khỏe và môi trường, đồng thời tăng ngân sách.',
              ],
            },
          ],
          relatedConcepts: ['VAT', 'Thuế tiêu thụ đặc biệt', 'Pigouvian tax'],
          furtherReading: [
            'https://vi.wikipedia.org/wiki/Thu%E1%BA%BF_ti%C3%AAu_th%E1%BB%A5_%C4%91%E1%BA%B7c_bi%E1%BB%87t',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Thuế ẩn trong MỌI giao dịch: cà phê, xăng, điện, bia, thuốc lá\n✓ Xăng chứa 3 loại thuế (VAT + TTĐB + BVMT), chiếm ~36% giá\n✓ Thuốc lá có tỷ lệ thuế cao nhất (~55%) — đây là thuế có chủ đích\n✓ Sinh viên đóng ~500k thuế gián tiếp/tháng — "không đóng thuế" là sai\n✓ Nhận diện thuế là bước đầu thực hiện quyền công dân',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học tiếp theo',
        paragraphs: [
          'Bạn đã biết thuế ẩn ở đâu trong cuộc sống hàng ngày. Bài học tiếp theo sẽ trả lời câu hỏi thực tế: bạn có cần mã số thuế không? Khi nào cần kê khai? Và thay đổi từ 1/7/2025 là gì?',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 10: Mã số thuế & Thuế TNCN
  // Source: MassEdu Module B (Tax ID & Personal Income Tax)
  // ────────────────────────────────────────────────────────────────
  'thuev2-10': {
    title: 'Mã số thuế & Thuế TNCN',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Từ ngày 1/7/2025, một thay đổi lớn: số CCCD 12 chữ số của bạn sẽ trở thành mã số thuế. Bạn không cần đăng ký mã số thuế riêng nữa!',
          'Nhưng có mã số thuế không có nghĩa là bạn phải nộp thuế. Bài học này giải đáp: ai cần kê khai thuế TNCN? Ngưỡng thu nhập bao nhiêu? Và nếu bạn là sinh viên làm thêm, bạn có cần lo không?',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Với mức thu nhập của bạn hiện tại, bạn có cần kê khai và nộp thuế thu nhập cá nhân không?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Từ 1/7/2025, bạn cần làm gì để có mã số thuế?',
        options: [
          { id: 'a', text: 'Đăng ký tại cơ quan thuế với hồ sơ phức tạp', isCorrect: false },
          { id: 'b', text: 'Không cần làm gì — số CCCD 12 chữ số tự động là mã số thuế', isCorrect: true },
          { id: 'c', text: 'Chỉ cần đăng ký online trên website thuế', isCorrect: false },
          { id: 'd', text: 'Mã số thuế chỉ dành cho doanh nghiệp, cá nhân không cần', isCorrect: false },
        ],
        explanation: 'Từ 1/7/2025, bạn không cần "đăng ký mã số thuế" riêng nữa! Số căn cước công dân (CCCD) 12 chữ số sẽ tự động được sử dụng làm mã số thuế cá nhân. Đơn giản hóa đáng kể cho cả công dân và cơ quan thuế.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Ai cần kê khai thuế TNCN?',
        paragraphs: [
          'Có mã số thuế ≠ phải nộp thuế. Nghĩa vụ kê khai phụ thuộc vào loại thu nhập và mức thu nhập:',
          'Người làm công ăn lương: Chỉ cần kê khai khi thu nhập vượt ~11 triệu đồng/tháng (sau khi trừ bảo hiểm bắt buộc và giảm trừ gia cảnh). Nếu lương dưới ngưỡng → không cần kê khai, công ty đã khấu trừ thuế tại nguồn (thường là 0 đồng).',
          'Người tự do / kinh doanh nhỏ (freelancer, bán hàng online): Hiện tại miễn kê khai nếu doanh thu dưới 100 triệu đồng/năm. Từ 1/1/2026, ngưỡng này tăng lên 200 triệu đồng/năm.',
          'Ví dụ: Tép — sinh viên năm 3, thu nhập từ dạy tiếng Anh (2 triệu/tháng), thiết kế đồ họa freelance (1.5 triệu/tháng), bán hàng online (500k/tháng). Tổng: ~4 triệu/tháng = ~48 triệu/năm. Dưới ngưỡng 100 triệu → KHÔNG cần kê khai thuế. Chỉ cần cung cấp số CCCD khi khách hàng yêu cầu.',
        ],
      },
      {
        type: 'decision-tree',
        title: 'Bạn có cần kê khai thuế TNCN không?',
        scenario: 'Trả lời các câu hỏi để xác định nghĩa vụ thuế TNCN của bạn.',
        role: 'Người nộp thuế',
        nodes: [
          {
            id: 'start',
            text: 'Bạn có thu nhập từ đâu?',
            choices: [
              { id: 'salary', text: 'Lương từ công ty (có hợp đồng lao động)', nextNodeId: 'salary-check' },
              { id: 'freelance', text: 'Freelance / Kinh doanh nhỏ / Bán hàng online', nextNodeId: 'freelance-check' },
              { id: 'both', text: 'Cả hai (vừa lương vừa freelance)', nextNodeId: 'both-info' },
            ],
          },
          {
            id: 'salary-check',
            text: 'Thu nhập trước thuế (lương gross) mỗi tháng là bao nhiêu?',
            choices: [
              { id: 'under11', text: 'Dưới 11 triệu/tháng', nextNodeId: 'no-tax', consequence: 'Thu nhập dưới mức giảm trừ gia cảnh' },
              { id: 'over11', text: 'Trên 11 triệu/tháng', nextNodeId: 'salary-yes', consequence: 'Có thể phát sinh thuế TNCN' },
            ],
          },
          {
            id: 'freelance-check',
            text: 'Tổng doanh thu cả năm là bao nhiêu?',
            choices: [
              { id: 'under100', text: 'Dưới 100 triệu/năm', nextNodeId: 'no-tax-freelance' },
              { id: 'over100', text: 'Trên 100 triệu/năm', nextNodeId: 'freelance-yes' },
            ],
          },
          {
            id: 'no-tax',
            text: 'KHÔNG cần kê khai thuế TNCN.',
            choices: [],
            isEnding: true,
            endingType: 'good',
            endingSummary: 'Thu nhập dưới ngưỡng giảm trừ gia cảnh (11 triệu/tháng). Công ty đã khấu trừ thuế tại nguồn (0 đồng). Bạn không có nghĩa vụ kê khai thêm.',
          },
          {
            id: 'salary-yes',
            text: 'CÓ nghĩa vụ kê khai thuế TNCN.',
            choices: [],
            isEnding: true,
            endingType: 'neutral',
            endingSummary: 'Công ty sẽ khấu trừ thuế TNCN hàng tháng từ lương. Cuối năm, bạn cần quyết toán thuế — có thể được hoàn thuế nếu đã đóng thừa. Bài học tiếp theo sẽ hướng dẫn cách tính chi tiết.',
          },
          {
            id: 'no-tax-freelance',
            text: 'KHÔNG cần kê khai thuế TNCN.',
            choices: [],
            isEnding: true,
            endingType: 'good',
            endingSummary: 'Doanh thu dưới 100 triệu/năm (từ 2026: 200 triệu). Bạn không cần đăng ký kinh doanh và không cần kê khai thuế. Chỉ cần cung cấp số CCCD (= mã số thuế) khi khách hàng yêu cầu.',
          },
          {
            id: 'freelance-yes',
            text: 'CẦN đăng ký kinh doanh và kê khai thuế.',
            choices: [],
            isEnding: true,
            endingType: 'neutral',
            endingSummary: 'Doanh thu trên 100 triệu/năm: cần đăng ký kinh doanh cá thể, kê khai thuế GTGT và TNCN. Liên hệ cơ quan thuế quận/huyện trong vòng 10 ngày kể từ khi bắt đầu kinh doanh.',
          },
          {
            id: 'both-info',
            text: 'Bạn cần xét RIÊNG từng nguồn thu nhập.',
            choices: [
              { id: 'check-salary', text: 'Kiểm tra phần lương', nextNodeId: 'salary-check' },
              { id: 'check-freelance', text: 'Kiểm tra phần freelance', nextNodeId: 'freelance-check' },
            ],
          },
        ],
        startNodeId: 'start',
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Mốc quan trọng cần nhớ',
        text: '• 1/7/2025: CCCD 12 chữ số = Mã số thuế cá nhân\n• Lương > 11 triệu/tháng (sau giảm trừ): phải kê khai thuế TNCN\n• Freelance < 100 triệu/năm: miễn kê khai (từ 2026: < 200 triệu)\n• Freelance > ngưỡng: đăng ký kinh doanh trong 10 ngày',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Ví dụ thực tế: Sinh viên làm thêm',
        paragraphs: [
          'Tép — sinh viên năm 3 Marketing tại TP.HCM — có thu nhập từ nhiều nguồn:',
          '• Dạy tiếng Anh: ~2 triệu/tháng\n• Thiết kế đồ họa freelance: ~1.5 triệu/tháng\n• Bán hàng online (quần áo secondhand): ~500k/tháng',
          'Tổng thu nhập: ~4 triệu/tháng = ~48 triệu/năm. Dưới ngưỡng 100 triệu/năm → KHÔNG cần kê khai thuế.',
          'Khi khách hàng (cửa hàng thuê thiết kế) yêu cầu mã số thuế, Tép chỉ cần cung cấp số CCCD. Không cần đăng ký gì thêm.',
          'Nhưng nếu Tép phát triển và thu nhập tăng lên 120 triệu/năm? Lúc đó cần đăng ký kinh doanh cá thể và bắt đầu kê khai thuế.',
        ],
      },
      {
        type: 'timeline-sorter',
        title: 'Các mốc thay đổi luật thuế TNCN tại Việt Nam',
        instruction: 'Sắp xếp các sự kiện theo thứ tự thời gian.',
        events: [
          { id: 'e1', title: 'Luật Thuế TNCN đầu tiên', date: '2007', description: 'Quốc hội ban hành Luật Thuế TNCN, có hiệu lực từ 1/1/2009. Thay thế Pháp lệnh Thuế thu nhập đối với người có thu nhập cao.', year: 2007 },
          { id: 'e2', title: 'Sửa đổi giảm trừ gia cảnh', date: '2013', description: 'Nâng mức giảm trừ bản thân từ 4 triệu lên 9 triệu/tháng. Giảm trừ người phụ thuộc từ 1.6 triệu lên 3.6 triệu.', year: 2013 },
          { id: 'e3', title: 'Tăng giảm trừ gia cảnh lần 2', date: '2020', description: 'Nâng giảm trừ bản thân lên 11 triệu/tháng, người phụ thuộc lên 4.4 triệu/tháng. Áp dụng từ kỳ tính thuế 2020.', year: 2020 },
          { id: 'e4', title: 'CCCD = Mã số thuế', date: '2025', description: 'Từ 1/7/2025, số CCCD 12 chữ số tự động là mã số thuế cá nhân. Không cần đăng ký riêng.', year: 2025 },
          { id: 'e5', title: 'Tăng ngưỡng freelance', date: '2026', description: 'Ngưỡng doanh thu miễn kê khai cho cá nhân kinh doanh tăng từ 100 triệu lên 200 triệu/năm.', year: 2026 },
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Mã số thuế cá nhân tại Việt Nam',
        description: 'Hướng dẫn về mã số thuế, đăng ký, và nghĩa vụ kê khai',
        category: 'Kinh tế học',
        estimatedReadTime: '4 phút',
        documentContent: {
          sections: [
            {
              heading: 'Thay đổi từ 1/7/2025',
              paragraphs: [
                'Trước 1/7/2025: cá nhân phải đăng ký mã số thuế 10 chữ số tại cơ quan thuế. Quy trình phức tạp, nhiều giấy tờ.',
                'Từ 1/7/2025: số CCCD 12 chữ số tự động là mã số thuế. Mục tiêu: đơn giản hóa, giảm thủ tục hành chính, tích hợp dữ liệu quốc gia.',
              ],
            },
            {
              heading: 'Ngưỡng kê khai thuế TNCN',
              paragraphs: [
                'Người làm công: Thu nhập chịu thuế = Tổng lương - Bảo hiểm bắt buộc - Giảm trừ gia cảnh (11 triệu bản thân + 4.4 triệu/người phụ thuộc). Nếu thu nhập chịu thuế > 0 → phải kê khai.',
                'Cá nhân kinh doanh: Doanh thu < 100 triệu/năm (200 triệu từ 2026) → miễn kê khai. Vượt ngưỡng → đăng ký kinh doanh trong 10 ngày.',
              ],
            },
          ],
          relatedConcepts: ['CCCD', 'Giảm trừ gia cảnh', 'Thuế suất lũy tiến'],
          furtherReading: [
            'https://vi.wikipedia.org/wiki/M%C3%A3_s%E1%BB%91_thu%E1%BA%BF',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Từ 1/7/2025: CCCD = Mã số thuế (không cần đăng ký riêng)\n✓ Lương > 11 triệu/tháng: phải kê khai thuế TNCN\n✓ Freelance < 100 triệu/năm: miễn kê khai (200 triệu từ 2026)\n✓ Sinh viên làm thêm dưới ngưỡng: chỉ cần cung cấp CCCD\n✓ Vượt ngưỡng: đăng ký kinh doanh trong 10 ngày',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Tổng kết — Và bài học cuối cùng',
        paragraphs: [
          'Bạn đã biết khi nào cần kê khai thuế. Bài học cuối cùng sẽ giải đáp câu hỏi thực tế nhất: với mức lương của bạn, thuế TNCN là bao nhiêu? Và thực nhận bao nhiêu? Hãy cùng tính!',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 11: Tính thuế TNCN từ lương
  // Source: MassEdu Concept (Salary Tax Calculation)
  // ────────────────────────────────────────────────────────────────
  'thuev2-11': {
    title: 'Tính thuế TNCN từ lương',
    blocks: [
      // ── MỞ ──
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Đây là bài học cuối cùng — và cũng thực tế nhất. Bạn sẽ học cách tính chính xác từ lương gross (trước thuế) đến số tiền thực nhận mỗi tháng.',
          'Nhiều người sợ "biểu thuế lũy tiến 7 bậc" vì nghĩ lương tăng sẽ bị đánh thuế nặng. Thực tế, hệ thống này được thiết kế để công bằng hơn bạn nghĩ. Hãy cùng tính và bạn sẽ hiểu.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Câu hỏi trung tâm',
        text: 'Với lương 13 triệu/tháng, bạn thực nhận bao nhiêu? Và thuế TNCN chiếm bao nhiêu phần trăm?',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Nếu lương bạn tăng từ 20 triệu lên 21 triệu/tháng, phần 1 triệu tăng thêm bị đánh thuế bao nhiêu?',
        options: [
          { id: 'a', text: '35% — vì lương cao nằm ở bậc thuế cao nhất', isCorrect: false },
          { id: 'b', text: 'Chỉ phần 1 triệu tăng thêm bị đánh thuế ở bậc tương ứng (có thể 15-20%)', isCorrect: true },
          { id: 'c', text: 'Toàn bộ 21 triệu bị đánh thuế suất mới cao hơn', isCorrect: false },
          { id: 'd', text: '0% — vì mức tăng quá nhỏ', isCorrect: false },
        ],
        explanation: 'Đây là hiểu lầm phổ biến nhất! Thuế lũy tiến KHÔNG đánh thuế suất cao lên TOÀN BỘ thu nhập. Mỗi bậc thuế chỉ áp dụng cho PHẦN thu nhập vượt quá ngưỡng trước đó. Nếu bạn vào bậc 20%, chỉ phần thu nhập ở bậc đó bị đánh 20% — phần dưới vẫn chỉ bị 5% và 10%.',
      },
      // ── THÂN ──
      {
        type: 'text',
        title: 'Bước 1 — Khấu trừ bảo hiểm bắt buộc (10.5%)',
        paragraphs: [
          'Trước khi tính thuế, lương gross của bạn bị khấu trừ 3 khoản bảo hiểm bắt buộc:',
          '• Bảo hiểm xã hội (BHXH): 8% lương\n• Bảo hiểm y tế (BHYT): 1.5% lương\n• Bảo hiểm thất nghiệp (BHTN): 1% lương',
          'Tổng: 10.5% lương bị khấu trừ cho bảo hiểm. Ví dụ: lương 13 triệu → khấu trừ 1.365 triệu.',
          'Lương sau bảo hiểm: 13 - 1.365 = 11.635 triệu.',
        ],
      },
      {
        type: 'calculator',
        title: 'Máy tính thuế TNCN',
        description: 'Nhập lương gross hàng tháng để tính thuế TNCN và lương thực nhận.',
        calculatorType: 'tax',
        inputs: [
          { id: 'income', label: 'Lương gross (triệu VNĐ/tháng)', type: 'number', unit: 'triệu', defaultValue: 13, min: 0, max: 200, step: 1 },
          { id: 'dependents', label: 'Số người phụ thuộc', type: 'number', unit: 'người', defaultValue: 0, min: 0, max: 10, step: 1 },
        ],
        formula: 'income * 0.895 - 11 - dependents * 4.4',
        outputs: [
          { id: 'insurance', label: 'Khấu trừ bảo hiểm (10.5%)', formula: 'income * 0.105', unit: 'triệu' },
          { id: 'afterInsurance', label: 'Sau bảo hiểm', formula: 'income * 0.895', unit: 'triệu' },
          { id: 'deduction', label: 'Giảm trừ gia cảnh', formula: '11 + dependents * 4.4', unit: 'triệu' },
          { id: 'taxableIncome', label: 'Thu nhập chịu thuế', formula: 'Math.max(0, income * 0.895 - 11 - dependents * 4.4)', unit: 'triệu' },
          { id: 'tax', label: 'Thuế TNCN (ước tính bậc 1)', formula: 'Math.max(0, Math.min(5, income * 0.895 - 11 - dependents * 4.4) * 0.05 + Math.max(0, Math.min(5, income * 0.895 - 16 - dependents * 4.4)) * 0.1 + Math.max(0, Math.min(8, income * 0.895 - 21 - dependents * 4.4)) * 0.15)', unit: 'triệu', highlight: true },
          { id: 'netIncome', label: 'Lương thực nhận (ước tính)', formula: 'income - income * 0.105 - Math.max(0, Math.min(5, income * 0.895 - 11 - dependents * 4.4) * 0.05 + Math.max(0, Math.min(5, income * 0.895 - 16 - dependents * 4.4)) * 0.1 + Math.max(0, Math.min(8, income * 0.895 - 21 - dependents * 4.4)) * 0.15)', unit: 'triệu' },
        ],
        presets: [
          { label: 'Mới đi làm (13tr)', values: { income: 13, dependents: 0 } },
          { label: 'Nhân viên (20tr)', values: { income: 20, dependents: 0 } },
          { label: 'Gia đình (30tr, 1 con)', values: { income: 30, dependents: 1 } },
          { label: 'Quản lý (50tr, 2 con)', values: { income: 50, dependents: 2 } },
        ],
        insight: 'Mỗi người phụ thuộc giúp giảm 4.4 triệu VNĐ thu nhập chịu thuế mỗi tháng. Đây là cách Nhà nước hỗ trợ gia đình — nhưng cũng có thể tạo ra ưu đãi cho gia đình đông con.',
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Biểu thuế lũy tiến 7 bậc — Cách hoạt động',
        text: 'Mỗi bậc chỉ áp dụng cho PHẦN thu nhập ở bậc đó:\n\n• Bậc 1: 0 → 5 triệu: thuế 5%\n• Bậc 2: 5 → 10 triệu: thuế 10%\n• Bậc 3: 10 → 18 triệu: thuế 15%\n• Bậc 4: 18 → 32 triệu: thuế 20%\n• Bậc 5: 32 → 52 triệu: thuế 25%\n• Bậc 6: 52 → 80 triệu: thuế 30%\n• Bậc 7: trên 80 triệu: thuế 35%\n\nVí dụ: thu nhập chịu thuế 12 triệu → 5 triệu × 5% + 5 triệu × 10% + 2 triệu × 15% = 250k + 500k + 300k = 1.05 triệu thuế.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Ví dụ tính thuế chi tiết: Lương 13 triệu, không người phụ thuộc',
        paragraphs: [
          'Bước 1 — Khấu trừ bảo hiểm: 13 × 10.5% = 1.365 triệu',
          'Bước 2 — Sau bảo hiểm: 13 - 1.365 = 11.635 triệu',
          'Bước 3 — Giảm trừ gia cảnh: 11 triệu (bản thân) + 0 (không người phụ thuộc) = 11 triệu',
          'Bước 4 — Thu nhập chịu thuế: 11.635 - 11 = 0.635 triệu',
          'Bước 5 — Tính thuế: 0.635 triệu × 5% (bậc 1) = 31.750 đồng',
          'Kết quả: Lương thực nhận = 13 - 1.365 - 0.032 = 11.603 triệu đồng. Bạn giữ lại 89.3% lương gross!',
          'Thuế TNCN chỉ chiếm 0.24% lương — con số rất nhỏ. Phần lớn khấu trừ (10.5%) là bảo hiểm — không phải mất mà là "để dành" cho hưu trí, y tế, và thất nghiệp.',
        ],
      },
      {
        type: 'stat-trick',
        title: 'Biểu đồ này có vấn đề gì?',
        instruction: 'Nhìn biểu đồ so sánh thuế suất. Liệu sự khác biệt có lớn như biểu đồ thể hiện?',
        chart: {
          type: 'bar',
          title: 'Thuế TNCN thực tế (% lương gross)',
          data: [
            { label: 'Lương 13tr', value: 0.24, displayValue: '0.24%' },
            { label: 'Lương 20tr', value: 2.1, displayValue: '2.1%' },
            { label: 'Lương 30tr', value: 4.8, displayValue: '4.8%' },
            { label: 'Lương 50tr', value: 9.5, displayValue: '9.5%' },
          ],
          yAxisStart: 0,
        },
        question: 'Biểu đồ này cho thấy điều gì về thuế TNCN thực tế?',
        options: [
          { id: 'a', text: 'Thuế TNCN thực tế thấp hơn nhiều so với thuế suất biên (35% tối đa)', isCorrect: true },
          { id: 'b', text: 'Người lương 50tr đóng thuế gấp 40 lần người lương 13tr', isCorrect: false },
          { id: 'c', text: 'Thuế TNCN không đáng kể với mọi mức lương', isCorrect: false },
          { id: 'd', text: 'Biểu đồ gây hiểu nhầm vì trục Y bắt đầu từ 0', isCorrect: false },
        ],
        reveal: {
          explanation: 'Thuế suất BIÊN cao nhất là 35%, nhưng thuế suất THỰC TẾ (% lương gross) thấp hơn nhiều — chỉ 0.24% ở mức 13tr và 9.5% ở mức 50tr. Lý do: giảm trừ gia cảnh + hệ thống lũy tiến (mỗi bậc chỉ áp dụng cho phần thu nhập ở bậc đó). Đừng sợ "bậc thuế 35%" — nó chỉ áp dụng cho phần thu nhập TRÊN 80 triệu.',
          correctedChart: {
            type: 'bar',
            title: 'So sánh: Thuế suất biên vs Thuế suất thực tế',
            data: [
              { label: 'Thuế suất biên tối đa', value: 35, displayValue: '35%' },
              { label: 'Thực tế (lương 50tr)', value: 9.5, displayValue: '9.5%' },
              { label: 'Thực tế (lương 30tr)', value: 4.8, displayValue: '4.8%' },
              { label: 'Thực tế (lương 13tr)', value: 0.24, displayValue: '0.24%' },
            ],
            yAxisStart: 0,
          },
        },
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Biểu thuế lũy tiến Việt Nam',
        description: 'Chi tiết 7 bậc thuế TNCN và cách tính từng bậc',
        category: 'Kinh tế học',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Cách hoạt động của thuế lũy tiến',
              paragraphs: [
                'Thuế lũy tiến có nghĩa: mỗi bậc thuế suất chỉ áp dụng cho PHẦN thu nhập ở bậc đó, không phải toàn bộ thu nhập. Điều này ngăn tình trạng "lương tăng 1 triệu nhưng thực nhận giảm" — không bao giờ xảy ra với thuế lũy tiến.',
                'Ví dụ: thu nhập chịu thuế 12 triệu → Bậc 1: 5 triệu × 5% = 250k. Bậc 2: 5 triệu × 10% = 500k. Bậc 3: 2 triệu × 15% = 300k. Tổng thuế: 1.05 triệu. Thuế suất thực tế: 1.05/12 = 8.75% — thấp hơn nhiều so với thuế suất biên cao nhất (15%) ở bậc 3.',
              ],
            },
            {
              heading: 'Giảm trừ gia cảnh',
              paragraphs: [
                'Giảm trừ cho bản thân: 11 triệu/tháng (132 triệu/năm). Giảm trừ cho mỗi người phụ thuộc: 4.4 triệu/tháng (52.8 triệu/năm).',
                'Người phụ thuộc gồm: con dưới 18 tuổi, con trên 18 đang học, vợ/chồng không có thu nhập, cha mẹ già không có thu nhập. Cần đăng ký người phụ thuộc tại cơ quan thuế.',
              ],
            },
          ],
          relatedConcepts: ['Thuế suất biên', 'Thuế suất thực tế', 'Giảm trừ gia cảnh'],
          furtherReading: [
            'https://vi.wikipedia.org/wiki/Thu%E1%BA%BF_thu_nh%E1%BA%ADp_c%C3%A1_nh%C3%A2n',
          ],
        },
      },
      // ── KẾT ──
      {
        type: 'callout',
        icon: 'check',
        title: 'Bạn đã học được gì?',
        text: '✓ Bước tính: Lương gross → Trừ bảo hiểm (10.5%) → Trừ giảm trừ gia cảnh → Thu nhập chịu thuế → Áp biểu thuế 7 bậc\n✓ Bảo hiểm 10.5%: BHXH 8% + BHYT 1.5% + BHTN 1%\n✓ Giảm trừ: 11 triệu/bản thân + 4.4 triệu/người phụ thuộc\n✓ Thuế lũy tiến: mỗi bậc chỉ áp dụng cho PHẦN thu nhập ở bậc đó\n✓ Thuế suất thực tế THẤP HƠN NHIỀU so với thuế suất biên',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Chúc mừng — Bạn đã hoàn thành Thuế 101!',
        paragraphs: [
          'Từ câu hỏi "thuế là gì?" đến tự tính thuế TNCN — bạn đã đi một hành trình dài.',
          'Hãy nhớ 4 câu hỏi công dân: Ai gánh thuế? Có thay thế không? Tiền đi đâu? Ai giám sát? Với những kiến thức này, bạn không chỉ là người đóng thuế — bạn là công dân có hiểu biết, có quyền, và có trách nhiệm.',
          'Thuế không phải thứ để sợ hay ghét — nó là công cụ xây dựng xã hội. Và bạn, với tư cách công dân, có quyền yêu cầu công cụ đó được sử dụng đúng cách.',
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────
// Main script
// ─────────────────────────────────────────────
async function main() {
  console.log('=== Adding "Thuế 101 (ver2)" course ===\n');

  // 1. Find 'economics' category
  const category = await prisma.category.findUnique({ where: { slug: 'economics' } });
  if (!category) {
    console.error('❌ Category "economics" not found! Cannot add course.');
    return;
  }
  console.log(`Found category: ${category.name} (${category.id})\n`);

  // 2. Check for duplicate course
  const existing = await prisma.course.findUnique({ where: { slug: 'thue-101-v2' } });
  if (existing) {
    console.log('⚠️  Course "thue-101-v2" already exists! Skipping to avoid duplicates.');
    console.log('    Delete it manually first if you want to recreate it.');
    return;
  }

  // 3. Get sort order for new course
  const maxCourseSortOrder = await prisma.course.aggregate({
    where: { categoryId: category.id },
    _max: { sortOrder: true },
  });
  const courseSortOrder = (maxCourseSortOrder._max.sortOrder ?? -1) + 1;

  // 4. Create course
  const course = await prisma.course.create({
    data: {
      slug: THUE101V2_COURSE.slug,
      name: THUE101V2_COURSE.name,
      description: THUE101V2_COURSE.description,
      icon: THUE101V2_COURSE.icon,
      isNew: THUE101V2_COURSE.isNew,
      isActive: true,
      categoryId: category.id,
      sortOrder: courseSortOrder,
    },
  });
  console.log(`✅ Created course: ${course.name} (slug: ${course.slug})\n`);

  // 5. Create levels and lessons
  for (let levelIndex = 0; levelIndex < THUE101V2_COURSE.levels.length; levelIndex++) {
    const lvlDef = THUE101V2_COURSE.levels[levelIndex];
    const level = await prisma.level.create({
      data: {
        name: lvlDef.name,
        courseId: course.id,
        sortOrder: levelIndex,
      },
    });
    console.log(`  📁 Level ${levelIndex + 1}: ${level.name}`);

    for (let lessonIndex = 0; lessonIndex < lvlDef.lessons.length; lessonIndex++) {
      const lesDef = lvlDef.lessons[lessonIndex];
      const lesson = await prisma.lesson.create({
        data: {
          slug: lesDef.id,
          name: lesDef.name,
          levelId: level.id,
          courseId: level.courseId,
          sortOrder: lessonIndex,
          isActive: true,
        },
      });
      console.log(`    📄 Lesson: ${lesson.name} (slug: ${lesson.slug})`);

      // Add content
      const content = lessonContents[lesDef.id];
      if (content) {
        await prisma.lessonContent.create({
          data: {
            lessonId: lesson.id,
            title: content.title,
            blocks: content.blocks as any,
          },
        });
        console.log(`      ✍️  Content added (${content.blocks.length} blocks)`);
      }
    }
  }

  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Thuế 101 (ver2) added successfully!');
  console.log('='.repeat(60));

  const lessonCount = await prisma.lesson.count({
    where: { level: { courseId: course.id } },
  });
  const contentCount = await prisma.lessonContent.count({
    where: { lesson: { level: { courseId: course.id } } },
  });

  console.log(`  Total lessons created : ${lessonCount}`);
  console.log(`  Lessons with content  : ${contentCount}`);
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
