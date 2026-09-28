import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Cô Nga × Thuế 101 — "Người không đóng thuế?".
 *
 * Cô Nga ở nhà nội trợ, không có thu nhập, và tin chắc mình không đóng đồng thuế
 * nào. Câu chuyện dùng cái giỏ đi chợ của cô để đi vào tính luỹ thoái của thuế
 * tiêu dùng — phần mà ba nhân vật kia chỉ chạm qua.
 */
export const CONGA_THUE: StorySeed = {
  slug: 'conga-thue',
  characterSlug: 'homemaker',
  title: 'Người không đóng thuế?',
  teaser:
    'Cô Nga ở nhà, không lương, không hợp đồng, không tờ khai nào mang tên cô. Rồi cô thử cộng lại một tuần đi chợ.',
  icon: 'shopping-basket',
  estimatedTime: '~30 phút',
  sortOrder: 5,
  courseSlugs: [COURSE.thue],
  part: {
    name: 'Cô Nga và cái giỏ đi chợ',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'toi-co-dong-dong-nao-dau',
        title: '"Tôi có đóng đồng nào đâu"',
        blocks: [
          {
            type: 'text',
            title: 'Câu chuyện ở bàn ăn',
            paragraphs: [
              'Bữa cơm tối, chồng cô Nga phàn nàn về khoản thuế thu nhập bị trừ trong tháng.',
              'Cô Nga nói, không có ý gì: "Anh còn được trừ chớ em có đóng đồng nào đâu."',
              'Bé Ngọc mười tuổi ngồi cạnh hỏi: "Ủa mẹ không đóng thuế hả mẹ?"',
            ],
          },
          {
            type: 'callout',
            icon: 'home',
            title: 'Cô Nga tự mô tả mình',
            variant: 'info',
            text: 'Không có hợp đồng lao động. Không có bảng lương. Không có mã số thuế cá nhân đang hoạt động. Không có tờ khai nào mang tên cô trong mười một năm ở nhà chăm hai con.',
          },
          {
            type: 'question',
            question:
              'Theo bạn, cô Nga có đang đóng góp vào ngân sách nhà nước không?',
            options: [
              { id: 'a', text: 'Không — cô không có thu nhập nên không có gì để đóng', isCorrect: false },
              { id: 'b', text: 'Không — người ở nhà nội trợ được miễn mọi nghĩa vụ thuế', isCorrect: false },
              { id: 'c', text: 'Có — cô là người trực tiếp mua sắm cho cả gia đình, nên phần thuế trong giá hàng đi qua tay cô mỗi ngày', isCorrect: true },
              { id: 'd', text: 'Chỉ khi cô mua hàng có lấy hoá đơn', isCorrect: false },
            ],
            explanation:
              'Cô Nga không chỉ đóng góp — cô là người thực hiện gần như toàn bộ chi tiêu chịu thuế tiêu dùng của một hộ bốn người. Thu nhập là của chồng cô, nhưng việc chuyển thu nhập đó thành hàng hoá, và trả phần thuế nằm trong giá, là việc cô làm mỗi ngày. Người không có thu nhập vẫn hoàn toàn có thể là người trực tiếp trả phần lớn thuế tiêu dùng của một gia đình.',
          },
          {
            type: 'text',
            title: 'Vì sao cô Nga tin chắc như vậy',
            paragraphs: [
              'Cô Nga không phải người thiếu hiểu biết. Cô học hết đại học, đọc báo mỗi ngày, và quản trị một nhóm tám trăm người.',
              'Nhưng trong mọi câu chuyện cô từng nghe về thuế — trên tivi, trên báo, trong các cuộc trò chuyện — người đóng thuế luôn là người có bảng lương hoặc có doanh nghiệp.',
              'Cô chưa từng nghe ai nhắc tới người đi chợ.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao thuế thu nhập được nhắc tới nhiều hơn hẳn thuế tiêu dùng trong các cuộc thảo luận công khai?',
            options: [
              { id: 'a', text: 'Vì thuế thu nhập đóng góp nhiều hơn cho ngân sách', isCorrect: false },
              { id: 'b', text: 'Vì nó có một dòng riêng, một thời điểm cụ thể và một người có tên — nên nó tạo ra trải nghiệm mất mát rõ ràng, còn thuế tiêu dùng thì tan vào giá', isCorrect: true },
              { id: 'c', text: 'Vì thuế tiêu dùng ít khi thay đổi', isCorrect: false },
              { id: 'd', text: 'Vì báo chí không được phép bàn về thuế tiêu dùng', isCorrect: false },
            ],
            explanation:
              'Ở nhiều nước, kể cả Việt Nam, các sắc thuế gián thu đóng góp phần lớn hơn vào tổng thu. Nhưng chúng ít được bàn hơn vì chúng không tạo ra một khoảnh khắc nào để chú ý: không có ngày nộp, không có tờ khai, không có con số nào bị trừ trước mắt bạn. Thứ được bàn nhiều nhất không phải thứ lớn nhất, mà là thứ dễ cảm nhận nhất.',
          },
          {
            type: 'text',
            title: 'Cô Nga nhớ lại một bài đăng',
            paragraphs: [
              'Trong nhóm phụ huynh từng có một bài tranh luận về học phí, và có phụ huynh viết: "Mấy chị ở nhà thì biết gì, tiền thuế là của tụi tui đi làm đóng."',
              'Lúc đó cô Nga đọc và thấy hơi tự ái, nhưng cô không phản bác vì cô nghĩ người đó nói cũng đúng.',
              'Bây giờ cô đọc lại câu ấy với một cảm giác khác hẳn.',
            ],
          },
          {
            type: 'text',
            title: 'Bé Ngọc làm bài tập về nhà',
            paragraphs: [
              'Hôm sau ở lớp, cô giáo giao bài tìm hiểu về nghề nghiệp trong gia đình.',
              'Bé Ngọc hỏi mẹ: "Mẹ ghi nghề gì hả mẹ?"',
              'Cô Nga nói: "Ghi nội trợ đi con."',
              '"Nội trợ có đóng thuế không mẹ?" — con bé vẫn chưa quên câu tối qua.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô Nga định trả lời "không", rồi cô dừng lại.',
              'Cô nhớ tới chuyện cô đã học được về việc kiểm chứng trước khi khẳng định.',
              'Cô nói: "Để mẹ coi lại đã."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Cô Nga tự làm một thí nghiệm',
            variant: 'info',
            text: 'Cô quyết định giữ toàn bộ hoá đơn trong một tuần: đi chợ, đi siêu thị, mua thuốc, đổ xăng xe máy, trả tiền điện nước, mua đồ dùng học tập cho con. Cuối tuần cô sẽ cộng lại phần thuế giá trị gia tăng ghi trên đó.',
          },
          {
            type: 'question',
            question:
              'Việc giữ hoá đơn một tuần sẽ cho cô Nga con số chính xác hay chỉ là con số tối thiểu?',
            options: [
              { id: 'a', text: 'Con số chính xác, vì mọi giao dịch đều có hoá đơn', isCorrect: false },
              { id: 'b', text: 'Con số tối thiểu — vì rất nhiều giao dịch ở chợ và tiệm tạp hoá không xuất hoá đơn, dù thuế vẫn nằm trong giá', isCorrect: true },
              { id: 'c', text: 'Con số cao hơn thực tế', isCorrect: false },
              { id: 'd', text: 'Không có ý nghĩa gì vì cô không phải người nộp thuế', isCorrect: false },
            ],
            explanation:
              'Đây là điểm quan trọng khi tự làm loại thí nghiệm này. Hoá đơn chỉ có ở siêu thị, cửa hàng lớn, và các dịch vụ chính thức. Phần lớn việc đi chợ hằng ngày không có hoá đơn — nhưng người bán vẫn mua hàng đầu vào với giá đã có thuế, và phần đó vẫn nằm trong giá bán. Vì thế con số cộng được từ hoá đơn luôn thấp hơn con số thật.',
          },
          {
            type: 'text',
            title: 'Cuối tuần, cô Nga cộng lại',
            paragraphs: [
              'Cô có mười chín tờ hoá đơn và biên lai.',
              'Siêu thị hai lần, tiệm thuốc một lần, hai lần đổ xăng, hoá đơn điện, hoá đơn nước, tiền mạng, và một lần mua đồng phục cho con.',
              'Cô cộng cột thuế giá trị gia tăng, và con số của một tuần khiến cô ngồi im.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô nhân với bốn tuần, rồi nhân với mười hai tháng.',
              'Con số một năm lớn hơn nhiều so với bất cứ điều gì cô hình dung — và đó mới chỉ là phần có hoá đơn.',
              'Cô chưa tính buổi chợ mỗi sáng, chưa tính tiệm tạp hoá đầu hẻm, chưa tính quán ăn.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Người tiêu tiền và người kiếm tiền',
            variant: 'warning',
            text: 'Trong một gia đình có một người đi làm và một người ở nhà, thu nhập mang tên một người nhưng việc chuyển thu nhập ấy thành hàng hoá — và trả phần thuế trong giá — thường do người kia thực hiện. Cách xã hội nói về "người đóng thuế" hầu như luôn chỉ nhắc tới vế thứ nhất.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc chỉ coi người có thu nhập là "người đóng thuế" lại là một cách nhìn thiếu sót?',
            options: [
              { id: 'a', text: 'Vì nó xúc phạm người nội trợ', isCorrect: false },
              { id: 'b', text: 'Vì nó bỏ sót toàn bộ phần thuế tiêu dùng, và cùng với đó bỏ sót cả một nhóm người khỏi cuộc trò chuyện về việc tiền chung được tiêu thế nào', isCorrect: true },
              { id: 'c', text: 'Vì người nội trợ cũng từng đi làm', isCorrect: false },
              { id: 'd', text: 'Vì thuế tiêu dùng lớn hơn thuế thu nhập', isCorrect: false },
            ],
            explanation:
              'Hệ quả không nằm ở cảm giác mà nằm ở việc ai được coi là có tư cách tham gia. Khi "người đóng thuế" được hiểu là người có bảng lương, thì người nội trợ, người nghỉ hưu, sinh viên, và lao động phi chính thức đều tự loại mình ra khỏi các cuộc bàn về ngân sách và chính sách — dù họ đang góp vào đó mỗi ngày.',
          },
          {
            type: 'text',
            title: 'Cô Nga nói lại với con',
            paragraphs: [
              'Cô đưa cho bé Ngọc xem xấp hoá đơn và chỉ vào cột thuế.',
              '"Con thấy cái dòng này không? Mỗi lần mẹ đi chợ là mẹ đóng một chút."',
              'Con bé hỏi: "Vậy sao hôm bữa mẹ nói mẹ không đóng?"',
              '"Tại mẹ tưởng vậy. Mẹ mới biết."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Tối đó cô Nga kể lại cho chồng nghe.',
              'Anh nghe xong thì nói: "Ừ thì tiền đó cũng là tiền anh làm ra mà."',
              'Cô Nga không cãi, nhưng cô nghĩ trong đầu một câu mà cô chưa nói ra: nếu vậy thì khoản thuế thu nhập của anh cũng là tiền của cả nhà, chứ đâu riêng anh.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô Nga cũng nhận ra một chuyện về chính cách cô nói với con.',
              'Nếu cô trả lời "mẹ không đóng thuế", thì bé Ngọc lớn lên sẽ mang theo đúng cách hiểu mà cô đã mang suốt mười một năm.',
              'Còn nếu cô đưa xấp hoá đơn ra, con bé sẽ nhớ rằng người đi chợ cũng là người đóng góp.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Ai là "người đóng thuế"?',
            description: 'Vì sao cách gọi tên này bỏ sót phần lớn dân số.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai cách hiểu',
                  paragraphs: [
                    'Cách hẹp: người có tên trên tờ khai thuế, tức là người có thu nhập chịu thuế thu nhập cá nhân hoặc chủ thể kinh doanh.',
                    'Cách rộng: bất kỳ ai chịu gánh nặng thuế trên thực tế, bao gồm cả thuế nằm trong giá hàng hoá dịch vụ.',
                    'Theo cách rộng, gần như mọi người từ trẻ em tới người già đều là người đóng thuế.',
                  ],
                },
                {
                  heading: 'Những nhóm bị bỏ sót theo cách hẹp',
                  paragraphs: [
                    'Người nội trợ: thường là người thực hiện phần lớn chi tiêu chịu thuế của cả hộ.',
                    'Người nghỉ hưu: lương hưu được miễn thuế thu nhập nhưng vẫn chi tiêu và chịu thuế trong giá.',
                    'Học sinh sinh viên và lao động phi chính thức: không có bảng lương nhưng vẫn tiêu dùng hằng ngày.',
                  ],
                },
                {
                  heading: 'Vì sao cách gọi tên quan trọng',
                  paragraphs: [
                    'Nó quyết định ai tự thấy mình có tư cách hỏi về việc tiền chung được tiêu thế nào.',
                    'Nó ảnh hưởng tới việc ai được mời tham gia các cuộc tham vấn về chính sách.',
                    'Và nó ảnh hưởng tới việc một chính sách được đánh giá theo tác động lên nhóm nào.',
                  ],
                },
              ],
              relatedConcepts: ['Người nộp thuế và người chịu thuế', 'Thuế tiêu dùng', 'Tư cách tham gia'],
              furtherReading: [
                'Bài học "Tôi đã từng đóng thuế chưa?" trong khoá Thuế 101',
                'Câu chuyện của Minh trong khoá Thuế 101 — dòng chữ nhỏ trên hoá đơn',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Người không có thu nhập vẫn có thể là người trực tiếp trả phần lớn thuế tiêu dùng của một gia đình.\n' +
              '✓ Con số cộng từ hoá đơn luôn là con số tối thiểu, vì phần lớn giao dịch hằng ngày không có hoá đơn.\n' +
              '✓ Cách hiểu hẹp về "người đóng thuế" bỏ sót người nội trợ, người nghỉ hưu, sinh viên và lao động phi chính thức.\n' +
              '✓ Hệ quả không nằm ở cảm giác mà ở việc ai tự thấy mình có tư cách hỏi về tiền chung.',
          },
          {
            type: 'text',
            title: 'Nhưng còn một câu hỏi khó hơn',
            paragraphs: [
              'Cô Nga nhìn lại mười chín tờ hoá đơn và để ý một chuyện.',
              'Có tờ ghi thuế suất mười phần trăm, có tờ ghi năm phần trăm, và có tờ không ghi thuế gì cả.',
              'Cô không hiểu vì sao lại khác nhau, và cô bắt đầu tìm hiểu.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'vi-sao-moi-to-mot-khac',
        title: 'Vì sao mỗi tờ một khác',
        blocks: [
          {
            type: 'text',
            title: 'Ba loại hoá đơn',
            paragraphs: [
              'Cô Nga xếp mười chín tờ thành ba nhóm.',
              'Nhóm ghi thuế suất mười phần trăm: đồ dùng gia đình, quần áo, đồ điện, nước ngọt, bánh kẹo.',
              'Nhóm ghi năm phần trăm: thuốc chữa bệnh, nước sạch sinh hoạt.',
              'Nhóm không ghi thuế: học phí ở trung tâm tiếng Anh của con, và hoá đơn khám bệnh.',
            ],
          },
          {
            type: 'callout',
            icon: 'layers',
            title: 'Ba mức trong luật thuế giá trị gia tăng',
            variant: 'info',
            text: 'Luật quy định các mức thuế suất khác nhau — 0%, 5% và 10% — cùng với một nhóm hàng hoá dịch vụ thuộc diện không chịu thuế. Nhóm 5% và nhóm không chịu thuế thường gồm những thứ được coi là thiết yếu hoặc phục vụ mục tiêu xã hội: một số dịch vụ y tế, giáo dục, nước sạch sinh hoạt, và một số sản phẩm nông nghiệp ở khâu nhất định.',
          },
          {
            type: 'question',
            question:
              'Vì sao luật lại đặt mức thuế thấp hơn hoặc miễn thuế cho một số nhóm hàng hoá dịch vụ?',
            options: [
              { id: 'a', text: 'Vì những mặt hàng đó khó thu thuế', isCorrect: false },
              { id: 'b', text: 'Vì thuế tiêu dùng mang tính luỹ thoái, nên miễn hoặc giảm cho hàng thiết yếu là cách làm giảm bớt gánh nặng cho người thu nhập thấp', isCorrect: true },
              { id: 'c', text: 'Vì những mặt hàng đó có lợi nhuận thấp', isCorrect: false },
              { id: 'd', text: 'Vì nhà sản xuất yêu cầu', isCorrect: false },
            ],
            explanation:
              'Đây là một công cụ để bù lại nhược điểm của thuế tiêu dùng. Người thu nhập thấp dành tỷ trọng lớn hơn cho thực phẩm, thuốc men, nước sạch và giáo dục. Hạ mức thuế cho đúng những nhóm đó làm giảm phần gánh nặng rơi vào họ, mà không cần biết thu nhập của từng người là bao nhiêu — điều mà một hệ thống thu thuế trên hàng hoá không thể biết.',
          },
          {
            type: 'sort-bucket',
            title: 'Nhóm nào thuế cao, nhóm nào thấp?',
            instruction:
              'Xếp từng nhóm vào rổ đúng theo cách phân loại phổ biến của luật thuế giá trị gia tăng. Nếu bạn xếp sai vài mục, đó chính là điều đáng chú ý.',
            buckets: [
              { id: 'thap', label: 'Không chịu thuế hoặc thuế suất thấp' },
              { id: 'pho', label: 'Thuế suất phổ thông' },
            ],
            items: [
              { id: 'x1', text: 'Dịch vụ khám chữa bệnh', bucketId: 'thap' },
              { id: 'x2', text: 'Dạy học, dạy nghề', bucketId: 'thap' },
              { id: 'x3', text: 'Nước sạch phục vụ sinh hoạt', bucketId: 'thap' },
              { id: 'x4', text: 'Thuốc chữa bệnh', bucketId: 'thap' },
              { id: 'x5', text: 'Nước ngọt có ga, bánh kẹo', bucketId: 'pho' },
              { id: 'x6', text: 'Đồ điện gia dụng, quần áo, mỹ phẩm', bucketId: 'pho' },
            ],
          },
          {
            type: 'text',
            title: 'Cô Nga tính lại giỏ hàng của mình',
            paragraphs: [
              'Cô chia chi tiêu của gia đình thành hai phần: phần rơi vào nhóm thiết yếu được ưu đãi, và phần chịu thuế suất phổ thông.',
              'Cô ngạc nhiên khi thấy phần thứ hai lớn hơn cô nghĩ.',
              'Vì rất nhiều thứ cô coi là thiết yếu — xà phòng, bột giặt, dầu ăn đóng chai, sữa hộp cho con, quần áo, sách vở — đều nằm ở nhóm phổ thông.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc xác định "hàng thiết yếu" cho mục đích thuế lại khó?',
            options: [
              { id: 'a', text: 'Vì danh mục thay đổi liên tục', isCorrect: false },
              { id: 'b', text: 'Vì ranh giới giữa thiết yếu và không thiết yếu phụ thuộc vào hoàn cảnh từng hộ, và một mặt hàng thiết yếu với người này có thể là không cần thiết với người khác', isCorrect: true },
              { id: 'c', text: 'Vì các doanh nghiệp vận động hành lang', isCorrect: false },
              { id: 'd', text: 'Vì người tiêu dùng không thống nhất được', isCorrect: false },
            ],
            explanation:
              'Sữa cho trẻ nhỏ là thiết yếu với hộ có con nhỏ và không liên quan tới hộ khác. Xăng là thiết yếu với người phải đi làm xa và ít quan trọng với người ở gần chỗ làm. Một danh mục áp cho tất cả không thể khớp với mọi hoàn cảnh, nên bất kỳ ranh giới nào cũng sẽ ưu đãi đúng một số hộ và bỏ sót số khác. Đây là lý do việc dùng thuế tiêu dùng để điều tiết công bằng luôn có giới hạn.',
          },
          {
            type: 'text',
            title: 'Cô Nga thử một phép so',
            paragraphs: [
              'Cô so cơ cấu chi tiêu nhà mình với nhà chị Hoa, dựa trên những gì chị từng kể.',
              'Nhà cô Nga: khoảng một phần ba chi cho thực phẩm, phần còn lại cho học thêm, quần áo, đồ dùng, đi lại, và một khoản để dành.',
              'Nhà chị Hoa: thực phẩm và tiền trọ chiếm gần hết, gần như không có khoản để dành.',
            ],
          },
          {
            type: 'question',
            question:
              'Với hai hộ trên, một đợt tăng thuế đối với hàng tiêu dùng phổ thông sẽ tác động thế nào?',
            options: [
              { id: 'a', text: 'Tác động như nhau vì cùng một thuế suất', isCorrect: false },
              { id: 'b', text: 'Nhà chị Hoa chịu nặng hơn tính theo tỷ lệ thu nhập, vì gần như toàn bộ thu nhập của họ đi qua vùng chịu thuế', isCorrect: true },
              { id: 'c', text: 'Nhà cô Nga chịu nặng hơn vì chi tiêu nhiều hơn', isCorrect: false },
              { id: 'd', text: 'Không hộ nào bị ảnh hưởng nếu chỉ mua hàng thiết yếu', isCorrect: false },
            ],
            explanation:
              'Nhà cô Nga chi nhiều tiền hơn về số tuyệt đối nên nộp nhiều thuế hơn — điều đó đúng. Nhưng vì họ để dành được một phần, tỷ lệ thu nhập chịu thuế tiêu dùng của họ thấp hơn. Nhà chị Hoa tiêu hết nên chịu gần như toàn phần. Khi bàn về tác động của một chính sách, con số tuyệt đối và tỷ lệ trên thu nhập cho hai câu trả lời khác nhau, và câu hỏi về công bằng thì thuộc về vế thứ hai.',
          },
          {
            type: 'text',
            paragraphs: [
              'Cô Nga nhận ra điều này giải thích một chuyện cô từng thấy khó hiểu.',
              'Mỗi lần có tin về tăng giá điện hay giá xăng, chị Hoa lo lắng hơn hẳn cô — và cô từng nghĩ chị hơi quá lo.',
              'Bây giờ cô hiểu là với nhà chị, một khoản tăng nhỏ chiếm một tỷ trọng lớn hơn nhiều trong ngân sách gia đình.',
            ],
          },
          {
            type: 'text',
            title: 'Một cách khác để hỗ trợ người thu nhập thấp',
            paragraphs: [
              'Cô Nga đọc và thấy có một tranh luận mà cô chưa từng nghe.',
              'Miễn thuế cho hàng thiết yếu thì ai mua cũng được hưởng, kể cả người giàu — và người giàu thường mua nhiều hơn và mua loại đắt hơn.',
              'Cách còn lại là giữ nguyên thuế và chuyển tiền hỗ trợ thẳng cho hộ thu nhập thấp.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cách thứ hai đến đúng người hơn, nhưng nó đòi hỏi phải xác định được ai là hộ thu nhập thấp — một việc tốn kém, dễ sai sót, và có thể tạo ra kỳ thị.',
              'Cách thứ nhất thì đơn giản, không cần biết ai là ai, nhưng nó rải đều cho cả người không cần.',
              'Cô Nga nhận ra đây lại là một đánh đổi, không phải một bài toán có đáp án.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô cũng để ý một chi tiết trong xấp hoá đơn: tờ học phí trung tâm tiếng Anh không ghi thuế, nhưng học phí thì rất cao.',
              'Cô nhận ra việc miễn thuế cho dịch vụ giáo dục không tự động làm nó rẻ với người thu nhập thấp — nó chỉ làm nó rẻ hơn so với chính nó nếu có thuế.',
              'Một dịch vụ đắt được miễn thuế vẫn là một dịch vụ đắt, và người không đủ tiền thì miễn hay không cũng không dùng được.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Chính sách phổ quát và chính sách có nhắm đối tượng',
            variant: 'info',
            text: 'Phổ quát: áp dụng cho tất cả, đơn giản, không cần xác định ai, không gây kỳ thị — nhưng tốn nguồn lực cho cả nhóm không cần. Có nhắm đối tượng: đến đúng người cần, hiệu quả hơn trên mỗi đồng — nhưng tốn chi phí xác định, dễ bỏ sót, và người thụ hưởng có thể ngại nhận vì bị đánh dấu. Gần như mọi chính sách xã hội đều phải chọn một điểm nào đó giữa hai cực này.',
          },
          {
            type: 'text',
            title: 'Cô Nga nghĩ tới chị Hoa',
            paragraphs: [
              'Chị Hoa, phụ huynh làm công nhân may từng nghỉ nửa ngày vì bài đăng của cô, là người mà một chính sách hỗ trợ có nhắm đối tượng sẽ nhắm tới.',
              'Cô Nga nhớ chị từng nói không đăng ký một chương trình hỗ trợ nào đó vì "ngại, với lại thủ tục nhiều quá".',
              'Đó chính là hai nhược điểm của cách có nhắm đối tượng, hiện ra ở một người cụ thể mà cô quen.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao nhiều người đủ điều kiện lại không đăng ký nhận hỗ trợ?',
            options: [
              { id: 'a', text: 'Vì họ không cần khoản hỗ trợ đó', isCorrect: false },
              { id: 'b', text: 'Vì chi phí thực hiện — thời gian, thủ tục, và cả cảm giác bị đánh dấu là hộ nghèo — có thể lớn hơn giá trị khoản hỗ trợ trong mắt họ', isCorrect: true },
              { id: 'c', text: 'Vì họ không biết chương trình tồn tại', isCorrect: false },
              { id: 'd', text: 'Vì họ sợ bị kiểm tra thu nhập', isCorrect: false },
            ],
            explanation:
              'Không biết chương trình tồn tại cũng là một lý do thật, nhưng ngay cả khi biết, vẫn còn hai rào cản. Nghỉ làm nửa ngày để làm thủ tục là chi phí thật với người tính lương theo giờ. Và việc phải chứng minh mình thuộc diện khó khăn là một cái giá về mặt tâm lý mà chính sách hiếm khi tính tới. Đây là lý do tỷ lệ tiếp cận của nhiều chương trình có nhắm đối tượng thấp hơn nhiều so với thiết kế.',
          },
          {
            type: 'text',
            title: 'Một chi tiết cô Nga thấy quan trọng',
            paragraphs: [
              'Trong phần tranh luận cô đọc được, có một ý làm cô chú ý: hai cách trên không loại trừ nhau.',
              'Có thể giữ mức thuế thấp cho một nhóm hàng thật sự thiết yếu và ai cũng cần, đồng thời có chương trình hỗ trợ riêng cho nhóm khó khăn nhất.',
              'Cô nghĩ điều này giống chuyện quy tắc trong nhóm phụ huynh: không phải chọn giữa nội quy và câu chuyện, mà cần cả hai.',
            ],
          },
          {
            type: 'text',
            title: 'Cô Nga không kết luận cách nào tốt hơn',
            paragraphs: [
              'Cô đọc lập luận của cả hai phía và cô thấy mỗi bên đều có chỗ đúng.',
              'Điều cô rút ra không phải là một câu trả lời, mà là một cách đọc tin tức.',
              'Từ giờ khi nghe một đề xuất về thuế hay trợ cấp, cô hỏi ba câu: nó đến với ai, nó bỏ sót ai, và người thụ hưởng phải bỏ ra bao nhiêu công để nhận được nó.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thuế tiêu dùng và người thu nhập thấp',
            description: 'Hai cách bù lại tính luỹ thoái, và giới hạn của mỗi cách.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Vì sao thuế tiêu dùng nặng hơn với người thu nhập thấp',
                  paragraphs: [
                    'Họ tiêu gần hết thu nhập, nên gần như toàn bộ đi qua vùng chịu thuế.',
                    'Tỷ trọng chi cho thực phẩm, thuốc men, điện nước trong thu nhập của họ cao hơn nhiều.',
                    'Vì thế một thay đổi nhỏ về thuế hàng thiết yếu tác động tới họ mạnh hơn hẳn.',
                  ],
                },
                {
                  heading: 'Hai cách bù lại',
                  paragraphs: [
                    'Miễn hoặc giảm thuế cho hàng thiết yếu: đơn giản, không cần xác định ai, không gây kỳ thị — nhưng người thu nhập cao cũng được hưởng, và họ thường mua nhiều hơn.',
                    'Chuyển tiền hỗ trợ thẳng cho hộ thu nhập thấp: đến đúng người hơn trên mỗi đồng — nhưng tốn chi phí xác định, dễ bỏ sót, và có thể gây kỳ thị.',
                    'Hầu hết hệ thống thuế kết hợp cả hai ở một mức độ nào đó.',
                  ],
                },
                {
                  heading: 'Ba câu hỏi khi đọc một đề xuất chính sách',
                  paragraphs: [
                    'Nó đến với ai — nhóm nào thực sự nhận được lợi ích?',
                    'Nó bỏ sót ai — nhóm nào đủ điều kiện nhưng khó tiếp cận?',
                    'Người thụ hưởng phải bỏ ra bao nhiêu công để nhận? Chi phí thủ tục và cảm giác bị đánh dấu đều là chi phí thật.',
                  ],
                },
              ],
              relatedConcepts: ['Thuế luỹ thoái', 'Chính sách phổ quát', 'Chính sách có nhắm đối tượng', 'Tỷ lệ tiếp cận'],
              furtherReading: [
                'Luật Thuế giá trị gia tăng — đối tượng không chịu thuế và các mức thuế suất',
                'Bài học "Thuế có công bằng không?" trong khoá Thuế 101',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Luật đặt mức thuế thấp hơn cho một số hàng thiết yếu chính là để bù lại tính luỹ thoái của thuế tiêu dùng.\n' +
              '✓ Nhưng nhiều thứ ta coi là thiết yếu vẫn nằm ở mức phổ thông, vì ranh giới thiết yếu phụ thuộc hoàn cảnh từng hộ.\n' +
              '✓ Chính sách phổ quát thì đơn giản nhưng rải đều; chính sách có nhắm đối tượng thì đúng người nhưng tốn chi phí tiếp cận.\n' +
              '✓ Ba câu hỏi cho mọi đề xuất: đến với ai, bỏ sót ai, và người thụ hưởng phải bỏ ra bao nhiêu công.',
          },
          {
            type: 'text',
            title: 'Rồi cô Nga nhớ ra một chuyện về mình',
            paragraphs: [
              'Ba năm nay cô nhận đặt bánh và làm đồ ăn vặt bán trong nhóm phụ huynh, mỗi tháng kiếm được vài triệu.',
              'Cô luôn coi đó là "kiếm thêm cho vui", không phải kinh doanh.',
              'Và cô chưa từng nghĩ tới chuyện khoản đó có liên quan gì tới thuế.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'kiem-them-cho-vui',
        title: '"Kiếm thêm cho vui"',
        blocks: [
          {
            type: 'text',
            title: 'Ba năm bán bánh trong nhóm',
            paragraphs: [
              'Cô Nga làm bánh bông lan trứng muối và một vài món ăn vặt, nhận đặt trong nhóm phụ huynh và nhóm cư dân.',
              'Mỗi tháng cô làm khoảng ba mươi tới bốn mươi đơn, doanh thu vài triệu đồng.',
              'Cô gọi đó là kiếm thêm cho vui, và cô chưa từng nghĩ đó là kinh doanh.',
            ],
          },
          {
            type: 'callout',
            icon: 'shopping-bag',
            title: 'Cô Nga tra và thấy gì',
            variant: 'info',
            text: 'Quy định hiện hành xác định hộ và cá nhân kinh doanh có doanh thu trong năm dưới một ngưỡng nhất định thì không thuộc diện phải nộp thuế giá trị gia tăng và thuế thu nhập cá nhân từ hoạt động kinh doanh. Trên ngưỡng đó thì thuộc diện phải kê khai và nộp. Ngưỡng này được điều chỉnh theo từng thời kỳ, nên cần tra mức đang áp dụng.',
          },
          {
            type: 'question',
            question:
              'Vì sao có một ngưỡng doanh thu mà dưới đó thì không phải nộp?',
            options: [
              { id: 'a', text: 'Vì nhà nước muốn khuyến khích buôn bán nhỏ', isCorrect: false },
              { id: 'b', text: 'Vì chi phí quản lý và tuân thủ cho những khoản rất nhỏ có thể lớn hơn chính số thuế thu được, và vì đây thường là nguồn thu nhập bổ sung của hộ gia đình', isCorrect: true },
              { id: 'c', text: 'Vì các hoạt động đó không tạo ra giá trị gia tăng', isCorrect: false },
              { id: 'd', text: 'Vì khó xác định doanh thu của họ', isCorrect: false },
            ],
            explanation:
              'Có hai lý do đi cùng nhau. Thứ nhất là hiệu quả: nếu chi phí để quản lý, hướng dẫn và thu một khoản nhỏ lớn hơn chính khoản đó, thì việc thu là lỗ cho cả hai bên. Thứ hai là chính sách xã hội: những hoạt động quy mô rất nhỏ thường là nguồn thu nhập phụ của hộ gia đình, và đặt gánh nặng tuân thủ lên đó có thể đẩy người ta ra khỏi hoạt động kinh tế chính thức.',
          },
          {
            type: 'text',
            title: 'Cô Nga tính doanh thu năm ngoái',
            paragraphs: [
              'Cô mở lại tin nhắn đặt hàng và cộng lại cả năm.',
              'Con số nằm dưới ngưỡng, nhưng không xa ngưỡng như cô tưởng.',
              'Và nếu năm nay cô nhận thêm đơn dịp Tết như dự định, cô sẽ vượt qua.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều làm cô suy nghĩ không phải là số thuế phải nộp.',
              'Mà là cô nhận ra suốt ba năm cô đã coi việc mình làm là "cho vui", trong khi nó có doanh thu, có khách hàng thường xuyên, có chi phí nguyên liệu, và chiếm khá nhiều thời gian của cô.',
              '"Mình gọi nó là cho vui để khỏi phải coi nó là công việc," cô viết vào sổ.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Cách gọi tên ảnh hưởng tới cách đối xử',
            variant: 'info',
            text: 'Gọi một hoạt động là "kiếm thêm cho vui" thì không tính chi phí nguyên liệu cho đúng, không tính thời gian bỏ ra, không đặt giá cho hợp lý, và không ai trong nhà coi đó là việc cần được tôn trọng về thời gian. Cách gọi tên không chỉ mô tả — nó quyết định cách chính người làm đối xử với công việc của mình.',
          },
          {
            type: 'question',
            question:
              'Vì sao nhiều hoạt động kinh tế của phụ nữ trong hộ gia đình lại hay bị gọi là "làm thêm" hoặc "cho vui"?',
            options: [
              { id: 'a', text: 'Vì chúng thực sự không tạo ra thu nhập đáng kể', isCorrect: false },
              { id: 'b', text: 'Vì chúng diễn ra tại nhà, xen kẽ với việc nội trợ, không có nơi làm việc riêng và không có giờ giấc rõ ràng — nên khó được nhìn nhận như một công việc', isCorrect: true },
              { id: 'c', text: 'Vì họ tự chọn cách gọi đó', isCorrect: false },
              { id: 'd', text: 'Vì pháp luật không công nhận', isCorrect: false },
            ],
            explanation:
              'Một công việc thường được nhận diện qua những dấu hiệu bên ngoài: đi tới một nơi, có giờ bắt đầu và kết thúc, có đồng nghiệp, có bảng lương. Hoạt động làm tại nhà xen kẽ với việc chăm con và nấu ăn thì không có dấu hiệu nào trong số đó, nên nó bị xếp vào phần "việc nhà" cả bởi người ngoài lẫn bởi chính người làm. Doanh thu và thời gian bỏ ra thì vẫn có thật.',
          },
          {
            type: 'text',
            title: 'Cô Nga tính lại giá bán',
            paragraphs: [
              'Cô làm một việc mà ba năm nay cô chưa làm: tính chi phí thật cho một cái bánh.',
              'Nguyên liệu, gas, điện, hộp đựng, và thời gian — cô tính ba tiếng cho một mẻ bốn bánh.',
              'Quy ra thu nhập mỗi giờ, con số thấp hơn cô nghĩ rất nhiều.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô nhớ tới bảng tính của Đức mà cô đọc được ở đâu đó, và cô thấy mình vừa làm đúng việc anh làm.',
              'Cô tăng giá lên một chút, và cô sợ mất khách.',
              'Kết quả: cô mất ba khách trong số hơn ba mươi khách quen.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Định giá thấp không phải là tử tế với ai cả',
            variant: 'warning',
            text: 'Bán dưới chi phí thật thì phần chênh lệch không biến mất — nó được lấy từ thời gian và sức của người bán, thứ không xuất hiện trong bất kỳ phép tính nào. Với hoạt động quy mô nhỏ tại nhà, đây là hiện tượng rất phổ biến, và nó tồn tại lâu chính vì thời gian của người làm được coi là miễn phí.',
          },
          {
            type: 'budget-allocator',
            title: 'Một cái bánh giá bao nhiêu?',
            description:
              'Bạn có 100 đơn vị là giá bán một cái bánh. Hãy phân bổ cho các khoản chi phí, và phần còn lại là công của bạn. Thử phân bổ theo cách cô Nga đã làm suốt ba năm, rồi thử lại theo chi phí thật.',
            totalBudget: 100,
            unit: 'đơn vị',
            categories: [
              {
                id: 'nguyenlieu',
                label: 'Nguyên liệu',
                icon: 'egg',
                color: '#f59e0b',
                defaultValue: 45,
                minValue: 0,
                description: 'Bột, trứng, bơ, đường, nhân bánh',
              },
              {
                id: 'baobi',
                label: 'Bao bì và vận hành',
                icon: 'package',
                color: '#7c3aed',
                defaultValue: 10,
                minValue: 0,
                description: 'Hộp, túi, gas, điện, hao hụt',
              },
              {
                id: 'giaohang',
                label: 'Giao hàng',
                icon: 'truck',
                color: '#2563eb',
                defaultValue: 5,
                minValue: 0,
                description: 'Phí giao hoặc công đi giao',
              },
              {
                id: 'thoigian',
                label: 'Công của bạn',
                icon: 'clock',
                color: '#16a34a',
                defaultValue: 40,
                minValue: 0,
                description: 'Chuẩn bị, làm, dọn dẹp, trả lời tin nhắn đặt hàng',
              },
            ],
            outcomes: [
              {
                condition: 'thoigian <= 10',
                title: 'Công của bạn gần bằng không',
                description:
                  'Với mức này, bạn gần như đang làm không công. Đây chính là cách phần lớn hoạt động bán hàng nhỏ tại nhà được định giá — vì thời gian của người làm không xuất hiện trong bất kỳ phép tính nào.',
                variant: 'bad',
              },
              {
                condition: 'thoigian > 10 && thoigian < 30',
                title: 'Công của bạn quá thấp',
                description:
                  'Thử chia phần này cho số giờ bạn bỏ ra cho một mẻ. Nếu con số thấp hơn mức thu nhập bạn có thể kiếm bằng cách khác, thì đây là thông tin đáng để cân nhắc lại giá bán.',
                variant: 'neutral',
              },
              {
                condition: 'thoigian >= 30',
                title: 'Công của bạn được tính vào giá',
                description:
                  'Đây là cách định giá coi thời gian của bạn là một chi phí thật. Giá bán sẽ cao hơn, và bạn có thể mất một số khách — nhưng bạn không còn bù phần chênh lệch bằng chính sức mình.',
                variant: 'good',
              },
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao "công của bạn" lại là khoản dễ bị đặt về không nhất khi định giá?',
            options: [
              { id: 'a', text: 'Vì nó khó tính bằng con số', isCorrect: false },
              { id: 'b', text: 'Vì nó là khoản duy nhất không có ai đứng ra đòi — nguyên liệu thì phải trả tiền cho người bán, còn thời gian thì không ai gửi hoá đơn cho bạn', isCorrect: true },
              { id: 'c', text: 'Vì nó không phải chi phí thật', isCorrect: false },
              { id: 'd', text: 'Vì khách hàng không chấp nhận trả cho nó', isCorrect: false },
            ],
            explanation:
              'Mọi khoản chi phí khác đều có một người ở đầu kia đòi tiền: cửa hàng nguyên liệu, công ty điện, người giao hàng. Thời gian của chính bạn thì không có ai đòi, nên nó là khoản duy nhất có thể bị nén xuống mà không gặp phản ứng nào ngay lập tức. Phản ứng chỉ đến sau nhiều tháng, dưới dạng kiệt sức, và lúc đó ít ai nối nó lại với việc định giá.',
          },
          {
            type: 'text',
            title: 'Cô Nga hỏi trong nhóm',
            paragraphs: [
              'Cô đăng một câu hỏi trong nhóm phụ huynh: "Các mẹ ai có bán gì thêm ở nhà không? Có ai tính giá theo chi phí thật chưa ạ?"',
              'Hơn bốn mươi mẹ trả lời là có bán gì đó: bánh, đồ ăn, quần áo, mỹ phẩm, đồ handmade.',
              'Trong số đó, có ba người nói đã từng ngồi tính chi phí đầy đủ.',
            ],
          },
          {
            type: 'question',
            question:
              'Bốn mươi người bán hàng nhưng chỉ ba người tính chi phí đầy đủ. Điều này gợi ý gì?',
            options: [
              { id: 'a', text: 'Họ không đủ khả năng tính toán', isCorrect: false },
              { id: 'b', text: 'Việc coi hoạt động của mình là một công việc thật — chứ không phải làm thêm cho vui — là bước đầu tiên, và phần lớn chưa bước qua bước đó', isCorrect: true },
              { id: 'c', text: 'Họ không quan tâm tới lợi nhuận', isCorrect: false },
              { id: 'd', text: 'Quy mô quá nhỏ nên không cần tính', isCorrect: false },
            ],
            explanation:
              'Tính chi phí không đòi hỏi kỹ năng gì đặc biệt — cộng trừ và một cái máy tính. Thứ thiếu là khung nhìn: người ta không tính chi phí cho một sở thích, chỉ tính cho một công việc. Chừng nào hoạt động còn được gọi là "cho vui" thì việc ngồi tính nó nghe có vẻ quá nghiêm trọng, và vì thế nó không xảy ra.',
          },
          {
            type: 'text',
            title: 'Chồng cô Nga nói một câu',
            paragraphs: [
              'Khi cô kể chuyện tăng giá và mất ba khách, chồng cô nói: "Ừ thì em bán chơi mà, mất mấy khách có sao đâu."',
              'Cô Nga không giận, vì cô biết chính cô cũng nói y như vậy suốt ba năm.',
              'Cô chỉ đưa cho anh xem bảng tính và nói: "Anh coi thử, một tháng em làm bao nhiêu tiếng."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh đọc con số giờ và im một lúc.',
              'Rồi anh nói: "Ủa em làm nhiều vậy hả?"',
              'Cô Nga nghĩ đó là câu quan trọng nhất trong cả tháng đó — không phải vì anh xin lỗi, mà vì lần đầu tiên có một con số để nhìn.',
            ],
          },
          {
            type: 'text',
            title: 'Điều xảy ra sau bài đăng',
            paragraphs: [
              'Có bảy mẹ nhắn riêng cho cô Nga xin cách tính.',
              'Cô làm một bảng tính đơn giản — nguyên liệu, chi phí vận hành, thời gian, và giá đề xuất — rồi chia sẻ trong nhóm.',
              'Ba tuần sau, có mẹ nhắn: "Chị ơi em tính ra em bán lỗ hai năm nay."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Bán hàng nhỏ tại nhà: những điều nên biết',
            description: 'Ngưỡng doanh thu, chi phí thật, và vì sao cách gọi tên quan trọng.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Về nghĩa vụ thuế',
                  paragraphs: [
                    'Hộ và cá nhân kinh doanh có doanh thu trong năm dưới một ngưỡng nhất định thì không thuộc diện phải nộp thuế giá trị gia tăng và thuế thu nhập cá nhân từ hoạt động kinh doanh.',
                    'Ngưỡng này được điều chỉnh theo từng thời kỳ, nên cần tra mức đang áp dụng thay vì nhớ một con số cũ.',
                    'Nếu doanh thu tiến gần hoặc vượt ngưỡng, nên chủ động tìm hiểu trước thay vì chờ tới lúc bị nhắc.',
                  ],
                },
                {
                  heading: 'Tính chi phí thật',
                  paragraphs: [
                    'Nguyên liệu, bao bì, gas, điện, phần hao hụt và hàng hỏng.',
                    'Chi phí vận chuyển hoặc phí giao hàng nếu bạn chịu.',
                    'Thời gian: chuẩn bị, làm, dọn dẹp, trả lời tin nhắn đặt hàng. Đây là khoản bị bỏ quên nhiều nhất.',
                    'Quy ra thu nhập mỗi giờ để so sánh được với các lựa chọn khác.',
                  ],
                },
                {
                  heading: 'Vì sao cách gọi tên quan trọng',
                  paragraphs: [
                    'Gọi là "cho vui" thì không tính chi phí, không đặt giá đúng, và thời gian của người làm bị coi là miễn phí.',
                    'Gọi là một công việc thì mọi phép tính trên trở thành chuyện đương nhiên phải làm.',
                    'Bán dưới chi phí thật không phải là tử tế — phần chênh lệch được lấy từ chính người bán, chỉ là nó không xuất hiện trong sổ sách nào.',
                  ],
                },
              ],
              relatedConcepts: ['Ngưỡng doanh thu không chịu thuế', 'Chi phí ẩn', 'Lao động không được ghi nhận'],
              furtherReading: [
                'Quy định về thuế đối với hộ kinh doanh, cá nhân kinh doanh và ngưỡng doanh thu',
                'Câu chuyện của Đức trong khoá Thuế 101 — tính thu nhập thật sau chi phí',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Có một ngưỡng doanh thu mà dưới đó hộ và cá nhân kinh doanh không thuộc diện phải nộp — vì chi phí thu có thể lớn hơn số thu được.\n' +
              '✓ Gọi một hoạt động là "cho vui" khiến chính người làm không tính chi phí và không đặt giá đúng.\n' +
              '✓ Hoạt động làm tại nhà xen kẽ việc nội trợ khó được nhận diện là công việc, dù doanh thu và thời gian đều có thật.\n' +
              '✓ Bán dưới chi phí thật thì phần chênh lệch được lấy từ thời gian của người bán — thứ không xuất hiện trong phép tính nào.',
          },
          {
            type: 'text',
            title: 'Cô Nga nối hai chuyện lại',
            paragraphs: [
              'Cô nhìn hai thứ mình vừa phát hiện trong một tháng.',
              'Một: cô đang đóng thuế mỗi ngày mà cô tưởng mình không đóng.',
              'Hai: cô đang làm một công việc mà cô tưởng đó chỉ là làm cho vui.',
              'Cả hai đều là cùng một chuyện — một thứ có thật nhưng không được gọi đúng tên, nên không ai tính tới, kể cả chính cô.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'cai-gio-hang-va-la-phieu',
        title: 'Cái giỏ hàng và lá phiếu',
        blocks: [
          {
            type: 'text',
            title: 'Một bài đăng trong nhóm cư dân',
            paragraphs: [
              'Trong nhóm cư dân chung cư, có người đăng thông tin về một đề xuất điều chỉnh thuế đang được lấy ý kiến.',
              'Bài đăng có ba mươi mấy bình luận, phần lớn là "lại tăng nữa" và "dân khổ quá".',
              'Cô Nga đọc và nhận ra không ai trong đó nói gì về nội dung cụ thể của đề xuất.',
            ],
          },
          {
            type: 'callout',
            icon: 'message-square',
            title: 'Ba mươi bình luận, không ai đọc dự thảo',
            variant: 'info',
            text: 'Cô Nga thử hỏi trong nhóm: "Có ai đọc cái dự thảo đó chưa ạ?" — Một người trả lời có, và người đó chỉ ra rằng đề xuất áp dụng cho một nhóm hàng hoá cụ thể chứ không phải tăng chung, và có lộ trình theo giai đoạn.',
          },
          {
            type: 'question',
            question:
              'Vì sao phản ứng với một đề xuất chính sách thường hình thành trước khi ai đó đọc nội dung?',
            options: [
              { id: 'a', text: 'Vì dự thảo quá dài và khó hiểu', isCorrect: false },
              { id: 'b', text: 'Vì tiêu đề và bản tin tóm tắt tới trước, và chúng được viết để gây chú ý — nên cảm xúc hình thành xong trước khi có ai chạm vào nội dung', isCorrect: true },
              { id: 'c', text: 'Vì người dân không quan tâm tới chi tiết', isCorrect: false },
              { id: 'd', text: 'Vì dự thảo không được công bố kịp thời', isCorrect: false },
            ],
            explanation:
              'Đây là chỗ mà câu chuyện về thuế và câu chuyện về tin đồn gặp nhau. Một tiêu đề "đề xuất tăng thuế" lan nhanh và tạo phản ứng ngay; nội dung cụ thể — áp cho nhóm hàng nào, lộ trình ra sao, có kèm biện pháp hỗ trợ nào — thì dài, phức tạp và tới sau. Khi nội dung tới nơi thì lập trường đã hình thành, và lúc đó người ta đọc để tìm thứ củng cố lập trường đó.',
          },
          {
            type: 'text',
            title: 'Cô Nga đọc dự thảo',
            paragraphs: [
              'Cô mất khoảng bốn mươi phút, phần lớn để quen với cách trình bày.',
              'Cô không hiểu hết, nhưng cô tìm được ba thứ cô cần: đề xuất áp cho nhóm hàng nào, mức thay đổi bao nhiêu, và có lộ trình theo giai đoạn không.',
              'Rồi cô làm điều mà chỉ cô làm được trong nhóm đó: cô đối chiếu ba thứ ấy với giỏ hàng thật của gia đình mình.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô có sẵn xấp hoá đơn một tuần và bảng chi tiêu hằng tháng.',
              'Cô tính ra đề xuất đó làm chi tiêu của nhà cô tăng khoảng bao nhiêu mỗi tháng.',
              'Con số nhỏ hơn cô sợ, nhưng cô cũng tính thử cho nhà chị Hoa — và với nhà chị, cùng một thay đổi chiếm một tỷ trọng lớn hơn nhiều.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Một góp ý có dữ liệu khác hẳn một ý kiến',
            variant: 'info',
            text: '"Tôi phản đối vì dân đang khổ" là một cảm nhận đúng nhưng không nói được gì cụ thể. "Với hộ bốn người có thu nhập khoảng mức này, đề xuất làm chi tiêu tăng khoảng chừng này mỗi tháng, và tỷ trọng đó cao hơn nhiều với hộ thu nhập thấp" là một góp ý có nội dung — nó chỉ ra tác động, ở nhóm nào, và mức nào.',
          },
          {
            type: 'question',
            question:
              'Vì sao cô Nga là người ở vị trí tốt nhất để đưa ra loại góp ý đó?',
            options: [
              { id: 'a', text: 'Vì cô có trình độ học vấn cao hơn những người khác trong nhóm', isCorrect: false },
              { id: 'b', text: 'Vì cô là người trực tiếp thực hiện chi tiêu của hộ, nên cô có dữ liệu thật về giỏ hàng mà không cơ quan nào có', isCorrect: true },
              { id: 'c', text: 'Vì cô là quản trị viên nhóm', isCorrect: false },
              { id: 'd', text: 'Vì cô có nhiều thời gian rảnh hơn', isCorrect: false },
            ],
            explanation:
              'Cơ quan soạn thảo có số liệu thống kê tổng hợp, nhưng họ không có giỏ hàng cụ thể của một hộ bốn người ở một khu vực cụ thể, với những mặt hàng cụ thể được mua hằng tuần. Người nội trợ có đúng dữ liệu đó, và đó là loại thông tin mà quy trình lấy ý kiến được thiết kế để thu thập. Cái thiếu không phải là dữ liệu — cái thiếu là việc người có dữ liệu không biết mình đang giữ thứ đáng giá.',
          },
          {
            type: 'text',
            title: 'Cô Nga viết một góp ý',
            paragraphs: [
              'Cô không viết một mình. Cô đăng trong nhóm và đề nghị các mẹ khác gửi cho cô cơ cấu chi tiêu của gia đình họ, không cần tên.',
              'Mười một hộ gửi. Cô lập một bảng đơn giản, chia theo mức thu nhập.',
              'Bảng đó cho thấy rất rõ một điều: cùng một thay đổi, tỷ trọng tác động lên các hộ khác nhau chênh nhau vài lần.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô gửi góp ý qua kênh lấy ý kiến, kèm bảng đó và một đoạn giải thích ngắn về cách thu thập.',
              'Cô cũng ghi rõ giới hạn: mười một hộ không phải một mẫu đại diện, và số liệu là tự khai.',
              'Cô nghĩ ghi rõ giới hạn thì góp ý đáng tin hơn là làm ra vẻ chắc chắn hơn thực tế.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nói rõ giới hạn làm góp ý mạnh hơn, không yếu đi',
            variant: 'warning',
            text: 'Một bảng số liệu tự khai từ mười một hộ mà được trình bày như bằng chứng chắc chắn thì dễ bị bác bỏ ngay khi ai đó chỉ ra cỡ mẫu. Cùng bảng đó, kèm câu "đây là mười một hộ tự khai, không phải mẫu đại diện, nhưng nó cho thấy một hướng đáng kiểm tra" thì không có gì để bác — và nó chuyển từ một tuyên bố thành một đề nghị xem xét.',
          },
          {
            type: 'text',
            title: 'Cô Nga không nhận được phản hồi riêng',
            paragraphs: [
              'Không có thư trả lời nào gửi riêng cho cô. Cô cũng không biết góp ý của mình có được đọc hay không.',
              'Trong bản giải trình tiếp thu công bố sau đó, có phần nêu các nhóm ý kiến và cách xử lý, nhưng cô không nhận ra ý kiến nào là của mình.',
              'Cô hơi hụt hẫng, và cô nghĩ đó là cảm giác hợp lý.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng cô cũng nghĩ tới ba thứ đã xảy ra mà không cần ai trả lời cô.',
              'Mười một hộ đã ngồi xuống liệt kê chi tiêu của mình, có lẽ lần đầu tiên.',
              'Hơn bốn mươi người trong nhóm biết rằng có một quy trình lấy ý kiến tồn tại.',
              'Và bản thân cô, sau bốn mươi phút đọc, không còn là người bình luận "lại tăng nữa" mà không biết tăng cái gì.',
            ],
          },
          {
            type: 'question',
            question:
              'Nếu không nhận được phản hồi, việc gửi góp ý có còn ý nghĩa không?',
            options: [
              { id: 'a', text: 'Không — không có phản hồi nghĩa là không ai đọc', isCorrect: false },
              { id: 'b', text: 'Có, ở nhiều mức: nó đi vào hồ sơ của quá trình soạn thảo, và quá trình chuẩn bị góp ý tự nó tạo ra hiểu biết ở những người tham gia', isCorrect: true },
              { id: 'c', text: 'Chỉ có ý nghĩa nếu nhiều người cùng gửi một nội dung', isCorrect: false },
              { id: 'd', text: 'Chỉ có ý nghĩa nếu người gửi là chuyên gia', isCorrect: false },
            ],
            explanation:
              'Việc không nhận được thư riêng không có nghĩa là không được đọc — bản giải trình tiếp thu thường tổng hợp theo nhóm ý kiến chứ không trả lời từng người. Nhưng ngay cả khi bỏ qua vế đó, quá trình chuẩn bị góp ý đã tạo ra kết quả: mười một hộ hiểu chi tiêu của mình hơn, và một nhóm bốn mươi người biết quy trình này tồn tại. Đó là những thứ ở lại sau khi đề xuất cụ thể kia đã qua.',
          },
          {
            type: 'text',
            title: 'Một mẹ không đồng ý với cô Nga',
            paragraphs: [
              'Có một mẹ bình luận: "Chị làm chi cho mệt. Người ta quyết rồi, mình góp ý cũng vậy à."',
              'Cô Nga trả lời: "Em cũng nghĩ vậy. Mà em thấy mình mất bốn chục phút, còn nếu không góp thì chắc chắn không có gì."',
              'Cô không cố thuyết phục thêm, vì cô biết mình không có bằng chứng nào cho thấy góp ý sẽ thay đổi được gì.',
            ],
          },
          {
            type: 'question',
            question:
              'Cách trả lời của cô Nga có gì khác với việc khẳng định "góp ý chắc chắn có tác dụng"?',
            options: [
              { id: 'a', text: 'Nó nhẹ nhàng hơn nên ít gây tranh cãi', isCorrect: false },
              { id: 'b', text: 'Nó trung thực về việc cô không biết kết quả, và đặt quyết định trên một phép so chi phí thật thay vì trên một lời hứa cô không chứng minh được', isCorrect: true },
              { id: 'c', text: 'Nó thừa nhận người kia đúng hoàn toàn', isCorrect: false },
              { id: 'd', text: 'Nó chuyển trách nhiệm sang người khác', isCorrect: false },
            ],
            explanation:
              'Hứa rằng góp ý sẽ có tác dụng là một lời hứa cô không giữ được, và khi nó không xảy ra thì cả cô lẫn việc góp ý đều mất uy tín. Cách cô nói thì khác: chi phí là bốn mươi phút, đó là con số biết chắc; kết quả thì không ai biết, nhưng khả năng bằng không nếu không làm gì. Người nghe tự cân nhắc dựa trên hai thông tin đó, và không ai bị dụ.',
          },
          {
            type: 'text',
            title: 'Bé Ngọc hỏi mẹ lần nữa',
            paragraphs: [
              'Vài tháng sau, bé Ngọc mang về một bài tập về công dân và hỏi: "Mẹ ơi đóng thuế để làm gì hả mẹ?"',
              'Cô Nga không trả lời bằng định nghĩa. Cô lấy xấp hoá đơn ra, rồi lấy bảng chi tiêu, rồi mở trang thông tin về ngân sách phường.',
              'Hai mẹ con ngồi một tiếng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cuối buổi bé Ngọc nói: "Vậy là tiền của mẹ đi vô cái trường con học hả?"',
              '"Một phần thôi con. Mà đúng rồi."',
              'Con bé ghi vào bài tập: "Mẹ em làm nội trợ. Mẹ em có đóng thuế."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Góp ý vào một đề xuất chính sách thuế',
            description: 'Bốn bước từ một bài đăng bực bội tới một góp ý có nội dung.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn bước',
                  paragraphs: [
                    'Đọc nội dung trước khi hình thành lập trường. Tìm ba thứ: áp cho nhóm nào, mức thay đổi bao nhiêu, có lộ trình không.',
                    'Đối chiếu với dữ liệu thật của mình — giỏ hàng, hoá đơn, cơ cấu chi tiêu. Đây là dữ liệu mà không cơ quan nào có.',
                    'Nếu có thể, thu thập thêm từ vài hộ khác để thấy tác động khác nhau giữa các nhóm thu nhập.',
                    'Gửi qua kênh lấy ý kiến, kèm cách thu thập và nói rõ giới hạn của dữ liệu.',
                  ],
                },
                {
                  heading: 'Vì sao nói rõ giới hạn lại tốt hơn',
                  paragraphs: [
                    'Một mẫu nhỏ trình bày như bằng chứng chắc chắn thì bị bác bỏ ngay khi có người nhắc tới cỡ mẫu.',
                    'Cùng mẫu đó, kèm câu "đây là một hướng đáng kiểm tra", thì chuyển từ tuyên bố thành đề nghị xem xét — và không có gì để bác.',
                    'Nó cũng giữ uy tín của bạn cho những lần góp ý sau.',
                  ],
                },
                {
                  heading: 'Kỳ vọng thực tế',
                  paragraphs: [
                    'Thường không có thư trả lời riêng; bản giải trình tiếp thu tổng hợp theo nhóm ý kiến.',
                    'Một góp ý hiếm khi tự nó thay đổi một đề xuất.',
                    'Nhưng quá trình chuẩn bị góp ý tạo ra hiểu biết ở những người tham gia, và thứ đó ở lại sau khi đề xuất cụ thể đã qua.',
                  ],
                },
              ],
              relatedConcepts: ['Lấy ý kiến dự thảo', 'Dữ liệu từ người dân', 'Kỳ vọng thực tế'],
              furtherReading: [
                'Bài học "Làm thế nào để đánh giá một chính sách thuế?" trong khoá Thuế 101',
                'Luật Ban hành văn bản quy phạm pháp luật — lấy ý kiến và giải trình tiếp thu',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Phản ứng với một đề xuất thường hình thành trước khi ai đọc nội dung, vì tiêu đề tới trước và được viết để gây chú ý.\n' +
              '✓ Người trực tiếp đi chợ giữ loại dữ liệu mà không cơ quan nào có — giỏ hàng thật của một hộ cụ thể.\n' +
              '✓ Nói rõ giới hạn của dữ liệu làm góp ý mạnh hơn, vì nó chuyển từ tuyên bố thành đề nghị xem xét.\n' +
              '✓ Ngay cả khi không có phản hồi, quá trình chuẩn bị góp ý đã tạo ra hiểu biết ở những người tham gia.',
          },
          {
            type: 'text',
            title: 'Điều cô Nga mang theo',
            paragraphs: [
              'Cô Nga vẫn đi chợ mỗi sáng, vẫn làm bánh nhận đặt, vẫn quản trị nhóm tám trăm người.',
              'Thứ thay đổi là cô không còn nói câu "em có đóng đồng nào đâu".',
              'Và khi có ai trong nhóm nói câu tương tự, cô không tranh luận. Cô chỉ hỏi một câu:',
              '"Chị thử giữ hoá đơn một tuần rồi cộng lại coi."',
            ],
          },
        ],
      },
    ],
  },
};
