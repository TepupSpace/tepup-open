import { allStoryContents } from './story-contents';

export interface Lesson {
  id: string;
  name: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Level {
  id: string;
  name: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  name: string;
  description: string;
  icon: string;
  lessonsCount: number;
  exercisesCount: number;
  isNew: boolean;
  levels: Level[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  courses: Course[];
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: 'multiple-choice' | 'visual-select';
  title: string;
  instruction: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  visualData?: {
    question: string;
    correctAnswer: string;
  };
}

// New: Content blocks for progressive lesson content
export interface TextBlock {
  type: 'text';
  title?: string;
  paragraphs: string[];
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface CalloutBlock {
  type: 'callout';
  icon?: string;
  title?: string;
  text: string;
  variant?: 'info' | 'warning' | 'success';
}

export interface QuestionBlock {
  type: 'question';
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

export interface LibraryDocumentBlock {
  type: 'library-document';
  mode?: 'reference' | 'inline';
  documentId?: string;
  documentSlug?: string;
  title?: string;
  description?: string;
  category?: string;
  estimatedReadTime?: string;
  documentContent?: {
    sections: { heading?: string; paragraphs: string[] }[];
    relatedConcepts?: string[];
    furtherReading?: string[];
  };
}

export type ContentBlock = TextBlock | ImageBlock | CalloutBlock | QuestionBlock | LibraryDocumentBlock;

export interface LessonContent {
  lessonId: string;
  title: string;
  blocks: ContentBlock[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  stories: string[]; // story slugs
}

export interface Chapter {
  id: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface StoryPart {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Story {
  slug: string;
  characterId: string;
  title: string;
  teaser: string;
  icon: string;
  estimatedTime: string;
  chaptersCount: number;
  parts: StoryPart[];
  relatedCourses: string[]; // course slugs
}

export const characters: Character[] = [
  {
    id: 'student',
    name: 'Minh',
    role: 'Sinh viên năm 3',
    description: 'Sắp ra trường, muốn hiểu về thuế và tài chính cá nhân trước khi đi làm',
    icon: 'graduation-cap',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    stories: ['minh-thue', 'minh-kinh-te'],
  },
  {
    id: 'office-worker',
    name: 'Hương',
    role: 'Nhân viên kế toán',
    description: 'Lương 15 triệu/tháng, muốn tối ưu thuế và bắt đầu đầu tư',
    icon: 'briefcase',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    stories: ['huong-thue', 'huong-dau-tu'],
  },
  {
    id: 'street-vendor',
    name: 'Bác Tư',
    role: 'Chủ xe bánh mì',
    description: 'Bán bánh mì 10 năm, muốn hiểu nghĩa vụ thuế và mở rộng kinh doanh',
    icon: 'store',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stories: ['bactu-thue', 'bactu-kinhdoanh'],
  },
  {
    id: 'gig-driver',
    name: 'Đức',
    role: 'Tài xế công nghệ',
    description: 'Chạy xe ôm công nghệ 12 tiếng mỗi ngày, muốn hiểu quyền lợi lao động và bảo hiểm xã hội',
    icon: 'bike',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    stories: ['duc-canhlao'],
  },
];

// Stories data
export const stories: Story[] = [
  // Minh's stories
  {
    slug: 'minh-thue',
    characterId: 'student',
    title: 'Câu chuyện về Thuế',
    teaser: 'Minh vừa nhận lương đầu tiên 8 triệu/tháng. Bạn bè bảo phải đóng thuế nhưng Minh không biết bắt đầu từ đâu...',
    icon: 'receipt',
    estimatedTime: '~20 phút',
    chaptersCount: 4,
    parts: [
      {
        id: 'part-1',
        name: 'Lương đầu tiên',
        chapters: [
          { id: 'minh-thue-1', title: 'Ngày nhận lương', isCompleted: false, isLocked: false },
          { id: 'minh-thue-2', title: 'Thuế là gì nhỉ?', isCompleted: false, isLocked: true },
          { id: 'minh-thue-3', title: 'Tính thuế như thế nào?', isCompleted: false, isLocked: true },
          { id: 'minh-thue-4', title: 'Kê khai lần đầu', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['thue-ca-nhan'],
  },
  {
    slug: 'minh-kinh-te',
    characterId: 'student',
    title: 'Câu chuyện về Kinh tế',
    teaser: 'Minh thắc mắc tại sao giá xăng lên xuống, tại sao đồng đô la mạnh hơn tiền Việt...',
    icon: 'trending-up',
    estimatedTime: '~25 phút',
    chaptersCount: 3,
    parts: [
      {
        id: 'part-1',
        name: 'Hiểu về giá cả',
        chapters: [
          { id: 'minh-kt-1', title: 'Tại sao giá xăng tăng?', isCompleted: false, isLocked: false },
          { id: 'minh-kt-2', title: 'Cung và cầu', isCompleted: false, isLocked: true },
          { id: 'minh-kt-3', title: 'Lạm phát là gì?', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['kinh-te-vi-mo'],
  },
  // Hương's stories
  {
    slug: 'huong-thue',
    characterId: 'office-worker',
    title: 'Câu chuyện về Thuế',
    teaser: 'Hương lương 15 triệu nhưng thực nhận chỉ 13 triệu. Cô muốn hiểu tiền đi đâu và làm sao để tối ưu...',
    icon: 'receipt',
    estimatedTime: '~25 phút',
    chaptersCount: 4,
    parts: [
      {
        id: 'part-1',
        name: 'Tiền lương đi đâu?',
        chapters: [
          { id: 'huong-thue-1', title: 'Bảng lương của Hương', isCompleted: false, isLocked: false },
          { id: 'huong-thue-2', title: 'Các khoản khấu trừ', isCompleted: false, isLocked: true },
          { id: 'huong-thue-3', title: 'Giảm trừ gia cảnh', isCompleted: false, isLocked: true },
          { id: 'huong-thue-4', title: 'Quyết toán cuối năm', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['thue-ca-nhan', 'thue-doanh-nghiep'],
  },
  {
    slug: 'huong-dau-tu',
    characterId: 'office-worker',
    title: 'Câu chuyện về Đầu tư',
    teaser: 'Hương có 50 triệu tiết kiệm và muốn sinh lời. Gửi ngân hàng hay đầu tư chứng khoán?',
    icon: 'piggy-bank',
    estimatedTime: '~30 phút',
    chaptersCount: 5,
    parts: [
      {
        id: 'part-1',
        name: 'Bắt đầu đầu tư',
        chapters: [
          { id: 'huong-dt-1', title: '50 triệu để làm gì?', isCompleted: false, isLocked: false },
          { id: 'huong-dt-2', title: 'Các kênh đầu tư', isCompleted: false, isLocked: true },
          { id: 'huong-dt-3', title: 'Rủi ro và lợi nhuận', isCompleted: false, isLocked: true },
          { id: 'huong-dt-4', title: 'Mua cổ phiếu đầu tiên', isCompleted: false, isLocked: true },
          { id: 'huong-dt-5', title: 'Theo dõi danh mục', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['tu-tuong-kinh-te', 'kinh-te-vi-mo'],
  },
  // Bác Tư's stories
  {
    slug: 'bactu-thue',
    characterId: 'street-vendor',
    title: 'Câu chuyện về Thuế',
    teaser: 'Bác Tư bán bánh mì thu 5 triệu/ngày. Có cần đóng thuế không? Đóng bao nhiêu?',
    icon: 'receipt',
    estimatedTime: '~20 phút',
    chaptersCount: 3,
    parts: [
      {
        id: 'part-1',
        name: 'Thuế hộ kinh doanh',
        chapters: [
          { id: 'bactu-thue-1', title: 'Doanh thu hàng ngày', isCompleted: false, isLocked: false },
          { id: 'bactu-thue-2', title: 'Thuế khoán là gì?', isCompleted: false, isLocked: true },
          { id: 'bactu-thue-3', title: 'Đăng ký kinh doanh', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['thue-ca-nhan', 'thue-doanh-nghiep'],
  },
  {
    slug: 'bactu-kinhdoanh',
    characterId: 'street-vendor',
    title: 'Câu chuyện về Mở rộng',
    teaser: 'Bác Tư muốn mở thêm 2 xe bánh mì nữa. Cần chuẩn bị gì? Vốn bao nhiêu?',
    icon: 'store',
    estimatedTime: '~25 phút',
    chaptersCount: 4,
    parts: [
      {
        id: 'part-1',
        name: 'Kế hoạch mở rộng',
        chapters: [
          { id: 'bactu-kd-1', title: 'Ước mơ 3 xe bánh mì', isCompleted: false, isLocked: false },
          { id: 'bactu-kd-2', title: 'Tính toán chi phí', isCompleted: false, isLocked: true },
          { id: 'bactu-kd-3', title: 'Tìm vị trí mới', isCompleted: false, isLocked: true },
          { id: 'bactu-kd-4', title: 'Thuê người phụ', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['thue-doanh-nghiep', 'kinh-te-vi-mo'],
  },
  // Đức's story
  {
    slug: 'duc-canhlao',
    characterId: 'gig-driver',
    title: 'Câu chuyện về Lao động Số',
    teaser: 'Đức chạy xe 12 tiếng mỗi ngày, kiếm 300k nhưng app giữ 25%. Anh tự hỏi: mình là người lao động hay đối tác?',
    icon: 'smartphone',
    estimatedTime: '~45 phút',
    chaptersCount: 7,
    parts: [
      {
        id: 'part-1',
        name: 'Cần lao thời đại số',
        chapters: [
          { id: 'duc-cl-1', title: 'Một ngày của tài xế công nghệ', isCompleted: false, isLocked: false },
          { id: 'duc-cl-2', title: 'Nền kinh tế Gig là gì?', isCompleted: false, isLocked: true },
          { id: 'duc-cl-3', title: 'Khi thuật toán làm sếp', isCompleted: false, isLocked: true },
          { id: 'duc-cl-4', title: 'Tầng lớp lao động mới', isCompleted: false, isLocked: true },
        ],
      },
      {
        id: 'part-2',
        name: 'Vùng xám pháp lý',
        chapters: [
          { id: 'duc-tt-1', title: 'Tai nạn lúc giao hàng', isCompleted: false, isLocked: true },
          { id: 'duc-tt-2', title: 'Đối tác hay Nhân viên?', isCompleted: false, isLocked: true },
          { id: 'duc-tt-3', title: 'Quyền lợi bị đánh cắp', isCompleted: false, isLocked: true },
        ],
      },
    ],
    relatedCourses: ['tu-tuong-kinh-te', 'kinh-te-vi-mo', 'ly-thuyet-nha-nuoc'],
  },
];

export const categories: Category[] = [
  {
    id: 'foundations',
    name: 'Nền tảng Khoa học Xã hội',
    description: 'Xây dựng tư duy phản biện và logic căn bản',
    icon: 'brain',
    courses: [
      {
        slug: 'tu-duy-phan-bien',
        name: 'Tư duy Phản biện',
        description: 'Học cách phân tích, đánh giá và đưa ra lập luận logic',
        icon: 'lightbulb',
        lessonsCount: 32,
        exercisesCount: 248,
        isNew: false,
        levels: [
          {
            id: 'level-1',
            name: 'Nhận diện Lập luận',
            lessons: [
              { id: 'lesson-1', name: 'Lập luận là gì?', isCompleted: false, isLocked: false },
              { id: 'lesson-2', name: 'Tiền đề và Kết luận', isCompleted: false, isLocked: true },
              { id: 'lesson-3', name: 'Ngụy biện Logic', isCompleted: false, isLocked: true },
              { id: 'lesson-4', name: 'Bằng chứng và Suy luận', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'logic-co-ban',
        name: 'Logic Cơ bản',
        description: 'Nền tảng logic hình thức và suy luận',
        icon: 'binary',
        lessonsCount: 28,
        exercisesCount: 196,
        isNew: true,
        levels: [
          {
            id: 'level-1',
            name: 'Mệnh đề Logic',
            lessons: [
              { id: 'logic-1', name: 'Mệnh đề đúng sai', isCompleted: false, isLocked: false },
              { id: 'logic-2', name: 'Phép AND và OR', isCompleted: false, isLocked: true },
              { id: 'logic-3', name: 'Phép phủ định', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'economics',
    name: 'Kinh tế & Thuế',
    description: 'Hiểu rõ cách vận hành kinh tế và hệ thống thuế',
    icon: 'trending-up',
    courses: [
      {
        slug: 'thue-ca-nhan',
        name: 'Thuế Thu nhập Cá nhân',
        description: 'Học cách tính và kê khai thuế TNCN đúng quy định',
        icon: 'receipt',
        lessonsCount: 24,
        exercisesCount: 156,
        isNew: true,
        levels: [
          {
            id: 'level-1',
            name: 'Khái niệm Cơ bản',
            lessons: [
              { id: 'thue-1', name: 'Thu nhập chịu thuế', isCompleted: false, isLocked: false },
              { id: 'thue-2', name: 'Các mức thuế suất', isCompleted: false, isLocked: true },
              { id: 'thue-3', name: 'Giảm trừ gia cảnh', isCompleted: false, isLocked: true },
              { id: 'thue-4', name: 'Quyết toán thuế', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'thue-doanh-nghiep',
        name: 'Thuế Doanh nghiệp',
        description: 'Hiểu về thuế TNDN, VAT và các nghĩa vụ thuế',
        icon: 'building',
        lessonsCount: 36,
        exercisesCount: 220,
        isNew: true,
        levels: [
          {
            id: 'level-1',
            name: 'Thuế GTGT',
            lessons: [
              { id: 'dn-1', name: 'VAT là gì?', isCompleted: false, isLocked: false },
              { id: 'dn-2', name: 'Thuế đầu vào, đầu ra', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'thue-101',
        name: 'Thuế 101 - Thuế & Quyền Công Dân',
        description: 'Hiểu thuế là gì, ai đóng, tại sao phải đóng, và trách nhiệm của công dân',
        icon: 'shield',
        lessonsCount: 12,
        exercisesCount: 0,
        isNew: true,
        levels: [
          {
            id: 'thue101-level-1',
            name: 'Thuế ơi thuế à (WHAT)',
            lessons: [
              { id: 'thue101-1', name: 'Bạn đang đóng thuế gì?', isCompleted: false, isLocked: false },
              { id: 'thue101-2', name: 'Ai đang đóng thuế?', isCompleted: false, isLocked: true },
              { id: 'thue101-3', name: 'Ai thực sự gánh chịu thuế?', isCompleted: false, isLocked: true },
              { id: 'thue101-4', name: 'Thuế là gì?', isCompleted: false, isLocked: true },
              { id: 'thue101-5', name: 'Phân loại thuế', isCompleted: false, isLocked: true },
              { id: 'thue101-6', name: 'Suy ngẫm về thuế', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue101-level-2',
            name: 'Tại sao đóng thuế? (WHY)',
            lessons: [
              { id: 'thue101-7', name: 'Mục đích của thuế', isCompleted: false, isLocked: true },
              { id: 'thue101-8', name: 'Khế ước xã hội', isCompleted: false, isLocked: true },
              { id: 'thue101-9', name: 'Nguyên tắc thu thuế', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue101-level-3',
            name: 'Thuế và Trách nhiệm',
            lessons: [
              { id: 'thue101-10', name: 'Thuế và minh bạch', isCompleted: false, isLocked: true },
              { id: 'thue101-11', name: 'Làm sao để có minh bạch?', isCompleted: false, isLocked: true },
              { id: 'thue101-12', name: 'Thuế và chính trị', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'kinh-te-vi-mo',
        name: 'Kinh tế Vi mô',
        description: 'Cung cầu, giá cả và hành vi người tiêu dùng',
        icon: 'pie-chart',
        lessonsCount: 42,
        exercisesCount: 310,
        isNew: false,
        levels: [
          {
            id: 'level-1',
            name: 'Cung và Cầu',
            lessons: [
              { id: 'micro-1', name: 'Đường cung', isCompleted: false, isLocked: false },
              { id: 'micro-2', name: 'Đường cầu', isCompleted: false, isLocked: true },
              { id: 'micro-3', name: 'Điểm cân bằng', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'philosophy',
    name: 'Triết học Chính trị',
    description: 'Các trường phái tư tưởng và lý thuyết về nhà nước',
    icon: 'landmark',
    courses: [
      {
        slug: 'truong-phai-tu-tuong',
        name: 'Các Trường phái Tư tưởng',
        description: 'Từ Plato đến các nhà tư tưởng hiện đại',
        icon: 'book-open',
        lessonsCount: 48,
        exercisesCount: 286,
        isNew: false,
        levels: [
          {
            id: 'level-1',
            name: 'Triết học Cổ điển',
            lessons: [
              { id: 'phil-1', name: 'Plato và Lý tưởng', isCompleted: false, isLocked: false },
              { id: 'phil-2', name: 'Aristotle và Thực tại', isCompleted: false, isLocked: true },
              { id: 'phil-3', name: 'Khế ước Xã hội', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'ly-thuyet-nha-nuoc',
        name: 'Lý thuyết Nhà nước',
        description: 'Các hình thái và chức năng của nhà nước',
        icon: 'scale',
        lessonsCount: 38,
        exercisesCount: 198,
        isNew: true,
        levels: [
          {
            id: 'level-1',
            name: 'Hình thái Nhà nước',
            lessons: [
              { id: 'state-1', name: 'Quân chủ', isCompleted: false, isLocked: false },
              { id: 'state-2', name: 'Dân chủ', isCompleted: false, isLocked: true },
              { id: 'state-3', name: 'Cộng hòa', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'tu-tuong-kinh-te',
        name: 'Tư tưởng Kinh tế Chính trị',
        description: 'Adam Smith, Marx và các học thuyết kinh tế',
        icon: 'coins',
        lessonsCount: 44,
        exercisesCount: 256,
        isNew: true,
        levels: [
          {
            id: 'level-1',
            name: 'Kinh tế Cổ điển',
            lessons: [
              { id: 'econ-1', name: 'Bàn tay Vô hình', isCompleted: false, isLocked: false },
              { id: 'econ-2', name: 'Giá trị Lao động', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
      {
        slug: 'thue-kinh-te-chinh-tri',
        name: 'Thuế dưới Góc nhìn Kinh tế Chính trị',
        description: 'Hiểu sâu về thuế qua mô hình 4R: Revenue, Redistribution, Regulation, Representation',
        icon: 'landmark',
        lessonsCount: 50,
        exercisesCount: 320,
        isNew: true,
        levels: [
          {
            id: 'thue-ct-level-1',
            name: 'Tổng quan về Thuế',
            lessons: [
              { id: 'thue-ct-1', name: 'Bạn đang đóng thuế gì?', isCompleted: false, isLocked: false },
              { id: 'thue-ct-2', name: 'Tại sao phải đóng thuế?', isCompleted: false, isLocked: true },
              { id: 'thue-ct-3', name: 'Mô hình 4R của thuế', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue-ct-level-2',
            name: 'Revenue Generation - Tạo nguồn thu',
            lessons: [
              { id: 'thue-ct-4', name: 'Thuế tài trợ chi tiêu công', isCompleted: false, isLocked: true },
              { id: 'thue-ct-5', name: 'Khắc phục thất bại thị trường', isCompleted: false, isLocked: true },
              { id: 'thue-ct-6', name: 'Hàng hóa công cộng', isCompleted: false, isLocked: true },
              { id: 'thue-ct-7', name: 'Deadweight Loss - Mất mát kinh tế', isCompleted: false, isLocked: true },
              { id: 'thue-ct-8', name: 'Thu thuế hiệu quả (Efficiency)', isCompleted: false, isLocked: true },
              { id: 'thue-ct-9', name: 'Công bằng ngang và dọc (Equity)', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue-ct-level-3',
            name: 'Redistribution - Phân phối lại',
            lessons: [
              { id: 'thue-ct-10', name: 'Bất bình đẳng và bất ổn xã hội', isCompleted: false, isLocked: true },
              { id: 'thue-ct-11', name: 'The rich get richer', isCompleted: false, isLocked: true },
              { id: 'thue-ct-12', name: 'Công lý phân phối (Distributive Justice)', isCompleted: false, isLocked: true },
              { id: 'thue-ct-13', name: 'John Rawls và Veil of Ignorance', isCompleted: false, isLocked: true },
              { id: 'thue-ct-14', name: 'Thuế lũy tiến và thuế thừa kế', isCompleted: false, isLocked: true },
              { id: 'thue-ct-15', name: 'Chỉ số Gini Coefficient', isCompleted: false, isLocked: true },
              { id: 'thue-ct-16', name: 'Chiếc xô rò rỉ của Okun', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue-ct-level-4',
            name: 'Regulation - Điều tiết hành vi',
            lessons: [
              { id: 'thue-ct-17', name: 'Thuế điều tiết hành vi', isCompleted: false, isLocked: true },
              { id: 'thue-ct-18', name: 'Thuế carbon và môi trường', isCompleted: false, isLocked: true },
              { id: 'thue-ct-19', name: 'Thuế tiêu thụ đặc biệt', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue-ct-level-5',
            name: 'Representation - Đại diện dân chủ',
            lessons: [
              { id: 'thue-ct-20', name: 'No taxation without representation', isCompleted: false, isLocked: true },
              { id: 'thue-ct-21', name: 'Minh bạch và trách nhiệm giải trình', isCompleted: false, isLocked: true },
              { id: 'thue-ct-22', name: 'Ổn định kinh tế vĩ mô', isCompleted: false, isLocked: true },
            ],
          },
          {
            id: 'thue-ct-level-6',
            name: 'Case Study: Việt Nam',
            lessons: [
              { id: 'thue-ct-23', name: 'Hệ thống thuế Việt Nam', isCompleted: false, isLocked: true },
              { id: 'thue-ct-24', name: 'Tiền thuế đi đâu?', isCompleted: false, isLocked: true },
              { id: 'thue-ct-25', name: 'Đòi hỏi trách nhiệm giải trình', isCompleted: false, isLocked: true },
            ],
          },
        ],
      },
    ],
  },
];

export const exercises: Record<string, Exercise[]> = {
  'lesson-1': [
    {
      id: 'ex-1',
      lessonId: 'lesson-1',
      type: 'multiple-choice',
      title: 'Lập luận là gì?',
      instruction: 'Chọn định nghĩa đúng nhất về lập luận:',
      options: [
        { id: 'a', text: 'Một chuỗi các mệnh đề trong đó một số mệnh đề (tiền đề) được đưa ra để hỗ trợ cho một mệnh đề khác (kết luận)', isCorrect: true },
        { id: 'b', text: 'Một cuộc tranh cãi giữa hai người', isCorrect: false },
        { id: 'c', text: 'Một ý kiến cá nhân về một vấn đề', isCorrect: false },
        { id: 'd', text: 'Một câu hỏi cần được trả lời', isCorrect: false },
      ],
    },
    {
      id: 'ex-2',
      lessonId: 'lesson-1',
      type: 'multiple-choice',
      title: 'Nhận diện Lập luận',
      instruction: 'Câu nào sau đây là một lập luận?',
      options: [
        { id: 'a', text: 'Hôm nay trời đẹp quá!', isCorrect: false },
        { id: 'b', text: 'Vì trời mưa nên đường trơn. Do đó, bạn nên lái xe cẩn thận.', isCorrect: true },
        { id: 'c', text: 'Bạn có muốn đi ăn không?', isCorrect: false },
        { id: 'd', text: 'Hà Nội là thủ đô của Việt Nam.', isCorrect: false },
      ],
    },
  ],
  'thue-1': [
    {
      id: 'thue-ex-1',
      lessonId: 'thue-1',
      type: 'visual-select',
      title: 'Thu nhập chịu thuế',
      instruction: 'Chọn các khoản thu nhập PHẢI chịu thuế TNCN:',
      options: [
        { id: 'a', text: 'Tiền lương, tiền công', isCorrect: true },
        { id: 'b', text: 'Tiền thưởng Tết', isCorrect: true },
        { id: 'c', text: 'Tiền bồi thường bảo hiểm nhân thọ', isCorrect: false },
        { id: 'd', text: 'Thu nhập từ chuyển nhượng bất động sản', isCorrect: true },
        { id: 'e', text: 'Tiền trợ cấp tai nạn lao động', isCorrect: false },
      ],
    },
    {
      id: 'thue-ex-2',
      lessonId: 'thue-1',
      type: 'multiple-choice',
      title: 'Mức giảm trừ',
      instruction: 'Mức giảm trừ gia cảnh cho bản thân người nộp thuế hiện nay là bao nhiêu?',
      options: [
        { id: 'a', text: '9 triệu đồng/tháng', isCorrect: false },
        { id: 'b', text: '11 triệu đồng/tháng', isCorrect: true },
        { id: 'c', text: '13 triệu đồng/tháng', isCorrect: false },
        { id: 'd', text: '15 triệu đồng/tháng', isCorrect: false },
      ],
    },
  ],
  'phil-1': [
    {
      id: 'phil-ex-1',
      lessonId: 'phil-1',
      type: 'multiple-choice',
      title: 'Plato và Lý tưởng',
      instruction: 'Theo Plato, "Thế giới Ý niệm" (World of Forms) là gì?',
      options: [
        { id: 'a', text: 'Thế giới vật chất mà chúng ta đang sống', isCorrect: false },
        { id: 'b', text: 'Một thế giới hoàn hảo, bất biến chứa đựng các hình mẫu lý tưởng của mọi thứ', isCorrect: true },
        { id: 'c', text: 'Thế giới trong giấc mơ', isCorrect: false },
        { id: 'd', text: 'Một khái niệm về tôn giáo', isCorrect: false },
      ],
    },
  ],
};

// Lesson content for progressive reveal
export const lessonContents: Record<string, LessonContent> = {
  // ============================================================
  // KHÓA HỌC: THUẾ 101 - THUẾ & QUYỀN CÔNG DÂN
  // ============================================================

  // Bài 1: Bạn đang đóng thuế gì?
  'thue101-1': {
    lessonId: 'thue101-1',
    title: 'Bạn đang đóng thuế gì?',
    blocks: [
      {
        type: 'text',
        title: 'Thuế ở khắp mọi nơi',
        paragraphs: [
          'Bạn có biết rằng mỗi ngày, bạn đóng thuế rất nhiều lần mà không hề hay biết?',
          'Mua 1kg thịt giá 250.000đ tại siêu thị? Giá đó đã bao gồm thuế VAT. Vì giá đã bao gồm VAT, phần thuế thực tế = 250.000 × 10/110 ≈ 22.727đ (không phải 25.000đ nếu tính 10% đơn thuần). Ngoài ra, từ 1/7/2025 đến 31/12/2026, nhiều hàng hóa được giảm VAT từ 10% xuống 8%.',
        ],
      },
      {
        type: 'callout',
        icon: 'calculator',
        title: 'Mẹo tính VAT trong giá',
        text: 'Khi giá đã bao gồm VAT 10%, phần thuế = Giá × 10/110. Ví dụ: 250.000 × 10/110 ≈ 22.727đ. Đừng nhầm với cách tính 250.000 × 10% = 25.000đ — đó là khi giá CHƯA bao gồm VAT.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Lương và thuế',
        paragraphs: [
          'Nhận lương 13 triệu/tháng (gross)? Sau khi trừ bảo hiểm (10,5%) = 1.365.000đ, còn 11.635.000đ. Với mức giảm trừ gia cảnh 2026 = 15,5 triệu/tháng, thu nhập tính thuế = 0 → Bạn thực nhận khoảng 11,6 triệu. Thuế TNCN = 0đ!',
          'Nhiều người lầm tưởng lương 13 triệu thì bị "đánh thuế nặng", nhưng thực tế với mức giảm trừ mới, lương dưới ~16 triệu gross hầu như không đóng thuế TNCN.',
        ],
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'giam-tru-gia-canh',
      },
      {
        type: 'text',
        title: 'Thuế có từ bao giờ?',
        paragraphs: [
          'Thuế không phải phát minh hiện đại. Nền văn minh Lưỡng Hà cổ đại (~3000 TCN) đã có hệ thống thu thuế bằng sản phẩm nông nghiệp.',
          'Ai Cập cổ đại sử dụng thuế để xây kim tự tháp và duy trì quân đội.',
          '"Thuế thập phân" (tithe) trong Kinh Thánh — nộp 1/10 thu nhập — là một trong những hình thức thuế lâu đời nhất.',
        ],
      },
      {
        type: 'callout',
        icon: 'quote',
        title: 'Trích dẫn',
        text: '"Taxes are what we pay for civilized society." (Thuế là thứ chúng ta phải trả cho một xã hội văn minh.) — Oliver Wendell Holmes Jr., Thẩm phán Tối cao Pháp viện Hoa Kỳ (1927)',
        variant: 'info',
      },
      {
        type: 'question',
        question: 'Bạn mua ly cà phê giá 50.000đ (đã bao gồm VAT 10%). Phần thuế VAT trong ly cà phê là bao nhiêu?',
        options: [
          { id: 'a', text: '5.000đ (10%)', isCorrect: false },
          { id: 'b', text: '≈ 4.545đ (50.000 × 10/110)', isCorrect: true },
          { id: 'c', text: '4.000đ (8%)', isCorrect: false },
          { id: 'd', text: 'Không có thuế', isCorrect: false },
        ],
        explanation: 'Khi giá đã bao gồm VAT, phần thuế = Giá × Thuế suất ÷ (100 + Thuế suất). Với VAT 10%: 50.000 × 10/110 ≈ 4.545đ. Lưu ý: cà phê có thể áp dụng VAT 8% (giảm thuế 2025-2026), khi đó VAT = 50.000 × 8/108 ≈ 3.704đ.',
      },
    ],
  },

  // Bài 2: Ai đang đóng thuế?
  'thue101-2': {
    lessonId: 'thue101-2',
    title: 'Ai đang đóng thuế?',
    blocks: [
      {
        type: 'text',
        title: 'Người nộp thuế ≠ Người chịu thuế',
        paragraphs: [
          'Trong kinh tế học thuế, có sự phân biệt rõ ràng giữa "người nộp thuế trên giấy tờ" (statutory incidence) và "người thực sự chịu gánh nặng thuế" (economic incidence).',
          'Ví dụ: Doanh nghiệp nộp thuế VAT cho nhà nước, nhưng phần lớn thuế VAT được tính vào giá bán → người tiêu dùng mới là người thực sự chịu gánh nặng.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Nguyên tắc co giãn (Elasticity)',
        text: 'Bên nào ít linh hoạt hơn, có ít lựa chọn thay thế hơn, thì bên đó sẽ phải gánh chịu thuế nhiều hơn. Bên có cung/cầu kém co giãn sẽ gánh phần lớn gánh nặng thuế.',
        variant: 'info',
      },
      {
        type: 'text',
        paragraphs: [
          'Đây là khái niệm "tax incidence" (gánh nặng thuế) — một trong những kiến thức quan trọng nhất để hiểu ai thực sự đang trả thuế.',
        ],
      },
      {
        type: 'question',
        question: 'Ai nộp thuế VAT cho nhà nước?',
        options: [
          { id: 'a', text: 'Người tiêu dùng cuối cùng', isCorrect: false },
          { id: 'b', text: 'Doanh nghiệp bán hàng', isCorrect: true },
          { id: 'c', text: 'Ngân hàng', isCorrect: false },
          { id: 'd', text: 'Nhân viên thuế', isCorrect: false },
        ],
        explanation: 'Theo Luật Thuế GTGT, người bán hàng/cung cấp dịch vụ là người NỘP thuế VAT cho nhà nước. Tuy nhiên, người tiêu dùng mới là người CHỊU gánh nặng thuế vì thuế đã được tính vào giá bán.',
      },
    ],
  },

  // Bài 3: Ai thực sự gánh chịu thuế?
  'thue101-3': {
    lessonId: 'thue101-3',
    title: 'Ai thực sự gánh chịu thuế?',
    blocks: [
      {
        type: 'text',
        title: 'Gánh nặng thuế phụ thuộc vào độ co giãn',
        paragraphs: [
          'Khi nhà nước đánh thuế, gánh nặng không rơi đồng đều lên mọi người. Ai phải chịu nhiều hơn phụ thuộc vào độ co giãn của cung và cầu.',
        ],
      },
      {
        type: 'text',
        title: 'Ví dụ 1: Thuế môi trường xăng dầu',
        paragraphs: [
          'Xăng là hàng thiết yếu — bạn vẫn phải đổ xăng dù giá tăng. Khi thuế môi trường tăng +1.000đ/lít, hầu hết gánh nặng rơi vào người tiêu dùng vì cầu kém co giãn.',
        ],
      },
      {
        type: 'text',
        title: 'Ví dụ 2: Thuế 10% trên túi xách hàng hiệu',
        paragraphs: [
          'Túi xách hàng hiệu là hàng xa xỉ — người mua có thể chọn không mua hoặc mua thương hiệu khác. Cầu co giãn cao → nhà sản xuất/người lao động phải chịu phần lớn gánh nặng thuế.',
        ],
      },
      {
        type: 'text',
        title: 'Ví dụ 3: Thuế doanh nghiệp',
        paragraphs: [
          'Thuế doanh nghiệp (CIT) không chỉ ảnh hưởng đến chủ doanh nghiệp. Gánh nặng lan tỏa đến cả khách hàng (giá tăng), nhân viên (lương giảm) và cổ đông (lợi nhuận giảm).',
          'Nghiên cứu kinh tế cho thấy gánh nặng thuế TNDN chia đều ảnh hưởng giữa ba nhóm này.',
        ],
      },
    ],
  },

  // Bài 4: Thuế là gì?
  'thue101-4': {
    lessonId: 'thue101-4',
    title: 'Thuế là gì?',
    blocks: [
      {
        type: 'text',
        title: 'Định nghĩa thuế',
        paragraphs: [
          'Thuế là khoản tiền bắt buộc mà Nhà nước thu từ cá nhân và tổ chức. Định nghĩa này phù hợp với Luật Quản lý thuế 2019 của Việt Nam.',
        ],
      },
      {
        type: 'text',
        title: 'Đặc điểm của thuế',
        paragraphs: [
          '1. Tính bắt buộc: Thuế không phải "tự nguyện" — bạn có nghĩa vụ pháp lý phải đóng. Không đóng thuế có thể bị phạt hoặc truy cứu hình sự.',
          '2. Không gắn với quyền lợi trực tiếp: Khác với phí/lệ phí (trả tiền → nhận dịch vụ), thuế không có đối ứng trực tiếp. Bạn không thể nói "tôi đã đóng 5 triệu thuế nên được ưu tiên khám bệnh".',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Thuế vs Phí',
        text: 'Phí = Bạn trả → Bạn nhận dịch vụ (phí gửi xe, phí cầu đường). Thuế = Bạn trả → Nhà nước chi cho toàn xã hội (quốc phòng, giáo dục, y tế).',
        variant: 'info',
      },
    ],
  },

  // Bài 5: Phân loại thuế
  'thue101-5': {
    lessonId: 'thue101-5',
    title: 'Phân loại thuế',
    blocks: [
      {
        type: 'text',
        title: 'Thuế trực tiếp',
        paragraphs: [
          'Thuế trực tiếp là thuế đánh trực tiếp vào thu nhập hoặc tài sản của người nộp thuế:',
          '• Thuế TNCN: đánh vào thu nhập cá nhân',
          '• Thuế TNDN (CIT): đánh vào lợi nhuận doanh nghiệp',
          '• Thuế tài sản: đánh vào bất động sản, phương tiện',
          '• Thuế thừa kế: ở VN nằm trong Luật Thuế TNCN, thuế suất 10%',
        ],
      },
      {
        type: 'text',
        title: 'Thuế gián thu',
        paragraphs: [
          'Thuế gián thu được tính vào giá hàng hóa/dịch vụ:',
          '• VAT (Thuế GTGT): Từ 2026, có 3 mức: 5%, 8%, 10%. Nhiều hàng hóa thông thường được giảm còn 8% (từ 1/7/2025 – 31/12/2026).',
          '• Thuế tiêu thụ đặc biệt: rượu, bia, thuốc lá, xe hơi...',
          '• Thuế bảo vệ môi trường: xăng dầu, túi nilon...',
        ],
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'thue-gtgt',
      },
      {
        type: 'text',
        title: 'Thuế thoái lui vs Thuế lũy tiến',
        paragraphs: [
          'Thuế thoái lui (regressive): Người thu nhập thấp chịu tỷ lệ thuế cao hơn. Ví dụ: phí GPLX 500.000đ — như nhau cho người thu nhập 5 triệu và 50 triệu.',
          'Thuế lũy tiến (progressive): Người thu nhập cao đóng tỷ lệ cao hơn. Thuế TNCN ở Việt Nam từ kỳ tính thuế 2026 có 5 bậc (giảm từ 7 bậc): 5%, 10%, 20%, 30%, 35%. Bậc 35% áp dụng cho thu nhập tính thuế trên 100 triệu/tháng. Giảm trừ gia cảnh tăng từ 11 triệu lên 15,5 triệu/tháng.',
        ],
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'bieu-thue-luy-tien-2026',
      },
      {
        type: 'question',
        question: 'Thuế TNCN ở Việt Nam thuộc loại nào?',
        options: [
          { id: 'a', text: 'Thuế gián thu + thoái lui', isCorrect: false },
          { id: 'b', text: 'Thuế trực tiếp + thoái lui', isCorrect: false },
          { id: 'c', text: 'Thuế trực tiếp + lũy tiến', isCorrect: true },
          { id: 'd', text: 'Thuế gián thu + lũy tiến', isCorrect: false },
        ],
        explanation: 'Thuế TNCN là thuế trực tiếp (đánh trực tiếp vào thu nhập) và lũy tiến (thu nhập càng cao, thuế suất càng cao — từ 5% đến 35%).',
      },
    ],
  },

  // Bài 6: Suy ngẫm về thuế
  'thue101-6': {
    lessonId: 'thue101-6',
    title: 'Suy ngẫm về thuế',
    blocks: [
      {
        type: 'text',
        title: '4 câu hỏi khi nghe về chính sách thuế mới',
        paragraphs: [
          'Mỗi khi nghe tin về một chính sách thuế mới, hãy tự hỏi:',
          '1. Ai thực sự chịu gánh nặng thuế? (Không phải lúc nào cũng là người nộp thuế trên giấy tờ)',
          '2. Thuế này có công bằng không? (Người giàu và người nghèo có chịu tỷ lệ tương xứng?)',
          '3. Tiền thuế được dùng vào đâu? (Có minh bạch không? Có hiệu quả không?)',
          '4. Có cách nào tốt hơn không? (Có giải pháp nào đạt mục tiêu mà ít tạo méo mó hơn?)',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Tư duy phản biện về thuế',
        text: 'Thuế không phải chỉ là con số — nó phản ánh triết lý xã hội, quyền lực chính trị, và sự đánh đổi giữa hiệu quả kinh tế và công bằng xã hội. Hãy luôn đặt câu hỏi thay vì chấp nhận mặc định.',
        variant: 'info',
      },
    ],
  },

  // Bài 7: Mục đích của thuế
  'thue101-7': {
    lessonId: 'thue101-7',
    title: 'Mục đích của thuế',
    blocks: [
      {
        type: 'text',
        title: 'Thuế dùng để làm gì?',
        paragraphs: [
          'Thuế phục vụ 4 chức năng cơ bản theo lý thuyết tài chính công:',
          '1. An ninh quốc phòng: Quân đội, cảnh sát, tòa án — những dịch vụ không thể để thị trường tư nhân cung cấp.',
          '2. Dịch vụ công: Đường sá, cầu cống, bệnh viện công, trường học công — cơ sở hạ tầng cho toàn xã hội.',
          '3. Bảo vệ môi trường: Thuế carbon, thuế môi trường — khuyến khích hành vi thân thiện với môi trường.',
          '4. Giảm bất bình đẳng: Thuế lũy tiến và trợ cấp xã hội — phân phối lại thu nhập từ người giàu sang người nghèo.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Hàng hóa công cộng',
        text: 'Quốc phòng là ví dụ kinh điển về hàng hóa công cộng thuần túy: không thể loại trừ ai (non-excludable) và không cạnh tranh (non-rivalrous). Chính vì vậy, thị trường tư nhân không cung cấp được → cần thuế để tài trợ.',
        variant: 'info',
      },
    ],
  },

  // Bài 8: Khế ước xã hội
  'thue101-8': {
    lessonId: 'thue101-8',
    title: 'Khế ước xã hội',
    blocks: [
      {
        type: 'text',
        title: 'Thuế như một khế ước xã hội',
        paragraphs: [
          'Triết gia và Thẩm phán Tối cao Pháp viện Hoa Kỳ Oliver Wendell Holmes Jr. từng nói: "Taxes are what we pay for civilized society" và "I like to pay taxes. With them I buy civilization."',
          'Ý tưởng cốt lõi: Việc đóng thuế không chỉ là một nghĩa vụ bắt buộc mà còn là một sự đánh đổi có ý thức — bạn từ bỏ một phần thu nhập để đổi lấy an ninh, cơ sở hạ tầng, và các dịch vụ công mà bạn không thể tự mình tạo ra.',
        ],
      },
      {
        type: 'callout',
        icon: 'alert-triangle',
        title: 'Lưu ý về trích dẫn',
        text: 'Đoạn diễn giải dài hơn về ý nghĩa "khế ước xã hội" của thuế là tổng hợp ý tưởng của Holmes và các nhà tư tưởng khác, KHÔNG phải nguyên văn trích dẫn của Holmes.',
        variant: 'warning',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'khop-dong-xa-hoi',
      },
    ],
  },

  // Bài 9: Nguyên tắc thu thuế
  'thue101-9': {
    lessonId: 'thue101-9',
    title: 'Nguyên tắc thu thuế',
    blocks: [
      {
        type: 'text',
        title: '3 nguyên tắc cơ bản',
        paragraphs: [
          'Từ Adam Smith (canon of taxation) đến OECD, các nhà kinh tế đồng ý về 3 nguyên tắc:',
          '1. Hiệu quả kinh tế: Thuế nên gây ít méo mó nhất có thể cho quyết định kinh tế. Thuế càng cao, deadweight loss càng lớn.',
          '2. Công bằng xã hội: Gánh nặng thuế nên được phân chia hợp lý giữa các nhóm thu nhập.',
          '3. Quản lý hành chính: Hệ thống thuế phải đơn giản, dễ tuân thủ, và chi phí hành chính thấp.',
        ],
      },
      {
        type: 'text',
        title: 'Công bằng ngang và công bằng dọc',
        paragraphs: [
          'Công bằng ngang (Horizontal Equity): Người có thu nhập/hoàn cảnh giống nhau nên đóng thuế như nhau. Ví dụ: hai người cùng lương 30 triệu/tháng nên đóng thuế TNCN bằng nhau.',
          'Công bằng dọc (Vertical Equity): Người có khả năng đóng góp nhiều hơn nên đóng thuế nhiều hơn. Đây là cơ sở cho thuế lũy tiến — người thu nhập cao chịu thuế suất cao hơn.',
        ],
      },
    ],
  },

  // Bài 10: Thuế và minh bạch
  'thue101-10': {
    lessonId: 'thue101-10',
    title: 'Thuế và minh bạch',
    blocks: [
      {
        type: 'text',
        title: 'Tại sao minh bạch thuế quan trọng?',
        paragraphs: [
          'Khi người nộp thuế không nhận được thông tin rõ ràng về cách tiền thuế được sử dụng, niềm tin vào hệ thống giảm sút. Điều này dẫn đến trốn thuế, chống đối, và bất ổn xã hội.',
          'Ngược lại, khi người dân thấy thuế được chi tiêu hiệu quả và minh bạch, sự tuân thủ thuế tự nguyện tăng lên đáng kể.',
        ],
      },
      {
        type: 'callout',
        icon: 'info',
        title: 'Tuân thủ thuế tự nguyện',
        text: 'Các quốc gia Bắc Âu (Đan Mạch, Thụy Điển, Na Uy) có tỷ lệ thuế rất cao nhưng mức tuân thủ cũng rất cao — vì người dân tin tưởng thuế được sử dụng hiệu quả cho phúc lợi xã hội.',
        variant: 'info',
      },
    ],
  },

  // Bài 11: Làm sao để có minh bạch?
  'thue101-11': {
    lessonId: 'thue101-11',
    title: 'Làm sao để có minh bạch?',
    blocks: [
      {
        type: 'text',
        title: '3 giải pháp cho minh bạch thuế',
        paragraphs: [
          '1. Thông tin dễ tiếp cận: Công khai ngân sách nhà nước bằng ngôn ngữ dễ hiểu, không chỉ bằng báo cáo kỹ thuật phức tạp.',
          '2. Diễn đàn tham gia: Tạo cơ chế để người dân góp ý về cách phân bổ ngân sách — như ngân sách có sự tham gia (participatory budgeting).',
          '3. Cải cách thể chế: Cơ quan kiểm toán độc lập, quy trình công khai, trách nhiệm giải trình rõ ràng.',
        ],
      },
      {
        type: 'text',
        title: 'Chi tiêu thuế (Tax Expenditure)',
        paragraphs: [
          '"Chi tiêu thuế" là khoản thu nhập mà nhà nước từ bỏ thông qua các ưu đãi, miễn giảm thuế. Ví dụ: miễn thuế cho doanh nghiệp FDI, giảm VAT cho hàng thiết yếu.',
          'Đây là một hình thức "chi tiêu ngầm" — nhà nước không thu tiền nhưng vẫn mất thu nhập. Minh bạch tax expenditure cũng quan trọng như minh bạch chi tiêu trực tiếp.',
        ],
      },
    ],
  },

  // Bài 12: Thuế và chính trị
  'thue101-12': {
    lessonId: 'thue101-12',
    title: 'Thuế và chính trị',
    blocks: [
      {
        type: 'text',
        title: 'Mỗi quốc gia, một triết lý thuế',
        paragraphs: [
          'Các quốc gia có triết lý thuế khác nhau. Ví dụ, Đức có xu hướng đánh thuế cao hơn với hệ thống phúc lợi xã hội rộng rãi, trong khi Mỹ có thuế suất TNDN thấp hơn và ưu tiên kích thích tăng trưởng kinh tế.',
          'Tuy nhiên, cả hai nước đều có thuế lũy tiến và phúc lợi xã hội — sự khác biệt nằm ở mức độ, không phải bản chất. Không nên tuyệt đối hóa rằng "Đức = tái phân phối, Mỹ = làm giàu".',
        ],
      },
      {
        type: 'callout',
        icon: 'landmark',
        title: 'No taxation without representation',
        text: 'Khẩu hiệu từ thời Cách mạng Mỹ (1765-1776): Không đánh thuế nếu không có đại diện chính trị. Nguyên tắc này nhấn mạnh rằng quyền đánh thuế phải đi kèm với quyền được tham gia quyết định.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Lời nguyền tài nguyên (Resource Curse)',
        paragraphs: [
          'Khái niệm được đề xuất bởi Richard Auty (1993): Các quốc gia giàu tài nguyên thiên nhiên (dầu mỏ, khoáng sản) thường có xu hướng phát triển kém hơn vì chính phủ không cần thu thuế nhiều từ dân → ít phải giải trình → tham nhũng và quản trị kém.',
          'Ngược lại, khi nhà nước phụ thuộc vào thuế, người dân có "quyền lực mặc cả" — đòi hỏi minh bạch và hiệu quả.',
        ],
      },
    ],
  },

  // ============================================================
  // KHÓA HỌC: THUẾ DƯỚI GÓC NHÌN KINH TẾ CHÍNH TRỊ
  // ============================================================
  
  // Bài 1: Bạn đang đóng thuế gì?
  'thue-ct-1': {
    lessonId: 'thue-ct-1',
    title: 'Bạn đang đóng thuế gì?',
    blocks: [
      {
        type: 'text',
        title: 'Một ngày bình thường của bạn',
        paragraphs: [
          'Sáng dậy, bạn pha ly cà phê (có thuế VAT), đổ xăng đi làm (thuế bảo vệ môi trường + VAT), mua ổ bánh mì ăn sáng (thuế VAT)...',
          'Nhận lương cuối tháng (thuế TNCN), uống bia sau giờ làm (thuế tiêu thụ đặc biệt + VAT)...',
          'Bạn có nhận ra không? Mỗi ngày, bạn đang đóng rất nhiều loại thuế mà không hề hay biết.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Checkpoint',
        text: '"Tôi vừa nhận ra mình đang nộp thuế mỗi ngày." - Đây là nhận thức đầu tiên và quan trọng nhất về thuế.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Các loại thuế phổ biến bạn đang đóng',
        paragraphs: [
          '🏷️ Thuế gián thu (thuế ẩn trong giá sản phẩm):',
          '• VAT (Thuế Giá trị Gia tăng): 8-10% hầu hết sản phẩm',
          '• Thuế tiêu thụ đặc biệt: Rượu, bia, thuốc lá, xe hơi...',
          '• Thuế bảo vệ môi trường: Xăng dầu, túi nilon...',
          '• Thuế nhập khẩu: Hàng hóa từ nước ngoài',
          '',
          '💰 Thuế trực thu (đánh trực tiếp vào thu nhập):',
          '• Thuế TNCN: Thuế thu nhập cá nhân',
          '• Thuế TNDN: Thuế thu nhập doanh nghiệp',
        ],
      },
      {
        type: 'question',
        question: 'Khi bạn mua một chai nước 10.000đ ở cửa hàng tiện lợi, bạn đang đóng thuế gì?',
        options: [
          { id: 'a', text: 'Không đóng thuế gì cả', isCorrect: false },
          { id: 'b', text: 'Thuế VAT (đã bao gồm trong giá)', isCorrect: true },
          { id: 'c', text: 'Thuế TNCN', isCorrect: false },
          { id: 'd', text: 'Thuế môi trường', isCorrect: false },
        ],
        explanation: 'Giá 10.000đ đã bao gồm thuế VAT 10%. Thực tế giá gốc chai nước là ~9.090đ, và ~910đ là thuế VAT bạn đang trả.',
      },
      {
        type: 'text',
        title: 'Thuế chiếm bao nhiêu trong chi tiêu của bạn?',
        paragraphs: [
          'Ước tính trung bình, một người Việt Nam đóng góp khoảng 20-30% thu nhập cho các loại thuế và phí:',
          '• VAT khi mua sắm: ~10% chi tiêu',
          '• Thuế TNCN (nếu thu nhập cao): 5-35%',
          '• Thuế trong xăng dầu: ~40% giá xăng',
          '• Các loại phí và lệ phí khác',
        ],
      },
      {
        type: 'question',
        question: 'Một lít xăng RON 95 giá 25.000đ. Thuế và phí chiếm khoảng bao nhiêu?',
        options: [
          { id: 'a', text: 'Khoảng 5% (~1.250đ)', isCorrect: false },
          { id: 'b', text: 'Khoảng 20% (~5.000đ)', isCorrect: false },
          { id: 'c', text: 'Khoảng 40% (~10.000đ)', isCorrect: true },
          { id: 'd', text: 'Khoảng 60% (~15.000đ)', isCorrect: false },
        ],
        explanation: 'Thuế và phí trong xăng bao gồm: Thuế bảo vệ môi trường (4.000đ), VAT, thuế nhập khẩu, thuế tiêu thụ đặc biệt... chiếm khoảng 40% giá xăng.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Thuế hiện diện trong hầu hết các hoạt động kinh tế hàng ngày của bạn. Nhận thức được điều này là bước đầu tiên để hiểu sâu hơn về vai trò của thuế trong xã hội.',
        variant: 'success',
      },
    ],
  },

  // Bài 2: Tại sao phải đóng thuế?
  'thue-ct-2': {
    lessonId: 'thue-ct-2',
    title: 'Tại sao phải đóng thuế?',
    blocks: [
      {
        type: 'text',
        title: 'Câu hỏi đơn giản, câu trả lời không đơn giản',
        paragraphs: [
          'Nhiều người nghĩ đóng thuế là vì "bị bắt buộc" - đúng, nhưng chưa đủ.',
          'Hãy tưởng tượng một thành phố không có thuế:',
          '• Ai trả tiền xây đường?',
          '• Ai trả lương cho cảnh sát, lính cứu hỏa?',
          '• Ai chi trả cho bệnh viện công, trường công?',
          '• Ai hỗ trợ người nghèo, người già?',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Checkpoint',
        text: 'Nhận ra mình đóng thuế không chỉ vì bị bắt buộc, mà để phục vụ lợi ích chung của xã hội.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thuế là "giá" của xã hội văn minh',
        paragraphs: [
          'Benjamin Franklin từng nói: "Trong thế giới này, không có gì chắc chắn ngoài cái chết và thuế."',
          'Nhưng một cách nhìn tích cực hơn:',
          'Oliver Wendell Holmes Jr. từng diễn đạt đại ý rằng: thuế là giá mà chúng ta trả cho một xã hội văn minh.',
          '',
          'Thuế giúp tạo ra các hàng hóa và dịch vụ công mà thị trường tự do không thể cung cấp hiệu quả.',
        ],
      },
      {
        type: 'question',
        question: 'Tại sao thị trường tự do không thể cung cấp hiệu quả dịch vụ như quốc phòng?',
        options: [
          { id: 'a', text: 'Vì không ai muốn làm lính', isCorrect: false },
          { id: 'b', text: 'Vì không thể thu tiền từ từng người được bảo vệ', isCorrect: true },
          { id: 'c', text: 'Vì chính phủ cấm tư nhân làm', isCorrect: false },
          { id: 'd', text: 'Vì quốc phòng không quan trọng', isCorrect: false },
        ],
        explanation: 'Quốc phòng bảo vệ tất cả mọi người, không thể "loại trừ" ai. Nếu để tư nhân làm, mọi người sẽ "ăn theo" mà không trả tiền. Đây gọi là "free-rider problem".',
      },
      {
        type: 'text',
        title: 'Ba lý do chính đóng thuế',
        paragraphs: [
          '1️⃣ Tài trợ hàng hóa công cộng:',
          'Đường sá, cầu cống, công viên, đèn đường... - những thứ ai cũng dùng, không ai trả tiền riêng.',
          '',
          '2️⃣ Khắc phục thất bại thị trường:',
          'Can thiệp khi thị trường không hoạt động hiệu quả (như trong dịch bệnh, khủng hoảng).',
          '',
          '3️⃣ Phân phối lại thu nhập:',
          'Giảm khoảng cách giàu nghèo, hỗ trợ người yếu thế trong xã hội.',
        ],
      },
      {
        type: 'question',
        question: 'Trong đại dịch COVID-19, chính phủ dùng tiền thuế để làm gì?',
        options: [
          { id: 'a', text: 'Chỉ trả lương cho công chức', isCorrect: false },
          { id: 'b', text: 'Mua vaccine, hỗ trợ người mất việc, giảm thuế cho doanh nghiệp', isCorrect: true },
          { id: 'c', text: 'Không làm gì cả', isCorrect: false },
          { id: 'd', text: 'Chỉ xây bệnh viện mới', isCorrect: false },
        ],
        explanation: 'Trong COVID-19, thuế được dùng để: mua vaccine miễn phí, hỗ trợ 26.000 tỷ đồng cho 12 nhóm đối tượng bao gồm NLĐ và doanh nghiệp bị ảnh hưởng, giảm thuế VAT xuống 8%, và nhiều biện pháp khác.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Thuế không chỉ là nghĩa vụ pháp lý, mà còn là cách chúng ta cùng đóng góp để xây dựng một xã hội tốt đẹp hơn. Câu hỏi quan trọng không phải "có nên đóng thuế không?" mà là "thuế nên được thu và chi như thế nào?"',
        variant: 'success',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'khop-dong-xa-hoi',
      },
    ],
  },

  // Bài 3: Mô hình 4R của thuế
  'thue-ct-3': {
    lessonId: 'thue-ct-3',
    title: 'Mô hình 4R của thuế',
    blocks: [
      {
        type: 'text',
        title: 'Giới thiệu mô hình 4R',
        paragraphs: [
          'Để hiểu đầy đủ về mục tiêu của thuế, các nhà kinh tế học đã phát triển mô hình 4R:',
          '',
          '🎯 R1: Revenue Generation - Tạo nguồn thu',
          '🎯 R2: Redistribution - Phân phối lại tài nguyên',
          '🎯 R3: Regulation - Điều tiết hành vi',
          '🎯 R4: Representation - Đại diện dân chủ & ổn định kinh tế',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Tại sao cần hiểu 4R?',
        text: 'Mỗi chính sách thuế đều nhắm đến một hoặc nhiều mục tiêu trong 4R. Hiểu 4R giúp bạn đánh giá xem chính sách thuế có hợp lý hay không.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'R1: Revenue Generation - Tạo nguồn thu',
        paragraphs: [
          'Đây là mục tiêu cơ bản nhất: Thu thuế để có tiền chi tiêu công.',
          '',
          '💡 Ví dụ:',
          '• Thuế VAT tạo ra ~23-24,5% ngân sách nhà nước',
          '• Thuế TNCN và TNDN tạo ra ~25% ngân sách',
          '• Tiền này dùng để trả lương giáo viên, xây đường, mua thiết bị y tế...',
        ],
      },
      {
        type: 'text',
        title: 'R2: Redistribution - Phân phối lại',
        paragraphs: [
          'Mục tiêu: Giảm bất bình đẳng bằng cách chuyển tài nguyên từ người giàu sang người nghèo.',
          '',
          '💡 Ví dụ:',
          '• Thuế TNCN lũy tiến: Thu nhập cao → Thuế suất cao hơn',
          '• Thuế thừa kế: Giảm bất bình đẳng qua thế hệ',
          '• Tiền thuế → Trợ cấp cho người nghèo, giáo dục miễn phí, y tế công',
        ],
      },
      {
        type: 'question',
        question: 'Thuế suất TNCN cao nhất ở Việt Nam (35%) áp dụng cho thu nhập tính thuế bao nhiêu?',
        options: [
          { id: 'a', text: 'Trên 32 triệu/tháng', isCorrect: false },
          { id: 'b', text: 'Trên 52 triệu/tháng', isCorrect: false },
          { id: 'c', text: 'Trên 80 triệu/tháng', isCorrect: false },
          { id: 'd', text: 'Trên 100 triệu/tháng', isCorrect: true },
        ],
        explanation: 'Biểu thuế TNCN Việt Nam từ 01/01/2026 có 5 bậc (giảm từ 7 bậc trước đó), từ 5% đến 35%. Mức 35% áp dụng cho thu nhập tính thuế trên 100 triệu đồng/tháng.',
      },
      {
        type: 'text',
        title: 'R3: Regulation - Điều tiết hành vi',
        paragraphs: [
          'Mục tiêu: Dùng thuế để khuyến khích hành vi tốt, hạn chế hành vi xấu cho xã hội.',
          '',
          '💡 Ví dụ:',
          '• Thuế carbon: Khuyến khích giảm phát thải',
          '• Thuế thuốc lá, rượu bia: Hạn chế tiêu dùng có hại',
          '• Miễn thuế cho xe điện: Khuyến khích năng lượng sạch',
        ],
      },
      {
        type: 'text',
        title: 'R4: Representation & Stabilization',
        paragraphs: [
          'Hai mục tiêu quan trọng:',
          '',
          '🗳️ Representation (Đại diện dân chủ):',
          '• "No taxation without representation" - Không đánh thuế nếu không có đại diện',
          '• Người dân có quyền biết thuế được chi tiêu thế nào',
          '',
          '📈 Stabilization (Ổn định kinh tế):',
          '• Tăng thuế khi kinh tế quá nóng → Hạ nhiệt',
          '• Giảm thuế khi kinh tế suy thoái → Kích thích',
        ],
      },
      {
        type: 'question',
        question: 'Khi kinh tế suy thoái (như trong COVID-19), chính phủ nên làm gì với thuế?',
        options: [
          { id: 'a', text: 'Tăng thuế để có thêm tiền', isCorrect: false },
          { id: 'b', text: 'Giảm thuế để kích thích tiêu dùng và đầu tư', isCorrect: true },
          { id: 'c', text: 'Giữ nguyên, không thay đổi gì', isCorrect: false },
          { id: 'd', text: 'Xóa bỏ hoàn toàn thuế', isCorrect: false },
        ],
        explanation: 'Trong suy thoái, giảm thuế giúp người dân và doanh nghiệp có thêm tiền để chi tiêu và đầu tư, kích thích kinh tế phục hồi. Đây là chính sách tài khóa mở rộng.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt Mô hình 4R',
        text: '• Revenue: Tạo nguồn thu cho chi tiêu công\n• Redistribution: Giảm bất bình đẳng xã hội\n• Regulation: Điều tiết hành vi xã hội\n• Representation & Stabilization: Minh bạch dân chủ và ổn định kinh tế\n\nMột chính sách thuế tốt cần cân bằng cả 4 mục tiêu này.',
        variant: 'success',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'thue-tncn',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'thue-gtgt',
      },
    ],
  },

  // Bài 4: Thuế tài trợ chi tiêu công
  'thue-ct-4': {
    lessonId: 'thue-ct-4',
    title: 'Thuế tài trợ chi tiêu công',
    blocks: [
      {
        type: 'text',
        title: 'Chi tiêu công là gì?',
        paragraphs: [
          'Chi tiêu công (Public Expenditure) là các khoản chi của chính phủ để cung cấp hàng hóa và dịch vụ cho xã hội.',
          '',
          'Nguồn tiền chủ yếu đến từ thuế - đây là mục tiêu Revenue Generation.',
          '',
          'Năm 2023, ngân sách nhà nước Việt Nam thu khoảng 1.700 nghìn tỷ đồng, trong đó thuế và phí chiếm khoảng 70-75%.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Thuế đi đâu?',
        text: 'Chi tiêu công gồm 2 mục chính:\n1. Khắc phục thất bại thị trường (Market Failures)\n2. Cung cấp hàng hóa công cộng (Public Goods)',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Cơ cấu chi ngân sách Việt Nam',
        paragraphs: [
          '📊 Chi thường xuyên (~70%):',
          '• Trả lương công chức, viên chức',
          '• Chi cho giáo dục, y tế, an ninh quốc phòng',
          '• Chi bảo đảm xã hội',
          '',
          '📊 Chi đầu tư phát triển (~30%):',
          '• Xây dựng cơ sở hạ tầng (đường, cầu, sân bay)',
          '• Đầu tư cho khoa học công nghệ',
          '• Hỗ trợ doanh nghiệp nhà nước',
        ],
      },
      {
        type: 'question',
        question: 'Ngân sách nhà nước Việt Nam chi nhiều nhất cho lĩnh vực nào?',
        options: [
          { id: 'a', text: 'Quốc phòng và an ninh', isCorrect: false },
          { id: 'b', text: 'Giáo dục và đào tạo', isCorrect: true },
          { id: 'c', text: 'Y tế', isCorrect: false },
          { id: 'd', text: 'Xây dựng cơ bản', isCorrect: false },
        ],
        explanation: 'Giáo dục và đào tạo chiếm khoảng 20% tổng chi ngân sách - cao nhất trong các lĩnh vực. Đây là đầu tư cho nguồn nhân lực tương lai.',
      },
      {
        type: 'text',
        title: 'Nếu không có thuế...',
        paragraphs: [
          'Hãy tưởng tượng một ngày không có thuế:',
          '',
          '❌ Không có tiền trả lương giáo viên → Trường học đóng cửa',
          '❌ Không có tiền cho bệnh viện công → Người nghèo không thể chữa bệnh',
          '❌ Không có tiền sửa đường → Giao thông tê liệt',
          '❌ Không có tiền trả lương cảnh sát → An ninh hỗn loạn',
          '',
          'Thuế là "nhiên liệu" để bộ máy nhà nước vận hành.',
        ],
      },
      {
        type: 'question',
        question: 'Một người nói: "Tôi không dùng dịch vụ công, tại sao phải đóng thuế?" Bạn trả lời thế nào?',
        options: [
          { id: 'a', text: 'Đúng, người không dùng không nên đóng thuế', isCorrect: false },
          { id: 'b', text: 'Bạn đang dùng mà không biết: đường sá, an ninh, không khí sạch...', isCorrect: true },
          { id: 'c', text: 'Thuế là bắt buộc, không cần lý do', isCorrect: false },
          { id: 'd', text: 'Chỉ người giàu mới nên đóng thuế', isCorrect: false },
        ],
        explanation: 'Mọi người đều hưởng lợi từ hàng hóa công: đi trên đường do nhà nước xây, được cảnh sát bảo vệ, hít thở không khí được kiểm soát ô nhiễm... Đây là lợi ích "vô hình" nhưng rất quan trọng.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Thuế là nguồn thu chính để chính phủ cung cấp các dịch vụ công thiết yếu. Không có thuế, không có đường sá, trường học, bệnh viện công... Câu hỏi tiếp theo: Thuế nên được thu như thế nào để hiệu quả và công bằng?',
        variant: 'success',
      },
    ],
  },

  // Bài 7: Deadweight Loss - Mất mát kinh tế
  'thue-ct-7': {
    lessonId: 'thue-ct-7',
    title: 'Deadweight Loss - Mất mát kinh tế',
    blocks: [
      {
        type: 'text',
        title: 'Thuế có "chi phí ẩn"',
        paragraphs: [
          'Khi chính phủ đánh thuế, không phải tất cả số tiền người dân mất đi đều vào ngân sách nhà nước.',
          'Có một phần bị "biến mất" - không ai được hưởng lợi. Phần này gọi là Deadweight Loss (DWL) - Mất mát kinh tế.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Định nghĩa Deadweight Loss',
        text: 'Deadweight Loss (DWL) là phần thặng dư kinh tế bị mất đi khi thuế làm thay đổi hành vi mua bán. Đây là "chi phí ẩn" của thuế mà không ai được hưởng.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Ví dụ: Thuế trên ly cà phê',
        paragraphs: [
          '☕ Trước khi có thuế:',
          '• Giá bán: 70.000đ',
          '• Bạn sẵn sàng trả: 100.000đ → Thặng dư tiêu dùng: 30.000đ',
          '• Chi phí của quán: 50.000đ → Thặng dư sản xuất: 20.000đ',
          '• Tổng thặng dư: 50.000đ',
          '',
          'Giả sử có 10 người như bạn → Tổng thặng dư: 500.000đ',
        ],
      },
      {
        type: 'text',
        title: 'Khi thuế xuất hiện',
        paragraphs: [
          '☕ Chính phủ đánh thuế 10.000đ/ly:',
          '• Giá bán mới: 75.000đ (người bán chịu 5k, người mua chịu 5k)',
          '• Một số người không mua nữa vì giá tăng',
          '• Chỉ còn 8 người mua',
          '',
          '📊 Kết quả:',
          '• Thặng dư tiêu dùng mỗi ly: 100k - 75k = 25.000đ',
          '• Thặng dư sản xuất mỗi ly: 75k - 50k - 10k(thuế) = 15.000đ',
          '• Tổng thặng dư: (25k + 15k) × 8 = 320.000đ',
          '• Thuế thu được: 10k × 8 = 80.000đ',
        ],
      },
      {
        type: 'question',
        question: 'Từ ví dụ trên, Deadweight Loss là bao nhiêu?',
        options: [
          { id: 'a', text: '80.000đ', isCorrect: false },
          { id: 'b', text: '100.000đ', isCorrect: true },
          { id: 'c', text: '180.000đ', isCorrect: false },
          { id: 'd', text: '320.000đ', isCorrect: false },
        ],
        explanation: 'Trước thuế: 500.000đ thặng dư. Sau thuế: 320.000đ thặng dư + 80.000đ thuế = 400.000đ. DWL = 500.000 - 400.000 = 100.000đ. Đây là phần "biến mất" mà không ai được hưởng.',
      },
      {
        type: 'text',
        title: 'Tại sao DWL xảy ra?',
        paragraphs: [
          'DWL xảy ra vì thuế làm thay đổi hành vi:',
          '• 2 người không mua cà phê nữa (vì giá tăng)',
          '• Nếu họ mua, cả họ và quán đều có lợi',
          '• Nhưng thuế làm giao dịch này không xảy ra',
          '• Lợi ích tiềm năng bị mất → DWL',
          '',
          '⚡ Thuế càng cao → DWL càng lớn',
          '⚡ DWL tăng theo bình phương của thuế suất',
        ],
      },
      {
        type: 'question',
        question: 'Nếu tăng thuế gấp đôi, Deadweight Loss sẽ thay đổi thế nào?',
        options: [
          { id: 'a', text: 'Tăng gấp đôi', isCorrect: false },
          { id: 'b', text: 'Tăng gấp 4 lần', isCorrect: true },
          { id: 'c', text: 'Giữ nguyên', isCorrect: false },
          { id: 'd', text: 'Giảm đi một nửa', isCorrect: false },
        ],
        explanation: 'DWL tăng theo bình phương thuế suất. Thuế × 2 → DWL × 4. Đây là lý do vì sao thuế suất cực cao là không hiệu quả.',
      },
      {
        type: 'callout',
        icon: 'warning',
        title: 'Bài học cho chính sách thuế',
        text: 'Thu thuế hiệu quả không phải là thu càng nhiều càng tốt! Cần cân bằng:\n• Lợi ích của thuế thu được > Chi phí của DWL tạo ra\n• Thuế quá cao → DWL lớn → Kinh tế thiệt hại\n• Thuế quá thấp → Không đủ tiền cho hàng hóa công',
        variant: 'warning',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Deadweight Loss là "chi phí ẩn" của thuế - phần lợi ích kinh tế bị mất mà không ai được hưởng. Thuế càng cao, DWL càng lớn. Chính sách thuế tốt cần tối thiểu hóa DWL trong khi vẫn đạt được mục tiêu thu ngân sách.',
        variant: 'success',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'deadweight-loss',
      },
    ],
  },

  // Bài 13: John Rawls và Veil of Ignorance
  'thue-ct-13': {
    lessonId: 'thue-ct-13',
    title: 'John Rawls và Veil of Ignorance',
    blocks: [
      {
        type: 'text',
        title: 'Thế nào là công bằng?',
        paragraphs: [
          'Khi thiết kế chính sách thuế để phân phối lại tài nguyên, câu hỏi quan trọng là: "Thế nào là công bằng?"',
          'Mỗi người có quan điểm khác nhau:',
          '• Người giàu: "Tôi làm ra tiền, tại sao phải chia cho người khác?"',
          '• Người nghèo: "Tôi không có cơ hội như người giàu, cần được hỗ trợ"',
          '',
          'John Rawls (1921-2002) - triết gia chính trị Mỹ - đề xuất một cách tư duy độc đáo.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Veil of Ignorance - Bức màn Vô minh',
        text: 'Hãy tưởng tượng bạn đang thiết kế quy tắc cho xã hội, nhưng KHÔNG BIẾT mình sẽ sinh ra là ai: giàu hay nghèo, nam hay nữ, khỏe mạnh hay khuyết tật, tài năng hay bình thường. Trong tình huống đó, bạn sẽ thiết kế xã hội như thế nào?',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Ý nghĩa của Veil of Ignorance',
        paragraphs: [
          'Khi không biết mình sẽ là ai, bạn sẽ không thiên vị cho bất kỳ nhóm nào.',
          '',
          '🤔 Bạn có muốn một xã hội nơi:',
          '• Top 1% sở hữu 50% tài sản? (Nếu bạn sinh ra là 99% còn lại thì sao?)',
          '• Người nghèo không được đi học? (Nếu bạn sinh ra trong gia đình nghèo?)',
          '• Người bệnh không được chữa trị? (Nếu bạn sinh ra với bệnh bẩm sinh?)',
        ],
      },
      {
        type: 'question',
        question: 'Theo Veil of Ignorance, bạn sẽ chọn xã hội nào?',
        options: [
          { id: 'a', text: 'Xã hội A: 50% cơ hội làm tỷ phú, 50% cơ hội làm nô lệ', isCorrect: false },
          { id: 'b', text: 'Xã hội B: Mọi người đều có mức sống trung bình như nhau', isCorrect: false },
          { id: 'c', text: 'Xã hội C: Có bất bình đẳng, nhưng người nghèo nhất vẫn sống tốt', isCorrect: true },
          { id: 'd', text: 'Xã hội D: Hoàn toàn tự do, không có bất kỳ quy tắc nào', isCorrect: false },
        ],
        explanation: 'Rawls cho rằng: Bất bình đẳng được chấp nhận NẾU nó làm cho người yếu thế nhất có cuộc sống tốt hơn. Đây là "Difference Principle" - Nguyên tắc Khác biệt.',
      },
      {
        type: 'text',
        title: 'Hai nguyên tắc công lý của Rawls',
        paragraphs: [
          '1️⃣ Fair Equality of Opportunity (Bình đẳng về cơ hội):',
          '• Mọi người phải có cơ hội thực chất để phát triển',
          '• Không ai bị "khóa cứng" vì xuất thân nghèo',
          '• Xã hội cần bù đắp cho người sinh ra thiệt thòi',
          '',
          '2️⃣ Difference Principle (Nguyên tắc Khác biệt):',
          '• "Bất bình đẳng chỉ được chấp nhận nếu làm cho người yếu thế nhất tốt hơn"',
          '• Không phải làm mọi người bằng nhau',
          '• Mà là đảm bảo người khó khăn nhất được cải thiện',
        ],
      },
      {
        type: 'callout',
        icon: 'message',
        title: 'Câu nói nổi tiếng của Rawls',
        text: '"Bất bình đẳng chỉ được phép tồn tại nếu nó làm cho người yếu thế nhất tốt hơn."\n— John Rawls, A Theory of Justice (1971)',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Áp dụng vào chính sách thuế',
        paragraphs: [
          '📋 Từ hai nguyên tắc của Rawls, ta có 3 nhóm chính sách thuế:',
          '',
          '1. Thuế thu nhập lũy tiến:',
          '   Người có năng lực kiếm tiền cao hơn → Đóng thuế tỷ lệ cao hơn',
          '',
          '2. Thuế thừa kế / tài sản:',
          '   Giảm bất bình đẳng qua thế hệ',
          '',
          '3. Trợ cấp và chi tiêu công:',
          '   Tiền thuế → Giáo dục, y tế, bảo hiểm cho người yếu thế',
        ],
      },
      {
        type: 'question',
        question: 'Theo Rawls, một chính sách thuế "công bằng" cần đảm bảo điều gì?',
        options: [
          { id: 'a', text: 'Mọi người đều đóng thuế bằng nhau', isCorrect: false },
          { id: 'b', text: 'Người giàu không phải đóng thuế', isCorrect: false },
          { id: 'c', text: 'Người nghèo nhất trong xã hội được cải thiện cuộc sống', isCorrect: true },
          { id: 'd', text: 'Không ai phải đóng thuế', isCorrect: false },
        ],
        explanation: 'Theo Difference Principle, chính sách công bằng không đòi hỏi bình đẳng tuyệt đối, mà đảm bảo rằng bất kỳ sự bất bình đẳng nào cũng phải mang lại lợi ích cho người yếu thế nhất.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Veil of Ignorance là công cụ tư duy giúp ta thiết kế chính sách công bằng bằng cách tưởng tượng không biết mình sẽ sinh ra là ai. Theo Rawls, bất bình đẳng được chấp nhận chỉ khi nó cải thiện cuộc sống của người yếu thế nhất trong xã hội.',
        variant: 'success',
      },
    ],
  },

  'thue-1': {
    lessonId: 'thue-1',
    title: 'Thu nhập chịu thuế',
    blocks: [
      {
        type: 'text',
        title: 'Giới thiệu về Thuế Thu nhập Cá nhân',
        paragraphs: [
          'Thuế thu nhập cá nhân (TNCN) là một loại thuế trực thu đánh vào thu nhập của cá nhân.',
          'Không phải mọi khoản tiền bạn nhận được đều phải đóng thuế. Việc hiểu rõ "thu nhập chịu thuế" là bước đầu tiên để quản lý tài chính cá nhân hiệu quả.',
        ],
      },
      {
        type: 'callout',
        icon: 'lightbulb',
        title: 'Bạn có biết?',
        text: 'Ở Việt Nam, thuế TNCN được áp dụng theo biểu thuế lũy tiến từng phần, nghĩa là thu nhập càng cao thì tỷ lệ thuế càng tăng.',
        variant: 'info',
      },
      {
        type: 'text',
        title: 'Thu nhập chịu thuế là gì?',
        paragraphs: [
          'Thu nhập chịu thuế là các khoản thu nhập mà pháp luật quy định phải nộp thuế TNCN.',
          'Theo Luật Thuế TNCN, có 10 loại thu nhập chịu thuế, bao gồm: tiền lương, tiền công; thu nhập từ kinh doanh; thu nhập từ đầu tư vốn; thu nhập từ chuyển nhượng vốn; và nhiều loại khác.',
        ],
      },
      {
        type: 'question',
        question: 'Khoản nào sau đây KHÔNG phải là thu nhập chịu thuế TNCN?',
        options: [
          { id: 'a', text: 'Tiền lương hàng tháng', isCorrect: false },
          { id: 'b', text: 'Tiền thưởng cuối năm', isCorrect: false },
          { id: 'c', text: 'Tiền bồi thường bảo hiểm nhân thọ', isCorrect: true },
          { id: 'd', text: 'Thu nhập từ cho thuê nhà', isCorrect: false },
        ],
        explanation: 'Tiền bồi thường bảo hiểm nhân thọ thuộc danh mục thu nhập được miễn thuế theo quy định.',
      },
      {
        type: 'text',
        title: 'Các khoản thu nhập được miễn thuế',
        paragraphs: [
          'Không phải mọi thu nhập đều phải đóng thuế. Một số khoản được miễn thuế bao gồm:',
          '• Tiền bồi thường bảo hiểm nhân thọ, phi nhân thọ',
          '• Trợ cấp, phụ cấp theo quy định của pháp luật',
          '• Thu nhập từ chuyển nhượng bất động sản giữa vợ chồng, cha mẹ con cái',
          '• Học bổng',
        ],
      },
      {
        type: 'question',
        question: 'Nếu bạn nhận lương 15 triệu đồng/tháng, khoản nào sẽ được tính vào thu nhập chịu thuế?',
        options: [
          { id: 'a', text: 'Chỉ tiền lương cơ bản', isCorrect: false },
          { id: 'b', text: 'Tiền lương + các khoản phụ cấp chịu thuế + thưởng', isCorrect: true },
          { id: 'c', text: 'Toàn bộ 15 triệu', isCorrect: false },
          { id: 'd', text: 'Không khoản nào vì dưới mức chịu thuế', isCorrect: false },
        ],
        explanation: 'Thu nhập chịu thuế từ tiền lương bao gồm: lương cơ bản, phụ cấp (trừ các khoản được miễn), thưởng và các khoản thu nhập khác.',
      },
      {
        type: 'callout',
        icon: 'check',
        title: 'Tóm tắt',
        text: 'Thu nhập chịu thuế TNCN bao gồm nhiều loại, nhưng cũng có những khoản được miễn thuế. Việc phân biệt rõ giúp bạn tính đúng số thuế phải nộp.',
        variant: 'success',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'thue-tncn',
      },
      {
        type: 'library-document',
        mode: 'reference',
        documentSlug: 'giam-tru-gia-canh',
      },
    ],
  },
  // Story contents are now in story-contents.ts
};

export function getCourseBySlug(slug: string): Course | undefined {
  for (const category of categories) {
    const course = category.courses.find(c => c.slug === slug);
    if (course) return course;
  }
  return undefined;
}

export function getLessonById(lessonId: string): { lesson: Lesson; course: Course; level: Level } | undefined {
  for (const category of categories) {
    for (const course of category.courses) {
      for (const level of course.levels) {
        const lesson = level.lessons.find(l => l.id === lessonId);
        if (lesson) {
          return { lesson, course, level };
        }
      }
    }
  }
  return undefined;
}

export function getExercisesForLesson(lessonId: string): Exercise[] {
  return exercises[lessonId] || [];
}

export function getStoriesByCharacter(characterId: string): Story[] {
  return stories.filter(s => s.characterId === characterId);
}

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find(s => s.slug === slug);
}

export function getChapterById(chapterId: string): { chapter: Chapter; story: Story; part: StoryPart } | undefined {
  for (const story of stories) {
    for (const part of story.parts) {
      const chapter = part.chapters.find(c => c.id === chapterId);
      if (chapter) {
        return { chapter, story, part };
      }
    }
  }
  return undefined;
}

export function getStoriesByCourse(courseSlug: string): Story[] {
  return stories.filter(story => story.relatedCourses.includes(courseSlug));
}

export function getLessonContent(lessonId: string): LessonContent | undefined {
  // Check in course lessons first, then in story contents
  return lessonContents[lessonId] || allStoryContents[lessonId];
}
