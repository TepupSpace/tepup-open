import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Bà Bảy × Thuế 101 — "Lương hưu và tấm thẻ bảo hiểm".
 *
 * Bà Bảy không còn thu nhập từ lao động, nên bà là nhân vật để hỏi câu ngược
 * lại: một người đã thôi đóng góp thì quan hệ với ngân sách còn gì. Câu chuyện
 * đi vào phần chi — an sinh, y tế — và vào cơ chế liên thế hệ.
 */
export const BABAY_THUE: StorySeed = {
  slug: 'babay-thue',
  characterSlug: 'retiree',
  title: 'Lương hưu và tấm thẻ bảo hiểm',
  teaser:
    'Bà Bảy nghĩ mình đã thôi đóng góp từ mười hai năm nay. Cho tới khi bà nhìn tấm thẻ bảo hiểm y tế và hỏi: cái này ai trả?',
  icon: 'heart',
  estimatedTime: '~30 phút',
  sortOrder: 4,
  courseSlugs: [COURSE.thue],
  part: {
    name: 'Bà Bảy và cái quỹ chung',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'luong-huu-co-bi-danh-thue-khong',
        title: 'Lương hưu có bị đánh thuế không?',
        blocks: [
          {
            type: 'text',
            title: 'Câu chuyện ở hội người cao tuổi',
            paragraphs: [
              'Trong buổi sinh hoạt, có bác nói: "Nhà nước sắp đánh thuế lương hưu đó bà con."',
              'Cả phòng nhốn nháo. Có người nói "vô lý quá", có người nói "chắc tin đồn thôi".',
              'Bà Bảy nhớ tới ba câu hỏi mà cháu bác Tư dạy bà, và bà hỏi: "Bác nghe cái đó ở đâu vậy bác?"',
            ],
          },
          {
            type: 'callout',
            icon: 'help-circle',
            title: 'Câu trả lời',
            variant: 'info',
            text: '"Nghe người ta nói." Không có nguồn, không có ngày, không có văn bản nào. Đúng ba dấu hiệu mà bà Bảy đã học được từ chuyện tin đồn ngoài chợ.',
          },
          {
            type: 'question',
            question:
              'Theo quy định hiện hành ở Việt Nam, tiền lương hưu do quỹ bảo hiểm xã hội chi trả có thuộc diện chịu thuế thu nhập cá nhân không?',
            options: [
              { id: 'a', text: 'Có, như mọi khoản thu nhập khác', isCorrect: false },
              { id: 'b', text: 'Không — lương hưu do bảo hiểm xã hội chi trả thuộc nhóm thu nhập được miễn thuế', isCorrect: true },
              { id: 'c', text: 'Chỉ bị đánh thuế nếu vượt một mức nhất định', isCorrect: false },
              { id: 'd', text: 'Tuỳ từng địa phương quy định', isCorrect: false },
            ],
            explanation:
              'Luật Thuế thu nhập cá nhân liệt kê các khoản thu nhập được miễn thuế, trong đó có tiền lương hưu do quỹ bảo hiểm xã hội chi trả. Lý do khá rõ: khoản này hình thành từ những năm người lao động đã đóng góp, và phần đóng góp ấy đã được xử lý về mặt thuế trong giai đoạn đi làm. Đánh thuế lần nữa lúc nhận lương hưu sẽ là đánh thuế hai lần trên cùng một dòng tiền.',
          },
          {
            type: 'text',
            title: 'Vì sao cả phòng tin ngay',
            paragraphs: [
              'Bà Bảy để ý một chuyện: không ai trong phòng hỏi bác kia đã nghe ở đâu, kể cả những người phản đối.',
              'Người tin thì tin ngay. Người không tin thì bác bỏ ngay. Cả hai bên đều bỏ qua bước hỏi nguồn.',
              '"Té ra không phải chỉ mấy người tin mới có vấn đề," bà nghĩ. "Mấy người cãi cũng cãi mà không biết mình cãi cái gì."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao người phản đối một tin đồn cũng nên hỏi nguồn, chứ không chỉ người tin nó?',
            options: [
              { id: 'a', text: 'Để tỏ ra lịch sự với người đưa tin', isCorrect: false },
              { id: 'b', text: 'Vì bác bỏ theo cảm tính cũng có thể sai — và một lời bác bỏ không có căn cứ thì không thuyết phục được ai đang tin', isCorrect: true },
              { id: 'c', text: 'Vì tin đồn thường có phần đúng', isCorrect: false },
              { id: 'd', text: 'Vì hỏi nguồn là nghĩa vụ của người phản đối', isCorrect: false },
            ],
            explanation:
              'Hai người cùng không kiểm chứng, chỉ khác kết luận, thì không phải một bên đang tư duy tốt hơn bên kia — cả hai đều đang đoán. Và về mặt thực tế, lời bác bỏ không có căn cứ chẳng thay đổi được ai: người đang lo sẽ chọn tin cái làm họ lo, vì ít nhất nó có vẻ cụ thể hơn một câu "làm gì có chuyện đó".',
          },
          {
            type: 'text',
            title: 'Bà Bảy tra lại và nói lại ở buổi sau',
            paragraphs: [
              'Con trai bà giúp bà tra và in ra điều khoản trong luật, phần liệt kê các khoản thu nhập được miễn thuế.',
              'Buổi sinh hoạt sau, bà mang tờ giấy đi và đưa cho bác đã nói tin đó.',
              'Bà không nói bác sai. Bà nói: "Con em nó tra được cái này, bác coi thử."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác kia đọc, gật gù, rồi nói: "Ừ, chắc tui nghe nhầm với cái thu nhập khác."',
              'Bà Bảy không truy tiếp. Bà nghĩ mục đích không phải là chứng minh ai sai.',
              'Cái bà cần là ba mươi người trong phòng không đi về nhà với một nỗi lo không có thật.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Vì sao tin về thuế lan nhanh trong nhóm người cao tuổi',
            variant: 'info',
            text: 'Lương hưu là nguồn thu duy nhất và cố định của phần lớn người nghỉ hưu — không tăng ca được, không tìm việc khác được. Bất kỳ tin nào đe doạ nguồn thu ấy đều chạm vào nỗi lo lớn nhất, và như mọi tin chạm vào nỗi sợ, nó lan trước khi được kiểm chứng.',
          },
          {
            type: 'question',
            question:
              'Vì sao lương hưu được miễn thuế lại là một lựa chọn chính sách chứ không phải một điều hiển nhiên?',
            options: [
              { id: 'a', text: 'Vì có nước đánh thuế lương hưu và có nước không, tuỳ vào cách họ xử lý thuế ở giai đoạn đóng góp', isCorrect: true },
              { id: 'b', text: 'Vì mọi nước đều miễn thuế lương hưu', isCorrect: false },
              { id: 'c', text: 'Vì lương hưu không phải là thu nhập', isCorrect: false },
              { id: 'd', text: 'Vì người già không có khả năng nộp thuế', isCorrect: false },
            ],
            explanation:
              'Vấn đề cốt lõi là tránh đánh thuế hai lần trên cùng một dòng tiền, và có hai cách làm điều đó: miễn thuế phần đóng góp lúc đi làm rồi đánh thuế lúc nhận, hoặc đánh thuế lúc đóng góp rồi miễn lúc nhận. Các nước chọn khác nhau, và cả hai cách đều nhất quán. Điều quan trọng là biết hệ thống của mình chọn cách nào, để không nhầm lẫn khi so sánh với nước khác.',
          },
          {
            type: 'text',
            title: 'Bà Bảy hỏi thêm về khoản khác',
            paragraphs: [
              'Bà hỏi con trai: "Vậy tiền tiết kiệm của mẹ có bị đánh thuế không con?"',
              'Con trai bà tra và cho bà xem: lãi tiền gửi tiết kiệm của cá nhân tại tổ chức tín dụng cũng nằm trong nhóm thu nhập được miễn thuế thu nhập cá nhân theo quy định hiện hành.',
              '"Vậy là mẹ được miễn hai cái lận hả?"',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao các khoản miễn thuế như lương hưu hay lãi tiết kiệm vẫn nên được xem là một lựa chọn có chi phí?',
            options: [
              { id: 'a', text: 'Vì chúng làm giảm số thu ngân sách, và phần hụt đó phải được xử lý bằng cách nào đó', isCorrect: true },
              { id: 'b', text: 'Vì chúng không công bằng với người đi làm', isCorrect: false },
              { id: 'c', text: 'Vì chúng khuyến khích người ta không lao động', isCorrect: false },
              { id: 'd', text: 'Vì chúng chỉ có lợi cho người giàu', isCorrect: false },
            ],
            explanation:
              'Mọi khoản miễn giảm đều là một quyết định chi tiêu, chỉ khác là nó không xuất hiện trong phần chi mà nằm ở phần thu bị hụt. Điều này không có nghĩa các khoản miễn đó sai — chúng có lý do chính đáng. Nhưng gọi tên chúng là "chi phí" giúp nhìn thấy chúng và đánh giá được, thay vì coi chúng là mặc định không cần bàn.',
          },
          {
            type: 'text',
            paragraphs: [
              'Con trai bà giải thích: khoản miễn thuế cũng giống như một khoản chi, chỉ khác là nó không hiện ra trong bảng chi tiêu.',
              '"Mẹ được miễn thì mẹ giữ được tiền. Mà cái phần nhà nước không thu thì phải bù ở chỗ khác."',
              'Bà Bảy hỏi: "Vậy mẹ có nên thấy có lỗi không?"',
              '"Dạ không mẹ. Cái đó là quyết định của xã hội chớ đâu phải mẹ xin."',
            ],
          },
          {
            type: 'text',
            title: 'Nhưng bà Bảy vẫn đóng thuế mỗi ngày',
            paragraphs: [
              'Con trai bà chỉ ra một điều mà bà chưa nghĩ tới.',
              'Lương hưu của bà không bị đánh thuế thu nhập. Nhưng mỗi lần bà đi chợ, mua gạo, trả tiền điện, đổ bình gas, thì trong giá đã có thuế.',
              'Bà tiêu gần hết lương hưu mỗi tháng, nên gần như toàn bộ số tiền ấy đi qua vùng chịu thuế tiêu dùng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy ngồi tính thử với con trai. Con số không lớn về mặt tuyệt đối, nhưng tính theo tỷ lệ lương hưu thì không hề nhỏ.',
              '"Vậy là mẹ vẫn đóng hả con?"',
              '"Dạ. Mẹ vẫn đóng, chỉ là không có tờ khai nào mang tên mẹ."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Người tiêu hết thu nhập thì đóng góp gần như toàn phần',
            variant: 'warning',
            text: 'Thuế tiêu dùng đánh vào phần được tiêu, không đánh vào phần được tích luỹ. Người nghỉ hưu và người thu nhập thấp thường tiêu gần hết, nên gần như toàn bộ thu nhập của họ đi qua vùng chịu thuế. Đây là lý do các chính sách về thuế đối với hàng thiết yếu — thực phẩm, thuốc, điện, nước — có tác động lớn tới nhóm này hơn hẳn các thay đổi về thuế thu nhập.',
          },
          {
            type: 'question',
            question:
              'Vì sao một thay đổi nhỏ về thuế đối với hàng thiết yếu lại ảnh hưởng tới người nghỉ hưu nhiều hơn một thay đổi lớn về thuế thu nhập?',
            options: [
              { id: 'a', text: 'Vì hàng thiết yếu có thuế suất cao hơn', isCorrect: false },
              { id: 'b', text: 'Vì họ không có thu nhập chịu thuế thu nhập, trong khi chi tiêu cho hàng thiết yếu chiếm tỷ trọng rất lớn trong thu nhập của họ', isCorrect: true },
              { id: 'c', text: 'Vì họ mua nhiều hàng thiết yếu hơn người khác', isCorrect: false },
              { id: 'd', text: 'Vì lương hưu không được điều chỉnh theo giá cả', isCorrect: false },
            ],
            explanation:
              'Một người nghỉ hưu không bị ảnh hưởng bởi thay đổi thuế thu nhập vì họ không có thu nhập thuộc diện chịu thuế đó. Nhưng thực phẩm, thuốc men, điện nước chiếm tỷ trọng rất lớn trong chi tiêu của họ. Vì thế khi đánh giá tác động của một chính sách thuế, cần nhìn theo cơ cấu chi tiêu của từng nhóm, chứ không nhìn theo mức thuế suất chung.',
          },
          {
            type: 'text',
            title: 'Bà Bảy nghĩ về câu mình hay nói',
            paragraphs: [
              'Suốt mười hai năm nghỉ hưu, mỗi khi có chuyện gì ở phường, bà Bảy đều nói: "Thôi bà già rồi, chuyện đó để mấy người đi làm lo."',
              'Bà nói câu đó thật lòng, vì bà nghĩ mình đã thôi đóng góp.',
              'Bây giờ bà biết mình vẫn đang góp mỗi ngày, và bà thấy câu đó không còn đúng nữa.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Người nghỉ hưu và hệ thống thuế',
            description: 'Cái gì được miễn, cái gì vẫn đóng, và vì sao điều đó quan trọng.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Lương hưu và thuế thu nhập',
                  paragraphs: [
                    'Tiền lương hưu do quỹ bảo hiểm xã hội chi trả thuộc nhóm thu nhập được miễn thuế thu nhập cá nhân theo quy định hiện hành.',
                    'Lý do là tránh đánh thuế hai lần trên cùng một dòng tiền, vì phần đóng góp đã được xử lý ở giai đoạn đi làm.',
                    'Đây là một lựa chọn chính sách: có nước chọn cách ngược lại, miễn lúc đóng và đánh thuế lúc nhận. Cả hai đều nhất quán, và cần biết hệ thống của mình chọn cách nào.',
                  ],
                },
                {
                  heading: 'Những khoản vẫn đóng',
                  paragraphs: [
                    'Thuế giá trị gia tăng nằm trong giá mọi hàng hoá dịch vụ mua hằng ngày.',
                    'Thuế tiêu thụ đặc biệt và thuế bảo vệ môi trường nằm trong giá xăng, và gián tiếp trong giá vận chuyển của mọi thứ khác.',
                    'Vì người nghỉ hưu thường tiêu gần hết thu nhập, gần như toàn bộ số tiền ấy đi qua vùng chịu thuế tiêu dùng.',
                  ],
                },
                {
                  heading: 'Vì sao điều này đáng biết',
                  paragraphs: [
                    'Chính sách thuế đối với hàng thiết yếu tác động tới người nghỉ hưu mạnh hơn nhiều so với chính sách thuế thu nhập.',
                    'Biết mình vẫn đang đóng góp là điều kiện để thấy mình có tư cách hỏi và có tư cách tham gia.',
                    'Với tin đồn về thuế lương hưu: hỏi nguồn, hỏi ngày, hỏi có văn bản nào — ba câu này lọc được gần hết.',
                  ],
                },
              ],
              relatedConcepts: ['Thu nhập được miễn thuế', 'Đánh thuế hai lần', 'Cơ cấu chi tiêu theo nhóm'],
              furtherReading: [
                'Luật Thuế thu nhập cá nhân — các khoản thu nhập được miễn thuế',
                'Bài học "Ai đang thực sự chịu thuế?" trong khoá Thuế 101',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Lương hưu do bảo hiểm xã hội chi trả thuộc nhóm thu nhập được miễn thuế thu nhập cá nhân.\n' +
              '✓ Nhưng người nghỉ hưu vẫn đóng thuế mỗi ngày qua giá hàng hoá, và gần như trên toàn bộ thu nhập vì họ tiêu hết.\n' +
              '✓ Thay đổi thuế với hàng thiết yếu tác động tới họ mạnh hơn nhiều so với thay đổi thuế thu nhập.\n' +
              '✓ Tin đồn về thuế lan nhanh trong nhóm này vì lương hưu là nguồn thu duy nhất và không co giãn được.',
          },
          {
            type: 'text',
            title: 'Rồi bà Bảy nhìn tấm thẻ',
            paragraphs: [
              'Tối đó bà mở ví lấy tiền và nhìn thấy tấm thẻ bảo hiểm y tế nằm trong đó.',
              'Bà đi khám ba tháng một lần suốt mười hai năm, và mỗi lần bà chỉ trả một phần rất nhỏ.',
              'Lần đầu tiên bà hỏi: phần còn lại ai trả?',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'tam-the-bao-hiem-y-te',
        title: 'Tấm thẻ bảo hiểm y tế',
        blocks: [
          {
            type: 'text',
            title: 'Hoá đơn viện phí bà chưa bao giờ đọc',
            paragraphs: [
              'Lần khám sau, bà Bảy làm một việc bà chưa từng làm: bà giữ lại tờ hoá đơn và đọc kỹ.',
              'Trên đó có ba dòng: tổng chi phí, phần bảo hiểm chi trả, và phần người bệnh cùng chi trả.',
              'Phần bà trả là một tỷ lệ nhỏ. Phần còn lại do quỹ bảo hiểm y tế chi.',
            ],
          },
          {
            type: 'text',
            title: 'Vì sao bà Bảy chưa từng đọc tờ hoá đơn',
            paragraphs: [
              'Bà thừa nhận lý do rất đơn giản: bà chỉ quan tâm tới con số cuối cùng bà phải trả.',
              'Phần bảo hiểm chi trả thì với bà là "phần không phải trả", nên nó vô hình.',
              'Đó là đúng cơ chế mà bà đã gặp ở chuyện thuế trong giá hàng, chỉ ở chiều ngược lại: thứ không rời khỏi ví thì không được nhìn thấy.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc nhìn thấy "phần được chi trả" cũng quan trọng như nhìn thấy "phần mình đóng"?',
            options: [
              { id: 'a', text: 'Để biết ơn hệ thống y tế', isCorrect: false },
              { id: 'b', text: 'Vì chỉ khi thấy cả hai chiều, người ta mới đánh giá được một thay đổi chính sách ảnh hưởng tới mình ra sao', isCorrect: true },
              { id: 'c', text: 'Để kiểm tra bệnh viện có tính đúng không', isCorrect: false },
              { id: 'd', text: 'Vì đó là quy định bắt buộc', isCorrect: false },
            ],
            explanation:
              'Người chỉ thấy phần mình đóng sẽ coi mọi khoản đóng góp là mất mát thuần tuý. Người chỉ thấy phần được nhận sẽ coi nó là quà tặng. Cả hai đều không đánh giá được một đề xuất thay đổi — chẳng hạn thay đổi mức cùng chi trả hay mức đóng — vì họ chỉ nhìn một vế của phương trình.',
          },
          {
            type: 'text',
            title: 'Bà Bảy giữ hoá đơn từ đó',
            paragraphs: [
              'Bà bắt đầu giữ lại hoá đơn mỗi lần khám, kẹp vào một cuốn sổ.',
              'Sau một năm bà có mười hai tờ, và bà cộng lại được cả hai cột: phần bà trả và phần quỹ trả.',
              'Bà đưa cuốn sổ cho các bác ở hội người cao tuổi xem, và đó là lần đầu tiên nhiều người trong phòng nhìn thấy con số ở cột thứ hai.',
            ],
          },
          {
            type: 'callout',
            icon: 'heart-pulse',
            title: 'Quỹ bảo hiểm y tế lấy tiền từ đâu',
            variant: 'info',
            text: 'Từ phần đóng góp của người tham gia và người sử dụng lao động, cộng với phần ngân sách nhà nước hỗ trợ đóng cho một số nhóm — người có công, người nghèo, trẻ em dưới 6 tuổi, người cao tuổi thuộc diện được hỗ trợ, và một phần cho học sinh sinh viên. Nghĩa là quỹ này vừa là bảo hiểm vừa có phần từ tiền thuế.',
          },
          {
            type: 'question',
            question:
              'Bảo hiểm y tế khác với một khoản trợ cấp thuần tuý ở chỗ nào?',
            options: [
              { id: 'a', text: 'Không khác gì, đều là nhà nước cho', isCorrect: false },
              { id: 'b', text: 'Nó vận hành theo nguyên tắc chia sẻ rủi ro: nhiều người cùng đóng, số ít người bệnh nặng được chi trả nhiều — chứ không phải ai đóng bao nhiêu thì nhận lại bấy nhiêu', isCorrect: true },
              { id: 'c', text: 'Nó chỉ dành cho người có thu nhập', isCorrect: false },
              { id: 'd', text: 'Nó phải hoàn trả sau này', isCorrect: false },
            ],
            explanation:
              'Đây là điểm khiến nhiều người thấy bảo hiểm y tế "không đáng" khi họ khoẻ mạnh nhiều năm. Nhưng bản chất của bảo hiểm không phải là tiết kiệm — nó là chia sẻ rủi ro. Phần lớn người tham gia sẽ nhận lại ít hơn phần đóng, và đó không phải là thất bại của hệ thống mà là cách nó hoạt động: tiền của số đông khoẻ mạnh chi trả cho số ít gặp bệnh nặng.',
          },
          {
            type: 'text',
            title: 'Bà Bảy tính thử một phép tính',
            paragraphs: [
              'Bà lấy tổng chi phí y tế của bà trong mười hai năm — gồm cả một lần nằm viện mười ngày năm kia — và so với tổng phần bà đã đóng.',
              'Phần bà nhận lại lớn hơn phần bà đóng khá nhiều.',
              '"Vậy là mẹ đang xài tiền của người khác hả con?"',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Con trai bà trả lời cẩn thận: "Mẹ đang xài tiền của cái quỹ chung, mà mẹ đóng vô đó bốn mươi năm đi làm."',
              '"Với lại hồi mẹ ba mươi tuổi, mẹ khoẻ, mẹ đóng mà mẹ có xài đâu. Lúc đó tiền của mẹ trả cho mấy người bệnh khác."',
              'Bà Bảy im một lúc rồi nói: "Ừ hén."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Cùng một người ở hai đầu của một quỹ',
            variant: 'info',
            text: 'Nhìn một năm thì thấy có người đóng nhiều nhận ít và có người đóng ít nhận nhiều. Nhìn cả một đời người thì phần lớn ai cũng đi qua cả hai vai: khoẻ mạnh và đóng góp khi trẻ, cần chi trả khi già hoặc khi ốm. Cách nhìn theo lát cắt một năm và cách nhìn theo cả đời cho ra hai kết luận rất khác nhau về tính công bằng.',
          },
          {
            type: 'sort-bucket',
            title: 'Khoản nào từ quỹ chung, khoản nào tự trả?',
            instruction:
              'Xếp từng khoản vào rổ đúng, theo cơ chế phổ biến hiện nay ở Việt Nam.',
            buckets: [
              { id: 'chung', label: 'Có phần từ quỹ chung / ngân sách' },
              { id: 'tutra', label: 'Chủ yếu tự trả' },
            ],
            items: [
              { id: 'k1', text: 'Khám chữa bệnh đúng tuyến khi có thẻ bảo hiểm y tế', bucketId: 'chung' },
              { id: 'k2', text: 'Tiêm chủng mở rộng cho trẻ em', bucketId: 'chung' },
              { id: 'k3', text: 'Lương hưu từ quỹ bảo hiểm xã hội', bucketId: 'chung' },
              { id: 'k4', text: 'Thực phẩm chức năng mua ở nhà thuốc', bucketId: 'tutra' },
              { id: 'k5', text: 'Khám dịch vụ theo yêu cầu ngoài phạm vi bảo hiểm', bucketId: 'tutra' },
              { id: 'k6', text: 'Thuốc nam mua theo quảng cáo trên mạng', bucketId: 'tutra' },
            ],
          },
          {
            type: 'text',
            title: 'Hai món cuối làm bà Bảy suy nghĩ',
            paragraphs: [
              'Bà nhớ tới cái video chữa tiểu đường bảy ngày và số tiền mà cô Chín đã bỏ ra mua bài thuốc.',
              'Số tiền đó không nhỏ, và nó nằm hoàn toàn ngoài mọi quỹ chung — không ai chia sẻ, không ai chi trả.',
              'Trong khi thuốc bác sĩ kê cho bà thì có phần được quỹ bảo hiểm chi trả.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc một loại thuốc "có trong danh mục bảo hiểm chi trả" lại là một thông tin đáng chú ý?',
            options: [
              { id: 'a', text: 'Vì thuốc trong danh mục luôn hiệu quả hơn', isCorrect: false },
              { id: 'b', text: 'Vì để vào được danh mục, thuốc phải qua một quy trình đánh giá về hiệu quả, an toàn và chi phí — nên đó là một tín hiệu, dù không phải bảo chứng tuyệt đối', isCorrect: true },
              { id: 'c', text: 'Vì thuốc trong danh mục rẻ hơn', isCorrect: false },
              { id: 'd', text: 'Vì bác sĩ chỉ được kê thuốc trong danh mục', isCorrect: false },
            ],
            explanation:
              'Việc một thuốc được đưa vào danh mục quỹ chi trả không đảm bảo nó hiệu quả với riêng bạn, và danh mục cũng thay đổi theo thời gian. Nhưng để vào được danh mục, thuốc phải qua đăng ký lưu hành và qua đánh giá về hiệu quả, an toàn cùng chi phí. Một sản phẩm bán qua số điện thoại trong video thì không đi qua bất kỳ khâu nào trong số đó.',
          },
          {
            type: 'text',
            title: 'Bà Bảy nhìn ra mối liên hệ',
            paragraphs: [
              'Bà nhận ra hai câu chuyện của bà nối vào nhau ở đúng chỗ này.',
              'Chuyện tin đồn về thuốc là chuyện tư duy phản biện. Chuyện tấm thẻ bảo hiểm là chuyện quỹ chung.',
              'Nhưng khi cô Chín bỏ tiền mua bài thuốc trên mạng, cô vừa mất tiền túi vừa đứng ngoài cái quỹ mà cô đã đóng góp vào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà nói với con trai: "Vậy là mấy người bán thuốc trên mạng, họ không chỉ lấy tiền của người ta."',
              '"Họ kéo người ta ra khỏi cái chỗ mà người ta có phần."',
              'Con trai bà thấy mẹ mình vừa nói một câu mà anh chưa nghĩ ra.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Rời khỏi hệ thống thì mất phần mình đã góp',
            variant: 'warning',
            text: 'Một người bỏ thuốc điều trị để mua sản phẩm ngoài luồng đang chịu ba khoản mất cùng lúc: tiền mua sản phẩm đó, phần chi trả mà quỹ lẽ ra gánh cho họ, và rủi ro sức khoẻ. Khoản thứ hai là khoản ít được nhắc tới nhất — nó là phần họ đã đóng góp qua nhiều năm và đang không sử dụng.',
          },
          {
            type: 'text',
            title: 'Bà Bảy nói lại với cô Chín',
            paragraphs: [
              'Bà không nói về khoa học nữa — lần trước bà đã thử và không đi tới đâu.',
              'Lần này bà nói bằng ngôn ngữ mà cả hai đều hiểu: "Chị coi nè, thuốc bác sĩ kê thì bảo hiểm nó trả bớt cho mình. Còn cái kia mình trả trọn."',
              'Cô Chín nhìn tờ hoá đơn bà Bảy đưa và nói: "Ủa, trả nhiều dữ vậy hả chị?"',
            ],
          },
          {
            type: 'text',
            title: 'Cô Chín hỏi một câu khó',
            paragraphs: [
              '"Vậy chớ sao cái gì bảo hiểm cũng không trả hết vậy chị? Có mấy thứ tui phải tự mua ngoài."',
              'Bà Bảy không biết trả lời, nên bà hỏi lại con trai.',
              'Con trai bà nói: một quỹ có nguồn thu hữu hạn thì phải chọn cái gì được chi trả và ở mức nào — và mọi lựa chọn đều loại bỏ một thứ khác.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao quỹ bảo hiểm y tế phải có danh mục và mức chi trả, thay vì chi trả tất cả?',
            options: [
              { id: 'a', text: 'Vì nhà nước muốn tiết kiệm', isCorrect: false },
              { id: 'b', text: 'Vì nguồn thu của quỹ hữu hạn, nên mở rộng chi cho khoản này đồng nghĩa với thu hẹp ở khoản khác hoặc tăng mức đóng', isCorrect: true },
              { id: 'c', text: 'Vì một số bệnh không cần điều trị', isCorrect: false },
              { id: 'd', text: 'Vì bệnh viện không đủ khả năng cung cấp', isCorrect: false },
            ],
            explanation:
              'Đây là cùng một logic với ngân sách nhà nước: tổng số có hạn nên mọi lựa chọn đều là đánh đổi. Đưa thêm một loại thuốc đắt tiền vào danh mục có nghĩa là ít tiền hơn cho các khoản khác, hoặc phải tăng mức đóng của người tham gia. Việc quyết định danh mục vì thế không phải một bài toán kỹ thuật thuần tuý — nó là một quyết định về việc ưu tiên ai.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Quỹ chung hoạt động thế nào',
            description: 'Nguyên tắc chia sẻ rủi ro, và vì sao nhìn một năm khác nhìn cả đời.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Nguyên tắc chia sẻ rủi ro',
                  paragraphs: [
                    'Bảo hiểm không phải tiết kiệm: bạn không nhận lại đúng phần mình đóng.',
                    'Số đông khoẻ mạnh đóng góp để chi trả cho số ít gặp bệnh nặng hoặc tai nạn.',
                    'Phần lớn người tham gia sẽ nhận lại ít hơn phần đóng, và đó là cách hệ thống hoạt động chứ không phải sự bất công.',
                  ],
                },
                {
                  heading: 'Nhìn một năm và nhìn cả đời',
                  paragraphs: [
                    'Theo lát cắt một năm: có nhóm đóng nhiều nhận ít, có nhóm ngược lại — dễ dẫn tới cảm giác bất công.',
                    'Theo cả đời người: phần lớn ai cũng đi qua cả hai vai, khoẻ và đóng góp khi trẻ, cần chi trả khi già.',
                    'Cùng một hệ thống, hai cách nhìn cho ra hai kết luận rất khác nhau.',
                  ],
                },
                {
                  heading: 'Ba khoản mất khi rời khỏi hệ thống',
                  paragraphs: [
                    'Tiền bỏ ra mua sản phẩm ngoài luồng, không ai chia sẻ.',
                    'Phần chi trả mà quỹ lẽ ra gánh cho bạn — phần bạn đã đóng góp qua nhiều năm và đang không sử dụng.',
                    'Rủi ro sức khoẻ khi bỏ điều trị đã được kiểm chứng.',
                    'Khi nói chuyện với người thân đang cân nhắc, khoản thứ hai thường dễ thuyết phục hơn là tranh luận về hiệu quả.',
                  ],
                },
              ],
              relatedConcepts: ['Chia sẻ rủi ro', 'Quỹ bảo hiểm y tế', 'Danh mục chi trả'],
              furtherReading: [
                'Bài học "Tiền thuế được chi cho những gì?" trong khoá Thuế 101',
                'Luật Bảo hiểm y tế — phạm vi được hưởng và mức cùng chi trả',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Bảo hiểm là chia sẻ rủi ro, không phải tiết kiệm — phần lớn người tham gia nhận lại ít hơn phần đóng.\n' +
              '✓ Nhìn theo một năm thì thấy bất công; nhìn theo cả đời thì phần lớn ai cũng đi qua cả hai vai.\n' +
              '✓ Quỹ bảo hiểm y tế vừa từ đóng góp của người tham gia vừa có phần ngân sách hỗ trợ cho một số nhóm.\n' +
              '✓ Rời khỏi hệ thống để mua sản phẩm ngoài luồng là mất ba khoản, trong đó khoản ít được nhắc nhất là phần mình đã góp.',
          },
          {
            type: 'text',
            title: 'Nhưng con trai bà nói một điều làm bà lo',
            paragraphs: [
              'Khi bà kể lại chuyện quỹ chung, con trai bà nói: "Cái quỹ đó chạy được là nhờ số người đóng nhiều hơn số người hưởng mẹ ạ."',
              '"Mà bây giờ người già ngày càng đông, người trẻ đi làm thì ngày càng ít hơn so với hồi trước."',
              'Bà Bảy hỏi: "Vậy tới lúc thằng Khoa già thì sao con?"',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'ai-tra-cho-tuoi-gia-cua-ai',
        title: 'Ai trả cho tuổi già của ai?',
        blocks: [
          {
            type: 'text',
            title: 'Bà Bảy tưởng lương hưu là tiền của mình',
            paragraphs: [
              'Suốt mười hai năm, bà Bảy nghĩ lương hưu là số tiền bà đã gửi vào một chỗ hồi đi làm, giờ lấy ra dùng dần.',
              'Con trai bà nói cơ chế không hẳn như vậy.',
              'Phần lớn hệ thống hưu trí công vận hành theo nguyên tắc chi trả từ nguồn thu hiện tại: tiền đóng của những người đang đi làm hôm nay được dùng để chi trả cho những người đang hưởng hôm nay.',
            ],
          },
          {
            type: 'callout',
            icon: 'users',
            title: 'Hai mô hình hưu trí',
            variant: 'info',
            text: 'Mô hình tài khoản cá nhân: tiền bạn đóng được giữ và đầu tư, tới tuổi hưu bạn rút phần của mình. Mô hình liên thế hệ: tiền của người đang đi làm chi trả cho người đang nghỉ hưu, và tới lượt mình bạn được thế hệ sau chi trả. Nhiều hệ thống hưu trí công trên thế giới, trong đó có Việt Nam, mang đặc điểm của mô hình thứ hai.',
          },
          {
            type: 'question',
            question:
              'Điểm yếu lớn nhất của mô hình liên thế hệ là gì?',
            options: [
              { id: 'a', text: 'Tiền bị mất giá theo thời gian', isCorrect: false },
              { id: 'b', text: 'Nó phụ thuộc vào tỷ lệ giữa số người đang đóng và số người đang hưởng — nếu tỷ lệ này giảm thì hệ thống chịu áp lực', isCorrect: true },
              { id: 'c', text: 'Người đóng không được biết tiền của mình đi đâu', isCorrect: false },
              { id: 'd', text: 'Không thể rút tiền trước tuổi hưu', isCorrect: false },
            ],
            explanation:
              'Mô hình này hoạt động tốt khi có nhiều người đóng cho mỗi người hưởng. Khi dân số già đi — tuổi thọ tăng, tỷ lệ sinh giảm — tỷ lệ đó thu hẹp lại, và cùng một mức đóng sẽ không còn đủ cho cùng một mức hưởng. Đó là lý do gần như mọi nước có dân số già đều phải điều chỉnh: tăng tuổi nghỉ hưu, tăng mức đóng, hoặc điều chỉnh công thức tính mức hưởng.',
          },
          {
            type: 'slider-simulator',
            title: 'Tỷ lệ người đóng trên người hưởng',
            description:
              'Mô phỏng đơn giản hoá: kéo hai thanh trượt để thấy tỷ lệ giữa số người đang đóng và số người đang hưởng ảnh hưởng thế nào tới cân đối của một quỹ hưu trí liên thế hệ. Các con số chỉ mang tính minh hoạ cơ chế.',
            sliders: [
              {
                id: 'nguoiDong',
                label: 'Số người đang đóng góp (trên 100 người hưởng)',
                min: 100,
                max: 900,
                step: 25,
                defaultValue: 500,
                unit: 'người',
              },
              {
                id: 'mucDong',
                label: 'Mức đóng bình quân mỗi người đóng',
                min: 5,
                max: 30,
                step: 1,
                defaultValue: 15,
                unit: 'đơn vị',
              },
            ],
            outputs: [
              {
                id: 'tyle',
                label: 'Số người đóng cho mỗi người hưởng',
                formula: 'nguoiDong / 100',
                unit: 'người',
                format: 'number',
              },
              {
                id: 'thuduoc',
                label: 'Tổng thu của quỹ',
                formula: 'nguoiDong * mucDong',
                unit: 'đơn vị',
                format: 'number',
              },
              {
                id: 'mucHuong',
                label: 'Mức chi trả bình quân cho mỗi người hưởng',
                formula: 'nguoiDong * mucDong / 100',
                unit: 'đơn vị',
                format: 'number',
              },
            ],
            chart: {
              type: 'bar',
              bars: [
                { label: 'Tổng thu', formula: 'nguoiDong * mucDong / 10', color: '#16a34a' },
                { label: 'Mức chi mỗi người hưởng', formula: 'nguoiDong * mucDong / 100', color: '#dc2626' },
              ],
            },
            breakpoints: [
              {
                condition: 'nguoiDong >= 600',
                message:
                  'Nhiều người đóng cho mỗi người hưởng: quỹ dư dả, có thể chi trả mức cao mà không cần tăng mức đóng.',
                variant: 'success',
              },
              {
                condition: 'nguoiDong >= 250 && nguoiDong < 600',
                message:
                  'Tỷ lệ đang thu hẹp. Muốn giữ nguyên mức hưởng thì phải tăng mức đóng, hoặc kéo dài thời gian đóng góp.',
                variant: 'info',
              },
              {
                condition: 'nguoiDong < 250',
                message:
                  'Ít người đóng cho mỗi người hưởng: hệ thống chịu áp lực lớn. Ba lối ra thường thấy là tăng tuổi nghỉ hưu, tăng mức đóng, hoặc giảm mức hưởng — và cả ba đều khó về mặt chính trị.',
                variant: 'warning',
              },
            ],
          },
          {
            type: 'text',
            title: 'Bà Bảy hiểu ra một chuyện',
            paragraphs: [
              'Kéo thanh trượt vài lần, bà thấy rõ một điều: không có phương án nào làm mọi người hài lòng.',
              'Tăng tuổi nghỉ hưu thì người đang gần hưu chịu thiệt. Tăng mức đóng thì người đang đi làm chịu thiệt. Giảm mức hưởng thì người đang hưởng chịu thiệt.',
              '"Tức là ai cũng đúng khi phản đối hết," bà nói.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Con trai bà nói: "Dạ. Nên mấy cái này ở nước nào cũng cãi nhau dữ lắm mẹ."',
              '"Không phải vì có ai xấu. Vì cái bánh chỉ có bấy nhiêu mà ba nhóm đều có lý."',
              'Bà Bảy nhận ra đây là cùng một chuyện với bảng ngân sách mà cháu bác Tư từng kể: tổng cố định thì mọi lựa chọn đều là đánh đổi.',
            ],
          },
          {
            type: 'text',
            title: 'Bà Bảy nhớ lại hồi bà đi làm',
            paragraphs: [
              'Bà làm ở một xí nghiệp ba mươi mấy năm. Mỗi tháng bảng lương có một dòng bị trừ, và bà chưa từng hỏi dòng đó là gì.',
              '"Hồi đó ai cũng bị trừ, nên mình nghĩ là chuyện bình thường."',
              'Bà nhận ra bà đã ở cả hai đầu của cùng một quỹ mà chưa lần nào nhìn thấy nó.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao phần lớn người lao động không biết mình đang đóng vào quỹ hưu trí bao nhiêu và được bao nhiêu năm?',
            options: [
              { id: 'a', text: 'Vì thông tin đó được giữ bí mật', isCorrect: false },
              { id: 'b', text: 'Vì nó bị trừ tự động, hiện dưới dạng một dòng trên bảng lương, và hậu quả thì cách xa vài chục năm nên không ai có lý do trước mắt để tra', isCorrect: true },
              { id: 'c', text: 'Vì công ty không cung cấp thông tin', isCorrect: false },
              { id: 'd', text: 'Vì tra cứu rất phức tạp', isCorrect: false },
            ],
            explanation:
              'Thông tin này tra được — có mã số bảo hiểm xã hội, có ứng dụng và cổng tra cứu quá trình tham gia. Rào cản không phải là bí mật hay thủ tục. Nó là sự kết hợp của hai thứ: khoản tiền bị trừ tự động nên không tạo ra khoảnh khắc quyết định nào, và hậu quả nằm ở tương lai xa nên không có gì thúc bạn tra hôm nay.',
          },
          {
            type: 'text',
            paragraphs: [
              'Con trai bà bảo bây giờ tra được trên ứng dụng, chỉ cần mã số bảo hiểm xã hội.',
              'Anh tra thử cho mình và thấy đúng số năm anh đã tham gia trước khi sang Nhật.',
              '"Hoá ra con cũng chưa từng coi cái này," anh nói.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Khi ba nhóm đều có lý',
            variant: 'info',
            text: 'Có những vấn đề chính sách mà mọi phương án đều làm một nhóm chịu thiệt, và nhóm đó đều có lý do chính đáng để phản đối. Trong những trường hợp này, việc đi tìm "phương án đúng" là đi tìm thứ không tồn tại. Câu hỏi thực tế hơn là: chúng ta chấp nhận nhóm nào chịu phần nào, và quyết định đó được đưa ra một cách công khai hay lặng lẽ.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc điều chỉnh hệ thống hưu trí thường được thực hiện dần và báo trước nhiều năm?',
            options: [
              { id: 'a', text: 'Vì thủ tục pháp lý mất nhiều thời gian', isCorrect: false },
              { id: 'b', text: 'Vì người gần tuổi hưu không còn thời gian để điều chỉnh kế hoạch của mình, nên thay đổi đột ngột gây thiệt hại lớn nhất cho nhóm ít khả năng thích ứng nhất', isCorrect: true },
              { id: 'c', text: 'Vì cần thời gian để cải tạo hệ thống công nghệ thông tin', isCorrect: false },
              { id: 'd', text: 'Vì phải chờ ý kiến của tất cả người tham gia', isCorrect: false },
            ],
            explanation:
              'Một người ba mươi tuổi biết trước rằng tuổi nghỉ hưu sẽ tăng thì còn ba mươi năm để điều chỉnh: tiết kiệm thêm, tham gia thêm bảo hiểm, tính lại kế hoạch. Một người năm mươi tám tuổi nhận tin đó thì không còn làm gì được. Vì thế lộ trình dài và báo trước không phải là sự chậm chạp — nó là cách phân bổ chi phí thích ứng cho công bằng hơn.',
          },
          {
            type: 'text',
            title: 'Bà Bảy nghĩ về Khoa',
            paragraphs: [
              'Khoa ba mươi tư tuổi, làm ở Nhật, và anh có tham gia hệ thống bên đó.',
              'Bà hỏi con: "Vậy sau này con về Việt Nam thì mấy năm bên kia có tính không?"',
              'Khoa nói có hiệp định về bảo hiểm xã hội giữa hai nước, nhưng anh cũng chưa tìm hiểu kỹ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy bảo con tìm hiểu đi, và bà nói một câu mà Khoa nhớ lâu:',
              '"Con đừng để tới lúc như mẹ mới đọc cái hoá đơn."',
              'Khoa dành một buổi tối tra và phát hiện có những điều kiện cụ thể về thời gian đóng và thủ tục xác nhận mà anh cần biết trước, không phải lúc sắp nghỉ hưu.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Quyết định về tuổi già phải ra khi còn trẻ',
            variant: 'warning',
            text: 'Đặc điểm khó chịu nhất của mọi chuyện liên quan tới hưu trí là hậu quả xuất hiện sau vài chục năm, còn quyết định thì phải ra ngay bây giờ. Người có đủ thông tin ở tuổi ba mươi thì còn xoay xở được; người biết ở tuổi năm mươi tám thì gần như chỉ còn chấp nhận. Đây là lý do thông tin về hệ thống này cần đến với người trẻ chứ không phải với người sắp hưu.',
          },
          {
            type: 'text',
            title: 'Một điều bà Bảy muốn nói cho công bằng',
            paragraphs: [
              'Bà không muốn câu chuyện này nghe như thế hệ của bà đang là gánh nặng cho thế hệ sau.',
              'Bà và những người cùng lứa đã làm việc qua những năm rất khó khăn, và phần lớn những gì thế hệ sau đang có được xây từ giai đoạn đó.',
              '"Mà tụi tui cũng nuôi ba má tụi tui hồi hồi đó chưa có bảo hiểm gì hết," bà nói.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao cách đặt vấn đề "người già là gánh nặng cho người trẻ" là một cách nhìn thiếu sót?',
            options: [
              { id: 'a', text: 'Vì nói vậy là thiếu tôn trọng người cao tuổi', isCorrect: false },
              { id: 'b', text: 'Vì nó cắt một lát thời gian ra khỏi một chuỗi trao đổi kéo dài nhiều thế hệ, trong đó mỗi thế hệ đều vừa nhận vừa trao', isCorrect: true },
              { id: 'c', text: 'Vì người già cũng đóng thuế tiêu dùng', isCorrect: false },
              { id: 'd', text: 'Vì số liệu về già hoá dân số chưa chính xác', isCorrect: false },
            ],
            explanation:
              'Cùng một vấn đề trông rất khác tuỳ vào khung thời gian bạn chọn. Nhìn năm nay: một nhóm đóng và một nhóm hưởng. Nhìn qua nhiều thế hệ: mỗi nhóm đều đã nuôi thế hệ trước và xây nên phần lớn những gì thế hệ sau thừa hưởng. Áp lực về cân đối quỹ là có thật và cần được xử lý — nhưng mô tả nó bằng ngôn ngữ "gánh nặng" thì vừa không chính xác vừa làm hỏng khả năng bàn bạc giữa các nhóm.',
          },
          {
            type: 'text',
            title: 'Bà Bảy đề nghị một chuyện ở hội',
            paragraphs: [
              'Ở buổi sinh hoạt tiếp theo, bà đề nghị một việc mà cả hội thấy lạ.',
              'Bà đề nghị mời con cháu của các hội viên tới dự một buổi, để nghe về bảo hiểm xã hội và hưu trí.',
              '"Tụi mình biết thì cũng trễ rồi. Tụi nhỏ biết thì còn kịp."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Hệ thống hưu trí và bài toán liên thế hệ',
            description: 'Vì sao mọi phương án đều có người chịu thiệt, và điều gì quyết định sự công bằng.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai mô hình',
                  paragraphs: [
                    'Tài khoản cá nhân: tiền bạn đóng được giữ và đầu tư, tới tuổi hưu bạn rút phần của mình cùng phần sinh lời.',
                    'Liên thế hệ: tiền của người đang đi làm chi trả cho người đang nghỉ hưu; tới lượt mình bạn được thế hệ sau chi trả.',
                    'Nhiều hệ thống hưu trí công mang đặc điểm của mô hình thứ hai, hoặc kết hợp cả hai.',
                  ],
                },
                {
                  heading: 'Vì sao dân số già gây áp lực',
                  paragraphs: [
                    'Mô hình liên thế hệ phụ thuộc vào tỷ lệ giữa số người đang đóng và số người đang hưởng.',
                    'Tuổi thọ tăng và tỷ lệ sinh giảm làm tỷ lệ đó thu hẹp, nên cùng một mức đóng không còn đủ cho cùng một mức hưởng.',
                    'Ba lối ra thường thấy: tăng tuổi nghỉ hưu, tăng mức đóng, hoặc điều chỉnh công thức tính mức hưởng. Cả ba đều làm một nhóm chịu thiệt.',
                  ],
                },
                {
                  heading: 'Điều gì làm cho một điều chỉnh công bằng hơn',
                  paragraphs: [
                    'Lộ trình dài và báo trước: người còn nhiều năm thì điều chỉnh được kế hoạch, người sắp hưu thì không.',
                    'Công khai về việc nhóm nào chịu phần nào, thay vì để thay đổi diễn ra qua các điều chỉnh kỹ thuật ít ai để ý.',
                    'Thông tin đến với người trẻ, vì đó là nhóm còn thời gian để hành động dựa trên nó.',
                  ],
                },
              ],
              relatedConcepts: ['Mô hình liên thế hệ', 'Già hoá dân số', 'Lộ trình chính sách'],
              furtherReading: [
                'Luật Bảo hiểm xã hội — điều kiện hưởng lương hưu và cách tính mức hưởng',
                'Bài học "Tiền thuế được chi cho những gì?" trong khoá Thuế 101',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nhiều hệ thống hưu trí công vận hành theo nguyên tắc liên thế hệ, không phải tài khoản tiết kiệm cá nhân.\n' +
              '✓ Điểm yếu của mô hình đó là phụ thuộc vào tỷ lệ giữa số người đóng và số người hưởng.\n' +
              '✓ Ba lối ra — tăng tuổi hưu, tăng mức đóng, giảm mức hưởng — đều làm một nhóm chịu thiệt, và nhóm đó đều có lý.\n' +
              '✓ Lộ trình dài và báo trước là cách phân bổ chi phí thích ứng công bằng hơn, vì người sắp hưu không còn thời gian xoay xở.',
          },
          {
            type: 'text',
            title: 'Buổi hôm đó có hai mươi người trẻ tới',
            paragraphs: [
              'Đa số là con cháu các hội viên, tuổi từ hai mươi tới bốn mươi.',
              'Bà Bảy không thuyết trình gì. Bà chỉ đưa cuốn sổ mười hai tờ hoá đơn của mình cho họ xem, và kể chuyện bà tưởng mình không đóng góp gì suốt mười hai năm.',
              'Rồi bà hỏi một câu: "Trong đây có ai biết mình đã đóng bảo hiểm được bao nhiêu năm chưa?"',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'cau-hoi-cua-ba-bay-o-cuoi-phong',
        title: 'Câu hỏi của bà Bảy ở cuối phòng',
        blocks: [
          {
            type: 'text',
            title: 'Hai mươi người trẻ, không ai giơ tay',
            paragraphs: [
              '"Trong đây có ai biết mình đã đóng bảo hiểm được bao nhiêu năm chưa?"',
              'Hai mươi người, không ai giơ tay. Có mấy người cười ngượng.',
              'Bà Bảy nói: "Hồi bà ba mươi tuổi bà cũng vậy. Bà bốn mươi hai năm sau mới coi."',
            ],
          },
          {
            type: 'callout',
            icon: 'smartphone',
            title: 'Việc bà Bảy đề nghị',
            variant: 'info',
            text: 'Bà không nói gì thêm về chính sách. Bà chỉ đề nghị hai mươi người đó lấy điện thoại ra ngay tại chỗ, tra thử quá trình tham gia bảo hiểm xã hội của mình, và nói cho bà biết con số.',
          },
          {
            type: 'question',
            question:
              'Vì sao bà Bảy đề nghị họ tra ngay tại chỗ thay vì dặn về nhà tra?',
            options: [
              { id: 'a', text: 'Vì bà muốn kiểm tra xem họ có làm không', isCorrect: false },
              { id: 'b', text: 'Vì khoảng cách giữa "sẽ làm" và "làm rồi" là chỗ mà gần như mọi ý định tốt bị mất — làm ngay khi còn đang ở trong khoảnh khắc quan tâm thì tỷ lệ hoàn thành cao hơn hẳn', isCorrect: true },
              { id: 'c', text: 'Vì ở nhà không tra được', isCorrect: false },
              { id: 'd', text: 'Vì cần có người hướng dẫn', isCorrect: false },
            ],
            explanation:
              'Một ý định "về nhà sẽ làm" đi qua rất nhiều chỗ có thể rơi rụng: quên, bận, không nhớ tra ở đâu, hoặc đơn giản là khoảnh khắc quan tâm đã trôi qua. Làm ngay trong lúc còn đang quan tâm loại bỏ toàn bộ khoảng cách đó. Đây là nguyên tắc dùng được cho gần như mọi việc nhỏ mà người ta biết là nên làm nhưng cứ hoãn.',
          },
          {
            type: 'text',
            title: 'Kết quả trong mười phút',
            paragraphs: [
              'Mười ba trong hai mươi người tra được ngay.',
              'Bốn người phát hiện quá trình đóng của mình bị đứt quãng ở một giai đoạn mà họ không nhớ vì sao.',
              'Hai người làm việc tự do phát hiện mình chưa từng tham gia ngày nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Một bạn nam hỏi: "Bị đứt quãng thì có sao không cô?"',
              'Bà Bảy không biết trả lời. Nhưng có một chị trong phòng làm nhân sự thì biết, và chị giải thích về việc cộng dồn thời gian tham gia và về những trường hợp cần liên hệ để đối chiếu.',
              'Buổi hôm đó kéo dài thêm bốn mươi phút so với dự kiến, và phần lớn thời gian là hai mươi người trẻ hỏi nhau chứ không phải nghe ai giảng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Câu hỏi mở ra nhiều hơn bài giảng',
            variant: 'info',
            text: 'Bà Bảy không biết gì về bảo hiểm xã hội hơn những người trong phòng. Thứ bà làm chỉ là đặt một câu hỏi mà không ai từng đặt cho họ, vào lúc họ đang ngồi cùng nhau. Phần kiến thức thì đã có sẵn trong phòng — chị làm nhân sự biết, vài người khác biết từng phần. Cái thiếu là một câu hỏi để nó được nói ra.',
          },
          {
            type: 'question',
            question:
              'Vì sao kiến thức "đã có sẵn trong phòng" lại thường không được chia sẻ nếu không có ai hỏi?',
            options: [
              { id: 'a', text: 'Vì người biết muốn giữ lợi thế cho mình', isCorrect: false },
              { id: 'b', text: 'Vì người biết không nghĩ rằng người khác không biết — thứ mình đã quen thì trông như hiển nhiên với tất cả', isCorrect: true },
              { id: 'c', text: 'Vì chia sẻ kiến thức chuyên môn có rủi ro pháp lý', isCorrect: false },
              { id: 'd', text: 'Vì không có dịp gặp mặt', isCorrect: false },
            ],
            explanation:
              'Chị làm nhân sự tra quá trình đóng bảo hiểm mỗi tuần, nên với chị đó là chuyện ai cũng biết. Hiện tượng này khá phổ biến: khi đã thành thạo một việc, ta rất khó hình dung trạng thái chưa biết nó. Vì thế người có kiến thức thường không chủ động chia sẻ, không phải vì giữ riêng mà vì không thấy có gì để chia sẻ. Một câu hỏi thẳng là thứ phá vỡ điều đó.',
          },
          {
            type: 'text',
            title: 'Một bạn hỏi ngược lại bà Bảy',
            paragraphs: [
              'Một bạn nữ khoảng hai mươi lăm tuổi hỏi: "Cô ơi, nếu sau này quỹ không đủ thì sao cô? Tụi con đóng bây giờ mà lúc tụi con già thì còn gì không?"',
              'Bà Bảy im, vì đó đúng là câu bà đã hỏi con trai mình.',
              'Bà trả lời thật: "Cô không biết. Cô chỉ biết là nếu không ai đóng thì chắc chắn không còn gì."',
            ],
          },
          {
            type: 'question',
            question:
              'Nỗi lo "đóng bây giờ nhưng sau này không còn gì" nên được xử lý thế nào?',
            options: [
              { id: 'a', text: 'Bỏ qua vì đó là lo xa không có căn cứ', isCorrect: false },
              { id: 'b', text: 'Thừa nhận đây là một rủi ro thật cần được theo dõi, đồng thời thấy rằng không tham gia gì cũng không giải quyết được rủi ro đó mà còn bỏ mất phần chắc chắn có', isCorrect: true },
              { id: 'c', text: 'Chuyển toàn bộ sang tiết kiệm cá nhân cho an toàn', isCorrect: false },
              { id: 'd', text: 'Chờ tới khi chính sách rõ ràng hơn rồi mới tham gia', isCorrect: false },
            ],
            explanation:
              'Nỗi lo này có căn cứ và không nên gạt đi — áp lực cân đối quỹ là vấn đề thật ở mọi nước có dân số già. Nhưng phản ứng "vậy thì không đóng gì" không làm giảm rủi ro, nó chỉ thêm một rủi ro nữa: bạn không có gì cả. Tiết kiệm cá nhân cũng không phải lối thoát an toàn tuyệt đối, vì nó chịu rủi ro lạm phát và rủi ro chính bạn tiêu mất. Cách xử lý thực tế là kết hợp, và theo dõi thay đổi chính sách để điều chỉnh sớm.',
          },
          {
            type: 'text',
            paragraphs: [
              'Chị làm nhân sự bổ sung một ý mà bà Bảy thấy hữu ích.',
              'Chị nói: khi bàn về rủi ro dài hạn, nên tách ra hai câu hỏi — cái gì gần như chắc chắn, và cái gì còn chưa rõ.',
              'Gần như chắc chắn: thời gian tham gia càng dài thì quyền lợi càng cao, và thời gian đã mất thì không lấy lại được. Chưa rõ: mức hưởng cụ thể sau ba mươi năm nữa sẽ được tính thế nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Vậy mình cứ làm cái chắc chắn trước," một bạn nói.',
              'Bà Bảy thấy câu đó gọn hơn tất cả những gì bà định nói.',
              'Bà ghi nó vào sổ tay để lần sau kể lại cho hội người cao tuổi.',
            ],
          },
          {
            type: 'text',
            title: 'Hai người chưa từng tham gia',
            paragraphs: [
              'Hai bạn làm việc tự do — một người thiết kế, một người bán hàng online — chưa từng tham gia bảo hiểm xã hội.',
              'Cả hai đều nói cùng một lý do: thu nhập không đều, sợ cam kết một khoản cố định hằng tháng.',
              'Đúng câu mà Đức từng nghe trong nhóm tài xế.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Chị làm nhân sự chỉ ra một điều họ chưa biết: hình thức tự nguyện cho phép chọn mức đóng trong một khoảng, và có thể đóng theo nhiều phương thức khác nhau chứ không nhất thiết đều đặn từng tháng.',
              'Hai bạn không biết điều đó, nên trong đầu họ lựa chọn chỉ có hai: cam kết một khoản cố định hằng tháng, hoặc không tham gia gì.',
              'Bà Bảy nhận ra đây chính là cái lưỡng nan giả mà Đức từng kể — chỉ có điều lần này không ai cố tình dựng ra nó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hai bạn làm việc tự do hôm đó không đăng ký ngay — cả hai nói cần về tính lại.',
              'Ba tuần sau, một trong hai bạn nhắn cho chị làm nhân sự hỏi thêm thủ tục.',
              'Người còn lại thì không. Bà Bảy nghe kể và thấy đó là tỷ lệ hợp lý — bà không mong ai thay đổi chỉ sau một buổi tối.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Lưỡng nan hình thành từ sự thiếu thông tin',
            variant: 'warning',
            text: 'Không phải mọi lựa chọn hai cửa đều do ai đó dựng lên. Rất nhiều lưỡng nan hình thành đơn giản vì người ta không biết cửa thứ ba tồn tại. Khi bạn thấy mình đang đứng trước hai lựa chọn đều tệ, câu hỏi đầu tiên nên là: có lựa chọn nào mình chưa biết không, và ai là người có thể biết?',
          },
          {
            type: 'text',
            title: 'Bà Bảy về nhà và nghĩ',
            paragraphs: [
              'Bà không thay đổi được chính sách nào. Bà không hiểu thêm bao nhiêu về hệ thống hưu trí.',
              'Nhưng trong một buổi tối, mười ba người trẻ lần đầu nhìn thấy quá trình tham gia của mình, bốn người phát hiện chỗ đứt quãng cần đối chiếu, và hai người biết rằng họ có lựa chọn thứ ba.',
              'Bà nghĩ đó là việc lớn nhất bà làm được kể từ khi nghỉ hưu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Con trai bà nói: "Mẹ làm được cái này là tại mẹ ở giữa hai bên."',
              '"Mấy người trẻ thì nghĩ chuyện hưu còn xa. Mấy người già thì nghĩ đã trễ rồi. Mẹ là người biết nó không xa mà cũng chưa trễ với tụi nhỏ."',
              'Bà Bảy thấy câu đó đúng, và bà cũng thấy nó hơi buồn.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Ba việc nên làm với bảo hiểm xã hội của mình',
            description: 'Làm được trong mười phút, và vì sao càng sớm càng có giá trị.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba việc trong mười phút',
                  paragraphs: [
                    'Tra quá trình tham gia của mình qua ứng dụng hoặc cổng tra cứu của cơ quan bảo hiểm xã hội, bằng mã số bảo hiểm xã hội.',
                    'Kiểm tra có giai đoạn nào bị đứt quãng hoặc ghi nhận chưa đúng không. Phát hiện sớm thì đối chiếu dễ hơn nhiều so với phát hiện lúc làm thủ tục hưởng.',
                    'Nếu đang làm việc tự do và chưa tham gia: tìm hiểu hình thức tự nguyện, mức đóng có thể chọn và các phương thức đóng.',
                  ],
                },
                {
                  heading: 'Vì sao sớm quan trọng hơn nhiều',
                  paragraphs: [
                    'Quyền lợi phụ thuộc vào thời gian tham gia, nên mỗi năm không đóng là một năm không bù lại được.',
                    'Sai sót trong ghi nhận dễ đối chiếu khi còn gần thời điểm phát sinh, và rất khó khi đã hai chục năm.',
                    'Người biết ở tuổi ba mươi còn điều chỉnh được kế hoạch; người biết ở tuổi gần hưu thì chỉ còn chấp nhận.',
                  ],
                },
                {
                  heading: 'Khi bạn thấy chỉ có hai lựa chọn tệ',
                  paragraphs: [
                    'Rất nhiều lưỡng nan hình thành từ sự thiếu thông tin, không phải do ai dựng lên.',
                    'Hỏi: có lựa chọn nào mình chưa biết không, và ai trong số người quen có thể biết?',
                    'Kiến thức thường đã có sẵn quanh bạn — người có nó chỉ không nghĩ rằng bạn không biết.',
                  ],
                },
              ],
              relatedConcepts: ['Thời gian tham gia bảo hiểm xã hội', 'Bảo hiểm xã hội tự nguyện', 'Lưỡng nan do thiếu thông tin'],
              furtherReading: [
                'Luật Bảo hiểm xã hội — bảo hiểm xã hội tự nguyện và điều kiện hưởng',
                'Ứng dụng và cổng tra cứu quá trình tham gia của cơ quan bảo hiểm xã hội',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Khoảng cách giữa "sẽ làm" và "làm rồi" là nơi gần như mọi ý định tốt bị mất — làm ngay khi còn đang quan tâm.\n' +
              '✓ Kiến thức thường đã có sẵn trong phòng; người biết chỉ không nghĩ rằng người khác không biết.\n' +
              '✓ Nhiều lưỡng nan hình thành từ sự thiếu thông tin chứ không do ai dựng lên.\n' +
              '✓ Sai sót trong ghi nhận bảo hiểm dễ đối chiếu khi còn gần thời điểm phát sinh, rất khó khi đã hai chục năm.',
          },
          {
            type: 'text',
            title: 'Điều bà Bảy mang theo',
            paragraphs: [
              'Bà Bảy vẫn nhận lương hưu mỗi tháng, vẫn đi khám ba tháng một lần, vẫn giữ hoá đơn kẹp vào cuốn sổ.',
              'Bà không còn nói câu "bà già rồi, chuyện đó để mấy người đi làm lo".',
              'Bà thay bằng một câu khác, mà bà nói khi có ai hỏi vì sao bà quan tâm mấy chuyện này:',
              '"Bà xài tiền chung mỗi ngày mà. Xài thì phải biết nó ở đâu ra chớ."',
            ],
          },
        ],
      },
    ],
  },
};
