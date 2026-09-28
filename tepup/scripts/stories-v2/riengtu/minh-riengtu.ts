import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Minh × Riêng Tư 101 — "Tự tra chính mình".
 *
 * Minh là sinh viên CNTT, nên anh là người duy nhất trong nhóm nhân vật có đủ
 * kỹ năng để tự dựng lại hồ sơ số của mình trong một buổi tối. Câu chuyện đi từ
 * "tôi có gì đâu mà lộ" tới việc nhìn thấy chính mình qua mắt người lạ.
 */
export const MINH_RIENGTU: StorySeed = {
  slug: 'minh-riengtu',
  characterSlug: 'student',
  title: 'Tự tra chính mình',
  teaser:
    'Thầy giao bài tập lạ: tra chính mình trên mạng trong 30 phút. Minh nghĩ sẽ chẳng ra gì. Ba mươi phút sau, anh có một tập hồ sơ về bản thân dày hơn cả CV.',
  icon: 'search',
  estimatedTime: '~30 phút',
  sortOrder: 0,
  courseSlugs: [COURSE.riengtu],
  part: {
    name: 'Người lạ biết gì về Minh',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'ba-muoi-phut-tra-google',
        title: 'Ba mươi phút tra Google',
        blocks: [
          {
            type: 'text',
            title: 'Bài tập kỳ lạ',
            paragraphs: [
              'Tiết cuối môn An toàn thông tin, thầy Hoàng gấp máy tính lại và nói một câu khiến cả lớp ngẩng lên:',
              '"Tuần sau nộp cho tôi một bài. Đề bài là: tra chính các em trên mạng. Ba mươi phút thôi. Chỉ dùng thứ ai cũng dùng được — Google, Facebook, một cái điện thoại. Viết ra tất cả những gì tìm thấy."',
              'Minh ngồi bàn cuối, bật cười. Anh hai mươi mốt tuổi, không nổi tiếng, không kinh doanh, không phốt. Facebook thì để chế độ bạn bè. Anh nghĩ bài này sẽ nộp được ba dòng là hết.',
            ],
          },
          {
            type: 'callout',
            icon: 'clipboard',
            title: 'Đề bài của thầy Hoàng',
            variant: 'info',
            text: 'Trong 30 phút, dùng đúng những công cụ mà một người lạ có thể dùng, hãy dựng lại hồ sơ về chính em: tên đầy đủ, nơi học, nơi ở, số điện thoại, khuôn mặt, thói quen, và những người thân thiết. Ghi rõ em tìm thấy từng thứ ở đâu.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, một sinh viên bình thường như Minh — không nổi tiếng, Facebook để chế độ bạn bè — thì người lạ có thể tìm được bao nhiêu thông tin công khai về anh?',
            options: [
              { id: 'a', text: 'Gần như không có gì, vì tài khoản đã để riêng tư', isCorrect: false },
              { id: 'b', text: 'Chỉ tên và ảnh đại diện', isCorrect: false },
              { id: 'c', text: 'Đủ để dựng lại nơi học, nơi ở, số điện thoại và vòng bạn bè', isCorrect: true },
              { id: 'd', text: 'Chỉ những gì chính anh đăng công khai trong tháng vừa rồi', isCorrect: false },
            ],
            explanation:
              'Đây là chỗ hầu hết mọi người đoán sai. Một tài khoản để riêng tư không giấu được ảnh đại diện, ảnh bìa, danh sách bạn bè ở nhiều cấu hình mặc định, và quan trọng nhất: nó không giấu được những gì NGƯỜI KHÁC đăng về bạn. Hồ sơ số của một người được ghép từ hàng chục nguồn nhỏ, và phần lớn nằm ngoài tầm kiểm soát của người đó.',
          },
          {
            type: 'text',
            title: 'Gõ tên mình vào ô tìm kiếm',
            paragraphs: [
              'Tối hôm đó Minh mở laptop, bấm giờ đúng ba mươi phút, và gõ tên đầy đủ của mình vào Google.',
              'Kết quả đầu tiên là trang Facebook. Ảnh đại diện hiện rõ mặt, ảnh bìa là góc sân trường có biển tên khoa. Ngay dưới đó, phần giới thiệu ghi: học tại Đại học Bách khoa, quê ở Bình Định.',
              'Minh chưa từng để ý rằng ba dòng giới thiệu ấy luôn công khai, kể cả khi mọi bài đăng đã bị khoá.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Kết quả thứ hai còn bất ngờ hơn: một bài viết trên trang tin của khoa, đăng cách đây một năm rưỡi, danh sách sinh viên nhận học bổng khuyến khích học tập.',
              'Trong danh sách có họ tên đầy đủ, mã số sinh viên, lớp, và ngày sinh của Minh.',
              'Anh ngồi thẳng dậy. Mã số sinh viên là thứ dùng để đăng nhập vào cổng thông tin đào tạo.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Kết quả thứ ba là một bình luận Minh để lại trên một diễn đàn lập trình hai năm trước, hỏi cách sửa lỗi cài đặt. Anh đã quên hoàn toàn cái tài khoản đó.',
              'Cuối bình luận là chữ ký tự động của diễn đàn — kèm địa chỉ Gmail cá nhân của anh.',
              'Mới sáu phút. Minh đã có: tên đầy đủ, trường, khoa, lớp, mã số sinh viên, ngày sinh, quê quán, email, và một tấm ảnh rõ mặt.',
            ],
          },
          {
            type: 'callout',
            icon: 'search',
            title: 'OSINT là gì?',
            variant: 'info',
            text: 'OSINT (Open-Source Intelligence) là việc thu thập thông tin về một người hoặc một tổ chức chỉ bằng các nguồn công khai: kết quả tìm kiếm, mạng xã hội, hồ sơ đăng ký, báo chí, dữ liệu mở. Không cần xâm nhập, không cần vi phạm mật khẩu — chỉ cần kiên nhẫn ghép các mảnh rời rạc lại.',
          },
          {
            type: 'question',
            question: 'Điều gì khiến OSINT khác với hành vi tấn công mạng thông thường?',
            options: [
              { id: 'a', text: 'OSINT cần phần mềm chuyên dụng đắt tiền', isCorrect: false },
              { id: 'b', text: 'OSINT chỉ dùng thông tin đã công khai, không phá khoá hay chiếm tài khoản', isCorrect: true },
              { id: 'c', text: 'OSINT chỉ áp dụng được với người nổi tiếng', isCorrect: false },
              { id: 'd', text: 'OSINT là hành vi bị cấm hoàn toàn ở mọi nơi', isCorrect: false },
            ],
            explanation:
              'OSINT không phá gì cả — đó chính là lý do nó đáng sợ. Không có cánh cửa nào bị bẻ khoá để bạn kịp nhận ra. Mọi mảnh thông tin đều do bạn, bạn bè bạn, trường bạn, hoặc một dịch vụ nào đó tự nguyện công khai. Người thu thập chỉ làm mỗi việc là gom chúng lại.',
          },
          {
            type: 'text',
            title: 'Mảnh ghép thứ mười',
            paragraphs: [
              'Phút thứ mười hai, Minh nhớ ra mình từng đăng CV lên một nhóm tuyển thực tập sinh trên Facebook.',
              'Anh tìm lại bài đăng. Nó vẫn còn đó, trong một nhóm công khai bốn mươi nghìn thành viên. File CV đính kèm mở được, không cần xin quyền.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Trong CV có những thứ Minh đã tự tay điền vào:',
              '📞 Số điện thoại cá nhân',
              '📧 Địa chỉ email',
              '🏠 Địa chỉ trọ ở quận Bình Thạnh, ghi đủ số nhà',
              '🎓 Tên trường, ngành, năm tốt nghiệp dự kiến, điểm trung bình',
              '🔗 Đường dẫn tới tài khoản GitHub cá nhân',
              'Anh nhìn dòng địa chỉ trọ hồi lâu. Anh nhớ lúc viết CV, anh còn thấy tự hào vì đã ghi đầy đủ và chuyên nghiệp.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Từ đường dẫn GitHub, Minh bấm sang. Ở đó có lịch sử đóng góp mã nguồn theo ngày, suốt hai năm.',
              'Nhìn vào cái lịch ô vuông xanh ấy, người ta biết được Minh thường lập trình vào buổi tối, gần như không làm gì vào Chủ nhật, và có một giai đoạn ba tuần liền không đụng tới máy — đúng đợt anh về quê ăn Tết.',
              'Không có dòng nào ghi "Minh về quê". Nhưng dữ liệu tự kể ra điều đó.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Một mảnh thì vô hại, mười mảnh thì không',
            variant: 'warning',
            text: 'Số điện thoại nằm một mình chẳng nói lên điều gì. Tấm ảnh nằm một mình cũng vậy. Nhưng số điện thoại cộng với khuôn mặt, cộng với địa chỉ trọ, cộng với giờ giấc sinh hoạt, cộng với tên người thân — thì đó không còn là thông tin nữa, đó là một con người bị mô tả đủ chi tiết để bị nhắm tới.',
          },
          {
            type: 'question',
            question: 'Vì sao việc gom nhiều mẩu thông tin vô hại lại nguy hiểm hơn từng mẩu riêng lẻ?',
            options: [
              { id: 'a', text: 'Vì mỗi mẩu thông tin đều bí mật ngay từ đầu', isCorrect: false },
              { id: 'b', text: 'Vì khi ghép lại, chúng cho phép xác định, định vị và tiếp cận đúng một cá nhân cụ thể', isCorrect: true },
              { id: 'c', text: 'Vì các mẩu thông tin sẽ tự động bị bán cho quảng cáo', isCorrect: false },
              { id: 'd', text: 'Vì càng nhiều dữ liệu thì càng dễ bị sai lệch', isCorrect: false },
            ],
            explanation:
              'Hiện tượng này gọi là "hiệu ứng tổng hợp" (aggregation effect). Một mảnh dữ liệu chỉ mô tả một khía cạnh; nhiều mảnh ghép lại thì khoanh vùng được đúng một người, ở đúng một chỗ, vào đúng một khung giờ. Đó là điều kiện đủ cho lừa đảo nhắm mục tiêu, quấy rối, hoặc mạo danh.',
          },
          {
            type: 'text',
            title: 'Những gì người khác đăng về Minh',
            paragraphs: [
              'Phút thứ hai mươi, Minh chuyển hướng: thay vì tìm những gì mình đăng, anh tìm những gì người khác đăng về mình.',
              'Một người bạn đại học đăng ảnh sinh nhật, gắn thẻ tên Minh, chú thích rõ quán nào, đường nào. Bài đăng để công khai.',
              'Một câu lạc bộ học thuật đăng danh sách ban tổ chức, có ảnh và số điện thoại của Minh để liên hệ.',
              'Mẹ anh đăng ảnh cả nhà dịp giỗ, chú thích tên từng người.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là phần khiến Minh khó chịu nhất. Anh có thể khoá tài khoản của mình, nhưng anh không thể khoá tài khoản của bạn bè, của câu lạc bộ, của mẹ.',
              '"Quyền riêng tư của một người không nằm hoàn toàn trong tay người đó" — anh viết dòng này vào bài tập.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cuối cùng, Minh thử tìm bằng ảnh. Anh tải ảnh đại diện của mình lên công cụ tìm kiếm hình ảnh.',
              'Kết quả trả về ba nơi khác nhau cùng chứa khuôn mặt đó: trang Facebook, một bài viết của khoa, và một video tổng kết sự kiện đăng trên YouTube mà anh còn không nhớ mình từng xuất hiện.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Dấu vết chủ động và dấu vết bị động',
            variant: 'info',
            text: 'Dấu vết chủ động là những gì bạn cố ý đăng: bài viết, ảnh, bình luận, CV. Dấu vết bị động là những gì sinh ra mà bạn không chủ ý: bạn bè gắn thẻ, tổ chức công bố danh sách, hệ thống ghi lại giờ giấc hoạt động, camera ghi hình bạn đi ngang. Phần lớn hồ sơ số của một người là dấu vết bị động — và đó cũng là phần khó xoá nhất.',
          },
          {
            type: 'text',
            title: 'Ba mươi phút, bảy trang giấy',
            paragraphs: [
              'Chuông báo hết giờ. Minh nhìn lại file ghi chép: bảy trang.',
              'Anh có trong tay tên đầy đủ, ngày sinh, quê quán, mã số sinh viên, trường, lớp, điểm trung bình, số điện thoại, hai địa chỉ email, địa chỉ trọ, khuôn mặt ở bốn góc chụp khác nhau, tên mẹ, tên ba người bạn thân, quán cà phê hay lui tới, và khung giờ anh thường thức khuya.',
              'Tất cả đều công khai. Không có một thao tác nào là bất hợp pháp.',
              '"Nếu mình làm được trong ba mươi phút," Minh nghĩ, "thì một người thực sự muốn nhắm vào mình sẽ làm được gì trong ba ngày?"',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Hồ sơ số: bạn để lại những gì?',
            description: 'Bản đồ nhanh các loại dấu vết một người bình thường để lại trên mạng, và ai có thể đọc được chúng.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn nhóm dấu vết',
                  paragraphs: [
                    'Nội dung bạn đăng: bài viết, ảnh, bình luận, hồ sơ cá nhân, CV gửi đi. Đây là nhóm duy nhất bạn kiểm soát trực tiếp.',
                    'Nội dung người khác đăng về bạn: ảnh gắn thẻ, danh sách thành viên, tin tức, bài cảm ơn. Bạn chỉ có thể đề nghị gỡ, không thể tự gỡ.',
                    'Dữ liệu hệ thống ghi nhận: thời điểm đăng nhập, vị trí, thiết bị, lịch sử tìm kiếm, lịch sử mua hàng. Bạn hiếm khi nhìn thấy nhóm này.',
                    'Dữ liệu do bên thứ ba tổng hợp và mua bán: hồ sơ quảng cáo, danh sách khách hàng tiềm năng, dữ liệu rò rỉ từ các vụ lộ lọt. Bạn gần như không biết nhóm này tồn tại.',
                  ],
                },
                {
                  heading: 'Vì sao thông tin cũ vẫn nguy hiểm',
                  paragraphs: [
                    'Một số điện thoại không đổi trong mười năm. Một ngày sinh thì không bao giờ đổi. Một khuôn mặt thì thay đổi rất chậm. Những dữ liệu "vĩnh viễn" như vậy khiến một lần lộ lọt duy nhất có giá trị sử dụng rất lâu về sau.',
                    'Đó là lý do các hồ sơ bị rò rỉ từ nhiều năm trước vẫn được rao bán và vẫn được dùng để lừa đảo cho tới hôm nay.',
                  ],
                },
              ],
              relatedConcepts: ['OSINT', 'Hiệu ứng tổng hợp dữ liệu', 'Dấu vết số chủ động và bị động'],
              furtherReading: [
                'Luật An ninh mạng 2018 — quy định về bảo vệ thông tin cá nhân trên không gian mạng',
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
              '✓ OSINT là việc dựng hồ sơ về một người chỉ bằng nguồn công khai — không cần phá khoá gì cả.\n' +
              '✓ Tài khoản để riêng tư không đồng nghĩa với việc bạn vô hình: ảnh đại diện, danh sách bạn bè, và những gì người khác đăng vẫn ở ngoài đó.\n' +
              '✓ Từng mẩu thông tin thì vô hại; ghép lại thì đủ để xác định và tiếp cận đúng một người.\n' +
              '✓ Phần lớn hồ sơ số của bạn là dấu vết bị động — thứ bạn không chủ ý tạo ra và cũng không thể tự xoá.',
          },
          {
            type: 'text',
            title: 'Câu hỏi còn lại',
            paragraphs: [
              'Minh nộp bài với bảy trang ghi chép. Nhưng bài tập của thầy Hoàng để lại cho anh một câu hỏi mà đề bài không hỏi:',
              'Bảy trang này chỉ là những gì một người lạ nhìn thấy được từ bên ngoài. Còn những thứ nằm bên trong chiếc điện thoại anh cầm trên tay mười sáu tiếng mỗi ngày thì sao?',
              'Tối hôm sau, Minh mở phần cài đặt quyền ứng dụng. Và đó là lúc anh thực sự thấy sốc.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'app-xin-nhung-quyen-gi',
        title: 'App xin những quyền gì?',
        blocks: [
          {
            type: 'text',
            title: 'Bốn mươi bảy ứng dụng',
            paragraphs: [
              'Tối thứ Ba, Minh mở phần Cài đặt trên điện thoại và bấm vào mục Quyền riêng tư.',
              'Máy anh có bốn mươi bảy ứng dụng. Anh chưa từng đếm bao giờ.',
              'Anh bắt đầu từ mục đơn giản nhất: những ứng dụng nào đang được phép biết vị trí của anh.',
            ],
          },
          {
            type: 'callout',
            icon: 'smartphone',
            title: 'Màn hình cài đặt của Minh',
            variant: 'info',
            text: 'Vị trí — 19 ứng dụng được cấp quyền, trong đó 6 ứng dụng ở chế độ "Luôn luôn". Micro — 11 ứng dụng. Danh bạ — 14 ứng dụng. Ảnh — 22 ứng dụng, phần lớn ở chế độ "Toàn bộ thư viện".',
          },
          {
            type: 'question',
            question:
              'Trong 19 ứng dụng đang được biết vị trí của Minh, theo bạn có bao nhiêu ứng dụng thực sự cần vị trí để hoạt động đúng chức năng chính của nó?',
            options: [
              { id: 'a', text: 'Gần như tất cả — ứng dụng hiện đại nào cũng cần vị trí', isCorrect: false },
              { id: 'b', text: 'Khoảng một nửa', isCorrect: false },
              { id: 'c', text: 'Chỉ vài ứng dụng: bản đồ, gọi xe, giao đồ ăn, thời tiết', isCorrect: true },
              { id: 'd', text: 'Không ứng dụng nào thực sự cần', isCorrect: false },
            ],
            explanation:
              'Số ứng dụng thực sự cần vị trí để làm đúng việc của nó thường rất nhỏ — bản đồ, gọi xe, giao hàng, thời tiết. Phần còn lại xin vị trí không phải vì chức năng, mà vì vị trí là dữ liệu bán được. Khoảng cách giữa "cần để chạy" và "xin vì có giá" chính là chỗ quyền riêng tư bị rò rỉ.',
          },
          {
            type: 'text',
            title: 'Ứng dụng đèn pin',
            paragraphs: [
              'Minh cuộn xuống và dừng lại ở một cái tên anh gần như đã quên: một ứng dụng đèn pin anh tải hồi năm nhất, khi điện thoại cũ chưa có sẵn chức năng này.',
              'Ứng dụng đèn pin đó đang được cấp quyền: vị trí chính xác, danh bạ, và ảnh.',
              'Minh ngồi im mất một lúc. Một cái đèn pin. Nó cần danh bạ để làm gì?',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu trả lời thì đơn giản, và cũng chính vì đơn giản nên mới khó chịu: ứng dụng đó miễn phí.',
              'Nó không thu tiền của Minh. Nó thu thứ khác.',
              'Danh bạ của Minh là một danh sách hàng trăm số điện thoại có thật, kèm tên, kèm quan hệ. Vị trí của Minh là bản đồ nơi anh sống, nơi anh học, nơi anh hay đến vào tối thứ Bảy. Ghép hai thứ đó lại, người ta có một hồ sơ tiếp thị chính xác hơn bất kỳ bảng khảo sát nào.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Quyền vượt mức cần thiết (over-permission)',
            variant: 'info',
            text: 'Là khi một ứng dụng xin nhiều quyền hơn mức chức năng của nó đòi hỏi. Nguyên tắc đối lập với nó là "tối thiểu cần thiết" (data minimisation): chỉ thu thập đúng dữ liệu cần cho chức năng, chỉ giữ trong đúng thời gian cần, và không dùng cho mục đích khác.',
          },
          {
            type: 'sort-bucket',
            title: 'Cái đèn pin cần gì?',
            instruction:
              'Xếp từng quyền vào đúng rổ: quyền nào một ứng dụng đèn pin thực sự cần để hoạt động, và quyền nào là xin thừa?',
            buckets: [
              { id: 'can', label: 'Thực sự cần' },
              { id: 'thua', label: 'Xin thừa' },
            ],
            items: [
              { id: 'i1', text: 'Điều khiển đèn flash của camera', bucketId: 'can' },
              { id: 'i2', text: 'Truy cập danh bạ', bucketId: 'thua' },
              { id: 'i3', text: 'Vị trí chính xác, kể cả khi không mở app', bucketId: 'thua' },
              { id: 'i4', text: 'Toàn bộ thư viện ảnh', bucketId: 'thua' },
              { id: 'i5', text: 'Micro', bucketId: 'thua' },
              { id: 'i6', text: 'Đọc và gửi tin nhắn SMS', bucketId: 'thua' },
            ],
          },
          {
            type: 'text',
            title: 'Ba mức của quyền vị trí',
            paragraphs: [
              'Minh bấm vào từng ứng dụng và thấy quyền vị trí không phải chỉ có bật hoặc tắt. Nó có ba mức, và khoảng cách giữa chúng rất lớn:',
              '🚫 Không cho phép — ứng dụng không biết bạn ở đâu.',
              '👆 Chỉ khi đang dùng — ứng dụng biết vị trí trong lúc bạn mở nó lên, và chỉ lúc đó.',
              '🕓 Luôn luôn — ứng dụng biết vị trí cả khi nằm trong túi quần, cả khi bạn đang ngủ.',
              'Sáu ứng dụng trên máy Minh đang ở mức "Luôn luôn". Anh không nhớ mình đã bấm đồng ý lúc nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh không nhớ, vì việc bấm đồng ý xảy ra vào đúng thời điểm bất lợi nhất cho việc suy nghĩ: lúc vừa cài xong, đang muốn dùng ngay, và hộp thoại hiện lên chắn giữa màn hình.',
              'Nút "Cho phép" thì to và sáng màu. Nút từ chối thì nhỏ, nhạt, đặt lệch sang một bên. Không có chỗ nào giải thích rằng "Luôn luôn" nghĩa là suốt hai mươi bốn giờ.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao người dùng hay bấm "Cho phép" mà không thực sự cân nhắc?',
            options: [
              { id: 'a', text: 'Vì họ không quan tâm tới quyền riêng tư của mình', isCorrect: false },
              { id: 'b', text: 'Vì hộp thoại xuất hiện đúng lúc họ đang muốn dùng app, và giao diện được thiết kế để nghiêng về phía đồng ý', isCorrect: true },
              { id: 'c', text: 'Vì luật bắt buộc phải đồng ý mới được dùng', isCorrect: false },
              { id: 'd', text: 'Vì từ chối sẽ làm hỏng điện thoại', isCorrect: false },
            ],
            explanation:
              'Đây là thiết kế chứ không phải tình cờ. Cách bố trí giao diện để đẩy người dùng về phía lựa chọn có lợi cho nhà cung cấp được gọi là "dark pattern" — mẫu thiết kế tối. Nút đồng ý to hơn, sáng hơn, đặt ở nơi ngón cái chạm tới dễ nhất; nút từ chối thì ngược lại. Sự đồng ý thu được theo cách đó rất khó gọi là đồng ý tự nguyện và có hiểu biết.',
          },
          {
            type: 'text',
            title: 'Thứ Minh không nhìn thấy trong màn hình cài đặt',
            paragraphs: [
              'Danh sách quyền chỉ cho biết ứng dụng được phép lấy gì. Nó không cho biết ứng dụng làm gì với thứ đã lấy.',
              'Không có dòng nào ghi: dữ liệu vị trí của bạn được gửi về máy chủ nào, giữ trong bao lâu, chia sẻ với bao nhiêu đối tác, và bán cho ai.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Phần đó nằm trong chính sách quyền riêng tư — văn bản dài hàng nghìn chữ mà gần như không ai đọc.',
              'Minh thử mở chính sách của ứng dụng đèn pin. Nó dài mười bốn trang. Đến trang thứ chín có một câu: dữ liệu có thể được chia sẻ với "các đối tác quảng cáo và phân tích" — không liệt kê tên.',
              '"Không liệt kê tên" nghĩa là danh sách đó có thể thay đổi bất cứ lúc nào, và Minh sẽ không bao giờ được thông báo.',
            ],
          },
          {
            type: 'text',
            title: 'Thứ nằm sẵn bên trong ứng dụng',
            paragraphs: [
              'Có một chi tiết kỹ thuật mà Minh, với tư cách sinh viên CNTT, hiểu rõ hơn phần lớn người dùng.',
              'Khi một nhóm lập trình viên làm ứng dụng, họ hiếm khi tự viết mọi thứ. Họ nhúng vào đó những bộ thư viện có sẵn của bên thứ ba: một bộ để hiện quảng cáo, một bộ để đo lường xem người dùng bấm vào đâu, một bộ để báo lỗi khi app treo.',
              'Mỗi bộ thư viện như vậy chạy bên trong ứng dụng, và vì thế nó thừa hưởng đúng những quyền mà bạn đã cấp cho ứng dụng.',
            ],
          },
          {
            type: 'question',
            question:
              'Khi bạn cấp quyền vị trí cho một ứng dụng có nhúng thư viện quảng cáo của bên thứ ba, ai thực sự nhận được vị trí của bạn?',
            options: [
              { id: 'a', text: 'Chỉ nhà phát triển ứng dụng đó', isCorrect: false },
              { id: 'b', text: 'Nhà phát triển, cộng với công ty đứng sau mỗi thư viện được nhúng bên trong', isCorrect: true },
              { id: 'c', text: 'Không ai cả, dữ liệu chỉ nằm trong máy', isCorrect: false },
              { id: 'd', text: 'Chỉ nhà sản xuất điện thoại', isCorrect: false },
            ],
            explanation:
              'Quyền được cấp cho ứng dụng, nhưng mọi thư viện chạy bên trong ứng dụng đều dùng chung quyền đó. Một app có ba bộ thư viện quảng cáo nghĩa là ba công ty nữa cùng nhìn thấy dữ liệu của bạn — và bạn không hề biết tên họ, vì bạn chỉ từng đồng ý với một cái tên duy nhất trên cửa hàng ứng dụng.',
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Miễn phí không có nghĩa là không mất gì',
            variant: 'warning',
            text: 'Một ứng dụng không thu tiền vẫn phải trả lương lập trình viên, trả phí máy chủ, trả tiền quảng cáo để có người tải. Nếu bạn không nhìn thấy mình trả bằng gì, khả năng cao là bạn đang trả bằng dữ liệu — thứ duy nhất bạn giao ra mà không cảm thấy nó rời khỏi túi mình.',
          },
          {
            type: 'text',
            title: 'Minh dọn máy',
            paragraphs: [
              'Trong bốn mươi phút, Minh làm ba việc.',
              'Thứ nhất, anh gỡ mười một ứng dụng mà anh không mở lần nào trong sáu tháng qua — trong đó có cái đèn pin.',
              'Thứ hai, anh hạ toàn bộ quyền vị trí từ "Luôn luôn" xuống "Chỉ khi đang dùng", trừ ứng dụng bản đồ.',
              'Thứ ba, anh chuyển quyền truy cập ảnh từ "Toàn bộ thư viện" sang "Chỉ ảnh được chọn" cho mọi ứng dụng trừ ứng dụng ảnh của hệ điều hành.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hôm sau, Minh dùng điện thoại như bình thường.',
              'Không có ứng dụng nào hỏng. Không có chức năng nào biến mất. Đúng hai lần trong ngày, một ứng dụng hiện hộp thoại xin quyền lại — và cả hai lần anh đều bấm "Chỉ lần này".',
              'Anh nhận ra một điều đơn giản mà anh chưa từng thử kiểm chứng: phần lớn các quyền anh đã cấp, anh chưa bao giờ thực sự cần cấp.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Rà soát quyền ứng dụng trong 15 phút',
            description: 'Danh sách kiểm tra ngắn để thu hẹp lượng dữ liệu điện thoại của bạn đang phát ra mỗi ngày.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '3 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn quyền cần xem trước tiên',
                  paragraphs: [
                    'Vị trí: hạ mọi ứng dụng xuống "Chỉ khi đang dùng", trừ bản đồ và gọi xe. Mức "Luôn luôn" hầu như không bao giờ cần thiết.',
                    'Ảnh: chọn "Chỉ ảnh được chọn" thay vì "Toàn bộ thư viện". Ứng dụng chỉ nhìn thấy đúng tấm bạn gửi.',
                    'Danh bạ: rất ít ứng dụng thực sự cần. Đây là quyền có sức lan toả lớn nhất, vì bạn đang giao cả thông tin của người khác chứ không chỉ của mình.',
                    'Micro và camera: kiểm tra ứng dụng nào đang giữ quyền dù chức năng chính không liên quan tới ghi âm hay chụp ảnh.',
                  ],
                },
                {
                  heading: 'Thói quen giữ lâu dài',
                  paragraphs: [
                    'Gỡ ứng dụng không dùng đến trong sáu tháng. Ứng dụng đã gỡ là ứng dụng không thể thu thập gì thêm.',
                    'Khi cài ứng dụng mới, đọc đúng một dòng: nó xin quyền gì. Nếu quyền đó không liên quan tới việc bạn tải nó về để làm, hãy từ chối trước và chỉ cấp khi thực sự bị chặn.',
                    'Rà soát lại toàn bộ quyền mỗi sáu tháng — các bản cập nhật đôi khi xin thêm quyền mới.',
                  ],
                },
              ],
              relatedConcepts: ['Quyền vượt mức cần thiết', 'Tối thiểu hoá dữ liệu', 'Dark pattern'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — nguyên tắc xử lý dữ liệu cá nhân đúng mục đích',
                'Hướng dẫn quản lý quyền ứng dụng của Android và iOS',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nhiều ứng dụng xin quyền vượt xa mức chức năng của chúng đòi hỏi — đó là over-permission.\n' +
              '✓ Quyền vị trí có ba mức, và "Luôn luôn" nghĩa là suốt hai mươi bốn giờ, kể cả khi bạn không mở app.\n' +
              '✓ Hộp thoại xin quyền được thiết kế nghiêng về phía đồng ý; đó là dark pattern, không phải sự tình cờ.\n' +
              '✓ Hạ quyền xuống mức tối thiểu gần như không làm hỏng trải nghiệm — phần lớn quyền đã cấp là quyền không cần cấp.',
          },
          {
            type: 'text',
            title: 'Nhưng còn những gì đã đi ra ngoài?',
            paragraphs: [
              'Minh đóng phần cài đặt, hài lòng vì đã siết lại được cái vòi.',
              'Rồi anh nhớ ra một chuyện: siết vòi chỉ ngăn nước chảy tiếp. Nó không lấy lại được lượng nước đã chảy ra suốt bốn năm qua.',
              'Những dữ liệu đã rời khỏi máy anh đang nằm ở đâu, trong tay ai, và còn nằm đó bao lâu nữa?',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'dau-vet-khong-xoa-duoc',
        title: 'Dấu vết không xoá được',
        blocks: [
          {
            type: 'text',
            title: 'Tấm ảnh chụp bàn học',
            paragraphs: [
              'Minh gửi cho nhóm bạn một tấm ảnh chụp góc bàn học của mình, kèm dòng chữ: "Chuẩn bị thi cuối kỳ đây."',
              'Tấm ảnh chỉ có sách vở, một cốc cà phê và cái đèn bàn. Không có mặt người, không có biển số nhà, không có gì đáng gọi là riêng tư.',
              'Hùng, bạn cùng lớp, nhắn lại sau ba phút: "Mày dọn về Bình Thạnh hồi nào vậy? Tao tưởng mày còn ở Thủ Đức."',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Minh nhắn lại',
            variant: 'info',
            text: 'Sao mày biết? Tao có nói gì đâu.',
          },
          {
            type: 'question',
            question: 'Theo bạn, Hùng đã biết Minh chuyển chỗ ở bằng cách nào?',
            options: [
              { id: 'a', text: 'Hùng đoán mò dựa vào cái đèn bàn mới', isCorrect: false },
              { id: 'b', text: 'Minh từng nhắc chuyện chuyển nhà mà quên mất', isCorrect: false },
              { id: 'c', text: 'Tấm ảnh mang theo toạ độ nơi chụp được ghi sẵn trong file', isCorrect: true },
              { id: 'd', text: 'Hùng có quyền truy cập tài khoản của Minh', isCorrect: false },
            ],
            explanation:
              'Mỗi tấm ảnh chụp bằng điện thoại đều kèm một khối thông tin mô tả gọi là metadata: thời điểm chụp chính xác tới giây, mẫu máy, thiết lập ống kính, và ở nhiều cấu hình mặc định là cả toạ độ GPS nơi bấm máy. Bạn không nhìn thấy khối đó khi mở ảnh, nhưng nó đi kèm file như một cái nhãn dán mặt sau.',
          },
          {
            type: 'text',
            title: 'Cái nhãn dán mặt sau',
            paragraphs: [
              'Minh mở lại tấm ảnh trên máy tính và xem phần thông tin chi tiết.',
              'Ở đó có: ngày giờ chụp là 21 giờ 47 phút thứ Ba tuần trước, mẫu điện thoại, và hai dãy số toạ độ. Anh dán hai dãy số ấy vào bản đồ.',
              'Bản đồ nhảy tới đúng con hẻm nhà trọ của anh, sai lệch chừng mười lăm mét.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều làm Minh khó chịu không phải là Hùng biết. Hùng là bạn thân.',
              'Điều làm anh khó chịu là: trong bốn năm qua anh đã gửi hàng nghìn tấm ảnh — cho nhóm lớp, cho các nhóm mua bán đồ cũ, cho những người thuê phòng anh chưa từng gặp mặt.',
              'Mỗi tấm trong số đó, nếu được gửi ở dạng file gốc, đều mang theo cái nhãn dán mặt sau.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Metadata là gì?',
            variant: 'info',
            text: 'Metadata là dữ liệu mô tả dữ liệu. Với một tấm ảnh, đó là thời điểm, thiết bị, thông số máy và vị trí. Với một cuộc gọi, đó là ai gọi ai, lúc nào, kéo dài bao lâu — không cần nghe nội dung. Metadata thường bị coi là "chỉ là thông tin kỹ thuật", nhưng nó là dạng dữ liệu dễ tổng hợp và dễ phân tích quy mô lớn nhất.',
          },
          {
            type: 'flip-card',
            title: 'Bạn nghĩ nó là gì — và nó thực sự là gì',
            instruction: 'Bấm vào từng thẻ để lật xem mặt sau.',
            cards: [
              {
                id: 'c1',
                front: { kind: 'text', text: 'Một tấm ảnh chụp bàn học' },
                back: { kind: 'text', text: 'Toạ độ GPS nơi bạn ngủ mỗi đêm, cùng thời điểm chính xác tới giây' },
              },
              {
                id: 'c2',
                front: { kind: 'text', text: 'Một lần bật định vị để gọi xe' },
                back: { kind: 'text', text: 'Một điểm trên bản đồ hành trình của bạn, được lưu lại và cộng dồn qua từng tháng' },
              },
              {
                id: 'c3',
                front: { kind: 'text', text: 'Một lần đăng nhập bằng tài khoản mạng xã hội cho nhanh' },
                back: { kind: 'text', text: 'Một sợi dây nối hồ sơ của bạn ở hai dịch vụ vốn không liên quan gì tới nhau' },
              },
              {
                id: 'c4',
                front: { kind: 'text', text: 'Một lần điền số điện thoại để nhận mã giảm giá' },
                back: { kind: 'text', text: 'Khoá chính để ghép mọi hồ sơ rời rạc về bạn thành một hồ sơ duy nhất' },
              },
            ],
          },
          {
            type: 'text',
            title: 'Số điện thoại là chiếc chìa khoá',
            paragraphs: [
              'Trong bốn tấm thẻ trên, tấm cuối cùng là tấm quan trọng nhất, và Minh mất một lúc mới hiểu tại sao.',
              'Tên của anh trùng với hàng nghìn người khác. Ngày sinh của anh trùng với hàng triệu người. Nhưng số điện thoại của anh thì chỉ thuộc về một mình anh, không đổi suốt sáu năm, và đã được anh điền vào hàng chục nơi khác nhau.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điền số điện thoại để nhận mã giảm giá ở siêu thị. Điền để đăng ký thẻ thành viên quán cà phê. Điền để mua hàng trên sàn thương mại điện tử. Điền vào CV gửi cho bốn mươi nghìn người trong nhóm tuyển dụng.',
              'Mỗi nơi giữ một mảnh hồ sơ khác nhau về Minh. Nhưng vì cả bốn mảnh đều có cùng một số điện thoại, chúng ghép lại được với nhau.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao số điện thoại lại nguy hiểm hơn nhiều mẩu thông tin khác?',
            options: [
              { id: 'a', text: 'Vì nó cho phép người khác gọi làm phiền bạn', isCorrect: false },
              { id: 'b', text: 'Vì nó gần như không đổi và có mặt ở nhiều nơi, nên dùng được làm khoá để ghép các hồ sơ rời rạc thành một', isCorrect: true },
              { id: 'c', text: 'Vì nó chứa thông tin về nơi bạn sinh ra', isCorrect: false },
              { id: 'd', text: 'Vì nhà mạng công khai danh bạ thuê bao', isCorrect: false },
            ],
            explanation:
              'Trong xử lý dữ liệu, một trường vừa duy nhất vừa ổn định vừa phổ biến được gọi là định danh khoá. Số điện thoại hội đủ cả ba: chỉ một người dùng, giữ nguyên nhiều năm, và xuất hiện ở hầu hết mọi biểu mẫu. Nó chính là thứ biến nhiều hồ sơ nhỏ không liên quan thành một hồ sơ lớn về đúng một con người.',
          },
          {
            type: 'text',
            title: 'Những người mua bán hồ sơ',
            paragraphs: [
              'Minh tìm hiểu tiếp và gặp một khái niệm anh chưa từng nghe trong trường: môi giới dữ liệu.',
              'Đó là những công ty không cung cấp dịch vụ gì cho bạn cả. Việc của họ là thu gom dữ liệu từ nhiều nguồn — ứng dụng, chương trình khách hàng thân thiết, các vụ rò rỉ, các danh sách công khai — rồi ghép lại thành hồ sơ và bán cho bên nào cần.',
              'Bạn chưa từng đăng ký với họ. Bạn không biết tên họ. Nhưng hồ sơ về bạn vẫn nằm trong kho của họ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều này giải thích một hiện tượng mà gần như người Việt Nam nào cũng gặp: cuộc gọi mời mua bảo hiểm, mời vay tiền, mời mua căn hộ — và người gọi biết đúng họ tên, đôi khi biết cả nơi làm việc.',
              'Không ai đột nhập vào điện thoại của bạn để lấy những thứ đó. Chúng được mua, với giá rất rẻ, theo lô hàng nghìn hồ sơ.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Dữ liệu đã ra ngoài thì không gọi về được',
            variant: 'warning',
            text: 'Bạn có thể xoá một bài đăng, gỡ một ứng dụng, đổi một mật khẩu. Nhưng bạn không thể xoá bản sao đã nằm trong máy chủ của bên thứ ba, trong kho của một môi giới dữ liệu, hay trong tệp tin rò rỉ đang được chuyền tay. Vì thế phòng ngừa ở đầu vào luôn rẻ hơn dọn dẹp ở đầu ra rất nhiều lần.',
          },
          {
            type: 'text',
            title: 'Luật nói gì về chuyện này',
            paragraphs: [
              'Minh tưởng đây là vùng hoàn toàn không có luật. Anh nhầm.',
              'Nghị định 13/2023 về bảo vệ dữ liệu cá nhân quy định rằng tổ chức thu thập dữ liệu của bạn phải nói rõ mục đích, phải xin sự đồng ý, và phải cho bạn quyền yêu cầu xem, sửa hoặc xoá dữ liệu đó.',
              'Nghĩa là trên giấy tờ, bạn có quyền viết thư yêu cầu một công ty xoá hồ sơ của mình — và họ có nghĩa vụ trả lời.',
            ],
          },
          {
            type: 'question',
            question: 'Theo quy định hiện hành về bảo vệ dữ liệu cá nhân, bạn có những quyền nào với dữ liệu của chính mình?',
            mode: 'multiple',
            options: [
              { id: 'a', text: 'Quyền được biết dữ liệu của mình bị thu thập và dùng vào mục đích gì', isCorrect: true },
              { id: 'b', text: 'Quyền yêu cầu sửa lại dữ liệu sai', isCorrect: true },
              { id: 'c', text: 'Quyền yêu cầu xoá dữ liệu và rút lại sự đồng ý', isCorrect: true },
              { id: 'd', text: 'Quyền yêu cầu công ty trả tiền cho mỗi lần dùng dữ liệu của bạn', isCorrect: false },
            ],
            explanation:
              'Ba quyền đầu — được biết, được sửa, được xoá và rút lại đồng ý — là những quyền cơ bản được ghi nhận. Quyền được trả tiền thì không: pháp luật hiện hành xử lý dữ liệu cá nhân như một thứ cần được bảo vệ, chứ không như một tài sản bạn cho thuê. Khoảng cách giữa quyền trên giấy và việc thực thi trên thực tế vẫn còn lớn, nhưng biết mình có quyền là điều kiện đầu tiên để đòi được nó.',
          },
          {
            type: 'text',
            title: 'Minh đổi cách gửi ảnh',
            paragraphs: [
              'Minh không thể gọi về những gì đã đi. Nhưng anh thay đổi được cách làm từ hôm nay.',
              'Anh tắt chức năng gắn vị trí vào ảnh trong phần cài đặt máy ảnh. Từ giờ, ảnh anh chụp không còn mang theo toạ độ.',
              'Anh cũng để ý một chi tiết nhỏ: khi gửi ảnh qua ứng dụng nhắn tin thông thường, ảnh bị nén và phần lớn metadata bị loại bỏ. Nhưng khi gửi ở chế độ "file gốc" hoặc gửi qua thư điện tử, metadata đi theo nguyên vẹn.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Và anh làm một việc mà anh nghĩ là quan trọng nhất trong cả buổi tối: anh mở lại bài đăng CV trong nhóm tuyển dụng bốn mươi nghìn người, và xoá nó.',
              'Bài đăng đã ở đó mười tám tháng. Anh không biết bao nhiêu người đã tải file về. Nhưng ít nhất, từ hôm nay sẽ không có người thứ bốn mươi nghìn lẻ một.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Metadata và môi giới dữ liệu',
            description: 'Hai cơ chế âm thầm nhất khiến dữ liệu cá nhân rời khỏi tay bạn.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Metadata đi kèm những gì',
                  paragraphs: [
                    'Ảnh: thời điểm chụp, mẫu máy, thông số ống kính, và toạ độ GPS nếu bật định vị cho máy ảnh.',
                    'Tài liệu văn bản: tên tác giả, tên máy tính, thời gian chỉnh sửa, đôi khi cả lịch sử sửa đổi.',
                    'Liên lạc: ai gọi ai, lúc nào, bao lâu, từ vị trí nào — không cần nội dung cuộc gọi vẫn đủ dựng lại quan hệ và thói quen.',
                  ],
                },
                {
                  heading: 'Môi giới dữ liệu hoạt động ra sao',
                  paragraphs: [
                    'Thu gom: từ ứng dụng, chương trình tích điểm, biểu mẫu đăng ký, danh sách công khai và các tệp dữ liệu rò rỉ.',
                    'Ghép nối: dùng các định danh ổn định như số điện thoại, email, số căn cước để nối các mảnh rời rạc về cùng một người.',
                    'Phân nhóm và bán: hồ sơ được gắn nhãn theo độ tuổi, thu nhập ước tính, nhu cầu dự đoán, rồi bán theo lô cho bên có nhu cầu tiếp thị hoặc mục đích khác.',
                  ],
                },
                {
                  heading: 'Ba việc làm ngay hôm nay',
                  paragraphs: [
                    'Tắt gắn vị trí cho ứng dụng máy ảnh — đây là thao tác một lần, có tác dụng vĩnh viễn với mọi ảnh chụp sau đó.',
                    'Rà lại các bài đăng cũ có chứa số điện thoại, địa chỉ hoặc giấy tờ, và gỡ chúng xuống.',
                    'Cân nhắc một số điện thoại phụ dùng riêng cho việc đăng ký khuyến mãi, mua bán online và các biểu mẫu không quan trọng.',
                  ],
                },
              ],
              relatedConcepts: ['Metadata', 'Định danh khoá', 'Môi giới dữ liệu', 'Hiệu ứng tổng hợp dữ liệu'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân — quyền được biết và quyền xoá dữ liệu',
                'Luật An ninh mạng 2018 — trách nhiệm bảo vệ thông tin cá nhân của tổ chức, doanh nghiệp',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Mỗi tấm ảnh mang theo metadata: thời điểm, thiết bị, và thường là cả toạ độ nơi bấm máy.\n' +
              '✓ Số điện thoại là định danh khoá — nó ghép các hồ sơ rời rạc về bạn thành một hồ sơ duy nhất.\n' +
              '✓ Môi giới dữ liệu tổng hợp và bán hồ sơ về những người chưa từng đăng ký với họ.\n' +
              '✓ Dữ liệu đã ra ngoài thì không gọi về được — phòng ở đầu vào luôn rẻ hơn dọn ở đầu ra.',
          },
          {
            type: 'text',
            title: 'Vậy làm được gì?',
            paragraphs: [
              'Minh đóng máy lúc gần một giờ sáng, đầu đầy những thứ vừa biết và một cảm giác khá nặng nề.',
              'Nhưng anh nhận ra cảm giác nặng nề ấy không có ích. Biết mà không làm gì thì chỉ tạo ra lo lắng.',
              'Cuối tuần đó, anh ngồi xuống và viết một danh sách việc cần làm — không phải để biến mình thành người vô hình, mà để cái hồ sơ bảy trang kia mỏng bớt đi.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'don-dep-ho-so-so',
        title: 'Dọn dẹp hồ sơ số',
        blocks: [
          {
            type: 'text',
            title: 'Câu hỏi của Hùng',
            paragraphs: [
              'Sáng thứ Bảy, Minh kể lại toàn bộ chuyện tuần vừa rồi cho Hùng nghe ở quán cà phê đầu hẻm.',
              'Hùng nghe hết, khuấy ly cà phê, rồi nói đúng cái câu mà Minh đoán trước là sẽ nghe:',
              '"Ừ thì sao? Tao có làm gì sai đâu mà sợ. Tao có gì để giấu?"',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Câu nói phổ biến nhất về quyền riêng tư',
            variant: 'info',
            text: '"Tôi chẳng có gì để giấu." — Đây là lập luận được nhắc tới nhiều nhất mỗi khi bàn về dữ liệu cá nhân, và cũng là lập luận đặt sai vấn đề nhất.',
          },
          {
            type: 'question',
            question: 'Chỗ sai của lập luận "tôi chẳng có gì để giấu" nằm ở đâu?',
            options: [
              { id: 'a', text: 'Không có chỗ nào sai — người trong sạch thì đúng là không cần lo', isCorrect: false },
              { id: 'b', text: 'Nó đánh tráo quyền riêng tư thành việc che giấu sai phạm, trong khi riêng tư là quyền kiểm soát thông tin về mình', isCorrect: true },
              { id: 'c', text: 'Nó sai vì thực ra ai cũng có điều gì đó phạm pháp', isCorrect: false },
              { id: 'd', text: 'Nó sai vì luật cấm nói câu đó', isCorrect: false },
            ],
            explanation:
              'Riêng tư không phải là giấu điều xấu. Bạn đóng cửa nhà tắm không phải vì đang làm gì phạm pháp. Bạn không đưa bảng lương cho hàng xóm không phải vì lương bất minh. Riêng tư là quyền tự quyết ai được biết gì về mình, trong hoàn cảnh nào — và mất quyền đó thì bạn mất khả năng tự bảo vệ trước lừa đảo, phân biệt đối xử và thao túng.',
          },
          {
            type: 'text',
            title: 'Minh trả lời bằng một ví dụ',
            paragraphs: [
              '"Mày không có gì để giấu," Minh nói, "vậy đưa tao mượn điện thoại mở khoá sẵn, tao ngồi đọc mười lăm phút nhé."',
              'Hùng cười: "Điên à."',
              '"Đó. Không phải vì mày có tội. Chỉ là có những thứ mày muốn tự quyết ai được xem."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh kể tiếp một chuyện có thật anh đọc được: một người bị từ chối hồ sơ vay vì hệ thống chấm điểm tín dụng ghi nhận anh ta hay đổi chỗ ở, dữ liệu lấy từ lịch sử giao hàng.',
              'Anh ta không phạm luật gì. Anh ta chỉ là sinh viên hay chuyển trọ.',
              'Nhưng dữ liệu không kể hoàn cảnh. Dữ liệu chỉ để lại một cái nhãn, và cái nhãn ấy theo người ta đi rất xa.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Riêng tư là quyền kiểm soát ngữ cảnh',
            variant: 'info',
            text: 'Một thông tin không tự nó riêng tư hay công khai — nó phụ thuộc vào ngữ cảnh. Bạn kể chuyện sức khoẻ với bác sĩ, không kể với nhà tuyển dụng. Bạn cho ngân hàng biết thu nhập, không cho hàng xóm biết. Vi phạm riêng tư thường không phải là bí mật bị lộ, mà là thông tin bị mang ra khỏi đúng ngữ cảnh của nó.',
          },
          {
            type: 'text',
            title: 'Danh sách của Minh',
            paragraphs: [
              'Chiều hôm đó Minh ngồi viết ra việc cần làm. Anh cố tình không đặt mục tiêu "biến mất khỏi Internet" — mục tiêu đó vừa bất khả thi vừa vô nghĩa với một sinh viên sắp đi xin việc.',
              'Mục tiêu của anh khiêm tốn hơn: làm cho cái hồ sơ bảy trang kia mỏng bớt, và làm cho những gì còn lại khó ghép vào nhau hơn.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh chia danh sách thành ba nhóm theo mức công sức:',
              '⚡ Làm một lần, hiệu lực mãi mãi: tắt gắn vị trí vào ảnh, bật xác thực hai lớp cho email chính, đổi quyền ảnh sang "chỉ ảnh được chọn".',
              '🧹 Dọn một buổi: gỡ app không dùng, xoá bài đăng cũ có số điện thoại và địa chỉ, rời khỏi các nhóm mua bán không còn dùng.',
              '🔁 Thói quen lâu dài: không điền số điện thoại chính vào biểu mẫu khuyến mãi, không đăng nhập nhanh bằng tài khoản mạng xã hội, rà lại quyền ứng dụng mỗi sáu tháng.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao Minh đặt mục tiêu "làm hồ sơ mỏng bớt" thay vì "biến mất hoàn toàn khỏi Internet"?',
            options: [
              { id: 'a', text: 'Vì biến mất hoàn toàn là bất hợp pháp', isCorrect: false },
              { id: 'b', text: 'Vì mục tiêu bất khả thi dễ khiến người ta bỏ cuộc, trong khi giảm dần rủi ro thì làm được ngay và có tác dụng thật', isCorrect: true },
              { id: 'c', text: 'Vì hồ sơ mỏng hay dày không ảnh hưởng gì tới an toàn', isCorrect: false },
              { id: 'd', text: 'Vì anh cần giữ hồ sơ để xin việc', isCorrect: false },
            ],
            explanation:
              'An toàn thông tin hiếm khi là chuyện có hoặc không. Nó là chuyện nâng chi phí tấn công lên đủ cao để bạn không còn là mục tiêu dễ. Một mục tiêu tuyệt đối như "biến mất" gần như luôn thất bại, và thất bại thường kéo theo việc bỏ mặc tất cả. Những thay đổi nhỏ nhưng làm được ngay thì bền hơn nhiều.',
          },
          {
            type: 'text',
            title: 'Hai lớp khoá cho một cánh cửa',
            paragraphs: [
              'Trong danh sách, Minh đánh dấu sao vào một mục: bật xác thực hai lớp cho địa chỉ email chính.',
              'Lý do rất đơn giản. Email chính là nơi mọi dịch vụ khác gửi liên kết đặt lại mật khẩu về. Ai chiếm được email của bạn thì lần lượt chiếm được mọi thứ khác — mạng xã hội, ví điện tử, tài khoản mua sắm.',
              'Anh gọi nó là "cánh cửa chính". Mọi cánh cửa khác trong nhà đều mở được từ đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Xác thực hai lớp nghĩa là ngoài mật khẩu, cần thêm một yếu tố thứ hai: một mã sinh ra trên ứng dụng, một khoá vật lý, hoặc tin nhắn.',
              'Minh chọn ứng dụng sinh mã thay vì tin nhắn, vì tin nhắn có thể bị chiếm bằng cách lừa nhà mạng cấp lại thẻ SIM — một thủ đoạn đã xảy ra ở Việt Nam.',
              'Việc bật mất bốn phút. Anh nghĩ đó là bốn phút hiệu quả nhất trong cả tuần.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đừng để một tài khoản mở được mọi tài khoản',
            variant: 'warning',
            text: 'Đăng nhập nhanh bằng tài khoản mạng xã hội rất tiện, nhưng nó biến một tài khoản duy nhất thành chìa khoá vạn năng. Mất tài khoản đó là mất theo mọi dịch vụ gắn với nó — và đồng thời, nó cho phép các dịch vụ nối hồ sơ của bạn với nhau. Với những dịch vụ quan trọng, hãy tạo tài khoản riêng bằng email và mật khẩu riêng.',
          },
          {
            type: 'text',
            title: 'Ai mới là người bạn cần đề phòng?',
            paragraphs: [
              'Có một câu hỏi mà thầy Hoàng nhắc đi nhắc lại trên lớp, và giờ Minh mới thấy nó đúng: trước khi hỏi "làm sao cho an toàn", phải hỏi "an toàn trước ai".',
              'Với Minh, mối lo thực tế không phải là tin tặc chuyên nghiệp. Anh không có gì đáng để một nhóm chuyên nghiệp bỏ công.',
              'Mối lo thực tế của anh là ba thứ rất đời thường: kẻ lừa đảo qua điện thoại mua hồ sơ theo lô, một người quen cũ có ý xấu muốn tìm chỗ ở của anh, và một nhà tuyển dụng tra tên anh trước khi phỏng vấn.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao nên xác định "an toàn trước ai" trước khi chọn biện pháp bảo vệ?',
            options: [
              { id: 'a', text: 'Vì mọi người đều đối mặt với cùng một loại rủi ro', isCorrect: false },
              { id: 'b', text: 'Vì mỗi loại đối tượng có cách tiếp cận khác nhau, nên biện pháp hiệu quả với người này có thể vô dụng với người kia', isCorrect: true },
              { id: 'c', text: 'Vì luật yêu cầu phải khai báo trước khi bảo mật', isCorrect: false },
              { id: 'd', text: 'Vì chỉ người nổi tiếng mới cần bảo vệ dữ liệu', isCorrect: false },
            ],
            explanation:
              'Việc xác định rõ mình đề phòng ai gọi là dựng mô hình mối đe doạ. Chống lừa đảo qua điện thoại thì việc cần làm là giảm số nơi có số điện thoại của bạn. Chống một người quen có ý xấu thì việc cần làm là gỡ địa chỉ và ảnh có gắn vị trí. Hai việc khác hẳn nhau — làm nhầm thì tốn công mà không giảm được đúng rủi ro mình đang gặp.',
          },
          {
            type: 'text',
            title: 'Minh nộp bài',
            paragraphs: [
              'Tuần sau, Minh nộp bài tập cho thầy Hoàng: bảy trang hồ sơ, kèm ba trang phân tích, kèm một trang danh sách việc đã làm.',
              'Thầy đọc xong, ghi vào lề một câu ngắn: "Phần hay nhất là trang cuối. Nhiều em dừng lại ở chỗ hoảng sợ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Trong buổi trả bài, thầy Hoàng hỏi cả lớp một câu:',
              '"Các em thấy bài này để làm gì? Để các em sợ mạng Internet à?"',
              'Không ai trả lời. Thầy nói tiếp: "Không phải. Để các em biết mình đang trả giá bằng cái gì, rồi tự quyết có đáng hay không. Có những lúc rất đáng — bản đồ biết chỗ em đứng thì mới chỉ đường được. Có những lúc không đáng chút nào — cái đèn pin không cần biết danh bạ của em. Việc của người học ngành này là phân biệt được hai trường hợp đó."',
            ],
          },
          {
            type: 'text',
            title: 'Ba tháng sau',
            paragraphs: [
              'Minh thử lại bài tập cũ: tra chính mình trong ba mươi phút.',
              'Lần này anh viết được bốn trang thay vì bảy. Số điện thoại chính không còn hiện ra. Địa chỉ trọ không còn. CV cũng không.',
              'Nhưng tên, trường, khuôn mặt và mã số sinh viên thì vẫn còn đó, trên trang tin của khoa, ở nơi anh không có quyền chỉnh sửa.',
              'Anh ghi vào cuối bài: "Bốn trang. Không phải không còn gì. Chỉ là ít hơn, và phần còn lại thì tôi biết nó nằm ở đâu."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Danh sách dọn dẹp hồ sơ số',
            description: 'Các việc cụ thể xếp theo công sức bỏ ra, để làm được ngay chứ không chỉ để đọc.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '5 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Làm một lần, hiệu lực lâu dài',
                  paragraphs: [
                    'Bật xác thực hai lớp cho email chính, ưu tiên ứng dụng sinh mã hơn tin nhắn SMS.',
                    'Tắt gắn vị trí cho ứng dụng máy ảnh, để mọi ảnh chụp về sau không mang theo toạ độ.',
                    'Đổi quyền truy cập ảnh của các ứng dụng sang "chỉ ảnh được chọn".',
                    'Hạ quyền vị trí từ "Luôn luôn" xuống "Chỉ khi đang dùng" cho tất cả trừ bản đồ và gọi xe.',
                  ],
                },
                {
                  heading: 'Dọn trong một buổi',
                  paragraphs: [
                    'Tự tra tên mình trên công cụ tìm kiếm và ghi lại những gì hiện ra. Không sửa được thì ít nhất phải biết.',
                    'Gỡ ứng dụng không mở lần nào trong sáu tháng qua.',
                    'Tìm và xoá các bài đăng cũ có chứa số điện thoại, địa chỉ, ảnh giấy tờ, hoặc file CV.',
                    'Rời khỏi các nhóm công khai không còn dùng tới, đặc biệt là nhóm mua bán và nhóm tuyển dụng.',
                  ],
                },
                {
                  heading: 'Thói quen giữ về sau',
                  paragraphs: [
                    'Dùng một số điện thoại phụ và một địa chỉ email phụ cho các biểu mẫu khuyến mãi, tích điểm, mua bán online.',
                    'Tránh đăng nhập nhanh bằng tài khoản mạng xã hội với những dịch vụ quan trọng.',
                    'Trước khi điền một biểu mẫu, hỏi đúng một câu: chỗ này cần dữ liệu này để làm gì, và nếu không điền thì có bị chặn không.',
                    'Rà soát lại quyền ứng dụng mỗi sáu tháng, vì bản cập nhật có thể xin thêm quyền mới.',
                  ],
                },
              ],
              relatedConcepts: ['Quyền kiểm soát ngữ cảnh', 'Xác thực hai lớp', 'Tối thiểu hoá dữ liệu'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — quyền được biết, được xoá và rút lại sự đồng ý',
                'Luật An ninh mạng 2018 — bảo vệ thông tin cá nhân trên không gian mạng',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ "Tôi chẳng có gì để giấu" đánh tráo vấn đề: riêng tư là quyền kiểm soát ai biết gì về mình, không phải việc che giấu sai phạm.\n' +
              '✓ Một thông tin riêng tư hay không phụ thuộc vào ngữ cảnh — vi phạm thường xảy ra khi thông tin bị mang ra khỏi ngữ cảnh của nó.\n' +
              '✓ Mục tiêu thực tế là làm hồ sơ mỏng bớt và khó ghép hơn, chứ không phải biến mất hoàn toàn.\n' +
              '✓ Email chính là cánh cửa mở được mọi cánh cửa khác — bật xác thực hai lớp cho nó trước tiên.',
          },
          {
            type: 'text',
            title: 'Điều Minh mang theo',
            paragraphs: [
              'Minh không trở thành người sống ẩn danh. Anh vẫn dùng mạng xã hội, vẫn gọi xe, vẫn đặt đồ ăn.',
              'Thứ thay đổi là anh biết mình đang trả bằng gì, và anh chọn trả ở chỗ đáng trả.',
              'Đó cũng là điều khoá học này muốn để lại: không phải nỗi sợ, mà một câu hỏi bạn tự đặt ra trước mỗi lần bấm "Cho phép" — chỗ này cần thứ này để làm gì?',
            ],
          },
        ],
      },
    ],
  },
};
