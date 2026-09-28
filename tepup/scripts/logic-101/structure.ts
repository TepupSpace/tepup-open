/**
 * Logic 101 — course structure (5 levels × 4 lessons = 20).
 *
 * Source of truth: docs/content-course-Logic-101/course-outline.yaml (lesson titles,
 * slugs, level assignment) and course-context.yaml (level names).
 *
 * Lesson slugs here are taken verbatim from course-outline.yaml rather than derived
 * from the display name. They are short and stable; `migrate-slugs.ts` would otherwise
 * regenerate them from `name` and produce the long variants seen on staging
 * (e.g. `confirmation-bias-ban-chi-thay-cai-ban-muon-thay`).
 */

export const CATEGORY = {
  /** Production already has this row under the misspelled slug `logic-t-duy-phn-bin`. */
  legacySlug: 'logic-t-duy-phn-bin',
  slug: 'nen-tang-khoa-hoc-xa-hoi',
  name: 'Nền tảng Khoa học Xã hội',
  description:
    'Các môn học nền tảng về xã hội, tư duy, chính trị — giúp người học hiểu cách xã hội vận hành và đọc thông tin tỉnh táo.',
  icon: 'brain',
  sortOrder: 4,
};

export const COURSE = {
  slug: 'logic-101',
  name: 'Logic 101 — Não Bạn Đang Lừa Bạn',
  description:
    'Khoá nền tảng tư duy phản biện. Nhận diện thiên kiến trong chính đầu mình, bóc tách ngụy biện quanh mình, đọc truyền thông tỉnh táo — và tranh luận mà không biến thành kẻ mình ghét.',
  icon: 'brain',
  sortOrder: 0,
  isActive: true,
};

export interface LessonDef {
  id: string;
  slug: string;
  name: string;
}

export interface LevelDef {
  sortOrder: number;
  name: string;
  lessons: LessonDef[];
}

/**
 * Level names come from course-context.yaml `structure[].name`. Lesson `name` is the
 * learner-facing title — richer than course-outline.yaml's short `title`, which reads
 * as a syllabus entry rather than a lesson heading.
 */
export const LEVELS: LevelDef[] = [
  {
    sortOrder: 0,
    name: 'Bản thân — não bạn bị lừa',
    lessons: [
      {
        id: 'B01',
        slug: 'confirmation-bias',
        name: 'Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy',
      },
      {
        id: 'B02',
        slug: 'nguy-bien-la-gi',
        name: 'Ngụy biện là gì? — Tiền đề, kết luận, valid & sound',
      },
      {
        id: 'B03',
        slug: 'correlation-causation',
        name: 'Correlation ≠ Causation — Cùng xảy ra không có nghĩa là nhân quả',
      },
      {
        id: 'B04',
        slug: 'thao-tung-so-lieu',
        name: 'Thao túng số liệu — Khi biểu đồ cố tình lừa mắt bạn',
      },
    ],
  },
  {
    sortOrder: 1,
    name: 'Người khác — ngụy biện quanh bạn',
    lessons: [
      {
        id: 'B05',
        slug: 'ad-hominem',
        name: 'Ad hominem — Tấn công người, không tấn công lập luận',
      },
      { id: 'B06', slug: 'strawman', name: 'Strawman — Bẻ lái để dễ phản biện' },
      {
        id: 'B07',
        slug: 'appeal-to-authority',
        name: 'Appeal to authority & popularity — "Chuyên gia nói" và "ai cũng tin"',
      },
      {
        id: 'B08',
        slug: 'slippery-slope-false-dilemma',
        name: 'Slippery slope & False dilemma — Kiểm soát lựa chọn của bạn',
      },
    ],
  },
  {
    sortOrder: 2,
    name: 'Hệ thống — truyền thông lừa bạn',
    lessons: [
      {
        id: 'B09',
        slug: 'tin-gia-misinformation',
        name: 'Tin giả — Tại sao nó lan nhanh gấp 6 lần tin thật',
      },
      {
        id: 'B10',
        slug: 'clickbait-framing',
        name: 'Clickbait & Framing — Cùng sự kiện, 10 câu chuyện khác nhau',
      },
      {
        id: 'B11',
        slug: 'source-evaluation-craap',
        name: 'CRAAP test — Đánh giá nguồn trong 5 câu hỏi',
      },
      {
        id: 'B12',
        slug: 'echo-chamber',
        name: 'Echo chamber — Thuật toán đang quyết định bạn thấy gì',
      },
    ],
  },
  {
    sortOrder: 3,
    name: 'Xã hội — chính trị dùng chiêu',
    lessons: [
      {
        id: 'B13',
        slug: 'propaganda',
        name: 'Propaganda — 7 kỹ thuật cổ điển vẫn hoạt động đến hôm nay',
      },
      {
        id: 'B14',
        slug: 'danh-gia-chinh-sach',
        name: 'Đánh giá chính sách — 5 câu hỏi để không bị lừa',
      },
      {
        id: 'B15',
        slug: 'whataboutism',
        name: 'Whataboutism — Khi "còn nước khác thì sao?" trở thành bẫy',
      },
      {
        id: 'B16',
        slug: 'quyen-con-nguoi-logic',
        name: 'Quyền con người & logic — Khi không có đáp án đúng',
      },
    ],
  },
  {
    sortOrder: 4,
    name: 'Hành động — bạn làm gì?',
    lessons: [
      {
        id: 'B17',
        slug: 'debate-co-van-hoa',
        name: 'Debate có văn hoá — Tranh luận mà không ghét nhau',
      },
      {
        id: 'B18',
        slug: 'steelman',
        name: 'Steelman — Kỹ năng cao nhất: làm cho đối phương mạnh hơn',
      },
      {
        id: 'B19',
        slug: 'intellectual-humility',
        name: 'Intellectual humility — "Tôi có thể sai"',
      },
      {
        id: 'B20',
        slug: 'tong-ket-hanh-dong',
        name: 'Tổng kết — Bạn sẽ làm gì với tất cả những thứ này?',
      },
    ],
  },
];
