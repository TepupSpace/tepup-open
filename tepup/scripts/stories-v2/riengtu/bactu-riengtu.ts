import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Bác Tư × Riêng Tư 101 — "Mã QR dán đè".
 *
 * Bác Tư buôn bán nhỏ, không dùng máy tính, và vẫn bị tấn công qua dữ liệu —
 * vì cửa hàng của bác là một điểm giao nhau giữa tiền mặt, chuyển khoản và
 * số điện thoại dán công khai. Chương cuối lật vai: bác cũng là người GIỮ dữ
 * liệu của người khác.
 */
export const BACTU_RIENGTU: StorySeed = {
  slug: 'bactu-riengtu',
  characterSlug: 'street-vendor',
  title: 'Mã QR dán đè',
  teaser:
    'Một buổi sáng, tấm bảng của bác Tư vẫn nguyên chỗ cũ. Chỉ có cái mã QR là khác. Ba ngày sau bác mới biết mình đã bán bánh mì cho một người lạ ở đâu đó.',
  icon: 'qr-code',
  estimatedTime: '~30 phút',
  sortOrder: 2,
  courseSlugs: [COURSE.riengtu],
  part: {
    name: 'Cái xe bánh mì và những người lạ',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'ma-qr-dan-de',
        title: 'Mã QR dán đè',
        blocks: [
          {
            type: 'text',
            title: 'Sáng thứ Năm',
            paragraphs: [
              'Bác Tư bán bánh mì ở góc đường này mười năm rồi. Xe đẩy, cái dù xanh bạc màu, và một tấm bảng nhỏ treo bên hông.',
              'Trên tấm bảng có ba thứ: giá bánh mì, số điện thoại của bác, và từ hai năm nay thêm một mã QR để khách chuyển khoản.',
              'Sáng thứ Năm, bác dựng xe như mọi hôm. Bảng vẫn ở đó, dù vẫn ở đó, mọi thứ y nguyên.',
            ],
          },
          {
            type: 'callout',
            icon: 'store',
            title: 'Một buổi sáng bình thường',
            variant: 'info',
            text: 'Từ 6 giờ tới 10 giờ, bác Tư bán được khoảng tám mươi ổ. Chừng một nửa khách trả tiền mặt, một nửa quét mã. Bác không kiểm tra điện thoại trong lúc bán — tay còn phải làm bánh.',
          },
          {
            type: 'question',
            question:
              'Bác Tư dán mã QR ngân hàng của mình ngoài đường suốt hai năm. Theo bạn, rủi ro lớn nhất của việc này là gì?',
            options: [
              { id: 'a', text: 'Người lạ biết được số dư tài khoản của bác', isCorrect: false },
              { id: 'b', text: 'Người lạ rút được tiền từ tài khoản qua mã QR', isCorrect: false },
              { id: 'c', text: 'Ai đó dán một mã QR khác đè lên, và tiền khách trả sẽ chảy vào tài khoản của họ', isCorrect: true },
              { id: 'd', text: 'Mã QR bị mờ thì khách không quét được', isCorrect: false },
            ],
            explanation:
              'Mã QR nhận tiền không cho phép ai rút tiền của bạn, và cũng không tiết lộ số dư. Rủi ro nằm ở chỗ khác và đơn giản hơn nhiều: một mã QR chỉ là một hình vuông đen trắng, mắt người không phân biệt được mã này với mã kia. Ai cũng in được một tờ giấy và dán đè lên.',
          },
          {
            type: 'text',
            title: 'Chị Hằng hỏi một câu',
            paragraphs: [
              'Gần trưa, chị Hằng bán trái cây kế bên ghé qua mua ổ bánh mì.',
              'Chị quét mã, chuyển tiền, rồi nhìn màn hình và hỏi: "Ủa anh Tư, sao tên tài khoản không phải tên anh?"',
              'Bác Tư ngẩng lên: "Hả? Tên gì?"',
              '"Nó hiện là NGUYEN VAN T gì đó, mà không phải anh."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư ghé vào nhìn màn hình điện thoại của chị Hằng. Đúng là một cái tên lạ.',
              'Bác quay lại nhìn tấm bảng của mình. Cái mã QR nằm đúng chỗ cũ, cùng kích thước, in trên giấy trắng, ép nhựa cẩn thận.',
              'Bác cạy thử một góc. Bên dưới là mã QR cũ của bác, vẫn còn nguyên.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Ba ngày, không ai nhận ra',
            variant: 'warning',
            text: 'Bác Tư đối chiếu lại: lần cuối bác kiểm tra tài khoản là tối Chủ nhật. Nghĩa là suốt thứ Hai, thứ Ba và thứ Tư, mọi khách quét mã đều chuyển tiền cho người khác. Bác không phát hiện ra vì bác không có thói quen kiểm tra từng giao dịch trong lúc bán.',
          },
          {
            type: 'question',
            question: 'Vì sao kiểu lừa đảo này lại hiệu quả đến vậy ngoài đường phố?',
            options: [
              { id: 'a', text: 'Vì hệ thống ngân hàng có lỗ hổng bảo mật', isCorrect: false },
              { id: 'b', text: 'Vì mã QR không thể đọc bằng mắt, và cả người bán lẫn người mua đều không có thói quen đối chiếu tên người nhận', isCorrect: true },
              { id: 'c', text: 'Vì người bán hàng rong không được ngân hàng bảo vệ', isCorrect: false },
              { id: 'd', text: 'Vì mã QR hết hạn sau một thời gian', isCorrect: false },
            ],
            explanation:
              'Không có lỗ hổng kỹ thuật nào ở đây. Hệ thống hoạt động đúng như thiết kế: nó chuyển tiền tới đúng tài khoản được mã hoá trong hình vuông. Lỗ hổng nằm ở con người — mắt ta không đọc được mã QR, và khoảnh khắc duy nhất để phát hiện sai là lúc màn hình hiện tên người nhận, đúng lúc ta đang vội nhất.',
          },
          {
            type: 'text',
            title: 'Khoảnh khắc một giây rưỡi',
            paragraphs: [
              'Có một màn hình mà mọi ứng dụng ngân hàng đều hiện ra trước khi tiền đi: màn hình xác nhận, có tên người nhận viết hoa.',
              'Đó là chốt chặn duy nhất. Và nó chỉ hoạt động nếu người ta đọc.',
              'Trung bình, người dùng nhìn màn hình đó khoảng một giây rưỡi trước khi bấm xác nhận — vừa đủ để thấy có chữ, không đủ để đọc chữ gì.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Chị Hằng phát hiện ra không phải vì chị cẩn thận hơn người khác.',
              'Chị phát hiện ra vì chị mua bánh mì của bác Tư mười năm, chị biết tên thật của bác. Với chị, cái tên lạ trên màn hình là một thứ sai chỗ.',
              'Với một khách vãng lai, cái tên đó chẳng nói lên điều gì — họ có bao giờ biết bác Tư tên đầy đủ là gì đâu.',
            ],
          },
          {
            type: 'sort-bucket',
            title: 'Trước khi bấm xác nhận, nhìn cái gì?',
            instruction:
              'Xếp từng thứ vào rổ đúng: cái nào thực sự giúp bạn phát hiện chuyển nhầm người, cái nào không giúp gì?',
            buckets: [
              { id: 'giup', label: 'Có giúp phát hiện' },
              { id: 'khong', label: 'Không giúp gì' },
            ],
            items: [
              { id: 'q1', text: 'Tên người nhận hiện trên màn hình xác nhận', bucketId: 'giup' },
              { id: 'q2', text: 'Bốn số cuối của tài khoản nhận', bucketId: 'giup' },
              { id: 'q3', text: 'Mã QR trông sắc nét, in đẹp, ép nhựa cẩn thận', bucketId: 'khong' },
              { id: 'q4', text: 'Mã QR nằm đúng vị trí quen thuộc trên bảng', bucketId: 'khong' },
              { id: 'q5', text: 'Ứng dụng báo chuyển tiền thành công', bucketId: 'khong' },
              { id: 'q6', text: 'Người bán xác nhận đã nhận được tiền', bucketId: 'giup' },
            ],
          },
          {
            type: 'text',
            title: 'Vì sao "in đẹp" lại không nói lên gì',
            paragraphs: [
              'Ba món nằm trong rổ "không giúp gì" đều là những thứ người ta hay dựa vào nhất, và đó chính là vấn đề.',
              'Một tờ giấy in màu, ép nhựa, cắt vuông vắn thì tốn chừng mười lăm nghìn đồng ở tiệm photo. Nó không chứng minh được gì về người đứng sau.',
              'Chữ "thành công" trên màn hình cũng vậy — nó chỉ có nghĩa là tiền đã đi tới đúng nơi mà mã QR chỉ định. Nó không có nghĩa là nơi đó đúng người.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Vật mang thông tin không phải là bằng chứng về nguồn gốc',
            variant: 'info',
            text: 'Một mã QR, một đường dẫn, một số điện thoại hiển thị trên màn hình — tất cả đều chỉ là vật trung gian. Chúng nói cho bạn biết dữ liệu sẽ đi đâu, chứ không nói ai đã đặt chúng ở đó. Mọi kiểu lừa đảo dạng này đều khai thác đúng khoảng cách ấy.',
          },
          {
            type: 'question',
            question: 'Cách nào sau đây giúp bác Tư phát hiện sớm nhất nếu chuyện tương tự lặp lại?',
            options: [
              { id: 'a', text: 'In mã QR to hơn cho khách dễ quét', isCorrect: false },
              { id: 'b', text: 'Bật thông báo biến động số dư và nghe tiếng báo sau mỗi lần khách quét', isCorrect: true },
              { id: 'c', text: 'Chỉ nhận tiền mặt, bỏ hẳn chuyển khoản', isCorrect: false },
              { id: 'd', text: 'Ghi tên mình thật to bên cạnh mã QR', isCorrect: false },
            ],
            explanation:
              'Thông báo biến động số dư biến việc kiểm tra thành phản xạ tức thời: không nghe thấy tiếng báo là biết ngay có chuyện, không cần đợi tới tối. Bỏ chuyển khoản thì mất khách. Ghi tên bên cạnh có ích một chút, nhưng khách vãng lai vẫn không biết tên đó có đúng hay không — nó chỉ giúp với khách quen.',
          },
          {
            type: 'text',
            title: 'Bác Tư thay đổi ba thứ',
            paragraphs: [
              'Chiều hôm đó, bác Tư nhờ đứa cháu ra tiệm điện thoại làm giúp ba việc.',
              '🔔 Bật thông báo biến động số dư, để mỗi lần có tiền vào là điện thoại kêu một tiếng.',
              '🖨️ In lại mã QR mới, và lần này in kèm tên bác ngay bên dưới, cùng một khổ giấy liền mạch — muốn dán đè thì phải che cả cái tên.',
              '🔒 Dán mã vào một khung nhựa có nắp, bắt vít vào thành xe thay vì dán lên bảng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ba việc này không làm cho việc dán đè trở thành bất khả thi. Kẻ xấu vẫn có thể tháo vít nếu thực sự muốn.',
              'Nhưng chúng làm cho việc đó khó hơn, mất thời gian hơn, và dễ bị nhìn thấy hơn. Và quan trọng nhất: nếu có xảy ra, bác biết trong vòng vài phút chứ không phải ba ngày.',
              '"Không có cách nào chắc trăm phần trăm đâu bác," đứa cháu nói. "Nhưng bác không cần chắc trăm phần trăm. Bác chỉ cần khó hơn cái xe bên kia đường."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Bác Tư mất bao nhiêu?',
            variant: 'warning',
            text: 'Ba ngày, ước chừng một trăm hai mươi giao dịch chuyển khoản, tổng cộng khoảng bốn triệu đồng. Bác trình báo công an phường. Việc truy tìm khó, vì tài khoản nhận tiền thường là tài khoản thuê hoặc mua lại của người khác — thứ được rao bán khá phổ biến.',
          },
          {
            type: 'text',
            title: 'Người ta lấy tài khoản ở đâu ra?',
            paragraphs: [
              'Đứa cháu giải thích thêm cho bác Tư một chuyện mà bác chưa từng nghe: cái tài khoản nhận tiền kia gần như chắc chắn không phải của kẻ dán mã.',
              'Có một thị trường mua bán tài khoản ngân hàng. Người ta trả vài trăm nghìn để một sinh viên, một công nhân, hay một người đang cần tiền mở tài khoản đứng tên mình rồi giao lại thẻ và mật khẩu.',
              'Người đứng tên thường nghĩ mình chỉ "cho mượn giấy tờ", không hại ai.',
            ],
          },
          {
            type: 'question',
            question: 'Người đứng tên mở tài khoản rồi bán lại cho người khác đối mặt với rủi ro gì?',
            options: [
              { id: 'a', text: 'Không rủi ro gì, vì họ không trực tiếp lừa ai', isCorrect: false },
              { id: 'b', text: 'Chỉ bị ngân hàng khoá tài khoản', isCorrect: false },
              { id: 'c', text: 'Họ đứng tên trên dòng tiền phạm pháp, nên là người đầu tiên cơ quan điều tra tìm tới và có thể bị xử lý hình sự', isCorrect: true },
              { id: 'd', text: 'Họ phải hoàn lại số tiền đã nhận khi bán tài khoản', isCorrect: false },
            ],
            explanation:
              'Khi lần theo dòng tiền, cơ quan điều tra tìm tới chủ tài khoản trước tiên — và người đó là người đứng tên, không phải kẻ thực sự dùng. Việc mua bán, cho thuê tài khoản thanh toán là hành vi bị pháp luật cấm và có thể bị xử lý hình sự. Vài trăm nghìn nhận được đổi lấy tên mình nằm trong một hồ sơ vụ án là cái giá rất chênh lệch.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'An toàn thanh toán cho người buôn bán nhỏ',
            description: 'Những việc rẻ tiền và làm được ngay để giữ tiền và giữ khách.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '3 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bảo vệ điểm nhận tiền',
                  paragraphs: [
                    'Bật thông báo biến động số dư và tập thói quen nghe tiếng báo sau mỗi lần khách quét.',
                    'In mã QR liền khối với tên chủ tài khoản, để không thể dán đè phần mã mà không che mất phần tên.',
                    'Gắn mã vào khung cứng có nắp, bắt vít vào thân xe hoặc quầy, thay vì dán giấy lên bảng.',
                    'Kiểm tra mã QR mỗi sáng khi dọn hàng — chỉ mất năm giây.',
                  ],
                },
                {
                  heading: 'Trước khi bấm xác nhận, với người trả tiền',
                  paragraphs: [
                    'Đọc tên người nhận trên màn hình xác nhận. Đây là chốt chặn duy nhất và nó chỉ hoạt động nếu bạn đọc.',
                    'Với khoản lớn, hỏi người bán bốn số cuối tài khoản và đối chiếu.',
                    'Chờ người bán xác nhận đã nhận được tiền trước khi rời đi.',
                  ],
                },
                {
                  heading: 'Khi phát hiện bị chuyển nhầm',
                  paragraphs: [
                    'Chụp lại màn hình giao dịch, giữ nguyên không xoá.',
                    'Báo ngay cho ngân hàng để yêu cầu tra soát; càng sớm càng có khả năng phong toả khoản tiền.',
                    'Trình báo công an phường kèm ảnh mã QR giả, giờ giấc và danh sách giao dịch.',
                  ],
                },
              ],
              relatedConcepts: ['Lừa đảo thanh toán', 'Xác thực nguồn gốc', 'Giảm thiểu thiệt hại'],
              furtherReading: [
                'Khuyến cáo của Ngân hàng Nhà nước về an toàn thanh toán qua mã QR',
                'Quy trình tra soát giao dịch chuyển tiền nhầm của các ngân hàng thương mại',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Mã QR không thể đọc bằng mắt — hình dáng, độ sắc nét hay vị trí quen thuộc đều không chứng minh được gì.\n' +
              '✓ Chốt chặn duy nhất là màn hình xác nhận hiện tên người nhận, và nó chỉ hoạt động nếu bạn thực sự đọc.\n' +
              '✓ Không cần an toàn tuyệt đối — chỉ cần khó hơn và dễ bị phát hiện hơn so với mục tiêu bên cạnh.\n' +
              '✓ Bật thông báo biến động số dư biến ba ngày không biết thành vài phút là biết.',
          },
          {
            type: 'text',
            title: 'Nhưng cái mã QR không phải thứ duy nhất trên tấm bảng',
            paragraphs: [
              'Tối hôm đó bác Tư ngồi nhìn tấm bảng của mình khá lâu.',
              'Bác đã lo xong cái mã QR. Nhưng ngay bên trên nó còn một dòng nữa, dòng mà bác dán ở đó suốt mười năm và chưa từng nghĩ tới:',
              'Số điện thoại của bác, in cỡ chữ to nhất trên bảng, cho cả con đường cùng đọc.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'so-dien-thoai-tren-bang',
        title: 'Số điện thoại trên tấm bảng',
        blocks: [
          {
            type: 'text',
            title: 'Dòng chữ to nhất trên bảng',
            paragraphs: [
              'Số điện thoại của bác Tư nằm trên tấm bảng từ ngày đầu bác mở hàng. Nó có lý do rất chính đáng.',
              'Khách công sở gọi đặt trước hai chục ổ cho cuộc họp. Người quen gọi dặn để phần. Chị bán trái cây bên cạnh gọi nhờ trông hàng lúc chạy đi chợ.',
              'Cái số ấy là công cụ làm ăn. Bác chưa từng nghĩ nó có mặt khác.',
            ],
          },
          {
            type: 'callout',
            icon: 'phone',
            title: 'Một tuần của cái số điện thoại',
            variant: 'info',
            text: 'Khoảng 15 cuộc gọi đặt hàng thật. Khoảng 30 tin nhắn quảng cáo. Sáu cuộc gọi mời vay tiền. Hai cuộc gọi mời mua đất. Và tuần vừa rồi, một cuộc gọi khiến bác suýt mất tài khoản.',
          },
          {
            type: 'question',
            question:
              'Số điện thoại dán công khai ngoài đường tạo ra rủi ro gì lớn hơn cả việc bị làm phiền?',
            options: [
              { id: 'a', text: 'Người khác có thể gọi nhầm', isCorrect: false },
              { id: 'b', text: 'Nó là điểm bắt đầu để kẻ xấu tiếp cận và thao túng chủ số, vì họ biết chắc số này thuộc về ai và người đó làm gì', isCorrect: true },
              { id: 'c', text: 'Nhà mạng sẽ tính thêm cước', isCorrect: false },
              { id: 'd', text: 'Số điện thoại sẽ bị khoá do quá nhiều cuộc gọi đến', isCorrect: false },
            ],
            explanation:
              'Một số điện thoại lấy từ danh sách mua bán thì chỉ là một dãy số vô danh. Một số điện thoại dán trên bảng hiệu thì đi kèm ngữ cảnh: đây là chủ một quán bánh mì, ở góc đường này, bán từ sáu giờ sáng. Ngữ cảnh ấy cho phép kẻ xấu dựng một kịch bản nghe rất thật — và kịch bản thật thì lừa được nhiều người hơn hẳn.',
          },
          {
            type: 'text',
            title: 'Cuộc gọi hôm thứ Ba',
            paragraphs: [
              'Chín giờ sáng thứ Ba, đúng lúc bác Tư đang đông khách nhất, điện thoại reo.',
              '"Dạ chào anh, bên em là công ty tổ chức sự kiện. Bên em muốn đặt hai trăm ổ bánh mì cho sáng thứ Bảy, giao tại quận 1 ạ. Anh làm được không?"',
              'Hai trăm ổ. Bằng hai ngày rưỡi doanh thu bình thường. Bác Tư bảo được.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Dạ vậy bên em chuyển cọc năm triệu cho anh nhé. Anh cho em số tài khoản."',
              'Bác đọc số tài khoản. Người kia nói tiếp, giọng vẫn rất nhã nhặn:',
              '"Dạ hệ thống bên em yêu cầu xác minh tài khoản người nhận trước khi chuyển khoản lớn. Em vừa gửi anh một mã sáu số, anh đọc giúp em để em hoàn tất ạ."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Mã sáu số vừa được gửi tới',
            variant: 'warning',
            text: 'Tin nhắn ghi rõ: "Ma OTP cua quy khach la 384712. Khong cung cap ma nay cho bat ky ai, ke ca nhan vien ngan hang."',
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư đang một tay kẹp điện thoại, một tay rưới nước sốt, phía trước còn bốn khách đứng đợi.',
              'Bác mở tin nhắn ra, nhìn thấy dãy số, và định đọc.',
              'Rồi bác dừng lại. Không phải vì bác nhớ ra bài học nào cả. Mà vì bác đọc được luôn cái dòng chữ ngay bên dưới: "Khong cung cap ma nay cho bat ky ai."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Cô ơi, cái mã này nó ghi là không được đưa cho ai hết," bác nói.',
              'Đầu dây bên kia đổi giọng ngay: "Dạ cái này là mã xác minh người bán thôi anh, khác mã ngân hàng ạ. Anh không đọc thì em không chuyển cọc được, mà em còn phải chốt với sếp trong mười lăm phút nữa."',
              'Bác Tư bảo: "Vậy thôi cô, tui không nhận đơn này." Rồi bác cúp máy, quay lại bán tiếp.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Mã OTP không bao giờ dùng để "nhận" tiền',
            variant: 'info',
            text: 'Mã OTP là mã xác nhận cho một lệnh phát ra TỪ tài khoản của bạn: chuyển tiền đi, đăng nhập, đổi thông tin. Không có bất kỳ thao tác nào cần bạn đọc mã để người khác chuyển tiền VÀO tài khoản bạn. Ai xin OTP với lý do "để chuyển tiền cho anh" thì đang thực hiện một lệnh rút tiền ra.',
          },
          {
            type: 'question',
            question: 'Yếu tố nào trong kịch bản trên là dấu hiệu nhận biết rõ nhất?',
            options: [
              { id: 'a', text: 'Đơn hàng quá lớn so với bình thường', isCorrect: false },
              { id: 'b', text: 'Người gọi nói giọng lịch sự', isCorrect: false },
              { id: 'c', text: 'Yêu cầu đọc mã OTP, kèm sức ép về thời gian', isCorrect: true },
              { id: 'd', text: 'Người gọi hỏi số tài khoản', isCorrect: false },
            ],
            explanation:
              'Đơn hàng lớn có thể là thật. Giọng lịch sự thì ai cũng có. Hỏi số tài khoản là chuyện bình thường khi chuyển tiền. Chỉ có một thứ không bao giờ chính đáng: yêu cầu đọc mã OTP. Và nó gần như luôn đi kèm sức ép thời gian, vì sức ép làm giảm khả năng suy nghĩ — đó là công cụ chính của mọi kịch bản lừa đảo, không riêng gì loại này.',
          },
          {
            type: 'text',
            title: 'Vì sao họ luôn gọi vào giờ bận',
            paragraphs: [
              'Bác Tư kể lại chuyện này cho đứa cháu. Đứa cháu hỏi một câu làm bác giật mình: "Họ gọi lúc mấy giờ hả bác?"',
              '"Chín giờ sáng, lúc đông nhất."',
              '"Không phải tình cờ đâu bác. Họ biết bác bán bánh mì. Bán bánh mì thì chín giờ sáng là lúc bận nhất."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là chỗ mà cái số điện thoại trên bảng hiệu khác hẳn một số điện thoại vô danh trong danh sách mua bán.',
              'Kẻ gọi biết bác làm nghề gì, nên biết giờ nào bác bận, biết đơn hàng cỡ nào là hấp dẫn, biết dùng ngôn ngữ nào cho hợp cảnh.',
              'Thông tin về nghề nghiệp không phải bí mật. Nhưng nó biến một cuộc gọi rác thành một cuộc tấn công được may đo.',
            ],
          },
          {
            type: 'text',
            title: 'Cái đơn hàng hai trăm ổ có thật không?',
            paragraphs: [
              'Bác Tư kể lại chuyện cho chị Hằng. Chị Hằng cười: "Anh biết vì sao họ đặt hai trăm ổ mà không đặt hai chục không?"',
              'Vì hai chục ổ thì bác Tư đủ tỉnh táo để hỏi han cho kỹ. Hai trăm ổ thì bác bận nghĩ tới chuyện làm sao kịp nướng, mua nguyên liệu ở đâu, nhờ ai phụ.',
              'Con số lớn không chỉ để dụ. Nó còn để chiếm chỗ trong đầu người ta, đẩy những câu hỏi cẩn trọng ra ngoài.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao kẻ lừa đảo thường đưa ra một cơ hội lớn bất thường thay vì một cơ hội vừa phải?',
            options: [
              { id: 'a', text: 'Vì cơ hội lớn thì lợi nhuận của họ cao hơn', isCorrect: false },
              { id: 'b', text: 'Vì phần thưởng lớn chiếm hết sự chú ý, đẩy các câu hỏi kiểm chứng ra khỏi đầu nạn nhân', isCorrect: true },
              { id: 'c', text: 'Vì cơ hội nhỏ thì không ai tin', isCorrect: false },
              { id: 'd', text: 'Vì họ muốn thử xem nạn nhân có đủ năng lực không', isCorrect: false },
            ],
            explanation:
              'Đây là cùng một cơ chế với sức ép thời gian, chỉ ngược dấu. Sức ép thời gian rút ngắn thời gian suy nghĩ; phần thưởng lớn thì chiếm chỗ của suy nghĩ. Cả hai đều nhằm đưa nạn nhân từ trạng thái cân nhắc sang trạng thái phản ứng. Một đề nghị đẹp bất thường xứng đáng được nghi ngờ nhiều hơn, chứ không phải ít hơn.',
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Sức ép thời gian là dấu hiệu, không phải hoàn cảnh',
            variant: 'warning',
            text: 'Mọi giao dịch chính đáng đều chịu được việc bạn gác máy, kiểm tra lại, rồi gọi lại sau mười phút. Nếu ai đó nói bạn phải quyết định ngay bây giờ nếu không sẽ mất cơ hội, thì bản thân câu nói đó đã là thông tin quan trọng nhất trong cả cuộc gọi.',
          },
          {
            type: 'text',
            title: 'Bác Tư giữ lại số điện thoại',
            paragraphs: [
              'Đứa cháu đề nghị gỡ số điện thoại xuống. Bác Tư không đồng ý.',
              '"Cái số đó là chỗ khách gọi đặt hàng. Gỡ xuống thì tui mất khách."',
              'Đây là điểm khác biệt lớn giữa bác Tư và Minh hay Hương: với người buôn bán, thông tin liên lạc công khai không phải sơ suất, mà là điều kiện để sống được.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Vậy nên bác chọn cách khác, và đây mới là cách phù hợp với hoàn cảnh của bác:',
              '📱 Giữ số trên bảng, nhưng đó là số dùng riêng cho việc bán hàng.',
              '🏦 Tài khoản ngân hàng và các dịch vụ quan trọng thì gắn với một số khác, số này không dán ở đâu cả.',
              '📝 Dán thêm một dòng nhỏ dưới số: "Chỉ nhận đặt hàng. Không giao dịch qua điện thoại."',
              '☎️ Với mọi cuộc gọi lạ đòi thao tác gấp: gác máy, hỏi lại người quen, rồi mới quyết.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Việc tách hai số điện thoại là thứ bác thấy có giá trị nhất.',
              'Số trên bảng là cửa trước — ai cũng gõ được, và bác chấp nhận điều đó vì nó mang khách tới.',
              'Số kia là cửa sau, chỉ ngân hàng và gia đình biết. Kẻ gọi tới cửa trước có nói gì thì cũng không chạm được tới cái gì quan trọng.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Khi số điện thoại là công cụ làm ăn',
            description: 'Cách giữ liên lạc công khai mà không biến nó thành cửa vào tài khoản của bạn.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '3 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Tách hai vai của số điện thoại',
                  paragraphs: [
                    'Số công khai: dán trên bảng hiệu, đăng trên trang bán hàng, đưa cho khách. Chấp nhận rằng ai cũng có thể gọi tới.',
                    'Số riêng: dùng để đăng ký tài khoản ngân hàng, ví điện tử, và các dịch vụ nhận mã xác thực. Không dán ở đâu, không đưa cho khách.',
                    'Việc tách này khiến mọi cuộc tấn công qua số công khai không chạm được tới tài khoản.',
                  ],
                },
                {
                  heading: 'Ba quy tắc về mã OTP',
                  paragraphs: [
                    'Mã OTP chỉ dùng để xác nhận lệnh phát ra từ tài khoản của bạn. Không có tình huống nào cần đọc mã để người khác chuyển tiền vào cho bạn.',
                    'Không đọc mã cho bất kỳ ai, kể cả người xưng là nhân viên ngân hàng hay cơ quan chức năng.',
                    'Nếu lỡ đọc, gọi ngay tổng đài ngân hàng để khoá tài khoản — càng sớm càng có khả năng chặn được lệnh chuyển.',
                  ],
                },
                {
                  heading: 'Dấu hiệu của một cuộc gọi được may đo',
                  paragraphs: [
                    'Người gọi biết nghề nghiệp, giờ làm việc hoặc địa điểm của bạn — dấu hiệu họ lấy thông tin từ nơi bạn công khai.',
                    'Sức ép thời gian: phải quyết ngay, chỉ còn mười lăm phút, sắp hết ưu đãi.',
                    'Yêu cầu một thao tác kỹ thuật mà bạn không hiểu rõ: đọc mã, bấm vào đường dẫn, cài một ứng dụng.',
                  ],
                },
              ],
              relatedConcepts: ['Tách danh tính', 'Mã xác thực một lần', 'Tấn công phi kỹ thuật'],
              furtherReading: [
                'Cảnh báo của Ngân hàng Nhà nước về các thủ đoạn lừa đảo chiếm đoạt tài khoản',
                'Nghị định 13/2023/NĐ-CP — bảo vệ dữ liệu cá nhân trong giao dịch điện tử',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Thông tin công khai về nghề nghiệp biến một cuộc gọi rác thành một kịch bản may đo, nghe rất thật.\n' +
              '✓ Mã OTP chỉ xác nhận lệnh phát ra TỪ tài khoản bạn — không ai cần nó để chuyển tiền VÀO cho bạn.\n' +
              '✓ Sức ép thời gian là dấu hiệu nhận biết, không phải hoàn cảnh: giao dịch thật luôn chịu được việc bạn gác máy.\n' +
              '✓ Với người buôn bán, giải pháp không phải là giấu số, mà là tách số công khai khỏi số gắn với tài khoản.',
          },
          {
            type: 'text',
            title: 'Lần tới thì họ không gọi tới nữa',
            paragraphs: [
              'Bác Tư yên tâm được vài tuần.',
              'Rồi một buổi chiều, có hai người mặc áo sơ mi tới trước xe bánh mì. Họ không gọi điện. Họ đứng ngay đó, và họ biết tên đầy đủ của bác.',
              'Họ nói họ ở cơ quan quản lý, và họ tới vì một chuyện liên quan tới giấy tờ kinh doanh của bác.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'hai-nguoi-mac-so-mi',
        title: 'Hai người mặc sơ mi',
        blocks: [
          {
            type: 'text',
            title: 'Bốn giờ chiều',
            paragraphs: [
              'Hai người đàn ông, sơ mi trắng, kẹp một tập hồ sơ. Một người mở tập hồ sơ ra, đọc:',
              '"Anh Trần Văn Tư, sinh năm 1968, hộ khẩu phường này, kinh doanh bánh mì tại địa chỉ này từ năm 2016, đúng không ạ?"',
              'Bác Tư gật đầu. Mọi thứ họ đọc đều đúng.',
            ],
          },
          {
            type: 'callout',
            icon: 'file-text',
            title: 'Những gì họ biết',
            variant: 'info',
            text: 'Họ tên đầy đủ. Năm sinh. Phường cư trú. Loại hình kinh doanh. Địa điểm. Thời gian bắt đầu buôn bán. Tất cả đều chính xác, và tất cả đều là thông tin có thể tìm được.',
          },
          {
            type: 'question',
            question:
              'Việc hai người lạ biết chính xác họ tên, năm sinh và thông tin kinh doanh của bác Tư chứng minh điều gì?',
            options: [
              { id: 'a', text: 'Chứng minh họ là cán bộ thật, vì chỉ cán bộ mới có dữ liệu này', isCorrect: false },
              { id: 'b', text: 'Không chứng minh được gì về thân phận họ — những thông tin đó đều lấy được từ nhiều nguồn', isCorrect: true },
              { id: 'c', text: 'Chứng minh hệ thống dữ liệu nhà nước đã bị tấn công', isCorrect: false },
              { id: 'd', text: 'Chứng minh bác Tư đã vi phạm quy định nào đó', isCorrect: false },
            ],
            explanation:
              'Đây là cái bẫy tâm lý trung tâm của mọi vụ mạo danh. Ta có xu hướng nghĩ: người này biết nhiều về mình như vậy thì chắc phải là người có thẩm quyền. Nhưng thông tin kinh doanh hộ cá thể nằm trong nhiều loại hồ sơ, danh bạ và dữ liệu mua bán. Biết thông tin về bạn không phải là bằng chứng về thẩm quyền của họ.',
          },
          {
            type: 'text',
            title: 'Câu chuyện họ kể',
            paragraphs: [
              'Người cầm hồ sơ nói: hộ kinh doanh của bác có sai sót trong hồ sơ kê khai, thuộc diện bị xử phạt hành chính. Mức phạt là mười hai triệu đồng.',
              '"Nhưng anh yên tâm, cái này xử lý được. Nếu anh nộp khắc phục trong hôm nay thì chỉ còn ba triệu, và không ghi vào hồ sơ. Để sang tuần thì đội kiểm tra xuống, lúc đó bọn em không giúp được."',
              'Người kia rút ra một tờ giấy có số tài khoản.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư thấy tim mình đập nhanh hơn.',
              'Mười hai triệu là số tiền lớn với bác. Ba triệu thì đau nhưng chịu được. Và cái ý "ghi vào hồ sơ" làm bác sợ nhất — bác buôn bán mười năm, chưa từng bị ghi gì.',
              'Đó chính xác là cảm giác mà kịch bản này được thiết kế để tạo ra.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Ba đòn bẩy tâm lý',
            variant: 'info',
            text: 'Sợ hãi: một hậu quả nặng được nêu ra trước. Nhẹ nhõm: một lối thoát rẻ hơn được đưa ra ngay sau. Gấp gáp: lối thoát chỉ có giá trị trong hôm nay. Ba thứ này đi liền nhau khiến người ta chuyển từ trạng thái suy nghĩ sang trạng thái phản ứng — và mọi kịch bản lừa đảo đều nhắm tới đúng sự chuyển đổi đó.',
          },
          {
            type: 'hot-cold-guess',
            title: 'Bạn đoán thử',
            question:
              'Theo thống kê được công bố, trong năm 2024 người dân Việt Nam bị thiệt hại khoảng bao nhiêu nghìn tỷ đồng vì lừa đảo trực tuyến?',
            answer: 18,
            unit: 'nghìn tỷ đồng',
            tolerance: 4,
            hints: [
              'Con số này được các cơ quan chức năng và hiệp hội an ninh mạng công bố hằng năm.',
              'Nó lớn hơn ngân sách của nhiều tỉnh trong một năm.',
              'Trung bình mỗi người trưởng thành ở Việt Nam mất khoảng vài trăm nghìn đồng.',
            ],
            context:
              'Con số này chỉ tính phần được báo cáo. Rất nhiều người bị lừa số tiền nhỏ thì không trình báo, vì ngại hoặc vì nghĩ không lấy lại được. Quy mô thật vì thế còn lớn hơn.',
          },
          {
            type: 'text',
            title: 'Chị Hằng lại là người cứu bác',
            paragraphs: [
              'Chị Hằng bán trái cây kế bên nghe được. Chị đi qua, hỏi tỉnh bơ:',
              '"Mấy anh ở phòng nào vậy? Cho tui coi thẻ với. Tui là tổ trưởng tổ dân phố đây."',
              'Chị không phải tổ trưởng tổ dân phố. Chị bịa.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hai người sơ mi nhìn nhau. Người cầm hồ sơ nói: "Dạ bọn em đi khảo sát thôi chị, để bọn em quay lại sau." Rồi họ đi.',
              'Không ai chạy. Không ai to tiếng. Họ chỉ đi, bình thản, như đã làm việc đó nhiều lần.',
              'Chị Hằng quay sang bác Tư: "Anh nhớ nghen. Cán bộ thật thì không bao giờ kêu anh chuyển tiền vô tài khoản cá nhân."',
            ],
          },
          {
            type: 'question',
            question: 'Dấu hiệu nào là dấu hiệu chắc chắn nhất của một vụ mạo danh cơ quan chức năng?',
            options: [
              { id: 'a', text: 'Người đến không mặc đồng phục', isCorrect: false },
              { id: 'b', text: 'Yêu cầu nộp tiền ngay vào một tài khoản, kèm lời hứa giảm nhẹ nếu nộp nhanh', isCorrect: true },
              { id: 'c', text: 'Họ biết nhiều thông tin về bạn', isCorrect: false },
              { id: 'd', text: 'Họ đến vào buổi chiều', isCorrect: false },
            ],
            explanation:
              'Quy trình xử phạt hành chính luôn có văn bản: biên bản vi phạm, quyết định xử phạt, và nộp phạt qua kho bạc hoặc ngân hàng theo quyết định đó — không có chuyện nộp tiền mặt hay chuyển khoản cá nhân để được giảm. Việc mặc gì, biết gì, đến lúc nào đều có thể dàn dựng. Chỉ có yêu cầu về dòng tiền là thứ không thể ngụy trang.',
          },
          {
            type: 'text',
            title: 'Vì sao bác Tư là mục tiêu tốt',
            paragraphs: [
              'Tối đó bác Tư ngồi nghĩ, và bác nhận ra mình có đủ mọi đặc điểm khiến mình thành mục tiêu ngon:',
              '📍 Địa điểm cố định, ai cũng biết chỗ tìm.',
              '📞 Số điện thoại và thông tin kinh doanh công khai.',
              '💵 Có tiền mặt và có tài khoản, giao dịch hằng ngày.',
              '📄 Buôn bán nhỏ, giấy tờ thường không đầy đủ tuyệt đối — nên luôn có chỗ để doạ.',
              '👤 Một mình, không có phòng pháp chế nào để hỏi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điểm cuối cùng là điểm quan trọng nhất, và cũng là điểm bác có thể thay đổi.',
              'Một công ty bị đòi mười hai triệu thì chuyển hồ sơ cho bộ phận pháp chế. Bác Tư thì chỉ có một mình, đứng giữa đường, với hai người mặc sơ mi và một cái tập hồ sơ.',
              'Thứ chị Hằng làm không phải là kiến thức pháp luật. Chị chỉ tạo ra một người thứ hai.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Người thứ hai là biện pháp phòng vệ rẻ nhất',
            variant: 'warning',
            text: 'Mọi kịch bản gây sức ép đều cần bạn ở một mình và quyết định ngay. Chỉ cần nói "để tôi gọi cho con tôi hỏi đã" hoặc "chờ tôi kêu người quen ra đây" là toàn bộ kịch bản mất tác dụng. Không cần bạn giỏi hơn họ — chỉ cần bạn không quyết một mình.',
          },
          {
            type: 'text',
            title: 'Vì sao họ không sợ bị bắt',
            paragraphs: [
              'Điều làm bác Tư băn khoăn nhất không phải là chuyện họ tới, mà là chuyện họ bỏ đi rất bình thản.',
              'Đứa cháu giải thích: hành vi của họ tính tới thời điểm đó chưa cấu thành gì rõ ràng. Họ chưa nhận tiền, chưa xuất trình giấy tờ giả, chưa nói câu nào khẳng định mình là cán bộ nhà nước — họ chỉ nói "bên em ở cơ quan quản lý".',
              'Kịch bản được viết để mỗi bước đều lùi lại được, cho tới đúng bước cuối cùng: lúc tiền được chuyển đi.',
            ],
          },
          {
            type: 'question',
            question: 'Điều này gợi ý cách phòng vệ nào là hiệu quả nhất?',
            options: [
              { id: 'a', text: 'Cố gắng giữ họ lại và gọi công an ngay lập tức', isCorrect: false },
              { id: 'b', text: 'Chặn ở đúng bước cuối — không chuyển tiền, không đọc mã — thay vì cố phân biệt thật giả ở các bước đầu', isCorrect: true },
              { id: 'c', text: 'Tranh luận với họ để chứng minh họ nói dối', isCorrect: false },
              { id: 'd', text: 'Không tiếp chuyện bất kỳ người lạ nào', isCorrect: false },
            ],
            explanation:
              'Ở các bước đầu, người thật và người giả trông giống hệt nhau — đó là điều kịch bản được thiết kế để đạt được, nên cố phân biệt ở đó là cuộc chiến bạn khó thắng. Nhưng bước cuối thì luôn lộ: mọi kịch bản đều phải kết thúc bằng việc bạn chuyển tiền hoặc giao một mã. Đặt phòng tuyến ở đúng chỗ đó thì bạn không cần phán đoán đúng về con người.',
          },
          {
            type: 'text',
            title: 'Ba câu bác Tư dán trong xe',
            paragraphs: [
              'Bác Tư nhờ đứa cháu viết ba câu ra một mảnh giấy, dán bên trong nắp thùng đựng tiền, chỗ chỉ bác nhìn thấy:',
              '1️⃣ Không đọc mã sáu số cho ai hết.',
              '2️⃣ Không chuyển tiền cho ai trong ngày hôm đó. Cái gì gấp quá thì là giả.',
              '3️⃣ Gọi cho con hoặc kêu chị Hằng ra trước khi quyết.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ba câu này không có gì cao siêu. Chúng cũng không bảo vệ bác khỏi mọi thứ.',
              'Nhưng chúng nhắm đúng vào cơ chế mà mọi kịch bản lừa đảo phải dùng: bắt người ta quyết định nhanh và quyết định một mình.',
              'Cắt được cơ chế đó thì phần lớn kịch bản không chạy được nữa, bất kể nội dung câu chuyện họ kể là gì.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Nhận diện mạo danh cơ quan chức năng',
            description: 'Những gì có thể dàn dựng, những gì không, và cách xử lý tại chỗ.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Những thứ KHÔNG chứng minh được thẩm quyền',
                  paragraphs: [
                    'Biết họ tên, năm sinh, địa chỉ, thông tin kinh doanh của bạn — những dữ liệu này có mặt ở nhiều nguồn và được mua bán.',
                    'Trang phục, tập hồ sơ, giấy tờ in màu, con dấu — đều làm giả được.',
                    'Cách nói chuyện tự tin, dùng đúng thuật ngữ chuyên ngành — đây là phần được luyện tập kỹ nhất trong mọi kịch bản.',
                  ],
                },
                {
                  heading: 'Những dấu hiệu gần như chắc chắn là giả',
                  paragraphs: [
                    'Yêu cầu nộp tiền ngay vào tài khoản cá nhân, hoặc nộp tiền mặt tại chỗ.',
                    'Hứa giảm mức phạt hoặc không ghi vào hồ sơ nếu nộp nhanh.',
                    'Không lập biên bản, không để lại quyết định bằng văn bản.',
                    'Gây sức ép về thời gian và ngăn bạn hỏi ý kiến người khác.',
                  ],
                },
                {
                  heading: 'Xử lý tại chỗ',
                  paragraphs: [
                    'Yêu cầu xuất trình thẻ ngành và ghi lại họ tên, đơn vị công tác. Người thật sẽ không ngại việc này.',
                    'Nói rõ bạn sẽ liên hệ trực tiếp cơ quan để xác minh trước khi làm bất cứ điều gì.',
                    'Gọi người thân hoặc hàng xóm ra cùng. Sự có mặt của người thứ hai làm hỏng mọi kịch bản gây sức ép.',
                    'Nếu họ rời đi vội, ghi lại đặc điểm nhận dạng và báo công an phường — họ sẽ tìm tới người khác trong khu vực.',
                  ],
                },
              ],
              relatedConcepts: ['Tấn công phi kỹ thuật', 'Đòn bẩy tâm lý', 'Xác minh độc lập'],
              furtherReading: [
                'Luật Xử lý vi phạm hành chính — trình tự lập biên bản và nộp phạt',
                'Cảnh báo của Bộ Công an về thủ đoạn giả danh cán bộ cơ quan nhà nước',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Biết nhiều thông tin về bạn không chứng minh được thẩm quyền — dữ liệu đó lấy được từ nhiều nguồn.\n' +
              '✓ Kịch bản gây sức ép luôn dùng ba đòn bẩy: sợ hãi, rồi nhẹ nhõm, rồi gấp gáp.\n' +
              '✓ Dấu hiệu không thể ngụy trang là dòng tiền: nộp ngay vào tài khoản cá nhân, hứa giảm nếu nộp nhanh.\n' +
              '✓ Biện pháp phòng vệ rẻ nhất là không quyết định một mình — chỉ cần có người thứ hai là kịch bản hỏng.',
          },
          {
            type: 'text',
            title: 'Rồi bác Tư nhìn xuống cuốn sổ của mình',
            paragraphs: [
              'Suốt hai tháng, bác Tư học được khá nhiều về việc dữ liệu của mình bị người khác dùng ra sao.',
              'Rồi một tối dọn hàng, bác cầm lên cuốn sổ tay nhỏ để bên hộp tiền — cuốn sổ bác dùng mười năm nay để ghi số điện thoại khách đặt hàng.',
              'Trong đó có gần bốn trăm số điện thoại, kèm tên, kèm ghi chú: "cô Lan lầu 3 - không hành", "chú Ba xe ôm - đặt 6h sáng thứ Hai".',
              'Lần đầu tiên bác nghĩ tới một câu hỏi khác hẳn: cuốn sổ này là dữ liệu của ai?',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'cuon-so-bon-tram-so',
        title: 'Cuốn sổ bốn trăm số',
        blocks: [
          {
            type: 'text',
            title: 'Cuốn sổ mười năm',
            paragraphs: [
              'Cuốn sổ tay của bác Tư là loại sổ học sinh, bìa xanh, giấy đã ố vàng ở những trang đầu.',
              'Trang đầu tiên ghi ngày tháng năm 2016. Trang cuối cùng có mực còn ướt.',
              'Bên trong là gần bốn trăm dòng, mỗi dòng một khách: tên, số điện thoại, và một ghi chú nhỏ để bác nhớ.',
            ],
          },
          {
            type: 'callout',
            icon: 'notebook',
            title: 'Vài dòng trong cuốn sổ',
            variant: 'info',
            text: '"Cô Lan lầu 3 chung cư — không hành, không ớt". "Chú Ba xe ôm — 6h sáng thứ Hai, 3 ổ". "Chị Yến bầu — sáng nào cũng 1 ổ pate, đang nghỉ sinh". "Anh Dũng công ty XYZ — đặt họp, hoá đơn ghi tên công ty".',
          },
          {
            type: 'question',
            question:
              'Theo bạn, cuốn sổ giấy này của bác Tư có phải là "dữ liệu cá nhân cần được bảo vệ" không?',
            options: [
              { id: 'a', text: 'Không, vì nó viết tay trên giấy chứ không nằm trong máy tính', isCorrect: false },
              { id: 'b', text: 'Không, vì bác Tư chỉ là người bán hàng rong, không phải doanh nghiệp', isCorrect: false },
              { id: 'c', text: 'Có — đây là dữ liệu cá nhân của gần bốn trăm người, và bác Tư đang là người giữ nó', isCorrect: true },
              { id: 'd', text: 'Có, nhưng chỉ với những khách là nhân viên công ty', isCorrect: false },
            ],
            explanation:
              'Dữ liệu cá nhân không được định nghĩa theo phương tiện lưu trữ hay quy mô người giữ. Một cuốn sổ giấy chứa tên và số điện thoại của bốn trăm người là một tập dữ liệu cá nhân, y như một tệp bảng tính. Và người đang giữ nó — dù là tập đoàn hay người bán bánh mì — đều đang ở vai người chịu trách nhiệm với dữ liệu đó.',
          },
          {
            type: 'text',
            title: 'Bác Tư đổi vai',
            paragraphs: [
              'Suốt hai tháng, bác Tư ở vai người bị lấy dữ liệu: mã QR bị dán đè, số điện thoại bị dùng để dựng kịch bản, thông tin kinh doanh bị đọc vanh vách.',
              'Cuốn sổ đặt bác vào vai ngược lại.',
              'Cô Lan lầu 3 đưa số điện thoại cho bác để đặt bánh mì. Cô ấy không đưa nó cho ai khác. Nếu cuốn sổ này rơi vào tay người mặc sơ mi hôm nọ, thì bốn trăm người sẽ ở đúng chỗ mà bác từng ở.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Và cuốn sổ này còn nguy hiểm hơn một danh sách số điện thoại thông thường, vì nó có ghi chú.',
              '"Chị Yến bầu, đang nghỉ sinh" là thông tin về tình trạng sức khoẻ và lịch sinh hoạt.',
              '"Chú Ba xe ôm, 6h sáng thứ Hai" là thông tin về nghề nghiệp và thói quen theo giờ.',
              '"Cô Lan lầu 3" là địa chỉ.',
              'Bác Tư viết những dòng đó để phục vụ khách tốt hơn. Nhưng chúng cũng chính là loại chi tiết khiến một kịch bản lừa đảo nghe rất thật.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Ai cũng có lúc ở vai người giữ dữ liệu',
            variant: 'info',
            text: 'Người bán hàng giữ số điện thoại khách. Người quản trị nhóm giữ danh sách thành viên. Ban phụ huynh giữ thông tin học sinh. Trưởng nhóm giữ ảnh chụp căn cước của cả nhóm để đặt vé. Trong những lúc ấy, quyền riêng tư không còn là thứ bạn đòi hỏi từ người khác — nó là thứ người khác đang trông cậy ở bạn.',
          },
          {
            type: 'question',
            question: 'Khi bạn giữ dữ liệu của người khác, nghĩa vụ cơ bản nhất là gì?',
            options: [
              { id: 'a', text: 'Lưu trữ càng đầy đủ càng tốt để phục vụ tốt hơn', isCorrect: false },
              { id: 'b', text: 'Chỉ giữ thứ cần cho mục đích đã nói, giữ trong thời gian cần, và không dùng vào việc khác', isCorrect: true },
              { id: 'c', text: 'Mã hoá toàn bộ dữ liệu bằng phần mềm chuyên dụng', isCorrect: false },
              { id: 'd', text: 'Xin phép lại mỗi lần sử dụng', isCorrect: false },
            ],
            explanation:
              'Ba nguyên tắc cốt lõi là: tối thiểu hoá (chỉ thu thứ cần), giới hạn thời gian (không giữ mãi), và giới hạn mục đích (không dùng vào việc khác với việc đã nói). Mã hoá là biện pháp kỹ thuật hữu ích nhưng không thay được ba nguyên tắc trên — mã hoá một kho dữ liệu mà lẽ ra không nên tồn tại thì vẫn là giữ một rủi ro không cần thiết.',
          },
          {
            type: 'text',
            title: 'Bác Tư mở lại cuốn sổ',
            paragraphs: [
              'Tối đó bác ngồi lật từng trang, và bác thấy một điều: phần lớn những dòng trong sổ đã chết từ lâu.',
              'Có khách chuyển nhà từ năm 2018. Có công ty đã dời văn phòng. Có người không còn mua nữa. Có cả hai dòng mà bác biết chắc là người đã mất.',
              'Trong gần bốn trăm số, số khách còn đặt hàng trong nửa năm qua chỉ khoảng sáu chục.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác giữ cả bốn trăm dòng ấy không vì lý do gì cả. Bác giữ vì bác chưa bao giờ nghĩ tới việc bỏ đi.',
              'Đây chính là điều xảy ra ở mọi quy mô: dữ liệu tích lại theo thời gian, không ai ra quyết định giữ chúng, và cũng không ai ra quyết định bỏ chúng.',
              'Nhưng rủi ro thì không quan tâm chuyện đó. Ba trăm bốn mươi dòng vô dụng vẫn là ba trăm bốn mươi người có thể bị ảnh hưởng nếu cuốn sổ rơi vào tay ai đó.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Dữ liệu không dùng tới vẫn là dữ liệu có thể bị mất',
            variant: 'warning',
            text: 'Kho dữ liệu càng đầy thì thiệt hại khi rò rỉ càng lớn, trong khi giá trị sử dụng thì không tăng theo. Cách giảm rủi ro rẻ nhất và triệt để nhất không phải là bảo vệ tốt hơn, mà là giữ ít hơn. Thứ bạn đã xoá thì không ai lấy được nữa.',
          },
          {
            type: 'text',
            title: 'Đứa cháu đề nghị số hoá',
            paragraphs: [
              'Đứa cháu bảo: "Bác chụp hết cuốn sổ này lưu vô điện thoại đi, mất sổ thì còn."',
              'Bác Tư suy nghĩ một lúc rồi lắc đầu.',
              '"Chụp vô điện thoại thì nó lên mạng. Điện thoại mất thì cả bốn trăm số lên mạng luôn. Cuốn sổ này mất thì nó nằm ở đâu đó ngoài đường, chứ nó không đi khắp thế giới được."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu trả lời của bác Tư nghe có vẻ như của một người không rành công nghệ. Thật ra nó chạm đúng một nguyên tắc quan trọng.',
              'Dữ liệu trên giấy có một tính chất mà dữ liệu số không có: nó không nhân bản được. Mất cuốn sổ là mất một bản, và bản đó nằm ở một chỗ vật lý.',
              'Dữ liệu số thì sao chép tức thì, không giới hạn, và một khi đã ra ngoài thì không có cách nào thu hồi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều này không có nghĩa là giấy luôn tốt hơn. Giấy dễ mất, dễ cháy, dễ bị người đi ngang đọc trộm.',
              'Nhưng nó cho thấy một chuyện đáng nghĩ: khi ta số hoá thứ gì đó, ta không chỉ làm nó tiện hơn. Ta còn thay đổi hoàn toàn hình dạng của rủi ro — từ một rủi ro có giới hạn thành một rủi ro không có giới hạn.',
            ],
          },
          {
            type: 'question',
            question: 'Khác biệt cơ bản nhất giữa rủi ro của dữ liệu trên giấy và dữ liệu số là gì?',
            options: [
              { id: 'a', text: 'Dữ liệu số dễ bị hỏng hơn', isCorrect: false },
              { id: 'b', text: 'Dữ liệu số sao chép được vô hạn và tức thì, nên một lần rò rỉ có thể lan ra không giới hạn', isCorrect: true },
              { id: 'c', text: 'Dữ liệu trên giấy không được pháp luật bảo vệ', isCorrect: false },
              { id: 'd', text: 'Dữ liệu số luôn được mã hoá nên an toàn hơn', isCorrect: false },
            ],
            explanation:
              'Mất một cuốn sổ là mất một bản, ở một chỗ. Rò rỉ một tệp là tạo ra vô số bản, ở vô số chỗ, trong vài giây, và không thu hồi được. Đây là lý do việc số hoá một tập dữ liệu cá nhân cần đi kèm với suy nghĩ về việc ai truy cập được, sao lưu ở đâu, và giữ trong bao lâu — chứ không chỉ là "chụp lại cho khỏi mất".',
          },
          {
            type: 'text',
            title: 'Bác Tư làm ba việc',
            paragraphs: [
              'Cuối cùng bác Tư quyết định như thế này.',
              '✂️ Bác chép lại sáu chục khách còn hoạt động sang một cuốn sổ mới, và bỏ cuốn sổ cũ đi — không vứt vào thùng rác mà xé nhỏ rồi đốt cùng giấy vàng mã.',
              '📝 Trong cuốn sổ mới, bác chỉ ghi tên, số điện thoại và yêu cầu về món ăn. Bác bỏ hết những ghi chú về hoàn cảnh cá nhân của khách.',
              '🔒 Cuốn sổ mới không để hớ hênh trên xe nữa, mà cất trong ngăn có khoá cùng chỗ với hộp tiền.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Việc bỏ những ghi chú về hoàn cảnh cá nhân là việc bác tiếc nhất, vì chúng giúp bác phục vụ khách chu đáo hơn.',
              'Nhưng bác nghĩ tới chị Yến. Nếu có ai đó gọi cho chị Yến và nói đúng rằng chị đang nghỉ sinh, chị sẽ tin người đó tới đâu?',
              'Chi tiết ấy giúp bác bán được thêm ổ bánh mì. Nó cũng có thể giúp một người lạ lấy được tiền của chị Yến. Bác chọn bỏ nó đi.',
            ],
          },
          {
            type: 'text',
            title: 'Bác Tư hỏi khách một câu',
            paragraphs: [
              'Sáng hôm sau, cô Lan lầu 3 tới mua bánh mì. Bác Tư hỏi cô một câu mà mười năm nay bác chưa từng hỏi:',
              '"Cô Lan nè, tui có ghi số điện thoại của cô trong sổ để nhớ đơn. Cô thấy vậy có được không?"',
              'Cô Lan cười: "Trời, anh Tư hỏi gì kỳ vậy. Được chứ. Tui đưa cho anh mà."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu hỏi ấy nghe có vẻ thừa. Nhưng nó là thứ mà cả Minh và Hương đều không nhận được từ những nơi giữ dữ liệu của họ.',
              'Bác Tư hỏi vì bác vừa trải qua chuyện bị người khác dùng dữ liệu của mình mà không hỏi lấy một câu. Và bác nhớ cảm giác đó.',
              'Đó có lẽ là cách hiệu quả nhất để một người biết mình nên đối xử với dữ liệu của người khác thế nào: đã từng ở phía bên kia.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Khi bạn là người giữ dữ liệu của người khác',
            description: 'Ba nguyên tắc và một danh sách việc làm, áp dụng được cho cả cuốn sổ giấy lẫn tệp bảng tính.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba nguyên tắc',
                  paragraphs: [
                    'Tối thiểu hoá: chỉ ghi thứ thực sự cần cho việc bạn đang làm. Ghi chú về hoàn cảnh cá nhân của người khác gần như luôn là thứ có thể bỏ.',
                    'Giới hạn thời gian: rà lại định kỳ và xoá những gì không còn dùng. Dữ liệu chết vẫn là rủi ro sống.',
                    'Giới hạn mục đích: dữ liệu người ta đưa để đặt hàng thì chỉ dùng để đặt hàng — không dùng để gửi quảng cáo, không đưa cho người khác.',
                  ],
                },
                {
                  heading: 'Việc cần làm nếu bạn đang giữ một danh sách',
                  paragraphs: [
                    'Đếm xem trong danh sách có bao nhiêu mục còn dùng tới trong sáu tháng qua. Phần còn lại thường là phần lớn.',
                    'Bỏ các cột thông tin không phục vụ mục đích chính, đặc biệt là những gì liên quan tới sức khoẻ, gia cảnh, tài chính.',
                    'Cất giữ có kiểm soát: sổ giấy thì để nơi có khoá; tệp trên máy thì đặt mật khẩu và không để trong thư mục chia sẻ chung.',
                    'Khi bỏ đi, huỷ hẳn — xé nhỏ hoặc đốt với giấy, xoá cả bản sao lưu với tệp số.',
                  ],
                },
                {
                  heading: 'Trước khi số hoá một danh sách giấy',
                  paragraphs: [
                    'Hỏi ba câu: ai sẽ truy cập được, bản sao lưu nằm ở đâu, và giữ trong bao lâu.',
                    'Nhớ rằng số hoá làm thay đổi hình dạng rủi ro: từ một bản ở một chỗ thành vô số bản ở vô số chỗ nếu rò rỉ.',
                    'Nếu vẫn số hoá, hãy số hoá bản đã được rút gọn, không phải bản đầy đủ.',
                  ],
                },
              ],
              relatedConcepts: ['Tối thiểu hoá dữ liệu', 'Giới hạn mục đích', 'Vòng đời dữ liệu'],
              furtherReading: [
                'Nghị định 13/2023/NĐ-CP — nghĩa vụ của bên kiểm soát dữ liệu cá nhân',
                'Hướng dẫn về lưu trữ và huỷ dữ liệu cá nhân đúng cách',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Dữ liệu cá nhân không được định nghĩa theo phương tiện — một cuốn sổ giấy cũng là một tập dữ liệu cá nhân.\n' +
              '✓ Ai cũng có lúc ở vai người giữ dữ liệu của người khác, và khi đó riêng tư là thứ người khác trông cậy ở bạn.\n' +
              '✓ Ba nguyên tắc: chỉ giữ thứ cần, chỉ giữ trong thời gian cần, chỉ dùng đúng mục đích đã nói.\n' +
              '✓ Cách giảm rủi ro triệt để nhất không phải bảo vệ tốt hơn mà là giữ ít hơn — thứ đã xoá thì không ai lấy được.',
          },
          {
            type: 'text',
            title: 'Điều bác Tư mang theo',
            paragraphs: [
              'Bác Tư vẫn bán bánh mì ở góc đường đó. Tấm bảng vẫn có số điện thoại, vẫn có mã QR — giờ nằm trong khung nhựa bắt vít.',
              'Thứ thay đổi không phải là bác trở nên đa nghi. Bác vẫn để dành phần cho khách quen, vẫn cho chị Hằng gửi hàng.',
              'Thứ thay đổi là bác biết mình đứng ở hai đầu của cùng một chuyện: có người muốn lấy dữ liệu của bác, và có bốn trăm người đã tin tưởng giao dữ liệu của họ cho bác.',
              '"Cái gì mình không muốn người ta làm với mình," bác nói với đứa cháu, "thì mình đừng làm với cuốn sổ của mình."',
            ],
          },
        ],
      },
    ],
  },
};
