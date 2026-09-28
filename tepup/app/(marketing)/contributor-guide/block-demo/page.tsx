'use client';

import Link from '@/components/ui/AppLink';
import { ArrowLeft } from 'lucide-react';

import {
  CalculatorBlockComponent,
  SliderSimulatorBlockComponent,
  BudgetAllocatorBlockComponent,
  BiasDetectorBlockComponent,
  PerspectiveSwitchBlockComponent,
  HotColdGuessBlockComponent,
} from '@/components/blocks';

import type {
  CalculatorBlock,
  SliderSimulatorBlock,
  BudgetAllocatorBlock,
  BiasDetectorBlock,
  PerspectiveSwitchBlock,
  HotColdGuessBlock,
} from '@/lib/types/content';

// ==========================================
// MOCK DATA — các block tương tác được hỗ trợ
// ==========================================

const mockCalculator: CalculatorBlock = {
  type: 'calculator',
  title: 'Tính thuế thu nhập cá nhân',
  description: 'Nhập thu nhập hàng tháng để xem bạn đóng bao nhiêu thuế theo biểu thuế lũy tiến Việt Nam.',
  calculatorType: 'tax',
  inputs: [
    { id: 'income', label: 'Thu nhập hàng tháng', type: 'number', unit: 'triệu VNĐ', defaultValue: 20, min: 0, max: 200, step: 1 },
    { id: 'dependents', label: 'Số người phụ thuộc', type: 'number', unit: 'người', defaultValue: 0, min: 0, max: 10, step: 1 },
  ],
  formula: 'income - 11 - dependents * 4.4',
  outputs: [
    { id: 'taxableIncome', label: 'Thu nhập chịu thuế', formula: 'Math.max(0, income - 11 - dependents * 4.4)', unit: 'triệu VNĐ' },
    { id: 'tax', label: 'Thuế phải đóng (ước tính)', formula: 'Math.max(0, (income - 11 - dependents * 4.4) * 0.1)', unit: 'triệu VNĐ', highlight: true },
    { id: 'netIncome', label: 'Thu nhập thực nhận', formula: 'income - Math.max(0, (income - 11 - dependents * 4.4) * 0.1)', unit: 'triệu VNĐ' },
  ],
  presets: [
    { label: 'Sinh viên mới ra trường', values: { income: 10, dependents: 0 } },
    { label: 'Nhân viên văn phòng', values: { income: 25, dependents: 1 } },
    { label: 'Quản lý cấp trung', values: { income: 50, dependents: 2 } },
  ],
  insight: 'Mỗi người phụ thuộc giúp giảm 4.4 triệu VNĐ thu nhập chịu thuế. Đây là cách nhà nước hỗ trợ gia đình đông con — nhưng cũng có người cho rằng nó khuyến khích sinh đẻ nhiều.',
};

const mockSliderSimulator: SliderSimulatorBlock = {
  type: 'slider-simulator',
  title: 'Đường cong Laffer — Thuế suất vs Thu ngân sách',
  description: 'Thuế suất cao hơn có luôn mang lại nhiều tiền hơn cho nhà nước? Kéo thanh trượt để khám phá.',
  sliders: [
    { id: 'taxRate', label: 'Thuế suất', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%' },
  ],
  outputs: [
    { id: 'revenue', label: 'Thu ngân sách', formula: 'taxRate * (100 - taxRate) * 0.4', unit: 'tỷ VNĐ', format: 'number' },
    { id: 'evasion', label: 'Tỷ lệ trốn thuế', formula: 'Math.min(95, Math.max(0, (taxRate - 30) * 2))', format: 'percent' },
  ],
  chart: {
    type: 'bar',
    bars: [
      { label: 'Thu ngân sách', formula: 'taxRate * (100 - taxRate) * 0.4', color: 'bg-emerald-500' },
      { label: 'Trốn thuế', formula: 'Math.min(95, Math.max(0, (taxRate - 30) * 2)) * 10', color: 'bg-red-400' },
    ],
  },
  breakpoints: [
    { condition: 'taxRate <= 10', message: 'Thuế suất quá thấp: nhà nước không đủ ngân sách cho dịch vụ công cơ bản (y tế, giáo dục, quốc phòng).', variant: 'warning' },
    { condition: 'taxRate >= 45 && taxRate <= 55', message: 'Đây là vùng "đỉnh Laffer" — thu ngân sách đạt tối đa. Nhiều nhà kinh tế cho rằng điểm tối ưu nằm quanh 50%.', variant: 'success' },
    { condition: 'taxRate >= 70', message: 'Thuế suất quá cao: người dân trốn thuế hoặc ngừng làm việc. Tổng thu ngân sách giảm mạnh — hiện tượng "vượt đỉnh Laffer".', variant: 'warning' },
    { condition: 'taxRate >= 90', message: 'Thuế 90%+: Gần như không ai muốn làm việc hợp pháp. Nền kinh tế ngầm phát triển. Đây là mức thuế phi thực tế.', variant: 'warning' },
  ],
};

const mockBudgetAllocator: BudgetAllocatorBlock = {
  type: 'budget-allocator',
  title: 'Phân bổ ngân sách quốc gia',
  description: 'Bạn là Thủ tướng với 100 tỷ VNĐ. Hãy phân bổ cho các lĩnh vực — và xem hệ quả!',
  totalBudget: 100,
  unit: 'tỷ VNĐ',
  categories: [
    { id: 'education', label: 'Giáo dục', icon: '📚', color: 'blue', defaultValue: 20, minValue: 5, description: 'Trường học, đại học, đào tạo nghề' },
    { id: 'health', label: 'Y tế', icon: '🏥', color: 'green', defaultValue: 20, minValue: 5, description: 'Bệnh viện, bảo hiểm y tế, phòng dịch' },
    { id: 'defense', label: 'Quốc phòng', icon: '🛡️', color: 'red', defaultValue: 15, minValue: 5, description: 'Quân đội, an ninh, biên giới' },
    { id: 'infrastructure', label: 'Hạ tầng', icon: '🏗️', color: 'amber', defaultValue: 25, minValue: 5, description: 'Đường xá, cầu cống, điện nước' },
    { id: 'welfare', label: 'Phúc lợi xã hội', icon: '🤝', color: 'purple', defaultValue: 10, minValue: 0, description: 'Trợ cấp nghèo, hưu trí, bảo hiểm thất nghiệp' },
    { id: 'science', label: 'Khoa học & Công nghệ', icon: '🔬', color: 'cyan', defaultValue: 10, minValue: 0, description: 'R&D, đổi mới sáng tạo' },
  ],
  outcomes: [
    { condition: 'education >= 30', title: 'Giáo dục xuất sắc', description: 'Tỷ lệ biết chữ đạt 99%. Lao động chất lượng cao tăng mạnh, thu hút FDI công nghệ. Tuy nhiên kết quả cần 10-15 năm mới thấy rõ.', variant: 'good' },
    { condition: 'education <= 10', title: 'Khủng hoảng giáo dục', description: 'Trường học xuống cấp, giáo viên nghỉ việc. Thế hệ tiếp theo thiếu kỹ năng, năng suất lao động giảm.', variant: 'bad' },
    { condition: 'health >= 30', title: 'Hệ thống y tế mạnh', description: 'Tuổi thọ trung bình tăng, tỷ lệ tử vong trẻ em giảm. Người dân khỏe mạnh = năng suất lao động cao hơn.', variant: 'good' },
    { condition: 'health <= 10', title: 'Y tế quá tải', description: 'Bệnh viện thiếu thuốc và nhân lực. Chi phí y tế tư nhân tăng, người nghèo không được chăm sóc sức khỏe.', variant: 'bad' },
    { condition: 'infrastructure >= 35', title: 'Hạ tầng hiện đại', description: 'Đường cao tốc, metro, internet 5G phủ khắp. Logistics cải thiện mạnh, thương mại phát triển.', variant: 'good' },
    { condition: 'welfare <= 3', title: 'Bỏ rơi người yếu thế', description: 'Người nghèo, người già không có lưới an toàn. Bất bình đẳng gia tăng, bất ổn xã hội.', variant: 'bad' },
  ],
  comparison: {
    label: 'Ngân sách VN 2023 (ước tính)',
    values: { education: 20, health: 15, defense: 12, infrastructure: 28, welfare: 15, science: 10 },
  },
};

const mockBiasDetector: BiasDetectorBlock = {
  type: 'bias-detector',
  title: 'Phát hiện thiên lệch truyền thông',
  instruction: 'Đọc đoạn tin dưới đây. Click vào các cụm từ được highlight và chọn loại thiên lệch phù hợp.',
  article: {
    text: 'Chính sách tăng thuế VAT lên 10% là một đòn chí mạng vào túi tiền người dân. Trong khi các chuyên gia kinh tế hàng đầu đều phản đối, chính phủ vẫn cố tình phớt lờ. Một cuộc khảo sát cho thấy 95% người dân không đồng ý — con số áp đảo chứng minh chính sách này hoàn toàn sai lầm. Rõ ràng, những kẻ soạn luật này không hiểu gì về đời sống thực tế.',
    source: 'Bài báo mẫu — Tin giả để phân tích',
  },
  segments: [
    { id: 's1', text: 'đòn chí mạng vào túi tiền', startIndex: 50, biasType: 'emotional', explanation: '"Đòn chí mạng" là ngôn ngữ gây cảm xúc mạnh, phóng đại tác động thực tế. Mức tăng VAT 2% có ảnh hưởng, nhưng không phải "chí mạng".' },
    { id: 's2', text: 'các chuyên gia kinh tế hàng đầu đều phản đối', startIndex: 100, biasType: 'cherry-pick', explanation: 'Chọn lọc thông tin: không phải tất cả chuyên gia đều phản đối. Nhiều người ủng hộ vì lý do ngân sách. Từ "đều" tạo cảm giác đồng thuận giả.' },
    { id: 's3', text: 'cố tình phớt lờ', startIndex: 157, biasType: 'loaded', explanation: '"Cố tình phớt lờ" gán ý đồ xấu mà không có bằng chứng. Có thể chính phủ đã cân nhắc nhưng có lý do khác để duy trì chính sách.' },
    { id: 's4', text: 'những kẻ soạn luật này không hiểu gì', startIndex: 303, biasType: 'ad-hominem', explanation: 'Tấn công cá nhân (ad hominem): thay vì phản bác chính sách, tác giả tấn công năng lực của người soạn luật.' },
  ],
  biasOptions: [
    { id: 'emotional', label: 'Ngôn ngữ cảm xúc' },
    { id: 'cherry-pick', label: 'Chọn lọc thông tin' },
    { id: 'loaded', label: 'Gán ý đồ (Loaded language)' },
    { id: 'ad-hominem', label: 'Tấn công cá nhân' },
    { id: 'false-eq', label: 'Đánh đồng sai' },
    { id: 'strawman', label: 'Bù nhìn rơm' },
  ],
};

const mockPerspectiveSwitch: PerspectiveSwitchBlock = {
  type: 'perspective-switch',
  title: 'Nhà máy dệt đóng cửa',
  event: 'Công ty dệt may ABC với 500 công nhân vừa thông báo đóng cửa nhà máy tại Bình Dương để chuyển sang tự động hóa. Đây là sự kiện gây tranh cãi trong cộng đồng.',
  perspectives: [
    { id: 'worker', role: 'Công nhân', icon: '👷', narrative: 'Tôi đã làm ở đây 12 năm. Tháng tới tôi mất việc, hai con còn đang đi học. Công ty nói sẽ "hỗ trợ chuyển đổi nghề" nhưng ai thuê một người 45 tuổi chỉ biết may vá? Tiền trợ cấp thất nghiệp chỉ đủ 3 tháng.' },
    { id: 'owner', role: 'Giám đốc công ty', icon: '👔', narrative: 'Đây là quyết định khó khăn nhất trong sự nghiệp tôi. Nhưng nếu không tự động hóa, chúng tôi phá sản trong 2 năm — lúc đó 500 người cũng mất việc. Nhà máy tự động cần 50 kỹ sư thay vì 500 công nhân, nhưng năng suất gấp 10 lần.' },
    { id: 'gov', role: 'Chính quyền địa phương', icon: '🏛️', narrative: 'Chúng tôi đang trong thế kẹt. Nếu ngăn cản, công ty sẽ dời sang nước khác — mất luôn thuế và việc làm. Nếu để yên, 500 gia đình mất thu nhập. Chúng tôi đang đàm phán để công ty ưu tiên tuyển lại công nhân cũ.' },
  ],
  question: {
    text: 'Sau khi đọc cả 3 góc nhìn, điều gì khiến vấn đề này khó giải quyết nhất?',
    options: [
      { id: 'a', text: 'Cả 3 bên đều có lý, không ai hoàn toàn sai', isCorrect: true },
      { id: 'b', text: 'Giám đốc chỉ nghĩ đến lợi nhuận', isCorrect: false },
      { id: 'c', text: 'Công nhân không chịu học nghề mới', isCorrect: false },
      { id: 'd', text: 'Chính quyền không quan tâm đến dân', isCorrect: false },
    ],
    explanation: 'Đây là ví dụ điển hình của "vấn đề không có đáp án đúng" trong KHXH. Mỗi bên hành động hợp lý theo hoàn cảnh của mình. Giải pháp tốt cần sự thỏa hiệp từ cả 3 bên.',
  },
};

const mockHotColdGuess: HotColdGuessBlock = {
  type: 'hot-cold-guess',
  title: 'Bạn biết gì về kinh tế Việt Nam?',
  question: 'GDP bình quân đầu người của Việt Nam năm 2023 là bao nhiêu USD?',
  answer: 4284,
  unit: 'USD',
  tolerance: 10,
  hints: [
    'Việt Nam thuộc nhóm thu nhập trung bình thấp.',
    'Cao hơn Lào và Campuchia, nhưng thấp hơn Thái Lan.',
    'Nằm trong khoảng 3,000 - 6,000 USD.',
  ],
  context: 'GDP bình quân đầu người VN năm 2023 đạt khoảng 4,284 USD. Con số này tăng gần 10 lần so với năm 2000 (390 USD). Tuy nhiên, GDP bình quân không phản ánh bất bình đẳng.',
};

// ==========================================

const SECTIONS: { label: string; node: React.ReactNode }[] = [
  { label: 'Calculator (A1)', node: <CalculatorBlockComponent block={mockCalculator} /> },
  { label: 'Slider Simulator (A2)', node: <SliderSimulatorBlockComponent block={mockSliderSimulator} /> },
  { label: 'Budget Allocator (A3)', node: <BudgetAllocatorBlockComponent block={mockBudgetAllocator} /> },
  { label: 'Bias Detector (B1)', node: <BiasDetectorBlockComponent block={mockBiasDetector} /> },
  { label: 'Perspective Switch (B3)', node: <PerspectiveSwitchBlockComponent block={mockPerspectiveSwitch} /> },
  { label: 'Hot / Cold Guess (C1)', node: <HotColdGuessBlockComponent block={mockHotColdGuess} /> },
];

export default function BlockDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/contributor-guide"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Contributor Guide
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Thư viện block tương tác</h1>
        <p className="text-sm text-gray-500 mb-8">
          Các loại block tương tác được hỗ trợ trong trình soạn bài học.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">{s.label}</h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">{s.node}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
