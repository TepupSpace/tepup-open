import {
  Type, Image, Lightbulb, ListChecks, BookOpen,
  Calculator, SlidersHorizontal, PieChart, ScanSearch, Users, Thermometer,
  Puzzle, TrendingUp, BarChart3, Sliders, Brain, Zap, Milestone,
  Waypoints, SquareStack, Boxes,
} from 'lucide-react';
import type { ContentBlock, CalculatorBlock, SliderSimulatorBlock, BudgetAllocatorBlock, BiasDetectorBlock, PerspectiveSwitchBlock, HotColdGuessBlock, PairMatchBlock, FlipCardBlock, SortBucketBlock, CustomBlockTypeFull } from './types';
import type { CustomBlockInstance } from '@/lib/types/custom-block';

/**
 * - basic: nội dung thường (text, ảnh, callout, tài liệu).
 * - question: có đúng/sai — dùng làm checkpoint hoặc câu gợi mở.
 * - explainer: mô phỏng, thay một đoạn text để minh hoạ ý — không phải câu hỏi.
 */
export type BlockGroup = 'basic' | 'question' | 'explainer';

export const BLOCK_GROUP_LABEL: Record<BlockGroup, string> = {
  basic: 'Cơ bản',
  question: 'Câu hỏi · checkpoint',
  explainer: 'Giải thích · mô phỏng',
};

export const blockTypes: { type: string; label: string; icon: React.ElementType; group: BlockGroup }[] = [
  { type: 'text', label: 'Văn bản', icon: Type, group: 'basic' },
  { type: 'image', label: 'Hình ảnh', icon: Image, group: 'basic' },
  { type: 'callout', label: 'Callout', icon: Lightbulb, group: 'basic' },
  { type: 'library-document', label: 'Tài liệu thư viện', icon: BookOpen, group: 'basic' },
  { type: 'question', label: 'Trắc nghiệm', icon: ListChecks, group: 'question' },
  { type: 'pair-match', label: 'Nối cặp', icon: Waypoints, group: 'question' },
  { type: 'sort-bucket', label: 'Phân loại vào rổ', icon: Boxes, group: 'question' },
  { type: 'bias-detector', label: 'Phát hiện thiên lệch', icon: ScanSearch, group: 'question' },
  { type: 'perspective-switch', label: 'Đa góc nhìn', icon: Users, group: 'question' },
  { type: 'hot-cold-guess', label: 'Hot/Cold Guess', icon: Thermometer, group: 'question' },
  { type: 'flip-card', label: 'Lật thẻ', icon: SquareStack, group: 'explainer' },
  { type: 'calculator', label: 'Máy tính', icon: Calculator, group: 'explainer' },
  { type: 'slider-simulator', label: 'Simulator', icon: SlidersHorizontal, group: 'explainer' },
  { type: 'budget-allocator', label: 'Phân bổ ngân sách', icon: PieChart, group: 'explainer' },
];

export const blockTypesInGroup = (group: BlockGroup) => blockTypes.filter((b) => b.group === group);

export const BLOCK_BORDER_COLOR: Record<string, string> = {
  'text':               '#60a5fa',
  'image':              '#c084fc',
  'callout':            '#fbbf24',
  'question':           '#34d399',
  'library-document':   '#818cf8',
  'pair-match':         '#38bdf8',
  'flip-card':          '#f472b6',
  'sort-bucket':        '#4ade80',
  'calculator':         '#fb923c',
  'slider-simulator':   '#22d3ee',
  'budget-allocator':   '#fb7185',
  'bias-detector':      '#f87171',
  'perspective-switch': '#a78bfa',
  'hot-cold-guess':     '#2dd4bf',
  'custom':             '#a78bfa',
  'step-break':         '#0ea5e9',
};

/** Icon for the "Ngắt bước" separator — not a ContentBlock, so it lives outside blockTypes. */
export const STEP_BREAK_ICON = Milestone;

/** Custom block types store accentColor as a Tailwind colour name, not a hex value. */
const ACCENT_HEX: Record<string, string> = {
  cyan: '#22d3ee',
  blue: '#60a5fa',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  violet: '#a78bfa',
  orange: '#fb923c',
};

export function getAccentHex(accentColor?: string): string {
  return ACCENT_HEX[accentColor ?? ''] ?? BLOCK_BORDER_COLOR.custom;
}

const CUSTOM_ICON_MAP: Record<string, React.ElementType> = {
  'trending-up': TrendingUp,
  'calculator': Calculator,
  'bar-chart-3': BarChart3,
  'sliders': Sliders,
  'brain': Brain,
  'zap': Zap,
  'puzzle': Puzzle,
};

export function getCustomIcon(iconName: string): React.ElementType {
  return CUSTOM_ICON_MAP[iconName] ?? Puzzle;
}

export function getBlockBorderColor(type: string): string {
  return BLOCK_BORDER_COLOR[type] ?? '#9ca3af';
}

export function getBlockIcon(type: string) {
  return blockTypes.find((b) => b.type === type)?.icon || Type;
}

export function getBlockLabel(type: string): string {
  if (type === 'custom') return 'Block tùy chỉnh';
  return blockTypes.find((b) => b.type === type)?.label || type;
}

export function getBlockPreview(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
      return block.title || block.paragraphs[0]?.slice(0, 60) || '(chưa có nội dung)';
    case 'image':
      return block.alt || block.src || '(chưa có hình)';
    case 'callout':
      return block.title || block.text?.slice(0, 60) || '(chưa có nội dung)';
    case 'question':
      return block.question?.slice(0, 60) || '(chưa có câu hỏi)';
    case 'library-document':
      return block.title || '(chưa có tiêu đề)';
    case 'calculator':
      return block.title || `Máy tính: ${block.calculatorType}`;
    case 'slider-simulator':
      return block.title || '(Simulator)';
    case 'budget-allocator':
      return block.title || '(Phân bổ ngân sách)';
    case 'bias-detector':
      return block.title || block.instruction?.slice(0, 60) || '(Bias detector)';
    case 'perspective-switch':
      return block.title || block.event?.slice(0, 60) || '(Đa góc nhìn)';
    case 'hot-cold-guess':
      return block.title || block.question?.slice(0, 60) || '(Hot/Cold Guess)';
    case 'pair-match':
      return block.title || `Nối cặp: ${block.pairs?.length ?? 0} cặp`;
    case 'flip-card':
      return block.title || `Lật thẻ: ${block.cards?.length ?? 0} thẻ`;
    case 'sort-bucket':
      return block.title || `Phân loại: ${block.items?.length ?? 0} thẻ / ${block.buckets?.length ?? 0} rổ`;
    case 'custom':
      return block.configSnapshot?.name || '(Custom block)';
    default:
      return '(block)';
  }
}

export function createEmptyBlock(type: string): ContentBlock {
  switch (type) {
    case 'text':
      return { type: 'text', paragraphs: [''] };
    case 'image':
      return { type: 'image', src: '', alt: '' };
    case 'callout':
      return { type: 'callout', text: '', variant: 'info' };
    case 'question':
      return {
        type: 'question',
        question: '',
        mode: 'single',
        options: [
          { id: '1', text: '', isCorrect: true },
          { id: '2', text: '', isCorrect: false },
        ],
      };
    case 'library-document':
      return {
        type: 'library-document',
        title: '',
        description: '',
        documentContent: { sections: [{ paragraphs: [''] }] },
      };
    case 'calculator':
      return {
        type: 'calculator',
        title: '',
        calculatorType: 'custom',
        inputs: [{ id: 'x', label: '', type: 'number', defaultValue: 0, min: 0, max: 100, step: 1 }],
        formula: 'x',
        outputs: [{ id: 'result', label: 'Kết quả', formula: 'x' }],
      } as CalculatorBlock;
    case 'slider-simulator':
      return {
        type: 'slider-simulator',
        title: '',
        sliders: [{ id: 'value', label: '', min: 0, max: 100, step: 1, defaultValue: 50 }],
        outputs: [{ id: 'result', label: 'Kết quả', formula: 'value', format: 'number' }],
      } as SliderSimulatorBlock;
    case 'budget-allocator':
      return {
        type: 'budget-allocator',
        title: '',
        totalBudget: 100,
        categories: [
          { id: 'cat1', label: '', color: 'blue', defaultValue: 50, minValue: 0 },
          { id: 'cat2', label: '', color: 'green', defaultValue: 50, minValue: 0 },
        ],
        outcomes: [],
      } as BudgetAllocatorBlock;
    case 'bias-detector':
      return {
        type: 'bias-detector',
        instruction: '',
        article: { text: '' },
        segments: [],
        biasOptions: [{ id: 'emotional', label: 'Ngôn ngữ cảm xúc' }],
      } as BiasDetectorBlock;
    case 'perspective-switch':
      return {
        type: 'perspective-switch',
        title: '',
        event: '',
        perspectives: [
          { id: 'p1', role: '', icon: '👤', narrative: '' },
          { id: 'p2', role: '', icon: '👤', narrative: '' },
        ],
        question: {
          text: '',
          options: [
            { id: 'a', text: '', isCorrect: true },
            { id: 'b', text: '', isCorrect: false },
          ],
          explanation: '',
        },
      } as PerspectiveSwitchBlock;
    case 'hot-cold-guess':
      return {
        type: 'hot-cold-guess',
        title: '',
        question: '',
        answer: 0,
        unit: '',
        tolerance: 10,
        hints: [],
      } as HotColdGuessBlock;
    case 'pair-match':
      return {
        type: 'pair-match',
        pairs: [
          { id: 'p1', left: '', right: '' },
          { id: 'p2', left: '', right: '' },
        ],
      } as PairMatchBlock;
    case 'flip-card':
      return {
        type: 'flip-card',
        cards: [
          { id: 'c1', front: { kind: 'text', text: '' }, back: { kind: 'text', text: '' } },
          { id: 'c2', front: { kind: 'text', text: '' }, back: { kind: 'text', text: '' } },
        ],
      } as FlipCardBlock;
    case 'sort-bucket':
      return {
        type: 'sort-bucket',
        buckets: [
          { id: 'b1', label: '' },
          { id: 'b2', label: '' },
        ],
        items: [
          { id: 'i1', text: '', bucketId: 'b1' },
          { id: 'i2', text: '', bucketId: 'b2' },
        ],
      } as SortBucketBlock;
    default:
      return { type: 'text', paragraphs: [''] };
  }
}

export function createCustomBlockInstance(bt: CustomBlockTypeFull): CustomBlockInstance {
  return {
    type: 'custom',
    customBlockTypeId: bt.id,
    fields: Object.fromEntries(
      (bt.config.editorSchema ?? []).map((f) => [f.key, f.defaultValue ?? ''])
    ),
    configSnapshot: bt.config,
  };
}
