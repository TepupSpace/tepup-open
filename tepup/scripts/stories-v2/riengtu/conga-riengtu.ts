import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Cô Nga × Riêng Tư 101 — "Ảnh con trên tường nhà".
 *
 * Bốn nhân vật kia lo về dữ liệu CỦA MÌNH. Cô Nga là người đăng dữ liệu của
 * NGƯỜI KHÁC — con mình và con người khác — với động cơ hoàn toàn trong sáng.
 * Đó là chỗ khó nhất của quyền riêng tư và là lý do cô có mặt trong khoá này.
 */
export const CONGA_RIENGTU: StorySeed = {
  slug: 'conga-riengtu',
  characterSlug: 'homemaker',
  title: 'Ảnh con trên tường nhà',
  teaser:
    'Cô Nga đăng ảnh hai đứa con mỗi ngày, suốt tám năm. Một hôm có người lạ nhắn tin, gọi đúng tên con gái cô, biết cả tên trường và giờ tan học.',
  icon: 'image',
  estimatedTime: '~30 phút',
  sortOrder: 4,
  courseSlugs: [COURSE.riengtu],
  part: {
    name: 'Những gì cô Nga đăng lên',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'tam-nam-va-mot-nghin-tam-anh',
        title: 'Tám năm và một nghìn tấm ảnh',
        blocks: [
          {
            type: 'text',
            title: 'Tin nhắn lúc bốn giờ chiều',
            paragraphs: [
              'Cô Nga đang nấu cơm thì điện thoại báo có tin nhắn từ một tài khoản lạ. Ảnh đại diện là một bông hoa, không có bài đăng nào.',
              '"Chào chị. Bé Bảo Ngọc nhà mình học lớp 5A2 trường Nguyễn Du đúng không chị? Bé xinh quá."',
              'Cô Nga đứng sững giữa bếp.',
            ],
          },
          {
            type: 'callout',
            icon: 'alert-circle',
            title: 'Người lạ này biết',
            variant: 'info',
            text: 'Tên đầy đủ của con gái cô. Tên trường. Lớp. Và qua ảnh đại diện của cô Nga, họ biết mặt cả hai mẹ con. Cô Nga chưa từng nhắn tin với người này bao giờ.',
          },
          {
            type: 'question',
            question:
              'Người lạ này lấy được những thông tin đó ở đâu, nếu tài khoản của cô Nga để chế độ bạn bè?',
            options: [
              { id: 'a', text: 'Họ đã đột nhập vào tài khoản của cô Nga', isCorrect: false },
              { id: 'b', text: 'Nhà trường công bố danh sách học sinh', isCorrect: false },
              { id: 'c', text: 'Từ chính những gì cô Nga đăng công khai qua nhiều năm và những nhóm cô tham gia', isCorrect: true },
              { id: 'd', text: 'Từ dữ liệu rò rỉ của ngành giáo dục', isCorrect: false },
            ],
            explanation:
              'Không cần đột nhập gì cả. Chế độ "bạn bè" áp dụng cho từng bài đăng riêng lẻ, và trong tám năm sẽ luôn có những bài để công khai — ảnh khai giảng, bài khoe con đạt giải, bài hỏi kinh nghiệm trong một nhóm mở. Chỉ cần vài bài như vậy là đủ ghép ra tên, trường, lớp và khuôn mặt.',
          },
          {
            type: 'text',
            title: 'Cô Nga đếm lại',
            paragraphs: [
              'Tối đó cô Nga ngồi cuộn lại trang cá nhân của mình từ đầu.',
              'Con gái lớn sinh năm 2015. Tấm ảnh đầu tiên cô đăng là ảnh siêu âm, kèm dòng "Chào con yêu của mẹ".',
              'Từ đó tới nay, gần một nghìn tấm ảnh có mặt hai đứa nhỏ. Cô đăng vì vui, vì tự hào, vì muốn ông bà ở quê nhìn thấy cháu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng khi cuộn lại với con mắt của người lạ, cô thấy một thứ khác hẳn:',
              '🏫 Ảnh khai giảng, thấy rõ biển tên trường và bảng tên lớp.',
              '🎂 Ảnh sinh nhật hằng năm, có số nến — nên biết chính xác ngày sinh.',
              '👗 Ảnh mặc đồng phục, nên nhận ra được ở ngoài đường.',
              '📍 Ảnh check-in ở quán ăn gần nhà, lặp lại mỗi cuối tuần.',
              '🏊 Ảnh học bơi chiều thứ Ba, học vẽ chiều thứ Năm — đăng đều đặn nên thành một thời khoá biểu.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Sharenting',
            variant: 'info',
            text: 'Là việc cha mẹ chia sẻ hình ảnh và thông tin về con cái lên mạng xã hội. Động cơ gần như luôn trong sáng — yêu con, tự hào, muốn giữ kỷ niệm, muốn người thân ở xa nhìn thấy. Nhưng người đăng là cha mẹ, còn người mang hậu quả suốt đời lại là đứa trẻ, và đứa trẻ chưa bao giờ được hỏi.',
          },
          {
            type: 'question',
            question: 'Điều gì khiến sharenting khác với việc bạn tự đăng ảnh của chính mình?',
            options: [
              { id: 'a', text: 'Ảnh trẻ em có chất lượng cao hơn nên dễ bị lạm dụng', isCorrect: false },
              { id: 'b', text: 'Người quyết định đăng và người gánh hậu quả là hai người khác nhau, và người gánh hậu quả chưa thể đồng ý', isCorrect: true },
              { id: 'c', text: 'Mạng xã hội lưu ảnh trẻ em lâu hơn', isCorrect: false },
              { id: 'd', text: 'Không có gì khác biệt về bản chất', isCorrect: false },
            ],
            explanation:
              'Khi bạn đăng ảnh của mình, bạn chấp nhận rủi ro cho chính bạn — đó là quyền của bạn. Khi bạn đăng ảnh con, bạn đang quyết định thay cho một người sẽ sống với hồ sơ số ấy suốt đời, và người đó chưa đủ tuổi để đồng ý hay từ chối. Đứa trẻ ba tuổi hôm nay sẽ là người hai mươi ba tuổi đi xin việc, với một dấu vết số bắt đầu từ trước khi nó biết nói.',
          },
          {
            type: 'text',
            title: 'Chồng cô Nga không thấy vấn đề',
            paragraphs: [
              'Cô kể chuyện tin nhắn cho chồng. Anh bảo: "Thì nó khen con mình xinh chứ có gì đâu. Em lo xa quá."',
              'Cô Nga không cãi. Nhưng cô hỏi lại một câu:',
              '"Anh có biết chiều thứ Ba con Ngọc mấy giờ tan lớp bơi không?"',
              'Chồng cô nghĩ một lúc rồi lắc đầu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Em cũng phải nghĩ mới nhớ," cô nói. "Mà cái người nhắn tin đó, nó chỉ cần cuộn trang của em ba phút là biết."',
              'Đây là chỗ trực giác của phần lớn phụ huynh bị sai.',
              'Ta đánh giá rủi ro theo từng tấm ảnh: một tấm ảnh con cười thì có gì nguy hiểm? Nhưng rủi ro không nằm ở một tấm. Nó nằm ở việc một nghìn tấm, xếp theo thời gian, tạo thành một hồ sơ đầy đủ về một đứa trẻ.',
            ],
          },
          {
            type: 'sort-bucket',
            title: 'Tấm ảnh này để lộ gì?',
            instruction:
              'Xếp từng loại ảnh vào rổ: loại nào để lộ thông tin có thể dùng để tìm ra hoặc tiếp cận đứa trẻ ngoài đời?',
            buckets: [
              { id: 'lo', label: 'Để lộ thông tin định vị / nhận dạng' },
              { id: 'it', label: 'Ít rủi ro hơn' },
            ],
            items: [
              { id: 'a1', text: 'Ảnh khai giảng thấy rõ biển tên trường', bucketId: 'lo' },
              { id: 'a2', text: 'Ảnh mặc đồng phục có logo và bảng tên', bucketId: 'lo' },
              { id: 'a3', text: 'Ảnh đăng đều đặn cùng một buổi trong tuần ở cùng một chỗ', bucketId: 'lo' },
              { id: 'a4', text: 'Ảnh sinh nhật có số nến và ngày đăng', bucketId: 'lo' },
              { id: 'a5', text: 'Ảnh chụp bàn tay con cầm bút, không thấy mặt', bucketId: 'it' },
              { id: 'a6', text: 'Ảnh chụp từ xa ở nơi công cộng không có dấu hiệu nhận dạng', bucketId: 'it' },
            ],
          },
          {
            type: 'text',
            title: 'Ba nhóm thông tin nguy hiểm nhất',
            paragraphs: [
              'Nhìn vào rổ bên trái, cô Nga thấy chúng đều rơi vào ba nhóm:',
              '📍 Định vị: trường, lớp, khu vực sinh sống, chỗ hay lui tới.',
              '⏰ Thời gian: lịch sinh hoạt lặp lại, giờ tan học, giờ học thêm.',
              '🪪 Định danh: tên đầy đủ, ngày sinh, khuôn mặt rõ nét, đồng phục có bảng tên.',
              'Ghép ba nhóm này lại thì một người lạ biết đứa trẻ tên gì, mặt mũi ra sao, có mặt ở đâu vào lúc nào.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Rủi ro không nằm ở một tấm ảnh',
            variant: 'warning',
            text: 'Mỗi tấm ảnh riêng lẻ đều vô hại, và đó chính là lý do người ta đăng tấm thứ một nghìn cũng dễ dàng như tấm đầu tiên. Nhưng hồ sơ được ghép từ nhiều tấm chứ không phải một tấm. Câu hỏi đúng không phải "tấm này có sao không?" mà là "cộng tất cả những gì mình đã đăng, người lạ biết được gì?"',
          },
          {
            type: 'text',
            title: 'Đứa trẻ sẽ nghĩ gì?',
            paragraphs: [
              'Có một chi tiết cô Nga đọc được và không quên nổi: ở một số nước, đã có những vụ con kiện cha mẹ vì đăng ảnh mình lên mạng khi còn nhỏ.',
              'Cô thấy chuyện đó hơi quá. Rồi cô thử tự đặt mình vào chỗ con.',
              'Cô cuộn tới một tấm ảnh cô đăng năm Ngọc bốn tuổi: con bé đang khóc lóc ăn vạ giữa siêu thị, mặt nhoè nước mắt. Chú thích cô viết: "Công chúa lại giở chứng rồi". Bài đó có hai trăm lượt thích và bốn chục bình luận trêu.',
            ],
          },
          {
            type: 'question',
            question: 'Tấm ảnh con khóc ăn vạ được đăng kèm chú thích hài hước đặt ra vấn đề gì?',
            options: [
              { id: 'a', text: 'Không vấn đề gì, đó là kỷ niệm vui của gia đình', isCorrect: false },
              { id: 'b', text: 'Nó công khai một khoảnh khắc riêng tư, dễ tổn thương của một người không được hỏi ý kiến, và nó sẽ còn ở đó khi người ấy lớn', isCorrect: true },
              { id: 'c', text: 'Nó vi phạm quy định của mạng xã hội', isCorrect: false },
              { id: 'd', text: 'Nó làm lộ vị trí siêu thị gần nhà', isCorrect: false },
            ],
            explanation:
              'Câu hỏi đơn giản để kiểm tra: nếu ai đó đăng ảnh bạn trong lúc bạn suy sụp nhất, kèm chú thích hài hước, cho hai trăm người xem — bạn thấy thế nào? Trẻ con cũng có cảm giác ấy, chỉ là chúng chưa nói ra được vào lúc bức ảnh được đăng. Và không như một câu chuyện kể miệng, bức ảnh vẫn còn nguyên khi đứa trẻ mười lăm tuổi.',
          },
          {
            type: 'text',
            title: 'Cô Nga làm gì với một nghìn tấm ảnh?',
            paragraphs: [
              'Xoá hết là điều đầu tiên cô nghĩ tới. Nhưng ngồi xoá một nghìn tấm ảnh là việc mấy chục tiếng đồng hồ, và cô biết mình sẽ bỏ dở.',
              'Cô chọn cách khác, làm được trong một buổi tối.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '🔒 Đổi toàn bộ bài đăng cũ sang chế độ chỉ mình tôi, bằng công cụ giới hạn bài đăng cũ có sẵn trong phần cài đặt quyền riêng tư. Một thao tác, áp dụng cho tất cả.',
              '🎯 Rà riêng những bài có biển tên trường, đồng phục và ảnh khai giảng — nhóm nhỏ này thì xoá hẳn.',
              '📵 Tắt tính năng cho người lạ nhắn tin và bình luận vào bài của mình.',
              '👨‍👩‍👧 Với ảnh muốn khoe với người thân, cô lập một nhóm nhỏ mười hai người trong gia đình và đăng ở đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô mất khoảng hai tiếng cho cả bốn việc.',
              'Cô biết điều này không lấy lại được những gì đã ra ngoài trong tám năm. Ai đã lưu ảnh về máy thì vẫn còn.',
              'Nhưng nó chặn được dòng chảy tiếp theo, và nó thu hẹp lại rất nhiều thứ mà một người lạ cuộn trang cô có thể ghép ra.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Đăng ảnh con lên mạng',
            description: 'Ba nhóm thông tin cần tránh và bốn thao tác làm được trong một buổi tối.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba nhóm thông tin nguy hiểm nhất',
                  paragraphs: [
                    'Định vị: tên trường, tên lớp, khu vực sinh sống, những địa điểm lui tới thường xuyên.',
                    'Thời gian: lịch sinh hoạt lặp lại theo tuần, giờ tan học, lịch học thêm — đăng đều đặn thì thành một thời khoá biểu công khai.',
                    'Định danh: tên đầy đủ, ngày sinh, khuôn mặt rõ nét, đồng phục có logo và bảng tên.',
                  ],
                },
                {
                  heading: 'Bốn thao tác làm được ngay',
                  paragraphs: [
                    'Dùng công cụ giới hạn toàn bộ bài đăng cũ về chế độ riêng tư — một thao tác áp dụng cho mọi bài trong quá khứ.',
                    'Rà và xoá hẳn nhóm bài có biển tên trường, đồng phục, ảnh khai giảng.',
                    'Tắt cho phép người lạ nhắn tin và bình luận.',
                    'Lập một nhóm nhỏ gồm người thân để chia sẻ ảnh, thay vì đăng lên trang cá nhân.',
                  ],
                },
                {
                  heading: 'Thói quen về sau',
                  paragraphs: [
                    'Trước khi đăng, hỏi: cộng với những gì mình đã đăng trước đây, tấm này giúp người lạ biết thêm gì?',
                    'Tránh đăng theo lịch cố định về cùng một hoạt động ở cùng một địa điểm.',
                    'Khi con đủ lớn để hiểu, hỏi ý con trước khi đăng ảnh có mặt con.',
                    'Không đăng ảnh giấy khen, học bạ, thẻ học sinh — chúng chứa họ tên đầy đủ, ngày sinh và mã học sinh.',
                  ],
                },
              ],
              relatedConcepts: ['Sharenting', 'Hiệu ứng tổng hợp dữ liệu', 'Quyền riêng tư của trẻ em'],
              furtherReading: [
                'Luật Trẻ em 2016 — quyền bí mật đời sống riêng tư của trẻ em',
                'Nghị định 13/2023/NĐ-CP — xử lý dữ liệu cá nhân của trẻ em',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Sharenting khác với tự đăng ảnh mình: người quyết định và người gánh hậu quả là hai người khác nhau.\n' +
              '✓ Rủi ro không nằm ở một tấm ảnh mà ở hồ sơ ghép từ hàng trăm tấm theo thời gian.\n' +
              '✓ Ba nhóm cần tránh: định vị (trường, lớp, nơi ở), thời gian (lịch lặp lại), định danh (tên, ngày sinh, đồng phục).\n' +
              '✓ Công cụ giới hạn bài đăng cũ xử lý được nhiều năm bài viết chỉ trong một thao tác.',
          },
          {
            type: 'text',
            title: 'Nhưng còn nhóm tám trăm người',
            paragraphs: [
              'Cô Nga dọn xong trang cá nhân của mình, thấy nhẹ người.',
              'Rồi cô mở nhóm Facebook phụ huynh mà cô làm quản trị viên — tám trăm thành viên, lập được bốn năm.',
              'Cô cuộn lên xem lại những gì chính cô đã đăng trong đó. Và cô thấy một thứ khiến cô lạnh người: không phải ảnh con cô.',
              'Mà là danh sách lớp, có đủ họ tên và số điện thoại phụ huynh của ba mươi hai đứa trẻ.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'nhom-kin-tam-tram-nguoi',
        title: 'Nhóm kín tám trăm người',
        blocks: [
          {
            type: 'text',
            title: 'Bài đăng tháng Chín năm ngoái',
            paragraphs: [
              'Cô Nga cuộn lên và tìm thấy nó: một bài cô đăng đầu năm học, kèm ảnh chụp tờ danh sách lớp 5A2.',
              'Trong ảnh có ba mươi hai dòng: số thứ tự, họ tên đầy đủ từng học sinh, ngày sinh, họ tên phụ huynh và số điện thoại liên hệ.',
              'Cô đăng để phụ huynh trong nhóm tiện lưu số của nhau, chuẩn bị lập nhóm chat lớp. Bài có sáu mươi lượt thích và hai chục lời cảm ơn.',
            ],
          },
          {
            type: 'callout',
            icon: 'users',
            title: 'Nhóm này "kín" tới đâu?',
            variant: 'info',
            text: 'Nhóm để chế độ riêng tư, 800 thành viên, duyệt thành viên bằng ba câu hỏi: "Anh chị có con học trường nào?", "Con học lớp mấy?", "Anh chị biết nhóm qua đâu?". Người duyệt là cô Nga và hai quản trị viên khác. Không ai kiểm chứng câu trả lời.',
          },
          {
            type: 'question',
            question:
              'Một nhóm 800 người, để chế độ riêng tư, duyệt thành viên bằng ba câu hỏi tự khai — nên được coi là gì?',
            options: [
              { id: 'a', text: 'Một không gian riêng tư, vì chỉ thành viên mới xem được', isCorrect: false },
              { id: 'b', text: 'Trên thực tế là không gian công khai, vì bất kỳ ai cũng gia nhập được bằng ba câu trả lời bịa ra', isCorrect: true },
              { id: 'c', text: 'Riêng tư nếu quản trị viên duyệt kỹ', isCorrect: false },
              { id: 'd', text: 'Riêng tư vì mạng xã hội mã hoá nội dung nhóm', isCorrect: false },
            ],
            explanation:
              'Chữ "kín" trong nhóm kín chỉ mô tả cài đặt hiển thị, không mô tả mức độ an toàn. Với 800 người, xác suất trong đó có ít nhất một người có ý đồ xấu là rất cao — và với bộ câu hỏi tự khai không kiểm chứng, chi phí để lọt vào là bằng không. Nguyên tắc thực tế: coi mọi thứ đăng trong nhóm đông người như đăng công khai.',
          },
          {
            type: 'text',
            title: 'Cô Nga đếm lại một lần nữa',
            paragraphs: [
              'Cô mở phần tìm kiếm trong nhóm và gõ vài từ khoá.',
              '"Danh sách lớp" — mười bảy bài đăng, phần lớn có ảnh chụp danh sách đầy đủ như bài của cô.',
              '"Giấy khen" — hàng trăm bài, mỗi tờ giấy khen ghi rõ họ tên, lớp, trường.',
              '"Thẻ học sinh" — hai chục bài, có bài chụp cả mặt trước lẫn mặt sau.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Rồi cô gõ một từ khoá nữa và đây là cái làm cô ngồi im lâu nhất:',
              '"Tìm con" — sáu bài, đăng bởi phụ huynh có con đi lạc hoặc bỏ nhà đi. Mỗi bài có ảnh rõ mặt, họ tên đầy đủ, tuổi, địa chỉ nhà, số điện thoại bố mẹ, và mô tả đặc điểm nhận dạng.',
              'Những bài ấy được đăng trong lúc hoảng loạn nhất, với ý định hoàn toàn chính đáng. Và chúng nằm lại trong nhóm mãi mãi sau khi đứa trẻ đã về nhà.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Dữ liệu không tự biến mất khi hết mục đích',
            variant: 'info',
            text: 'Bài tìm con phục vụ một mục đích cấp bách trong vài ngày. Nhưng nó không tự xoá khi đứa trẻ đã về. Đây là dạng phổ biến nhất của rủi ro dữ liệu: một thứ được tạo ra vì lý do chính đáng, rồi tồn tại rất lâu sau khi lý do đó không còn.',
          },
          {
            type: 'question',
            question: 'Vì sao ảnh giấy khen của học sinh lại là thông tin đáng cân nhắc trước khi đăng?',
            options: [
              { id: 'a', text: 'Vì nó khoe khoang thành tích', isCorrect: false },
              { id: 'b', text: 'Vì nó chứa họ tên đầy đủ, lớp và trường trong một tấm ảnh duy nhất, kèm khuôn mặt nếu chụp chung', isCorrect: true },
              { id: 'c', text: 'Vì nhà trường không cho phép', isCorrect: false },
              { id: 'd', text: 'Vì nó làm bạn cùng lớp tị nạnh', isCorrect: false },
            ],
            explanation:
              'Một tờ giấy khen gói gọn ba nhóm thông tin nguy hiểm nhất vào một ảnh: định danh (họ tên đầy đủ), định vị (trường, lớp), và thường kèm cả khuôn mặt. Nếu muốn khoe, chụp phần nội dung khen thưởng và che họ tên với tên trường là đủ — niềm vui vẫn còn nguyên mà hồ sơ của đứa trẻ thì không dày thêm.',
          },
          {
            type: 'text',
            title: 'Chị Thu nhắn riêng cho cô Nga',
            paragraphs: [
              'Cô Nga nhắn riêng cho vài phụ huynh trong danh sách lớp năm ngoái, hỏi họ nghĩ sao về bài đăng đó.',
              'Phần lớn bảo không sao. Riêng chị Thu, mẹ bé Minh Anh, nhắn lại một tin dài.',
              'Chị Thu ly hôn ba năm trước. Chồng cũ của chị có tiền sử bạo hành, và toà đã hạn chế quyền thăm nom. Chị chuyển nhà, đổi số điện thoại, chuyển trường cho con.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              '"Em không biết là chị có đăng danh sách lớp lên nhóm," chị Thu viết. "Trong đó có tên con em, tên trường mới, và số điện thoại mới của em."',
              'Cô Nga đọc tin nhắn đó ba lần.',
              'Cô đã đăng bài ấy với thiện chí hoàn toàn, và cô đã suýt phá hỏng ba năm chị Thu cố gắng để giữ an toàn cho hai mẹ con.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Bạn không biết hoàn cảnh của người trong danh sách',
            variant: 'warning',
            text: 'Trong bất kỳ danh sách ba mươi người nào cũng có thể có: một người đang tránh bạo hành gia đình, một người đang có tranh chấp quyền nuôi con, một người có lý do riêng để không muốn bị tìm thấy. Bạn không biết họ là ai, và họ cũng không có nghĩa vụ phải nói cho bạn. Đó là lý do nguyên tắc phải là hỏi trước, chứ không phải đăng rồi ai có vấn đề thì lên tiếng.',
          },
          {
            type: 'text',
            title: 'Điều cô Nga nhận ra về vai trò của mình',
            paragraphs: [
              'Cô Nga vẫn nghĩ mình là một phụ huynh bình thường lập nhóm cho vui.',
              'Nhưng cô đang quản trị một không gian tám trăm người, nơi mỗi ngày có hàng chục bài đăng chứa thông tin của trẻ em.',
              'Cô không cố ý nhận vai đó. Nhưng cô đang ở trong vai đó, và tám trăm người kia đang dựa vào những quy tắc mà cô đặt ra — hoặc không đặt ra.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là điểm giống hệt câu chuyện cuốn sổ của bác Tư, chỉ khác quy mô.',
              'Bác Tư giữ bốn trăm số điện thoại trong một cuốn sổ giấy. Cô Nga giữ một kho bài đăng chứa dữ liệu của hàng nghìn đứa trẻ, mở cho tám trăm người xem, và có thể tìm kiếm được.',
              'Cả hai đều không nghĩ mình là "bên xử lý dữ liệu". Cả hai đều đúng là như vậy.',
            ],
          },
          {
            type: 'text',
            title: 'Hai quản trị viên kia nghĩ khác',
            paragraphs: [
              'Cô Nga nhắn cho hai quản trị viên còn lại. Một người đồng ý ngay. Người kia, anh Tuấn, thì không.',
              '"Nhóm mình lập ra để phụ huynh giúp nhau. Giờ cấm đăng cái này cấm đăng cái kia thì còn ai đăng gì nữa? Với lại bốn năm rồi có chuyện gì đâu."',
              'Cô Nga thấy câu đó có lý. Đó cũng chính là câu cô tự nói với mình suốt bốn năm.',
            ],
          },
          {
            type: 'question',
            question: 'Lập luận "bốn năm rồi có chuyện gì đâu" sai ở chỗ nào?',
            options: [
              { id: 'a', text: 'Không sai — thực tế bốn năm không có sự cố là bằng chứng tốt', isCorrect: false },
              { id: 'b', text: 'Chưa xảy ra không có nghĩa là không xảy ra; và với loại rủi ro này, hậu quả khi xảy ra thì không sửa lại được', isCorrect: true },
              { id: 'c', text: 'Sai vì bốn năm là quãng thời gian quá ngắn để kết luận', isCorrect: false },
              { id: 'd', text: 'Sai vì nhóm mới chỉ có 800 thành viên', isCorrect: false },
            ],
            explanation:
              'Đây là lối suy nghĩ dựa trên kết quả thay vì dựa trên rủi ro. Một người lái xe không thắt dây an toàn suốt mười năm không gặp tai nạn cũng có thể nói "mười năm rồi có sao đâu" — điều đó không làm cho việc thắt dây thành thừa. Với dữ liệu trẻ em, hậu quả khi xảy ra thuộc loại không đảo ngược được, nên ngưỡng chấp nhận rủi ro phải thấp hơn hẳn bình thường.',
          },
          {
            type: 'text',
            title: 'Cô Nga gỡ bài xuống',
            paragraphs: [
              'Việc đầu tiên cô làm là gỡ bài đăng danh sách lớp của mình, rồi nhắn xin lỗi chị Thu.',
              'Chị Thu nhắn lại: "Không sao chị, chị đâu có biết. Nhưng chị gỡ giúp em là em mừng lắm rồi."',
              'Việc thứ hai khó hơn: cô phải quyết định làm gì với mười sáu bài danh sách lớp còn lại, hàng trăm bài giấy khen, và sáu bài tìm con — tất cả đều do người khác đăng.',
            ],
          },
          {
            type: 'question',
            question: 'Với tư cách quản trị viên, cách xử lý nào hợp lý nhất cho những bài đăng cũ đó?',
            options: [
              { id: 'a', text: 'Xoá hết ngay lập tức không báo ai, vì an toàn là trên hết', isCorrect: false },
              { id: 'b', text: 'Để nguyên, vì đó là bài của người khác và họ có quyền quyết định', isCorrect: false },
              { id: 'c', text: 'Đăng một thông báo giải thích lý do, đặt ra quy tắc mới, và gỡ nhóm bài rủi ro cao nhất kèm nhắn riêng cho người đăng', isCorrect: true },
              { id: 'd', text: 'Chuyển nhóm sang chế độ công khai để mọi người tự ý thức', isCorrect: false },
            ],
            explanation:
              'Xoá im lặng thì mất lòng tin và không ai học được gì. Để nguyên thì rủi ro vẫn còn, và với tư cách quản trị viên thì việc biết mà không làm gì là một lựa chọn có trách nhiệm kèm theo. Cách ở giữa vừa xử lý được rủi ro cụ thể, vừa giải thích để những bài tương tự không xuất hiện nữa — đó mới là thay đổi bền.',
          },
          {
            type: 'text',
            title: 'Bài đăng ghim của cô Nga',
            paragraphs: [
              'Cô Nga viết một bài, ghim lên đầu nhóm. Cô không dùng chữ nào nặng nề, không nhắc tên ai.',
              'Cô kể chuyện tin nhắn của người lạ biết tên con gái mình. Rồi cô viết bốn dòng quy tắc mới của nhóm.',
              'Bài đó có hơn ba trăm lượt thích, và trong phần bình luận có bảy phụ huynh nói họ cũng vừa đi gỡ bài cũ của mình xuống.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Quản trị một nhóm phụ huynh có trách nhiệm',
            description: 'Bốn quy tắc nên đặt và cách xử lý kho bài đăng cũ.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn quy tắc nên ghim',
                  paragraphs: [
                    'Không đăng danh sách lớp, danh sách liên hệ, hay bất kỳ bảng biểu nào chứa thông tin của nhiều trẻ. Cần chia sẻ thì gửi riêng cho từng người.',
                    'Không đăng ảnh giấy khen, học bạ, thẻ học sinh còn nguyên họ tên, trường, lớp và mã học sinh.',
                    'Không đăng ảnh trẻ em không phải con mình mà chưa hỏi cha mẹ của trẻ đó.',
                    'Bài tìm người, tìm trẻ lạc: chủ động gỡ xuống ngay khi việc đã xong.',
                  ],
                },
                {
                  heading: 'Vì sao "nhóm kín" không phải là riêng tư',
                  paragraphs: [
                    'Chế độ riêng tư chỉ mô tả cài đặt hiển thị, không mô tả mức độ an toàn của những người bên trong.',
                    'Với vài trăm thành viên và câu hỏi duyệt tự khai không kiểm chứng, chi phí để một người có ý đồ xấu lọt vào gần như bằng không.',
                    'Nội dung trong nhóm tìm kiếm được, chụp màn hình được, và tồn tại lâu hơn nhiều so với mục đích ban đầu.',
                  ],
                },
                {
                  heading: 'Xử lý kho bài cũ',
                  paragraphs: [
                    'Tìm theo từ khoá: "danh sách", "giấy khen", "thẻ học sinh", "tìm con", "số điện thoại".',
                    'Gỡ nhóm rủi ro cao nhất — bài chứa dữ liệu của nhiều trẻ cùng lúc — và nhắn riêng cho người đăng để giải thích, không xoá im lặng.',
                    'Đăng một bài ghim giải thích lý do bằng một câu chuyện cụ thể, thay vì liệt kê điều cấm. Người ta thay đổi vì hiểu, không vì bị cấm.',
                  ],
                },
              ],
              relatedConcepts: ['Nhóm kín không phải riêng tư', 'Dữ liệu tồn tại quá mục đích', 'Trách nhiệm của người quản trị'],
              furtherReading: [
                'Luật Trẻ em 2016 — quyền bí mật đời sống riêng tư của trẻ em',
                'Nghị định 13/2023/NĐ-CP — xử lý dữ liệu cá nhân của trẻ em cần sự đồng ý của cha mẹ',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ "Nhóm kín" chỉ mô tả cài đặt hiển thị — với vài trăm người và câu hỏi duyệt tự khai, hãy coi nó như không gian công khai.\n' +
              '✓ Dữ liệu không tự biến mất khi hết mục đích: bài tìm con vẫn nằm đó rất lâu sau khi đứa trẻ đã về nhà.\n' +
              '✓ Trong bất kỳ danh sách nào cũng có thể có người có lý do riêng để không muốn bị tìm thấy — nên nguyên tắc là hỏi trước.\n' +
              '✓ Quản trị viên một nhóm đông người đang ở vai bên xử lý dữ liệu, dù họ không nhận vai đó.',
          },
          {
            type: 'text',
            title: 'Ngọc hỏi mẹ một câu',
            paragraphs: [
              'Tối hôm bài ghim được đăng, bé Bảo Ngọc mười tuổi ngồi cạnh mẹ xem điện thoại.',
              'Con bé hỏi: "Mẹ ơi, sao mẹ xoá hết ảnh con rồi?"',
              'Cô Nga chưa kịp trả lời thì con bé hỏi tiếp một câu mà cô không nghĩ ra được câu đáp:',
              '"Mà hồi đó mẹ đăng, mẹ có hỏi con đâu?"',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'me-co-hoi-con-dau',
        title: 'Mà mẹ có hỏi con đâu?',
        blocks: [
          {
            type: 'text',
            title: 'Câu hỏi của một đứa trẻ mười tuổi',
            paragraphs: [
              '"Mà hồi đó mẹ đăng, mẹ có hỏi con đâu?"',
              'Cô Nga định trả lời "con còn nhỏ, biết gì mà hỏi". Nhưng cô kịp dừng lại.',
              'Vì câu đó chính là câu trả lời mà cô đã nhận được, từ mọi nơi đang giữ dữ liệu của cô: bạn không cần biết, đã có người quyết hộ rồi.',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Ngọc nói tiếp',
            variant: 'info',
            text: '"Bạn Khoa lớp con có lần bị mấy bạn trêu, vì mẹ bạn ấy đăng cái ảnh bạn ấy khóc lúc bé lên nhóm. Mấy bạn tìm ra rồi gửi cho nhau cười."',
          },
          {
            type: 'question',
            question:
              'Bé Ngọc mười tuổi có nên có tiếng nói về việc ảnh của mình được đăng hay không?',
            options: [
              { id: 'a', text: 'Không — cha mẹ có toàn quyền quyết định mọi việc liên quan tới con dưới 18 tuổi', isCorrect: false },
              { id: 'b', text: 'Có — quyền bí mật đời sống riêng tư là quyền của chính đứa trẻ, và trẻ cần được hỏi ý kiến phù hợp với độ tuổi', isCorrect: true },
              { id: 'c', text: 'Chỉ khi đứa trẻ đủ 16 tuổi', isCorrect: false },
              { id: 'd', text: 'Chỉ khi ảnh đó có nội dung nhạy cảm', isCorrect: false },
            ],
            explanation:
              'Luật Trẻ em ghi nhận trẻ em có quyền bí mật đời sống riêng tư — đó là quyền của đứa trẻ, không phải quyền của cha mẹ đối với đứa trẻ. Cha mẹ là người đại diện thực hiện quyền ấy, chứ không phải người sở hữu nó. Và quyền được bày tỏ ý kiến về những việc liên quan tới mình cũng là quyền của trẻ, được thực hiện theo mức độ trưởng thành.',
          },
          {
            type: 'text',
            title: 'Cô Nga thử một cách khác',
            paragraphs: [
              'Thay vì giải thích, cô Nga mở điện thoại ra và ngồi cùng con cuộn lại những tấm ảnh cũ.',
              'Cô hỏi từng tấm: "Tấm này con thấy sao? Có ngại không?"',
              'Kết quả làm cô bất ngờ. Con bé không ngại phần lớn những tấm cô tưởng là nhạy cảm — ảnh tắm hồi bé, ảnh mặc đồ ngủ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Thứ con bé ngại là những tấm khác hẳn:',
              '😭 Tấm khóc ăn vạ ở siêu thị, kèm chú thích trêu.',
              '📄 Tấm bài kiểm tra bị điểm 5, cô Nga đăng kèm dòng "Cả nhà cho lời khuyên với".',
              '🩹 Tấm bị ngã trầy đầu gối, khóc nhè.',
              '💇 Tấm bị cắt tóc hỏng năm lớp 2.',
              '"Mấy cái đó con quê lắm mẹ," Ngọc nói. "Bạn con thấy được là mắc cỡ chết."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Người lớn và trẻ con đánh giá riêng tư khác nhau',
            variant: 'info',
            text: 'Người lớn lo về nguy cơ vật lý và pháp lý: bắt cóc, lạm dụng, lộ địa chỉ. Trẻ con lo về danh dự trước bạn bè: bị cười, bị trêu, bị nhìn thấy trong lúc yếu đuối. Cả hai đều là mối lo chính đáng, và người lớn thường chỉ tính tới loại thứ nhất — trong khi loại thứ hai mới là thứ đứa trẻ sống cùng mỗi ngày ở trường.',
          },
          {
            type: 'perspective-switch',
            title: 'Một tấm ảnh, ba thời điểm',
            event: 'Cô Nga đăng ảnh bé Ngọc bốn tuổi khóc ăn vạ giữa siêu thị, kèm chú thích "Công chúa lại giở chứng rồi". Bài có 200 lượt thích và 40 bình luận trêu.',
            perspectives: [
              {
                id: 'w1',
                role: 'Cô Nga, lúc đăng',
                icon: 'heart',
                narrative:
                  'Con bé đáng yêu quá, kể cả lúc ăn vạ. Mình đăng cho vui, cho bà ngoại ở quê xem, cho mấy chị em cùng cười. Trong đầu mình đây là một kỷ niệm dễ thương của gia đình.',
              },
              {
                id: 'w2',
                role: 'Ngọc, mười tuổi',
                icon: 'user',
                narrative:
                  'Con không nhớ hôm đó. Nhưng bốn chục người lạ đã bình luận cười con lúc con đang khóc, và cái ảnh đó vẫn còn. Nếu bạn con tìm được thì con không biết giấu mặt đi đâu. Mà con còn chẳng biết là nó tồn tại cho tới hôm nay.',
              },
              {
                id: 'w3',
                role: 'Ngọc, hai mươi hai tuổi, đi phỏng vấn',
                icon: 'briefcase',
                narrative:
                  'Nhà tuyển dụng tra tên tôi. Thứ hiện ra sớm nhất không phải là bài viết hay dự án của tôi, mà là một tấm ảnh tôi khóc lúc bốn tuổi và một tờ bài kiểm tra điểm 5. Tôi không đăng chúng, tôi không đồng ý cho ai đăng, và tôi không xoá được vì chúng không nằm trong tài khoản của tôi.',
              },
            ],
            question: {
              text: 'Điều gì thay đổi giữa ba thời điểm này?',
              options: [
                { id: 'a', text: 'Chất lượng tấm ảnh giảm dần theo thời gian', isCorrect: false },
                { id: 'b', text: 'Tấm ảnh không đổi, nhưng người mang hậu quả lớn lên và bối cảnh mà nó được đọc thì đổi hoàn toàn', isCorrect: true },
                { id: 'c', text: 'Số người xem tấm ảnh giảm dần', isCorrect: false },
                { id: 'd', text: 'Quy định pháp luật thay đổi', isCorrect: false },
              ],
              explanation:
                'Đây là đặc điểm riêng của dữ liệu về trẻ em: nó được tạo ra trong một bối cảnh (gia đình, vui vẻ, người thân) nhưng sẽ được đọc trong những bối cảnh hoàn toàn khác mà người đăng không hình dung nổi — lớp học năm cấp hai, buổi phỏng vấn năm hai mươi hai tuổi. Người đăng thì ở lại thời điểm đăng, còn tấm ảnh thì đi cùng đứa trẻ suốt đời.',
            },
          },
          {
            type: 'text',
            title: 'Cô Nga đặt ra một quy tắc trong nhà',
            paragraphs: [
              'Hai mẹ con thống nhất một quy tắc rất đơn giản, và cô Nga áp dụng cho cả đứa em bốn tuổi.',
              '📸 Trước khi đăng ảnh có mặt con, mẹ đưa con xem và hỏi. Con nói không thì mẹ không đăng, không cần lý do.',
              '🚫 Không đăng ảnh con khóc, con bị điểm kém, con bị ngã, con đang giận dỗi — kể cả khi con nói được.',
              '🗑️ Con có quyền chỉ vào một tấm ảnh cũ bất kỳ và bảo mẹ xoá.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Quy tắc thứ hai là quy tắc cô Nga tự đặt ra cho mình, chứ không phải do Ngọc đòi.',
              'Vì đứa em bốn tuổi chưa nói không được. Và một quy tắc chỉ dựa vào việc đứa trẻ biết từ chối thì không bảo vệ được đứa trẻ chưa biết từ chối.',
              'Cô nhận ra đây là chỗ mà mọi cơ chế "đồng ý" đều gãy — với trẻ nhỏ, với người già, với nhân viên trước mặt sếp: người yếu thế nhất là người ít có khả năng nói không nhất.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao cô Nga cần một quy tắc cứng, thay vì chỉ dựa vào việc hỏi ý con?',
            options: [
              { id: 'a', text: 'Vì hỏi ý kiến trẻ con mất nhiều thời gian', isCorrect: false },
              { id: 'b', text: 'Vì đứa trẻ nhỏ nhất chưa có khả năng từ chối, nên cơ chế đồng ý không bảo vệ được nó', isCorrect: true },
              { id: 'c', text: 'Vì trẻ con thường đồng ý mọi thứ', isCorrect: false },
              { id: 'd', text: 'Vì pháp luật quy định phải có quy tắc cứng', isCorrect: false },
            ],
            explanation:
              'Sự đồng ý chỉ có ý nghĩa khi người đồng ý có thực quyền từ chối. Với một đứa trẻ bốn tuổi, một người đang cần việc làm, hay một cụ già đang sợ — việc hỏi vẫn cần, nhưng không đủ. Đó là lý do các khung bảo vệ dữ liệu luôn có thêm những giới hạn cứng áp dụng bất kể có đồng ý hay không, đặc biệt với nhóm dễ tổn thương.',
          },
          {
            type: 'text',
            title: 'Thứ con không ngại nhưng mẹ vẫn gỡ',
            paragraphs: [
              'Có một nhóm ảnh mà Ngọc bảo "con không thấy sao hết", nhưng cô Nga vẫn quyết định gỡ: ảnh con tắm hồi nhỏ, ảnh con mặc đồ ngủ, ảnh con ngủ.',
              'Cô giải thích với con: "Con không ngại vì con nghĩ tới bạn con. Mẹ gỡ vì mẹ nghĩ tới người mà con không biết là ai."',
              'Đây là chỗ mà ý kiến của đứa trẻ cần được lắng nghe nhưng không thể là tiếng nói cuối cùng.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao ảnh trẻ em ở trạng thái hớ hênh cần được gỡ kể cả khi đứa trẻ nói không ngại?',
            options: [
              { id: 'a', text: 'Vì trẻ con không biết mình đang nói gì', isCorrect: false },
              { id: 'b', text: 'Vì loại rủi ro ở đây không phải là bị bạn bè cười, mà là bị người lạ thu thập và sử dụng — thứ đứa trẻ không có cơ sở để hình dung', isCorrect: true },
              { id: 'c', text: 'Vì mạng xã hội cấm loại ảnh này', isCorrect: false },
              { id: 'd', text: 'Vì ảnh đó làm giảm lượt tương tác', isCorrect: false },
            ],
            explanation:
              'Trẻ đánh giá rủi ro theo thế giới trẻ biết: bạn bè, lớp học, sự xấu hổ. Chúng không có cơ sở để hình dung việc ảnh mình bị thu thập, cắt ghép hay đưa vào những nơi mà cả người lớn cũng không muốn nghĩ tới. Hỏi ý con là để bổ sung một góc nhìn mà cha mẹ thiếu, chứ không phải để chuyển toàn bộ trách nhiệm quyết định sang cho con.',
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Hai loại rủi ro, hai người nhìn thấy',
            variant: 'warning',
            text: 'Đứa trẻ nhìn thấy rủi ro danh dự mà cha mẹ hay bỏ qua. Cha mẹ nhìn thấy rủi ro an toàn mà đứa trẻ không hình dung nổi. Quy tắc tốt là quy tắc gộp cả hai: hỏi con để biết cái con ngại, và giữ giới hạn cứng cho cái con chưa biết ngại.',
          },
          {
            type: 'text',
            title: 'Còn đứa em bốn tuổi',
            paragraphs: [
              'Cu Bin bốn tuổi, chưa trả lời được câu hỏi "con thấy sao".',
              'Cô Nga áp dụng cho Bin một nguyên tắc khác: đăng ít hơn hẳn, và chỉ đăng những gì cô tự tin rằng Bin mười lăm tuổi sẽ không phiền lòng.',
              'Cô gọi đó là "hỏi thay con" — và cô nhận ra đó chính là điều mà mọi người giữ dữ liệu của người khác đều nên làm, khi người kia chưa lên tiếng được.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bà ngoại ở quê không hài lòng. Bà quen mỗi ngày mở điện thoại xem ảnh cháu.',
              'Cô Nga không bỏ hẳn. Cô lập một nhóm nhỏ mười hai người trong họ, và đăng ảnh ở đó.',
              'Bà vẫn xem được cháu mỗi ngày. Chỉ khác là mười hai người xem thay vì tám trăm người xem, và không ai trong mười hai người đó là người lạ.',
            ],
          },
          {
            type: 'text',
            title: 'Ngọc chỉ vào ba tấm',
            paragraphs: [
              'Đêm đó, Ngọc cuộn hết trang cá nhân của mẹ và chỉ ra ba tấm con bé muốn xoá.',
              'Cô Nga xoá cả ba, ngay trước mặt con.',
              'Rồi con bé làm một việc cô không ngờ: nó ôm mẹ và nói "Cảm ơn mẹ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô Nga nghĩ mãi về hai chữ cảm ơn đó.',
              'Cô đã sợ rằng việc này sẽ thành một cuộc cãi vã, hoặc con bé sẽ thấy mẹ mình sai.',
              'Nhưng thứ con bé cảm ơn không phải là ba tấm ảnh được xoá. Nó cảm ơn vì lần đầu tiên có người hỏi nó về một thứ vốn dĩ là của nó.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Quyền riêng tư của trẻ em',
            description: 'Trẻ lo về điều gì, cha mẹ thường bỏ sót điều gì, và ba quy tắc trong nhà.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Quyền thuộc về đứa trẻ, không phải về cha mẹ',
                  paragraphs: [
                    'Luật Trẻ em ghi nhận trẻ em có quyền bí mật đời sống riêng tư. Cha mẹ là người đại diện thực hiện quyền đó, không phải người sở hữu nó.',
                    'Trẻ có quyền bày tỏ ý kiến về những việc liên quan tới mình, ở mức độ phù hợp với lứa tuổi.',
                    'Nghị định 13/2023 đặt yêu cầu chặt hơn với việc xử lý dữ liệu cá nhân của trẻ em.',
                  ],
                },
                {
                  heading: 'Trẻ lo về điều gì',
                  paragraphs: [
                    'Người lớn lo về nguy cơ vật lý: bắt cóc, lạm dụng, lộ nơi ở. Đó là mối lo đúng.',
                    'Trẻ lo về danh dự trước bạn bè: bị cười, bị trêu, bị nhìn thấy trong lúc yếu đuối, khóc lóc, thất bại.',
                    'Nhóm ảnh trẻ ngại nhất thường không phải nhóm cha mẹ nghĩ: ảnh khóc, ảnh điểm kém, ảnh bị ngã, ảnh cắt tóc hỏng.',
                  ],
                },
                {
                  heading: 'Ba quy tắc trong nhà',
                  paragraphs: [
                    'Hỏi trước khi đăng ảnh có mặt con. Con nói không thì không đăng, không cần lý do.',
                    'Giới hạn cứng, áp dụng cả với trẻ chưa biết từ chối: không đăng ảnh con khóc, bị điểm kém, bị ngã, đang giận dỗi.',
                    'Con có quyền chỉ vào bất kỳ tấm ảnh cũ nào và yêu cầu xoá — và người lớn thực hiện ngay, không mặc cả.',
                  ],
                },
              ],
              relatedConcepts: ['Quyền riêng tư của trẻ em', 'Giới hạn cứng và sự đồng ý', 'Bối cảnh thay đổi theo thời gian'],
              furtherReading: [
                'Luật Trẻ em 2016 — Điều 21 về quyền bí mật đời sống riêng tư',
                'Nghị định 13/2023/NĐ-CP — xử lý dữ liệu cá nhân của trẻ em',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Quyền bí mật đời sống riêng tư thuộc về đứa trẻ; cha mẹ là người đại diện thực hiện, không phải người sở hữu.\n' +
              '✓ Trẻ lo về việc bị bạn bè cười, còn người lớn chỉ lo về nguy cơ vật lý — cả hai đều chính đáng.\n' +
              '✓ Một tấm ảnh không đổi, nhưng bối cảnh nó được đọc thì đổi hoàn toàn khi đứa trẻ lớn lên.\n' +
              '✓ Hỏi ý kiến là cần nhưng chưa đủ: người yếu thế nhất luôn là người ít có khả năng nói không nhất, nên cần thêm giới hạn cứng.',
          },
          {
            type: 'text',
            title: 'Còn tám trăm người kia',
            paragraphs: [
              'Cô Nga đã dọn xong trang cá nhân và đã đặt được quy tắc trong nhà mình.',
              'Nhưng bài đăng ghim trong nhóm mới chỉ là một bài đăng. Anh Tuấn vẫn chưa đồng ý. Và mỗi ngày vẫn có hàng chục bài mới được đăng lên.',
              'Cô nhận ra việc khó nhất không phải là biết mình nên làm gì. Việc khó nhất là làm sao để tám trăm người khác cùng làm — mà không biến nhóm thành một chỗ ai cũng bị nhắc nhở.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'hoi-truoc-khi-dang',
        title: 'Hỏi trước khi đăng',
        blocks: [
          {
            type: 'text',
            title: 'Cách đầu tiên không hiệu quả',
            paragraphs: [
              'Tuần đầu, cô Nga làm điều mà một quản trị viên hay làm: cô gỡ bài vi phạm và nhắn nhắc nhở từng người.',
              'Bảy bài bị gỡ. Ba người giận. Một người rời nhóm. Một người đăng lại bài đó ở nhóm khác.',
              'Và điều quan trọng nhất: số bài đăng danh sách lớp tuần sau không giảm.',
            ],
          },
          {
            type: 'callout',
            icon: 'alert-triangle',
            title: 'Vì sao nhắc nhở không hiệu quả',
            variant: 'warning',
            text: 'Người bị nhắc học được một điều: đăng cái này thì bị nhắc. Họ không học được vì sao. Và vì họ không thấy tác hại, họ kết luận rằng quản trị viên khó tính chứ không phải việc họ làm có vấn đề.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc cấm và nhắc nhở thường không thay đổi được hành vi trong một cộng đồng?',
            options: [
              { id: 'a', text: 'Vì mọi người không đọc nội quy', isCorrect: false },
              { id: 'b', text: 'Vì nó cho biết cái gì bị cấm nhưng không cho thấy tác hại, nên người ta coi đó là ý muốn của người quản lý chứ không phải một vấn đề thật', isCorrect: true },
              { id: 'c', text: 'Vì hình phạt chưa đủ nặng', isCorrect: false },
              { id: 'd', text: 'Vì nhóm quá đông để quản lý', isCorrect: false },
            ],
            explanation:
              'Một quy tắc không kèm lý do sẽ được đọc như sở thích của người đặt ra nó. Người ta tuân thủ khi bị nhìn thấy và bỏ qua khi không bị nhìn thấy. Ngược lại, một người hiểu được tác hại thì tự áp dụng cả ở những nơi không ai quản — và còn nhắc lại cho người khác.',
          },
          {
            type: 'text',
            title: 'Cách thứ hai: kể chuyện',
            paragraphs: [
              'Cô Nga đổi cách. Mỗi tuần cô đăng một bài ngắn, kể một câu chuyện có thật, không nêu tên ai.',
              'Tuần một: chuyện tin nhắn của người lạ biết tên con gái cô.',
              'Tuần hai: chuyện chị Thu — kể lại đã được chị Thu đồng ý, và giấu hết mọi chi tiết nhận dạng.',
              'Tuần ba: chuyện bé Ngọc hỏi "mà mẹ có hỏi con đâu".',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bài tuần hai có bốn trăm lượt thích và hơn một trăm bình luận.',
              'Trong phần bình luận, phụ huynh bắt đầu tự kể chuyện của họ. Một chị kể con chị bị ghép mặt vào ảnh chế. Một anh kể bị người lạ gọi điện nói đúng tên con và tên trường.',
              'Không ai trong số họ từng kể những chuyện đó ra trước đây, vì họ tưởng chỉ mình gặp phải.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Câu chuyện làm được thứ nội quy không làm được',
            variant: 'info',
            text: 'Nội quy nói: điều này bị cấm. Câu chuyện cho thấy: điều này đã xảy ra với một người giống bạn. Cái thứ hai tạo ra thay đổi bền hơn, vì người ta không thay đổi vì bị cấm — họ thay đổi khi hình dung được chuyện đó xảy ra với con mình.',
          },
          {
            type: 'text',
            title: 'Anh Tuấn đổi ý',
            paragraphs: [
              'Anh Tuấn — quản trị viên phản đối lúc đầu — bình luận dưới bài tuần hai.',
              '"Đọc xong bài này tôi mới nghĩ tới. Con tôi cũng đang ở với mẹ nó sau ly hôn. Tôi chưa bao giờ nghĩ mấy cái danh sách đó lại là chuyện."',
              'Anh không đổi ý vì cô Nga tranh luận thắng. Anh đổi ý vì anh nhìn thấy chính mình trong câu chuyện.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Sau đó anh Tuấn là người viết lại bản nội quy nhóm.',
              'Và bản nội quy anh viết chặt hơn bản cô Nga định viết ban đầu.',
              'Cô Nga rút ra một điều: khi người ta tự đi tới kết luận, họ giữ kết luận đó chắc hơn nhiều so với khi bị thuyết phục.',
            ],
          },
          {
            type: 'question',
            question: 'Cách hiệu quả nhất để thay đổi thói quen của một cộng đồng là gì?',
            options: [
              { id: 'a', text: 'Đặt ra nội quy chi tiết và xử lý nghiêm mọi vi phạm', isCorrect: false },
              { id: 'b', text: 'Cho thấy tác hại bằng câu chuyện cụ thể, để người ta tự đi tới kết luận và tự lan truyền nó', isCorrect: true },
              { id: 'c', text: 'Giới hạn số thành viên trong nhóm', isCorrect: false },
              { id: 'd', text: 'Chuyển nhóm sang chế độ chỉ quản trị viên được đăng bài', isCorrect: false },
            ],
            explanation:
              'Nội quy và xử lý vi phạm vẫn cần, nhưng chúng chỉ tạo ra tuân thủ trong tầm mắt. Thay đổi bền đến từ việc người ta hiểu tác hại và tự thấy nó liên quan tới mình. Khi đó họ áp dụng cả ở nơi không ai quản, và họ trở thành người giải thích cho người tiếp theo — đó là thứ mà một quản trị viên không tự làm nổi.',
          },
          {
            type: 'text',
            title: 'Bài tuần ba khó viết nhất',
            paragraphs: [
              'Bài tuần một và tuần hai kể chuyện người khác làm cô Nga lo. Bài tuần ba thì kể chuyện chính cô làm con mình khó chịu.',
              'Cô ngần ngại mãi mới đăng, vì cô là quản trị viên và cô sợ mất uy tín khi thừa nhận mình sai suốt tám năm.',
              'Nhưng đó lại là bài được chia sẻ nhiều nhất trong cả loạt.',
            ],
          },
          {
            type: 'question',
            question: 'Vì sao bài mà cô Nga thừa nhận cái sai của chính mình lại có tác dụng mạnh nhất?',
            options: [
              { id: 'a', text: 'Vì mọi người thích đọc chuyện riêng tư của quản trị viên', isCorrect: false },
              { id: 'b', text: 'Vì nó xoá bỏ khoảng cách giữa người khuyên và người nghe: ai cũng thấy mình trong đó, không ai thấy mình bị dạy dỗ', isCorrect: true },
              { id: 'c', text: 'Vì nó có nhiều ảnh minh hoạ hơn', isCorrect: false },
              { id: 'd', text: 'Vì nó được đăng vào cuối tuần', isCorrect: false },
            ],
            explanation:
              'Lời khuyên từ một người tự đặt mình ở vị trí đúng đắn luôn bị nghe như một sự phán xét. Khi người khuyên bắt đầu bằng "tôi cũng đã làm như vậy suốt tám năm", người nghe không còn phải bảo vệ bản thân, và họ nghe được phần nội dung. Đây là lý do chia sẻ trải nghiệm thất bại thường thay đổi hành vi tốt hơn là đưa ra lời khuyên đúng.',
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Bắt đầu bằng cái sai của mình',
            variant: 'info',
            text: 'Nếu bạn muốn một cộng đồng đổi thói quen, cách mở đầu hiệu quả nhất không phải là chỉ ra ai đang làm sai, mà là kể ra việc chính bạn đã làm sai như thế nào và vì sao bạn không nhận ra. Nó biến vấn đề từ "một số người thiếu ý thức" thành "một chuyện ai cũng dễ mắc".',
          },
          {
            type: 'text',
            title: 'Không phải ai cũng đổi',
            paragraphs: [
              'Cô Nga cũng thành thật về giới hạn của cách làm này.',
              'Có khoảng ba chục thành viên rời nhóm trong sáu tháng đó. Có vài người bình luận rằng nhóm "bây giờ khó tính quá". Một người lập nhóm riêng, không có quy tắc gì.',
              'Cô không đuổi theo. Một cộng đồng không thể thay đổi tất cả mọi người, và cố làm điều đó thường dẫn tới việc mất luôn những người đã sẵn sàng thay đổi.',
            ],
          },
          {
            type: 'text',
            title: 'Nhóm sau sáu tháng',
            paragraphs: [
              'Sáu tháng sau, cô Nga thử tìm lại bằng những từ khoá cũ.',
              '"Danh sách lớp" — không có bài mới nào trong sáu tháng.',
              '"Giấy khen" — vẫn nhiều, nhưng phần lớn đã che họ tên và tên trường.',
              '"Tìm con" — có hai bài mới, và cả hai đều đã được chính người đăng gỡ xuống sau khi tìm được.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Thứ làm cô hài lòng nhất không nằm trong số liệu.',
              'Đó là việc bây giờ, khi có ai đăng một bài chứa thông tin của nhiều trẻ, thường có phụ huynh khác nhắc trước cả khi quản trị viên kịp nhìn thấy.',
              'Và họ nhắc bằng cách kể lại câu chuyện, chứ không phải bằng cách trích nội quy.',
            ],
          },
          {
            type: 'text',
            title: 'Cô Nga nhìn lại chính mình',
            paragraphs: [
              'Có một chuyện cô Nga thừa nhận với bản thân, và cô nghĩ nó đáng nói ra.',
              'Trong tám năm đăng ảnh con, cô không hề vô tâm. Cô yêu con hơn bất cứ ai. Mọi tấm ảnh đều được đăng với tình yêu.',
              'Vấn đề chưa bao giờ là thiếu tình thương. Vấn đề là cô chưa từng hình dung ra bức tranh khi cộng tất cả lại, và chưa ai từng chỉ cho cô cách hình dung điều đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đó cũng là lý do cô không trách anh Tuấn, không trách những phụ huynh đăng danh sách lớp, và không trách chính mình của tám năm trước.',
              '"Mình đâu có ai chỉ," cô viết trong bài đăng cuối cùng của loạt bài. "Giờ mình biết rồi thì mình chỉ lại cho người sau thôi."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thay đổi thói quen của một cộng đồng',
            description: 'Vì sao nội quy thất bại, và cách làm hiệu quả hơn cho người quản trị nhóm.',
            category: 'Quyền riêng tư',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao cấm đoán ít hiệu quả',
                  paragraphs: [
                    'Quy tắc không kèm lý do được đọc như sở thích của người quản lý, nên chỉ được tuân thủ khi bị nhìn thấy.',
                    'Việc gỡ bài kèm nhắc nhở riêng tạo ra cảm giác bị bêu, dẫn tới phản ứng phòng vệ thay vì thay đổi.',
                    'Người bị nhắc học được cái gì bị cấm, chứ không học được vì sao — nên họ lặp lại hành vi ở nơi khác.',
                  ],
                },
                {
                  heading: 'Cách làm hiệu quả hơn',
                  paragraphs: [
                    'Kể một câu chuyện cụ thể, có thật, không nêu tên ai — và xin phép người liên quan trước khi kể.',
                    'Kể chuyện của chính mình trước, kể cả phần mình đã làm sai. Nó gỡ bỏ cảm giác bị dạy dỗ.',
                    'Để mọi người tự kể chuyện của họ trong phần bình luận. Phần lớn tưởng chỉ mình gặp phải.',
                    'Mời người phản đối cùng viết lại nội quy, thay vì thuyết phục họ chấp nhận nội quy của bạn.',
                  ],
                },
                {
                  heading: 'Dấu hiệu cộng đồng đã thực sự đổi',
                  paragraphs: [
                    'Thành viên nhắc nhau trước khi quản trị viên kịp can thiệp.',
                    'Người ta nhắc bằng cách kể lại tác hại, không phải bằng cách trích nội quy.',
                    'Người từng phản đối trở thành người giải thích cho thành viên mới.',
                  ],
                },
              ],
              relatedConcepts: ['Thay đổi hành vi cộng đồng', 'Trách nhiệm của người quản trị', 'Chuẩn mực xã hội'],
              furtherReading: [
                'Luật Trẻ em 2016 — trách nhiệm bảo vệ trẻ em trên môi trường mạng',
                'Nghị định 13/2023/NĐ-CP — nguyên tắc bảo vệ dữ liệu cá nhân',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nội quy tạo ra tuân thủ trong tầm mắt; câu chuyện tạo ra thay đổi cả ở nơi không ai quản.\n' +
              '✓ Người ta không đổi vì bị cấm — họ đổi khi hình dung được chuyện đó xảy ra với con mình.\n' +
              '✓ Khi người ta tự đi tới kết luận, họ giữ kết luận đó chắc hơn khi bị thuyết phục.\n' +
              '✓ Dấu hiệu cộng đồng đã đổi thật: thành viên nhắc nhau bằng câu chuyện, trước khi quản trị viên kịp can thiệp.',
          },
          {
            type: 'text',
            title: 'Điều cô Nga mang theo',
            paragraphs: [
              'Cô Nga vẫn đăng ảnh hai đứa con. Cô vẫn quản trị nhóm tám trăm người.',
              'Thứ thay đổi là trước mỗi lần bấm nút đăng, cô dừng lại đúng hai giây và hỏi một câu:',
              '"Cái này là chuyện của ai?"',
              'Nếu câu trả lời là "của con mình" hoặc "của con người khác", thì cô hỏi tiếp: mình đã hỏi người đó chưa?',
            ],
          },
        ],
      },
    ],
  },
};
