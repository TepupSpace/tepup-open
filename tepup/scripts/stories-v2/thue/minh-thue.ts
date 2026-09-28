import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Minh × Thuế 101 — "Hoá đơn cà phê và ngân sách quốc gia". VIẾT LẠI.
 *
 * Bản cũ dạy Minh cách tính thuế thu nhập cá nhân và kê khai. Bản này bám đúng
 * góc nhìn của khoá Thuế 101 trên production: ai thực sự chịu thuế, tiền thuế
 * đi đâu, và ai quyết định — chứ không phải hướng dẫn thủ tục.
 */
export const MINH_THUE: StorySeed = {
  slug: 'minh-thue',
  characterSlug: 'student',
  title: 'Hoá đơn cà phê và ngân sách quốc gia',
  teaser:
    'Minh chưa đi làm, chưa có lương, nên anh chắc chắn mình chưa từng đóng thuế. Cho tới khi Hùng chỉ vào dòng chữ nhỏ ở cuối tờ hoá đơn.',
  icon: 'receipt',
  estimatedTime: '~30 phút',
  sortOrder: 0,
  courseSlugs: [COURSE.thue],
  part: {
    name: 'Minh và những đồng thuế anh không biết mình đã đóng',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'dong-chu-nho-tren-hoa-don',
        title: 'Dòng chữ nhỏ trên hoá đơn',
        blocks: [
          {
            type: 'text',
            title: 'Quán cà phê gần trường',
            paragraphs: [
              'Minh và Hùng ngồi quán quen. Hai ly cà phê, một đĩa bánh, tổng cộng chín mươi hai nghìn.',
              'Trên bàn có tờ hoá đơn tính tiền. Minh chưa bao giờ đọc mấy tờ đó — anh chỉ nhìn con số cuối cùng.',
              'Hùng đang học môn Tài chính công. Cậu cầm tờ hoá đơn lên, xoay lại và chỉ vào một dòng.',
            ],
          },
          {
            type: 'callout',
            icon: 'receipt',
            title: 'Dòng Hùng chỉ vào',
            variant: 'info',
            text: 'Cộng tiền hàng: 83.636 đ — Thuế GTGT (10%): 8.364 đ — Tổng thanh toán: 92.000 đ',
          },
          {
            type: 'question',
            question:
              'Minh chưa đi làm, chưa có lương, chưa từng kê khai gì. Theo bạn, anh đã từng đóng thuế chưa?',
            options: [
              { id: 'a', text: 'Chưa — muốn đóng thuế thì phải có thu nhập', isCorrect: false },
              { id: 'b', text: 'Chưa — sinh viên được miễn thuế', isCorrect: false },
              { id: 'c', text: 'Rồi — mỗi lần mua hàng hoá dịch vụ, anh đã trả một phần thuế nằm sẵn trong giá', isCorrect: true },
              { id: 'd', text: 'Chỉ khi anh mua hàng có xuất hoá đơn', isCorrect: false },
            ],
            explanation:
              'Đây là chỗ mà gần như ai cũng đoán sai lần đầu. Người ta đồng nhất "đóng thuế" với "thuế thu nhập" — thứ có tên mình trên tờ khai. Nhưng phần lớn tiền thuế mà một người bình thường nộp trong đời lại đến từ những khoản nằm sẵn trong giá hàng hoá, không có tên ai trên đó, và không đòi ai phải kê khai gì.',
          },
          {
            type: 'text',
            title: 'Minh không tin lắm',
            paragraphs: [
              '"Nhưng tiền đó quán trả chứ, đâu phải tui trả."',
              'Hùng chỉ vào dòng tổng thanh toán: "Ông trả chín mươi hai nghìn. Quán giữ tám mươi ba sáu, còn tám nghìn ba trăm sáu mươi tư kia quán nộp cho nhà nước."',
              '"Tiền ra khỏi túi ông, đi qua tay quán, rồi vô ngân sách. Quán chỉ là chỗ trung chuyển thôi."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là điểm phân biệt quan trọng nhất trong cả câu chuyện, và nó có tên riêng.',
              'Người nộp thuế vào ngân sách là quán cà phê — đó là người có nghĩa vụ kê khai và chuyển tiền.',
              'Người chịu thuế, tức là người thực sự bị mất tiền, là Minh.',
              'Hai vai trò này khác nhau, và với thuế giá trị gia tăng thì chúng gần như không bao giờ trùng nhau.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Thuế trực thu và thuế gián thu',
            variant: 'info',
            text: 'Thuế trực thu đánh thẳng vào người chịu thuế và người đó tự kê khai — như thuế thu nhập cá nhân, thuế thu nhập doanh nghiệp. Thuế gián thu nằm trong giá hàng hoá dịch vụ, do người bán nộp thay nhưng người mua trả — như thuế giá trị gia tăng, thuế tiêu thụ đặc biệt, thuế nhập khẩu. Ở Việt Nam, nhóm gián thu chiếm phần lớn hơn trong tổng thu ngân sách.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc phân biệt "người nộp thuế" và "người chịu thuế" lại quan trọng?',
            options: [
              { id: 'a', text: 'Vì nó quyết định ai phải làm thủ tục kê khai', isCorrect: false },
              { id: 'b', text: 'Vì nếu chỉ nhìn ai nộp, ta sẽ kết luận sai về việc gánh nặng thuế thực sự rơi vào ai trong xã hội', isCorrect: true },
              { id: 'c', text: 'Vì hai loại thuế có mức thuế suất khác nhau', isCorrect: false },
              { id: 'd', text: 'Vì chỉ người nộp mới có quyền khiếu nại', isCorrect: false },
            ],
            explanation:
              'Nếu chỉ nhìn vào tên trên tờ khai, ta sẽ nghĩ doanh nghiệp và người có lương cao là những người đóng thuế, còn sinh viên và người thu nhập thấp thì không. Nhưng thực tế mọi người đều đang trả thuế mỗi ngày qua giá hàng hoá. Nhìn nhầm chỗ này dẫn tới nhầm lẫn lớn hơn nhiều: nhầm về việc ai có quyền lên tiếng về cách tiêu tiền thuế.',
          },
          {
            type: 'calculator',
            title: 'Một sinh viên đóng bao nhiêu thuế mỗi năm?',
            description:
              'Ở Việt Nam, giá niêm yết thường đã bao gồm thuế giá trị gia tăng. Nhập mức chi tiêu hằng tháng của bạn cho hàng hoá và dịch vụ để xem phần thuế nằm trong đó.',
            calculatorType: 'custom',
            formula: 'chi * thue / (100 + thue)',
            inputs: [
              {
                id: 'chi',
                label: 'Chi tiêu mỗi tháng cho hàng hoá, dịch vụ',
                type: 'number',
                unit: 'đồng',
                defaultValue: 3000000,
                min: 500000,
                max: 20000000,
                step: 100000,
              },
              {
                id: 'thue',
                label: 'Thuế suất GTGT phổ biến',
                type: 'select',
                defaultValue: 10,
                options: [
                  { value: 8, label: '8% (mức giảm áp dụng cho nhiều nhóm hàng)' },
                  { value: 10, label: '10% (mức phổ thông)' },
                ],
              },
            ],
            outputs: [
              {
                id: 'thang',
                label: 'Tiền thuế nằm trong chi tiêu mỗi tháng',
                unit: 'đồng',
                formula: 'chi * thue / (100 + thue)',
                highlight: true,
              },
              {
                id: 'nam',
                label: 'Trong một năm',
                unit: 'đồng',
                formula: 'chi * thue / (100 + thue) * 12',
                highlight: true,
              },
              {
                id: 'tyle',
                label: 'Chiếm bao nhiêu phần trăm số tiền bạn tiêu',
                unit: '%',
                formula: 'thue / (100 + thue) * 100',
              },
            ],
            presets: [
              { label: 'Sinh viên ở trọ', values: { chi: 3000000, thue: 10 } },
              { label: 'Người mới đi làm', values: { chi: 6000000, thue: 10 } },
              { label: 'Gia đình bốn người', values: { chi: 15000000, thue: 10 } },
            ],
            insight:
              'Con số này không xuất hiện trên bất kỳ tờ khai nào mang tên bạn, và bạn không phải làm thủ tục gì để nộp nó. Nhưng nó đã rời khỏi túi bạn.',
          },
          {
            type: 'text',
            title: 'Minh tính thử',
            paragraphs: [
              'Minh tiêu khoảng ba triệu mỗi tháng: ăn uống, xăng xe, điện thoại, mua sắm vặt.',
              'Phần thuế nằm trong đó khoảng hai trăm bảy mươi nghìn mỗi tháng, tức hơn ba triệu hai một năm.',
              '"Ba triệu hai," Minh nói. "Bằng tiền trọ một tháng rưỡi của tui."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hùng nói thêm: con số đó còn chưa tính những khoản nằm sâu hơn.',
              'Xăng có thuế bảo vệ môi trường và thuế tiêu thụ đặc biệt. Hàng nhập khẩu có thuế nhập khẩu cộng vào giá vốn trước khi tính tiếp thuế giá trị gia tăng.',
              'Không có dòng nào trên hoá đơn ghi những khoản đó ra. Chúng đã nằm sẵn trong con số Minh nhìn thấy.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Vì sao gần như không ai để ý',
            variant: 'warning',
            text: 'Thuế thu nhập được trừ vào lương và có một dòng riêng trên bảng lương, nên người ta cảm nhận rất rõ. Thuế gián thu thì trộn vào giá, chia nhỏ thành hàng nghìn lần mua sắm, mỗi lần vài nghìn đồng. Cùng một số tiền, nhưng một bên thì đau và một bên thì vô hình — và điều đó có hệ quả chính trị rất lớn.',
          },
          {
            type: 'question',
            question:
              'Hệ quả chính trị của việc thuế gián thu "vô hình" là gì?',
            options: [
              { id: 'a', text: 'Người dân đóng thuế nhiều hơn mà không phàn nàn', isCorrect: false },
              { id: 'b', text: 'Người dân ít giám sát việc chi tiêu công hơn, vì họ không cảm thấy mình là người đã bỏ tiền ra', isCorrect: true },
              { id: 'c', text: 'Nhà nước thu được ít thuế hơn', isCorrect: false },
              { id: 'd', text: 'Doanh nghiệp phải chịu toàn bộ gánh nặng', isCorrect: false },
            ],
            explanation:
              'Phương án a mô tả đúng hiện tượng nhưng chưa phải hệ quả quan trọng nhất. Điều đáng nói hơn là: người ta giám sát việc tiêu tiền chặt nhất khi họ cảm thấy đó là tiền của mình. Nếu một người tin rằng mình chưa từng đóng đồng thuế nào, họ sẽ không thấy mình có tư cách hỏi tiền thuế được tiêu ra sao — và đó là mất mát lớn hơn nhiều so với vài trăm nghìn mỗi tháng.',
          },
          {
            type: 'text',
            title: 'Nếu quán không phải nộp thì giá có rẻ hơn không?',
            paragraphs: [
              'Minh hỏi một câu mà anh nghĩ là bắt bí được Hùng: "Vậy nếu bỏ cái thuế đó đi thì ly cà phê còn tám mươi ba nghìn hả?"',
              'Hùng nói: "Chưa chắc. Có thể quán giữ lại một phần."',
              '"Chuyện giá giảm bao nhiêu khi bỏ thuế phụ thuộc vào việc khách có dễ bỏ đi tìm chỗ khác hay không. Cái đó gọi là ai chịu phần nào của thuế."',
            ],
          },
          {
            type: 'question',
            question:
              'Với một mặt hàng mà người mua rất khó bỏ (ví dụ xăng, điện, thuốc chữa bệnh), khi tăng thuế thì gánh nặng thường rơi vào ai nhiều hơn?',
            options: [
              { id: 'a', text: 'Người bán, vì họ phải nộp thuế', isCorrect: false },
              { id: 'b', text: 'Người mua, vì họ vẫn phải mua dù giá tăng nên người bán chuyển được phần lớn thuế vào giá', isCorrect: true },
              { id: 'c', text: 'Chia đều đúng một nửa cho mỗi bên', isCorrect: false },
              { id: 'd', text: 'Nhà nước, vì phải bù giá', isCorrect: false },
            ],
            explanation:
              'Ai thực sự gánh thuế không do luật quy định mà do thị trường quyết định. Nếu người mua có thể dễ dàng bỏ đi (mua hàng khác, không mua nữa), người bán buộc phải nuốt bớt phần thuế để giữ khách. Nếu người mua không bỏ được — xăng để đi làm, thuốc để chữa bệnh — thì gần như toàn bộ phần thuế được chuyển vào giá. Đây là lý do thuế đánh vào hàng thiết yếu thường rơi nặng nhất vào người tiêu dùng.',
          },
          {
            type: 'text',
            title: 'Minh nghĩ tới xăng',
            paragraphs: [
              'Minh chạy xe máy đi học mỗi ngày, đổ xăng khoảng ba lần mỗi tháng.',
              'Anh nhận ra mình chưa bao giờ nghĩ tới chuyện không đổ xăng khi giá tăng — anh vẫn phải đi học.',
              '"Vậy là mấy cái tui bắt buộc phải mua thì tui gánh gần hết," anh nói. "Còn mấy cái tui mua cho vui thì tui bỏ được."',
            ],
          },
          {
            type: 'text',
            title: 'Câu Hùng nói làm Minh nhớ lâu',
            paragraphs: [
              '"Ông biết vì sao mấy nước hay cãi nhau chuyện thuế không?"',
              '"Vì thuế thu nhập nó hiện rõ trên bảng lương. Người ta thấy mất tiền thì người ta hỏi tiền đi đâu."',
              '"Còn cái thuế nằm trong giá cà phê thì không ai hỏi hết. Mà nó mới là phần lớn."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh về nhà và làm một việc anh chưa từng nghĩ tới: anh giữ lại hoá đơn trong một tuần.',
              'Cuối tuần anh cộng lại phần thuế giá trị gia tăng in trên đó: hai trăm mười một nghìn, chỉ tính những lần có hoá đơn.',
              'Còn những lần mua ngoài chợ, mua ở tiệm tạp hoá, không có hoá đơn thì anh không đếm được — nhưng thuế vẫn nằm trong giá.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Người nộp thuế và người chịu thuế',
            description: 'Vì sao ai cũng đang đóng thuế, kể cả người chưa từng nhận lương.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai vai trò khác nhau',
                  paragraphs: [
                    'Người nộp thuế: người có nghĩa vụ kê khai và chuyển tiền vào ngân sách. Với thuế giá trị gia tăng, đó là người bán.',
                    'Người chịu thuế: người thực sự bị mất tiền. Với thuế giá trị gia tăng, đó là người mua cuối cùng.',
                    'Hai vai trò này trùng nhau ở thuế trực thu (thuế thu nhập), nhưng tách rời ở thuế gián thu.',
                  ],
                },
                {
                  heading: 'Những khoản thuế nằm trong giá',
                  paragraphs: [
                    'Thuế giá trị gia tăng: có ghi riêng trên hoá đơn, nhưng đã cộng vào giá niêm yết.',
                    'Thuế tiêu thụ đặc biệt: đánh vào rượu bia, thuốc lá, xăng, ô tô — nằm trong giá vốn, không hiện ra riêng.',
                    'Thuế bảo vệ môi trường: đánh vào xăng dầu, túi ni lông — cũng nằm sẵn trong giá.',
                    'Thuế nhập khẩu: cộng vào giá vốn hàng nhập trước khi tính các thuế khác.',
                  ],
                },
                {
                  heading: 'Vì sao điều này quan trọng',
                  paragraphs: [
                    'Nếu chỉ tính thuế thu nhập, ta sẽ kết luận sai rằng người chưa đi làm và người thu nhập thấp không đóng thuế.',
                    'Kết luận sai đó dẫn tới một kết luận sai lớn hơn: rằng họ không có tư cách hỏi về việc tiền thuế được tiêu thế nào.',
                    'Trên thực tế, mọi người đang đóng góp vào ngân sách mỗi ngày, và quyền được biết tiền đó đi đâu là quyền của tất cả.',
                  ],
                },
              ],
              relatedConcepts: ['Thuế trực thu', 'Thuế gián thu', 'Gánh nặng thuế thực tế'],
              furtherReading: [
                'Bài học "Ai đang thực sự chịu thuế?" trong khoá Thuế 101',
                'Luật Thuế giá trị gia tăng — đối tượng nộp thuế và cơ chế khấu trừ',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Người nộp thuế và người chịu thuế là hai vai khác nhau — với thuế trong giá hàng, chúng gần như không bao giờ trùng.\n' +
              '✓ Một sinh viên chưa đi làm vẫn đóng vài triệu đồng thuế mỗi năm qua giá hàng hoá dịch vụ.\n' +
              '✓ Thuế gián thu vô hình vì nó trộn vào giá và chia nhỏ thành hàng nghìn lần mua sắm.\n' +
              '✓ Hệ quả lớn nhất của sự vô hình đó không phải là tiền, mà là việc người ta thôi thấy mình có tư cách giám sát.',
          },
          {
            type: 'text',
            title: 'Nhưng nếu ai cũng đóng thì ai đóng nhiều hơn?',
            paragraphs: [
              'Minh mang con số ba triệu hai đi khoe với Hùng và nói: "Vậy là ai cũng đóng như nhau hết hả?"',
              'Hùng lắc đầu: "Không. Ông với ông chủ quán cà phê đóng khác nhau nhiều lắm."',
              '"Mà cái khác đó mới là chỗ người ta cãi nhau."',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'ai-dong-nang-hon-ai',
        title: 'Ai đóng nặng hơn ai?',
        blocks: [
          {
            type: 'text',
            title: 'Hai người, cùng một ly cà phê',
            paragraphs: [
              'Hùng vẽ ra giấy hai cột.',
              'Cột một: Minh, sinh viên, gia đình chu cấp bốn triệu mỗi tháng, tiêu gần hết.',
              'Cột hai: chủ quán cà phê, thu nhập tám mươi triệu mỗi tháng, tiêu ba mươi triệu và để dành năm mươi.',
            ],
          },
          {
            type: 'callout',
            icon: 'scale',
            title: 'Cùng mua một ly cà phê 92.000 đồng',
            variant: 'info',
            text: 'Cả hai đều trả đúng 8.364 đồng thuế giá trị gia tăng. Nhưng với Minh, số đó bằng 0,21% thu nhập tháng. Với chủ quán, nó bằng 0,01%. Cùng một số tiền tuyệt đối, gánh nặng chênh nhau hai mươi lần.',
          },
          {
            type: 'question',
            question:
              'Cùng một mức thuế suất áp cho mọi người, nhưng người thu nhập thấp lại chịu gánh nặng nặng hơn tính theo tỷ lệ thu nhập. Hiện tượng này gọi là gì?',
            options: [
              { id: 'a', text: 'Thuế luỹ tiến', isCorrect: false },
              { id: 'b', text: 'Thuế luỹ thoái', isCorrect: true },
              { id: 'c', text: 'Thuế tỷ lệ', isCorrect: false },
              { id: 'd', text: 'Thuế kép', isCorrect: false },
            ],
            explanation:
              'Thuế luỹ thoái là loại thuế mà tỷ lệ đóng góp so với thu nhập giảm dần khi thu nhập tăng. Thuế giá trị gia tăng mang tính luỹ thoái vì người thu nhập thấp tiêu gần hết những gì họ có, còn người thu nhập cao thì để dành hoặc đầu tư một phần lớn — và phần để dành đó không bị đánh thuế tiêu dùng.',
          },
          {
            type: 'text',
            title: 'Vì sao lại như vậy',
            paragraphs: [
              'Hùng giải thích bằng một câu ngắn: "Thuế giá trị gia tăng đánh vào phần ông tiêu, không đánh vào phần ông để dành."',
              'Minh tiêu gần hết bốn triệu, nên gần như toàn bộ thu nhập của anh đi qua vùng chịu thuế.',
              'Chủ quán tiêu ba mươi trong tám mươi triệu, nên năm mươi triệu còn lại không chạm vào thuế tiêu dùng.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh hỏi: "Vậy cái thuế này bất công hả?"',
              'Hùng trả lời cẩn thận hơn Minh mong đợi: "Nó luỹ thoái. Còn bất công hay không thì phải nhìn cả hệ thống."',
              '"Tại vì thuế thu nhập cá nhân thì ngược lại — lương càng cao đóng tỷ lệ càng cao. Người ta thiết kế hai cái để bù nhau."',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Luỹ tiến, tỷ lệ, luỹ thoái',
            variant: 'info',
            text: 'Luỹ tiến: thu nhập càng cao thì tỷ lệ đóng góp càng cao — như thuế thu nhập cá nhân với các bậc thuế suất tăng dần. Tỷ lệ: ai cũng đóng cùng một tỷ lệ trên thu nhập. Luỹ thoái: thu nhập càng cao thì tỷ lệ đóng góp càng thấp — như thuế tiêu dùng. Một hệ thống thuế thường trộn cả ba, và câu hỏi công bằng nằm ở tỷ trọng giữa chúng.',
          },
          {
            type: 'question',
            question:
              'Nếu một quốc gia thu chủ yếu từ thuế gián thu thay vì thuế thu nhập, điều đó có ý nghĩa gì?',
            options: [
              { id: 'a', text: 'Ngân sách sẽ ổn định hơn', isCorrect: false },
              { id: 'b', text: 'Gánh nặng thuế nghiêng nhiều hơn về phía người có thu nhập thấp và trung bình, tính theo tỷ lệ thu nhập', isCorrect: true },
              { id: 'c', text: 'Người giàu sẽ đóng nhiều hơn', isCorrect: false },
              { id: 'd', text: 'Doanh nghiệp sẽ chịu phần lớn gánh nặng', isCorrect: false },
            ],
            explanation:
              'Vì thuế gián thu mang tính luỹ thoái, một hệ thống dựa nhiều vào nó sẽ dịch gánh nặng về phía những người tiêu hết phần lớn thu nhập của mình. Điều này không tự động nghĩa là hệ thống đó tồi — thuế gián thu dễ thu hơn, khó trốn hơn, và ổn định hơn. Nhưng đó là một lựa chọn có hệ quả phân phối rõ ràng, và lựa chọn ấy đáng được nói ra chứ không nên để nó vô hình.',
          },
          {
            type: 'text',
            title: 'Vì sao vẫn phải có thuế gián thu',
            paragraphs: [
              'Minh nói: "Vậy bỏ thuế giá trị gia tăng đi, thu thuế thu nhập không thôi cho công bằng."',
              'Hùng cười: "Ông thử nghĩ coi ai sẽ nộp."',
              '"Ở Việt Nam có mấy chục triệu người lao động, mà phần lớn làm việc không có hợp đồng, không có bảng lương. Bác Tư bán bánh mì thì thu nhập bao nhiêu, ai biết?"',
            ],
          },
          {
            type: 'question',
            question:
              'Trong một nền kinh tế có tỷ lệ lớn hoạt động phi chính thức, vì sao thuế gián thu lại đóng vai trò quan trọng?',
            options: [
              { id: 'a', text: 'Vì nó có thuế suất cao hơn', isCorrect: false },
              { id: 'b', text: 'Vì nó thu được từ mọi giao dịch mua bán mà không cần biết thu nhập của từng người là bao nhiêu', isCorrect: true },
              { id: 'c', text: 'Vì người dân thích đóng thuế gián thu hơn', isCorrect: false },
              { id: 'd', text: 'Vì nó không cần bộ máy quản lý', isCorrect: false },
            ],
            explanation:
              'Thuế thu nhập chỉ thu được nếu biết được thu nhập, và điều đó đòi hỏi hợp đồng lao động, bảng lương, hệ thống ngân hàng, và bộ máy quản lý. Ở nơi phần lớn giao dịch bằng tiền mặt và nhiều người lao động tự do, việc xác định thu nhập rất khó. Thuế gián thu thì bám vào giao dịch mua bán — thứ luôn xảy ra bất kể người mua là ai. Đó là một lý do thực tế, không phải một sự bất công cố ý.',
          },
          {
            type: 'text',
            title: 'Câu trả lời hay nhất là "tuỳ mình muốn gì"',
            paragraphs: [
              'Minh bắt đầu thấy khó chịu: "Vậy rốt cuộc cái nào tốt hơn?"',
              'Hùng nói: "Không có cái nào tốt hơn tuyệt đối. Thuế gián thu thì dễ thu, ổn định, khó trốn — mà luỹ thoái. Thuế trực thu thì công bằng hơn theo tỷ lệ thu nhập — mà khó thu, dễ trốn, và phụ thuộc chu kỳ kinh tế."',
              '"Chọn tỷ trọng giữa hai cái là một quyết định chính trị, không phải một bài toán có đáp án."',
            ],
          },
          {
            type: 'text',
            title: 'Minh tra con số của Việt Nam',
            paragraphs: [
              'Hùng bảo Minh tự tra, vì "ông tự tìm thì ông mới nhớ".',
              'Minh tìm trên cổng thông tin của Bộ Tài chính và các bản công bố dự toán ngân sách nhà nước.',
              'Anh mất khoảng hai mươi phút mới quen với cách trình bày, nhưng con số thì tìm được: các khoản thuế gián thu — giá trị gia tăng, tiêu thụ đặc biệt, xuất nhập khẩu — chiếm phần lớn hơn hẳn so với thuế thu nhập cá nhân trong tổng thu.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều làm Minh bất ngờ không phải con số.',
              'Mà là việc những con số đó nằm công khai, ai cũng tải về được, và anh học đại học ba năm mà chưa từng mở ra lần nào.',
              '"Tui tưởng mấy cái này là bí mật," anh nói.',
              '"Không bí mật," Hùng nói. "Chỉ là không ai mở."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Công khai không đồng nghĩa với dễ tiếp cận',
            variant: 'warning',
            text: 'Một tài liệu được đăng công khai theo đúng quy định vẫn có thể thực tế không ai đọc, nếu nó dài hàng trăm trang, dùng thuật ngữ chuyên ngành, và không có bản tóm tắt cho người thường. Minh bạch hình thức là điều kiện cần, nhưng nó chỉ trở thành minh bạch thật khi có ai đó biến số liệu thành thứ đọc được.',
          },
          {
            type: 'text',
            title: 'Hùng chỉ Minh một cách đọc',
            paragraphs: [
              'Thay vì đọc cả bản dự toán, Hùng chỉ Minh nhìn đúng ba con số:',
              '1️⃣ Tổng thu ngân sách là bao nhiêu.',
              '2️⃣ Trong đó thuế gián thu chiếm bao nhiêu phần, thuế trực thu bao nhiêu phần.',
              '3️⃣ Chia tổng thu cho dân số để ra con số bình quân mỗi người.',
              'Ba con số này đủ để có một bức tranh, và chúng lấy được trong mười phút.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh làm phép chia thứ ba và ngồi nhìn kết quả khá lâu.',
              'Con số bình quân đầu người lớn hơn nhiều so với những gì anh hình dung, và nó bao gồm cả trẻ em, người già, người không có thu nhập.',
              '"Nghĩa là mấy người không đi làm cũng nằm trong cái phép chia này," anh nói.',
              '"Ừ," Hùng nói. "Mà họ vẫn đóng thuế qua giá hàng, nên nói cho đúng thì họ nằm trong đó ở cả hai đầu."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao con số "thuế bình quân đầu người" cần được đọc cẩn thận?',
            options: [
              { id: 'a', text: 'Vì nó luôn bị tính sai', isCorrect: false },
              { id: 'b', text: 'Vì nó là số bình quân — nó không cho biết gánh nặng phân bố thế nào giữa các nhóm thu nhập', isCorrect: true },
              { id: 'c', text: 'Vì dân số thay đổi liên tục', isCorrect: false },
              { id: 'd', text: 'Vì nó chỉ tính người trưởng thành', isCorrect: false },
            ],
            explanation:
              'Số bình quân che mất phân bố. Cùng một mức bình quân có thể ứng với một xã hội nơi mọi người đóng gần như nhau, hoặc một xã hội nơi một nhóm nhỏ đóng rất nhiều và phần còn lại đóng rất ít — hoặc ngược lại. Muốn nói về công bằng thuế thì phải nhìn phân bố, không nhìn bình quân.',
          },
          {
            type: 'text',
            title: 'Minh hỏi câu quan trọng nhất',
            paragraphs: [
              '"Vậy ai quyết định là thu nhiều từ cái nào?"',
              'Hùng nói: "Quốc hội. Luật thuế do Quốc hội thông qua, thuế suất cũng vậy."',
              '"Vậy là mấy ông đại biểu quyết cái ly cà phê của tui đắt thêm tám ngàn?"',
              '"Ừ. Mà ông có biết đại biểu khu vực ông là ai không?"',
              'Minh không biết.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Luỹ tiến và luỹ thoái',
            description: 'Cách đọc công bằng thuế mà không dừng ở cảm tính.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba dạng cơ bản',
                  paragraphs: [
                    'Luỹ tiến: tỷ lệ đóng góp tăng theo thu nhập. Ví dụ thuế thu nhập cá nhân với các bậc thuế suất tăng dần.',
                    'Tỷ lệ: mọi người đóng cùng một tỷ lệ trên thu nhập.',
                    'Luỹ thoái: tỷ lệ đóng góp giảm khi thu nhập tăng. Thuế tiêu dùng thuộc nhóm này, vì người thu nhập cao để dành một phần lớn và phần đó không chịu thuế tiêu dùng.',
                  ],
                },
                {
                  heading: 'Vì sao thuế tiêu dùng luỹ thoái',
                  paragraphs: [
                    'Người thu nhập thấp tiêu gần hết thu nhập, nên gần như toàn bộ đi qua vùng chịu thuế.',
                    'Người thu nhập cao tiêu một phần và tích luỹ phần còn lại, nên tỷ lệ thu nhập đi qua vùng chịu thuế thấp hơn.',
                    'Với hàng thiết yếu — thực phẩm, xăng, điện — hiệu ứng này còn mạnh hơn, vì người thu nhập thấp dành tỷ trọng lớn hơn cho chúng.',
                  ],
                },
                {
                  heading: 'Đánh giá một hệ thống thuế',
                  paragraphs: [
                    'Không đánh giá từng sắc thuế riêng lẻ — nhìn tỷ trọng giữa nhóm trực thu và gián thu trong tổng thu.',
                    'Thuế gián thu dễ thu, khó trốn, nguồn thu ổn định; đó là những ưu điểm thật, không phải nguỵ biện.',
                    'Nhưng việc chọn dựa nhiều vào nó là một quyết định có hệ quả phân phối, và quyết định đó nên được nói ra công khai thay vì để nó vô hình.',
                    'Số bình quân đầu người che mất phân bố — muốn bàn về công bằng thì phải nhìn theo nhóm thu nhập.',
                  ],
                },
              ],
              relatedConcepts: ['Thuế luỹ tiến', 'Thuế luỹ thoái', 'Cơ cấu thu ngân sách'],
              furtherReading: [
                'Bài học "Thuế có công bằng không?" trong khoá Thuế 101',
                'Bản công bố dự toán và quyết toán ngân sách nhà nước hằng năm của Bộ Tài chính',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Cùng một mức thuế trên một ly cà phê có thể là gánh nặng chênh nhau hai mươi lần giữa hai người.\n' +
              '✓ Thuế tiêu dùng mang tính luỹ thoái vì nó chỉ đánh vào phần thu nhập được tiêu, không đánh vào phần tích luỹ.\n' +
              '✓ Đánh giá công bằng thuế phải nhìn cả hệ thống và tỷ trọng giữa trực thu với gián thu, không nhìn từng sắc thuế.\n' +
              '✓ Số liệu ngân sách được công bố công khai, nhưng công khai không đồng nghĩa với có người đọc.',
          },
          {
            type: 'text',
            title: 'Ba triệu hai của Minh đi đâu?',
            paragraphs: [
              'Minh về nhà với hai câu hỏi mà anh chưa từng đặt ra trong hai mươi mốt năm.',
              'Ba triệu hai anh đóng mỗi năm đi vào đâu, và ai là người quyết định nó đi vào đâu?',
              'Anh mở lại bản dự toán ngân sách, lần này không tìm phần thu nữa mà tìm phần chi.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'ba-trieu-hai-di-dau',
        title: 'Ba triệu hai đi đâu?',
        blocks: [
          {
            type: 'text',
            title: 'Phần chi của bản dự toán',
            paragraphs: [
              'Minh mở bản dự toán ngân sách và cuộn xuống phần chi.',
              'Anh mất một lúc mới hiểu cách nó được chia: chi đầu tư phát triển, chi thường xuyên, chi trả nợ, và các khoản dự phòng.',
              'Trong chi thường xuyên lại chia tiếp theo lĩnh vực: giáo dục đào tạo, y tế, quốc phòng an ninh, quản lý hành chính, khoa học công nghệ, bảo đảm xã hội.',
            ],
          },
          {
            type: 'callout',
            icon: 'pie-chart',
            title: 'Điều Minh chú ý nhất',
            variant: 'info',
            text: 'Giáo dục và đào tạo là một trong những khoản chi lớn nhất trong chi thường xuyên. Minh học trường công. Học phí anh đóng chỉ chiếm một phần nhỏ chi phí đào tạo thật sự cho một sinh viên — phần còn lại đến từ ngân sách.',
          },
          {
            type: 'question',
            question:
              'Minh học trường công, học phí thấp hơn nhiều so với chi phí đào tạo thực tế. Phần chênh lệch đó đến từ đâu?',
            options: [
              { id: 'a', text: 'Nhà trường tự bù bằng nguồn thu khác', isCorrect: false },
              { id: 'b', text: 'Ngân sách nhà nước, tức là tiền thuế của những người khác và của chính Minh', isCorrect: true },
              { id: 'c', text: 'Các khoản tài trợ từ doanh nghiệp', isCorrect: false },
              { id: 'd', text: 'Không có chênh lệch, học phí đã đủ chi phí', isCorrect: false },
            ],
            explanation:
              'Đây là chỗ khép lại vòng tròn của câu chuyện. Minh đóng thuế mà không biết, và anh cũng đang nhận lại từ ngân sách mà không biết — mỗi giờ anh ngồi trong giảng đường đều có một phần được chi trả bởi tiền thuế. Quan hệ giữa công dân và ngân sách là quan hệ hai chiều, và phần lớn người ta không nhìn thấy chiều nào.',
          },
          {
            type: 'text',
            title: 'Minh thử một phép so sánh',
            paragraphs: [
              'Anh lấy con số ba triệu hai anh đóng mỗi năm, và nhân với số sinh viên trong trường anh: hơn ba mươi nghìn người.',
              'Nếu tính riêng nhóm sinh viên của một trường, con số đã lên tới gần một trăm tỷ đồng mỗi năm.',
              '"Mà tụi tui là nhóm nghèo nhất trong xã hội đó," Minh nói. "Không ai coi tụi tui là người đóng thuế hết."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao nhóm "không được coi là người đóng thuế" lại thường ít có tiếng nói nhất trong các quyết định về ngân sách?',
            options: [
              { id: 'a', text: 'Vì họ đóng góp ít nên tiếng nói ít hơn là hợp lý', isCorrect: false },
              { id: 'b', text: 'Vì họ và cả xã hội đều tin rằng họ không đóng góp, nên không ai — kể cả họ — thấy họ có tư cách yêu cầu giải trình', isCorrect: true },
              { id: 'c', text: 'Vì pháp luật không cho phép họ tham gia', isCorrect: false },
              { id: 'd', text: 'Vì họ không có thời gian quan tâm', isCorrect: false },
            ],
            explanation:
              'Rào cản ở đây không nằm trong luật mà nằm trong nhận thức, và nó có ở cả hai phía. Người ta không đòi hỏi giải trình vì tin rằng mình chưa góp gì, còn người ra quyết định cũng không thấy cần trả lời nhóm ấy. Nhận ra rằng mình đang đóng góp thật là điều kiện đầu tiên để thấy mình có quyền hỏi — đó là lý do một dòng chữ nhỏ trên hoá đơn lại quan trọng.',
          },
          {
            type: 'text',
            title: 'Minh liệt kê những gì anh đã nhận',
            paragraphs: [
              'Hùng bảo Minh thử liệt kê trong một ngày bình thường, anh dùng những gì được chi trả bằng ngân sách.',
              'Minh viết ra và thấy dài hơn anh tưởng:',
              '🛣️ Con đường anh chạy xe đi học, đèn đường buổi tối.',
              '🎓 Phần chi phí đào tạo mà học phí anh không phủ hết.',
              '🏥 Thẻ bảo hiểm y tế sinh viên được ngân sách hỗ trợ một phần.',
              '🚨 Cảnh sát giao thông, phòng cháy chữa cháy, y tế dự phòng — những thứ anh chỉ thấy khi cần.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh nhận ra một điều: những thứ trong danh sách đó đều có chung một đặc điểm.',
              'Anh không thể tự mua chúng riêng lẻ, và anh cũng không thể từ chối dùng chúng.',
              'Anh không thể mua riêng một đoạn đường cho mình, không thể tự thuê một đội chữa cháy cho khu trọ, và anh vẫn hưởng lợi từ việc hàng xóm được tiêm phòng dù anh không trả cho việc đó.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Hàng hoá công',
            variant: 'info',
            text: 'Là những thứ mà một người dùng không làm giảm phần của người khác, và không thể loại trừ ai khỏi việc hưởng lợi: quốc phòng, đèn đường, không khí sạch, hệ thống pháp luật. Không ai bỏ tiền túi mua chúng riêng lẻ vì không ai thu tiền được từ người dùng chùa. Đó là lý do những thứ này được chi trả bằng thuế thay vì bán trên thị trường.',
          },
          {
            type: 'budget-allocator',
            title: 'Nếu bạn được chia ngân sách',
            description:
              'Giả sử bạn có 100 đơn vị ngân sách cho một năm. Hãy phân bổ cho các lĩnh vực, rồi xem điều gì xảy ra với lựa chọn của bạn. Không có phương án đúng — chỉ có những đánh đổi khác nhau.',
            totalBudget: 100,
            unit: 'đơn vị',
            categories: [
              {
                id: 'giaoduc',
                label: 'Giáo dục và đào tạo',
                icon: 'graduation-cap',
                color: '#2563eb',
                defaultValue: 20,
                minValue: 0,
                description: 'Trường công, học bổng, đào tạo nghề',
              },
              {
                id: 'yte',
                label: 'Y tế',
                icon: 'heart-pulse',
                color: '#dc2626',
                defaultValue: 15,
                minValue: 0,
                description: 'Bệnh viện công, y tế dự phòng, bảo hiểm y tế',
              },
              {
                id: 'hatang',
                label: 'Hạ tầng',
                icon: 'road',
                color: '#f59e0b',
                defaultValue: 25,
                minValue: 0,
                description: 'Đường sá, cầu cống, điện nước, giao thông công cộng',
              },
              {
                id: 'ansinh',
                label: 'An sinh xã hội',
                icon: 'hand-heart',
                color: '#16a34a',
                defaultValue: 15,
                minValue: 0,
                description: 'Trợ cấp người già, người khuyết tật, hộ nghèo',
              },
              {
                id: 'anninh',
                label: 'Quốc phòng và an ninh',
                icon: 'shield',
                color: '#475569',
                defaultValue: 15,
                minValue: 0,
                description: 'Quân đội, công an, phòng cháy chữa cháy',
              },
              {
                id: 'hanhchinh',
                label: 'Quản lý hành chính',
                icon: 'building',
                color: '#7c3aed',
                defaultValue: 10,
                minValue: 0,
                description: 'Bộ máy nhà nước, toà án, thủ tục công',
              },
            ],
            outcomes: [
              {
                condition: 'giaoduc + yte >= 45',
                title: 'Ưu tiên con người',
                description:
                  'Bạn dồn phần lớn cho giáo dục và y tế. Đây là những khoản có tác động dài hạn nhưng khó thấy kết quả trong một nhiệm kỳ — và vì thế chúng thường là nhóm đầu tiên bị cắt khi ngân sách khó khăn.',
                variant: 'good',
              },
              {
                condition: 'hatang >= 40',
                title: 'Ưu tiên công trình',
                description:
                  'Hạ tầng có ưu điểm là nhìn thấy được: một cây cầu mới thì ai cũng biết. Đây cũng là nhóm chi dễ được ủng hộ nhất về mặt chính trị, và cũng là nhóm dễ thất thoát nhất nếu thiếu giám sát.',
                variant: 'neutral',
              },
              {
                condition: 'ansinh <= 5',
                title: 'An sinh gần như bằng không',
                description:
                  'Với mức này, người già không lương hưu, người khuyết tật và hộ nghèo gần như không nhận được hỗ trợ nào. Chi phí đó không biến mất — nó chuyển sang gia đình họ, và thường rơi vào những gia đình vốn đã ít nguồn lực nhất.',
                variant: 'bad',
              },
              {
                condition: 'hanhchinh >= 25',
                title: 'Bộ máy chiếm phần lớn',
                description:
                  'Một phần tư ngân sách cho bộ máy quản lý là mức rất cao. Bộ máy là thứ cần thiết để mọi khoản chi khác được thực hiện, nhưng khi nó phình ra thì phần còn lại của chiếc bánh nhỏ đi tương ứng.',
                variant: 'bad',
              },
            ],
          },
          {
            type: 'text',
            title: 'Minh phát hiện ra điều khó chịu nhất',
            paragraphs: [
              'Sau ba lần thử chia lại, Minh nói: "Cái này chia kiểu gì cũng thiếu."',
              '"Đúng rồi," Hùng nói. "Đó là toàn bộ vấn đề của ngân sách."',
              '"Không có phương án nào làm mọi người hài lòng, vì tổng số là cố định. Thêm cho chỗ này thì phải bớt chỗ kia."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao mọi quyết định ngân sách đều mang tính chính trị, chứ không phải chỉ là bài toán kỹ thuật?',
            options: [
              { id: 'a', text: 'Vì các chính trị gia muốn can thiệp', isCorrect: false },
              { id: 'b', text: 'Vì nguồn lực có hạn nên mọi lựa chọn đều là đánh đổi giữa các nhóm khác nhau, và không có công thức khách quan nào quyết định nhóm nào quan trọng hơn', isCorrect: true },
              { id: 'c', text: 'Vì số liệu ngân sách không chính xác', isCorrect: false },
              { id: 'd', text: 'Vì các bộ ngành tranh giành nhau', isCorrect: false },
            ],
            explanation:
              'Nếu tồn tại một công thức khoa học cho biết nên chi bao nhiêu cho giáo dục so với hạ tầng, thì việc chia ngân sách sẽ là việc của chuyên gia. Nhưng câu hỏi "một trường học đáng giá bằng bao nhiêu cây số đường" không có đáp án kỹ thuật — nó phụ thuộc vào việc xã hội coi trọng điều gì. Đó chính là định nghĩa của một quyết định chính trị.',
          },
          {
            type: 'text',
            title: 'Minh nhìn lại phần chi cho giáo dục',
            paragraphs: [
              'Sau khi chơi xong với việc chia ngân sách, Minh quay lại bản dự toán thật và nhìn phần giáo dục kỹ hơn.',
              'Anh thấy có một dòng ghi tỷ lệ chi cho giáo dục trên tổng chi ngân sách, và có mục tiêu được nêu trong các văn bản về chiến lược phát triển giáo dục.',
              'Anh so hai con số đó với nhau, và đó là lần đầu tiên trong đời anh so một chỉ tiêu với kết quả thực hiện.',
            ],
          },
          {
            type: 'question',
            question:
              'Việc so sánh "mục tiêu đề ra" với "số thực hiện" trong ngân sách cho biết điều gì mà từng con số riêng lẻ không cho biết?',
            options: [
              { id: 'a', text: 'Cho biết ngân sách có bị thâm hụt hay không', isCorrect: false },
              { id: 'b', text: 'Cho biết cam kết trên văn bản có được thực hiện trên thực tế hay không — đây là loại câu hỏi mà công dân có thể tự kiểm tra', isCorrect: true },
              { id: 'c', text: 'Cho biết lĩnh vực nào quan trọng nhất', isCorrect: false },
              { id: 'd', text: 'Cho biết tiền có bị thất thoát hay không', isCorrect: false },
            ],
            explanation:
              'Một con số chi tiêu đứng riêng thì khó đánh giá: mười phần trăm là nhiều hay ít? Nhưng khi đặt cạnh một mục tiêu đã được công bố, nó trở thành một câu hỏi rất cụ thể và rất khó né: chúng ta đã nói sẽ làm X, vậy đã làm được bao nhiêu? Đây là dạng giám sát đơn giản nhất mà một người bình thường thực hiện được, vì cả hai con số đều công khai.',
          },
          {
            type: 'text',
            title: 'Vì sao có khoản dễ được duyệt hơn khoản khác',
            paragraphs: [
              'Hùng chỉ ra một điểm mà Minh chưa nghĩ tới.',
              '"Ông để ý coi, mấy cái nhìn thấy được thì dễ xin tiền hơn. Cây cầu, cái quảng trường, con đường mới."',
              '"Còn mấy cái không nhìn thấy — như tiêm chủng, như bảo trì đường cũ, như đào tạo giáo viên — thì khó xin, mà nó mới là mấy cái quan trọng."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh hỏi vì sao lại thế.',
              '"Tại vì khánh thành cây cầu thì có ảnh chụp. Còn không có dịch bệnh xảy ra thì không có gì để chụp hết."',
              '"Cái gì phòng ngừa thành công thì trông y như là chưa từng có vấn đề gì."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Minh cũng để ý một điều nữa trong bản dự toán: khoản chi trả nợ.',
              'Đó là phần ngân sách dùng để trả gốc và lãi cho những khoản đã vay từ trước — nghĩa là những quyết định chi tiêu của các năm trước vẫn đang chiếm chỗ trong ngân sách năm nay.',
              '"Vậy là mình đang trả cho mấy cái quyết định hồi mình còn chưa đi học," anh nói.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nghịch lý của phòng ngừa',
            variant: 'warning',
            text: 'Chi cho phòng ngừa — y tế dự phòng, bảo trì hạ tầng, phòng chống thiên tai — có đặc điểm là khi nó hiệu quả thì không có gì xảy ra, nên không ai thấy. Còn khi nó bị cắt thì hậu quả xuất hiện nhiều năm sau, lúc người cắt đã không còn ở đó. Đây là một trong những lý do dai dẳng nhất khiến các khoản chi này luôn ở thế yếu.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Tiền thuế được chi cho những gì',
            description: 'Cách đọc phần chi của ngân sách và ba cái bẫy khi đánh giá.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Cấu trúc phần chi',
                  paragraphs: [
                    'Chi đầu tư phát triển: xây mới hạ tầng, công trình — phần nhìn thấy được rõ nhất.',
                    'Chi thường xuyên: lương bộ máy, vận hành trường học bệnh viện, an sinh xã hội — phần lớn nhất và ít được chú ý nhất.',
                    'Chi trả nợ: gốc và lãi của các khoản vay trước đó, khoản này không co giãn được.',
                    'Dự phòng: cho thiên tai, dịch bệnh và tình huống bất thường.',
                  ],
                },
                {
                  heading: 'Vì sao có những thứ chỉ ngân sách mới làm được',
                  paragraphs: [
                    'Hàng hoá công là những thứ không loại trừ được ai khỏi việc hưởng lợi, và một người dùng không làm giảm phần của người khác.',
                    'Không ai bán chúng trên thị trường được, vì không thu tiền được từ người dùng chùa.',
                    'Đèn đường, quốc phòng, y tế dự phòng, hệ thống pháp luật đều thuộc nhóm này.',
                  ],
                },
                {
                  heading: 'Ba cái bẫy khi đánh giá một khoản chi',
                  paragraphs: [
                    'Bẫy nhìn thấy được: công trình có ảnh khánh thành thì dễ được ủng hộ hơn khoản bảo trì hay đào tạo, dù giá trị có thể ngược lại.',
                    'Bẫy phòng ngừa: khi phòng ngừa hiệu quả thì không có gì xảy ra, nên không ai thấy công lao — và khoản đó dễ bị cắt.',
                    'Bẫy tổng số cố định: mọi đề xuất tăng chi cho một lĩnh vực đều đồng nghĩa với giảm ở lĩnh vực khác hoặc tăng thu, và người đề xuất thường chỉ nói vế đầu.',
                  ],
                },
              ],
              relatedConcepts: ['Hàng hoá công', 'Đánh đổi ngân sách', 'Nghịch lý phòng ngừa'],
              furtherReading: [
                'Bài học "Tiền thuế được chi cho những gì?" trong khoá Thuế 101',
                'Bản công bố dự toán ngân sách nhà nước hằng năm — phần chi theo lĩnh vực',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Quan hệ giữa công dân và ngân sách là hai chiều: bạn đóng mà không biết, và cũng nhận lại mà không biết.\n' +
              '✓ Hàng hoá công tồn tại được bằng thuế vì không ai bán chúng riêng lẻ trên thị trường được.\n' +
              '✓ Ngân sách có tổng cố định, nên mọi lựa chọn đều là đánh đổi — và không có công thức kỹ thuật nào quyết định thay.\n' +
              '✓ Khoản chi nhìn thấy được luôn dễ được duyệt hơn khoản phòng ngừa, dù giá trị thật có thể ngược lại.',
          },
          {
            type: 'text',
            title: 'Minh vẫn chưa trả lời được câu của Hùng',
            paragraphs: [
              'Hùng hỏi Minh có biết đại biểu Quốc hội khu vực mình là ai không, và Minh không biết.',
              'Anh thấy hơi ngượng, nên tối đó anh đi tìm.',
              'Việc tìm dễ hơn anh tưởng. Nhưng thứ anh phát hiện ra sau đó thì làm anh ngồi im khá lâu.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'ai-quyet-dinh-ly-ca-phe-cua-minh',
        title: 'Ai quyết định ly cà phê của Minh',
        blocks: [
          {
            type: 'text',
            title: 'Minh tìm được tên',
            paragraphs: [
              'Minh tra và tìm được danh sách đại biểu Quốc hội của đơn vị bầu cử nơi anh đăng ký thường trú.',
              'Có tên, có ảnh, có tiểu sử tóm tắt, có thông tin về việc đại biểu đó tham gia uỷ ban nào.',
              'Anh ngồi nhìn danh sách và nhận ra: anh đã đủ tuổi bầu cử được ba năm, và anh không nhớ mình đã bầu cho ai.',
            ],
          },
          {
            type: 'text',
            title: 'Vì sao Minh không nhớ mình bầu cho ai',
            paragraphs: [
              'Minh thành thật với Hùng: lần bầu cử đó anh đi bầu vì lớp nhắc, anh đọc lướt danh sách trong phòng bỏ phiếu, và anh chọn theo cảm tính.',
              '"Tui đâu biết mấy người đó là ai."',
              'Hùng không trách: "Tui cũng vậy. Mà cái đó không hẳn là lỗi của mình đâu."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao cử tri thường không biết rõ về ứng viên khi đi bầu?',
            options: [
              { id: 'a', text: 'Vì họ lười tìm hiểu', isCorrect: false },
              { id: 'b', text: 'Vì chi phí tìm hiểu cho từng cử tri là có thật, trong khi lá phiếu của một người gần như không thay đổi được kết quả — nên việc không tìm hiểu là hợp lý về mặt cá nhân dù có hại cho tập thể', isCorrect: true },
              { id: 'c', text: 'Vì thông tin về ứng viên bị giữ kín', isCorrect: false },
              { id: 'd', text: 'Vì bầu cử không quan trọng', isCorrect: false },
            ],
            explanation:
              'Hiện tượng này có tên là "thờ ơ hợp lý": bỏ vài giờ nghiên cứu để làm cho một lá phiếu trong hàng trăm nghìn lá chính xác hơn là một khoản đầu tư tồi nếu tính riêng cho cá nhân. Nhưng khi tất cả cùng suy nghĩ như vậy, chất lượng của lựa chọn tập thể giảm xuống. Cách xử lý không phải là trách cá nhân, mà là làm giảm chi phí tìm hiểu — thông tin ngắn gọn, dễ tra, đúng lúc.',
          },
          {
            type: 'callout',
            icon: 'landmark',
            title: 'Ai quyết định mức thuế',
            variant: 'info',
            text: 'Ở Việt Nam, các luật thuế và mức thuế suất do Quốc hội thông qua. Một số điều chỉnh trong phạm vi được uỷ quyền thuộc thẩm quyền của Uỷ ban Thường vụ Quốc hội hoặc Chính phủ. Nghĩa là con số 10% trên tờ hoá đơn cà phê của Minh là kết quả của một quy trình lập pháp, chứ không phải một hằng số tự nhiên.',
          },
          {
            type: 'question',
            question:
              'Vì sao việc biết "ai quyết định mức thuế" lại quan trọng với một người bình thường?',
            options: [
              { id: 'a', text: 'Để biết ai chịu trách nhiệm khi giá tăng', isCorrect: false },
              { id: 'b', text: 'Vì nó biến mức thuế từ một điều kiện tự nhiên không thể bàn thành một quyết định của con người — mà quyết định của con người thì có thể được chất vấn và thay đổi', isCorrect: true },
              { id: 'c', text: 'Để có thể khiếu nại nếu thấy thuế quá cao', isCorrect: false },
              { id: 'd', text: 'Vì luật yêu cầu công dân phải biết', isCorrect: false },
            ],
            explanation:
              'Chừng nào một con số còn có vẻ như thời tiết — nó cứ thế thôi — thì không ai nghĩ tới việc bàn về nó. Khi bạn biết nó được một nhóm người cụ thể quyết định theo một quy trình cụ thể, nó chuyển từ vùng "chấp nhận" sang vùng "có thể tham gia". Đó là bước đầu tiên và cũng là bước bị bỏ qua nhiều nhất trong quan hệ giữa công dân và chính sách.',
          },
          {
            type: 'text',
            title: 'Hùng đưa Minh xem một ví dụ có thật',
            paragraphs: [
              'Hùng kể về những lần chính sách thuế được điều chỉnh sau khi có tranh luận công khai.',
              'Có những đề xuất tăng thuế bị rút lại hoặc điều chỉnh sau khi vấp phản ứng rộng rãi từ dư luận, doanh nghiệp và các chuyên gia.',
              'Có những quy định về mức giảm trừ gia cảnh được nâng lên sau nhiều năm bị phản ánh là đã lạc hậu so với mức sống.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điểm chung của những lần đó không phải là ai đó hô hào trên mạng.',
              'Chúng đều đi qua một quy trình: đề xuất được công bố lấy ý kiến, các bên có liên quan gửi góp ý bằng văn bản, báo chí phân tích, và cơ quan soạn thảo phải giải trình tiếp thu.',
              'Đó là một quy trình chậm, ít kịch tính, và gần như không ai theo dõi — nhưng nó là chỗ thay đổi thực sự xảy ra.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Lấy ý kiến dự thảo là một cánh cửa mở',
            variant: 'info',
            text: 'Theo Luật Ban hành văn bản quy phạm pháp luật, dự thảo luật và nhiều loại văn bản phải được đăng công khai để lấy ý kiến trong một khoảng thời gian nhất định, và cơ quan soạn thảo có trách nhiệm tiếp thu, giải trình. Cánh cửa này luôn mở, phần lớn thời gian không có ai bước vào, và vì thế những ý kiến có bước vào thì có trọng lượng hơn người ta tưởng.',
          },
          {
            type: 'question',
            question:
              'Vì sao một góp ý bằng văn bản trong giai đoạn lấy ý kiến dự thảo lại có sức nặng hơn một bài đăng phản đối trên mạng?',
            options: [
              { id: 'a', text: 'Vì nó được nhiều người đọc hơn', isCorrect: false },
              { id: 'b', text: 'Vì nó đi vào một quy trình mà cơ quan soạn thảo có trách nhiệm tiếp thu và giải trình, còn bài đăng thì không tạo ra nghĩa vụ nào', isCorrect: true },
              { id: 'c', text: 'Vì góp ý bằng văn bản thì lịch sự hơn', isCorrect: false },
              { id: 'd', text: 'Vì bài đăng trên mạng có thể bị xoá', isCorrect: false },
            ],
            explanation:
              'Bài đăng có thể tạo áp lực dư luận, và đó là thứ có ích. Nhưng nó không buộc ai phải trả lời. Một văn bản góp ý gửi đúng nơi, trong đúng thời hạn, thì đi vào hồ sơ của quá trình soạn thảo và tạo ra nghĩa vụ tiếp thu, giải trình. Đây là khác biệt giữa việc bày tỏ và việc tham gia.',
          },
          {
            type: 'text',
            title: 'Minh làm một việc nhỏ',
            paragraphs: [
              'Minh không viết góp ý cho dự thảo luật nào — anh chưa đủ hiểu để làm việc đó.',
              'Anh làm hai việc nhỏ hơn nhiều.',
              'Việc thứ nhất: anh đăng ký nhận thông báo từ cổng thông tin đăng tải dự thảo văn bản, chọn mục liên quan tới thuế.',
              'Việc thứ hai: anh lưu tên và thông tin của đại biểu Quốc hội đơn vị mình vào danh bạ điện thoại.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Việc thứ hai nghe buồn cười, và Hùng cũng cười.',
              'Nhưng Minh giải thích: "Cái gì có trong danh bạ thì tự nhiên nó có thật hơn."',
              'Anh nói đúng một điều mà anh không biết là mình đang nói đúng: khoảng cách giữa "có quyền làm gì đó" và "thật sự làm" phần lớn nằm ở chỗ việc đó có cụ thể và gần trong tầm tay hay không.',
            ],
          },
          {
            type: 'text',
            title: 'Việc thứ ba Minh nghĩ ra sau',
            paragraphs: [
              'Vài tháng sau, Minh làm thêm một việc mà anh thấy hợp với mình nhất.',
              'Anh viết một bài ngắn trên trang cá nhân, chỉ có ba con số: tổng thu ngân sách năm đó, tỷ trọng thuế gián thu, và số tiền thuế mà một sinh viên chi ba triệu một tháng đóng trong một năm.',
              'Bài đó không có kết luận nào, không phê phán ai. Nó chỉ có ba con số và một câu hỏi ở cuối: "Bạn có biết mình đóng bao nhiêu không?"',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bài viết được bạn bè trong khoa chia sẻ khá nhiều.',
              'Trong phần bình luận, phần lớn là câu "ủa thiệt hả" — đúng phản ứng mà Minh đã có ở quán cà phê.',
              'Anh nhận ra thứ mình vừa làm không phải là hoạt động chính trị gì cả. Anh chỉ chuyển một dòng chữ nhỏ trên hoá đơn thành thứ mà người ta nhìn thấy.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đừng hứa hẹn quá nhiều về những gì một cá nhân làm được',
            variant: 'warning',
            text: 'Một sinh viên gửi góp ý không làm thay đổi luật thuế. Sẽ là không trung thực nếu nói ngược lại. Nhưng chuỗi đầy đủ thì thế này: nhiều người biết mình đang đóng thuế → nhiều người quan tâm tiền đi đâu → có nhu cầu về số liệu dễ đọc → có người làm ra chúng → tranh luận có chất lượng hơn → chính sách chịu áp lực từ lập luận thay vì chỉ từ cảm tính. Mỗi mắt xích chậm, và không mắt xích nào tự nó đủ.',
          },
          {
            type: 'text',
            title: 'Một năm sau',
            paragraphs: [
              'Minh ra trường, đi làm, và lần đầu tiên nhìn bảng lương có dòng thuế thu nhập cá nhân.',
              'Anh nhớ lại buổi chiều ở quán cà phê và nhận ra một điều buồn cười: bây giờ anh mới "chính thức" là người đóng thuế trong mắt mọi người, nhưng thật ra anh đã đóng suốt hai mươi mốt năm.',
              'Cái khác là bây giờ nó có một dòng riêng, và anh nhìn thấy nó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Trong buổi ăn trưa đầu tiên ở công ty, có người phàn nàn về thuế thu nhập.',
              'Một người khác nói: "Thôi kệ, đóng thì đóng, mình có làm gì được đâu."',
              'Minh không tranh luận. Anh chỉ hỏi một câu: "Anh có biết tiền đó chi vô đâu nhiều nhất không?"',
              'Không ai ở bàn đó biết. Và đó là câu chuyện được bàn suốt bữa trưa hôm ấy.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao câu hỏi "tiền đó chi vào đâu" lại hiệu quả hơn việc tranh luận "thuế cao hay thấp"?',
            options: [
              { id: 'a', text: 'Vì nó dễ trả lời hơn', isCorrect: false },
              { id: 'b', text: 'Vì "cao hay thấp" là câu hỏi về sở thích và ai cũng giữ nguyên ý kiến, còn "chi vào đâu" là câu hỏi có dữ liệu và mở ra một cuộc trao đổi thật', isCorrect: true },
              { id: 'c', text: 'Vì nó tránh được đụng chạm chính trị', isCorrect: false },
              { id: 'd', text: 'Vì mọi người quan tâm tới chi tiêu hơn là tới mức thuế', isCorrect: false },
            ],
            explanation:
              'Tranh luận thuế cao hay thấp thường kết thúc ở chỗ nó bắt đầu, vì mỗi người đã có sẵn một lập trường và không có bằng chứng nào thay đổi được sở thích. "Chi vào đâu" thì khác: nó có câu trả lời tra được, và khi mọi người cùng nhìn vào một bộ số liệu, cuộc trao đổi chuyển từ việc ai đúng sang việc chúng ta muốn gì. Đó cũng là cách chuyển một cuộc cãi vã thành một cuộc bàn bạc.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Từ người đóng thuế tới công dân',
            description: 'Ai quyết định mức thuế, và những cánh cửa tham gia đang mở mà ít người bước vào.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ai quyết định',
                  paragraphs: [
                    'Các luật thuế và mức thuế suất do Quốc hội thông qua; một số điều chỉnh trong phạm vi uỷ quyền thuộc thẩm quyền của Uỷ ban Thường vụ Quốc hội hoặc Chính phủ.',
                    'Dự toán ngân sách hằng năm cũng do Quốc hội quyết định, và quyết toán được thẩm tra sau khi thực hiện.',
                    'Nghĩa là mọi con số bạn nhìn thấy trên hoá đơn đều là kết quả của một quyết định, không phải một hằng số tự nhiên.',
                  ],
                },
                {
                  heading: 'Ba cánh cửa đang mở',
                  paragraphs: [
                    'Lấy ý kiến dự thảo: văn bản quy phạm pháp luật phải được đăng công khai lấy ý kiến, và cơ quan soạn thảo có trách nhiệm tiếp thu, giải trình. Góp ý bằng văn bản đi vào hồ sơ; bài đăng trên mạng thì không.',
                    'Đại biểu dân cử: mỗi đơn vị bầu cử có đại biểu, có thông tin liên hệ và lịch tiếp xúc cử tri công khai.',
                    'Số liệu công khai: dự toán và quyết toán ngân sách được công bố hằng năm, tra được và tải về được.',
                  ],
                },
                {
                  heading: 'Ba việc nhỏ làm được ngay',
                  paragraphs: [
                    'Đọc ba con số trong bản dự toán: tổng thu, tỷ trọng trực thu và gián thu, và chi cho lĩnh vực bạn quan tâm nhất.',
                    'So một chỉ tiêu đã công bố với số thực hiện — đây là dạng giám sát đơn giản nhất mà ai cũng làm được.',
                    'Biết tên đại biểu đơn vị mình. Nghe nhỏ, nhưng nó là bước biến "có quyền" thành "có thể".',
                  ],
                },
              ],
              relatedConcepts: ['Quy trình lập pháp về thuế', 'Lấy ý kiến dự thảo', 'Giám sát ngân sách'],
              furtherReading: [
                'Bài học "Ai quyết định mức thuế" và "Một người dân bình thường có thể tác động vào chính sách thuế bằng cách nào?" trong khoá Thuế 101',
                'Luật Ban hành văn bản quy phạm pháp luật — quy định về lấy ý kiến và giải trình tiếp thu',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Mức thuế là một quyết định của con người theo một quy trình cụ thể, không phải một hằng số tự nhiên.\n' +
              '✓ Góp ý vào dự thảo tạo ra nghĩa vụ tiếp thu và giải trình; một bài đăng phản đối thì không tạo ra nghĩa vụ nào.\n' +
              '✓ Khoảng cách giữa "có quyền" và "thật sự làm" phần lớn nằm ở chỗ việc đó có cụ thể và gần tầm tay không.\n' +
              '✓ Hỏi "tiền đó chi vào đâu" mở ra một cuộc trao đổi có dữ liệu, còn tranh luận "thuế cao hay thấp" thì kết thúc ở chỗ nó bắt đầu.',
          },
          {
            type: 'text',
            title: 'Điều Minh mang theo',
            paragraphs: [
              'Minh vẫn uống cà phê ở quán đó. Anh vẫn không đọc hết bản dự toán ngân sách bao giờ.',
              'Thứ thay đổi là một thói quen rất nhỏ: mỗi lần nhận hoá đơn, mắt anh tự động chạy xuống dòng thuế giá trị gia tăng.',
              'Không phải để tính toán gì. Chỉ để nhớ rằng anh vừa góp một phần vào một cái quỹ chung, và anh có quyền hỏi cái quỹ đó được tiêu thế nào.',
              '"Tám ngàn ba trăm sáu mươi tư," anh nói với Hùng. "Ít thiệt. Mà nó là của tui."',
            ],
          },
        ],
      },
    ],
  },
};
