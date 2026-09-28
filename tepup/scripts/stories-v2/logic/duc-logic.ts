import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Đức × Logic 101 — "Group tài xế nói gì".
 *
 * Đức sống trong một nhóm kín năm nghìn người, nơi thông tin về nghề nghiệp của
 * anh vừa là nguồn tin thật vừa là nguồn tin đồn. Câu chuyện đi qua ba ngụy biện
 * mà anh gặp mỗi ngày: lưỡng nan giả, whataboutism, và người rơm.
 */
export const DUC_LOGIC: StorySeed = {
  slug: 'duc-logic',
  characterSlug: 'gig-driver',
  title: 'Group tài xế nói gì',
  teaser:
    'Trong nhóm kín năm nghìn tài xế, một tin nhắn nói app sắp cắt thưởng. Bốn trăm người tin trong một đêm. Đức suýt nghỉ chạy vì nó.',
  icon: 'users',
  estimatedTime: '~30 phút',
  sortOrder: 3,
  courseSlugs: [COURSE.logic],
  part: {
    name: 'Đức và cái nhóm năm nghìn người',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'group-nam-nghin-tai-xe',
        title: 'Nhóm năm nghìn tài xế',
        blocks: [
          {
            type: 'text',
            title: 'Mười giờ đêm, trong nhóm',
            paragraphs: [
              'Đức nằm nghỉ sau ca chạy, mở nhóm kín "Anh em tài xế khu vực" — năm nghìn hai trăm thành viên.',
              'Bài đăng mới nhất có bốn trăm bình luận trong hai tiếng.',
              'Nội dung: "Tin nội bộ nhé anh em. Từ đầu tháng sau app cắt hết thưởng chuyến, chỉ còn giá cuốc. Người nhà mình làm bên đó nói vậy. Anh em liệu mà tính."',
            ],
          },
          {
            type: 'callout',
            icon: 'message-square',
            title: 'Bốn trăm bình luận trong hai tiếng',
            variant: 'warning',
            text: '"Vậy chạy làm gì nữa." — "Tui nghỉ luôn từ tuần sau." — "Bọn nó ăn dày quá rồi." — "Anh em đình công đi." — "Bên kia có tốt hơn không ai biết không?" Trong bốn trăm bình luận, có bảy bình luận hỏi nguồn tin ở đâu.',
          },
          {
            type: 'question',
            question:
              'Bốn trăm người phản ứng, bảy người hỏi nguồn. Điều gì giải thích tỷ lệ này tốt nhất?',
            options: [
              { id: 'a', text: 'Tài xế nói chung thiếu kỹ năng kiểm chứng thông tin', isCorrect: false },
              { id: 'b', text: 'Tin này chạm vào thu nhập của họ, và khi thấy bị đe doạ trực tiếp thì người ta phản ứng trước, kiểm chứng sau', isCorrect: true },
              { id: 'c', text: 'Nhóm kín không cho phép hỏi nguồn tin', isCorrect: false },
              { id: 'd', text: 'Vì tin đó chắc chắn đúng nên không ai cần hỏi', isCorrect: false },
            ],
            explanation:
              'Không phải vấn đề trình độ. Đây là cơ chế chung: khi một thông tin chạm vào thứ ta sợ mất, phần não phản ứng đi trước phần não kiểm tra. Cùng những người này, khi đọc một tin về chính sách ở nước khác, sẽ hỏi nguồn ngay. Mức độ liên quan tới bản thân càng cao thì khả năng dừng lại để kiểm chứng càng thấp — đúng lúc ta cần nó nhất.',
          },
          {
            type: 'text',
            title: 'Đức tính nghỉ chạy',
            paragraphs: [
              'Thưởng chuyến chiếm khoảng một phần ba thu nhập của Đức. Cắt hết thì mỗi tháng anh hụt gần bốn triệu.',
              'Đêm đó anh không ngủ được. Anh tính: nếu đúng vậy thì anh phải chuyển sang app khác, hoặc bỏ nghề tài xế đi tìm việc trong xưởng.',
              'Sáng hôm sau anh gọi cho một người anh quen, chạy bên app kia, hỏi thăm về việc chuyển qua.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Người anh đó hỏi lại một câu: "Mà mày nghe tin đó ở đâu?"',
              '"Trong group. Có người nói người nhà làm bên đó."',
              '"Người nhà nào? Làm bộ phận gì? Mày có hỏi không?"',
              'Đức im. Anh không hỏi. Bốn trăm người khác cũng không.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Nguồn "người nhà làm bên đó"',
            variant: 'info',
            text: 'Cụm này xuất hiện trong gần như mọi tin đồn nội bộ, và nó có một đặc điểm rất tiện: nó tạo cảm giác có nguồn mà không cung cấp bất cứ thứ gì kiểm chứng được. Không tên, không bộ phận, không ngày. Người nghe điền vào chỗ trống bằng hình dung của chính mình về một người đáng tin.',
          },
          {
            type: 'question',
            question: 'Vì sao "người nhà tôi làm bên đó" lại hiệu quả hơn "tôi đọc trên mạng"?',
            options: [
              { id: 'a', text: 'Vì nó chứng minh người nói có thông tin nội bộ thật', isCorrect: false },
              { id: 'b', text: 'Vì nó mượn sự tin cậy của một quan hệ cá nhân mà người nghe không kiểm tra được', isCorrect: true },
              { id: 'c', text: 'Vì người nhà thì không bao giờ nói dối', isCorrect: false },
              { id: 'd', text: 'Vì nó cho thấy người nói đã kiểm chứng', isCorrect: false },
            ],
            explanation:
              'Nó hoạt động bằng cách mượn uy tín. "Trên mạng" là một nguồn vô danh nên bị nghi ngay. "Người nhà tôi" gợi lên hình ảnh một con người cụ thể, có quan hệ ràng buộc, nên đáng tin. Nhưng người nghe không biết người đó là ai, làm gì, có thật không — họ chỉ được mượn cảm giác tin cậy mà không được cấp thứ để kiểm tra.',
          },
          {
            type: 'text',
            title: 'Đức quay lại nhóm và hỏi',
            paragraphs: [
              'Anh bình luận dưới bài: "Anh cho hỏi người nhà anh làm bộ phận nào bên đó vậy anh? Với có văn bản gì không anh?"',
              'Không có câu trả lời. Nhưng có bốn người vào bình luận dưới câu hỏi của anh.',
              '"Ông này chắc là seeder của app rồi." — "Bênh app dữ ha." — "Anh em đang khổ mà ông vô bắt bẻ." — "Chắc chạy được nhiều nên không quan tâm."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức thấy khó chịu, và anh cũng thấy hơi sợ. Anh im luôn, không hỏi tiếp.',
              'Không ai trả lời câu hỏi của anh. Nhưng bốn người đã trả lời về con người anh.',
              'Và cách đó hiệu quả: nó làm anh ngừng hỏi, và nó làm những người khác thấy rằng hỏi thì sẽ bị như vậy.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Cái giá của việc đặt câu hỏi trong một nhóm đang giận',
            variant: 'warning',
            text: 'Trong một cộng đồng đang có cảm xúc mạnh, người hỏi "có bằng chứng không" dễ bị đọc thành người đứng về phía bên kia. Đây không phải chuyện logic mà là chuyện xã hội: đặt câu hỏi bị hiểu là không cùng phe. Kết quả là nhóm mất đúng những người có thể giúp nó khỏi sai.',
          },
          {
            type: 'text',
            title: 'Ba ngày sau',
            paragraphs: [
              'App gửi thông báo chính thức trong ứng dụng: cơ cấu thưởng có thay đổi từ tháng sau. Thưởng theo chuyến giảm, nhưng có thêm thưởng theo giờ cao điểm và thưởng tuần.',
              'Tính ra, với người chạy nhiều giờ cao điểm như Đức, thu nhập gần như không đổi. Với người chạy rải rác thì giảm khoảng mười phần trăm.',
              'Không phải "cắt hết thưởng". Cũng không phải "không có gì thay đổi".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức nhận ra tin đồn đó có một cái lõi thật: đúng là có thay đổi cơ cấu thưởng.',
              'Phần bị bóp méo là mức độ và hình dạng của thay đổi đó.',
              'Và đây mới là loại tin đồn khó nhất — không phải tin bịa hoàn toàn, mà tin có lõi thật bị phóng lên thành phiên bản cực đoan nhất.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Tin đồn thường không bịa, chỉ phóng đại',
            variant: 'info',
            text: 'Một tin bịa hoàn toàn dễ bị bác bỏ và chết nhanh. Tin sống lâu nhất là tin có lõi thật: nó chống lại được lời phản bác đầu tiên, vì khi bị chất vấn thì người lan tin có thể lùi về phần lõi và nói "thì có thay đổi thật mà". Cách chống lại không phải là hỏi "đúng hay sai" mà là hỏi "đúng tới mức nào".',
          },
          {
            type: 'question',
            question: 'Với một tin có lõi thật nhưng bị phóng đại, câu hỏi nào hữu ích nhất?',
            options: [
              { id: 'a', text: '"Tin này đúng hay sai?"', isCorrect: false },
              { id: 'b', text: '"Cụ thể là thay đổi cái gì, mức nào, áp dụng cho ai, từ khi nào?"', isCorrect: true },
              { id: 'c', text: '"Ai là người đầu tiên nói ra?"', isCorrect: false },
              { id: 'd', text: '"Có bao nhiêu người tin tin này?"', isCorrect: false },
            ],
            explanation:
              'Hỏi "đúng hay sai" với một tin có lõi thật thì luôn nhận được câu trả lời "đúng", và cuộc trao đổi dừng ở đó. Bốn câu hỏi về mức độ và phạm vi — cái gì, mức nào, cho ai, từ khi nào — mới tách được phần lõi khỏi phần phóng đại. Chúng cũng là những câu mà một tin đồn không bao giờ trả lời được, còn một thông báo thật thì luôn có sẵn.',
          },
          {
            type: 'text',
            title: 'Vì sao nhóm không tự sửa được',
            paragraphs: [
              'Đức nghĩ mãi vì sao trong năm nghìn người, không ai đứng ra nói lại.',
              'Anh nhận ra: những người biết rõ nhất thì lại là những người ít lên tiếng nhất. Ai chạy được nhiều, thu nhập ổn, thì im — vì nói ra sẽ bị coi là khoe hoặc bị coi là bênh app.',
              'Còn ai đang khó khăn nhất thì nói nhiều nhất, và tin đồn xấu thì hợp với thứ họ đang cảm thấy.',
            ],
          },
          {
            type: 'text',
            title: 'Bốn trăm người, một tuần sau',
            paragraphs: [
              'Đức quay lại xem bài đăng cũ. Nó vẫn ở đó, vẫn bốn trăm bình luận.',
              'Không có ai vào đính chính. Người đăng cũng không.',
              'Nhưng trong nhóm đã có bài mới, về một chuyện khác, cũng bốn trăm bình luận.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức đếm thử trong nhóm: trong một tháng có mười một bài dạng "tin nội bộ" như vậy.',
              'Anh kiểm tra lại được bốn cái. Ba cái sai hoàn toàn, một cái đúng phần lõi và sai phần mức độ.',
              'Bảy cái còn lại thì không có cách nào kiểm tra, và cũng không ai nhắc lại nữa.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Tin đồn trong nhóm nghề nghiệp',
            description: 'Vì sao nhóm càng gắn bó thì tin đồn càng lan mạnh, và bốn câu hỏi tách lõi khỏi phóng đại.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao nhóm nghề nghiệp là môi trường thuận lợi',
                  paragraphs: [
                    'Thông tin chạm trực tiếp vào thu nhập, nên phản ứng đi trước kiểm chứng.',
                    'Mọi người cùng ở một phía và có chung một đối tượng để lo lắng, nên tin xấu về phía kia dễ được chấp nhận hơn tin tốt.',
                    'Người đặt câu hỏi dễ bị đọc thành người không cùng phe, nên chi phí xã hội của việc kiểm chứng rất cao.',
                  ],
                },
                {
                  heading: 'Nhận ra một nguồn không kiểm chứng được',
                  paragraphs: [
                    '"Người nhà tôi làm bên đó", "nghe nói bên trên sắp", "có anh làm quản lý nói" — mượn uy tín của một quan hệ cá nhân mà người nghe không kiểm tra được.',
                    'Không tên, không bộ phận, không ngày, không văn bản.',
                    'Câu hỏi tối thiểu: cụ thể là ai, làm gì, và có văn bản nào không?',
                  ],
                },
                {
                  heading: 'Bốn câu tách lõi khỏi phóng đại',
                  paragraphs: [
                    'Cụ thể là thay đổi cái gì?',
                    'Mức độ bao nhiêu?',
                    'Áp dụng cho ai — tất cả hay một nhóm?',
                    'Từ khi nào, và có thông báo chính thức chưa?',
                    'Tin đồn hầu như không trả lời được bốn câu này; thông báo thật thì luôn có sẵn.',
                  ],
                },
              ],
              relatedConcepts: ['Tin đồn có lõi thật', 'Mượn uy tín', 'Chi phí xã hội của việc kiểm chứng'],
              furtherReading: [
                'Bài học "Tin giả" và "CRAAP test" trong khoá Logic 101',
                'Nghiên cứu về lan truyền thông tin trong các nhóm kín trên nền tảng nhắn tin',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Khi thông tin chạm vào thứ ta sợ mất, phản ứng đi trước kiểm chứng — đúng lúc ta cần kiểm chứng nhất.\n' +
              '✓ "Người nhà tôi làm bên đó" mượn uy tín của một quan hệ mà người nghe không kiểm tra được.\n' +
              '✓ Tin sống lâu nhất là tin có lõi thật bị phóng lên phiên bản cực đoan nhất, không phải tin bịa hoàn toàn.\n' +
              '✓ Hỏi "đúng tới mức nào" thay vì "đúng hay sai": cái gì, mức nào, cho ai, từ khi nào.',
          },
          {
            type: 'text',
            title: 'Nhưng có một chuyện làm Đức nghĩ ngợi',
            paragraphs: [
              'Trong bốn trăm bình luận đêm đó, có một câu lặp đi lặp lại: "Không chịu thì nghỉ, ai bắt."',
              'Câu đó có vẻ hiển nhiên tới mức không ai cãi.',
              'Nhưng Đức thấy nó sai chỗ nào đó, và anh mất một thời gian mới gọi tên được cái sai đó.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'khong-chiu-thi-nghi',
        title: '"Không chịu thì nghỉ, ai bắt"',
        blocks: [
          {
            type: 'text',
            title: 'Câu nói ai cũng gật',
            paragraphs: [
              'Trong nhóm, mỗi khi có ai than về điều kiện làm việc, sẽ có người viết: "Không chịu thì nghỉ, ai bắt."',
              'Câu đó thường được nhiều lượt thích, và thường làm cuộc trao đổi dừng lại.',
              'Đức thấy nó sai, nhưng anh không cãi được — vì đúng là không ai bắt anh chạy xe cả.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Lưỡng nan giả (false dilemma)',
            variant: 'info',
            text: 'Là ngụy biện trình bày một tình huống như thể chỉ có hai lựa chọn, trong khi thực tế còn nhiều lựa chọn khác. "Không chịu thì nghỉ" đặt Đức trước hai cửa: chấp nhận tất cả, hoặc bỏ nghề. Nó xoá mất cửa thứ ba, thứ tư và thứ năm.',
          },
          {
            type: 'question',
            question:
              'Ngoài "chấp nhận tất cả" và "nghỉ việc", còn những lựa chọn nào khác?',
            mode: 'multiple',
            options: [
              { id: 'a', text: 'Chấp nhận phần lớn nhưng yêu cầu thay đổi một điểm cụ thể', isCorrect: true },
              { id: 'b', text: 'Cùng nhiều người khác đề nghị thương lượng về một điều khoản', isCorrect: true },
              { id: 'c', text: 'Kiến nghị cơ quan quản lý làm rõ một quy định chưa rõ ràng', isCorrect: true },
              { id: 'd', text: 'Không có lựa chọn nào khác, đây là quan hệ tự nguyện giữa hai bên', isCorrect: false },
            ],
            explanation:
              'Ba lựa chọn đầu đều có thật và đều đã xảy ra trong thực tế ở nhiều nơi. Lập luận "quan hệ tự nguyện nên chỉ có nhận hoặc bỏ" bỏ qua một điều: giữa hai đầu của một quan hệ, luôn có không gian thương lượng — và việc thu hẹp không gian đó xuống còn hai cửa là một lựa chọn có lợi cho bên mạnh hơn.',
          },
          {
            type: 'text',
            title: 'Vì sao lưỡng nan giả hiệu quả tới vậy',
            paragraphs: [
              'Đức để ý một điều: câu đó không sai về mặt sự kiện. Không ai bắt anh chạy xe thật.',
              'Cái sai nằm ở chỗ nó trình bày hai lựa chọn cực đoan như thể đó là toàn bộ danh sách.',
              'Và vì cả hai lựa chọn đều có thật, người nghe khó chỉ ra chỗ sai — họ chỉ cảm thấy có gì đó không ổn.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Thêm nữa, lưỡng nan giả thường chọn hai đầu mút theo cách rất bất lợi cho người nghe.',
              'Một bên là chấp nhận hoàn toàn — dễ dàng nhưng phải nuốt mọi thứ. Một bên là từ bỏ hoàn toàn — mất hết thu nhập.',
              'Đặt cạnh nhau như vậy thì lựa chọn đầu tiên trông hợp lý, và người ta chọn nó mà tưởng mình đang tự do lựa chọn.',
            ],
          },
          {
            type: 'perspective-switch',
            title: 'Cùng một câu, ba người nói ra',
            event: 'Trong nhóm tài xế, ai đó viết: "Không chịu thì nghỉ, ai bắt."',
            perspectives: [
              {
                id: 'x1',
                role: 'Một tài xế khác nói câu đó',
                icon: 'bike',
                narrative:
                  'Tôi nói vì tôi mệt với chuyện than vãn. Tôi cũng khổ mà tôi vẫn chạy. Tôi không tính toán gì hết — tôi chỉ đang nói ra sự bất lực của chính tôi dưới dạng một lời khuyên cho người khác.',
              },
              {
                id: 'x2',
                role: 'Người bênh vực nền tảng nói câu đó',
                icon: 'briefcase',
                narrative:
                  'Đây là quan hệ tự nguyện. Anh thấy điều kiện không tốt thì anh đi chỗ khác, thị trường sẽ tự điều chỉnh. Câu này giúp tôi khỏi phải trả lời câu hỏi cụ thể là điều khoản kia có hợp lý hay không.',
              },
              {
                id: 'x3',
                role: 'Đức, sau khi nghĩ kỹ',
                icon: 'user',
                narrative:
                  'Câu này không sai về sự kiện, nhưng nó thu danh sách lựa chọn xuống còn hai. Nó chuyển toàn bộ gánh nặng sang phía tôi, và nó làm cho việc đặt câu hỏi về một điều khoản cụ thể trở thành chuyện vô nghĩa. Điều tôi muốn không phải là nghỉ, mà là làm rõ một điểm.',
              },
            ],
            question: {
              text: 'Điểm chung khiến câu này có tác dụng dừng cuộc trao đổi là gì?',
              options: [
                { id: 'a', text: 'Nó chứng minh được rằng người than phiền đã sai', isCorrect: false },
                { id: 'b', text: 'Nó thay câu hỏi cụ thể đang được bàn bằng một lựa chọn nhị phân mà không ai muốn chọn vế thứ hai', isCorrect: true },
                { id: 'c', text: 'Nó viện dẫn quy định pháp luật', isCorrect: false },
                { id: 'd', text: 'Nó được nhiều người thích nên có sức nặng', isCorrect: false },
              ],
              explanation:
                'Câu hỏi ban đầu có thể rất cụ thể: điều khoản phạt khi huỷ chuyến có hợp lý không? Lưỡng nan giả không trả lời câu đó — nó đổi chủ đề sang "anh có muốn tiếp tục làm việc này hay không". Và vì vế thứ hai quá đắt, người ta bỏ luôn câu hỏi ban đầu. Chú ý rằng người nói ra nó không nhất thiết có ý đồ; hiệu quả thì vẫn như nhau.',
            },
          },
          {
            type: 'text',
            title: 'Câu hỏi bị mất tích',
            paragraphs: [
              'Đức xem lại cuộc trao đổi từ đầu và anh thấy rõ một thứ.',
              'Người đầu tiên hỏi: "Sao huỷ chuyến mà khách không ra thì mình vẫn bị trừ điểm?"',
              'Sau ba mươi bình luận, chủ đề đã thành: ai chịu khó hơn ai, ai hay than vãn, và ai nên nghỉ việc.',
              'Câu hỏi ban đầu không hề được trả lời. Nó chỉ đơn giản là biến mất.',
            ],
          },
          {
            type: 'question',
            question: 'Hiện tượng câu hỏi ban đầu "biến mất" trong một cuộc tranh luận đông người nên được hiểu thế nào?',
            options: [
              { id: 'a', text: 'Đó là chuyện tự nhiên, tranh luận nào cũng đi lan man', isCorrect: false },
              { id: 'b', text: 'Đó là kết quả có thể đoán trước của việc mỗi lần đổi khung là một lần câu hỏi bị đẩy ra xa hơn — và nó luôn có lợi cho bên không muốn trả lời', isCorrect: true },
              { id: 'c', text: 'Đó là do nhóm có quá nhiều thành viên', isCorrect: false },
              { id: 'd', text: 'Đó là dấu hiệu câu hỏi ban đầu không quan trọng', isCorrect: false },
            ],
            explanation:
              'Lan man thì tự nhiên, nhưng hướng lan man thì không ngẫu nhiên. Mỗi lần một câu trả lời đổi khung — từ điều khoản cụ thể sang phẩm chất con người, sang chuyện đi hay ở, sang so sánh với nơi khác — câu hỏi gốc lùi thêm một bước. Và kết quả luôn nghiêng về một phía: bên không muốn trả lời không cần phải thắng, chỉ cần cuộc trao đổi trôi đi đủ xa.',
          },
          {
            type: 'text',
            title: 'Đức ghi lại câu hỏi gốc',
            paragraphs: [
              'Từ đó, khi tham gia một cuộc bàn trong nhóm, Đức làm một việc rất nhỏ: anh chép câu hỏi ban đầu vào phần ghi chú trong điện thoại.',
              'Sau vài chục bình luận, anh mở ra đọc lại.',
              'Nhiều lần anh phát hiện ra rằng cả nhóm đang cãi nhau rất hăng về một thứ chẳng liên quan gì tới câu hỏi lúc đầu.',
            ],
          },
          {
            type: 'text',
            title: 'Cách Đức phá lưỡng nan giả',
            paragraphs: [
              'Đức thử một cách trong lần tiếp theo. Khi có người viết "không chịu thì nghỉ", anh không cãi câu đó.',
              'Anh viết: "Em không tính nghỉ anh. Em chỉ hỏi cái điều khoản phạt huỷ chuyến khi khách không ra, mình có được khiếu nại không thôi ạ."',
              'Anh không phủ nhận vế nào cả. Anh chỉ đưa cuộc trao đổi quay lại câu hỏi cụ thể.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Kết quả khác hẳn lần trước. Có bốn người trả lời đúng vào câu hỏi đó — trong đó hai người chỉ ra chỗ khiếu nại trong ứng dụng mà Đức không biết.',
              'Không ai gọi anh là seeder nữa.',
              'Đức nhận ra: khi anh không tấn công vào cái lưỡng nan, không ai phải bảo vệ nó, và cuộc trao đổi quay lại chỗ có ích.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Không cãi cái khung, hãy quay lại câu hỏi',
            variant: 'info',
            text: 'Khi ai đó đặt bạn vào một lưỡng nan giả, cách kém hiệu quả nhất là tranh luận rằng đó là ngụy biện. Cách hiệu quả là bỏ qua cái khung và nêu lại câu hỏi cụ thể: "Em không nói chuyện nghỉ hay không nghỉ, em hỏi về điều khoản X." Bạn không cần thắng cái khung — bạn chỉ cần không bước vào nó.',
          },
          {
            type: 'question',
            question: 'Vì sao nêu lại câu hỏi cụ thể hiệu quả hơn việc chỉ ra "đây là ngụy biện lưỡng nan giả"?',
            options: [
              { id: 'a', text: 'Vì phần lớn mọi người không biết ngụy biện lưỡng nan giả là gì', isCorrect: false },
              { id: 'b', text: 'Vì gọi tên ngụy biện biến cuộc trao đổi thành tranh cãi về cách tranh luận, còn nêu lại câu hỏi thì giữ nó ở nội dung', isCorrect: true },
              { id: 'c', text: 'Vì gọi tên ngụy biện là hành vi thiếu lịch sự', isCorrect: false },
              { id: 'd', text: 'Vì lưỡng nan giả không phải là ngụy biện thực sự', isCorrect: false },
            ],
            explanation:
              'Gọi tên ngụy biện nghe thì sắc sảo nhưng thường phản tác dụng: người kia phải bảo vệ cách nói của mình, và cuộc trao đổi chuyển từ "điều khoản này có hợp lý không" sang "tôi có ngụy biện không". Nêu lại câu hỏi cụ thể thì không tạo ra ai phải thua, và nó buộc mọi người quay về chỗ có thể trả lời được.',
          },
          {
            type: 'text',
            title: 'Vì sao Đức không muốn nghỉ',
            paragraphs: [
              'Có một chi tiết Đức thấy cần nói rõ, vì nếu không thì cả câu chuyện này nghe như anh đang tìm cớ.',
              'Anh không muốn nghỉ chạy xe. Công việc này cho anh giờ giấc linh hoạt để đưa đón con, và anh chạy đã ba năm nên anh thuộc đường, thuộc khách.',
              'Chính vì anh muốn ở lại lâu dài nên anh mới quan tâm tới mấy cái điều khoản. Người tính nghỉ tuần sau thì hỏi làm gì.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là chỗ mà lưỡng nan giả gây hại nhiều nhất: nó gán cho người đặt câu hỏi cái nhãn của người sắp bỏ đi.',
              'Trong khi thực tế thường ngược lại — người gắn bó nhất mới là người bỏ công tìm hiểu điều khoản.',
              'Một nhóm mà ai hỏi cũng bị coi là kẻ sắp phản bội thì nhóm đó tự đuổi đi những người quan tâm nhất tới nó.',
            ],
          },
          {
            type: 'text',
            title: 'Nhưng có lúc lựa chọn thật sự chỉ có hai',
            paragraphs: [
              'Đức cũng cẩn thận với chính bài học này.',
              'Không phải mọi lựa chọn nhị phân đều là ngụy biện. Có những tình huống thật sự chỉ có hai cửa: ký hợp đồng hay không ký, đi hay ở lại.',
              'Gọi mọi lựa chọn hai cửa là lưỡng nan giả cũng là một kiểu lười — nó cho phép ta né tránh những quyết định thật sự khó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cách phân biệt khá đơn giản: thử liệt kê ra lựa chọn thứ ba.',
              'Nếu bạn nghĩ được một lựa chọn thứ ba cụ thể, khả thi, thì cái nhị phân kia là giả.',
              'Nếu bạn thử mà không nghĩ ra được lựa chọn nào khác ngoài hai cái đó, thì có thể tình huống đúng là chỉ có hai cửa thật — và lúc đó việc cần làm là chọn, không phải đi tìm cửa thứ ba không tồn tại.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Lưỡng nan giả',
            description: 'Nhận ra khi nào danh sách lựa chọn bị cắt bớt, và cách quay lại câu hỏi thật.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Nhận ra nó',
                  paragraphs: [
                    'Tình huống được trình bày như chỉ có hai lựa chọn, và hai lựa chọn đó nằm ở hai đầu cực đoan.',
                    'Một vế dễ chấp nhận nhưng đòi bạn nuốt tất cả; vế kia quá đắt nên gần như không ai chọn.',
                    'Câu hỏi cụ thể ban đầu bị thay bằng một lựa chọn tổng thể về việc tiếp tục hay dừng lại.',
                    'Phép thử: bạn có nghĩ ra được một lựa chọn thứ ba cụ thể và khả thi không?',
                  ],
                },
                {
                  heading: 'Cách xử lý',
                  paragraphs: [
                    'Đừng tranh luận rằng đối phương đang ngụy biện — điều đó chuyển cuộc trao đổi sang chủ đề mới và tạo ra người phải thua.',
                    'Không phủ nhận vế nào cả, chỉ nêu lại câu hỏi cụ thể: "Tôi không bàn chuyện đi hay ở, tôi hỏi về điều khoản X."',
                    'Nếu có thể, nêu luôn lựa chọn thứ ba dưới dạng một đề nghị cụ thể.',
                  ],
                },
                {
                  heading: 'Cẩn thận với chính bài học này',
                  paragraphs: [
                    'Không phải mọi lựa chọn hai cửa đều là ngụy biện. Có những tình huống thật sự chỉ có hai lựa chọn.',
                    'Gọi mọi nhị phân là lưỡng nan giả là cách né tránh những quyết định khó.',
                    'Nếu thử liệt kê mà không ra được lựa chọn thứ ba nào khả thi, hãy chấp nhận rằng đây là lúc phải chọn.',
                  ],
                },
              ],
              relatedConcepts: ['Lưỡng nan giả', 'Đóng khung vấn đề', 'Không gian thương lượng'],
              furtherReading: [
                'Bài học "Slippery slope & False dilemma" trong khoá Logic 101',
                'Câu chuyện "Vùng xám pháp lý" của Đức trong khoá Riêng Tư và Dân chủ',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Lưỡng nan giả trình bày hai lựa chọn cực đoan như thể đó là toàn bộ danh sách, và cả hai vế đều có thật nên khó chỉ ra chỗ sai.\n' +
              '✓ Nó thay một câu hỏi cụ thể bằng một lựa chọn tổng thể mà vế thứ hai quá đắt để chọn.\n' +
              '✓ Cách xử lý hiệu quả không phải gọi tên ngụy biện, mà là nêu lại câu hỏi cụ thể mà không phủ nhận vế nào.\n' +
              '✓ Nhưng không phải nhị phân nào cũng giả — phép thử là thử nghĩ ra một lựa chọn thứ ba cụ thể và khả thi.',
          },
          {
            type: 'text',
            title: 'Rồi tới câu thứ hai',
            paragraphs: [
              'Lần sau, khi Đức hỏi về điều khoản phạt huỷ chuyến, có người trả lời khác.',
              '"Ở nước ngoài tài xế còn khổ hơn nhiều em ơi. Bên Mỹ nó không có bảo hiểm gì luôn."',
              'Đức đọc câu đó và thấy nó cũng chặn cuộc trao đổi y như câu trước — mà theo một cách hoàn toàn khác.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'con-ben-kia-thi-sao',
        title: '"Còn bên kia thì sao?"',
        blocks: [
          {
            type: 'text',
            title: 'Câu trả lời không trả lời gì',
            paragraphs: [
              '"Ở nước ngoài tài xế còn khổ hơn nhiều em ơi. Bên Mỹ nó không có bảo hiểm gì luôn."',
              'Đức đọc câu đó ba lần và nhận ra: nó không hề nói gì về điều khoản phạt huỷ chuyến mà anh đang hỏi.',
              'Nhưng nó làm anh thấy hơi ngại khi hỏi tiếp, như thể anh đang đòi hỏi quá đáng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Whataboutism — "còn cái kia thì sao?"',
            variant: 'info',
            text: 'Là cách đáp lại một chỉ trích bằng cách chỉ ra một vấn đề khác, thường tệ hơn, ở nơi khác hoặc phía khác. Nó không phủ nhận điều bạn nêu, cũng không trả lời điều bạn hỏi — nó chỉ đổi chủ đề, đồng thời gợi ý rằng bạn không có tư cách phàn nàn.',
          },
          {
            type: 'question',
            question:
              'Việc tài xế ở nước khác khổ hơn có liên quan gì tới câu hỏi về điều khoản phạt huỷ chuyến?',
            options: [
              { id: 'a', text: 'Có — nó cho thấy điều khoản hiện tại đã là tương đối tốt', isCorrect: false },
              { id: 'b', text: 'Không — nó không nói gì về việc điều khoản đó có hợp lý hay không, chỉ đổi mốc so sánh sang một chỗ khác', isCorrect: true },
              { id: 'c', text: 'Có — nếu nơi khác tệ hơn thì không nên phàn nàn', isCorrect: false },
              { id: 'd', text: 'Không đủ thông tin để trả lời', isCorrect: false },
            ],
            explanation:
              'Câu hỏi ban đầu là: khi khách không ra mà tài xế phải huỷ, việc bị trừ điểm có hợp lý không, và có khiếu nại được không. Câu trả lời về nước ngoài không chạm vào nội dung đó. Nó thay câu hỏi "điều này có hợp lý không" bằng câu "so với nơi tệ nhất thì thế nào" — mà so với nơi tệ nhất thì gần như mọi thứ đều trông chấp nhận được.',
          },
          {
            type: 'text',
            title: 'Vì sao whataboutism khó phản bác',
            paragraphs: [
              'Đức thử cãi lại: "Nhưng mình đâu có so với bên Mỹ anh."',
              'Người kia đáp: "Ủa vậy em nghĩ ở đâu tốt hơn? Em thử kiếm chỗ nào tốt hơn coi."',
              'Thế là cuộc trao đổi chuyển thành việc Đức phải chứng minh có nơi nào đó tốt hơn — một gánh nặng hoàn toàn mới mà anh không hề nhận.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là đặc điểm khiến whataboutism dai dẳng: mỗi lần bạn bước theo nó, bạn nhận thêm một gánh nặng chứng minh.',
              'Bạn hỏi về điều khoản A. Người ta nói về nơi khác. Bạn cãi về nơi khác. Người ta hỏi bạn tìm được chỗ nào tốt hơn chưa.',
              'Sau ba bước, bạn đang bảo vệ một luận điểm mà bạn chưa bao giờ đưa ra.',
            ],
          },
          {
            type: 'pair-match',
            title: 'Câu hỏi gốc và câu trả lời lạc hướng',
            instruction:
              'Nối mỗi câu đáp lạc hướng với câu hỏi gốc mà nó đang né tránh.',
            pairs: [
              {
                id: 'w1',
                left: '"Ở nước ngoài tài xế còn khổ hơn nhiều."',
                right: 'Điều khoản phạt huỷ chuyến khi khách không ra có hợp lý không?',
              },
              {
                id: 'w2',
                left: '"Anh cũng có làm gì tốt hơn đâu mà nói."',
                right: 'Cách xử lý khiếu nại vừa rồi có đúng quy trình không?',
              },
              {
                id: 'w3',
                left: '"Hồi trước còn tệ hơn nhiều, giờ vậy là tốt rồi."',
                right: 'Mức thu hiện tại có tương xứng với chi phí tài xế bỏ ra không?',
              },
              {
                id: 'w4',
                left: '"Mấy người kêu ca sao không tự lập công ty mà làm."',
                right: 'Người lao động có được biết cách tính điểm của hệ thống không?',
              },
            ],
          },
          {
            type: 'text',
            title: 'Bốn câu, một cấu trúc',
            paragraphs: [
              'Đức nhìn bốn cặp trên và thấy chúng giống nhau tới mức có thể vẽ thành một công thức.',
              'Bên trái luôn là một câu về ai đó khác, ở đâu đó khác, hoặc lúc nào đó khác.',
              'Bên phải luôn là một câu hỏi cụ thể về ở đây, bây giờ, và có thể trả lời được.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Và có một chi tiết nữa: bên trái thường đúng.',
              'Tài xế ở nhiều nước thật sự khó khăn. Hồi trước thật sự tệ hơn. Người phàn nàn thật sự cũng chưa làm được gì tốt hơn.',
              'Whataboutism không cần nói dối. Nó chỉ cần nói một điều đúng nhưng không liên quan, vào đúng lúc.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đúng nhưng không liên quan vẫn là né tránh',
            variant: 'warning',
            text: 'Khó chịu nhất ở whataboutism là bạn không thể phản bác nội dung của nó, vì nội dung thường đúng. Thứ sai không phải là điều được nói, mà là việc điều đó được đưa ra thay cho một câu trả lời. Vì thế phản ứng đúng không phải là tranh cãi về nội dung, mà là chỉ ra rằng câu hỏi vẫn đang chờ.',
          },
          {
            type: 'question',
            question:
              'Cách đáp lại whataboutism hiệu quả nhất là gì?',
            options: [
              { id: 'a', text: 'Chứng minh rằng nơi được nhắc tới thực ra không tệ như vậy', isCorrect: false },
              { id: 'b', text: 'Thừa nhận điều họ nói có thể đúng, rồi nêu lại câu hỏi ban đầu nguyên văn', isCorrect: true },
              { id: 'c', text: 'Chỉ ra rằng họ đang ngụy biện whataboutism', isCorrect: false },
              { id: 'd', text: 'Đưa ra một ví dụ tệ hơn nữa ở phía họ', isCorrect: false },
            ],
            explanation:
              'Tranh cãi về nội dung của họ là bước vào bẫy — bạn nhận thêm gánh nặng chứng minh về một chủ đề bạn không chọn. Gọi tên ngụy biện thì chuyển cuộc trao đổi sang chuyện cách tranh luận. Đáp lại bằng một ví dụ tệ hơn thì bạn vừa đổi chủ đề lần nữa. Công thức hiệu quả rất ngắn: "Có thể anh nói đúng. Nhưng câu em hỏi là..." — thừa nhận, rồi kéo về.',
          },
          {
            type: 'text',
            title: 'Khi nào so sánh là hợp lệ',
            paragraphs: [
              'Đức cẩn thận với chính bài học này, vì so sánh không phải lúc nào cũng là né tránh.',
              'Nếu câu hỏi là "mức thu của app này có cao bất thường không", thì đem so với các nền tảng khác là hoàn toàn đúng chỗ — đó chính là cách trả lời câu hỏi.',
              'Cái sai không nằm ở việc so sánh, mà ở việc so sánh được đưa ra thay cho một câu trả lời về chuyện khác hẳn.',
            ],
          },
          {
            type: 'question',
            question: 'Làm sao phân biệt một so sánh hợp lệ với một câu whataboutism?',
            options: [
              { id: 'a', text: 'So sánh với nước ngoài thì không hợp lệ, so sánh trong nước thì hợp lệ', isCorrect: false },
              { id: 'b', text: 'Hỏi xem so sánh đó có giúp trả lời đúng câu hỏi đang được đặt ra hay không', isCorrect: true },
              { id: 'c', text: 'So sánh do người có chuyên môn đưa ra thì hợp lệ', isCorrect: false },
              { id: 'd', text: 'So sánh kèm số liệu thì hợp lệ, không kèm số liệu thì không', isCorrect: false },
            ],
            explanation:
              'Phép thử duy nhất là tính liên quan. Nếu câu hỏi là "mức này có bất thường không" thì so sánh là câu trả lời. Nếu câu hỏi là "điều khoản này có công bằng không" thì việc nơi khác tệ hơn không trả lời được gì — một điều bất công không trở thành công bằng chỉ vì có nơi bất công hơn. Nguồn gốc hay số liệu của so sánh không quyết định điều này.',
          },
          {
            type: 'text',
            title: 'Đức thử công thức đó',
            paragraphs: [
              '"Dạ có thể bên đó khổ hơn thật anh. Nhưng câu em hỏi là mình có khiếu nại được cái trừ điểm khi khách không ra không ạ."',
              'Người kia không trả lời nữa.',
              'Nhưng một người khác trả lời: "Có khiếu nại được em, vô mục hỗ trợ chọn sự cố chuyến đi, mà phải làm trong hai bốn tiếng."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đó là thông tin Đức cần, và anh mất ba tuần mới lấy được nó — chỉ vì mỗi lần hỏi, cuộc trao đổi lại bị đẩy sang chỗ khác.',
              'Anh tính ra trong ba tuần đó, anh bị trừ điểm bốn lần vì khách không ra, và anh đã không khiếu nại lần nào vì anh tưởng không khiếu nại được.',
              'Bốn lần đó, quy ra tiền, khoảng ba trăm nghìn. Không lớn. Nhưng nó là cái giá rất cụ thể của việc một câu hỏi đơn giản không được trả lời.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Cuộc trao đổi bị đẩy đi có chi phí thật',
            variant: 'info',
            text: 'Ta hay coi ngụy biện là chuyện học thuật, chuyện thắng thua trong tranh luận. Nhưng ở đây nó có đơn vị đo: ba tuần chậm trễ, bốn lần không khiếu nại, ba trăm nghìn đồng. Mỗi lần một câu hỏi bị đổi chủ đề thay vì được trả lời, sẽ có ai đó trả cái giá đó — thường là người ít quyền nhất trong cuộc trao đổi.',
          },
          {
            type: 'text',
            title: 'Đức làm một việc cho nhóm',
            paragraphs: [
              'Anh viết một bài đăng, không phải để tranh luận với ai.',
              'Bài đó liệt kê năm việc cụ thể mà anh đã tự tìm hiểu được: khiếu nại trừ điểm ở đâu, thời hạn bao lâu, cần chụp lại gì, số tổng đài nào gọi được người thật, và mục nào trong ứng dụng xem được lịch sử điểm.',
              'Không có câu nào bình luận về công ty. Chỉ có năm việc làm được.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bài đó có ít lượt thích hơn nhiều so với bài "tin nội bộ" hôm nọ.',
              'Nhưng nó được lưu lại, và trong sáu tháng sau có hơn ba mươi người vào bình luận hỏi thêm.',
              'Đức nghĩ: nội dung gây giận thì lan nhanh, nội dung dùng được thì sống lâu. Anh chọn cái thứ hai.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Whataboutism',
            description: 'Vì sao một câu đúng vẫn có thể là cách né tránh, và công thức bốn chữ để kéo cuộc trao đổi về.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Nhận ra nó',
                  paragraphs: [
                    'Câu đáp nói về một nơi khác, một thời điểm khác, hoặc một người khác — không về điều đang được hỏi.',
                    'Nội dung câu đáp thường đúng, nên bạn không phản bác được bằng sự kiện.',
                    'Nó ngầm gợi ý rằng bạn không có tư cách phàn nàn, khiến bạn ngại hỏi tiếp.',
                    'Mỗi lần bạn tranh luận theo, bạn nhận thêm một gánh nặng chứng minh mà bạn chưa bao giờ tự nhận.',
                  ],
                },
                {
                  heading: 'Công thức đáp lại',
                  paragraphs: [
                    '"Có thể anh nói đúng. Nhưng câu tôi hỏi là..." — thừa nhận, rồi nêu lại nguyên văn câu hỏi.',
                    'Không tranh cãi về nội dung họ đưa ra, vì đó là chủ đề bạn không chọn.',
                    'Không gọi tên ngụy biện, vì điều đó chuyển cuộc trao đổi sang chuyện cách tranh luận.',
                    'Lặp lại câu hỏi nguyên văn, không diễn giải lại — mỗi lần diễn giải là một cơ hội để nó bị đẩy đi tiếp.',
                  ],
                },
                {
                  heading: 'Vì sao nên bận tâm',
                  paragraphs: [
                    'So sánh với nơi tệ nhất khiến gần như mọi thứ đều trông chấp nhận được, nên nó vô hiệu hoá mọi đòi hỏi cải thiện.',
                    'Chi phí của một câu hỏi không được trả lời là chi phí thật, và thường rơi vào người ít quyền nhất.',
                    'Ghi lại câu hỏi ban đầu và đọc lại sau vài chục bình luận là cách rẻ nhất để thấy cuộc trao đổi đã trôi đi đâu.',
                  ],
                },
              ],
              relatedConcepts: ['Whataboutism', 'Đổi khung', 'Gánh nặng chứng minh'],
              furtherReading: [
                'Bài học "Whataboutism" trong khoá Logic 101',
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
              '✓ Whataboutism không nói dối — nó nói một điều đúng nhưng không liên quan, thay cho một câu trả lời.\n' +
              '✓ Mỗi lần bạn tranh luận theo, bạn nhận thêm một gánh nặng chứng minh mà bạn chưa từng tự nhận.\n' +
              '✓ Công thức đáp lại: thừa nhận điều họ nói có thể đúng, rồi nêu lại nguyên văn câu hỏi ban đầu.\n' +
              '✓ Một câu hỏi bị đẩy đi thay vì được trả lời có chi phí thật, và nó rơi vào người ít quyền nhất.',
          },
          {
            type: 'text',
            title: 'Người nói câu đó nhắn riêng cho Đức',
            paragraphs: [
              'Ba ngày sau, người từng nói "bên Mỹ còn khổ hơn" nhắn riêng cho Đức.',
              '"Anh xin lỗi bữa đó anh nói vậy. Anh chạy tám năm rồi, anh nản, thấy ai than là anh khó chịu."',
              '"Cái vụ khiếu nại đó anh cũng không biết. Anh làm theo em hướng dẫn, lấy lại được hai trăm mấy rồi."',
              'Đức đọc tin nhắn đó và nghĩ về chuyện anh suýt coi người này là kẻ bênh vực công ty.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'duc-hoi-mot-cau-khac',
        title: 'Đức hỏi một câu khác',
        blocks: [
          {
            type: 'text',
            title: 'Tin nhắn của anh Tám',
            paragraphs: [
              'Anh Tám — người nói câu "bên Mỹ còn khổ hơn" — chạy được tám năm, hơn Đức năm năm.',
              'Trong tin nhắn riêng, anh kể anh từng là người hay hỏi nhất nhóm hồi mới vào nghề.',
              '"Hỏi hoài không ai trả lời, riết rồi anh thôi. Giờ ai hỏi anh cũng thấy khó chịu, chắc tại anh nhớ hồi đó."',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Điều Đức nhận ra',
            variant: 'info',
            text: 'Anh Tám không phải người bênh vực nền tảng. Anh là một người từng hỏi, không được trả lời, rồi bỏ cuộc — và sự bỏ cuộc đó về sau biến thành thái độ gạt phăng người khác. Đức suýt xếp anh vào phía bên kia.',
          },
          {
            type: 'question',
            question:
              'Việc Đức suýt xếp anh Tám vào "phía bên kia" là biểu hiện của lỗi tư duy nào?',
            options: [
              { id: 'a', text: 'Thiên kiến xác nhận', isCorrect: false },
              { id: 'b', text: 'Dựng người rơm — gán cho người kia một lập trường đơn giản hơn và tệ hơn lập trường thật của họ', isCorrect: true },
              { id: 'c', text: 'Viện dẫn uy tín', isCorrect: false },
              { id: 'd', text: 'Thiên kiến kẻ sống sót', isCorrect: false },
            ],
            explanation:
              'Đức đọc một câu của anh Tám rồi dựng lên trong đầu một nhân vật: người bênh nền tảng, không quan tâm tới đồng nghiệp. Nhân vật đó đơn giản hơn và dễ bác bỏ hơn con người thật — một tài xế tám năm đã mệt mỏi vì hỏi mà không ai trả lời. Dựng người rơm không đòi hỏi ác ý; nó chỉ đòi hỏi ta kết luận về một người từ một câu.',
          },
          {
            type: 'text',
            title: 'Người rơm dễ dựng tới mức nào',
            paragraphs: [
              'Đức nhìn lại cuộc trao đổi trong nhóm và anh thấy người rơm ở khắp nơi, kể cả trong đầu mình.',
              'Anh hỏi về điều khoản, người ta dựng anh thành "seeder của app".',
              'Người ta nói câu khó chịu, anh dựng họ thành "kẻ bênh công ty".',
              'Trong cả hai chiều, không ai nói chuyện với con người thật của bên kia.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Ngụy biện người rơm (strawman)',
            variant: 'info',
            text: 'Là việc thay lập luận thật của đối phương bằng một phiên bản méo mó, dễ đánh hơn, rồi đánh phiên bản đó. Nó thắng rất dễ và cảm giác rất sảng khoái, nhưng nó không chạm được vào điều người kia thực sự nói — nên nó không thay đổi được gì ngoài việc làm cả hai bên xa nhau thêm.',
          },
          {
            type: 'text',
            title: 'Phép thử Đức tự đặt ra',
            paragraphs: [
              'Đức nghĩ ra một cách kiểm tra rất gọn để biết mình có đang dựng người rơm không.',
              'Anh viết ra lập trường của phía bên kia bằng một câu, rồi tự hỏi: nếu đưa câu này cho chính họ đọc, họ có gật đầu nhận không?',
              'Nếu họ sẽ nói "tôi đâu có nói vậy", thì anh biết mình đang đánh vào một nhân vật do anh tự dựng.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao phép thử "họ có nhận câu tóm tắt này không" lại hiệu quả?',
            options: [
              { id: 'a', text: 'Vì nó buộc bạn phải hỏi trực tiếp đối phương', isCorrect: false },
              { id: 'b', text: 'Vì nó tách được lập trường thật của họ khỏi phiên bản mà bạn đã dựng lên trong đầu, ngay cả khi bạn không nhận ra mình đã dựng', isCorrect: true },
              { id: 'c', text: 'Vì nó chứng minh bạn hiểu vấn đề sâu hơn họ', isCorrect: false },
              { id: 'd', text: 'Vì nó khiến cuộc tranh luận trở nên lịch sự hơn', isCorrect: false },
            ],
            explanation:
              'Bạn không cần phải hỏi họ thật — chỉ cần tưởng tượng phản ứng của họ là đủ để lộ ra chỗ méo. Điểm mạnh của phép thử này là nó bắt được cả những trường hợp bạn hoàn toàn thiện chí: khi ta tóm tắt lập trường người khác, ta tự động cắt bớt những chỗ phức tạp và giữ lại chỗ dễ phản bác, mà không hề thấy mình đang làm vậy.',
          },
          {
            type: 'text',
            title: 'Đức thử làm ngược lại',
            paragraphs: [
              'Anh nhớ tới thứ mà cháu bác Tư gọi là "dựng phiên bản mạnh nhất của phía bên kia".',
              'Anh thử áp dụng cho chính công ty nền tảng — bên mà cả nhóm đang giận.',
              'Anh viết ra lập luận mạnh nhất mà anh nghĩ họ có thể đưa ra, không phải phiên bản dễ đánh nhất.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh viết: "Nếu không phạt việc huỷ chuyến thì sẽ có tài xế nhận cuốc rồi huỷ để chọn cuốc ngon hơn, và khách sẽ chờ mãi. Chính sách phạt là để bảo vệ khách và bảo vệ những tài xế không làm vậy."',
              'Viết xong anh ngồi nhìn nó khá lâu. Nó có lý.',
              'Và điều quan trọng: khi anh chấp nhận nó có lý, câu hỏi của anh thay đổi hẳn.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu hỏi cũ: "Sao lại phạt huỷ chuyến?" — câu này đòi bỏ cả chính sách, và nó dễ bị gạt.',
              'Câu hỏi mới: "Làm sao phân biệt được tài xế huỷ vì khách không ra với tài xế huỷ để chọn cuốc ngon hơn?"',
              'Câu thứ hai chấp nhận mục tiêu của chính sách và chỉ hỏi về cách thực hiện. Nó khó gạt hơn nhiều, vì gạt nó nghĩa là thừa nhận hệ thống không phân biệt được hai trường hợp khác hẳn nhau.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao dựng phiên bản mạnh nhất của phía bên kia lại giúp chính lập luận của bạn?',
            options: [
              { id: 'a', text: 'Vì nó khiến bạn trông công bằng hơn trong mắt người khác', isCorrect: false },
              { id: 'b', text: 'Vì nó buộc bạn tìm ra chỗ yếu thật sự của họ, và một lập luận nhắm vào chỗ yếu thật thì khó gạt hơn nhiều', isCorrect: true },
              { id: 'c', text: 'Vì nó làm đối phương thiện chí hơn', isCorrect: false },
              { id: 'd', text: 'Vì nó giúp bạn đổi ý sang phía họ', isCorrect: false },
            ],
            explanation:
              'Khi bạn đánh vào người rơm, bạn thắng một cuộc đấu không có thật, và lập luận của bạn không đụng tới điểm yếu thật của phía kia — nên họ chỉ cần chỉ ra rằng bạn hiểu sai họ là xong. Khi bạn dựng phiên bản mạnh nhất, bạn buộc phải tìm ra chỗ nào thật sự không ổn. Lập luận nhắm vào đó thì họ không né được bằng cách nói "tôi đâu có nói vậy".',
          },
          {
            type: 'text',
            title: 'Đức đăng câu hỏi mới',
            paragraphs: [
              'Anh viết một bài, mở đầu bằng chính lập luận của phía công ty:',
              '"Em hiểu là phải có phạt huỷ chuyến, không thì có người nhận rồi huỷ để lựa cuốc, khách chờ chết. Cái đó em thấy hợp lý."',
              '"Nhưng em muốn hỏi: khi khách không ra, mình chờ mười lăm phút rồi huỷ, hệ thống có phân biệt được với trường hợp kia không ạ? Nếu không phân biệt được thì mình khiếu nại kiểu gì?"',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bài đó không có ai gọi anh là seeder.',
              'Vì anh đã nói giúp phía bên kia trước, nên không ai cần nói giúp nữa — và cuộc trao đổi đi thẳng vào chỗ thật sự chưa rõ.',
              'Có mười bảy người trả lời, trong đó bốn người kể lại kinh nghiệm khiếu nại thành công và cách chụp màn hình làm bằng chứng.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nhưng steelman không phải là nhượng bộ',
            variant: 'warning',
            text: 'Dựng phiên bản mạnh nhất của phía bên kia không có nghĩa là đồng ý với họ, cũng không có nghĩa là hai bên đều đúng như nhau. Đức vẫn cho rằng cách tính điểm hiện tại không công bằng. Anh chỉ chọn tấn công vào chỗ nó thật sự yếu, thay vào chỗ ông dễ đánh nhưng không tồn tại.',
          },
          {
            type: 'text',
            title: 'Sáu tháng sau',
            paragraphs: [
              'Không có gì thay đổi ở phía công ty. Cách tính điểm vẫn vậy, điều khoản phạt vẫn vậy.',
              'Nhưng trong nhóm có một thứ đổi: bài của Đức được ghim lại, và mỗi khi có người mới hỏi về trừ điểm, sẽ có người dẫn lại bài đó.',
              'Anh Tám là một trong những người hay dẫn lại nhất.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đức không nghĩ mình đã làm được gì lớn.',
              'Anh không thay đổi được chính sách, không tổ chức được ai, không đòi được quyền lợi gì mới.',
              'Thứ anh làm được nhỏ hơn nhiều: trong một nhóm năm nghìn người, có thêm một chỗ mà câu hỏi được trả lời thay vì bị đẩy đi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Hồi trước tui tưởng biết mấy cái ngụy biện này để cãi cho thắng," Đức nói.',
              '"Giờ tui thấy nó không phải để thắng. Nó để cái câu hỏi của mình không bị lạc mất giữa chừng."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Người rơm và steelman',
            description: 'Hai hướng ngược nhau khi diễn giải lập luận của phía bên kia, và vì sao hướng khó hơn lại có lợi cho bạn.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Dựng người rơm',
                  paragraphs: [
                    'Thay lập luận thật của đối phương bằng một phiên bản đơn giản hơn, cực đoan hơn, dễ đánh hơn.',
                    'Không cần ác ý: chỉ cần kết luận về một người từ một câu họ nói là đã dựng xong.',
                    'Dấu hiệu bạn đang làm điều đó: bạn tóm tắt lập trường của họ bằng một câu mà chính họ sẽ không nhận.',
                    'Hậu quả: bạn thắng một cuộc đấu không có thật, và họ chỉ cần nói "tôi đâu có nói vậy" là xong.',
                  ],
                },
                {
                  heading: 'Dựng steelman',
                  paragraphs: [
                    'Tự tay viết ra phiên bản mạnh nhất của lập luận phía bên kia, không phải phiên bản dễ đánh nhất.',
                    'Nêu nó ra trước khi nêu phản biện của mình. Người khác sẽ không phải nói giúp họ nữa.',
                    'Nó thường làm câu hỏi của bạn thay đổi: từ "sao lại có chính sách này" thành "chính sách này thực hiện thế nào cho đúng mục tiêu của chính nó".',
                    'Câu hỏi thứ hai khó gạt hơn nhiều, vì nó chấp nhận mục tiêu và chỉ hỏi về cách làm.',
                  ],
                },
                {
                  heading: 'Ba điều cần nhớ',
                  paragraphs: [
                    'Steelman không phải nhượng bộ, không có nghĩa hai bên đúng như nhau.',
                    'Nó là công cụ để nhắm vào chỗ yếu thật thay vì chỗ yếu tưởng tượng.',
                    'Trong một cộng đồng đang giận, nó còn là cách rẻ nhất để không bị gán nhãn "không cùng phe".',
                  ],
                },
              ],
              relatedConcepts: ['Ngụy biện người rơm', 'Steelman', 'Nguyên tắc bác ái trong diễn giải'],
              furtherReading: [
                'Bài học "Strawman" và "Steelman" trong khoá Logic 101',
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
              '✓ Dựng người rơm không cần ác ý — chỉ cần kết luận về một người từ một câu họ nói.\n' +
              '✓ Dấu hiệu bạn đang dựng người rơm: bạn tóm tắt lập trường của họ bằng câu mà chính họ sẽ không nhận.\n' +
              '✓ Nêu phiên bản mạnh nhất của phía bên kia trước sẽ đổi câu hỏi của bạn thành câu khó gạt hơn nhiều.\n' +
              '✓ Steelman không phải nhượng bộ — nó là cách nhắm vào chỗ yếu thật thay vì chỗ yếu tưởng tượng.',
          },
          {
            type: 'text',
            title: 'Điều Đức mang theo',
            paragraphs: [
              'Đức vẫn ở trong nhóm năm nghìn người. Vẫn có tin đồn mỗi tháng, vẫn có người bảo "không chịu thì nghỉ".',
              'Thứ thay đổi là bây giờ anh giữ được câu hỏi của mình từ đầu tới cuối một cuộc trao đổi.',
              'Anh chép nó vào ghi chú, anh nêu lại khi nó bị đẩy đi, và anh nói giúp phía bên kia trước khi nói phần của mình.',
              'Ba việc đó không làm anh thắng ai. Chúng chỉ làm cho việc anh hỏi có ích hơn việc anh giận.',
            ],
          },
        ],
      },
    ],
  },
};
