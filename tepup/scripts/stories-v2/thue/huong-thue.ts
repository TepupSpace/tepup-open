import type { StorySeed } from '../types';
import { COURSE } from '../types';

/**
 * Hương × Thuế 101 — "Người kế toán nhìn hai phía". VIẾT LẠI.
 *
 * Bản cũ dạy Hương cách đọc bảng lương và quyết toán. Bản này dùng đúng lợi thế
 * nghề nghiệp của cô: cô là người duy nhất trong nhóm nhân vật nhìn thấy cả sổ
 * thuế doanh nghiệp lẫn bảng lương nhân viên — nên cô thấy được chỗ mà hai bên
 * đều tưởng bên kia đang trả.
 */
export const HUONG_THUE: StorySeed = {
  slug: 'huong-thue',
  characterSlug: 'office-worker',
  title: 'Người kế toán nhìn hai phía',
  teaser:
    'Nhân viên nghĩ công ty đóng thuế. Công ty nghĩ khách hàng trả. Hương là người ngồi giữa và nhìn thấy tiền thật sự đi từ đâu tới đâu.',
  icon: 'calculator',
  estimatedTime: '~30 phút',
  sortOrder: 1,
  courseSlugs: [COURSE.thue],
  part: {
    name: 'Hương và hai cuốn sổ',
    chapters: [
      // ── Chương 1 ──────────────────────────────────────────────────────────
      {
        slug: 'hai-cuon-so',
        title: 'Hai cuốn sổ trên một cái bàn',
        blocks: [
          {
            type: 'text',
            title: 'Mùa quyết toán',
            paragraphs: [
              'Tháng Ba là tháng bận nhất của Hương. Trên bàn cô có hai tập hồ sơ.',
              'Tập bên trái: quyết toán thuế thu nhập doanh nghiệp của công ty.',
              'Tập bên phải: quyết toán thuế thu nhập cá nhân của hai trăm nhân viên, trong đó có chính cô.',
            ],
          },
          {
            type: 'callout',
            icon: 'files',
            title: 'Điều Hương thấy mà người khác không thấy',
            variant: 'info',
            text: 'Nhân viên chỉ nhìn thấy tập bên phải, và họ thấy một dòng bị trừ vào lương mình. Ban giám đốc chỉ quan tâm tập bên trái, và họ thấy một khoản chi phí. Hương là người duy nhất trong công ty mở cả hai tập cùng lúc.',
          },
          {
            type: 'question',
            question:
              'Trong một công ty, khi bàn về thuế, người lao động và người sử dụng lao động thường tranh cãi về điều gì?',
            options: [
              { id: 'a', text: 'Ai phải nộp thuế cho nhà nước', isCorrect: false },
              { id: 'b', text: 'Ai thực sự là người mất tiền — và cả hai bên thường đều tin rằng bên kia mới là bên không bị mất gì', isCorrect: true },
              { id: 'c', text: 'Mức thuế suất có hợp lý không', isCorrect: false },
              { id: 'd', text: 'Thủ tục kê khai có phức tạp không', isCorrect: false },
            ],
            explanation:
              'Câu hỏi ai nộp thì luật đã trả lời rõ và không ai cãi. Chỗ tranh cãi luôn là câu còn lại: ai chịu. Nhân viên nhìn dòng trừ trên bảng lương và thấy mình mất. Doanh nghiệp nhìn khoản đóng bảo hiểm và thuế doanh nghiệp và thấy mình mất. Cả hai đều đúng một phần, và không ai nhìn thấy phần của bên kia.',
          },
          {
            type: 'text',
            title: 'Con số Hương so cho vui',
            paragraphs: [
              'Một buổi tối tháng Ba, Hương làm một việc không ai giao: cô tính tỷ lệ đóng góp thực tế của ba người trong công ty.',
              'Người thứ nhất: chị lao công, lương tám triệu.',
              'Người thứ hai: chính cô, lương mười lăm triệu.',
              'Người thứ ba: một trưởng phòng, lương sáu mươi triệu.',
            ],
          },
          {
            type: 'calculator',
            title: 'Thuế thu nhập cá nhân theo bậc',
            description:
              'Thuế thu nhập cá nhân ở Việt Nam là thuế luỹ tiến từng phần: mỗi bậc thu nhập chịu một thuế suất riêng, không phải toàn bộ thu nhập chịu chung một mức. Nhập lương tháng để xem cách nó hoạt động.',
            calculatorType: 'tax',
            formula: 'luong',
            inputs: [
              {
                id: 'luong',
                label: 'Thu nhập chịu thuế mỗi tháng (sau bảo hiểm)',
                type: 'number',
                unit: 'đồng',
                defaultValue: 15000000,
                min: 5000000,
                max: 100000000,
                step: 1000000,
              },
              {
                id: 'giamtru',
                label: 'Giảm trừ gia cảnh bản thân',
                type: 'number',
                unit: 'đồng',
                defaultValue: 11000000,
                min: 9000000,
                max: 20000000,
                step: 500000,
              },
              {
                id: 'nguoiphuthuoc',
                label: 'Số người phụ thuộc',
                type: 'number',
                unit: 'người',
                defaultValue: 0,
                min: 0,
                max: 4,
                step: 1,
              },
            ],
            outputs: [
              {
                id: 'tinhthue',
                label: 'Thu nhập tính thuế (sau khi trừ giảm trừ)',
                unit: 'đồng',
                formula: 'Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4)',
              },
              {
                id: 'thue',
                label: 'Thuế phải nộp mỗi tháng',
                unit: 'đồng',
                // Thuế luỹ tiến 7 bậc viết bằng min/max — bộ tính công thức an toàn
                // (lib/security/safe-expr.ts) không chạy hàm/vòng lặp JS. Tương đương
                // từng bit với bản IIFE cũ; xem scripts/test-safe-expr.ts.
                formula:
                  'Math.min(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4), 5000000) * 0.05 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000, 0), 5000000) * 0.1 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000, 0), 8000000) * 0.15 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000, 0), 14000000) * 0.2 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000 - 14000000, 0), 20000000) * 0.25 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000 - 14000000 - 20000000, 0), 28000000) * 0.3 + Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000 - 14000000 - 20000000 - 28000000, 0) * 0.35',
                highlight: true,
              },
              {
                id: 'tyle',
                label: 'Chiếm bao nhiêu phần trăm thu nhập',
                unit: '%',
                formula:
                  'luong > 0 ? (Math.min(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4), 5000000) * 0.05 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000, 0), 5000000) * 0.1 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000, 0), 8000000) * 0.15 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000, 0), 14000000) * 0.2 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000 - 14000000, 0), 20000000) * 0.25 + Math.min(Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000 - 14000000 - 20000000, 0), 28000000) * 0.3 + Math.max(Math.max(0, luong - giamtru - nguoiphuthuoc * giamtru * 0.4) - 5000000 - 5000000 - 8000000 - 14000000 - 20000000 - 28000000, 0) * 0.35) / luong * 100 : 0',
                highlight: true,
              },
            ],
            presets: [
              { label: 'Lương 8 triệu', values: { luong: 8000000, giamtru: 11000000, nguoiphuthuoc: 0 } },
              { label: 'Lương 15 triệu', values: { luong: 15000000, giamtru: 11000000, nguoiphuthuoc: 0 } },
              { label: 'Lương 60 triệu', values: { luong: 60000000, giamtru: 11000000, nguoiphuthuoc: 0 } },
            ],
            insight:
              'Chú ý cột phần trăm: nó tăng dần theo thu nhập. Đó chính là ý nghĩa của "luỹ tiến". Mức giảm trừ gia cảnh trong công cụ này để bạn tự điều chỉnh, vì con số này được sửa đổi theo từng thời kỳ — hãy tra mức đang áp dụng khi bạn đọc bài này.',
          },
          {
            type: 'text',
            title: 'Kết quả làm Hương chú ý',
            paragraphs: [
              'Chị lao công lương tám triệu: không phải nộp thuế thu nhập cá nhân, vì thu nhập dưới mức giảm trừ.',
              'Hương lương mười lăm triệu: nộp một khoản nhỏ, chiếm khoảng vài phần trăm thu nhập.',
              'Trưởng phòng lương sáu mươi triệu: nộp một khoản lớn hơn nhiều, và tỷ lệ trên thu nhập cũng cao hơn hẳn.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Luỹ tiến từng phần',
            variant: 'info',
            text: 'Nhiều người tưởng khi vượt qua một mốc thu nhập thì toàn bộ thu nhập bị đánh theo thuế suất mới — nên có người sợ tăng lương sẽ thành ra lĩnh ít hơn. Điều đó không xảy ra: chỉ phần thu nhập nằm trong mỗi bậc mới chịu thuế suất của bậc đó. Tăng lương luôn làm số tiền thực nhận tăng, chỉ là tăng chậm hơn phần lương tăng thêm.',
          },
          {
            type: 'question',
            question:
              'Một người có thu nhập vừa vượt qua một mốc bậc thuế. Điều gì xảy ra với số tiền thực nhận của họ?',
            options: [
              { id: 'a', text: 'Giảm xuống, vì toàn bộ thu nhập bị đánh thuế theo bậc mới', isCorrect: false },
              { id: 'b', text: 'Vẫn tăng, vì chỉ phần thu nhập nằm trong bậc mới mới chịu thuế suất cao hơn', isCorrect: true },
              { id: 'c', text: 'Không đổi', isCorrect: false },
              { id: 'd', text: 'Tuỳ vào số người phụ thuộc', isCorrect: false },
            ],
            explanation:
              'Đây là hiểu lầm phổ biến nhất về thuế luỹ tiến, và nó khiến một số người thật sự từ chối tăng lương hoặc từ chối làm thêm giờ. Cơ chế từng phần đảm bảo rằng thu nhập tăng thì thực nhận luôn tăng. Cái tăng chậm lại chỉ là phần tăng thêm, chứ không phải tổng số.',
          },
          {
            type: 'text',
            title: 'Nhưng đó mới là một nửa bức tranh',
            paragraphs: [
              'Hương nhìn con số của chị lao công và thấy nó không nói lên sự thật.',
              'Chị lao công không nộp một đồng thuế thu nhập cá nhân nào. Nhưng chị vẫn đi chợ mỗi ngày, vẫn mua gạo, vẫn đổ xăng xe máy, vẫn trả tiền điện.',
              'Toàn bộ tám triệu của chị đi qua vùng chịu thuế tiêu dùng, vì chị tiêu hết.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hương tính thử: nếu chị lao công tiêu hết tám triệu cho hàng hoá dịch vụ chịu thuế giá trị gia tăng, phần thuế nằm trong đó khoảng bảy trăm nghìn mỗi tháng.',
              'Bảy trăm nghìn trên tám triệu là gần chín phần trăm.',
              'Còn anh trưởng phòng, dù nộp thuế thu nhập cá nhân nhiều hơn nhiều, thì phần thuế tiêu dùng của anh chỉ chiếm một tỷ lệ nhỏ hơn hẳn trong thu nhập — vì anh không tiêu hết.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Nhìn một sắc thuế thì thấy sai bức tranh',
            variant: 'warning',
            text: 'Nếu chỉ nhìn thuế thu nhập cá nhân, ta kết luận người thu nhập thấp không đóng góp. Nếu chỉ nhìn thuế tiêu dùng, ta kết luận hệ thống bất công với người nghèo. Cả hai kết luận đều rút ra từ nửa bức tranh. Muốn biết ai gánh bao nhiêu, phải cộng tất cả các loại thuế mà một người thực sự trả và chia cho thu nhập của họ.',
          },
          {
            type: 'question',
            question:
              'Chỉ số nào phản ánh đúng nhất gánh nặng thuế thực tế của một người?',
            options: [
              { id: 'a', text: 'Số tiền thuế thu nhập cá nhân họ nộp mỗi năm', isCorrect: false },
              { id: 'b', text: 'Tổng mọi loại thuế họ thực sự trả — trực thu và gián thu — chia cho tổng thu nhập của họ', isCorrect: true },
              { id: 'c', text: 'Thuế suất áp dụng cho bậc thu nhập của họ', isCorrect: false },
              { id: 'd', text: 'Tỷ lệ thuế trên chi tiêu hằng tháng', isCorrect: false },
            ],
            explanation:
              'Chỉ số này gọi là thuế suất thực tế. Nó khác hẳn thuế suất danh nghĩa ghi trong luật, vì nó tính cả các khoản nằm trong giá hàng hoá, các khoản giảm trừ, và phần thu nhập không bị đánh thuế. Hai người có cùng thuế suất danh nghĩa hoàn toàn có thể có thuế suất thực tế chênh nhau rất xa.',
          },
          {
            type: 'text',
            title: 'Hương thử tính cho ba người',
            paragraphs: [
              'Cô cộng cả hai loại — thuế thu nhập cá nhân và ước lượng thuế tiêu dùng — rồi chia cho thu nhập.',
              'Kết quả khiến cô ngồi im: chị lao công có tỷ lệ đóng góp trên thu nhập KHÔNG thấp hơn cô bao nhiêu, dù chị không nộp một đồng thuế thu nhập nào.',
              'Và khoảng cách giữa cô với anh trưởng phòng thì nhỏ hơn nhiều so với khoảng cách lương giữa hai người.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Hương nhấn mạnh với chính mình rằng con số của cô chỉ là ước lượng thô — cô không có dữ liệu chi tiêu thật của ai.',
              'Nhưng ngay cả một ước lượng thô cũng đủ để cho thấy một điều: câu "người giàu đóng thuế nhiều hơn" đúng về số tuyệt đối và không hiển nhiên đúng về tỷ lệ.',
              'Và khi bàn về công bằng, tỷ lệ mới là thứ đang được bàn.',
            ],
          },
          {
            type: 'text',
            title: 'Chị lao công hỏi Hương một câu',
            paragraphs: [
              'Một hôm chị lao công thấy Hương ngồi muộn với đống hồ sơ, ghé vào hỏi thăm.',
              'Hương kể qua chuyện quyết toán. Chị cười: "Chị có đóng thuế đâu em, chị lương thấp mà."',
              'Hương định gật đầu cho qua, rồi cô dừng lại. Cô nhận ra câu đó không đúng, và việc chị tin nó không đúng thì có hậu quả.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc chị lao công tin rằng "mình không đóng thuế" lại quan trọng ngoài chuyện đúng sai?',
            options: [
              { id: 'a', text: 'Vì chị có thể bị phạt do không kê khai', isCorrect: false },
              { id: 'b', text: 'Vì niềm tin đó khiến chị không thấy mình có phần trong ngân sách chung, nên cũng không thấy mình có quyền hỏi tiền đó được tiêu thế nào', isCorrect: true },
              { id: 'c', text: 'Vì chị sẽ không được hưởng dịch vụ công', isCorrect: false },
              { id: 'd', text: 'Vì công ty sẽ phải nộp thay chị', isCorrect: false },
            ],
            explanation:
              'Câu nói ấy không gây hậu quả pháp lý nào — chị đúng là không phải kê khai gì. Hậu quả nằm ở chỗ khác: người tin rằng mình chưa góp gì thì tự loại mình ra khỏi cuộc trò chuyện về việc tiêu tiền chung. Và nhóm tự loại mình ra thường lại là nhóm phụ thuộc vào dịch vụ công nhiều nhất.',
          },
          {
            type: 'text',
            paragraphs: [
              'Hương giải thích ngắn gọn bằng ví dụ gói gạo và bình gas.',
              'Chị lao công nghe xong nói một câu mà Hương nhớ mãi: "Ủa vậy hoá ra chị đóng nhiều hơn em hả?"',
              'Hương không trả lời được ngay, vì câu trả lời trung thực là: tính theo tỷ lệ thu nhập thì rất có thể là như vậy.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Thuế suất danh nghĩa và thuế suất thực tế',
            description: 'Vì sao con số ghi trong luật không cho biết ai đang gánh bao nhiêu.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Hai khái niệm hay bị nhầm',
                  paragraphs: [
                    'Thuế suất danh nghĩa: con số ghi trong luật cho một bậc thu nhập hoặc một loại hàng hoá.',
                    'Thuế suất thực tế: tổng số thuế một người thực sự trả, chia cho tổng thu nhập của họ.',
                    'Hai người cùng bậc thuế danh nghĩa có thể có thuế suất thực tế rất khác nhau, tuỳ vào cơ cấu thu nhập, mức giảm trừ, và tỷ lệ thu nhập được đem tiêu.',
                  ],
                },
                {
                  heading: 'Cách thuế luỹ tiến từng phần hoạt động',
                  paragraphs: [
                    'Thu nhập được chia thành các bậc, mỗi bậc có thuế suất riêng, và chỉ phần nằm trong bậc nào mới chịu thuế suất của bậc đó.',
                    'Vì thế vượt qua một mốc bậc thuế không bao giờ làm thực nhận giảm — chỉ làm phần tăng thêm bị đánh thuế cao hơn.',
                    'Trước khi tính thuế, thu nhập được trừ giảm trừ gia cảnh cho bản thân và người phụ thuộc; mức này thay đổi theo từng thời kỳ nên cần tra mức đang áp dụng.',
                  ],
                },
                {
                  heading: 'Vì sao phải cộng cả hai nhóm thuế',
                  paragraphs: [
                    'Nhìn riêng thuế thu nhập: kết luận người thu nhập thấp không đóng góp — sai, vì họ trả thuế tiêu dùng trên gần như toàn bộ thu nhập.',
                    'Nhìn riêng thuế tiêu dùng: kết luận hệ thống hoàn toàn bất công — cũng chưa đủ, vì thuế thu nhập luỹ tiến bù lại một phần.',
                    'Chỉ khi cộng cả hai và tính theo tỷ lệ thu nhập, ta mới trả lời được câu hỏi ai đang gánh bao nhiêu.',
                  ],
                },
              ],
              relatedConcepts: ['Thuế suất thực tế', 'Luỹ tiến từng phần', 'Giảm trừ gia cảnh'],
              furtherReading: [
                'Bài học "Thuế có công bằng không?" trong khoá Thuế 101',
                'Luật Thuế thu nhập cá nhân — biểu thuế luỹ tiến từng phần và các khoản giảm trừ',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Trong quan hệ lao động, hai bên thường tranh cãi về việc ai chịu thuế, chứ không phải ai nộp thuế.\n' +
              '✓ Thuế luỹ tiến từng phần: vượt mốc bậc thuế không bao giờ làm thực nhận giảm.\n' +
              '✓ Người không nộp thuế thu nhập vẫn trả thuế tiêu dùng trên gần như toàn bộ thu nhập của mình.\n' +
              '✓ Muốn biết ai gánh bao nhiêu, phải cộng mọi loại thuế và chia cho thu nhập — đó là thuế suất thực tế.',
          },
          {
            type: 'text',
            title: 'Còn tập hồ sơ bên trái thì sao?',
            paragraphs: [
              'Hương đã nhìn kỹ tập bên phải — thuế của người lao động.',
              'Nhưng tập bên trái, thuế thu nhập doanh nghiệp, thì cô vẫn nghĩ theo cách mà mọi người vẫn nghĩ: đó là tiền của công ty, công ty chịu.',
              'Cho tới một buổi họp mà giám đốc nói một câu khiến cô phải xem lại toàn bộ cách hiểu đó.',
            ],
          },
        ],
      },
      // ── Chương 2 ──────────────────────────────────────────────────────────
      {
        slug: 'thue-doanh-nghiep-ai-tra',
        title: 'Thuế doanh nghiệp: cuối cùng ai trả?',
        blocks: [
          {
            type: 'text',
            title: 'Câu nói của giám đốc',
            paragraphs: [
              'Trong buổi họp về kế hoạch năm, giám đốc nói một câu rất bình thường mà không ai để ý:',
              '"Năm nay thuế doanh nghiệp cao thì mình phải cân lại, hoặc là giá bán, hoặc là chi phí nhân sự."',
              'Hương ghi câu đó vào sổ, vì cô nhận ra nó vừa trả lời một câu hỏi mà cô đang nghĩ tới.',
            ],
          },
          {
            type: 'callout',
            icon: 'help-circle',
            title: 'Câu hỏi',
            variant: 'info',
            text: 'Thuế thu nhập doanh nghiệp do công ty nộp. Nhưng công ty là một pháp nhân — nó không có ví. Tiền để nộp thuế đó cuối cùng đến từ túi của ai?',
          },
          {
            type: 'question',
            question:
              'Khi thuế thu nhập doanh nghiệp tăng, gánh nặng cuối cùng có thể rơi vào những ai?',
            mode: 'multiple',
            options: [
              { id: 'a', text: 'Chủ sở hữu và cổ đông, qua lợi nhuận giảm', isCorrect: true },
              { id: 'b', text: 'Người lao động, qua lương và phúc lợi tăng chậm hơn', isCorrect: true },
              { id: 'c', text: 'Khách hàng, qua giá bán cao hơn', isCorrect: true },
              { id: 'd', text: 'Không ai cả, vì đó là tiền của pháp nhân', isCorrect: false },
            ],
            explanation:
              'Một công ty không có túi riêng. Mọi khoản chi của nó cuối cùng đều đến từ một trong ba nhóm người thật: chủ sở hữu, người lao động, hoặc khách hàng. Tỷ lệ chia giữa ba nhóm tuỳ vào mức độ cạnh tranh của thị trường, khả năng thương lượng của người lao động, và mức độ dễ thay thế của sản phẩm. Đây là lý do câu "để doanh nghiệp trả" không bao giờ là một câu trả lời đầy đủ.',
          },
          {
            type: 'text',
            title: 'Hương nhìn lại ba năm số liệu',
            paragraphs: [
              'Cô mở lại sổ ba năm và tìm những năm công ty gặp chi phí tăng đột biến.',
              'Cô thấy một hình mẫu lặp lại: những năm đó, ngân sách tăng lương giảm xuống mức tối thiểu, và một vài khoản phúc lợi bị cắt.',
              'Giá bán thì không đổi mấy, vì thị trường cạnh tranh và tăng giá thì mất khách.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nghĩa là ở công ty của Hương, phần lớn chi phí tăng thêm được hấp thụ ở đâu?',
              'Ở dòng ngân sách nhân sự — tức là ở lương của chính cô và hai trăm đồng nghiệp.',
              'Không ai thông báo điều đó, và cũng không ai nói dối. Nó chỉ đơn giản là chỗ dễ điều chỉnh nhất.',
            ],
          },
          {
            type: 'text',
            title: 'Vì sao khách hàng của công ty Hương dễ bỏ đi',
            paragraphs: [
              'Công ty Hương làm dịch vụ, có bốn đối thủ cùng phân khúc trong cùng thành phố.',
              'Khách hàng chuyển sang bên khác mất chừng một tuần thủ tục, và giá cả gần như tương đương.',
              'Trong điều kiện đó, tăng giá năm phần trăm nghĩa là mất khách chứ không phải tăng doanh thu.',
            ],
          },
          {
            type: 'question',
            question:
              'Với một dịch vụ mà khách hàng chuyển đổi dễ dàng, doanh nghiệp có xu hướng hấp thụ chi phí tăng ở đâu?',
            options: [
              { id: 'a', text: 'Ở giá bán, vì đó là cách nhanh nhất', isCorrect: false },
              { id: 'b', text: 'Ở các khoản chi nội bộ ít gây phản ứng nhất, thường là chi phí nhân sự và các khoản đầu tư dài hạn', isCorrect: true },
              { id: 'c', text: 'Ở lợi nhuận của cổ đông', isCorrect: false },
              { id: 'd', text: 'Không hấp thụ được ở đâu nên phải đóng cửa', isCorrect: false },
            ],
            explanation:
              'Tăng giá trong thị trường cạnh tranh thì mất khách, nên cửa đó gần như đóng. Giảm lợi nhuận thì gặp phản ứng từ chủ sở hữu — những người có quyền thay ban điều hành. Chi phí nhân sự và các khoản đầu tư dài hạn như đào tạo, bảo trì, nghiên cứu là nơi việc cắt giảm không tạo ra phản ứng ngay lập tức từ ai có quyền. Vì thế chúng bị cắt trước.',
          },
          {
            type: 'text',
            title: 'Điều Hương nhận ra về chính mình',
            paragraphs: [
              'Hương ngồi tính lại mức tăng lương của cô bốn năm qua và so với mức lạm phát cùng kỳ.',
              'Con số không chênh nhiều, nhưng nó nghiêng về phía không có lợi cho cô.',
              'Trong bốn năm đó, cô chưa từng một lần hỏi vì sao mức tăng lại là con số đó — cô chỉ nhận thông báo và ký.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Gánh nặng đi tới chỗ ít kháng cự nhất',
            variant: 'info',
            text: 'Khi một khoản chi phí tăng, doanh nghiệp tìm chỗ để hấp thụ nó, và chỗ được chọn thường là chỗ ít gây phản ứng nhất. Nếu khách hàng dễ bỏ đi thì không tăng giá được. Nếu cổ đông đòi hỏi lợi nhuận thì không giảm lợi nhuận được. Phần còn lại là chi phí nhân sự — nơi việc "không tăng lương" không cần thông báo với ai.',
          },
          {
            type: 'slider-simulator',
            title: 'Gánh nặng đi về đâu?',
            description:
              'Giả sử chi phí thuế của một doanh nghiệp tăng thêm 100 đơn vị. Kéo hai thanh trượt để mô phỏng hai điều kiện thị trường, và xem phần chi phí đó được chia thế nào giữa ba nhóm.',
            sliders: [
              {
                id: 'khachdebo',
                label: 'Khách hàng dễ bỏ đi tìm chỗ khác (0 = rất khó, 100 = rất dễ)',
                min: 0,
                max: 100,
                step: 10,
                defaultValue: 70,
                unit: '',
              },
              {
                id: 'thuongluong',
                label: 'Khả năng thương lượng của người lao động (0 = rất yếu, 100 = rất mạnh)',
                min: 0,
                max: 100,
                step: 10,
                defaultValue: 20,
                unit: '',
              },
            ],
            outputs: [
              {
                id: 'kh',
                label: 'Khách hàng gánh (qua giá bán)',
                formula: '100 * (100 - khachdebo) / 100 * 0.6',
                unit: 'đơn vị',
                format: 'number',
              },
              {
                id: 'nld',
                label: 'Người lao động gánh (qua lương, phúc lợi)',
                formula: '(100 - 100 * (100 - khachdebo) / 100 * 0.6) * (100 - thuongluong) / 100',
                unit: 'đơn vị',
                format: 'number',
              },
              {
                id: 'chu',
                label: 'Chủ sở hữu gánh (qua lợi nhuận)',
                formula: '(100 - 100 * (100 - khachdebo) / 100 * 0.6) * thuongluong / 100',
                unit: 'đơn vị',
                format: 'number',
              },
            ],
            chart: {
              type: 'bar',
              bars: [
                { label: 'Khách hàng', formula: '100 * (100 - khachdebo) / 100 * 0.6', color: '#f59e0b' },
                {
                  label: 'Người lao động',
                  formula: '(100 - 100 * (100 - khachdebo) / 100 * 0.6) * (100 - thuongluong) / 100',
                  color: '#2563eb',
                },
                {
                  label: 'Chủ sở hữu',
                  formula: '(100 - 100 * (100 - khachdebo) / 100 * 0.6) * thuongluong / 100',
                  color: '#16a34a',
                },
              ],
            },
            breakpoints: [
              {
                condition: 'khachdebo <= 20',
                message:
                  'Khách hàng gần như không bỏ đi được — ví dụ điện, nước, xăng. Phần lớn chi phí được chuyển thẳng vào giá bán.',
                variant: 'warning',
              },
              {
                condition: 'khachdebo >= 70 && thuongluong <= 30',
                message:
                  'Thị trường cạnh tranh và người lao động thương lượng yếu: đây là tình huống của công ty Hương, và phần lớn chi phí rơi vào lương.',
                variant: 'info',
              },
              {
                condition: 'thuongluong >= 70',
                message:
                  'Khi người lao động thương lượng mạnh — có công đoàn hiệu quả, hoặc kỹ năng khan hiếm — phần chi phí chuyển sang họ giảm rõ rệt.',
                variant: 'success',
              },
            ],
          },
          {
            type: 'text',
            title: 'Mô hình này là mô hình đơn giản hoá',
            paragraphs: [
              'Hương cẩn thận nói rõ với chính mình: các con số trong mô phỏng trên không phải là số liệu thực tế của một nghiên cứu nào.',
              'Tỷ lệ chia thực tế giữa ba nhóm là một câu hỏi mà các nhà kinh tế vẫn tranh luận, và kết quả khác nhau tuỳ ngành, tuỳ quốc gia, tuỳ giai đoạn.',
              'Điều mô hình này cho thấy chỉ là cơ chế: gánh nặng dịch chuyển theo mức độ kháng cự, chứ không nằm yên ở nơi luật ghi tên.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao câu "hãy đánh thuế doanh nghiệp thay vì đánh thuế người dân" cần được xem xét cẩn thận?',
            options: [
              { id: 'a', text: 'Vì doanh nghiệp không nên bị đánh thuế', isCorrect: false },
              { id: 'b', text: 'Vì một phần gánh nặng đó vẫn quay về người lao động và người tiêu dùng, và tỷ lệ quay về phụ thuộc vào điều kiện thị trường chứ không do luật quyết định', isCorrect: true },
              { id: 'c', text: 'Vì doanh nghiệp sẽ chuyển ra nước ngoài', isCorrect: false },
              { id: 'd', text: 'Vì thuế doanh nghiệp khó thu hơn', isCorrect: false },
            ],
            explanation:
              'Câu này không sai hoàn toàn — thuế doanh nghiệp vẫn là một công cụ hợp lệ và có tác dụng phân phối thật. Nhưng nó bị dùng như thể có một túi tiền nào đó không thuộc về ai. Trên thực tế, phần nào trong khoản thuế đó rơi vào chủ sở hữu, phần nào rơi vào người lao động và khách hàng là một câu hỏi thực nghiệm — và câu trả lời thay đổi theo ngành và theo mức độ cạnh tranh.',
          },
          {
            type: 'text',
            title: 'Hương thấy điều này ở cả chiều ngược lại',
            paragraphs: [
              'Cô cũng để ý một hình mẫu ngược: những năm công ty được hưởng ưu đãi thuế, phần lợi ích cũng không tự động chảy về người lao động.',
              'Năm đó lợi nhuận tăng, cổ tức tăng, nhưng ngân sách tăng lương vẫn theo mức thông thường.',
              'Nghĩa là gánh nặng thì lan xuống, còn lợi ích thì không tự lan xuống — trừ khi có ai đó thương lượng.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Chi phí lan xuống dễ hơn lợi ích',
            variant: 'warning',
            text: 'Khi chi phí tăng, việc "không tăng lương năm nay" là một quyết định không cần thông báo và không ai phản đối được. Khi lợi nhuận tăng, việc chia phần cho người lao động đòi hỏi một quyết định chủ động, một cuộc thương lượng, hoặc một áp lực nào đó. Sự bất đối xứng này giải thích khá nhiều thứ về cách thu nhập được phân chia.',
          },
          {
            type: 'question',
            question:
              'Nếu gánh nặng thuế lan xuống người lao động qua việc lương tăng chậm, vì sao người lao động lại hiếm khi nhận ra?',
            options: [
              { id: 'a', text: 'Vì họ không quan tâm tới lương', isCorrect: false },
              { id: 'b', text: 'Vì thứ họ mất là mức tăng lẽ ra có — một khoản không bao giờ xuất hiện trên bảng lương nên không có gì để nhìn thấy', isCorrect: true },
              { id: 'c', text: 'Vì công ty giữ bí mật số liệu thuế', isCorrect: false },
              { id: 'd', text: 'Vì mức tăng lương do nhà nước quy định', isCorrect: false },
            ],
            explanation:
              'Đây là dạng mất mát khó nhận ra nhất: mất một thứ chưa từng có. Nếu lương bị trừ đi năm trăm nghìn, ai cũng thấy ngay. Nếu lương lẽ ra tăng một triệu mà chỉ tăng năm trăm nghìn, không có dòng nào ghi lại điều đó, và người nhận vẫn thấy mình được tăng lương. Cùng một số tiền, nhưng một bên gây phản ứng và một bên hoàn toàn vô hình.',
          },
          {
            type: 'text',
            title: 'Hương không kết luận là công ty xấu',
            paragraphs: [
              'Cô làm ở đây bốn năm và cô biết ban giám đốc không phải người xấu.',
              'Họ đối mặt với thị trường cạnh tranh, khách hàng nhạy giá, và cổ đông đòi lợi nhuận. Trong ba chỗ có thể hấp thụ chi phí, họ chọn chỗ ít gây rủi ro nhất cho sự tồn tại của công ty.',
              'Đó là một quyết định hợp lý ở cấp doanh nghiệp, và nó vẫn tạo ra một kết quả phân phối đáng bàn ở cấp xã hội.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô nghĩ đây là điều quan trọng nhất cô rút ra từ chuyện này.',
              'Rất nhiều kết quả xã hội đáng bàn không đến từ việc ai đó có ý đồ xấu.',
              'Chúng đến từ việc mỗi bên đều hành động hợp lý theo hoàn cảnh của mình, và cộng lại thì ra một kết quả mà không ai chọn.',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Ai thực sự trả thuế doanh nghiệp',
            description: 'Vì sao gánh nặng không nằm yên ở nơi luật ghi tên.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba nhóm có thể gánh',
                  paragraphs: [
                    'Chủ sở hữu và cổ đông: qua lợi nhuận sau thuế giảm.',
                    'Người lao động: qua lương và phúc lợi tăng chậm hơn mức lẽ ra.',
                    'Khách hàng: qua giá bán cao hơn.',
                    'Một pháp nhân không có ví riêng — mọi khoản chi của nó cuối cùng đều đến từ người thật.',
                  ],
                },
                {
                  heading: 'Điều gì quyết định tỷ lệ chia',
                  paragraphs: [
                    'Mức độ cạnh tranh: khách hàng càng dễ bỏ đi thì càng khó chuyển chi phí vào giá.',
                    'Khả năng thương lượng của người lao động: công đoàn hiệu quả, kỹ năng khan hiếm, thị trường lao động chặt chẽ đều làm giảm phần chuyển sang lương.',
                    'Kỳ vọng của chủ sở hữu và mức độ dễ dàng rút vốn đi nơi khác.',
                    'Đây là câu hỏi thực nghiệm, và kết quả khác nhau tuỳ ngành, tuỳ quốc gia, tuỳ giai đoạn.',
                  ],
                },
                {
                  heading: 'Hai điều cần nhớ khi nghe tranh luận chính sách',
                  paragraphs: [
                    '"Đánh thuế doanh nghiệp thay vì đánh thuế người dân" bỏ qua việc một phần gánh nặng vẫn quay về người dân — nhưng điều đó không có nghĩa thuế doanh nghiệp là vô nghĩa.',
                    'Chi phí lan xuống dễ hơn lợi ích lan xuống: cắt tăng lương thì không cần quyết định gì, còn chia lợi nhuận thì cần một quyết định chủ động.',
                    'Kết quả phân phối đáng bàn thường không đến từ ý đồ xấu, mà từ việc mỗi bên hành động hợp lý theo hoàn cảnh riêng.',
                  ],
                },
              ],
              relatedConcepts: ['Chuyển gánh nặng thuế', 'Sức mạnh thương lượng', 'Kết quả không ai chọn'],
              furtherReading: [
                'Bài học "Ai đang thực sự chịu thuế?" trong khoá Thuế 101',
                'Các nghiên cứu về phân chia gánh nặng thuế thu nhập doanh nghiệp giữa vốn và lao động',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Một pháp nhân không có ví riêng — thuế doanh nghiệp cuối cùng đến từ chủ sở hữu, người lao động, hoặc khách hàng.\n' +
              '✓ Tỷ lệ chia giữa ba nhóm do điều kiện thị trường quyết định, không do luật quyết định.\n' +
              '✓ Gánh nặng đi tới chỗ ít kháng cự nhất, và đó thường là dòng ngân sách nhân sự.\n' +
              '✓ Chi phí lan xuống dễ hơn lợi ích lan xuống — bất đối xứng này giải thích nhiều thứ về phân chia thu nhập.',
          },
          {
            type: 'text',
            title: 'Rồi Hương gặp một hồ sơ khác',
            paragraphs: [
              'Tháng Tư, công ty thuê một đơn vị tư vấn thuế bên ngoài rà soát lại hồ sơ quyết toán.',
              'Bản báo cáo tư vấn dày ba mươi trang, chỉ ra bảy điểm công ty có thể "tối ưu" để giảm số thuế phải nộp.',
              'Hương đọc và thấy cả bảy điểm đều hợp pháp. Và đó chính là điều làm cô suy nghĩ.',
            ],
          },
        ],
      },
      // ── Chương 3 ──────────────────────────────────────────────────────────
      {
        slug: 'bay-diem-deu-hop-phap',
        title: 'Bảy điểm đều hợp pháp',
        blocks: [
          {
            type: 'text',
            title: 'Bản báo cáo tư vấn',
            paragraphs: [
              'Bảy điểm trong báo cáo đều là những thứ nằm trong luật: tận dụng các khoản chi được trừ, sắp xếp lại thời điểm ghi nhận doanh thu và chi phí, dùng ưu đãi cho một hoạt động thuộc diện khuyến khích, và một vài kỹ thuật khác.',
              'Không có điểm nào là khai sai. Không có điểm nào là giấu doanh thu.',
              'Áp dụng cả bảy, số thuế phải nộp giảm khoảng mười tám phần trăm.',
            ],
          },
          {
            type: 'callout',
            icon: 'file-check',
            title: 'Ba khái niệm hay bị gộp làm một',
            variant: 'info',
            text: 'Tránh thuế hợp pháp (tax planning): sắp xếp hoạt động trong khuôn khổ luật để nộp ít hơn. Trốn thuế (tax evasion): khai sai, giấu doanh thu, lập chứng từ khống — đây là hành vi vi phạm pháp luật. Ở giữa là vùng xám: những cách làm đúng câu chữ nhưng đi ngược tinh thần của quy định, và ranh giới thì được xác định qua từng vụ việc cụ thể.',
          },
          {
            type: 'question',
            question:
              'Một công ty áp dụng đúng các quy định để giảm số thuế phải nộp. Điều này nên được đánh giá thế nào?',
            options: [
              { id: 'a', text: 'Là hành vi trốn thuế và cần bị xử lý', isCorrect: false },
              { id: 'b', text: 'Là hợp pháp; câu hỏi đáng bàn không phải là công ty đó có vi phạm không, mà là vì sao luật lại cho phép và ai tiếp cận được các cách đó', isCorrect: true },
              { id: 'c', text: 'Là hành vi đáng khen vì tiết kiệm chi phí', isCorrect: false },
              { id: 'd', text: 'Là chuyện riêng của doanh nghiệp, không ai có quyền bàn', isCorrect: false },
            ],
            explanation:
              'Gọi đây là trốn thuế thì sai về mặt pháp lý và cũng làm mất trọng tâm. Khen ngợi thì bỏ qua hệ quả xã hội. Câu hỏi hữu ích nằm ở chỗ khác: những quy định này được thiết kế nhằm mục đích gì, chúng có đạt mục đích đó không, và ai là người có đủ nguồn lực để tận dụng chúng.',
          },
          {
            type: 'text',
            title: 'Chi tiết làm Hương suy nghĩ nhất',
            paragraphs: [
              'Công ty cô trả cho đơn vị tư vấn một khoản phí không nhỏ để có bản báo cáo ba mươi trang đó.',
              'Khoản phí ấy nhỏ hơn nhiều so với số thuế tiết kiệm được, nên về mặt kinh tế thì đó là một quyết định đúng.',
              'Nhưng Hương nghĩ tới bác Tư bán bánh mì ở gần nhà cô.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bác Tư nộp thuế khoán, một mức cố định do cơ quan thuế ấn định.',
              'Bác không có kế toán, không thuê tư vấn, và cũng không có gì để "tối ưu" — thu nhập của bác không đi qua các cấu trúc mà những kỹ thuật kia áp dụng được.',
              'Nghĩa là cùng một hệ thống thuế, có nhóm tiếp cận được các cách giảm nghĩa vụ và có nhóm không.',
            ],
          },
          {
            type: 'question',
            question: 'Hành vi nào sau đây là VI PHẠM pháp luật, không phải tránh thuế hợp pháp?',
            mode: 'multiple',
            options: [
              { id: 'a', text: 'Không xuất hoá đơn để giấu bớt doanh thu', isCorrect: true },
              { id: 'b', text: 'Mua hoá đơn khống để tăng chi phí được trừ', isCorrect: true },
              { id: 'c', text: 'Trả một phần lương bằng tiền mặt để không kê khai', isCorrect: true },
              { id: 'd', text: 'Đăng ký hoạt động thuộc diện ưu đãi và làm đúng điều kiện ưu đãi', isCorrect: false },
            ],
            explanation:
              'Ba hành vi đầu đều làm sai lệch số liệu thực tế — giấu doanh thu, tạo chứng từ không có thật, che giấu khoản chi lương. Đó là trốn thuế và có chế tài. Phương án d thì ngược lại: doanh nghiệp làm đúng những gì luật yêu cầu để được hưởng một ưu đãi mà chính luật tạo ra. Đường phân chia nằm ở chỗ số liệu khai báo có phản ánh đúng thực tế hay không.',
          },
          {
            type: 'text',
            title: 'Vì sao ba hành vi kia lại phổ biến',
            paragraphs: [
              'Hương biết ba hành vi đó không hiếm, và cô cũng biết vì sao.',
              'Chúng đơn giản, không cần thuê ai, và với một cơ sở nhỏ thì rủi ro bị phát hiện trong ngắn hạn không cao.',
              'Nghĩa là người không tiếp cận được cách hợp pháp thì lại dễ tiếp cận cách bất hợp pháp — và đó là một hệ quả đáng lo của việc hệ thống quá phức tạp ở phần hợp pháp.',
            ],
          },
          {
            type: 'question',
            question:
              'Hệ quả của việc "cách hợp pháp thì khó tiếp cận, cách bất hợp pháp thì dễ" là gì?',
            options: [
              { id: 'a', text: 'Nhà nước thu được nhiều thuế hơn từ doanh nghiệp nhỏ', isCorrect: false },
              { id: 'b', text: 'Người nhỏ hoặc phải chịu nghĩa vụ cao hơn tương đối, hoặc bị đẩy vào vùng vi phạm — và cả hai đều là kết quả tồi', isCorrect: true },
              { id: 'c', text: 'Doanh nghiệp lớn sẽ chuyển sang cách bất hợp pháp', isCorrect: false },
              { id: 'd', text: 'Không có hệ quả gì đáng kể', isCorrect: false },
            ],
            explanation:
              'Khi con đường hợp pháp để giảm nghĩa vụ đòi hỏi chi phí chuyên môn mà người nhỏ không trả nổi, họ đứng trước hai lựa chọn đều tệ: chấp nhận gánh nặng tương đối cao hơn, hoặc bước sang vùng vi phạm với rủi ro pháp lý. Đây là lý do việc đơn giản hoá thủ tục cho hộ và doanh nghiệp nhỏ vừa là chính sách công bằng vừa là chính sách chống thất thu.',
          },
          {
            type: 'text',
            title: 'Ranh giới rõ hơn người ta tưởng ở hai đầu',
            paragraphs: [
              'Hương nhận ra hai đầu của thang thì rất rõ: kê khai đúng theo quy định là hợp pháp, còn lập chứng từ khống là vi phạm, không có gì phải bàn.',
              'Chỗ khó nằm ở giữa — những cấu trúc phức tạp đúng câu chữ nhưng được thiết kế chủ yếu để giảm thuế chứ không phục vụ hoạt động kinh doanh thật.',
              'Và vùng ở giữa đó thì chỉ những tổ chức đủ lớn mới với tới được, vì nó đòi hỏi luật sư, kế toán chuyên sâu và chi phí duy trì.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao "tối ưu thuế hợp pháp" lại là một vấn đề công bằng, dù không ai vi phạm gì?',
            options: [
              { id: 'a', text: 'Vì nó làm giảm số thu ngân sách', isCorrect: false },
              { id: 'b', text: 'Vì khả năng tận dụng các quy định phụ thuộc vào nguồn lực — nên cùng một luật lại tạo ra nghĩa vụ thực tế khác nhau giữa người có và không có nguồn lực', isCorrect: true },
              { id: 'c', text: 'Vì các công ty lớn không đóng thuế', isCorrect: false },
              { id: 'd', text: 'Vì luật thuế quá phức tạp', isCorrect: false },
            ],
            explanation:
              'Giảm thu ngân sách là hệ quả nhưng chưa phải trọng tâm. Vấn đề công bằng nằm ở chỗ: luật viết ra là như nhau cho mọi người, nhưng khả năng biến luật thành lợi thế thì không như nhau. Một hộ kinh doanh nộp khoán và một tập đoàn có phòng thuế riêng đang sống dưới cùng một bộ luật với hai kết quả rất khác nhau — và khoảng cách đó không do ai vi phạm mà do độ phức tạp của hệ thống.',
          },
          {
            type: 'text',
            title: 'Vì sao luật thuế lại phức tạp tới vậy',
            paragraphs: [
              'Hương từng nghĩ luật thuế phức tạp là do người soạn luật viết dở.',
              'Đọc kỹ hơn, cô thấy phần lớn sự phức tạp đến từ những mục đích chính đáng: ưu đãi cho vùng khó khăn, khuyến khích nghiên cứu, hỗ trợ doanh nghiệp nhỏ, tránh đánh thuế hai lần.',
              'Mỗi quy định riêng lẻ đều có lý do. Cộng lại thì thành một hệ thống mà chỉ chuyên gia mới điều hướng được.',
            ],
          },
          {
            type: 'text',
            title: 'Ưu đãi thuế được sinh ra để làm gì',
            paragraphs: [
              'Hương tìm hiểu về hai trong bảy điểm liên quan tới ưu đãi, và cô thấy chúng đều có mục đích rõ ràng khi được ban hành.',
              'Một ưu đãi nhằm khuyến khích doanh nghiệp đầu tư vào công nghệ. Một ưu đãi khác nhằm thu hút hoạt động về vùng có điều kiện kinh tế khó khăn.',
              'Câu hỏi đáng đặt ra không phải là ưu đãi có nên tồn tại hay không, mà là nó có tạo ra thứ nó hứa hẹn hay không.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Ví dụ với ưu đãi công nghệ: nếu doanh nghiệp vốn dĩ đã định đầu tư công nghệ dù có ưu đãi hay không, thì khoản ưu đãi ấy không tạo ra hành vi mới nào — nó chỉ chuyển tiền từ ngân sách sang doanh nghiệp.',
              'Còn nếu nó khiến một doanh nghiệp đang lưỡng lự quyết định đầu tư, thì nó đã làm đúng việc của mình.',
              'Phân biệt hai trường hợp này rất khó, và đó chính là chỗ mọi cuộc tranh luận về ưu đãi thuế bị kẹt lại.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Phức tạp là một loại thuế ẩn',
            variant: 'warning',
            text: 'Mỗi lớp quy định thêm vào đều làm tăng chi phí tuân thủ, và chi phí đó là một khoản cố định — nó nặng hơn rất nhiều với một hộ kinh doanh nhỏ so với một tập đoàn. Nghĩa là bản thân sự phức tạp đã hoạt động như một sắc thuế luỹ thoái, ngay cả khi mọi thuế suất trong đó đều được thiết kế công bằng.',
          },
          {
            type: 'text',
            title: 'Hương làm gì với bản báo cáo',
            paragraphs: [
              'Cô rà lại cả bảy điểm và xác nhận chúng đúng quy định.',
              'Cô trình lên ban giám đốc kèm một ghi chú về rủi ro: hai trong bảy điểm phụ thuộc vào cách diễn giải, nên nếu cơ quan thuế hiểu khác thì công ty sẽ phải giải trình.',
              'Đó là việc của một kế toán làm đúng nghề, và cô làm đúng việc đó.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Nhưng tối hôm ấy cô viết vào sổ tay một dòng khác:',
              '"Mình vừa giúp công ty nộp ít đi. Số đó không biến mất — nó chỉ được ai đó khác đóng bù."',
              'Cô không nghĩ mình đã làm gì sai. Cô chỉ muốn ghi lại rằng cô đã nhìn thấy điều đó.',
            ],
          },
          {
            type: 'question',
            question:
              'Câu "số thuế giảm đi không biến mất mà được ai đó khác đóng bù" đúng tới mức nào?',
            options: [
              { id: 'a', text: 'Hoàn toàn đúng, luôn có người khác phải đóng bù đúng số đó', isCorrect: false },
              { id: 'b', text: 'Đúng ở chỗ ngân sách phải cân đối bằng cách nào đó — tăng thu chỗ khác, giảm chi, hoặc vay — nhưng cơ chế bù không đơn giản và trực tiếp như một phép trừ', isCorrect: true },
              { id: 'c', text: 'Sai, vì ưu đãi thuế giúp kinh tế tăng trưởng nên bù lại được', isCorrect: false },
              { id: 'd', text: 'Sai, vì ngân sách không cần cân đối chính xác', isCorrect: false },
            ],
            explanation:
              'Cần cẩn thận với cả hai thái cực. Nói rằng mỗi đồng giảm đi đều có một người cụ thể đóng bù là quá đơn giản: ngân sách có thể vay, có thể cắt chi, và một số ưu đãi thật sự tạo ra hoạt động kinh tế mới sinh ra thuế. Nhưng nói rằng nó không ảnh hưởng gì cũng sai: mọi khoản hụt đều phải được xử lý bằng cách nào đó, và cách xử lý ấy luôn có người chịu.',
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Tránh thuế, trốn thuế và vùng xám',
            description: 'Ba khái niệm khác nhau, và vì sao vấn đề công bằng nằm ở khả năng tiếp cận.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Phân biệt ba khái niệm',
                  paragraphs: [
                    'Tránh thuế hợp pháp: sắp xếp hoạt động trong khuôn khổ pháp luật để nộp ít hơn. Không vi phạm.',
                    'Trốn thuế: khai sai, giấu doanh thu, lập chứng từ khống, trả lương ngoài sổ sách. Là hành vi vi phạm pháp luật, có chế tài.',
                    'Vùng xám: đúng câu chữ nhưng đi ngược mục đích của quy định. Ranh giới được xác định qua từng vụ việc và qua các quy định chống lạm dụng.',
                  ],
                },
                {
                  heading: 'Vì sao đây là vấn đề công bằng',
                  paragraphs: [
                    'Khả năng tận dụng quy định phụ thuộc vào nguồn lực: kế toán chuyên sâu, tư vấn thuế, luật sư, chi phí duy trì cấu trúc.',
                    'Một hộ kinh doanh nộp thuế khoán không có gì để tối ưu; một tổ chức lớn có cả một bộ phận làm việc đó.',
                    'Cùng một bộ luật tạo ra nghĩa vụ thực tế rất khác nhau, mà không ai vi phạm gì.',
                  ],
                },
                {
                  heading: 'Sự phức tạp như một sắc thuế ẩn',
                  paragraphs: [
                    'Phần lớn sự phức tạp trong luật thuế đến từ những mục đích chính đáng: ưu đãi vùng khó khăn, khuyến khích nghiên cứu, hỗ trợ doanh nghiệp nhỏ, tránh đánh thuế hai lần.',
                    'Nhưng chi phí tuân thủ là khoản gần như cố định, nên nó nặng hơn nhiều với người nhỏ.',
                    'Vì thế đơn giản hoá thủ tục cũng là một chính sách phân phối, chứ không chỉ là cải cách hành chính.',
                  ],
                },
              ],
              relatedConcepts: ['Tax planning', 'Trốn thuế', 'Chi phí tuân thủ'],
              furtherReading: [
                'Bài học "Tax Planning – Lách thuế hợp pháp là gì?" trong khoá Thuế 101',
                'Luật Quản lý thuế — quy định về hành vi trốn thuế và chế tài',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Tránh thuế hợp pháp, vùng xám và trốn thuế là ba thứ khác nhau — gộp chúng làm một sẽ làm hỏng cuộc tranh luận.\n' +
              '✓ Vấn đề công bằng không nằm ở việc ai vi phạm, mà ở việc ai có nguồn lực để biến luật thành lợi thế.\n' +
              '✓ Phần lớn sự phức tạp của luật thuế đến từ những mục đích chính đáng, nhưng cộng lại thì thành rào cản.\n' +
              '✓ Chi phí tuân thủ là khoản gần như cố định, nên bản thân sự phức tạp đã hoạt động như một sắc thuế luỹ thoái.',
          },
          {
            type: 'text',
            title: 'Câu hỏi cuối cùng của Hương',
            paragraphs: [
              'Hương biết công ty mình nộp bao nhiêu. Cô biết cô nộp bao nhiêu. Cô ước lượng được chị lao công nộp bao nhiêu.',
              'Nhưng có một con số cô không tra được: tổng số thuế mà toàn bộ doanh nghiệp trong ngành của cô đã nộp, và bao nhiêu trong đó được hưởng ưu đãi.',
              'Cô thử tìm, và cô phát hiện ra vấn đề không nằm ở chỗ số liệu bị giấu.',
            ],
          },
        ],
      },
      // ── Chương 4 ──────────────────────────────────────────────────────────
      {
        slug: 'so-lieu-khong-bi-giau',
        title: 'Số liệu không bị giấu',
        blocks: [
          {
            type: 'text',
            title: 'Hương đi tìm một con số',
            paragraphs: [
              'Cô muốn biết: trong ngành của cô, tổng số thuế thu nhập doanh nghiệp đã nộp là bao nhiêu, và bao nhiêu doanh nghiệp được hưởng ưu đãi.',
              'Cô mở các bản công bố ngân sách, các báo cáo của cơ quan thuế, các bản thuyết minh dự toán.',
              'Sau ba buổi tối, cô tìm được các con số tổng ở cấp quốc gia. Nhưng bóc tách theo ngành, theo quy mô doanh nghiệp, theo loại ưu đãi thì không.',
            ],
          },
          {
            type: 'callout',
            icon: 'search',
            title: 'Vấn đề không phải là bị giấu',
            variant: 'info',
            text: 'Rất nhiều số liệu được công bố đúng quy định: bảng tổng thu, phân theo sắc thuế, dự toán và quyết toán, thuyết minh kèm theo. Cái Hương không tìm được là mức chi tiết đủ để trả lời câu hỏi cụ thể của cô — và đó là một dạng thiếu minh bạch khác hẳn việc giấu diếm.',
          },
          {
            type: 'question',
            question:
              'Trong bốn tình huống sau, tình huống nào là trở ngại lớn nhất với việc giám sát của người dân?',
            options: [
              { id: 'a', text: 'Số liệu bị giữ bí mật hoàn toàn', isCorrect: false },
              { id: 'b', text: 'Số liệu được công bố nhưng ở mức tổng gộp, không bóc tách được để trả lời câu hỏi cụ thể nào', isCorrect: true },
              { id: 'c', text: 'Số liệu công bố chậm hơn một quý', isCorrect: false },
              { id: 'd', text: 'Số liệu chỉ có bản tiếng Việt', isCorrect: false },
            ],
            explanation:
              'Bí mật hoàn toàn thì ít nhất ai cũng biết là mình không được biết, và đó là một vấn đề rõ ràng để đòi hỏi. Công bố ở mức tổng gộp thì tạo ra hình thức minh bạch mà không tạo ra khả năng kiểm tra: mọi câu hỏi cụ thể đều rơi vào khoảng trống giữa các con số lớn. Đây là dạng khó xử lý nhất, vì về mặt hình thức thì mọi nghĩa vụ công bố đều đã được thực hiện.',
          },
          {
            type: 'text',
            title: 'Ba mức của minh bạch',
            paragraphs: [
              'Hương tự sắp xếp lại những gì cô quan sát được thành ba mức.',
              '📄 Mức một — có công bố: tài liệu tồn tại và ai cũng tải về được.',
              '🔍 Mức hai — đọc được: có bản tóm tắt, có chú giải, người không chuyên hiểu được nó nói gì.',
              '🧮 Mức ba — kiểm tra được: đủ chi tiết để đối chiếu một cam kết với một kết quả, hoặc so sánh giữa các nhóm.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Cô thấy phần lớn số liệu ngân sách ở Việt Nam đã đạt mức một khá tốt.',
              'Mức hai thì tuỳ tài liệu — có bản có thuyết minh dễ hiểu, có bản thì chỉ là bảng số.',
              'Mức ba là chỗ khoảng cách còn lớn nhất, và nó cũng là mức duy nhất cho phép giám sát thật.',
            ],
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Minh bạch hình thức và minh bạch thật',
            variant: 'info',
            text: 'Một tổ chức có thể tuân thủ đầy đủ mọi nghĩa vụ công bố mà vẫn không ai kiểm tra được gì — nếu tài liệu quá dài, quá tổng gộp, hoặc quá chuyên ngành. Vì thế thước đo hữu ích không phải là "có công bố không" mà là "có ai trả lời được một câu hỏi cụ thể nhờ nó không".',
          },
          {
            type: 'question',
            question:
              'Vì sao mức độ chi tiết lại quan trọng hơn số lượng tài liệu được công bố?',
            options: [
              { id: 'a', text: 'Vì tài liệu dài thì khó lưu trữ', isCorrect: false },
              { id: 'b', text: 'Vì chỉ ở mức đủ chi tiết mới đối chiếu được cam kết với kết quả, hoặc so sánh được giữa các nhóm — tức là mới giám sát được', isCorrect: true },
              { id: 'c', text: 'Vì công bố nhiều tài liệu tốn ngân sách', isCorrect: false },
              { id: 'd', text: 'Vì người dân không có thời gian đọc nhiều', isCorrect: false },
            ],
            explanation:
              'Giám sát là việc so sánh: cam kết so với thực hiện, nhóm này so với nhóm kia, năm nay so với năm trước. Mọi so sánh đều cần dữ liệu ở cùng một mức chi tiết. Một nghìn trang số liệu tổng gộp không cho phép một phép so sánh nào, trong khi một bảng nhỏ được bóc tách đúng chiều thì trả lời được nhiều câu hỏi.',
          },
          {
            type: 'text',
            title: 'Vì sao số liệu chi tiết lại khó công bố',
            paragraphs: [
              'Hương tìm hiểu và thấy lý do không đơn giản là ai đó không muốn.',
              'Số liệu thuế của từng doanh nghiệp là thông tin được bảo mật theo quy định — công bố ra sẽ lộ tình hình kinh doanh của từng đơn vị.',
              'Nhưng số liệu tổng hợp theo ngành, theo quy mô, theo loại ưu đãi thì không lộ danh tính ai, và đó chính là mức mà giám sát cần.',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao "số liệu tổng hợp theo nhóm" là một mức công bố hợp lý, dù số liệu từng doanh nghiệp phải được bảo mật?',
            options: [
              { id: 'a', text: 'Vì tổng hợp thì dễ tính hơn', isCorrect: false },
              { id: 'b', text: 'Vì nó giữ được bí mật kinh doanh của từng đơn vị mà vẫn cho phép trả lời câu hỏi về hiệu quả của chính sách', isCorrect: true },
              { id: 'c', text: 'Vì luật yêu cầu công bố theo nhóm', isCorrect: false },
              { id: 'd', text: 'Vì doanh nghiệp đồng ý công bố theo nhóm', isCorrect: false },
            ],
            explanation:
              'Bảo mật thông tin của từng doanh nghiệp và minh bạch về hiệu quả chính sách không mâu thuẫn nhau. Một bảng thống kê theo ngành và theo quy mô không cho biết doanh nghiệp nào lãi bao nhiêu, nhưng nó trả lời được câu hỏi "ưu đãi này đang đi về đâu". Đây là lý do việc đòi hỏi chi tiết hơn không đồng nghĩa với đòi hỏi lộ bí mật.',
          },
          {
            type: 'text',
            paragraphs: [
              'Hương nhận ra đây là điều đáng nói khi có dịp: không phải đòi công khai mọi thứ, mà đòi công khai ở đúng mức cho phép kiểm tra chính sách.',
              'Yêu cầu quá đà thì bị bác bỏ vì lý do bảo mật, và cuộc trao đổi dừng lại ở đó.',
              'Yêu cầu đúng mức thì khó bị bác, vì nó không đụng tới thứ mà bảo mật đang bảo vệ.',
            ],
          },
          {
            type: 'text',
            title: 'Hương thử một cách khác',
            paragraphs: [
              'Không tìm được số liệu ngành, cô đổi hướng: cô tìm cái mình chắc chắn có quyền tiếp cận.',
              'Với tư cách kế toán của công ty, cô có toàn bộ số liệu thuế của chính công ty mình trong năm năm.',
              'Cô lập một bảng: số thuế nộp mỗi năm, doanh thu, lợi nhuận, và tỷ lệ thuế thực tế trên lợi nhuận trước thuế.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Bảng đó cho cô thấy một điều mà cô chưa từng nhìn thấy khi làm từng năm riêng lẻ: tỷ lệ thuế thực tế của công ty giảm dần qua năm năm.',
              'Không phải do trốn tránh gì — chủ yếu do các khoản ưu đãi được áp dụng ngày càng đầy đủ hơn, và do công ty ngày càng biết cách tận dụng quy định.',
              'Nói cách khác: công ty không thay đổi hành vi kinh doanh, chỉ thay đổi mức độ thành thạo trong việc điều hướng hệ thống.',
            ],
          },
          {
            type: 'callout',
            icon: 'warning',
            title: 'Chuỗi thời gian nói nhiều hơn một điểm',
            variant: 'warning',
            text: 'Một con số của một năm gần như không nói lên điều gì — nó có thể do đặc thù năm đó. Cùng con số ấy đặt trong chuỗi năm năm thì cho thấy xu hướng, và xu hướng mới là thứ đáng bàn. Đây là kỹ thuật giám sát đơn giản nhất mà bất kỳ ai có dữ liệu nhiều năm cũng làm được.',
          },
          {
            type: 'text',
            title: 'Hương chia sẻ bảng đó với ai',
            paragraphs: [
              'Cô không đăng lên mạng — đó là số liệu nội bộ của công ty và cô không có quyền công bố.',
              'Cô đưa nó cho ban giám đốc, trong một cuộc họp về kế hoạch thuế năm sau.',
              'Cô trình bày nó như một thông tin quản trị: đây là xu hướng, đây là mức độ phụ thuộc vào các ưu đãi, và đây là rủi ro nếu chính sách ưu đãi thay đổi.',
            ],
          },
          {
            type: 'text',
            paragraphs: [
              'Giám đốc hỏi một câu mà Hương không ngờ tới: "Nếu bỏ hết ưu đãi thì mình còn lãi không?"',
              'Cô tính và trả lời: còn, nhưng mỏng.',
              'Ông ghi lại và nói: "Vậy mình đừng xây kế hoạch dựa trên cái đó."',
            ],
          },
          {
            type: 'question',
            question:
              'Vì sao việc Hương trình bày số liệu như "thông tin quản trị" lại hiệu quả hơn trình bày như một vấn đề đạo đức?',
            options: [
              { id: 'a', text: 'Vì ban giám đốc không quan tâm tới đạo đức', isCorrect: false },
              { id: 'b', text: 'Vì nó nêu một rủi ro thật mà người nghe có động cơ xử lý, thay vì đặt họ vào thế phải tự bào chữa', isCorrect: true },
              { id: 'c', text: 'Vì số liệu quản trị thì chính xác hơn', isCorrect: false },
              { id: 'd', text: 'Vì đó là công việc chính thức của kế toán', isCorrect: false },
            ],
            explanation:
              'Đây là cùng một nguyên tắc Hương đã dùng với anh Kiên và cái biểu đồ. Trình bày dưới dạng "công ty đang hưởng lợi từ kẽ hở" buộc người nghe bảo vệ danh dự trước khi kịp nghĩ. Trình bày dưới dạng "chúng ta đang phụ thuộc vào một thứ có thể thay đổi" thì nêu đúng một rủi ro mà họ có lý do thật để quan tâm — và nó dẫn tới cùng một hành động thận trọng hơn.',
          },
          {
            type: 'text',
            title: 'Điều Hương không giải quyết được',
            paragraphs: [
              'Cô vẫn không tra được con số của cả ngành. Cô vẫn không biết hệ thống ưu đãi có đạt mục tiêu hay không.',
              'Những câu hỏi đó cần dữ liệu ở mức mà một cá nhân không tiếp cận được, và cần cả một quá trình đánh giá chính sách bài bản.',
              'Cô ghi vào sổ: "Cái mình làm được là biết chính xác chỗ mình đứng. Cái mình không làm được thì cũng nên biết là mình không làm được."',
            ],
          },
          {
            type: 'library-document',
            mode: 'inline',
            title: 'Ba mức của minh bạch',
            description: 'Vì sao "có công bố" chưa đủ, và một người bình thường giám sát được gì.',
            category: 'Thuế và công dân',
            estimatedReadTime: '4 phút',
            documentContent: {
              sections: [
                {
                  heading: 'Ba mức',
                  paragraphs: [
                    'Có công bố: tài liệu tồn tại và tải về được. Đây là nghĩa vụ tối thiểu và phần lớn đã được thực hiện.',
                    'Đọc được: có bản tóm tắt, có chú giải, người không chuyên hiểu được nó nói gì.',
                    'Kiểm tra được: đủ chi tiết để đối chiếu cam kết với kết quả, hoặc so sánh giữa các nhóm và các năm. Chỉ ở mức này mới có giám sát thật.',
                  ],
                },
                {
                  heading: 'Vì sao mức ba khó nhất',
                  paragraphs: [
                    'Số liệu tổng gộp tạo ra hình thức minh bạch mà không tạo ra khả năng kiểm tra — mọi câu hỏi cụ thể rơi vào khoảng trống giữa các con số lớn.',
                    'Về mặt hình thức, mọi nghĩa vụ công bố vẫn được coi là đã hoàn thành, nên rất khó đòi hỏi thêm.',
                    'Thước đo hữu ích không phải "có công bố không" mà là "có ai trả lời được một câu hỏi cụ thể nhờ nó không".',
                  ],
                },
                {
                  heading: 'Ba việc một cá nhân làm được',
                  paragraphs: [
                    'Lập chuỗi thời gian với dữ liệu bạn có quyền tiếp cận. Một điểm không nói gì; năm điểm cho thấy xu hướng.',
                    'Đối chiếu một chỉ tiêu đã được công bố với số thực hiện — cả hai đều công khai, và đây là dạng giám sát rẻ nhất.',
                    'Khi nêu vấn đề trong tổ chức, trình bày dưới dạng rủi ro cần quản trị thay vì dưới dạng cáo buộc.',
                  ],
                },
              ],
              relatedConcepts: ['Minh bạch hình thức', 'Mức độ chi tiết dữ liệu', 'Giám sát bằng chuỗi thời gian'],
              furtherReading: [
                'Bài học "Minh bạch về thuế nghĩa là gì?" và "Tại sao minh bạch lại khó thế" trong khoá Thuế 101',
                'Các bản công bố dự toán, quyết toán ngân sách nhà nước và thuyết minh kèm theo',
              ],
            },
          },
          {
            type: 'callout',
            icon: 'check',
            title: 'Bạn đã học được gì?',
            variant: 'success',
            text:
              '✓ Trở ngại lớn nhất với giám sát thường không phải bí mật, mà là số liệu tổng gộp không bóc tách được.\n' +
              '✓ Minh bạch có ba mức: có công bố, đọc được, và kiểm tra được — chỉ mức ba mới cho phép giám sát thật.\n' +
              '✓ Một chuỗi thời gian nói nhiều hơn một con số của một năm, và ai có dữ liệu nhiều năm đều lập được.\n' +
              '✓ Nêu vấn đề dưới dạng rủi ro cần quản trị hiệu quả hơn nhiều so với nêu dưới dạng cáo buộc.',
          },
          {
            type: 'text',
            title: 'Điều Hương mang theo',
            paragraphs: [
              'Hương vẫn làm quyết toán mỗi tháng Ba, vẫn mở hai tập hồ sơ trên cùng một cái bàn.',
              'Thứ thay đổi là bây giờ cô nhìn hai tập đó như hai đầu của một dòng tiền, chứ không phải hai công việc riêng.',
              'Và mỗi khi nghe ai đó nói "thuế là chuyện của nhà nước với doanh nghiệp, mình dân đen biết gì", cô nhớ tới câu của chị lao công:',
              '"Ủa vậy hoá ra chị đóng nhiều hơn em hả?"',
            ],
          },
        ],
      },
    ],
  },
};
