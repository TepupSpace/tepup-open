import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Hương × Logic 101 — "Cái biểu đồ của sếp".
 *
 * Hương là kế toán, nên cô là nhân vật duy nhất nhìn thấy cả con số gốc lẫn con
 * số đã được trình bày. Câu chuyện đi từ thao túng thị giác (trục biểu đồ) sang
 * thao túng logic (tương quan bị đọc thành nhân quả), rồi tới việc nói lại với
 * người có quyền hơn mình.
 */
export const HUONG_LOGIC: StorySeed = {
  slug: 'huong-logic',
  characterSlug: 'office-worker',
  title: 'Cái biểu đồ của sếp',
  teaser:
    'Trên màn hình họp, cột quý này cao gấp rưỡi cột quý trước. Hương là người lên số cho cái biểu đồ đó, và cô biết thực tế chỉ tăng bốn phần trăm.',
  icon: 'bar-chart',
  estimatedTime: '~30 phút',
  sortOrder: 1,
  courseSlugs: [COURSE.logic],
  part: {
    name: 'Hương và những con số biết nói dối',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'bieu-do-cua-sep',
        title: 'Cái biểu đồ trên màn hình họp',
        blocks: [
          {
            type: 'text',
            title: 'Họp tổng kết quý',
            paragraphs: [
              'Phòng họp tầng bốn, hai giờ chiều thứ Sáu. Anh Kiên, trưởng phòng kinh doanh, đang trình bày kết quả quý.',
              'Trên màn hình là một biểu đồ cột. Cột "Quý này" cao vống lên so với cột "Quý trước", trông như tăng gấp rưỡi.',
              '"Chiến dịch mới đã tạo ra bước nhảy rõ rệt," anh Kiên nói.',
            ],
          },
          {
            type: 'callout',
            icon: 'bar-chart',
            title: 'Hương biết con số gốc',
            variant: 'info',
            text: 'Cô là người tổng hợp số liệu gửi cho phòng kinh doanh tuần trước. Doanh thu quý trước: 100,2 tỷ. Quý này: 104,3 tỷ. Tăng khoảng 4 phần trăm.',
          },
          {
            type: 'question',
            question:
              'Doanh thu chỉ tăng 4%, nhưng cột trên biểu đồ trông cao gấp rưỡi. Nếu không ai sửa con số, thì thủ thuật nằm ở đâu?',
            options: [
              { id: 'a', text: 'Cột được tô màu đậm hơn nên trông to hơn', isCorrect: false },
              { id: 'b', text: 'Trục dọc không bắt đầu từ 0 mà bắt đầu từ một mốc gần với giá trị nhỏ nhất', isCorrect: true },
              { id: 'c', text: 'Biểu đồ dùng thang logarit', isCorrect: false },
              { id: 'd', text: 'Con số đã bị làm tròn lên', isCorrect: false },
            ],
            explanation:
              'Đây là thủ thuật phổ biến nhất và cũng khó bị bắt lỗi nhất, vì mọi con số hiển thị đều đúng. Khi trục dọc bắt đầu từ 100 thay vì từ 0, phần "chênh lệch" được phóng to chiếm trọn chiều cao khung hình. Mắt người đọc biểu đồ cột theo tỷ lệ chiều cao, nên nó đọc ra một câu chuyện khác hẳn con số.',
          },
          {
            type: 'text',
            title: 'Hương nhìn kỹ trục dọc',
            paragraphs: [
              'Cô nheo mắt nhìn cạnh trái của biểu đồ. Các mốc ghi: 100, 101, 102, 103, 104, 105.',
              'Trục bắt đầu từ 100 tỷ, không phải từ 0.',
              'Toàn bộ chiều cao khung hình thể hiện đúng năm tỷ đồng — bằng chưa tới năm phần trăm doanh thu.',
            ],
          },
          {
            type: 'slider-simulator',
            title: 'Thử tự tay bóp méo một biểu đồ',
            description:
              'Cùng một dữ liệu: quý trước 100,2 tỷ — quý này 104,3 tỷ. Kéo thanh trượt để đổi điểm bắt đầu của trục dọc và xem hai cột thay đổi ra sao. Không con số nào bị sửa.',
            sliders: [
              {
                id: 'goc',
                label: 'Trục dọc bắt đầu từ',
                min: 0,
                max: 100,
                step: 5,
                defaultValue: 0,
                unit: 'tỷ',
              },
            ],
            outputs: [
              {
                id: 'thuc',
                label: 'Mức tăng thực tế',
                formula: '4.1',
                unit: '%',
                format: 'number',
              },
              {
                id: 'cam-nhan',
                label: 'Cột quý này trông cao hơn cột quý trước',
                formula: '((104.3 - goc) / (100.2 - goc) - 1) * 100',
                unit: '%',
                format: 'number',
              },
            ],
            chart: {
              type: 'bar',
              bars: [
                { label: 'Quý trước', formula: '100.2 - goc', color: '#94a3b8' },
                { label: 'Quý này', formula: '104.3 - goc', color: '#2563eb' },
              ],
            },
            breakpoints: [
              {
                condition: 'goc === 0',
                message:
                  'Trục bắt đầu từ 0. Hai cột gần bằng nhau — đúng như thực tế, chênh khoảng 4 phần trăm.',
                variant: 'success',
              },
              {
                condition: 'goc > 0 && goc < 95',
                message:
                  'Trục đã bị cắt. Chênh lệch thị giác bắt đầu lớn hơn chênh lệch thật, dù không con số nào bị sửa.',
                variant: 'info',
              },
              {
                condition: 'goc >= 95',
                message:
                  'Trục bắt đầu sát ngay dưới giá trị nhỏ nhất. Cột quý này trông cao gần gấp đôi, trong khi doanh thu chỉ nhích 4 phần trăm.',
                variant: 'warning',
              },
            ],
          },
          {
            type: 'text',
            title: 'Vì sao cách này khó bị bắt lỗi',
            paragraphs: [
              'Nếu anh Kiên sửa con số từ 104 thành 150, Hương sẽ phát hiện ra ngay và đó là gian lận rõ ràng.',
              'Nhưng cắt trục thì không sửa gì cả. Mọi con số trên slide đều đúng. Cả cái nhãn "104,3 tỷ" cũng đúng.',
              'Thứ bị bóp méo không phải dữ liệu, mà là ấn tượng mà dữ liệu tạo ra.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Thao túng bằng trình bày',
            variant: 'info',
            text: 'Là việc dẫn người xem tới một kết luận sai mà không cần nói câu nào sai. Công cụ gồm: cắt trục, chọn mốc so sánh có lợi, đổi đơn vị giữa chừng, dùng diện tích thay chiều dài, và bỏ bớt phần dữ liệu bất lợi. Điểm chung là mọi con số đều kiểm chứng được, nên rất khó gọi tên là nói dối.',
          },
          {
            type: 'question',
            question: 'Khi nào thì việc cắt trục dọc là chấp nhận được?',
            options: [
              { id: 'a', text: 'Không bao giờ — trục dọc luôn phải bắt đầu từ 0', isCorrect: false },
              { id: 'b', text: 'Với biểu đồ đường theo dõi biến động nhỏ, khi việc cắt trục được ghi rõ và người xem cần thấy dao động', isCorrect: true },
              { id: 'c', text: 'Khi biểu đồ dùng cho báo cáo nội bộ', isCorrect: false },
              { id: 'd', text: 'Khi mức tăng dưới 10%', isCorrect: false },
            ],
            explanation:
              'Quy tắc không phải là cấm tuyệt đối. Với biểu đồ cột, chiều cao cột mang ý nghĩa so sánh độ lớn, nên cắt trục gần như luôn gây hiểu sai. Với biểu đồ đường theo dõi dao động — nhiệt độ, tỷ giá, chỉ số — việc cắt trục là hợp lý và cần thiết, miễn là trục được ghi rõ. Vấn đề không nằm ở kỹ thuật, mà ở việc kỹ thuật đó có được nói ra hay bị dùng để tạo ấn tượng sai.',
          },
          {
            type: 'text',
            title: 'Slide thứ hai còn hơn',
            paragraphs: [
              'Slide tiếp theo là một biểu đồ tròn: "Cơ cấu khách hàng mới theo kênh".',
              'Miếng lớn nhất, chiếm gần một nửa, ghi "Chiến dịch mới — 47%".',
              'Anh Kiên nói: "Gần một nửa khách hàng mới đến từ chiến dịch."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hương lại biết một thứ mà cái slide không nói: tổng số khách hàng mới trong quý là hai trăm mười một.',
              '47 phần trăm của hai trăm mười một là khoảng chín mươi chín khách.',
              'Quý trước, khi chưa có chiến dịch, số khách hàng mới là hai trăm bốn mươi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nghĩa là tổng khách hàng mới đã GIẢM, nhưng tỷ lệ phần trăm của một kênh thì tăng.',
              'Cả hai câu đều đúng. Chỉ có điều nếu chỉ nghe câu thứ hai, người ta sẽ kết luận ngược hẳn với thực tế.',
              'Hương ghi vào sổ: "Phần trăm mà không có mẫu số thì không phải là thông tin."',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Phần trăm không có mẫu số',
            variant: 'warning',
            text: 'Một tỷ lệ phần trăm luôn cần đi kèm hai thứ mới có nghĩa: tổng là bao nhiêu, và tổng đó thay đổi thế nào. "Tăng 200%" từ 1 lên 3 và "tăng 5%" từ 10.000 lên 10.500 nghe rất khác nhau, nhưng con số thứ hai mới là con số đáng chú ý. Khi ai đó chỉ đưa phần trăm mà không đưa mẫu số, hãy coi đó là một câu hỏi chưa được trả lời.',
          },
          {
            type: 'question',
            question:
              'Một báo cáo ghi: "Tỷ lệ khách hàng đến từ kênh A tăng từ 30% lên 47%." Câu nào KHÔNG thể suy ra từ thông tin này?',
            options: [
              { id: 'a', text: 'Tỷ trọng của kênh A trong tổng số khách đã tăng', isCorrect: false },
              { id: 'b', text: 'Số khách đến từ kênh A đã tăng lên', isCorrect: true },
              { id: 'c', text: 'Tỷ trọng của các kênh khác cộng lại đã giảm', isCorrect: false },
              { id: 'd', text: 'Kênh A hiện chiếm chưa tới một nửa tổng số khách', isCorrect: false },
            ],
            explanation:
              'Đây là chỗ trực giác dễ trượt nhất. Tỷ trọng tăng hoàn toàn có thể xảy ra khi số tuyệt đối giảm — miễn là các kênh khác giảm mạnh hơn. Đúng như trường hợp của công ty Hương: 47% của 211 khách ít hơn 30% của 240 khách. Ba phương án còn lại đều suy ra được trực tiếp từ định nghĩa của tỷ trọng.',
          },
          {
            type: 'text',
            title: 'Hương không nói gì trong cuộc họp',
            paragraphs: [
              'Có mười bốn người trong phòng, trong đó có giám đốc.',
              'Hương là nhân viên kế toán, không phải trưởng phòng. Anh Kiên hơn cô mười tuổi và là người sẽ ký duyệt phiếu chi của phòng cô mỗi tháng.',
              'Cô ngồi im, ghi vào sổ, và thấy khó chịu suốt phần còn lại của cuộc họp.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điều làm cô khó chịu không hẳn là anh Kiên.',
              'Cô không chắc anh cố ý. Rất có thể anh chỉ mở phần mềm lên, chọn kiểu biểu đồ mặc định, và phần mềm tự cắt trục cho vừa khung hình — nhiều công cụ làm đúng như vậy.',
              'Thứ làm cô khó chịu là mười ba người còn lại trong phòng đều gật gù, và không ai hỏi một câu nào.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Không cần ý đồ xấu để tạo ra một biểu đồ dối',
            variant: 'info',
            text: 'Phần lớn biểu đồ gây hiểu sai không do ai cố tình. Chúng ra đời từ cài đặt mặc định của phần mềm, từ việc người làm slide muốn hình cho đẹp, hoặc từ việc người đó cũng chỉ nhìn thấy điều mình mong đợi. Điều đó không làm hậu quả nhẹ đi — quyết định vẫn được đưa ra dựa trên một ấn tượng sai.',
          },
          {
            type: 'text',
            title: 'Ba câu Hương tự đặt từ hôm đó',
            paragraphs: [
              'Về nhà, Hương viết ra ba câu hỏi mà cô sẽ hỏi trước mọi biểu đồ từ nay:',
              '📏 Trục dọc bắt đầu từ đâu?',
              '➗ Phần trăm này là phần trăm của cái gì, và cái đó có đổi không?',
              '📅 Vì sao lại so với mốc thời gian này mà không phải mốc khác?',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Đọc một biểu đồ mà không bị dẫn',
            description: 'Năm thủ thuật trình bày phổ biến và cách bắt từng cái trong vài giây.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Năm thủ thuật thường gặp',
                  paragraphs: [
                    'Cắt trục dọc: trục không bắt đầu từ 0 nên chênh lệch nhỏ trông thành chênh lệch lớn. Phổ biến nhất và khó bắt nhất, vì mọi con số đều đúng.',
                    'Phần trăm không mẫu số: tỷ trọng tăng trong khi số tuyệt đối giảm, hoặc ngược lại.',
                    'Chọn mốc so sánh có lợi: so với tháng thấp nhất năm ngoái thay vì so với cùng kỳ.',
                    'Dùng diện tích hoặc hình ảnh thay chiều dài: tăng gấp đôi mỗi chiều thì diện tích thành gấp bốn.',
                    'Cắt bớt dải dữ liệu: chỉ hiển thị đoạn có xu hướng mong muốn, bỏ phần trước và sau.',
                  ],
                },
                {
                  heading: 'Ba câu hỏi trong mười giây',
                  paragraphs: [
                    'Trục dọc bắt đầu từ đâu, và các mốc cách nhau đều không?',
                    'Phần trăm này là phần trăm của cái gì, và mẫu số đó có thay đổi giữa hai kỳ không?',
                    'Vì sao lại chọn đúng mốc thời gian này để so sánh?',
                  ],
                },
                {
                  heading: 'Khi nào cắt trục là hợp lệ',
                  paragraphs: [
                    'Biểu đồ cột: chiều cao mang nghĩa so sánh độ lớn, nên cắt trục gần như luôn gây hiểu sai.',
                    'Biểu đồ đường theo dõi dao động nhỏ (nhiệt độ, tỷ giá, chỉ số): cắt trục là cần thiết để nhìn thấy biến động, miễn là trục được ghi rõ.',
                    'Nguyên tắc chung: kỹ thuật không sai, việc giấu kỹ thuật mới sai.',
                  ],
                },
              ],
              relatedConcepts: ['Thao túng bằng trình bày', 'Phần trăm không mẫu số', 'Chọn mốc so sánh'],
              furtherReading: [
                'Bài học "Thao túng số liệu" trong khoá Logic 101',
                'Darrell Huff — How to Lie with Statistics (1954)',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Cắt trục dọc bóp méo ấn tượng mà không sửa một con số nào — nên rất khó gọi tên là nói dối.\n' +
              '✓ Một tỷ lệ phần trăm chỉ có nghĩa khi biết mẫu số và biết mẫu số có thay đổi không.\n' +
              '✓ Tỷ trọng tăng hoàn toàn có thể đi kèm số tuyệt đối giảm.\n' +
              '✓ Phần lớn biểu đồ gây hiểu sai không do ý đồ xấu, nhưng hậu quả với quyết định thì vẫn như nhau.',
          },
          {
            type: 'text',
            title: 'Slide thứ tư mới là slide làm cô mất ngủ',
            paragraphs: [
              'Cắt trục và phần trăm không mẫu số thì Hương gọi tên được, dù cô chưa dám nói ra.',
              'Nhưng còn một slide nữa, và slide đó không có thủ thuật trình bày nào cả. Biểu đồ vẽ đúng, trục bắt đầu từ 0, số liệu chính xác.',
              'Vấn đề của nó nằm ở một chỗ khác hẳn: ở câu kết luận mà anh Kiên rút ra từ nó.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'cung-tang-khong-phai-nhan-qua',
        title: 'Cùng tăng không có nghĩa là nhân quả',
        blocks: [
          {
            type: 'text',
            title: 'Slide thứ tư',
            paragraphs: [
              'Slide thứ tư là một biểu đồ đường có hai đường, vẽ theo mười hai tháng.',
              'Đường xanh: chi phí quảng cáo hằng tháng. Đường cam: doanh thu hằng tháng.',
              'Hai đường đi lên gần như song song. Nhìn rất thuyết phục.',
            ],
          },
          {
            type: 'callout',
            icon: 'trending-up',
            title: 'Anh Kiên kết luận',
            variant: 'info',
            text: '"Các anh chị thấy đấy, chi phí quảng cáo tăng thì doanh thu tăng theo. Đề xuất của phòng em là tăng ngân sách quảng cáo thêm 40% cho quý tới."',
          },
          {
            type: 'question',
            question:
              'Hai đường đi lên song song trong mười hai tháng. Điều đó chứng minh được gì?',
            options: [
              { id: 'a', text: 'Chứng minh quảng cáo làm doanh thu tăng', isCorrect: false },
              { id: 'b', text: 'Chứng minh hai đại lượng biến động cùng chiều, nhưng chưa cho biết cái nào gây ra cái nào, hay cả hai cùng do nguyên nhân thứ ba', isCorrect: true },
              { id: 'c', text: 'Chứng minh doanh thu làm chi phí quảng cáo tăng', isCorrect: false },
              { id: 'd', text: 'Không chứng minh gì cả, hai đường này hoàn toàn ngẫu nhiên', isCorrect: false },
            ],
            explanation:
              'Tương quan là một quan sát: hai đại lượng biến động cùng nhau. Nhân quả là một tuyên bố mạnh hơn nhiều: cái này gây ra cái kia. Từ tương quan có ba khả năng — A gây ra B, B gây ra A, hoặc C gây ra cả hai. Bản thân đồ thị không phân biệt được ba khả năng đó, và cũng không loại trừ được khả năng trùng hợp.',
          },
          {
            type: 'text',
            title: 'Hương biết chuyện gì đã xảy ra',
            paragraphs: [
              'Là kế toán, Hương biết ngân sách quảng cáo của công ty được tính theo tỷ lệ phần trăm doanh thu tháng trước.',
              'Đó là quy định trong quy chế tài chính nội bộ, đã áp dụng ba năm nay.',
              'Nghĩa là chiều nhân quả có thể ngược hẳn: doanh thu tăng → ngân sách quảng cáo tháng sau tăng theo.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hai đường song song trên biểu đồ không phải bằng chứng quảng cáo hiệu quả.',
              'Chúng có thể chỉ là hình ảnh của một công thức kế toán được vẽ ra.',
              'Và nếu đúng như vậy, thì đề xuất tăng ngân sách 40% đang dựa trên một lập luận quay ngược đầu.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Tương quan không phải nhân quả',
            variant: 'info',
            text: 'Khi thấy A và B biến động cùng nhau, luôn có bốn khả năng: A gây ra B; B gây ra A; một yếu tố C gây ra cả A và B; hoặc đơn thuần trùng hợp. Phần lớn sai lầm trong đọc số liệu không phải do người ta không biết câu này — mà do người ta chỉ nhớ nó khi kết luận trái ý mình.',
          },
          {
            type: 'pair-match',
            title: 'Nguyên nhân thật nằm ở đâu?',
            instruction:
              'Nối mỗi tương quan có thật với lời giải thích đúng về nó. Cả năm cặp dữ liệu bên trái đều là quan sát chính xác.',
            pairs: [
              {
                id: 'm1',
                left: 'Tháng nào bán nhiều kem thì tháng đó nhiều vụ đuối nước hơn',
                right: 'Trời nóng gây ra cả hai — người ta vừa ăn kem nhiều hơn vừa đi bơi nhiều hơn',
              },
              {
                id: 'm2',
                left: 'Chi phí quảng cáo và doanh thu của công ty tăng song song',
                right: 'Chiều nhân quả có thể ngược lại: ngân sách quảng cáo được tính theo phần trăm doanh thu kỳ trước',
              },
              {
                id: 'm3',
                left: 'Người đi ngủ với giày trong chân hay bị đau đầu buổi sáng',
                right: 'Một nguyên nhân chung bị bỏ sót: uống quá nhiều rượu tối hôm trước',
              },
              {
                id: 'm4',
                left: 'Các nước tiêu thụ nhiều sô-cô-la có nhiều giải Nobel hơn',
                right: 'Cả hai cùng đi theo mức thu nhập bình quân, không có liên hệ trực tiếp nào',
              },
              {
                id: 'm5',
                left: 'Bệnh nhân nằm viện có tỷ lệ tử vong cao hơn người ở nhà',
                right: 'Chiều nhân quả ngược: người ta vào viện vì đang bệnh nặng, chứ không phải bệnh nặng vì vào viện',
              },
            ],
          },
          {
            type: 'text',
            title: 'Cái bẫy dễ mắc nhất',
            paragraphs: [
              'Trong năm cặp trên, cặp về bệnh viện là cặp khiến người ta hay xếp sai nhất.',
              'Lý do là vì nó chạm vào một sai lầm rất tự nhiên: ta thấy hai thứ đi cùng nhau thì ta gán chiều nhân quả theo hướng mà ta thấy hợp lý nhất về mặt cảm xúc.',
              'Ở đây, "bệnh viện nguy hiểm" là một câu chuyện dễ kể hơn "người bệnh nặng thì mới vào viện".',
            ],
          },
          {
            type: 'question',
            question:
              'Cần thêm điều gì để chuyển từ "có tương quan" sang "có nhân quả"?',
            options: [
              { id: 'a', text: 'Thêm dữ liệu của nhiều năm hơn nữa', isCorrect: false },
              { id: 'b', text: 'Một cơ chế giải thích được, cộng với việc loại trừ các nguyên nhân chung và kiểm tra chiều tác động — lý tưởng nhất là bằng một thử nghiệm có đối chứng', isCorrect: true },
              { id: 'c', text: 'Một hệ số tương quan trên 0,9', isCorrect: false },
              { id: 'd', text: 'Ý kiến của một chuyên gia trong ngành', isCorrect: false },
            ],
            explanation:
              'Thêm dữ liệu chỉ làm tương quan chắc hơn, không biến nó thành nhân quả — một tương quan giả với mười năm dữ liệu vẫn là tương quan giả. Hệ số cao cũng vậy. Thứ cần thiết là: một cơ chế nói được vì sao A dẫn tới B, việc loại trừ yếu tố C, và tốt nhất là một thử nghiệm trong đó bạn chủ động thay đổi A rồi quan sát B.',
          },
          {
            type: 'text',
            title: 'Hương đề xuất một phép thử',
            paragraphs: [
              'Điều Hương thích ở cách suy nghĩ này là nó không dừng ở chỗ bác bỏ. Nó chỉ ra việc cần làm tiếp.',
              'Nếu muốn biết quảng cáo có thật sự tạo ra doanh thu hay không, có một cách: chọn hai nhóm khu vực tương đương, tăng ngân sách quảng cáo ở một nhóm và giữ nguyên ở nhóm kia, rồi so sánh sau ba tháng.',
              'Chi phí cho phép thử đó nhỏ hơn nhiều so với việc tăng 40% ngân sách toàn công ty dựa trên một biểu đồ.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây là ý tưởng nền tảng của thử nghiệm có đối chứng: bạn chủ động thay đổi đúng một yếu tố, giữ mọi thứ khác như nhau, rồi so sánh.',
              'Nhóm không được thay đổi gọi là nhóm đối chứng, và nó chính là phần mà biểu đồ của anh Kiên không có.',
              'Không có nhóm đối chứng thì bạn không bao giờ biết điều gì sẽ xảy ra nếu không làm gì cả.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Câu hỏi bị bỏ quên: nếu không làm gì thì sao?',
            variant: 'warning',
            text: 'Doanh thu tăng sau chiến dịch — nhưng doanh thu ngành cũng tăng trong quý đó, và quý này là mùa cao điểm hằng năm. Nếu không có nhóm đối chứng, bạn không tách được phần do chiến dịch tạo ra khỏi phần vốn dĩ sẽ xảy ra. Đây là câu hỏi bị bỏ quên nhiều nhất trong mọi báo cáo hiệu quả.',
          },
          {
            type: 'text',
            title: 'Hương kiểm tra một con số nữa',
            paragraphs: [
              'Tối đó Hương mở lại số liệu ba năm gần nhất và làm một việc mà cái biểu đồ không làm: cô so quý này với cùng kỳ năm ngoái, thay vì so với quý liền trước.',
              'Quý này năm ngoái: 101,8 tỷ. Quý này năm nay: 104,3 tỷ. Tăng 2,4 phần trăm.',
              'Và cô phát hiện thêm: quý này luôn là quý cao nhất trong năm, suốt cả ba năm — kể cả những năm không có chiến dịch nào.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Đây gọi là yếu tố mùa vụ, và nó là thứ mà bất kỳ người kế toán nào cũng biết.',
              'So quý cao điểm với quý thấp điểm liền trước thì bao giờ cũng ra một mức tăng đẹp, dù chẳng ai làm gì cả.',
              'Cách so đúng là so với cùng kỳ năm trước — và khi so như vậy, mức tăng còn 2,4 phần trăm, thấp hơn cả mức tăng chung của ngành.',
            ],
          },
          {
            type: 'question',
            question:
              'Anh Kiên trình bày mức tăng 4% (so với quý liền trước) thay vì 2,4% (so với cùng kỳ năm ngoái). Điều này nên được hiểu thế nào?',
            options: [
              { id: 'a', text: 'Đó là gian lận số liệu, cần báo cáo lên cấp trên', isCorrect: false },
              { id: 'b', text: 'Cả hai con số đều đúng; vấn đề là mốc so sánh được chọn có lợi cho kết luận, và mốc đó cần được nói rõ', isCorrect: true },
              { id: 'c', text: 'Không sao cả, so với quý liền trước là cách chuẩn', isCorrect: false },
              { id: 'd', text: 'Chỉ sai nếu anh Kiên biết về yếu tố mùa vụ', isCorrect: false },
            ],
            explanation:
              'Gọi đây là gian lận thì quá nặng và cũng không chính xác — không con số nào bị sửa. Nhưng nói "không sao cả" thì bỏ qua mất điều quan trọng: với dữ liệu có mùa vụ rõ rệt, so với quý liền trước là cách so gây hiểu sai, và so với cùng kỳ năm trước là chuẩn mực thông thường. Chỗ đáng nói không phải là động cơ của người trình bày, mà là việc mốc so sánh không được ghi rõ để người nghe tự đánh giá.',
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Chọn mốc so sánh là một quyết định, không phải chi tiết kỹ thuật',
            variant: 'info',
            text: 'Cùng một bộ số liệu có thể cho ra "tăng 4%", "tăng 2,4%" hoặc "thấp hơn trung bình ngành", tuỳ vào việc bạn so với cái gì. Vì thế câu hỏi "vì sao lại so với mốc này?" luôn đáng hỏi — và người trình bày thường đã chọn mốc trước khi vẽ biểu đồ.',
          },
          {
            type: 'text',
            title: 'Bức tranh thật',
            paragraphs: [
              'Cộng cả ba phát hiện lại, Hương có một bức tranh khác hẳn slide trong cuộc họp:',
              '📉 Tổng khách hàng mới giảm từ 240 xuống 211.',
              '📊 Doanh thu tăng 2,4 phần trăm so với cùng kỳ, thấp hơn mức tăng chung của ngành.',
              '🔁 Chiều nhân quả giữa quảng cáo và doanh thu có thể ngược với điều đang được kết luận.',
              'Không có con số nào trong ba dòng trên mâu thuẫn với slide của anh Kiên. Chúng chỉ là những phần anh không đưa lên.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Tương quan, nhân quả và nhóm đối chứng',
            description: 'Bốn khả năng đằng sau mọi tương quan, và câu hỏi bị bỏ quên nhiều nhất.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn khả năng sau một tương quan',
                  paragraphs: [
                    'A gây ra B — điều mà người trình bày thường muốn bạn kết luận.',
                    'B gây ra A — chiều ngược lại, hay bị bỏ qua nhất, đặc biệt khi chiều thuận nghe hợp lý hơn.',
                    'Một yếu tố C gây ra cả A và B — như trời nóng gây ra cả việc bán kem lẫn việc đi bơi.',
                    'Trùng hợp — với đủ nhiều cặp dữ liệu, luôn tìm được những cặp đi cùng nhau mà chẳng liên quan gì.',
                  ],
                },
                {
                  heading: 'Điều kiện để nói tới nhân quả',
                  paragraphs: [
                    'Có một cơ chế giải thích được vì sao A dẫn tới B, không chỉ là hai đường song song.',
                    'Đã loại trừ được các yếu tố chung có thể gây ra cả hai.',
                    'Đã kiểm tra chiều tác động, đặc biệt khi có lý do để nghi ngờ chiều ngược.',
                    'Tốt nhất: một thử nghiệm có đối chứng, trong đó bạn chủ động thay đổi A và giữ mọi thứ khác như nhau.',
                  ],
                },
                {
                  heading: 'Ba câu hỏi cho mọi báo cáo hiệu quả',
                  paragraphs: [
                    'Nếu không làm gì cả thì điều gì sẽ xảy ra? (Có nhóm đối chứng không?)',
                    'Vì sao lại so với mốc thời gian này? Nếu so với cùng kỳ năm trước thì con số ra sao?',
                    'Yếu tố mùa vụ và xu hướng chung của ngành đã được tách ra chưa?',
                  ],
                },
              ],
              relatedConcepts: ['Tương quan và nhân quả', 'Nhóm đối chứng', 'Yếu tố mùa vụ', 'Biến gây nhiễu'],
              furtherReading: [
                'Bài học "Correlation ≠ Causation" trong khoá Logic 101',
                'Nguyên tắc thiết kế thử nghiệm có đối chứng trong nghiên cứu ứng dụng',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Sau mỗi tương quan có bốn khả năng: A gây B, B gây A, C gây cả hai, hoặc trùng hợp.\n' +
              '✓ Thêm dữ liệu hay hệ số tương quan cao hơn không biến tương quan thành nhân quả.\n' +
              '✓ Câu hỏi bị bỏ quên nhiều nhất trong báo cáo hiệu quả: nếu không làm gì cả thì điều gì sẽ xảy ra?\n' +
              '✓ Chọn mốc so sánh là một quyết định có thể đổi hẳn kết luận, nên luôn đáng hỏi vì sao lại chọn mốc đó.',
          },
          {
            type: 'text',
            title: 'Biết rồi thì làm gì?',
            paragraphs: [
              'Hương có ba phát hiện, có số liệu gốc, và có lý lẽ.',
              'Cô cũng có một trưởng phòng hơn cô mười tuổi, một cuộc họp đã kết thúc với mười ba người gật đầu, và một đề xuất tăng ngân sách sắp được trình lên giám đốc.',
              'Câu hỏi bây giờ không còn là "ai đúng". Câu hỏi là: nói thế nào để không biến chuyện này thành một trận đấu mà cô chắc chắn thua?',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'mot-cau-hoi-thay-vi-mot-loi-buoc-toi',
        title: 'Một câu hỏi thay vì một lời buộc tội',
        blocks: [
          {
            type: 'text',
            title: 'Bản nháp đầu tiên Hương không gửi',
            paragraphs: [
              'Tối Chủ nhật, Hương viết một email. Cô viết trong lúc còn đang bực.',
              'Trong email có những câu như: "Biểu đồ đã bị cắt trục để phóng đại mức tăng", "Kết luận về hiệu quả quảng cáo là không có cơ sở", "Số liệu trình bày gây hiểu sai cho ban giám đốc".',
              'Cô đọc lại ba lần rồi xoá hết.',
            ],
          },
          {
            type: 'callout',
            icon: 'mail',
            title: 'Vì sao cô xoá',
            variant: 'info',
            text: 'Không phải vì cô sợ. Mà vì cô thử tưởng tượng anh Kiên đọc email đó, và cô thấy rõ kết quả: anh sẽ phải bảo vệ danh dự trước khi kịp nghĩ về số liệu. Một email như vậy buộc người nhận chọn giữa việc thừa nhận mình gây hiểu sai và việc chứng minh Hương sai. Gần như ai cũng chọn vế thứ hai.',
          },
          {
            type: 'question',
            question:
              'Vì sao một lời phê bình đúng lại thường không tạo ra thay đổi?',
            options: [
              { id: 'a', text: 'Vì người nghe không đủ trình độ để hiểu', isCorrect: false },
              { id: 'b', text: 'Vì nó buộc người nghe phải bảo vệ hình ảnh bản thân trước, nên họ dồn sức tìm lý lẽ phản bác thay vì xem lại số liệu', isCorrect: true },
              { id: 'c', text: 'Vì phê bình bằng văn bản luôn kém hiệu quả hơn nói trực tiếp', isCorrect: false },
              { id: 'd', text: 'Vì người nghe thường không đọc hết email dài', isCorrect: false },
            ],
            explanation:
              'Khi một lời phê bình chạm vào năng lực hoặc sự trung thực của người nghe, phản ứng đầu tiên là phòng vệ chứ không phải phân tích. Và kỹ năng lập luận lúc đó được huy động để bảo vệ chứ không phải để tìm ra sự thật — đúng như chuyện thiên kiến xác nhận. Muốn người ta xem lại số liệu, phải làm sao để việc xem lại không đồng nghĩa với việc thừa nhận mình kém.',
          },
          {
            type: 'text',
            title: 'Hương viết lại theo cách khác',
            paragraphs: [
              'Bản thứ hai không có chữ nào là phán xét. Nó chỉ có ba câu hỏi và một đề nghị.',
              'Và điều quan trọng nhất: cô gửi riêng cho anh Kiên, không cc ai cả.',
              'Nếu cc giám đốc, mọi câu hỏi dù lịch sự tới đâu cũng biến thành một lời tố cáo công khai.',
            ],
          },
          {
            type: 'callout',
            icon: 'mail',
            title: 'Email Hương gửi',
            variant: 'info',
            text: '"Anh Kiên ơi, em có ba câu hỏi về bộ số quý để em làm phần thuyết minh báo cáo tài chính cho đúng ạ. Một là biểu đồ doanh thu trục dọc bắt đầu từ 100 tỷ, em nên ghi chú điều đó trong thuyết minh không ạ? Hai là mình nên so với quý trước hay so với cùng kỳ năm ngoái, vì quý này là quý cao điểm hằng năm. Ba là ngân sách quảng cáo mình đang tính theo phần trăm doanh thu kỳ trước, nên em hơi phân vân khi đọc biểu đồ hai đường. Anh chỉ giúp em với ạ."',
          },
          {
            type: 'text',
            title: 'Bốn thứ email này làm được',
            paragraphs: [
              'Hương phân tích lại chính email của mình sau đó, và cô thấy nó có bốn điểm mà bản nháp đầu không có:',
              '❓ Nó hỏi thay vì khẳng định, nên anh Kiên không phải thừa nhận điều gì để trả lời.',
              '🎯 Nó nêu một lý do chính đáng và có thật: cô cần làm thuyết minh báo cáo tài chính cho đúng.',
              '🤝 Nó gửi riêng, nên không có ai chứng kiến để anh phải giữ thể diện.',
              '📌 Nó chỉ vào ba chi tiết cụ thể, không đưa ra kết luận chung về cả bài trình bày.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Điểm cuối là điểm Hương thấy quan trọng nhất và cũng khó nhất.',
              'Bản nháp đầu tiên của cô có một câu: "Số liệu trình bày gây hiểu sai cho ban giám đốc." Câu đó là một kết luận về toàn bộ bài trình bày và về con người anh Kiên.',
              'Bản thứ hai chỉ nói về trục dọc, mốc so sánh, và một công thức tính ngân sách. Ba thứ có thể sửa được mà không ai phải là người xấu.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Tấn công lập luận, đừng tấn công người',
            variant: 'info',
            text: 'Ngụy biện tấn công cá nhân (ad hominem) là khi ta bác bỏ một lập luận bằng cách nói xấu người đưa ra nó. Nhưng có một phiên bản nhẹ hơn mà người tử tế cũng hay mắc: phê bình lập luận theo cách khiến người nghe cảm thấy chính họ đang bị đánh giá. Kết quả thực tế giống nhau — cuộc trao đổi chuyển từ số liệu sang con người.',
          },
          {
            type: 'question',
            question: 'Câu nào dưới đây giữ được cuộc trao đổi ở lại với số liệu?',
            options: [
              { id: 'a', text: '"Anh trình bày như vậy là gây hiểu sai cho ban giám đốc."', isCorrect: false },
              { id: 'b', text: '"Em thấy trục dọc bắt đầu từ 100 tỷ, mình có nên ghi chú lại trong thuyết minh không ạ?"', isCorrect: true },
              { id: 'c', text: '"Người làm kinh doanh thường hay tô hồng số liệu."', isCorrect: false },
              { id: 'd', text: '"Anh có chắc là anh hiểu biểu đồ này không?"', isCorrect: false },
            ],
            explanation:
              'Phương án b chỉ vào một chi tiết kiểm chứng được và để ngỏ một hành động cụ thể. Ba phương án còn lại đều chuyển trọng tâm sang con người: một cái kết luận về hậu quả do anh gây ra, một cái quy chụp cả nhóm nghề, một cái chất vấn năng lực. Cả ba đều có thể đúng về nội dung mà vẫn làm hỏng cuộc trao đổi.',
          },
          {
            type: 'text',
            title: 'Anh Kiên trả lời sau hai ngày',
            paragraphs: [
              'Câu trả lời ngắn hơn Hương tưởng, và thẳng hơn cô tưởng.',
              '"Cái trục đó anh không để ý, phần mềm nó tự chỉnh. Em ghi chú vào thuyết minh giúp anh."',
              '"So cùng kỳ thì đúng hơn thật. Anh so quý liền trước vì slide mẫu năm ngoái làm vậy."',
              '"Còn cái ngân sách theo phần trăm doanh thu thì... ừ, anh chưa nghĩ tới chuyện đó. Em qua bàn anh mình nói chuyện tí."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hai chi tiết đầu đúng như Hương đoán: không có ý đồ nào, chỉ là cài đặt mặc định và thói quen làm theo mẫu cũ.',
              'Chi tiết thứ ba mới là chi tiết đáng giá. Anh Kiên không hề biết công thức tính ngân sách quảng cáo — đó là quy chế của phòng tài chính, và anh chưa bao giờ đọc.',
              'Anh không lập luận vòng tròn vì gian dối. Anh lập luận vòng tròn vì anh thiếu một mẩu thông tin mà Hương có sẵn trong tay.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Đừng gán ý đồ khi sự thiếu thông tin đã đủ giải thích',
            variant: 'warning',
            text: 'Khi thấy ai đó lập luận sai, phản xạ tự nhiên là nghĩ họ đang cố tình. Nhưng phần lớn lập luận sai đến từ việc thiếu một mẩu thông tin, dùng công cụ mặc định, hoặc lặp lại thói quen cũ. Giả định sai về động cơ khiến bạn chọn sai cách nói — và cách nói sai thì kể cả nội dung đúng cũng không đi tới đâu.',
          },
          {
            type: 'text',
            title: 'Cuộc nói chuyện ở bàn anh Kiên',
            paragraphs: [
              'Hương mang theo bảng tính. Cô không nói "anh sai". Cô mở file quy chế tài chính và chỉ vào điều khoản về ngân sách marketing.',
              'Anh Kiên đọc, im một lúc, rồi nói: "Vậy cái biểu đồ hai đường đó nó chứng minh cái gì nhỉ?"',
              'Đó là câu Hương muốn nghe. Anh tự đi tới đó, không phải cô kéo anh tới.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hương nói: "Em nghĩ nó chưa chứng minh được gì hết anh ạ. Nhưng em có ý này."',
              'Rồi cô trình bày ý tưởng phép thử: hai nhóm khu vực tương đương, một nhóm tăng ngân sách, một nhóm giữ nguyên, so sau ba tháng.',
              'Anh Kiên hỏi lại vài câu về cách chọn khu vực, rồi nói: "Cái này hay hơn xin tăng bốn mươi phần trăm rồi cuối năm không giải trình được."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc Hương mang theo một đề xuất thay thế lại quan trọng hơn cả việc cô chỉ ra lỗi?',
            options: [
              { id: 'a', text: 'Vì nó cho thấy cô có năng lực chuyên môn', isCorrect: false },
              { id: 'b', text: 'Vì nó cho anh Kiên một lối đi tiếp, thay vì chỉ lấy đi lối đi anh đang có', isCorrect: true },
              { id: 'c', text: 'Vì đề xuất mới rẻ hơn nên dễ được duyệt', isCorrect: false },
              { id: 'd', text: 'Vì nó chuyển trách nhiệm sang cho phòng kinh doanh', isCorrect: false },
            ],
            explanation:
              'Một lời phản bác đơn thuần đặt người nghe vào chỗ mất mà không được gì: đề xuất của họ hỏng, và họ vẫn phải có gì đó để trình lên cấp trên. Một đề xuất thay thế giữ nguyên mục tiêu của họ và chỉ đổi cách đạt tới — nên chi phí của việc đồng ý với bạn thấp hơn hẳn. Đây cũng chính là điều Hương đã học được trong chuyện chiếc máy chấm công.',
          },
          {
            type: 'text',
            title: 'Điều Hương không đạt được',
            paragraphs: [
              'Cần nói cho đủ: anh Kiên không sửa slide đã trình bày, và không có cuộc họp đính chính nào.',
              'Mười ba người trong phòng họp hôm đó vẫn giữ nguyên ấn tượng rằng chiến dịch tạo ra bước nhảy.',
              'Thứ Hương thay đổi được là quyết định sắp tới, không phải ấn tượng đã hình thành.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô nghĩ đó là một sự đánh đổi đáng chấp nhận.',
              'Nếu cô đòi đính chính công khai, cô sẽ được sự thật trên giấy và mất người đối thoại — anh Kiên sẽ không bao giờ hỏi cô về số liệu nữa.',
              'Còn cách này thì cô mất phần ghi nhận, nhưng giữ được chỗ ngồi trong những cuộc bàn bạc tiếp theo. Và ở đó cô có ích hơn nhiều.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Nói ra một sai sót mà không tạo ra kẻ thù',
            description: 'Bốn nguyên tắc khi bạn thấy số liệu sai nhưng người trình bày có quyền hơn bạn.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Bốn nguyên tắc',
                  paragraphs: [
                    'Hỏi thay vì khẳng định: một câu hỏi cho phép người kia tự đi tới kết luận mà không phải thừa nhận điều gì.',
                    'Chỉ vào chi tiết cụ thể, đừng kết luận về cả bài trình bày hay về con người.',
                    'Nói riêng trước, đừng nêu trước đám đông — người có khán giả thì phải giữ thể diện trước khi kịp nghĩ.',
                    'Mang theo một đề xuất thay thế giữ nguyên mục tiêu của họ. Phản bác đơn thuần chỉ lấy đi mà không cho lại gì.',
                  ],
                },
                {
                  heading: 'Giả định đúng về động cơ',
                  paragraphs: [
                    'Phần lớn số liệu gây hiểu sai đến từ cài đặt mặc định của phần mềm, từ việc làm theo mẫu cũ, hoặc từ việc thiếu một mẩu thông tin.',
                    'Giả định người kia cố tình khiến bạn chọn giọng buộc tội, và giọng buộc tội thì làm hỏng cả những nội dung đúng.',
                    'Nếu sự thiếu thông tin đã đủ giải thích, hãy dừng ở đó.',
                  ],
                },
                {
                  heading: 'Chấp nhận đánh đổi',
                  paragraphs: [
                    'Bạn thường không đồng thời đạt được cả ba: sửa được ấn tượng đã hình thành, được ghi nhận công lao, và giữ được quan hệ làm việc.',
                    'Nếu phải chọn, hãy chọn ảnh hưởng tới quyết định sắp tới — đó là thứ còn thay đổi được.',
                    'Người giữ được chỗ ngồi trong cuộc bàn bạc lần sau sẽ sửa được nhiều sai sót hơn người thắng một cuộc tranh luận.',
                  ],
                },
              ],
              relatedConcepts: ['Ad hominem', 'Thu hẹp phạm vi phản đối', 'Giả định về động cơ'],
              furtherReading: [
                'Bài học "Ad hominem" và "Debate có văn hoá" trong khoá Logic 101',
                'Nguyên tắc bác ái trong diễn giải (principle of charity)',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Một lời phê bình đúng vẫn thất bại nếu nó buộc người nghe phải bảo vệ hình ảnh bản thân trước.\n' +
              '✓ Hỏi thay vì khẳng định, chỉ vào chi tiết cụ thể, và nói riêng trước khi nói trước đám đông.\n' +
              '✓ Đừng gán ý đồ khi sự thiếu thông tin đã đủ giải thích — giả định sai về động cơ dẫn tới cách nói sai.\n' +
              '✓ Mang theo đề xuất thay thế: phản bác đơn thuần chỉ lấy đi lối đi mà không cho lại lối nào.',
          },
          {
            type: 'text',
            title: 'Còn một việc Hương chưa làm',
            paragraphs: [
              'Hương đã biết cách bắt lỗi biểu đồ của người khác, và biết cách nói ra mà không gây gổ.',
              'Nhưng tháng sau, đến lượt cô phải trình bày báo cáo tài chính quý trước ban giám đốc.',
              'Và cô nhận ra một chuyện: bộ slide mẫu mà phòng tài chính dùng từ ba năm nay cũng có đúng những vấn đề mà cô vừa chỉ ra cho anh Kiên.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'slide-cua-huong',
        title: 'Đến lượt Hương làm slide',
        blocks: [
          {
            type: 'text',
            title: 'Bộ slide mẫu ba năm tuổi',
            paragraphs: [
              'Hương mở file mẫu của phòng tài chính. Nó được một chị đã nghỉ việc làm từ ba năm trước, và từ đó tới nay ai cũng chỉ thay số vào.',
              'Trang thứ hai: biểu đồ cột doanh thu, trục dọc bắt đầu từ giá trị nhỏ nhất.',
              'Trang thứ tư: so sánh với quý liền trước. Trang thứ sáu: biểu đồ tròn tỷ trọng chi phí, không ghi tổng chi phí là bao nhiêu.',
            ],
          },
          {
            type: 'callout',
            icon: 'file-text',
            title: 'Điều làm Hương ngồi im',
            variant: 'info',
            text: 'Ba năm nay, mỗi quý cô đều mở file này ra, thay số, và gửi đi. Cô đã trình bày bằng đúng những cách mà tuần trước cô vừa chỉ ra là gây hiểu sai — chỉ khác là cô không hề biết.',
          },
          {
            type: 'question',
            question:
              'Phát hiện này nói lên điều gì về việc học tư duy phản biện?',
            options: [
              { id: 'a', text: 'Rằng Hương đã cố tình gây hiểu sai suốt ba năm', isCorrect: false },
              { id: 'b', text: 'Rằng kỹ năng nhận ra lỗi ở người khác đến trước, còn nhận ra lỗi của chính mình thì khó hơn và đến sau', isCorrect: true },
              { id: 'c', text: 'Rằng bộ slide mẫu của công ty cần được kiểm toán', isCorrect: false },
              { id: 'd', text: 'Rằng biểu đồ nói chung là công cụ không đáng tin', isCorrect: false },
            ],
            explanation:
              'Đây là quy luật quen thuộc: ta phát hiện thiên kiến trong lập luận của người khác dễ hơn nhiều so với trong lập luận của chính mình — vì với lập luận của mình, ta chỉ nhìn thấy ý định tốt đẹp bên trong chứ không nhìn thấy sản phẩm bên ngoài. Một kỹ năng phản biện chỉ chĩa ra ngoài thì mới đi được nửa đường.',
          },
          {
            type: 'text',
            title: 'Hương làm lại bộ slide',
            paragraphs: [
              'Cô mất một buổi tối để làm lại. Những thay đổi đều nhỏ, và không cái nào làm số liệu xấu đi hay đẹp lên.',
              '📏 Trục dọc bắt đầu từ 0. Nếu chênh lệch quá nhỏ để nhìn thấy, cô ghi thẳng con số phần trăm lên đầu mỗi cột.',
              '📅 So sánh với cùng kỳ năm trước, và ghi thêm dòng nhỏ "quý cao điểm hằng năm" ở chú thích.',
              '➗ Biểu đồ tròn có ghi tổng chi phí ngay dưới tiêu đề, để phần trăm có mẫu số.',
              '📉 Thêm một trang mới: xu hướng chung của ngành, để người xem tự so.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Trang cuối cùng là trang cô đắn đo nhất, vì nó cho thấy công ty đang tăng chậm hơn ngành.',
              'Cô vẫn để nó vào.',
              'Lý do cô tự nhủ rất thực dụng: nếu ban giám đốc phát hiện ra điều đó từ một nguồn khác sau khi đã nghe báo cáo của cô, thì thứ mất đi không phải là một trang slide mà là mức độ tin cậy vào toàn bộ những gì cô trình bày.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Trình bày trung thực là một khoản đầu tư',
            variant: 'info',
            text: 'Một báo cáo tô hồng cho bạn lợi thế trong một cuộc họp. Một báo cáo trung thực cho bạn thứ khác: lần sau khi bạn nói "con số này tốt", người nghe tin ngay. Uy tín tích luỹ chậm và mất rất nhanh, nên nó chỉ đáng để xây nếu bạn định làm việc ở đây lâu dài.',
          },
          {
            type: 'text',
            title: 'Chị Thảo hỏi một câu khó',
            paragraphs: [
              'Chị Thảo, kế toán trưởng, xem bản slide mới và hỏi Hương một câu mà Hương chưa nghĩ tới:',
              '"Em để trục từ 0 thì cái cột nó bẹt dí, nhìn như cả năm không có gì thay đổi. Vậy có phải cũng là gây hiểu sai theo chiều ngược lại không?"',
              'Hương đứng lại. Câu hỏi đó đúng.',
            ],
          },
          {
            type: 'question',
            question:
              'Khi trục bắt đầu từ 0 làm mọi biến động trông như bằng phẳng, cách xử lý nào là trung thực nhất?',
            options: [
              { id: 'a', text: 'Quay lại cắt trục để nhìn thấy biến động', isCorrect: false },
              { id: 'b', text: 'Giữ trục từ 0 và ghi con số phần trăm thay đổi lên đầu mỗi cột, hoặc thêm một biểu đồ phụ về mức thay đổi có ghi rõ trục', isCorrect: true },
              { id: 'c', text: 'Bỏ biểu đồ, chỉ đưa bảng số', isCorrect: false },
              { id: 'd', text: 'Phóng to biểu đồ cho dễ nhìn', isCorrect: false },
            ],
            explanation:
              'Chị Thảo chỉ ra một điều đúng: che giấu biến động cũng là gây hiểu sai, chỉ theo chiều ngược lại. Nhưng giải pháp không phải là quay lại cắt trục âm thầm. Nguyên tắc là: giữ hình đúng tỷ lệ, rồi bổ sung con số hoặc một biểu đồ phụ được ghi rõ trục. Người xem nhận được cả hai thông tin — độ lớn tuyệt đối và mức biến động — thay vì chỉ một trong hai.',
          },
          {
            type: 'text',
            title: 'Không có cách trình bày nào trung lập tuyệt đối',
            paragraphs: [
              'Câu hỏi của chị Thảo dạy Hương một điều mà cô nghĩ là quan trọng nhất trong cả chuyện này.',
              'Không tồn tại một cách vẽ biểu đồ "khách quan hoàn toàn". Mọi lựa chọn — trục, mốc, đơn vị, cái gì đưa vào cái gì bỏ ra — đều là quyết định của người làm, và mọi quyết định đều hướng sự chú ý về một phía.',
              'Cho nên mục tiêu không phải là không có lựa chọn nào. Mục tiêu là làm cho lựa chọn của mình nhìn thấy được.',
            ],
          },
          {
            type: 'text',
            title: 'Buổi báo cáo',
            paragraphs: [
              'Giám đốc dừng lại ở trang cuối khá lâu.',
              'Ông hỏi: "Sao trước giờ mình không có trang này?"',
              'Hương nói: "Dạ trước giờ mẫu slide không có ạ. Em nghĩ mình nên có để biết mình đang ở đâu."',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ông hỏi tiếp: "Vậy mình đang tăng chậm hơn ngành à?"',
              '"Dạ quý này thì có ạ. Em chưa đủ dữ liệu để nói là xu hướng hay chỉ là một quý."',
              'Câu trả lời đó — "em chưa đủ dữ liệu để nói" — là câu Hương tập nói nhiều lần trước gương. Trước đây cô sẽ trả lời dứt khoát theo hướng nào đó, vì cô nghĩ nói "chưa đủ dữ liệu" là thể hiện mình kém.',
            ],
          },
          {
            type: 'question',
            question: 'Nói "tôi chưa đủ dữ liệu để kết luận" trong một buổi báo cáo thể hiện điều gì?',
            options: [
              { id: 'a', text: 'Sự thiếu chuẩn bị của người báo cáo', isCorrect: false },
              { id: 'b', text: 'Việc phân biệt được cái mình biết chắc với cái mình đang suy đoán — điều kiện để người nghe biết nên tin phần nào tới mức nào', isCorrect: true },
              { id: 'c', text: 'Sự né tránh trách nhiệm', isCorrect: false },
              { id: 'd', text: 'Rằng dữ liệu của công ty có vấn đề', isCorrect: false },
            ],
            explanation:
              'Một báo cáo trong đó mọi câu đều dứt khoát như nhau thì người nghe không biết phân biệt phần nào là dữ kiện, phần nào là suy đoán. Việc gắn mức độ chắc chắn vào từng phát biểu không làm bạn yếu đi — nó làm những phát biểu chắc chắn của bạn có trọng lượng hơn, vì người nghe biết bạn không nói chắc bừa.',
          },
          {
            type: 'text',
            title: 'Một tháng sau',
            paragraphs: [
              'Trang "so với xu hướng ngành" được đưa vào bộ slide mẫu chính thức của phòng tài chính.',
              'Ba tháng sau, phòng kinh doanh chạy phép thử hai nhóm khu vực mà Hương đề xuất.',
              'Kết quả: nhóm tăng ngân sách quảng cáo có doanh thu cao hơn nhóm đối chứng khoảng sáu phần trăm — thấp hơn nhiều so với mức mà biểu đồ hai đường gợi ý, nhưng là một con số thật.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Anh Kiên dùng đúng con số sáu phần trăm đó để xin tăng ngân sách, và lần này xin được ít hơn bốn mươi phần trăm nhưng được duyệt ngay.',
              'Anh nói với Hương: "Cái này giải trình dễ hơn hẳn. Sếp hỏi gì anh cũng trả lời được."',
              'Hương nhận ra một điều: lập luận vững không chỉ đúng hơn, nó còn tiện hơn cho chính người dùng nó.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nhưng đừng nghĩ chuyện này luôn kết thúc đẹp',
            variant: 'warning',
            text: 'Hương gặp may ở một điểm quan trọng: anh Kiên là người chịu nghe. Có những nơi mà người trình bày biết rõ mình đang bóp méo và không hề muốn sửa. Ở những nơi đó, các kỹ thuật trong chương này không tạo ra thay đổi — thứ chúng làm được là giúp bạn giữ được sự tỉnh táo và biết chính xác mình đang đứng ở đâu.',
          },
          {
            type: 'text',
            title: 'Bốn câu Hương dán trên màn hình',
            paragraphs: [
              'Hương in bốn dòng và dán vào cạnh màn hình máy tính, chỗ cô nhìn thấy khi làm slide:',
              '1️⃣ Trục dọc bắt đầu từ đâu?',
              '2️⃣ Phần trăm này là phần trăm của cái gì?',
              '3️⃣ Vì sao so với mốc này mà không phải mốc khác?',
              '4️⃣ Nếu không làm gì cả thì điều gì sẽ xảy ra?',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bốn câu này cô dùng cho cả hai chiều: đọc slide của người khác, và kiểm tra slide của chính mình.',
              'Chiều thứ hai khó hơn nhiều, vì khi làm slide, ai cũng có sẵn một câu chuyện muốn kể.',
              '"Cái slide nào mình làm mà thấy đẹp quá," cô nói với anh Kiên, "thì em quay lại đọc bốn câu này trước."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Trình bày số liệu một cách trung thực',
            description: 'Danh sách kiểm tra trước khi gửi một báo cáo có biểu đồ.',
            category: 'Tư duy phản biện',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Kiểm tra biểu đồ',
                  paragraphs: [
                    'Trục dọc bắt đầu từ 0 với biểu đồ cột. Nếu chênh lệch quá nhỏ để nhìn thấy, hãy ghi con số phần trăm lên đầu cột thay vì cắt trục.',
                    'Nếu buộc phải cắt trục (biểu đồ đường theo dõi dao động), ghi rõ điều đó ngay trên hình.',
                    'Các mốc trên trục cách nhau đều. Không đổi đơn vị giữa chừng.',
                    'Không dùng diện tích hay hình minh hoạ để thể hiện độ lớn, vì mắt người đọc sai tỷ lệ diện tích.',
                  ],
                },
                {
                  heading: 'Kiểm tra con số',
                  paragraphs: [
                    'Mọi tỷ lệ phần trăm đều kèm mẫu số, và nói rõ mẫu số có thay đổi giữa hai kỳ không.',
                    'So sánh với cùng kỳ năm trước nếu dữ liệu có tính mùa vụ; ghi chú lý do chọn mốc.',
                    'Đưa cả bối cảnh chung — xu hướng ngành, mức nền — để người xem tự đánh giá thay vì phải tin kết luận của bạn.',
                  ],
                },
                {
                  heading: 'Kiểm tra kết luận',
                  paragraphs: [
                    'Mỗi kết luận nhân quả cần trả lời được: nếu không làm gì cả thì điều gì sẽ xảy ra?',
                    'Phân biệt rõ dữ kiện với suy đoán. Nói "tôi chưa đủ dữ liệu để kết luận" khi đúng là như vậy.',
                    'Nếu có một số liệu bất lợi mà người nghe sẽ tìm ra từ nguồn khác, hãy tự đưa nó vào — mất một trang slide nhẹ hơn nhiều so với mất uy tín.',
                  ],
                },
              ],
              relatedConcepts: ['Trình bày trung thực', 'Mức độ chắc chắn', 'Nhóm đối chứng'],
              furtherReading: [
                'Bài học "Thao túng số liệu" và "Correlation ≠ Causation" trong khoá Logic 101',
                'Edward Tufte — nguyên tắc về tính toàn vẹn đồ hoạ trong trình bày dữ liệu',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Nhận ra lỗi ở người khác đến trước; nhận ra lỗi của chính mình khó hơn và đến sau.\n' +
              '✓ Trình bày trung thực là khoản đầu tư vào uy tín: lần sau khi bạn nói "con số này tốt", người nghe tin ngay.\n' +
              '✓ Nói "tôi chưa đủ dữ liệu để kết luận" làm các phát biểu chắc chắn của bạn có trọng lượng hơn, không kém đi.\n' +
              '✓ Lập luận vững không chỉ đúng hơn — nó còn dễ giải trình hơn cho chính người dùng nó.',
          },
          {
            type: 'text',
            title: 'Điều Hương mang theo',
            paragraphs: [
              'Hương vẫn làm slide mỗi quý. Cô vẫn muốn số của mình trông đẹp — cô không giả vờ rằng mình không muốn.',
              'Thứ thay đổi là bây giờ cô biết chính xác những chỗ nào có thể làm cho nó trông đẹp hơn thực tế, và cô biết mình đang chọn không làm.',
              '"Biết cách bóp méo mới là điều kiện để không bóp méo," cô viết vào cuốn sổ. "Không biết thì không phải là trung thực, chỉ là chưa có cơ hội."',
            ],
          },
        ],
      },
    ],
  },
};
