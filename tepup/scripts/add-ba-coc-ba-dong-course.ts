/**
 * Script to ADD "Ba Cọc Ba Đồng: Kinh Tế Học Của Người Đi Làm" course to the database.
 *
 * Based on: Oddly Normal Podcast — "Ba Cọc Ba Đồng" episode
 * Transcript: transcript_ba_coc_ba_dong_part1.txt + transcript_ba_coc_ba_dong_part2.txt
 * Shownote: https://oddly-podcast.com/episode/ba-coc-ba-dong
 * References: "A Random Walk Down Wall Street" (Malkiel), "The Spirit Level" (Wilkinson & Pickett),
 *             "21 Lessons for the 21st Century" (Harari), "Noise" (Kahneman et al.)
 *
 * PHASED APPROACH:
 * - Phase 1 (this run): Course structure + Level 1 content (3 lessons)
 * - Phase 2: Level 2 content (4 lessons — Bẫy Tiêu Dùng)
 * - Phase 3: Level 3 content (5 lessons — Bong Bóng & Đầu Cơ)
 * - Phase 4: Level 4 content (4 lessons — Dữ Liệu & AI)
 * - Phase 5: Level 5 content (4 lessons — Tương Lai)
 *
 * Run with: npx tsx scripts/add-ba-coc-ba-dong-course.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// Course structure definition
// ─────────────────────────────────────────────
const BA_COC_BA_DONG_COURSE = {
  slug: 'ba-coc-ba-dong',
  name: 'Ba Cọc Ba Đồng: Kinh Tế Học Của Người Đi Làm',
  description:
    'Từ câu thành ngữ quen thuộc về thu nhập cố định, khám phá hành trình của lao động trong thế giới tư bản — bong bóng đầu cơ, bẫy tiêu dùng, AI và tương lai của công việc.',
  icon: 'briefcase',
  isNew: true,
  levels: [
    {
      name: '"Ba Cọc Ba Đồng" — Bức Tranh Toàn Cảnh',
      lessons: [
        { id: 'bacoc-1-1', name: 'Ba Cọc Ba Đồng là gì? — Bức tranh thu nhập cố định' },
        { id: 'bacoc-1-2', name: 'Từ nô lệ đến công chức — Lịch sử 3.000 năm của lao động' },
        { id: 'bacoc-1-3', name: 'Tự do QUA công việc hay tự do KHỎI công việc?' },
      ],
    },
    {
      name: 'Bẫy Tiêu Dùng — Khi Tư Bản Chơi Khăm Chúng Ta',
      lessons: [
        { id: 'bacoc-2-1', name: 'Mua để khoe — Conspicuous Consumption' },
        { id: 'bacoc-2-2', name: 'Sản phẩm cố tình hỏng — Planned Obsolescence' },
        { id: 'bacoc-2-3', name: 'Quảng cáo ăn cắp — Khi công ty biết bạn hơn cả bạn biết mình' },
        { id: 'bacoc-2-4', name: 'Nghịch lý của sự lựa chọn — Càng nhiều càng kém hạnh phúc' },
      ],
    },
    {
      name: 'Bong Bóng & Đầu Cơ — Từ Hoa Tulip Đến Memecoin',
      lessons: [
        { id: 'bacoc-3-1', name: 'Bong bóng hoa Tulip — Khi cả xã hội phát điên vì hoa' },
        { id: 'bacoc-3-2', name: 'Thuyết Kẻ Ngốc Lớn Hơn — Greater Fool Theory' },
        { id: 'bacoc-3-3', name: 'Memecoin và Đầu Cơ Hiện Đại — Trump Coin đến Ngọc Hoàng Coin' },
        { id: 'bacoc-3-4', name: 'Thị Trường Hiệu Quả hay "Ông Trời Có Mắt"?' },
        { id: 'bacoc-3-5', name: 'Random Walk — Thị trường có thể đoán được không?' },
      ],
    },
    {
      name: 'Dữ Liệu & AI — Lao Động Của Thế Kỷ 21',
      lessons: [
        { id: 'bacoc-4-1', name: 'Dữ liệu là lao động mới — Google và Facebook khai thác bạn miễn phí' },
        { id: 'bacoc-4-2', name: 'Amazon Mechanical Turk — Khi AI vẫn cần con người' },
        { id: 'bacoc-4-3', name: 'AI và Thiên Kiến — Khi máy móc phân biệt đối xử' },
        { id: 'bacoc-4-4', name: 'Kinh Tế Dân Chủ — Hợp tác xã và tương lai tổ chức lao động' },
      ],
    },
    {
      name: 'Tương Lai — Tái Định Nghĩa "Ba Cọc Ba Đồng"',
      lessons: [
        { id: 'bacoc-5-1', name: 'Thu Nhập Cơ Bản Phổ Quát (UBI) — Được trả tiền chỉ vì tồn tại' },
        { id: 'bacoc-5-2', name: 'Thu Nhập Tham Gia (Participation Income) — Giải pháp thay thế UBI' },
        { id: 'bacoc-5-3', name: 'Việt Nam Trong Nền Kinh Tế Toàn Cầu — Rủi ro và cơ hội' },
        { id: 'bacoc-5-4', name: 'Tái Định Nghĩa Công Việc — Tương lai nào cho lao động?' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// Level 1 lesson content
// (Levels 2-5 sẽ được thêm trong các phiên tiếp theo)
// ─────────────────────────────────────────────
const lessonContents: Record<string, { title: string; blocks: any[] }> = {
  // ────────────────────────────────────────────────────────────────
  // LESSON 1: Ba Cọc Ba Đồng là gì? — Bức tranh thu nhập cố định
  // ────────────────────────────────────────────────────────────────
  'bacoc-1-1': {
    title: 'Ba Cọc Ba Đồng là gì? — Bức tranh thu nhập cố định',
    blocks: [
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Bạn đã bao giờ nghe ai đó nói về công việc của mình là "ba cọc ba đồng" chưa? Câu thành ngữ này quen đến mức ta dùng mà không nghĩ, nhưng ẩn sau nó là cả một thế giới kinh tế phức tạp.',
          'Trong bài học mở đầu này, chúng ta sẽ cùng nhau "giải mã" câu thành ngữ ấy — từ nghĩa gốc, đến bối cảnh văn hóa xã hội, và xa hơn là liên hệ của nó với mô hình lao động đang chi phối cuộc sống của hàng tỷ người trên toàn thế giới.',
          'Đây cũng là điểm khởi đầu cho hành trình khám phá kinh tế học theo cách mà podcast Oddly Normal dẫn dắt: không phải qua những con số khô khan, mà qua những câu chuyện rất đời thường.',
        ],
      },
      {
        type: 'callout',
        icon: 'quote',
        title: 'Mở đầu podcast — Oddly Normal',
        text: '"Ba cọc ba đồng" — đây là một cụm từ ngày xưa mẹ tôi rất hay dùng. Ngay từ hôm đầu tiên brainstorm với khách mời, tôi đã biết mình sẽ chọn nó làm tên podcast. Thành ngữ này chỉ thu nhập hàng tháng với sắc thái rằng thu nhập này cố định và ít ỏi. Nó thường được dùng để miêu tả sự nghiệp của các viên chức nhà nước, nhưng cũng chỉ hoạt động làm công ăn lương nói chung — mà hầu như tất cả mọi người đều đang tham gia thực hiện trên quy mô lớn.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Ba cọc ba đồng — Nghĩa gốc và sắc thái kép',
        paragraphs: [
          'Về mặt ngôn ngữ, "ba cọc ba đồng" là một thành ngữ Việt Nam chỉ mức thu nhập nhỏ, cố định — vừa đủ sống qua ngày. Trong tiếng Việt hiện đại, nó mang cả hai sắc thái cùng lúc: cảm giác an toàn của sự ổn định (biết chắc mỗi tháng có tiền) lẫn cảm giác bất an vì thu nhập ít ỏi không đủ để mơ ước thêm.',
          'Thành ngữ này gắn chặt nhất với hình ảnh công chức nhà nước — người làm "ăn theo nhà nước", có biên chế, không sợ mất việc nhưng cũng không giàu nổi. Thế nhưng trong thực tế, "ba cọc ba đồng" mô tả chính xác trải nghiệm của hàng tỷ người: từ nhân viên văn phòng ở Hà Nội, kỹ sư phần mềm ở Silicon Valley, đến nhà khoa học làm nghiên cứu ở London.',
          'Podcast Oddly Normal đưa ra một quan sát thú vị: làm công ăn lương vừa đem lại "cảm giác an toàn về sự cố định, lẫn cảm giác bất an về sự ít ỏi" — đây là nghịch lý nền tảng của mô hình kinh tế hiện đại.',
        ],
      },
      {
        type: 'image',
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ikea_work_environment.jpg/1280px-Ikea_work_environment.jpg',
        alt: 'Không gian làm việc văn phòng hiện đại — biểu tượng của mô hình làm công ăn lương',
        caption: 'Làm công ăn lương — mô hình lao động chi phối cuộc sống của hàng tỷ người. Nguồn: Wikimedia Commons (CC BY-SA 2.0)',
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Wage Labor — Quy mô toàn cầu',
        text: 'Theo Tổ chức Lao động Quốc tế (ILO), hơn 3,3 tỷ người trên thế giới là người làm công ăn lương — tức là họ bán sức lao động theo giờ hoặc theo tháng đổi lấy tiền lương. Đây là mô hình lao động phổ biến nhất trong lịch sử nhân loại kể từ Cách mạng Công nghiệp.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Câu hỏi trung tâm của khoá học',
        paragraphs: [
          'Tại sao hàng tỷ người "bán" thời gian của mình cho người khác? Điều gì đã khiến mô hình này trở thành chuẩn mực? Và quan trọng hơn — liệu nó có mãi mãi như vậy không?',
          'Podcast Oddly Normal tiếp cận những câu hỏi này qua ba góc nhìn: Trang — một nhà khoa học, Cường — một chuyên gia tài chính làm việc tại London trong lĩnh vực chứng khoán, và Vông — người dẫn chương trình. Cường đại diện cho người đang làm việc trực tiếp trong "trái tim" của hệ thống tư bản — nhưng cũng là người phê phán nó gay gắt nhất.',
          'Đây không phải là khoá học kinh tế trừu tượng. Chúng ta sẽ đi từ câu thành ngữ quen thuộc, qua lịch sử của lao động, bong bóng đầu cơ, dữ liệu và AI, đến những câu hỏi về tương lai của công việc — và tương lai của chính chúng ta trong đó.',
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Wage Labor (Làm công ăn lương) là gì?',
        description: 'Tổng quan về nguồn gốc và đặc điểm của mô hình làm công ăn lương trong kinh tế học hiện đại',
        category: 'Kinh tế học',
        estimatedReadTime: '5 phút',
        documentContent: {
          sections: [
            {
              heading: 'Định nghĩa',
              paragraphs: [
                'Wage labor (làm công ăn lương) là mối quan hệ kinh tế trong đó người lao động bán sức lao động của mình — thời gian, kỹ năng, công sức — cho người sử dụng lao động đổi lấy tiền lương (wage) hoặc lương tháng (salary).',
                'Điểm khác biệt cơ bản so với các hình thức lao động khác: người lao động không sở hữu công cụ sản xuất, không sở hữu sản phẩm làm ra, và thường không kiểm soát được quá trình làm việc của mình.',
              ],
            },
            {
              heading: 'Lịch sử ngắn gọn',
              paragraphs: [
                'Mặc dù trao đổi lao động lấy thù lao đã tồn tại từ thời cổ đại, nhưng wage labor theo nghĩa hiện đại — tức là hình thức lao động chủ đạo của toàn bộ nền kinh tế — chỉ xuất hiện rộng rãi từ Cách mạng Công nghiệp (cuối thế kỷ 18, đầu thế kỷ 19).',
                'Trước đó, phần lớn dân số là nông dân tự canh tác, thợ thủ công tự kinh doanh, hoặc nô lệ/nông nô. Cách mạng Công nghiệp đã tạo ra các nhà máy cần nhiều công nhân — và đồng thời tước đoạt đất đai của nông dân, buộc họ phải vào thành thị tìm việc.',
              ],
            },
            {
              heading: 'Đặc điểm trong thế giới hiện đại',
              paragraphs: [
                'Ngày nay, wage labor là mô hình lao động phổ biến nhất toàn cầu. Tuy nhiên, ranh giới giữa "nhân viên" và "tự kinh doanh" ngày càng mờ dần với sự xuất hiện của gig economy (kinh tế công việc tự do) — Uber, Grab, Upwork, v.v.',
                'Xu hướng mới: nhiều người "hưởng lương" từ nhiều nguồn khác nhau, làm việc từ xa, hoặc có thu nhập từ nền tảng số. Câu hỏi đặt ra: mô hình "ba cọc ba đồng" truyền thống có còn phù hợp với thế kỷ 21?',
              ],
            },
          ],
          relatedConcepts: ['Lao động', 'Chủ nghĩa tư bản', 'Gig economy', 'Biên chế'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/Wage_labour',
            'https://en.wikipedia.org/wiki/Industrial_Revolution',
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Checkpoint — Bạn đã học được gì?',
        text: '✓ "Ba cọc ba đồng" chỉ thu nhập cố định, ít ỏi — mang sắc thái kép: an toàn lẫn bất an\n✓ Wage labor là mô hình lao động phổ biến nhất thế giới, với hơn 3,3 tỷ người làm công ăn lương\n✓ Khoá học này sẽ khám phá nguồn gốc lịch sử, nghịch lý của hệ thống, và tương lai của mô hình lao động này',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'Theo podcast Oddly Normal, thành ngữ "ba cọc ba đồng" mang sắc thái kép nào?',
        options: [
          {
            id: 'a',
            text: 'Cảm giác giàu có và cảm giác tự hào',
            isCorrect: false,
          },
          {
            id: 'b',
            text: 'Cảm giác an toàn về sự cố định, lẫn cảm giác bất an về sự ít ỏi',
            isCorrect: true,
          },
          {
            id: 'c',
            text: 'Cảm giác tự do và cảm giác trách nhiệm',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'Cảm giác ổn định và cảm giác nhàm chán',
            isCorrect: false,
          },
        ],
        explanation: 'Podcast mô tả chính xác: "ba cọc ba đồng" vừa đem lại "cảm giác an toàn về sự cố định" (biết chắc mỗi tháng có tiền), lẫn "cảm giác bất an về sự ít ỏi" (không đủ để mơ ước thêm). Đây là nghịch lý nền tảng của mô hình làm công ăn lương.',
      },
      {
        type: 'text',
        title: 'Tổng kết và nhìn về phía trước',
        paragraphs: [
          'Chúng ta vừa đặt nền tảng đầu tiên: hiểu "ba cọc ba đồng" không chỉ là hiểu một thành ngữ, mà là hiểu bức tranh toàn cảnh của mô hình lao động hiện đại — từ Việt Nam đến toàn cầu.',
          'Nhưng câu hỏi thực sự thú vị hơn là: mô hình này từ đâu đến? Tại sao hàng tỷ người lại đồng ý "bán" thời gian của mình? Và tại sao không phải lúc nào cũng như vậy?',
          'Bài học tiếp theo sẽ đưa bạn vào cuộc hành trình 3.000 năm — từ những người nô lệ Hy Lạp cổ đại cho đến văn phòng hiện đại — để trả lời câu hỏi: lao động đã được định nghĩa lại như thế nào qua lịch sử?',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 2: Từ nô lệ đến công chức — Lịch sử 3.000 năm của lao động
  // ────────────────────────────────────────────────────────────────
  'bacoc-1-2': {
    title: 'Từ nô lệ đến công chức — Lịch sử 3.000 năm của lao động',
    blocks: [
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Ngày nay khi ai đó nói họ không có việc làm, chúng ta nhìn họ với một ánh mắt kỳ thị nào đó — "lười biếng", "thất bại", "không có ích". Nhưng nếu sống ở Hy Lạp cổ đại, câu chuyện sẽ hoàn toàn ngược lại.',
          'Bài học này sẽ đưa bạn qua 3.000 năm lịch sử để trả lời một câu hỏi tưởng chừng đơn giản: Tại sao chúng ta làm việc? Không phải tại sao chúng ta CẦN làm việc — mà tại sao chúng ta CÒN TIN rằng làm việc là điều tốt, thậm chí là nghĩa vụ đạo đức?',
          'Câu trả lời sẽ dẫn bạn qua xã hội nguyên thủy, chế độ nô lệ Hy Lạp, Cách mạng Công nghiệp, và cuối cùng đến văn phòng hiện đại — để thấy rằng khái niệm "làm việc là đức hạnh" không phải là chân lý vĩnh cửu, mà là một cấu trúc xã hội được tạo ra có chủ đích.',
        ],
      },
      {
        type: 'callout',
        icon: 'quote',
        title: 'Từ transcript — Trang nói về lịch sử lao động',
        text: '"Hồi xã hội nguyên thủy, loài người bỏ khoảng 5 tiếng một ngày để kiếm ăn — săn bắt hái lượm, ngủ mắt 8 tiếng. Thế là còn 11 tiếng làm các hoạt động khác như bắt chấy, tán gẫu, thờ cúng... Việc kiếm ăn này chắc là cái hình thức quốc lao động đầu tiên đấy. Người nguyên thủy không có cách để dành thức ăn được lâu nên cũng chẳng ai làm thêm giờ để dành cho tương lai làm gì."',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Chương 1: Trước khi có "công việc"',
        paragraphs: [
          'Con người sống trong các xã hội săn bắt hái lượm trong phần lớn lịch sử tiến hóa — khoảng 95% thời gian tồn tại của loài người. Theo các nhà nhân chủng học, người nguyên thủy chỉ cần khoảng 4-5 giờ mỗi ngày để đảm bảo thức ăn. Thời gian còn lại là giao tiếp xã hội, nghỉ ngơi, và các hoạt động tâm linh.',
          'Không có khái niệm "làm thêm giờ". Không có tích lũy. Cộng đồng nhỏ (dưới 150 người theo ngưỡng Dunbar) không có phân cấp xã hội phức tạp. Mọi người làm việc đủ để sống — không hơn.',
          'Khi nông nghiệp xuất hiện (khoảng 10.000 năm trước), mọi thứ thay đổi. Lần đầu tiên con người có thể dự trữ thức ăn — và điều đó tạo ra sự dư thừa, tạo ra phân cấp xã hội, và tạo ra các hình thức lao động cưỡng bức đầu tiên.',
        ],
      },
      {
        type: 'image',
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Plato-raphael.jpg/800px-Plato-raphael.jpg',
        alt: 'Tranh "Trường Athens" của Raphael — các triết gia Hy Lạp cổ đại, những người tự hào về việc KHÔNG phải lao động chân tay',
        caption: '"Trường Athens" (Raphael, 1509-1511). Các triết gia như Plato và Aristotle sống trong thế giới nơi lao động chân tay là dấu hiệu của nô lệ, không phải công dân tự do. Nguồn: Wikimedia Commons (Public Domain)',
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Nghịch lý lớn nhất của lịch sử lao động',
        text: 'Ở Hy Lạp cổ đại, nếu ai hỏi Pythagoras, Archimedes, hay Hippocrates "Bạn có đi làm không?" — họ sẽ trả lời: Tôi là "lazy thinker" (người suy nghĩ nhàn rỗi), tôi có TỰ DO. Lao động chân tay là việc của nô lệ. "Lazy thinker" là biểu tượng của công dân gương mẫu — như kiểu bạn mang túi LV ra ngoài để "flex" vậy. Ngược lại, nếu bạn là laborer (người lao động), bạn bị loại ra ngoài rìa xã hội.',
        variant: 'warning',
      },
      {
        type: 'text',
        title: 'Chương 2: Cách mạng Công nghiệp lật ngược mọi thứ',
        paragraphs: [
          'Từ Cách mạng Công nghiệp (cuối thế kỷ 18), khái niệm "công việc" được định nghĩa lại hoàn toàn. Trước đó, hầu hết người dân là nông dân tự canh tác — họ làm việc cho mình, trên đất của mình. Cách mạng Công nghiệp tước đoạt đất đai của nông dân qua phong trào "enclosure" (rào đất), buộc hàng triệu người phải vào thành thị và làm thuê trong các nhà máy.',
          'Đây là lần đầu tiên wage labor — làm công ăn lương — trở thành mô hình lao động chính của toàn bộ nền kinh tế. Và cùng với sự thay đổi kinh tế này là sự thay đổi tư tưởng: làm việc không còn là ô nhục — mà trở thành NGHĨA VỤ ĐẠO ĐỨC.',
          'Podcast nhận xét: Có thể coi đây như "một video cũ trên YouTube mà đến thời tư bản thì được thuật toán giúp cho lên thành viral". Tư tưởng "lao động là đức hạnh" không phải mới — nó tồn tại trong tôn giáo từ lâu. Nhưng chủ nghĩa tư bản là lực kinh tế "khuếch đại" nó lên, biến nó thành chuẩn mực xã hội toàn diện.',
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: Protestant Work Ethic — Đạo Đức Công Việc theo Max Weber',
        description: 'Lý thuyết của nhà xã hội học Max Weber về mối liên hệ giữa đạo Tin Lành và sự phát triển của chủ nghĩa tư bản',
        category: 'Lịch sử kinh tế',
        estimatedReadTime: '6 phút',
        documentContent: {
          sections: [
            {
              heading: 'Max Weber và "Đạo Đức Tin Lành và Tinh Thần Tư Bản"',
              paragraphs: [
                'Năm 1905, nhà xã hội học người Đức Max Weber xuất bản "Die protestantische Ethik und der Geist des Kapitalismus" (Đạo đức Tin Lành và tinh thần chủ nghĩa tư bản). Đây là một trong những tác phẩm xã hội học ảnh hưởng nhất thế kỷ 20.',
                'Luận điểm của Weber: Đạo Tin Lành (đặc biệt là phái Calvin) đã tạo ra một hệ giá trị đạo đức mới, trong đó làm việc chăm chỉ, tiết kiệm, và tích lũy tài sản KHÔNG phải là tội lỗi — mà là bằng chứng cho thấy bạn được Chúa chọn để cứu rỗi (doctrine of predestination).',
              ],
            },
            {
              heading: 'Từ "lười biếng là tốt" đến "lười biếng là xấu"',
              paragraphs: [
                'Theo Weber, sự chuyển đổi tư tưởng diễn ra trong vài thế kỷ: Trước Cải cách Tôn giáo, Nhà thờ Công giáo coi việc tích lũy tài sản là tội lỗi (greed = tham lam = tội). Sau Cải cách, phái Tin Lành coi tích lũy là dấu hiệu được Chúa ban phước.',
                'Kết quả: các cộng đồng Tin Lành tập trung ở Bắc Âu (Hà Lan, Anh, Đức, Thụy Điển) trở nên giàu có và tích lũy tư bản nhanh hơn — đồng thời sản sinh ra tư tưởng "làm việc chăm chỉ là đức hạnh". Đây không phải ngẫu nhiên mà là hệ quả của hệ thống giá trị tôn giáo.',
              ],
            },
            {
              heading: 'Ảnh hưởng đến ngày nay',
              paragraphs: [
                'Ngày nay, dù không còn nhiều người tin vào thần học Calvin, nhưng "work ethic" — tinh thần làm việc chăm chỉ — vẫn là giá trị được đề cao trong hầu hết xã hội tư bản. "Hustle culture" (văn hóa làm việc không ngừng) ở Silicon Valley là một hình thức hiện đại của Protestant Work Ethic.',
                'Câu hỏi Weber đặt ra vẫn còn nguyên tính thời sự: Liệu chúng ta làm việc vì chúng ta thực sự muốn? Hay vì chúng ta đã bị lập trình bởi một hệ thống giá trị được tạo ra để phục vụ cho chủ nghĩa tư bản?',
              ],
            },
          ],
          relatedConcepts: ['Cách mạng Công nghiệp', 'Chủ nghĩa tư bản', 'Wage labor', 'Hustle culture'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/The_Protestant_Ethic_and_the_Spirit_of_Capitalism',
            'https://en.wikipedia.org/wiki/Protestant_work_ethic',
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Checkpoint — Bạn đã học được gì?',
        text: '✓ Người nguyên thủy chỉ làm việc ~5 giờ/ngày — không có khái niệm "làm thêm giờ"\n✓ Hy Lạp cổ đại: "lazy thinker" (không làm việc) = tự do; lao động chân tay = nô lệ\n✓ Cách mạng Công nghiệp lật ngược: làm công ăn lương trở thành mô hình lao động chủ đạo\n✓ Protestant Work Ethic (Weber): đạo đức Tin Lành biến lao động từ "gánh nặng" thành "đức hạnh"\n✓ "Lazy thinker is cool" → "Lazy people are bad" — đây là sự thay đổi tư tưởng lớn nhất trong lịch sử lao động',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'Theo podcast và lý thuyết của Max Weber, điều gì đã biến lao động từ "gánh nặng ô nhục" thành "đức hạnh" trong xã hội tư bản?',
        options: [
          {
            id: 'a',
            text: 'Chính phủ ban hành luật bắt buộc mọi người phải đi làm',
            isCorrect: false,
          },
          {
            id: 'b',
            text: 'Tiến bộ khoa học kỹ thuật giúp công việc trở nên nhẹ nhàng và thú vị hơn',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'Sự kết hợp giữa đạo đức Tin Lành (làm việc = được Chúa chọn) và lợi ích kinh tế của giai cấp tư sản mới nổi',
            isCorrect: true,
          },
          {
            id: 'd',
            text: 'Con người phát hiện ra rằng làm việc giúp họ hạnh phúc hơn về mặt tâm lý',
            isCorrect: false,
          },
        ],
        explanation: 'Đây là luận điểm trung tâm của Max Weber: sự chuyển đổi tư tưởng về lao động không phải là tự nhiên hay ngẫu nhiên, mà là sản phẩm của hai lực lượng kết hợp — hệ thống giá trị đạo đức của đạo Tin Lành (lao động chăm chỉ = được Chúa chọn) và lợi ích kinh tế của giai cấp tư sản cần lực lượng lao động tự nguyện. Podcast diễn đạt điều này rất hình tượng: "Như một video cũ trên YouTube mà đến thời tư bản thì được thuật toán giúp cho lên thành viral."',
      },
      {
        type: 'text',
        title: 'Tổng kết và nhìn về phía trước',
        paragraphs: [
          'Trong bài học này, chúng ta đã thấy rằng khái niệm "làm việc là nghĩa vụ đạo đức" không phải là chân lý vĩnh cửu — nó là một cấu trúc xã hội được xây dựng qua hàng thế kỷ, với sự đóng góp của tôn giáo, chính trị, và kinh tế.',
          'Người Hy Lạp cổ đại tự hào vì KHÔNG làm việc. Người nguyên thủy làm việc chỉ 5 tiếng một ngày. Chúng ta làm việc 8-10 tiếng và cảm thấy tội lỗi khi nghỉ ngơi. Điều gì đã xảy ra?',
          'Bài học tiếp theo sẽ đi sâu hơn vào nghịch lý cốt lõi: Chủ nghĩa tư bản hứa hẹn "tự do" — nhưng tự do này có nghĩa là gì khi bạn buộc phải làm việc để tồn tại?',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // LESSON 3: Tự do QUA công việc hay tự do KHỎI công việc?
  // ────────────────────────────────────────────────────────────────
  'bacoc-1-3': {
    title: 'Tự do QUA công việc hay tự do KHỎI công việc?',
    blocks: [
      {
        type: 'text',
        title: 'Trong bài học này bạn sẽ học được gì?',
        paragraphs: [
          'Chủ nghĩa tư bản được xây dựng trên nền tảng của "tự do" — tự do hợp đồng, tự do thị trường, tự do lựa chọn. Nhưng đây là loại tự do gì khi mà không làm việc đồng nghĩa với chết đói?',
          'Bài học này sẽ đặt bạn trước cuộc đối thoại thực sự xảy ra trong podcast: Cường — người đang làm việc trong lòng hệ thống tài chính tư bản — và sự mâu thuẫn nội tâm của một người vừa phê phán hệ thống, vừa phụ thuộc vào nó để sống.',
          'Qua đó, chúng ta sẽ khám phá một trong những nghịch lý sâu sắc nhất của kinh tế học hiện đại: Khi "tự do" trở thành một ảo tưởng được đóng gói đẹp đẽ, làm sao chúng ta nhận ra ranh giới giữa lựa chọn thực sự và sự ép buộc mang mặt nạ?',
        ],
      },
      {
        type: 'callout',
        icon: 'quote',
        title: 'Cường — Nghịch lý của người phê phán hệ thống',
        text: '"Mặt thì mình rất là không thích cái thực đoàn của bên tư bản. Nó tạo ra rất là nhiều suy chết trong xã hội, tạo ra bất bình đẳng này, tiêu dùng quá mức, hủy hoại thiên nhiên hay là đàm biến đổi khí hậu... Mặt khác thì thật ra nếu mà không có trục nhiệm tư bản và cơ chế phân phối tài nguyên của tư bản, thì sẽ không có chuyên môn hóa, khoa học, y tế và rất nhiều thứ khác nữa phát triển được. Mình lấy ví dụ: đầu trước mình làm việc quá, bị stress, sau đó nó làm giảm hệ miễn dịch và bị nhiễm trùng... Đến lúc mình đi khám bệnh thì được xào một đống máy móc hiện đại — mình nhớ lại là những cái bác sĩ và nhà khoa học nghiên cứu ra những máy móc này cũng là sản phẩm của tư bản."',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Hai khái niệm tự do: "Freedom FROM work" và "Freedom THROUGH work"',
        paragraphs: [
          'Bài học trước đã cho thấy: Hy Lạp cổ đại định nghĩa tự do là "freedom from work" — tự do KHỎI lao động. Người không phải làm việc là người tự do. Người lao động là nô lệ (hoặc tương đương).',
          'Chủ nghĩa tư bản đã đảo ngược định nghĩa này. Tự do giờ là "freedom through work" — tự do ĐẠT ĐƯỢC qua lao động. Muốn thoát nghèo, muốn được tôn trọng, muốn tham gia xã hội → phải lao động. Không lao động = nghèo = không tự do. Đây là một sự đảo ngược ngôn ngữ tinh vi nhưng có hệ quả rất lớn.',
          'Câu hỏi mà các nhà phê phán kinh tế đặt ra: Nếu bạn không có lựa chọn nào khác ngoài làm việc để tồn tại, liệu đó có phải tự do thực sự? Hay đó là sự ép buộc được ngụy trang bằng ngôn ngữ của tự do?',
        ],
      },
      {
        type: 'image',
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Nationaal_Archief_-_Verzameling_Spaarnestad_-_SFA002004006.jpg/1280px-Nationaal_Archief_-_Verzameling_Spaarnestad_-_SFA002004006.jpg',
        alt: 'Công nhân nhà máy dệt ở Hà Lan đầu thế kỷ 20 — những người mà "tự do" của họ là quyền bán sức lao động cho ai họ muốn',
        caption: 'Công nhân nhà máy dệt, đầu thế kỷ 20. Cách mạng Công nghiệp hứa hẹn "tự do" — nhưng đó là tự do bán sức lao động của mình trong một thị trường không bình đẳng. Nguồn: Nationaal Archief / Wikimedia Commons (Public Domain)',
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Karl Marx và "Voluntary Coercion" (Ép buộc tự nguyện)',
        text: 'Karl Marx gọi đây là "voluntary coercion" — ép buộc tự nguyện. Người lao động "tự do" lựa chọn bán sức lao động của mình — nhưng lựa chọn duy nhất của họ là bán cho ai, không phải là có bán hay không. Không bán = không có tiền = không sống được. Đây không phải là tự do theo nghĩa của Aristotle hay triết học Khai Sáng. Đây là tự do trong một cái bẫy được thiết kế tinh vi.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Nghịch lý của Cường — và của tất cả chúng ta',
        paragraphs: [
          'Cường trong podcast đại diện cho một nghịch lý mà rất nhiều người hiện đại đang sống: Anh làm việc trong hệ thống tài chính của chủ nghĩa tư bản, anh phê phán nó gay gắt — nhưng anh cũng cần nó. Khi bị stress và ốm vì làm việc quá sức, anh được chữa trị bởi những công nghệ y tế tiên tiến — là sản phẩm của chính hệ thống mà anh phê phán.',
          'Điều này không phải là sự thất bại của cá nhân. Đây là đặc điểm cấu trúc của chủ nghĩa tư bản hiện đại: Nó tạo ra vấn đề và đồng thời tạo ra giải pháp cho vấn đề đó. Bạn không thể dễ dàng "bước ra ngoài" hệ thống — vì hệ thống bao phủ mọi thứ bạn cần để sống.',
          'Podcast Oddly Normal không đưa ra phán xét: "Capitalism tốt" hay "capitalism xấu". Thay vào đó, câu hỏi được đặt ra là: "Chúng ta muốn phiên bản nào của capitalism?" — và điều đó bắt đầu bằng việc hiểu hệ thống này thực sự hoạt động như thế nào.',
        ],
      },
      {
        type: 'library-document',
        mode: 'inline',
        title: 'Đọc thêm: "The Spirit Level" — Bất bình đẳng làm hại tất cả mọi người',
        description: 'Tóm tắt nghiên cứu của Kate Pickett và Richard Wilkinson về tác động của bất bình đẳng kinh tế đối với toàn xã hội',
        category: 'Kinh tế học & Xã hội học',
        estimatedReadTime: '7 phút',
        documentContent: {
          sections: [
            {
              heading: 'Luận điểm trung tâm của The Spirit Level',
              paragraphs: [
                '"The Spirit Level: Why More Equal Societies Almost Always Do Better" (2009) của Kate Pickett và Richard Wilkinson là một trong những cuốn sách kinh tế xã hội có ảnh hưởng nhất thế kỷ 21. Nghiên cứu của họ phân tích dữ liệu từ 23 quốc gia phát triển để trả lời câu hỏi: Bất bình đẳng kinh tế ảnh hưởng thế nào đến sức khỏe xã hội?',
                'Kết quả gây sốc: Ở các xã hội bất bình đẳng hơn, MỌI người đều tệ hơn — kể cả người giàu. Tỷ lệ bệnh tâm thần, tội phạm, béo phì, nghiện ngập, tù giam, bạo lực — tất cả đều cao hơn ở các xã hội bất bình đẳng. Không phải chỉ vì người nghèo bị thiệt thòi — mà vì bất bình đẳng phá hủy sự gắn kết xã hội và tạo ra căng thẳng mãn tính ở mọi tầng lớp.',
              ],
            },
            {
              heading: 'Ví dụ cụ thể từ dữ liệu',
              paragraphs: [
                'Mỹ vs. Thụy Điển: Mỹ là nền kinh tế lớn nhất thế giới, nhưng có tỷ lệ tù giam cao nhất, tuổi thọ thấp hơn nhiều nước giàu khác, và tỷ lệ bất bình đẳng rất cao. Thụy Điển, bình đẳng hơn nhiều, có tuổi thọ cao hơn, tỷ lệ tội phạm thấp hơn, và người dân hài lòng với cuộc sống hơn — dù GDP bình quân đầu người không cao hơn Mỹ nhiều.',
                '"Status anxiety" (lo âu về địa vị xã hội): Trong xã hội bất bình đẳng cao, mọi người liên tục so sánh bản thân với người khác. Điều này tạo ra stress mãn tính, tiêu dùng phô trương (mua để "flex"), và giảm sự tin tưởng lẫn nhau — tất cả đều có hại cho sức khỏe và hạnh phúc.',
              ],
            },
            {
              heading: 'Liên hệ với "ba cọc ba đồng"',
              paragraphs: [
                'The Spirit Level cung cấp bằng chứng cho thấy: việc nhiều người mắc kẹt trong "ba cọc ba đồng" không chỉ là vấn đề cá nhân — nó là triệu chứng của cấu trúc kinh tế. Và cấu trúc đó không chỉ làm hại người nghèo, mà làm hại tất cả.',
                'Gợi ý chính sách: Không cần làm cho người giàu nghèo đi — chỉ cần giảm khoảng cách. Các xã hội bình đẳng hơn có thể đạt được với thuế lũy tiến, đầu tư vào giáo dục và y tế công cộng, và các chính sách thị trường lao động công bằng hơn.',
              ],
            },
          ],
          relatedConcepts: ['Bất bình đẳng', 'Phúc lợi xã hội', 'Social contract', 'Gini coefficient'],
          furtherReading: [
            'https://en.wikipedia.org/wiki/The_Spirit_Level_(book)',
            'https://www.equalitytrust.org.uk/about-inequality/the-evidence',
          ],
        },
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Checkpoint — Bạn đã học được gì?',
        text: '✓ "Freedom from work" (Hy Lạp cổ đại): không làm việc = tự do\n✓ "Freedom through work" (chủ nghĩa tư bản): làm việc là con đường duy nhất để tự do\n✓ Marx gọi đây là "voluntary coercion" — bạn "tự nguyện" bán sức lao động vì không có lựa chọn nào khác\n✓ Nghịch lý Cường: phê phán capitalism nhưng vẫn cần nó — đây là tình trạng của hầu hết mọi người\n✓ The Spirit Level: xã hội bất bình đẳng hơn làm hại TẤT CẢ mọi người, kể cả người giàu',
        variant: 'success',
      },
      {
        type: 'question',
        question: 'Khi Cường nói ông "chọn" làm việc trong hệ thống tài chính dù biết nó có vấn đề, điều này minh họa khái niệm nào tốt nhất?',
        options: [
          {
            id: 'a',
            text: 'Tự do hoàn toàn — Cường có đủ khả năng từ chối và sống mà không cần hệ thống đó',
            isCorrect: false,
          },
          {
            id: 'b',
            text: '"Voluntary coercion" — sự ép buộc ngụy trang thành lựa chọn tự do, khi không làm việc trong hệ thống tư bản đồng nghĩa với không có phương tiện sống',
            isCorrect: true,
          },
          {
            id: 'c',
            text: 'Sự thất bại về đạo đức — Cường thiếu nhất quán giữa lời nói và hành động',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'Chứng minh rằng capitalism không có vấn đề gì vì mọi người đều tự nguyện tham gia',
            isCorrect: false,
          },
        ],
        explanation: 'Nghịch lý của Cường minh họa chính xác khái niệm "voluntary coercion" (ép buộc tự nguyện) của Marx: anh "tự nguyện" làm việc trong hệ thống tài chính — nhưng lựa chọn duy nhất là làm cho ai, không phải là có làm hay không. Đây không phải là thiếu nhất quán cá nhân; đây là đặc điểm cấu trúc của chủ nghĩa tư bản hiện đại, nơi hầu như mọi nhu cầu cơ bản đều được trung gian qua thị trường.',
      },
      {
        type: 'text',
        title: 'Tổng kết Level 1 — Và nhìn về phía trước',
        paragraphs: [
          'Trong ba bài học của Level 1, chúng ta đã đi từ câu thành ngữ "ba cọc ba đồng" → lịch sử 3.000 năm của lao động → đến nghịch lý cốt lõi: tự do trong chủ nghĩa tư bản là gì?',
          'Những hiểu biết này không chỉ là học thuật. Chúng thay đổi cách chúng ta nhìn nhận công việc của mình, cảm giác tội lỗi khi nghỉ ngơi, áp lực "phải làm gì đó có giá trị" mà xã hội áp đặt lên mỗi người.',
          'Nhưng đây mới chỉ là lớp đầu tiên. Trong Level 2, chúng ta sẽ đi sâu vào cách hệ thống tư bản không chỉ tổ chức lao động — mà còn tổ chức tiêu dùng. Tại sao chúng ta mua những thứ không cần thiết? Tại sao điện thoại mới ra sau một năm đã "lỗi thời"? Và ai đang điều khiển những hành vi này?',
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────
// Main script
// ─────────────────────────────────────────────
async function main() {
  console.log('=== Adding "Ba Cọc Ba Đồng" course (Phase 1: Level 1 content) ===\n');

  // 1. Ensure 'economics' category exists (create if missing)
  console.log('Setting up category "economics"...');
  let category = await prisma.category.findUnique({ where: { slug: 'economics' } });
  if (!category) {
    const maxSortOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
    category = await prisma.category.create({
      data: {
        slug: 'economics',
        name: 'Kinh tế & Lao động',
        description: 'Chủ nghĩa tư bản, lao động, thị trường tài chính và tương lai của công việc',
        icon: 'trending-up',
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: true,
      },
    });
    console.log(`  ✅ Created category: ${category.name} (slug: ${category.slug})\n`);
  } else {
    console.log(`  Found existing category: ${category.name} (${category.id})\n`);
  }

  // 2. Check for duplicate course
  const existing = await prisma.course.findUnique({ where: { slug: 'ba-coc-ba-dong' } });
  if (existing) {
    console.log('⚠️  Course "ba-coc-ba-dong" already exists! Skipping to avoid duplicates.');
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
      slug: BA_COC_BA_DONG_COURSE.slug,
      name: BA_COC_BA_DONG_COURSE.name,
      description: BA_COC_BA_DONG_COURSE.description,
      icon: BA_COC_BA_DONG_COURSE.icon,
      isNew: BA_COC_BA_DONG_COURSE.isNew,
      isActive: true,
      categoryId: category.id,
      sortOrder: courseSortOrder,
    },
  });
  console.log(`✅ Created course: ${course.name} (slug: ${course.slug})\n`);

  // 5. Create levels and lessons
  for (let levelIndex = 0; levelIndex < BA_COC_BA_DONG_COURSE.levels.length; levelIndex++) {
    const lvlDef = BA_COC_BA_DONG_COURSE.levels[levelIndex];
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
  console.log('  Phase 2 — Add Level 2 content: Bẫy Tiêu Dùng (4 lessons)');
  console.log('  Phase 3 — Add Level 3 content: Bong Bóng & Đầu Cơ (5 lessons)');
  console.log('  Phase 4 — Add Level 4 content: Dữ Liệu & AI (4 lessons)');
  console.log('  Phase 5 — Add Level 5 content: Tương Lai (4 lessons)');
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
