import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Bà Bảy × Logic 101 — "Thuốc trên YouTube".
 *
 * Bà Bảy có bệnh mạn tính, uống thuốc đều đặn, và mỗi ngày nhận được vài video
 * hứa chữa khỏi. Câu chuyện dạy đúng ba thứ bà dùng được: lời chứng thực chứng
 * minh được gì, "tự nhiên" nghĩa là gì, và nói chuyện với bác sĩ thế nào.
 *
 * Nội dung y tế trong chương này chỉ ở mức nguyên tắc chung và luôn dẫn về việc
 * hỏi bác sĩ — không đưa ra bất kỳ chỉ dẫn điều trị nào.
 */
export const BABAY_LOGIC: StorySeed = {
  slug: 'babay-logic',
  characterSlug: 'retiree',
  title: 'Thuốc trên YouTube',
  teaser:
    'Video có ba trăm người kể rằng họ đã khỏi tiểu đường trong bảy ngày. Bà Bảy uống thuốc mười hai năm và chưa ai nói với bà rằng sẽ khỏi.',
  icon: 'youtube',
  estimatedTime: '~30 phút',
  sortOrder: 4,
  courseSlugs: [COURSE.logic],
  part: {
    name: 'Bà Bảy và ba trăm lời chứng thực',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'video-chua-khoi-trong-bay-ngay',
        title: 'Video chữa khỏi trong bảy ngày',
        blocks: [
          {
            type: 'text',
            title: 'Bà Bảy và mười hai năm uống thuốc',
            paragraphs: [
              'Bà Bảy bị tiểu đường tuýp 2 từ năm sáu mươi tuổi. Mười hai năm nay, sáng nào bà cũng uống thuốc, ba tháng đi khám một lần, và đo đường huyết ở nhà.',
              'Bác sĩ chưa bao giờ nói với bà rằng bệnh này sẽ khỏi. Ông nói nó kiểm soát được.',
              'Bà Bảy chấp nhận điều đó, nhưng bà chưa bao giờ thôi mong có ngày không phải uống thuốc nữa.',
            ],
          },
          {
            type: 'callout',
            icon: 'youtube',
            title: 'Video hiện lên trên điện thoại bà',
            variant: 'info',
            text: '"BÍ QUYẾT DÂN GIAN CHỮA KHỎI TIỂU ĐƯỜNG TRONG 7 NGÀY — Hàng nghìn người đã khỏi hẳn, không cần uống thuốc tây suốt đời!" — 2,4 triệu lượt xem. Trong video, một người đàn ông mặc áo blouse trắng, ngồi trước kệ sách, nói về một bài thuốc từ lá cây.',
          },
          {
            type: 'question',
            question:
              'Video có 2,4 triệu lượt xem và hàng trăm bình luận cảm ơn. Điều đó chứng minh được gì về hiệu quả của bài thuốc?',
            options: [
              { id: 'a', text: 'Chứng minh bài thuốc có hiệu quả với nhiều người', isCorrect: false },
              { id: 'b', text: 'Không chứng minh gì về hiệu quả — lượt xem đo mức độ hấp dẫn, bình luận cảm ơn không cho biết có bao nhiêu người dùng mà không đỡ', isCorrect: true },
              { id: 'c', text: 'Chứng minh rằng bài thuốc an toàn', isCorrect: false },
              { id: 'd', text: 'Chứng minh rằng ngành y đang giấu điều gì đó', isCorrect: false },
            ],
            explanation:
              'Lượt xem đo mức độ hấp dẫn của tiêu đề, không đo hiệu quả của nội dung. Còn phần bình luận thì mắc đúng thiên kiến kẻ sống sót: người thấy đỡ có động lực vào cảm ơn, người dùng không đỡ thì lặng lẽ bỏ đi, và người trở nặng thì đang ở bệnh viện chứ không ngồi bình luận. Bạn nhìn thấy một mẫu đã bị lọc ba lần trước khi tới mắt bạn.',
          },
          {
            type: 'text',
            title: 'Bà Bảy xem hết video',
            paragraphs: [
              'Trong video có ba thứ làm bà tin.',
              'Thứ nhất: người nói mặc áo blouse trắng, phía sau là kệ sách dày.',
              'Thứ hai: có bảy người lần lượt xuất hiện kể chuyện của họ, đưa cả tờ xét nghiệm ra trước máy quay.',
              'Thứ ba: người nói nhắc đi nhắc lại rằng đây là "bài thuốc của ông cha ta", "hoàn toàn từ thiên nhiên", "không hoá chất".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Khoa, con trai bà, xem lại video theo yêu cầu của mẹ và anh chỉ ra ba thứ khác.',
              'Cái áo blouse không kèm tên bệnh viện, không kèm số chứng chỉ hành nghề, và người đó không tự giới thiệu là bác sĩ — chỉ nói "chúng tôi nghiên cứu".',
              'Bảy tờ xét nghiệm quay lướt qua, không đọc rõ được tên hay ngày tháng.',
              'Và ở cuối video có một số điện thoại đặt hàng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Dấu hiệu của uy tín và uy tín thật',
            variant: 'info',
            text: 'Áo blouse, kệ sách, cách nói chậm rãi và tự tin — đó là những dấu hiệu bề ngoài của chuyên môn, và chúng bắt chước được với chi phí gần bằng không. Uy tín thật thì có địa chỉ: tên, nơi công tác, số chứng chỉ hành nghề, công trình đã công bố. Chỗ nào cố tình không nêu những thứ đó thì bản thân sự thiếu vắng ấy là thông tin.',
          },
          {
            type: 'question',
            question: 'Vì sao "không tự giới thiệu là bác sĩ nhưng mặc áo blouse" lại là một chi tiết đáng chú ý?',
            options: [
              { id: 'a', text: 'Vì mặc áo blouse mà không phải bác sĩ là vi phạm pháp luật', isCorrect: false },
              { id: 'b', text: 'Vì nó tạo ra ấn tượng bác sĩ mà không phải nói ra câu nào sai — trách nhiệm được đẩy sang cho người xem tự suy diễn', isCorrect: true },
              { id: 'c', text: 'Vì bác sĩ thật không bao giờ quay video', isCorrect: false },
              { id: 'd', text: 'Vì áo blouse chỉ dùng trong bệnh viện', isCorrect: false },
            ],
            explanation:
              'Đây là kỹ thuật rất hay gặp: gợi ý một điều mà không phát biểu nó. Nếu nói "tôi là bác sĩ" mà không phải thì đó là hành vi có thể bị xử lý. Còn mặc áo blouse và để người xem tự kết luận thì không có câu nào sai để chỉ ra. Khoảng cách giữa "điều được nói" và "điều người xem hiểu" chính là chỗ mà loại nội dung này sống.',
          },
          {
            type: 'text',
            title: 'Cái số điện thoại ở cuối video',
            paragraphs: [
              'Khoa chỉ vào chi tiết mà anh cho là quan trọng nhất, và cũng là chi tiết bà Bảy lướt qua.',
              'Cuối video có một số điện thoại và dòng chữ "liên hệ để được tư vấn miễn phí".',
              '"Mẹ để ý nha, tư vấn thì miễn phí, nhưng cái người ta tư vấn cho mẹ là cái người ta bán."',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao việc "cuối nội dung có bán gì không" lại là câu hỏi quan trọng?',
            options: [
              { id: 'a', text: 'Vì người bán hàng luôn nói dối', isCorrect: false },
              { id: 'b', text: 'Vì nó cho biết người nói có lợi ích gắn với việc bạn tin — không chứng minh họ sai, nhưng nâng mức cần kiểm chứng lên rất cao', isCorrect: true },
              { id: 'c', text: 'Vì bán hàng qua video là hành vi bị cấm', isCorrect: false },
              { id: 'd', text: 'Vì sản phẩm bán qua mạng thường kém chất lượng', isCorrect: false },
            ],
            explanation:
              'Có lợi ích không đồng nghĩa với nói sai — bác sĩ kê thuốc cũng có lợi ích trong hệ thống y tế. Nhưng khi người đưa thông tin là người bán chính thứ đó, và không có bên độc lập nào kiểm chứng, thì bạn không còn nguồn nào để đối chiếu ngoài chính lời họ. Đó là lý do "tư vấn miễn phí" từ bên bán hàng là loại tư vấn cần cẩn thận nhất.',
          },
          {
            type: 'text',
            title: 'Bà Bảy hỏi một câu rất thực tế',
            paragraphs: [
              '"Vậy chớ mấy ông bác sĩ cũng bán thuốc mà con. Cũng có lợi ích chớ bộ."',
              'Khoa gật đầu: "Đúng rồi mẹ. Nên cái quan trọng không phải là ai không có lợi ích, mà là ai bị người khác kiểm tra."',
              '"Bác sĩ kê thuốc thì có bệnh viện quản, có bảo hiểm soi, có hội đồng chuyên môn, có quy định về kê đơn. Còn cái số điện thoại kia thì không ai kiểm cả."',
            ],
          },
          {
            type: 'text',
            title: 'Bà Bảy nói với con trai',
            paragraphs: [
              '"Mẹ biết mấy cái quảng cáo hay xạo. Nhưng bảy người đó họ đưa giấy xét nghiệm ra mà con."',
              'Khoa im một lúc rồi hỏi: "Mẹ ơi, trong bảy người đó, mẹ có thấy ai nói là dùng mà không đỡ không?"',
              '"Không, sao lại có."',
              '"Đó. Nếu có người dùng không đỡ thì họ có được lên video không mẹ?"',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy hiểu ý con ngay, vì bà từng nghe cháu bác Tư nói chuyện tương tự về mấy video lương cao.',
              'Bảy người trong video là bảy người được chọn ra để đưa lên video.',
              'Không ai chọn ra bảy người dùng mà không khỏi để quay cùng.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Người kể chuyện luôn là người được chọn',
            variant: 'warning',
            text: 'Trong một quảng cáo, người xuất hiện là người do bên quảng cáo chọn. Trong phần bình luận, người viết là người tự chọn mình. Cả hai đều không phải mẫu ngẫu nhiên. Vì thế số lượng lời chứng thực — bảy người hay ba trăm người — không làm tăng độ tin cậy, vì tất cả đều đến từ cùng một bộ lọc.',
          },
          {
            type: 'text',
            title: 'Nhưng bà Bảy vẫn phân vân',
            paragraphs: [
              '"Nhưng con ơi, cô Chín ở cuối hẻm uống cái đó thiệt, cô nói đường huyết cô xuống thiệt mà."',
              'Đây là chỗ khó nhất, và Khoa biết mình không thể trả lời bằng cách nói cô Chín nói dối.',
              'Cô Chín là người thật, bà Bảy quen mấy chục năm, và cô ấy không có lý do gì để bịa.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Khoa nói: "Con không nghĩ cô Chín nói dối đâu mẹ. Con tin là đường huyết cô ấy xuống thiệt."',
              '"Vậy sao con còn cản mẹ?"',
              '"Tại vì đường huyết xuống có nhiều lý do lắm mẹ. Cái bài thuốc chỉ là một trong mấy lý do đó thôi."',
            ],
          },
          {
            type: 'question',
            question:
              'Nếu cô Chín thật sự thấy đường huyết giảm sau khi dùng bài thuốc, điều đó chứng minh bài thuốc có tác dụng không?',
            options: [
              { id: 'a', text: 'Có, đó là bằng chứng trực tiếp', isCorrect: false },
              { id: 'b', text: 'Không đủ — vì cùng lúc đó có thể có nhiều thứ khác thay đổi, và bệnh mạn tính vốn dao động lên xuống', isCorrect: true },
              { id: 'c', text: 'Không, vì cô Chín chắc chắn nhớ nhầm', isCorrect: false },
              { id: 'd', text: 'Có, nếu cô Chín có giấy xét nghiệm', isCorrect: false },
            ],
            explanation:
              'Vấn đề không nằm ở sự trung thực hay trí nhớ của cô Chín. Nó nằm ở chỗ: khi người ta bắt đầu một bài thuốc, họ thường đồng thời ăn kiêng hơn, đi bộ nhiều hơn, ngủ đều hơn, và theo dõi sát hơn. Thêm nữa, chỉ số của bệnh mạn tính vốn lên xuống theo thời gian. Một lần giảm sau khi bắt đầu dùng thứ gì đó không tách được tác dụng của thứ đó khỏi tất cả những thứ kia.',
          },
          {
            type: 'text',
            title: 'Hai câu Khoa để lại cho mẹ',
            paragraphs: [
              'Khoa không đòi mẹ tin mình ngay. Anh chỉ để lại hai câu và bảo mẹ nghĩ.',
              '1️⃣ "Người kể chuyện luôn là người được chọn — mẹ không bao giờ gặp người dùng mà không đỡ."',
              '2️⃣ "Đỡ sau khi uống không có nghĩa là đỡ nhờ uống."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Đọc một quảng cáo sức khoẻ',
            description: 'Bốn dấu hiệu bề ngoài dễ bắt chước và bốn thứ uy tín thật luôn có.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn dấu hiệu bề ngoài, bắt chước được',
                  paragraphs: [
                    'Áo blouse trắng, ống nghe, phòng khám, kệ sách phía sau.',
                    'Giọng nói chậm rãi, tự tin, dùng thuật ngữ chuyên môn.',
                    'Lời chứng thực của nhiều người, kèm giấy xét nghiệm quay lướt qua.',
                    'Con số lớn: hàng nghìn người đã khỏi, hàng triệu lượt xem.',
                  ],
                },
                {
                  heading: 'Bốn thứ uy tín thật luôn có',
                  paragraphs: [
                    'Tên đầy đủ và nơi công tác cụ thể, tra được.',
                    'Số chứng chỉ hành nghề hoặc học hàm học vị, kiểm chứng được.',
                    'Dẫn nguồn tới nghiên cứu hoặc hướng dẫn điều trị, có tên và năm.',
                    'Nói rõ giới hạn: thuốc nào cũng có tác dụng phụ, phương pháp nào cũng có nhóm không phù hợp. Nội dung nào không bao giờ nhắc tới giới hạn là nội dung đang bán hàng.',
                  ],
                },
                {
                  heading: 'Ba câu hỏi trước khi tin',
                  paragraphs: [
                    'Người nói là ai, ở đâu, và có tra được không?',
                    'Trong số người đã dùng, có ai không đỡ không — và nếu có thì tôi có cơ hội nghe họ nói không?',
                    'Cuối nội dung này có bán gì không?',
                  ],
                },
              ],
              relatedConcepts: ['Viện dẫn uy tín', 'Thiên kiến kẻ sống sót', 'Lời chứng thực'],
              furtherReading: [
                'Bài học "Appeal to authority" trong khoá Logic 101',
                'Quy định về quảng cáo thực phẩm chức năng và thuốc tại Việt Nam',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Lượt xem đo mức độ hấp dẫn của tiêu đề, không đo hiệu quả của nội dung.\n' +
              '✓ Dấu hiệu bề ngoài của chuyên môn bắt chước được gần như miễn phí; uy tín thật thì có địa chỉ tra được.\n' +
              '✓ Gợi ý một điều mà không phát biểu nó là kỹ thuật cho phép tạo ấn tượng sai mà không nói câu nào sai.\n' +
              '✓ Người kể chuyện trong quảng cáo luôn là người được chọn — bạn không bao giờ gặp người dùng mà không đỡ.',
          },
          {
            type: 'text',
            title: 'Bà Bảy nghĩ suốt một tuần',
            paragraphs: [
              'Bà không bỏ thuốc, nhưng bà cũng không gạt được câu chuyện của cô Chín ra khỏi đầu.',
              'Cô Chín là người thật. Cô đưa cả tờ xét nghiệm ra cho bà xem, đường huyết xuống thật.',
              '"Con nói đỡ sau khi uống khác đỡ nhờ uống," bà nghĩ. "Nhưng làm sao mà biết được cái nào là cái nào?"',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'do-sau-khi-uong-va-do-nho-uong',
        title: 'Đỡ sau khi uống, và đỡ nhờ uống',
        blocks: [
          {
            type: 'text',
            title: 'Bà Bảy sang nhà cô Chín',
            paragraphs: [
              'Bà Bảy quyết định làm một việc rất bà Bảy: bà sang nhà cô Chín uống trà và hỏi cho ra lẽ.',
              'Cô Chín kể: cô bắt đầu uống bài thuốc đó từ đầu tháng Ba. Cuối tháng Tư đi xét nghiệm, đường huyết đói từ 8,6 xuống 7,1.',
              '"Vậy là nó có tác dụng chớ gì nữa chị," cô Chín nói.',
            ],
          },
          {
            type: 'callout',
            icon: 'help-circle',
            title: 'Bà Bảy hỏi thêm ba câu',
            variant: 'info',
            text: '"Hồi đó em có ăn uống khác đi không?" — "Có, em kiêng cơm trắng, bớt nước ngọt." — "Có đi bộ gì không?" — "Có, con em nó mua cái đồng hồ đếm bước, em đi mỗi sáng." — "Còn thuốc bác sĩ kê thì sao?" — "Em vẫn uống đều chớ chị, em đâu dám bỏ."',
          },
          {
            type: 'question',
            question:
              'Đường huyết của cô Chín giảm thật. Nhưng trong ba tháng đó, đã có mấy thứ thay đổi cùng lúc?',
            options: [
              { id: 'a', text: 'Một — chỉ có bài thuốc', isCorrect: false },
              { id: 'b', text: 'Bốn — bài thuốc, chế độ ăn, việc đi bộ, và thuốc bác sĩ vẫn uống đều', isCorrect: true },
              { id: 'c', text: 'Hai — bài thuốc và chế độ ăn', isCorrect: false },
              { id: 'd', text: 'Không thay đổi gì, chỉ là dao động tự nhiên', isCorrect: false },
            ],
            explanation:
              'Bốn thứ thay đổi cùng lúc, và ba trong bốn thứ đó — ăn kiêng, vận động, uống thuốc đều — là những thứ đã được chứng minh có tác dụng với đường huyết. Bài thuốc là thứ duy nhất chưa được chứng minh. Nhưng vì nó là thứ mới nhất và được chú ý nhất, nó nhận trọn công lao của cả bốn. Đây là hiện tượng gặp trong hầu hết mọi câu chuyện "tôi dùng X và tôi khỏi".',
          },
          {
            type: 'text',
            title: 'Vì sao bài thuốc nhận hết công',
            paragraphs: [
              'Bà Bảy hỏi cô Chín: "Vậy sao em không nghĩ là nhờ đi bộ với kiêng cơm?"',
              'Cô Chín nghĩ một lúc rồi nói: "Ừ hén. Tại em đi bộ với kiêng cơm hoài rồi mà, có gì mới đâu."',
              'Đó chính là câu trả lời. Cái mới thì được chú ý; cái quen thuộc thì trở nên vô hình.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng có một chi tiết quan trọng mà cô Chín kể sau đó, và nó làm bà Bảy suy nghĩ.',
              '"Thật ra chị ơi, từ hồi uống cái đó em siêng hẳn lên. Ngày nào cũng phải sắc thuốc, phải nhớ giờ uống, rồi em nghĩ uống rồi thì phải kiêng cho xứng."',
              'Bài thuốc có thể không có tác dụng dược lý nào. Nhưng nó khiến cô Chín thay đổi cả một loạt thói quen khác.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Một thứ có thể có ích mà vẫn không hiệu nghiệm',
            variant: 'info',
            text: 'Đây là chỗ tinh tế mà cả hai phía đều hay bỏ qua. Người bán nói "có tác dụng thật đó, nhiều người khỏi". Người phản bác nói "vô ích hoàn toàn". Cả hai đều bỏ sót khả năng thứ ba: bản thân thứ đó không có tác dụng dược lý, nhưng nó tạo ra một nghi thức khiến người ta chăm sóc bản thân kỹ hơn — và chính sự chăm sóc đó mới là thứ có tác dụng.',
          },
          {
            type: 'hot-cold-guess',
            title: 'Bạn đoán thử',
            question:
              'Trong các thử nghiệm lâm sàng có đối chứng, tỷ lệ người dùng giả dược (viên thuốc không chứa hoạt chất) mà vẫn báo cáo cải thiện triệu chứng thường rơi vào khoảng bao nhiêu phần trăm?',
            answer: 30,
            unit: '%',
            tolerance: 10,
            hints: [
              'Con số này lớn hơn nhiều so với những gì phần lớn mọi người đoán.',
              'Nó nằm trong khoảng hai chữ số, gần một phần ba.',
              'Chính vì con số này lớn nên mọi thử nghiệm thuốc nghiêm túc đều bắt buộc phải có nhóm dùng giả dược để so sánh.',
            ],
            context:
              'Đây là lý do vì sao "nhiều người thấy đỡ" không đủ để kết luận một phương pháp có hiệu quả. Nếu khoảng một phần ba số người thấy đỡ ngay cả khi uống viên thuốc rỗng, thì bất kỳ phương pháp nào cũng sẽ thu được hàng trăm lời chứng thực chân thành — kể cả phương pháp hoàn toàn không có tác dụng.',
          },
          {
            type: 'text',
            title: 'Vì sao mọi thử nghiệm đều cần nhóm đối chứng',
            paragraphs: [
              'Khoa giải thích cho mẹ bằng ngôn ngữ đơn giản nhất anh nghĩ ra được.',
              '"Muốn biết một thứ có tác dụng không, người ta chia hai nhóm. Một nhóm uống thuốc thật, một nhóm uống viên y hệt nhưng bên trong không có gì."',
              '"Cả hai nhóm đều không biết mình uống cái nào. Rồi so kết quả."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Nếu nhóm uống thuốc thật đỡ nhiều hơn hẳn nhóm kia thì thuốc có tác dụng."',
              '"Còn nếu hai nhóm đỡ như nhau thì cái đỡ đó không phải nhờ thuốc, mà nhờ những thứ khác — nghỉ ngơi, chăm sóc, thời gian, hoặc chính niềm tin."',
              'Bà Bảy hỏi: "Vậy cái bài thuốc trên video kia người ta có làm cái đó không?"',
              '"Nếu có thì họ đã khoe rồi mẹ. Ai làm được thử nghiệm đàng hoàng thì đó là điều đầu tiên họ nói."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Bệnh mạn tính vốn lên xuống',
            variant: 'warning',
            text: 'Chỉ số của bệnh mạn tính dao động theo mùa, theo ăn uống, theo giấc ngủ, theo cả căng thẳng. Người ta thường tìm tới một phương pháp mới vào đúng lúc chỉ số đang tệ nhất — và sau đó chỉ số có xu hướng quay về mức trung bình dù không làm gì. Hiện tượng này khiến gần như mọi phương pháp đều thu được lời khen nếu bắt đầu vào đúng lúc.',
          },
          {
            type: 'question',
            question:
              'Vì sao người ta thường bắt đầu một phương pháp mới vào đúng lúc chỉ số đang xấu nhất?',
            options: [
              { id: 'a', text: 'Vì đó là thời điểm phương pháp mới hiệu quả nhất', isCorrect: false },
              { id: 'b', text: 'Vì lúc chỉ số xấu nhất cũng là lúc người ta lo nhất và sẵn sàng thử nhất — và sau đỉnh xấu thì chỉ số có xu hướng tự quay về mức trung bình', isCorrect: true },
              { id: 'c', text: 'Vì bác sĩ khuyên như vậy', isCorrect: false },
              { id: 'd', text: 'Vì đó là ngẫu nhiên, không có quy luật', isCorrect: false },
            ],
            explanation:
              'Không ai đi tìm thuốc mới khi đang khoẻ. Người ta tìm khi đang ở đáy — và ở đáy thì hướng đi tiếp nhiều khả năng là đi lên, bất kể có làm gì. Hiện tượng này gọi là hồi quy về trung bình, và nó tặng công lao cho bất cứ thứ gì tình cờ được bắt đầu tại thời điểm đó. Nó cũng giải thích vì sao những phương pháp không có tác dụng vẫn tồn tại hàng chục năm.',
          },
          {
            type: 'text',
            title: 'Chuyện của bà Tám ở đầu hẻm',
            paragraphs: [
              'Bà Bảy nhớ ra một chuyện xảy ra hai năm trước mà lúc đó bà không để ý.',
              'Bà Tám ở đầu hẻm cũng uống một bài thuốc lá cây, cũng nói ban đầu đỡ hẳn. Rồi ba tháng sau bà Tám nhập viện vì đường huyết tăng vọt.',
              'Sau đó không ai nhắc tới bài thuốc đó nữa. Nó biến mất khỏi câu chuyện của cả xóm.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao trường hợp của bà Tám lại "biến mất" khỏi câu chuyện chung của xóm?',
            options: [
              { id: 'a', text: 'Vì mọi người nghĩ bà Tám dùng sai cách', isCorrect: false },
              { id: 'b', text: 'Vì thất bại thì không ai kể lại, nên chỉ những trường hợp thành công còn ở lại trong trí nhớ tập thể', isCorrect: true },
              { id: 'c', text: 'Vì bà Tám không muốn nói', isCorrect: false },
              { id: 'd', text: 'Vì hai năm là quá lâu để nhớ', isCorrect: false },
            ],
            explanation:
              'Đây là thiên kiến kẻ sống sót ở quy mô một khu phố. Người thấy đỡ thì kể đi kể lại, người trở nặng thì im lặng hoặc được giải thích bằng lý do khác. Sau vài năm, ký ức chung của cả xóm chỉ còn lại các ca thành công — và nó tạo cảm giác rằng những bài thuốc này "nhiều người dùng thấy tốt", trong khi mẫu đó đã bị lọc sạch phần thất bại.',
          },
          {
            type: 'text',
            title: 'Bà Bảy không nói cô Chín sai',
            paragraphs: [
              'Bà về nhà và bà không quay lại nói với cô Chín rằng bài thuốc vô dụng.',
              'Bà nghĩ nói vậy vừa không chắc đúng, vừa không có ích gì — cô Chín vẫn uống thuốc bác sĩ, vẫn đi bộ, vẫn kiêng cơm.',
              'Điều duy nhất bà nói với cô Chín, hai tuần sau, là: "Em nhớ đừng bỏ thuốc bác sĩ nghen. Còn cái kia em uống thì uống, mà đừng bỏ cái này."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy nhận ra ranh giới quan trọng nhất không nằm ở chỗ bài thuốc có tác dụng hay không.',
              'Nó nằm ở chỗ người ta có bỏ thuốc điều trị để chạy theo nó hay không.',
              'Uống thêm một thứ vô hại thì thiệt hại là tiền. Bỏ thuốc điều trị thì thiệt hại là sức khoẻ, và với tiểu đường thì có thể là mắt, là thận, là bàn chân.',
            ],
          },
          {
            type: 'text',
            title: 'Bà Bảy tự làm một phép thử nhỏ',
            paragraphs: [
              'Bà Bảy làm một việc mà Khoa không nghĩ mẹ mình sẽ làm.',
              'Bà lấy cuốn sổ ghi đường huyết ba năm gần nhất ra, và bà nhìn theo tháng thay vì nhìn từng lần.',
              'Bà thấy chỉ số của chính bà cũng lên xuống: tháng Tết bao giờ cũng cao, tháng hè thấp hơn, và có những đợt cao rồi tự xuống mà bà chẳng đổi gì cả.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Vậy là hồi tháng Ba năm ngoái mẹ tưởng nhờ mẹ bớt ăn ngọt," bà nói với Khoa. "Mà năm kia tháng Ba nó cũng xuống, mà hồi đó mẹ có bớt gì đâu."',
              'Khoa thấy đây là điều quan trọng nhất mẹ anh học được trong cả chuyện này, và nó không đến từ lời anh giải thích.',
              'Nó đến từ việc bà nhìn dữ liệu của chính mình, đủ dài để thấy được cái nền dao động bên dưới.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Vì sao "tôi dùng và tôi khỏi" không đủ',
            description: 'Bốn lý do khiến một người thật, trung thực, vẫn có thể kết luận sai về nguyên nhân.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn lý do không liên quan tới sự trung thực',
                  paragraphs: [
                    'Nhiều thứ thay đổi cùng lúc: người ta thường bắt đầu ăn kiêng, vận động, theo dõi sát hơn ngay khi bắt đầu một phương pháp mới.',
                    'Hồi quy về trung bình: người ta tìm phương pháp mới vào lúc chỉ số tệ nhất, và sau đáy thì xu hướng là đi lên dù không làm gì.',
                    'Hiệu ứng giả dược: trong các thử nghiệm, một tỷ lệ đáng kể người dùng viên thuốc rỗng vẫn báo cáo cải thiện.',
                    'Thiên kiến kẻ sống sót: bạn chỉ nghe được lời của người thấy đỡ, không nghe được lời của người dùng mà không đỡ.',
                  ],
                },
                {
                  heading: 'Vì sao thử nghiệm có đối chứng là tiêu chuẩn',
                  paragraphs: [
                    'Chia hai nhóm tương đương, một nhóm dùng thật, một nhóm dùng giả dược, cả hai đều không biết mình thuộc nhóm nào.',
                    'Bốn lý do trên tác động lên cả hai nhóm như nhau, nên phần chênh lệch còn lại mới là tác dụng thật của phương pháp.',
                    'Nếu một phương pháp đã qua thử nghiệm như vậy, người bán sẽ nói ngay từ đầu — đó là điểm mạnh nhất họ có.',
                  ],
                },
                {
                  heading: 'Ranh giới quan trọng nhất',
                  paragraphs: [
                    'Dùng thêm một thứ chưa được chứng minh: rủi ro chủ yếu là tiền, và khả năng tương tác với thuốc đang dùng — nên vẫn phải nói với bác sĩ.',
                    'Bỏ thuốc điều trị để chạy theo nó: đây là ranh giới không nên bước qua, vì hậu quả với bệnh mạn tính thường không đảo ngược được.',
                    'Câu cần nói với người thân đang thử phương pháp mới không phải là "cái đó vô dụng", mà là "đừng bỏ thuốc bác sĩ".',
                  ],
                },
              ],
              relatedConcepts: ['Hiệu ứng giả dược', 'Hồi quy về trung bình', 'Thử nghiệm có đối chứng', 'Biến gây nhiễu'],
              furtherReading: [
                'Bài học "Correlation ≠ Causation" trong khoá Logic 101',
                'Nguyên tắc thiết kế thử nghiệm lâm sàng có đối chứng ngẫu nhiên',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Khi một người bắt đầu phương pháp mới, thường có bốn thứ thay đổi cùng lúc — và cái mới nhất nhận hết công lao.\n' +
              '✓ Một phần đáng kể người dùng giả dược vẫn báo cáo cải thiện, nên "nhiều người thấy đỡ" không đủ để kết luận.\n' +
              '✓ Người ta tìm phương pháp mới vào lúc chỉ số tệ nhất, và sau đáy thì xu hướng là đi lên dù không làm gì.\n' +
              '✓ Ranh giới quan trọng nhất không phải "có tác dụng hay không" mà là "có bỏ thuốc điều trị hay không".',
          },
          {
            type: 'text',
            title: 'Còn một lý lẽ nữa bà Bảy chưa gỡ được',
            paragraphs: [
              'Trong video, câu được nhắc nhiều nhất không phải là chuyện hiệu quả.',
              'Câu được nhắc nhiều nhất là: "Hoàn toàn từ thiên nhiên, không hoá chất, an toàn tuyệt đối, ông cha ta dùng mấy trăm năm nay."',
              'Và câu đó thì bà Bảy thấy có lý thật. Cây cỏ thì làm sao hại bằng thuốc tây được.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'tu-thien-nhien-thi-lanh',
        title: '"Từ thiên nhiên thì lành"',
        blocks: [
          {
            type: 'text',
            title: 'Câu bà Bảy thấy có lý nhất',
            paragraphs: [
              '"Hoàn toàn từ thiên nhiên, không hoá chất."',
              'Bà Bảy nói với Khoa: "Cái này mẹ thấy đúng nè con. Cây cỏ thì sao mà hại bằng thuốc tây."',
              'Khoa hỏi lại một câu: "Mẹ ơi, cây thuốc phiện có phải cây không mẹ?"',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Nguỵ biện viện dẫn tự nhiên (appeal to nature)',
            variant: 'info',
            text: 'Là lối lập luận coi "tự nhiên" đồng nghĩa với "tốt, an toàn" và "nhân tạo" đồng nghĩa với "hại". Nhưng nguồn gốc của một chất không nói gì về tác dụng của nó lên cơ thể. Nấm độc, lá ngón, nọc rắn đều hoàn toàn tự nhiên; còn vitamin C tổng hợp và insulin thì đều do con người làm ra.',
          },
          {
            type: 'question',
            question:
              'Việc một chất có nguồn gốc từ cây cỏ nói lên điều gì về mức độ an toàn của nó?',
            options: [
              { id: 'a', text: 'Nó an toàn hơn chất tổng hợp', isCorrect: false },
              { id: 'b', text: 'Không nói lên gì cả — an toàn phụ thuộc vào chất đó là gì, liều bao nhiêu, và dùng cho ai', isCorrect: true },
              { id: 'c', text: 'Nó ít tác dụng phụ hơn', isCorrect: false },
              { id: 'd', text: 'Nó chỉ an toàn nếu dùng đúng bài thuốc cổ truyền', isCorrect: false },
            ],
            explanation:
              'Cơ thể không phân biệt được một phân tử đến từ cây hay từ nhà máy — nó chỉ phản ứng với cấu trúc của phân tử đó. Vấn đề quyết định là chất gì, liều bao nhiêu, và người dùng đang có tình trạng gì. Nhiều loại thuốc mạnh nhất trong y học hiện đại vốn được chiết từ thực vật, và nhiều chất độc nguy hiểm nhất cũng vậy.',
          },
          {
            type: 'text',
            title: 'Vấn đề của "không hoá chất"',
            paragraphs: [
              'Khoa chỉ ra một chi tiết nữa mà bà Bảy chưa nghĩ tới.',
              '"Mẹ nói không hoá chất. Nhưng nước cũng là hoá chất, muối cũng là hoá chất, cái gì cũng là hoá chất hết mẹ."',
              '"Cái người ta muốn nói là không thêm chất bảo quản, không thêm phụ gia. Mà cái đó thì với thuốc lại là chuyện ngược."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh giải thích: với một viên thuốc sản xuất công nghiệp, người ta biết chính xác trong đó có bao nhiêu miligam hoạt chất.',
              'Với một bài thuốc nấu từ lá cây, hàm lượng phụ thuộc vào loại cây, mùa thu hái, đất trồng, cách phơi, cách nấu.',
              'Hai thang thuốc trông giống hệt nhau có thể chênh nhau nhiều lần về nồng độ.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Không biết liều là một rủi ro, không phải một ưu điểm',
            variant: 'warning',
            text: 'Cùng một hoạt chất, liều thấp có thể có ích, liều cao có thể gây hại gan hoặc thận. Điều làm thuốc trở nên an toàn không phải là nguồn gốc của nó, mà là việc biết chính xác liều lượng và biết ai không nên dùng. Một sản phẩm không ghi hàm lượng thì không phải là "tự nhiên nên lành" — nó là "không ai biết trong đó có bao nhiêu".',
          },
          {
            type: 'sort-bucket',
            title: 'Cái nào thật sự nói lên độ an toàn?',
            instruction:
              'Xếp từng thông tin vào rổ đúng: cái nào giúp bạn đánh giá được mức độ an toàn của một sản phẩm dùng cho sức khoẻ?',
            buckets: [
              { id: 'co', label: 'Có giúp đánh giá' },
              { id: 'khong', label: 'Không nói lên gì' },
            ],
            items: [
              { id: 'a1', text: 'Ghi rõ hàm lượng hoạt chất trên mỗi liều', bucketId: 'co' },
              { id: 'a2', text: 'Có số đăng ký lưu hành và tra được', bucketId: 'co' },
              { id: 'a3', text: 'Có ghi chống chỉ định và tác dụng phụ', bucketId: 'co' },
              { id: 'a4', text: '"Hoàn toàn từ thiên nhiên, không hoá chất"', bucketId: 'khong' },
              { id: 'a5', text: '"Ông cha ta dùng mấy trăm năm nay"', bucketId: 'khong' },
              { id: 'a6', text: '"Hàng nghìn người đã dùng và khen tốt"', bucketId: 'khong' },
            ],
          },
          {
            type: 'text',
            title: 'Còn "ông cha ta dùng mấy trăm năm" thì sao?',
            paragraphs: [
              'Bà Bảy hỏi: "Nhưng ông bà mình dùng lâu vậy rồi mà con, sao lại không tính?"',
              'Khoa nói câu này cẩn thận, vì anh biết mẹ mình coi trọng chuyện đó.',
              '"Con không nói y học cổ truyền là vô dụng đâu mẹ. Nhiều cây thuốc có tác dụng thật, người ta còn nghiên cứu và chiết ra thuốc hiện đại từ đó."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Nhưng cái con nói là: dùng lâu năm không tự nó chứng minh được cái gì."',
              '"Ngày xưa người ta cũng trích máu để chữa bệnh mấy trăm năm. Cũng lâu vậy đó mẹ, mà nó hại."',
              'Bà Bảy im. Bà nhớ hồi nhỏ ở quê người ta cạo gió tới bầm cả lưng, và bà cũng từng nghĩ đó là chuyện đương nhiên.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao "được dùng lâu đời" không đủ để chứng minh một phương pháp có hiệu quả?',
            options: [
              { id: 'a', text: 'Vì người xưa không có kiến thức khoa học', isCorrect: false },
              { id: 'b', text: 'Vì thời gian tồn tại chỉ cho biết phương pháp được truyền lại, không cho biết nó có tác dụng — nhiều phương pháp vô ích hoặc có hại cũng tồn tại rất lâu', isCorrect: true },
              { id: 'c', text: 'Vì cây cỏ ngày xưa khác cây cỏ bây giờ', isCorrect: false },
              { id: 'd', text: 'Vì bệnh ngày xưa khác bệnh bây giờ', isCorrect: false },
            ],
            explanation:
              'Đây là ngụy biện viện dẫn truyền thống. Một phương pháp tồn tại lâu vì nó được truyền lại, được tin, và có những trường hợp trùng với sự hồi phục tự nhiên — không nhất thiết vì nó hiệu quả. Trích máu, dùng thuỷ ngân chữa bệnh, và nhiều thực hành khác đều tồn tại hàng trăm năm trước khi bị chứng minh là vô ích hoặc có hại. Điều này không phủ nhận giá trị của y học cổ truyền; nó chỉ nói rằng tuổi đời không thay được bằng chứng.',
          },
          {
            type: 'text',
            title: 'Một chi tiết Khoa nhấn mạnh',
            paragraphs: [
              'Khoa dặn mẹ một điều mà anh cho là quan trọng hơn cả chuyện bài thuốc có tác dụng hay không.',
              '"Nếu mẹ có uống thêm cái gì thì mẹ nói với bác sĩ nghen mẹ. Đừng giấu."',
              '"Con không nói để bác sĩ cấm mẹ. Con nói để bác sĩ biết mà kê thuốc cho đúng."',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao cần nói với bác sĩ về những thứ mình dùng thêm, kể cả thảo dược?',
            options: [
              { id: 'a', text: 'Để bác sĩ ngăn bạn dùng những thứ không cần thiết', isCorrect: false },
              { id: 'b', text: 'Vì tương tác giữa các chất là có thật — một số thảo dược làm tăng hoặc giảm tác dụng của thuốc đang dùng, và bác sĩ cần biết để chỉnh liều', isCorrect: true },
              { id: 'c', text: 'Vì đó là quy định bắt buộc khi khám bệnh', isCorrect: false },
              { id: 'd', text: 'Vì bác sĩ sẽ ghi vào hồ sơ để theo dõi vi phạm', isCorrect: false },
            ],
            explanation:
              'Lý do là kỹ thuật chứ không phải kỷ luật. Nhiều chất có nguồn gốc thực vật ảnh hưởng tới cách cơ thể chuyển hoá thuốc, làm thuốc mạnh lên hoặc yếu đi. Bác sĩ chỉ chỉnh liều đúng được khi biết đầy đủ những gì bạn đang dùng. Việc giấu vì sợ bị mắng chính là chỗ tạo ra rủi ro lớn nhất — nhiều ca biến chứng đến từ tương tác chứ không từ bản thân thảo dược.',
          },
          {
            type: 'text',
            title: 'Bà Bảy hiểu ra điều đó khác với bị cấm',
            paragraphs: [
              'Bà Bảy nói: "Vậy là con không cấm mẹ uống hả?"',
              '"Con không có quyền cấm mẹ, mà con cũng không muốn cấm. Con chỉ muốn mẹ đừng bỏ thuốc, với mẹ nói cho bác sĩ biết."',
              'Bà Bảy thấy dễ chịu hơn hẳn khi nghe vậy. Suốt cả tuần bà đã chuẩn bị tinh thần để cãi nhau với con, và bà không phải cãi.',
            ],
          },
          {
            type: 'text',
            title: 'Điều Khoa cẩn thận không nói',
            paragraphs: [
              'Khoa không nói với mẹ rằng thuốc nam là mê tín, và anh nghĩ nếu nói vậy thì anh cũng đang ngụy biện theo chiều ngược lại.',
              'Có những cây thuốc đã được nghiên cứu và cho thấy tác dụng thật. Có những bài thuốc cổ truyền được đưa vào phác đồ chính thức.',
              'Cái anh phản đối không phải nguồn gốc của thứ thuốc, mà là việc dùng "tự nhiên" và "lâu đời" thay cho bằng chứng.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Cùng một câu hỏi cho mọi thứ',
            variant: 'info',
            text: 'Cách nghĩ nhất quán nhất là bỏ hẳn cặp đối lập "thuốc tây và thuốc nam", và thay bằng một câu hỏi duy nhất áp cho tất cả: thứ này đã được kiểm chứng thế nào, có ai độc lập kiểm tra không, và có ghi rõ liều lượng với chống chỉ định không? Câu hỏi đó loại được cả thuốc tây kém chất lượng lẫn thuốc nam không rõ nguồn gốc.',
          },
          {
            type: 'text',
            title: 'Bà Bảy hỏi con một câu khó',
            paragraphs: [
              '"Vậy chớ tại sao người ta tin mấy cái đó dữ vậy con? Cả xóm này đâu phải ai cũng dại."',
              'Khoa suy nghĩ khá lâu rồi trả lời một câu mà anh thấy đúng nhất.',
              '"Tại vì bác sĩ nói với mẹ là bệnh này không khỏi, phải uống thuốc suốt đời. Còn cái video kia thì nói là khỏi được."',
              '"Người ta không tin cái video vì người ta ngu đâu mẹ. Người ta tin vì cái đó là cái người ta muốn nghe."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy ngồi im khá lâu sau câu đó.',
              'Bà nhận ra mình đã xem hết video ấy tới ba lần, và cả ba lần bà đều mong nó đúng.',
              'Đó không phải là chuyện bà thiếu hiểu biết. Đó là chuyện mười hai năm uống thuốc và một câu "phải uống suốt đời".',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Tự nhiên, lâu đời, và bằng chứng',
            description: 'Ba ngụy biện thường đi cùng nhau trong quảng cáo sức khoẻ, và một câu hỏi thay được cả ba.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba ngụy biện thường đi cùng nhau',
                  paragraphs: [
                    'Viện dẫn tự nhiên: coi nguồn gốc tự nhiên là bằng chứng cho sự an toàn. Nhưng cơ thể phản ứng với cấu trúc phân tử, không với nguồn gốc của nó.',
                    'Viện dẫn truyền thống: coi tuổi đời là bằng chứng cho hiệu quả. Nhưng nhiều thực hành vô ích hoặc có hại cũng tồn tại hàng trăm năm.',
                    'Viện dẫn số đông: coi số người dùng là bằng chứng. Nhưng số người dùng phản ánh mức độ được quảng bá, không phản ánh hiệu quả.',
                  ],
                },
                {
                  heading: 'Vì sao "không rõ liều" là rủi ro',
                  paragraphs: [
                    'Cùng một hoạt chất, liều thấp có thể có ích, liều cao có thể gây hại gan hoặc thận.',
                    'Hàm lượng trong chế phẩm nấu từ thực vật thay đổi theo giống cây, mùa thu hái, đất trồng, cách chế biến.',
                    'Không ghi hàm lượng và không ghi chống chỉ định không phải là dấu hiệu của sự lành tính, mà là dấu hiệu của việc không ai đo.',
                  ],
                },
                {
                  heading: 'Một câu hỏi thay được cả ba',
                  paragraphs: [
                    'Bỏ cặp đối lập "thuốc tây và thuốc nam", hỏi cùng một câu cho mọi thứ: đã được kiểm chứng thế nào, ai kiểm tra độc lập, có ghi liều lượng và chống chỉ định không?',
                    'Luôn nói với bác sĩ về mọi thứ bạn đang dùng thêm, kể cả thảo dược — vì tương tác thuốc là có thật và bác sĩ cần biết để kê đơn đúng.',
                    'Ranh giới không nên bước qua: bỏ thuốc điều trị bệnh mạn tính để chạy theo một phương pháp chưa được kiểm chứng.',
                  ],
                },
              ],
              relatedConcepts: ['Viện dẫn tự nhiên', 'Viện dẫn truyền thống', 'Viện dẫn số đông', 'Liều lượng'],
              furtherReading: [
                'Bài học "Appeal to authority & popularity" trong khoá Logic 101',
                'Quy định về ghi nhãn và đăng ký lưu hành thuốc, thực phẩm chức năng tại Việt Nam',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nguồn gốc tự nhiên không nói gì về mức độ an toàn — cơ thể phản ứng với chất, không với xuất xứ của chất.\n' +
              '✓ Không ghi hàm lượng và chống chỉ định là dấu hiệu không ai đo, chứ không phải dấu hiệu lành tính.\n' +
              '✓ "Dùng lâu đời" cho biết phương pháp được truyền lại, không cho biết nó có tác dụng.\n' +
              '✓ Thay vì chia thuốc tây và thuốc nam, hãy hỏi cùng một câu cho tất cả: đã được kiểm chứng thế nào và ai kiểm tra?',
          },
          {
            type: 'text',
            title: 'Bà Bảy quyết định làm một việc',
            paragraphs: [
              'Bà không bỏ thuốc, không mua bài thuốc trên video.',
              'Nhưng bà cũng không muốn ba tháng nữa lại ngồi xem một video khác và lại mong nó đúng.',
              'Nên bà quyết định làm một việc mà mười hai năm nay bà chưa từng làm: bà sẽ hỏi thẳng bác sĩ của mình.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'ba-bay-hoi-thang-bac-si',
        title: 'Bà Bảy hỏi thẳng bác sĩ',
        blocks: [
          {
            type: 'text',
            title: 'Mười hai năm không hỏi',
            paragraphs: [
              'Bà Bảy đi khám ba tháng một lần, mười hai năm là bốn mươi tám lần.',
              'Trong bốn mươi tám lần đó, bà chưa từng hỏi bác sĩ một câu nào ngoài "thuốc này uống mấy viên".',
              'Bà nghĩ bác sĩ bận, phòng khám đông, mà bà thì không biết hỏi gì cho phải.',
            ],
          },
          {
            type: 'callout',
            icon: 'clipboard',
            title: 'Bà Bảy viết sẵn bốn câu ra giấy',
            variant: 'info',
            text: '1. Bệnh của tôi có khỏi hẳn được không, hay chỉ kiểm soát được thôi? 2. Nếu tôi uống thêm thuốc nam thì có ảnh hưởng gì tới thuốc bác sĩ kê không? 3. Chỉ số của tôi ba năm nay có xu hướng thế nào? 4. Có cái gì tôi làm được ở nhà mà có tác dụng thật không?',
          },
          {
            type: 'question',
            question:
              'Vì sao viết câu hỏi ra giấy trước khi đi khám lại hiệu quả hơn là nhớ trong đầu?',
            options: [
              { id: 'a', text: 'Vì bác sĩ sẽ nghiêm túc hơn khi thấy bệnh nhân có chuẩn bị', isCorrect: false },
              { id: 'b', text: 'Vì trong phòng khám người ta hay quên, ngại, và bị cuốn theo nhịp của buổi khám — tờ giấy giữ lại đúng những gì mình cần biết', isCorrect: true },
              { id: 'c', text: 'Vì quy định yêu cầu bệnh nhân ghi câu hỏi', isCorrect: false },
              { id: 'd', text: 'Vì viết ra giúp bạn tự trả lời được luôn', isCorrect: false },
            ],
            explanation:
              'Buổi khám thường ngắn, và người bệnh — nhất là người cao tuổi — dễ bị cuốn theo trình tự của bác sĩ rồi ra về mới nhớ ra điều mình định hỏi. Một tờ giấy bốn dòng loại bỏ được cả ba trở ngại: quên, ngại, và không biết diễn đạt. Đây là kỹ thuật đơn giản nhất để chuyển từ vai người nghe sang vai người cùng tham gia quyết định.',
          },
          {
            type: 'text',
            title: 'Câu trả lời của bác sĩ',
            paragraphs: [
              'Bác sĩ đọc tờ giấy, hơi bất ngờ, rồi ngồi xuống trả lời từng câu.',
              'Câu một: tiểu đường tuýp 2 hiện chưa có cách chữa khỏi hẳn, nhưng có những trường hợp kiểm soát tốt tới mức giảm được thuốc, và điều đó phụ thuộc nhiều vào cân nặng, ăn uống và vận động.',
              'Bà Bảy dừng lại ở chữ "giảm được thuốc". Suốt mười hai năm bà chỉ nghe "uống suốt đời", và chưa ai nói với bà rằng có một khoảng ở giữa.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu hai: bác sĩ nói bà cứ nói ra nếu định dùng thêm gì, vì có những loại ảnh hưởng tới cách cơ thể xử lý thuốc.',
              'Câu ba: ông mở hồ sơ, chỉ cho bà xem đường biểu diễn ba năm — có lên có xuống, nhưng xu hướng chung là ổn định.',
              'Câu bốn: ông ghi ra ba việc cụ thể, kèm con số: đi bộ bao nhiêu phút mỗi ngày, giảm bao nhiêu cân, và loại thực phẩm nào cần hạn chế.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Câu trả lời đầy đủ hơn nằm ở phía sau một câu hỏi',
            variant: 'info',
            text: 'Bác sĩ không giấu bà Bảy điều gì trong mười hai năm. Trong một buổi khám ngắn, người ta trả lời câu được hỏi. Không hỏi thì nhận được phần tối thiểu: đơn thuốc và liều dùng. Rất nhiều khoảng trống thông tin mà người bệnh lấp bằng video trên mạng thực ra có thể được lấp bằng bốn dòng viết sẵn.',
          },
          {
            type: 'question',
            question:
              'Vì sao khoảng trống thông tin lại là điều kiện cho tin sai về sức khoẻ phát triển?',
            options: [
              { id: 'a', text: 'Vì người bệnh không đủ trình độ hiểu giải thích của bác sĩ', isCorrect: false },
              { id: 'b', text: 'Vì nhu cầu hiểu và nhu cầu hy vọng không biến mất khi không được đáp ứng — chúng chuyển sang tìm ở nơi khác, và nơi đó luôn sẵn sàng trả lời', isCorrect: true },
              { id: 'c', text: 'Vì bác sĩ không được phép nói về thảo dược', isCorrect: false },
              { id: 'd', text: 'Vì mạng xã hội cố tình nhắm vào người bệnh', isCorrect: false },
            ],
            explanation:
              'Người bán bài thuốc trên video không cạnh tranh với bác sĩ về mặt chuyên môn — họ cạnh tranh về mặt thời gian và sự chú ý. Họ nói mười lăm phút, nhìn thẳng vào máy quay, và trả lời đúng câu người bệnh đang muốn hỏi: bệnh này khỏi được không. Một khoảng trống không được lấp bằng thông tin đúng sẽ được lấp bằng thứ khác.',
          },
          {
            type: 'text',
            title: 'Bà Bảy hỏi bác sĩ về cái video',
            paragraphs: [
              'Cuối buổi khám, bà Bảy lấy hết can đảm hỏi thêm một câu ngoài tờ giấy.',
              '"Bác sĩ ơi, có cái video nói uống lá cây bảy ngày là khỏi. Cái đó có thiệt không bác sĩ?"',
              'Bác sĩ không cười, cũng không gạt đi. Ông hỏi lại: "Bác cho tôi xem tên sản phẩm được không?"',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao phản ứng "cho tôi xem tên sản phẩm" tốt hơn phản ứng "cái đó nhảm nhí bác đừng tin"?',
            options: [
              { id: 'a', text: 'Vì bác sĩ cần thời gian để nghĩ câu trả lời', isCorrect: false },
              { id: 'b', text: 'Vì nó giữ người bệnh tiếp tục kể ra những gì họ đang cân nhắc, thay vì dạy họ rằng nói ra sẽ bị gạt', isCorrect: true },
              { id: 'c', text: 'Vì bác sĩ không được phép nhận xét về sản phẩm khác', isCorrect: false },
              { id: 'd', text: 'Vì cần kiểm tra xem sản phẩm có được cấp phép không', isCorrect: false },
            ],
            explanation:
              'Nếu bị gạt phăng, lần sau người bệnh sẽ không kể nữa — và họ vẫn dùng, chỉ là dùng trong im lặng. Đó là kịch bản tệ nhất, vì bác sĩ mất luôn khả năng cảnh báo về tương tác thuốc. Một câu hỏi mở giữ cho kênh trao đổi còn mở, và cùng lúc cho bác sĩ đủ thông tin để trả lời cụ thể thay vì trả lời chung chung.',
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy đưa điện thoại. Bác sĩ xem một lúc rồi nói:',
              '"Cái này không có số đăng ký bác ạ. Bác có uống thì tôi không cấm được, nhưng bác nhớ ba điều: đừng bỏ thuốc đang uống, nói với tôi khi bác bắt đầu uống, và nếu thấy mệt hay vàng da thì ngưng ngay rồi tới đây."',
              'Bà Bảy thấy dễ chịu vì bác sĩ không mắng bà.',
            ],
          },
          {
            type: 'text',
            title: 'Bà Bảy kể lại ở hội người cao tuổi',
            paragraphs: [
              'Giống như lần trước với chuyện lừa đảo qua điện thoại, bà Bảy xin nói năm phút ở buổi sinh hoạt.',
              'Lần này bà không kể chuyện video. Bà kể chuyện tờ giấy bốn câu hỏi.',
              'Bà đọc to bốn câu đó, và bà nói: "Tui đi khám bốn mươi mấy lần rồi mà chưa lần nào hỏi. Bữa hỏi thì mới biết mấy cái mình tưởng bao lâu nay là không đúng."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà không nói với ai rằng đừng tin thuốc nam. Bà biết nếu nói vậy sẽ có người phản ứng ngay.',
              'Bà chỉ nói một câu ở cuối: "Ai có uống thêm cái gì thì nhớ nói bác sĩ biết nghen. Đừng giấu. Với đừng bỏ thuốc."',
              'Hai câu đó không đòi ai phải thay đổi niềm tin. Chúng chỉ nhắm vào đúng chỗ có thể gây hại thật.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Chọn trận đáng đánh',
            variant: 'warning',
            text: 'Thuyết phục một người bỏ niềm tin vào thảo dược là việc rất khó và thường thất bại. Thuyết phục họ đừng bỏ thuốc điều trị và nói với bác sĩ về những gì đang dùng là việc dễ hơn nhiều, ít gây phản ứng hơn, và ngăn được phần lớn thiệt hại thật. Khi nguồn lực có hạn, hãy nhắm vào chỗ giảm được nhiều tổn hại nhất, không phải chỗ bạn đúng nhất.',
          },
          {
            type: 'text',
            title: 'Ba câu bà Bảy dán cạnh hộp thuốc',
            paragraphs: [
              'Bà Bảy viết ba dòng dán lên nắp hộp thuốc, chỗ mỗi sáng bà mở ra:',
              '1️⃣ Ai kể chuyện khỏi bệnh cũng là người được chọn ra để kể.',
              '2️⃣ Đỡ sau khi uống không phải là đỡ nhờ uống.',
              '3️⃣ Uống gì thêm cũng được, nhưng nói bác sĩ biết và đừng bỏ thuốc.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ba dòng đó không giúp bà đánh giá được một nghiên cứu, và bà cũng không cần làm việc đó.',
              'Chúng chỉ giúp bà không hành động vội trong đúng khoảnh khắc mà một video vừa kết thúc và bà đang thấy hy vọng.',
              'Khoa nói đó chính là chỗ mà tư duy phản biện có ích nhất: không phải lúc phân tích, mà lúc sắp bấm nút.',
            ],
          },
          {
            type: 'text',
            title: 'Sáu tháng sau',
            paragraphs: [
              'Bà Bảy đi bộ mỗi sáng bốn mươi phút, giảm được ba cân, và ở lần khám gần nhất bác sĩ giảm bớt một loại thuốc.',
              'Bà vẫn xem những video đó — chúng vẫn hiện lên mỗi ngày và bà không tắt được.',
              'Nhưng bà xem theo cách khác: bà tìm xem cuối video có số điện thoại nào không, và bà thấy lần nào cũng có.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Mẹ vẫn muốn mấy cái đó là thiệt," bà nói với Khoa. "Muốn thì vẫn muốn thôi con."',
              '"Mà giờ mẹ biết mình muốn. Hồi trước mẹ tưởng mẹ đang suy nghĩ."',
              'Khoa nghĩ câu đó của mẹ gọn hơn tất cả những gì anh giải thích trong ba tháng.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Nói chuyện với bác sĩ cho hiệu quả',
            description: 'Bốn câu hỏi viết sẵn, và cách nói lại với người thân đang tin một phương pháp chưa kiểm chứng.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn câu nên viết ra giấy trước khi đi khám',
                  paragraphs: [
                    'Bệnh của tôi khỏi hẳn được không, hay chỉ kiểm soát được? Nếu kiểm soát tốt thì có giảm được thuốc không?',
                    'Tôi đang dùng thêm những thứ này — chúng có ảnh hưởng gì tới thuốc đang uống không?',
                    'Chỉ số của tôi mấy năm nay có xu hướng thế nào? Có xem được biểu đồ không?',
                    'Có việc gì tôi làm được ở nhà mà đã được chứng minh có tác dụng không, và cụ thể ở mức nào?',
                  ],
                },
                {
                  heading: 'Vì sao khoảng trống thông tin nguy hiểm',
                  paragraphs: [
                    'Buổi khám ngắn, và người ta trả lời câu được hỏi. Không hỏi thì nhận được phần tối thiểu.',
                    'Nhu cầu hiểu và nhu cầu hy vọng không biến mất khi không được đáp ứng — chúng chuyển sang tìm ở nơi khác.',
                    'Nội dung quảng cáo trên mạng cạnh tranh bằng thời gian và sự chú ý, không bằng chuyên môn: họ nói mười lăm phút và trả lời đúng câu người bệnh muốn hỏi nhất.',
                  ],
                },
                {
                  heading: 'Nói lại với người thân thế nào',
                  paragraphs: [
                    'Đừng nhắm vào niềm tin — thuyết phục ai đó bỏ niềm tin vào một phương pháp là việc rất khó và thường phản tác dụng.',
                    'Nhắm vào hai việc cụ thể: đừng bỏ thuốc điều trị, và nói với bác sĩ về mọi thứ đang dùng thêm.',
                    'Đừng nói người kia dại. Hãy nói vì sao chính bạn cũng từng muốn tin — điều đó gỡ bỏ thế đối đầu.',
                    'Nếu họ đã mua rồi, tập trung vào việc ngăn thiệt hại tiếp theo thay vì chứng minh họ đã sai.',
                  ],
                },
              ],
              relatedConcepts: ['Khoảng trống thông tin', 'Chọn trận đáng đánh', 'Tương tác thuốc'],
              furtherReading: [
                'Bài học "Intellectual humility" và "Debate có văn hoá" trong khoá Logic 101',
                'Hướng dẫn theo dõi và kiểm soát bệnh mạn tính của cơ sở y tế nơi bạn khám',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Trong buổi khám, người ta trả lời câu được hỏi — không hỏi thì nhận phần tối thiểu.\n' +
              '✓ Khoảng trống thông tin không tự biến mất; nó được lấp bằng thứ khác, và thứ khác luôn sẵn sàng trả lời.\n' +
              '✓ Khi nói lại với người thân, hãy nhắm vào hai việc cụ thể — đừng bỏ thuốc, và nói với bác sĩ — thay vì nhắm vào niềm tin.\n' +
              '✓ Tư duy phản biện có ích nhất không phải lúc phân tích, mà lúc bạn sắp hành động vì hy vọng.',
          },
          {
            type: 'text',
            title: 'Điều bà Bảy mang theo',
            paragraphs: [
              'Bà Bảy bảy mươi hai tuổi, không đọc được một bài nghiên cứu nào, và sẽ không bao giờ đọc.',
              'Bà chỉ có ba dòng chữ trên nắp hộp thuốc, một tờ giấy bốn câu hỏi mang theo mỗi lần đi khám, và thói quen tìm xem cuối video có số điện thoại không.',
              'Chừng đó không làm bà thành người giỏi phân tích. Nhưng nó đủ để bà không mất tiền, không bỏ thuốc, và không phải một mình đối diện với câu hỏi mà bà mong có câu trả lời nhất.',
            ],
          },
        ],
      },
    ],
  },
};
