import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Đức × Thuế 101 — "Đối tác thì đóng thuế kiểu gì?".
 *
 * Đức là nhân vật duy nhất có thu nhập đi qua một nền tảng số. Câu chuyện dùng
 * bối cảnh đó để hỏi ba câu của khoá Thuế 101: ai khấu trừ, việc phân loại
 * "đối tác" hay "người lao động" thay đổi những gì, và một hệ thống thuế
 * được thiết kế cho quan hệ lao động truyền thống thì hụt ở đâu.
 */
export const DUC_THUE: StorySeed = {
  slug: 'duc-thue',
  characterSlug: 'gig-driver',
  title: 'Đối tác thì đóng thuế kiểu gì?',
  teaser:
    'Mỗi cuốc xe của Đức đều bị trừ một khoản trước khi tiền về ví. Ba năm chạy xe, anh chưa từng biết khoản đó gồm những gì.',
  icon: 'bike',
  estimatedTime: '~30 phút',
  sortOrder: 3,
  courseSlugs: [COURSE.thue],
  part: {
    name: 'Đức và những khoản trừ trong ví',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'khoan-tru-truoc-khi-tien-ve-vi',
        title: 'Khoản trừ trước khi tiền về ví',
        blocks: [
          {
            type: 'text',
            title: 'Một cuốc xe bốn mươi nghìn',
            paragraphs: [
              'Khách trả bốn mươi nghìn. Trong ứng dụng của Đức, số tiền về ví không phải bốn mươi nghìn.',
              'Có một dòng ghi chiết khấu nền tảng, và một dòng ghi khoản thuế.',
              'Ba năm chạy xe, Đức nhìn hai dòng đó mỗi ngày mà chưa từng đọc kỹ.',
            ],
          },
          {
            type: 'callout',
            icon: 'wallet',
            title: 'Chi tiết một cuốc xe',
            variant: 'info',
            text: 'Khách trả: 40.000 đ. Chiết khấu nền tảng: một tỷ lệ phần trăm theo hợp đồng. Khoản thuế được nền tảng kê khai và nộp thay: gồm thuế giá trị gia tăng và thuế thu nhập cá nhân tính trên phần doanh thu của tài xế. Phần còn lại về ví Đức.',
          },
          {
            type: 'question',
            question:
              'Đức chưa bao giờ tự kê khai thuế. Vậy anh có đang nộp thuế không?',
            options: [
              { id: 'a', text: 'Không — vì anh không phải người kê khai', isCorrect: false },
              { id: 'b', text: 'Không — vì anh là đối tác chứ không phải nhân viên', isCorrect: false },
              { id: 'c', text: 'Có — nền tảng kê khai và nộp thay, nhưng khoản đó trừ vào phần doanh thu của anh', isCorrect: true },
              { id: 'd', text: 'Chỉ khi thu nhập vượt ngưỡng nhất định', isCorrect: false },
            ],
            explanation:
              'Đây lại là chuyện người nộp và người chịu. Nền tảng đứng ra kê khai và nộp cho cơ quan thuế — đó là nghĩa vụ của họ theo quy định về quản lý thuế đối với hoạt động kinh doanh trên nền tảng số. Nhưng số tiền ấy được trừ từ phần doanh thu của Đức. Anh là người chịu thuế mà chưa từng phải điền một tờ khai nào.',
          },
          {
            type: 'text',
            title: 'Đức tính lại ba năm',
            paragraphs: [
              'Anh mở lịch sử giao dịch và cộng toàn bộ các khoản trừ trong một tháng.',
              'Con số lớn hơn anh nghĩ, và điều làm anh khó chịu là anh không phân biệt được đâu là chiết khấu của nền tảng, đâu là thuế nộp cho nhà nước.',
              'Trong đầu anh suốt ba năm, cả hai đều là "tiền bị trừ".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Sự nhầm lẫn này có hệ quả thật, và Đức nhận ra nó khi tranh luận trong nhóm tài xế.',
              'Mỗi khi nền tảng tăng tỷ lệ chiết khấu, có người nói "thuế lại tăng nữa rồi".',
              'Hai thứ hoàn toàn khác nhau: một khoản là giá dịch vụ do một công ty đặt ra, một khoản là nghĩa vụ theo luật. Cách thay đổi chúng cũng khác nhau hoàn toàn.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Chiết khấu và thuế là hai thứ khác nhau',
            variant: 'info',
            text: 'Chiết khấu nền tảng là khoản công ty giữ lại cho dịch vụ kết nối, do hợp đồng giữa hai bên quy định — muốn đổi thì phải thương lượng hoặc chuyển sang nền tảng khác. Thuế là nghĩa vụ theo luật, mức do Quốc hội quyết định — muốn đổi thì đi qua quy trình lập pháp. Gộp hai thứ vào một chữ "bị trừ" khiến người ta nhắm sai chỗ khi muốn thay đổi.',
          },
          {
            type: 'question',
            question:
              'Nếu tài xế muốn giảm khoản chiết khấu nền tảng, cách nào là đúng địa chỉ?',
            options: [
              { id: 'a', text: 'Kiến nghị Quốc hội sửa luật thuế', isCorrect: false },
              { id: 'b', text: 'Thương lượng tập thể với nền tảng, hoặc tạo áp lực cạnh tranh bằng cách chuyển sang nền tảng khác', isCorrect: true },
              { id: 'c', text: 'Khiếu nại lên cơ quan thuế', isCorrect: false },
              { id: 'd', text: 'Ngừng nộp phần thuế trong khoản trừ', isCorrect: false },
            ],
            explanation:
              'Chiết khấu là điều khoản của một hợp đồng dân sự giữa tài xế và nền tảng, nên nó thuộc phạm vi thương lượng và cạnh tranh thị trường. Kiến nghị sửa luật thuế hay khiếu nại cơ quan thuế đều nhắm vào cơ quan không có thẩm quyền về khoản này. Còn ngừng nộp phần thuế là hành vi vi phạm và tạo rủi ro pháp lý cho chính người tài xế.',
          },
          {
            type: 'text',
            title: 'Vì sao Đức không phân biệt được',
            paragraphs: [
              'Anh mở lại giao diện ứng dụng và nhìn kỹ.',
              'Cả hai khoản đều hiển thị, nhưng ở màn hình chi tiết mà phải bấm thêm hai lần mới tới.',
              'Ở màn hình chính, thứ Đức thấy chỉ là số tiền cuối cùng về ví.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức nghĩ tới câu chuyện của Minh và tờ hoá đơn cà phê, mà anh nghe kể lại trong nhóm.',
              'Cùng một cơ chế: khoản thuế nằm trong một con số tổng, kỹ thuật thì có công bố, nhưng thực tế thì không ai nhìn thấy.',
              '"Cái gì mình phải bấm hai lần mới thấy thì coi như mình không thấy," anh nói.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Vị trí hiển thị là một quyết định thiết kế',
            variant: 'warning',
            text: 'Thông tin nào lên màn hình chính và thông tin nào nằm sau hai lần bấm không phải chuyện ngẫu nhiên — đó là lựa chọn của người thiết kế sản phẩm. Với một tài xế nhìn màn hình vài trăm lần mỗi ngày, khoảng cách hai lần bấm là khoảng cách giữa biết và không biết.',
          },
          {
            type: 'text',
            title: 'Đức tự làm một bảng',
            paragraphs: [
              'Anh lập một bảng tính đơn giản trên điện thoại, mỗi tối ghi ba con số: tổng khách trả, tổng chiết khấu, tổng thuế.',
              'Sau một tháng, anh có tỷ lệ thật của từng khoản trên tổng doanh thu.',
              'Đây là lần đầu tiên trong ba năm anh biết chính xác mình đang mất bao nhiêu cho mỗi thứ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều bất ngờ với Đức là tỷ lệ khoản thuế nhỏ hơn nhiều so với anh tưởng, còn chiết khấu thì lớn hơn.',
              'Suốt ba năm anh vẫn nghĩ ngược lại, vì trong nhóm tài xế người ta hay nói về thuế hơn là về chiết khấu.',
              'Anh đăng bảng đó vào nhóm, không kèm bình luận gì, chỉ ghi: "Của em một tháng, ai muốn tự tính thì làm giống vậy."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao trong nhóm tài xế người ta hay nói về thuế hơn về chiết khấu, dù chiết khấu lớn hơn?',
            options: [
              { id: 'a', text: 'Vì thuế là chủ đề dễ gây tranh cãi hơn', isCorrect: false },
              { id: 'b', text: 'Vì chiết khấu là điều khoản họ đã đồng ý khi ký hợp đồng, nên nó có vẻ là chuyện đã rồi — còn thuế thì đến từ bên ngoài quan hệ đó', isCorrect: true },
              { id: 'c', text: 'Vì nền tảng cấm bàn về chiết khấu', isCorrect: false },
              { id: 'd', text: 'Vì thuế thay đổi thường xuyên hơn', isCorrect: false },
            ],
            explanation:
              'Một khoản mình đã ký đồng ý thì tâm lý dễ coi là chuyện đã rồi, dù thực tế nó vẫn thương lượng và thay đổi được. Một khoản đến từ bên ngoài thì dễ được coi là bị áp đặt. Kết quả là sự chú ý dồn vào khoản nhỏ hơn và ít thay đổi được hơn, còn khoản lớn hơn và có không gian thương lượng thì ít bị nhắc tới.',
          },
          {
            type: 'text',
            title: 'Anh Tám nói một câu đáng nghĩ',
            paragraphs: [
              'Anh Tám, tài xế tám năm, bình luận dưới bảng của Đức: "Hồi anh mới chạy, chiết khấu thấp hơn bây giờ nhiều."',
              'Đức hỏi lại: "Vậy hồi đó anh em có nói gì không anh?"',
              '"Có chớ. Mà nói trong group thôi. Rồi nó tăng thì mình cũng chạy tiếp."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc phản đối "trong nhóm" hiếm khi tạo ra thay đổi về điều khoản hợp đồng?',
            options: [
              { id: 'a', text: 'Vì nền tảng không đọc các nhóm đó', isCorrect: false },
              { id: 'b', text: 'Vì nó không tạo ra hậu quả nào cho bên kia — không mất người, không mất tiền, không tạo nghĩa vụ trả lời', isCorrect: true },
              { id: 'c', text: 'Vì các nhóm quá đông người', isCorrect: false },
              { id: 'd', text: 'Vì tài xế không có tổ chức đại diện', isCorrect: false },
            ],
            explanation:
              'Một điều khoản hợp đồng chỉ thay đổi khi có áp lực tạo ra hậu quả: người rời đi hàng loạt, một tổ chức đại diện thương lượng, hoặc một quy định pháp luật can thiệp. Bàn luận trong nhóm kín có thể tạo nhận thức chung — bước đầu cần thiết — nhưng bản thân nó không tạo ra hậu quả nào, nên bên kia không có lý do gì để đổi.',
          },
          {
            type: 'text',
            paragraphs: [
              'Đức nhận ra chuyện này khác hẳn với chuyện thuế.',
              'Với thuế, có một quy trình công khai để tham gia — góp ý dự thảo, kiến nghị qua đại biểu, và cơ quan soạn thảo có nghĩa vụ giải trình.',
              'Với chiết khấu, không có quy trình nào cả. Chỉ có hợp đồng, và sức thương lượng của một bên gồm hàng chục nghìn người không có tổ chức.',
            ],
          },
          {
            type: 'text',
            title: 'Một câu hỏi Đức chưa trả lời được',
            paragraphs: [
              'Trong bảng của anh có một cột anh để trống: chi phí.',
              'Xăng, khấu hao xe, thay nhớt, vá lốp, điện thoại, bảo hiểm xe.',
              'Anh nhận ra khoản thuế đang được tính trên doanh thu, chứ không phải trên phần anh thực sự còn lại sau chi phí.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thuế với thu nhập từ nền tảng số',
            description: 'Ai kê khai, ai chịu, và cách tự đọc các khoản trừ trong ví.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Cơ chế kê khai thay',
                  paragraphs: [
                    'Với hoạt động kinh doanh qua nền tảng số, quy định về quản lý thuế đặt nghĩa vụ kê khai và nộp thay lên nền tảng.',
                    'Cá nhân tham gia không phải tự làm tờ khai, nhưng khoản thuế được trừ từ phần doanh thu của họ.',
                    'Nghĩa là bạn có thể là người chịu thuế trong nhiều năm mà chưa từng điền một tờ khai nào.',
                  ],
                },
                {
                  heading: 'Phân biệt ba khoản bị trừ',
                  paragraphs: [
                    'Chiết khấu nền tảng: giá dịch vụ do hợp đồng giữa hai bên quy định. Thay đổi bằng thương lượng hoặc cạnh tranh.',
                    'Thuế: nghĩa vụ theo luật, mức do cơ quan lập pháp quyết định. Thay đổi bằng quy trình chính sách.',
                    'Các khoản khác: phí sử dụng ứng dụng, bảo hiểm tự nguyện, khoản phạt theo quy chế nền tảng.',
                    'Gộp cả ba vào một chữ "bị trừ" khiến người ta nhắm sai chỗ khi muốn thay đổi.',
                  ],
                },
                {
                  heading: 'Ba việc nên làm',
                  paragraphs: [
                    'Vào màn hình chi tiết giao dịch ít nhất một lần và đọc kỹ từng dòng.',
                    'Ghi ba con số mỗi tối trong một tháng: tổng khách trả, tổng chiết khấu, tổng thuế. Bạn sẽ có tỷ lệ thật của mình.',
                    'Ghi thêm cột chi phí — xăng, bảo dưỡng, khấu hao — để biết thu nhập thật sau khi trừ hết.',
                  ],
                },
              ],
              relatedConcepts: ['Kê khai nộp thay', 'Chiết khấu nền tảng', 'Người nộp và người chịu thuế'],
              furtherReading: [
                'Bài học "Tôi đang đóng những loại thuế nào?" trong khoá Thuế 101',
                'Quy định về quản lý thuế đối với hoạt động kinh doanh trên nền tảng số',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Bạn có thể là người chịu thuế trong nhiều năm mà chưa từng điền một tờ khai nào.\n' +
              '✓ Chiết khấu nền tảng và thuế là hai thứ khác nhau, với hai địa chỉ thay đổi hoàn toàn khác nhau.\n' +
              '✓ Thông tin nằm sau hai lần bấm thì với người dùng hằng ngày coi như không tồn tại.\n' +
              '✓ Ghi ba con số mỗi tối trong một tháng cho bạn tỷ lệ thật, thay vì cảm giác từ những câu chuyện trong nhóm.',
          },
          {
            type: 'text',
            title: 'Cột chi phí để trống',
            paragraphs: [
              'Đức nhắn hỏi trong nhóm: "Anh em ơi, cái khoản thuế mình bị trừ, nó tính trên tiền khách trả hay tính trên tiền mình còn lại sau khi trừ xăng?"',
              'Có người trả lời: "Trên doanh thu chứ sao."',
              'Đức hỏi tiếp: "Vậy thì mình khác gì công ty đâu? Công ty nó được trừ chi phí trước khi tính thuế mà."',
              'Câu hỏi đó không ai trả lời được.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'doi-tac-hay-nguoi-lao-dong',
        title: 'Đối tác hay người lao động?',
        blocks: [
          {
            type: 'text',
            title: 'Một chữ trong hợp đồng',
            paragraphs: [
              'Đức mở lại bản điều khoản anh đã bấm đồng ý ba năm trước.',
              'Trong đó anh được gọi là "đối tác", không phải "người lao động".',
              'Anh chưa từng để ý chữ đó, và anh cũng không biết nó thay đổi những gì.',
            ],
          },
          {
            type: 'callout',
            icon: 'file-text',
            title: 'Một chữ, rất nhiều hệ quả',
            variant: 'info',
            text: 'Người lao động có hợp đồng lao động thì thuộc phạm vi điều chỉnh của pháp luật lao động: lương tối thiểu, giờ làm việc, nghỉ phép, bảo hiểm xã hội và y tế bắt buộc do hai bên cùng đóng, trợ cấp thất nghiệp, và chế độ khi tai nạn lao động. Người hợp tác theo hợp đồng dân sự thì không nằm trong phạm vi đó — họ tự lo phần lớn những thứ trên.',
          },
          {
            type: 'question',
            question:
              'Với riêng câu chuyện thuế, việc được phân loại là "đối tác" thay vì "người lao động" tạo ra khác biệt gì?',
            options: [
              { id: 'a', text: 'Đối tác không phải nộp thuế', isCorrect: false },
              { id: 'b', text: 'Cách tính và cơ chế thu khác nhau, và quan trọng hơn: không có phần đóng góp bảo hiểm bắt buộc từ phía bên kia', isCorrect: true },
              { id: 'c', text: 'Đối tác nộp thuế suất cao hơn nhiều', isCorrect: false },
              { id: 'd', text: 'Không có khác biệt gì', isCorrect: false },
            ],
            explanation:
              'Cả hai đều phải nộp thuế thu nhập, chỉ khác cách tính và cơ chế thu. Khác biệt lớn hơn nằm ở phần bảo hiểm: với quan hệ lao động, người sử dụng lao động phải đóng một phần bảo hiểm xã hội và y tế cho người lao động. Với quan hệ dân sự, phần đóng góp đó không tồn tại — và đó là một khoản tiền thật, không phải một chi tiết pháp lý.',
          },
          {
            type: 'perspective-switch',
            title: 'Một chữ, ba cách nhìn',
            event: 'Trong hợp đồng, người chạy xe được gọi là "đối tác" chứ không phải "người lao động".',
            perspectives: [
              {
                id: 'v1',
                role: 'Đức — người chạy xe',
                icon: 'bike',
                narrative:
                  'Tôi thích chữ đối tác vì nó nghe tự do: tôi bật app lúc nào tôi muốn, nghỉ lúc nào tôi muốn. Nhưng khi tôi bị tai nạn lúc giao hàng thì tôi tự lo hết, và khi tôi nghỉ ốm thì tôi không có đồng nào. Tôi cũng không rõ lúc già mình sẽ sống bằng gì.',
              },
              {
                id: 'v2',
                role: 'Nền tảng',
                icon: 'smartphone',
                narrative:
                  'Chúng tôi cung cấp một nền tảng kết nối, không phải một chỗ làm. Mô hình này cho phép hàng trăm nghìn người tham gia mà không cần qua tuyển dụng, và cho họ mức linh hoạt mà quan hệ lao động truyền thống không có. Nếu phải áp dụng đầy đủ chế độ lao động, chi phí sẽ khác hoàn toàn.',
              },
              {
                id: 'v3',
                role: 'Cơ quan quản lý',
                icon: 'landmark',
                narrative:
                  'Pháp luật lao động của chúng tôi được thiết kế cho quan hệ có nơi làm việc, có giờ giấc, có người quản lý trực tiếp. Mô hình này không khớp gọn vào đó, và cũng không khớp gọn vào quan hệ dân sự thuần tuý. Chúng tôi đang phải xác định ranh giới trong khi mô hình vẫn đang thay đổi.',
              },
            ],
            question: {
              text: 'Điểm khó nhất trong việc phân loại này nằm ở đâu?',
              options: [
                { id: 'a', text: 'Ở việc các nền tảng cố tình lách luật', isCorrect: false },
                { id: 'b', text: 'Ở chỗ mô hình này có đặc điểm của cả hai loại quan hệ — tự do về giờ giấc như quan hệ dân sự, nhưng bị điều phối và đánh giá chặt như quan hệ lao động', isCorrect: true },
                { id: 'c', text: 'Ở việc tài xế không đọc hợp đồng', isCorrect: false },
                { id: 'd', text: 'Ở việc chưa có nước nào giải quyết được', isCorrect: false },
              ],
              explanation:
                'Nếu đây chỉ là chuyện lách luật thì giải pháp đơn giản: siết lại định nghĩa. Nhưng khó khăn thật nằm ở chỗ mô hình này thực sự nằm giữa. Tài xế có tự do về giờ giấc mà một nhân viên không có; đồng thời họ bị hệ thống phân công việc, chấm điểm và áp chế tài theo cách mà một đối tác kinh doanh độc lập không phải chịu. Nhiều nước đang thử các cách phân loại khác nhau, và chưa có phương án nào được coi là đã ổn.',
            },
          },
          {
            type: 'text',
            title: 'Đức đọc lại điều khoản',
            paragraphs: [
              'Anh đọc kỹ phần mô tả quan hệ giữa hai bên, và anh thấy một danh sách khá dài những việc anh phải làm.',
              'Phải giữ tỷ lệ nhận cuốc trên một mức nhất định. Phải giữ điểm đánh giá trên một mức nhất định. Phải mặc đồng phục. Phải tuân thủ quy tắc ứng xử.',
              '"Đối tác gì mà bị quy định nhiều vậy ta," anh nói.',
            ],
          },
          {
            type: 'question',
            question:
              'Danh sách những ràng buộc đó nói lên điều gì về bản chất quan hệ?',
            options: [
              { id: 'a', text: 'Đó là các điều khoản bình thường của một hợp đồng dịch vụ', isCorrect: false },
              { id: 'b', text: 'Chúng gần với sự điều phối và kỷ luật lao động hơn là với quan hệ giữa hai bên kinh doanh độc lập — và mức độ điều phối chính là tiêu chí mà nhiều nơi dùng để phân loại', isCorrect: true },
              { id: 'c', text: 'Chúng cho thấy nền tảng đang vi phạm pháp luật', isCorrect: false },
              { id: 'd', text: 'Chúng không liên quan tới việc phân loại quan hệ', isCorrect: false },
            ],
            explanation:
              'Tiêu chí thường được dùng để phân biệt hai loại quan hệ là mức độ phụ thuộc và bị điều phối: ai quyết định giá, ai quyết định nhận việc nào, ai đánh giá, ai áp chế tài. Một đối tác kinh doanh độc lập tự đặt giá và tự chọn khách. Khi những quyết định đó nằm ở một bên còn bên kia chỉ tuân thủ, quan hệ nghiêng về phía lao động — dù tên gọi trong hợp đồng là gì.',
          },
          {
            type: 'text',
            paragraphs: [
              'Đức cẩn thận với chính suy nghĩ này. Anh không kết luận nền tảng làm sai luật — đó là câu hỏi thuộc thẩm quyền của cơ quan có trách nhiệm, không phải của anh.',
              'Điều anh rút ra nhỏ hơn: cái tên trong hợp đồng và bản chất thực tế của quan hệ không nhất thiết trùng nhau.',
              'Và khi hai thứ đó lệch nhau, người chịu hậu quả của khoảng lệch là bên yếu hơn.',
            ],
          },
          {
            type: 'text',
            title: 'Đức tính khoản bảo hiểm',
            paragraphs: [
              'Anh tìm hiểu và biết mình có thể tham gia bảo hiểm xã hội tự nguyện.',
              'Nhưng với hình thức tự nguyện, anh đóng toàn bộ, không có phần đóng góp từ bên nào khác.',
              'Với một nhân viên có hợp đồng lao động, người sử dụng lao động đóng một phần đáng kể — và phần đó không xuất hiện trên bảng lương nên nhiều nhân viên cũng không biết mình đang được đóng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức nghĩ ra một cách so sánh cho dễ hiểu.',
              'Nếu quy tất cả về "tổng chi phí mà một bên bỏ ra cho một giờ lao động", thì với nhân viên có hợp đồng, con số đó gồm lương cộng phần bảo hiểm bên sử dụng lao động đóng.',
              'Với anh, con số đó chỉ gồm phần anh nhận. Không có phần cộng thêm nào.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Phần không xuất hiện ở đâu cả',
            variant: 'warning',
            text: 'Khoản đóng góp bảo hiểm từ phía người sử dụng lao động không nằm trên bảng lương của nhân viên, nên nhân viên ít khi ý thức được. Nó cũng không nằm trong thu nhập của tài xế công nghệ, nên tài xế cũng không thấy mình thiếu gì. Kết quả là một khoản chênh lệch đáng kể giữa hai hình thức làm việc mà cả hai phía đều không nhìn thấy rõ.',
          },
          {
            type: 'question',
            question:
              'Vì sao Đức nên quan tâm tới bảo hiểm xã hội dù anh còn trẻ và đang khoẻ?',
            options: [
              { id: 'a', text: 'Vì đó là nghĩa vụ bắt buộc với mọi người lao động', isCorrect: false },
              { id: 'b', text: 'Vì thời gian tham gia được tích luỹ, nên bắt đầu muộn thì phần tích luỹ mất đi không lấy lại được — và rủi ro tai nạn thì không đợi tuổi', isCorrect: true },
              { id: 'c', text: 'Vì nó giúp giảm thuế thu nhập', isCorrect: false },
              { id: 'd', text: 'Vì nếu không đóng sẽ bị phạt', isCorrect: false },
            ],
            explanation:
              'Bảo hiểm xã hội tự nguyện không bắt buộc và không đóng cũng không bị phạt. Lý do thật nằm ở cơ chế tích luỹ: quyền lợi phụ thuộc vào số năm tham gia, nên mỗi năm không đóng là một năm không bao giờ bù lại được. Với một người ba mươi tuổi, khoản chênh lệch tích luỹ tới tuổi nghỉ hưu là rất lớn, và đó là loại quyết định mà hậu quả chỉ hiện ra khi đã quá muộn để sửa.',
          },
          {
            type: 'text',
            title: 'Đức hỏi trong nhóm',
            paragraphs: [
              'Anh đăng một câu hỏi: "Anh em ai đang đóng bảo hiểm xã hội tự nguyện không ạ?"',
              'Trong hơn năm nghìn thành viên, có mười một người trả lời là có.',
              'Có nhiều bình luận kiểu: "Đóng chi, sống ngày nào hay ngày đó" và "Tiền ăn còn chưa đủ".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức thấy câu thứ hai là câu thật nhất và cũng khó trả lời nhất.',
              'Với người thu nhập không ổn định, một khoản đóng cố định hằng tháng là một cam kết rủi ro — tháng ế thì lấy gì đóng.',
              'Đây không phải chuyện thiếu hiểu biết. Đây là chuyện một sản phẩm được thiết kế cho thu nhập đều đặn, áp vào nhóm có thu nhập không đều.',
            ],
          },
          {
            type: 'text',
            title: 'Vì sao mười một trên năm nghìn',
            paragraphs: [
              'Đức nghĩ về con số mười một người trong hơn năm nghìn.',
              'Anh nhận ra hầu hết tài xế đều còn trẻ, và với người trẻ thì tuổi hưu là một thứ trừu tượng tới mức không có thật.',
              'Còn rủi ro tai nạn thì ai cũng biết là có, nhưng ai cũng nghĩ nó xảy ra với người khác.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh Tám tám năm chạy xe thì nghĩ khác. Anh nhắn riêng cho Đức:',
              '"Anh bốn mươi hai rồi em. Anh chạy được thêm chừng mười năm nữa là hết sức. Mà anh không đóng gì hết."',
              '"Em còn trẻ thì em bắt đầu đi. Anh mà quay lại được ba mươi tuổi thì anh đóng liền."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Không tham gia không đồng nghĩa với không muốn',
            variant: 'info',
            text: 'Khi một nhóm không sử dụng một chính sách, phản xạ thường thấy là kết luận họ thiếu ý thức hoặc thiếu hiểu biết. Nhưng thường thì lý do nằm ở thiết kế: mức đóng cố định với thu nhập không cố định, thủ tục trong giờ hành chính với người làm cả ngày, hoặc quyền lợi quá xa so với nhu cầu trước mắt. Nhìn ra chỗ đó thì mới có cách sửa.',
          },
          {
            type: 'text',
            title: 'Đức bắt đầu đóng',
            paragraphs: [
              'Anh chọn mức thấp nhất có thể, và anh đặt lịch nhắc mỗi tháng.',
              'Anh cũng làm một việc mà anh thấy quan trọng hơn: anh trừ khoản đó ra khỏi thu nhập ngay khi tiền về ví, coi như nó không tồn tại.',
              '"Nếu để tới cuối tháng mới đóng thì tháng nào cũng có lý do để không đóng," anh nói.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Đối tác, người lao động, và phần chênh lệch',
            description: 'Một chữ trong hợp đồng thay đổi những gì, và cái gì tự lo được.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai loại quan hệ',
                  paragraphs: [
                    'Hợp đồng lao động: thuộc phạm vi pháp luật lao động — lương tối thiểu, giờ làm việc, nghỉ phép, bảo hiểm bắt buộc do hai bên cùng đóng, trợ cấp thất nghiệp, chế độ tai nạn lao động.',
                    'Hợp đồng dân sự hoặc hợp tác: không thuộc phạm vi đó; người tham gia tự lo phần lớn những thứ trên.',
                    'Cả hai đều phải nộp thuế thu nhập, chỉ khác cách tính và cơ chế thu.',
                  ],
                },
                {
                  heading: 'Vì sao khó phân loại mô hình nền tảng',
                  paragraphs: [
                    'Có đặc điểm của quan hệ dân sự: tự do bật tắt ứng dụng, không có nơi làm việc cố định, không có người quản lý trực tiếp.',
                    'Có đặc điểm của quan hệ lao động: được hệ thống phân công việc, bị chấm điểm, chịu chế tài theo quy chế của một bên.',
                    'Nhiều nước đang thử các cách xử lý khác nhau và chưa có phương án nào được coi là đã ổn.',
                  ],
                },
                {
                  heading: 'Những gì tự lo được',
                  paragraphs: [
                    'Bảo hiểm xã hội tự nguyện: quyền lợi phụ thuộc số năm tham gia, nên bắt đầu sớm quan trọng hơn đóng nhiều.',
                    'Bảo hiểm y tế theo hộ gia đình, và bảo hiểm tai nạn cho người điều khiển phương tiện.',
                    'Trừ khoản đóng ra khỏi thu nhập ngay khi tiền về, thay vì để tới cuối tháng — với thu nhập không đều, đây là khác biệt giữa đóng được và không đóng được.',
                  ],
                },
              ],
              relatedConcepts: ['Phân loại quan hệ lao động', 'Bảo hiểm xã hội tự nguyện', 'Thiết kế chính sách và nhóm thu nhập không đều'],
              furtherReading: [
                'Bài học "Người nộp thuế có những nghĩa vụ gì" trong khoá Thuế 101',
                'Câu chuyện "Vùng xám pháp lý" của Đức trong khoá Dân chủ 101',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Cả đối tác lẫn người lao động đều nộp thuế; khác biệt lớn nhất nằm ở phần đóng góp bảo hiểm từ bên kia.\n' +
              '✓ Khoản đóng góp đó không xuất hiện trên bảng lương của ai, nên cả hai phía đều ít nhìn thấy nó.\n' +
              '✓ Quyền lợi bảo hiểm phụ thuộc số năm tham gia — mỗi năm không đóng là một năm không bù lại được.\n' +
              '✓ Khi một nhóm không dùng một chính sách, thường là do thiết kế không hợp với họ, không phải do thiếu ý thức.',
          },
          {
            type: 'text',
            title: 'Nhưng còn câu hỏi về chi phí',
            paragraphs: [
              'Đức vẫn chưa quên cột chi phí bỏ trống trong bảng của mình.',
              'Anh nhớ câu anh hỏi trong nhóm mà không ai trả lời được: công ty được trừ chi phí trước khi tính thuế, còn anh thì không.',
              'Anh quyết định tự tính xem nếu trừ hết chi phí thật thì thu nhập của anh còn lại bao nhiêu.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'thu-nhap-that-sau-khi-tru-het',
        title: 'Thu nhập thật sau khi trừ hết',
        blocks: [
          {
            type: 'text',
            title: 'Đức ngồi tính một buổi tối',
            paragraphs: [
              'Anh lấy toàn bộ hoá đơn xăng, biên lai thay nhớt, tiền vá lốp, tiền thay lốp, tiền sửa xe trong một năm.',
              'Anh cộng thêm tiền điện thoại, tiền gói dữ liệu, và tiền mua sạc dự phòng.',
              'Rồi anh làm phép trừ mà anh chưa từng làm trong ba năm.',
            ],
          },
          {
            type: 'callout',
            icon: 'calculator',
            title: 'Những khoản Đức hay quên',
            variant: 'info',
            text: 'Xăng thì ai cũng nhớ. Nhưng còn: khấu hao chiếc xe (mua bao nhiêu, dùng mấy năm, bán lại được bao nhiêu), tiền bảo dưỡng định kỳ, bảo hiểm xe, và cả những ngày không chạy được vì ốm hay vì xe hỏng.',
          },
          {
            type: 'question',
            question:
              'Vì sao khấu hao xe là một khoản chi phí thật dù không có hoá đơn nào hằng tháng?',
            options: [
              { id: 'a', text: 'Vì xe sẽ hỏng và phải sửa', isCorrect: false },
              { id: 'b', text: 'Vì mỗi cây số chạy làm giảm giá trị chiếc xe, và tới lúc phải thay xe thì khoản đó phải trả một lần bằng tiền thật', isCorrect: true },
              { id: 'c', text: 'Vì giá xe tăng theo thời gian', isCorrect: false },
              { id: 'd', text: 'Vì cơ quan thuế yêu cầu tính khấu hao', isCorrect: false },
            ],
            explanation:
              'Đây là khoản chi phí dễ bỏ quên nhất vì nó không rời khỏi ví hằng tháng. Nhưng một chiếc xe chạy dịch vụ hết tuổi thọ sau một số năm nhất định, và lúc đó người chạy phải bỏ ra một khoản lớn để thay. Nếu không trừ dần khoản đó vào thu nhập hằng tháng, người ta sẽ thấy mình kiếm được nhiều hơn thực tế — cho tới ngày phải thay xe.',
          },
          {
            type: 'calculator',
            title: 'Thu nhập thật của một tài xế',
            description:
              'Nhập các con số của bạn để xem thu nhập còn lại sau khi trừ hết chi phí. Các giá trị mặc định chỉ là ví dụ để bạn thay bằng số thật của mình.',
            calculatorType: 'custom',
            formula: 'doanhthu',
            inputs: [
              {
                id: 'doanhthu',
                label: 'Tổng tiền khách trả mỗi tháng',
                type: 'number',
                unit: 'đồng',
                defaultValue: 18000000,
                min: 3000000,
                max: 60000000,
                step: 500000,
              },
              {
                id: 'chietkhau',
                label: 'Tỷ lệ chiết khấu và thuế nền tảng giữ lại',
                type: 'number',
                unit: '%',
                defaultValue: 30,
                min: 10,
                max: 45,
                step: 1,
              },
              {
                id: 'xang',
                label: 'Tiền xăng mỗi tháng',
                type: 'number',
                unit: 'đồng',
                defaultValue: 2500000,
                min: 0,
                max: 10000000,
                step: 100000,
              },
              {
                id: 'giaxe',
                label: 'Giá chiếc xe',
                type: 'number',
                unit: 'đồng',
                defaultValue: 40000000,
                min: 10000000,
                max: 500000000,
                step: 5000000,
              },
              {
                id: 'sonam',
                label: 'Dự kiến dùng được bao nhiêu năm',
                type: 'number',
                unit: 'năm',
                defaultValue: 5,
                min: 2,
                max: 12,
                step: 1,
              },
              {
                id: 'khacthang',
                label: 'Bảo dưỡng, sửa chữa, điện thoại, bảo hiểm mỗi tháng',
                type: 'number',
                unit: 'đồng',
                defaultValue: 800000,
                min: 0,
                max: 5000000,
                step: 100000,
              },
            ],
            outputs: [
              {
                id: 'veVi',
                label: 'Tiền về ví mỗi tháng',
                unit: 'đồng',
                formula: 'doanhthu * (100 - chietkhau) / 100',
              },
              {
                id: 'khauhao',
                label: 'Khấu hao xe quy về mỗi tháng',
                unit: 'đồng',
                formula: 'giaxe / (sonam * 12)',
              },
              {
                id: 'thucNhan',
                label: 'Thu nhập thật sau khi trừ hết chi phí',
                unit: 'đồng',
                formula: 'doanhthu * (100 - chietkhau) / 100 - xang - giaxe / (sonam * 12) - khacthang',
                highlight: true,
              },
              {
                id: 'moiGio',
                label: 'Quy ra mỗi giờ, nếu chạy 10 tiếng mỗi ngày, 26 ngày mỗi tháng',
                unit: 'đồng/giờ',
                formula:
                  '(doanhthu * (100 - chietkhau) / 100 - xang - giaxe / (sonam * 12) - khacthang) / 260',
                highlight: true,
              },
            ],
            presets: [
              {
                label: 'Chạy toàn thời gian',
                values: { doanhthu: 18000000, chietkhau: 30, xang: 2500000, giaxe: 40000000, sonam: 5, khacthang: 800000 },
              },
              {
                label: 'Chạy bán thời gian',
                values: { doanhthu: 8000000, chietkhau: 30, xang: 1200000, giaxe: 30000000, sonam: 7, khacthang: 400000 },
              },
            ],
            insight:
              'Con số cuối cùng thường thấp hơn nhiều so với con số mà người ta nói với nhau. Đó là vì phần lớn tài xế tính thu nhập bằng tiền về ví, chứ không trừ khấu hao và các khoản không xảy ra hằng tháng.',
          },
          {
            type: 'text',
            title: 'Con số của Đức',
            paragraphs: [
              'Sau khi trừ hết, thu nhập thật của Đức thấp hơn con số anh vẫn nói với vợ khoảng một phần tư.',
              'Và khi chia ra mỗi giờ, con số làm anh ngồi im.',
              'Anh chạy mười tiếng mỗi ngày, hai mươi sáu ngày mỗi tháng, và mức mỗi giờ thì không cao như anh vẫn nghĩ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức nhấn mạnh với chính mình rằng đây là con số của riêng anh — người khác có xe rẻ hơn, chạy khu vực đông khách hơn, hoặc chi phí thấp hơn thì sẽ khác.',
              'Nhưng cách tính thì áp dụng cho ai cũng được.',
              'Và điều quan trọng không phải con số ra bao nhiêu, mà là trước đó anh chưa từng biết nó.',
            ],
          },
          {
            type: 'text',
            title: 'Giờ thứ mười một',
            paragraphs: [
              'Đức thử một phép tính khác: anh so thu nhập của bốn giờ đầu ca với bốn giờ cuối ca.',
              'Bốn giờ đầu, giờ cao điểm sáng, anh chạy được nhiều cuốc và cuốc ngắn.',
              'Bốn giờ cuối, đã mệt, đường vắng hơn, anh chạy được ít hơn hẳn — mà xăng và hao mòn thì vẫn tính đủ.',
            ],
          },
          {
            type: 'question',
            question:
              'Nếu giờ làm thêm tạo ra ít thu nhập hơn mà chi phí vẫn như nhau, điều đó gợi ý gì?',
            options: [
              { id: 'a', text: 'Nên chạy nhiều giờ hơn nữa để bù lại', isCorrect: false },
              { id: 'b', text: 'Có một điểm mà việc chạy thêm không còn đáng, và biết điểm đó cần dữ liệu chứ không phải cảm giác', isCorrect: true },
              { id: 'c', text: 'Nên chỉ chạy giờ cao điểm và nghỉ hẳn giờ vắng', isCorrect: false },
              { id: 'd', text: 'Thu nhập mỗi giờ luôn giống nhau nếu tính cả tháng', isCorrect: false },
            ],
            explanation:
              'Chạy thêm giờ luôn tạo ra thêm tiền, nên cảm giác là "càng chạy càng có". Nhưng khi trừ xăng, hao mòn và sức khoẻ, có một điểm mà phần thêm vào không còn bù được phần mất đi. Phương án c thì quá cực đoan theo chiều ngược lại — nghỉ hẳn giờ vắng cũng có cái giá. Điểm chung là: cả hai quyết định đều cần con số, và cảm giác thì luôn nghiêng về phía chạy thêm.',
          },
          {
            type: 'text',
            paragraphs: [
              'Đức không cắt giờ chạy ngay, vì anh cần đủ thu nhập cho tháng đó.',
              'Nhưng anh đổi cách phân bổ: anh dồn nhiều giờ hơn vào khung cao điểm và cắt bớt khung vắng nhất.',
              'Sau hai tháng, tổng giờ chạy của anh giảm khoảng một tiếng mỗi ngày mà thu nhập gần như không đổi.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Không biết thu nhập thật thì không so sánh được gì',
            variant: 'warning',
            text: 'Khi không biết mình kiếm được bao nhiêu mỗi giờ, bạn không so sánh được công việc này với công việc khác, không đánh giá được một thay đổi chính sách có ảnh hưởng thế nào tới mình, và không biết mình đang thương lượng cho cái gì. Con số đó là điều kiện đầu tiên của mọi quyết định về sau.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc thuế được tính trên doanh thu chứ không trên thu nhập sau chi phí lại quan trọng với Đức?',
            options: [
              { id: 'a', text: 'Vì nó làm số thuế cao hơn nhiều lần', isCorrect: false },
              { id: 'b', text: 'Vì với người có chi phí lớn trên doanh thu, cách tính trên doanh thu tạo ra gánh nặng tương đối nặng hơn so với người có chi phí thấp', isCorrect: true },
              { id: 'c', text: 'Vì cơ quan thuế không cho phép trừ chi phí', isCorrect: false },
              { id: 'd', text: 'Vì doanh nghiệp không phải nộp thuế trên doanh thu', isCorrect: false },
            ],
            explanation:
              'Cách tính trên doanh thu có ưu điểm là đơn giản, không cần chứng từ, không cần kiểm tra chi phí — cùng lý do khiến thuế khoán tồn tại. Nhược điểm là nó không phân biệt người có chi phí cao với người có chi phí thấp. Hai người cùng doanh thu, một người chạy xe cũ tốn xăng và một người chạy xe mới tiết kiệm, sẽ chịu cùng một mức — dù phần còn lại thực sự của họ khác nhau.',
          },
          {
            type: 'text',
            title: 'Một điều Đức không muốn bỏ qua',
            paragraphs: [
              'Anh cũng thấy cần nói rõ một chuyện, vì nếu không thì câu chuyện này nghe như chỉ toàn phần thiệt.',
              'Công việc này cho anh thứ mà công việc trước không cho: anh đưa con đi học buổi sáng, đón con buổi chiều, và nghỉ được khi con ốm mà không phải xin phép ai.',
              'Nếu quy đổi cái đó ra tiền thì anh không biết quy thế nào, nhưng anh biết nó có giá trị thật với anh.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc tính đủ chi phí không tự động dẫn tới kết luận "nên bỏ nghề"?',
            options: [
              { id: 'a', text: 'Vì không có công việc nào tốt hơn', isCorrect: false },
              { id: 'b', text: 'Vì một quyết định về công việc gồm cả những giá trị không quy ra tiền được — biết con số chỉ giúp bạn đánh đổi một cách có ý thức', isCorrect: true },
              { id: 'c', text: 'Vì thu nhập sẽ tăng theo thời gian', isCorrect: false },
              { id: 'd', text: 'Vì chi phí có thể giảm được nhiều', isCorrect: false },
            ],
            explanation:
              'Mục đích của việc tính toán không phải để ra một câu trả lời duy nhất về việc nên làm gì. Nó để bạn biết mình đang đánh đổi cái gì lấy cái gì. Một người biết mình kiếm được bao nhiêu mỗi giờ và vẫn chọn công việc đó vì sự linh hoạt thì đang ra một quyết định có ý thức. Một người không biết con số thì không thật sự đang chọn.',
          },
          {
            type: 'text',
            title: 'Cái giá của sự đơn giản',
            paragraphs: [
              'Đức nhận ra đây là cùng một đánh đổi mà bác Tư gặp với thuế khoán, chỉ ở một hình thức khác.',
              'Tính trên doanh thu thì đơn giản, ai cũng làm được, không cần sổ sách — nhưng kém chính xác.',
              'Tính trên thu nhập sau chi phí thì chính xác hơn — nhưng đòi hỏi giữ chứng từ, kê khai, và một bộ máy kiểm tra.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh cũng thấy một điều mà anh không ngờ: chính anh cũng không muốn phải giữ toàn bộ hoá đơn xăng trong năm.',
              'Anh vừa làm việc đó một lần để tính thu nhập thật, và nó tốn của anh gần một buổi tối.',
              'Làm mỗi tháng, cả năm, kèm kê khai thì anh sẽ không làm nổi.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Không phải mọi vấn đề đều có phương án tốt hơn hẳn',
            variant: 'info',
            text: 'Một cách nghĩ hữu ích là dừng ở chỗ nhận ra đây là đánh đổi, thay vì đi tìm phương án hoàn hảo. Cả hai cách tính đều có cái giá của nó, và cái giá đó rơi vào những nhóm khác nhau. Biết được điều đó giúp bạn hiểu vì sao chính sách hay thay đổi qua lại, và giúp bạn đánh giá một đề xuất theo câu hỏi "nó chuyển gánh nặng sang ai" thay vì "nó tốt hay xấu".',
          },
          {
            type: 'text',
            title: 'Đức làm một việc thực tế hơn',
            paragraphs: [
              'Anh không đi kiến nghị sửa cách tính thuế. Anh làm ba việc gần hơn nhiều.',
              '⛽ Anh đổi thói quen đổ xăng và chọn tuyến, sau khi thấy tiền xăng chiếm bao nhiêu phần trăm.',
              '🛠️ Anh chuyển sang bảo dưỡng định kỳ đúng hạn, vì anh tính ra sửa chữa đột xuất tốn hơn nhiều.',
              '📊 Anh giữ bảng tính và cập nhật mỗi tháng, để biết tháng nào tốt tháng nào tệ và vì sao.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Tính thu nhập thật khi làm việc tự do',
            description: 'Những khoản hay bị bỏ quên, và vì sao con số mỗi giờ quan trọng.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Các khoản cần trừ',
                  paragraphs: [
                    'Chi phí hằng tháng dễ thấy: xăng, điện thoại, dữ liệu di động.',
                    'Chi phí định kỳ: bảo dưỡng, thay lốp, thay nhớt, bảo hiểm xe — chia đều ra mỗi tháng.',
                    'Khấu hao phương tiện: giá mua trừ giá bán lại dự kiến, chia cho số tháng sử dụng. Đây là khoản bị bỏ quên nhiều nhất.',
                    'Thời gian không tạo ra thu nhập: chờ khách, di chuyển rỗng, ngày ốm, ngày xe hỏng.',
                  ],
                },
                {
                  heading: 'Vì sao nên quy ra thu nhập mỗi giờ',
                  paragraphs: [
                    'Nó cho phép so sánh công việc này với công việc khác một cách có ý nghĩa.',
                    'Nó cho thấy tác động của việc chạy thêm giờ: giờ thứ mười một thường tạo ra ít hơn giờ thứ ba.',
                    'Nó là cơ sở để đánh giá bất kỳ thay đổi nào — chiết khấu, giá xăng, chính sách thuế — ảnh hưởng tới mình bao nhiêu.',
                  ],
                },
                {
                  heading: 'Hai cách tính thuế và cái giá của mỗi cách',
                  paragraphs: [
                    'Tính trên doanh thu: đơn giản, không cần chứng từ, chi phí tuân thủ thấp — nhưng không phân biệt người chi phí cao với người chi phí thấp.',
                    'Tính trên thu nhập sau chi phí: chính xác hơn — nhưng đòi hỏi giữ chứng từ, kê khai và bộ máy kiểm tra.',
                    'Không có phương án tốt hơn hẳn; đánh giá một đề xuất bằng câu hỏi "nó chuyển gánh nặng sang ai" thay vì "nó tốt hay xấu".',
                  ],
                },
              ],
              relatedConcepts: ['Khấu hao', 'Thu nhập mỗi giờ', 'Đánh đổi trong thiết kế thuế'],
              furtherReading: [
                'Bài học "Tôi đang đóng những loại thuế nào?" trong khoá Thuế 101',
                'Câu chuyện của bác Tư trong khoá Thuế 101 — cùng một đánh đổi ở hình thức thuế khoán',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Khấu hao phương tiện là chi phí thật dù không rời khỏi ví hằng tháng — và là khoản bị bỏ quên nhiều nhất.\n' +
              '✓ Không biết thu nhập thật mỗi giờ thì không so sánh được gì và không biết mình đang thương lượng cho cái gì.\n' +
              '✓ Tính thuế trên doanh thu thì đơn giản nhưng không phân biệt người chi phí cao với người chi phí thấp.\n' +
              '✓ Với nhiều vấn đề chính sách, câu hỏi hữu ích là "gánh nặng chuyển sang ai", không phải "tốt hay xấu".',
          },
          {
            type: 'text',
            title: 'Đức chia sẻ bảng tính',
            paragraphs: [
              'Anh đăng bảng tính vào nhóm, bỏ hết số liệu cá nhân, chỉ để công thức và các mục cần điền.',
              'Trong hai tuần có hơn hai trăm người tải về.',
              'Và trong phần bình luận, có một câu lặp lại nhiều lần tới mức Đức phải chụp màn hình lại.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'cau-lap-lai-nhieu-nhat',
        title: 'Câu lặp lại nhiều nhất',
        blocks: [
          {
            type: 'text',
            title: 'Câu Đức chụp màn hình lại',
            paragraphs: [
              'Trong hơn hai trăm lượt tải bảng tính, câu bình luận lặp lại nhiều nhất là:',
              '"Thôi anh ơi, biết rồi buồn thêm."',
              'Đức đọc câu đó và anh hiểu người ta nói thật, không phải nói cho vui.',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Một câu khác cũng lặp lại nhiều',
            variant: 'info',
            text: '"Biết vậy chớ mình cũng đâu làm gì được." — Hai câu này nói cùng một điều: việc biết thêm chỉ có nghĩa nếu nó dẫn tới một hành động nào đó, mà nhiều người thì không thấy hành động nào khả thi.',
          },
          {
            type: 'question',
            question:
              'Phản ứng "biết rồi buồn thêm" nên được hiểu thế nào?',
            options: [
              { id: 'a', text: 'Đó là sự thờ ơ, không muốn tìm hiểu', isCorrect: false },
              { id: 'b', text: 'Đó là phản ứng hợp lý khi thông tin mới không đi kèm một việc gì làm được — biết mà bất lực thì thật sự là gánh nặng thêm', isCorrect: true },
              { id: 'c', text: 'Đó là do bảng tính quá phức tạp', isCorrect: false },
              { id: 'd', text: 'Đó là do họ không tin con số', isCorrect: false },
            ],
            explanation:
              'Trách người ta thờ ơ là phản ứng dễ nhất và cũng ít hữu ích nhất. Với người đang chạy mười tiếng mỗi ngày để đủ sống, một con số cho thấy tình hình tệ hơn mình tưởng mà không kèm theo lối ra nào thì đúng là chỉ thêm nặng. Điều này gợi ý rằng thông tin phải đi kèm ít nhất một hành động cụ thể trong tầm tay, nếu không nó sẽ bị từ chối một cách hoàn toàn hợp lý.',
          },
          {
            type: 'text',
            title: 'Đức suýt bỏ cuộc',
            paragraphs: [
              'Đọc mấy chục bình luận kiểu đó, Đức định gỡ bài xuống.',
              'Anh thấy mình vừa làm một việc tốn công cả tuần để rồi khiến người khác thấy tệ hơn.',
              'Vợ anh đọc được và nói một câu: "Tại anh chỉ đưa cái xấu mà không đưa cách nào hết."',
            ],
          },
          {
            type: 'question',
            question:
              'Lời nhận xét của vợ Đức chỉ ra vấn đề gì trong cách trình bày thông tin?',
            options: [
              { id: 'a', text: 'Nội dung quá dài nên không ai đọc hết', isCorrect: false },
              { id: 'b', text: 'Nó chẩn đoán vấn đề mà không đưa ra bất kỳ lựa chọn nào, nên người đọc chỉ nhận thêm lo lắng chứ không nhận được khả năng hành động', isCorrect: true },
              { id: 'c', text: 'Con số trong bảng chưa chính xác', isCorrect: false },
              { id: 'd', text: 'Đức không đủ uy tín để nói về chủ đề này', isCorrect: false },
            ],
            explanation:
              'Một chẩn đoán không kèm lựa chọn nào là thứ mà người nghe không làm gì được. Trong y tế, người ta không nói với bệnh nhân rằng bệnh nặng rồi dừng ở đó. Nguyên tắc tương tự áp dụng cho mọi thông tin về hoàn cảnh khó khăn: nêu vấn đề thì phải nêu kèm ít nhất một việc trong tầm tay, kể cả khi việc đó nhỏ so với vấn đề.',
          },
          {
            type: 'text',
            paragraphs: [
              'Đức không gỡ bài. Anh để nguyên đó và viết một bài mới.',
              'Anh nghĩ nếu gỡ thì hai trăm người đã tải bảng tính sẽ không bao giờ nhận được phần còn thiếu.',
              'Và anh cũng không muốn xoá bằng chứng rằng mình đã làm chưa tới nơi.',
            ],
          },
          {
            type: 'text',
            title: 'Đức viết lại bài đăng',
            paragraphs: [
              'Anh đăng lại bảng tính, lần này kèm ba việc cụ thể mà chính anh đã làm và có kết quả đo được.',
              'Không có việc nào là kiến nghị chính sách hay đòi hỏi gì.',
              'Cả ba đều là việc một người làm được một mình, trong tuần này.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '⛽ Đổi cách chọn khung giờ chạy sau khi biết giờ nào tạo ra ít nhất — Đức giảm được một tiếng mỗi ngày mà thu nhập gần như không đổi.',
              '🛠️ Bảo dưỡng đúng hạn thay vì đợi hỏng — anh tính ra rẻ hơn trong một năm.',
              '🏥 Bắt đầu đóng bảo hiểm xã hội tự nguyện ở mức thấp nhất, trừ ngay khi tiền về ví.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Thông tin cần đi kèm một việc làm được',
            variant: 'info',
            text: 'Một con số cho thấy vấn đề lớn hơn mình tưởng, nếu đứng một mình, thường tạo ra sự bất lực chứ không tạo ra hành động. Kèm theo dù chỉ một việc nhỏ trong tầm tay sẽ đổi hoàn toàn cách người ta tiếp nhận: từ "biết để buồn" sang "biết để làm". Đây là điều mà rất nhiều nội dung nâng cao nhận thức bỏ qua.',
          },
          {
            type: 'question',
            question:
              'Vì sao ba việc Đức nêu đều là việc cá nhân, không có việc nào là kiến nghị tập thể?',
            options: [
              { id: 'a', text: 'Vì kiến nghị tập thể không có tác dụng', isCorrect: false },
              { id: 'b', text: 'Vì việc làm được ngay xây dựng cảm giác có thể làm được — và đó là điều kiện để về sau người ta tham gia những việc lớn hơn', isCorrect: true },
              { id: 'c', text: 'Vì tài xế không được phép tổ chức', isCorrect: false },
              { id: 'd', text: 'Vì Đức không quan tâm tới chính sách', isCorrect: false },
            ],
            explanation:
              'Kiến nghị tập thể có tác dụng thật, nhưng nó đòi hỏi một thứ có trước: niềm tin rằng hành động của mình dẫn tới kết quả. Với người đã quen với việc mọi thứ do bên khác quyết định, ba việc nhỏ có kết quả đo được sẽ xây lại niềm tin đó nhanh hơn nhiều so với một lời kêu gọi. Bắt đầu từ việc trong tầm tay không phải là hạ thấp mục tiêu, mà là đi đúng thứ tự.',
          },
          {
            type: 'text',
            title: 'Lần đăng thứ hai',
            paragraphs: [
              'Bài đăng lần này có phản ứng khác hẳn.',
              'Có người hỏi cách tính khấu hao. Có người hỏi mức đóng bảo hiểm tự nguyện thấp nhất là bao nhiêu. Có người khoe đã thử đổi khung giờ và thấy khác thật.',
              'Không còn câu "biết rồi buồn thêm" nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh Tám nhắn riêng: "Em đăng cái này hay hơn cái lần trước nhiều."',
              'Đức hỏi vì sao, và câu trả lời của anh Tám gọn hơn mọi thứ Đức nghĩ ra:',
              '"Lần trước em cho anh em thấy mình nghèo hơn mình tưởng. Lần này em cho anh em thấy làm gì được."',
            ],
          },
          {
            type: 'text',
            title: 'Một người phản đối cách nghĩ của Đức',
            paragraphs: [
              'Có người bình luận: "Mấy cái anh nói toàn bắt anh em tự lo. Sao không đòi app giảm chiết khấu đi?"',
              'Đức thấy ý đó đúng, và anh trả lời thẳng: "Cái đó cũng nên đòi. Mà em không biết đòi cách nào cho có kết quả."',
              '"Ba cái em nói là mấy cái em làm được ngay. Còn cái kia thì em chịu, ai biết chỉ giùm."',
            ],
          },
          {
            type: 'question',
            question:
              'Cách trả lời của Đức có gì đáng chú ý?',
            options: [
              { id: 'a', text: 'Anh né tránh vấn đề chính bằng cách nói mình không biết', isCorrect: false },
              { id: 'b', text: 'Anh thừa nhận đề xuất của người kia là đúng, nêu rõ giới hạn của mình, và không giả vờ rằng ba việc nhỏ giải quyết được vấn đề lớn', isCorrect: true },
              { id: 'c', text: 'Anh chuyển trách nhiệm sang người bình luận', isCorrect: false },
              { id: 'd', text: 'Anh đang dùng chiến thuật lảng tránh', isCorrect: false },
            ],
            explanation:
              'Một cách trả lời tệ hơn là bảo vệ ba việc nhỏ như thể chúng đủ, hoặc gạt đi ý kiến kia. Đức làm khác: anh công nhận vấn đề lớn là có thật, nói rõ mình chưa biết cách xử lý nó, và không nhập nhằng giữa "tôi làm được cái này" với "cái này là đủ". Sự phân biệt đó giữ cho cuộc trao đổi trung thực và để ngỏ cửa cho người biết nhiều hơn góp vào.',
          },
          {
            type: 'text',
            title: 'Ba tháng sau, một chuyện khác xảy ra',
            paragraphs: [
              'Trong nhóm có người đăng thông tin về một dự thảo văn bản liên quan tới quản lý thuế với hoạt động trên nền tảng số, đang trong giai đoạn lấy ý kiến.',
              'Ba năm trước, một bài như vậy sẽ trôi qua không ai đọc.',
              'Lần này có bốn mươi mấy bình luận, và ba người hỏi cách gửi góp ý.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức nghĩ đó không phải công của bảng tính của anh.',
              'Nhưng anh nghĩ có một mối liên hệ: người đã tự tính được thu nhập của mình thì đọc một dự thảo với con mắt khác — họ biết chính xác điều khoản nào ảnh hưởng tới con số nào của họ.',
              'Không có con số của riêng mình thì mọi dự thảo đều đọc như nhau: xa và trừu tượng.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nhưng bốn mươi bình luận không phải là thay đổi',
            variant: 'warning',
            text: 'Cần trung thực: cơ cấu chiết khấu không đổi, cách tính thuế không đổi, và địa vị pháp lý của tài xế vẫn nằm ở vùng chưa rõ. Thứ thay đổi mới chỉ là số người đọc được một văn bản và biết nó liên quan tới mình. Đó là điều kiện cần cho mọi thay đổi về sau, nhưng bản thân nó chưa phải là thay đổi.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc "biết con số của chính mình" lại đổi cách một người đọc một dự thảo chính sách?',
            options: [
              { id: 'a', text: 'Vì họ hiểu ngôn ngữ pháp lý tốt hơn', isCorrect: false },
              { id: 'b', text: 'Vì họ chuyển được các điều khoản trừu tượng thành tác động cụ thể lên con số của mình, nên họ biết mình đang góp ý về cái gì', isCorrect: true },
              { id: 'c', text: 'Vì họ có động lực tài chính lớn hơn', isCorrect: false },
              { id: 'd', text: 'Vì họ đã quen với việc đọc số liệu', isCorrect: false },
            ],
            explanation:
              'Một dự thảo viết bằng ngôn ngữ chung cho tất cả mọi người. Người có con số của riêng mình thì đọc được nó theo cách khác: điều khoản này làm thu nhập mỗi giờ của tôi đổi bao nhiêu, quy định kia áp dụng cho trường hợp nào giống tôi. Góp ý xuất phát từ một tác động cụ thể thì có nội dung và khó bị bỏ qua hơn nhiều so với một ý kiến chung chung.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Từ con số cá nhân tới tiếng nói chung',
            description: 'Vì sao nâng cao nhận thức thất bại khi không kèm hành động, và thứ tự nên đi.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao "biết rồi buồn thêm" là phản ứng hợp lý',
                  paragraphs: [
                    'Thông tin cho thấy tình hình tệ hơn mình tưởng, nếu không kèm lối ra nào, thì đúng là chỉ thêm gánh nặng.',
                    'Với người đang xoay xở đủ sống, chi phí của việc lo lắng thêm là chi phí thật.',
                    'Vì thế nội dung nâng cao nhận thức nên luôn kèm ít nhất một việc cụ thể làm được trong tuần này.',
                  ],
                },
                {
                  heading: 'Thứ tự nên đi',
                  paragraphs: [
                    'Một: biết con số của chính mình — thu nhập thật sau chi phí, quy ra mỗi giờ.',
                    'Hai: làm được vài việc nhỏ có kết quả đo được, để xây lại cảm giác hành động của mình có tác dụng.',
                    'Ba: khi đọc một dự thảo hay một thay đổi chính sách, chuyển nó thành tác động lên con số của mình.',
                    'Bốn: góp ý xuất phát từ tác động cụ thể đó, thay vì từ một cảm giác chung.',
                  ],
                },
                {
                  heading: 'Trung thực về giới hạn',
                  paragraphs: [
                    'Nhiều người biết hơn không tự động dẫn tới chính sách thay đổi.',
                    'Nhưng không có ai biết thì chắc chắn không có gì thay đổi, vì không có ai để trả lời và không có ai để hỏi.',
                    'Đây là điều kiện cần, không phải điều kiện đủ — và nói rõ điều đó thì đáng tin hơn là hứa hẹn quá tay.',
                  ],
                },
              ],
              relatedConcepts: ['Nhận thức và hành động', 'Góp ý dự thảo', 'Điều kiện cần và đủ'],
              furtherReading: [
                'Bài học "Một người dân bình thường có thể tác động vào chính sách thuế bằng cách nào?" trong khoá Thuế 101',
                'Luật Ban hành văn bản quy phạm pháp luật — quy định về lấy ý kiến và giải trình tiếp thu',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ "Biết rồi buồn thêm" là phản ứng hợp lý khi thông tin không kèm theo việc gì làm được.\n' +
              '✓ Một việc nhỏ có kết quả đo được xây lại cảm giác hành động có tác dụng — điều kiện cho những việc lớn hơn.\n' +
              '✓ Người biết con số của mình đọc một dự thảo theo cách khác: họ biết điều khoản nào chạm vào con số nào.\n' +
              '✓ Nhiều người biết hơn là điều kiện cần chứ chưa phải điều kiện đủ, và nói rõ điều đó thì đáng tin hơn hứa hẹn quá tay.',
          },
          {
            type: 'text',
            title: 'Điều Đức mang theo',
            paragraphs: [
              'Đức vẫn chạy xe, vẫn bị trừ chiết khấu, vẫn là "đối tác" trong hợp đồng.',
              'Anh có thêm một bảng tính cập nhật mỗi tháng, một khoản bảo hiểm trừ ngay khi tiền về ví, và một thói quen bấm hai lần vào màn hình chi tiết giao dịch.',
              'Có người trong nhóm hỏi anh làm mấy cái đó để làm gì, khi mà chẳng thay đổi được gì.',
              '"Ít nhất tui biết tui đang mất cái gì cho ai," Đức nói. "Hồi trước tui chỉ biết là tui bị trừ."',
            ],
          },
        ],
      },
    ],
  },
};
