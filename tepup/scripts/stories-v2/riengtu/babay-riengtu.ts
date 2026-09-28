import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Bà Bảy × Riêng Tư 101 — "Cuộc gọi lúc chín giờ tối".
 *
 * Người cao tuổi sống một mình là nhóm bị nhắm tới nhiều nhất và được chuẩn bị
 * ít nhất. Câu chuyện cố tình không dạy kỹ thuật — nó dạy đúng một thứ mà bà Bảy
 * dùng được: quy tắc gác máy và gọi lại bằng số mình biết.
 */
export const BABAY_RIENGTU: StorySeed = {
  slug: 'babay-riengtu',
  characterSlug: 'retiree',
  title: 'Cuộc gọi lúc chín giờ tối',
  teaser:
    'Người gọi biết tên bà, biết số căn cước của bà, biết cả tên con trai bà. Rồi con trai bà gọi về, đúng giọng nói ấy, xin bà chuyển gấp bốn mươi triệu.',
  icon: 'phone-call',
  estimatedTime: '~30 phút',
  sortOrder: 3,
  courseSlugs: [COURSE.riengtu],
  part: {
    name: 'Bà Bảy và những người gọi tới',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'cuoc-goi-luc-chin-gio-toi',
        title: 'Cuộc gọi lúc chín giờ tối',
        blocks: [
          {
            type: 'text',
            title: 'Căn nhà lúc chín giờ tối',
            paragraphs: [
              'Bà Bảy bảy mươi hai tuổi, sống một mình trong căn nhà nhỏ ở quận Gò Vấp. Chồng bà mất được sáu năm. Con trai bà, Khoa, làm việc ở Nhật, mỗi tuần gọi video về một lần vào tối Chủ nhật.',
              'Chín giờ tối thứ Ba, điện thoại bàn reo. Bà Bảy đang xem cải lương, với tay tắt tivi rồi nhấc máy.',
              '"Dạ, có phải bà Nguyễn Thị Bảy, sinh năm 1954, số căn cước 079154...?" — người gọi đọc trọn mười hai chữ số.',
            ],
          },
          {
            type: 'callout',
            icon: 'phone',
            title: 'Người gọi nói',
            variant: 'info',
            text: '"Chúng tôi là cơ quan điều tra. Tài khoản ngân hàng đứng tên bà có liên quan tới một đường dây rửa tiền đang bị điều tra. Đây là vụ án bí mật, bà không được nói với bất kỳ ai, kể cả người thân — nếu tiết lộ, bà sẽ bị xử lý về tội cản trở điều tra."',
          },
          {
            type: 'question',
            question:
              'Theo bạn, chi tiết nào trong cuộc gọi này là dấu hiệu chắc chắn nhất cho thấy đây là lừa đảo?',
            options: [
              { id: 'a', text: 'Người gọi đọc đúng số căn cước của bà Bảy', isCorrect: false },
              { id: 'b', text: 'Cuộc gọi diễn ra vào buổi tối', isCorrect: false },
              { id: 'c', text: 'Yêu cầu giữ bí mật, không được nói với người thân', isCorrect: true },
              { id: 'd', text: 'Người gọi nói về một vụ án rửa tiền', isCorrect: false },
            ],
            explanation:
              'Không có quy trình tố tụng nào cấm một người kể chuyện với gia đình mình, và cũng không có tội danh nào áp dụng cho việc đó. Yêu cầu giữ bí mật không phục vụ cuộc điều tra — nó phục vụ đúng một mục đích: cô lập nạn nhân, để không ai kịp nói câu "mẹ ơi cái đó là lừa đảo". Đây là chi tiết xuất hiện trong gần như mọi kịch bản giả danh cơ quan chức năng.',
          },
          {
            type: 'text',
            title: 'Vì sao họ đọc đúng số căn cước',
            paragraphs: [
              'Thứ khiến bà Bảy tin không phải giọng nói nghiêm nghị hay từ ngữ pháp lý.',
              'Thứ khiến bà tin là mười hai chữ số căn cước, đọc trơn tru, không vấp.',
              'Trong đầu bà, chỉ có cơ quan nhà nước mới nắm được con số đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng số căn cước của một người có mặt ở rất nhiều nơi ngoài cơ quan nhà nước.',
              'Nó nằm trong hồ sơ đăng ký điện, nước, truyền hình cáp. Trong hồ sơ khám bảo hiểm y tế. Trong hợp đồng mua bảo hiểm nhân thọ. Trong bản photo bà đưa cho tổ dân phố. Trong hồ sơ làm sổ tiết kiệm ở ngân hàng.',
              'Mỗi nơi đó có nhân viên, có đối tác, có hệ thống lưu trữ. Và các tệp dữ liệu rò rỉ từ những nơi như vậy vẫn được rao bán nhiều năm sau.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Biết thông tin không chứng minh thẩm quyền',
            variant: 'info',
            text: 'Đây là điểm mấu chốt mà mọi cuộc gọi mạo danh khai thác. Chúng ta có phản xạ: người này biết những thứ riêng tư về tôi, vậy chắc phải là người có quyền. Nhưng thông tin định danh của bạn nằm rải rác ở hàng chục nơi và có một thị trường mua bán chúng. Biết là chuyện dễ. Có thẩm quyền là chuyện khác hẳn.',
          },
          {
            type: 'question',
            question: 'Số căn cước công dân của một người có thể xuất hiện ở đâu ngoài cơ quan nhà nước?',
            mode: 'multiple',
            options: [
              { id: 'a', text: 'Hồ sơ đăng ký điện, nước, internet', isCorrect: true },
              { id: 'b', text: 'Hồ sơ khám chữa bệnh và bảo hiểm y tế', isCorrect: true },
              { id: 'c', text: 'Hợp đồng ngân hàng, bảo hiểm, mua trả góp', isCorrect: true },
              { id: 'd', text: 'Chỉ duy nhất trong cơ sở dữ liệu quốc gia về dân cư', isCorrect: false },
            ],
            explanation:
              'Ba nhóm đầu đều đúng, và còn nhiều nơi khác nữa: hồ sơ xin việc, hợp đồng thuê nhà, đăng ký sim, biểu mẫu ở tổ dân phố. Mỗi bản photo căn cước bạn đưa ra là một bản sao nằm ngoài tầm kiểm soát của bạn. Vì thế việc ai đó đọc đúng số căn cước không nói lên bất cứ điều gì về thân phận họ.',
          },
          {
            type: 'text',
            title: 'Kịch bản tiếp diễn',
            paragraphs: [
              'Người gọi nói tiếp: để chứng minh bà Bảy trong sạch, bà cần chuyển toàn bộ số tiền trong sổ tiết kiệm sang một "tài khoản tạm giữ của cơ quan điều tra". Sau khi xác minh xong, tiền sẽ được hoàn trả đầy đủ.',
              '"Bà có bao nhiêu trong sổ ạ?"',
              'Bà Bảy nói: "Hai trăm mốt triệu. Tiền bán miếng đất ở quê."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là câu bà Bảy hối hận nhất về sau. Không phải vì bà dại.',
              'Mà vì kịch bản đã đưa bà vào một trạng thái mà ở đó, việc chứng minh mình trong sạch trở thành ưu tiên cao hơn mọi thứ khác — kể cả sự thận trọng.',
              'Người ta gọi trạng thái đó là bị "dẫn dắt". Nó không đòi hỏi nạn nhân phải kém thông minh. Nó chỉ đòi hỏi nạn nhân phải sợ.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Không có tài khoản tạm giữ nào của cơ quan điều tra',
            variant: 'warning',
            text: 'Cơ quan chức năng không bao giờ yêu cầu người dân chuyển tiền vào một tài khoản để "xác minh" hay "tạm giữ". Việc phong toả tài khoản, nếu cần, được thực hiện bằng văn bản gửi tới ngân hàng — không cần và không bao giờ đi qua việc người dân tự chuyển tiền đi.',
          },
          {
            type: 'text',
            title: 'Bà Bảy không chuyển tiền',
            paragraphs: [
              'Bà Bảy không chuyển tiền tối hôm đó, vì một lý do hoàn toàn tình cờ.',
              'Sổ tiết kiệm của bà là sổ giấy, gửi kỳ hạn, và bà không biết dùng ứng dụng ngân hàng trên điện thoại. Muốn rút thì phải ra phòng giao dịch, mà lúc đó là chín giờ tối.',
              'Người gọi bảo: "Vậy sáng mai bà ra ngân hàng sớm nhé. Nhớ là không được nói với ai, kể cả nhân viên ngân hàng. Chín giờ sáng tôi gọi lại."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Không được nói với nhân viên ngân hàng" — chi tiết này có lý do rất cụ thể.',
              'Nhân viên ngân hàng ở Việt Nam được tập huấn về đúng loại tình huống này. Một cụ già đi rút toàn bộ sổ tiết kiệm để chuyển cho một tài khoản lạ là dấu hiệu mà họ được yêu cầu phải hỏi lại.',
              'Kịch bản biết điều đó, nên nó dựng sẵn một lời giải thích để nạn nhân từ chối trả lời.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao kịch bản luôn phải xây dựng lý do để nạn nhân không kể với người khác?',
            options: [
              { id: 'a', text: 'Vì cơ quan điều tra thật cũng yêu cầu như vậy', isCorrect: false },
              { id: 'b', text: 'Vì chỉ cần một người ngoài nghe được, kịch bản sẽ bị nhận ra ngay lập tức', isCorrect: true },
              { id: 'c', text: 'Vì kể lại sẽ làm chậm quá trình xác minh', isCorrect: false },
              { id: 'd', text: 'Vì luật cấm tiết lộ thông tin vụ án', isCorrect: false },
            ],
            explanation:
              'Kịch bản chỉ hoạt động trong một cái phễu: một người, một cuộc gọi, một luồng thông tin duy nhất do kẻ lừa đảo kiểm soát. Người thứ hai — bất kỳ ai, con cháu, hàng xóm, nhân viên ngân hàng — đều phá vỡ cái phễu đó chỉ bằng một câu hỏi bình thường. Vì thế cô lập nạn nhân không phải là một chi tiết phụ; nó là điều kiện sống còn của toàn bộ kịch bản.',
          },
          {
            type: 'text',
            title: 'Đêm đó bà Bảy không ngủ',
            paragraphs: [
              'Bà nằm nghĩ tới hai trăm mốt triệu, tới miếng đất ở quê ba đã để lại, tới chuyện nếu mình bị bắt thì Khoa bên Nhật sẽ làm sao.',
              'Bốn giờ sáng bà dậy, ngồi ở bàn nước, và làm một việc rất bình thường: bà bật điện thoại di động lên gọi cho Khoa.',
              'Rồi bà dừng lại. Người ta bảo không được nói với ai, kể cả người thân.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà ngồi cầm điện thoại như vậy chừng nửa tiếng.',
              'Cuối cùng bà bấm gọi — không phải cho Khoa, mà cho cô Tám nhà bên cạnh, người sáng nào cũng qua uống trà với bà.',
              '"Tám ơi, Tám qua đây chút được không. Bảy có chuyện muốn hỏi."',
              'Bà không kể vì bà đã hết sợ. Bà kể vì bà chịu không nổi việc ngồi một mình với chuyện đó thêm nữa.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Người thứ hai phá vỡ kịch bản',
            variant: 'info',
            text: 'Cô Tám không biết gì về lừa đảo trực tuyến. Nhưng cô Tám nghe xong liền nói một câu rất đời thường: "Trời đất, công an gì mà kêu chuyển tiền vậy Bảy? Gọi thằng Khoa đi." Đó là toàn bộ những gì cần thiết. Không cần kiến thức, chỉ cần một cái đầu không đang sợ.',
          },
          {
            type: 'text',
            title: 'Khoa gọi lại',
            paragraphs: [
              'Khoa nghe xong thì lặng đi mấy giây, rồi bảo mẹ: "Mẹ ơi, con nói mẹ nghe. Không có công an nào gọi điện kêu chuyển tiền hết. Sáng nay mẹ đừng ra ngân hàng. Ai gọi tới mẹ cứ cúp máy."',
              'Chín giờ sáng, điện thoại bàn reo. Bà Bảy nhìn nó reo, và bà không nhấc.',
              'Nó reo tiếp bảy lần nữa trong ngày hôm đó. Rồi thôi.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Cuộc gọi giả danh cơ quan chức năng',
            description: 'Nhận diện kịch bản và biết đúng một việc cần làm.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn dấu hiệu không bao giờ sai',
                  paragraphs: [
                    'Yêu cầu giữ bí mật, không được nói với người thân. Không có quy trình tố tụng nào như vậy.',
                    'Yêu cầu chuyển tiền vào một tài khoản để "xác minh" hoặc "tạm giữ". Không tồn tại loại tài khoản này.',
                    'Sức ép về thời gian: phải làm ngay trong hôm nay, nếu không sẽ bị bắt, bị phong toả, bị khởi tố.',
                    'Làm việc hoàn toàn qua điện thoại, không có giấy mời, không có văn bản.',
                  ],
                },
                {
                  heading: 'Vì sao họ biết nhiều thông tin về bạn',
                  paragraphs: [
                    'Số căn cước, họ tên, ngày sinh, địa chỉ của bạn nằm ở hàng chục nơi: hồ sơ điện nước, bảo hiểm, ngân hàng, tổ dân phố, hợp đồng mua trả góp.',
                    'Các tệp dữ liệu rò rỉ được rao bán và tái sử dụng nhiều năm, vì những thông tin này gần như không đổi.',
                    'Biết thông tin về bạn không chứng minh được thẩm quyền của họ. Đây là điều quan trọng nhất cần nhớ.',
                  ],
                },
                {
                  heading: 'Một việc duy nhất cần làm',
                  paragraphs: [
                    'Gác máy. Không tranh luận, không giải thích, không xác nhận thêm bất cứ điều gì.',
                    'Gọi cho một người thân — bất kỳ ai. Việc có người thứ hai quan trọng hơn việc người đó biết nhiều hay ít.',
                    'Nếu vẫn lo, tự đến công an phường hỏi trực tiếp. Cơ quan thật luôn tiếp bạn khi bạn tự tìm tới.',
                  ],
                },
              ],
              relatedConcepts: ['Giả danh cơ quan chức năng', 'Cô lập nạn nhân', 'Xác minh độc lập'],
              furtherReading: [
                'Cảnh báo của Bộ Công an về thủ đoạn giả danh cán bộ công an, viện kiểm sát, toà án',
                'Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Biết đúng số căn cước, họ tên, địa chỉ của bạn không chứng minh được thẩm quyền — dữ liệu đó nằm ở hàng chục nơi.\n' +
              '✓ Yêu cầu giữ bí mật với người thân là dấu hiệu chắc chắn nhất: nó phục vụ việc cô lập, không phục vụ điều tra.\n' +
              '✓ Không tồn tại "tài khoản tạm giữ của cơ quan điều tra" để người dân chuyển tiền vào.\n' +
              '✓ Người thứ hai phá vỡ kịch bản mà không cần kiến thức gì — chỉ cần một cái đầu không đang sợ.',
          },
          {
            type: 'text',
            title: 'Ba tuần sau',
            paragraphs: [
              'Bà Bảy kể lại chuyện cho cô Tám nghe không biết bao nhiêu lần. Bà thấy nhẹ người.',
              'Rồi một tối thứ Sáu, điện thoại di động của bà reo. Lần này không phải số lạ.',
              'Trên màn hình hiện đúng tên "Khoa". Và giọng ở đầu dây bên kia đúng là giọng con trai bà.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'giong-noi-cua-con-trai',
        title: 'Giọng nói của con trai',
        blocks: [
          {
            type: 'text',
            title: 'Tên "Khoa" hiện trên màn hình',
            paragraphs: [
              'Tám giờ tối thứ Sáu. Điện thoại di động của bà Bảy rung lên, màn hình hiện chữ "Khoa" — cái tên bà tự tay lưu vào danh bạ từ năm ngoái.',
              'Bà bấm nghe. Giọng bên kia gấp gáp, hơi nghẹn:',
              '"Mẹ ơi, con đây. Con gặp chuyện rồi mẹ ơi."',
            ],
          },
          {
            type: 'callout',
            icon: 'phone-call',
            title: 'Cuộc gọi kéo dài bốn phút',
            variant: 'info',
            text: '"Con đi xe đụng người ta ở đây. Người ta đòi bồi thường bốn mươi triệu, không thì báo cảnh sát, con mất việc mất visa hết mẹ ơi. Mẹ chuyển gấp giúp con, con gửi số tài khoản của người bạn ở Việt Nam. Mẹ đừng nói với ai hết mẹ nha, con xấu hổ lắm."',
          },
          {
            type: 'question',
            question:
              'Bà Bảy nghe đúng giọng con trai mình và thấy đúng tên "Khoa" trên màn hình. Hai điều đó chứng minh được gì?',
            options: [
              { id: 'a', text: 'Chứng minh chắc chắn đó là Khoa gọi', isCorrect: false },
              { id: 'b', text: 'Chứng minh cuộc gọi xuất phát từ Nhật Bản', isCorrect: false },
              { id: 'c', text: 'Không chứng minh gì cả — cả tên hiển thị lẫn giọng nói đều có thể giả', isCorrect: true },
              { id: 'd', text: 'Chứng minh Khoa đang dùng số điện thoại quen thuộc', isCorrect: false },
            ],
            explanation:
              'Tên hiển thị chỉ là kết quả của việc điện thoại đối chiếu số gọi tới với danh bạ — và số gọi tới thì có thể bị giả mạo bằng kỹ thuật gọi là spoofing. Còn giọng nói thì ngày nay chỉ cần vài chục giây mẫu âm thanh là đủ để một công cụ tạo ra giọng tổng hợp nghe rất giống. Hai thứ mà bà Bảy tin nhất lại chính là hai thứ dễ làm giả nhất.',
          },
          {
            type: 'text',
            title: 'Giọng nói lấy từ đâu',
            paragraphs: [
              'Khoa có một kênh cá nhân đăng vài chục đoạn phim ngắn về cuộc sống ở Nhật. Mỗi đoạn dài một tới hai phút, có anh nói chuyện trực tiếp với máy quay.',
              'Chừng ấy là quá đủ. Công nghệ tổng hợp giọng nói hiện nay chỉ cần vài chục giây âm thanh sạch để dựng lại chất giọng của một người.',
              'Khoa không làm gì sai. Anh chỉ đăng vài đoạn phim, như hàng triệu người khác.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Và điều này dẫn tới một hệ quả khó chịu mà bà Bảy không thể tự giải quyết được.',
              'Dấu vết số của Khoa tạo ra rủi ro cho bà Bảy. Bà không đăng gì lên mạng cả — bà thậm chí không có tài khoản mạng xã hội nào.',
              'Rủi ro của bà đến từ dữ liệu của người khác.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Riêng tư không phải chuyện của riêng một người',
            variant: 'info',
            text: 'Bạn có thể sống hoàn toàn ngoài mạng và vẫn bị tổn thương vì dữ liệu của người thân. Giọng nói của con, ảnh của cháu, bài đăng của bạn bè về gia đình bạn — tất cả đều là nguyên liệu. Đây là lý do quyền riêng tư được coi là một vấn đề tập thể, không phải một lựa chọn cá nhân.',
          },
          {
            type: 'flip-card',
            title: 'Cái bạn tin — và cái nó thực sự là',
            instruction: 'Bấm vào từng thẻ để lật xem mặt sau.',
            cards: [
              {
                id: 'f1',
                front: { kind: 'text', text: 'Tên người thân hiện trên màn hình khi có cuộc gọi' },
                back: { kind: 'text', text: 'Chỉ là kết quả đối chiếu số gọi tới với danh bạ — mà số gọi tới thì giả mạo được' },
              },
              {
                id: 'f2',
                front: { kind: 'text', text: 'Đúng giọng nói của con mình' },
                back: { kind: 'text', text: 'Vài chục giây âm thanh công khai là đủ để dựng lại chất giọng một người' },
              },
              {
                id: 'f3',
                front: { kind: 'text', text: 'Người gọi biết tên con, tên cháu, tên hàng xóm' },
                back: { kind: 'text', text: 'Những cái tên ấy nằm công khai trong phần bình luận và ảnh gắn thẻ trên mạng xã hội của người thân' },
              },
              {
                id: 'f4',
                front: { kind: 'text', text: 'Một đoạn video gọi về, thấy rõ mặt' },
                back: { kind: 'text', text: 'Video ngắn, mờ, giật cũng dựng được — và "mạng yếu" là lý do luôn có sẵn trong kịch bản' },
              },
            ],
          },
          {
            type: 'text',
            title: 'Vì sao kịch bản chọn tai nạn',
            paragraphs: [
              'Khoa để ý một chi tiết trong câu chuyện của mẹ: kẻ gọi không nói mình bị ốm, không nói mình cần tiền làm ăn. Họ nói bị tai nạn và sắp mất việc mất visa.',
              'Ba yếu tố ấy được chọn rất kỹ. Tai nạn thì cần tiền ngay, không chờ được. Mất việc mất visa thì hậu quả nặng và mẹ hình dung được. Và "con xấu hổ lắm, mẹ đừng nói với ai" thì vừa hợp lý về mặt tình cảm, vừa đạt được việc cô lập.',
            ],
          },
          {
            type: 'question',
            question: 'Điểm chung giữa kịch bản "công an gọi" và kịch bản "con trai gặp tai nạn" là gì?',
            options: [
              { id: 'a', text: 'Cả hai đều dùng công nghệ giả giọng nói', isCorrect: false },
              { id: 'b', text: 'Cả hai đều tạo ra một hậu quả nặng cần xử lý gấp, và đều có lý do để nạn nhân không kể với ai', isCorrect: true },
              { id: 'c', text: 'Cả hai đều nhắm vào người có tài khoản ngân hàng điện tử', isCorrect: false },
              { id: 'd', text: 'Cả hai đều diễn ra vào buổi tối', isCorrect: false },
            ],
            explanation:
              'Nội dung câu chuyện thay đổi, nhưng bộ khung thì giống hệt: một hậu quả nặng, một khung thời gian gấp, một lý do để không kể với ai, và một yêu cầu chuyển tiền. Nhận ra bộ khung thì bạn không cần thuộc lòng từng kịch bản — kịch bản mới sẽ liên tục xuất hiện, còn bộ khung thì gần như không đổi.',
          },
          {
            type: 'text',
            title: 'Bà Bảy làm đúng một việc',
            paragraphs: [
              'Bà Bảy nghe hết bốn phút. Bà run tay. Bà tin đó là con mình.',
              'Nhưng ba tuần trước, sau chuyện cuộc gọi lúc chín giờ tối, Khoa đã dặn mẹ một câu, và bắt mẹ nhắc lại ba lần cho thuộc:',
              '"Ai gọi cho mẹ, xưng là ai cũng được. Mẹ cứ cúp máy rồi mẹ bấm gọi lại cho con bằng số trong danh bạ. Không cần lý do gì hết mẹ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà Bảy nói vào máy: "Con chờ mẹ chút, mẹ đi lấy kính."',
              'Rồi bà cúp máy. Bà mở danh bạ, bấm vào tên Khoa, và gọi.',
              'Khoa nhấc máy sau ba hồi chuông. Giọng bình thường, hơi ngái ngủ — bên Nhật lúc đó là mười giờ đêm.',
              '"Alo mẹ? Có chuyện gì không mẹ?"',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao "cúp máy rồi gọi lại bằng số trong danh bạ" lại là quy tắc hiệu quả đến vậy?',
            options: [
              { id: 'a', text: 'Vì kẻ lừa đảo sẽ sợ khi bị cúp máy', isCorrect: false },
              { id: 'b', text: 'Vì nó chuyển quyền kiểm soát cuộc gọi về phía bạn, và bạn gọi tới số thật chứ không phải số họ gọi tới từ đó', isCorrect: true },
              { id: 'c', text: 'Vì nhà mạng sẽ ghi nhận cuộc gọi đáng ngờ', isCorrect: false },
              { id: 'd', text: 'Vì cuộc gọi giả không thể kéo dài quá năm phút', isCorrect: false },
            ],
            explanation:
              'Kẻ lừa đảo giả được số gọi ĐI, nhưng không nhận được cuộc gọi bạn gọi TỚI số thật. Khi bạn chủ động bấm số trong danh bạ, cuộc gọi đi thẳng tới máy của người thật. Đây là lý do quy tắc này hiệu quả với gần như mọi kịch bản mạo danh, kể cả những kịch bản dùng giọng nói tổng hợp — và nó không đòi hỏi bạn phải nhận ra điều gì bất thường.',
          },
          {
            type: 'text',
            title: 'Điều làm quy tắc này đặc biệt',
            paragraphs: [
              'Bà Bảy bảy mươi hai tuổi. Bà không biết deepfake là gì. Bà không phân biệt được giọng tổng hợp với giọng thật — thật ra rất ít người phân biệt được.',
              'Nhưng bà không cần phân biệt.',
              'Quy tắc gác máy và gọi lại không đòi hỏi bà nhận ra cái giả. Nó chỉ đòi hỏi bà làm một việc giống nhau trong mọi trường hợp, bất kể cuộc gọi có vẻ thật tới đâu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là một nguyên tắc chung của việc tự bảo vệ: những quy tắc tốt nhất là những quy tắc không phụ thuộc vào khả năng phán đoán của bạn tại thời điểm bạn đang hoảng.',
              'Vì đúng vào lúc bạn cần phán đoán tốt nhất, là lúc bạn phán đoán kém nhất.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đừng đặt phòng tuyến ở chỗ bạn phải phân biệt thật giả',
            variant: 'warning',
            text: 'Công nghệ giả giọng và giả hình ngày càng tốt lên, còn khả năng nghe của con người thì không. Mọi lời khuyên kiểu "nghe kỹ xem giọng có gượng không" đều sẽ hết hạn. Quy tắc gác máy gọi lại thì không hết hạn, vì nó không dựa vào việc bạn nghe ra điều gì.',
          },
          {
            type: 'text',
            title: 'Một mật khẩu của gia đình',
            paragraphs: [
              'Sau chuyện đó, Khoa bàn với mẹ thêm một lớp nữa, phòng khi bà không tiện gọi lại.',
              'Hai mẹ con thống nhất một câu hỏi mà chỉ hai người biết đáp án: tên con chó nhà bà Bảy nuôi hồi Khoa học lớp ba.',
              'Không viết ra đâu cả, không nhắn qua tin nhắn, không nói trên điện thoại. Chỉ hai người nhớ trong đầu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cách này có một ưu điểm mà bà Bảy thích: nó dùng được ngay trong cuộc gọi, không cần bà phải rời máy.',
              'Và nó dựa vào một thứ mà không có công cụ nào tổng hợp được — một kỷ niệm chung không có mặt ở bất kỳ đâu trên mạng.',
              '"Con chó tên gì hả con?" là một câu hỏi rất khó trả lời, nếu bạn không thật sự là Khoa.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Giả giọng và giả số gọi đến',
            description: 'Vì sao hai thứ bạn tin nhất lại là hai thứ dễ giả nhất, và hai quy tắc dùng được mà không cần biết công nghệ.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai kỹ thuật thường đi cùng nhau',
                  paragraphs: [
                    'Giả số gọi đến: kẻ gọi làm cho số hiển thị trên máy bạn là một số khác với số thật của họ. Điện thoại của bạn đối chiếu số đó với danh bạ và hiện lên tên người thân.',
                    'Giọng tổng hợp: chỉ cần vài chục giây âm thanh công khai — video, ghi âm, livestream — là đủ để dựng lại chất giọng một người.',
                    'Kết hợp lại, hai kỹ thuật này tạo ra một cuộc gọi mà mọi dấu hiệu bề mặt đều đúng.',
                  ],
                },
                {
                  heading: 'Hai quy tắc không phụ thuộc vào phán đoán',
                  paragraphs: [
                    'Gác máy và gọi lại bằng số trong danh bạ. Kẻ lừa đảo giả được số gọi đi nhưng không nhận được cuộc gọi bạn gọi tới số thật.',
                    'Thống nhất trước một câu hỏi bí mật trong gia đình, dựa trên kỷ niệm chung không có trên mạng. Không viết ra, không nhắn tin, chỉ nhớ trong đầu.',
                  ],
                },
                {
                  heading: 'Giảm nguyên liệu cho kẻ xấu',
                  paragraphs: [
                    'Người thân đăng video có giọng nói nên cân nhắc để chế độ hạn chế người xem, nhất là khi trong nhà có người cao tuổi sống một mình.',
                    'Hạn chế công khai mối quan hệ gia đình trên mạng xã hội: ảnh gắn thẻ kèm chú thích "mẹ tôi", "con trai tôi" là bản đồ quan hệ miễn phí cho người muốn dựng kịch bản.',
                    'Nói trước với người cao tuổi trong nhà về loại cuộc gọi này, trước khi nó xảy ra — sau khi xảy ra thì đã muộn.',
                  ],
                },
              ],
              relatedConcepts: ['Giả số gọi đến', 'Giọng nói tổng hợp', 'Quy tắc không phụ thuộc phán đoán'],
              furtherReading: [
                'Cảnh báo của Bộ Công an về thủ đoạn giả mạo người thân qua cuộc gọi và video',
                'Nghị định 13/2023/NĐ-CP — dữ liệu sinh trắc học bao gồm giọng nói',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Tên người thân hiện trên màn hình và giọng nói quen thuộc đều giả được — đó là hai thứ ta tin nhất.\n' +
              '✓ Bạn có thể không dùng mạng xã hội và vẫn gặp rủi ro từ dữ liệu của người thân.\n' +
              '✓ Gác máy rồi gọi lại bằng số trong danh bạ hiệu quả vì nó không đòi hỏi bạn nhận ra điều gì bất thường.\n' +
              '✓ Một câu hỏi bí mật trong gia đình, dựa trên kỷ niệm không có trên mạng, là lớp bảo vệ thứ hai.',
          },
          {
            type: 'text',
            title: 'Một câu hỏi bà Bảy chưa trả lời được',
            paragraphs: [
              'Bà Bảy giữ được tiền hai lần. Bà thấy mừng, nhưng bà vẫn có một thắc mắc mà cô Tám không giải đáp nổi.',
              'Trong khu phố này có mấy trăm nhà. Vì sao trong ba tuần, họ gọi cho bà tới hai lần bằng hai kịch bản khác nhau?',
              'Vì sao lại là bà?',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'vi-sao-lai-la-ba-bay',
        title: 'Vì sao lại là bà Bảy?',
        blocks: [
          {
            type: 'text',
            title: 'Câu hỏi ở quán trà đá',
            paragraphs: [
              'Cô Tám kể chuyện của bà Bảy ra quán trà đá đầu hẻm. Và hoá ra bà Bảy không phải người duy nhất.',
              'Bác Năm ở cuối hẻm bị gọi hai lần. Bà Chín bán xôi cũng bị. Ông Mười thì mất mười tám triệu hồi năm ngoái, giấu không dám kể với con.',
              'Cả bốn người đều trên bảy mươi. Cả bốn đều sống một mình hoặc chỉ có vợ chồng già với nhau.',
            ],
          },
          {
            type: 'callout',
            icon: 'users',
            title: 'Ở khu phố này',
            variant: 'info',
            text: 'Trong sáu tháng, những người bị gọi mà cô Tám biết đều có chung ba đặc điểm: trên 70 tuổi, sống một mình hoặc chỉ có hai vợ chồng già, và có một khoản tiền tiết kiệm từ bán đất hoặc từ lương hưu tích luỹ.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, vì sao người cao tuổi sống một mình là nhóm bị nhắm tới nhiều nhất?',
            options: [
              { id: 'a', text: 'Vì họ dễ tin người hơn người trẻ', isCorrect: false },
              { id: 'b', text: 'Vì họ có tiền tích luỹ, thường ở một mình khi nhận cuộc gọi, và ít có ai để hỏi lại ngay lập tức', isCorrect: true },
              { id: 'c', text: 'Vì họ không hiểu công nghệ', isCorrect: false },
              { id: 'd', text: 'Vì số điện thoại bàn của họ dễ tìm hơn', isCorrect: false },
            ],
            explanation:
              'Cách giải thích "người già cả tin" vừa không công bằng vừa sai trọng tâm — nhiều người trẻ hiểu công nghệ vẫn bị lừa. Ba yếu tố thực sự là: có tài sản đáng để nhắm tới, ở một mình vào thời điểm nhận cuộc gọi, và không có người thứ hai bên cạnh để hỏi. Yếu tố thứ ba là yếu tố quyết định, và nó là hoàn cảnh chứ không phải phẩm chất.',
          },
          {
            type: 'text',
            title: 'Danh sách không phải tình cờ',
            paragraphs: [
              'Khoa tìm hiểu giúp mẹ và giải thích cho bà một chuyện.',
              'Những cuộc gọi này không phải bấm số ngẫu nhiên. Chúng đi theo danh sách, và danh sách được phân loại sẵn.',
              'Có những danh sách được rao bán với mô tả rất cụ thể: "khách hàng trên 60 tuổi", "danh sách người gửi tiết kiệm", "danh sách hưu trí khu vực thành phố".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nguồn của những danh sách ấy thì thường rất bình thường:',
              '🏥 Danh sách bệnh nhân khám định kỳ ở một phòng khám.',
              '💊 Danh sách người mua thực phẩm chức năng qua điện thoại.',
              '🏦 Dữ liệu rò rỉ từ một tổ chức tài chính nào đó.',
              '📋 Biểu mẫu đăng ký nhận quà, đo huyết áp miễn phí, hội thảo sức khoẻ ở nhà văn hoá.',
              'Bà Bảy có tham dự một buổi hội thảo sức khoẻ miễn phí ở nhà văn hoá phường hồi đầu năm. Có ghi tên, tuổi, số điện thoại và địa chỉ vào một tờ danh sách.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Phân nhóm mục tiêu',
            variant: 'info',
            text: 'Một danh sách càng được phân loại kỹ thì càng có giá. "Một nghìn số điện thoại" thì rẻ; "một nghìn số của người trên 65 tuổi, có sổ tiết kiệm, ở nội thành" thì đắt hơn nhiều lần — vì tỷ lệ thành công cao hơn hẳn. Việc bạn thuộc nhóm nào không do bạn chọn, nhưng việc dữ liệu của bạn có mặt trong danh sách đó thì thường bắt đầu từ một tờ giấy rất vô hại.',
          },
          {
            type: 'question',
            question: 'Một buổi "đo huyết áp miễn phí, tặng quà" ở nhà văn hoá thu về giá trị gì cho người tổ chức?',
            options: [
              { id: 'a', text: 'Không gì cả, đó là hoạt động thiện nguyện', isCorrect: false },
              { id: 'b', text: 'Một danh sách đã được phân loại sẵn: tên, tuổi, số điện thoại, địa chỉ, tình trạng sức khoẻ của đúng nhóm người họ muốn', isCorrect: true },
              { id: 'c', text: 'Chỉ là cơ hội quảng bá thương hiệu', isCorrect: false },
              { id: 'd', text: 'Dữ liệu y tế để nghiên cứu khoa học', isCorrect: false },
            ],
            explanation:
              'Không phải mọi hoạt động như vậy đều có ý đồ xấu — nhiều buổi là thật. Nhưng cần thấy rõ giá trị được tạo ra: một danh sách người cao tuổi, kèm địa chỉ, số điện thoại và đôi khi cả tình trạng bệnh, tự phân loại sẵn theo đúng tiêu chí mà bên mua danh sách cần. Đó là thứ có giá trị thương mại thật, dù người tổ chức có bán nó hay không.',
          },
          {
            type: 'perspective-switch',
            title: 'Cùng một tờ danh sách, ba cách nhìn',
            event: 'Một buổi đo huyết áp miễn phí ở nhà văn hoá phường. Người tham dự ghi tên, tuổi, số điện thoại, địa chỉ vào một tờ danh sách đặt ở bàn tiếp đón.',
            perspectives: [
              {
                id: 'v1',
                role: 'Bà Bảy',
                icon: 'user',
                narrative:
                  'Tôi ghi tên vì ai cũng ghi, và vì để người ta gọi báo kết quả. Tôi không nghĩ tờ giấy này đi đâu sau buổi hôm đó. Không ai nói với tôi là nó sẽ được giữ lại, giữ bao lâu, hay đưa cho ai.',
              },
              {
                id: 'v2',
                role: 'Người tổ chức',
                icon: 'clipboard',
                narrative:
                  'Chúng tôi cần danh sách để biết có bao nhiêu người tham dự và để báo cáo. Sau buổi đó tờ giấy nằm trong một cặp hồ sơ ở văn phòng. Không ai nghĩ tới việc huỷ nó, vì cũng không ai nghĩ nó quan trọng.',
              },
              {
                id: 'v3',
                role: 'Người mua danh sách',
                icon: 'search',
                narrative:
                  'Với tôi tờ giấy đó là hàng loại một: đã tự lọc sẵn ra đúng nhóm người cao tuổi, quan tâm tới sức khoẻ, sống trong bán kính vài cây số, kèm số điện thoại đang dùng. Một danh sách như vậy giá cao hơn nhiều lần so với số điện thoại lấy ngẫu nhiên.',
              },
            ],
            question: {
              text: 'Lỗ hổng nằm ở đâu trong câu chuyện này?',
              options: [
                { id: 'a', text: 'Ở chỗ bà Bảy không nên tham dự các buổi miễn phí', isCorrect: false },
                { id: 'b', text: 'Ở chỗ không ai xác định trước dữ liệu được giữ bao lâu, dùng làm gì và ai được xem — nên nó tồn tại mãi mà không có chủ', isCorrect: true },
                { id: 'c', text: 'Ở chỗ người tổ chức cố ý bán dữ liệu', isCorrect: false },
                { id: 'd', text: 'Ở chỗ nhà văn hoá không có tủ khoá', isCorrect: false },
              ],
              explanation:
                'Không cần ai có ý đồ xấu thì rủi ro vẫn hình thành. Dữ liệu được thu mà không nói rõ mục đích, được giữ mà không ai quyết định giữ bao lâu, nằm ở nơi không ai chịu trách nhiệm cụ thể. Một tập dữ liệu như vậy chỉ cần một người nào đó, ở một thời điểm nào đó, thấy nó có giá — là nó đi ra ngoài.',
            },
          },
          {
            type: 'text',
            title: 'Bà Chín kể một chuyện khác',
            paragraphs: [
              'Ở quán trà đá, bà Chín bán xôi kể: người gọi cho bà không doạ gì cả. Họ nói bà trúng thưởng một chương trình tri ân khách hàng, phần quà là một chiếc xe máy.',
              '"Chỉ cần đóng trước tám triệu tiền thuế trước bạ thôi bác ơi."',
              'Bà Chín không đóng, vì bà không có tám triệu.',
            ],
          },
          {
            type: 'question',
            question: 'Kịch bản "trúng thưởng, nộp thuế trước" khác gì so với kịch bản doạ nạt?',
            options: [
              { id: 'a', text: 'Nó không phải lừa đảo, chỉ là quảng cáo phiền phức', isCorrect: false },
              { id: 'b', text: 'Nó dùng lòng tham thay cho nỗi sợ, nhưng vẫn cùng bộ khung: hậu quả nếu chậm, thời hạn gấp, và một khoản phải chuyển trước', isCorrect: true },
              { id: 'c', text: 'Nó chỉ nhắm vào người buôn bán nhỏ', isCorrect: false },
              { id: 'd', text: 'Nó hợp pháp vì thuế trước bạ là có thật', isCorrect: false },
            ],
            explanation:
              'Đòn bẩy đổi từ sợ sang mừng, nhưng cấu trúc không đổi: một thứ có giá trị lớn đang treo lơ lửng, một thời hạn ngắn, và một khoản tiền phải chuyển đi trước khi nhận được gì. Nguyên tắc chung rất gọn: không có phần thưởng chính đáng nào đòi bạn chuyển tiền trước để nhận nó.',
          },
          {
            type: 'text',
            title: 'Một bộ khung, nhiều lớp áo',
            paragraphs: [
              'Bà Bảy nhìn ba câu chuyện cạnh nhau — công an, con trai, trúng thưởng — và bà thấy chúng giống nhau tới mức buồn cười.',
              'Cả ba đều có: một thứ rất lớn đang xảy ra, một thời hạn rất gấp, một lý do để không hỏi ai, và cuối cùng luôn là một tài khoản để chuyển tiền vào.',
              '"Vậy là mình khỏi cần nhớ mấy chuyện đó," bà nói với cô Tám. "Cứ hễ nghe kêu chuyển tiền gấp thì biết rồi."',
            ],
          },
          {
            type: 'text',
            title: 'Bà Bảy không định thôi đi hội thảo',
            paragraphs: [
              'Khoa hỏi mẹ có nên tránh mấy buổi như vậy không. Bà Bảy trả lời một câu làm anh im lặng:',
              '"Mẹ đi mấy buổi đó không phải vì cái máy đo huyết áp đâu con. Mẹ đi vì ở đó có người để nói chuyện."',
              'Đây là chỗ mà mọi lời khuyên kiểu "đừng cung cấp thông tin cá nhân" đều gãy.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Với một người sống một mình, những buổi tụ họp ấy không phải là rủi ro không cần thiết. Chúng là một phần của việc còn kết nối với đời sống xung quanh.',
              'Bảo bà đừng đi nữa thì cũng như bảo bác Tư gỡ số điện thoại xuống: giải pháp đúng về mặt an toàn nhưng sai về mặt cuộc sống.',
              'Cho nên câu hỏi phải đặt lại: đi thì đi, nhưng ghi ít lại được không?',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Từ đó, khi ghi tên vào các tờ danh sách như vậy, bà Bảy ghi tên và số điện thoại, nhưng không ghi địa chỉ nhà.',
              'Nếu ai hỏi, bà nói: "Cô cần địa chỉ làm gì? Tui tự tới lấy kết quả được mà."',
              'Không phải lần nào cũng suôn sẻ. Nhưng phần lớn thì người ta cũng thôi, vì thật ra họ cũng chẳng cần địa chỉ để làm gì.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Câu hỏi vạn năng trước mỗi tờ biểu mẫu',
            variant: 'warning',
            text: '"Chỗ này cần thông tin này để làm gì?" — Hỏi ra thành tiếng, một cách bình thường, không cần gay gắt. Phần lớn biểu mẫu xin nhiều hơn mức cần, không phải vì ý đồ mà vì người soạn nó chép lại mẫu cũ. Một câu hỏi lịch sự thường đủ để bỏ bớt một dòng.',
          },
          {
            type: 'text',
            title: 'Thứ bà Bảy không làm được một mình',
            paragraphs: [
              'Có một phần của vấn đề mà bà Bảy không giải quyết nổi, và cũng không nên đòi hỏi bà phải giải quyết.',
              'Bà không kiểm soát được việc phòng khám giữ hồ sơ của bà bao lâu. Bà không biết dữ liệu rò rỉ từ đâu. Bà không truy được ai đã bán danh sách.',
              'Những chuyện đó thuộc về trách nhiệm của các tổ chức giữ dữ liệu và của cơ quan quản lý, không thuộc về một cụ bà bảy mươi hai tuổi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều này quan trọng, vì có một cách kể chuyện rất phổ biến mà bất công: mỗi lần có người bị lừa, người ta hỏi "sao lại nhẹ dạ thế".',
              'Câu hỏi ấy đặt toàn bộ gánh nặng lên người yếu nhất trong chuỗi, và bỏ qua tất cả những mắt xích đã để dữ liệu chảy ra ngoài trước đó.',
              'Bà Bảy làm được phần của bà: gác máy, gọi lại, ghi ít lại. Phần còn lại không phải lỗi của bà.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Vì sao người cao tuổi là mục tiêu',
            description: 'Cơ chế phân nhóm mục tiêu và những việc gia đình có thể làm cùng nhau.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba yếu tố thật sự, không phải "cả tin"',
                  paragraphs: [
                    'Có tài sản tích luỹ: tiền tiết kiệm, tiền bán đất, lương hưu — đủ lớn để đáng nhắm tới.',
                    'Ở một mình vào thời điểm nhận cuộc gọi, nên không có ai để hỏi lại ngay.',
                    'Ít tiếp xúc với thông tin cảnh báo, và thường ngại kể lại khi đã bị lừa — khiến thủ đoạn cũ vẫn dùng được rất lâu.',
                  ],
                },
                {
                  heading: 'Danh sách mục tiêu hình thành thế nào',
                  paragraphs: [
                    'Từ các biểu mẫu tự nguyện: hội thảo sức khoẻ, đo huyết áp miễn phí, nhận quà, đăng ký hội viên.',
                    'Từ hồ sơ của các tổ chức: phòng khám, nhà thuốc, công ty bán hàng qua điện thoại, tổ chức tài chính.',
                    'Từ dữ liệu rò rỉ, vẫn có giá trị nhiều năm sau vì tên, tuổi, địa chỉ và số điện thoại gần như không đổi.',
                  ],
                },
                {
                  heading: 'Việc gia đình nên làm cùng nhau',
                  paragraphs: [
                    'Nói trước về các kịch bản phổ biến, trước khi cuộc gọi xảy ra. Kể như kể chuyện hàng xóm, không kể như dạy dỗ.',
                    'Thống nhất quy tắc gác máy gọi lại và một câu hỏi bí mật của gia đình.',
                    'Tạo điều kiện để người cao tuổi dễ gọi cho ai đó: lưu sẵn vài số ở nút gọi nhanh, và nói rõ rằng gọi hỏi bất cứ lúc nào cũng được, kể cả nửa đêm.',
                    'Không trách móc khi họ kể lại. Sự xấu hổ là thứ khiến nhiều vụ không bao giờ được nói ra và khiến thủ đoạn tiếp tục hiệu quả.',
                  ],
                },
              ],
              relatedConcepts: ['Phân nhóm mục tiêu', 'Môi giới dữ liệu', 'Tối thiểu hoá dữ liệu'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — nghĩa vụ của bên thu thập dữ liệu về mục đích và thời hạn lưu trữ',
                'Cảnh báo của Bộ Công an về các nhóm đối tượng bị nhắm tới trong lừa đảo trực tuyến',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Người cao tuổi bị nhắm tới không vì "cả tin", mà vì có tài sản, ở một mình, và không có ai để hỏi lại ngay.\n' +
              '✓ Các cuộc gọi đi theo danh sách đã phân loại sẵn, và danh sách thường bắt đầu từ một tờ biểu mẫu rất vô hại.\n' +
              '✓ Câu hỏi vạn năng trước mỗi biểu mẫu: chỗ này cần thông tin này để làm gì?\n' +
              '✓ Đổ lỗi cho nạn nhân đặt gánh nặng lên mắt xích yếu nhất và bỏ qua mọi mắt xích đã để dữ liệu chảy ra trước đó.',
          },
          {
            type: 'text',
            title: 'Bà Bảy muốn làm một việc',
            paragraphs: [
              'Sau buổi trà đá hôm đó, bà Bảy nghĩ tới ông Mười — người mất mười tám triệu và giấu không dám kể với con.',
              'Bà nghĩ: nếu hồi đó có ai kể cho ông Mười nghe trước, thì có khi đã khác.',
              'Và bà nhận ra thứ mình có mà một tờ rơi cảnh báo không có: bà là người trong xóm, bà kể chuyện của chính bà, và không ai nghe bà mà thấy mình bị coi thường.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'ba-bay-di-ke-chuyen',
        title: 'Bà Bảy đi kể chuyện',
        blocks: [
          {
            type: 'text',
            title: 'Buổi sinh hoạt hội người cao tuổi',
            paragraphs: [
              'Tháng sau, hội người cao tuổi phường sinh hoạt định kỳ ở nhà văn hoá. Bà Bảy xin phát biểu năm phút.',
              'Bà không nói về công nghệ. Bà không biết công nghệ.',
              'Bà kể lại đúng hai cuộc gọi của mình, từ đầu tới cuối, kể cả đoạn bà tin, đoạn bà run tay, đoạn bà suýt ra ngân hàng.',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Bà Bảy nói',
            variant: 'info',
            text: '"Tui kể ra đây không phải để mấy ông mấy bà cười tui. Tui kể là để nếu bữa nào có ai gọi cho mấy ông mấy bà y như vậy, thì mấy ông mấy bà nhớ tới tui, rồi cúp máy."',
          },
          {
            type: 'question',
            question:
              'Vì sao câu chuyện của bà Bảy có tác dụng hơn một tờ rơi cảnh báo dán ở nhà văn hoá?',
            options: [
              { id: 'a', text: 'Vì bà Bảy nói to hơn tờ rơi', isCorrect: false },
              { id: 'b', text: 'Vì người nghe biết bà, tin bà, và nghe xong không cảm thấy mình bị coi là ngu ngốc', isCorrect: true },
              { id: 'c', text: 'Vì tờ rơi thường viết sai thông tin', isCorrect: false },
              { id: 'd', text: 'Vì bà Bảy là người có chức vụ trong hội', isCorrect: false },
            ],
            explanation:
              'Cảnh báo chính thức thường thất bại không phải vì sai, mà vì nó ngầm ám chỉ rằng người bị lừa là người kém. Không ai muốn tự nhận mình thuộc nhóm đó, nên người ta đọc rồi nghĩ "cái đó dành cho người khác". Một người trong xóm kể chuyện của chính mình thì phá vỡ được rào cản ấy: nếu bà Bảy còn suýt bị, thì mình cũng có thể bị.',
          },
          {
            type: 'text',
            title: 'Ông Mười đứng dậy',
            paragraphs: [
              'Cuối buổi, ông Mười đứng dậy. Ông kể chuyện của mình — chuyện mười tám triệu năm ngoái mà ông giấu cả nhà.',
              'Ông nói ông giấu vì ông sợ con cái nghĩ ông lú lẫn, rồi nó không cho ông giữ tiền nữa.',
              'Trong phòng có hơn ba mươi người. Sau ông Mười, có thêm bốn người nữa kể chuyện của họ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bốn người đó, trước buổi hôm ấy, đều nghĩ mình là trường hợp cá biệt.',
              'Đây là điều khiến loại lừa đảo này tồn tại dai dẳng: sự xấu hổ khiến nạn nhân im lặng, sự im lặng khiến thủ đoạn cũ tiếp tục hiệu quả với người tiếp theo.',
              'Cùng một kịch bản đã dùng ở khu phố này ít nhất hai năm, và nó vẫn hiệu quả vì không ai kể lại.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Im lặng là thứ nuôi sống thủ đoạn cũ',
            variant: 'info',
            text: 'Một kịch bản lừa đảo bị kể lại rộng rãi thì mất hiệu lực rất nhanh. Kẻ lừa đảo hiểu điều đó, nên mọi kịch bản đều có một lớp thiết kế nhằm khiến nạn nhân xấu hổ — bị doạ là phạm tội, bị dụ vì lòng tham, bị lừa bởi chính giọng con mình. Xấu hổ không phải tác dụng phụ; nó là một phần của công cụ.',
          },
          {
            type: 'question',
            question: 'Điều nên làm nhất khi người thân cao tuổi kể rằng họ đã bị lừa là gì?',
            options: [
              { id: 'a', text: 'Giải thích rõ họ đã sai ở bước nào để lần sau không lặp lại', isCorrect: false },
              { id: 'b', text: 'Đề nghị quản lý giúp tài khoản của họ cho an toàn', isCorrect: false },
              { id: 'c', text: 'Nói rõ rằng đây là chuyện xảy ra với rất nhiều người, rồi cùng nhau xử lý các bước tiếp theo', isCorrect: true },
              { id: 'd', text: 'Không nhắc lại chuyện đó nữa để họ đỡ buồn', isCorrect: false },
            ],
            explanation:
              'Phân tích lỗi và tước quyền quản lý tiền là hai phản ứng phổ biến nhất, và cả hai đều dạy người cao tuổi một bài học sai: lần sau đừng kể. Mà im lặng chính là thứ khiến thiệt hại lớn hơn, vì họ sẽ không báo ngân hàng kịp, không trình báo, và sẽ bị nhắm tới lần nữa. Ưu tiên số một là giữ cho kênh nói chuyện còn mở.',
          },
          {
            type: 'text',
            title: 'Bà Bảy và cô Tám lập một quy ước',
            paragraphs: [
              'Sau buổi sinh hoạt, bà Bảy và cô Tám bàn nhau một quy ước rất đơn giản giữa mấy nhà trong hẻm.',
              'Ai nhận được cuộc gọi lạ mà thấy lo, thì sang gõ cửa nhà bên cạnh. Không cần giải thích gì, không cần biết đúng sai. Chỉ cần có người thứ hai ngồi nghe cùng.',
              'Bà gọi đùa đó là "gọi hàng xóm trước khi gọi ngân hàng".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Quy ước này không cần ai biết công nghệ. Nó không cần điện thoại thông minh, không cần cài ứng dụng gì.',
              'Nó chỉ nhắm đúng vào điều kiện sống còn của mọi kịch bản: nạn nhân phải ở một mình.',
              'Trong một khu phố mà mọi người biết nhau, thứ này rẻ tiền và hiệu quả hơn bất kỳ phần mềm nào.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao "quy ước gọi hàng xóm" lại hiệu quả dù không ai trong hẻm biết gì về công nghệ?',
            options: [
              { id: 'a', text: 'Vì hàng xóm thường có kinh nghiệm về lừa đảo', isCorrect: false },
              { id: 'b', text: 'Vì nó phá đúng điều kiện sống còn của mọi kịch bản: nạn nhân phải ở một mình khi quyết định', isCorrect: true },
              { id: 'c', text: 'Vì kẻ lừa đảo sẽ nghe thấy tiếng người khác và bỏ cuộc', isCorrect: false },
              { id: 'd', text: 'Vì nhiều người cùng nghe thì sẽ nhớ được số điện thoại của kẻ gọi', isCorrect: false },
            ],
            explanation:
              'Người thứ hai không cần biết deepfake là gì, không cần biết dữ liệu bị bán ra sao. Họ chỉ cần không đang sợ. Một cái đầu bình tĩnh nghe câu "công an kêu chuyển tiền vô tài khoản" sẽ thấy nó vô lý ngay, trong khi người đang bị dẫn dắt thì không. Đó là lý do biện pháp rẻ tiền nhất lại là biện pháp mạnh nhất.',
          },
          {
            type: 'text',
            title: 'Khoa làm phần của mình',
            paragraphs: [
              'Ở Nhật, Khoa cũng thay đổi vài thứ sau chuyện đó.',
              'Anh chuyển các đoạn phim cá nhân có giọng nói của mình sang chế độ hạn chế người xem.',
              'Anh gọi cho mẹ hai lần mỗi tuần thay vì một, không phải để kiểm tra mà để mẹ quen với việc gọi qua gọi lại là chuyện bình thường.',
              'Và anh nói với mẹ một câu mà anh lặp lại mỗi lần gọi: "Mẹ gọi con lúc nào cũng được hết. Nửa đêm cũng được. Không có chuyện gì cũng được."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu cuối cùng là câu quan trọng nhất, và nó không liên quan gì tới công nghệ.',
              'Người cao tuổi thường ngại làm phiền con cái. Cái ngại đó khiến họ chần chừ đúng vào lúc cần gọi nhất.',
              'Gỡ bỏ cái ngại đó là việc mà con cái làm được, và làm trước khi có chuyện.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đừng chờ tới lúc có chuyện mới nói',
            variant: 'warning',
            text: 'Mọi biện pháp trong câu chuyện này — quy tắc gác máy, câu hỏi bí mật của gia đình, quy ước gọi hàng xóm — đều phải được thống nhất TRƯỚC. Giữa lúc đang hoảng, không ai nghĩ ra được quy tắc mới. Người ta chỉ làm được thứ đã thành thói quen.',
          },
          {
            type: 'text',
            title: 'Ba câu bà Bảy dán cạnh điện thoại bàn',
            paragraphs: [
              'Cô Tám viết giúp bà Bảy ba dòng chữ to, dán lên tường ngay cạnh chiếc điện thoại bàn:',
              '1️⃣ Ai kêu chuyển tiền gấp thì cúp máy. Không cần biết là ai.',
              '2️⃣ Cúp rồi bấm gọi lại bằng số trong danh bạ.',
              '3️⃣ Sang kêu Tám qua ngồi cùng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ba dòng ấy không nhắc tới deepfake, không nhắc tới spoofing, không nhắc tới môi giới dữ liệu.',
              'Chúng không cần. Một quy tắc chỉ có ích khi người ta nhớ được nó vào đúng lúc tim đang đập nhanh.',
              'Đây là điểm mà rất nhiều lời khuyên về an toàn thông tin làm sai: chúng đúng nhưng quá dài, nên vô dụng đúng vào lúc cần nhất.',
            ],
          },
          {
            type: 'text',
            title: 'Hai trăm mốt triệu vẫn còn',
            paragraphs: [
              'Cuốn sổ tiết kiệm của bà Bảy vẫn còn nguyên hai trăm mốt triệu.',
              'Bà giữ được nó không phải vì bà hiểu công nghệ, không phải vì bà tinh ý hơn ông Mười, cũng không phải vì bà may mắn.',
              'Bà giữ được vì đúng ba tuần trước cuộc gọi thứ hai, con trai bà đã bắt bà nhắc lại một câu ba lần cho thuộc.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Và vì bốn giờ sáng hôm đó, bà đã gọi cho cô Tám thay vì ngồi một mình.',
              'Hai chuyện ấy đều không phải kỹ năng. Chúng là quan hệ.',
              'Với một người bảy mươi hai tuổi sống một mình, lớp bảo vệ tốt nhất không nằm trong chiếc điện thoại. Nó nằm ở việc có người để gọi.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Bảo vệ người cao tuổi trong gia đình',
            description: 'Những việc cần thống nhất trước, và cách nói chuyện để không đóng mất kênh liên lạc.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Thống nhất trước khi có chuyện',
                  paragraphs: [
                    'Quy tắc gác máy và gọi lại bằng số trong danh bạ, áp dụng cho mọi cuộc gọi không trừ ai.',
                    'Một câu hỏi bí mật của gia đình, dựa trên kỷ niệm chung không có trên mạng. Không viết ra, không nhắn tin.',
                    'Một người để gọi bất cứ lúc nào — và nói rõ rằng gọi lúc nửa đêm hay gọi khi không có chuyện gì cũng đều được.',
                    'Nếu có hàng xóm thân, thống nhất quy ước sang gõ cửa khi nhận cuộc gọi lạ.',
                  ],
                },
                {
                  heading: 'Ba dòng nên dán cạnh điện thoại',
                  paragraphs: [
                    'Ai kêu chuyển tiền gấp thì cúp máy, không cần biết là ai.',
                    'Cúp rồi tự bấm gọi lại bằng số đã lưu trong danh bạ.',
                    'Gọi hoặc sang nhờ một người thứ hai ngồi nghe cùng.',
                  ],
                },
                {
                  heading: 'Khi chuyện đã xảy ra',
                  paragraphs: [
                    'Gọi ngân hàng ngay để yêu cầu tra soát và phong toả — thời gian là yếu tố quyết định khả năng lấy lại tiền.',
                    'Trình báo công an phường, kèm số điện thoại đã gọi tới, số tài khoản nhận và thời điểm giao dịch.',
                    'Không phân tích lỗi, không tước quyền quản lý tiền của người bị lừa. Cả hai đều dạy họ rằng lần sau đừng kể — và im lặng mới là thứ gây thiệt hại lớn nhất.',
                    'Kể lại chuyện cho hàng xóm và họ hàng. Một kịch bản bị kể rộng rãi thì mất hiệu lực rất nhanh.',
                  ],
                },
              ],
              relatedConcepts: ['Quy tắc không phụ thuộc phán đoán', 'Cô lập nạn nhân', 'Mạng lưới hỗ trợ'],
              furtherReading: [
                'Cảnh báo của Bộ Công an về lừa đảo nhắm vào người cao tuổi',
                'Quy trình tra soát và phong toả giao dịch của ngân hàng thương mại',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Sự xấu hổ là một phần được thiết kế sẵn trong kịch bản — nó khiến nạn nhân im lặng và thủ đoạn cũ tiếp tục hiệu quả.\n' +
              '✓ Người trong xóm kể chuyện của chính mình có tác dụng hơn tờ rơi cảnh báo, vì không ai nghe xong mà thấy mình bị coi thường.\n' +
              '✓ Mọi quy tắc phải được thống nhất TRƯỚC — giữa lúc hoảng, người ta chỉ làm được thứ đã thành thói quen.\n' +
              '✓ Với người cao tuổi sống một mình, lớp bảo vệ tốt nhất không nằm trong điện thoại mà nằm ở việc có người để gọi.',
          },
          {
            type: 'text',
            title: 'Điều bà Bảy mang theo',
            paragraphs: [
              'Bà Bảy vẫn nhấc máy khi điện thoại reo. Bà vẫn đi hội thảo sức khoẻ ở nhà văn hoá.',
              'Bà không trở nên nghi ngờ tất cả mọi người — ở tuổi bà, sống mà nghi ngờ tất cả thì còn gì là sống.',
              'Bà chỉ có thêm ba dòng chữ trên tường, một câu hỏi về con chó hồi Khoa học lớp ba, và một người hàng xóm bà có thể gõ cửa lúc bốn giờ sáng.',
              'Chừng đó là đủ.',
            ],
          },
        ],
      },
    ],
  },
};
