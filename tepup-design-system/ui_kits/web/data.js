// Fake content data for the Tepup web UI kit demo.
// Mirrors the shape of `data/courses.ts` in the real codebase.

window.WEB_DATA = {
  characters: [
    { id: 'c-minh',   slug: 'student',       name: 'Minh',    role: 'Sinh viên',          icon: 'graduation-cap', color: 'teal',
      teaser: 'Mình muốn hiểu rõ hơn về tiền lương, thuế và cách quản lý tài chính.' },
    { id: 'c-huong',  slug: 'office-worker', name: 'Hương',  role: 'Nhân viên VP',       icon: 'briefcase',      color: 'blue',
      teaser: 'Mỗi tháng trừ thuế xong, mình tự hỏi: số tiền đó đi đâu?' },
    { id: 'c-bactu',  slug: 'street-vendor', name: 'Bác Tư', role: 'Bán hàng rong',      icon: 'store',          color: 'orange',
      teaser: 'Tôi bán hàng cả đời nhưng chưa từng được học về kinh tế một cách bài bản.' },
  ],

  categories: [
    {
      id: 'cat-1', name: 'Nền tảng KHXH', description: 'Khái niệm cốt lõi để bắt đầu', icon: 'brain',
      courses: [
        { slug: 'tu-duy-phan-bien',   name: 'Tư duy phản biện',   icon: 'lightbulb', isNew: true,  lessons: 12 },
        { slug: 'nhap-mon-kinh-te',   name: 'Nhập môn Kinh tế',   icon: 'pie-chart', isNew: false, lessons: 14 },
        { slug: 'logic-co-ban',       name: 'Logic cơ bản',       icon: 'brain',     isNew: false, lessons: 9 },
        { slug: 'phuong-phap-khoa-hoc',name:'Phương pháp khoa học',icon:'book-open', isNew: false, lessons: 8 },
      ],
    },
    {
      id: 'cat-2', name: 'Kinh tế & Thuế', description: 'Tiền vận hành như thế nào', icon: 'trending-up',
      courses: [
        { slug: 'he-thong-thue-vn',   name: 'Hệ thống Thuế VN',   icon: 'receipt',     isNew: true,  lessons: 11 },
        { slug: 'lam-phat-va-cpi',    name: 'Lạm phát & CPI',     icon: 'trending-up', isNew: false, lessons: 7 },
        { slug: 'cung-cau-thi-truong',name: 'Cung cầu thị trường', icon: 'coins',      isNew: false, lessons: 10 },
      ],
    },
    {
      id: 'cat-3', name: 'Triết học Chính trị', description: 'Quyền lực, công lý, cộng đồng', icon: 'landmark',
      courses: [
        { slug: 'cong-bang-xa-hoi',   name: 'Công bằng xã hội',   icon: 'scale',    isNew: false, lessons: 12 },
        { slug: 'dan-chu-can-ban',    name: 'Dân chủ căn bản',    icon: 'landmark', isNew: false, lessons: 9 },
      ],
    },
  ],

  course: {
    slug: 'nhap-mon-kinh-te',
    name: 'Nhập môn Kinh tế',
    description: 'Hành trình từ cung cầu cơ bản đến các khái niệm vĩ mô — không cần nền tảng trước đó.',
    icon: 'pie-chart',
    lessonsCount: 14,
    exercisesCount: 32,
    levels: [
      { id: 'l1', name: 'Khái niệm cơ bản', lessons: [
        { id: 'l1-1', slug: 'cung-va-cau',          name: 'Cung và Cầu',          completed: true  },
        { id: 'l1-2', slug: 'gia-can-bang',         name: 'Giá cân bằng',         completed: true  },
        { id: 'l1-3', slug: 'do-co-gian',           name: 'Độ co giãn',           completed: false, current: true },
        { id: 'l1-4', slug: 'thi-truong-tu-do',     name: 'Thị trường tự do',     completed: false },
      ]},
      { id: 'l2', name: 'Cá nhân & Doanh nghiệp', lessons: [
        { id: 'l2-1', slug: 'hanh-vi-tieu-dung',    name: 'Hành vi tiêu dùng',   completed: false },
        { id: 'l2-2', slug: 'chi-phi-co-hoi',       name: 'Chi phí cơ hội',       completed: false },
      ]},
    ],
    relatedStories: [
      { slug: 'tien-luong-dau-tien', title: 'Tiền lương đầu tiên của Minh', characterId: 'student' },
      { slug: 'gia-rau-cuoi-tuan',   title: 'Giá rau cuối tuần của Bác Tư', characterId: 'street-vendor' },
    ],
  },

  lesson: {
    slug: 'do-co-gian',
    title: 'Độ co giãn của cầu',
    blocks: [
      { type: 'text', title: 'Độ co giãn của cầu là gì?',
        paragraphs: [
          'Khi giá của một mặt hàng thay đổi, lượng cầu thường thay đổi theo. Mức độ phản ứng đó được gọi là độ co giãn của cầu.',
          'Một mặt hàng có cầu "co giãn" nếu lượng cầu thay đổi nhiều khi giá thay đổi một chút. Ngược lại, một mặt hàng "không co giãn" có lượng cầu ít thay đổi khi giá lên xuống.',
        ] },
      { type: 'callout', variant: 'info', icon: 'lightbulb', title: 'Gợi ý',
        text: 'Hãy nghĩ về xăng — bạn vẫn phải mua kể cả khi giá tăng. Đó là một mặt hàng có cầu ít co giãn.' },
      { type: 'library-document',
        title: 'Cung và Cầu',
        category: 'Khái niệm cơ bản',
        description: 'Hai lực lượng chính quyết định giá cả và số lượng hàng hóa trong nền kinh tế thị trường.',
        readTime: '2 phút' },
      { type: 'question',
        question: 'Mặt hàng nào sau đây có cầu "co giãn" cao nhất?',
        options: [
          { id: 'a', text: 'Thuốc điều trị bệnh mãn tính',  correct: false },
          { id: 'b', text: 'Một loại nước ngọt cụ thể (ví dụ: cola)', correct: true },
          { id: 'c', text: 'Muối ăn',                       correct: false },
          { id: 'd', text: 'Điện sinh hoạt',                correct: false },
        ],
        explanation: 'Người tiêu dùng có thể dễ dàng chuyển sang một loại nước ngọt khác nếu giá tăng — cầu cho một thương hiệu cụ thể rất co giãn.',
      },
      { type: 'callout', variant: 'success', icon: 'check', title: 'Tốt lắm!',
        text: 'Bạn đã hoàn thành phần đầu tiên về cung cầu.' },
    ],
  },
};
