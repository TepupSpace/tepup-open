/**
 * Script để tạo khóa học "Thuế & Quyền Công Dân"
 * Chạy: npx tsx scripts/seed-taxation-course.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Create Prisma client with adapter (required for Prisma 7)
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ===== TYPES =====
interface TextBlock {
  type: 'text';
  title?: string;
  paragraphs: string[];
}

interface CalloutBlock {
  type: 'callout';
  icon?: string;
  title?: string;
  text: string;
  variant?: 'info' | 'warning' | 'success';
}

interface QuestionBlock {
  type: 'question';
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

type ContentBlock = TextBlock | CalloutBlock | QuestionBlock;

// ===== COURSE DATA =====

const CATEGORY_DATA = {
  name: 'Kinh tế & Xã hội',
  slug: 'kinh-te-xa-hoi',
  description: 'Các khóa học về kinh tế, thuế, và quyền công dân',
  icon: 'building-library',
};

const COURSE_DATA = {
  name: 'Thuế & Quyền Công Dân',
  slug: 'thue-va-quyen-cong-dan',
  description:
    'Khóa học giúp người học nhận ra mình là người nộp thuế, hiểu tiền thuế đi đâu, và bắt đầu đòi hỏi minh bạch & trách nhiệm giải trình từ nhà nước.',
  icon: 'banknotes',
  isNew: true,
};

const LEVELS_DATA = [
  { name: 'Nhận diện thực tế (WHAT)', sortOrder: 1 },
  { name: 'Hiểu nguyên lý (WHY)', sortOrder: 2 },
  { name: 'Tác động và Trách nhiệm', sortOrder: 3 },
];

// ===== LESSONS DATA =====

const LESSONS_DATA = {
  // Level 1: Nhận diện thực tế
  level1: [
    {
      name: 'Bạn đang đóng thuế gì',
      slug: 'ban-dang-dong-thue-gi',
      sortOrder: 1,
      content: {
        title: 'Bạn đang đóng thuế gì',
        blocks: [
          {
            type: 'callout',
            variant: 'info',
            text: 'Bạn đang mua một cân thịt giá 250.000 vnđ, bạn đóng thuế 25.000 vnd. Lương của bạn là 7.000.000 vnd, bạn thực nhận 6.000.000 vnd.',
          },
          {
            type: 'text',
            paragraphs: [
              'Bạn không phải là người duy nhất phàn nàn về thuế bởi vì con người đã phải đối mặt với thuế từ rất lâu rồi, từ nền văn minh Lưỡng Hà đến Ai Cập cổ đại. Thuế không phải là phát minh hiện đại mà là một phần không thể thiếu của các xã hội có tổ chức từ hàng ngàn năm trước.',
              'Thuế xuất hiện trong kinh thánh với khái niệm thuế thập phân (nghĩa là nộp một phần mười thu nhập hoặc sản phẩm).',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Oliver Wendell Holmes Jr., Thẩm phán Tối cao tòa án Hoa Kỳ (1927)',
            text: '"Thuế là thứ chúng ta phải trả cho một xã hội văn minh."',
          },
          {
            type: 'text',
            title: 'Vậy Thuế là gì?',
            paragraphs: [
              'Thuế là khoản tiền bắt buộc mà Nhà nước thu từ cá nhân và tổ chức. Khác với việc bạn tự nguyện chi tiêu cho hàng hóa hay dịch vụ, thuế không đi kèm quyền nhận trực tiếp một dịch vụ hay hàng hóa cụ thể từ Nhà nước.',
            ],
          },
          {
            type: 'text',
            title: 'Hai đặc điểm then chốt của thuế:',
            paragraphs: [
              '1. Tính bắt buộc: Nhà nước có quyền lực pháp lý buộc cá nhân, doanh nghiệp phải nộp thuế theo luật.',
              '2. Không gắn với quyền lợi trực tiếp: Khi đóng thuế, bạn không được "mua" một dịch vụ cụ thể; thay vào đó, Nhà nước dùng ngân sách để cung cấp dịch vụ công, phúc lợi, an ninh, hạ tầng… cho cộng đồng.',
            ],
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Checkpoint',
            text: 'Nhận ra tôi đang là người đóng thuế mỗi ngày - dù là qua việc mua hàng (VAT) hay qua lương (TNCN).',
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Phân loại thuế: Trực tiếp và Gián tiếp',
      slug: 'phan-loai-thue',
      sortOrder: 2,
      content: {
        title: 'Phân loại thuế: Trực tiếp và Gián tiếp',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Có thể có nhiều loại thuế với nhiều tên khác nhau. Nhưng nếu phân loại một cách đơn giản theo các nhà kinh tế học thì có 2 loại chính là thuế thu gián tiếp và thuế thu trực tiếp.',
            ],
          },
          {
            type: 'text',
            title: 'Thuế trực tiếp (Direct taxes)',
            paragraphs: [
              'Đánh trực tiếp lên thu nhập, lợi nhuận, tài sản và được trả trực tiếp bởi cá nhân hoặc tổ chức.',
              '• Thuế thu nhập cá nhân (TNCN)',
              '• Thuế thu nhập doanh nghiệp (CIT)',
              '• Thuế tài sản, đất đai (thuế sử dụng đất phi nông nghiệp)',
              '• Thuế thừa kế, quà tặng (Inheritance/Gift tax) – hiện chưa áp dụng rộng nhưng có trong luật',
            ],
          },
          {
            type: 'text',
            title: 'Thuế gián thu (Indirect taxes)',
            paragraphs: [
              'Đánh vào giá trị hàng hóa, dịch vụ, tiêu dùng và được thu bởi người bán hàng hoặc nhà sản xuất nhưng thực sự do người tiêu dùng chi trả.',
              '• Thuế giá trị gia tăng (VAT)',
              '• Thuế tiêu thụ đặc biệt',
              '• Thuế xuất nhập khẩu (Import/Export duties)',
              '• Thuế môi trường (Environmental tax, carbon, xăng dầu, nước thải…)',
            ],
          },
          {
            type: 'text',
            title: 'Phân loại theo tác động',
            paragraphs: [
              'Thuế thoái lui: Đánh cùng một mức cho tất cả mọi người nhưng ảnh hưởng nặng nề hơn đến người có thu nhập thấp (ví dụ: thuế bán hàng trên các mặt hàng thiết yếu, phí giấy phép lái xe).',
              'Thuế lũy tiến: Đánh thuế người có thu nhập cao hơn ở mức cao hơn. Các khoản thu nhập được chia thành các bậc thuế khác nhau, và chỉ phần thu nhập trong bậc đó mới bị đánh thuế ở mức cao hơn.',
              'Thuế tỷ lệ (flat tax): Yêu cầu cùng một tỷ lệ phần trăm thu nhập cho tất cả người nộp thuế, bất kể họ kiếm được bao nhiêu.',
            ],
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Ai thực sự đóng thuế',
      slug: 'ai-thuc-su-dong-thue',
      sortOrder: 3,
      content: {
        title: 'Ai thực sự đóng thuế',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Về mặt pháp lý, người nộp thuế là các cá nhân và tổ chức có nghĩa vụ kê khai và chuyển tiền thuế cho nhà nước. Tuy nhiên còn một khái niệm quan trọng khác trong kinh tế học là người chịu gánh nặng thuế về kinh tế.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Gánh nặng thuế là gì?',
            text: 'Gánh nặng thuế là việc ai là người cuối cùng bị mất tiền, bởi vì họ là người có ít sự lựa chọn nhất và không có "lối thoát" để đẩy chi phí đó cho người khác.',
          },
          {
            type: 'text',
            title: 'Đối với hàng hóa thiết yếu',
            paragraphs: [
              'Người tiêu dùng là người chịu gánh nặng thuế. Ví dụ chính phủ áp thêm thuế môi trường 1.000 đồng/lít xăng. Các trạm xăng sẽ ngay lập tức tăng giá bán thêm đúng 1.000 đồng. Người tiêu dùng dù phàn nàn nhưng vẫn phải đổ xăng để đi làm, đi học.',
            ],
          },
          {
            type: 'text',
            title: 'Đối với hàng hóa xa xỉ',
            paragraphs: [
              'Nhà sản xuất và người lao động là người chịu gánh nặng thuế. Một loại thuế mới 10% được đánh vào túi xách hàng hiệu. Nếu thương hiệu tăng giá từ 100 triệu lên 110 triệu đồng, khách hàng có thể quyết định không mua nữa. Để bán được hàng, thương hiệu này buộc phải chấp nhận giảm lợi nhuận.',
            ],
          },
          {
            type: 'text',
            title: 'Đối với thuế doanh nghiệp',
            paragraphs: [
              'Đây là một trong những loại thuế phức tạp nhất. Gánh nặng này không chỉ rơi vào vai các chủ sở hữu mà được san sẻ một cách vô hình cho cả người tiêu dùng và người lao động.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Khoản thuế doanh nghiệp giống như một tảng đá ném xuống mặt hồ, tạo ra những con sóng lan tỏa ảnh hưởng đến tất cả mọi người - từ khách hàng mua sản phẩm, nhân viên làm việc cho công ty, cho đến các nhà đầu tư.',
          },
          {
            type: 'text',
            title: 'Quy tắc vàng',
            paragraphs: [
              '• Bên nào linh hoạt hơn, có nhiều lựa chọn thay thế hơn → Bên đó sẽ né được thuế.',
              '• Bên nào bị phụ thuộc hơn, có ít lựa chọn thay thế hơn → Bên đó sẽ phải chịu thuế.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Vì vậy, khi nghe thấy một thay đổi trong chính sách về thuế, đừng có ngay lập tức nghĩ rằng mình không bị ảnh hưởng.',
          },
        ] as ContentBlock[],
      },
    },
  ],

  // Level 2: Hiểu nguyên lý
  level2: [
    {
      name: 'Tại sao bạn lại đóng thuế',
      slug: 'tai-sao-ban-dong-thue',
      sortOrder: 1,
      content: {
        title: 'Tại sao bạn lại đóng thuế',
        blocks: [
          {
            type: 'callout',
            variant: 'info',
            text: 'Bạn đóng thuế để đổi lại sự an toàn và các dịch vụ công cần thiết mà tự cá nhân hay các bên tư nhân không thể thực hiện.',
          },
          {
            type: 'text',
            title: 'Tại sao chính phủ thu thuế',
            paragraphs: [
              'Chính phủ thu thuế để có tiền thực hiện các chức năng của mình bao gồm:',
              '• Đảm bảo an ninh và trật tự xã hội',
              '• Cung cấp dịch vụ công cộng (giáo dục, y tế, hạ tầng)',
              '• Bảo vệ môi trường và định hướng tiêu dùng, sản xuất',
              '• Giảm bất bình đẳng và hỗ trợ người yếu thế',
            ],
          },
          {
            type: 'text',
            title: 'Mục đích của thuế',
            paragraphs: [
              'Mục tiêu của thuế là tạo nguồn tài chính để Nhà nước duy trì sự tồn tại và thực hiện chức năng của mình. Thuế cung cấp ngân sách cho quân đội, công an, tòa án, hạ tầng giao thông, trường học, bệnh viện và các dịch vụ công.',
              'Ngoài việc chi tiêu, thuế còn là công cụ điều tiết kinh tế và phân phối lại thu nhập, giúp duy trì an ninh, tạo công bằng trong xã hội.',
              'Thuế cũng giúp điều chỉnh hành vi của con người thông qua việc đánh thuế những sản phẩm không tốt cho sức khỏe như thuốc lá, rượu bia, hoặc khuyến khích lái xe cá nhân ít đi thông qua thuế xăng.',
            ],
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Checkpoint',
            text: 'Bắt đầu nhận ra tiền thuế mình đóng thực chất là của mình, và sẽ được tiêu để dành cho lợi ích của mình hoặc xã hội mình sinh sống.',
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Khế ước xã hội',
      slug: 'khe-uoc-xa-hoi',
      sortOrder: 2,
      content: {
        title: 'Khế ước xã hội',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Thuế không chỉ là nghĩa vụ tài chính, mà còn là một phần của mối quan hệ niềm tin giữa người dân và chính quyền, bắt nguồn từ một khế ước ngầm hiểu – khế ước xã hội.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Oliver Wendell Holmes Jr.',
            text: '"Việc đóng thuế không chỉ là một nghĩa vụ bắt buộc mà còn là một sự đánh đổi có ý thức. Chúng ta từ bỏ một phần tài sản cá nhân để đổi lấy những lợi ích mà chỉ một xã hội có tổ chức mới có thể cung cấp."',
          },
          {
            type: 'text',
            title: 'Những lợi ích từ khế ước xã hội',
            paragraphs: [
              '• An ninh (quân đội, cảnh sát)',
              '• Công lý (tòa án)',
              '• Cơ sở hạ tầng (đường sá, cầu cống)',
              '• Các dịch vụ công cộng khác (giáo dục, y tế)',
              'Nếu không có thuế, chúng ta sẽ không thể có được những nền tảng này cho một xã hội ổn định và phát triển.',
            ],
          },
          {
            type: 'text',
            title: 'Trách nhiệm hai chiều',
            paragraphs: [
              'Ngược lại, nhà nước có trách nhiệm sử dụng quyền lực và nguồn thu đó để bảo vệ quyền con người, duy trì trật tự và phục vụ lợi ích chung.',
            ],
          },
          {
            type: 'callout',
            variant: 'success',
            text: 'Thuế vì thế tạo nên mối liên hệ trực tiếp và bình đẳng giữa người dân và nhà nước: "mình đóng tiền, mình có quyền đòi hỏi và giám sát."',
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Mục đích của thuế',
      slug: 'muc-dich-cua-thue',
      sortOrder: 3,
      content: {
        title: 'Mục đích của thuế',
        blocks: [
          {
            type: 'text',
            title: 'Chính quyền lấy tiền từ đâu',
            paragraphs: [
              'Chính quyền lấy tiền từ các nguồn sau:',
              '• Nguồn lớn nhất và ổn định nhất: Thuế',
              '• Phí và lệ phí (phí làm hộ chiếu, cấp giấy phép, phí cầu đường…)',
              '• Doanh thu từ tài sản nhà nước (dầu mỏ, khoáng sản, thuê/bán đất công, doanh nghiệp nhà nước)',
              '• Vay nợ',
              '• Nhận viện trợ',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Fun Fact',
            text: 'Nếu nhà nước phụ thuộc vào thuế thì thường có xu hướng minh bạch hơn so với phụ thuộc vào tài nguyên hay viện trợ.',
          },
          {
            type: 'text',
            title: 'Vai trò điều tiết kinh tế',
            paragraphs: [
              'Thuế là nền tảng của một quốc gia, là công cụ để duy trì nhà nước, duy trì ổn định chính trị vì thuế là tiền dùng cho quân đội, công an, tòa án, đường xá, trường học công.',
              'Thuế thể hiện quan hệ quyền lực và gắn kết xã hội: Người dân nộp thuế để đổi lại các dịch vụ công và sự bảo đảm an ninh từ chính quyền.',
            ],
          },
          {
            type: 'text',
            title: 'Tác động của loại thuế khác nhau',
            paragraphs: [
              'Nếu phần lớn nguồn thu của nhà nước từ thuế gián thu thì ít áp lực từ người dân. Lý do công dân ít có cảm giác "mình đang nộp thuế" nên quyền lực đòi minh bạch, trách nhiệm giải trình yếu hơn.',
              'Nếu phần lớn nguồn thu của nhà nước từ thuế trực tiếp từ công dân thì cử tri đòi hỏi minh bạch, trách nhiệm giải trình.',
            ],
          },
        ] as ContentBlock[],
      },
    },
  ],

  // Level 3: Tác động và Trách nhiệm
  level3: [
    {
      name: 'Thu và chi tiêu thuế',
      slug: 'thu-va-chi-tieu-thue',
      sortOrder: 1,
      content: {
        title: 'Thu và chi tiêu thuế',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Tiền thuế được nộp vào quỹ chung của nhà nước - ngân sách nhà nước. Việc thu chi cần đảm bảo minh bạch, đúng mục đích, và hiệu quả.',
            ],
          },
          {
            type: 'text',
            title: 'Ngân sách nhà nước được chi tiêu cho gì?',
            paragraphs: [
              '• Quốc phòng và an ninh',
              '• Giáo dục và đào tạo',
              '• Y tế và chăm sóc sức khỏe',
              '• Hạ tầng giao thông',
              '• Phúc lợi xã hội',
              '• Trả nợ công',
            ],
          },
          {
            type: 'text',
            title: 'Cân đối thu - chi',
            paragraphs: [
              'Trên lý thuyết, ngân sách cần được cân đối để phục vụ mục tiêu chung của xã hội. Thu phải đủ để chi, và chi phải đúng mục đích, hiệu quả.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Câu hỏi đặt ra',
            text: 'Tiền thuế mình đóng sẽ thực sự đi đâu? Có thực sự được tiêu để phục vụ lợi ích xã hội hay không?',
          },
          {
            type: 'text',
            title: 'Thuế phản ánh ưu tiên chính sách',
            paragraphs: [
              'Cách đánh thuế và chi tiêu ngân sách phản ánh ưu tiên của chính phủ. Ví dụ: Giảm thuế xe điện để khuyến khích bảo vệ môi trường, tăng thuế thuốc lá để hạn chế hút thuốc.',
            ],
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Thuế và minh bạch',
      slug: 'thue-va-minh-bach',
      sortOrder: 2,
      content: {
        title: 'Thuế và minh bạch',
        blocks: [
          {
            type: 'text',
            title: 'Tại sao cần minh bạch',
            paragraphs: [
              'Thiếu minh bạch từ cấp quản lý có nghĩa người dân không biết hoặc không kiểm sát được cách thu, kiểm tra, áp thuế, sử dụng. Hệ quả làm xói mòn lòng tin, phát sinh tình trạng sử dụng thuế làm thất thoát ngân sách công.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Khi người nộp thuế không nhận được thông tin rõ ràng và trách nhiệm giải trình của chính phủ yếu kém, điều này sẽ gây ra sự mất lòng tin và làm gia tăng mong muốn trốn thuế.',
          },
          {
            type: 'text',
            title: '1. Xây dựng lòng tin xã hội',
            paragraphs: [
              'Minh bạch hóa luật pháp và quy trình thuế giúp người dân hiểu rõ quyền và nghĩa vụ của mình. Khi chính phủ công khai nguồn thu và cách chi tiêu tiền thuế, người dân sẽ thấy tiền của họ được sử dụng hiệu quả, tạo ra niềm tin vào hệ thống.',
            ],
          },
          {
            type: 'text',
            title: '2. Đảm bảo trách nhiệm giải trình và chống tham nhũng',
            paragraphs: [
              'Minh bạch là công cụ kiểm soát quyền lực hiệu quả nhất. Bằng cách công khai các quyết định quản lý, chính phủ tự đặt mình dưới sự giám sát của công chúng.',
            ],
          },
          {
            type: 'text',
            title: '3. Củng cố công bằng xã hội',
            paragraphs: [
              'Minh bạch đảm bảo công bằng theo chiều ngang, nghĩa là mọi cá nhân và doanh nghiệp có điều kiện kinh tế tương đương đều phải nộp thuế như nhau.',
            ],
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Làm sao để có minh bạch',
      slug: 'lam-sao-de-co-minh-bach',
      sortOrder: 3,
      content: {
        title: 'Làm sao để có minh bạch',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Minh bạch trong hoạt động thuế, đặc biệt ở cấp quản lý thuế, là chìa khóa để xây dựng niềm tin xã hội, nâng cao hiệu quả quản lý nhà nước, và đảm bảo công bằng trong phân phối nguồn lực.',
            ],
          },
          {
            type: 'text',
            title: '1. Luật pháp và quy trình',
            paragraphs: [
              'Công khai các văn bản luật thuế, nghị định, thông tư; công bố rõ ràng các quy trình kê khai, nộp thuế, hoàn thuế, và khiếu nại. Đảm bảo người nộp thuế biết rõ mình cần làm gì, bao nhiêu, và tại sao.',
            ],
          },
          {
            type: 'text',
            title: '2. Quản lý và thực thi',
            paragraphs: [
              'Công khai các tiêu chí kiểm tra, thanh tra thuế; công bố các quyết định miễn giảm, ưu đãi, hay xử phạt. Giúp ngăn chặn tham nhũng và hành vi tùy tiện của cán bộ chuyên trách về thuế.',
            ],
          },
          {
            type: 'text',
            title: '3. Ngân sách và chi tiêu',
            paragraphs: [
              'Chính phủ công khai chi tiết nguồn thu từ các loại thuế và cách phân bổ, chi tiêu nguồn thu đó cho các lĩnh vực công (giáo dục, y tế, quốc phòng, hạ tầng).',
            ],
          },
          {
            type: 'callout',
            variant: 'success',
            text: 'Khi người dân thấy chính phủ minh bạch, có trách nhiệm, và sử dụng tiền thuế hiệu quả, họ có xu hướng tin tưởng hơn và tự nguyện tuân thủ.',
          },
          {
            type: 'text',
            title: 'Các giải pháp cụ thể',
            paragraphs: [
              '1. Cung cấp thông tin và kênh cung cấp thông tin thuận tiện truy cập đối với người nộp thuế',
              '2. Cung cấp các diễn đàn có sự tham gia của người dân để giải quyết các vấn đề cấp địa phương',
              '3. Cải cách thể chế thể hiện rõ quy mô tài khóa của chính phủ',
            ],
          },
        ] as ContentBlock[],
      },
    },
    {
      name: 'Tại sao đang không minh bạch được',
      slug: 'tai-sao-khong-minh-bach',
      sortOrder: 4,
      content: {
        title: 'Tại sao đang không minh bạch được',
        blocks: [
          {
            type: 'text',
            title: 'Lý do 1: Bản chất của hệ thống thuế',
            paragraphs: [
              'Ưu tiên Thuế Gián thu: Nhiều quốc gia phụ thuộc nhiều vào thuế gián thu (như VAT) hơn là thuế trực tiếp. Thuế gián thu được ẩn trong giá sản phẩm, khiến người tiêu dùng không thấy rõ ràng mình đã đóng bao nhiêu. Sự "vô hình" này làm giảm áp lực chính trị từ người dân.',
              'Độ phức tạp của Luật thuế: Luật thuế thường phức tạp, thay đổi thường xuyên. Sự phức tạp này tạo ra "vùng xám" và gây khó khăn cho cả người nộp thuế lẫn người thực thi, tạo điều kiện cho tham nhũng.',
            ],
          },
          {
            type: 'text',
            title: 'Lý do 2: Thách thức từ Quản lý Thuế',
            paragraphs: [
              'Tham nhũng và Lợi ích nhóm: Đây là rào cản lớn nhất. Khi cán bộ quản lý thuế có thể thao túng quy trình, việc giữ bí mật về các quyết định trở thành lợi thế cá nhân. Việc công khai các quyết định ưu đãi thuế sẽ làm lộ ra các hành vi thiên vị hoặc tham nhũng.',
              'Năng lực công nghệ và nhân sự yếu kém: Thiếu hệ thống công nghệ thông tin hiện đại để tự động hóa, chuẩn hóa và công khai dữ liệu cũng cản trở minh bạch.',
            ],
          },
          {
            type: 'text',
            title: 'Lý do 3: Động lực Chính trị và Xã hội',
            paragraphs: [
              'Resource Curse (Lời nguyền Tài nguyên): Nếu ngân sách nhà nước phụ thuộc chủ yếu vào nguồn thu từ tài nguyên thiên nhiên hoặc viện trợ nước ngoài, chính phủ sẽ có ít động lực để minh bạch hóa việc sử dụng ngân sách.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Vòng luẩn quẩn trốn thuế',
            text: '(1) Chính phủ thiếu minh bạch → (2) Người dân mất niềm tin → (3) Người dân tăng trốn thuế → (4) Chính phủ có ít nguồn lực hơn và càng ít động lực để minh bạch.',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Sự tham gia của người dân và các tổ chức xã hội dân sự là yếu tố then chốt để thúc đẩy minh bạch. Tuy nhiên, ở nhiều nơi, khả năng tiếp cận thông tin ngân sách và không gian để giám sát độc lập vẫn còn hạn chế.',
          },
        ] as ContentBlock[],
      },
    },
  ],
};

// ===== MAIN FUNCTION =====

async function main() {
  console.log('🚀 Bắt đầu tạo khóa học "Thuế & Quyền Công Dân"...\n');

  try {
    // Step 1: Create or find Category
    console.log('📁 Bước 1: Tạo Category...');
    let category = await prisma.category.findUnique({
      where: { slug: CATEGORY_DATA.slug },
    });

    if (!category) {
      const maxSortOrder = await prisma.category.aggregate({
        _max: { sortOrder: true },
      });

      category = await prisma.category.create({
        data: {
          ...CATEGORY_DATA,
          sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        },
      });
      console.log(`   ✅ Đã tạo category: ${category.name} (${category.id})`);
    } else {
      console.log(`   ℹ️  Category đã tồn tại: ${category.name} (${category.id})`);
    }

    // Step 2: Create Course
    console.log('\n📚 Bước 2: Tạo Course...');
    let course = await prisma.course.findUnique({
      where: { slug: COURSE_DATA.slug },
    });

    if (course) {
      console.log(`   ⚠️  Course đã tồn tại: ${course.name} (${course.id})`);
      console.log('   🗑️  Đang xóa course cũ để tạo lại...');

      // Delete old course (cascade will delete levels, lessons, content)
      await prisma.course.delete({
        where: { id: course.id },
      });
      console.log('   ✅ Đã xóa course cũ');
    }

    const maxCourseSortOrder = await prisma.course.aggregate({
      where: { categoryId: category.id },
      _max: { sortOrder: true },
    });

    course = await prisma.course.create({
      data: {
        ...COURSE_DATA,
        categoryId: category.id,
        sortOrder: (maxCourseSortOrder._max.sortOrder || 0) + 1,
      },
    });
    console.log(`   ✅ Đã tạo course: ${course.name} (${course.id})`);

    // Step 3: Create Levels
    console.log('\n📊 Bước 3: Tạo Levels...');
    const createdLevels: { id: string; name: string; sortOrder: number; courseId: string }[] = [];

    for (const levelData of LEVELS_DATA) {
      const level = await prisma.level.create({
        data: {
          name: levelData.name,
          courseId: course.id,
          sortOrder: levelData.sortOrder,
        },
      });
      createdLevels.push(level);
      console.log(`   ✅ Level ${levelData.sortOrder}: ${level.name}`);
    }

    // Step 4: Create Lessons with Content
    console.log('\n📝 Bước 4: Tạo Lessons và Content...');

    const levelLessonsMap: { [key: string]: typeof LESSONS_DATA.level1 } = {
      level1: LESSONS_DATA.level1,
      level2: LESSONS_DATA.level2,
      level3: LESSONS_DATA.level3,
    };

    let totalLessons = 0;

    for (let i = 0; i < createdLevels.length; i++) {
      const level = createdLevels[i];
      const levelKey = `level${i + 1}` as keyof typeof levelLessonsMap;
      const lessons = levelLessonsMap[levelKey];

      console.log(`\n   Level ${i + 1}: ${level.name}`);

      for (const lessonData of lessons) {
        // Create lesson
        const lesson = await prisma.lesson.create({
          data: {
            name: lessonData.name,
            slug: lessonData.slug,
            levelId: level.id,
            courseId: level.courseId,
            sortOrder: lessonData.sortOrder,
            isActive: true,
          },
        });

        // Create lesson content
        await prisma.lessonContent.create({
          data: {
            lessonId: lesson.id,
            title: lessonData.content.title,
            blocks: lessonData.content.blocks as unknown as Prisma.InputJsonValue,
          },
        });

        totalLessons++;
        console.log(`      ✅ Lesson ${lessonData.sortOrder}: ${lesson.name}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 HOÀN THÀNH!');
    console.log('='.repeat(50));
    console.log(`\n📊 Tổng kết:`);
    console.log(`   - Category: ${category.name}`);
    console.log(`   - Course: ${course.name}`);
    console.log(`   - Levels: ${createdLevels.length}`);
    console.log(`   - Lessons: ${totalLessons}`);
    console.log(`\n🔗 Truy cập:`);
    console.log(`   - Admin: /admin/courses`);
    console.log(`   - Frontend: /courses/${course.slug}`);
    console.log(`   - Quản lý levels: /admin/courses/${course.id}/levels`);
  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
