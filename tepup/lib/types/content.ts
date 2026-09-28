// Content types shared between data layer and UI
import type { CustomBlockInstance } from './custom-block';

export interface TextBlock {
  type: 'text';
  title?: string;
  paragraphs: string[];
  /** Rich inline HTML produced by the Notion-style editor. When present, learner
   *  rendering prefers this over `paragraphs` (which is kept for backward compat). */
  html?: string;
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
  /**
   * 'single' = one right answer (radio), 'multiple' = several (checkbox).
   * Optional, and absent means 'single', so every quiz authored before the mode
   * existed keeps behaving exactly as it did.
   */
  mode?: 'single' | 'multiple';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

export interface LibraryDocumentBlock {
  type: 'library-document';
  mode?: 'reference' | 'inline'; // Optional for backward compatibility
  // Reference mode fields
  documentId?: string;
  documentSlug?: string; // Used in static files, resolved to documentId during migration
  // Inline mode fields (all optional for reference mode)
  title?: string;
  description?: string;
  category?: string;
  estimatedReadTime?: string;
  documentContent?: {
    sections: {
      heading?: string;
      paragraphs: string[];
    }[];
    relatedConcepts?: string[];
    furtherReading?: string[];
  };
}

// === NHÓM A: Công cụ tính toán ===

export interface CalculatorBlock {
  type: 'calculator';
  title?: string;
  description?: string;
  calculatorType: 'tax' | 'compound-interest' | 'inflation' | 'custom';
  inputs: {
    id: string;
    label: string;
    type: 'number' | 'select';
    unit?: string;
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number;
    options?: { value: number; label: string }[];
  }[];
  formula: string;
  outputs: {
    id: string;
    label: string;
    unit?: string;
    formula: string;
    highlight?: boolean;
  }[];
  presets?: {
    label: string;
    values: Record<string, number>;
  }[];
  insight?: string;
}

export interface SliderSimulatorBlock {
  type: 'slider-simulator';
  title?: string;
  description?: string;
  sliders: {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit?: string;
  }[];
  outputs: {
    id: string;
    label: string;
    formula: string;
    unit?: string;
    format?: 'number' | 'percent' | 'currency';
  }[];
  chart?: {
    type: 'bar';
    bars: {
      label: string;
      formula: string;
      color?: string;
    }[];
  };
  breakpoints?: {
    condition: string;
    message: string;
    variant: 'info' | 'warning' | 'success';
  }[];
}

export interface BudgetAllocatorBlock {
  type: 'budget-allocator';
  title?: string;
  description?: string;
  totalBudget: number;
  unit?: string;
  categories: {
    id: string;
    label: string;
    icon?: string;
    color: string;
    defaultValue: number;
    minValue?: number;
    description?: string;
  }[];
  outcomes: {
    condition: string;
    title: string;
    description: string;
    variant: 'good' | 'neutral' | 'bad';
  }[];
  comparison?: {
    label: string;
    values: Record<string, number>;
  };
}

// === NHÓM B: Tư duy phản biện ===

export interface BiasDetectorBlock {
  type: 'bias-detector';
  title?: string;
  instruction: string;
  article: {
    text: string;
    source?: string;
  };
  segments: {
    id: string;
    text: string;
    startIndex: number;
    biasType: string;
    explanation: string;
  }[];
  biasOptions: { id: string; label: string }[];
}

export interface PerspectiveSwitchBlock {
  type: 'perspective-switch';
  title?: string;
  event: string;
  perspectives: {
    id: string;
    role: string;
    icon?: string;
    narrative: string;
  }[];
  question: {
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  };
}

// === NHÓM C: Mini-game / Puzzle ===

export interface HotColdGuessBlock {
  type: 'hot-cold-guess';
  title?: string;
  question: string;
  answer: number;
  unit: string;
  tolerance: number;
  hints: string[];
  context: string;
}

// === NHÓM D: Ghép nối / Ghi nhớ / Phân loại ===

/** Nối mỗi mục cột trái với đúng một mục cột phải. Luôn cân 1-1. */
export interface PairMatchBlock {
  type: 'pair-match';
  title?: string;
  instruction?: string;
  pairs: { id: string; left: string; right: string }[];
}

/** Một mặt thẻ: text hoặc ảnh, loại trừ nhau. */
export type FlipCardFace =
  | { kind: 'text'; text: string }
  | { kind: 'image'; src: string; alt?: string };

export interface FlipCardBlock {
  type: 'flip-card';
  title?: string;
  instruction?: string;
  cards: { id: string; front: FlipCardFace; back: FlipCardFace }[];
}

/** Xếp mỗi item vào đúng rổ của nó. `bucketId` phải trỏ tới một bucket đang tồn tại. */
export interface SortBucketBlock {
  type: 'sort-bucket';
  title?: string;
  instruction?: string;
  buckets: { id: string; label: string }[];
  items: { id: string; text: string; bucketId: string }[];
}

// === Native rich-text blocks (backed by BlockNote in the editor) ===

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  /** Rich inline HTML */
  html: string;
}

export interface QuoteBlock {
  type: 'quote';
  /** Rich inline HTML */
  html: string;
}

export interface CodeBlock {
  type: 'code';
  language?: string;
  code: string;
}

/** A single list item; `children` allows nested lists (Notion-style). */
export interface ListItem {
  /** Rich inline HTML for the item */
  html: string;
  children?: ListItem[];
}

export interface BulletListBlock {
  type: 'bullet-list';
  items: ListItem[];
}

export interface NumberedListBlock {
  type: 'numbered-list';
  items: ListItem[];
}

export interface CheckListItem {
  html: string;
  checked: boolean;
  children?: CheckListItem[];
}

export interface CheckListBlock {
  type: 'check-list';
  items: CheckListItem[];
}

export interface ToggleBlock {
  type: 'toggle';
  /** Rich inline HTML for the toggle summary/title */
  html: string;
  /** Nested content revealed when the toggle is open */
  children: ContentBlock[];
}

export interface TableBlock {
  type: 'table';
  /** Rows of cells; each cell is rich inline HTML. First row may be a header. */
  rows: string[][];
  headerRow?: boolean;
}

export interface VideoBlock {
  type: 'video';
  url: string;
  caption?: string;
}

export interface AudioBlock {
  type: 'audio';
  url: string;
  caption?: string;
}

export interface FileBlock {
  type: 'file';
  url: string;
  name?: string;
  caption?: string;
}

/** Reveal-group boundary. Blocks between two step-breaks are revealed together
 *  on the learner side. A lesson with zero step-breaks falls back to the legacy
 *  one-block-per-click reveal. */
export interface StepBreakBlock {
  type: 'step-break';
  label?: string;
}

type ContentBlockUnion =
  | TextBlock
  | ImageBlock
  | CalloutBlock
  | QuestionBlock
  | LibraryDocumentBlock
  | CalculatorBlock
  | SliderSimulatorBlock
  | BudgetAllocatorBlock
  | BiasDetectorBlock
  | PerspectiveSwitchBlock
  | HotColdGuessBlock
  | PairMatchBlock
  | FlipCardBlock
  | SortBucketBlock
  | HeadingBlock
  | QuoteBlock
  | CodeBlock
  | BulletListBlock
  | NumberedListBlock
  | CheckListBlock
  | ToggleBlock
  | TableBlock
  | VideoBlock
  | AudioBlock
  | FileBlock
  | StepBreakBlock
  | CustomBlockInstance;

/** A content block. `id` is an optional stable identifier used by the editor to
 *  map blocks to BlockNote nodes and drive selection; legacy blocks may lack it. */
export type ContentBlock = ContentBlockUnion & { id?: string };

// Lesson types for UI consumption
export interface LessonDisplay {
  id: string;
  slug: string;
  name: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface LevelDisplay {
  id: string;
  name: string;
  lessons: LessonDisplay[];
}

export interface CourseDisplay {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  lessonsCount: number;
  isNew: boolean;
  /** Ảnh bìa thẻ ở /courses (220×280). */
  imageUrl: string | null;
  levels: LevelDisplay[];
}

export interface CategoryDisplay {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  courses: CourseDisplay[];
}

export interface ExerciseDisplay {
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

export interface LessonContentDisplay {
  lessonId: string;
  title: string;
  blocks: ContentBlock[];
}

// Character and Story types
export interface CharacterDisplay {
  id: string;
  slug: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  /** Avatar vuông, hiển thị cắt tròn ở /courses. */
  avatarUrl: string | null;
  /** Ảnh nhân vật lớn, nền trong suốt, ở /courses. */
  imageUrl: string | null;
  stories: string[]; // story slugs
}

export interface ChapterDisplay {
  id: string;
  slug: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface StoryPartDisplay {
  id: string;
  name: string;
  chapters: ChapterDisplay[];
}

export interface StoryDisplay {
  id: string;
  slug: string;
  characterId: string;
  title: string;
  teaser: string;
  icon: string;
  estimatedTime: string;
  chaptersCount: number;
  parts: StoryPartDisplay[];
}

export interface ChapterContentDisplay {
  chapterId: string;
  title: string;
  blocks: ContentBlock[];
}

// Context types for lesson/chapter retrieval
export interface LessonWithContext {
  lesson: LessonDisplay;
  course: CourseDisplay;
  level: LevelDisplay;
}

export interface ChapterWithContext {
  chapter: ChapterDisplay;
  story: StoryDisplay;
  part: StoryPartDisplay;
}

/**
 * Everything the player route needs for a lesson, fetched in one query.
 *
 * Không có `exercises`: trường này từng được truy vấn, ánh xạ rồi vứt đi — trang
 * player chỉ dùng `content.blocks`. Bài tập của admin đọc qua route riêng.
 */
export interface LessonPage extends LessonWithContext {
  content: LessonContentDisplay | null;
}

/** Everything the player route needs for a chapter, fetched in one query. */
export interface ChapterPage extends ChapterWithContext {
  content: ChapterContentDisplay | null;
}
