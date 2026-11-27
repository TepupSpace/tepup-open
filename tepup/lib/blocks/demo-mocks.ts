/** Block mẫu cho /dev/blocks và /contributor-guide/block-demo (dùng chung, khỏi chép hai nơi). */
import type { BiasDetectorBlock, BranchDiagnosisBlock, ImageBiasDetectorBlock } from '@/lib/types/content';

const findText =
  'Lướt TikTok cả tuần, mình thấy toàn các bạn trẻ khoe lãi từ crypto. Chắc phải đến một nửa người chơi là có lãi. Mình đã đọc kỹ điều khoản của sàn trước khi mở tài khoản. Một người bạn bảo rủi ro lắm, nhưng bạn ấy chưa chơi bao giờ thì biết gì.';

export const mockBiasDetectorFind: BiasDetectorBlock = {
  type: 'bias-detector',
  mode: 'find',
  title: 'Tự tìm câu có lỗi',
  instruction: 'Không câu nào được tô sẵn. Bấm vào câu bạn cho là có thiên kiến và chọn loại.',
  article: { text: findText, source: 'Tình huống mẫu' },
  biasOptions: [
    { id: 'availability', label: 'Thiên kiến sẵn có' },
    { id: 'naive-realism', label: 'Hiện thực ngây thơ' },
  ],
  segments: [
    {
      id: 's1',
      text: 'Chắc phải đến một nửa người chơi là có lãi.',
      startIndex: findText.indexOf('Chắc phải'),
      biasType: 'availability',
      explanation: 'Người lỗ hiếm khi đăng video, nên những gì dễ thấy trên mạng không cho biết tỉ lệ thật.',
    },
    {
      id: 's2',
      text: 'bạn ấy chưa chơi bao giờ thì biết gì',
      startIndex: findText.indexOf('bạn ấy chưa'),
      biasType: 'naive-realism',
      explanation: 'Gạt ý kiến khác vì cho rằng người kia thiếu hiểu biết, thay vì hỏi họ thấy gì.',
    },
  ],
};

export const mockImageBiasDetector: ImageBiasDetectorBlock = {
  type: 'image-bias-detector',
  title: 'Soi một banner khuyến mãi',
  instruction: 'Chạm vào từng vùng được đánh số rồi chọn loại thiên kiến, hoặc "Không có lỗi".',
  mode: 'marked',
  image: {
    src: '/blocks-demo/banner-sale.svg',
    alt: 'Banner "Siêu sale 11.11": áo khoác gió, giá gạch 890.000đ, giá bán 450.000đ, nhãn -49%, đồng hồ đếm ngược, dòng chất liệu và nút Mua ngay.',
  },
  biasOptions: [{ id: 'anchoring', label: 'Mỏ neo' }],
  regions: [
    { id: 'r1', label: 'Giá gạch 890.000đ', x: 45, y: 36, w: 20, h: 11, biasType: 'anchoring', explanation: 'Con số gạch đi là mỏ neo: nó làm 450.000đ trông rẻ, dù bạn chưa biết chiếc áo đáng bao nhiêu.' },
    { id: 'r2', label: 'Nhãn -49%', x: 75, y: 48, w: 14, h: 12, biasType: 'anchoring', explanation: '"-49%" chỉ có nghĩa khi so với con số neo 890.000đ.' },
    { id: 'r3', label: 'Dòng chất liệu', x: 45, y: 64, w: 50, h: 9, biasType: 'none', explanation: 'Thông tin mô tả sản phẩm, không kéo lệch phán đoán về giá.' },
  ],
};

export const mockBranchDiagnosis: BranchDiagnosisBlock = {
  type: 'branch-diagnosis',
  title: 'Mình đang lệch ở nhánh nào?',
  instruction: 'Đọc tình huống, đi từng bước trên cây, rồi chọn cách tự vệ.',
  rootId: 'n0',
  nodes: [
    { id: 'n0', question: 'Bước 0: lúc này mình đang…', choices: [{ id: 'doan', label: 'Đoán nhanh' }, { id: 'giu', label: 'Giữ niềm tin cũ', next: 'n1' }] },
    {
      id: 'n1',
      question: 'Niềm tin cũ đang bị thách thức thế nào?',
      choices: [
        { id: 'tin-moi', label: 'Gặp tin mới' },
        { id: 'bi-bac', label: 'Căn cứ cũ bị bác' },
        { id: 'khac-y', label: 'Gặp người khác ý' },
      ],
    },
  ],
  final: {
    question: 'Cách tự vệ hợp nhất?',
    options: [
      { id: 'outside', label: 'Hỏi: trường hợp như thế này thường ra sao?' },
      { id: 'popper', label: 'Tìm phép thử có thể cho thấy mình sai' },
      { id: 'opposite', label: 'Tự giải thích vì sao điều ngược lại có thể đúng' },
      { id: 'humility', label: 'Hỏi: họ thấy gì mà mình không thấy?' },
    ],
  },
  cases: [
    {
      id: 'case1',
      text: 'HR nói "ngân sách vị trí này khoảng 8 triệu", rồi hỏi bạn mong muốn bao nhiêu. Bạn chưa từng tìm hiểu lương ngành này.',
      steps: [{ choiceId: 'doan', explanation: 'Bạn chưa có sẵn ý kiến về mức lương, nên đang đoán nhanh.' }],
      finalAnswer: { optionId: 'outside', explanation: 'Tìm mức lương của những vị trí tương tự trước khi trả lời, thay vì chỉnh quanh con số 8 triệu.' },
    },
    {
      id: 'case2',
      text: 'Bạn tin chắc MBTI mô tả đúng mình. Một người bạn gửi bài báo nói kết quả MBTI của cùng một người hay đổi sau vài tuần. Bạn lướt qua và nghĩ "chắc người viết không hiểu MBTI".',
      steps: [
        { choiceId: 'giu', explanation: 'Bạn đã tin từ trước.' },
        { choiceId: 'tin-moi', explanation: 'Một thông tin mới trái ý xuất hiện, và bạn tìm cách gạt nó đi.' },
      ],
      finalAnswer: { optionId: 'popper', explanation: 'Hỏi: nếu MBTI sai, mình sẽ thấy gì? Rồi tự làm lại bài sau vài tuần để xem.' },
    },
  ],
};
