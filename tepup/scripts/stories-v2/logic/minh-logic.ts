import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Minh × Logic 101 — "Chọn ngành theo TikTok".
 *
 * Minh là nhân vật duy nhất đang đứng trước một quyết định lớn có thật (chọn
 * hướng đi sau tốt nghiệp), nên thiên kiến của anh có hậu quả đo được. Câu
 * chuyện đi từ survivorship bias sang confirmation bias, rồi tới cách kiểm chứng.
 */
/** Bài đăng giả lập dùng cho block bias-detector ở chương 3.
 *  startIndex bên dưới được tính bằng indexOf trên chính chuỗi này, nên chỉnh
 *  lời văn ở đây không làm lệch vùng bôi đậm. */
const BAI_DANG =
  'Mình học Bách khoa ra, đi làm 8 tháng đã lên senior, lương 50 triệu. ' +
  'Ai bảo ngành IT bão hoà là chưa đủ giỏi thôi. ' +
  'Mình có một đứa bạn học ngành khác, ra trường lương 9 triệu, giờ vẫn giậm chân tại chỗ. ' +
  'Ai cũng biết học IT thì không bao giờ thất nghiệp. ' +
  'Mấy người kêu ca thị trường khó thì đa số là mấy bạn lười, ngồi than trên mạng thay vì đi code. ' +
  'Sếp cũ của mình từng nói chỉ cần chăm là sống khoẻ, mà anh ấy làm CTO nên chắc chắn anh ấy đúng.';

export const MINH_LOGIC: StorySeed = {
  slug: 'minh-logic',
  characterSlug: 'student',
  title: 'Chọn ngành theo TikTok',
  teaser:
    'Minh xem một video "lương IT 50 triệu sau 8 tháng" rồi quyết định cả hướng đi sau tốt nghiệp. Vấn đề không phải là video đó nói dối. Vấn đề là những người không quay video.',
  icon: 'brain',
  estimatedTime: '~30 phút',
  sortOrder: 0,
  courseSlugs: [COURSE.logic],
  part: {
    name: 'Minh và cái quyết định lớn nhất năm ba',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'video-luong-nam-muoi-trieu',
        title: 'Video lương năm mươi triệu',
        blocks: [
          {
            type: 'text',
            title: 'Mười một giờ đêm',
            paragraphs: [
              'Minh nằm trên giường tầng ký túc xá, cuộn điện thoại. Anh đang năm ba, còn một năm rưỡi nữa ra trường, và anh chưa biết mình muốn làm gì.',
              'Một video hiện lên. Một anh trẻ, ngồi trong văn phòng có cây xanh và màn hình cong, nói vào máy quay:',
              '"Mình học Bách khoa ra, đi làm tám tháng, hiện tại lương năm mươi triệu. Mình chia sẻ lộ trình để các bạn đi nhanh hơn mình."',
            ],
          },
          {
            type: 'callout',
            icon: 'video',
            title: 'Video có gì',
            variant: 'info',
            text: '340 nghìn lượt thích. 12 nghìn bình luận. Nội dung: học ba khoá học online cụ thể, làm hai dự án cá nhân, ứng tuyển vào công ty nước ngoài. Có ảnh chụp màn hình bảng lương che một phần. Không có câu nào sai sự thật kiểm chứng được.',
          },
          {
            type: 'question',
            question:
              'Video này không nói dối câu nào. Vậy theo bạn, vấn đề lớn nhất khi Minh dựa vào nó để quyết định là gì?',
            options: [
              { id: 'a', text: 'Không có vấn đề gì — đó là kinh nghiệm thật của một người thật', isCorrect: false },
              { id: 'b', text: 'Người quay video có thể phóng đại con số lương', isCorrect: false },
              { id: 'c', text: 'Ta chỉ nhìn thấy người thành công, còn hàng nghìn người làm y hệt mà không thành công thì không quay video', isCorrect: true },
              { id: 'd', text: 'Video quá ngắn để trình bày đầy đủ', isCorrect: false },
            ],
            explanation:
              'Đây là điểm mà trực giác của gần như mọi người đều sai. Ta hỏi "câu chuyện này có thật không" trong khi câu hỏi đúng là "có bao nhiêu người làm y hệt mà kết quả khác". Ngay cả khi mọi chi tiết trong video đều thật một trăm phần trăm, nó vẫn có thể dẫn tới một kết luận sai — vì mẫu mà bạn nhìn thấy đã bị lọc từ trước.',
          },
          {
            type: 'text',
            title: 'Minh làm theo',
            paragraphs: [
              'Đêm đó Minh lưu video, ghi lại tên ba khoá học, và lập một kế hoạch mười tám tháng.',
              'Anh kể với Hùng, bạn cùng phòng. Hùng hỏi: "Ông biết ổng là ai không?"',
              '"Ổng làm ở công ty nước ngoài, ổng chia sẻ thật mà. Có cả ảnh bảng lương."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hùng không cãi. Hùng chỉ hỏi thêm một câu: "Ông có xem cái video nào của người học Bách khoa ra mà lương chín triệu không?"',
              'Minh nghĩ một lúc. Không. Anh chưa từng thấy video nào như vậy.',
              '"Vậy là không có ai lương chín triệu, hay là không có ai lương chín triệu đi quay video?"',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Thiên kiến kẻ sống sót (survivorship bias)',
            variant: 'info',
            text: 'Là sai lầm rút ra kết luận chỉ từ những trường hợp đã "sống sót" qua một bộ lọc, mà quên rằng những trường hợp thất bại đã bị loại khỏi tầm nhìn từ trước. Nó không đòi hỏi ai nói dối — chỉ cần người thất bại im lặng là đủ.',
          },
          {
            type: 'question',
            question: 'Vì sao thiên kiến kẻ sống sót lại khó nhận ra hơn hầu hết các loại thiên kiến khác?',
            options: [
              { id: 'a', text: 'Vì nó chỉ xuất hiện trong lĩnh vực công nghệ', isCorrect: false },
              { id: 'b', text: 'Vì phần dữ liệu bị thiếu không để lại dấu vết nào — bạn không thấy được thứ mình không thấy', isCorrect: true },
              { id: 'c', text: 'Vì nó luôn đi kèm số liệu thống kê phức tạp', isCorrect: false },
              { id: 'd', text: 'Vì nó chỉ ảnh hưởng tới người trẻ', isCorrect: false },
            ],
            explanation:
              'Với hầu hết thiên kiến, có một manh mối nào đó trong thứ bạn đang đọc. Với thiên kiến kẻ sống sót thì không: phần bị thiếu là phần vắng mặt, và sự vắng mặt thì không phát ra tín hiệu. Cách duy nhất để bắt được nó là chủ động hỏi "ai đã bị lọc ra trước khi tôi nhìn thấy cái này?" — một câu hỏi phải học mới nghĩ tới.',
          },
          {
            type: 'text',
            title: 'Máy bay của Abraham Wald',
            paragraphs: [
              'Hùng học ngành thống kê. Cậu kể cho Minh nghe một câu chuyện thời Thế chiến thứ hai.',
              'Quân đội Mỹ muốn gia cố giáp cho máy bay ném bom. Họ kiểm tra các máy bay trở về sau nhiệm vụ và đánh dấu vị trí trúng đạn. Vết đạn tập trung dày nhất ở cánh và phần thân giữa.',
              'Kết luận tự nhiên: gia cố cánh và thân giữa.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhà thống kê Abraham Wald nói ngược lại: hãy gia cố những chỗ KHÔNG có vết đạn — buồng lái và động cơ.',
              'Lý do rất đơn giản khi đã nghe: những máy bay bị bắn vào cánh vẫn bay về được, nên ta mới thấy vết đạn ở đó.',
              'Còn những máy bay trúng đạn vào động cơ thì đã rơi. Chúng không có mặt trong bộ dữ liệu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh ngồi im một lúc rồi nói: "Vậy mấy cái video kia là mấy cái máy bay bay về được."',
              '"Ừ," Hùng nói. "Còn ông thì đang tính gia cố đúng cái chỗ mà mấy chiếc bay về được đã bị bắn."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Bộ lọc nằm trước mắt bạn, không nằm trong dữ liệu',
            variant: 'warning',
            text: 'Nền tảng mạng xã hội đẩy nội dung được tương tác nhiều. Một video "tôi thất bại, lương chín triệu, không biết làm gì" thì ít người xem, ít người chia sẻ, nên gần như không xuất hiện. Bộ lọc này hoạt động trước khi bạn kịp đánh giá bất cứ điều gì — và nó vô hình.',
          },
          {
            type: 'question',
            question: 'Trường hợp nào sau đây KHÔNG phải là thiên kiến kẻ sống sót?',
            options: [
              { id: 'a', text: 'Đọc tiểu sử các tỷ phú bỏ học và kết luận bỏ học giúp thành công', isCorrect: false },
              { id: 'b', text: 'Nghe những người khỏi bệnh khen một bài thuốc và kết luận bài thuốc hiệu nghiệm', isCorrect: false },
              { id: 'c', text: 'Xem báo cáo khảo sát lương của toàn bộ sinh viên tốt nghiệp một khoá, kể cả người thất nghiệp', isCorrect: true },
              { id: 'd', text: 'Thấy các quán cà phê đông khách và kết luận mở quán cà phê dễ lời', isCorrect: false },
            ],
            explanation:
              'Phương án c là ví dụ về một mẫu KHÔNG bị lọc: nó bao gồm cả những người "không sống sót". Ba phương án còn lại đều chỉ nhìn thấy phần đã qua bộ lọc — tỷ phú bỏ học (không thấy hàng triệu người bỏ học không thành công), người khỏi bệnh (không thấy người dùng mà không khỏi), quán đông khách (không thấy những quán đã đóng cửa).',
          },
          {
            type: 'text',
            title: 'Minh đi tìm phần bị thiếu',
            paragraphs: [
              'Hôm sau Minh làm một việc anh chưa từng nghĩ tới: anh đi tìm dữ liệu về cả nhóm, thay vì đi tìm thêm câu chuyện thành công.',
              'Anh tìm được báo cáo khảo sát việc làm sinh viên tốt nghiệp mà chính trường anh công bố hằng năm, và một báo cáo thị trường nhân lực công nghệ thông tin.',
              'Đó là những tài liệu nằm công khai trên trang web của trường, và anh học ở đó ba năm rồi mà chưa từng mở ra.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Con số trong báo cáo không giống video chút nào.',
              'Mức lương phổ biến của sinh viên công nghệ thông tin mới ra trường nằm trong khoảng mười tới mười lăm triệu. Một tỷ lệ đáng kể mất từ ba tới sáu tháng mới có việc đầu tiên. Nhóm đạt mức rất cao trong hai năm đầu là một tỷ lệ rất nhỏ.',
              'Không có con số nào trong đó nói rằng anh trong video nói dối. Chúng chỉ nói rằng anh ấy là ngoại lệ, chứ không phải quy luật.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh nhận ra điều làm anh bị dẫn dắt không phải là con số năm mươi triệu.',
              'Mà là việc anh đã xem hai mươi video cùng loại trong một tuần, và cả hai mươi video đều là những chiếc máy bay bay về được.',
              'Hai mươi lần nhìn thấy cùng một kết quả tạo ra cảm giác đó là chuyện bình thường — dù mỗi lần đều là cùng một loại ngoại lệ.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Câu hỏi cần đặt trước mọi câu chuyện thành công',
            variant: 'info',
            text: 'Không phải "chuyện này có thật không" — phần lớn là thật. Mà là ba câu: Có bao nhiêu người đã làm y hệt như vậy? Bao nhiêu người trong số đó đạt kết quả tương tự? Những người không đạt thì bây giờ ở đâu, và vì sao tôi không nghe thấy họ?',
          },
          {
            type: 'text',
            title: 'Điều Minh không làm',
            paragraphs: [
              'Minh không bỏ kế hoạch mười tám tháng. Ba khoá học trong video vẫn là khoá học tốt, và làm dự án cá nhân vẫn là việc nên làm.',
              'Thứ anh bỏ đi là kỳ vọng.',
              'Anh sửa lại mục tiêu từ "lương năm mươi triệu sau tám tháng" thành "có việc trong vòng ba tháng sau tốt nghiệp, mức khởi điểm quanh mười hai triệu, và có hai dự án để nói chuyện khi phỏng vấn".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là phần Minh thấy quan trọng nhất mà anh suýt bỏ lỡ.',
              'Nhận ra một thiên kiến không có nghĩa là vứt bỏ hết mọi thứ mình đã tin. Nó có nghĩa là chỉnh lại mức độ tin cho đúng với bằng chứng thật.',
              'Một kế hoạch tốt với kỳ vọng sai thì vẫn hỏng — không phải vì kế hoạch, mà vì tới tháng thứ chín không thấy năm mươi triệu, người ta bỏ cuộc.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thiên kiến kẻ sống sót',
            description: 'Vì sao những câu chuyện thành công đều thật mà kết luận rút ra vẫn sai.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Cơ chế',
                  paragraphs: [
                    'Một bộ lọc loại bỏ các trường hợp thất bại trước khi bạn nhìn thấy dữ liệu. Bộ lọc đó có thể là thuật toán mạng xã hội, là sự im lặng của người thất bại, hay đơn giản là việc người thất bại không còn ở đó để kể.',
                    'Vì phần bị thiếu không để lại dấu vết, bạn không có cách nào phát hiện nó bằng cách đọc kỹ hơn thứ đang có trước mắt.',
                    'Kết luận rút ra từ mẫu đã lọc có thể sai hoàn toàn, ngay cả khi từng dữ liệu trong mẫu đều chính xác.',
                  ],
                },
                {
                  heading: 'Nhận ra nó ở đâu',
                  paragraphs: [
                    'Các câu chuyện khởi nghiệp, đầu tư, giảm cân, chữa bệnh — nơi người thành công có động lực kể còn người thất bại thì không.',
                    'Bảng xếp hạng và danh sách "những người thành công nhất": chúng được xây từ đầu ra, nên không nói được gì về xác suất khi bạn ở đầu vào.',
                    'Lời khuyên kiểu "hãy làm như tôi": lời khuyên đến từ người đã thành công, và bạn không bao giờ nghe được lời khuyên của người đã làm y hệt mà thất bại.',
                  ],
                },
                {
                  heading: 'Ba câu hỏi giải độc',
                  paragraphs: [
                    'Có bao nhiêu người đã làm y hệt như vậy?',
                    'Bao nhiêu người trong số đó đạt kết quả tương tự?',
                    'Những người không đạt bây giờ ở đâu, và vì sao tôi không nghe thấy họ?',
                    'Nếu không trả lời được ba câu này, hãy coi câu chuyện là một khả năng chứ không phải một công thức.',
                  ],
                },
              ],
              relatedConcepts: ['Thiên kiến kẻ sống sót', 'Bằng chứng giai thoại', 'Mẫu bị lọc'],
              furtherReading: [
                'Abraham Wald và bài toán gia cố giáp máy bay ném bom (1943)',
                'Báo cáo khảo sát việc làm sinh viên tốt nghiệp do các trường đại học công bố hằng năm',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Thiên kiến kẻ sống sót không cần ai nói dối — chỉ cần người thất bại im lặng là đủ.\n' +
              '✓ Nó khó bắt vì phần dữ liệu bị thiếu là phần vắng mặt, mà sự vắng mặt thì không phát ra tín hiệu.\n' +
              '✓ Câu hỏi đúng không phải "chuyện này có thật không" mà là "bao nhiêu người làm y hệt mà kết quả khác".\n' +
              '✓ Nhận ra thiên kiến không có nghĩa là vứt bỏ tất cả, mà là chỉnh lại mức độ tin cho đúng bằng chứng.',
          },
          {
            type: 'text',
            title: 'Nhưng vì sao lại là hai mươi video?',
            paragraphs: [
              'Minh yên tâm được vài hôm.',
              'Rồi một câu hỏi khác nảy ra, và câu hỏi này khó chịu hơn nhiều.',
              'Trên nền tảng đó có hàng triệu video. Vì sao trong một tuần, thứ hiện lên trước mắt anh lại là đúng hai mươi video cùng nói một điều?',
              'Ai đã chọn hai mươi cái đó cho anh?',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'ai-chon-hai-muoi-video-cho-minh',
        title: 'Ai chọn hai mươi video cho Minh?',
        blocks: [
          {
            type: 'text',
            title: 'Một thí nghiệm nhỏ',
            paragraphs: [
              'Hùng đề nghị làm một thí nghiệm. Hai đứa cùng mở ứng dụng, cùng gõ một từ khoá: "lương IT".',
              'Minh xem trên máy mình. Hùng xem trên máy Hùng.',
              'Mười video đầu tiên của hai đứa không trùng nhau một cái nào.',
            ],
          },
          {
            type: 'callout',
            icon: 'smartphone',
            title: 'Hai màn hình, hai thế giới',
            variant: 'info',
            text: 'Của Minh: 8/10 video về lương cao, lộ trình lên senior, làm cho công ty nước ngoài. Của Hùng: 4 video về thị trường khó, 3 video hướng dẫn kỹ thuật, 2 video hài, 1 video về nghề khác. Hùng học thống kê, và tuần trước cậu đang tìm hiểu về thất nghiệp ngành công nghệ.',
          },
          {
            type: 'question',
            question:
              'Vì sao cùng một từ khoá lại cho ra hai danh sách hoàn toàn khác nhau?',
            options: [
              { id: 'a', text: 'Vì hai máy dùng phiên bản ứng dụng khác nhau', isCorrect: false },
              { id: 'b', text: 'Vì hệ thống xếp thứ tự nội dung dựa trên lịch sử xem của từng người, để tăng khả năng bạn xem tiếp', isCorrect: true },
              { id: 'c', text: 'Vì mỗi lần tìm kiếm hệ thống trả kết quả ngẫu nhiên', isCorrect: false },
              { id: 'd', text: 'Vì Minh và Hùng ở hai vị trí địa lý khác nhau', isCorrect: false },
            ],
            explanation:
              'Nền tảng nội dung không xếp kết quả theo mức độ đúng đắn hay đại diện. Chúng xếp theo dự đoán về việc bạn sẽ xem tiếp bao lâu. Vì Minh đã xem hết vài video về lương cao, hệ thống suy ra anh thích chủ đề đó và đưa thêm — không phải vì nó nghĩ chủ đề đó đúng, mà vì nó nghĩ anh sẽ ở lại lâu hơn.',
          },
          {
            type: 'text',
            title: 'Cái vòng khép lại thế nào',
            paragraphs: [
              'Minh xem hết video đầu tiên vì tò mò. Hệ thống ghi nhận: người này xem hết.',
              'Nó đưa thêm hai video tương tự. Minh xem cả hai. Hệ thống ghi nhận lần nữa, mạnh hơn.',
              'Tới cuối tuần, gần như mọi thứ hiện ra trên màn hình anh đều nói cùng một điều.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Và đây là chỗ nguy hiểm: Minh không hề cảm thấy mình đang bị dẫn.',
              'Anh cảm thấy mình đang tìm hiểu. Anh cảm thấy mình đang có thêm bằng chứng.',
              'Mỗi video mới đều làm anh tin chắc hơn, vì trong đầu anh, hai mươi nguồn độc lập cùng nói một điều thì điều đó chắc phải đúng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Buồng vọng âm (echo chamber)',
            variant: 'info',
            text: 'Là môi trường thông tin mà ở đó bạn chủ yếu gặp lại những gì mình đã tin, được lặp lại bởi nhiều nguồn khác nhau. Cảm giác nó tạo ra không phải là bị nhốt, mà là được xác nhận — và đó chính là lý do nó khó nhận ra từ bên trong.',
          },
          {
            type: 'question',
            question: 'Vì sao "hai mươi nguồn cùng nói một điều" lại KHÔNG phải là bằng chứng mạnh trong trường hợp này?',
            options: [
              { id: 'a', text: 'Vì hai mươi vẫn là con số quá nhỏ', isCorrect: false },
              { id: 'b', text: 'Vì hai mươi nguồn đó không độc lập — chúng được cùng một hệ thống chọn ra vì cùng một lý do', isCorrect: true },
              { id: 'c', text: 'Vì video không phải là nguồn đáng tin', isCorrect: false },
              { id: 'd', text: 'Vì Minh không kiểm tra danh tính người quay', isCorrect: false },
            ],
            explanation:
              'Sức mạnh của việc nhiều nguồn cùng xác nhận nằm ở tính độc lập: nếu các nguồn đi tới cùng kết luận bằng những con đường riêng, xác suất tất cả cùng sai sẽ thấp. Nhưng ở đây hai mươi video được chọn ra bởi cùng một thuật toán, theo cùng một tiêu chí. Về mặt bằng chứng, chúng gần với một nguồn được nhân bản hai mươi lần hơn là hai mươi nguồn.',
          },
          {
            type: 'hot-cold-guess',
            title: 'Bạn đoán thử',
            question:
              'Theo các khảo sát việc làm của ngành công nghệ thông tin tại Việt Nam, mức lương phổ biến của sinh viên mới tốt nghiệp rơi vào khoảng bao nhiêu triệu đồng mỗi tháng?',
            answer: 13,
            unit: 'triệu đồng/tháng',
            tolerance: 3,
            hints: [
              'Con số này thấp hơn nhiều so với những gì xuất hiện trên mạng xã hội.',
              'Nó nằm trong khoảng hai chữ số, nhưng ở nửa dưới.',
              'Nhóm đạt mức trên ba mươi triệu trong hai năm đầu là một tỷ lệ rất nhỏ.',
            ],
            context:
              'Khoảng cách giữa con số bạn vừa đoán và con số bạn hay thấy trên mạng chính là độ lớn của bộ lọc. Không ai nói dối để tạo ra khoảng cách đó — nó hình thành chỉ vì người ở mức phổ biến không có lý do gì để quay video.',
          },
          {
            type: 'text',
            title: 'Minh thử phá vòng',
            paragraphs: [
              'Hùng bày cho Minh một cách kiểm tra rất đơn giản: tìm chủ động thứ ngược lại.',
              'Minh gõ "ra trường thất nghiệp IT", "lương thấp ngành công nghệ", "bỏ nghề lập trình".',
              'Và một thế giới khác mở ra: những video mà anh chưa từng thấy dù chúng tồn tại suốt thời gian qua.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Có video của một bạn nộp bốn mươi đơn trong sáu tháng, không được gọi phỏng vấn lần nào.',
              'Có video của một bạn làm hai năm rồi bỏ nghề vì không chịu được áp lực.',
              'Có video của một bạn tốt nghiệp loại giỏi nhưng vẫn đi làm với mức tám triệu ở công ty nhỏ.',
              'Lượt xem của chúng chỉ bằng một phần trăm so với video "lương năm mươi triệu".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh nhận ra một điều làm anh khó chịu: sự thật không bị giấu đi.',
              'Nó nằm công khai, ai gõ đúng từ khoá cũng thấy. Chỉ là nó không tự tìm tới anh.',
              'Và trong một thế giới mà thông tin tự tìm tới bạn nhiều hơn là bạn đi tìm nó, "không tự tìm tới" gần như tương đương với "không tồn tại".',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Thuật toán không nói dối, nó chỉ chọn',
            variant: 'warning',
            text: 'Không có video nào bị xoá, không có ai bị kiểm duyệt. Toàn bộ ảnh hưởng nằm ở thứ tự: cái gì lên trước, cái gì lùi xuống trang thứ mười. Quyền quyết định thứ tự là một quyền lực rất lớn, và nó không cần tới việc bịa ra bất cứ điều gì.',
          },
          {
            type: 'question',
            question: 'Cách nào sau đây hiệu quả nhất để kiểm tra xem mình có đang ở trong một buồng vọng âm không?',
            options: [
              { id: 'a', text: 'Đọc thêm thật nhiều nội dung về chủ đề đó', isCorrect: false },
              { id: 'b', text: 'Chủ động tìm bằng những từ khoá thể hiện quan điểm ngược, và xem thứ hiện ra có xa lạ với mình không', isCorrect: true },
              { id: 'c', text: 'Hỏi bạn bè xem họ có nghĩ giống mình không', isCorrect: false },
              { id: 'd', text: 'Kiểm tra số lượt thích của các bài mình đã xem', isCorrect: false },
            ],
            explanation:
              'Đọc thêm trong cùng một dòng chảy chỉ làm buồng vọng âm chắc hơn. Hỏi bạn bè cũng không giúp nhiều, vì bạn bè thường ở trong cùng môi trường thông tin với bạn. Phép thử hiệu quả là chủ động gõ từ khoá ngược chiều: nếu thứ hiện ra làm bạn ngạc nhiên vì "hoá ra có nhiều người nghĩ thế này", thì bạn vừa đo được độ dày của bức tường quanh mình.',
          },
          {
            type: 'text',
            title: 'Không phải lỗi của một công ty nào',
            paragraphs: [
              'Minh định bực với nền tảng. Hùng cản: "Ông nghĩ họ ngồi họp bàn cách lừa ông à?"',
              'Thứ hệ thống được giao làm rất đơn giản: giữ người dùng ở lại lâu hơn. Nó không có khái niệm đúng sai, không có khái niệm đại diện hay không đại diện.',
              'Nó chỉ nhận ra rằng nội dung khiến người ta ở lại thường là nội dung khiến người ta thấy phấn khích, tức giận, hoặc được xác nhận. Và nó đưa thêm thứ đó.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao nói hệ thống gợi ý "tối ưu sai mục tiêu" chứ không phải "cố tình đưa tin sai"?',
            options: [
              { id: 'a', text: 'Vì hệ thống không có khả năng phân biệt tin thật tin giả', isCorrect: false },
              { id: 'b', text: 'Vì mục tiêu nó được giao là thời gian xem, mà nội dung giữ chân lâu không trùng với nội dung đúng và đại diện', isCorrect: true },
              { id: 'c', text: 'Vì công ty không đủ nhân lực kiểm duyệt', isCorrect: false },
              { id: 'd', text: 'Vì người dùng không báo cáo nội dung sai', isCorrect: false },
            ],
            explanation:
              'Không cần ai có ý đồ xấu để tạo ra một hệ thống gây hại. Chỉ cần chọn sai thứ để tối ưu. Khi mục tiêu là thời gian xem, mọi thứ khiến người ta ở lại — kể cả nội dung cực đoan, giật gân hay không đại diện — đều được thưởng. Đây là kiểu vấn đề sẽ quay lại nhiều lần trong khoá học này.',
          },
          {
            type: 'text',
            title: 'Bốn mươi đơn của một người lạ',
            paragraphs: [
              'Trong số những video ngược chiều, có một cái Minh xem đi xem lại.',
              'Một bạn nữ ngồi trước máy tính, không trang trí gì, kể chuyện nộp bốn mươi đơn trong sáu tháng và được gọi phỏng vấn ba lần.',
              'Video đó có bốn trăm lượt xem. Video "lương năm mươi triệu" có ba trăm bốn mươi nghìn lượt thích.',
              'Minh nghĩ: nếu tỷ lệ ngoài đời cũng giống tỷ lệ lượt xem, thì thế giới này rất khác với thế giới thật.',
            ],
          },
          {
            type: 'text',
            title: 'Minh đổi cách dùng điện thoại',
            paragraphs: [
              'Anh không xoá ứng dụng. Anh vẫn xem video, và anh vẫn thấy nó có ích.',
              'Nhưng anh thêm một thói quen: với những chủ đề anh sắp ra quyết định dựa trên đó, anh bắt buộc mình gõ tìm một lần theo hướng ngược lại trước khi kết luận.',
              'Anh gọi đó là "tìm cái mình không muốn thấy".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Việc này mất chừng ba phút, và nó không dễ chịu chút nào.',
              'Vì mục đích của nó chính là làm bạn khó chịu — đưa vào tầm mắt những thứ mà cả bạn lẫn hệ thống đều đang tránh.',
              'Hùng nói một câu Minh nhớ mãi: "Cái gì làm ông thấy dễ chịu quá thì thường là cái ông đã tin sẵn rồi."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Buồng vọng âm và thứ tự hiển thị',
            description: 'Vì sao hai người gõ cùng một từ khoá lại nhìn thấy hai thế giới khác nhau.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Cơ chế hình thành',
                  paragraphs: [
                    'Hệ thống gợi ý xếp nội dung theo dự đoán về thời gian bạn sẽ ở lại, không theo mức độ đúng đắn hay tính đại diện.',
                    'Mỗi lần bạn xem hết một video, tín hiệu được củng cố, và nội dung tương tự được đẩy lên. Vòng lặp này khép lại rất nhanh, thường chỉ trong vài ngày.',
                    'Cảm giác chủ quan không phải là bị nhốt, mà là được xác nhận: bạn thấy mình đang tìm hiểu và đang tích luỹ bằng chứng.',
                  ],
                },
                {
                  heading: 'Vì sao "nhiều nguồn cùng nói" không còn là bằng chứng mạnh',
                  paragraphs: [
                    'Giá trị của việc nhiều nguồn xác nhận nằm ở tính độc lập giữa các nguồn.',
                    'Khi các nguồn được cùng một hệ thống chọn ra theo cùng một tiêu chí, chúng không còn độc lập — về mặt bằng chứng, chúng gần với một nguồn được nhân bản.',
                    'Hỏi thêm một câu trước khi tin: những nguồn này đến với tôi bằng cách nào, và ai đã chọn chúng?',
                  ],
                },
                {
                  heading: 'Phép thử ba phút',
                  paragraphs: [
                    'Gõ tìm bằng từ khoá thể hiện quan điểm ngược với điều bạn đang tin.',
                    'Nếu kết quả làm bạn ngạc nhiên vì số lượng và mức độ nghiêm túc của phía bên kia, thì đó là thước đo độ dày của bức tường quanh bạn.',
                    'Với những chủ đề bạn sắp ra quyết định dựa trên đó, hãy coi bước này là bắt buộc chứ không phải tuỳ chọn.',
                  ],
                },
              ],
              relatedConcepts: ['Buồng vọng âm', 'Bong bóng lọc', 'Tính độc lập của nguồn'],
              furtherReading: [
                'Các nghiên cứu về cá nhân hoá nội dung và phân cực quan điểm trên mạng xã hội',
                'Báo cáo thị trường nhân lực công nghệ thông tin Việt Nam công bố hằng năm',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Hai người gõ cùng một từ khoá nhìn thấy hai danh sách khác nhau, vì thứ tự được cá nhân hoá theo lịch sử xem.\n' +
              '✓ Buồng vọng âm không tạo cảm giác bị nhốt mà tạo cảm giác được xác nhận — nên rất khó nhận ra từ bên trong.\n' +
              '✓ Nhiều nguồn cùng nói một điều chỉ là bằng chứng mạnh khi các nguồn độc lập với nhau.\n' +
              '✓ Phép thử: chủ động gõ từ khoá ngược chiều với điều mình đang tin, và xem thứ hiện ra có xa lạ không.',
          },
          {
            type: 'text',
            title: 'Nhưng thuật toán không phải thủ phạm duy nhất',
            paragraphs: [
              'Minh kể lại toàn bộ chuyện này cho Hùng, khá tự hào vì mình đã hiểu ra.',
              'Hùng nghe xong, hỏi một câu: "Cái tuần đầu tiên đó, ông xem hết video nào và ông lướt qua video nào?"',
              'Minh khựng lại. Anh nhớ ra mình đã lướt qua vài video nói về thị trường khó khăn — vì anh thấy chúng "tiêu cực" và "than vãn".',
              'Thuật toán học từ đâu ra? Nó học từ chính những lần anh vuốt tay.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'minh-tim-cai-minh-muon-thay',
        title: 'Minh tìm cái Minh muốn thấy',
        blocks: [
          {
            type: 'text',
            title: 'Câu hỏi khó chịu nhất',
            paragraphs: [
              'Minh về phòng và ngồi nghĩ về câu hỏi của Hùng.',
              'Thuật toán đưa anh hai mươi video lương cao, đúng. Nhưng nó đưa được là vì anh đã xem hết chúng. Và anh xem hết vì anh muốn nghe điều đó.',
              'Anh đang lo lắng về tương lai. Một video nói "sẽ ổn thôi, làm theo lộ trình này là được" thì dễ chịu. Một video nói "thị trường khó lắm" thì không.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Thiên kiến xác nhận (confirmation bias)',
            variant: 'info',
            text: 'Là xu hướng tìm kiếm, chú ý và ghi nhớ những thông tin ủng hộ điều mình đã tin, đồng thời bỏ qua hoặc hạ thấp những thông tin ngược lại. Nó hoạt động ở cả ba khâu: bạn tìm gì, bạn đọc kỹ cái gì, và bạn nhớ được cái gì.',
          },
          {
            type: 'question',
            question:
              'Thiên kiến xác nhận khác gì so với việc cố tình lờ đi những thông tin bất lợi?',
            options: [
              { id: 'a', text: 'Không khác gì, đều là né tránh sự thật', isCorrect: false },
              { id: 'b', text: 'Thiên kiến xác nhận diễn ra ngoài ý thức — người mắc phải thật sự tin rằng mình đang khách quan', isCorrect: true },
              { id: 'c', text: 'Thiên kiến xác nhận chỉ xảy ra với người ít học', isCorrect: false },
              { id: 'd', text: 'Thiên kiến xác nhận chỉ xảy ra trên mạng xã hội', isCorrect: false },
            ],
            explanation:
              'Đây là điểm khiến nó nguy hiểm. Người cố tình lờ đi thì biết mình đang lờ đi. Người mắc thiên kiến xác nhận thì thấy mình đang nghiên cứu nghiêm túc — họ thật lòng tin là mình khách quan. Và các nghiên cứu cho thấy người có học vấn cao đôi khi còn mắc nặng hơn, vì họ giỏi hơn trong việc tìm lý lẽ bảo vệ điều mình đã tin.',
          },
          {
            type: 'text',
            title: 'Minh đọc lại một bài đăng',
            paragraphs: [
              'Trong một nhóm sinh viên công nghệ, có một bài đăng mà tuần trước Minh đã thả tim và còn chia sẻ cho Hùng.',
              'Hôm nay anh đọc lại, lần này với câu hỏi: bài này có bao nhiêu chỗ thật sự là bằng chứng?',
              'Anh đọc từng câu một, và anh đếm được năm chỗ có vấn đề — trong một bài chỉ dài sáu câu.',
            ],
          },
          {
            type: 'bias-detector',
            title: 'Bóc từng câu trong bài đăng',
            instruction:
              'Bấm vào từng cụm được bôi đậm và chọn xem nó mắc lỗi lập luận nào. Cả bài chỉ dài sáu câu, nhưng có năm chỗ đáng ngờ.',
            article: {
              text: BAI_DANG,
              source: 'Bài đăng trong một nhóm sinh viên công nghệ (nội dung mô phỏng)',
            },
            biasOptions: [
              { id: 'song-sot', label: 'Thiên kiến kẻ sống sót' },
              { id: 'giai-thoai', label: 'Bằng chứng giai thoại' },
              { id: 'so-dong', label: 'Viện dẫn số đông' },
              { id: 'ad-hominem', label: 'Tấn công cá nhân' },
              { id: 'uy-tin', label: 'Viện dẫn uy tín' },
            ],
            segments: [
              {
                id: 's1',
                text: 'đi làm 8 tháng đã lên senior, lương 50 triệu',
                startIndex: BAI_DANG.indexOf('đi làm 8 tháng đã lên senior, lương 50 triệu'),
                biasType: 'song-sot',
                explanation:
                  'Một trường hợp đạt kết quả rất tốt được dùng làm điểm tựa cho toàn bộ lập luận. Người viết là chiếc máy bay bay về được; những người làm y hệt mà không lên senior sau tám tháng thì không viết bài này.',
              },
              {
                id: 's2',
                text: 'Mình có một đứa bạn học ngành khác, ra trường lương 9 triệu, giờ vẫn giậm chân tại chỗ.',
                startIndex: BAI_DANG.indexOf('Mình có một đứa bạn học ngành khác'),
                biasType: 'giai-thoai',
                explanation:
                  'Một người quen được dùng làm đại diện cho cả một ngành. Bằng chứng giai thoại nghe rất thuyết phục vì nó cụ thể và có thật, nhưng một trường hợp không nói được gì về phân bố chung.',
              },
              {
                id: 's3',
                text: 'Ai cũng biết học IT thì không bao giờ thất nghiệp.',
                startIndex: BAI_DANG.indexOf('Ai cũng biết học IT'),
                biasType: 'so-dong',
                explanation:
                  'Cụm "ai cũng biết" thay thế cho bằng chứng. Việc nhiều người tin một điều không làm điều đó đúng — và ở đây nó còn được dùng để chặn trước mọi phản biện, vì ai phản đối thì hoá ra không thuộc nhóm "ai cũng".',
              },
              {
                id: 's4',
                text: 'Mấy người kêu ca thị trường khó thì đa số là mấy bạn lười',
                startIndex: BAI_DANG.indexOf('Mấy người kêu ca thị trường khó'),
                biasType: 'ad-hominem',
                explanation:
                  'Thay vì trả lời câu hỏi thị trường có khó hay không, người viết gán phẩm chất xấu cho người đặt câu hỏi. Lập luận không được đụng tới; chỉ có người nói bị đụng tới.',
              },
              {
                id: 's5',
                text: 'anh ấy làm CTO nên chắc chắn anh ấy đúng',
                startIndex: BAI_DANG.indexOf('anh ấy làm CTO'),
                biasType: 'uy-tin',
                explanation:
                  'Chức danh được dùng thay cho lý lẽ. Một CTO có thể có hiểu biết tốt về ngành, nhưng chức danh không làm cho một phát biểu trở nên đúng — nhất là phát biểu về xác suất thành công của người khác.',
              },
            ],
          },
          {
            type: 'text',
            title: 'Điều làm Minh giật mình',
            paragraphs: [
              'Không phải là bài đăng đó có năm lỗi.',
              'Mà là tuần trước anh đã đọc nó, thấy hợp lý, thả tim và chia sẻ — mà không nhận ra một lỗi nào.',
              'Cùng một bài, cùng một người đọc. Khác biệt duy nhất là tuần trước anh đang muốn tin nó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hùng nói: "Ông thử tưởng tượng bài đó viết ngược lại xem. Kiểu: mình học IT ra, thất nghiệp tám tháng, ai bảo IT dễ xin việc là chưa đi xin thử."',
              '"Chắc tui sẽ soi kỹ lắm," Minh thừa nhận. "Kiểu, ông này chắc học dở."',
              '"Đó. Cùng một kiểu lập luận, mà ông soi kỹ cái ngược ý ông, còn cái hợp ý ông thì ông cho qua."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Hai tiêu chuẩn cho hai phía',
            variant: 'warning',
            text: 'Biểu hiện phổ biến nhất của thiên kiến xác nhận không phải là từ chối bằng chứng ngược chiều, mà là áp hai tiêu chuẩn khác nhau: bằng chứng ủng hộ mình thì "đủ rồi", bằng chứng chống lại mình thì "cần nghiên cứu thêm". Cả hai phản ứng đều nghe rất hợp lý khi bạn đang ở bên trong.',
          },
          {
            type: 'question',
            question: 'Cách nào giúp phát hiện mình đang áp hai tiêu chuẩn khác nhau?',
            options: [
              { id: 'a', text: 'Đọc lại bằng chứng nhiều lần hơn', isCorrect: false },
              { id: 'b', text: 'Thử đảo chiều: nếu bằng chứng này ủng hộ phía ngược lại, mình có chấp nhận nó dễ dàng như vậy không?', isCorrect: true },
              { id: 'c', text: 'Chỉ tin những nguồn có uy tín cao', isCorrect: false },
              { id: 'd', text: 'Tránh đọc những nội dung gây tranh cãi', isCorrect: false },
            ],
            explanation:
              'Phép thử đảo chiều là công cụ đơn giản và hiệu quả nhất: giữ nguyên chất lượng bằng chứng, chỉ đổi kết luận mà nó ủng hộ, rồi quan sát phản ứng của chính mình. Nếu bạn thấy mình bỗng dưng khắt khe hơn hẳn, thì cái khắt khe đó không đến từ bằng chứng mà đến từ kết luận.',
          },
          {
            type: 'text',
            title: 'Minh viết ra điều mình muốn tin',
            paragraphs: [
              'Hùng bày cho Minh một cách mà cậu học được ở lớp phương pháp nghiên cứu.',
              'Trước khi đi tìm thông tin về một chủ đề, hãy viết ra hai dòng: mình đang muốn kết luận là gì, và mình sợ kết luận nào nhất.',
              'Minh viết: "Muốn tin rằng học IT là lựa chọn an toàn. Sợ nhất là ra trường không xin được việc."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Viết ra hai dòng đó không làm anh khách quan hơn.',
              'Nhưng nó biến thiên kiến từ một thứ vô hình thành một thứ có tên. Và một thứ có tên thì kiểm tra được: khi anh thấy mình đang gật gù với một bài viết, anh nhìn lại dòng thứ nhất và hỏi "mình gật vì nó đúng hay vì nó hợp ý mình?"',
              'Anh nói với Hùng đây là công cụ hữu ích nhất anh học được trong cả học kỳ.',
            ],
          },
          {
            type: 'text',
            title: 'Vì sao càng thông minh càng dễ mắc',
            paragraphs: [
              'Hùng kể một kết quả nghiên cứu làm Minh khó chịu: trong nhiều thí nghiệm, người có kỹ năng lập luận tốt hơn KHÔNG ít thiên kiến hơn. Đôi khi họ còn nhiều hơn.',
              'Lý do nghe thì trái khoáy nhưng rất hợp lý: kỹ năng lập luận là một công cụ, và công cụ thì phục vụ mục tiêu của người cầm nó.',
              'Nếu mục tiêu ngầm là bảo vệ điều mình đã tin, thì người lập luận giỏi sẽ dựng được hàng rào chắc hơn nhiều so với người lập luận kém.',
            ],
          },
          {
            type: 'question',
            question: 'Điều gì quyết định kỹ năng phản biện giúp bạn hay hại bạn?',
            options: [
              { id: 'a', text: 'Mức độ thành thạo của kỹ năng đó', isCorrect: false },
              { id: 'b', text: 'Hướng bạn chĩa nó vào: chĩa ra ngoài thì nó củng cố thiên kiến, chĩa vào chính mình thì nó sửa được thiên kiến', isCorrect: true },
              { id: 'c', text: 'Số lượng nguồn thông tin bạn đọc', isCorrect: false },
              { id: 'd', text: 'Việc bạn có tranh luận công khai hay không', isCorrect: false },
            ],
            explanation:
              'Kỹ năng phản biện chỉ chĩa ra ngoài sẽ biến thành khả năng bác bỏ mọi thứ trái ý mình — nghe rất sắc sảo mà thực chất là thiên kiến được vũ trang. Nó chỉ trở thành công cụ tìm ra sự thật khi bạn dùng chính nó để soi lập luận của mình, đặc biệt là những lập luận bạn thấy dễ chịu nhất.',
          },
          {
            type: 'text',
            title: 'Minh thử soi ngược một lần',
            paragraphs: [
              'Minh làm một bài tập Hùng gợi ý: viết ra lập luận mạnh nhất cho phía anh không muốn tin.',
              'Anh viết: "Thị trường công nghệ ở Việt Nam đã qua giai đoạn tăng nóng. Số sinh viên tốt nghiệp mỗi năm tăng nhanh hơn số vị trí mới. Các công cụ tự động đang làm giảm nhu cầu ở nhóm việc đơn giản — đúng nhóm mà người mới ra trường ứng tuyển."',
              'Viết xong anh ngồi nhìn ba câu đó khá lâu. Chúng chắc hơn anh muốn.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều bất ngờ là bài tập này không làm anh nản.',
              'Nó làm anh đổi kế hoạch: thay vì chỉ học ba khoá trong video, anh thêm vào phần thực tập sớm từ năm ba và một mảng chuyên sâu ít người theo.',
              'Cả hai điều chỉnh ấy đều là phản ứng trực tiếp với ba câu anh vừa viết ra — ba câu mà nếu không ép mình viết, anh sẽ không bao giờ nghĩ tới.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Viết ra lập luận mạnh nhất của phía bên kia',
            variant: 'info',
            text: 'Kỹ thuật này gọi là steelman — dựng phiên bản mạnh nhất của quan điểm đối lập, thay vì phiên bản dễ đánh nhất. Nó có hai tác dụng: nếu bạn vẫn giữ quan điểm cũ thì bây giờ bạn giữ nó vững hơn, còn nếu bạn đổi thì bạn vừa tránh được một sai lầm mà không ai chỉ ra cho bạn.',
          },
          {
            type: 'text',
            paragraphs: [
              'Minh nhận ra steelman khác hẳn với việc "lắng nghe ý kiến trái chiều" mà người ta hay nói.',
              'Lắng nghe thì thụ động, và ta thường lắng nghe phiên bản yếu nhất của phía bên kia — người nói dở nhất, lập luận sơ hở nhất, vì đó là phiên bản dễ bác bỏ và dễ chịu nhất để nghe.',
              'Steelman thì bắt bạn tự tay viết ra phiên bản mạnh nhất. Không ai làm hộ được, vì chỉ bạn mới biết điều gì thật sự làm bạn lung lay.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thiên kiến xác nhận',
            description: 'Cách nó hoạt động ở ba khâu, và ba công cụ đối phó dùng được ngay.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba khâu nó len vào',
                  paragraphs: [
                    'Khâu tìm kiếm: bạn gõ những từ khoá dẫn tới câu trả lời bạn mong đợi, chứ không phải những từ khoá trung lập.',
                    'Khâu đánh giá: bằng chứng ủng hộ bạn được cho qua nhanh, bằng chứng ngược chiều bị soi kỹ. Cả hai đều nghe hợp lý từ bên trong.',
                    'Khâu ghi nhớ: bạn nhớ rõ những lần mình đúng và quên dần những lần mình sai.',
                  ],
                },
                {
                  heading: 'Vì sao học vấn cao không miễn nhiễm',
                  paragraphs: [
                    'Người có kỹ năng lập luận tốt hơn thì cũng giỏi hơn trong việc tìm lý lẽ bảo vệ điều họ đã tin.',
                    'Kỹ năng phản biện chỉ giúp ích khi được hướng vào chính mình; nếu chỉ hướng ra ngoài, nó làm thiên kiến vững hơn chứ không yếu đi.',
                  ],
                },
                {
                  heading: 'Ba công cụ dùng được ngay',
                  paragraphs: [
                    'Viết trước: trước khi tìm hiểu, ghi ra "mình đang muốn kết luận gì" và "mình sợ kết luận nào nhất".',
                    'Phép thử đảo chiều: nếu bằng chứng này ủng hộ phía ngược lại, mình có chấp nhận nó dễ dàng như vậy không?',
                    'Tìm cái mình không muốn thấy: chủ động gõ từ khoá ngược chiều trước khi kết luận, và coi đó là bước bắt buộc.',
                  ],
                },
              ],
              relatedConcepts: ['Thiên kiến xác nhận', 'Phép thử đảo chiều', 'Hai tiêu chuẩn'],
              furtherReading: [
                'Các nghiên cứu kinh điển về confirmation bias trong tâm lý học nhận thức',
                'Bài học B01 của khoá Logic 101 — Confirmation Bias',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Thiên kiến xác nhận diễn ra ngoài ý thức — người mắc phải thật lòng tin rằng mình đang khách quan.\n' +
              '✓ Nó len vào cả ba khâu: bạn tìm gì, bạn soi kỹ cái gì, và bạn nhớ được cái gì.\n' +
              '✓ Biểu hiện phổ biến nhất là áp hai tiêu chuẩn: bằng chứng hợp ý thì "đủ rồi", ngược ý thì "cần thêm".\n' +
              '✓ Phép thử đảo chiều và việc viết trước điều mình muốn tin biến thiên kiến vô hình thành thứ kiểm tra được.',
          },
          {
            type: 'text',
            title: 'Vẫn còn một chỗ trống',
            paragraphs: [
              'Minh đã biết nhận ra thiên kiến kẻ sống sót, biết phá buồng vọng âm, biết đảo chiều để tự kiểm tra.',
              'Nhưng anh vẫn chưa trả lời được câu hỏi ban đầu: rốt cuộc anh nên làm gì sau khi ra trường?',
              'Bóc hết những thứ sai đi thì còn lại gì để dựa vào?',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'hoi-nguoi-that-thay-vi-hoi-thuat-toan',
        title: 'Hỏi người thật thay vì hỏi thuật toán',
        blocks: [
          {
            type: 'text',
            title: 'Bóc hết rồi thì còn gì?',
            paragraphs: [
              'Minh nói với Hùng: "Giờ tui không tin video, không tin bài đăng, không tin cả cái tui muốn tin. Vậy tui dựa vào cái gì?"',
              'Hùng cười: "Ông đang mắc một lỗi khác rồi đó. Nhận ra bằng chứng yếu không có nghĩa là không còn bằng chứng nào."',
              '"Nó có nghĩa là ông phải xếp hạng bằng chứng, chứ không phải vứt hết."',
            ],
          },
          {
            type: 'callout',
            icon: 'layers',
            title: 'Xếp hạng bằng chứng, từ yếu tới mạnh',
            variant: 'info',
            text: 'Yếu nhất: một câu chuyện thành công của người lạ trên mạng. Mạnh hơn: nhiều câu chuyện từ những người bạn tự chọn ra, kể cả người thất bại. Mạnh hơn nữa: khảo sát trên toàn bộ một nhóm, có cả người không thành công. Mạnh nhất trong tầm tay bạn: dữ liệu về chính bối cảnh của bạn — trường bạn, khoá bạn, thị trường nơi bạn sẽ ứng tuyển.',
          },
          {
            type: 'question',
            question:
              'Vì sao "nhiều câu chuyện do bạn tự chọn người để hỏi" lại mạnh hơn "nhiều video cùng chủ đề trên mạng"?',
            options: [
              { id: 'a', text: 'Vì người quen thì không nói dối', isCorrect: false },
              { id: 'b', text: 'Vì bạn kiểm soát được bộ lọc: bạn chủ động hỏi cả người thành công lẫn người không, thay vì để hệ thống chọn hộ', isCorrect: true },
              { id: 'c', text: 'Vì hỏi trực tiếp thì thông tin chi tiết hơn', isCorrect: false },
              { id: 'd', text: 'Vì video trên mạng thường bị dàn dựng', isCorrect: false },
            ],
            explanation:
              'Điểm mấu chốt không phải là độ trung thực mà là ai cầm bộ lọc. Khi thuật toán chọn, bạn nhận được mẫu tối ưu cho thời gian xem. Khi bạn chọn, bạn có thể cố tình đưa vào cả những người mà câu chuyện của họ không hấp dẫn — và chính những người đó mới cho biết mức phổ biến trông như thế nào.',
          },
          {
            type: 'text',
            title: 'Minh nhắn cho tám người',
            paragraphs: [
              'Minh lên trang của trường, tìm danh sách cựu sinh viên cùng ngành ra trường một tới ba năm trước, và nhắn cho tám người.',
              'Anh cố tình không chọn tám người đang làm ở công ty nổi tiếng.',
              'Anh chọn tám người ngẫu nhiên theo thứ tự trong danh sách — kể cả những người trên trang cá nhân không thấy nói gì về công việc.',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Tin nhắn Minh gửi',
            variant: 'info',
            text: '"Chào anh/chị, em là sinh viên năm ba cùng ngành. Em đang tìm hiểu để chuẩn bị ra trường và em muốn hỏi thật lòng: mất bao lâu anh/chị có việc đầu tiên, mức khởi điểm khoảng bao nhiêu, và nếu quay lại thì anh/chị sẽ làm khác đi điều gì ạ? Em hỏi để lên kế hoạch chứ không đăng đi đâu hết ạ."',
          },
          {
            type: 'text',
            paragraphs: [
              'Năm người trả lời. Ba người không.',
              'Trong năm người trả lời: hai người có việc trước khi tốt nghiệp, một người mất bốn tháng, một người mất bảy tháng, một người đã chuyển sang làm nghề khác sau một năm.',
              'Mức khởi điểm dao động từ tám tới mười tám triệu. Không ai trong năm người nhắc tới con số năm mươi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng thứ có giá trị nhất không nằm ở con số.',
              'Nó nằm ở câu hỏi thứ ba: nếu quay lại thì sẽ làm khác đi điều gì.',
              'Bốn trong năm người trả lời gần giống nhau: đi thực tập sớm hơn. Ba người nói họ tiếc vì đợi tới năm cuối mới bắt đầu tìm chỗ thực tập.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Hỏi về hối tiếc, đừng chỉ hỏi về thành công',
            variant: 'info',
            text: 'Câu "anh/chị đã làm gì để thành công" thu về một câu chuyện đã được sắp xếp lại cho gọn gàng. Câu "nếu quay lại anh/chị sẽ làm khác điều gì" thu về thứ khác hẳn: những chỗ thực sự đã sai. Câu hỏi thứ hai gần như luôn cho thông tin hữu ích hơn, và ít bị thiên kiến kẻ sống sót hơn.',
          },
          {
            type: 'question',
            question: 'Vì sao Minh cố tình nhắn cho cả những người không nói gì về công việc trên trang cá nhân?',
            options: [
              { id: 'a', text: 'Vì họ thường trả lời tin nhắn nhanh hơn', isCorrect: false },
              { id: 'b', text: 'Vì nếu chỉ hỏi người đang khoe công việc tốt, anh sẽ tự tạo lại đúng cái bộ lọc mà anh vừa thoát ra', isCorrect: true },
              { id: 'c', text: 'Vì họ có nhiều thời gian rảnh hơn', isCorrect: false },
              { id: 'd', text: 'Vì trường yêu cầu khảo sát ngẫu nhiên', isCorrect: false },
            ],
            explanation:
              'Đây là chỗ rất dễ mắc lại lỗi cũ ở một hình thức mới. Nếu Minh chỉ nhắn cho những người có trang cá nhân trông thành đạt, anh đã tự tay dựng lại bộ lọc kẻ sống sót — chỉ khác là lần này do anh dựng chứ không phải thuật toán. Việc chọn theo thứ tự danh sách, kể cả người im lặng, là cách rẻ nhất để giữ mẫu không bị lọc.',
          },
          {
            type: 'text',
            title: 'Ba người không trả lời',
            paragraphs: [
              'Hùng chỉ ra một chi tiết mà Minh đã bỏ qua: ba người không trả lời cũng là dữ liệu.',
              '"Ông không biết vì sao họ im. Có thể họ bận. Nhưng cũng có thể họ đang không có việc và không muốn nói."',
              '"Nếu đúng vậy thì cái mẫu năm người của ông vẫn còn nghiêng về phía tốt hơn thực tế một chút."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh thấy chi tiết này quan trọng, vì nó cho thấy bộ lọc rất khó bị loại bỏ hoàn toàn.',
              'Ngay cả khi bạn chủ động chọn mẫu, vẫn còn một tầng lọc nữa: ai chịu trả lời.',
              'Không thể xoá hết bộ lọc. Nhưng biết nó còn ở đó và biết nó nghiêng về hướng nào thì bạn đọc kết quả cẩn thận hơn.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Sự im lặng cũng là dữ liệu',
            variant: 'warning',
            text: 'Trong mọi khảo sát, nhóm không trả lời thường khác nhóm trả lời một cách có hệ thống. Người hài lòng dễ trả lời hơn người thất vọng; người thành công dễ kể hơn người thất bại. Vì thế một kết quả khảo sát bao giờ cũng nên đọc kèm câu hỏi: ai đã không trả lời, và họ có khả năng khác gì với những người đã trả lời?',
          },
          {
            type: 'text',
            title: 'Kế hoạch cuối cùng của Minh',
            paragraphs: [
              'Minh viết lại kế hoạch một lần nữa. Lần này nó ngắn hơn, và nó dựa trên những thứ khác hẳn ban đầu.',
              '📅 Xin thực tập từ học kỳ hè năm ba, kể cả nếu chỗ thực tập không tên tuổi và trả rất ít.',
              '🎯 Chọn một mảng chuyên sâu ít người theo, thay vì mảng phổ biến nhất.',
              '📊 Kỳ vọng: có việc trong vòng bốn tháng sau tốt nghiệp, mức khởi điểm mười tới mười lăm triệu.',
              '🔁 Mỗi sáu tháng hỏi lại vài người đi trước, vì thị trường có thể đổi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'So với kế hoạch đầu tiên, điểm khác lớn nhất không phải là nội dung công việc.',
              'Kế hoạch đầu tiên dựa trên một câu chuyện. Kế hoạch này dựa trên một phân bố — Minh biết mình có thể rơi vào chỗ nào trong dải kết quả, và anh chuẩn bị cho cả phần dưới của dải đó.',
              'Đó là khác biệt giữa việc lấy cảm hứng từ một video và việc ra quyết định dựa trên bằng chứng.',
            ],
          },
          {
            type: 'question',
            question: 'Điểm khác biệt cốt lõi giữa hai kế hoạch của Minh là gì?',
            options: [
              { id: 'a', text: 'Kế hoạch mới ít tham vọng hơn nên dễ đạt hơn', isCorrect: false },
              { id: 'b', text: 'Kế hoạch mới dựa trên một dải kết quả có thể xảy ra, thay vì dựa trên một trường hợp tốt nhất', isCorrect: true },
              { id: 'c', text: 'Kế hoạch mới ngắn hơn nên dễ nhớ hơn', isCorrect: false },
              { id: 'd', text: 'Kế hoạch mới không dựa vào thông tin trên mạng', isCorrect: false },
            ],
            explanation:
              'Hạ kỳ vọng không phải là mục tiêu — nếu Minh có bằng chứng tốt cho thấy mức năm mươi triệu là khả thi, giữ nguyên kỳ vọng đó mới là hợp lý. Thay đổi thực sự là ở chỗ anh chuyển từ một điểm duy nhất (kết quả tốt nhất) sang một dải (các kết quả có thể xảy ra và xác suất tương ứng), rồi lập kế hoạch chịu được cả phần dưới của dải.',
          },
          {
            type: 'text',
            title: 'Một năm rưỡi sau',
            paragraphs: [
              'Minh có việc trước khi tốt nghiệp hai tháng, tại chính công ty anh thực tập hồi hè năm ba.',
              'Mức khởi điểm mười ba triệu. Không phải năm mươi.',
              'Hùng hỏi anh có tiếc không khi đã hạ kỳ vọng xuống. Minh nói không — nếu anh vẫn giữ mục tiêu năm mươi triệu, thì ở tháng thứ tám anh đã coi mình là kẻ thất bại và có khi đã bỏ ngành.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh cũng thừa nhận một điều: kế hoạch của anh vẫn có thể sai.',
              'Thị trường có thể đổi. Mảng anh chọn có thể hết thời. Năm người anh hỏi có thể không đại diện cho khoá của anh.',
              '"Tui không chắc mình đúng," anh nói. "Tui chỉ chắc là tui đã bớt sai hơn hồi tháng Chín năm ngoái."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Khiêm tốn trí tuệ (intellectual humility)',
            variant: 'info',
            text: 'Không phải là nghi ngờ mọi thứ hay không dám kết luận. Nó là việc gắn một mức độ tin cậy vào từng kết luận, và sẵn sàng chỉnh mức độ đó khi có bằng chứng mới. Người khiêm tốn trí tuệ vẫn ra quyết định dứt khoát — họ chỉ không nhầm sự dứt khoát với sự chắc chắn.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Ra quyết định khi bằng chứng không hoàn hảo',
            description: 'Cách xếp hạng bằng chứng và bốn câu hỏi dùng được cho mọi quyết định lớn.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '5 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Xếp hạng bằng chứng',
                  paragraphs: [
                    'Yếu nhất: một câu chuyện thành công của người lạ, đến với bạn qua thuật toán.',
                    'Mạnh hơn: nhiều câu chuyện từ những người do chính bạn chọn ra, có chủ ý đưa vào cả người không thành công.',
                    'Mạnh hơn nữa: khảo sát trên toàn bộ một nhóm, bao gồm cả những người thất bại.',
                    'Mạnh nhất trong tầm tay: dữ liệu về đúng bối cảnh của bạn — trường bạn, khoá bạn, thị trường bạn sẽ tham gia.',
                  ],
                },
                {
                  heading: 'Bốn câu hỏi trước một quyết định lớn',
                  paragraphs: [
                    'Ai đã bị lọc ra trước khi tôi nhìn thấy thông tin này?',
                    'Nếu bằng chứng này ủng hộ phía ngược lại, tôi có chấp nhận nó dễ dàng như vậy không?',
                    'Lập luận mạnh nhất của phía tôi không muốn tin là gì? (Tự tay viết ra, đừng chờ người khác nói.)',
                    'Kế hoạch của tôi có sống sót được không nếu kết quả rơi vào phần dưới của dải?',
                  ],
                },
                {
                  heading: 'Hỏi người đi trước cho đúng cách',
                  paragraphs: [
                    'Chọn người theo danh sách chứ không theo mức độ trông thành đạt trên trang cá nhân.',
                    'Hỏi về hối tiếc ("nếu quay lại anh/chị làm khác điều gì") thay vì chỉ hỏi về bí quyết thành công.',
                    'Đếm cả những người không trả lời, và giả định rằng nhóm im lặng có khả năng khác nhóm trả lời một cách có hệ thống.',
                  ],
                },
              ],
              relatedConcepts: ['Xếp hạng bằng chứng', 'Steelman', 'Khiêm tốn trí tuệ', 'Thiên lệch do không phản hồi'],
              furtherReading: [
                'Bài học B01 và B02 của khoá Logic 101 — Confirmation Bias và Ngụy biện là gì',
                'Báo cáo khảo sát việc làm sinh viên tốt nghiệp của các trường đại học',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nhận ra bằng chứng yếu không có nghĩa là vứt hết bằng chứng — mà là biết xếp hạng chúng.\n' +
              '✓ Điều quan trọng không phải nguồn có trung thực không, mà là ai đang cầm bộ lọc chọn ra thứ bạn nhìn thấy.\n' +
              '✓ Hỏi về hối tiếc cho thông tin thật hơn nhiều so với hỏi về bí quyết thành công.\n' +
              '✓ Khiêm tốn trí tuệ không phải là do dự — vẫn quyết dứt khoát, chỉ không nhầm dứt khoát với chắc chắn.',
          },
          {
            type: 'text',
            title: 'Điều Minh mang theo',
            paragraphs: [
              'Minh vẫn xem video trên mạng. Anh vẫn thích những câu chuyện thành công, và anh không thấy có gì sai trong việc đó.',
              'Thứ thay đổi là một câu hỏi anh tự động đặt ra bây giờ, gần như thành phản xạ, mỗi khi thấy mình gật gù với điều gì:',
              '"Ai đã không có mặt ở đây?"',
              'Câu hỏi đó không cho anh câu trả lời. Nó chỉ nhắc anh rằng cái anh đang nhìn không phải là toàn bộ bức tranh — và với hầu hết quyết định trong đời, biết được chừng đó đã là rất nhiều.',
            ],
          },
        ],
      },
    ],
  },
};
