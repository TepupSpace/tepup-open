/**
 * Script to seed a test lesson with all 15 new gamification block types.
 * Run: cd tepup && npx tsx scripts/add-gamification-v2-test.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  // Find the dan-chu-101 course to add a test lesson
  const course = await prisma.course.findFirst({
    where: { slug: 'dan-chu-101' },
    include: { levels: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!course) {
    console.log('Course dan-chu-101 not found. Creating standalone test...');
    // Will create with first available course
  }

  const targetCourseId = course?.id;
  const targetLevel = course?.levels?.[0]; // Use first level

  if (!targetCourseId || !targetLevel) {
    console.error('No course/level found to attach test lesson');
    return;
  }

  // Check if test lesson already exists
  const existing = await prisma.lesson.findFirst({
    where: { slug: 'gamification-v2-test' },
  });

  if (existing) {
    console.log('Test lesson already exists. Deleting and recreating...');
    await prisma.lessonContent.deleteMany({ where: { lessonId: existing.id } });
    await prisma.lesson.delete({ where: { id: existing.id } });
  }

  // Create test lesson
  const lesson = await prisma.lesson.create({
    data: {
      slug: 'gamification-v2-test',
      name: 'Test: 15 Block Types Gamification v2',
      levelId: targetLevel.id,
      courseId: targetLevel.courseId,
      sortOrder: 99,
    },
  });

  console.log(`Created lesson: ${lesson.id}`);

  // Create lesson content with all 15 block types
  const blocks = [
    // === 1. FACT OR OPINION ===
    {
      type: 'fact-or-opinion',
      title: 'Sự thật hay Ý kiến?',
      instruction: 'Phân loại các phát biểu sau về dân chủ và chính trị',
      statements: [
        {
          id: 'fo1',
          text: 'Việt Nam có hơn 90 triệu dân.',
          correctAnswer: 'fact',
          explanation: 'Đây là số liệu dân số có thể kiểm chứng từ tổng cục thống kê.',
        },
        {
          id: 'fo2',
          text: 'Dân chủ là hệ thống chính trị tốt nhất.',
          correctAnswer: 'opinion',
          explanation: 'Đây là đánh giá chủ quan. "Tốt nhất" tùy thuộc tiêu chí đánh giá.',
        },
        {
          id: 'fo3',
          text: '99% người dân ủng hộ chính sách mới.',
          correctAnswer: 'misleading',
          explanation: 'Con số 99% không có nguồn kiểm chứng và rất khó đạt trong bất kỳ cuộc khảo sát nào.',
        },
        {
          id: 'fo4',
          text: 'Hiến pháp 2013 có 11 chương và 120 điều.',
          correctAnswer: 'fact',
          explanation: 'Đây là thông tin pháp lý chính xác, có thể kiểm chứng.',
        },
      ],
      passingScore: 3,
    },

    // === 2. CORRELATION-CAUSATION ===
    {
      type: 'correlation-causation',
      title: 'Tương quan hay Nhân quả?',
      instruction: 'Phân biệt giữa tương quan và nhân quả trong các cặp dữ liệu KHXH',
      pairs: [
        {
          id: 'cc1',
          factA: { label: 'GDP bình quân đầu người', data: [1200, 1500, 1900, 2400, 3000] },
          factB: { label: 'Tuổi thọ trung bình', data: [72, 73, 74, 75, 76] },
          labels: ['2015', '2017', '2019', '2021', '2023'],
          correctAnswer: 'correlation',
          explanation: 'GDP tăng và tuổi thọ tăng có tương quan, nhưng tuổi thọ còn phụ thuộc nhiều yếu tố khác: y tế, dinh dưỡng, môi trường.',
          confoundingFactor: 'Tiến bộ y tế và cải thiện vệ sinh là yếu tố chính, không chỉ thu nhập.',
        },
        {
          id: 'cc2',
          factA: { label: 'Số lượng điện thoại thông minh', data: [20, 40, 55, 65, 75] },
          factB: { label: 'Tỷ lệ tham gia bầu cử (%)', data: [68, 65, 60, 55, 50] },
          labels: ['2012', '2015', '2018', '2021', '2024'],
          correctAnswer: 'coincidence',
          explanation: 'Smartphone tăng trong khi tham gia bầu cử giảm, nhưng hai hiện tượng này không có quan hệ nhân quả trực tiếp.',
          confoundingFactor: 'Sự thờ ơ chính trị có nguyên nhân riêng: mất niềm tin, thiếu lựa chọn, v.v.',
        },
      ],
    },

    // === 3. SCENARIO WHAT-IF ===
    {
      type: 'scenario-what-if',
      title: 'Nếu... thì sao?',
      scenario: 'Nếu Việt Nam không thực hiện Đổi Mới năm 1986, điều gì sẽ xảy ra?',
      historicalContext: 'Năm 1986, Việt Nam đối mặt với khủng hoảng kinh tế nghiêm trọng: lạm phát 700%, thiếu lương thực, cấm vận quốc tế. Đại hội Đảng VI quyết định chuyển sang kinh tế thị trường định hướng XHCN.',
      predictions: [
        {
          id: 'wi1',
          text: 'Kinh tế tiếp tục trì trệ giống Bắc Triều Tiên',
          likelihood: 'possible',
          explanation: 'Có thể nhưng VN có vị trí địa lý thuận lợi hơn và dân số lớn, khó duy trì cô lập lâu dài.',
        },
        {
          id: 'wi2',
          text: 'Sẽ có bất ổn xã hội và thay đổi chế độ',
          likelihood: 'possible',
          explanation: 'Áp lực kinh tế kéo dài thường dẫn đến bất ổn, nhưng mức độ khó dự đoán.',
        },
        {
          id: 'wi3',
          text: 'Đổi Mới sẽ vẫn xảy ra nhưng muộn hơn vài năm',
          likelihood: 'likely',
          explanation: 'Áp lực kinh tế quá lớn, cải cách có lẽ là tất yếu, chỉ là sớm hay muộn.',
        },
        {
          id: 'wi4',
          text: 'Liên Xô sẽ cứu VN bằng viện trợ kinh tế',
          likelihood: 'unlikely',
          explanation: 'Liên Xô chính mình cũng đang khủng hoảng và sụp đổ năm 1991.',
        },
      ],
      realOutcome: 'Đổi Mới đã giúp GDP tăng từ ~100 USD/người (1986) lên hơn 4,000 USD/người (2023), đưa hàng triệu người thoát nghèo và hội nhập quốc tế sâu rộng.',
      analysis: 'Bài học: Cải cách kinh tế thường đến từ áp lực thực tế, không phải lý tưởng. So sánh với Trung Quốc (Đặng Tiểu Bình 1978) cho thấy mô hình tương tự có thể thành công dù hệ thống chính trị khác nhau.',
    },

    // === 4. SOURCE RANKER ===
    {
      type: 'source-ranker',
      title: 'Xếp hạng Nguồn tin',
      event: 'Một chính sách thuế mới được ban hành tại Việt Nam',
      instruction: 'Sắp xếp các nguồn tin từ đáng tin nhất → ít tin cậy nhất',
      sources: [
        {
          id: 'sr1',
          name: 'Cổng thông tin điện tử Chính phủ',
          excerpt: 'Chính phủ vừa ban hành Nghị định số XX/2024 về điều chỉnh thuế GTGT...',
          credibilityScore: 5,
          explanation: 'Nguồn chính thức từ cơ quan ban hành chính sách, độ tin cậy cao nhất.',
          greenFlags: ['Nguồn chính thức', 'Văn bản pháp lý rõ ràng'],
        },
        {
          id: 'sr2',
          name: 'Báo Tuổi Trẻ',
          excerpt: 'Phân tích tác động của chính sách thuế mới đối với người tiêu dùng...',
          credibilityScore: 4,
          explanation: 'Báo chí uy tín, có phân tích nhưng có thể có góc nhìn riêng.',
          greenFlags: ['Báo chí chính thống', 'Có phân tích'],
          redFlags: ['Có thể có bias nhẹ'],
        },
        {
          id: 'sr3',
          name: 'Fanpage "Kinh Tế Trẻ" trên Facebook',
          excerpt: 'SỐC: Thuế tăng gấp đôi! Người dân sắp không sống nổi!!',
          credibilityScore: 2,
          explanation: 'Ngôn ngữ giật gân, thiếu nguồn dẫn, có thể sai lệch.',
          redFlags: ['Clickbait', 'Không trích nguồn', 'Ngôn ngữ cảm xúc'],
        },
        {
          id: 'sr4',
          name: 'Bình luận trên TikTok',
          excerpt: 'Nghe nói thuế tăng, mình thấy chắc phải nghỉ kinh doanh thôi...',
          credibilityScore: 1,
          explanation: 'Ý kiến cá nhân không có dữ liệu, không thể kiểm chứng.',
          redFlags: ['Ý kiến cá nhân', 'Không có dữ liệu', 'Anecdotal'],
        },
      ],
    },

    // === 5. PROPAGANDA DETECTOR ===
    {
      type: 'propaganda-detector',
      title: 'Phát hiện Kỹ thuật Tuyên truyền',
      instruction: 'Đọc đoạn văn và xác định kỹ thuật tuyên truyền được sử dụng trong các phần được highlight.',
      article: {
        text: 'Mọi người yêu nước đều ủng hộ chính sách này. Nếu không hành động ngay, đất nước sẽ rơi vào khủng hoảng không thể cứu vãn. Các nước phương Tây cũng từng mắc sai lầm tương tự, vậy tại sao chúng ta phải nghe theo họ? Chuyên gia hàng đầu thế giới đã khẳng định đây là con đường duy nhất.',
        source: 'Ví dụ minh họa',
        context: 'Đoạn văn mẫu về chính sách công',
      },
      segments: [
        {
          id: 'pg1',
          text: 'Mọi người yêu nước đều ủng hộ chính sách này',
          startIndex: 0,
          techniqueType: 'bandwagon',
          explanation: 'Sử dụng áp lực đám đông: gắn "yêu nước" = "ủng hộ", ai không ủng hộ = không yêu nước.',
        },
        {
          id: 'pg2',
          text: 'đất nước sẽ rơi vào khủng hoảng không thể cứu vãn',
          startIndex: 77,
          techniqueType: 'fear-appeal',
          explanation: 'Tạo sợ hãi bằng kịch bản tồi tệ nhất để thúc đẩy hành động mà không cần suy nghĩ.',
        },
        {
          id: 'pg3',
          text: 'tại sao chúng ta phải nghe theo họ',
          startIndex: 181,
          techniqueType: 'whataboutism',
          explanation: 'Chuyển hướng: thay vì phản biện nội dung, tấn công nguồn gốc ý kiến.',
        },
        {
          id: 'pg4',
          text: 'Chuyên gia hàng đầu thế giới đã khẳng định',
          startIndex: 216,
          techniqueType: 'authority-appeal',
          explanation: 'Viện dẫn quyền lực mơ hồ ("chuyên gia hàng đầu") mà không nêu rõ ai, ở đâu.',
        },
      ],
      techniqueOptions: [
        { id: 'bandwagon', label: 'Bandwagon', description: 'Ai cũng ủng hộ → bạn cũng nên' },
        { id: 'fear-appeal', label: 'Sợ hãi', description: 'Tạo sợ hãi để thuyết phục' },
        { id: 'whataboutism', label: 'Whataboutism', description: 'Chuyển hướng sang lỗi của người khác' },
        { id: 'authority-appeal', label: 'Viện dẫn quyền lực', description: 'Dùng "chuyên gia" mơ hồ' },
      ],
    },

    // === 6. ARGUMENT MAPPER ===
    {
      type: 'argument-mapper',
      title: 'Phân tích Lập luận',
      instruction: 'Xác định các thành phần lập luận: tiền đề, kết luận, bằng chứng, và ngụy biện.',
      passage: 'Theo khảo sát, 80% người dân hài lòng với dịch vụ công. Do đó, hệ thống hành chính hiện tại hoạt động hoàn hảo. Nhà kinh tế Nguyễn Văn A cho rằng cải cách là không cần thiết. Tuy nhiên, mọi hệ thống đều cần đổi mới hoặc sẽ thất bại - đây là quy luật tự nhiên.',
      elements: [
        {
          id: 'am1',
          text: '80% người dân hài lòng với dịch vụ công',
          startIndex: 15,
          endIndex: 56,
          correctType: 'evidence',
          explanation: 'Đây là dữ liệu khảo sát, dùng làm bằng chứng cho lập luận.',
        },
        {
          id: 'am2',
          text: 'hệ thống hành chính hiện tại hoạt động hoàn hảo',
          startIndex: 66,
          endIndex: 114,
          correctType: 'conclusion',
          explanation: 'Kết luận rút ra từ bằng chứng (nhưng là kết luận quá mức — 80% hài lòng ≠ hoàn hảo).',
        },
        {
          id: 'am3',
          text: 'Nhà kinh tế Nguyễn Văn A cho rằng cải cách là không cần thiết',
          startIndex: 116,
          endIndex: 178,
          correctType: 'premise',
          explanation: 'Tiền đề dựa trên ý kiến chuyên gia để hỗ trợ kết luận.',
        },
        {
          id: 'am4',
          text: 'mọi hệ thống đều cần đổi mới hoặc sẽ thất bại - đây là quy luật tự nhiên',
          startIndex: 193,
          endIndex: 267,
          correctType: 'fallacy',
          explanation: 'Ngụy biện "false dilemma" — chỉ đưa 2 lựa chọn (đổi mới hoặc thất bại) trong khi thực tế có nhiều kịch bản.',
        },
      ],
      elementTypes: [
        { id: 'premise', label: 'Tiền đề', color: '#3b82f6' },
        { id: 'conclusion', label: 'Kết luận', color: '#10b981' },
        { id: 'evidence', label: 'Bằng chứng', color: '#f59e0b' },
        { id: 'fallacy', label: 'Ngụy biện', color: '#ef4444' },
      ],
      fallacyName: 'False Dilemma (Lưỡng nan giả)',
    },

    // === 7. SOCRATIC DIALOG ===
    {
      type: 'socratic-dialog',
      title: 'Đối thoại Socratic',
      concept: 'Tự do ngôn luận',
      introduction: 'Chào bạn! Hôm nay chúng ta sẽ cùng khám phá khái niệm "tự do ngôn luận". Bạn nghĩ tự do ngôn luận nghĩa là gì?',
      steps: [
        {
          question: 'Theo bạn, tự do ngôn luận có nghĩa là gì?',
          options: [
            {
              id: 's1a',
              text: 'Được nói bất cứ điều gì mình muốn, không giới hạn',
              followUp: 'Hmm, thú vị. Vậy nếu ai đó dùng lời nói để kích động bạo lực, liệu đó có nên được bảo vệ? Hãy nghĩ thêm...',
              isDeepening: true,
            },
            {
              id: 's1b',
              text: 'Được bày tỏ ý kiến mà không bị trừng phạt bởi nhà nước',
              followUp: 'Đúng hướng! Tự do ngôn luận trong luật pháp thường gắn với quan hệ công dân-nhà nước. Nhưng liệu có ngoại lệ không?',
              isDeepening: true,
            },
            {
              id: 's1c',
              text: 'Tôi không chắc lắm',
              followUp: 'Không sao! Hãy cùng tìm hiểu. Tự do ngôn luận là quyền bày tỏ ý kiến mà không bị chính quyền trấn áp. Nhưng có giới hạn nào không?',
              isDeepening: false,
            },
          ],
        },
        {
          question: 'Bạn nghĩ tự do ngôn luận có nên có giới hạn không?',
          options: [
            {
              id: 's2a',
              text: 'Không, tự do tuyệt đối mới là tự do thật sự',
              followUp: 'Một quan điểm mạnh mẽ! Nhưng tòa án Mỹ trong vụ Schenck v. US (1919) đã phán: "Không ai có quyền hét Cháy! trong rạp chiếu phim đông người." Vì sao lại cần giới hạn này?',
              isDeepening: true,
            },
            {
              id: 's2b',
              text: 'Có, cần giới hạn để bảo vệ người khác',
              followUp: 'Hay! Vậy ai quyết định giới hạn đó? Nếu chính quyền quyết định, liệu họ có lạm dụng quyền lực không?',
              isDeepening: true,
            },
            {
              id: 's2c',
              text: 'Tùy trường hợp, khó nói chung',
              followUp: 'Câu trả lời thận trọng và thực tế! Đúng vậy, hầu hết các nền dân chủ cân bằng giữa tự do và trách nhiệm. Cái khó là vẽ đường ranh giới ở đâu.',
              isDeepening: false,
            },
          ],
        },
        {
          question: 'Nếu phải chọn, bạn ưu tiên điều gì hơn: tự do cá nhân hay ổn định xã hội?',
          options: [
            {
              id: 's3a',
              text: 'Tự do cá nhân — không có tự do thì ổn định vô nghĩa',
              followUp: 'Benjamin Franklin từng nói: "Ai đánh đổi tự do thiết yếu lấy an toàn tạm thời, không xứng đáng có cả hai." Bạn đồng ý không?',
              isDeepening: true,
            },
            {
              id: 's3b',
              text: 'Ổn định xã hội — cần trật tự trước rồi mới tự do',
              followUp: 'Hobbes cũng nghĩ vậy trong "Leviathan" — con người cần nhà nước mạnh để tránh "chiến tranh của tất cả chống tất cả." Nhưng lịch sử cho thấy nhà nước quá mạnh có thể trở nên áp bức.',
              isDeepening: true,
            },
            {
              id: 's3c',
              text: 'Cả hai cần cân bằng',
              followUp: 'Đây là câu trả lời mà hầu hết các nền dân chủ hiện đại hướng tới! Cơ chế checks and balances chính là để duy trì sự cân bằng này.',
              isDeepening: false,
            },
          ],
        },
      ],
      revelation: 'Qua cuộc đối thoại, chúng ta thấy: Tự do ngôn luận không đơn giản là "được nói gì tùy ý." Nó là một quyền cơ bản nhưng luôn tồn tại trong sự cân bằng với trách nhiệm xã hội. Điều quan trọng là: ai vẽ ranh giới, bằng quy trình nào, và có thể bị thách thức không? Đó chính là bản chất của dân chủ — không phải đáp án hoàn hảo, mà là quy trình để tìm đáp án.',
    },

    // === 8. POLICY LAB ===
    {
      type: 'policy-lab',
      title: 'Phòng thí nghiệm Chính sách',
      description: 'Điều chỉnh các chính sách và xem tác động',
      context: 'Bạn là nhà hoạch định chính sách cho một quốc gia đang phát triển. Ngân sách có hạn, hãy phân bổ cho phù hợp.',
      policies: [
        { id: 'tax', label: 'Thuế suất', min: 10, max: 50, step: 5, defaultValue: 25, unit: '%' },
        { id: 'edu', label: 'Chi giáo dục', min: 5, max: 30, step: 5, defaultValue: 15, unit: '%GDP' },
        { id: 'health', label: 'Chi y tế', min: 5, max: 25, step: 5, defaultValue: 10, unit: '%GDP' },
        { id: 'welfare', label: 'Phúc lợi XH', min: 0, max: 20, step: 5, defaultValue: 5, unit: '%GDP' },
      ],
      indicators: [
        { id: 'growth', label: 'Tăng trưởng GDP', formula: '8 - tax * 0.1 + edu * 0.05', format: 'percent', goodRange: [4, 10] },
        { id: 'inequality', label: 'Bất bình đẳng (Gini)', formula: '50 - welfare * 0.8 - tax * 0.2', format: 'number', goodRange: [20, 35] },
        { id: 'hdi', label: 'Chỉ số HDI', formula: '0.5 + edu * 0.008 + health * 0.01 + welfare * 0.005', format: 'number', goodRange: [0.7, 1.0] },
      ],
      populations: [
        { id: 'poor', label: 'Người nghèo', impactFormula: 'welfare * 2 + health * 1.5 + edu * 0.5', description: 'Được hưởng lợi từ phúc lợi, y tế, giáo dục' },
        { id: 'middle', label: 'Tầng lớp trung lưu', impactFormula: '100 - tax * 1.2 + edu * 0.8', description: 'Bị ảnh hưởng bởi thuế, hưởng lợi từ giáo dục' },
        { id: 'business', label: 'Doanh nghiệp', impactFormula: '100 - tax * 1.5 + edu * 0.3', description: 'Ưa thích thuế thấp, lao động có học vấn' },
      ],
      insight: 'Không có chính sách nào hoàn hảo cho tất cả. Mọi lựa chọn đều có trade-off giữa tăng trưởng, bình đẳng, và phúc lợi.',
    },

    // === 9. SPECTRUM PLACER ===
    {
      type: 'spectrum-placer',
      title: 'Quang phổ Chính trị',
      instruction: 'Đặt các khái niệm/nhân vật lên phổ chính trị',
      spectrum: {
        leftLabel: 'Cánh tả',
        rightLabel: 'Cánh hữu',
        leftDescription: 'Bình đẳng, nhà nước can thiệp',
        rightDescription: 'Tự do cá nhân, thị trường tự do',
      },
      items: [
        { id: 'sp1', label: 'An sinh xã hội toàn dân', correctPosition: 20, tolerance: 15, explanation: 'Chính sách cánh tả: nhà nước đảm bảo phúc lợi cho mọi người.' },
        { id: 'sp2', label: 'Tư nhân hóa hoàn toàn', correctPosition: 85, tolerance: 10, explanation: 'Quan điểm cánh hữu: thị trường tự quản lý hiệu quả hơn nhà nước.' },
        { id: 'sp3', label: 'Kinh tế hỗn hợp', correctPosition: 50, tolerance: 15, explanation: 'Trung dung: kết hợp thị trường và can thiệp nhà nước.' },
        { id: 'sp4', label: 'Thuế suất lũy tiến cao', correctPosition: 25, tolerance: 15, explanation: 'Cánh tả ủng hộ: người giàu đóng thuế nhiều hơn để tái phân phối.' },
      ],
    },

    // === 10. PRISONER DILEMMA ===
    {
      type: 'prisoner-dilemma',
      title: 'Thế lưỡng nan của Tù nhân',
      scenario: 'Hai quốc gia láng giềng đang quyết định có hợp tác thương mại hay áp đặt thuế quan bảo hộ. Nếu cả hai hợp tác, thương mại tự do mang lợi ích chung. Nếu một bên bảo hộ trong khi bên kia mở cửa, bên bảo hộ có lợi ngắn hạn.',
      players: [
        { id: 'p1', name: 'Quốc gia A', icon: '🇦' },
        { id: 'p2', name: 'Quốc gia B', icon: '🇧' },
      ],
      rounds: 5,
      payoffMatrix: {
        bothCooperate: [3, 3],
        bothDefect: [1, 1],
        oneCooperates: [0, 5],
      },
      opponentStrategy: 'tit-for-tat',
      explanation: 'Trong quan hệ quốc tế, chiến lược "Ăn miếng trả miếng" (tit-for-tat) được chứng minh là hiệu quả nhất trong dài hạn. Hợp tác ban đầu, trừng phạt khi bị phản bội, tha thứ khi đối phương quay lại hợp tác. Đây là nền tảng của các hiệp định thương mại quốc tế.',
    },

    // === 11. TIMELINE SORTER ===
    {
      type: 'timeline-sorter',
      title: 'Dòng thời gian Dân chủ Thế giới',
      instruction: 'Sắp xếp các sự kiện dân chủ quan trọng theo thứ tự thời gian',
      events: [
        { id: 'tl1', title: 'Magna Carta (Anh)', date: '1215', year: 1215, description: 'Hạn chế quyền lực vua, quyền của quý tộc' },
        { id: 'tl2', title: 'Cách mạng Pháp', date: '1789', year: 1789, description: 'Tuyên ngôn Nhân quyền và Dân quyền' },
        { id: 'tl3', title: 'Tuyên ngôn Độc lập Mỹ', date: '1776', year: 1776, description: '"All men are created equal"' },
        { id: 'tl4', title: 'Phụ nữ được bầu cử (New Zealand)', date: '1893', year: 1893, description: 'Nước đầu tiên cho phụ nữ bỏ phiếu' },
        { id: 'tl5', title: 'UDHR - Tuyên ngôn Nhân quyền LHQ', date: '1948', year: 1948, description: '30 điều về quyền con người' },
      ],
      connections: [
        { fromId: 'tl1', toId: 'tl3', description: 'Magna Carta ảnh hưởng đến tư tưởng lập hiến Mỹ' },
        { fromId: 'tl3', toId: 'tl2', description: 'Cách mạng Mỹ truyền cảm hứng cho Cách mạng Pháp' },
        { fromId: 'tl2', toId: 'tl5', description: 'Tuyên ngôn Nhân quyền Pháp là tiền thân của UDHR' },
      ],
    },

    // === 12. CAUSE-EFFECT CHAIN ===
    {
      type: 'cause-effect-chain',
      title: 'Chuỗi Nhân-Quả: Khủng hoảng Kinh tế',
      instruction: 'Nối các sự kiện thành chuỗi nhân-quả logic',
      nodes: [
        { id: 'ce1', text: 'In tiền quá nhiều', category: 'Nguyên nhân' },
        { id: 'ce2', text: 'Lạm phát tăng cao', category: 'Hệ quả 1' },
        { id: 'ce3', text: 'Giá hàng hóa tăng', category: 'Hệ quả 2' },
        { id: 'ce4', text: 'Sức mua giảm', category: 'Hệ quả 3' },
        { id: 'ce5', text: 'Bất ổn xã hội', category: 'Hệ quả 4' },
        { id: 'ce6', text: 'Yêu cầu cải cách', category: 'Phản ứng' },
      ],
      correctConnections: [
        { fromId: 'ce1', toId: 'ce2' },
        { fromId: 'ce2', toId: 'ce3' },
        { fromId: 'ce3', toId: 'ce4' },
        { fromId: 'ce4', toId: 'ce5' },
        { fromId: 'ce5', toId: 'ce6' },
      ],
      explanation: 'Đây là chuỗi nhân quả kinh điển từ khủng hoảng kinh tế VN trước Đổi Mới (1986). Lạm phát 700% dẫn đến bất ổn xã hội, tạo áp lực cải cách kinh tế.',
    },

    // === 13. DEBATE ARENA ===
    {
      type: 'debate-arena',
      title: 'Diễn đàn Tranh luận',
      topic: 'Nên hay không nên bắt buộc bỏ phiếu trong bầu cử?',
      stances: [
        { id: 'for', label: 'Ủng hộ bắt buộc', description: 'Bỏ phiếu là nghĩa vụ công dân, nên bắt buộc như đóng thuế.' },
        { id: 'against', label: 'Phản đối bắt buộc', description: 'Tự do bao gồm cả quyền không bỏ phiếu, bắt buộc là vi phạm quyền.' },
      ],
      rounds: [
        {
          opponentArgument: 'Bắt buộc bỏ phiếu vi phạm quyền tự do cá nhân. Tự do bao gồm cả quyền KHÔNG tham gia.',
          responseOptions: [
            {
              id: 'r1a',
              text: 'Đóng thuế cũng bắt buộc nhưng không ai nói vi phạm tự do. Bỏ phiếu là nghĩa vụ tương tự.',
              score: 3,
              feedback: 'Phản biện bằng analogy mạnh! So sánh hợp lý với nghĩa vụ công dân khác.',
            },
            {
              id: 'r1b',
              text: 'Tự do cá nhân không phải tuyệt đối, cần cân bằng với trách nhiệm cộng đồng.',
              score: 2,
              feedback: 'Đúng nhưng hơi chung chung. Cần ví dụ cụ thể hơn.',
            },
            {
              id: 'r1c',
              text: 'Anh sai rồi, bỏ phiếu là quyền thiêng liêng, phải bắt buộc!',
              score: 0,
              feedback: 'Ngụy biện appeal to emotion. Không có logic, chỉ có cảm xúc.',
            },
          ],
        },
        {
          opponentArgument: 'Ở Úc bắt buộc bỏ phiếu, nhưng nhiều người bỏ phiếu trắng. Vậy bắt buộc có ý nghĩa gì?',
          responseOptions: [
            {
              id: 'r2a',
              text: 'Phiếu trắng cũng là biểu đạt ý kiến — "tôi không đồng ý với ai cả." Đó cũng có giá trị.',
              score: 3,
              feedback: 'Xuất sắc! Phiếu trắng có ý nghĩa dân chủ, khác với không bỏ phiếu.',
            },
            {
              id: 'r2b',
              text: 'Tỷ lệ tham gia tăng vẫn tốt hơn là để thấp.',
              score: 2,
              feedback: 'Đúng nhưng chưa trả lời trực tiếp câu hỏi về phiếu trắng.',
            },
            {
              id: 'r2c',
              text: 'Đó là do Úc thực hiện chưa tốt, không phải lỗi của chính sách.',
              score: 1,
              feedback: 'Phản biện yếu — đổ lỗi cho thực hiện mà không giải quyết vấn đề gốc.',
            },
          ],
        },
      ],
      conclusion: 'Tranh luận về bỏ phiếu bắt buộc phản ánh căng thẳng cốt lõi của dân chủ: giữa quyền cá nhân và trách nhiệm cộng đồng. Không có câu trả lời tuyệt đối — nhưng quá trình tranh luận chính là bản chất của dân chủ.',
    },

    // === 14. DECISION TREE ===
    {
      type: 'decision-tree',
      title: 'Kịch bản: Nhà Lãnh đạo',
      scenario: 'Bạn là thị trưởng một thành phố đang phát triển. Dân số tăng nhanh, hạ tầng quá tải, và người dân ngày càng bất mãn. Ngân sách có hạn — bạn phải đưa ra quyết định.',
      role: 'Thị trưởng',
      startNodeId: 'n1',
      nodes: [
        {
          id: 'n1',
          text: 'Vấn đề cấp bách nhất: giao thông tắc nghẽn, trường học quá tải, và ô nhiễm không khí. Bạn chỉ có ngân sách cho 1 dự án lớn. Chọn ưu tiên:',
          choices: [
            { id: 'c1a', text: 'Xây metro', nextNodeId: 'n2', consequence: 'Dự án metro cần 5 năm và ngốn 60% ngân sách.' },
            { id: 'c1b', text: 'Xây thêm trường học', nextNodeId: 'n3', consequence: 'Trường mới xây xong trong 2 năm, nhưng giao thông vẫn tệ.' },
            { id: 'c1c', text: 'Đầu tư năng lượng sạch', nextNodeId: 'n4', consequence: 'Giảm ô nhiễm nhưng không giải quyết quá tải hạ tầng.' },
          ],
        },
        {
          id: 'n2',
          text: 'Dự án metro gặp phản đối từ dân cư khu vực thi công. Họ biểu tình đòi dừng dự án.',
          choices: [
            { id: 'c2a', text: 'Đối thoại và đền bù hợp lý', nextNodeId: 'n5' },
            { id: 'c2b', text: 'Tiếp tục thi công, bỏ qua phản đối', nextNodeId: 'n6' },
          ],
        },
        {
          id: 'n3',
          text: 'Trường mới xây xong, nhưng không đủ giáo viên. Chất lượng giáo dục giảm.',
          choices: [
            { id: 'c3a', text: 'Tăng lương giáo viên để thu hút', nextNodeId: 'n5' },
            { id: 'c3b', text: 'Cho phép trường tư nhân hoạt động', nextNodeId: 'n7' },
          ],
        },
        {
          id: 'n4',
          text: 'Năng lượng sạch giảm ô nhiễm 30%, nhưng chi phí điện tăng 20%.',
          choices: [
            { id: 'c4a', text: 'Trợ giá điện cho người nghèo', nextNodeId: 'n5' },
            { id: 'c4b', text: 'Để thị trường tự điều chỉnh', nextNodeId: 'n6' },
          ],
        },
        {
          id: 'n5',
          text: 'Bạn đã cân bằng giữa phát triển và quyền lợi người dân.',
          choices: [],
          isEnding: true,
          endingType: 'good',
          endingSummary: 'Tuy không hoàn hảo, nhưng bạn đã lắng nghe người dân và tìm giải pháp cân bằng. Đây là tinh thần quản trị dân chủ.',
        },
        {
          id: 'n6',
          text: 'Sự bất mãn tăng cao, truyền thông quốc tế chú ý, và nhà đầu tư e ngại.',
          choices: [],
          isEnding: true,
          endingType: 'bad',
          endingSummary: 'Bỏ qua tiếng nói người dân luôn có hậu quả. Phát triển bền vững đòi hỏi sự tham gia và đồng thuận.',
        },
        {
          id: 'n7',
          text: 'Trường tư nhân tăng lên, giáo dục phân hóa giàu-nghèo rõ rệt.',
          choices: [],
          isEnding: true,
          endingType: 'neutral',
          endingSummary: 'Giải pháp nhanh nhưng tạo bất bình đẳng mới. Giáo dục tư nhân hóa hoàn toàn có thể gây chia rẽ xã hội.',
        },
      ],
    },

    // === 15. AI ESSAY REVIEW ===
    {
      type: 'ai-essay-review',
      title: 'Bài viết Phân tích',
      prompt: 'Phân tích tại sao tự do báo chí lại quan trọng đối với một xã hội dân chủ. Đưa ra ít nhất 2 lý do và 1 ví dụ cụ thể.',
      minWords: 50,
      maxWords: 200,
      rubric: [
        {
          id: 'r1',
          label: 'Lập luận',
          description: 'Có luận điểm rõ ràng và logic',
          keywords: ['tự do', 'báo chí', 'dân chủ', 'quyền', 'giám sát', 'minh bạch', 'trách nhiệm'],
          maxScore: 3,
        },
        {
          id: 'r2',
          label: 'Bằng chứng',
          description: 'Có ví dụ cụ thể minh họa',
          keywords: ['ví dụ', 'trường hợp', 'watergate', 'panama papers', 'tham nhũng', 'điều tra', 'vụ'],
          maxScore: 3,
        },
        {
          id: 'r3',
          label: 'Phản biện',
          description: 'Nhìn nhận nhiều góc độ',
          keywords: ['tuy nhiên', 'mặt khác', 'nhưng', 'giới hạn', 'trách nhiệm', 'fake news', 'lạm dụng'],
          maxScore: 2,
        },
        {
          id: 'r4',
          label: 'Cấu trúc',
          description: 'Bài viết có bố cục rõ ràng',
          keywords: ['thứ nhất', 'thứ hai', 'kết luận', 'tóm lại', 'do đó', 'vì vậy', 'tóm lại'],
          maxScore: 2,
        },
      ],
      sampleResponse: 'Tự do báo chí là trụ cột của dân chủ vì hai lý do chính. Thứ nhất, báo chí tự do giám sát quyền lực — khi nhà báo được tự do điều tra, tham nhũng khó ẩn giấu. Ví dụ: vụ Watergate (1972) cho thấy báo chí Mỹ buộc tổng thống Nixon từ chức. Thứ hai, báo chí giúp công dân đưa ra quyết định có thông tin khi bầu cử. Tuy nhiên, tự do báo chí cũng cần trách nhiệm — fake news và tin giật gân là mặt trái cần giải quyết. Tóm lại, không có báo chí tự do, dân chủ chỉ là hình thức.',
      tips: [
        'Bắt đầu bằng một câu khẳng định rõ quan điểm',
        'Đưa ít nhất 1 ví dụ cụ thể (tên sự kiện, năm, quốc gia)',
        'Nhìn nhận cả mặt tích cực và hạn chế',
        'Kết bài bằng một câu tổng kết mạnh mẽ',
      ],
    },
  ];

  await prisma.lessonContent.create({
    data: {
      lessonId: lesson.id,
      title: 'Test: 15 Block Types Gamification v2',
      blocks: blocks as any,
    },
  });

  console.log(`Created lesson content with ${blocks.length} blocks`);
  console.log('Done! Test lesson slug: gamification-v2-test');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
