import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Cô Nga × Logic 101 — "Nút Chia sẻ".
 *
 * Cô Nga là nhân vật trung tâm của khoá này: cô không phải người bị lừa, cô là
 * người lan tin — với thiện chí tuyệt đối. Câu chuyện đi từ cú bấm hai giây tới
 * việc thừa nhận mình sai trước tám trăm người.
 */

/** Bài cảnh báo cô Nga đã chia sẻ, dùng cho block bias-detector ở chương 1.
 *  startIndex được tính bằng indexOf trên chính chuỗi này. */
const BAI_CANH_BAO =
  'CẢNH BÁO KHẨN CHO CÁC MẸ! ' +
  'Một bé gái 6 tuổi ở Hà Nội đã tử vong sau khi ăn kẹo lạ do người lạ cho ở cổng trường. ' +
  'Loại kẹo này tẩm ma tuý tổng hợp, nhìn giống hệt kẹo thường nên không thể phân biệt. ' +
  'Ai cũng biết bọn buôn ma tuý bây giờ nhắm vào trẻ em. ' +
  'Một cô giáo mà tôi quen nói trường nào cũng có rồi. ' +
  'Các mẹ hãy chia sẻ ngay để cứu con em mình!';

export const CONGA_LOGIC: StorySeed = {
  slug: 'conga-logic',
  characterSlug: 'homemaker',
  title: 'Nút Chia sẻ',
  teaser:
    'Cô Nga bấm chia sẻ trong hai giây, vì thương con người ta. Tám trăm phụ huynh đọc được, và tới chiều thì có ba mẹ tới trường đón con sớm trong hoảng loạn.',
  icon: 'share-2',
  estimatedTime: '~30 phút',
  sortOrder: 5,
  courseSlugs: [COURSE.logic],
  part: {
    name: 'Cô Nga và cú bấm hai giây',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'mot-cu-bam-hai-giay',
        title: 'Một cú bấm hai giây',
        blocks: [
          {
            type: 'text',
            title: 'Bảy giờ sáng, trước khi đi chợ',
            paragraphs: [
              'Cô Nga đang chuẩn bị đi chợ thì thấy bài đăng trong một nhóm khác.',
              'Cô đọc hết trong khoảng mười giây, thấy tim đập nhanh, và nghĩ tới bé Ngọc đang học lớp năm.',
              'Cô bấm chia sẻ vào nhóm phụ huynh tám trăm người mà cô quản trị. Toàn bộ thao tác mất chưa tới hai giây.',
            ],
          },
          {
            type: 'callout',
            icon: 'alert-triangle',
            title: 'Nội dung bài cô Nga chia sẻ',
            variant: 'warning',
            text: '"CẢNH BÁO KHẨN CHO CÁC MẸ! Một bé gái 6 tuổi ở Hà Nội đã tử vong sau khi ăn kẹo lạ do người lạ cho ở cổng trường. Loại kẹo này tẩm ma tuý tổng hợp, nhìn giống hệt kẹo thường nên không thể phân biệt. Ai cũng biết bọn buôn ma tuý bây giờ nhắm vào trẻ em. Một cô giáo mà tôi quen nói trường nào cũng có rồi. Các mẹ hãy chia sẻ ngay để cứu con em mình!"',
          },
          {
            type: 'question',
            question:
              'Cô Nga đọc bài này mười giây rồi chia sẻ. Theo bạn, lý do chính khiến cô không kiểm chứng là gì?',
            options: [
              { id: 'a', text: 'Cô Nga không biết cách kiểm chứng thông tin', isCorrect: false },
              { id: 'b', text: 'Nội dung chạm vào nỗi sợ lớn nhất của cô và kèm theo một hành động dễ làm — trong trạng thái đó, việc kiểm chứng còn có vẻ như là chậm trễ vô trách nhiệm', isCorrect: true },
              { id: 'c', text: 'Cô Nga muốn tăng tương tác cho nhóm mình', isCorrect: false },
              { id: 'd', text: 'Bài viết trông rất chuyên nghiệp', isCorrect: false },
            ],
            explanation:
              'Cô Nga hoàn toàn biết cách tra Google. Vấn đề là trong khoảnh khắc đó, việc dừng lại để tra cứu có cảm giác như đang mạo hiểm với an toàn của trẻ con. Nội dung được thiết kế đúng để tạo ra cảm giác ấy: nguy cơ cực đại, nạn nhân là trẻ em, và một nút bấm ngay đó biến sự lo lắng thành hành động. Đó không phải là thiếu kỹ năng — đó là kỹ năng bị vô hiệu hoá bởi cảm xúc.',
          },
          {
            type: 'text',
            title: 'Tới trưa',
            paragraphs: [
              'Bài đăng có hai trăm bảy mươi lượt chia sẻ tiếp trong buổi sáng.',
              'Tới trưa, có ba phụ huynh nhắn vào nhóm nói họ vừa xin nghỉ làm để đón con sớm.',
              'Một cô nhắn: "Em run quá không làm được gì, em đón con về rồi."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đầu giờ chiều, chị Thu — phụ huynh của bé Minh Anh — bình luận một dòng ngắn:',
              '"Chị Nga ơi, cái tin này em thấy đăng từ 2019 rồi. Hồi đó công an có đính chính là không có vụ nào như vậy."',
              'Kèm theo là một đường dẫn tới thông báo chính thức.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Tin cũ, kịch bản cũ',
            variant: 'info',
            text: 'Bài cảnh báo này thuộc một họ nội dung xuất hiện đều đặn nhiều năm ở nhiều nước, đổi tên địa phương và đổi loại kẹo mỗi lần. Cấu trúc luôn giống nhau: một nạn nhân trẻ em không có tên, một mối nguy vô hình không phân biệt được, và một lời kêu gọi chia sẻ. Không cần ai bịa mới — chỉ cần thả lại tin cũ đúng vào mùa tựu trường.',
          },
          {
            type: 'bias-detector',
            title: 'Bóc từng câu trong bài cô Nga đã chia sẻ',
            instruction:
              'Bấm vào từng cụm được bôi đậm và chọn xem nó có vấn đề gì. Cả bài chỉ có năm câu.',
            article: {
              text: BAI_CANH_BAO,
              source: 'Bài đăng lan truyền trong các nhóm phụ huynh (nội dung mô phỏng)',
            },
            biasOptions: [
              { id: 'khong-nguon', label: 'Không có nguồn kiểm chứng được' },
              { id: 'khai-quat', label: 'Khái quát vội, không thể kiểm chứng' },
              { id: 'so-dong', label: 'Viện dẫn số đông' },
              { id: 'giai-thoai', label: 'Bằng chứng giai thoại' },
              { id: 'thuc-ep', label: 'Thúc ép hành động, khai thác nỗi sợ' },
            ],
            segments: [
              {
                id: 'g1',
                text: 'Một bé gái 6 tuổi ở Hà Nội đã tử vong sau khi ăn kẹo lạ',
                startIndex: BAI_CANH_BAO.indexOf('Một bé gái 6 tuổi'),
                biasType: 'khong-nguon',
                explanation:
                  'Một ca tử vong trẻ em là sự kiện luôn được báo chí và cơ quan chức năng đưa tin. Ở đây không có tên trường, không có quận, không có ngày, không có nguồn tin nào. Một sự kiện lớn tới vậy mà không truy được về đâu thì bản thân sự thiếu vắng đó đã là dấu hiệu mạnh nhất.',
              },
              {
                id: 'g2',
                text: 'nhìn giống hệt kẹo thường nên không thể phân biệt',
                startIndex: BAI_CANH_BAO.indexOf('nhìn giống hệt kẹo thường'),
                biasType: 'khai-quat',
                explanation:
                  'Câu này làm hai việc cùng lúc: nó khẳng định một điều không kiểm chứng được, và nó chặn trước mọi cách phòng ngừa. Nếu không thể phân biệt thì người đọc không còn hành động nào ngoài hoảng sợ và chia sẻ — đúng điều bài viết muốn.',
              },
              {
                id: 'g3',
                text: 'Ai cũng biết bọn buôn ma tuý bây giờ nhắm vào trẻ em',
                startIndex: BAI_CANH_BAO.indexOf('Ai cũng biết'),
                biasType: 'so-dong',
                explanation:
                  '"Ai cũng biết" được dùng thay cho bằng chứng, và đồng thời chặn phản biện: ai nghi ngờ thì hoá ra không thuộc nhóm "ai cũng". Nó cũng gắn một câu chuyện chưa kiểm chứng vào một nỗi lo có thật, khiến cả hai trở nên đáng tin hơn.',
              },
              {
                id: 'g4',
                text: 'Một cô giáo mà tôi quen nói trường nào cũng có rồi',
                startIndex: BAI_CANH_BAO.indexOf('Một cô giáo mà tôi quen'),
                biasType: 'giai-thoai',
                explanation:
                  'Mượn uy tín của một quan hệ cá nhân không kiểm tra được: không tên, không trường, không biết cô giáo đó nghe từ đâu. Cùng một kỹ thuật với "người nhà tôi làm bên đó" — tạo cảm giác có nguồn mà không cung cấp gì để kiểm chứng.',
              },
              {
                id: 'g5',
                text: 'hãy chia sẻ ngay để cứu con em mình',
                startIndex: BAI_CANH_BAO.indexOf('hãy chia sẻ ngay'),
                biasType: 'thuc-ep',
                explanation:
                  'Đây là chi tiết cho thấy bài viết được thiết kế để lan chứ không phải để thông tin. Nó gắn hành động chia sẻ với việc cứu trẻ em, nên không chia sẻ trở thành một lựa chọn có lỗi. Một cảnh báo thật cung cấp thông tin và để bạn tự quyết; nó không giao cho bạn một nhiệm vụ đạo đức.',
              },
            ],
          },
          {
            type: 'text',
            title: 'Năm câu, năm vấn đề',
            paragraphs: [
              'Cô Nga đọc lại bài viết sau khi biết nó là tin cũ, và cô đếm được năm chỗ có vấn đề trong năm câu.',
              'Cô đọc bài đó buổi sáng và không thấy chỗ nào cả.',
              'Cùng một người, cùng một bài viết, cách nhau tám tiếng. Khác biệt duy nhất là buổi sáng cô đang sợ.',
            ],
          },
          {
            type: 'question',
            question:
              'Điều gì giải thích tốt nhất việc cô Nga không thấy lỗi nào lúc sáng nhưng thấy đủ năm lỗi lúc chiều?',
            options: [
              { id: 'a', text: 'Buổi sáng cô đọc quá nhanh', isCorrect: false },
              { id: 'b', text: 'Khi đang lo sợ, năng lực đánh giá thông tin bị thu hẹp — ta chuyển sang chế độ phản ứng, và mọi chi tiết đáng ngờ đều được đọc như bằng chứng bổ sung', isCorrect: true },
              { id: 'c', text: 'Buổi chiều cô đã có người chỉ ra nên dễ thấy hơn', isCorrect: false },
              { id: 'd', text: 'Bài viết đã được sửa trong ngày', isCorrect: false },
            ],
            explanation:
              'Đọc nhanh chỉ là biểu hiện, không phải nguyên nhân. Trong trạng thái lo sợ, con người chuyển sang chế độ ưu tiên hành động, và các chi tiết mơ hồ được lấp đầy theo hướng xác nhận nỗi sợ chứ không theo hướng nghi ngờ. Đây là lý do vì sao mọi nội dung được thiết kế để lan đều bắt đầu bằng việc kích hoạt cảm xúc trước khi đưa ra nội dung.',
          },
          {
            type: 'text',
            title: 'Ba phụ huynh đón con sớm',
            paragraphs: [
              'Cô Nga nhắn riêng cho ba người đã xin nghỉ làm để xin lỗi.',
              'Hai người bảo không sao. Người thứ ba, chị Hoa làm công nhân may, nhắn lại một dòng khiến cô Nga đọc đi đọc lại:',
              '"Không sao đâu chị. Em nghỉ nửa ngày bị trừ ba trăm ngàn thôi. Con em an toàn là được rồi."',
            ],
          },
          {
            type: 'question',
            question:
              'Ba trăm nghìn của chị Hoa nói lên điều gì về chi phí của một tin sai?',
            options: [
              { id: 'a', text: 'Chi phí không đáng kể so với sự an toàn của trẻ em', isCorrect: false },
              { id: 'b', text: 'Chi phí là có thật, rơi vào người ít khả năng chịu nhất, và không bao giờ được ai thống kê', isCorrect: true },
              { id: 'c', text: 'Chi phí này là lỗi của chị Hoa vì đã phản ứng thái quá', isCorrect: false },
              { id: 'd', text: 'Chi phí này sẽ được nơi làm việc bồi hoàn', isCorrect: false },
            ],
            explanation:
              'Ba trăm nghìn nghe nhỏ, nhưng nó rơi vào một công nhân may chứ không rơi vào người viết ra tin đồn. Đây là mô hình chung: người tạo tin không mất gì, người chia sẻ không mất gì, và chi phí dồn về phía những người phản ứng mạnh nhất — thường là những người lo cho con nhiều nhất và có ít nguồn lực nhất để chịu thiệt.',
          },
          {
            type: 'text',
            title: 'Cô Nga đếm thử',
            paragraphs: [
              'Cô ngồi tính: nếu chỉ ba người báo là có nghỉ làm, thì trong tám trăm người có bao nhiêu người đã lo lắng cả ngày mà không nói ra?',
              'Bao nhiêu đứa trẻ tối đó bị dặn dò trong sợ hãi rằng ai cho gì cũng đừng nhận?',
              'Không có con số nào cho những thứ đó, và sẽ không bao giờ có.',
            ],
          },
          {
            type: 'text',
            title: 'Cô Nga xoá bài',
            paragraphs: [
              'Việc đầu tiên cô Nga làm là xoá bài đăng của mình.',
              'Rồi cô ngồi nhìn màn hình khá lâu, và cô nhận ra việc xoá không giải quyết được gì.',
              'Hai trăm bảy mươi người đã chia sẻ tiếp. Ba phụ huynh đã xin nghỉ làm. Và cả tám trăm người trong nhóm đã đọc.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Xoá bài chỉ làm biến mất bằng chứng rằng cô đã chia sẻ nó.',
              'Nó không thu hồi được thông tin đã vào đầu tám trăm người, và nó không nói cho ai biết rằng tin đó sai.',
              'Cô Nga nhận ra mình vừa định làm một việc để bản thân đỡ ngượng, chứ không phải để sửa vấn đề.',
            ],
          },
          {
            type: 'text',
            title: 'Cái giá của việc là người quản trị',
            paragraphs: [
              'Có một chi tiết làm chuyện này khác với việc một phụ huynh bình thường chia sẻ nhầm.',
              'Cô Nga là quản trị viên. Bài của cô nằm trong nhóm cô lập ra, và với nhiều người trong đó, việc cô chia sẻ đã là một dạng xác nhận.',
              'Chị Hoa nhắn: "Em thấy chị đăng nên em tin liền chị ơi."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao cùng một nội dung, người quản trị nhóm chia sẻ lại có sức nặng hơn thành viên thường?',
            options: [
              { id: 'a', text: 'Vì bài của quản trị viên được hệ thống ưu tiên hiển thị', isCorrect: false },
              { id: 'b', text: 'Vì người quản trị được mặc định là đã sàng lọc, nên việc họ đăng được đọc như một sự bảo chứng', isCorrect: true },
              { id: 'c', text: 'Vì quản trị viên thường có nhiều bạn bè hơn', isCorrect: false },
              { id: 'd', text: 'Vì thành viên không được phép nghi ngờ quản trị viên', isCorrect: false },
            ],
            explanation:
              'Người quản trị là người duyệt bài, gỡ bài, đặt quy tắc — nên trong mắt thành viên, thứ họ tự tay đăng đã đi qua một lớp sàng lọc. Sự bảo chứng đó không do ai trao chính thức và người quản trị cũng thường không ý thức mình đang có. Nhưng nó có thật, và nó khiến trách nhiệm kiểm chứng của người quản trị cao hơn hẳn thành viên thường.',
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Xoá không phải là đính chính',
            variant: 'warning',
            text: 'Gỡ một bài sai xuống là việc nên làm, nhưng nó chỉ dừng dòng chảy chứ không sửa được thứ đã chảy ra. Người đã đọc vẫn nhớ nội dung, và họ sẽ không bao giờ biết nó sai nếu không có ai nói. Xoá trong im lặng còn có một tác hại phụ: những người đã chia sẻ tiếp tiếp tục lan mà không hề biết nguồn gốc đã bị rút.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Vì sao ta chia sẻ trước khi kiểm chứng',
            description: 'Cơ chế đằng sau cú bấm hai giây, và ba dấu hiệu của nội dung được thiết kế để lan.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Cơ chế',
                  paragraphs: [
                    'Nội dung kích hoạt cảm xúc mạnh — sợ hãi, phẫn nộ, thương xót — trước khi đưa ra thông tin.',
                    'Trong trạng thái đó, ta chuyển sang chế độ ưu tiên hành động; các chi tiết mơ hồ được lấp đầy theo hướng xác nhận cảm xúc đang có.',
                    'Nút chia sẻ biến sự lo lắng thành một hành động cụ thể, và hành động đó làm ta thấy nhẹ hơn — nên ta bấm.',
                    'Việc dừng lại để kiểm chứng lúc đó có cảm giác như chậm trễ vô trách nhiệm, chứ không có cảm giác như thận trọng.',
                  ],
                },
                {
                  heading: 'Ba dấu hiệu của nội dung được thiết kế để lan',
                  paragraphs: [
                    'Nạn nhân cụ thể nhưng không có danh tính: một bé gái, một cụ ông, không tên, không nơi, không ngày.',
                    'Mối nguy được mô tả là không thể phân biệt hoặc không thể phòng tránh — điều này chặn mọi hành động ngoài việc chia sẻ.',
                    'Lời kêu gọi chia sẻ nằm ngay trong nội dung, thường gắn với một nghĩa vụ đạo đức.',
                  ],
                },
                {
                  heading: 'Khi đã lỡ chia sẻ',
                  paragraphs: [
                    'Xoá bài là bước đầu nhưng không đủ: người đã đọc vẫn nhớ nội dung và sẽ không biết nó sai.',
                    'Đính chính phải đi đúng con đường mà tin sai đã đi — cùng nhóm đó, cùng những người đó.',
                    'Đính chính hiệu quả nhất đến từ chính người đã lan tin, vì nó mang tính tự nhận và không có động cơ nào khác.',
                  ],
                },
              ],
              relatedConcepts: ['Tin giả', 'Nội dung thiết kế để lan', 'Đính chính'],
              furtherReading: [
                'Bài học "Tin giả — Tại sao nó lan nhanh gấp 6 lần tin thật" trong khoá Logic 101',
                'Các thông báo đính chính tin đồn của cơ quan công an về những tin lan truyền theo mùa',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Không kiểm chứng thường không phải do thiếu kỹ năng, mà do kỹ năng bị vô hiệu hoá bởi cảm xúc mạnh.\n' +
              '✓ Nội dung thiết kế để lan luôn có ba thứ: nạn nhân không danh tính, mối nguy không phòng tránh được, và lời kêu gọi chia sẻ.\n' +
              '✓ Cùng một người đọc cùng một bài, lúc đang sợ thì không thấy lỗi nào, lúc bình tĩnh thì thấy đủ.\n' +
              '✓ Xoá bài chỉ dừng dòng chảy; nó không sửa được thứ đã vào đầu người đọc.',
          },
          {
            type: 'text',
            title: 'Nhưng có một chuyện cô Nga chưa hiểu',
            paragraphs: [
              'Chị Thu nói tin này đã lan từ năm 2019, và cơ quan chức năng đã đính chính ngay từ hồi đó.',
              'Vậy tại sao sau sáu năm nó vẫn quay lại, vẫn lan được hai trăm bảy mươi lượt trong một buổi sáng?',
              'Còn cái thông báo đính chính của công an thì cô Nga chưa từng thấy lần nào trong suốt sáu năm ấy.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'vi-sao-tin-sai-lan-nhanh-hon',
        title: 'Vì sao tin sai lan nhanh hơn',
        blocks: [
          {
            type: 'text',
            title: 'Sáu năm và một thông báo không ai đọc',
            paragraphs: [
              'Cô Nga mở đường dẫn chị Thu gửi. Đó là một thông báo đính chính, đăng từ 2019.',
              'Bài đính chính có bốn trăm lượt tương tác.',
              'Còn bài cảnh báo gốc, chỉ riêng đợt lan lần này, đã có hơn hai nghìn lượt chia sẻ trên các nhóm mà cô tìm được.',
            ],
          },
          {
            type: 'callout',
            icon: 'trending-up',
            title: 'Chênh lệch không phải ngẫu nhiên',
            variant: 'info',
            text: 'Các nghiên cứu về lan truyền thông tin trên mạng xã hội cho thấy tin sai lan xa hơn, nhanh hơn và sâu hơn tin thật — trong một nghiên cứu quy mô lớn trên dữ liệu nhiều năm, tin sai có khả năng được lan tới hàng nghìn người cao hơn nhiều lần so với tin thật. Và điều quan trọng: phần lớn do người thật chia sẻ, không phải do tài khoản tự động.',
          },
          {
            type: 'question',
            question:
              'Vì sao tin sai lại lan nhanh hơn tin thật, dù phần lớn người chia sẻ đều có thiện chí?',
            options: [
              { id: 'a', text: 'Vì có nhiều người cố tình phát tán tin sai', isCorrect: false },
              { id: 'b', text: 'Vì tin sai không bị ràng buộc bởi sự thật nên được tối ưu cho tính mới lạ và cảm xúc — hai thứ quyết định việc người ta bấm chia sẻ', isCorrect: true },
              { id: 'c', text: 'Vì thuật toán cố tình ưu tiên tin sai', isCorrect: false },
              { id: 'd', text: 'Vì tin thật thường được đăng muộn hơn', isCorrect: false },
            ],
            explanation:
              'Một tin thật bị ràng buộc: nó phải khớp với sự việc, phải kèm điều kiện, phải thừa nhận chỗ chưa rõ. Một tin sai thì tự do — nó có thể chọn chi tiết gây sốc nhất, con số tròn nhất, kết luận dứt khoát nhất. Cuộc đua giữa hai bên là không cân sức ngay từ đầu, và nó không cần tới ý đồ xấu của bất kỳ ai để diễn ra.',
          },
          {
            type: 'text',
            title: 'Bốn thứ khiến người ta bấm chia sẻ',
            paragraphs: [
              'Cô Nga tự xem lại: trong ba tháng qua cô đã chia sẻ những gì, và vì sao.',
              'Cô liệt kê ra và thấy chúng rơi vào bốn nhóm khá rõ:',
              '😨 Sợ — cảnh báo về nguy hiểm cho con cái.',
              '😡 Giận — chuyện bất công, ai đó bị đối xử tệ.',
              '😮 Ngạc nhiên — thông tin trái với những gì cô vẫn nghĩ.',
              '🤝 Thuộc về — thứ mà chia sẻ nó cho thấy cô là người thế nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô nhận ra không nhóm nào trong bốn nhóm đó liên quan tới việc thông tin có đúng hay không.',
              'Cô chưa từng chia sẻ một bài nào vì lý do "cái này được kiểm chứng kỹ".',
              'Và những bài cô thấy đúng nhất, đáng tin nhất — các bài phân tích dài, có dẫn nguồn — thì cô đọc rồi để đó.',
            ],
          },
          {
            type: 'pair-match',
            title: 'Cảm xúc nào đẩy nội dung nào?',
            instruction:
              'Nối mỗi loại cảm xúc với dạng nội dung khai thác nó mạnh nhất.',
            pairs: [
              {
                id: 'e1',
                left: 'Sợ cho con cái',
                right: 'Cảnh báo về mối nguy vô hình ở trường học, đồ ăn, đồ chơi',
              },
              {
                id: 'e2',
                left: 'Phẫn nộ trước bất công',
                right: 'Video một người bị đối xử tệ, cắt ra khỏi bối cảnh trước và sau',
              },
              {
                id: 'e3',
                left: 'Ngạc nhiên vì trái với hiểu biết cũ',
                right: '"Sự thật mà ngành y giấu bạn suốt mấy chục năm"',
              },
              {
                id: 'e4',
                left: 'Muốn cho thấy mình thuộc về nhóm nào',
                right: 'Nội dung khẳng định giá trị của nhóm và chê nhóm đối lập',
              },
            ],
          },
          {
            type: 'text',
            title: 'Thứ tư là thứ cô Nga khó nhận nhất',
            paragraphs: [
              'Ba nhóm đầu thì cô Nga nhận ra ngay.',
              'Nhóm thứ tư — chia sẻ để cho thấy mình là người thế nào — thì cô phải ngồi khá lâu mới thừa nhận.',
              'Cô nhớ lại một bài cô từng đăng về việc dạy con tự lập, và cô nhớ cảm giác lúc bấm đăng: cô muốn các mẹ khác thấy cô là người mẹ như thế.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là động cơ ít được nói tới nhất nhưng có lẽ mạnh nhất.',
              'Khi ta chia sẻ một nội dung, ta không chỉ truyền thông tin — ta còn phát đi một tín hiệu về mình: tôi là người quan tâm tới con cái, tôi là người tỉnh táo, tôi là người thuộc phe này.',
              'Và tín hiệu đó hoạt động tốt như nhau dù nội dung đúng hay sai.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Chia sẻ là một hành vi xã hội, không phải hành vi thông tin',
            variant: 'info',
            text: 'Nếu chia sẻ chỉ là truyền thông tin, ta sẽ ưu tiên thứ đúng nhất. Nhưng nó còn là cách ta nói với người khác mình là ai và mình đứng ở đâu. Hiểu được điều này giải thích vì sao chỉ ra một tin là sai thường không đủ để người ta gỡ nó xuống — vì cái họ nhận được từ việc chia sẻ không nằm ở tính đúng đắn của nội dung.',
          },
          {
            type: 'question',
            question:
              'Nếu chia sẻ là hành vi xã hội, thì điều đó gợi ý gì về cách làm giảm việc lan tin sai?',
            options: [
              { id: 'a', text: 'Cần phạt nặng những người chia sẻ tin sai', isCorrect: false },
              { id: 'b', text: 'Cần làm cho việc kiểm chứng trước khi chia sẻ trở thành một điều đáng tự hào trong nhóm, chứ không chỉ nhắc người ta rằng tin đó sai', isCorrect: true },
              { id: 'c', text: 'Cần hạn chế số lần chia sẻ mỗi ngày', isCorrect: false },
              { id: 'd', text: 'Cần yêu cầu mọi người đọc hết bài trước khi chia sẻ', isCorrect: false },
            ],
            explanation:
              'Nếu người ta chia sẻ để phát tín hiệu về bản thân, thì cách bền vững là đổi tín hiệu nào được coi trọng. Trong một nhóm mà việc kiểm nguồn được khen và việc chia sẻ vội bị coi là hớ hênh, người ta sẽ tự kiểm trước khi bấm — không phải vì sợ phạt mà vì họ muốn được nhìn nhận là người cẩn thận. Đây cũng là lý do sự thay đổi phải đến từ bên trong nhóm chứ không từ một quy định áp xuống.',
          },
          {
            type: 'text',
            title: 'Vì sao đính chính không bao giờ đuổi kịp',
            paragraphs: [
              'Cô Nga nhìn hai con số một lần nữa: hai nghìn lượt chia sẻ tin gốc, bốn trăm lượt tương tác bài đính chính.',
              'Và cô hiểu ra chênh lệch đó bằng chính bốn nhóm cảm xúc cô vừa liệt kê.',
              'Một bài đính chính không gây sợ, không gây giận, không gây ngạc nhiên, và chia sẻ nó không nói gì hay ho về người chia sẻ — nó chỉ nói rằng người này từng tin nhầm.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Thêm nữa, bài đính chính luôn phức tạp hơn bài gốc.',
              'Bài gốc: "Có kẹo tẩm ma tuý ở cổng trường." Một câu, ai cũng hiểu.',
              'Bài đính chính: "Không có ca nào được ghi nhận; tin này xuất phát từ một tin đồn lan ở nước ngoài năm 2019; điều đó không có nghĩa là không cần dặn con cẩn thận với người lạ, chỉ có nghĩa là câu chuyện cụ thể này không có thật." Bốn ý, và ý thứ ba dễ bị hiểu nhầm thành bao che.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Sự thật thường phức tạp hơn, và đó là bất lợi thật',
            variant: 'warning',
            text: 'Đây không phải lời than mà là một đặc điểm cần tính tới khi thiết kế cách nói. Nếu bạn muốn một lời đính chính đi được xa, nó phải ngắn được như tin gốc — một câu đầu tiên dứt khoát, phần giải thích để sau. Bắt đầu bằng "chuyện này phức tạp hơn bạn tưởng" là cách chắc chắn nhất để không ai đọc tiếp.',
          },
          {
            type: 'text',
            title: 'Cô Nga viết lại bài đính chính của mình',
            paragraphs: [
              'Bản đầu cô viết dài bốn đoạn, giải thích cặn kẽ. Cô đọc lại và biết sẽ không ai đọc hết.',
              'Bản thứ hai bắt đầu bằng đúng một câu in đậm:',
              '"TIN KẸO TẨM MA TUÝ Ở CỔNG TRƯỜNG LÀ TIN CŨ TỪ 2019, CÔNG AN ĐÃ ĐÍNH CHÍNH — KHÔNG CÓ VỤ NÀO NHƯ VẬY."',
              'Phần giải thích và đường dẫn để bên dưới.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô cũng mượn đúng công thức của tin gốc: câu đầu ngắn, dứt khoát, viết hoa.',
              'Cô thấy hơi kỳ khi làm vậy, như thể đang bắt chước cái thứ mình vừa phê phán.',
              'Nhưng cô nghĩ: cái sai của tin gốc nằm ở nội dung, không nằm ở việc nó viết ngắn và rõ.',
            ],
          },
          {
            type: 'text',
            title: 'Vế thứ hai suýt bị bỏ quên',
            paragraphs: [
              'Chị Thu đọc bản nháp và góp một ý mà cô Nga thấy quan trọng.',
              '"Chị nói tin đó sai thôi thì có mẹ sẽ hiểu là chị bảo đừng lo gì hết. Rồi họ giận chị."',
              'Cô Nga thêm một câu vào cuối: "Không có vụ này, nhưng dặn con không nhận đồ của người lạ thì vẫn nên dặn nghen các mẹ."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao một lời đính chính cần giữ lại phần "mối lo của bạn vẫn chính đáng"?',
            options: [
              { id: 'a', text: 'Để người viết đỡ bị ghét', isCorrect: false },
              { id: 'b', text: 'Vì nếu chỉ bác bỏ câu chuyện mà không thừa nhận mối lo, người nghe sẽ đọc lời đính chính như một lời bảo họ đừng quan tâm — và họ sẽ bác lại thay vì tiếp nhận', isCorrect: true },
              { id: 'c', text: 'Vì như vậy lời đính chính sẽ dài hơn và đáng tin hơn', isCorrect: false },
              { id: 'd', text: 'Vì quy định của nhóm yêu cầu như vậy', isCorrect: false },
            ],
            explanation:
              'Người chia sẻ tin cảnh báo không gắn bó với câu chuyện cụ thể — họ gắn bó với việc bảo vệ con mình. Nếu lời đính chính nghe như phủ nhận cả mối lo đó, nó tấn công vào thứ họ thực sự quan tâm và bị chống lại ngay. Tách rõ hai vế — câu chuyện này không có thật, mối lo của bạn vẫn đúng — giữ cho người nghe không phải chọn giữa việc tin bạn và việc lo cho con.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Vì sao tin sai lan nhanh hơn tin thật',
            description: 'Bốn động cơ đằng sau nút chia sẻ, và cách viết một lời đính chính đi được xa.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Cuộc đua không cân sức',
                  paragraphs: [
                    'Tin thật bị ràng buộc bởi sự việc: phải kèm điều kiện, phải thừa nhận chỗ chưa rõ, phải chính xác về mức độ.',
                    'Tin sai được tự do chọn chi tiết gây sốc nhất, con số tròn nhất, kết luận dứt khoát nhất.',
                    'Phần lớn việc lan truyền do người thật thực hiện với thiện chí, không phải do tài khoản tự động.',
                  ],
                },
                {
                  heading: 'Bốn động cơ đằng sau nút chia sẻ',
                  paragraphs: [
                    'Sợ: cảnh báo về nguy hiểm, đặc biệt là nguy hiểm cho trẻ em.',
                    'Giận: bất công, ai đó bị đối xử tệ, thường kèm video cắt khỏi bối cảnh.',
                    'Ngạc nhiên: thông tin trái với hiểu biết sẵn có, kiểu "sự thật bị giấu kín".',
                    'Thuộc về: chia sẻ để cho thấy mình là ai và đứng ở đâu — động cơ ít được thừa nhận nhất nhưng mạnh nhất.',
                    'Không động cơ nào trong bốn cái liên quan tới việc nội dung có đúng hay không.',
                  ],
                },
                {
                  heading: 'Viết một lời đính chính đi được xa',
                  paragraphs: [
                    'Câu đầu tiên phải ngắn và dứt khoát như tin gốc. Đặt kết luận lên trước, giải thích để sau.',
                    'Đừng bắt đầu bằng "chuyện này phức tạp hơn bạn tưởng" — đó là cách chắc chắn nhất để không ai đọc tiếp.',
                    'Đi đúng con đường mà tin sai đã đi: cùng nhóm đó, cùng những người đó.',
                    'Tách rõ hai ý: câu chuyện cụ thể này không có thật, nhưng mối lo chung của bạn vẫn chính đáng. Bỏ vế thứ hai thì lời đính chính bị đọc thành bao che.',
                  ],
                },
              ],
              relatedConcepts: ['Lan truyền tin sai', 'Chia sẻ như hành vi xã hội', 'Thiết kế lời đính chính'],
              furtherReading: [
                'Bài học "Tin giả" trong khoá Logic 101',
                'Nghiên cứu của MIT (2018) về tốc độ và phạm vi lan truyền của tin thật và tin sai trên mạng xã hội',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Tin sai lan nhanh hơn vì nó không bị ràng buộc bởi sự thật, nên được tối ưu cho tính mới lạ và cảm xúc.\n' +
              '✓ Bốn động cơ đằng sau nút chia sẻ — sợ, giận, ngạc nhiên, thuộc về — đều không liên quan tới tính đúng đắn.\n' +
              '✓ Chia sẻ là hành vi xã hội: nó phát tín hiệu về người chia sẻ, và tín hiệu đó hoạt động dù nội dung đúng hay sai.\n' +
              '✓ Muốn lời đính chính đi xa, câu đầu tiên phải ngắn và dứt khoát như tin gốc.',
          },
          {
            type: 'text',
            title: 'Nhưng cô Nga muốn nhiều hơn một lời đính chính',
            paragraphs: [
              'Đính chính một bài thì được. Nhưng tháng sau sẽ có bài khác, và cô sẽ lại là người đọc trong hai giây rồi bấm.',
              'Cô muốn một thứ dùng được mỗi lần, cho cả cô lẫn tám trăm người trong nhóm.',
              'Và nó phải ngắn — vì một danh sách mười lăm bước thì chính cô cũng sẽ không dùng.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'ba-cau-truoc-khi-bam',
        title: 'Ba câu trước khi bấm',
        blocks: [
          {
            type: 'text',
            title: 'Danh sách đầu tiên cô Nga viết',
            paragraphs: [
              'Cô Nga tìm trên mạng và gặp một danh sách kiểm tra nguồn tin gồm năm nhóm tiêu chí, mỗi nhóm ba tới bốn câu hỏi.',
              'Cô đọc thấy hay, in ra, dán lên tủ lạnh.',
              'Hai tuần sau cô nhận ra mình chưa dùng nó lần nào.',
            ],
          },
          {
            type: 'callout',
            icon: 'clipboard',
            title: 'Vì sao danh sách dài không được dùng',
            variant: 'info',
            text: 'Khoảnh khắc cần kiểm tra là khoảnh khắc ngón tay đang ở trên nút chia sẻ, thường là lúc đang bận, đang xúc động, và đang cầm điện thoại bằng một tay. Một công cụ đòi mười lăm câu hỏi thì không cạnh tranh nổi với hai giây. Công cụ phù hợp phải vừa với đúng khoảnh khắc mà nó cần được dùng.',
          },
          {
            type: 'question',
            question:
              'Cô Nga nên rút gọn danh sách theo nguyên tắc nào?',
            options: [
              { id: 'a', text: 'Giữ những câu hỏi quan trọng nhất về mặt lý thuyết', isCorrect: false },
              { id: 'b', text: 'Giữ những câu trả lời được trong vài giây bằng chính thứ đang hiển thị trên màn hình', isCorrect: true },
              { id: 'c', text: 'Giữ những câu mà cô thấy dễ nhớ nhất', isCorrect: false },
              { id: 'd', text: 'Giữ những câu áp dụng được cho mọi loại nội dung', isCorrect: false },
            ],
            explanation:
              'Một câu hỏi hay nhưng đòi mở trình duyệt, tra cứu và đối chiếu thì sẽ bị bỏ qua trong thực tế. Tiêu chí lọc đúng là: câu này có trả lời được ngay bằng thứ đang ở trên màn hình không? Ba câu trả lời được ngay có giá trị thực tế cao hơn hẳn mười lăm câu đúng nhưng không ai dùng.',
          },
          {
            type: 'text',
            title: 'Ba câu cô Nga giữ lại',
            paragraphs: [
              'Cô rút xuống còn ba câu, và cả ba đều trả lời được mà không cần rời khỏi bài đang đọc:',
              '1️⃣ Ai nói? Có tên, có nơi, có ngày không?',
              '2️⃣ Bài này có bảo tôi chia sẻ ngay không?',
              '3️⃣ Nếu đúng thì báo nào đưa? Tôi có thấy ở đâu khác không?',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu một bắt được phần lớn tin đồn, vì tin đồn hầu như không bao giờ có đủ ba thứ đó.',
              'Câu hai bắt được nội dung thiết kế để lan — một bản tin thật không giao nhiệm vụ cho người đọc.',
              'Câu ba là câu tốn công nhất, nhưng nó chỉ mất một lần gõ tìm, và nó bắt được nhóm còn lại.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Câu thứ ba mạnh hơn vẻ ngoài của nó',
            variant: 'info',
            text: 'Một sự kiện lớn — trẻ em tử vong, một vụ bắt giữ, một quy định mới — thì luôn có nhiều nơi đưa tin. Nếu bạn gõ tìm và chỉ thấy đúng cái ảnh chụp màn hình đang lan, không có nơi nào khác nhắc tới, thì sự vắng mặt đó là bằng chứng mạnh. Sự kiện càng lớn mà càng ít nơi đưa tin thì càng đáng nghi.',
          },
          {
            type: 'question',
            question:
              'Vì sao "một sự kiện lớn mà chỉ có một nguồn duy nhất đưa tin" lại đáng nghi?',
            options: [
              { id: 'a', text: 'Vì nguồn duy nhất đó chắc chắn là nguồn giả', isCorrect: false },
              { id: 'b', text: 'Vì sự kiện càng lớn thì càng nhiều nơi có động lực đưa tin — nên sự vắng mặt của các nguồn khác cần một lời giải thích', isCorrect: true },
              { id: 'c', text: 'Vì báo chí luôn đưa tin đầy đủ mọi sự kiện', isCorrect: false },
              { id: 'd', text: 'Vì tin độc quyền là không hợp lệ', isCorrect: false },
            ],
            explanation:
              'Đây không phải quy tắc tuyệt đối — vẫn có những tin độc quyền có thật, do một nhà báo điều tra ra trước. Nhưng với loại sự kiện mà ai cũng đưa được nếu nó xảy ra, việc chỉ tồn tại một ảnh chụp màn hình vô danh đòi hỏi một lời giải thích. Và lời giải thích thường gặp nhất — "báo chí bị bịt miệng" — thì bản thân nó cũng cần bằng chứng, chứ không phải một giả định miễn phí.',
          },
          {
            type: 'text',
            title: 'Cô Nga đưa ba câu vào nhóm',
            paragraphs: [
              'Cô không đăng nó dưới dạng nội quy. Cô đăng nó dưới dạng câu chuyện của mình.',
              'Bài đăng kể lại buổi sáng hôm đó: cô đọc mười giây, cô bấm, ba mẹ nghỉ làm, chị Hoa mất ba trăm nghìn.',
              'Cuối bài mới là ba câu hỏi, kèm một dòng: "Em viết ra cho em nhớ, các mẹ thấy dùng được thì dùng."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bài đó có hơn năm trăm lượt tương tác, nhiều hơn hẳn bài đính chính.',
              'Và trong phần bình luận, sáu phụ huynh kể chuyện họ cũng từng chia sẻ nhầm.',
              'Một chị viết: "Em tưởng mỗi em hớ. Hoá ra ai cũng vậy."',
            ],
          },
          {
            type: 'text',
            title: 'Anh Tuấn phản đối lần nữa',
            paragraphs: [
              'Anh Tuấn — quản trị viên từng phản đối chuyện siết quy tắc đăng ảnh — lại có ý kiến.',
              '"Giờ cái gì cũng phải kiểm thì ai còn dám đăng gì nữa. Nhóm mình thành ra khó tính quá."',
              'Cô Nga không cãi. Cô hỏi: "Vậy anh thấy trong ba câu đó, câu nào là câu khó nhất phải làm?"',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh Tuấn đọc lại rồi nói: "Ừ thì thật ra ba câu này cũng nhanh."',
              'Cô Nga nói: "Em cũng nghĩ vậy. Mà em không bắt ai làm hết. Em chỉ để đó, ai thấy tiện thì dùng."',
              'Ba tuần sau, chính anh Tuấn là người đầu tiên bình luận "cái này không có nguồn nha các mẹ" dưới một bài đăng mới.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao cách phản ứng của cô Nga với anh Tuấn lại hiệu quả hơn việc tranh luận rằng anh sai?',
            options: [
              { id: 'a', text: 'Vì anh Tuấn vốn không thực sự phản đối', isCorrect: false },
              { id: 'b', text: 'Vì cô yêu cầu anh xem xét nội dung cụ thể thay vì bảo vệ lập trường chung, và cô không đặt anh vào thế phải thua', isCorrect: true },
              { id: 'c', text: 'Vì cô Nga là quản trị viên chính nên có quyền quyết định', isCorrect: false },
              { id: 'd', text: 'Vì ba tuần là đủ lâu để anh quên mất mình từng phản đối', isCorrect: false },
            ],
            explanation:
              'Nếu cô Nga tranh luận "anh sai rồi, nhóm cần quy tắc", anh Tuấn sẽ phải bảo vệ lập trường mình vừa nêu. Câu hỏi "câu nào là câu khó nhất" thì không đụng tới lập trường — nó chỉ mời anh nhìn vào nội dung cụ thể. Và khi nhìn vào nội dung, anh tự thấy nó không nặng nề như anh tưởng. Không ai phải rút lại lời nào.',
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nhưng ba câu không bắt được mọi thứ',
            variant: 'warning',
            text: 'Ba câu này bắt tốt tin đồn vô danh và nội dung giật gân. Chúng không bắt được tin có nguồn thật nhưng bị diễn giải sai, không bắt được số liệu bị bóp méo, và không bắt được nội dung đúng nhưng thiếu bối cảnh. Biết giới hạn của công cụ mình dùng cũng quan trọng như biết cách dùng nó.',
          },
          {
            type: 'text',
            title: 'Trường hợp ba câu không đủ',
            paragraphs: [
              'Hai tháng sau có một bài trong nhóm dẫn hẳn tên một nghiên cứu, có năm công bố, có tên trường đại học.',
              'Ba câu của cô Nga đều cho qua: có tên, không kêu chia sẻ, và tìm ra được nhiều nơi khác nhắc tới.',
              'Nhưng chị Thu đọc kỹ và phát hiện nghiên cứu đó làm trên chuột, cỡ mẫu ba mươi con, còn bài đăng thì viết như thể kết luận áp dụng cho trẻ em.',
            ],
          },
          {
            type: 'question',
            question:
              'Trường hợp này gợi ý điều gì về việc dùng danh sách kiểm tra?',
            options: [
              { id: 'a', text: 'Danh sách kiểm tra là vô dụng, cần đọc kỹ mọi thứ', isCorrect: false },
              { id: 'b', text: 'Danh sách lọc được phần lớn ở vòng đầu, nhưng những nội dung vượt qua nó thì cần một lớp kiểm tra khác về nội dung chứ không chỉ về nguồn', isCorrect: true },
              { id: 'c', text: 'Cần bổ sung thêm mười câu hỏi vào danh sách', isCorrect: false },
              { id: 'd', text: 'Nghiên cứu khoa học nói chung không đáng tin', isCorrect: false },
            ],
            explanation:
              'Ba câu hỏi là bộ lọc về nguồn, và bộ lọc đó làm rất tốt việc của nó: loại bỏ tin vô danh và nội dung giật gân, tức là phần lớn. Nhưng nguồn thật không bảo đảm diễn giải đúng. Lớp thứ hai hỏi về nội dung: nghiên cứu này làm trên ai, cỡ mẫu bao nhiêu, và kết luận trong bài có rộng hơn kết luận của nghiên cứu không?',
          },
          {
            type: 'text',
            title: 'Cô Nga thêm một câu thứ tư',
            paragraphs: [
              'Cô không thêm mười câu. Cô thêm đúng một câu, và chỉ dùng cho những bài đã qua ba câu đầu:',
              '4️⃣ Bài này kết luận có rộng hơn cái nghiên cứu nó dẫn không?',
              'Cô diễn đạt lại cho dễ nhớ hơn: "Người ta nghiên cứu trên ai, mà bài này nói cho ai?"',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Câu này bắt được rất nhiều thứ: nghiên cứu trên chuột viết thành lời khuyên cho người, nghiên cứu trên ba mươi người viết thành kết luận cho cả dân số, nghiên cứu ở nước khác viết như đã kiểm chứng ở Việt Nam.',
              'Và nó vẫn trả lời được trong vài giây, nếu bài viết có dẫn nguồn.',
              'Nếu bài viết không cho biết nghiên cứu làm trên ai, thì bản thân điều đó đã là câu trả lời.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Bốn câu trước khi bấm chia sẻ',
            description: 'Bộ lọc hai lớp, đủ ngắn để dùng thật, kèm giới hạn của nó.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Lớp một — về nguồn (ba câu, trả lời ngay trên màn hình)',
                  paragraphs: [
                    'Ai nói? Có tên, có nơi, có ngày không? Tin đồn hầu như không bao giờ có đủ ba thứ.',
                    'Bài này có bảo tôi chia sẻ ngay không? Một bản tin thật không giao nhiệm vụ cho người đọc.',
                    'Nếu chuyện này có thật thì còn nơi nào đưa tin? Sự kiện càng lớn mà càng ít nơi nhắc tới thì càng đáng nghi.',
                  ],
                },
                {
                  heading: 'Lớp hai — về nội dung (một câu, cho những bài đã qua lớp một)',
                  paragraphs: [
                    'Người ta nghiên cứu trên ai, mà bài này nói cho ai?',
                    'Bắt được: nghiên cứu trên động vật viết thành lời khuyên cho người; cỡ mẫu nhỏ viết thành kết luận chung; kết quả ở bối cảnh khác viết như đã kiểm chứng tại chỗ.',
                    'Nếu bài không cho biết nghiên cứu làm trên ai, bản thân điều đó đã là câu trả lời.',
                  ],
                },
                {
                  heading: 'Giới hạn cần biết',
                  paragraphs: [
                    'Bốn câu này không bắt được số liệu bị bóp méo bằng cách trình bày, không bắt được nội dung đúng nhưng thiếu bối cảnh, và không bắt được tiêu đề sai gắn với bài viết đúng.',
                    'Chúng cũng không thay được việc đọc hết bài trước khi chia sẻ.',
                    'Biết giới hạn của công cụ quan trọng ngang với biết cách dùng nó — một bộ lọc được tin tưởng quá mức còn nguy hiểm hơn không có bộ lọc.',
                  ],
                },
              ],
              relatedConcepts: ['Kiểm chứng nguồn', 'Khái quát vượt dữ liệu', 'Giới hạn của công cụ'],
              furtherReading: [
                'Bài học "CRAAP test — Đánh giá nguồn trong 5 câu hỏi" trong khoá Logic 101',
                'Câu chuyện của bác Tư trong khoá Logic 101 — truy một tin về tận nguồn',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Công cụ kiểm chứng phải vừa với đúng khoảnh khắc nó cần được dùng: ngón tay đang ở trên nút chia sẻ.\n' +
              '✓ Ba câu trả lời được ngay trên màn hình có giá trị thực tế cao hơn mười lăm câu đúng nhưng không ai dùng.\n' +
              '✓ Sự kiện càng lớn mà càng ít nơi đưa tin thì sự vắng mặt đó càng là bằng chứng.\n' +
              '✓ Nguồn thật không bảo đảm diễn giải đúng — cần thêm một câu về nội dung: nghiên cứu trên ai, bài nói cho ai?',
          },
          {
            type: 'text',
            title: 'Nhưng còn một việc khó hơn tất cả',
            paragraphs: [
              'Cô Nga đã có công cụ cho chính mình, và cô đã chia sẻ nó với nhóm.',
              'Nhưng có một việc cô vẫn tránh: trong bài đăng kể chuyện, cô viết "em đọc mười giây rồi bấm" — mà cô không nói rõ rằng chính cô là người khiến chị Hoa mất ba trăm nghìn.',
              'Cô nhận ra mình đã kể câu chuyện theo cách để mình trông đỡ tệ hơn. Và cô biết rằng chừng nào còn làm vậy, cô chưa thật sự học xong.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'toi-co-the-sai',
        title: '"Tôi có thể sai"',
        blocks: [
          {
            type: 'text',
            title: 'Cái câu cô Nga đã tránh',
            paragraphs: [
              'Trong bài kể chuyện, cô Nga viết "em đọc mười giây rồi bấm".',
              'Cô không viết: "Chị Hoa nghỉ nửa ngày mất ba trăm nghìn vì bài em đăng."',
              'Cô đọc lại bài của mình và nhận ra cô đã kể một câu chuyện về sự bất cẩn nói chung, chứ không phải về việc cô làm ai đó thiệt hại.',
            ],
          },
          {
            type: 'callout',
            icon: 'message',
            title: 'Khoảng cách giữa hai câu',
            variant: 'info',
            text: '"Tin đó là tin sai, các mẹ lưu ý nhé." — "Em đăng cái tin đó, và vì em đăng nên có mẹ nghỉ làm mất tiền." Cả hai đều đúng sự thật. Câu thứ nhất thông tin về một tin sai; câu thứ hai thông tin về việc cô Nga đã làm gì.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc nói rõ mình đã gây ra hậu quả lại có tác dụng khác hẳn với việc chỉ báo rằng tin đó sai?',
            options: [
              { id: 'a', text: 'Vì nó khiến người khác thông cảm hơn với cô Nga', isCorrect: false },
              { id: 'b', text: 'Vì nó cho người khác thấy hậu quả là có thật và có thể xảy ra với chính họ — trong khi "tin đó sai" chỉ là một thông tin không gắn với ai', isCorrect: true },
              { id: 'c', text: 'Vì đó là nghĩa vụ của người quản trị nhóm', isCorrect: false },
              { id: 'd', text: 'Vì nó giúp chị Hoa được bồi thường', isCorrect: false },
            ],
            explanation:
              'Một lời cảnh báo trừu tượng — "hãy cẩn thận với tin sai" — hầu như không đổi được hành vi ai, vì không ai tự thấy mình trong đó. Một câu chuyện có người cụ thể, thiệt hại cụ thể, và người gây ra nhận trách nhiệm thì khác hẳn: người đọc thấy được đường đi từ cú bấm tới hậu quả, và họ thấy chính mình ở đầu con đường ấy.',
          },
          {
            type: 'text',
            title: 'Vì sao cô Nga tránh',
            paragraphs: [
              'Cô Nga thành thật với chính mình về lý do.',
              'Cô là quản trị viên. Nhóm này là thứ cô xây bốn năm. Cô sợ rằng nếu nói rõ, cô sẽ mất cái uy tín để nói bất cứ điều gì về sau.',
              'Cô cũng sợ có người sẽ nói: "Chính chị đăng mà giờ chị dạy người ta."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Chị Thu, người phát hiện ra tin sai, nói với cô một câu.',
              '"Chị nghĩ ngược rồi. Nếu chị nói ra thì mới có người nghe. Chứ chị đứng ngoài mà dạy thì ai nghe."',
              'Cô Nga nghĩ về câu đó cả tuần.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Khiêm tốn trí tuệ (intellectual humility)',
            variant: 'info',
            text: 'Là khả năng thừa nhận rằng mình có thể sai, và thừa nhận cụ thể chỗ mình đã sai. Nó không phải sự tự ti hay do dự — người khiêm tốn trí tuệ vẫn phát biểu dứt khoát và vẫn hành động. Điều họ làm khác là gắn một mức độ tin cậy vào phát biểu của mình, và sửa mức độ đó khi có bằng chứng mới.',
          },
          {
            type: 'question',
            question:
              'Vì sao thừa nhận mình từng sai lại làm tăng chứ không giảm sức nặng lời nói của một người?',
            options: [
              { id: 'a', text: 'Vì người ta thương cảm với người biết nhận lỗi', isCorrect: false },
              { id: 'b', text: 'Vì nó cho thấy người đó phân biệt được cái mình biết chắc với cái mình đoán — nên khi họ nói chắc, lời đó đáng tin hơn', isCorrect: true },
              { id: 'c', text: 'Vì nó chứng minh người đó có kinh nghiệm', isCorrect: false },
              { id: 'd', text: 'Vì nó khiến người khác ngại phản bác', isCorrect: false },
            ],
            explanation:
              'Một người chưa bao giờ nhận sai thì mọi phát biểu của họ đều mang cùng một độ chắc chắn — và người nghe không có cách nào phân biệt phần họ biết rõ với phần họ đang đoán. Một người từng nói "chỗ này tôi sai" thì đã chứng minh rằng họ có phân biệt. Vì thế khi họ nói "cái này tôi chắc", lời đó mang thông tin thật.',
          },
          {
            type: 'text',
            title: 'Cô Nga thử viết ra lý lẽ của phía bên kia',
            paragraphs: [
              'Trước khi đăng, cô Nga làm một việc: cô viết ra lập luận mạnh nhất chống lại việc cô nói ra.',
              '"Nói ra sẽ làm nhóm mất lòng tin vào quản trị viên. Nhóm này giúp được nhiều mẹ, và nếu người ta bớt tin nhóm thì thiệt hại còn lớn hơn ba trăm nghìn của một người."',
              'Cô ngồi nhìn lập luận đó và thấy nó không hề dở.',
            ],
          },
          {
            type: 'question',
            question:
              'Cô Nga vẫn quyết định đăng dù lập luận phản đối có lý. Điều gì làm cán cân nghiêng?',
            options: [
              { id: 'a', text: 'Cô muốn được nhẹ lòng', isCorrect: false },
              { id: 'b', text: 'Vì lòng tin dựa trên việc không ai biết mình từng sai là loại lòng tin sẽ sụp khi sự thật lộ ra — nó không phải thứ đáng bảo vệ', isCorrect: true },
              { id: 'c', text: 'Vì chị Thu đã biết nên sớm muộn cũng lộ', isCorrect: false },
              { id: 'd', text: 'Vì cô muốn làm gương cho các mẹ khác', isCorrect: false },
            ],
            explanation:
              'Lập luận phản đối có một lỗ hổng: nó bảo vệ một thứ lòng tin xây trên việc thiếu thông tin. Loại lòng tin đó vừa mong manh vừa không đáng giữ — và quan trọng hơn, giữ nó nghĩa là nhóm sẽ tiếp tục coi quản trị viên là người không sai, tức là tiếp tục không kiểm chứng bài của quản trị viên. Chính điều đó mới là rủi ro lớn hơn.',
          },
          {
            type: 'text',
            title: 'Hai chuyện cô Nga vẫn không làm',
            paragraphs: [
              'Cô không đi nhắn riêng cho từng người trong hai trăm bảy mươi người đã chia sẻ tiếp — cô nghĩ như vậy là biến chuyện của mình thành gánh nặng cho người khác.',
              'Và cô không đăng lại chuyện này mỗi khi có tin đồn mới, dù cô đã nghĩ tới.',
              'Nhắc đi nhắc lại lỗi của mình thì sau vài lần sẽ thành một cách khác để nói về bản thân, chứ không còn giúp ai.',
            ],
          },
          {
            type: 'text',
            title: 'Cô Nga viết bài thứ hai',
            paragraphs: [
              'Bài này ngắn hơn bài trước nhiều.',
              '"Em xin nói lại cho rõ. Cái tin kẹo tẩm ma tuý hôm trước là em đăng. Em đọc mười giây rồi bấm chia sẻ. Vì em đăng nên có ba mẹ xin nghỉ làm, trong đó có mẹ bị trừ lương."',
              '"Em là quản trị viên nhóm này, đáng lẽ em phải kiểm trước. Em xin lỗi các mẹ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Rồi cô viết thêm hai câu cuối, và đó là hai câu cô đắn đo nhất:',
              '"Em không hứa em sẽ không sai nữa, tại em biết em sẽ còn sai. Em chỉ dán ba câu hỏi kia lên tủ lạnh."',
              '"Các mẹ thấy em đăng gì mà nghi thì cứ hỏi em, đừng ngại. Em không giận đâu."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Không hứa hẹn thứ mình không giữ được',
            variant: 'warning',
            text: 'Một lời xin lỗi kèm lời hứa "sẽ không bao giờ tái phạm" nghe mạnh hơn nhưng yếu hơn trên thực tế: lần sau sai nữa thì cả lời xin lỗi lẫn lời hứa đều mất giá. Nói rõ mình sẽ còn sai và nêu cơ chế mình sẽ dùng thì trung thực hơn — và nó mời người khác vào việc kiểm tra, thay vì đặt tất cả kỳ vọng lên ý chí của một người.',
          },
          {
            type: 'text',
            title: 'Điều xảy ra sau bài đó',
            paragraphs: [
              'Bài có hơn tám trăm lượt tương tác, nhiều nhất trong lịch sử nhóm.',
              'Không có ai chỉ trích cô. Có mười một người kể chuyện họ cũng từng chia sẻ nhầm, trong đó có hai người kể chuyện gây hậu quả nặng hơn nhiều.',
              'Chị Hoa bình luận: "Chị đừng áy náy nữa chị ơi. Em còn không nhớ vụ đó."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Thứ cô Nga sợ nhất — mất uy tín — không xảy ra.',
              'Cô nghĩ mãi vì sao, và cô cho rằng lý do là thế này: trong nhóm đó, ai cũng từng chia sẻ nhầm. Khi cô nói ra, cô không tự tách mình khỏi họ mà đứng vào giữa họ.',
              'Người ta không mất lòng tin vào một người thừa nhận điều mà chính họ cũng làm.',
            ],
          },
          {
            type: 'text',
            title: 'Một năm sau',
            paragraphs: [
              'Nhóm phụ huynh giờ có một thói quen mà cô Nga không hề đặt thành nội quy.',
              'Khi ai đó đăng một cảnh báo, sẽ có người bình luận: "Chị ơi cái này có nguồn không chị?" — và câu hỏi đó không còn bị coi là bắt bẻ.',
              'Có lần một mẹ đăng bài rồi tự bình luận bên dưới: "À em tra rồi, cái này tin cũ, em xoá nha các mẹ."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô Nga nghĩ đó là kết quả lớn nhất, và nó không đến từ ba câu hỏi.',
              'Nó đến từ việc người quản trị nhóm đã công khai nói mình sai — nên việc nói mình sai trở thành chuyện bình thường trong nhóm đó.',
              '"Cái mình dán lên tủ lạnh thì mình dùng," cô nói. "Còn cái mình nói ra trước tám trăm người thì người ta dùng."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thừa nhận mình sai một cách hữu ích',
            description: 'Bốn phần của một lời đính chính có tác dụng, và vì sao nó làm tăng chứ không giảm uy tín.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn phần của một lời đính chính có tác dụng',
                  paragraphs: [
                    'Nói rõ mình đã làm gì, không chỉ nói rằng thông tin đó sai. "Em đăng cái tin đó" khác hẳn "tin đó là tin sai".',
                    'Nêu hậu quả cụ thể nếu có. Người đọc cần thấy đường đi từ hành động tới thiệt hại.',
                    'Đừng hứa sẽ không bao giờ sai nữa — nêu cơ chế bạn sẽ dùng thay vì nêu quyết tâm.',
                    'Mời người khác kiểm tra mình. Nó chuyển việc phòng sai từ ý chí cá nhân sang một cơ chế có nhiều người tham gia.',
                  ],
                },
                {
                  heading: 'Vì sao nó làm tăng uy tín',
                  paragraphs: [
                    'Người chưa bao giờ nhận sai thì mọi phát biểu đều mang cùng một độ chắc chắn, nên người nghe không phân biệt được phần biết rõ với phần đang đoán.',
                    'Người từng nói "chỗ này tôi sai" đã chứng minh mình có phân biệt — nên khi họ nói chắc, lời đó mang thông tin.',
                    'Khi bạn thừa nhận điều mà chính người nghe cũng từng làm, bạn đứng vào giữa họ chứ không tách khỏi họ.',
                  ],
                },
                {
                  heading: 'Tác dụng ở quy mô cộng đồng',
                  paragraphs: [
                    'Người có vị trí trong nhóm công khai nhận sai sẽ làm cho việc nhận sai trở thành chuyện bình thường trong nhóm đó.',
                    'Khi đó câu hỏi "cái này có nguồn không" không còn bị đọc là bắt bẻ hay không cùng phe.',
                    'Đây là thay đổi bền hơn mọi nội quy, vì nó đổi thứ được coi trọng chứ không đổi thứ bị cấm.',
                  ],
                },
              ],
              relatedConcepts: ['Khiêm tốn trí tuệ', 'Đính chính', 'Chuẩn mực nhóm'],
              furtherReading: [
                'Bài học "Intellectual humility — Tôi có thể sai" trong khoá Logic 101',
                'Bài học "Debate có văn hoá" trong khoá Logic 101',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ "Tin đó sai" và "tôi đã đăng tin đó" là hai câu rất khác nhau về tác dụng, dù cùng đúng sự thật.\n' +
              '✓ Thừa nhận mình sai làm tăng uy tín, vì nó chứng minh bạn phân biệt được cái biết chắc với cái đang đoán.\n' +
              '✓ Đừng hứa sẽ không bao giờ sai nữa — nêu cơ chế thay vì nêu quyết tâm, và mời người khác kiểm tra mình.\n' +
              '✓ Khi người có vị trí trong nhóm công khai nhận sai, việc nhận sai trở thành chuyện bình thường trong nhóm đó.',
          },
          {
            type: 'text',
            title: 'Điều cô Nga mang theo',
            paragraphs: [
              'Cô Nga vẫn quản trị nhóm tám trăm người. Vẫn có tin đồn mỗi tháng, và cô vẫn thỉnh thoảng suýt bấm.',
              'Ba câu hỏi vẫn dán trên tủ lạnh, cạnh tờ giấy về quyền riêng tư của con.',
              'Nhưng thứ cô nghĩ là quan trọng nhất không nằm trên tủ lạnh. Nó là hai giây cô dừng lại trước khi bấm, và câu cô tự hỏi trong hai giây đó:',
              '"Mình đang chia sẻ vì cái này đúng, hay vì mình đang sợ?"',
            ],
          },
        ],
      },
    ],
  },
};
