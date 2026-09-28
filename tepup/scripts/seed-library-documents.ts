/**
 * Script to seed sample library documents
 * Run: npx tsx scripts/seed-library-documents.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

const sampleDocuments = [
  {
    slug: 'chu-nghia-tu-ban',
    title: 'Chủ nghĩa tư bản',
    description: 'Hệ thống kinh tế dựa trên sở hữu tư nhân về tư liệu sản xuất và vận hành theo cơ chế thị trường tự do.',
    category: 'Định nghĩa',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Chủ nghĩa tư bản là một hệ thống kinh tế - xã hội trong đó tư liệu sản xuất (như nhà máy, máy móc, đất đai) thuộc sở hữu tư nhân thay vì sở hữu nhà nước hoặc tập thể.',
            'Trong chủ nghĩa tư bản, sản xuất và phân phối hàng hóa được điều tiết chủ yếu bởi cơ chế thị trường tự do, dựa trên quan hệ cung cầu, thay vì bởi kế hoạch hóa tập trung từ nhà nước.',
          ],
        },
        {
          heading: 'Đặc điểm chính',
          paragraphs: [
            'Quyền sở hữu tư nhân: Cá nhân và doanh nghiệp có quyền sở hữu, mua bán, và sử dụng tư liệu sản xuất để tạo ra lợi nhuận.',
            'Thị trường tự do: Giá cả và sản xuất được xác định bởi quan hệ cung cầu trên thị trường, ít có sự can thiệp của nhà nước.',
            'Cạnh tranh: Các doanh nghiệp cạnh tranh với nhau để thu hút khách hàng, thúc đẩy sáng tạo và hiệu quả kinh tế.',
            'Động lực lợi nhuận: Mục tiêu chính của hoạt động kinh tế là tối đa hóa lợi nhuận cho chủ sở hữu.',
          ],
        },
        {
          heading: 'Lịch sử hình thành',
          paragraphs: [
            'Chủ nghĩa tư bản bắt đầu hình thành ở châu Âu từ thế kỷ 16-17 thông qua quá trình công nghiệp hóa và phát triển thương mại quốc tế.',
            'Các nhà tư tưởng như Adam Smith đã đưa ra các lý thuyết nền tảng về thị trường tự do và "bàn tay vô hình" điều tiết nền kinh tế.',
          ],
        },
      ],
      relatedConcepts: [
        'Thị trường tự do',
        'Sở hữu tư nhân',
        'Chủ nghĩa xã hội',
        'Kinh tế thị trường',
        'Cạnh tranh kinh tế',
      ],
      furtherReading: [
        'Lịch sử phát triển chủ nghĩa tư bản từ thế kỷ 16',
        'So sánh chủ nghĩa tư bản và chủ nghĩa xã hội',
        'Vai trò của nhà nước trong nền kinh tế tư bản',
        'Các trường phái kinh tế tư bản chủ nghĩa',
      ],
    },
    sortOrder: 1,
  },
  {
    slug: 'cung-va-cau',
    title: 'Cung và Cầu',
    description: 'Hai lực lượng chính quyết định giá cả và số lượng hàng hóa trong nền kinh tế thị trường.',
    category: 'Khái niệm cơ bản',
    content: {
      sections: [
        {
          paragraphs: [
            'Cung và cầu là hai khái niệm cơ bản nhất trong kinh tế học, giải thích cách thị trường hoạt động và xác định giá cả.',
            'Cung (Supply): Số lượng hàng hóa mà người bán sẵn sàng cung cấp ở mỗi mức giá. Khi giá tăng, người bán thường muốn cung cấp nhiều hơn.',
            'Cầu (Demand): Số lượng hàng hóa mà người mua muốn mua ở mỗi mức giá. Khi giá giảm, người mua thường muốn mua nhiều hơn.',
            'Điểm cân bằng xảy ra khi cung bằng cầu, xác định giá thị trường và số lượng giao dịch. Đây là điểm mà cả người mua và người bán đều hài lòng.',
          ],
        },
      ],
      relatedConcepts: [
        'Giá cân bằng',
        'Đường cung',
        'Đường cầu',
        'Thị trường',
        'Độ co giãn',
      ],
      furtherReading: [
        'Các yếu tố ảnh hưởng đến cung và cầu',
        'Độ co giãn của cung và cầu',
        'Thặng dư người tiêu dùng và người sản xuất',
      ],
    },
    sortOrder: 2,
  },
  {
    slug: 'lam-phat',
    title: 'Lạm phát',
    description: 'Hiện tượng giá cả hàng hóa và dịch vụ tăng liên tục theo thời gian, làm giảm sức mua của đồng tiền.',
    category: 'Kinh tế vĩ mô',
    content: {
      sections: [
        {
          heading: 'Khái niệm',
          paragraphs: [
            'Lạm phát là sự gia tăng liên tục và bền vững của mức giá chung trong nền kinh tế. Nó được đo lường bằng chỉ số giá tiêu dùng (CPI) hoặc chỉ số giá sản xuất (PPI).',
            'Khi lạm phát xảy ra, cùng một số tiền sẽ mua được ít hàng hóa và dịch vụ hơn so với trước đó, tức là sức mua của đồng tiền bị giảm.',
          ],
        },
        {
          heading: 'Nguyên nhân',
          paragraphs: [
            'Lạm phát do cầu kéo: Khi tổng cầu trong nền kinh tế vượt quá khả năng cung ứng, giá cả sẽ tăng lên.',
            'Lạm phát do chi phí đẩy: Khi chi phí sản xuất tăng (như giá nguyên liệu, tiền lương), doanh nghiệp chuyển chi phí này sang người tiêu dùng.',
            'Lạm phát do cung tiền: Khi ngân hàng trung ương in quá nhiều tiền hoặc mở rộng tín dụng quá mức, lượng tiền trong lưu thông tăng nhanh hơn hàng hóa.',
          ],
        },
        {
          heading: 'Tác động',
          paragraphs: [
            'Tác động tiêu cực: Giảm sức mua, tạo bất ổn kinh tế, khó khăn cho người thu nhập cố định, làm méo mó quyết định đầu tư.',
            'Tác động tích cực (lạm phát vừa phải): Khuyến khích chi tiêu và đầu tư, giúp giảm gánh nặng nợ thực tế, tạo môi trường thuận lợi cho tăng trưởng.',
          ],
        },
      ],
      relatedConcepts: [
        'Chỉ số giá tiêu dùng (CPI)',
        'Giảm phát',
        'Siêu lạm phát',
        'Chính sách tiền tệ',
        'Ngân hàng trung ương',
      ],
      furtherReading: [
        'Lịch sử các đợt lạm phát lớn trên thế giới',
        'Cách các ngân hàng trung ương kiểm soát lạm phát',
        'Mối quan hệ giữa lạm phát và thất nghiệp (Đường cong Phillips)',
      ],
    },
    sortOrder: 3,
  },
  {
    slug: 'gdp-gross-domestic-product',
    title: 'GDP (Tổng sản phẩm quốc nội)',
    description: 'Chỉ số đo lường tổng giá trị thị trường của tất cả hàng hóa và dịch vụ cuối cùng được sản xuất trong một quốc gia.',
    category: 'Kinh tế vĩ mô',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'GDP (Gross Domestic Product) là tổng giá trị thị trường của tất cả hàng hóa và dịch vụ cuối cùng được sản xuất trong lãnh thổ một quốc gia trong một khoảng thời gian nhất định (thường là một năm).',
            'GDP chỉ tính hàng hóa và dịch vụ cuối cùng để tránh tính trùng lặp. Ví dụ: Chỉ tính giá trị chiếc bánh mì hoàn thiện, không tính riêng giá trị bột mì đã được dùng để làm bánh.',
          ],
        },
        {
          heading: 'Các cách tính GDP',
          paragraphs: [
            'Phương pháp chi tiêu: GDP = C + I + G + (X - M), trong đó C là tiêu dùng, I là đầu tư, G là chi tiêu chính phủ, X là xuất khẩu, M là nhập khẩu.',
            'Phương pháp thu nhập: Tính tổng thu nhập của tất cả các yếu tố sản xuất (tiền lương, tiền thuê, lãi suất, lợi nhuận).',
            'Phương pháp giá trị gia tăng: Tính tổng giá trị gia tăng ở mỗi khâu sản xuất.',
          ],
        },
        {
          heading: 'Ý nghĩa và hạn chế',
          paragraphs: [
            'GDP là chỉ số quan trọng nhất để đo lường sức khỏe kinh tế và so sánh giữa các quốc gia. Tăng trưởng GDP cao thường đồng nghĩa với nền kinh tế phát triển.',
            'Tuy nhiên, GDP có hạn chế: Không phản ánh phân phối thu nhập, không tính các hoạt động phi chính thức, không đo lường chất lượng cuộc sống hay tác động môi trường.',
          ],
        },
      ],
      relatedConcepts: [
        'GDP thực và GDP danh nghĩa',
        'GDP bình quân đầu người',
        'GNP (Tổng sản phẩm quốc dân)',
        'Tăng trưởng kinh tế',
        'Chu kỳ kinh doanh',
      ],
      furtherReading: [
        'Sự khác biệt giữa GDP và GNP',
        'Các quốc gia có GDP cao nhất thế giới',
        'Các chỉ số bổ sung cho GDP (HDI, GPI)',
      ],
    },
    sortOrder: 4,
  },
  {
    slug: 'that-nghiep',
    title: 'Thất nghiệp',
    description: 'Tình trạng người trong độ tuổi lao động có khả năng và mong muốn làm việc nhưng không tìm được việc làm.',
    category: 'Kinh tế vĩ mô',
    content: {
      sections: [
        {
          heading: 'Khái niệm',
          paragraphs: [
            'Thất nghiệp là tình trạng những người trong độ tuổi lao động, có đủ khả năng làm việc và đang tích cực tìm kiếm việc làm nhưng không có công việc.',
            'Tỷ lệ thất nghiệp được tính bằng số người thất nghiệp chia cho tổng lực lượng lao động (bao gồm cả người có việc làm và người thất nghiệp).',
          ],
        },
        {
          heading: 'Các loại thất nghiệp',
          paragraphs: [
            'Thất nghiệp ma sát: Thất nghiệp ngắn hạn xảy ra khi người lao động chuyển đổi công việc hoặc mới tốt nghiệp đang tìm việc.',
            'Thất nghiệp cơ cấu: Do sự thay đổi cơ cấu kinh tế hoặc công nghệ khiến một số ngành nghề bị loại bỏ trong khi kỹ năng lao động không phù hợp với nhu cầu mới.',
            'Thất nghiệp chu kỳ: Xảy ra trong thời kỳ suy thoái kinh tế khi tổng cầu giảm, doanh nghiệp cắt giảm sản xuất và sa thải nhân viên.',
            'Thất nghiệp mùa vụ: Liên quan đến các công việc theo mùa như nông nghiệp, du lịch.',
          ],
        },
        {
          heading: 'Tác động',
          paragraphs: [
            'Tác động kinh tế: Giảm GDP, lãng phí nguồn lực lao động, giảm thu nhập và tiêu dùng, tăng chi tiêu cho phúc lợi xã hội.',
            'Tác động xã hội: Giảm chất lượng cuộc sống, tăng nghèo đói, gây căng thẳng tâm lý, có thể dẫn đến các vấn đề xã hội như tội phạm.',
          ],
        },
      ],
      relatedConcepts: [
        'Lực lượng lao động',
        'Tỷ lệ tham gia lực lượng lao động',
        'Thất nghiệp tự nhiên',
        'Đường cong Phillips',
        'Chính sách việc làm',
      ],
      furtherReading: [
        'Cách các chính phủ giải quyết vấn đề thất nghiệp',
        'Mối quan hệ giữa thất nghiệp và lạm phát',
        'Tác động của tự động hóa đến thị trường lao động',
      ],
    },
    sortOrder: 5,
  },
  // ============================================================
  // TÀI LIỆU TỪ CÂU CHUYỆN CỦA ĐỨC (Lao động số & Pháp luật lao động)
  // ============================================================
  {
    slug: 'nen-kinh-te-gig',
    title: 'Nền kinh tế Gig',
    description: 'Hệ thống kinh tế nơi người lao động làm việc theo từng nhiệm vụ ngắn hạn thông qua nền tảng số, thay vì việc làm cố định truyền thống.',
    category: 'Khái niệm cơ bản',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Nền kinh tế Gig (Gig Economy) là một hệ thống kinh tế trong đó người lao động làm việc theo từng nhiệm vụ ngắn hạn (gọi là "gig") thông qua các nền tảng số, thay vì làm việc cố định với hợp đồng lao động truyền thống.',
            'Thuật ngữ "gig" ban đầu được sử dụng trong ngành âm nhạc để chỉ các buổi biểu diễn ngắn hạn. Ngày nay, nó mô tả bất kỳ công việc tạm thời, linh hoạt nào được kết nối qua nền tảng công nghệ.',
          ],
        },
        {
          heading: 'Đặc điểm chính',
          paragraphs: [
            'Linh hoạt thời gian: Người lao động có thể tự chọn giờ làm việc, bật/tắt ứng dụng theo ý muốn.',
            'Thu nhập theo đơn: Không có lương cố định, thu nhập phụ thuộc vào số lượng nhiệm vụ hoàn thành.',
            'Không hợp đồng lao động truyền thống: Người lao động thường ký "hợp đồng hợp tác kinh doanh" hoặc "hợp đồng đối tác" thay vì hợp đồng lao động.',
            'Không có phúc lợi truyền thống: Người lao động Gig thường không được hưởng bảo hiểm xã hội, bảo hiểm y tế, nghỉ phép có lương, hay bồi thường tai nạn lao động.',
          ],
        },
        {
          heading: 'Các nền tảng tiêu biểu',
          paragraphs: [
            'Giao thông vận tải: Uber, Grab, Gojek, Be - kết nối tài xế với hành khách hoặc người gửi hàng.',
            'Giao đồ ăn: GrabFood, ShopeeFood, DoorDash - kết nối shipper với nhà hàng và khách hàng.',
            'Freelance: Fiverr, Upwork, Freelancer - kết nối lao động tự do với khách hàng cần dịch vụ chuyên môn.',
            'Tại Việt Nam, ước tính có hơn 200.000 tài xế xe ôm công nghệ và hàng trăm nghìn shipper giao hàng tham gia nền kinh tế Gig.',
          ],
        },
        {
          heading: 'Vấn đề phân loại lao động',
          paragraphs: [
            'Tranh cãi lớn nhất của nền kinh tế Gig xoay quanh câu hỏi: người lao động Gig là "đối tác độc lập" (independent contractor) hay "nhân viên" (employee)?',
            'Các nền tảng thường phân loại tài xế, shipper là "đối tác" để không phải thực hiện nghĩa vụ của người sử dụng lao động như đóng bảo hiểm xã hội, trả phép năm, bồi thường tai nạn.',
            'Năm 2021, Tòa án Tối cao Vương quốc Anh phán quyết tài xế Uber là "người lao động" (worker), có quyền hưởng lương tối thiểu và nghỉ phép. Năm 2024, Liên minh Châu Âu ban hành chỉ thị mới yêu cầu các nền tảng phải chứng minh tài xế không phải nhân viên.',
          ],
        },
      ],
      relatedConcepts: [
        'Quản lý bằng thuật toán',
        'Quan hệ lao động',
        'Phúc lợi linh hoạt',
        'Lương tối thiểu',
        'Bảo hiểm xã hội',
      ],
      furtherReading: [
        'Uber BV v. Aslam - Phán quyết của Tòa án Tối cao Anh (2021)',
        'Chỉ thị của EU về lao động nền tảng (2024)',
        'So sánh nền kinh tế Gig ở các quốc gia khác nhau',
        'Tương lai của việc làm trong kỷ nguyên số',
      ],
    },
    sortOrder: 6,
  },
  {
    slug: 'quan-ly-bang-thuat-toan',
    title: 'Quản lý bằng thuật toán',
    description: 'Hình thức quản lý lao động thông qua phần mềm và hệ thống tự động, nơi thuật toán thay thế con người trong việc phân công, giám sát và đánh giá công việc.',
    category: 'Khái niệm cơ bản',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Quản lý bằng thuật toán (Algorithmic Management) là hình thức quản lý lao động trong đó các chức năng quản lý truyền thống được giao cho hệ thống phần mềm tự động. Thuật toán đưa ra quyết định về phân công công việc, đánh giá hiệu suất, và kỷ luật - thay cho con người.',
            'Khái niệm này xuất hiện cùng với sự phát triển của các nền tảng số như Uber, Grab, Amazon, nơi hàng trăm nghìn lao động được quản lý bởi phần mềm thay vì quản lý con người.',
          ],
        },
        {
          heading: 'Các chức năng chính',
          paragraphs: [
            'Phân công công việc: Thuật toán quyết định ai nhận nhiệm vụ nào dựa trên vị trí, xếp hạng, lịch sử hoạt động. Ví dụ: app gọi xe phân cuốc cho tài xế gần nhất có điểm đánh giá cao.',
            'Định giá tự động: Thuật toán điều chỉnh giá theo cung cầu thời gian thực (surge pricing). Tài xế không có quyền tự định giá dịch vụ.',
            'Đánh giá hiệu suất: Hệ thống xếp hạng sao từ khách hàng (1-5 sao) quyết định cơ hội nhận việc. Tài xế dưới 4.5 sao bị giảm đơn hoặc vô hiệu hóa tài khoản.',
            'Kỷ luật tự động: Từ chối nhiều đơn liên tiếp dẫn đến bị "ẩn" khỏi hệ thống (shadow banning) - một hình thức phạt ngầm không có cảnh báo rõ ràng.',
          ],
        },
        {
          heading: 'Vấn đề quyền lực bất đối xứng',
          paragraphs: [
            'Thuật toán tạo ra mối quan hệ quyền lực bất đối xứng: công ty kiểm soát mọi khía cạnh công việc qua thuật toán, nhưng không nhận trách nhiệm của người sử dụng lao động.',
            'Khác với quản lý con người, thuật toán là "hộp đen" - người lao động không biết tại sao mình bị giảm đơn, không thể thương lượng hay khiếu nại hiệu quả.',
            'Giám sát 24/7 qua GPS, thời gian phản hồi, tỷ lệ chấp nhận đơn - mức độ kiểm soát chặt chẽ hơn cả quản lý truyền thống, dù người lao động được gọi là "đối tác độc lập".',
          ],
        },
      ],
      relatedConcepts: [
        'Nền kinh tế Gig',
        'Trí tuệ nhân tạo',
        'Giám sát lao động',
        'Quyền riêng tư',
        'Surge pricing',
      ],
      furtherReading: [
        'Báo cáo của Human Rights Watch về bóc lột lao động qua thuật toán (2025)',
        'So sánh quản lý thuật toán và quản lý truyền thống',
        'Quy định của EU về AI trong quản lý lao động',
      ],
    },
    sortOrder: 7,
  },
  {
    slug: 'luong-toi-thieu',
    title: 'Lương tối thiểu',
    description: 'Mức lương thấp nhất mà pháp luật quy định người sử dụng lao động phải trả cho người lao động, nhằm đảm bảo mức sống cơ bản.',
    category: 'Pháp luật lao động',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Lương tối thiểu (Minimum Wage) là mức thù lao thấp nhất mà pháp luật quy định người sử dụng lao động phải trả cho người lao động trong một đơn vị thời gian làm việc (giờ, ngày, hoặc tháng).',
            'Mục đích của lương tối thiểu là bảo vệ người lao động khỏi bị trả lương quá thấp, đảm bảo nhu cầu sống tối thiểu cho bản thân và gia đình.',
          ],
        },
        {
          heading: 'Lịch sử',
          paragraphs: [
            'New Zealand là quốc gia đầu tiên trên thế giới ban hành luật lương tối thiểu vào năm 1894, tiếp theo là bang Victoria của Úc năm 1896.',
            'Luật lương tối thiểu ra đời từ phong trào lao động cuối thế kỷ 19, khi công nhân nhà máy đấu tranh chống lại điều kiện lao động khắc nghiệt và mức lương bóc lột trong thời kỳ Cách mạng Công nghiệp.',
            'Ngày nay, hơn 90% các quốc gia trên thế giới có quy định về lương tối thiểu dưới nhiều hình thức khác nhau.',
          ],
        },
        {
          heading: 'Hệ thống lương tối thiểu vùng tại Việt Nam',
          paragraphs: [
            'Việt Nam áp dụng hệ thống lương tối thiểu theo 4 vùng, phân chia dựa trên chi phí sinh hoạt và điều kiện kinh tế - xã hội của từng khu vực.',
            'Từ ngày 01/01/2026, mức lương tối thiểu tháng: Vùng I (TP.HCM, Hà Nội...): 5.310.000đ/tháng; Vùng II: 4.730.000đ; Vùng III: 4.140.000đ; Vùng IV: 3.700.000đ.',
            'Lương tối thiểu giờ tương ứng: Vùng I: 25.500đ/giờ; Vùng II: 22.700đ/giờ; Vùng III: 19.900đ/giờ; Vùng IV: 17.800đ/giờ.',
            'Lưu ý: Lương tối thiểu chỉ áp dụng cho người lao động có hợp đồng lao động. Người lao động Gig (tài xế công nghệ, shipper) thường không được bảo vệ bởi quy định này vì được phân loại là "đối tác".',
          ],
        },
      ],
      relatedConcepts: [
        'Bảo hiểm xã hội',
        'Quan hệ lao động',
        'Nền kinh tế Gig',
        'Bộ Luật Lao Động',
        'Mức sống tối thiểu',
      ],
      furtherReading: [
        'Lịch sử phong trào đấu tranh cho lương tối thiểu trên thế giới',
        'So sánh lương tối thiểu giữa các quốc gia ASEAN',
        'Tranh luận kinh tế về tác động của lương tối thiểu',
      ],
    },
    sortOrder: 8,
  },
  {
    slug: 'cach-mang-cong-nghiep',
    title: 'Cách mạng Công nghiệp',
    description: 'Quá trình chuyển đổi từ nền kinh tế nông nghiệp, thủ công sang nền kinh tế công nghiệp, sản xuất bằng máy móc, bắt đầu từ cuối thế kỷ 18 tại Anh.',
    category: 'Lịch sử',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Cách mạng Công nghiệp (Industrial Revolution) là quá trình chuyển đổi căn bản từ nền sản xuất thủ công sang sản xuất bằng máy móc, diễn ra chủ yếu từ khoảng năm 1760 đến 1840, bắt đầu tại Anh và sau đó lan rộng ra châu Âu, Bắc Mỹ và toàn thế giới.',
            'Đây là một trong những bước ngoặt quan trọng nhất trong lịch sử nhân loại, thay đổi hoàn toàn cách con người sản xuất, làm việc và tổ chức xã hội.',
          ],
        },
        {
          heading: 'Tác động lên người lao động',
          paragraphs: [
            'Cách mạng Công nghiệp tạo ra một tầng lớp mới: công nhân nhà máy. Điều kiện lao động cực kỳ khắc nghiệt:',
            'Giờ làm việc: 14-16 tiếng mỗi ngày, 6 ngày/tuần, kể cả trẻ em.',
            'Lương thấp: Mức lương chỉ vừa đủ để tồn tại, thường thấp hơn mức sống tối thiểu.',
            'Không có bảo vệ: Không bảo hiểm, không nghỉ phép, không bồi thường tai nạn. Bị sa thải có thể xảy ra bất cứ lúc nào mà không cần lý do.',
            'Môi trường nguy hiểm: Nhà máy ô nhiễm, máy móc không có thiết bị an toàn, tai nạn lao động xảy ra thường xuyên.',
          ],
        },
        {
          heading: 'Phong trào lao động ra đời',
          paragraphs: [
            'Đối mặt với bóc lột, công nhân bắt đầu tổ chức các phong trào đấu tranh cho quyền lợi:',
            'Công đoàn (Trade Unions): Từ năm 1824, công đoàn được hợp pháp hóa tại Anh, cho phép công nhân thương lượng tập thể với chủ nhà máy.',
            'Đình công: Công nhân sử dụng đình công như vũ khí để đòi hỏi điều kiện làm việc tốt hơn.',
            'Kết quả sau hàng thập kỷ đấu tranh: Luật lao động đầu tiên, ngày làm việc 8 giờ, lương tối thiểu, quyền nghỉ phép có lương, bảo hiểm xã hội.',
          ],
        },
        {
          heading: 'Song song với thời đại số',
          paragraphs: [
            'Nhiều nhà nghiên cứu so sánh tình cảnh tài xế công nghệ ngày nay với công nhân nhà máy thế kỷ 19: cùng làm việc nhiều giờ, thu nhập thấp, không có bảo hiểm, bị kiểm soát chặt chẽ nhưng không được luật pháp bảo vệ.',
            'Công cụ bóc lột thay đổi - từ máy hơi nước sang thuật toán - nhưng bản chất mối quan hệ quyền lực giữa vốn và lao động vẫn tương tự.',
          ],
        },
      ],
      relatedConcepts: [
        'Nền kinh tế Gig',
        'Phong trào lao động',
        'Chủ nghĩa tư bản',
        'Công đoàn',
        'Luật lao động',
      ],
      furtherReading: [
        'Friedrich Engels - "Tình cảnh giai cấp lao động ở Anh" (1845)',
        'Lịch sử phong trào công đoàn ở Anh',
        'So sánh Cách mạng Công nghiệp lần 1 và Cách mạng Công nghiệp lần 4',
      ],
    },
    sortOrder: 9,
  },
  {
    slug: 'bao-hiem-xa-hoi',
    title: 'Bảo hiểm xã hội',
    description: 'Chính sách an sinh xã hội nhằm thay thế hoặc bù đắp một phần thu nhập cho người lao động khi họ gặp rủi ro như ốm đau, tai nạn, thai sản, nghỉ hưu.',
    category: 'Pháp luật lao động',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Bảo hiểm xã hội (BHXH) là chính sách an sinh xã hội của nhà nước, nhằm thay thế hoặc bù đắp một phần thu nhập cho người lao động khi họ bị giảm hoặc mất thu nhập do ốm đau, thai sản, tai nạn lao động, bệnh nghề nghiệp, thất nghiệp, về già.',
            'BHXH hoạt động theo nguyên tắc đóng - hưởng: người lao động và người sử dụng lao động cùng đóng góp vào quỹ BHXH trong thời gian làm việc, và người lao động được hưởng quyền lợi khi gặp rủi ro hoặc nghỉ hưu.',
          ],
        },
        {
          heading: 'Các chế độ BHXH tại Việt Nam',
          paragraphs: [
            'Ốm đau: Được nghỉ và hưởng 75% mức tiền lương đóng BHXH khi bị ốm.',
            'Thai sản: Nghỉ 6 tháng hưởng 100% lương khi sinh con.',
            'Tai nạn lao động - Bệnh nghề nghiệp: Được hưởng trợ cấp tùy mức suy giảm khả năng lao động.',
            'Hưu trí: Được hưởng lương hưu hàng tháng khi đủ tuổi nghỉ hưu và đóng BHXH tối thiểu 20 năm.',
            'Tử tuất: Thân nhân được hưởng trợ cấp khi người lao động qua đời.',
          ],
        },
        {
          heading: 'Mức đóng BHXH',
          paragraphs: [
            'Tại Việt Nam, mức đóng BHXH bắt buộc bao gồm:',
            'Người sử dụng lao động đóng: BHXH 17,5% + BHYT 3% + BHTN 1% = 21,5% quỹ lương.',
            'Người lao động đóng: BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5% lương.',
            'Tổng cộng: 32% lương được đóng vào các quỹ bảo hiểm, trong đó người sử dụng lao động chịu phần lớn.',
          ],
        },
        {
          heading: 'BHXH và lao động nền tảng',
          paragraphs: [
            'Người lao động nền tảng (tài xế công nghệ, shipper) hiện phần lớn không được tham gia BHXH bắt buộc vì được phân loại là "đối tác" chứ không phải nhân viên.',
            'Nếu lương cơ sở 8 triệu đồng/tháng, người lao động nền tảng mất khoảng 2,08 triệu đồng/tháng quyền lợi BHXH mà lẽ ra được hưởng (BHXH 1,4 triệu + BHYT 240.000đ + BHTN 80.000đ + phép năm 360.000đ).',
            'Sau 20 năm không đóng BHXH, người lao động sẽ không có lương hưu, không có thẻ BHYT khi về già - đây là hậu quả nghiêm trọng nhất của vùng xám pháp lý trong kinh tế Gig.',
          ],
        },
      ],
      relatedConcepts: [
        'Quan hệ lao động',
        'Lương tối thiểu',
        'Nền kinh tế Gig',
        'An sinh xã hội',
        'Bảo hiểm y tế',
      ],
      furtherReading: [
        'Luật Bảo hiểm xã hội 2024 - Những thay đổi quan trọng',
        'Lịch sử hệ thống BHXH trên thế giới',
        'Giải pháp mở rộng BHXH cho lao động phi chính thức',
      ],
    },
    sortOrder: 10,
  },
  {
    slug: 'quan-he-lao-dong',
    title: 'Quan hệ lao động',
    description: 'Quan hệ xã hội phát sinh trong việc thuê mướn, sử dụng lao động và trả công giữa người lao động và người sử dụng lao động.',
    category: 'Pháp luật lao động',
    content: {
      sections: [
        {
          heading: 'Định nghĩa theo pháp luật Việt Nam',
          paragraphs: [
            'Theo Điều 13, Bộ Luật Lao Động 2019 (Luật số 45/2019/QH14), quan hệ lao động là quan hệ xã hội phát sinh trong việc thuê mướn, sử dụng lao động, trả lương giữa người lao động, người sử dụng lao động, các tổ chức đại diện của các bên, cơ quan nhà nước có thẩm quyền.',
            'Bộ Luật Lao Động 2019 có hiệu lực từ ngày 01/01/2021, thay thế Bộ Luật Lao Động 2012, với nhiều sửa đổi quan trọng để đáp ứng yêu cầu phát triển kinh tế - xã hội và hội nhập quốc tế.',
          ],
        },
        {
          heading: '3 tiêu chí xác định quan hệ lao động',
          paragraphs: [
            'Tiêu chí 1 - Quản lý, điều hành: Có sự quản lý, điều hành, giám sát của một bên đối với bên kia trong quá trình thực hiện công việc. Ví dụ: app gọi xe phân cuốc, theo dõi GPS, xử phạt khi từ chối đơn.',
            'Tiêu chí 2 - Trả lương/thù lao: Một bên trả tiền công, tiền lương cho bên kia để thực hiện công việc. Ví dụ: app tính tiền cuốc và trả cho tài xế sau khi trừ phí dịch vụ.',
            'Tiêu chí 3 - Điều kiện làm việc: Công việc được thực hiện theo các điều kiện do bên thuê lao động quy định. Ví dụ: app quy định đồng phục, tiêu chuẩn xe, quy trình phục vụ khách.',
          ],
        },
        {
          heading: 'Hợp đồng lao động vs Hợp đồng dân sự',
          paragraphs: [
            'Hợp đồng lao động: Được điều chỉnh bởi Bộ Luật Lao Động. Người sử dụng lao động phải đóng BHXH, BHYT, BHTN; trả phép năm; bồi thường tai nạn lao động; trả trợ cấp thôi việc.',
            'Hợp đồng dân sự (hợp tác kinh doanh): Được điều chỉnh bởi Bộ Luật Dân sự. Các bên là đối tác bình đẳng, không có nghĩa vụ đóng bảo hiểm hay trả phúc lợi.',
            'Các nền tảng công nghệ sử dụng hợp đồng hợp tác kinh doanh (dân sự) để né tránh nghĩa vụ của người sử dụng lao động, dù thực tế mối quan hệ đáp ứng đủ tiêu chí quan hệ lao động.',
          ],
        },
        {
          heading: 'Vùng xám pháp lý trong kinh tế nền tảng',
          paragraphs: [
            'Dù tài xế công nghệ đáp ứng cả 3 tiêu chí quan hệ lao động, thực tế việc áp dụng luật gặp nhiều khó khăn: hợp đồng ký là hợp đồng dân sự, tài xế có thể bật/tắt app "linh hoạt", và chưa có án lệ hay hướng dẫn cụ thể.',
            'Đây là "vùng xám pháp lý" - khoảng trống mà luật pháp chưa theo kịp thực tế của kinh tế nền tảng số.',
            'Bộ Luật Lao Động 2019 đã mở rộng khái niệm "quan hệ lao động", nhưng việc áp dụng cho kinh tế Gig vẫn còn nhiều khoảng trống cần được bổ sung bằng nghị định và hướng dẫn cụ thể.',
          ],
        },
      ],
      relatedConcepts: [
        'Bảo hiểm xã hội',
        'Nền kinh tế Gig',
        'Lương tối thiểu',
        'Bộ Luật Lao Động',
        'Hợp đồng lao động',
      ],
      furtherReading: [
        'Bộ Luật Lao Động 2019 (Luật số 45/2019/QH14) - Toàn văn',
        'Nghiên cứu về lao động nền tảng trong pháp luật lao động Việt Nam',
        'Kinh nghiệm quốc tế về bảo vệ lao động nền tảng',
      ],
    },
    sortOrder: 11,
  },
  {
    slug: 'phuc-loi-linh-hoat',
    title: 'Phúc lợi linh hoạt',
    description: 'Mô hình phúc lợi gắn liền với cá nhân người lao động thay vì gắn với một công ty cụ thể, cho phép tích lũy quyền lợi khi làm việc cho nhiều nền tảng khác nhau.',
    category: 'Khái niệm cơ bản',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Phúc lợi linh hoạt (Portable Benefits) là mô hình phúc lợi lao động trong đó quyền lợi gắn liền với cá nhân người lao động, không phụ thuộc vào bất kỳ một người sử dụng lao động cụ thể nào.',
            'Trong mô hình truyền thống, phúc lợi (BHXH, BHYT, nghỉ phép...) gắn với hợp đồng lao động tại một công ty. Khi nghỉ việc, người lao động mất phúc lợi. Phúc lợi linh hoạt giải quyết vấn đề này bằng cách để quyền lợi đi theo người lao động.',
          ],
        },
        {
          heading: 'Tại sao cần phúc lợi linh hoạt?',
          paragraphs: [
            'Nền kinh tế Gig tạo ra hàng trăm triệu lao động làm việc cho nhiều nền tảng cùng lúc hoặc chuyển đổi thường xuyên. Mô hình phúc lợi truyền thống không phù hợp với thực tế này.',
            'Người lao động Gig hiện tại không được tham gia BHXH bắt buộc, không có bảo hiểm y tế từ nền tảng, không có lương hưu - dù đóng góp giá trị kinh tế lớn cho xã hội.',
            'Phúc lợi linh hoạt cho phép nhiều nền tảng cùng đóng góp vào một quỹ phúc lợi chung cho người lao động, tỷ lệ đóng góp theo thu nhập từ mỗi nền tảng.',
          ],
        },
        {
          heading: 'Mô hình hoạt động',
          paragraphs: [
            'Mỗi nền tảng đóng góp vào quỹ phúc lợi cá nhân của người lao động theo tỷ lệ phần trăm thu nhập. Ví dụ: nếu tài xế kiếm 60% từ Grab, 40% từ Be, cả hai công ty cùng đóng BHXH theo tỷ lệ tương ứng.',
            'Quyền lợi tích lũy liên tục bất kể người lao động làm việc cho ai, ở đâu, hay thay đổi nền tảng bao nhiêu lần.',
            'Quỹ phúc lợi có thể bao gồm: bảo hiểm y tế, bảo hiểm tai nạn, hưu trí, nghỉ ốm có lương, đào tạo nghề.',
          ],
        },
        {
          heading: 'Thực tiễn trên thế giới',
          paragraphs: [
            'Liên minh Châu Âu: Chỉ thị lao động nền tảng (2024) yêu cầu các nền tảng phải đóng góp phúc lợi cho người lao động, bao gồm BHXH và bảo hiểm tai nạn.',
            'Vương quốc Anh: Sau phán quyết Uber (2021), tài xế được hưởng lương tối thiểu, nghỉ phép có lương, và quyền đóng quỹ hưu trí.',
            'Hoa Kỳ: Một số tiểu bang như Washington, New York đã thí điểm quỹ phúc lợi linh hoạt cho lao động Gig.',
            'Tại Việt Nam, Luật BHXH 2024 đã bắt đầu mở rộng đối tượng tham gia BHXH, tạo tiền đề cho việc bảo vệ lao động nền tảng trong tương lai.',
          ],
        },
      ],
      relatedConcepts: [
        'Nền kinh tế Gig',
        'Bảo hiểm xã hội',
        'Quan hệ lao động',
        'An sinh xã hội',
        'Quyền lợi người lao động',
      ],
      furtherReading: [
        'Nghiên cứu của Brookings về phúc lợi linh hoạt cho lao động Gig',
        'Chỉ thị của EU về lao động nền tảng (2024)',
        'Mô hình phúc lợi linh hoạt trong ngành xây dựng và giải trí',
      ],
    },
    sortOrder: 12,
  },
  // ============================================================
  // TÀI LIỆU MỚI - THUẾ & TÀI CHÍNH CÁ NHÂN
  // ============================================================
  {
    slug: 'thue-tncn',
    title: 'Thuế Thu nhập Cá nhân (TNCN)',
    description: 'Loại thuế trực thu đánh trên thu nhập từ tiền lương, tiền công và các nguồn thu nhập khác của cá nhân.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Thuế thu nhập cá nhân (TNCN) là loại thuế trực thu, đánh trực tiếp vào thu nhập của cá nhân. Tại Việt Nam, thuế TNCN được quy định trong Luật Thuế thu nhập cá nhân, áp dụng cho cả công dân Việt Nam và người nước ngoài có thu nhập phát sinh tại Việt Nam.',
            'Thu nhập chịu thuế bao gồm: tiền lương, tiền công, phụ cấp, thưởng; thu nhập từ kinh doanh; thu nhập từ đầu tư vốn; thu nhập từ chuyển nhượng bất động sản; thu nhập từ trúng thưởng, thừa kế, quà tặng.',
          ],
        },
        {
          heading: 'Cách tính thuế TNCN từ tiền lương (2026)',
          paragraphs: [
            'Công thức: Thu nhập tính thuế = Thu nhập chịu thuế - Các khoản giảm trừ',
            'Thu nhập chịu thuế = Tổng thu nhập - Các khoản miễn thuế (phụ cấp ăn trưa ≤730.000đ, công tác phí...) - BHXH, BHYT, BHTN (10,5% lương)',
            'Các khoản giảm trừ: Bản thân 15.500.000đ/tháng + Người phụ thuộc 6.200.000đ/người/tháng + Đóng góp từ thiện, nhân đạo',
            'Thuế TNCN được tính theo biểu thuế lũy tiến từng phần 5 bậc.',
          ],
        },
        {
          heading: 'Biểu thuế lũy tiến 5 bậc (từ 01/01/2026)',
          paragraphs: [
            'Bậc 1: Thu nhập tính thuế đến 10 triệu → Thuế suất 5%',
            'Bậc 2: Trên 10 triệu đến 30 triệu → Thuế suất 15%',
            'Bậc 3: Trên 30 triệu đến 50 triệu → Thuế suất 20%',
            'Bậc 4: Trên 50 triệu đến 100 triệu → Thuế suất 30%',
            'Bậc 5: Trên 100 triệu → Thuế suất 35%',
            'Lưu ý: Trước 2026, biểu thuế có 7 bậc (5%, 10%, 15%, 20%, 25%, 30%, 35%) với ngưỡng bậc cao nhất là trên 80 triệu.',
          ],
        },
        {
          heading: 'Nghĩa vụ của người nộp thuế',
          paragraphs: [
            'Đăng ký mã số thuế cá nhân (MST): Mỗi cá nhân có một MST duy nhất, dùng suốt đời.',
            'Kê khai thuế hàng tháng/quý: Thường do công ty thực hiện thay cho nhân viên.',
            'Quyết toán thuế hàng năm: Hạn chót 31/03 (qua công ty) hoặc 30/04 (cá nhân tự quyết toán).',
            'Nộp thuế đầy đủ, đúng hạn: Vi phạm có thể bị phạt từ 1-3 lần số thuế trốn.',
          ],
        },
      ],
      relatedConcepts: [
        'Giảm trừ gia cảnh',
        'Biểu thuế lũy tiến',
        'Gross vs Net',
        'Quyết toán thuế',
        'Mã số thuế cá nhân',
      ],
      furtherReading: [
        'Luật Thuế TNCN sửa đổi 2025 (có hiệu lực 01/01/2026)',
        'Nghị định hướng dẫn thi hành Luật Thuế TNCN',
        'So sánh thuế TNCN Việt Nam với các nước ASEAN',
      ],
    },
    sortOrder: 13,
  },
  {
    slug: 'giam-tru-gia-canh',
    title: 'Giảm trừ gia cảnh',
    description: 'Khoản giảm trừ khỏi thu nhập chịu thuế dành cho bản thân người nộp thuế và người phụ thuộc, nhằm đảm bảo mức sống tối thiểu trước khi tính thuế.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Giảm trừ gia cảnh là khoản tiền được trừ khỏi thu nhập chịu thuế trước khi tính thuế TNCN. Mục đích là đảm bảo người nộp thuế có đủ thu nhập để trang trải nhu cầu sống cơ bản cho bản thân và gia đình trước khi phải đóng thuế.',
            'Nói cách khác: bạn chỉ phải đóng thuế trên phần thu nhập VƯỢT QUÁ mức giảm trừ gia cảnh.',
          ],
        },
        {
          heading: 'Mức giảm trừ (từ 01/01/2026)',
          paragraphs: [
            'Giảm trừ cho bản thân: 15.500.000 đồng/tháng (186.000.000 đồng/năm). Trước 2026 là 11.000.000đ/tháng.',
            'Giảm trừ cho mỗi người phụ thuộc: 6.200.000 đồng/người/tháng (74.400.000 đồng/người/năm). Trước 2026 là 4.400.000đ/tháng.',
            'Ví dụ: Một người có 2 người phụ thuộc được giảm trừ tổng cộng: 15.500.000 + 6.200.000 × 2 = 27.900.000 đồng/tháng. Nghĩa là thu nhập dưới 27,9 triệu/tháng thì không phải đóng thuế TNCN.',
          ],
        },
        {
          heading: 'Người phụ thuộc là ai?',
          paragraphs: [
            'Con dưới 18 tuổi; con từ 18 tuổi trở lên bị khuyết tật hoặc đang học đại học/cao đẳng/trung cấp/dạy nghề.',
            'Vợ hoặc chồng không có thu nhập hoặc thu nhập không vượt quá 1.000.000đ/tháng.',
            'Cha mẹ đẻ, cha mẹ vợ/chồng, cha mẹ nuôi hợp pháp ngoài độ tuổi lao động hoặc trong độ tuổi lao động nhưng bị khuyết tật, không có thu nhập.',
            'Để được giảm trừ, người nộp thuế phải đăng ký người phụ thuộc với cơ quan thuế và cung cấp giấy tờ chứng minh.',
          ],
        },
        {
          heading: 'Ý nghĩa của giảm trừ gia cảnh',
          paragraphs: [
            'Đảm bảo công bằng: Người có gia đình đông, thu nhập thấp được bảo vệ khỏi gánh nặng thuế.',
            'Phản ánh chi phí sinh hoạt: Mức giảm trừ được điều chỉnh khi CPI tăng trên 20% so với thời điểm ban hành.',
            'Khuyến khích khai báo trung thực: Khi mức giảm trừ hợp lý, người dân có động lực kê khai đúng thu nhập.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế TNCN',
        'Thu nhập tính thuế',
        'Người phụ thuộc',
        'Biểu thuế lũy tiến',
        'Quyết toán thuế',
      ],
      furtherReading: [
        'Luật Thuế TNCN sửa đổi 2025 - Điều khoản về giảm trừ gia cảnh',
        'Hướng dẫn đăng ký người phụ thuộc giảm trừ gia cảnh',
        'So sánh mức giảm trừ gia cảnh qua các năm',
      ],
    },
    sortOrder: 14,
  },
  {
    slug: 'bieu-thue-luy-tien-2026',
    title: 'Biểu thuế lũy tiến từng phần',
    description: 'Phương pháp tính thuế trong đó mỗi phần thu nhập được áp dụng một mức thuế suất khác nhau, phần thu nhập cao hơn chịu thuế suất cao hơn.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Biểu thuế lũy tiến từng phần là phương pháp tính thuế trong đó thu nhập tính thuế được chia thành nhiều bậc, mỗi bậc áp dụng một mức thuế suất riêng. Thu nhập ở bậc cao hơn chịu thuế suất cao hơn.',
            'Điểm quan trọng: Thuế suất cao hơn CHỈ áp dụng cho phần thu nhập vượt quá ngưỡng, không phải toàn bộ thu nhập. Đây là hiểu lầm phổ biến nhất về thuế lũy tiến.',
          ],
        },
        {
          heading: 'Biểu thuế 5 bậc tại Việt Nam (từ 01/01/2026)',
          paragraphs: [
            'Bậc 1: Đến 10 triệu đồng → 5% → Thuế tối đa: 500.000đ',
            'Bậc 2: Trên 10 - 30 triệu → 15% → Thuế tối đa: 3.000.000đ',
            'Bậc 3: Trên 30 - 50 triệu → 20% → Thuế tối đa: 4.000.000đ',
            'Bậc 4: Trên 50 - 100 triệu → 30% → Thuế tối đa: 15.000.000đ',
            'Bậc 5: Trên 100 triệu → 35%',
          ],
        },
        {
          heading: 'Ví dụ tính thuế',
          paragraphs: [
            'Giả sử thu nhập tính thuế = 25 triệu đồng/tháng:',
            '• 10 triệu đầu: 10.000.000 × 5% = 500.000đ',
            '• 15 triệu tiếp theo (10-25 triệu): 15.000.000 × 15% = 2.250.000đ',
            '• Tổng thuế = 500.000 + 2.250.000 = 2.750.000đ',
            '• Thuế suất thực tế = 2.750.000 / 25.000.000 = 11% (thấp hơn nhiều so với thuế suất biên 15%)',
          ],
        },
        {
          heading: 'So sánh với biểu thuế cũ (trước 2026)',
          paragraphs: [
            'Biểu thuế cũ có 7 bậc: 5%, 10%, 15%, 20%, 25%, 30%, 35%, với bậc cao nhất áp dụng cho thu nhập trên 80 triệu.',
            'Biểu thuế mới 5 bậc đơn giản hơn, giảm bớt sự phức tạp và nâng ngưỡng chịu thuế suất cao nhất lên 100 triệu.',
            'Phần lớn người nộp thuế sẽ được giảm thuế nhờ việc gộp các bậc trung gian.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế TNCN',
        'Giảm trừ gia cảnh',
        'Thuế suất biên',
        'Thuế suất thực tế',
        'Thu nhập tính thuế',
      ],
      furtherReading: [
        'So sánh biểu thuế lũy tiến và thuế suất cố định',
        'Biểu thuế lũy tiến tại các nước phát triển',
        'Lịch sử thay đổi biểu thuế TNCN tại Việt Nam',
      ],
    },
    sortOrder: 15,
  },
  {
    slug: 'gross-vs-net',
    title: 'Lương Gross và Lương Net',
    description: 'Hai cách thể hiện mức lương: Gross là tổng lương trước các khoản trừ, Net là lương thực nhận sau khi trừ thuế và bảo hiểm.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Lương Gross (lương gộp): Tổng số tiền lương mà công ty chi trả cho bạn, TRƯỚC KHI trừ các khoản bảo hiểm bắt buộc và thuế TNCN.',
            'Lương Net (lương thực nhận): Số tiền thực tế bạn nhận được trong tài khoản ngân hàng, SAU KHI đã trừ BHXH, BHYT, BHTN và thuế TNCN.',
            'Công thức: Net = Gross - BHXH (8%) - BHYT (1,5%) - BHTN (1%) - Thuế TNCN',
          ],
        },
        {
          heading: 'Các khoản trừ từ lương',
          paragraphs: [
            'Bảo hiểm xã hội (BHXH): 8% lương → để hưởng lương hưu, ốm đau, thai sản.',
            'Bảo hiểm y tế (BHYT): 1,5% lương → để được khám chữa bệnh.',
            'Bảo hiểm thất nghiệp (BHTN): 1% lương → để hưởng trợ cấp khi mất việc.',
            'Tổng bảo hiểm người lao động đóng: 10,5% lương.',
            'Thuế TNCN: Tính theo biểu thuế lũy tiến trên phần thu nhập tính thuế (sau khi trừ bảo hiểm và giảm trừ gia cảnh).',
          ],
        },
        {
          heading: 'Ví dụ tính lương (2026)',
          paragraphs: [
            'Lương Gross: 20.000.000đ/tháng, chưa có người phụ thuộc:',
            '• BHXH + BHYT + BHTN = 20.000.000 × 10,5% = 2.100.000đ',
            '• Thu nhập sau bảo hiểm = 20.000.000 - 2.100.000 = 17.900.000đ',
            '• Giảm trừ bản thân = 15.500.000đ',
            '• Thu nhập tính thuế = 17.900.000 - 15.500.000 = 2.400.000đ',
            '• Thuế TNCN = 2.400.000 × 5% = 120.000đ',
            '• Lương Net = 20.000.000 - 2.100.000 - 120.000 = 17.780.000đ',
          ],
        },
        {
          heading: 'Lưu ý khi thương lượng lương',
          paragraphs: [
            'Khi nhận offer, luôn hỏi rõ: "Đây là lương Gross hay Net?" để tránh hiểu lầm.',
            'Lương Gross cao hơn Net khoảng 15-25% tùy mức thu nhập.',
            'Một số công ty trả lương Net (cam kết lương thực nhận) - khi đó công ty chịu thuế thay nhân viên.',
            'Phụ cấp ăn trưa (≤730.000đ/tháng), công tác phí, đồng phục... không tính vào thu nhập chịu thuế.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế TNCN',
        'Bảo hiểm xã hội',
        'Giảm trừ gia cảnh',
        'Thu nhập chịu thuế',
        'Hợp đồng lao động',
      ],
      furtherReading: [
        'Công cụ tính lương Gross-Net online',
        'Cách đọc bảng lương (payslip) chi tiết',
        'Các khoản phụ cấp không chịu thuế TNCN',
      ],
    },
    sortOrder: 16,
  },
  {
    slug: 'quyet-toan-thue',
    title: 'Quyết toán thuế',
    description: 'Quá trình tổng kết, đối chiếu số thuế TNCN đã tạm nộp trong năm với số thuế thực tế phải nộp, để xác định số thuế nộp thừa hoặc thiếu.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Quyết toán thuế TNCN là việc tổng hợp toàn bộ thu nhập và các khoản giảm trừ trong cả năm, tính lại thuế TNCN phải nộp, so sánh với số thuế đã tạm nộp hàng tháng để xác định số thuế nộp thừa (được hoàn) hoặc nộp thiếu (phải nộp thêm).',
            'Quyết toán thuế thực hiện theo năm dương lịch (01/01 - 31/12).',
          ],
        },
        {
          heading: 'Ai phải quyết toán thuế?',
          paragraphs: [
            'Trường hợp BẮT BUỘC: Có thu nhập từ 2 nguồn trở lên; thu nhập vãng lai chưa khấu trừ thuế; nghỉ việc giữa năm.',
            'Trường hợp KHÔNG CẦN: Chỉ có 1 nguồn thu nhập (1 công ty) và đã ủy quyền quyết toán cho công ty.',
            'Trường hợp NÊN quyết toán: Khi có người phụ thuộc chưa đăng ký, khi thuế đã khấu trừ lớn hơn thuế phải nộp (để được hoàn thuế).',
          ],
        },
        {
          heading: 'Thời hạn và cách thực hiện',
          paragraphs: [
            'Hạn chót quyết toán qua công ty: 31/03 năm sau.',
            'Hạn chót cá nhân tự quyết toán: 30/04 năm sau.',
            'Cách thực hiện: Qua cổng thuế điện tử thuedientu.gdt.gov.vn, nộp tờ khai 02/QTT-TNCN.',
            'Thời gian hoàn thuế: 10-45 ngày làm việc kể từ ngày nhận hồ sơ hợp lệ.',
          ],
        },
        {
          heading: 'Tại sao có hoàn thuế?',
          paragraphs: [
            'Thuế tạm nộp hàng tháng được tính dựa trên thu nhập tháng đó. Nhưng thuế thực tế tính trên tổng thu nhập cả năm, có thể khác:',
            'Lương thay đổi giữa năm (tăng lương, thưởng Tết...)',
            'Người phụ thuộc đăng ký bổ sung giữa năm',
            'Thu nhập từ nhiều nguồn đã bị khấu trừ 10% tại nguồn',
            'Quyết toán giúp tính lại chính xác và hoàn trả phần thuế nộp thừa.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế TNCN',
        'Giảm trừ gia cảnh',
        'Hoàn thuế',
        'Tờ khai thuế',
        'Mã số thuế',
      ],
      furtherReading: [
        'Hướng dẫn quyết toán thuế TNCN trên cổng thuedientu.gdt.gov.vn',
        'Các trường hợp được hoàn thuế TNCN',
        'Mẫu tờ khai 02/QTT-TNCN và cách điền',
      ],
    },
    sortOrder: 17,
  },
  {
    slug: 'thue-khoan',
    title: 'Thuế khoán',
    description: 'Phương pháp tính thuế áp dụng cho hộ kinh doanh cá thể, trong đó mức thuế được ấn định theo tỷ lệ phần trăm trên doanh thu.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Thuế khoán (thuế theo phương pháp khoán) là phương pháp tính thuế đơn giản hóa dành cho hộ kinh doanh cá thể, cá nhân kinh doanh. Thay vì phải ghi sổ sách kế toán chi tiết, cơ quan thuế ấn định mức thuế cố định hàng tháng/quý dựa trên doanh thu ước tính.',
            'Phương pháp này giúp giảm gánh nặng hành chính cho các hộ kinh doanh nhỏ, đồng thời đảm bảo thu thuế hiệu quả.',
          ],
        },
        {
          heading: 'Thuế suất theo ngành nghề',
          paragraphs: [
            'Phân phối, cung cấp hàng hóa: VAT 1% + TNCN 0,5% = 1,5%',
            'Dịch vụ, xây dựng không bao thầu nguyên vật liệu: VAT 5% + TNCN 2% = 7%',
            'Sản xuất, vận tải, dịch vụ có gắn với hàng hóa, xây dựng có bao thầu: VAT 3% + TNCN 1,5% = 4,5%',
            'Hoạt động kinh doanh khác: VAT 2% + TNCN 1% = 3%',
            'Lưu ý: Hộ kinh doanh bán thức ăn đường phố thường áp dụng mức 1,5% (phân phối hàng hóa).',
          ],
        },
        {
          heading: 'Điều kiện áp dụng',
          paragraphs: [
            'Doanh thu trên 100 triệu đồng/năm: Phải đăng ký kinh doanh và nộp thuế.',
            'Doanh thu dưới 100 triệu đồng/năm: Được miễn thuế VAT và TNCN.',
            'Khi doanh thu lớn hơn, hộ kinh doanh có thể chuyển sang phương pháp kê khai (ghi sổ sách, xuất hóa đơn) để được khấu trừ chi phí.',
          ],
        },
        {
          heading: 'Cách nộp thuế',
          paragraphs: [
            'Thuế khoán thường nộp theo quý, hạn chót ngày cuối tháng đầu quý sau:',
            'Quý 1: hạn nộp 30/04',
            'Quý 2: hạn nộp 31/07',
            'Quý 3: hạn nộp 31/10',
            'Quý 4: hạn nộp 31/01 năm sau',
            'Nộp thuế qua cổng thuế điện tử hoặc tại Chi cục Thuế quận/huyện.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế GTGT',
        'Thuế TNCN',
        'Hộ kinh doanh cá thể',
        'Đăng ký kinh doanh',
        'Hóa đơn điện tử',
      ],
      furtherReading: [
        'Nghị định về quản lý thuế đối với hộ kinh doanh',
        'So sánh thuế khoán và thuế kê khai',
        'Các bước đăng ký thuế khoán cho hộ kinh doanh mới',
      ],
    },
    sortOrder: 18,
  },
  {
    slug: 'dang-ky-kinh-doanh-ho-ca-the',
    title: 'Đăng ký kinh doanh hộ cá thể',
    description: 'Thủ tục pháp lý để cá nhân hoặc hộ gia đình được phép kinh doanh hợp pháp, thực hiện tại cơ quan đăng ký kinh doanh cấp quận/huyện.',
    category: 'Pháp luật kinh doanh',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Hộ kinh doanh cá thể là hình thức kinh doanh do một cá nhân hoặc các thành viên trong hộ gia đình đăng ký, chịu trách nhiệm bằng toàn bộ tài sản của mình đối với hoạt động kinh doanh.',
            'Đây là hình thức kinh doanh phổ biến nhất tại Việt Nam, phù hợp với quy mô nhỏ như quán ăn, tiệm tạp hóa, xe bán hàng rong, dịch vụ sửa chữa...',
          ],
        },
        {
          heading: 'Nơi đăng ký',
          paragraphs: [
            'Theo Nghị định 01/2021/NĐ-CP, hộ kinh doanh đăng ký tại Phòng Tài chính - Kế hoạch thuộc UBND cấp quận/huyện nơi đặt địa điểm kinh doanh.',
            'LƯU Ý QUAN TRỌNG: Đăng ký kinh doanh hộ cá thể thực hiện tại cấp QUẬN/HUYỆN, KHÔNG phải tại UBND phường/xã. Đây là điểm thường bị nhầm lẫn.',
            'Khi mở thêm địa điểm kinh doanh mới, cũng đăng ký bổ sung tại Phòng ĐKKD cấp quận/huyện nơi có địa điểm mới.',
          ],
        },
        {
          heading: 'Hồ sơ cần thiết',
          paragraphs: [
            'Giấy đề nghị đăng ký hộ kinh doanh (theo mẫu).',
            'Bản sao CCCD/CMND của chủ hộ kinh doanh.',
            'Biên bản họp thành viên hộ gia đình (nếu đăng ký dưới danh nghĩa hộ gia đình).',
            'Giấy chứng nhận đủ điều kiện ATTP (nếu kinh doanh thực phẩm).',
            'Lệ phí đăng ký: 100.000 đồng.',
            'Thời gian giải quyết: 3 ngày làm việc.',
          ],
        },
        {
          heading: 'Quyền lợi khi đăng ký',
          paragraphs: [
            'Được hoạt động kinh doanh hợp pháp, tránh bị xử phạt hành chính.',
            'Có thể mở tài khoản ngân hàng cho hộ kinh doanh.',
            'Được xuất hóa đơn cho khách hàng (hóa đơn điện tử từ 01/07/2025).',
            'Có cơ sở pháp lý để ký hợp đồng, thuê mặt bằng, vay vốn ngân hàng.',
            'Xây dựng thương hiệu và uy tín kinh doanh.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế khoán',
        'Hộ kinh doanh cá thể',
        'Giấy phép kinh doanh',
        'An toàn thực phẩm',
        'Hóa đơn điện tử',
      ],
      furtherReading: [
        'Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp',
        'Phân biệt hộ kinh doanh và doanh nghiệp tư nhân',
        'Khi nào hộ kinh doanh nên chuyển đổi thành công ty',
      ],
    },
    sortOrder: 19,
  },
  {
    slug: 'thue-gtgt',
    title: 'Thuế Giá trị Gia tăng (VAT)',
    description: 'Thuế gián thu đánh vào giá trị tăng thêm của hàng hóa, dịch vụ phát sinh trong quá trình sản xuất, lưu thông đến người tiêu dùng.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Thuế giá trị gia tăng (GTGT/VAT - Value Added Tax) là loại thuế gián thu, đánh trên phần giá trị tăng thêm của hàng hóa và dịch vụ qua mỗi khâu sản xuất, lưu thông.',
            'Người tiêu dùng cuối cùng là người chịu thuế thực sự, nhưng doanh nghiệp là người nộp thuế thay cho người tiêu dùng.',
          ],
        },
        {
          heading: 'Các mức thuế suất tại Việt Nam',
          paragraphs: [
            'Thuế suất 0%: Hàng hóa xuất khẩu, dịch vụ cung ứng cho tổ chức nước ngoài.',
            'Thuế suất 5%: Hàng hóa thiết yếu (nước sạch, thuốc chữa bệnh, thiết bị y tế, sách giáo khoa, phân bón...).',
            'Thuế suất 8%: Mức giảm từ 10% xuống 8% (áp dụng 07/2025 - 12/2026) cho nhiều hàng hóa, dịch vụ thông thường.',
            'Thuế suất 10%: Mức tiêu chuẩn cho hầu hết hàng hóa, dịch vụ khác.',
            'Lưu ý: Giá bán niêm yết thường ĐÃ BAO GỒM VAT. Khi mua hàng 250.000đ (đã bao gồm VAT 10%), phần VAT = 250.000 × 10/110 ≈ 22.727đ (không phải 25.000đ).',
          ],
        },
        {
          heading: 'VAT trong ngân sách nhà nước',
          paragraphs: [
            'VAT là nguồn thu thuế lớn nhất, chiếm khoảng 23-24,5% tổng thu ngân sách nhà nước.',
            'VAT dễ thu vì được thu tại mỗi khâu giao dịch, khó trốn thuế hơn so với thuế trực thu.',
            'Tuy nhiên, VAT có tính chất lũy thoái: người thu nhập thấp dành phần lớn thu nhập cho tiêu dùng → tỷ lệ thuế/thu nhập cao hơn người giàu.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế gián thu',
        'Thuế trực thu',
        'Thuế TNCN',
        'Ngân sách nhà nước',
        'Thuế tiêu thụ đặc biệt',
      ],
      furtherReading: [
        'Luật Thuế GTGT sửa đổi',
        'Nghị định giảm thuế GTGT từ 10% xuống 8%',
        'So sánh VAT giữa các nước ASEAN',
      ],
    },
    sortOrder: 20,
  },
  {
    slug: 'thue-dau-tu',
    title: 'Thuế trên các kênh đầu tư',
    description: 'Tổng hợp các loại thuế áp dụng cho thu nhập từ đầu tư tại Việt Nam: tiết kiệm, chứng khoán, vàng, bất động sản.',
    category: 'Thuế & Tài chính',
    content: {
      sections: [
        {
          heading: 'Thuế trên lãi tiết kiệm',
          paragraphs: [
            'Thuế suất: 5% trên lãi tiết kiệm, khấu trừ tại nguồn (ngân hàng trừ trước khi trả lãi).',
            'Ví dụ: Gửi 100 triệu, lãi suất 6%/năm → Lãi = 6.000.000đ → Thuế = 300.000đ → Lãi thực nhận = 5.700.000đ.',
            'Đây là thuế trên thu nhập từ đầu tư vốn, áp dụng cho tất cả loại tiền gửi ngân hàng.',
          ],
        },
        {
          heading: 'Thuế trên chứng khoán',
          paragraphs: [
            'Thuế suất: 0,1% trên giá trị bán (không phải trên lợi nhuận).',
            'Đặc điểm: Bán lỗ vẫn phải nộp thuế, vì thuế tính trên giá bán, không phải lợi nhuận.',
            'Ví dụ: Mua 500 cổ phiếu giá 18.500đ = 9.250.000đ. Bán giá 22.000đ = 11.000.000đ → Thuế = 11.000.000 × 0,1% = 11.000đ.',
            'Phí giao dịch: Thêm phí môi giới (khoảng 0,15% mỗi chiều mua/bán).',
          ],
        },
        {
          heading: 'Thuế trên vàng (SJC và vàng nhẫn)',
          paragraphs: [
            'Theo quy định pháp luật: Thu nhập từ mua bán vàng chịu thuế TNCN 20% trên lợi nhuận, HOẶC 2% trên giá bán (nếu không xác định được giá mua).',
            'Thực tế: Đối với giao dịch vàng miếng SJC, vàng nhẫn tại cửa hàng, thuế này rất ít được áp dụng cho cá nhân mua bán lẻ do khó kiểm soát.',
            'LƯU Ý: Về mặt pháp lý, vàng SJC CÓ chịu thuế. Nói "mua bán vàng miễn thuế" là KHÔNG CHÍNH XÁC. Chỉ là thực tế thực thi còn hạn chế.',
          ],
        },
        {
          heading: 'Thuế trên bất động sản',
          paragraphs: [
            'Thuế chuyển nhượng bất động sản: 2% trên giá chuyển nhượng.',
            'Nếu xác định được giá mua: Có thể chọn nộp 20% trên lợi nhuận (nếu có lợi).',
            'Lệ phí trước bạ: 0,5% giá trị bất động sản khi sang tên.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế TNCN',
        'Đầu tư cá nhân',
        'Lãi suất tiết kiệm',
        'Chứng khoán',
        'Thuế chuyển nhượng',
      ],
      furtherReading: [
        'Hướng dẫn kê khai thuế từ chuyển nhượng chứng khoán',
        'Quy định thuế trên giao dịch vàng cá nhân',
        'So sánh thuế đầu tư giữa các kênh',
      ],
    },
    sortOrder: 21,
  },
  {
    slug: 'dau-tu-ca-nhan',
    title: 'Đầu tư cá nhân cơ bản',
    description: 'Kiến thức nền tảng về đầu tư cho cá nhân: các kênh đầu tư phổ biến, nguyên tắc phân bổ danh mục, và quản lý rủi ro.',
    category: 'Tài chính cá nhân',
    content: {
      sections: [
        {
          heading: 'Nguyên tắc cơ bản',
          paragraphs: [
            'Quỹ khẩn cấp trước tiên: Luôn duy trì 3-6 tháng chi phí sinh hoạt trong tài khoản tiết kiệm trước khi đầu tư.',
            'Đa dạng hóa: Không bỏ tất cả trứng vào một giỏ. Phân bổ vốn vào nhiều kênh đầu tư khác nhau.',
            'Rủi ro và lợi nhuận tỷ lệ thuận: Kênh đầu tư có lợi nhuận cao luôn đi kèm rủi ro cao.',
            'Lãi kép: Thời gian là yếu tố quan trọng nhất. 50 triệu với lãi 10%/năm sau 20 năm = ~336 triệu.',
          ],
        },
        {
          heading: 'Các kênh đầu tư phổ biến',
          paragraphs: [
            'Tiết kiệm ngân hàng: Lãi suất 4-6%/năm, rủi ro thấp nhất. Bảo hiểm tiền gửi tối đa 125 triệu/người/ngân hàng.',
            'Trái phiếu chính phủ: Lãi suất 5-7%/năm, an toàn cao, do nhà nước đảm bảo.',
            'Quỹ ETF (ví dụ E1VFVN30): Đầu tư vào rổ 30 cổ phiếu lớn nhất, phí thấp, phù hợp người mới.',
            'Cổ phiếu riêng lẻ: Lợi nhuận tiềm năng cao nhưng rủi ro lớn, cần kiến thức phân tích.',
            'Vàng: Kênh trú ẩn khi kinh tế bất ổn, giá biến động trung bình.',
            'Bất động sản: Cần vốn lớn, thanh khoản thấp, lợi nhuận dài hạn.',
          ],
        },
        {
          heading: 'Phân bổ danh mục mẫu (người mới)',
          paragraphs: [
            '60% Tiết kiệm ngân hàng: An toàn, thanh khoản cao.',
            '20% Quỹ ETF: Tăng trưởng ổn định, phí thấp.',
            '20% Cổ phiếu/Trái phiếu: Tìm hiểu dần về thị trường.',
            'Điều chỉnh tỷ lệ theo tuổi và mức chấp nhận rủi ro: trẻ → nhiều cổ phiếu hơn, lớn tuổi → nhiều tiết kiệm hơn.',
          ],
        },
        {
          heading: 'Cảnh báo lừa đảo đầu tư',
          paragraphs: [
            'Dấu hiệu Ponzi/lừa đảo: Cam kết lợi nhuận cố định cao (>20%/năm), trả lãi bằng tiền người sau.',
            'Ví dụ: 5%/ngày = 1.825%/năm → KHÔNG CÓ đầu tư hợp pháp nào đạt được.',
            'Nguyên tắc: Nếu quá tốt để là thật, thì có lẽ không phải thật.',
            'Luôn kiểm tra giấy phép hoạt động của công ty quản lý quỹ trên website UBCKNN.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế đầu tư',
        'Lãi kép',
        'Quỹ ETF',
        'Phân bổ tài sản',
        'Rủi ro đầu tư',
      ],
      furtherReading: [
        'DCA (Dollar Cost Averaging) - Chiến lược đầu tư đều đặn',
        'Cách mở tài khoản chứng khoán tại Việt Nam',
        'Phân biệt đầu tư và đầu cơ',
      ],
    },
    sortOrder: 22,
  },
  {
    slug: 'deadweight-loss',
    title: 'Tổn thất vô ích (Deadweight Loss)',
    description: 'Phần thiệt hại kinh tế phát sinh khi thuế hoặc can thiệp chính sách làm thay đổi hành vi sản xuất và tiêu dùng, dẫn đến mất mát phúc lợi xã hội.',
    category: 'Kinh tế học',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Tổn thất vô ích (Deadweight Loss - DWL) là phần giá trị kinh tế bị mất đi khi thuế hoặc can thiệp chính sách làm giảm số lượng giao dịch dưới mức hiệu quả của thị trường tự do.',
            'DWL đại diện cho những giao dịch đôi bên cùng có lợi BỊ MẤT do thuế - không ai được hưởng phần giá trị này: không phải người mua, không phải người bán, cũng không phải chính phủ.',
          ],
        },
        {
          heading: 'Ví dụ minh họa',
          paragraphs: [
            'Một quán cà phê bán 100 ly/ngày với giá 30.000đ/ly. Chính phủ đánh thuế 5.000đ/ly.',
            'Giá mới: 35.000đ → Số ly bán giảm còn 80 ly → 20 ly không được bán.',
            'Chính phủ thu thuế: 80 × 5.000 = 400.000đ/ngày.',
            'Nhưng 20 giao dịch bị mất: cả khách hàng lẽ ra mua được cà phê giá hợp lý và quán lẽ ra bán được → giá trị kinh tế mất đi vĩnh viễn.',
            'Phần giá trị mất đi này chính là Deadweight Loss.',
          ],
        },
        {
          heading: 'Quy luật quan trọng: DWL tỷ lệ với t²',
          paragraphs: [
            'Khi thuế tăng gấp đôi, tổn thất vô ích tăng gấp BỐN (2² = 4).',
            'Khi thuế tăng gấp ba, tổn thất tăng gấp CHÍN (3² = 9).',
            'Hàm ý: Thuế suất thấp trên diện rộng (nhiều loại hàng hóa) gây tổn thất ít hơn thuế suất cao trên ít mặt hàng.',
            'Đây là cơ sở lý thuyết cho nguyên tắc "mở rộng cơ sở thuế, hạ thuế suất" trong cải cách thuế.',
          ],
        },
        {
          heading: 'Ý nghĩa chính sách',
          paragraphs: [
            'Mọi loại thuế đều gây tổn thất vô ích (trừ thuế khoán/lump-sum tax lý thuyết).',
            'Mục tiêu của chính sách thuế tốt: Thu đủ ngân sách cần thiết với tổn thất vô ích TỐI THIỂU.',
            'Thuế đánh vào hàng hóa ít co giãn (xăng dầu, thuốc lá) gây ít tổn thất hơn thuế đánh vào hàng hóa co giãn (hàng xa xỉ).',
          ],
        },
      ],
      relatedConcepts: [
        'Cung và Cầu',
        'Độ co giãn',
        'Hiệu quả Pareto',
        'Thặng dư tiêu dùng',
        'Chính sách thuế',
      ],
      furtherReading: [
        'Arthur Harberger và tam giác Harberger',
        'Tính toán Deadweight Loss trong thực tế',
        'Nguyên tắc thuế tối ưu (Optimal Taxation)',
      ],
    },
    sortOrder: 23,
  },
  {
    slug: 'khop-dong-xa-hoi',
    title: 'Khế ước xã hội',
    description: 'Lý thuyết triết học chính trị cho rằng quyền lực nhà nước và nghĩa vụ công dân dựa trên sự đồng thuận ngầm giữa nhà nước và người dân.',
    category: 'Triết học chính trị',
    content: {
      sections: [
        {
          heading: 'Định nghĩa',
          paragraphs: [
            'Khế ước xã hội (Social Contract) là lý thuyết cho rằng nhà nước tồn tại dựa trên sự đồng thuận (ngầm hoặc rõ ràng) của người dân: người dân từ bỏ một phần tự do cá nhân, đổi lại nhà nước cung cấp trật tự, an ninh, và phúc lợi công cộng.',
            'Thuế là biểu hiện cụ thể nhất của khế ước xã hội: công dân đóng thuế để nhà nước cung cấp dịch vụ công (đường sá, bệnh viện, trường học, an ninh quốc phòng...).',
          ],
        },
        {
          heading: 'Các nhà tư tưởng chính',
          paragraphs: [
            'Thomas Hobbes (1588-1679): Con người trong trạng thái tự nhiên sống trong "chiến tranh của mọi người chống mọi người". Khế ước xã hội trao quyền lực tuyệt đối cho nhà nước để duy trì trật tự.',
            'John Locke (1632-1704): Nhà nước được lập ra để bảo vệ quyền tự nhiên (tính mạng, tự do, tài sản). Nếu nhà nước vi phạm quyền này, người dân có quyền lật đổ.',
            'Jean-Jacques Rousseau (1712-1778): Khế ước phải phản ánh "ý chí chung" (general will) - lợi ích chung của toàn xã hội, không phải lợi ích của nhóm cai trị.',
          ],
        },
        {
          heading: 'Khế ước xã hội và thuế',
          paragraphs: [
            'Thuế hợp pháp khi nhà nước thực hiện đúng phần cam kết: cung cấp dịch vụ công chất lượng, minh bạch ngân sách, bảo vệ quyền công dân.',
            '"No taxation without representation" (Không đánh thuế mà không có đại diện) - nguyên tắc từ Cách mạng Mỹ 1776: người dân phải có tiếng nói trong quyết định thuế.',
            'Oliver Wendell Holmes Jr.: "Thuế là giá chúng ta trả cho nền văn minh" - diễn giải rằng dịch vụ công không miễn phí.',
            'Khi nhà nước không minh bạch hoặc không cung cấp dịch vụ tương xứng, khế ước xã hội bị suy yếu → người dân mất lòng tin → trốn thuế tăng.',
          ],
        },
      ],
      relatedConcepts: [
        'Thuế TNCN',
        'Ngân sách nhà nước',
        'Quyền công dân',
        'Dân chủ',
        'Minh bạch tài chính',
      ],
      furtherReading: [
        'Thomas Hobbes - Leviathan (1651)',
        'John Locke - Two Treatises of Government (1689)',
        'Jean-Jacques Rousseau - The Social Contract (1762)',
        'John Rawls - A Theory of Justice (1971)',
      ],
    },
    sortOrder: 24,
  },
];

async function main() {
  console.log('🌱 Seeding library documents...');

  for (const doc of sampleDocuments) {
    const existing = await prisma.libraryDocument.findUnique({
      where: { slug: doc.slug },
    });

    if (existing) {
      console.log(`⏭️  Document "${doc.title}" already exists, skipping...`);
      continue;
    }

    const created = await prisma.libraryDocument.create({
      data: doc,
    });

    console.log(`✅ Created document: ${created.title} (${created.slug})`);
  }

  console.log('🎉 Seeding complete!');
  console.log('\n📚 Created documents:');
  sampleDocuments.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.title} - ${doc.category}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
