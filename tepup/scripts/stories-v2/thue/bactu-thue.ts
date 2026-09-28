import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Bác Tư × Thuế 101 — "Thuế khoán và chuyện công bằng". VIẾT LẠI.
 *
 * Bản cũ hướng dẫn bác Tư về thuế khoán và đăng ký kinh doanh. Bản này giữ bối
 * cảnh nhưng đổi câu hỏi: vì sao bác đóng một mức cố định trong khi doanh nghiệp
 * lớn có cả một bộ phận làm việc giảm nghĩa vụ, và bác có quyền gì trong chuyện đó.
 */
export const BACTU_THUE: StorySeed = {
  slug: 'bactu-thue',
  characterSlug: 'street-vendor',
  title: 'Thuế khoán và chuyện công bằng',
  teaser:
    'Bác Tư đóng một mức cố định mỗi tháng, không cần sổ sách, không cần kê khai. Nghe thì tiện. Cho tới khi bác hỏi: mức đó ai tính, tính bằng cách nào?',
  icon: 'store',
  estimatedTime: '~30 phút',
  sortOrder: 2,
  courseSlugs: [COURSE.thue],
  part: {
    name: 'Bác Tư và tờ thông báo mỗi năm',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'to-thong-bao-moi-nam',
        title: 'Tờ thông báo mỗi năm',
        blocks: [
          {
            type: 'text',
            title: 'Tháng Giêng',
            paragraphs: [
              'Đầu năm, bác Tư nhận được một tờ thông báo từ chi cục thuế: mức thuế khoán năm nay của hộ kinh doanh bác.',
              'Bác đọc con số, gật đầu, cất vào ngăn kéo, và đóng đủ mỗi tháng như mười năm nay.',
              'Bác chưa từng thắc mắc con số đó ở đâu ra.',
            ],
          },
          {
            type: 'callout',
            icon: 'file-text',
            title: 'Thuế khoán là gì',
            variant: 'info',
            text: 'Là hình thức tính thuế dành cho hộ kinh doanh không thực hiện đầy đủ chế độ sổ sách kế toán. Thay vì tính trên doanh thu thực tế từng tháng, cơ quan thuế ấn định một mức doanh thu khoán, và từ đó ra số thuế phải nộp cố định trong kỳ. Hộ kinh doanh có doanh thu dưới ngưỡng quy định thì không thuộc diện phải nộp.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, ưu điểm lớn nhất của thuế khoán đối với một người bán hàng như bác Tư là gì?',
            options: [
              { id: 'a', text: 'Số thuế phải nộp thấp hơn hẳn so với cách tính thông thường', isCorrect: false },
              { id: 'b', text: 'Không phải giữ sổ sách, không phải kê khai hằng tháng, biết trước số phải nộp', isCorrect: true },
              { id: 'c', text: 'Được hưởng nhiều ưu đãi hơn', isCorrect: false },
              { id: 'd', text: 'Không bị cơ quan thuế kiểm tra', isCorrect: false },
            ],
            explanation:
              'Thuế khoán không đảm bảo nộp ít hơn — có tháng bác Tư bán được nhiều thì bác lời, có tháng ế thì bác thiệt. Ưu điểm thật của nó là chi phí tuân thủ gần bằng không: một người bán bánh mì mười tiếng mỗi ngày không thể vừa bán vừa ghi sổ doanh thu từng ổ, lưu hoá đơn đầu vào, và làm tờ khai hằng tháng.',
          },
          {
            type: 'text',
            title: 'Đứa cháu hỏi bác một câu',
            paragraphs: [
              'Đứa cháu sinh viên của bác Tư nhìn tờ thông báo và hỏi: "Bác ơi con số này người ta tính sao vậy bác?"',
              'Bác Tư nói: "Người ta tính thôi, bác đâu có biết."',
              '"Vậy nếu người ta tính cao hơn bác bán được thì sao?"',
              'Bác Tư ngẩn ra. Mười năm bác chưa nghĩ tới chuyện đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đứa cháu tìm hiểu và giải thích lại cho bác: mức doanh thu khoán được xác định dựa trên khai báo của hộ kinh doanh, kết hợp với dữ liệu của cơ quan thuế về các hộ cùng ngành nghề, cùng quy mô, cùng khu vực, và có tham khảo ý kiến của hội đồng tư vấn thuế cấp xã phường.',
              'Mức khoán dự kiến còn phải được niêm yết công khai để các hộ biết và có ý kiến trước khi chính thức áp dụng.',
              '"Vậy là bác có quyền có ý kiến hả con?"',
              '"Dạ có bác."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Niêm yết công khai và quyền có ý kiến',
            variant: 'info',
            text: 'Quy trình xác định mức khoán bao gồm bước niêm yết công khai dự kiến mức doanh thu và mức thuế của các hộ trong địa bàn, để các hộ tự đối chiếu với nhau và phản ánh nếu thấy chưa phù hợp. Đây là một cơ chế minh bạch được thiết kế sẵn — và giống nhiều cơ chế khác, nó chỉ hoạt động khi có người sử dụng.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc niêm yết công khai mức khoán của các hộ trong cùng địa bàn lại quan trọng?',
            options: [
              { id: 'a', text: 'Để cơ quan thuế dễ quản lý hơn', isCorrect: false },
              { id: 'b', text: 'Để các hộ tự so sánh được với nhau — thứ mà không ai ngoài họ làm được, vì chỉ họ mới biết ai bán nhiều ai bán ít', isCorrect: true },
              { id: 'c', text: 'Để người dân biết ai đóng thuế nhiều', isCorrect: false },
              { id: 'd', text: 'Vì đó là thủ tục bắt buộc', isCorrect: false },
            ],
            explanation:
              'Cơ quan thuế ước lượng doanh thu từ bên ngoài, dựa trên diện tích, ngành hàng, vị trí, và dữ liệu chung. Nhưng người biết rõ nhất quán nào đông khách, quán nào ế là những người bán hàng cạnh nhau mỗi ngày. Niêm yết công khai chính là cách huy động thứ hiểu biết mà chỉ họ có — nó biến việc so sánh thành việc ai cũng làm được trong ba phút.',
          },
          {
            type: 'hot-cold-guess',
            title: 'Bạn đoán thử',
            question:
              'Ở Việt Nam, số hộ kinh doanh cá thể đang hoạt động vào khoảng bao nhiêu triệu hộ?',
            answer: 5,
            unit: 'triệu hộ',
            tolerance: 1.5,
            hints: [
              'Con số này lớn hơn nhiều so với số doanh nghiệp đăng ký chính thức.',
              'Nó nằm trong khoảng một chữ số, tính bằng triệu.',
              'Khu vực này tạo ra việc làm cho một tỷ trọng rất lớn lao động phi chính thức.',
            ],
            context:
              'Con số này giải thích vì sao thuế khoán tồn tại: không thể yêu cầu hàng triệu hộ nhỏ thực hiện chế độ kế toán đầy đủ, và cũng không thể bỏ qua họ hoàn toàn. Nó cũng cho thấy quy mô của nhóm người đang sống dưới một cơ chế thuế rất khác với cơ chế áp dụng cho doanh nghiệp.',
          },
          {
            type: 'text',
            title: 'Bác Tư ra phường xem',
            paragraphs: [
              'Đứa cháu chở bác ra trụ sở phường xem bảng niêm yết.',
              'Bảng có danh sách các hộ kinh doanh trên địa bàn, ngành nghề, và mức doanh thu khoán dự kiến.',
              'Bác Tư đọc và dừng lại ở tên một quán ăn cách chỗ bác ba trăm mét.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Quán đó bán từ sáng tới khuya, lúc nào cũng kín bàn, có bốn người phục vụ.',
              'Xe bánh mì của bác bán từ sáu giờ tới mười giờ sáng, một mình bác làm.',
              'Mức khoán của quán đó cao hơn của bác, nhưng theo bác thì không cao hơn nhiều như bác nghĩ nó phải cao hơn.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Bác Tư không kết luận vội',
            variant: 'warning',
            text: 'Đứa cháu nhắc bác: nhìn quán đông khách không đủ để kết luận doanh thu cao. Quán đó có thể chi phí lớn hơn nhiều, có thể bán món rẻ, có thể mặt bằng thuê đắt. Cảm nhận "trông có vẻ" là điểm khởi đầu của một câu hỏi, không phải kết luận của một cuộc điều tra.',
          },
          {
            type: 'question',
            question:
              'Nếu bác Tư thấy mức khoán của mình có vẻ chưa hợp lý, việc nên làm đầu tiên là gì?',
            options: [
              { id: 'a', text: 'Đăng lên mạng xã hội để tạo dư luận', isCorrect: false },
              { id: 'b', text: 'Gửi phản ánh bằng văn bản tới cơ quan thuế trong thời hạn niêm yết, kèm thông tin cụ thể về hoạt động của mình', isCorrect: true },
              { id: 'c', text: 'Ngừng nộp thuế cho tới khi được giải thích', isCorrect: false },
              { id: 'd', text: 'Nhờ hội đồng tư vấn thuế can thiệp trước khi có văn bản', isCorrect: false },
            ],
            explanation:
              'Ngừng nộp thuế là hành vi vi phạm và tạo ra rủi ro pháp lý cho chính bác. Đăng lên mạng có thể tạo áp lực nhưng không đi vào bất kỳ quy trình nào. Phản ánh bằng văn bản trong thời hạn niêm yết thì đi vào đúng quy trình đã được thiết kế cho việc này, và tạo ra nghĩa vụ xem xét, trả lời.',
          },
          {
            type: 'text',
            title: 'Bác Tư quyết định không gửi gì',
            paragraphs: [
              'Sau khi cân nhắc, bác Tư không gửi phản ánh nào.',
              'Lý do rất thực tế: bác không có số liệu doanh thu của mình. Bác không ghi sổ, bác chỉ đếm tiền cuối ngày và nhớ áng chừng.',
              'Muốn nói mức khoán chưa đúng thì phải có cái để so, mà bác thì không có.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là chỗ mà đứa cháu bác thấy đáng nói nhất trong cả câu chuyện.',
              'Bác Tư có quyền có ý kiến. Cơ chế thì tồn tại và mở. Nhưng để sử dụng được quyền đó, bác cần một thứ mà chính cơ chế thuế khoán được sinh ra để bác khỏi phải làm: giữ sổ sách.',
              '"Vậy là muốn cãi thì phải ghi sổ, mà ghi sổ được thì đâu cần đóng khoán nữa," bác nói.',
            ],
          },
          {
            type: 'text',
            title: 'Bác Tư bắt đầu ghi một dòng mỗi ngày',
            paragraphs: [
              'Đứa cháu đề nghị một cách rất nhẹ: bác không cần ghi sổ kế toán, bác chỉ cần ghi một dòng cuối ngày.',
              'Ngày, số ổ bán được, tổng tiền thu. Ba con số, mất mười giây.',
              'Bác Tư làm thử một tháng, và cuối tháng bác có thứ mà mười năm nay bác chưa từng có: một con số doanh thu thật.',
            ],
          },
          {
            type: 'question',
            question:
              'Việc ghi một dòng mỗi ngày mang lại lợi ích gì cho bác Tư ngoài chuyện thuế?',
            options: [
              { id: 'a', text: 'Bác sẽ được giảm mức thuế khoán', isCorrect: false },
              { id: 'b', text: 'Bác biết được ngày nào bán chạy, tháng nào ế, và ra được quyết định kinh doanh dựa trên số thật thay vì cảm giác', isCorrect: true },
              { id: 'c', text: 'Bác được chuyển sang chế độ kê khai', isCorrect: false },
              { id: 'd', text: 'Bác không phải nộp thuế nữa', isCorrect: false },
            ],
            explanation:
              'Không có gì đảm bảo mức khoán sẽ giảm — số liệu thật có thể cho thấy bác bán được nhiều hơn mức khoán. Nhưng lợi ích lớn hơn nằm ngoài chuyện thuế: một người bán hàng mười năm bằng cảm giác, khi có ba mươi con số trong tay, sẽ thấy những hình mẫu mà trước đó vô hình — mùa nào ế, ngày nào đông, đổi giờ bán có ích không.',
          },
          {
            type: 'text',
            paragraphs: [
              'Tháng đầu tiên, bác Tư phát hiện thứ Ba và thứ Tư là hai ngày bán kém nhất, chênh gần ba mươi phần trăm so với thứ Hai.',
              'Bác chưa bao giờ để ý điều đó, dù bác đứng ở đó mười năm.',
              '"Té ra cái mình tưởng mình biết với cái mình biết thiệt nó khác nhau," bác nói.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thuế khoán hoạt động thế nào',
            description: 'Cách xác định mức khoán, và những quyền mà hộ kinh doanh có trong quy trình đó.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao có thuế khoán',
                  paragraphs: [
                    'Việt Nam có hàng triệu hộ kinh doanh cá thể, phần lớn quy mô rất nhỏ và không thực hiện chế độ kế toán đầy đủ.',
                    'Yêu cầu tất cả kê khai theo doanh thu thực tế là bất khả thi về chi phí tuân thủ cho cả hai phía.',
                    'Thuế khoán là giải pháp đánh đổi: mất độ chính xác, được tính khả thi và chi phí thấp.',
                  ],
                },
                {
                  heading: 'Mức khoán được xác định thế nào',
                  paragraphs: [
                    'Dựa trên hồ sơ khai của hộ kinh doanh, kết hợp dữ liệu của cơ quan thuế về các hộ cùng ngành nghề, quy mô và địa bàn.',
                    'Có tham khảo ý kiến hội đồng tư vấn thuế cấp xã phường.',
                    'Mức dự kiến phải được niêm yết công khai để các hộ đối chiếu và phản ánh trước khi áp dụng chính thức.',
                    'Hộ có doanh thu dưới ngưỡng quy định thì không thuộc diện phải nộp.',
                  ],
                },
                {
                  heading: 'Quyền của hộ kinh doanh',
                  paragraphs: [
                    'Được xem danh sách niêm yết công khai mức khoán của các hộ trên địa bàn.',
                    'Được phản ánh, kiến nghị nếu thấy mức khoán chưa phù hợp, trong thời hạn niêm yết.',
                    'Được đề nghị điều chỉnh trong kỳ nếu hoạt động kinh doanh thay đổi lớn — ngừng nghỉ, thu hẹp, hoặc mở rộng.',
                    'Để sử dụng được các quyền này cần có cơ sở để so sánh, nên việc ghi chép doanh thu ở mức tối thiểu vẫn có ích dù không bắt buộc.',
                  ],
                },
              ],
              relatedConcepts: ['Thuế khoán', 'Niêm yết công khai', 'Chi phí tuân thủ'],
              furtherReading: [
                'Bài học "Bức tranh tổng quan hệ thống thuế Việt Nam" trong khoá Thuế 101',
                'Luật Quản lý thuế và các văn bản hướng dẫn về quản lý thuế đối với hộ kinh doanh',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Thuế khoán không đảm bảo nộp ít hơn — ưu điểm thật của nó là chi phí tuân thủ gần bằng không.\n' +
              '✓ Mức khoán dự kiến được niêm yết công khai, và hộ kinh doanh có quyền đối chiếu, phản ánh.\n' +
              '✓ Niêm yết công khai huy động thứ hiểu biết mà chỉ những người bán hàng cạnh nhau mới có.\n' +
              '✓ Nhưng để dùng được quyền phản ánh, cần có số liệu để so — và đó là thứ cơ chế khoán vốn miễn cho bạn.',
          },
          {
            type: 'text',
            title: 'Đứa cháu kể cho bác nghe chuyện chị Hương',
            paragraphs: [
              'Đứa cháu bác Tư quen chị Hương, kế toán ở công ty gần đó, qua một lớp học buổi tối.',
              'Nó kể lại chuyện công ty chị thuê tư vấn ba mươi trang để giảm mười tám phần trăm số thuế phải nộp.',
              'Bác Tư nghe xong hỏi: "Vậy sao bác không thuê được?"',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'vi-sao-bac-khong-thue-duoc',
        title: 'Vì sao bác Tư không thuê được tư vấn',
        blocks: [
          {
            type: 'text',
            title: 'Bác Tư tính thử',
            paragraphs: [
              '"Vậy sao bác không thuê được?"',
              'Đứa cháu hỏi lại: "Bác đóng thuế một năm bao nhiêu?"',
              'Bác Tư nói con số. Đứa cháu nhẩm rồi nói: "Thuê tư vấn một lần còn hơn cả tiền thuế cả năm của bác."',
            ],
          },
          {
            type: 'callout',
            icon: 'scale',
            title: 'Phép tính đơn giản',
            variant: 'info',
            text: 'Chi phí thuê tư vấn thuế gần như không phụ thuộc vào quy mô của người thuê — một bản rà soát vẫn tốn chừng ấy công. Với một công ty nộp hàng tỷ đồng thuế, tiết kiệm được vài phần trăm là đủ bù chi phí nhiều lần. Với một hộ kinh doanh nộp vài triệu một năm, không có phần trăm nào bù nổi.',
          },
          {
            type: 'question',
            question:
              'Vì sao các dịch vụ tối ưu thuế chỉ có ý nghĩa kinh tế với người quy mô lớn?',
            options: [
              { id: 'a', text: 'Vì người nhỏ không có gì để tối ưu về mặt pháp lý', isCorrect: false },
              { id: 'b', text: 'Vì chi phí dịch vụ gần như cố định, trong khi lợi ích thu được tỷ lệ với số thuế phải nộp — nên chỉ đáng bỏ tiền khi số thuế đủ lớn', isCorrect: true },
              { id: 'c', text: 'Vì các công ty tư vấn từ chối khách hàng nhỏ', isCorrect: false },
              { id: 'd', text: 'Vì hộ kinh doanh không được phép thuê tư vấn', isCorrect: false },
            ],
            explanation:
              'Đây là cơ chế của mọi chi phí cố định: nó chia đều cho quy mô nên nhẹ với người lớn và nặng với người nhỏ. Không ai cấm bác Tư thuê tư vấn, và cũng có những cấu trúc mà người nhỏ tận dụng được. Nhưng phép tính chi phí lợi ích thì gần như luôn cho ra kết quả không đáng — và đó là một rào cản thật, dù không có điều khoản nào tạo ra nó.',
          },
          {
            type: 'perspective-switch',
            title: 'Cùng một hệ thống thuế, ba chỗ đứng',
            event: 'Cùng một bộ luật thuế đang áp dụng cho cả ba người dưới đây trong cùng một thành phố.',
            perspectives: [
              {
                id: 'p1',
                role: 'Bác Tư — hộ kinh doanh nộp khoán',
                icon: 'store',
                narrative:
                  'Tôi nộp một mức cố định. Tôi không có gì để tối ưu, và cũng không đủ tiền thuê ai làm việc đó. Nếu tôi bán ế cả tháng thì tôi vẫn nộp đủ. Điểm tốt là tôi không phải làm giấy tờ gì, và tôi biết trước mình phải nộp bao nhiêu.',
              },
              {
                id: 'p2',
                role: 'Chị Hương — kế toán công ty vừa',
                icon: 'calculator',
                narrative:
                  'Công ty tôi nộp theo doanh thu và chi phí thực tế. Chúng tôi có thể tận dụng các khoản được trừ và các ưu đãi trong luật. Chúng tôi trả tiền cho một đơn vị tư vấn và khoản đó rẻ hơn nhiều so với phần tiết kiệm được. Mọi thứ đều đúng luật.',
              },
              {
                id: 'p3',
                role: 'Cán bộ thuế phụ trách địa bàn',
                icon: 'clipboard',
                narrative:
                  'Tôi quản lý hàng trăm hộ kinh doanh trên địa bàn. Tôi không thể kiểm tra doanh thu thật của từng hộ mỗi tháng — không đủ người và cũng không có dữ liệu. Mức khoán là cách duy nhất khả thi. Tôi biết nó không chính xác, và tôi cũng biết một số hộ thiệt còn một số hộ lợi.',
              },
            ],
            question: {
              text: 'Điểm chung của cả ba chỗ đứng này là gì?',
              options: [
                { id: 'a', text: 'Cả ba đều đang cố gắng nộp ít thuế nhất có thể', isCorrect: false },
                { id: 'b', text: 'Không ai vi phạm gì, và mỗi người đều hành động hợp lý trong hoàn cảnh của mình — nhưng kết quả cộng lại vẫn là một sự chênh lệch đáng bàn', isCorrect: true },
                { id: 'c', text: 'Cả ba đều cho rằng hệ thống hiện tại là công bằng', isCorrect: false },
                { id: 'd', text: 'Cả ba đều muốn chuyển sang cơ chế kê khai', isCorrect: false },
              ],
              explanation:
                'Đây là hình dạng quen thuộc của nhiều vấn đề công bằng: không có ai làm sai, và vẫn có một kết quả đáng bàn. Cán bộ thuế làm đúng khả năng, chị Hương làm đúng nghề, bác Tư làm đúng nghĩa vụ. Chênh lệch không đến từ hành vi của ai mà đến từ cấu trúc — và điều đó có nghĩa là muốn thay đổi thì phải thay đổi cấu trúc, không phải trách người.',
            },
          },
          {
            type: 'text',
            title: 'Nhưng bác Tư cũng được một thứ mà chị Hương không có',
            paragraphs: [
              'Đứa cháu nhắc bác một điều để bác đừng chỉ thấy phần thiệt.',
              'Chị Hương mất khoảng một phần ba thời gian làm việc cho hồ sơ, sổ sách, tờ khai và giải trình.',
              'Bác Tư thì không mất phút nào cho việc đó. Toàn bộ thời gian của bác dùng để bán bánh mì.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nếu quy đổi thời gian đó ra tiền, chi phí tuân thủ của một doanh nghiệp là một khoản không nhỏ và không xuất hiện trong bất kỳ tờ khai thuế nào.',
              'Nghĩa là so sánh "ai nộp nhiều hơn" chỉ nhìn vào số thuế thì cũng chưa đầy đủ.',
              '"Vậy là mỗi bên được một chút, mất một chút hả con?"',
              '"Dạ. Mà cái mất của bác thì nó nằm ở chỗ khác."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao chi phí tuân thủ nên được tính vào khi so sánh gánh nặng thuế giữa các nhóm?',
            options: [
              { id: 'a', text: 'Vì nó cũng được nộp cho nhà nước', isCorrect: false },
              { id: 'b', text: 'Vì nó là nguồn lực thật bị tiêu tốn để thực hiện nghĩa vụ thuế, dù không xuất hiện trên bất kỳ tờ khai nào', isCorrect: true },
              { id: 'c', text: 'Vì doanh nghiệp có quyền trừ chi phí đó khỏi thuế', isCorrect: false },
              { id: 'd', text: 'Vì nó luôn lớn hơn số thuế phải nộp', isCorrect: false },
            ],
            explanation:
              'Chi phí tuân thủ không đi vào ngân sách — nó bị tiêu tán thành thời gian kế toán, phí tư vấn, phần mềm, lưu trữ hồ sơ. Với xã hội, đó là nguồn lực mất đi mà không ai nhận được. Vì thế một hệ thống thuế tốt không chỉ được đánh giá bằng việc thu được bao nhiêu, mà còn bằng việc tiêu tốn bao nhiêu để thu được số đó.',
          },
          {
            type: 'text',
            title: 'Hai loại công bằng',
            paragraphs: [
              'Đứa cháu bác Tư học được trong lớp hai khái niệm và giải thích lại cho bác bằng ví dụ ở chợ.',
              'Công bằng ngang: hai người có hoàn cảnh như nhau thì phải chịu nghĩa vụ như nhau. Hai xe bánh mì cùng bán được như nhau thì nộp như nhau.',
              'Công bằng dọc: người có khả năng hơn thì đóng góp nhiều hơn. Quán ăn lớn thì nộp nhiều hơn xe bánh mì.',
            ],
          },
          {
            type: 'question',
            question:
              'Cơ chế thuế khoán có nguy cơ vi phạm loại công bằng nào nhiều hơn?',
            options: [
              { id: 'a', text: 'Công bằng dọc, vì người lớn vẫn nộp nhiều hơn người nhỏ', isCorrect: false },
              { id: 'b', text: 'Công bằng ngang, vì hai hộ có doanh thu thật khác nhau vẫn có thể bị ấn định mức gần như nhau, và ngược lại', isCorrect: true },
              { id: 'c', text: 'Không vi phạm loại nào', isCorrect: false },
              { id: 'd', text: 'Vi phạm cả hai như nhau', isCorrect: false },
            ],
            explanation:
              'Thuế khoán vẫn giữ được công bằng dọc ở mức thô: quán lớn nộp nhiều hơn xe đẩy. Chỗ nó yếu là công bằng ngang, vì mức ấn định dựa trên ước lượng từ bên ngoài. Hai hộ trông giống nhau nhưng doanh thu thật chênh nhau hai lần vẫn có thể chịu mức gần như nhau — và người bán ế là người chịu thiệt.',
          },
          {
            type: 'text',
            title: 'Ngưỡng doanh thu và cái bẫy ở gần ngưỡng',
            paragraphs: [
              'Đứa cháu chỉ cho bác một chi tiết nữa: hộ có doanh thu dưới một ngưỡng nhất định thì không thuộc diện phải nộp thuế.',
              'Bác Tư hỏi: "Vậy mấy người bán ngay dưới cái ngưỡng đó thì sao?"',
              'Đó là câu hỏi hay hơn đứa cháu tưởng, vì nó chạm đúng một vấn đề thiết kế chính sách.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Khi một ngưỡng tạo ra bước nhảy — dưới ngưỡng thì không nộp gì, trên ngưỡng thì nộp một khoản đáng kể — thì người ở ngay quanh ngưỡng có động cơ mạnh để không vượt qua nó.',
              'Họ có thể thu hẹp việc bán hàng, chia nhỏ hoạt động, hoặc đơn giản là khai thấp đi.',
              'Đây là lý do các nhà làm chính sách thường cố thiết kế cho phần vượt ngưỡng tăng dần thay vì nhảy bậc.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư nghe xong thì gật gù: "Té ra cái ngưỡng nó cũng làm người ta tính toán."',
              'Đứa cháu nói thêm: "Cái nào mà vượt qua một cái mốc là đổi hẳn thì người ta đều tính toán quanh cái mốc đó hết bác. Không riêng gì thuế."',
              'Nó nhớ tới bài học về thuế luỹ tiến từng phần mà nó vừa đọc, và nhận ra hai chuyện là cùng một nguyên tắc thiết kế.',
            ],
          },
          {
            type: 'text',
            title: 'Bác Tư nghĩ về hai người bên cạnh',
            paragraphs: [
              'Bác nhớ tới chị Hằng bán trái cây, mức khoán tương đương bác nhưng mùa mưa thì chị ế hẳn.',
              'Và bác nhớ tới một hàng bán đồ ăn sáng ở đầu hẻm, mở sau bác ba năm, khách đông hơn bác nhiều mà mức khoán thì bác nghe nói không cao hơn bao nhiêu.',
              '"Vậy là mấy người bán ế thì thiệt, mà mấy người bán chạy thì lợi," bác nói.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Ai chịu thiệt nhiều nhất từ một ước lượng thô',
            variant: 'warning',
            text: 'Khi một mức được ấn định theo trung bình, người ở dưới trung bình chịu thiệt và người ở trên trung bình được lợi. Với hộ kinh doanh, người ở dưới trung bình thường là người mới mở, người bán mùa vụ, người gặp khó khăn — tức là đúng nhóm ít khả năng chịu đựng nhất. Đó là lý do quyền đề nghị điều chỉnh khi hoạt động thay đổi lại quan trọng hơn vẻ ngoài của nó.',
          },
          {
            type: 'text',
            title: 'Bác Tư biết thêm một quyền',
            paragraphs: [
              'Đứa cháu tìm được một điều mà bác Tư chưa từng nghe: nếu hộ kinh doanh ngừng nghỉ, hoặc hoạt động thay đổi đáng kể trong kỳ, thì có thể đề nghị điều chỉnh mức thuế khoán tương ứng.',
              'Bác Tư nhớ lại năm ngoái bác nghỉ gần một tháng vì đau lưng.',
              '"Bác có báo gì đâu. Bác cứ đóng đủ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đứa cháu nói: "Nếu bác báo thì bác được điều chỉnh đó bác."',
              'Bác Tư ngồi im rồi hỏi một câu mà đứa cháu không trả lời được ngay:',
              '"Sao mười năm nay không ai nói bác biết?"',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao nhiều quyền được quy định trong luật lại không đến được với người thụ hưởng?',
            options: [
              { id: 'a', text: 'Vì cơ quan quản lý cố tình không phổ biến', isCorrect: false },
              { id: 'b', text: 'Vì quy định thường được viết cho người đã biết mình cần tìm gì, còn người chưa biết thì không có cách nào biết là mình cần tìm', isCorrect: true },
              { id: 'c', text: 'Vì người dân không chịu đọc luật', isCorrect: false },
              { id: 'd', text: 'Vì các quyền đó chỉ áp dụng cho doanh nghiệp', isCorrect: false },
            ],
            explanation:
              'Đây là một vấn đề về thiết kế thông tin chứ không phải về ý đồ hay ý thức. Văn bản pháp luật được viết đầy đủ và công bố đúng quy định, nhưng nó trả lời câu hỏi của người đã biết mình đang tìm gì. Bác Tư không tra được quyền đề nghị điều chỉnh vì bác không biết là có thứ đó tồn tại để mà tra. Khoảng cách này chỉ được lấp bằng việc có người chủ động nói ra.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Công bằng ngang và công bằng dọc',
            description: 'Hai thước đo khác nhau, và điểm yếu riêng của mỗi cơ chế thu thuế.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai loại công bằng',
                  paragraphs: [
                    'Công bằng ngang: người có hoàn cảnh như nhau thì chịu nghĩa vụ như nhau.',
                    'Công bằng dọc: người có khả năng đóng góp cao hơn thì đóng góp nhiều hơn.',
                    'Một hệ thống có thể đạt loại này mà hỏng loại kia, nên khi tranh luận cần nói rõ đang bàn về loại nào.',
                  ],
                },
                {
                  heading: 'Điểm yếu riêng của từng cơ chế',
                  paragraphs: [
                    'Thuế khoán: giữ được công bằng dọc ở mức thô, nhưng yếu ở công bằng ngang vì mức ấn định dựa trên ước lượng bên ngoài.',
                    'Thuế kê khai: chính xác hơn nhiều, nhưng đòi hỏi chi phí tuân thủ mà người nhỏ khó gánh, và mở ra không gian tối ưu mà chỉ người có nguồn lực tận dụng được.',
                    'Không có cơ chế nào tốt về mọi mặt — mỗi cái đánh đổi một thứ để được thứ khác.',
                  ],
                },
                {
                  heading: 'Ba việc hộ kinh doanh nên biết',
                  paragraphs: [
                    'Được xem bảng niêm yết công khai mức khoán trên địa bàn và phản ánh trong thời hạn.',
                    'Được đề nghị điều chỉnh nếu ngừng nghỉ hoặc hoạt động thay đổi đáng kể trong kỳ.',
                    'Ghi chép tối thiểu — ngày, số lượng bán, tổng thu — vừa là cơ sở để phản ánh, vừa có ích cho chính việc kinh doanh.',
                  ],
                },
              ],
              relatedConcepts: ['Công bằng ngang', 'Công bằng dọc', 'Chi phí cố định của tuân thủ'],
              furtherReading: [
                'Bài học "Thuế có công bằng không?" trong khoá Thuế 101',
                'Quy định về quản lý thuế đối với hộ kinh doanh, cá nhân kinh doanh',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Chi phí thuê tư vấn gần như cố định, nên chỉ đáng bỏ ra khi số thuế đủ lớn — một rào cản thật mà không điều khoản nào tạo ra.\n' +
              '✓ Công bằng ngang và công bằng dọc là hai thước đo khác nhau; thuế khoán yếu ở loại thứ nhất.\n' +
              '✓ Khi một mức được ấn định theo trung bình, người ở dưới trung bình chịu thiệt — thường là nhóm ít chịu đựng được nhất.\n' +
              '✓ Nhiều quyền không đến được người thụ hưởng vì quy định viết cho người đã biết mình cần tìm gì.',
          },
          {
            type: 'text',
            title: 'Bác Tư muốn nói cho người khác biết',
            paragraphs: [
              'Bác Tư không định khiếu nại gì cho mình. Bác nghĩ mức khoán của bác cũng tạm được.',
              'Nhưng bác nghĩ tới chị Hằng bán trái cây, và tới mấy người mới ra bán ở chợ.',
              '"Mấy người đó chắc cũng không biết như bác."',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'bac-tu-di-hop-to-dan-pho',
        title: 'Bác Tư đi họp tổ dân phố',
        blocks: [
          {
            type: 'text',
            title: 'Buổi họp bác chưa từng đi',
            paragraphs: [
              'Tổ dân phố họp mỗi quý. Mười năm nay bác Tư chưa đi lần nào, vì buổi tối bác còn chuẩn bị hàng cho sáng hôm sau.',
              'Lần này bác đi, vì trong thông báo có một dòng: "Thông tin về tình hình thu chi ngân sách phường."',
              'Bác mang theo cuốn sổ ghi doanh thu một tháng của mình.',
            ],
          },
          {
            type: 'callout',
            icon: 'users',
            title: 'Có bao nhiêu người dự',
            variant: 'info',
            text: 'Tổ dân phố có hơn hai trăm hộ. Buổi họp có mười bảy người, phần lớn là người cao tuổi. Không có ai khác trong số những người buôn bán ở chợ.',
          },
          {
            type: 'question',
            question:
              'Vì sao những người buôn bán nhỏ — nhóm chịu ảnh hưởng trực tiếp từ các quyết định của phường — lại ít dự họp nhất?',
            options: [
              { id: 'a', text: 'Vì họ không quan tâm tới chuyện chung', isCorrect: false },
              { id: 'b', text: 'Vì thời gian của họ gắn trực tiếp với thu nhập — nghỉ một buổi là mất một buổi tiền hàng', isCorrect: true },
              { id: 'c', text: 'Vì họ không được mời', isCorrect: false },
              { id: 'd', text: 'Vì họ không có hộ khẩu tại địa phương', isCorrect: false },
            ],
            explanation:
              'Với người làm công ăn lương, dự họp buổi tối là mất thời gian nghỉ. Với người bán hàng, đó là mất tiền thật và mất luôn việc chuẩn bị cho ngày mai. Kết quả là nhóm chịu ảnh hưởng nhiều nhất từ các quyết định về vỉa hè, chợ, trật tự đô thị lại là nhóm ít có mặt nhất khi những quyết định ấy được bàn.',
          },
          {
            type: 'text',
            title: 'Điều bác Tư nghe được',
            paragraphs: [
              'Phần thông tin về thu chi kéo dài chừng mười phút, chủ yếu là đọc các con số tổng.',
              'Có một khoản bác Tư chú ý: kinh phí cải tạo hệ thống thoát nước ở khu chợ.',
              'Bác biết rõ chỗ đó, vì mỗi mùa mưa nước ngập tới mắt cá chân và bác phải dời xe lên vỉa hè.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cuối buổi có phần ý kiến. Không ai giơ tay.',
              'Bác Tư ngồi im mất một lúc rồi giơ tay, và bác hỏi đúng một câu mà bác đã nghĩ suốt buổi:',
              '"Cái chỗ thoát nước ở chợ, năm nay có làm không cô?"',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Câu trả lời bác nhận được',
            variant: 'info',
            text: 'Khoản đó đã được ghi trong kế hoạch, dự kiến triển khai trong quý ba, và có một mốc thời gian cụ thể. Người chủ trì ghi lại câu hỏi của bác vào biên bản cuộc họp.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc câu hỏi được ghi vào biên bản lại quan trọng hơn bản thân câu trả lời?',
            options: [
              { id: 'a', text: 'Vì biên bản có giá trị pháp lý cao hơn lời nói', isCorrect: false },
              { id: 'b', text: 'Vì nó tạo ra một mốc để đối chiếu về sau: đã nói quý ba, thì quý tư có thể hỏi lại', isCorrect: true },
              { id: 'c', text: 'Vì cấp trên sẽ đọc biên bản', isCorrect: false },
              { id: 'd', text: 'Vì bác Tư có thể dùng nó để khiếu nại', isCorrect: false },
            ],
            explanation:
              'Một câu trả lời miệng trong buổi họp thì ba tháng sau không ai nhớ, kể cả người hỏi. Khi nó nằm trong biên bản, nó trở thành một cam kết có thời điểm — và cam kết có thời điểm là thứ duy nhất cho phép giám sát. Đây cũng chính là nguyên tắc mà Hương dùng khi cô hỏi công ty bằng email thay vì hỏi miệng.',
          },
          {
            type: 'text',
            title: 'Bác Tư hỏi thêm một câu nữa',
            paragraphs: [
              'Trước khi buổi họp kết thúc, bác giơ tay lần thứ hai và hỏi một câu đơn giản hơn nhiều.',
              '"Cái bảng thu chi này, tui muốn coi lại thì coi ở đâu cô?"',
              'Người chủ trì chỉ chỗ niêm yết ở trụ sở phường và nói bản đầy đủ có trên trang thông tin.',
            ],
          },
          {
            type: 'question',
            question:
              'Câu hỏi "tôi muốn xem lại thì xem ở đâu" có giá trị gì?',
            options: [
              { id: 'a', text: 'Nó cho thấy người hỏi nghi ngờ số liệu vừa được đọc', isCorrect: false },
              { id: 'b', text: 'Nó biến một thông tin nghe một lần thành thứ có thể kiểm tra lại và đối chiếu về sau', isCorrect: true },
              { id: 'c', text: 'Nó buộc người chủ trì phải công bố thêm', isCorrect: false },
              { id: 'd', text: 'Nó không có giá trị gì đáng kể', isCorrect: false },
            ],
            explanation:
              'Một dãy số được đọc lên trong mười phút thì không ai nhớ và cũng không ai đối chiếu được. Biết chỗ tra lại biến nó thành dữ liệu — thứ có thể xem lại vào quý sau, so với năm trước, hoặc đưa cho người khác xem. Đây là câu hỏi rẻ nhất và ít gây căng thẳng nhất trong mọi cuộc họp, và nó mở ra tất cả những câu hỏi tiếp theo.',
          },
          {
            type: 'text',
            title: 'Bác Tư kể lại ở chợ',
            paragraphs: [
              'Sáng hôm sau, bác kể lại chuyện đi họp cho chị Hằng và mấy người bán cạnh.',
              'Bác không nói về ngân sách hay minh bạch. Bác nói: "Cái cống ở chợ quý ba làm nghen bà con. Tui hỏi rồi."',
              'Chị Hằng bảo: "Ủa vậy hả anh? Sao tui không biết."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đó là câu trả lời cho câu hỏi vì sao thông tin không đến được với người cần.',
              'Thông tin có được công bố. Buổi họp có được thông báo. Nhưng không ai trong số hai trăm hộ đó đọc bản tin của phường, và mười bảy người có mặt thì không kể lại cho ai.',
              'Bác Tư trở thành mắt xích còn thiếu, đơn giản vì bác đứng bán hàng ở nơi mọi người đi ngang mỗi sáng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Người chuyển tiếp quan trọng ngang người công bố',
            variant: 'info',
            text: 'Một thông tin chỉ thực sự đến nơi khi có ai đó ở giữa mang nó đi. Trong một khu phố, mắt xích đó thường là người bán hàng, người tổ trưởng, người ai cũng gặp mỗi ngày. Đây là lý do các thay đổi nhỏ trong một cộng đồng thường bắt đầu từ một người có nhiều tiếp xúc, chứ không từ một kênh chính thức.',
          },
          {
            type: 'text',
            title: 'Bác Tư nói với chị Hằng về mức khoán',
            paragraphs: [
              'Bác kể luôn chuyện bảng niêm yết mức khoán và quyền đề nghị điều chỉnh khi ngừng nghỉ.',
              'Chị Hằng nghe xong nói: "Năm ngoái tui nghỉ hai tháng về quê chăm má, mà tui vẫn đóng đủ."',
              'Bác Tư nói: "Năm nay có gì thì cô báo nghen."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Chị Hằng hỏi báo ở đâu, báo bằng cách nào, cần giấy gì.',
              'Bác Tư không biết. Bác chỉ biết là có quyền đó.',
              'Hai người quyết định cùng ra chi cục thuế hỏi cho rõ, và đứa cháu bác Tư đi theo ghi lại.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao "biết là có quyền đó" đã là một bước tiến, dù chưa biết thủ tục?',
            options: [
              { id: 'a', text: 'Vì thủ tục sẽ được cơ quan hướng dẫn miễn phí', isCorrect: false },
              { id: 'b', text: 'Vì bạn chỉ đi tìm thủ tục khi đã biết có thứ đáng để tìm — không biết quyền tồn tại thì không có câu hỏi nào để hỏi', isCorrect: true },
              { id: 'c', text: 'Vì quyền quan trọng hơn thủ tục', isCorrect: false },
              { id: 'd', text: 'Vì thủ tục thường đơn giản hơn người ta tưởng', isCorrect: false },
            ],
            explanation:
              'Rào cản đầu tiên không phải là thủ tục phức tạp mà là không biết có thứ gì để hỏi. Người biết quyền tồn tại sẽ tìm được thủ tục, dù mất thời gian. Người không biết thì không bao giờ bắt đầu — và với họ, quyền ấy tồn tại trên giấy nhưng không tồn tại trong đời sống.',
          },
          {
            type: 'text',
            title: 'Ở chi cục thuế',
            paragraphs: [
              'Cán bộ tiếp nhận hướng dẫn khá rõ ràng: cần có văn bản đề nghị, ghi rõ thời gian ngừng nghỉ và lý do, nộp trong thời hạn quy định.',
              'Chị Hằng hỏi: "Sao trước giờ không ai nói tui biết vậy anh?"',
              'Người cán bộ trả lời thẳng: "Có niêm yết ở phường mà chị. Với có trên trang thông tin nữa."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cả hai câu đều đúng, và cả hai đều không giải quyết được vấn đề.',
              'Niêm yết ở phường thì người bán hàng từ sáu giờ sáng tới tối không đi qua đó. Trang thông tin thì chị Hằng không dùng máy tính.',
              'Đứa cháu bác Tư ghi vào sổ: "Công bố đúng chỗ nhưng không phải chỗ người ta ở."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Từ quyền trên giấy tới quyền dùng được',
            description: 'Ba khoảng cách khiến một quy định không đến được người thụ hưởng.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba khoảng cách',
                  paragraphs: [
                    'Không biết quyền tồn tại: đây là rào cản đầu tiên và lớn nhất, vì người không biết thì không có câu hỏi nào để hỏi.',
                    'Biết nhưng không biết thủ tục: rào cản này vượt được, chỉ tốn thời gian.',
                    'Biết thủ tục nhưng chi phí thực hiện quá cao so với lợi ích: nghỉ một buổi bán hàng để đi làm giấy tờ là một khoản chi phí thật.',
                  ],
                },
                {
                  heading: 'Vì sao công bố đúng quy định vẫn không tới nơi',
                  paragraphs: [
                    'Kênh công bố thường là nơi người quản lý có mặt, không phải nơi người thụ hưởng có mặt.',
                    'Thời điểm công bố thường trong giờ hành chính, đúng lúc người buôn bán đang làm việc.',
                    'Ngôn ngữ công bố là ngôn ngữ văn bản, còn thứ cần thiết là một câu nói được ở chợ trong mười giây.',
                  ],
                },
                {
                  heading: 'Ai lấp được khoảng cách',
                  paragraphs: [
                    'Người có nhiều tiếp xúc trong cộng đồng — người bán hàng, tổ trưởng, người ai cũng gặp mỗi ngày.',
                    'Một câu chuyện cụ thể lan xa hơn một thông báo: "cô Hằng nghỉ hai tháng mà vẫn đóng đủ" dễ nhớ hơn tên một điều khoản.',
                    'Đi cùng nhau tới cơ quan để hỏi hiệu quả hơn đi một mình, vì người thứ hai giữ cho người thứ nhất không bỏ cuộc giữa chừng.',
                  ],
                },
              ],
              relatedConcepts: ['Quyền trên giấy và quyền dùng được', 'Chi phí tiếp cận', 'Người chuyển tiếp thông tin'],
              furtherReading: [
                'Bài học "Người nộp thuế có những quyền gì?" trong khoá Thuế 101',
                'Quy định về công khai thông tin và trách nhiệm hướng dẫn người nộp thuế',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nhóm chịu ảnh hưởng nhiều nhất từ quyết định địa phương thường là nhóm ít có mặt nhất khi bàn, vì thời gian của họ gắn với thu nhập.\n' +
              '✓ Một câu hỏi được ghi vào biên bản trở thành cam kết có thời điểm — thứ duy nhất cho phép giám sát.\n' +
              '✓ Rào cản đầu tiên không phải thủ tục phức tạp mà là không biết có thứ gì để hỏi.\n' +
              '✓ Công bố đúng quy định vẫn có thể không tới nơi, nếu kênh công bố không phải nơi người thụ hưởng có mặt.',
          },
          {
            type: 'text',
            title: 'Bác Tư nghĩ tới một việc',
            paragraphs: [
              'Trên đường về, bác Tư nói với đứa cháu: "Bây giờ bác biết rồi. Mà mấy người kia thì sao?"',
              'Ở chợ đó có hơn sáu chục hộ buôn bán. Bác quen mặt gần hết.',
              'Và bác Tư nhận ra bác đang ở đúng chỗ mà một thông tin cần có mặt: một cái xe bánh mì mà sáng nào cả chợ cũng đi ngang.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'tam-bang-treo-canh-bang-gia',
        title: 'Tấm bảng treo cạnh bảng giá',
        blocks: [
          {
            type: 'text',
            title: 'Bác Tư treo thêm một tấm bảng',
            paragraphs: [
              'Cạnh bảng giá bánh mì và mã QR trong khung nhựa, bác Tư treo thêm một tấm giấy A4 ép nhựa.',
              'Trên đó có bốn dòng, do đứa cháu viết theo lời bác đọc.',
              'Không có chữ nào là thuật ngữ. Chỉ là bốn việc mà một người bán hàng nên biết.',
            ],
          },
          {
            type: 'callout',
            icon: 'clipboard',
            title: 'Bốn dòng trên tấm bảng',
            variant: 'info',
            text: '1. Mức thuế khoán có niêm yết ở phường, bà con ra coi được. 2. Thấy mức của mình chưa đúng thì có quyền làm đơn phản ánh, có thời hạn. 3. Nghỉ dài ngày hay thu hẹp buôn bán thì có quyền xin điều chỉnh. 4. Ghi mỗi ngày một dòng doanh thu, để lúc cần có cái mà nói.',
          },
          {
            type: 'question',
            question:
              'Vì sao một tấm bảng ở xe bánh mì lại hiệu quả hơn một thông báo niêm yết ở trụ sở phường?',
            options: [
              { id: 'a', text: 'Vì nó ngắn hơn và dễ đọc hơn', isCorrect: false },
              { id: 'b', text: 'Vì nó nằm ở nơi người cần đọc đi qua mỗi ngày, vào đúng lúc họ đang rảnh tay chờ lấy bánh', isCorrect: true },
              { id: 'c', text: 'Vì bác Tư đáng tin hơn cơ quan nhà nước', isCorrect: false },
              { id: 'd', text: 'Vì nó được ép nhựa nên bền hơn', isCorrect: false },
            ],
            explanation:
              'Ngắn gọn thì cũng quan trọng, nhưng yếu tố quyết định là vị trí và thời điểm. Thông tin chỉ được tiếp nhận khi nó xuất hiện ở nơi người ta đang có mặt, vào lúc người ta có ba mươi giây rảnh. Trụ sở phường thì người buôn bán không đi qua; xe bánh mì thì cả chợ đi qua mỗi sáng, và lúc chờ lấy bánh là lúc rảnh nhất trong ngày của họ.',
          },
          {
            type: 'text',
            title: 'Một người phản đối tấm bảng',
            paragraphs: [
              'Có một chú bán nước ở cuối chợ nói với bác Tư: "Anh treo cái đó chi. Người ta thấy rồi người ta đi thắc mắc, rồi thuế nó siết lại thì cả chợ khổ."',
              'Bác Tư không cãi ngay. Bác nghĩ mất mấy hôm, vì bác thấy nỗi lo đó là có thật.',
              'Rồi bác trả lời: "Bốn cái tui ghi là bốn cái luật cho làm. Ai làm đúng thì đâu sợ gì."',
            ],
          },
          {
            type: 'question',
            question:
              'Nỗi lo "hỏi nhiều thì bị để ý" có cơ sở tới đâu, và nên xử lý thế nào?',
            options: [
              { id: 'a', text: 'Hoàn toàn vô căn cứ, không cần bận tâm', isCorrect: false },
              { id: 'b', text: 'Là nỗi lo có thật với nhiều người, nhưng nó khác hẳn với việc sử dụng các quyền được quy định rõ ràng — và phân biệt được hai thứ đó mới giúp người ta dám dùng quyền của mình', isCorrect: true },
              { id: 'c', text: 'Hoàn toàn có cơ sở, nên tốt nhất là im lặng', isCorrect: false },
              { id: 'd', text: 'Chỉ đúng với doanh nghiệp lớn', isCorrect: false },
            ],
            explanation:
              'Gạt phăng nỗi lo này là không trung thực — nó có thật trong trải nghiệm của nhiều người buôn bán. Nhưng chấp nhận nó hoàn toàn thì mọi quyền đều thành vô nghĩa. Cách xử lý là phân biệt: xem bảng niêm yết, làm đơn phản ánh trong thời hạn, xin điều chỉnh khi ngừng nghỉ đều là các thủ tục có trong quy định và có mẫu sẵn. Dùng đúng quy trình khác hẳn với việc gây chuyện, và chính vì có quy trình nên nó mới an toàn hơn.',
          },
          {
            type: 'text',
            paragraphs: [
              'Đứa cháu bác Tư nói thêm một ý mà bác thấy đúng: nếu chỉ một mình bác hỏi thì bác nổi bật.',
              'Nếu cả chợ đều biết quyền của mình và thỉnh thoảng có người hỏi, thì việc hỏi trở thành chuyện bình thường và không ai nổi bật cả.',
              '"Vậy là càng nhiều người biết thì càng đỡ sợ hả con?"',
              '"Dạ. Cái đó cũng giống chuyện lừa đảo với chuyện tin đồn thôi bác."',
            ],
          },
          {
            type: 'text',
            title: 'Trong ba tháng',
            paragraphs: [
              'Có bảy người hỏi bác Tư về tấm bảng.',
              'Ba người ra phường xem bảng niêm yết. Hai người trong số đó phát hiện mức khoán của mình cao hơn hộ cùng loại ngay cạnh, và làm đơn phản ánh.',
              'Một người trong hai người đó được điều chỉnh. Người kia được trả lời là mức hiện tại phù hợp, kèm giải thích căn cứ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đứa cháu bác Tư thấy trường hợp thứ hai cũng đáng kể, dù kết quả là không thay đổi gì.',
              'Người đó nhận được một lời giải thích bằng văn bản về căn cứ tính mức khoán của mình — thứ mà trước đó chị chưa từng có.',
              'Từ chỗ "người ta tính thì mình đóng" sang chỗ "mình biết vì sao mình đóng chừng đó" là một khoảng cách thật, kể cả khi con số không đổi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ba tháng sau, chú bán nước cuối chợ là người thứ tám hỏi bác Tư về tấm bảng.',
              'Chú hỏi về dòng thứ ba — quyền xin điều chỉnh khi ngừng nghỉ — vì chú vừa phải đóng cửa nửa tháng đi mổ mắt.',
              'Bác Tư không nhắc lại chuyện chú từng phản đối. Bác chỉ chỉ vào dòng đó và nói: "Chú ra phường hỏi đi, có mẫu đơn sẵn."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Được giải trình cũng là một kết quả',
            variant: 'info',
            text: 'Ta thường đo thành công của việc lên tiếng bằng việc có thay đổi được quyết định hay không. Nhưng một lời giải trình có căn cứ cũng là một kết quả: nó cho bạn biết cơ sở của quyết định, cho phép bạn đánh giá cơ sở đó, và tạo ra một hồ sơ để đối chiếu ở kỳ sau. Một hệ thống buộc phải giải trình sẽ khác một hệ thống không phải giải trình, ngay cả khi cả hai ra cùng một quyết định.',
          },
          {
            type: 'question',
            question:
              'Vì sao "nhận được giải trình" lại thay đổi quan hệ giữa người dân và cơ quan nhà nước, dù quyết định không đổi?',
            options: [
              { id: 'a', text: 'Vì nó cho thấy cơ quan đó tôn trọng người dân', isCorrect: false },
              { id: 'b', text: 'Vì nó biến một quyết định không thể xem xét thành một quyết định có căn cứ nêu ra được — và căn cứ thì có thể được kiểm tra, tranh luận, hoặc đối chiếu ở kỳ sau', isCorrect: true },
              { id: 'c', text: 'Vì nó tạo cơ sở để khởi kiện', isCorrect: false },
              { id: 'd', text: 'Vì nó giúp cơ quan nhà nước làm việc hiệu quả hơn', isCorrect: false },
            ],
            explanation:
              'Một quyết định không kèm lý do thì chỉ có thể chấp nhận hoặc phản đối bằng cảm tính. Một quyết định kèm căn cứ thì mở ra một loại trao đổi khác hẳn: căn cứ này có đúng với trường hợp của tôi không, có được áp dụng nhất quán với người khác không, có thay đổi gì so với năm ngoái không. Nghĩa vụ giải trình là thứ biến một mối quan hệ một chiều thành một mối quan hệ có thể trao đổi.',
          },
          {
            type: 'text',
            title: 'Bác Tư và câu hỏi về cái cống',
            paragraphs: [
              'Quý ba trôi qua. Cái cống ở chợ chưa được làm.',
              'Bác Tư đi họp tổ dân phố quý bốn, và lần này bác không đi một mình — chị Hằng và hai người bán ở chợ đi cùng.',
              'Bác hỏi lại đúng câu cũ, và bác nhắc rằng quý trước đã có câu trả lời là quý ba.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu trả lời lần này cụ thể hơn: dự án chậm vì vướng khâu thẩm định, và có một mốc mới.',
              'Bác Tư không hài lòng, nhưng bác ghi lại mốc mới đó.',
              'Đứa cháu nói: "Bác hỏi lần hai thì người ta phải giải thích vì sao chậm. Nếu bác không hỏi thì nó chỉ chậm thôi, không ai phải giải thích gì."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nhắc lại một cam kết là một hành động',
            variant: 'warning',
            text: 'Cam kết nào cũng có thể chậm, và phần lớn lý do chậm là lý do thật. Điều thay đổi khi có người nhắc lại không phải là tiến độ, mà là việc sự chậm trễ phải được giải thích thay vì trôi đi im lặng. Và một tổ chức biết rằng sẽ có người nhắc thì tính toán khác một tổ chức biết rằng sẽ không ai nhớ.',
          },
          {
            type: 'text',
            title: 'Bốn người ở buổi họp quý bốn',
            paragraphs: [
              'Buổi họp quý bốn có hai mươi ba người, nhiều hơn quý trước sáu người.',
              'Bốn người mới đều là người buôn bán ở chợ.',
              'Không ai tổ chức gì cả. Chỉ là bác Tư rủ, và người ta thấy có người quen đi thì đi cùng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đứa cháu bác Tư viết trong bài tập cuối kỳ môn của nó:',
              '"Em từng nghĩ để người dân tham gia thì cần cải cách thể chế. Có thể đúng. Nhưng ở chỗ em quan sát, thứ làm thay đổi con số từ mười bảy người lên hai mươi ba người là một ông bán bánh mì rủ mấy người quen đi cùng."',
              '"Em không nghĩ cái đó thay được cải cách. Em chỉ nghĩ nó là chỗ mà một người bình thường thật sự làm được gì đó."',
            ],
          },
          {
            type: 'question',
            question:
              'Điều gì làm cho việc "rủ người quen đi cùng" hiệu quả hơn một lời kêu gọi chung?',
            options: [
              { id: 'a', text: 'Vì nó tiết kiệm chi phí truyền thông', isCorrect: false },
              { id: 'b', text: 'Vì nó giải quyết đúng hai rào cản thật: không biết có buổi họp, và ngại đi một mình tới nơi mình không quen', isCorrect: true },
              { id: 'c', text: 'Vì người quen thì đáng tin hơn cơ quan nhà nước', isCorrect: false },
              { id: 'd', text: 'Vì đi đông thì nói được nhiều hơn', isCorrect: false },
            ],
            explanation:
              'Phần lớn lời kêu gọi tham gia đều giả định rằng rào cản là sự thờ ơ. Nhưng ở quy mô một khu phố, hai rào cản lớn nhất thường rất đời thường: người ta không biết có buổi họp, và người ta ngại bước vào một chỗ mình chưa từng vào một mình. Một lời rủ trực tiếp xử lý được cả hai, và đó là lý do nó hiệu quả hơn nhiều so với một thông báo.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Người nộp thuế có những quyền gì',
            description: 'Các quyền cơ bản, và cách biến chúng thành thứ dùng được ở quy mô một khu phố.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Một số quyền cơ bản của người nộp thuế',
                  paragraphs: [
                    'Được hướng dẫn, cung cấp thông tin để thực hiện nghĩa vụ thuế.',
                    'Được biết thời hạn giải quyết và căn cứ của các quyết định liên quan tới mình.',
                    'Được khiếu nại, tố cáo đối với quyết định hành chính về thuế mà mình cho là chưa đúng.',
                    'Với hộ khoán: được xem niêm yết công khai, được phản ánh về mức khoán, được đề nghị điều chỉnh khi hoạt động thay đổi.',
                  ],
                },
                {
                  heading: 'Vì sao "được giải trình" đã là một kết quả',
                  paragraphs: [
                    'Một quyết định không kèm lý do chỉ có thể chấp nhận hoặc phản đối bằng cảm tính.',
                    'Một quyết định kèm căn cứ thì căn cứ đó có thể được kiểm tra, so sánh giữa các trường hợp, và đối chiếu ở kỳ sau.',
                    'Một hệ thống buộc phải giải trình khác một hệ thống không phải giải trình, ngay cả khi cả hai ra cùng một quyết định.',
                  ],
                },
                {
                  heading: 'Ba việc làm được ở quy mô một khu phố',
                  paragraphs: [
                    'Đặt thông tin ở nơi người cần đọc đi qua mỗi ngày, không phải ở nơi quy định yêu cầu niêm yết.',
                    'Hỏi trong cuộc họp và đề nghị ghi vào biên bản — câu hỏi có trong biên bản thành cam kết có thời điểm.',
                    'Rủ người quen đi cùng. Hai rào cản lớn nhất không phải sự thờ ơ mà là không biết có buổi họp và ngại đi một mình.',
                  ],
                },
              ],
              relatedConcepts: ['Quyền của người nộp thuế', 'Nghĩa vụ giải trình', 'Tham gia ở cấp cơ sở'],
              furtherReading: [
                'Bài học "Người nộp thuế có những quyền gì?" và "Một người dân bình thường có thể tác động vào chính sách thuế bằng cách nào?" trong khoá Thuế 101',
                'Luật Quản lý thuế — quyền và nghĩa vụ của người nộp thuế',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Thông tin chỉ được tiếp nhận khi nó ở nơi người cần đọc có mặt, vào lúc họ có ba mươi giây rảnh.\n' +
              '✓ Nhận được giải trình có căn cứ cũng là một kết quả, kể cả khi quyết định không thay đổi.\n' +
              '✓ Nhắc lại một cam kết buộc sự chậm trễ phải được giải thích, thay vì trôi đi im lặng.\n' +
              '✓ Hai rào cản lớn nhất với việc tham gia thường là không biết có buổi họp và ngại đi một mình.',
          },
          {
            type: 'text',
            title: 'Điều bác Tư mang theo',
            paragraphs: [
              'Bác Tư vẫn nộp thuế khoán, vẫn bán bánh mì từ sáu giờ sáng, vẫn không đọc được bản dự toán ngân sách nào.',
              'Bác chỉ có thêm một cuốn sổ ghi mỗi ngày một dòng, một tấm bảng bốn dòng treo cạnh bảng giá, và một thói quen đi họp tổ dân phố mỗi quý.',
              'Có người hỏi bác làm mấy cái đó chi cho mệt.',
              '"Tui đóng tiền mà," bác nói. "Đóng thì hỏi được chớ."',
            ],
          },
        ],
      },
    ],
  },
};
