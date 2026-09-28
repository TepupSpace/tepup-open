import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Hương × Riêng Tư 101 — "Chấm công bằng khuôn mặt".
 *
 * Hương là người duy nhất trong nhóm nhân vật đi làm công sở, nên câu chuyện của
 * cô đi vào loại dữ liệu mà bốn nhân vật kia không chạm tới: dữ liệu do người sử
 * dụng lao động thu thập, nơi việc "không đồng ý" có cái giá rất cụ thể.
 */
export const HUONG_RIENGTU: StorySeed = {
  slug: 'huong-riengtu',
  characterSlug: 'office-worker',
  title: 'Chấm công bằng khuôn mặt',
  teaser:
    'Công ty lắp máy chấm công nhận diện khuôn mặt và bảo mọi người đăng ký trong tuần. Hương là người duy nhất hỏi một câu: dữ liệu này ai giữ?',
  icon: 'scan-face',
  estimatedTime: '~30 phút',
  sortOrder: 1,
  courseSlugs: [COURSE.riengtu],
  part: {
    name: 'Dữ liệu của Hương ở nơi làm việc',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'may-cham-cong-moi',
        title: 'Máy chấm công mới',
        blocks: [
          {
            type: 'text',
            title: 'Sáng thứ Hai',
            paragraphs: [
              'Sáng thứ Hai, cạnh cửa ra vào tầng bốn xuất hiện một cái máy mới: màn hình đen, một con mắt camera tròn, đèn xanh nhấp nháy.',
              'Cái máy quẹt thẻ cũ đã bị tháo đi. Trên tường dán một tờ A4 in đậm.',
              'Hương đứng đọc tờ giấy trong lúc mọi người lần lượt đi qua.',
            ],
          },
          {
            type: 'callout',
            icon: 'clipboard',
            title: 'Thông báo dán trên tường',
            variant: 'info',
            text: 'Từ ngày 15 tháng này, công ty áp dụng hệ thống chấm công nhận diện khuôn mặt. Đề nghị toàn thể cán bộ nhân viên đăng ký khuôn mặt tại phòng Hành chính trước thứ Sáu. Hệ thống giúp chấm công chính xác, chống chấm công hộ và tiết kiệm thời gian.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, dữ liệu khuôn mặt khác gì so với mã số thẻ nhân viên cũ mà công ty vẫn dùng để chấm công?',
            options: [
              { id: 'a', text: 'Không khác gì — cả hai đều chỉ dùng để nhận ra ai là ai', isCorrect: false },
              { id: 'b', text: 'Khuôn mặt chính xác hơn nên an toàn hơn', isCorrect: false },
              { id: 'c', text: 'Thẻ mất thì đổi thẻ khác được, còn khuôn mặt lộ rồi thì không đổi được', isCorrect: true },
              { id: 'd', text: 'Khuôn mặt không phải là dữ liệu cá nhân vì ai nhìn cũng thấy', isCorrect: false },
            ],
            explanation:
              'Đây là điểm mấu chốt của mọi dữ liệu sinh trắc học. Mật khẩu lộ thì đổi mật khẩu. Thẻ mất thì huỷ thẻ, làm thẻ mới. Nhưng khuôn mặt, vân tay, giọng nói và mống mắt thì gắn với cơ thể bạn suốt đời — lộ một lần là lộ vĩnh viễn, không có cơ chế nào để "đặt lại".',
          },
          {
            type: 'text',
            title: 'Hương hỏi một câu',
            paragraphs: [
              'Chiều hôm đó Hương xuống phòng Hành chính đăng ký. Chị Loan đưa cô đứng trước máy, bấm vài nút, máy chụp ba kiểu: chính diện, nghiêng trái, nghiêng phải.',
              '"Xong rồi em," chị Loan nói.',
              'Hương hỏi: "Chị ơi, cái ảnh này lưu ở đâu ạ?"',
              'Chị Loan ngẩng lên, hơi bất ngờ: "Chắc trong máy. Chị cũng không rõ, bên cung cấp phần mềm họ lắp."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu trả lời "chị cũng không rõ" không phải là chị Loan tắc trách. Đó là câu trả lời trung thực nhất mà một người phụ trách hành chính có thể đưa ra.',
              'Hệ thống do một nhà cung cấp bên ngoài lắp đặt. Dữ liệu có thể nằm trong chiếc máy treo tường, có thể nằm trên máy chủ của công ty, cũng có thể nằm trên đám mây của nhà cung cấp — đặt ở đâu thì không ai trong công ty biết chắc.',
              'Và cũng không ai đặt câu hỏi đó trước khi ký hợp đồng mua thiết bị.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Dữ liệu sinh trắc học',
            variant: 'info',
            text: 'Là dữ liệu về đặc điểm cơ thể hoặc hành vi dùng để nhận dạng một người: khuôn mặt, vân tay, mống mắt, giọng nói, dáng đi. Pháp luật Việt Nam xếp đây vào nhóm dữ liệu cá nhân nhạy cảm, đòi hỏi mức bảo vệ cao hơn và sự đồng ý rõ ràng hơn so với dữ liệu thông thường.',
          },
          {
            type: 'question',
            question: 'Vì sao dữ liệu sinh trắc học được xếp vào nhóm "nhạy cảm" và được bảo vệ ở mức cao hơn?',
            options: [
              { id: 'a', text: 'Vì nó tốn nhiều dung lượng lưu trữ hơn', isCorrect: false },
              { id: 'b', text: 'Vì nó không thể thay đổi và cho phép nhận dạng một người ở bất cứ đâu, kể cả khi họ không biết', isCorrect: true },
              { id: 'c', text: 'Vì chỉ cơ quan nhà nước mới được phép thu thập', isCorrect: false },
              { id: 'd', text: 'Vì nó chỉ chính xác trong một số trường hợp', isCorrect: false },
            ],
            explanation:
              'Hai đặc tính khiến sinh trắc học nguy hiểm khi bị lạm dụng: không thể thay thế, và nhận dạng được từ xa mà không cần sự hợp tác của người bị nhận dạng. Bạn phải chìa thẻ ra thì thẻ mới hoạt động, nhưng khuôn mặt bạn thì luôn ở đó — một camera có thể nhận ra bạn giữa đám đông mà bạn không hề hay biết.',
          },
          {
            type: 'text',
            title: 'Bốn câu hỏi Hương ghi vào sổ',
            paragraphs: [
              'Tối đó, Hương ghi vào sổ tay bốn câu hỏi mà cô nghĩ đáng lẽ phải có câu trả lời trước khi ai đó đứng trước cái máy:',
              '📍 Dữ liệu khuôn mặt được lưu ở đâu — trong thiết bị, trên máy chủ công ty, hay trên đám mây của nhà cung cấp?',
              '⏳ Giữ trong bao lâu, và khi nhân viên nghỉ việc thì có xoá không?',
              '👥 Ai được quyền xem, và có nhật ký ghi lại việc truy cập không?',
              '🚪 Nếu một nhân viên không muốn đăng ký khuôn mặt thì có phương án thay thế nào không?',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu thứ tư là câu Hương thấy quan trọng nhất, và cũng là câu khó hỏi nhất.',
              'Vì nếu không có phương án thay thế, thì cái gọi là "đồng ý" ở đây không thực sự là đồng ý. Nó là điều kiện để được vào chỗ làm.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Trong quan hệ lao động, hai bên không ngang nhau. Người lao động cần công việc nhiều hơn công ty cần một cá nhân cụ thể.',
              'Khi bên yếu hơn được hỏi "em có đồng ý không" mà lựa chọn duy nhất còn lại là nghỉ việc, thì chữ ký của họ phản ánh áp lực chứ không phản ánh ý chí.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đồng ý dưới áp lực thì không phải là đồng ý',
            variant: 'warning',
            text: 'Sự đồng ý hợp lệ phải là tự nguyện, cụ thể và có hiểu biết. Nếu người ta không được cho biết dữ liệu đi đâu, không được chọn cách khác, và từ chối thì mất việc — thì ba điều kiện ấy đều không đạt. Đây là lý do quan hệ lao động luôn được coi là bối cảnh nhạy cảm khi bàn về dữ liệu cá nhân.',
          },
          {
            type: 'question',
            question: 'Điều kiện nào sau đây KHÔNG cần thiết để một sự đồng ý về dữ liệu cá nhân được coi là hợp lệ?',
            options: [
              { id: 'a', text: 'Người đồng ý được biết dữ liệu dùng vào mục đích gì', isCorrect: false },
              { id: 'b', text: 'Người đồng ý có thể từ chối mà không chịu hậu quả bất lợi', isCorrect: false },
              { id: 'c', text: 'Sự đồng ý được ký trước mặt công chứng viên', isCorrect: true },
              { id: 'd', text: 'Sự đồng ý cho một mục đích cụ thể, không phải một lời cho phép chung chung', isCorrect: false },
            ],
            explanation:
              'Không có yêu cầu công chứng. Ba điều kiện thực chất là: có hiểu biết (biết rõ mục đích), tự nguyện (từ chối được mà không bị thiệt), và cụ thể (cho từng mục đích, chứ không phải một chữ ký cho phép làm mọi thứ về sau). Một bản cam kết chung chung ký lúc nhận việc không thoả mãn điều kiện thứ ba.',
          },
          {
            type: 'perspective-switch',
            title: 'Cùng một cái máy, ba cách nhìn',
            event: 'Công ty lắp máy chấm công nhận diện khuôn mặt và yêu cầu toàn bộ nhân viên đăng ký trong một tuần.',
            perspectives: [
              {
                id: 'p1',
                role: 'Hương — nhân viên',
                icon: 'user',
                narrative:
                  'Tôi giao một thứ không bao giờ đổi được, cho một hệ thống tôi không biết đặt ở đâu, do một công ty tôi chưa từng nghe tên vận hành. Nếu tôi từ chối, tôi không biết chuyện gì xảy ra với công việc của mình. Tôi không được hỏi trước khi công ty ký hợp đồng.',
              },
              {
                id: 'p2',
                role: 'Phòng Hành chính',
                icon: 'briefcase',
                narrative:
                  'Mỗi tháng tôi mất ba ngày đối chiếu bảng chấm công vì chuyện quẹt thẻ hộ. Máy mới giải quyết đúng vấn đề đó. Tôi không nghĩ tới chuyện dữ liệu lưu ở đâu, vì bên bán bảo là bảo mật và tôi tin thế. Nếu ai hỏi tôi, tôi cũng không biết trả lời sao.',
              },
              {
                id: 'p3',
                role: 'Nhà cung cấp phần mềm',
                icon: 'server',
                narrative:
                  'Chúng tôi bán giải pháp cho hàng trăm doanh nghiệp. Dữ liệu khuôn mặt của tất cả nhân viên các công ty ấy nằm trên cùng hệ thống của chúng tôi. Hợp đồng chỉ ký với công ty, không ký với từng nhân viên — nên nghĩa vụ giải thích cho họ không thuộc về chúng tôi.',
              },
            ],
            question: {
              text: 'Nhìn từ cả ba phía, lỗ hổng lớn nhất nằm ở đâu?',
              options: [
                { id: 'a', text: 'Ở chỗ máy nhận diện chưa đủ chính xác', isCorrect: false },
                { id: 'b', text: 'Ở chỗ người bị thu thập dữ liệu là bên duy nhất không có mặt trong bất kỳ thoả thuận nào', isCorrect: true },
                { id: 'c', text: 'Ở chỗ phòng Hành chính lười đối chiếu bảng công', isCorrect: false },
                { id: 'd', text: 'Ở chỗ công ty trả tiền quá ít cho nhà cung cấp', isCorrect: false },
              ],
              explanation:
                'Hợp đồng ký giữa công ty và nhà cung cấp. Nhân viên — người mà dữ liệu thuộc về — không phải một bên trong thoả thuận đó, không được đọc điều khoản, không được thương lượng. Họ chỉ nhận thông báo sau khi mọi thứ đã xong. Đây là hình dạng phổ biến nhất của rủi ro dữ liệu ở nơi làm việc.',
            },
          },
          {
            type: 'text',
            title: 'Hương gửi email',
            paragraphs: [
              'Hương không làm ầm lên. Cô làm đúng thứ một người kế toán quen làm: viết ra giấy trắng mực đen.',
              'Cô gửi một email cho phòng Hành chính, cc trưởng phòng của mình, với bốn câu hỏi trong sổ tay, viết lịch sự và ngắn gọn. Cô nói rõ mình không phản đối hệ thống, chỉ đề nghị được biết.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ba ngày sau có thư trả lời. Không đủ cả bốn câu, nhưng có hai điều mới:',
              'Thứ nhất, dữ liệu được lưu trên máy chủ của nhà cung cấp, không nằm trong công ty.',
              'Thứ hai — và điều này khiến Hương thấy việc gửi email là đáng — công ty sẽ bổ sung điều khoản xoá dữ liệu khi nhân viên nghỉ việc vào phụ lục hợp đồng với nhà cung cấp, vì "trước đây chưa có mục này".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Không ai trong công ty từng hỏi, nên điều khoản ấy không tồn tại.',
              'Một câu hỏi được đặt ra đúng chỗ đã tạo ra một dòng trong hợp đồng, áp dụng cho cả hai trăm nhân viên chứ không riêng gì Hương.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Câu hỏi là công cụ mạnh hơn người ta tưởng',
            variant: 'info',
            text: 'Phần lớn lỗ hổng dữ liệu ở doanh nghiệp không đến từ ý đồ xấu, mà đến từ việc chưa ai nghĩ tới. Một câu hỏi viết bằng văn bản, gửi đúng nơi, buộc tổ chức phải trả lời — và bản thân việc phải trả lời đã khiến họ đi tìm câu trả lời mà trước đó họ không có.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Dữ liệu sinh trắc học ở nơi làm việc',
            description: 'Những gì nên biết trước khi đưa khuôn mặt hoặc vân tay của mình vào một hệ thống của công ty.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao sinh trắc học là loại dữ liệu đặc biệt',
                  paragraphs: [
                    'Không thể đặt lại: mật khẩu lộ thì đổi, thẻ mất thì huỷ, nhưng khuôn mặt và vân tay thì gắn với bạn suốt đời.',
                    'Nhận dạng từ xa: camera có thể nhận ra bạn mà không cần bạn hợp tác, thậm chí không cần bạn biết.',
                    'Ghép được với mọi hồ sơ khác: một khi khuôn mặt đã gắn với tên bạn ở một nơi, nó có thể dùng để tìm bạn ở những nơi khác.',
                  ],
                },
                {
                  heading: 'Bốn câu nên hỏi',
                  paragraphs: [
                    'Dữ liệu lưu ở đâu: trong thiết bị, trên máy chủ nội bộ, hay trên hệ thống của nhà cung cấp bên ngoài.',
                    'Giữ trong bao lâu và có xoá khi nghỉ việc không — nếu chưa có điều khoản này thì đề nghị bổ sung.',
                    'Ai được quyền truy cập và có nhật ký truy cập không.',
                    'Có phương án thay thế cho người không muốn đăng ký sinh trắc học không.',
                  ],
                },
                {
                  heading: 'Cách đặt vấn đề cho hiệu quả',
                  paragraphs: [
                    'Hỏi bằng văn bản, không hỏi miệng — văn bản buộc phải có hồi đáp và để lại dấu vết.',
                    'Đặt vấn đề ở góc quản trị rủi ro của công ty, không ở góc đối đầu: nếu dữ liệu rò rỉ thì trách nhiệm thuộc về ai.',
                    'Nếu nhiều người cùng quan tâm, gửi chung một kiến nghị sẽ có sức nặng hơn một cá nhân đơn lẻ.',
                  ],
                },
              ],
              relatedConcepts: ['Dữ liệu nhạy cảm', 'Sự đồng ý tự nguyện', 'Bất đối xứng quyền lực trong quan hệ lao động'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — dữ liệu cá nhân nhạy cảm và điều kiện xử lý',
                'Bộ luật Lao động 2019 — nghĩa vụ của người sử dụng lao động khi thu thập thông tin người lao động',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Dữ liệu sinh trắc học không thể đặt lại — lộ một lần là lộ vĩnh viễn, khác hẳn mật khẩu hay thẻ từ.\n' +
              '✓ Sự đồng ý chỉ hợp lệ khi có hiểu biết, tự nguyện và cụ thể; đồng ý để giữ việc làm thì không đạt cả ba.\n' +
              '✓ Người bị thu thập dữ liệu thường là bên duy nhất không có mặt trong hợp đồng quyết định số phận dữ liệu đó.\n' +
              '✓ Một câu hỏi bằng văn bản gửi đúng nơi có thể tạo ra thay đổi áp dụng cho tất cả mọi người.',
          },
          {
            type: 'text',
            title: 'Nhưng câu chuyện chưa dừng ở đó',
            paragraphs: [
              'Hương khá hài lòng. Cô nghĩ mình vừa xử lý xong chuyện dữ liệu của mình ở công ty.',
              'Rồi ba tuần sau, điện thoại cô đổ chuông vào giờ nghỉ trưa. Một giọng nữ rất lịch sự, gọi đúng tên cô, và nói ra một con số khiến cô lạnh sống lưng.',
              'Đó là con số mà lẽ ra chỉ có cô, phòng nhân sự và ngân hàng biết.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'cuoc-goi-biet-ro-luong',
        title: 'Cuộc gọi biết rõ lương của tôi',
        blocks: [
          {
            type: 'text',
            title: 'Mười hai giờ trưa',
            paragraphs: [
              'Điện thoại Hương rung lên khi cô đang ăn cơm hộp ở bàn làm việc. Số lạ, đầu số cố định.',
              '"Dạ em chào chị Hương ạ. Bên em là công ty tài chính, đang có gói vay tín chấp dành cho khách hàng có thu nhập ổn định. Với mức lương mười lăm triệu của chị, chị được duyệt trước hạn mức chín mươi triệu ạ."',
              'Hương buông đũa xuống.',
            ],
          },
          {
            type: 'callout',
            icon: 'phone',
            title: 'Ba thứ người gọi biết mà không cần hỏi',
            variant: 'info',
            text: 'Họ tên đầy đủ của Hương. Mức lương chính xác. Và việc cô đang có hợp đồng lao động dài hạn — điều kiện để được duyệt vay tín chấp.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, khả năng cao nhất là công ty tài chính kia có được mức lương của Hương bằng cách nào?',
            options: [
              { id: 'a', text: 'Họ xâm nhập vào hệ thống của công ty nơi Hương làm việc', isCorrect: false },
              { id: 'b', text: 'Họ mua danh sách khách hàng tiềm năng có sẵn thông tin thu nhập', isCorrect: true },
              { id: 'c', text: 'Họ đoán dựa trên độ tuổi và nghề nghiệp', isCorrect: false },
              { id: 'd', text: 'Ngân hàng nhà nước công bố công khai thu nhập của người dân', isCorrect: false },
            ],
            explanation:
              'Xâm nhập hệ thống là việc khó, tốn kém và phạm pháp rõ ràng. Mua một danh sách thì rẻ, nhanh và nằm trong vùng xám. Thị trường mua bán danh sách khách hàng tiềm năng ở Việt Nam hoạt động khá công khai, với hàng nghìn hồ sơ được rao bán theo lô, phân loại sẵn theo thu nhập, nghề nghiệp và khu vực sinh sống.',
          },
          {
            type: 'text',
            title: 'Hương truy ngược',
            paragraphs: [
              'Là kế toán, phản xạ của Hương khi gặp một con số sai chỗ là đi tìm nguồn.',
              'Cô ngồi liệt kê ra tất cả những nơi từng biết chính xác mức lương của mình. Danh sách ngắn hơn cô tưởng, nhưng cũng dài hơn cô muốn:',
              '🏢 Phòng nhân sự công ty',
              '🏦 Ngân hàng trả lương',
              '📄 Hồ sơ vay mua xe cô nộp năm ngoái, có kèm bảng lương ba tháng',
              '🏠 Hồ sơ thuê căn hộ, chủ nhà yêu cầu chứng minh thu nhập',
              '📱 Một ứng dụng quản lý chi tiêu cô từng nhập lương vào để theo dõi',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Năm nơi. Hương chỉ có quan hệ trực tiếp với năm tổ chức này.',
              'Nhưng mỗi tổ chức trong đó lại có đối tác của riêng họ: công ty nhân sự thuê ngoài, đơn vị thẩm định hồ sơ vay, môi giới bất động sản, nhà cung cấp máy chủ cho ứng dụng.',
              'Một mẩu dữ liệu đi từ tay cô ra ngoài, rồi nhân lên qua từng lớp mà cô không nhìn thấy.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Chuỗi cung ứng dữ liệu',
            variant: 'info',
            text: 'Khi bạn đưa dữ liệu cho một tổ chức, bạn thường không chỉ đưa cho tổ chức đó. Nó đi tiếp tới các bên xử lý thuê, các nhà cung cấp hạ tầng, các đối tác nghiệp vụ. Mỗi mắt xích thêm vào là một chỗ có thể rò rỉ, và bạn thường chỉ có thoả thuận với mắt xích đầu tiên.',
          },
          {
            type: 'question',
            question: 'Vì sao dữ liệu càng đi qua nhiều bên thì rủi ro càng tăng nhanh?',
            options: [
              { id: 'a', text: 'Vì dữ liệu bị sai lệch dần qua mỗi lần sao chép', isCorrect: false },
              { id: 'b', text: 'Vì mỗi bên là một điểm có thể rò rỉ, và mức bảo vệ chỉ mạnh bằng mắt xích yếu nhất', isCorrect: true },
              { id: 'c', text: 'Vì chi phí lưu trữ tăng lên', isCorrect: false },
              { id: 'd', text: 'Vì luật cấm chia sẻ dữ liệu quá ba lần', isCorrect: false },
            ],
            explanation:
              'An toàn của cả chuỗi bằng đúng mức an toàn của mắt xích yếu nhất. Ngân hàng có thể bảo vệ dữ liệu rất tốt, nhưng nếu một đơn vị thẩm định hồ sơ thuê ngoài lưu bảng lương trong một thư mục chia sẻ không đặt mật khẩu, thì công sức của ngân hàng không cứu được gì. Càng nhiều mắt xích, xác suất có một mắt xích yếu càng cao.',
          },
          {
            type: 'text',
            title: 'Cô hỏi thẳng người gọi',
            paragraphs: [
              'Lần sau có cuộc gọi tương tự, Hương không cúp máy ngay. Cô hỏi một câu, giọng bình thản:',
              '"Cho chị hỏi, bên em lấy thông tin của chị từ nguồn nào ạ? Theo quy định thì chị có quyền được biết."',
              'Đầu dây bên kia im lặng khoảng hai giây, rồi: "Dạ em cũng không rõ, em chỉ nhận danh sách từ bên trên thôi ạ." Rồi cúp máy.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu trả lời ấy nói lên khá nhiều điều.',
              'Người gọi điện là lao động ở tầng thấp nhất của chuỗi, được giao một danh sách và một kịch bản. Họ không biết dữ liệu đến từ đâu, và cấu trúc công việc được thiết kế để họ không cần biết.',
              'Câu hỏi của Hương không làm phiền được ai. Nhưng nó khiến cuộc gọi kết thúc, và nó cho cô biết mình đang đứng trước một hệ thống chứ không phải một cá nhân.',
            ],
          },
          {
            type: 'text',
            title: 'Thứ Hương làm được và không làm được',
            paragraphs: [
              'Hương chấp nhận một sự thật khó chịu: cô không tìm ra được nơi đã bán dữ liệu của mình. Không có công cụ nào cho phép một cá nhân truy ngược điều đó.',
              'Nhưng cô làm được ba việc, và cô làm cả ba.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '1️⃣ Cô chặn số và báo cáo tin nhắn rác, để giảm tần suất bị làm phiền.',
              '2️⃣ Cô đăng ký một số điện thoại phụ, và từ đó trở đi mọi biểu mẫu không bắt buộc — thẻ tích điểm, đăng ký khuyến mãi, form tư vấn — đều điền số phụ.',
              '3️⃣ Cô gỡ ứng dụng quản lý chi tiêu mà cô từng nhập lương vào, sau khi đọc chính sách của nó và thấy có câu "chia sẻ với đối tác để cải thiện dịch vụ".',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Số điện thoại phụ không phải là mẹo vặt',
            variant: 'warning',
            text: 'Nó là cách tách danh tính. Số chính dùng cho ngân hàng, cơ quan nhà nước, công ty và người thân — những nơi bạn buộc phải nhận liên lạc. Số phụ dùng cho mọi thứ còn lại. Khi số phụ bắt đầu bị làm phiền, bạn biết dữ liệu đã rò từ nhóm nào, và bạn bỏ số phụ được mà không mất gì.',
          },
          {
            type: 'question',
            question: 'Lợi ích lớn nhất của việc tách số điện thoại chính và phụ là gì?',
            options: [
              { id: 'a', text: 'Tiết kiệm cước gọi', isCorrect: false },
              { id: 'b', text: 'Giữ cho định danh khoá quan trọng nhất của bạn không lan ra các nguồn dễ rò rỉ, và thay bỏ được khi cần', isCorrect: true },
              { id: 'c', text: 'Giúp bạn ẩn danh hoàn toàn trước mọi tổ chức', isCorrect: false },
              { id: 'd', text: 'Giúp tăng tốc độ mạng di động', isCorrect: false },
            ],
            explanation:
              'Số điện thoại là định danh khoá — thứ ghép các hồ sơ rời rạc về bạn lại với nhau. Nếu số chính chỉ xuất hiện ở vài nơi đáng tin, thì các hồ sơ mua bán ngoài thị trường khó nối vào bạn hơn. Và nếu số phụ bị rò, bạn bỏ nó đi mà không phải thông báo cho ngân hàng hay cơ quan nào.',
          },
          {
            type: 'text',
            title: 'Không phải mẩu dữ liệu nào cũng như nhau',
            paragraphs: [
              'Hương xếp lại năm nguồn trong danh sách của mình theo mức độ thiệt hại nếu bị lộ, và cô thấy chúng không hề ngang nhau.',
              'Số điện thoại bị lộ thì cô bị làm phiền. Mức lương bị lộ thì cô nhận được những lời chào mời nhắm đúng khả năng chi trả. Nhưng địa chỉ nhà bị lộ thì rủi ro chuyển từ trên mạng ra ngoài đời — và đó là loại rủi ro khác hẳn về bản chất.',
              'Cô gạch chân dòng địa chỉ trong sổ. Đó là thứ cô sẽ cẩn thận nhất từ nay về sau.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao nên phân loại dữ liệu cá nhân theo mức thiệt hại thay vì bảo vệ tất cả như nhau?',
            options: [
              { id: 'a', text: 'Vì bảo vệ dữ liệu nào cũng tốn kém như nhau', isCorrect: false },
              { id: 'b', text: 'Vì công sức có hạn, nên nên dồn vào những dữ liệu mà hậu quả khi lộ là nặng và không đảo ngược được', isCorrect: true },
              { id: 'c', text: 'Vì pháp luật chỉ bảo vệ một số loại dữ liệu', isCorrect: false },
              { id: 'd', text: 'Vì dữ liệu ít quan trọng thì không bao giờ bị lộ', isCorrect: false },
            ],
            explanation:
              'Bảo vệ mọi thứ ngang nhau nghĩa là bảo vệ mọi thứ hời hợt như nhau. Xếp hạng theo hậu quả giúp bạn biết chỗ nào đáng bỏ công: dữ liệu không đổi được như khuôn mặt và vân tay, dữ liệu dẫn tới rủi ro ngoài đời thực như địa chỉ, và định danh khoá như số điện thoại — ba nhóm này đáng được ưu tiên hơn hẳn phần còn lại.',
          },
          {
            type: 'text',
            title: 'Vì sao chuyện này không tự hết',
            paragraphs: [
              'Hương thắc mắc: nếu việc mua bán dữ liệu cá nhân là vi phạm, tại sao nó vẫn diễn ra rầm rộ?',
              'Câu trả lời nằm ở khoảng cách giữa quy định và thực thi.',
              'Quy định thì đã có: Nghị định 13/2023 cấm mua bán dữ liệu cá nhân, buộc phải có sự đồng ý và phải nêu rõ mục đích. Nhưng để xử lý một vụ, cần xác định được ai đã bán, bán cho ai, và chứng minh được đường đi của dữ liệu — trong khi chính người bị hại cũng không truy ra nổi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Thêm một lý do nữa, và đây là lý do khiến Hương suy nghĩ lâu nhất: phần lớn dữ liệu bị bán không phải bị đánh cắp.',
              'Chúng được thu thập hợp pháp, với một chữ ký đồng ý mà người ký không đọc, cho một mục đích ghi mờ nhạt trong điều khoản dài mười trang.',
              'Ranh giới giữa "chia sẻ với đối tác theo điều khoản đã đồng ý" và "bán dữ liệu" mỏng hơn nhiều so với những gì người ta tưởng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Vấn đề nằm ở đầu vào, không chỉ ở kẻ xấu',
            variant: 'info',
            text: 'Nếu một hệ thống chỉ thu thập đúng dữ liệu nó cần và xoá khi hết nhu cầu, thì dù bị tấn công cũng không có gì nhiều để mất. Rủi ro lớn nhất không phải là kẻ trộm giỏi, mà là kho dữ liệu quá đầy trong khi không ai nhớ vì sao lại giữ chúng.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Khi ai đó gọi và biết rõ về bạn',
            description: 'Cách hiểu và xử lý các cuộc gọi tiếp thị nắm sẵn thông tin cá nhân.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Dữ liệu của bạn đến tay họ bằng đường nào',
                  paragraphs: [
                    'Danh sách được mua bán theo lô, phân loại sẵn theo thu nhập, nghề nghiệp, khu vực và nhu cầu dự đoán.',
                    'Nguồn thường là các tổ chức từng thu thập hợp pháp — nơi bạn nộp hồ sơ vay, đăng ký dịch vụ, tham gia chương trình tích điểm — rồi dữ liệu đi tiếp qua các đối tác của họ.',
                    'Một phần đến từ các vụ rò rỉ dữ liệu cũ, vẫn được sử dụng lại nhiều năm sau vì số điện thoại và ngày sinh gần như không đổi.',
                  ],
                },
                {
                  heading: 'Nên làm gì khi nhận cuộc gọi như vậy',
                  paragraphs: [
                    'Không xác nhận thêm bất kỳ thông tin nào, kể cả xác nhận rằng thông tin họ đọc là đúng. Mỗi lời xác nhận làm hồ sơ về bạn có giá hơn.',
                    'Hỏi nguồn dữ liệu — bạn có quyền được biết. Câu trả lời (hoặc việc không có câu trả lời) cho bạn biết mình đang nói chuyện với ai.',
                    'Chặn số và báo cáo. Với các cuộc gọi mạo danh cơ quan chức năng, báo cho công an địa phương.',
                  ],
                },
                {
                  heading: 'Giảm rủi ro về lâu dài',
                  paragraphs: [
                    'Tách số điện thoại và email chính khỏi các biểu mẫu không bắt buộc.',
                    'Trước khi điền, hỏi: chỗ này cần thông tin này để làm gì, và không điền thì có bị chặn không.',
                    'Rà lại các ứng dụng và dịch vụ bạn từng khai báo thu nhập, và gỡ những cái không còn dùng.',
                  ],
                },
              ],
              relatedConcepts: ['Môi giới dữ liệu', 'Chuỗi cung ứng dữ liệu', 'Tách danh tính'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — nghiêm cấm mua bán dữ liệu cá nhân',
                'Nghị định 91/2020/NĐ-CP về chống tin nhắn rác, thư điện tử rác, cuộc gọi rác',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Người gọi biết lương của bạn thường không phải do xâm nhập, mà do mua danh sách — rẻ hơn và dễ hơn nhiều.\n' +
              '✓ Dữ liệu đi qua chuỗi nhiều bên, và mức bảo vệ chỉ mạnh bằng mắt xích yếu nhất trong chuỗi đó.\n' +
              '✓ Phần lớn dữ liệu bị bán không bị đánh cắp — chúng được thu thập hợp pháp với một chữ ký không ai đọc.\n' +
              '✓ Tách số chính và số phụ là cách giữ cho định danh khoá của bạn không lan ra các nguồn dễ rò rỉ.',
          },
          {
            type: 'text',
            title: 'Và ở ngay chỗ cô ngồi tám tiếng mỗi ngày',
            paragraphs: [
              'Hương xử lý xong chuyện cuộc gọi. Nhưng câu chuyện đưa cô tới một câu hỏi cô chưa từng đặt ra.',
              'Cô vừa dành hai tuần lo về dữ liệu bị bán ra ngoài. Còn dữ liệu về cô được tạo ra ngay tại chỗ làm — mỗi email cô gửi, mỗi lần cô ra vào, mỗi giờ cô ngồi trước máy tính — thì ai đang giữ, và họ được phép xem tới đâu?',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'ai-dang-nhin-man-hinh-cua-toi',
        title: 'Ai đang nhìn màn hình của tôi?',
        blocks: [
          {
            type: 'text',
            title: 'Một dòng trong biên bản họp',
            paragraphs: [
              'Cuối quý, công ty họp tổng kết. Trong phần trình bày của phòng Nhân sự có một biểu đồ mà Hương nhìn khá lâu.',
              'Biểu đồ tên là "Tỷ lệ thời gian sử dụng ứng dụng công việc theo phòng ban", chia theo từng tuần.',
              'Hương chưa từng được thông báo rằng có ai đó đang đo cái đó.',
            ],
          },
          {
            type: 'callout',
            icon: 'monitor',
            title: 'Những gì máy tính công ty ghi lại được',
            variant: 'info',
            text: 'Thời điểm bật và tắt máy. Ứng dụng nào được mở, trong bao lâu. Trang web nào được truy cập qua mạng công ty. Email gửi và nhận trên hộp thư công ty. Tệp tin nào được sao chép ra thiết bị ngoài. Với một số phần mềm quản lý, còn có cả ảnh chụp màn hình định kỳ.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, công ty có quyền xem nội dung email trong hộp thư công ty mà nhân viên dùng để gửi việc riêng không?',
            options: [
              { id: 'a', text: 'Không bao giờ — thư từ là bí mật cá nhân tuyệt đối', isCorrect: false },
              { id: 'b', text: 'Có, vô điều kiện, vì đó là tài sản của công ty', isCorrect: false },
              { id: 'c', text: 'Có thể, nhưng phải có mục đích chính đáng, được thông báo trước và giới hạn ở mức cần thiết', isCorrect: true },
              { id: 'd', text: 'Chỉ khi có lệnh của toà án', isCorrect: false },
            ],
            explanation:
              'Đây là vùng cân bằng chứ không phải trắng đen. Công ty có lợi ích chính đáng trong việc bảo vệ tài sản, dữ liệu khách hàng và tuân thủ pháp luật — nên việc giám sát công cụ làm việc không đương nhiên là sai. Nhưng giám sát phải có mục đích rõ ràng, được báo trước, và không vượt quá mức cần thiết. Đọc toàn bộ thư từ để "xem nhân viên nghĩ gì" thì vượt xa mức đó.',
          },
          {
            type: 'text',
            title: 'Ba nguyên tắc Hương tìm được',
            paragraphs: [
              'Hương tìm hiểu và thấy hầu hết các khung pháp lý về giám sát nơi làm việc đều xoay quanh ba nguyên tắc giống nhau:',
              '🎯 Mục đích chính đáng — giám sát để làm gì, và mục đích đó có thật không.',
              '📢 Minh bạch — người bị giám sát phải được biết trước là mình đang bị giám sát, bằng cách nào, và dữ liệu dùng vào việc gì.',
              '⚖️ Tương xứng — mức độ giám sát phải vừa đủ cho mục đích, không được rộng hơn.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nguyên tắc thứ ba là nguyên tắc hay bị bỏ qua nhất, và cũng dễ kiểm tra nhất.',
              'Ví dụ: để chống rò rỉ dữ liệu khách hàng, ghi lại việc sao chép tệp ra USB là tương xứng. Chụp màn hình máy nhân viên mười phút một lần trong suốt tám tiếng thì không — nó thu về rất nhiều thứ chẳng liên quan gì tới mục đích ban đầu.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Nguyên tắc tương xứng',
            variant: 'info',
            text: 'Một biện pháp can thiệp vào quyền riêng tư chỉ chấp nhận được khi không có cách nào ít xâm phạm hơn đạt được cùng mục đích. Câu hỏi kiểm tra rất đơn giản: có cách nào nhẹ tay hơn mà vẫn giải quyết được vấn đề không? Nếu có, thì biện pháp nặng tay hơn là quá mức.',
          },
          {
            type: 'question',
            question: 'Cách kiểm tra nhanh xem một biện pháp giám sát có tương xứng hay không là gì?',
            options: [
              { id: 'a', text: 'Xem biện pháp đó có tốn kém không', isCorrect: false },
              { id: 'b', text: 'Hỏi xem có cách nào ít xâm phạm hơn mà vẫn đạt được cùng mục đích không', isCorrect: true },
              { id: 'c', text: 'Xem có bao nhiêu nhân viên phản đối', isCorrect: false },
              { id: 'd', text: 'Xem công ty khác có làm như vậy không', isCorrect: false },
            ],
            explanation:
              'Câu hỏi "có cách nhẹ hơn không" là bài kiểm tra chuẩn của nguyên tắc tương xứng. Việc công ty khác cũng làm không chứng minh được gì — thực tiễn phổ biến không đồng nghĩa với thực tiễn hợp lệ. Chi phí cũng không liên quan: một biện pháp rẻ vẫn có thể quá mức.',
          },
          {
            type: 'text',
            title: 'Khi số liệu giám sát đổi nghĩa',
            paragraphs: [
              'Có một chuyện Hương chứng kiến ở phòng bên cạnh, và nó khiến cô suy nghĩ nhiều hơn cả chuyện email.',
              'Một bạn nhân viên bị nhắc nhở vì "tỷ lệ thời gian sử dụng ứng dụng công việc thấp hơn mặt bằng". Bạn ấy làm mảng thiết kế, phần lớn thời gian ngồi phác thảo trên giấy trước khi dựng file.',
              'Con số thì đúng. Kết luận rút ra từ con số thì sai.',
            ],
          },
          {
            type: 'question',
            question: 'Rủi ro lớn nhất của việc đo lường năng suất bằng dữ liệu giám sát là gì?',
            options: [
              { id: 'a', text: 'Dữ liệu thu về thường bị sai lệch kỹ thuật', isCorrect: false },
              { id: 'b', text: 'Thứ dễ đo được đem thay cho thứ thực sự quan trọng, và người ta bắt đầu tối ưu cho chỉ số thay vì cho công việc', isCorrect: true },
              { id: 'c', text: 'Việc đo lường làm chậm máy tính', isCorrect: false },
              { id: 'd', text: 'Nhân viên sẽ không biết mình đang bị đo', isCorrect: false },
            ],
            explanation:
              'Thời gian mở ứng dụng thì dễ đo; chất lượng công việc thì khó đo. Khi cái dễ đo được dùng thay cho cái quan trọng, hai chuyện xảy ra: người bị đánh giá sai vì công việc của họ không nằm trong phạm vi đo, và người khác học cách làm đẹp chỉ số thay vì làm tốt việc. Dữ liệu giám sát càng chi tiết thì cám dỗ dùng nó để chấm điểm con người càng lớn.',
          },
          {
            type: 'text',
            title: 'Chiếc điện thoại của chính mình',
            paragraphs: [
              'Có một chỗ Hương thấy mờ nhất, và cô đoán nhiều người cũng vậy: chiếc điện thoại cá nhân của cô có cài email công ty.',
              'Cô cài nó vì tiện — trả lời khách hàng ngoài giờ, xem lịch họp lúc đang trên đường.',
              'Nhưng để cài được, cô đã phải bấm đồng ý cho một hồ sơ quản lý thiết bị do công ty phát hành.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hồ sơ quản lý thiết bị cho phép bộ phận kỹ thuật của công ty làm những việc như: bắt buộc đặt mật khẩu màn hình, xem danh sách ứng dụng đã cài, và trong nhiều cấu hình là xoá từ xa dữ liệu công ty trên máy.',
              'Ở một số cấu hình mạnh tay hơn, lệnh xoá từ xa có thể xoá toàn bộ máy — bao gồm cả ảnh gia đình, tin nhắn và ghi chú cá nhân.',
              'Hương chưa bao giờ hỏi công ty mình đang dùng cấu hình nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là điểm rắc rối riêng của việc dùng thiết bị cá nhân cho công việc: ranh giới giữa "của tôi" và "của công ty" nằm trên cùng một cái máy.',
              'Khi hai thứ nằm chung một chỗ, thì mọi quyền kiểm soát mà công ty có với phần của họ đều có khả năng chạm tới phần của bạn.',
            ],
          },
          {
            type: 'sort-bucket',
            title: 'Cái nào của bạn, cái nào của công ty?',
            instruction:
              'Xếp từng thứ vào rổ đúng, theo cách mà pháp luật và thực tiễn quản trị thường phân định.',
            buckets: [
              { id: 'cty', label: 'Công ty có quyền quản lý' },
              { id: 'ca-nhan', label: 'Thuộc về cá nhân bạn' },
            ],
            items: [
              { id: 's1', text: 'Email gửi từ hộp thư công ty', bucketId: 'cty' },
              { id: 's2', text: 'Tệp dữ liệu khách hàng lưu trên máy công ty', bucketId: 'cty' },
              { id: 's3', text: 'Lịch sử ra vào toà nhà bằng thẻ nhân viên', bucketId: 'cty' },
              { id: 's4', text: 'Ảnh gia đình trong điện thoại cá nhân', bucketId: 'ca-nhan' },
              { id: 's5', text: 'Tin nhắn riêng với bạn bè trên máy cá nhân', bucketId: 'ca-nhan' },
              { id: 's6', text: 'Hồ sơ sức khoẻ bạn nộp cho công ty khi khám định kỳ', bucketId: 'ca-nhan' },
            ],
          },
          {
            type: 'text',
            title: 'Vì sao hồ sơ sức khoẻ lại thuộc về cá nhân?',
            paragraphs: [
              'Món cuối cùng trong danh sách là món khiến nhiều người xếp nhầm.',
              'Công ty tổ chức khám sức khoẻ định kỳ, công ty trả tiền, kết quả gửi về công ty — nghe thì giống dữ liệu của công ty.',
              'Nhưng dữ liệu sức khoẻ là dữ liệu cá nhân nhạy cảm. Công ty chỉ được biết phần cần cho mục đích cụ thể — thường là kết luận đủ hay không đủ điều kiện làm việc — chứ không được giữ và sử dụng toàn bộ chi tiết bệnh án của nhân viên.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Trả tiền cho việc thu thập không đồng nghĩa với sở hữu dữ liệu',
            variant: 'warning',
            text: 'Ai chi tiền cho cuộc khám không quyết định ai được đọc kết quả. Nguyên tắc chi phối là mục đích: dữ liệu chỉ được dùng đúng việc đã nêu khi thu thập. Đây cũng là lý do một công ty không được lấy dữ liệu chấm công để suy ra thói quen sinh hoạt của nhân viên, dù dữ liệu ấy nằm sẵn trong tay họ.',
          },
          {
            type: 'text',
            title: 'Hương tách hai thế giới',
            paragraphs: [
              'Hương không gỡ email công ty khỏi điện thoại — cô vẫn cần nó.',
              'Nhưng cô làm hai việc nhỏ.',
              'Cô hỏi bộ phận kỹ thuật một câu bằng email: lệnh xoá từ xa của công ty áp dụng cho toàn bộ máy hay chỉ cho phần dữ liệu công ty. Câu trả lời là "chỉ phần dữ liệu công ty" — và giờ cô có câu trả lời đó bằng văn bản.',
              'Việc thứ hai: cô chuyển toàn bộ trao đổi riêng tư sang một ứng dụng khác, không dùng chung với kênh công việc.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hai việc ấy không tốn tới một tiếng đồng hồ.',
              'Điều Hương nhận ra là phần lớn rủi ro trong chuyện dữ liệu nơi làm việc không đến từ việc công ty muốn làm hại nhân viên. Nó đến từ việc ranh giới không được vẽ ra, nên không ai biết mình đang đứng ở đâu.',
              'Vẽ ranh giới là việc mà cá nhân làm được, ngay cả khi không thay đổi được chính sách.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Giám sát nơi làm việc: ranh giới ở đâu',
            description: 'Ba nguyên tắc để đánh giá một biện pháp giám sát, và cách tự bảo vệ khi dùng thiết bị cá nhân cho công việc.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba nguyên tắc đánh giá',
                  paragraphs: [
                    'Mục đích chính đáng: giám sát phải phục vụ một nhu cầu thật của tổ chức, như bảo vệ dữ liệu khách hàng hay đảm bảo an toàn lao động.',
                    'Minh bạch: người bị giám sát phải được thông báo trước về việc gì đang được ghi lại, bằng công cụ nào và dùng để làm gì.',
                    'Tương xứng: nếu có cách ít xâm phạm hơn đạt được cùng mục đích, thì biện pháp nặng tay hơn là quá mức.',
                  ],
                },
                {
                  heading: 'Khi dùng thiết bị cá nhân cho công việc',
                  paragraphs: [
                    'Hỏi rõ hồ sơ quản lý thiết bị của công ty cho phép làm những gì, đặc biệt là lệnh xoá từ xa áp dụng cho toàn máy hay chỉ phần dữ liệu công việc. Xin câu trả lời bằng văn bản.',
                    'Tách kênh liên lạc: không dùng chung một ứng dụng cho cả việc riêng và việc công ty.',
                    'Cân nhắc dùng hồ sơ công việc riêng biệt trên máy nếu hệ điều hành hỗ trợ, để dữ liệu hai bên không nằm lẫn.',
                  ],
                },
                {
                  heading: 'Dữ liệu nhân sự cần lưu ý',
                  paragraphs: [
                    'Dữ liệu sức khoẻ là dữ liệu nhạy cảm: công ty chỉ được biết phần cần cho mục đích cụ thể, không được giữ toàn bộ chi tiết.',
                    'Dữ liệu chấm công chỉ được dùng cho mục đích chấm công, không được dùng để suy diễn về đời sống riêng của nhân viên.',
                    'Khi nghỉ việc, đề nghị công ty xoá dữ liệu sinh trắc học và các dữ liệu không còn cần thiết cho nghĩa vụ lưu trữ theo luật.',
                  ],
                },
              ],
              relatedConcepts: ['Nguyên tắc tương xứng', 'Giới hạn mục đích', 'Thiết bị cá nhân dùng cho công việc'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — nguyên tắc xử lý dữ liệu đúng mục đích và trong phạm vi cần thiết',
                'Bộ luật Lao động 2019 — bảo vệ thông tin cá nhân của người lao động',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Giám sát nơi làm việc không đương nhiên sai, nhưng phải có mục đích chính đáng, được báo trước và tương xứng.\n' +
              '✓ Bài kiểm tra tương xứng rất đơn giản: có cách nào ít xâm phạm hơn mà vẫn đạt mục đích không?\n' +
              '✓ Trả tiền cho việc thu thập không đồng nghĩa với sở hữu dữ liệu — dữ liệu sức khoẻ vẫn thuộc về cá nhân.\n' +
              '✓ Dùng thiết bị cá nhân cho công việc làm nhoè ranh giới; hỏi rõ quyền của công ty và tách kênh liên lạc.',
          },
          {
            type: 'text',
            title: 'Còn một chỗ khó hơn',
            paragraphs: [
              'Hương đã vẽ được ranh giới cho riêng mình.',
              'Nhưng còn tình huống mà cô sợ nhất vẫn chưa xảy ra: khi công ty yêu cầu một thứ mà cô thực sự không muốn đưa, và cô là người duy nhất muốn nói không.',
              'Nói không ở chỗ nào, và nói thế nào để không biến thành một cuộc đối đầu mà cô chắc chắn thua?',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'noi-khong-o-cho-nao',
        title: 'Nói không ở chỗ nào',
        blocks: [
          {
            type: 'text',
            title: 'Yêu cầu mới',
            paragraphs: [
              'Tháng Mười, công ty triển khai một ứng dụng nội bộ mới cho toàn bộ nhân viên kinh doanh và kế toán.',
              'Ứng dụng dùng để ghi nhận công việc ngoài văn phòng: đi gặp khách, đi ngân hàng, đi cơ quan thuế. Mỗi lần ra ngoài, nhân viên bấm bắt đầu và bấm kết thúc.',
              'Trong phần mô tả có một dòng: ứng dụng thu thập vị trí ở chế độ nền để đối chiếu.',
            ],
          },
          {
            type: 'callout',
            icon: 'map-pin',
            title: 'Chế độ nền nghĩa là gì',
            variant: 'info',
            text: 'Là ứng dụng ghi nhận vị trí ngay cả khi bạn không mở nó — bao gồm cả buổi tối, cuối tuần và ngày nghỉ, trừ khi bạn tự tay tắt quyền. Nó khác hẳn với việc ghi nhận vị trí tại đúng thời điểm bạn bấm nút bắt đầu và kết thúc.',
          },
          {
            type: 'question',
            question:
              'Nếu mục đích là xác nhận nhân viên có thực sự đi gặp khách hay không, thì cách thu thập nào là tương xứng?',
            options: [
              { id: 'a', text: 'Ghi nhận vị trí liên tục 24/7 để có dữ liệu đầy đủ nhất', isCorrect: false },
              { id: 'b', text: 'Ghi nhận vị trí tại đúng hai thời điểm bấm bắt đầu và kết thúc', isCorrect: true },
              { id: 'c', text: 'Ghi nhận vị trí trong toàn bộ giờ hành chính, kể cả khi ở văn phòng', isCorrect: false },
              { id: 'd', text: 'Không cần thu thập vị trí, chỉ cần nhân viên tự khai', isCorrect: false },
            ],
            explanation:
              'Mục đích là xác nhận một chuyến đi có diễn ra hay không. Hai điểm dữ liệu — lúc bắt đầu và lúc kết thúc — đủ để phục vụ mục đích đó. Mọi thứ nhiều hơn thế đều là dữ liệu thu về mà không dùng cho mục đích đã nêu, tức là vượt quá mức tương xứng. Phương án d thì ngược lại: không đạt được mục đích chính đáng của công ty.',
          },
          {
            type: 'text',
            title: 'Hương không phản đối cái ứng dụng',
            paragraphs: [
              'Điều quan trọng đầu tiên Hương xác định với chính mình: cô không phản đối việc công ty muốn xác nhận các chuyến đi công tác. Đó là nhu cầu hợp lý.',
              'Cô phản đối đúng một chi tiết: chế độ nền.',
              'Phân biệt được hai thứ đó là cả sự khác nhau giữa một góp ý được lắng nghe và một lời phàn nàn bị gạt đi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Khi bạn phản đối toàn bộ một chính sách, người nghe phải chọn giữa bạn và chính sách — và họ gần như luôn chọn chính sách.',
              'Khi bạn chỉ ra đúng một chi tiết vượt mức và kèm theo một phương án thay thế đạt được cùng mục tiêu, bạn không còn là người cản trở. Bạn thành người giúp họ làm đúng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Thu hẹp phạm vi phản đối',
            variant: 'info',
            text: 'Đây là kỹ thuật hiệu quả nhất khi bạn ở thế yếu hơn: đồng ý với mục tiêu, chỉ tranh luận về phương tiện. "Em ủng hộ việc xác nhận chuyến đi, em chỉ đề nghị ghi nhận vị trí tại hai thời điểm thay vì chạy nền" là một câu rất khó bác bỏ, vì nó không đe doạ điều gì mà người ra quyết định thực sự cần.',
          },
          {
            type: 'question',
            question: 'Vì sao việc kèm theo một phương án thay thế lại làm tăng khả năng được chấp nhận?',
            options: [
              { id: 'a', text: 'Vì nó cho thấy bạn hiểu biết kỹ thuật hơn người ra quyết định', isCorrect: false },
              { id: 'b', text: 'Vì nó chuyển cuộc trao đổi từ "đồng ý hay không" sang "chọn cách nào", và giữ nguyên mục tiêu của tổ chức', isCorrect: true },
              { id: 'c', text: 'Vì người ra quyết định ngại tranh luận', isCorrect: false },
              { id: 'd', text: 'Vì phương án thay thế luôn rẻ hơn', isCorrect: false },
            ],
            explanation:
              'Một lời phản đối trần trụi buộc người khác phải từ bỏ thứ họ đang cần. Một phương án thay thế thì không lấy đi gì cả — nó chỉ đổi cách đạt tới đích. Người ra quyết định vẫn giữ được mục tiêu của mình, nên chi phí của việc đồng ý với bạn thấp hơn nhiều.',
          },
          {
            type: 'text',
            title: 'Hương không đi một mình',
            paragraphs: [
              'Trước khi gửi kiến nghị, Hương làm một việc mà cô đã học được từ chuyện máy chấm công: cô hỏi bốn đồng nghiệp khác.',
              'Hai người nói "chị cũng thấy kỳ nhưng ngại nói". Một người bảo "anh không quan tâm". Một người thì chưa từng để ý tới dòng chữ chế độ nền.',
              'Ba người đồng ý ký tên chung vào kiến nghị.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bốn chữ ký không nhiều. Nhưng bốn chữ ký khác hẳn một chữ ký về mặt tính chất.',
              'Một người thắc mắc thì bị coi là trường hợp cá biệt, dễ bị gán cho động cơ riêng. Bốn người thắc mắc cùng một điểm thì trở thành một vấn đề của tổ chức, và tổ chức phải trả lời như trả lời một vấn đề.',
            ],
          },
          {
            type: 'text',
            title: 'Cùng một nội dung, hai cách đọc',
            paragraphs: [
              'Hương hình dung ra trưởng phòng đọc kiến nghị trong hai trường hợp khác nhau, và cô thấy nội dung y hệt nhau lại mang hai ý nghĩa hoàn toàn khác.',
              'Nếu chỉ có mình cô ký, người đọc sẽ nghĩ: cô này khó tính, chắc có chuyện gì muốn giấu. Vấn đề được xử lý ở mức cá nhân — gọi lên nói chuyện, giải thích qua loa, rồi thôi. Không có gì trong quy trình thay đổi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nếu có bốn người cùng ký, người đọc sẽ nghĩ khác hẳn: nếu bốn người đã nêu thì còn bao nhiêu người nghĩ vậy mà chưa nói?',
              'Và một ý nghĩ nữa, ý nghĩ quyết định: nếu sau này xảy ra khiếu nại về dữ liệu, cái kiến nghị này sẽ nằm trong hồ sơ, và mình là người đã biết mà không xử lý.',
              'Nội dung không đổi một chữ. Nhưng chi phí của việc bỏ qua nó thì đổi hoàn toàn.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao cùng một nội dung mà số người ký lại thay đổi cách tổ chức phản ứng?',
            options: [
              { id: 'a', text: 'Vì bốn người thì lập luận sẽ chặt chẽ hơn một người', isCorrect: false },
              { id: 'b', text: 'Vì nó chuyển vấn đề từ chuyện của một cá nhân thành vấn đề của tổ chức, kèm theo trách nhiệm nếu bỏ qua', isCorrect: true },
              { id: 'c', text: 'Vì công ty sợ bị kiện tập thể', isCorrect: false },
              { id: 'd', text: 'Vì trưởng phòng quen biết một trong bốn người', isCorrect: false },
            ],
            explanation:
              'Nội dung không đổi, nhưng ý nghĩa của nó với người nhận thì đổi. Một người thắc mắc là chuyện có thể xử lý riêng rồi quên đi. Nhiều người thắc mắc là dấu hiệu của một vấn đề hệ thống, và người nhận kiến nghị bắt đầu phải tính tới trách nhiệm của chính mình nếu bỏ qua nó.',
          },
          {
            type: 'text',
            title: 'Kết quả',
            paragraphs: [
              'Hai tuần sau, phiên bản mới của ứng dụng được cập nhật.',
              'Chế độ thu thập vị trí đổi từ chạy nền sang ghi nhận tại thời điểm bấm bắt đầu và bấm kết thúc.',
              'Trong thông báo, công ty không nhắc gì tới kiến nghị. Nó chỉ ghi: "Cập nhật nhằm tối ưu pin thiết bị."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hương không thấy phiền vì điều đó.',
              'Cô nhận ra một điều thực tế: khi bạn ở thế yếu hơn, việc được ghi nhận công lao và việc đạt được kết quả thường không đi cùng nhau. Nếu phải chọn, hãy chọn kết quả.',
              'Hai trăm nhân viên bây giờ không còn bị ghi vị trí vào tối thứ Bảy. Không ai trong số họ biết vì sao. Điều đó không làm nó bớt có giá trị.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Biết mình đang đứng ở đâu',
            variant: 'warning',
            text: 'Không phải nơi làm việc nào cũng an toàn để lên tiếng, và không ai có nghĩa vụ mạo hiểm công việc của mình. Nếu môi trường không cho phép, vẫn còn những việc làm được trong im lặng: tách kênh liên lạc, hạn chế dùng thiết bị cá nhân cho việc công ty, và lưu lại bằng văn bản những gì mình đã được thông báo.',
          },
          {
            type: 'text',
            title: 'Ba câu Hương giữ lại',
            paragraphs: [
              'Cuối năm, Hương ghi vào cuốn sổ tay ba câu mà cô rút ra được từ cả năm ấy:',
              '1️⃣ Hỏi bằng văn bản. Câu hỏi miệng thì trôi đi, câu hỏi viết ra thì buộc phải có hồi đáp.',
              '2️⃣ Đồng ý với mục tiêu, chỉ tranh luận về phương tiện. Đó là chỗ bạn có khả năng thắng.',
              '3️⃣ Rủ thêm người. Một người là trường hợp cá biệt, nhiều người là vấn đề của tổ chức.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô cũng ghi thêm một dòng ở dưới cùng, gạch chân:',
              '"Mình không thay đổi được việc dữ liệu được thu thập. Mình chỉ thay đổi được việc nó được thu thập bao nhiêu, để làm gì, và ai chịu trách nhiệm khi có chuyện."',
              'Với một nhân viên kế toán lương mười lăm triệu, cô nghĩ thế là đã đủ nhiều rồi.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Lên tiếng về dữ liệu ở nơi làm việc',
            description: 'Cách đặt vấn đề để có kết quả, và những việc làm được ngay cả khi không thể lên tiếng.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Chuẩn bị trước khi nói',
                  paragraphs: [
                    'Xác định chính xác chi tiết nào là quá mức, thay vì phản đối toàn bộ chính sách. Phạm vi càng hẹp, khả năng được chấp nhận càng cao.',
                    'Chuẩn bị sẵn một phương án thay thế đạt được cùng mục tiêu của tổ chức nhưng thu thập ít dữ liệu hơn.',
                    'Đặt vấn đề ở góc rủi ro của tổ chức: nếu dữ liệu này rò rỉ thì ai chịu trách nhiệm, và công ty có đang lưu nhiều hơn mức cần thiết không.',
                  ],
                },
                {
                  heading: 'Cách gửi',
                  paragraphs: [
                    'Gửi bằng văn bản hoặc email, gửi đúng bộ phận phụ trách, và lưu lại bản sao.',
                    'Nếu có thể, rủ thêm đồng nghiệp cùng ký. Nhiều tiếng nói biến chuyện cá nhân thành vấn đề tổ chức.',
                    'Giữ giọng văn hợp tác, không đối đầu — mục tiêu là thay đổi chính sách, không phải thắng một cuộc tranh luận.',
                  ],
                },
                {
                  heading: 'Khi không thể lên tiếng',
                  paragraphs: [
                    'Tách kênh liên lạc riêng và công việc, không dùng chung một ứng dụng.',
                    'Hạn chế cài công cụ công ty lên thiết bị cá nhân; nếu buộc phải cài, hỏi rõ phạm vi quyền của công ty và giữ câu trả lời bằng văn bản.',
                    'Khi nghỉ việc, gửi yêu cầu xoá dữ liệu sinh trắc học và các dữ liệu cá nhân không còn cần cho nghĩa vụ lưu trữ theo luật.',
                  ],
                },
              ],
              relatedConcepts: ['Nguyên tắc tương xứng', 'Thu hẹp phạm vi phản đối', 'Tiếng nói tập thể'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — quyền của chủ thể dữ liệu và nghĩa vụ của bên xử lý',
                'Bộ luật Lao động 2019 — đối thoại tại nơi làm việc và quyền của người lao động',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Đồng ý với mục tiêu và chỉ tranh luận về phương tiện — đó là chỗ người ở thế yếu hơn có khả năng thắng.\n' +
              '✓ Kèm theo một phương án thay thế biến cuộc trao đổi từ "đồng ý hay không" thành "chọn cách nào".\n' +
              '✓ Một người thắc mắc là trường hợp cá biệt; nhiều người thắc mắc là vấn đề tổ chức phải trả lời.\n' +
              '✓ Khi không thể lên tiếng, vẫn còn việc làm được trong im lặng: tách kênh, hạn chế thiết bị chung, lưu lại bằng văn bản.',
          },
          {
            type: 'text',
            title: 'Điều Hương mang theo',
            paragraphs: [
              'Hương vẫn đứng trước cái máy chấm công mỗi sáng, vẫn để đèn xanh quét qua mặt mình.',
              'Nhưng bây giờ cô biết dữ liệu ấy nằm ở đâu, biết nó sẽ bị xoá khi cô nghỉ việc, và biết vì sao điều khoản đó tồn tại.',
              'Riêng tư ở nơi làm việc hiếm khi là chuyện bạn giành lại được tất cả. Nó là chuyện bạn biết mình đang cho đi cái gì, và bạn có mặt trong cuộc trò chuyện quyết định điều đó.',
            ],
          },
        ],
      },
    ],
  },
};
