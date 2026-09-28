import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Bác Tư × Logic 101 — "Tin đồn ngoài chợ".
 *
 * Bác Tư không đọc báo khoa học và sẽ không bao giờ đọc. Câu chuyện vì thế
 * không dạy bác cách đọc nghiên cứu, mà dạy đúng hai thứ bác dùng được: phân
 * biệt "mức độ chắc chắn" với "mức độ nguy hiểm", và truy một tin về tận nguồn.
 */
export const BACTU_LOGIC: StorySeed = {
  slug: 'bactu-logic',
  characterSlug: 'street-vendor',
  title: 'Tin đồn ngoài chợ',
  teaser:
    'Một tin nhắn lan khắp chợ: thịt chế biến sẵn bị xếp cùng nhóm với thuốc lá. Ba ngày sau, bác Tư bán được một nửa số bánh mì thường ngày.',
  icon: 'message-circle',
  estimatedTime: '~30 phút',
  sortOrder: 2,
  courseSlugs: [COURSE.logic],
  part: {
    name: 'Bác Tư và cái tin lan khắp chợ',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'tin-don-ngoai-cho',
        title: 'Tin đồn ngoài chợ',
        blocks: [
          {
            type: 'text',
            title: 'Sáng thứ Tư, vắng khách',
            paragraphs: [
              'Bảy giờ sáng thứ Tư, bác Tư mới bán được hai mươi mốt ổ. Ngày thường giờ này đã hơn năm chục.',
              'Chị Hằng bán trái cây kế bên đưa điện thoại qua: "Anh coi cái này nè. Cả chợ chuyền nhau từ tối qua."',
              'Trên màn hình là một ảnh chụp màn hình, chữ trắng nền đỏ.',
            ],
          },
          {
            type: 'callout',
            icon: 'alert-triangle',
            title: 'Nội dung tin nhắn lan trong chợ',
            variant: 'warning',
            text: '"KHẨN CẤP: Tổ chức Y tế Thế giới CHÍNH THỨC xếp thịt chế biến sẵn (giăm bông, xúc xích, pate, chả) vào NHÓM 1 — CÙNG NHÓM VỚI THUỐC LÁ VÀ AMIĂNG. Hãy chia sẻ cho người thân, đừng để gia đình mình ăn phải!"',
          },
          {
            type: 'question',
            question:
              'Tin nhắn nói rằng thịt chế biến sẵn được xếp cùng nhóm với thuốc lá. Theo bạn, câu này đúng hay sai?',
            options: [
              { id: 'a', text: 'Hoàn toàn sai, đây là tin bịa đặt', isCorrect: false },
              { id: 'b', text: 'Đúng về mặt phân loại, nhưng "cùng nhóm" không có nghĩa là "nguy hiểm ngang nhau"', isCorrect: true },
              { id: 'c', text: 'Đúng hoàn toàn, ăn thịt chế biến nguy hiểm ngang hút thuốc', isCorrect: false },
              { id: 'd', text: 'Sai, vì WHO không có thẩm quyền phân loại thực phẩm', isCorrect: false },
            ],
            explanation:
              'Đây là kiểu tin khó nhất: nó không bịa. Cơ quan nghiên cứu ung thư quốc tế thuộc WHO thật sự xếp thịt chế biến sẵn vào Nhóm 1, và thuốc lá cũng ở Nhóm 1. Nhưng cách phân nhóm đó trả lời câu hỏi "chúng ta chắc chắn tới đâu rằng chất này gây ung thư", chứ không trả lời câu hỏi "nó làm tăng nguy cơ bao nhiêu". Hai câu hỏi hoàn toàn khác nhau bị gộp làm một.',
          },
          {
            type: 'text',
            title: 'Hai câu hỏi bị gộp làm một',
            paragraphs: [
              'Cháu bác Tư, đang học năm hai đại học, giải thích cho bác bằng một ví dụ.',
              '"Bác tưởng tượng có hai bảng. Bảng một ghi: chúng ta chắc chắn tới đâu rằng cái này gây hại. Bảng hai ghi: nó gây hại nhiều hay ít."',
              '"Cái phân nhóm của WHO là bảng một. Còn cái mà người ta tưởng khi đọc tin nhắn đó là bảng hai."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư hỏi: "Vậy ở bảng hai thì nó bao nhiêu?"',
              '"Nghiên cứu nói ăn khoảng năm chục gam thịt chế biến mỗi ngày, đều đặn cả đời, thì nguy cơ ung thư đại trực tràng tăng khoảng mười tám phần trăm."',
              'Bác Tư giật mình: "Mười tám phần trăm là nhiều lắm chứ con."',
              '"Bác khoan. Mười tám phần trăm của cái gì mới là chuyện."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Nguy cơ tương đối và nguy cơ tuyệt đối',
            variant: 'info',
            text: 'Nguy cơ tương đối trả lời: tăng bao nhiêu phần so với mức nền. Nguy cơ tuyệt đối trả lời: cuối cùng thì khả năng thực sự là bao nhiêu. Nếu mức nền là 5 người trên 100, thì "tăng 18 phần trăm" nghĩa là lên khoảng 6 người trên 100 — chứ không phải 18 người trên 100. Cùng một con số, hai cách đọc, hai cảm giác hoàn toàn khác nhau.',
          },
          {
            type: 'flip-card',
            title: 'Dòng tiêu đề — và điều nghiên cứu thật sự nói',
            instruction: 'Bấm vào từng thẻ để lật xem mặt sau.',
            cards: [
              {
                id: 'c1',
                front: { kind: 'text', text: '"Xếp cùng nhóm với thuốc lá"' },
                back: {
                  kind: 'text',
                  text: 'Cùng nhóm về mức độ CHẮC CHẮN của bằng chứng, không phải về mức độ nguy hiểm. Thuốc lá làm tăng nguy cơ ung thư phổi khoảng hai mươi lần; thịt chế biến làm tăng nguy cơ ung thư đại trực tràng khoảng một phần năm.',
                },
              },
              {
                id: 'c2',
                front: { kind: 'text', text: '"Tăng 18% nguy cơ ung thư"' },
                back: {
                  kind: 'text',
                  text: 'Tăng 18% so với mức nền, không phải 18 người trên 100. Với mức nền khoảng 5 trên 100, con số sau khi tăng là khoảng 6 trên 100.',
                },
              },
              {
                id: 'c3',
                front: { kind: 'text', text: '"Ăn thịt chế biến sẵn gây ung thư"' },
                back: {
                  kind: 'text',
                  text: 'Nghiên cứu nói về mức tiêu thụ đều đặn khoảng 50 gam mỗi ngày trong thời gian dài. Một ổ bánh mì thỉnh thoảng không phải là điều được đo trong nghiên cứu đó.',
                },
              },
              {
                id: 'c4',
                front: { kind: 'text', text: '"WHO khuyến cáo không nên ăn"' },
                back: {
                  kind: 'text',
                  text: 'Khuyến cáo thực tế là hạn chế lượng tiêu thụ, không phải loại bỏ hoàn toàn. Khoảng cách giữa "hạn chế" và "cấm" bị xoá mất khi tin được rút gọn để chia sẻ.',
                },
              },
            ],
          },
          {
            type: 'text',
            title: 'Vì sao tin này lan nhanh tới vậy',
            paragraphs: [
              'Bác Tư thắc mắc: cái phân loại đó có từ năm 2015, gần chục năm rồi. Vì sao tự nhiên tuần này cả chợ mới chuyền nhau?',
              'Cháu bác chỉ vào ba chi tiết trong tin nhắn: chữ "KHẨN CẤP", chữ viết hoa, và câu "hãy chia sẻ cho người thân".',
              '"Cái tin này không được viết để cho bác biết. Nó được viết để bác chuyển tiếp."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Một thông tin được thiết kế để lan thì khác hẳn một thông tin được thiết kế để chính xác.',
              'Nó cần ngắn, cần gây sợ, cần có một hành động rõ ràng, và cần bỏ hết những chữ như "khoảng", "trong điều kiện", "với mức tiêu thụ đều đặn" — vì những chữ đó làm giảm cảm giác cấp bách.',
              'Đúng những chữ bị bỏ đi lại là những chữ chứa toàn bộ ý nghĩa.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Cái được lan không phải cái đúng nhất',
            variant: 'warning',
            text: 'Một tin lan xa vì nó gây cảm xúc mạnh, chứ không vì nó chính xác. Các nghiên cứu về lan truyền thông tin trên mạng xã hội đều cho thấy tin sai lan nhanh và xa hơn tin đúng — không phải do người chia sẻ có ý xấu, mà vì tin sai thường mới lạ và gây ngạc nhiên hơn, còn tin đúng thì thường phức tạp và có nhiều điều kiện kèm theo.',
          },
          {
            type: 'question',
            question:
              'Vì sao những chữ như "khoảng", "trong điều kiện", "với mức tiêu thụ đều đặn" hay bị lược bỏ khi tin được chia sẻ?',
            options: [
              { id: 'a', text: 'Vì người chia sẻ cố tình muốn gây hiểu sai', isCorrect: false },
              { id: 'b', text: 'Vì chúng làm câu dài và giảm cảm giác cấp bách, nên bị cắt trong quá trình rút gọn để dễ chuyển tiếp', isCorrect: true },
              { id: 'c', text: 'Vì chúng không quan trọng về mặt khoa học', isCorrect: false },
              { id: 'd', text: 'Vì ứng dụng nhắn tin giới hạn số ký tự', isCorrect: false },
            ],
            explanation:
              'Phần lớn người chia sẻ tin sai đều có ý tốt — họ muốn cảnh báo người thân. Nhưng mỗi lần một tin được kể lại, nó ngắn đi và mạnh lên: chi tiết điều kiện rơi rụng, kết luận sắc lại. Sau năm sáu lần chuyển tiếp, một phát biểu có điều kiện của giới nghiên cứu biến thành một lời cảnh báo tuyệt đối, mà không ai trong chuỗi đó nói dối cả.',
          },
          {
            type: 'text',
            title: 'Bác Tư nghĩ tới việc đổi công thức',
            paragraphs: [
              'Ba ngày liền doanh thu chỉ bằng một nửa. Bác Tư tính bỏ pate và chả, chỉ bán bánh mì trứng và bánh mì thịt nướng.',
              'Chị Hằng cản: "Anh bỏ pate thì còn gì là bánh mì anh Tư nữa. Khách quen ăn vì cái pate của anh mà."',
              'Bác Tư nói: "Nhưng người ta sợ thì người ta không mua."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là chỗ mà một tin sai gây thiệt hại thật, và thiệt hại đó không nằm ở sức khoẻ.',
              'Nó nằm ở một người bán hàng mười năm sắp bỏ đi thứ làm nên hàng của mình, vì một tin nhắn không sai sự thật nhưng bị hiểu lệch.',
              'Và nếu bác Tư đổi công thức, sẽ không ai đền bù gì cho bác, và cũng không ai biết rằng có một quyết định như vậy đã xảy ra.',
            ],
          },
          {
            type: 'text',
            title: 'Chị Hằng cũng đã chia sẻ',
            paragraphs: [
              'Bác Tư hỏi chị Hằng: "Cô nhận cái tin đó từ đâu?"',
              '"Con dâu tui gửi. Nó bảo mẹ chồng nó gửi cho nó."',
              '"Rồi cô có gửi tiếp cho ai không?"',
              'Chị Hằng ngập ngừng: "Tui gửi vô nhóm tiểu thương chợ mình... với nhóm hội đồng hương nữa."',
            ],
          },
          {
            type: 'question',
            question:
              'Chị Hằng chia sẻ tin đó rồi chính chị lại buôn bán ngay cạnh bác Tư. Điều này cho thấy gì về cách tin sai lan đi?',
            options: [
              { id: 'a', text: 'Chị Hằng cố tình hại việc buôn bán của bác Tư', isCorrect: false },
              { id: 'b', text: 'Người chia sẻ thường không kết nối tin đó với hậu quả cụ thể quanh mình — họ chia sẻ vì lo cho người thân, không vì tính toán gì', isCorrect: true },
              { id: 'c', text: 'Chị Hằng không biết bác Tư bán bánh mì có pate', isCorrect: false },
              { id: 'd', text: 'Tin đó thực ra không ảnh hưởng tới việc bán hàng', isCorrect: false },
            ],
            explanation:
              'Đây là điều làm loại tin này khó chặn: nó lan qua tay những người có thiện chí. Chị Hằng bấm chuyển tiếp trong hai giây với ý nghĩ "cảnh báo cho bà con", và cái ý nghĩ đó không hề đi kèm hình dung về hàng bánh mì cách chỗ chị ba mét. Người chia sẻ hầu như không bao giờ nhìn thấy chi phí mà cú bấm của mình tạo ra.',
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Tin sai có giá, và người trả giá thường không phải người phát tán',
            variant: 'info',
            text: 'Người soạn tin nhắn giật gân không mất gì. Người chuyển tiếp cũng không. Chi phí rơi vào người bán hàng mất khách, người bệnh bỏ thuốc để dùng bài thuốc trên mạng, người tiêu dùng thay đổi thói quen dựa trên hiểu lầm. Sự lệch pha giữa người tạo ra và người gánh chịu là lý do loại tin này không tự hết.',
          },
          {
            type: 'text',
            title: 'Cháu bác Tư đề nghị một việc',
            paragraphs: [
              '"Bác khoan đổi công thức. Cho con hai ngày."',
              '"Con làm gì?"',
              '"Con đi tìm coi cái tin nhắn này từ đâu ra. Với lại tìm coi cái tổ chức kia họ nói y nguyên là gì."',
              'Bác Tư không hiểu lắm việc đó giúp được gì. Nhưng bác đồng ý, vì bác cũng chưa muốn bỏ pate.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Đọc một cảnh báo sức khoẻ cho đúng',
            description: 'Ba chỗ mà tin cảnh báo hay bị hiểu lệch, và cách kiểm tra nhanh.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba chỗ hay bị hiểu lệch',
                  paragraphs: [
                    'Nhầm mức độ chắc chắn với mức độ nguy hiểm. Các hệ thống phân loại tác nhân gây ung thư trả lời câu "bằng chứng chắc tới đâu", không trả lời câu "nguy hiểm bao nhiêu". Hai chất cùng nhóm có thể chênh nhau hàng chục lần về mức nguy cơ.',
                    'Nhầm nguy cơ tương đối với nguy cơ tuyệt đối. "Tăng 18%" cần biết mức nền mới có nghĩa: từ 5/100 lên khoảng 6/100 rất khác với 18/100.',
                    'Bỏ mất điều kiện. Nghiên cứu thường nói về một mức tiêu thụ cụ thể, đều đặn, trong thời gian dài. Điều kiện đó biến mất trong bản tin nhắn được chia sẻ.',
                  ],
                },
                {
                  heading: 'Dấu hiệu của một tin được viết để lan',
                  paragraphs: [
                    'Chữ viết hoa, chữ "KHẨN CẤP", "CHÍNH THỨC", "AI CŨNG PHẢI BIẾT".',
                    'Lời kêu gọi chia sẻ đặt ngay trong nội dung.',
                    'Không có ngày tháng, không có tên nghiên cứu, không có đường dẫn tới nguồn gốc.',
                    'Kết luận tuyệt đối, không có chữ "khoảng", "có thể", "trong điều kiện".',
                  ],
                },
                {
                  heading: 'Ba câu hỏi trước khi tin hoặc chuyển tiếp',
                  paragraphs: [
                    'Con số này là tương đối hay tuyệt đối? Mức nền là bao nhiêu?',
                    'Nghiên cứu gốc đo cái gì, ở mức nào, trong bao lâu?',
                    'Tin này có từ bao giờ? Nhiều tin lan mạnh là tin cũ nhiều năm được đóng gói lại.',
                  ],
                },
              ],
              relatedConcepts: ['Nguy cơ tương đối và tuyệt đối', 'Mức độ chắc chắn của bằng chứng', 'Tin giả'],
              furtherReading: [
                'Bài học "Tin giả" và "Thao túng số liệu" trong khoá Logic 101',
                'Phân loại tác nhân gây ung thư của Cơ quan Nghiên cứu Ung thư Quốc tế (IARC) và ý nghĩa của từng nhóm',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ "Cùng nhóm" trong phân loại tác nhân gây ung thư nói về mức độ chắc chắn của bằng chứng, không phải mức độ nguy hiểm.\n' +
              '✓ Một con số phần trăm tăng thêm chỉ có nghĩa khi biết mức nền — nguy cơ tương đối khác hẳn nguy cơ tuyệt đối.\n' +
              '✓ Tin được viết để lan thì khác tin được viết để chính xác: nó cắt bỏ đúng những chữ chứa ý nghĩa.\n' +
              '✓ Tin sai có chi phí thật, và người trả giá thường không phải người tạo ra hay phát tán nó.',
          },
          {
            type: 'text',
            title: 'Hai ngày',
            paragraphs: [
              'Bác Tư giữ nguyên pate thêm hai ngày.',
              'Doanh thu vẫn thấp. Có khách quen tới, nhìn khay pate, rồi kêu bánh mì trứng.',
              'Còn cháu bác Tư thì ngồi làm một việc mà nó bảo là "truy ngược cái tin về tận gốc" — và cái nó tìm ra làm cả hai bác cháu bất ngờ.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'di-tim-nguon-cua-cai-tin',
        title: 'Đi tìm nguồn của cái tin',
        blocks: [
          {
            type: 'text',
            title: 'Truy ngược một tin nhắn',
            paragraphs: [
              'Cháu bác Tư bắt đầu bằng việc hỏi từng người trong chuỗi.',
              'Chị Hằng nhận từ con dâu. Con dâu nhận từ mẹ chồng bên kia. Mẹ chồng nhận từ một nhóm cư dân chung cư. Trong nhóm đó, người đầu tiên đăng nói là "thấy trên mạng".',
              'Tới đó thì chuỗi đứt. Không ai biết nó xuất phát từ đâu.',
            ],
          },
          {
            type: 'callout',
            icon: 'search',
            title: 'Chuỗi truyền tin',
            variant: 'info',
            text: 'Bác Tư ← chị Hằng ← con dâu ← mẹ chồng ← nhóm cư dân ← "thấy trên mạng" ← ? — Năm lần chuyển tiếp, không lần nào kèm theo một đường dẫn tới nguồn gốc.',
          },
          {
            type: 'question',
            question:
              'Việc không ai trong chuỗi biết nguồn gốc của tin nói lên điều gì?',
            options: [
              { id: 'a', text: 'Chắc chắn tin đó là bịa đặt', isCorrect: false },
              { id: 'b', text: 'Không nói được tin đúng hay sai, nhưng nói rằng không ai trong chuỗi đã kiểm chứng — mỗi người tin vì người trước mình tin', isCorrect: true },
              { id: 'c', text: 'Tin đó đến từ một nguồn nước ngoài', isCorrect: false },
              { id: 'd', text: 'Nhóm cư dân chung cư là nơi phát tán tin giả', isCorrect: false },
            ],
            explanation:
              'Chuỗi không có nguồn không chứng minh tin sai — trong trường hợp này phần lõi còn đúng. Nhưng nó cho biết một điều quan trọng: sự tin tưởng ở đây được xây từ số lượt chuyển tiếp, không từ bằng chứng. Năm người tin không phải là năm lần kiểm chứng độc lập; đó là một lần không kiểm chứng, được nhân lên năm lần.',
          },
          {
            type: 'text',
            title: 'Đi tìm bản gốc',
            paragraphs: [
              'Cháu bác Tư đổi cách: thay vì truy theo người, nó truy theo nội dung.',
              'Nó gõ tìm đúng cụm từ chuyên môn có trong tin nhắn — tên tổ chức và cụm "nhóm 1" — thay vì gõ theo lời đồn.',
              'Kết quả đầu tiên dẫn tới trang chính thức của cơ quan nghiên cứu ung thư quốc tế, với thông cáo gốc và một trang riêng dành cho câu hỏi thường gặp.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Trong trang câu hỏi thường gặp có đúng câu mà cả chợ đang hiểu sai, và cơ quan đó đã tự trả lời từ năm 2015.',
              'Đại ý: việc phân nhóm phản ánh mức độ chắc chắn của bằng chứng khoa học, không phản ánh mức độ nguy hiểm. Thịt chế biến sẵn và thuốc lá cùng nhóm không có nghĩa là nguy hiểm ngang nhau.',
              '"Bác thấy chưa," nó nói với bác Tư. "Câu trả lời nó nằm sẵn đó gần chục năm rồi. Chỉ là không ai đi tới đó."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Tìm theo nội dung, đừng tìm theo lời đồn',
            variant: 'info',
            text: 'Gõ "thịt chế biến gây ung thư" sẽ ra hàng loạt bài viết lại theo lời đồn. Gõ tên tổ chức cộng với thuật ngữ chuyên môn có trong tin sẽ dẫn thẳng tới nguồn. Mẹo này áp dụng được cho gần như mọi tin cảnh báo: lấy ra danh từ riêng và thuật ngữ, bỏ đi phần kết luận giật gân.',
          },
          {
            type: 'sort-bucket',
            title: 'Nguồn nào đáng dừng lại để đọc?',
            instruction:
              'Xếp từng loại nguồn vào rổ đúng: cái nào cho bạn kiểm tra được nó lấy thông tin từ đâu, cái nào không?',
            buckets: [
              { id: 'truy', label: 'Truy được về gốc' },
              { id: 'khong', label: 'Không truy được' },
            ],
            items: [
              { id: 'n1', text: 'Trang chính thức của tổ chức được nhắc tên trong tin', bucketId: 'truy' },
              { id: 'n2', text: 'Bài báo có dẫn tên nghiên cứu và năm công bố', bucketId: 'truy' },
              { id: 'n3', text: 'Ảnh chụp màn hình chữ trắng nền đỏ, không ghi nguồn', bucketId: 'khong' },
              { id: 'n4', text: 'Tin nhắn được chuyển tiếp năm lần, mở đầu bằng "KHẨN CẤP"', bucketId: 'khong' },
              { id: 'n5', text: 'Trang câu hỏi thường gặp do chính cơ quan công bố nghiên cứu viết', bucketId: 'truy' },
              { id: 'n6', text: 'Video kể lại nghiên cứu nhưng không nói tên nghiên cứu nào', bucketId: 'khong' },
            ],
          },
          {
            type: 'text',
            title: 'Tiêu chí duy nhất bác Tư cần nhớ',
            paragraphs: [
              'Cháu bác Tư rút gọn tất cả thành một câu, vì bác sẽ không nhớ nổi một danh sách dài.',
              '"Bác chỉ cần hỏi một câu thôi: cái này nó nói nó lấy ở đâu ra?"',
              '"Nếu nó chỉ được chỗ nó lấy ra thì bác đi tới đó coi. Còn nếu nó không chỉ được thì bác đừng tin, mà cũng đừng gửi cho ai."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Tiêu chí này không phân biệt được đúng sai. Một tin không ghi nguồn vẫn có thể đúng, và một tin có ghi nguồn vẫn có thể bị diễn giải sai.',
              'Nhưng nó làm được một việc rất thực tế: nó chia thông tin thành "kiểm tra được" và "không kiểm tra được".',
              'Và với một người không có thời gian đọc nghiên cứu, biết mình đang cầm loại nào trong hai loại đó đã là rất nhiều.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao "có ghi nguồn" chưa đủ để tin, nhưng "không ghi nguồn" thì đủ để nghi?',
            options: [
              { id: 'a', text: 'Vì nguồn nào cũng có thể bị làm giả', isCorrect: false },
              { id: 'b', text: 'Vì có nguồn chỉ mở ra khả năng kiểm tra, còn không có nguồn thì đóng luôn khả năng đó', isCorrect: true },
              { id: 'c', text: 'Vì các nguồn nước ngoài khó kiểm chứng', isCorrect: false },
              { id: 'd', text: 'Vì tin không ghi nguồn thường do người xấu tạo ra', isCorrect: false },
            ],
            explanation:
              'Ghi nguồn không phải là bảo chứng về tính đúng đắn — nó chỉ là điều kiện cần để bạn có thể tự kiểm tra. Ngược lại, một tin không ghi nguồn thì dù đúng hay sai bạn cũng không có cách nào biết, và nó tước mất của bạn khả năng phán đoán. Đó là lý do việc thiếu nguồn là dấu hiệu đủ mạnh để dừng lại, ngay cả khi chưa biết nội dung sai chỗ nào.',
          },
          {
            type: 'text',
            title: 'Một chi tiết cháu bác Tư suýt bỏ qua',
            paragraphs: [
              'Trong lúc tìm, nó gặp một bài báo tiếng Việt viết về đúng nghiên cứu đó, đăng năm 2015.',
              'Bài báo viết đúng: có nêu mức tiêu thụ 50 gam mỗi ngày, có nêu con số nguy cơ tương đối, có dẫn tên cơ quan.',
              'Nhưng tiêu đề của bài lại là: "WHO: Thịt chế biến sẵn nguy hiểm ngang thuốc lá".',
            ],
          },
          {
            type: 'question',
            question:
              'Bài báo có nội dung chính xác nhưng tiêu đề gây hiểu sai. Điều này nên được đánh giá thế nào?',
            options: [
              { id: 'a', text: 'Không sao, vì ai đọc kỹ sẽ hiểu đúng', isCorrect: false },
              { id: 'b', text: 'Vẫn là gây hiểu sai, vì phần lớn người tiếp xúc chỉ đọc tiêu đề và chính tiêu đề mới là thứ được chia sẻ lại', isCorrect: true },
              { id: 'c', text: 'Lỗi hoàn toàn thuộc về người đọc không đọc hết bài', isCorrect: false },
              { id: 'd', text: 'Tiêu đề chỉ là hình thức, không ảnh hưởng tới nội dung', isCorrect: false },
            ],
            explanation:
              'Tiêu đề không phải phần trang trí của bài báo — với đa số người, nó chính là toàn bộ bài báo. Nó là thứ hiện ra trên bảng tin, thứ được chụp màn hình, thứ được chuyển tiếp. Một tiêu đề sai gắn với một nội dung đúng vẫn tạo ra hiểu lầm ở quy mô lớn, và trên thực tế đó là cách phần lớn hiểu lầm khoa học ra đời — không từ tin bịa, mà từ tin thật bị đặt tiêu đề giật gân.',
          },
          {
            type: 'text',
            title: 'Còn một chuyện nữa',
            paragraphs: [
              'Cháu bác Tư tìm thêm và phát hiện: chính cái ảnh chụp màn hình đang lan trong chợ đã từng lan một lần vào năm 2019, và một lần nữa vào năm 2022.',
              'Cùng một hình, cùng một dòng chữ. Mỗi vài năm nó lại nổi lên một lần.',
              'Không phải một tin mới. Là một tin cũ được thả lại.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Tin cũ đóng gói lại trông y hệt tin mới',
            variant: 'warning',
            text: 'Rất nhiều tin lan mạnh là tin cũ nhiều năm được đăng lại không kèm ngày tháng. Vì tin nhắn chuyển tiếp không mang theo thời điểm, người nhận mặc định đó là chuyện vừa xảy ra — và cảm giác "vừa mới" làm tăng mạnh mức độ cấp bách. Hỏi "tin này có từ bao giờ" là một trong những câu rẻ nhất và hiệu quả nhất.',
          },
          {
            type: 'text',
            title: 'Bác Tư giữ nguyên pate',
            paragraphs: [
              'Sau hai ngày, cháu bác Tư đưa bác ba điều nó tìm được, nói bằng ngôn ngữ của bác:',
              '1️⃣ Cái tin đó phần lõi là thật, nhưng bị hiểu lệch một chỗ quan trọng.',
              '2️⃣ Cùng nhóm với thuốc lá nghĩa là "chắc chắn có hại", không phải "hại ngang nhau".',
              '3️⃣ Tin này cũ gần chục năm rồi, cứ vài năm lại nổi lên một lần.',
              'Bác Tư quyết định giữ nguyên công thức.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng bác cũng làm một việc mà cháu bác không đề nghị.',
              'Bác giảm lượng pate trong mỗi ổ đi một chút, và thêm rau vào nhiều hơn.',
              '"Cái tin đó nó nói quá," bác nói. "Nhưng nó không phải bịa hoàn toàn. Ăn ít lại thì cũng đâu có hại gì."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cháu bác Tư nghĩ mãi về câu đó.',
              'Nó đi tìm sự thật để bác vững tin mà giữ nguyên mọi thứ. Còn bác thì lấy phần đúng trong tin đồn, bỏ phần bị thổi phồng, rồi điều chỉnh một chút.',
              'Hoá ra kết luận đúng không phải là "tin" hay "không tin", mà là tách ra được phần nào đáng tin trong đó.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Truy một tin về tận nguồn',
            description: 'Bốn bước làm được trong năm phút, không cần biết ngoại ngữ hay chuyên môn.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn bước',
                  paragraphs: [
                    'Lấy ra danh từ riêng và thuật ngữ trong tin — tên tổ chức, tên nghiên cứu, tên chất, số hiệu phân loại. Bỏ đi phần kết luận giật gân.',
                    'Gõ tìm bằng các từ đó, không gõ theo lời đồn. Ưu tiên trang chính thức của tổ chức được nhắc tên.',
                    'Tìm trang câu hỏi thường gặp hoặc thông cáo gốc — nhiều hiểu lầm phổ biến đã được chính tổ chức đó trả lời sẵn.',
                    'Kiểm tra ngày tháng. Rất nhiều tin lan mạnh là tin cũ nhiều năm được thả lại.',
                  ],
                },
                {
                  heading: 'Câu hỏi rút gọn cho người bận',
                  paragraphs: [
                    'Nếu chỉ nhớ được một câu, hãy nhớ câu này: "Cái này nó nói nó lấy ở đâu ra?"',
                    'Có chỉ được nguồn thì đi tới đó xem. Không chỉ được nguồn thì đừng tin, và quan trọng hơn: đừng chuyển tiếp.',
                    'Việc không chuyển tiếp quan trọng hơn việc không tin, vì nó cắt chuỗi lan truyền tại chỗ bạn.',
                  ],
                },
                {
                  heading: 'Vì sao số lượt chia sẻ không phải bằng chứng',
                  paragraphs: [
                    'Năm người cùng gửi cho bạn một tin không phải là năm lần kiểm chứng độc lập — đó là một lần không kiểm chứng, nhân lên năm lần.',
                    'Sự tin tưởng lan theo quan hệ: bạn tin vì người gửi là người thân, chứ không vì nội dung có bằng chứng.',
                    'Cùng lý do đó, một lời đính chính từ người thân có sức nặng hơn nhiều so với một bài báo đính chính.',
                  ],
                },
              ],
              relatedConcepts: ['Truy nguồn', 'Tính độc lập của nguồn', 'Tin cũ đăng lại'],
              furtherReading: [
                'Bài học "CRAAP test" và "Tin giả" trong khoá Logic 101',
                'Trang câu hỏi thường gặp của IARC về phân loại thịt chế biến sẵn (2015)',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Năm người cùng gửi một tin không phải năm lần kiểm chứng — đó là một lần không kiểm chứng, nhân lên năm lần.\n' +
              '✓ Tìm theo danh từ riêng và thuật ngữ trong tin, đừng tìm theo lời đồn — nó dẫn thẳng tới nguồn gốc.\n' +
              '✓ "Có ghi nguồn" chưa đủ để tin, nhưng "không ghi nguồn" đã đủ để dừng lại và không chuyển tiếp.\n' +
              '✓ Nhiều tin lan mạnh là tin cũ nhiều năm được thả lại — hỏi "tin này có từ bao giờ" rất rẻ mà rất hiệu quả.',
          },
          {
            type: 'text',
            title: 'Nhưng cả chợ vẫn đang tin',
            paragraphs: [
              'Bác Tư đã yên tâm. Vấn đề là hai trăm người trong chợ và mấy trăm khách quen thì chưa.',
              'Bác thử nói với một khách quen rằng cái tin đó bị hiểu sai. Bà khách nghe xong bảo: "Ừ thì chú nói vậy, nhưng chú bán bánh mì mà chú."',
              'Bác Tư đứng im. Bà nói không sai.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'chu-ban-banh-mi-ma-chu',
        title: '"Chú bán bánh mì mà chú"',
        blocks: [
          {
            type: 'text',
            title: 'Câu nói của bà khách',
            paragraphs: [
              '"Ừ thì chú nói vậy, nhưng chú bán bánh mì mà chú."',
              'Bác Tư kể lại câu đó cho cháu nghe, và nói: "Bả nói cũng đúng chớ. Tao bán bánh mì thật mà."',
              'Cháu bác Tư lắc đầu: "Đúng là bác bán bánh mì. Nhưng cái đó không làm cho cái bác nói thành sai."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Ngụy biện tấn công cá nhân — dạng "anh có lợi ích ở đây"',
            variant: 'info',
            text: 'Là khi ta bác bỏ một lập luận bằng cách chỉ ra người nói có lợi ích liên quan, thay vì kiểm tra nội dung lập luận đó. Việc bác Tư có lợi khi khách tin bác là một lý do chính đáng để kiểm chứng kỹ hơn — nhưng nó không phải là một lý do để kết luận bác sai.',
          },
          {
            type: 'question',
            question:
              'Việc bác Tư có lợi ích trong chuyện này nên được xử lý thế nào?',
            options: [
              { id: 'a', text: 'Bỏ qua hoàn toàn lời bác nói, vì bác không khách quan', isCorrect: false },
              { id: 'b', text: 'Coi đó là lý do để kiểm tra bằng chứng kỹ hơn, nhưng vẫn phải kiểm tra bằng chứng chứ không kết luận từ động cơ', isCorrect: true },
              { id: 'c', text: 'Bỏ qua, vì ai cũng có lợi ích trong mọi chuyện', isCorrect: false },
              { id: 'd', text: 'Tin bác vì bác là người bán, nên bác hiểu sản phẩm nhất', isCorrect: false },
            ],
            explanation:
              'Có hai sai lầm đối xứng ở đây. Một là bác bỏ hoàn toàn lời người có lợi ích — nếu vậy thì không bác sĩ nào được nói về thuốc và không nông dân nào được nói về nông sản. Hai là bỏ qua lợi ích như thể nó không tồn tại. Cách xử lý đúng nằm ở giữa: lợi ích làm tăng mức độ cần kiểm chứng, nhưng phán quyết cuối cùng vẫn phải dựa vào bằng chứng.',
          },
          {
            type: 'text',
            title: 'Bác Tư đổi cách nói',
            paragraphs: [
              'Bác nhận ra một điều: chừng nào bác còn là người đi giải thích, bác còn là người bán hàng đang bảo vệ hàng của mình.',
              'Nên hôm sau, bác không giải thích nữa.',
              'Bác in cái trang câu hỏi thường gặp của cơ quan nghiên cứu ra giấy A4, ép nhựa, treo cạnh bảng giá. Ai hỏi thì bác chỉ vào tờ giấy.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Tui không biết gì đâu cô," bác nói với khách. "Cô đọc cái này đi rồi cô tự quyết."',
              'Cách này hiệu quả hơn hẳn việc bác tự nói, vì lý do rất đơn giản: nó chuyển nguồn từ bác sang một chỗ mà bác không kiểm soát được.',
              'Khách không còn phải chọn giữa "tin chú bán bánh mì" và "tin cái tin nhắn". Họ được đọc thẳng thứ mà cả hai bên đang tranh cãi.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Khi bạn là bên có lợi ích, hãy chỉ vào nguồn thay vì nói thay nguồn',
            variant: 'info',
            text: 'Người có lợi ích liên quan mà đi diễn giải bằng chứng thì lời diễn giải luôn bị nghi ngờ, dù nó đúng. Đưa thẳng nguồn gốc cho người ta tự đọc thì bạn thoát khỏi vai người bào chữa — và người đọc giữ được cảm giác tự mình quyết định, thứ quan trọng hơn nhiều so với việc họ được thuyết phục.',
          },
          {
            type: 'text',
            title: 'Một khách không đọc tờ giấy',
            paragraphs: [
              'Không phải ai cũng đọc. Có ông khách liếc tờ giấy rồi nói: "Ba cái này ai viết chả được."',
              'Bác Tư không cãi. Bác chỉ nói: "Dạ, chú không tin cái này thì chú tự tra cũng được. Chú gõ đúng cái tên tổ chức đó là ra à."',
              'Ông khách không tra. Nhưng ông vẫn mua bánh mì, và bác Tư nghĩ như vậy đã đủ.',
            ],
          },
          {
            type: 'text',
            title: 'Chị Hằng làm việc còn hiệu quả hơn',
            paragraphs: [
              'Chị Hằng, người đã chia sẻ tin đó vào hai nhóm, quyết định làm một việc.',
              'Chị đăng lại vào đúng hai nhóm ấy, viết thế này:',
              '"Cái tin thịt chế biến bữa trước tui gửi, tui gửi mà tui chưa coi kỹ. Con cháu nó tra giùm thì ra là cùng nhóm với thuốc lá nghĩa là chắc chắn có hại, chớ không phải hại ngang nhau. Tui đăng lại cho bà con rõ, chớ tui gửi tin sai tui cũng ngại."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao lời đính chính của chị Hằng có sức nặng hơn tờ giấy bác Tư treo?',
            options: [
              { id: 'a', text: 'Vì chị Hằng viết dài hơn', isCorrect: false },
              { id: 'b', text: 'Vì chị là người đã lan tin, không có lợi ích gì khi đính chính, và chị đến với người nghe qua cùng con đường mà tin sai đã đi', isCorrect: true },
              { id: 'c', text: 'Vì chị Hằng có uy tín cao hơn bác Tư trong chợ', isCorrect: false },
              { id: 'd', text: 'Vì đăng lên nhóm thì nhiều người thấy hơn', isCorrect: false },
            ],
            explanation:
              'Ba yếu tố cộng lại. Chị không bán thịt nên không có động cơ, khiến lời chị không bị nghi. Chị là người đã lan tin nên lời đính chính mang tính tự nhận lỗi, thứ rất hiếm và rất được lắng nghe. Và quan trọng nhất: chị đi đúng con đường mà tin sai đã đi — cùng những nhóm đó, cùng những người đó. Đính chính chỉ đến được với người đã đọc tin sai nếu nó đi cùng một con đường.',
          },
          {
            type: 'text',
            title: 'Nhưng đính chính không đuổi kịp tin sai',
            paragraphs: [
              'Bài của chị Hằng có bốn lượt thích và hai bình luận.',
              'Cái tin nhắn ban đầu thì đã được chuyển tiếp qua năm cấp và tới hàng trăm người.',
              'Cháu bác Tư nói: "Cái này là bình thường chị ơi. Tin đính chính không bao giờ lan bằng tin gốc."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Lý do thì dễ hiểu khi đã nghĩ tới.',
              'Tin gốc mang lại cho người chia sẻ một cảm giác có ích: tôi vừa cảnh báo được người thân. Tin đính chính thì không mang lại gì — chia sẻ nó nghĩa là thừa nhận lần trước mình đã sai.',
              'Thêm nữa, tin gốc đơn giản và dứt khoát; tin đính chính thì luôn phức tạp hơn, vì nó phải giải thích một chỗ tinh tế.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đính chính luôn ở thế bất lợi',
            variant: 'warning',
            text: 'Tin sai thì ngắn, mới lạ, gây cảm xúc và cho người chia sẻ cảm giác hữu ích. Đính chính thì dài, phức tạp, và đòi người chia sẻ thừa nhận mình từng sai. Đó là lý do việc không chuyển tiếp một tin chưa kiểm chứng có giá trị lớn hơn nhiều so với việc đi đính chính sau đó.',
          },
          {
            type: 'text',
            title: 'Hai tuần sau',
            paragraphs: [
              'Doanh thu của bác Tư về lại mức bình thường sau khoảng hai tuần.',
              'Không phải nhờ tờ giấy ép nhựa, cũng không hẳn nhờ bài đăng của chị Hằng.',
              'Chủ yếu là vì có một tin đồn khác nổi lên — lần này về nước mắm — và cả chợ chuyển sang bàn chuyện đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư thấy chuyện này vừa buồn cười vừa đáng lo.',
              'Vấn đề của bác được giải quyết không phải vì người ta hiểu ra, mà vì người ta quên đi.',
              '"Vậy là lần sau có tin gì nữa thì cũng y vậy hả con?"',
              '"Dạ. Trừ khi bác chuẩn bị sẵn."',
            ],
          },
          {
            type: 'question',
            question:
              'Với một người buôn bán nhỏ, cách chuẩn bị hiệu quả nhất trước những đợt tin đồn tiếp theo là gì?',
            options: [
              { id: 'a', text: 'Theo dõi tin tức mỗi ngày để phản ứng nhanh', isCorrect: false },
              { id: 'b', text: 'Xây sẵn quan hệ tin cậy với khách quen và có sẵn một cách chỉ vào nguồn, thay vì đi tranh luận từng lần', isCorrect: true },
              { id: 'c', text: 'Đăng bài phản bác mỗi khi có tin đồn', isCorrect: false },
              { id: 'd', text: 'Đổi sản phẩm mỗi khi có tin đồn liên quan', isCorrect: false },
            ],
            explanation:
              'Không ai bán hàng rong có thời gian theo dõi tin tức mỗi ngày, và tranh luận từng lần thì luôn ở thế người có lợi ích. Thứ dùng được lâu dài là hai việc rẻ: quan hệ tin cậy tích luỹ qua nhiều năm — thứ khiến khách quen hỏi bạn trước khi tin tin nhắn — và một cách chỉ vào nguồn để người ta tự đọc thay vì nghe bạn bào chữa.',
          },
          {
            type: 'text',
            title: 'Bác Tư làm hai việc',
            paragraphs: [
              '📄 Bác giữ luôn tờ giấy ép nhựa, và thêm vào đó bảng thành phần nguyên liệu bác dùng, ghi rõ mua ở đâu.',
              '👥 Bác lập một nhóm nhỏ trên ứng dụng nhắn tin với khoảng bốn chục khách quen — ban đầu để nhận đặt hàng, nhưng cũng là chỗ bác nói được trực tiếp khi có chuyện.',
              'Việc thứ hai quan trọng hơn việc thứ nhất, và bác nhận ra điều đó sau này.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Khi tin đồn về nước mắm nổi lên, một khách trong nhóm nhắn hỏi bác: "Chú Tư ơi chú có nghe vụ nước mắm không chú?"',
              'Người ta hỏi bác trước khi tin, thay vì tin rồi mới nghe bác giải thích.',
              'Khoảng cách giữa hai thứ đó là toàn bộ khác biệt.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Khi bạn là người bị tin đồn nhắm tới',
            description: 'Cách nói lại mà không rơi vào thế người bào chữa.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao bạn ở thế bất lợi',
                  paragraphs: [
                    'Bạn có lợi ích trong chuyện này, nên mọi lời giải thích của bạn đều bị nghi ngờ, kể cả khi đúng.',
                    'Đây không phải là người ta bất công với bạn — việc cảnh giác với lời của bên có lợi ích là một phản xạ hợp lý.',
                    'Sai lầm chỉ xảy ra khi người ta dùng lợi ích của bạn để kết luận bạn sai, thay vì chỉ để tăng mức độ kiểm chứng.',
                  ],
                },
                {
                  heading: 'Ba cách thoát khỏi vai người bào chữa',
                  paragraphs: [
                    'Chỉ vào nguồn thay vì nói thay nguồn: in ra, treo lên, đưa cho người ta tự đọc.',
                    'Nhờ một người không có lợi ích nói giúp — đặc biệt là người đã từng lan tin đó.',
                    'Minh bạch hơn mức được yêu cầu: công khai thành phần, nguồn nguyên liệu, quy trình. Nó không phản bác tin đồn nhưng nó xây thứ mà tin đồn không phá được.',
                  ],
                },
                {
                  heading: 'Chuẩn bị trước cho lần sau',
                  paragraphs: [
                    'Xây kênh liên lạc trực tiếp với khách quen. Khi có chuyện, bạn nói được với họ trước khi tin đồn tới.',
                    'Quan hệ tin cậy tích luỹ nhiều năm là thứ khiến người ta hỏi bạn trước khi tin — và hỏi trước khi tin thì khác hẳn tin rồi mới nghe giải thích.',
                    'Đừng chờ tới lúc có tin đồn mới xây hai thứ trên.',
                  ],
                },
              ],
              relatedConcepts: ['Ad hominem', 'Xung đột lợi ích', 'Bất đối xứng giữa tin sai và đính chính'],
              furtherReading: [
                'Bài học "Ad hominem" và "Tin giả" trong khoá Logic 101',
                'Nghiên cứu về tốc độ lan truyền của tin sai so với tin đính chính trên mạng xã hội',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Việc người nói có lợi ích là lý do để kiểm chứng kỹ hơn, không phải lý do để kết luận họ sai.\n' +
              '✓ Khi bạn là bên có lợi ích, hãy chỉ vào nguồn thay vì nói thay nguồn — bạn thoát khỏi vai người bào chữa.\n' +
              '✓ Đính chính chỉ đến được với người đã đọc tin sai nếu nó đi cùng con đường mà tin sai đã đi.\n' +
              '✓ Không chuyển tiếp một tin chưa kiểm chứng có giá trị lớn hơn nhiều so với đi đính chính sau đó.',
          },
          {
            type: 'text',
            title: 'Nhưng bác Tư vẫn còn một băn khoăn',
            paragraphs: [
              'Tối đó bác hỏi cháu một câu mà nó phải suy nghĩ khá lâu mới trả lời được.',
              '"Con nói cái tin đó nó nói quá. Nhưng nếu lần sau có cái tin nào nó nói đúng thật thì sao? Tao cũng đâu có biết đâu."',
              '"Bác cứ bỏ hết mấy cái tin đồn thì có bữa bác bỏ nhầm cái đáng nghe."',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'bo-nham-cai-dang-nghe',
        title: 'Sợ nhất là bỏ nhầm cái đáng nghe',
        blocks: [
          {
            type: 'text',
            title: 'Câu hỏi của bác Tư',
            paragraphs: [
              '"Nếu lần sau có cái tin nào nó nói đúng thật thì sao?"',
              'Cháu bác Tư ngồi im khá lâu. Nó nhận ra câu hỏi này khó hơn tất cả những gì nó vừa giải thích cho bác trong hai tuần.',
              'Vì bác nói đúng: nếu bác học được bài học "đừng tin tin đồn" thì bác vừa đổi một sai lầm này lấy một sai lầm khác.',
            ],
          },
          {
            type: 'callout',
            icon: 'scale',
            title: 'Hai loại sai lầm',
            variant: 'info',
            text: 'Tin nhầm một tin sai: bác Tư bỏ pate, mất khách quen, thiệt hại thật. Bỏ qua nhầm một tin đúng: nếu lần tới có cảnh báo thật về một loại nguyên liệu bác đang dùng, bác lờ đi vì "lại tin đồn nữa". Loại sai lầm thứ hai ít được nhắc tới hơn nhưng có thể nặng hơn nhiều.',
          },
          {
            type: 'question',
            question:
              'Sau khi bị một tin đồn làm mất khách, phản ứng nào là hợp lý nhất?',
            options: [
              { id: 'a', text: 'Từ nay không tin bất kỳ tin cảnh báo nào lan trên mạng', isCorrect: false },
              { id: 'b', text: 'Không thay đổi gì, vì tin đồn rồi cũng qua', isCorrect: false },
              { id: 'c', text: 'Giữ nguyên việc xem xét mọi tin, nhưng có một quy trình để phân loại nhanh trước khi phản ứng', isCorrect: true },
              { id: 'd', text: 'Chỉ tin những gì cơ quan nhà nước công bố', isCorrect: false },
            ],
            explanation:
              'Phương án a là hoài nghi toàn phần: nó bảo vệ bạn khỏi tin sai nhưng làm bạn điếc trước cảnh báo thật. Phương án b là không học gì. Phương án d nghe an toàn nhưng bỏ mất rất nhiều nguồn tốt và cũng không giải quyết được việc diễn giải sai. Thứ cần thiết là một bộ lọc — không phải một cánh cửa đóng hay mở, mà một cách phân loại nhanh để biết cái nào đáng dừng lại.',
          },
          {
            type: 'text',
            title: 'Ba câu của bác Tư',
            paragraphs: [
              'Hai bác cháu ngồi rút gọn tất cả xuống thành ba câu mà bác nhớ được, viết ra giấy dán trong xe:',
              '1️⃣ Cái này nó nói nó lấy ở đâu ra?',
              '2️⃣ Tin này có từ hồi nào?',
              '3️⃣ Nó kêu tao làm gì liền không?',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu thứ ba là câu bác Tư tự nghĩ ra, và cháu bác thấy nó hay nhất.',
              'Một cảnh báo thật hiếm khi đòi bạn phải hành động ngay trong hôm nay. Nó nói cho bạn biết, nêu điều kiện, và để bạn tự cân nhắc.',
              'Còn một tin được viết để lan thì luôn kèm một mệnh lệnh: hãy chia sẻ ngay, hãy ngừng ăn ngay, hãy bỏ ngay.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Mức độ khẩn cấp là một tín hiệu, không phải một thông tin',
            variant: 'info',
            text: 'Cùng một nội dung có thể được trình bày bình thản hoặc gấp gáp, và cách trình bày không thay đổi nội dung. Nhưng nó thay đổi hành vi của người đọc: gấp gáp làm giảm thời gian suy nghĩ. Vì thế mức độ khẩn cấp trong một tin nên được đọc như thông tin về người viết, chứ không phải thông tin về sự việc.',
          },
          {
            type: 'question',
            question:
              'Một cảnh báo thật sự nghiêm trọng thì trông khác một tin đồn ở chỗ nào?',
            options: [
              { id: 'a', text: 'Nó được viết bằng ngôn ngữ trang trọng hơn', isCorrect: false },
              { id: 'b', text: 'Nó chỉ được nguồn gốc, nêu rõ điều kiện và phạm vi áp dụng, và không kèm mệnh lệnh phải hành động ngay lập tức', isCorrect: true },
              { id: 'c', text: 'Nó luôn xuất hiện trên báo chí chính thống trước', isCorrect: false },
              { id: 'd', text: 'Nó có ít lượt chia sẻ hơn', isCorrect: false },
            ],
            explanation:
              'Ngôn ngữ trang trọng thì bắt chước được, và tin đồn hoàn toàn có thể lên báo chính thống dưới dạng tiêu đề giật gân. Ba dấu hiệu đáng tin cậy hơn là: có chỉ được nguồn gốc, có nêu điều kiện và phạm vi (ai bị ảnh hưởng, ở mức nào), và không thúc ép hành động tức thì. Ba dấu hiệu này khó giả hơn nhiều so với giọng văn.',
          },
          {
            type: 'text',
            title: 'Một tin sau đó là tin thật',
            paragraphs: [
              'Ba tháng sau, có một đợt cảnh báo về một loại phẩm màu bị phát hiện trong một số lô tương ớt bán lẻ.',
              'Lần này tin đến từ một thông báo của cơ quan quản lý an toàn thực phẩm, có số hiệu văn bản, có tên nhà sản xuất, có số lô cụ thể.',
              'Bác Tư đọc, thấy nó chỉ được nguồn, có ngày tháng, có phạm vi rõ ràng, và không kêu bác phải làm gì gấp.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác kiểm tra chai tương ớt bác đang dùng. Khác nhà sản xuất, khác lô.',
              'Bác không cần bỏ gì cả. Nhưng bác biết chính xác vì sao mình không cần bỏ — chứ không phải vì bác đã quyết định không tin tin đồn nữa.',
              'Đó là khác biệt giữa một người hoài nghi tất cả và một người biết phân loại.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác cũng làm thêm một việc: bác chụp cái thông báo đó gửi vào nhóm bốn chục khách quen, kèm dòng chữ "Tui coi rồi, tương ớt tui xài không nằm trong danh sách này nghen bà con."',
              'Không ai hỏi bác cả. Bác chủ động nói trước.',
              'Cháu bác Tư nói đó là thứ mà không một tờ giấy ép nhựa nào làm được.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Hoài nghi toàn phần cũng là một dạng lười',
            variant: 'warning',
            text: '"Không tin gì hết" nghe có vẻ tỉnh táo, nhưng nó tiết kiệm công sức y hệt như "tin hết". Cả hai đều là một quy tắc duy nhất áp cho mọi trường hợp, để khỏi phải xem xét từng cái. Tư duy phản biện thật sự thì tốn công hơn cả hai: nó đòi bạn phân loại từng tin, và chấp nhận rằng có những tin bạn phải để ngỏ vì chưa đủ căn cứ.',
          },
          {
            type: 'text',
            title: 'Điều cháu bác Tư học được',
            paragraphs: [
              'Cháu bác Tư viết trong bài tập môn Tư duy phản biện ở trường:',
              '"Em vào cuộc với ý nghĩ sẽ dạy ông bác em cách phân biệt tin thật tin giả. Nhưng ông bác em không cần biết đọc nghiên cứu. Ông cần ba câu hỏi ông nhớ được lúc đang bận bán hàng."',
              '"Em nghĩ phần khó nhất của tư duy phản biện không phải là hiểu nó, mà là rút gọn nó thành thứ dùng được vào lúc bảy giờ sáng, trước mặt bốn người khách đang chờ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là điều mà nhiều tài liệu về tư duy phản biện bỏ qua.',
              'Một danh sách hai mươi loại ngụy biện thì đúng nhưng vô dụng với người không có thời gian.',
              'Ba câu hỏi thì thiếu sót, bỏ lọt nhiều trường hợp — nhưng chúng được dùng thật, mỗi ngày, bởi một người bán bánh mì.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao một bộ ba câu hỏi đơn giản lại có thể hữu ích hơn một danh sách đầy đủ các loại ngụy biện?',
            options: [
              { id: 'a', text: 'Vì các loại ngụy biện phần lớn không quan trọng', isCorrect: false },
              { id: 'b', text: 'Vì một công cụ chỉ có giá trị khi nó thực sự được dùng, và công cụ phức tạp thì không được dùng vào đúng lúc cần', isCorrect: true },
              { id: 'c', text: 'Vì ba câu hỏi bao quát được mọi trường hợp', isCorrect: false },
              { id: 'd', text: 'Vì người ít học không hiểu được danh sách dài', isCorrect: false },
            ],
            explanation:
              'Ba câu hỏi rõ ràng bỏ lọt nhiều thứ — chúng không bắt được ngụy biện người rơm hay lập luận vòng tròn. Nhưng chúng có một ưu điểm quyết định: chúng được nhớ và được dùng trong hai giây, đúng lúc người ta sắp bấm nút chuyển tiếp. Một công cụ đầy đủ mà không ai mở ra thì hiệu quả thực tế bằng không.',
          },
          {
            type: 'text',
            title: 'Người thứ ba trong chuỗi',
            paragraphs: [
              'Có một chuyện nhỏ mà bác Tư kể lại với vẻ khá đắc ý.',
              'Một hôm bác nghe một cô bán rau đọc to cho cả dãy nghe một tin nhắn mới về thuốc trừ sâu.',
              'Bác không cãi. Bác chỉ hỏi vọng sang: "Cô ơi cái tin đó nó ghi ngày mấy vậy cô?"',
              'Cô bán rau lật lên lật xuống rồi nói: "Ủa, nó hổng có ghi ngày."',
            ],
          },
          {
            type: 'text',
            title: 'Bác Tư nói lại với chị Hằng',
            paragraphs: [
              'Chị Hằng vẫn áy náy về chuyện đã lan tin. Bác Tư gạt đi.',
              '"Cô gửi là cô lo cho bà con chớ cô có ý gì đâu. Ai mà chẳng gửi."',
              'Rồi bác chỉ vào tờ giấy dán trong xe: "Từ rày cô gửi gì thì cô coi ba câu này trước. Coi hết ba câu mà thấy ổn thì cô gửi, tui không có ý kiến gì."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Chị Hằng chép ba câu đó ra một mảnh giấy và dán vào sạp trái cây của mình.',
              'Cháu bác Tư nhìn hai mảnh giấy giống nhau ở hai cái sạp cạnh nhau, và nghĩ rằng đây có lẽ là cách thứ này lan đi thật sự — không phải qua khoá học, mà qua việc một người dán lên rồi người bên cạnh chép theo.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Phân loại thay vì tin hoặc không tin',
            description: 'Bộ ba câu hỏi dùng được trong hai giây, và vì sao hoài nghi toàn phần cũng là một sai lầm.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai loại sai lầm cần cân bằng',
                  paragraphs: [
                    'Tin nhầm một tin sai: thay đổi hành vi, mất tiền, gây hại cho người khác vì lan tiếp.',
                    'Bỏ qua nhầm một tin đúng: lờ đi một cảnh báo thật vì đã quyết định không tin gì nữa.',
                    'Một quy tắc cứng theo hướng nào cũng chỉ tránh được một loại sai lầm và làm nặng thêm loại kia.',
                  ],
                },
                {
                  heading: 'Ba câu hỏi trong hai giây',
                  paragraphs: [
                    'Cái này nó nói nó lấy ở đâu ra? Có chỉ được nguồn thì đi tới đó xem; không chỉ được thì đừng chuyển tiếp.',
                    'Tin này có từ bao giờ? Rất nhiều tin lan mạnh là tin cũ nhiều năm được thả lại.',
                    'Nó kêu tôi làm gì ngay không? Cảnh báo thật hiếm khi thúc ép hành động tức thì; tin được viết để lan thì gần như luôn có một mệnh lệnh.',
                  ],
                },
                {
                  heading: 'Dấu hiệu của một cảnh báo đáng dừng lại',
                  paragraphs: [
                    'Chỉ được nguồn gốc cụ thể: tên cơ quan, số hiệu văn bản, tên nghiên cứu, ngày công bố.',
                    'Nêu rõ phạm vi: ai bị ảnh hưởng, ở mức tiêu thụ hoặc điều kiện nào, sản phẩm hay lô nào.',
                    'Không thúc ép: nó thông báo và để bạn tự cân nhắc, thay vì ra lệnh và giục chia sẻ.',
                  ],
                },
              ],
              relatedConcepts: ['Phân loại thông tin', 'Hoài nghi toàn phần', 'Mức độ khẩn cấp như một tín hiệu'],
              furtherReading: [
                'Bài học "CRAAP test" và "Tổng kết — Bạn sẽ làm gì" trong khoá Logic 101',
                'Thông báo thu hồi sản phẩm của cơ quan quản lý an toàn thực phẩm — mẫu của một cảnh báo có cấu trúc đầy đủ',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Có hai loại sai lầm đối xứng: tin nhầm tin sai, và bỏ qua nhầm một cảnh báo thật.\n' +
              '✓ Hoài nghi toàn phần cũng lười y như cả tin — cả hai đều là một quy tắc áp cho mọi trường hợp để khỏi phải xem xét.\n' +
              '✓ Mức độ khẩn cấp trong một tin là thông tin về người viết, không phải thông tin về sự việc.\n' +
              '✓ Một công cụ chỉ có giá trị khi nó được dùng thật — ba câu hỏi nhớ được hơn hẳn một danh sách đầy đủ không ai mở.',
          },
          {
            type: 'text',
            title: 'Điều bác Tư mang theo',
            paragraphs: [
              'Bác Tư vẫn bán bánh mì có pate, vẫn ít hơn ngày xưa một chút và nhiều rau hơn một chút.',
              'Tờ giấy ba câu hỏi vẫn dán trong xe, cạnh ba câu về lừa đảo mà bác dán từ trước.',
              'Bác không trở thành người giỏi phân tích. Bác chỉ trở thành người dừng lại hai giây trước khi bấm chuyển tiếp.',
              '"Hồi trước tao nghe cái gì tao cũng tin, rồi tao gửi liền," bác nói. "Giờ tao vẫn nghe, mà tao hỏi nó lấy ở đâu ra cái đã."',
            ],
          },
        ],
      },
    ],
  },
};
