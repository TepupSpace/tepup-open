/**
 * Script to ADD "Logic 101 — Não Bạn Đang Lừa Bạn" course to the database.
 *
 * Thiết kế: tepup/docs/Logic-101-course/logic-course.md
 * Guideline: docs/course-content-guideline.md (Mở-Thân-Kết, 2 interactive blocks/bài)
 *
 * PHASED APPROACH:
 * - Phase 1 (this run): Course structure + Level 1 content (4 lessons)
 * - Phase 2: Level 2 content (4 lessons — ngụy biện phổ biến)
 * - Phase 3: Level 3 content (4 lessons — media literacy)
 * - Phase 4: Level 4 content (4 lessons — civic reasoning)
 * - Phase 5: Level 5 content (4 lessons — debate & synthesis)
 *
 * Run with: npx tsx scripts/add-logic-101-course.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// Course structure definition
// ─────────────────────────────────────────────
const LOGIC101_COURSE = {
  slug: 'logic-101',
  name: 'Logic 101 — Não Bạn Đang Lừa Bạn',
  description:
    'Khoá nền tảng về tư duy phản biện: nhận diện bias, ngụy biện, và cách đọc thông tin một cách tỉnh táo trong thời đại quá tải nội dung.',
  icon: 'brain',
  isNew: true,
  levels: [
    {
      name: 'Não bạn bị lừa — Nhận diện bias cá nhân',
      lessons: [
        { id: 'logic101-1', name: 'Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy' },
        { id: 'logic101-2', name: 'Ngụy biện là gì? — Tiền đề, kết luận, valid & sound' },
        { id: 'logic101-3', name: 'Correlation ≠ Causation — Cùng xảy ra không có nghĩa là nhân quả' },
        { id: 'logic101-4', name: 'Thao túng số liệu — Khi biểu đồ cố tình lừa mắt bạn' },
      ],
    },
    {
      name: 'Ngụy biện quanh bạn — 4 loại phổ biến nhất',
      lessons: [
        { id: 'logic101-5', name: 'Ad hominem — Tấn công người, không tấn công lập luận' },
        { id: 'logic101-6', name: 'Strawman — Bẻ lái để dễ phản biện' },
        { id: 'logic101-7', name: 'Appeal to authority & popularity — "Chuyên gia nói" và "ai cũng tin"' },
        { id: 'logic101-8', name: 'Slippery slope & False dilemma — Kiểm soát lựa chọn của bạn' },
      ],
    },
    {
      name: 'Truyền thông lừa bạn — Media literacy cơ bản',
      lessons: [
        { id: 'logic101-9', name: 'Tin giả — Tại sao nó lan nhanh gấp 6 lần tin thật' },
        { id: 'logic101-10', name: 'Clickbait & Framing — Cùng sự kiện, 10 câu chuyện khác nhau' },
        { id: 'logic101-11', name: 'CRAAP test — Đánh giá nguồn trong 5 câu hỏi' },
        { id: 'logic101-12', name: 'Echo chamber — Thuật toán đang quyết định bạn thấy gì' },
      ],
    },
    {
      name: 'Chính trị dùng chiêu — Rhetoric & civic reasoning',
      lessons: [
        { id: 'logic101-13', name: 'Propaganda — 7 kỹ thuật cổ điển vẫn hoạt động đến hôm nay' },
        { id: 'logic101-14', name: 'Đánh giá chính sách — 5 câu hỏi để không bị lừa' },
        { id: 'logic101-15', name: 'Whataboutism — Khi "còn nước khác thì sao?" trở thành bẫy' },
        { id: 'logic101-16', name: 'Quyền con người & logic — Khi không có đáp án đúng' },
      ],
    },
    {
      name: 'Bạn làm gì? — Debate, steelman & hành động',
      lessons: [
        { id: 'logic101-17', name: 'Debate có văn hoá — Tranh luận mà không ghét nhau' },
        { id: 'logic101-18', name: 'Steelman — Kỹ năng cao nhất: làm cho đối phương mạnh hơn' },
        { id: 'logic101-19', name: 'Intellectual humility — "Tôi có thể sai"' },
        { id: 'logic101-20', name: 'Tổng kết — Bạn sẽ làm gì với tất cả những thứ này?' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// Level 1 lesson content
// (Level 2-5 sẽ được thêm trong các phiên tiếp theo)
// ─────────────────────────────────────────────
const lessonContents: Record<string, { title: string; blocks: any[] }> = {
  // ────────────────────────────────────────────────────────────────
  // LESSON 1: Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy
  // ────────────────────────────────────────────────────────────────
  'logic101-1': {
    title: 'Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy',
    blocks: [
      {
        type: 'question',
        question:
          'Khi bạn gặp một thông tin MÂU THUẪN với niềm tin bạn đang có, phản ứng tự nhiên của não bạn thường là gì?',
        options: [
          { id: 'a', text: 'Cập nhật niềm tin dựa trên bằng chứng mới', isCorrect: false },
          { id: 'b', text: 'Bỏ qua, hoặc tự thuyết phục rằng thông tin đó sai', isCorrect: true },
          { id: 'c', text: 'Chia sẻ ngay với người khác để cùng bàn', isCorrect: false },
          { id: 'd', text: 'Tìm thêm 5 nguồn khác để xác minh', isCorrect: false },
        ],
        explanation:
          'Hầu hết chúng ta nghĩ mình sẽ chọn A hoặc D vì đó là cái ta MUỐN mình làm. Nhưng nghiên cứu tâm lý học (Kahneman, Nickerson) cho thấy phản ứng tự nhiên của não là B — bỏ qua hoặc tự thuyết phục rằng thông tin mới sai. Hiện tượng này có tên: confirmation bias. Trong bài này, chúng ta sẽ tìm hiểu tại sao não lại "tự lừa" như vậy, và điều đáng sợ: bạn càng thông minh, bạn càng giỏi tìm lý do để bỏ qua thông tin mâu thuẫn.',
      },
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Hãy thử tưởng tượng: bạn đang scroll Facebook và gặp một bài viết khẳng định điều bạn đã tin từ lâu. Bạn gật đầu, like, có khi còn share. Rồi bạn scroll tiếp — gặp một bài viết phản biện quan điểm đó. Bạn đọc lướt, thấy "vớ vẩn", và scroll qua.',
          'Nghe quen không? Đây không phải là vấn đề của "người khác" — đây là cách não bộ của MỌI người hoạt động. Ngay cả những nhà khoa học, giáo sư, người có IQ cao cũng bị lừa bởi chính não mình. Điều đáng sợ hơn: IQ càng cao, bạn càng giỏi biện minh cho niềm tin đã có.',
          'Trong bài học đầu tiên của Logic 101, chúng ta sẽ gặp "kẻ thù số 1" của tư duy phản biện: confirmation bias. Bạn sẽ học được: (1) confirmation bias là gì và tại sao nó tồn tại, (2) cách nhận diện nó khi nó xảy ra trong chính mình, và (3) 3 công cụ cụ thể để đối phó.',
        ],
      },
      {
        type: 'callout',
        icon: 'help-circle',
        title: 'Câu hỏi trung tâm của bài này',
        text: 'Tại sao não chúng ta lại có xu hướng chỉ nhìn thấy những gì mình muốn thấy — và điều đó đang khiến chúng ta sai lầm ở đâu mà không biết?',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Confirmation Bias là gì?',
        paragraphs: [
          'Confirmation bias (thiên kiến xác nhận) là xu hướng tìm kiếm, diễn giải, và ghi nhớ thông tin theo cách CỦNG CỐ những gì mình đã tin — đồng thời bỏ qua hoặc hạ thấp những thông tin mâu thuẫn.',
          'Nó hoạt động ở 3 cấp độ, thường cùng lúc: (1) Bạn tìm kiếm thông tin xác nhận niềm tin nhiều hơn là thông tin phản biện — ví dụ, bạn search Google với từ khoá có sẵn định kiến trong đó. (2) Khi bắt gặp thông tin trung tính, bạn diễn giải nó theo hướng có lợi cho niềm tin của mình. (3) Bạn nhớ rõ những lần niềm tin của mình "đúng" và quên đi những lần sai.',
          'Ví dụ rất thực tế ở Việt Nam: một cuộc tranh cãi gia đình về vaccine COVID. Người ủng hộ chỉ chia sẻ các bài về "vaccine hiệu quả 95%". Người phản đối chỉ chia sẻ các bài về "người bị phản ứng sau tiêm". Cả hai đều tin rằng mình "dựa trên sự thật" — và cả hai đều đang làm CÙNG một thứ: cherry-pick thông tin khớp với niềm tin có sẵn.',
        ],
      },
      {
        type: 'text',
        paragraphs: [
          'Nghiên cứu kinh điển của Peter Wason (1960) đưa ra quy luật đơn giản: dãy số 2-4-6 tuân theo một quy tắc nào đó. Hãy đoán quy tắc. Đa số người tham gia đưa ra giả thuyết "số chẵn tăng dần 2 đơn vị" và test bằng các dãy XÁC NHẬN giả thuyết đó (4-6-8, 10-12-14). Họ rất ít khi test bằng dãy PHẢN BIỆN (như 1-2-3, 5-10-20). Quy tắc thật chỉ là "3 số tăng dần" — đơn giản hơn nhiều, nhưng họ không tìm ra vì họ chỉ tìm cách xác nhận, không tìm cách phản biện.',
          'Đây là bản chất của confirmation bias: chúng ta không sai vì chúng ta ngu, chúng ta sai vì chúng ta chỉ đi tìm cái xác nhận mình đúng.',
        ],
      },
      {
        type: 'bias-detector',
        title: 'Phát hiện bias trong một bài viết về vaccine',
        instruction:
          'Đọc đoạn tin dưới đây — đây là một bài viết có thiên lệch rõ ràng. Click vào các cụm từ được highlight và chọn loại thiên lệch phù hợp. Mục tiêu: nhận ra cách confirmation bias được "nuôi dưỡng" bằng ngôn ngữ cụ thể.',
        article: {
          text: 'Ngày càng nhiều người lên tiếng phản đối vaccine mRNA — một loại công nghệ thử nghiệm chưa được kiểm chứng đầy đủ. Tất cả các chuyên gia y tế độc lập đều cảnh báo về tác dụng phụ lâu dài mà các hãng dược đang cố tình giấu nhẹm. Một khảo sát trên Facebook cho thấy 87% người dân không tin vào mũi tăng cường, con số áp đảo chứng minh sự thức tỉnh của cộng đồng.',
          source: 'Bài viết mẫu — dùng để phân tích bias',
        },
        segments: [
          {
            id: 's1',
            text: 'công nghệ thử nghiệm chưa được kiểm chứng đầy đủ',
            startIndex: 51,
            biasType: 'loaded',
            explanation:
              'Cụm "thử nghiệm" và "chưa kiểm chứng" là loaded language gán ý nghĩa tiêu cực. Vaccine mRNA đã qua thử nghiệm lâm sàng 3 giai đoạn và được hàng tỷ người sử dụng — đó không phải "thử nghiệm chưa kiểm chứng".',
          },
          {
            id: 's2',
            text: 'Tất cả các chuyên gia y tế độc lập',
            startIndex: 108,
            biasType: 'cherry-pick',
            explanation:
              'Từ "tất cả" là cherry-picking cực đoan. WHO, CDC, Bộ Y tế, và đa số hiệp hội y tế lớn đều ủng hộ vaccine. "Chuyên gia độc lập" là cách lọc ra nhóm nhỏ để tạo ảo giác đồng thuận.',
          },
          {
            id: 's3',
            text: 'cố tình giấu nhẹm',
            startIndex: 193,
            biasType: 'loaded',
            explanation:
              'Gán ý đồ xấu mà không có bằng chứng. Đây là pattern điển hình của confirmation bias: khi dữ liệu không ủng hộ niềm tin, người viết giả định có "âm mưu giấu nhẹm".',
          },
          {
            id: 's4',
            text: 'Một khảo sát trên Facebook cho thấy 87%',
            startIndex: 221,
            biasType: 'cherry-pick',
            explanation:
              'Khảo sát Facebook không đại diện cho dân số — chỉ người có định kiến sẵn mới tham gia. Đây là selection bias lồng vào confirmation bias: chọn mẫu khẳng định niềm tin sẵn có.',
          },
        ],
        biasOptions: [
          { id: 'emotional', label: 'Ngôn ngữ cảm xúc' },
          { id: 'cherry-pick', label: 'Chọn lọc thông tin' },
          { id: 'loaded', label: 'Ngôn từ gán ý' },
          { id: 'false-balance', label: 'Cân bằng giả tạo' },
        ],
      },
      {
        type: 'callout',
        icon: 'alert-triangle',
        title: 'Confirmation bias không chọn phe',
        text: 'Điều quan trọng nhất: confirmation bias KHÔNG chỉ xảy ra với "phe kia". Nó xảy ra với tất cả mọi người, kể cả bạn, kể cả tôi, kể cả người bạn cho là thông minh nhất. Một nghiên cứu của Dan Kahan (Yale) cho thấy: người có kỹ năng toán học tốt hơn lại BIAS NẶNG HƠN khi vấn đề động chạm niềm tin chính trị — vì họ giỏi tìm con số để biện minh. Nhận diện confirmation bias ở người khác thì dễ; nhận diện ở bản thân thì cực khó.',
        variant: 'warning',
      },
      {
        type: 'text',
        title: '3 công cụ đối phó với confirmation bias',
        paragraphs: [
          'Confirmation bias không thể bị "xoá" khỏi não — nó là đặc tính tiến hoá của bộ não con người. Nhưng có 3 kỹ thuật giúp bạn giảm tác động của nó trong các quyết định quan trọng.',
          '1. Steelman đối phương. Trước khi phản biện một quan điểm bạn không đồng ý, hãy trình bày lại quan điểm đó theo phiên bản MẠNH NHẤT có thể — tức là "steelman" (đối lập với strawman). Nếu bạn không thể trình bày quan điểm đối phương một cách mạnh mẽ, bạn chưa thực sự hiểu nó.',
          '2. Đi tìm disconfirming evidence. Thay vì tìm lý do mình đúng, hãy chủ động tìm lý do mình có thể sai. Hỏi: "Điều gì sẽ khiến tôi thay đổi quan điểm?" Nếu câu trả lời là "không gì cả" — bạn không đang suy nghĩ, bạn đang tin.',
          '3. Thử đổi góc nhìn. Tưởng tượng bạn là người ở vị trí khác — người đi làm, người nông dân, người trẻ, người già, chủ doanh nghiệp, công nhân. Sự kiện này trông thế nào từ góc đó? Bài tập "đổi góc nhìn" đánh trực tiếp vào cơ chế chọn lọc của confirmation bias.',
        ],
      },
      {
        type: 'perspective-switch',
        title: 'Đổi góc nhìn — Cấm xe máy trong trung tâm thành phố',
        event:
          'Thành phố A ra quyết định cấm xe máy chạy vào trung tâm từ 7h sáng đến 9h tối, áp dụng từ năm sau. Lý do: giảm ùn tắc và ô nhiễm không khí. Hãy đọc góc nhìn của 4 bên liên quan.',
        perspectives: [
          {
            id: 'commuter',
            role: 'Người đi làm bằng xe máy',
            icon: '🛵',
            narrative:
              'Xe máy là phương tiện duy nhất tôi đủ khả năng chi trả. Tôi ở ngoại ô, vào trung tâm đi làm 8 tiếng, lương 8 triệu/tháng. Nếu cấm, tôi phải đi bus — tăng thời gian đi lại từ 30 phút lên 1.5 tiếng mỗi chiều. Nghĩa là 2 tiếng thêm mỗi ngày, 10 tiếng mỗi tuần. Hoặc tôi phải chuyển việc, hoặc tôi phải chuyển nhà. Với tôi, chính sách này không phải "giảm ô nhiễm" — nó là "mất 10% cuộc đời tôi".',
          },
          {
            id: 'shop-owner',
            role: 'Chủ cửa hàng nhỏ ở trung tâm',
            icon: '🏪',
            narrative:
              'Khách của tôi là người chạy xe máy đến mua nhanh — nước uống, ổ bánh mì, linh kiện điện thoại. Nếu cấm xe máy, doanh thu của tôi sẽ giảm 40-60%. Tôi thuê mặt bằng 30 triệu/tháng, trả lương 3 nhân viên. Khi khách không đến, tôi đóng cửa, họ mất việc. Chính sách này không phải "cải thiện môi trường" — nó là "đóng cửa cửa hàng của tôi".',
          },
          {
            id: 'resident',
            role: 'Người dân sống trong trung tâm',
            icon: '🏠',
            narrative:
              'Tôi đã chịu đựng tiếng ồn xe máy và khói bụi 20 năm. Con tôi bị hen suyễn, bác sĩ nói một phần do ô nhiễm không khí. Mỗi sáng mở cửa sổ là một lớp bụi đen. Cấm xe máy nghĩa là con tôi có thể thở dễ hơn, tôi có thể đi bộ mà không bị hít khói. Chính sách này với tôi không phải "giảm ô nhiễm" — nó là "trả lại không khí cho tôi".',
          },
          {
            id: 'official',
            role: 'Cán bộ quản lý đô thị',
            icon: '🏛️',
            narrative:
              'Số liệu cho thấy: xe máy chiếm 85% phương tiện giao thông nhưng gây 60% ô nhiễm PM2.5 trong trung tâm. Ùn tắc khiến thành phố mất 3% GDP mỗi năm. Chúng tôi đã nghiên cứu 5 giải pháp, và cấm xe máy theo giờ là phương án cân bằng nhất — vẫn cho phép người dân vào trung tâm bằng phương tiện công cộng. Chúng tôi cũng biết nó gây đau, nhưng không có lựa chọn không đau.',
          },
        ],
        question: {
          text: 'Sau khi đọc cả 4 góc nhìn, nhận xét nào đúng nhất về confirmation bias trong trường hợp này?',
          options: [
            { id: 'a', text: 'Người đi xe máy và cán bộ đô thị đều "đúng" — mỗi người chỉ nhìn từ góc của mình, bỏ qua bằng chứng của phía khác', isCorrect: true },
            { id: 'b', text: 'Cán bộ đô thị là người duy nhất có góc nhìn khách quan vì có số liệu', isCorrect: false },
            { id: 'c', text: 'Người dân sống trong trung tâm hiển nhiên đúng vì họ chịu ảnh hưởng trực tiếp', isCorrect: false },
            { id: 'd', text: '4 góc nhìn mâu thuẫn, chứng tỏ không có sự thật khách quan nào trong vấn đề này', isCorrect: false },
          ],
          explanation:
            'Confirmation bias hoạt động ở cả 4 phía. Người đi xe máy không tự nguyện nghĩ đến ô nhiễm mà con người khác hít phải. Cán bộ có số liệu nhưng cũng bị bias bởi KPI họ đang theo đuổi. Người dân trung tâm có thể bỏ qua rằng người ngoại ô không có lựa chọn khác. Cửa hàng bỏ qua rằng dịch chuyển mô hình kinh doanh là có thể. Kỹ năng quan trọng nhất KHÔNG phải là "tìm phía đúng" — mà là nhận ra mỗi phía đang bỏ qua thông tin nào từ phía khác.',
        },
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Nghiên cứu kinh điển về Confirmation Bias',
        description:
          'Các thí nghiệm đầu tiên chứng minh confirmation bias và ý nghĩa của nó trong đời sống hiện đại.',
        category: 'Tâm lý học nhận thức',
        estimatedReadTime: '6 phút',
        documentContent: {
          sections: [
            {
              heading: 'Thí nghiệm 2-4-6 của Peter Wason (1960)',
              paragraphs: [
                'Peter Wason đưa cho người tham gia dãy số 2-4-6 và nói: "Dãy này tuân theo một quy tắc. Bạn có thể đề xuất các dãy 3 số khác, tôi sẽ nói dãy của bạn có tuân theo quy tắc không. Hãy đoán quy tắc."',
                'Đa số người tham gia đoán "số chẵn tăng dần 2 đơn vị" và chỉ test các dãy xác nhận giả thuyết (4-6-8, 10-12-14, 20-22-24). Họ rất ít khi test các dãy phản biện như 1-2-3 hoặc 5-10-20.',
                'Quy tắc thực tế là "3 số tăng dần bất kỳ". Nhưng vì người tham gia chỉ tìm xác nhận, họ không bao giờ phát hiện ra.',
                'Bài học: Để tìm ra sự thật, bạn phải TÍCH CỰC cố gắng chứng minh mình sai — không phải đi tìm bằng chứng mình đúng.',
              ],
            },
            {
              heading: 'Nghiên cứu Dan Kahan (Yale)',
              paragraphs: [
                'Dan Kahan đưa một bài toán thống kê đơn giản cho người tham gia. Khi bài toán là về "hiệu quả kem dưỡng da" — một chủ đề trung tính — người có kỹ năng toán tốt hơn làm đúng hơn.',
                'Khi cùng bài toán đó được đóng khung là "hiệu quả của luật kiểm soát súng" — một chủ đề chính trị — người có kỹ năng toán tốt hơn làm SAI HƠN khi đáp án trái với quan điểm chính trị của họ.',
                'Kết luận sốc: IQ không bảo vệ bạn khỏi confirmation bias. Ngược lại, người thông minh hơn BIAS NẶNG HƠN vì họ giỏi tìm lý lẽ biện minh cho niềm tin đã có.',
              ],
            },
            {
              heading: 'Ứng dụng trong đời sống hiện đại',
              paragraphs: [
                'Thuật toán mạng xã hội (Facebook, TikTok, YouTube) được thiết kế để tối ưu engagement. Mà engagement cao nhất là khi nội dung khớp với niềm tin sẵn có. Kết quả: mỗi người nhận được một "feed" cá nhân hoá chỉ toàn nội dung khẳng định thế giới quan của họ.',
                'Điều này biến confirmation bias từ một lỗi tâm lý cá nhân thành một hệ thống quy mô hàng tỷ người. Người ở hai phe của bất kỳ cuộc tranh cãi nào đều thấy "bằng chứng" rõ ràng rằng mình đúng — vì thuật toán chỉ cho họ thấy bằng chứng đó.',
                'Đây là lý do khoá học này đặt confirmation bias là bài đầu tiên: nếu bạn chưa nhận ra não mình đang bị lừa, mọi kỹ năng tư duy phản biện phía sau đều không có tác dụng.',
              ],
            },
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check-circle',
        title: 'Bạn đã học được gì?',
        text: '✓ Confirmation bias là xu hướng tìm, diễn giải, và nhớ thông tin theo cách củng cố niềm tin sẵn có\n✓ Nó xảy ra với MỌI người — IQ cao không bảo vệ bạn, có khi còn làm nặng hơn\n✓ 3 công cụ đối phó: steelman đối phương, tìm disconfirming evidence, đổi góc nhìn\n✓ Thuật toán mạng xã hội khuếch đại confirmation bias ở quy mô hàng tỷ người',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Bài tiếp theo: Ngụy biện là gì?',
        paragraphs: [
          'Trong bài này, chúng ta đã thấy não bộ có thể "tự lừa" như thế nào. Nhưng để nhận diện được lập luận sai — không chỉ trong đầu mình mà trong lời nói của người khác — chúng ta cần một bộ ngôn ngữ chung: tiền đề, kết luận, valid, sound.',
          'Bài 2 sẽ xây dựng bộ ngôn ngữ đó. Sau khi học xong Bài 2, bạn sẽ có thể "mổ xẻ" bất kỳ lập luận nào ra thành các thành phần và xem xét nó có đúng về mặt cấu trúc hay không — độc lập với việc nội dung có đúng hay không.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 2: Ngụy biện là gì?
  // ────────────────────────────────────────────────────────────────
  'logic101-2': {
    title: 'Ngụy biện là gì? — Tiền đề, kết luận, valid & sound',
    blocks: [
      {
        type: 'question',
        question:
          'Một lập luận "đúng về logic" (valid) có BẮT BUỘC phải có kết luận đúng không?',
        options: [
          { id: 'a', text: 'Có, luôn luôn — nếu valid thì kết luận phải đúng', isCorrect: false },
          { id: 'b', text: 'Không — valid chỉ nói về cấu trúc, kết luận có thể sai nếu tiền đề sai', isCorrect: true },
          { id: 'c', text: 'Tuỳ trường hợp, không có quy tắc cố định', isCorrect: false },
          { id: 'd', text: 'Chỉ khi tất cả các tiền đề đều được kiểm chứng thực nghiệm', isCorrect: false },
        ],
        explanation:
          'Đây là cái bẫy lớn nhất khi học logic. "Valid" (đúng về cấu trúc) không đảm bảo kết luận đúng. Ví dụ: "Mọi con mèo đều có 4 chân. Chó là mèo. Vậy chó có 4 chân." Lập luận này VALID (cấu trúc đúng) nhưng kết luận có thể sai nếu tiền đề sai. Để kết luận CHẮC CHẮN đúng, lập luận phải vừa valid, vừa có tiền đề đúng — ta gọi đó là SOUND. Trong bài này ta sẽ phân biệt 3 khái niệm: tiền đề, kết luận, và cặp valid vs sound.',
      },
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Trong Bài 1, chúng ta đã thấy não bộ "tự lừa" qua confirmation bias. Nhưng để nhận diện được lập luận sai của chính mình và của người khác, ta cần một bộ công cụ ngôn ngữ — giống như cần biết "đinh vít" và "ốc" trước khi học sửa xe.',
          'Bài này là "bài ngữ pháp" của toàn khoá Logic 101. Bạn sẽ học 4 khái niệm nền: tiền đề (premise), kết luận (conclusion), valid (đúng cấu trúc), và sound (đúng cấu trúc + tiền đề đúng). Đây là 4 từ mà mọi bài học sau sẽ dùng liên tục.',
          'Sau bài này, bạn có thể nhìn vào bất kỳ phát ngôn chính trị, lời quảng cáo, hay comment Facebook và "mổ" nó ra thành: đâu là tiền đề, đâu là kết luận, cấu trúc có đúng không, và tiền đề có đúng không.',
        ],
      },
      {
        type: 'callout',
        icon: 'help-circle',
        title: 'Câu hỏi trung tâm của bài này',
        text: 'Làm sao biết một lập luận "đúng hay sai" — và "đúng" ở đây nghĩa là gì?',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Tiền đề và kết luận — Giải phẫu một lập luận',
        paragraphs: [
          'Một lập luận (argument) gồm 2 phần: tiền đề (premises) và kết luận (conclusion). Tiền đề là những câu được DÙNG làm bằng chứng. Kết luận là câu được RÚT RA từ tiền đề đó.',
          'Ví dụ đơn giản:\n• Tiền đề 1: Tất cả người Việt đều biết ăn phở.\n• Tiền đề 2: Anh Tuấn là người Việt.\n• Kết luận: Vậy anh Tuấn biết ăn phở.',
          'Trong thực tế, lập luận hiếm khi được trình bày gọn như vậy. Chúng thường "ẩn" bên trong một đoạn văn dài — và tiền đề có khi không được nói ra mà được GIẢ ĐỊNH. Ví dụ: "Anh ấy phải là người xấu, anh ấy từ chối giúp tôi." — tiền đề ẩn ở đây là "người tốt luôn giúp đỡ mọi yêu cầu", một giả định rất đáng nghi.',
          'Kỹ năng đầu tiên của tư duy phản biện: KHI NGHE AI ĐÓ NÓI, hãy hỏi "cái gì là tiền đề, cái gì là kết luận, và có tiền đề nào đang ẩn không?".',
        ],
      },
      {
        type: 'argument-mapper',
        title: 'Phân tích cấu trúc lập luận',
        instruction:
          'Đọc đoạn văn dưới đây và xác định các thành phần của lập luận: đâu là tiền đề (premise), đâu là kết luận (conclusion), và đâu là bằng chứng (evidence). Click vào từng cụm và chọn loại.',
        passage:
          'Theo báo cáo của Tổng cục Thống kê, tỷ lệ thất nghiệp ở thanh niên Việt Nam năm 2023 là 7.2%, gấp 3 lần tỷ lệ trung bình quốc gia. Điều này cho thấy hệ thống giáo dục đang thất bại trong việc chuẩn bị sinh viên cho thị trường lao động. Chuyên gia kinh tế Lê Văn B nhận định rằng nếu không cải cách giáo dục ngay lập tức, Việt Nam sẽ mất lợi thế dân số vàng.',
        elements: [
          {
            id: 'e1',
            text: 'tỷ lệ thất nghiệp ở thanh niên Việt Nam năm 2023 là 7.2%',
            startIndex: 34,
            endIndex: 90,
            correctType: 'evidence',
            explanation:
              'Đây là dữ liệu có nguồn (Tổng cục Thống kê), dùng làm bằng chứng cho lập luận.',
          },
          {
            id: 'e2',
            text: 'gấp 3 lần tỷ lệ trung bình quốc gia',
            startIndex: 92,
            endIndex: 127,
            correctType: 'evidence',
            explanation:
              'So sánh định lượng, bổ sung bằng chứng cho mức độ nghiêm trọng.',
          },
          {
            id: 'e3',
            text: 'hệ thống giáo dục đang thất bại trong việc chuẩn bị sinh viên cho thị trường lao động',
            startIndex: 150,
            endIndex: 236,
            correctType: 'conclusion',
            explanation:
              'Đây là kết luận rút ra từ bằng chứng — nhưng là kết luận có vấn đề! Tỷ lệ thất nghiệp cao có thể do nhiều nguyên nhân khác (cơ cấu kinh tế, thiếu việc làm, mismatch kỹ năng) chứ không nhất thiết do giáo dục thất bại.',
          },
          {
            id: 'e4',
            text: 'nếu không cải cách giáo dục ngay lập tức, Việt Nam sẽ mất lợi thế dân số vàng',
            startIndex: 284,
            endIndex: 362,
            correctType: 'premise',
            explanation:
              'Đây là một tiền đề được dùng như "hậu quả nếu không hành động". Nó giả định mối nhân quả trực tiếp giữa "cải cách giáo dục" và "giữ được lợi thế dân số vàng" — một giả định cần kiểm chứng.',
          },
        ],
        elementTypes: [
          { id: 'premise', label: 'Tiền đề', color: '#3b82f6' },
          { id: 'conclusion', label: 'Kết luận', color: '#10b981' },
          { id: 'evidence', label: 'Bằng chứng', color: '#f59e0b' },
          { id: 'fallacy', label: 'Ngụy biện', color: '#ef4444' },
        ],
      },
      {
        type: 'callout',
        icon: 'alert-triangle',
        title: 'Valid ≠ Sound — Cái bẫy lớn nhất',
        text: 'Valid (đúng cấu trúc): Nếu tiền đề đúng, thì kết luận CHẮC CHẮN đúng — không cần biết tiền đề có đúng không.\n\nSound (chắc chắn đúng): Vừa valid, VỪA có tiền đề đúng.\n\nVí dụ VALID nhưng KHÔNG SOUND:\n• Tiền đề 1: Mọi người Hà Nội đều biết bay.\n• Tiền đề 2: Bạn là người Hà Nội.\n• Kết luận: Vậy bạn biết bay.\n\nLập luận này VALID (cấu trúc logic không có lỗi) nhưng KHÔNG SOUND (tiền đề 1 sai). Rất nhiều ngụy biện trong đời sống là VALID — cấu trúc không có lỗi — nhưng ẩn một tiền đề sai mà người nghe không nhận ra.',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Ngụy biện là gì?',
        paragraphs: [
          'Ngụy biện (fallacy) là một lập luận có VẺ thuyết phục nhưng thực ra có lỗi — hoặc ở cấu trúc (không valid), hoặc ở tiền đề (không sound), hoặc ở cả hai.',
          'Ngụy biện không phải là "nói dối". Người dùng ngụy biện có thể hoàn toàn tin vào điều họ nói. Đó là lý do ngụy biện nguy hiểm: nó xuất hiện tự nhiên trong đầu cả người nói lẫn người nghe, và cả hai đều không nhận ra.',
          'Có hàng trăm loại ngụy biện được phân loại trong logic học. Trong khoá Logic 101, chúng ta sẽ học 4 loại phổ biến nhất ở Việt Nam trong Level 2 (Bài 5-8): ad hominem, strawman, appeal to authority/popularity, và slippery slope + false dilemma. Bốn loại này chiếm khoảng 80% các lỗi lập luận bạn gặp trên Facebook mỗi ngày.',
          'Trước khi vào từng loại, ta cần một kỹ năng nền: phân biệt FACT (sự thật), OPINION (ý kiến), và INFERENCE (suy diễn). Ba thứ này thường bị trộn lẫn trong lập luận, khiến ngụy biện khó phát hiện.',
        ],
      },
      {
        type: 'fact-or-opinion',
        title: 'Phân biệt Sự thật, Ý kiến, và Thông tin gây hiểu nhầm',
        instruction:
          'Đọc các câu phát biểu dưới đây và phân loại: đâu là FACT (sự thật có thể kiểm chứng), OPINION (ý kiến chủ quan), hay MISLEADING (thông tin gây hiểu nhầm — có vẻ như fact nhưng thực ra không kiểm chứng được hoặc bị bóp méo).',
        statements: [
          {
            id: 'fo1',
            text: 'Dân số Việt Nam năm 2023 là hơn 100 triệu người.',
            correctAnswer: 'fact',
            explanation:
              'Đây là số liệu kiểm chứng được từ Tổng cục Thống kê. Fact: một phát biểu có thể kiểm chứng bằng dữ liệu hoặc quan sát độc lập.',
            source: 'Tổng cục Thống kê Việt Nam 2023',
          },
          {
            id: 'fo2',
            text: 'Giáo dục đại học ở Việt Nam quá đắt so với chất lượng.',
            correctAnswer: 'opinion',
            explanation:
              '"Quá đắt" và "so với chất lượng" là đánh giá chủ quan, phụ thuộc tiêu chí so sánh. Opinion không phải "sai" — nó chỉ là quan điểm, không phải fact.',
          },
          {
            id: 'fo3',
            text: 'Khảo sát cho thấy 95% sinh viên hài lòng với ngành học của mình.',
            correctAnswer: 'misleading',
            explanation:
              'Nghe như fact nhưng thiếu nguồn, cỡ mẫu, phương pháp khảo sát. Thống kê không có context là misleading — nó có thể đúng trong một mẫu nhỏ, một nhóm không đại diện, hoặc bị bóp méo.',
          },
          {
            id: 'fo4',
            text: 'Việt Nam là nước có nền ẩm thực hay nhất Đông Nam Á.',
            correctAnswer: 'opinion',
            explanation:
              '"Hay nhất" là đánh giá thẩm mỹ/văn hoá, không đo lường được. Dù bạn có đồng ý hay không, đây rõ ràng là opinion.',
          },
          {
            id: 'fo5',
            text: 'Nhiệt độ trung bình Hà Nội năm 2023 cao hơn 0.8°C so với trung bình 1990-2020.',
            correctAnswer: 'fact',
            explanation:
              'Con số cụ thể, có thể kiểm chứng qua dữ liệu khí tượng. Lưu ý: fact không đòi hỏi "ai cũng biết" — chỉ cần có thể kiểm chứng được.',
          },
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Các khái niệm nền của logic học',
        description:
          'Tóm tắt các khái niệm premise, conclusion, valid, sound và cách áp dụng vào lập luận đời thường.',
        category: 'Logic học',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Lập luận diễn dịch (Deductive) vs quy nạp (Inductive)',
              paragraphs: [
                'Lập luận diễn dịch: từ tiền đề tổng quát → kết luận cụ thể. Nếu tiền đề đúng, kết luận CHẮC CHẮN đúng. Ví dụ: "Tất cả kim loại đều dẫn điện. Đồng là kim loại. Vậy đồng dẫn điện."',
                'Lập luận quy nạp: từ quan sát cụ thể → kết luận tổng quát. Kết luận có thể ĐÚNG cao nhưng không chắc chắn 100%. Ví dụ: "Tôi đã thấy 1.000 con thiên nga, tất cả đều trắng. Vậy mọi thiên nga đều trắng." — Cho đến khi bạn thấy thiên nga đen ở Úc.',
                'Phần lớn lập luận trong đời sống là quy nạp — dựa trên kinh nghiệm, thống kê, quan sát. Điều này có nghĩa: kết luận không bao giờ tuyệt đối, chỉ có xác suất cao hay thấp. Hiểu điều này là bước đầu để tránh "ngạo mạn nhận thức".',
              ],
            },
            {
              heading: 'Vì sao Valid và Sound đều quan trọng',
              paragraphs: [
                'Valid là điều kiện NECESSARY (cần) nhưng không SUFFICIENT (đủ) để một lập luận đáng tin. Một lập luận không valid thì luôn không đáng tin. Một lập luận valid có thể vẫn không đáng tin nếu tiền đề sai.',
                'Khi bạn nghe ai tranh luận, hãy kiểm tra 2 lớp: (1) Cấu trúc: Nếu tiền đề đúng, kết luận có theo sau không? (2) Nội dung: Các tiền đề có thực sự đúng không?',
                'Đa số tranh cãi trên mạng xã hội thất bại ở lớp 2 — người ta đồng ý về cấu trúc nhưng khác nhau về tiền đề. Khi thấy hai bên "nói chuyện không chung" — đó thường là dấu hiệu họ đang dùng tiền đề khác nhau mà không biết.',
              ],
            },
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check-circle',
        title: 'Bạn đã học được gì?',
        text: '✓ Mọi lập luận gồm 2 phần: tiền đề (premise) và kết luận (conclusion)\n✓ Valid = cấu trúc đúng. Sound = valid + tiền đề đúng\n✓ Ngụy biện là lập luận có vẻ thuyết phục nhưng có lỗi cấu trúc hoặc tiền đề\n✓ Phân biệt fact / opinion / misleading là kỹ năng nền cho mọi bài sau',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Bài tiếp theo: Correlation ≠ Causation',
        paragraphs: [
          'Giờ bạn đã có bộ ngôn ngữ để mổ xẻ lập luận. Bài 3 sẽ áp dụng nó vào một loại sai lầm cực kỳ phổ biến khi đọc số liệu: nhầm tương quan với nhân quả.',
          'Bạn có biết ở vùng nào kem bán chạy thì số người chết đuối cũng cao? Điều đó có nghĩa kem gây chết đuối không? Bài 3 sẽ trả lời — và dạy bạn cách không bao giờ bị lừa bởi kiểu lập luận này nữa.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 3: Correlation ≠ Causation
  // ────────────────────────────────────────────────────────────────
  'logic101-3': {
    title: 'Correlation ≠ Causation — Cùng xảy ra không có nghĩa là nhân quả',
    blocks: [
      {
        type: 'question',
        question:
          'Ở Việt Nam, vào mùa hè, doanh số kem bán ra và số vụ chết đuối đều tăng cao. Điều này có nghĩa là gì?',
        options: [
          { id: 'a', text: 'Ăn kem làm tăng nguy cơ chết đuối', isCorrect: false },
          { id: 'b', text: 'Người chết đuối có xu hướng thèm kem trước khi chết', isCorrect: false },
          { id: 'c', text: 'Cả hai đều tăng vì một yếu tố thứ ba: trời nóng mùa hè', isCorrect: true },
          { id: 'd', text: 'Có sự trùng hợp ngẫu nhiên, không có liên hệ gì', isCorrect: false },
        ],
        explanation:
          'Đây là ví dụ kinh điển của correlation mà không có causation. Kem và chết đuối đều tăng vì mùa hè — trời nóng khiến người ta ăn kem nhiều hơn VÀ đi bơi nhiều hơn. "Mùa hè" là biến gây nhiễu (confounding variable). Trong bài này, ta sẽ học cách không bao giờ bị lừa bởi kiểu lập luận "hai thứ cùng xảy ra nên cái này gây ra cái kia".',
      },
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Bạn đọc một bài báo: "Nghiên cứu cho thấy người uống cà phê hàng ngày sống lâu hơn 3 năm." Ngay lập tức, bạn nghĩ: "À, cà phê tốt cho sức khoẻ." Nhưng khoan — có chắc cà phê là NGUYÊN NHÂN của việc sống lâu không? Hay người sống lâu và người uống cà phê chỉ cùng thuộc một nhóm (ví dụ: người có điều kiện kinh tế, người ít stress, người có lối sống đều đặn)?',
          'Nhầm lẫn "hai thứ cùng xảy ra" với "cái này gây ra cái kia" là một trong những lỗi suy luận phổ biến nhất khi đọc số liệu. Nó xuất hiện trong tin tức, quảng cáo, chính sách, và cả nghiên cứu khoa học kém chất lượng.',
          'Bài 3 sẽ dạy bạn: (1) phân biệt correlation (tương quan) và causation (nhân quả), (2) nhận diện 3 loại "lừa tương quan" phổ biến nhất, và (3) biết khi nào một nghiên cứu THỰC SỰ chứng minh được nhân quả.',
        ],
      },
      {
        type: 'callout',
        icon: 'help-circle',
        title: 'Câu hỏi trung tâm của bài này',
        text: 'Khi hai thứ cùng tăng hoặc cùng giảm, làm sao biết đó là nhân quả hay chỉ là trùng hợp?',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Correlation vs Causation — Định nghĩa',
        paragraphs: [
          'Correlation (tương quan): Hai biến có mối liên hệ thống kê — khi một biến thay đổi, biến kia cũng thay đổi. Correlation có thể dương (cùng tăng/giảm) hoặc âm (một tăng một giảm).',
          'Causation (nhân quả): Một biến trực tiếp GÂY RA sự thay đổi của biến kia. Nếu thay đổi A làm thay đổi B (và không có con đường ngược lại), thì A là nguyên nhân của B.',
          'Điểm mấu chốt: causation luôn kéo theo correlation, nhưng correlation KHÔNG kéo theo causation. Đây là sai lầm phổ biến nhất khi đọc tin về nghiên cứu.',
          'Ba lý do hai biến có thể tương quan mà không có nhân quả trực tiếp:\n1. BIẾN THỨ BA (confounding variable): Cả hai biến đều do một yếu tố thứ ba gây ra. Ví dụ: kem và chết đuối — đều do mùa hè.\n2. NHÂN QUẢ NGƯỢC (reverse causation): B mới là nguyên nhân của A, không phải ngược lại. Ví dụ: "Người giàu có sức khoẻ tốt" — có thể là vì giàu → chăm sóc y tế tốt → khoẻ. Cũng có thể là vì khoẻ → làm việc nhiều → giàu.\n3. TRÙNG HỢP NGẪU NHIÊN: Với đủ dữ liệu, bạn sẽ tìm thấy tương quan "có ý nghĩa thống kê" giữa các biến hoàn toàn không liên quan. Ví dụ: số phim Nicolas Cage đóng hàng năm tương quan với số người chết vì rơi xuống hồ bơi ở Mỹ.',
        ],
      },
      {
        type: 'correlation-causation',
        title: 'Tương quan hay Nhân quả? — Phân tích dữ liệu thực tế',
        instruction:
          'Quan sát các cặp dữ liệu dưới đây. Với mỗi cặp, xác định đây là tương quan (có liên hệ nhưng không nhân quả) hay nhân quả (cái này gây ra cái kia).',
        pairs: [
          {
            id: 'cc1',
            factA: {
              label: 'Số trường mẫu giáo trong khu vực',
              data: [5, 12, 18, 25, 35, 48],
            },
            factB: {
              label: 'Số cửa hàng tiện lợi trong khu vực',
              data: [8, 15, 22, 30, 42, 55],
            },
            labels: ['Vùng A', 'Vùng B', 'Vùng C', 'Vùng D', 'Vùng E', 'Vùng F'],
            correctAnswer: 'correlation',
            explanation:
              'Có tương quan dương rõ ràng: càng nhiều trường mẫu giáo, càng nhiều cửa hàng tiện lợi. Nhưng trường mẫu giáo KHÔNG sinh ra cửa hàng tiện lợi — và ngược lại. Cả hai đều do biến thứ ba: dân số. Khu vực đông dân → nhiều trường mẫu giáo HƠN đồng thời nhiều cửa hàng tiện lợi.',
            confoundingFactor:
              'Biến gây nhiễu: dân số khu vực. Khi có nhiều dân, cả nhu cầu giáo dục và nhu cầu tiêu dùng đều tăng.',
          },
          {
            id: 'cc2',
            factA: {
              label: 'Số giờ học mỗi tuần',
              data: [5, 10, 15, 20, 25, 30],
            },
            factB: {
              label: 'Điểm trung bình (thang 10)',
              data: [5.2, 6.1, 6.8, 7.5, 8.2, 8.7],
            },
            labels: ['HS 1', 'HS 2', 'HS 3', 'HS 4', 'HS 5', 'HS 6'],
            correctAnswer: 'causation',
            explanation:
              'Đây là mối quan hệ nhân quả có hướng: học nhiều giờ hơn → điểm cao hơn. Đã có nhiều nghiên cứu RCT (thí nghiệm có đối chứng) chứng minh mối quan hệ này. Tuy nhiên, cần lưu ý: mối quan hệ có thể "bão hoà" ở mức nào đó — học 50 giờ/tuần có thể KHÔNG tốt hơn 30 giờ vì mệt mỏi.',
            confoundingFactor:
              'Các RCT kiểm soát biến (động lực, IQ, môi trường) đã xác nhận hướng nhân quả chính: thời gian học → kết quả.',
          },
          {
            id: 'cc3',
            factA: {
              label: 'Doanh số kem trong tháng (triệu đồng)',
              data: [30, 45, 120, 180, 95, 40],
            },
            factB: {
              label: 'Số vụ chết đuối trong tháng',
              data: [2, 4, 12, 18, 9, 3],
            },
            labels: ['Tháng 2', 'Tháng 4', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 10'],
            correctAnswer: 'correlation',
            explanation:
              'Đây là ví dụ kinh điển. Kem và chết đuối có tương quan dương mạnh. Nhưng kem không làm người ta chết đuối (và người chết đuối không khiến ai thèm kem). Cả hai cùng tăng vì trời nóng mùa hè: người ta ăn kem nhiều hơn VÀ đi bơi nhiều hơn.',
            confoundingFactor:
              'Biến gây nhiễu: nhiệt độ/mùa. Mùa hè là nguyên nhân chung của cả hai.',
          },
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Khi nào correlation THỰC SỰ chứng minh causation?',
        text: 'Chỉ có một phương pháp thuyết phục: Randomized Controlled Trial (RCT) — thí nghiệm có đối chứng ngẫu nhiên. Trong RCT, người nghiên cứu chia ngẫu nhiên người tham gia thành 2 nhóm, một nhóm nhận "điều trị" (ví dụ: thuốc mới), một nhóm nhận placebo. Vì phân chia ngẫu nhiên, hai nhóm có mọi đặc điểm khác giống nhau — chỉ khác ở "điều trị". Nếu nhóm điều trị có kết quả tốt hơn, ta có thể kết luận điều trị GÂY RA kết quả đó.\n\nTrong các nghiên cứu quan sát (observational — chỉ thu thập dữ liệu, không can thiệp), bạn chỉ có thể kết luận CORRELATION, không phải causation. Khi đọc tin "nghiên cứu cho thấy X liên quan đến Y", hãy kiểm tra: đó là RCT hay chỉ là nghiên cứu quan sát?',
        variant: 'info',
      },
      {
        type: 'text',
        title: '3 câu hỏi để kiểm tra một tuyên bố nhân quả',
        paragraphs: [
          'Khi nghe "A gây ra B", hãy hỏi 3 câu:',
          '1. CÓ THỂ LÀ NGƯỢC LẠI KHÔNG? (B gây ra A) — "Người tập gym có cơ bắp to" → tập gym gây cơ bắp, hay người có cơ bắp sẵn thì thích tập? Thực ra là cả hai chiều, nhưng cần nghiên cứu để định lượng.',
          '2. CÓ BIẾN THỨ BA NÀO KHÔNG? (C gây ra cả A và B) — "Trẻ em có đôi dép to thường đọc chữ giỏi" → dép to không làm trẻ đọc giỏi. Biến thứ ba: tuổi. Trẻ lớn hơn có cả dép to hơn và kỹ năng đọc tốt hơn.',
          '3. ĐÂY CÓ PHẢI LÀ TRÙNG HỢP NGẪU NHIÊN KHÔNG? — Cỡ mẫu nhỏ + chọn biến theo ý = dễ tìm ra tương quan giả. Kiểm tra: cỡ mẫu bao nhiêu, và có phải chọn biến sau khi đã thấy dữ liệu không?',
          'Nếu một trong 3 câu hỏi này chưa được loại trừ, bạn KHÔNG THỂ kết luận có nhân quả. Đây không phải là "hoài nghi vô ích" — đây là tiêu chuẩn thực sự của khoa học.',
        ],
      },
      {
        type: 'cause-effect-chain',
        title: 'Mối quan hệ giữa các biến kinh tế — Tìm nhân quả đúng',
        instruction:
          'Dưới đây là các khái niệm thường xuất hiện cùng nhau trong tin tức kinh tế. Hãy nối các mối quan hệ nhân quả THỰC SỰ (có bằng chứng từ kinh tế học) để thấy chuỗi nhân quả rõ ràng.',
        nodes: [
          { id: 'supply', text: 'Cung hàng hoá giảm', category: 'Cung-cầu' },
          { id: 'demand', text: 'Nhu cầu không đổi', category: 'Cung-cầu' },
          { id: 'price', text: 'Giá hàng hoá tăng', category: 'Giá' },
          { id: 'inflation', text: 'Lạm phát tổng thể tăng', category: 'Kết quả' },
          { id: 'purchasing', text: 'Sức mua người dân giảm', category: 'Kết quả' },
          { id: 'rates', text: 'Ngân hàng TW tăng lãi suất', category: 'Chính sách' },
          { id: 'loans', text: 'Vay tiêu dùng giảm', category: 'Kết quả' },
          { id: 'cooldown', text: 'Tổng cầu hạ nhiệt', category: 'Kết quả' },
        ],
        correctConnections: [
          { fromId: 'supply', toId: 'price' },
          { fromId: 'demand', toId: 'price' },
          { fromId: 'price', toId: 'inflation' },
          { fromId: 'inflation', toId: 'purchasing' },
          { fromId: 'inflation', toId: 'rates' },
          { fromId: 'rates', toId: 'loans' },
          { fromId: 'loans', toId: 'cooldown' },
        ],
        explanation:
          'Chuỗi nhân quả này có bằng chứng kinh tế vững chắc: cung giảm (hoặc cầu vượt cung) → giá tăng → tích luỹ thành lạm phát → ngân hàng trung ương phản ứng bằng việc tăng lãi suất → vay tiêu dùng đắt hơn → tổng cầu hạ nhiệt. Điểm quan trọng: không phải mọi "hai thứ cùng tăng" đều có chuỗi như vậy. Nhân quả có hướng rõ ràng và có cơ chế giải thích — không chỉ là tương quan thống kê.',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Vì sao "correlation does not imply causation" là khẩu hiệu của thống kê',
        description:
          'Lịch sử và các ví dụ nổi tiếng về nhầm lẫn tương quan-nhân quả trong khoa học và chính sách.',
        category: 'Thống kê & Phương pháp nghiên cứu',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Tương quan giả nổi tiếng',
              paragraphs: [
                'Tyler Vigen thu thập hàng nghìn cặp biến ngẫu nhiên và tìm ra các tương quan "gần hoàn hảo" giữa những thứ hoàn toàn không liên quan. Ví dụ: tỷ lệ ly hôn ở bang Maine và tiêu thụ margarine (r = 0.99). Tỷ lệ tự tử do treo cổ và ngân sách chi cho khoa học (r = 0.99). Số người chết vì rơi xuống hồ bơi và số phim Nicolas Cage đóng trong năm đó (r = 0.67).',
                'Bài học: với đủ dữ liệu, bạn sẽ luôn tìm thấy các tương quan "có ý nghĩa thống kê" giữa những biến không liên quan. Đây gọi là p-hacking khi các nhà nghiên cứu KÉM chủ động tìm các tương quan này.',
              ],
            },
            {
              heading: 'Bài học từ lịch sử y học',
              paragraphs: [
                'Thế kỷ 19, các bác sĩ quan sát: phụ nữ sinh con tại nhà ít tử vong hơn phụ nữ sinh ở bệnh viện. Kết luận ban đầu: "bệnh viện là nơi nguy hiểm". Ignaz Semmelweis phát hiện nguyên nhân thực sự là bác sĩ không rửa tay trước khi đỡ đẻ — họ mang vi khuẩn từ phòng mổ xác sang phòng sinh. Biến thứ ba: vệ sinh tay.',
                'Bài học: nhầm tương quan với nhân quả không chỉ là "lỗi logic nhỏ" — nó có thể dẫn đến quyết định y tế, chính sách sai lầm giết chết hàng nghìn người.',
              ],
            },
            {
              heading: 'Khi nào tin một tuyên bố nhân quả',
              paragraphs: [
                'Nguyên tắc Bradford Hill (1965) đặt ra 9 tiêu chí đánh giá mối quan hệ nhân quả: sức mạnh của tương quan, tính nhất quán qua các nghiên cứu, tính đặc thù, thứ tự thời gian, gradient liều-hiệu ứng, tính hợp lý sinh học, tính mạch lạc, thí nghiệm có kiểm soát, tính tương tự.',
                'Đừng bao giờ tin tuyên bố nhân quả chỉ dựa trên một nghiên cứu đơn lẻ — đặc biệt là nghiên cứu quan sát. Khoa học thực sự đòi hỏi nhiều nghiên cứu, nhiều phương pháp, và nhiều năm trước khi gọi một thứ là "nhân quả".',
              ],
            },
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check-circle',
        title: 'Bạn đã học được gì?',
        text: '✓ Correlation là tương quan thống kê; causation là nhân quả thực sự. Chúng KHÁC nhau\n✓ 3 lý do có correlation mà không có causation: biến thứ ba, nhân quả ngược, trùng hợp\n✓ Chỉ RCT (thí nghiệm có đối chứng ngẫu nhiên) mới chứng minh được causation một cách chắc chắn\n✓ 3 câu hỏi kiểm tra: ngược lại được không? có biến thứ ba không? có phải ngẫu nhiên không?',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Bài tiếp theo: Thao túng số liệu',
        paragraphs: [
          'Bài 3 dạy bạn không bị lừa bởi cách GIẢI THÍCH số liệu. Bài 4 sẽ dạy bạn không bị lừa bởi cách TRÌNH BÀY số liệu: biểu đồ cắt trục y, thống kê không có context, phần trăm không nền.',
          'Sau Bài 4, bạn sẽ hoàn thành Level 1 — "Não bạn bị lừa" — và sẵn sàng vào Level 2 để học 4 ngụy biện phổ biến nhất trong tranh luận hằng ngày.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 4: Thao túng số liệu
  // ────────────────────────────────────────────────────────────────
  'logic101-4': {
    title: 'Thao túng số liệu — Khi biểu đồ cố tình lừa mắt bạn',
    blocks: [
      {
        type: 'question',
        question:
          'Một biểu đồ cột cho thấy "doanh thu tăng 300%" — từ cột bên trái (thấp) sang cột bên phải (rất cao). Để đánh giá biểu đồ này có trung thực không, bạn CẦN kiểm tra điều gì trước tiên?',
        options: [
          { id: 'a', text: 'Nguồn dữ liệu có đáng tin không', isCorrect: false },
          { id: 'b', text: 'Trục y có bắt đầu từ 0 không', isCorrect: true },
          { id: 'c', text: 'Cỡ chữ tiêu đề có đủ lớn không', isCorrect: false },
          { id: 'd', text: 'Màu sắc có hài hoà không', isCorrect: false },
        ],
        explanation:
          'Trục y không bắt đầu từ 0 là "thủ thuật biểu đồ" phổ biến nhất để phóng đại sự khác biệt. Một thay đổi nhỏ (ví dụ từ 98 lên 102, tức 4%) có thể trông như tăng gấp 10 lần nếu trục y bắt đầu từ 97. Trong bài này, ta sẽ học các thủ thuật thống kê phổ biến nhất và cách phát hiện chúng — bao gồm cả trục y "lừa mắt", cherry-picking, phần trăm không nền, và trung bình gây hiểu nhầm.',
      },
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Câu nói kinh điển của Mark Twain: "Có 3 loại lời nói dối: lời dối thông thường, lời dối trắng trợn, và thống kê." Thống kê không phải là nói dối — nhưng nó có thể ĐƯỢC DÙNG để nói dối, và cách lừa thường không nằm ở các con số mà ở cách trình bày chúng.',
          'Bài 4 — bài cuối của Level 1 — sẽ cho bạn một bộ "kính thám tử" để nhìn vào biểu đồ và số liệu. Bạn sẽ học 4 thủ thuật thống kê phổ biến nhất: (1) trục y cắt cụt, (2) cherry-picking thời gian, (3) phần trăm không có nền, và (4) trung bình gây hiểu nhầm.',
          'Sau bài này, bạn sẽ có một phản xạ: mỗi khi thấy "X tăng 300%", "Y cao gấp 5 lần", hay một biểu đồ ấn tượng — bạn sẽ tự động hỏi "số liệu này được trình bày có trung thực không?".',
        ],
      },
      {
        type: 'callout',
        icon: 'help-circle',
        title: 'Câu hỏi trung tâm của bài này',
        text: 'Làm sao một biểu đồ "có vẻ khoa học" lại có thể lừa được mắt bạn — và làm sao để không bị lừa nữa?',
        variant: 'info',
      },
      {
        type: 'text',
        title: '4 thủ thuật thao túng số liệu phổ biến',
        paragraphs: [
          '1. TRỤC Y CẮT CỤT (truncated axis). Thay vì bắt đầu từ 0, biểu đồ bắt đầu từ một con số cao — ví dụ trục y từ 95 đến 100. Hậu quả: sự khác biệt nhỏ trông như khổng lồ. Đây là thủ thuật phổ biến nhất trong báo cáo doanh nghiệp và quảng cáo chính trị.',
          '2. CHERRY-PICKING THỜI GIAN. Chọn thời điểm bắt đầu và kết thúc có lợi cho câu chuyện muốn kể. Ví dụ: "GDP Việt Nam tăng 50% trong 5 năm qua" — nhưng nếu chọn mốc 5 năm trước là đáy khủng hoảng, con số trông đẹp. Nếu chọn mốc 10 năm, con số trông khác hẳn.',
          '3. PHẦN TRĂM KHÔNG CÓ NỀN. "Chính sách mới làm tỷ lệ X tăng 400%" nghe ấn tượng — nhưng nếu ban đầu là 0.01% và sau là 0.04%, thì "tăng 400%" chỉ là tăng thêm 0.03%. Khi bạn thấy phần trăm, luôn hỏi: "phần trăm của cái gì, và con số tuyệt đối là bao nhiêu?".',
          '4. TRUNG BÌNH GÂY HIỂU NHẦM. "Thu nhập trung bình khu vực này là 15 triệu/tháng" nghe tốt — nhưng nếu có 9 người kiếm 5 triệu và 1 người kiếm 105 triệu, trung bình vẫn là 15 triệu. Trung bình (mean) bị kéo bởi các giá trị cực đoan. Trung vị (median) — con số "ở giữa" — thường trung thực hơn với thực tế của đa số.',
        ],
      },
      {
        type: 'stat-trick',
        title: 'Biểu đồ này có gì đáng ngờ?',
        instruction:
          'Nhìn biểu đồ dưới đây về "sự khác biệt nhiệt độ giữa các thành phố". Biểu đồ có đang lừa mắt bạn không?',
        chart: {
          type: 'bar',
          title: 'Nhiệt độ trung bình các thành phố (°C)',
          data: [
            { label: 'Hà Nội', value: 24.5, displayValue: '24.5°C' },
            { label: 'Đà Nẵng', value: 25.2, displayValue: '25.2°C' },
            { label: 'TP.HCM', value: 27.1, displayValue: '27.1°C' },
            { label: 'Cần Thơ', value: 26.8, displayValue: '26.8°C' },
          ],
          yAxisStart: 24,
        },
        question: 'Biểu đồ này có gì đáng ngờ nhất?',
        options: [
          { id: 'a', text: 'Màu sắc quá sặc sỡ gây phân tâm', isCorrect: false },
          { id: 'b', text: 'Trục y bắt đầu từ 24 thay vì 0 — phóng đại sự khác biệt', isCorrect: true },
          { id: 'c', text: 'Không có đủ dữ liệu các thành phố', isCorrect: false },
          { id: 'd', text: 'Biểu đồ cột không phù hợp với dữ liệu nhiệt độ', isCorrect: false },
        ],
        reveal: {
          explanation:
            'Trục y bắt đầu từ 24°C khiến cột TP.HCM (27.1°C) trông CAO GẤP HƠN 3 LẦN cột Hà Nội (24.5°C) — trong khi thực tế chỉ hơn 2.6°C, tức khoảng 10%. Nếu trục y bắt đầu từ 0, bạn sẽ thấy các cột gần như bằng nhau. Đây là thủ thuật cắt trục y cực kỳ phổ biến. LUÔN kiểm tra: trục y bắt đầu ở đâu?',
          correctedChart: {
            type: 'bar',
            title: 'Nhiệt độ các thành phố (trục y từ 0)',
            data: [
              { label: 'Hà Nội', value: 24.5, displayValue: '24.5°C' },
              { label: 'Đà Nẵng', value: 25.2, displayValue: '25.2°C' },
              { label: 'TP.HCM', value: 27.1, displayValue: '27.1°C' },
              { label: 'Cần Thơ', value: 26.8, displayValue: '26.8°C' },
            ],
            yAxisStart: 0,
          },
        },
      },
      {
        type: 'callout',
        icon: 'alert-triangle',
        title: 'Phản xạ kiểm tra số liệu — 4 câu hỏi',
        text: 'Mỗi khi thấy số liệu hoặc biểu đồ, hãy tự hỏi 4 câu:\n\n1. NGUỒN: Số liệu này từ đâu? Ai thu thập, ai trình bày?\n2. THỜI ĐIỂM: Mốc thời gian được chọn có hợp lý không? Có phải cherry-pick thời điểm có lợi không?\n3. TRÌNH BÀY: Biểu đồ có trục y từ 0 không? Trục x có đều không? Tỷ lệ có đúng không?\n4. CONTEXT: Phần trăm có kèm con số tuyệt đối không? Trung bình hay trung vị? So với cái gì?\n\n4 câu hỏi này chỉ mất 10 giây. Nhưng chúng lọc ra 80% các trường hợp thao túng số liệu bạn sẽ gặp.',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Tại sao phản xạ này quan trọng hơn bạn nghĩ',
        paragraphs: [
          'Trong thời đại "data-driven", bất kỳ tuyên bố nào kèm số liệu đều được cho là đáng tin hơn tuyên bố không có số liệu. Đây là một dạng "số liệu bias" — bias rằng "có số là đúng".',
          'Nhưng chính vì bias này, thao túng số liệu trở thành công cụ mạnh nhất của người muốn thuyết phục bạn: quảng cáo, chính trị gia, PR doanh nghiệp, tin tức giật gân. Họ biết rằng chỉ cần có một biểu đồ "trông khoa học", não bạn sẽ tự động chấp nhận kết luận mà không kiểm tra.',
          'Phản xạ kiểm tra 4 câu trở thành "vắc-xin" chống lại loại thao túng này. Nó không giúp bạn biết đúng/sai ngay — nó giúp bạn DỪNG LẠI thay vì gật đầu vô điều kiện. Và đó là bước đầu tiên của mọi tư duy phản biện.',
        ],
      },
      {
        type: 'hot-cold-guess',
        title: 'Đoán xem: Một người Việt trung bình đóng bao nhiêu loại thuế mỗi ngày?',
        question:
          'Tính trung bình, một người dân Việt Nam đi làm (đi lại, ăn uống, mua sắm bình thường) đóng khoảng bao nhiêu LOẠI thuế khác nhau trong một ngày bình thường?',
        answer: 5,
        unit: 'loại thuế',
        tolerance: 30,
        hints: [
          'Bạn đóng thuế mỗi khi mua hàng (VAT), đổ xăng (thuế tiêu thụ đặc biệt + xăng dầu), ăn uống (VAT).',
          'Đó là chưa kể thuế TNCN, thuế môn bài nếu kinh doanh, thuế nhập khẩu ẩn trong sản phẩm nước ngoài.',
          'Con số thực tế nằm trong khoảng 4-7 loại thuế trong một ngày bình thường.',
        ],
        context:
          'Một người Việt bình thường mỗi ngày đóng ít nhất: VAT (khi mua hàng), thuế nhập khẩu (ẩn trong giá hàng ngoại), thuế tiêu thụ đặc biệt (khi đổ xăng, uống bia/rượu, mua điện thoại), thuế bảo vệ môi trường (xăng dầu). Nếu đi làm: thuế TNCN, BHXH (về mặt kinh tế, BHXH hoạt động như một loại thuế dù pháp lý không phải thuế). Tổng: 5-6 loại thuế mỗi ngày. Bài học: "Tôi không đóng thuế" là một niềm tin phổ biến nhưng sai — bạn đang đóng thuế liên tục, chỉ không nhận ra.',
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Lịch sử thao túng số liệu nổi tiếng',
        description:
          'Các vụ thao túng số liệu lịch sử trong chính trị, doanh nghiệp, và báo chí — và bài học từ chúng.',
        category: 'Thống kê & Truyền thông',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Huff — How to Lie with Statistics (1954)',
              paragraphs: [
                'Cuốn sách kinh điển của Darrell Huff "Làm sao nói dối bằng thống kê" ra đời năm 1954 và vẫn là sách bán chạy nhất về thống kê cho người không chuyên. Huff liệt kê các thủ thuật: cherry-picking sample, lừa mắt bằng biểu đồ, dùng trung bình thay vì trung vị, so sánh ngô khoai, phần trăm không có nền.',
                'Huff không phải nhà thống kê — ông là nhà báo. Điều này quan trọng: ông viết từ góc độ "người thường bị lừa", không phải "chuyên gia dạy lý thuyết". Đó là lý do cuốn sách vẫn relevant sau 70 năm — các thủ thuật ông mô tả vẫn hoạt động y nguyên vì não người không thay đổi.',
              ],
            },
            {
              heading: 'Biểu đồ Fox News 2012',
              paragraphs: [
                'Một trong các ví dụ kinh điển: biểu đồ cột trên Fox News so sánh thuế suất "nếu Bush Tax Cuts hết hiệu lực". Cột 1 hiển thị 35%, cột 2 hiển thị 39.6%. Nếu đúng tỷ lệ, cột 2 phải cao hơn cột 1 khoảng 13%. Nhưng vì trục y bắt đầu từ 34, cột 2 CAO HƠN CỘT 1 GẤP 5 LẦN trên màn hình.',
                'Khán giả xem 2 giây, não tự động diễn giải: "thuế sẽ tăng khổng lồ!". Đây là lý do truncated axis là thủ thuật số 1 trong truyền thông: nó không "nói dối" (con số vẫn đúng), nhưng nó lừa được hệ thị giác trước khi hệ suy luận kịp can thiệp.',
              ],
            },
            {
              heading: 'Bài học cho người đọc',
              paragraphs: [
                'Không ai có thể "miễn nhiễm" hoàn toàn với thao túng số liệu — kể cả nhà thống kê chuyên nghiệp khi họ không có thời gian kiểm tra. Giải pháp thực tế không phải là "học tất cả các thủ thuật" mà là HÌNH THÀNH PHẢN XẠ DỪNG LẠI: khi thấy số liệu ấn tượng, dừng 5 giây và hỏi "trục y ở đâu? nguồn là gì? context ra sao?".',
                'Phản xạ này, không phải kiến thức thống kê, mới là thứ thực sự bảo vệ bạn. Kiến thức sẽ theo sau, nhưng phản xạ phải có trước.',
              ],
            },
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check-circle',
        title: 'Bạn đã học được gì?',
        text: '✓ 4 thủ thuật phổ biến: trục y cắt cụt, cherry-picking thời gian, phần trăm không có nền, trung bình gây hiểu nhầm\n✓ Phản xạ 4 câu hỏi: nguồn? thời điểm? trình bày? context?\n✓ "Có số liệu" KHÔNG đồng nghĩa "đáng tin" — số liệu có thể bị thao túng mà không cần nói dối\n✓ Kỹ năng cốt lõi là phản xạ DỪNG LẠI, không phải kiến thức thống kê',
        variant: 'success',
      },
      {
        type: 'text',
        title: 'Kết thúc Level 1 — và tiếp theo?',
        paragraphs: [
          'Bạn vừa hoàn thành Level 1 của Logic 101. Trong 4 bài vừa qua, bạn đã gặp "kẻ thù" đầu tiên của tư duy phản biện: chính não bộ của bạn. Confirmation bias, ngôn ngữ lập luận, correlation/causation, thao túng số liệu — đây là 4 cái bẫy sẽ xuất hiện trong mọi tin tức, cuộc tranh luận, và quyết định của bạn từ giờ trở đi.',
          'Level 2 sẽ chuyển từ "não bạn" sang "người khác": 4 loại ngụy biện phổ biến nhất bạn gặp trên Facebook, trên TV, trong hội nhóm. Ad hominem, strawman, appeal to authority, slippery slope — sau Level 2, bạn sẽ nhận diện các ngụy biện này trong vòng vài giây khi đọc comment.',
          'Nhưng trước khi vào Level 2, hãy thử một thứ: trong 24 giờ tới, mỗi lần bạn đọc một tin tức hay một bài viết, hãy dừng lại 10 giây và thử áp dụng 4 công cụ của Level 1. Đây là cách duy nhất biến "biết" thành "làm được".',
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────
// Main seeding function
// ─────────────────────────────────────────────
async function main() {
  console.log('=== Adding "Logic 101 — Não Bạn Đang Lừa Bạn" course (Phase 1: Level 1 content) ===\n');

  // 1. Ensure 'critical-thinking' category exists (create if missing)
  console.log('Setting up category "critical-thinking"...');
  let category = await prisma.category.findUnique({ where: { slug: 'critical-thinking' } });
  if (!category) {
    const maxSortOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
    category = await prisma.category.create({
      data: {
        slug: 'critical-thinking',
        name: 'Tư duy & Kỹ năng',
        description:
          'Tư duy phản biện, logic, và các kỹ năng nhận thức nền tảng cho mọi lĩnh vực khác',
        icon: 'brain',
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: true,
      },
    });
    console.log(`  ✅ Created category: ${category.name} (slug: ${category.slug})\n`);
  } else {
    console.log(`  Found existing category: ${category.name} (${category.id})\n`);
  }

  // 2. Check for duplicate course
  const existing = await prisma.course.findUnique({ where: { slug: LOGIC101_COURSE.slug } });
  if (existing) {
    console.log(`⚠️  Course "${LOGIC101_COURSE.slug}" already exists! Skipping to avoid duplicates.`);
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
      slug: LOGIC101_COURSE.slug,
      name: LOGIC101_COURSE.name,
      description: LOGIC101_COURSE.description,
      icon: LOGIC101_COURSE.icon,
      isNew: LOGIC101_COURSE.isNew,
      isActive: true,
      categoryId: category.id,
      sortOrder: courseSortOrder,
    },
  });
  console.log(`✅ Created course: ${course.name} (slug: ${course.slug})\n`);

  // 5. Create levels and lessons
  for (let levelIndex = 0; levelIndex < LOGIC101_COURSE.levels.length; levelIndex++) {
    const lvlDef = LOGIC101_COURSE.levels[levelIndex];
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

      // Add content if available (Phase 1: only Level 1 lessons have content)
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
      } else {
        console.log(`      ⏳  No content yet (will be added in a future phase)`);
      }
    }
  }

  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Phase 1 complete!');
  console.log('='.repeat(60));

  const lessonCount = await prisma.lesson.count({
    where: { level: { courseId: course.id } },
  });
  const contentCount = await prisma.lessonContent.count({
    where: { lesson: { level: { courseId: course.id } } },
  });

  console.log(`  Total lessons created : ${lessonCount}`);
  console.log(`  Lessons with content  : ${contentCount} (Level 1 only)`);
  console.log(`  Lessons without content: ${lessonCount - contentCount} (Levels 2-5)`);
  console.log('\n📝 Next steps:');
  console.log('  Phase 2 — Add Level 2 content: Ngụy biện phổ biến (4 lessons)');
  console.log('  Phase 3 — Add Level 3 content: Media literacy (4 lessons)');
  console.log('  Phase 4 — Add Level 4 content: Civic reasoning (4 lessons)');
  console.log('  Phase 5 — Add Level 5 content: Debate & synthesis (4 lessons)');
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
