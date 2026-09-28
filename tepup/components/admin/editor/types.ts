import type { CustomBlockInstance, CustomBlockTypeConfig } from '@/lib/types/custom-block';

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
  /** Absent means 'single' — see the canonical copy in lib/types/content.ts. */
  mode?: 'single' | 'multiple';
  options: { id: string; text: string; isCorrect: boolean }[];
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
  }[];
  formula: string;
  outputs: {
    id: string;
    label: string;
    unit?: string;
    formula: string;
    highlight?: boolean;
  }[];
  presets?: { label: string; values: Record<string, number> }[];
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
    bars: { label: string; formula: string; color?: string }[];
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
  comparison?: { label: string; values: Record<string, number> };
}

export interface BiasDetectorBlock {
  type: 'bias-detector';
  title?: string;
  instruction: string;
  article: { text: string; source?: string };
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
  perspectives: { id: string; role: string; icon?: string; narrative: string }[];
  question?: {
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation?: string;
  };
}

export interface HotColdGuessBlock {
  type: 'hot-cold-guess';
  title?: string;
  question: string;
  answer: number;
  unit?: string;
  tolerance?: number;
  hints?: string[];
  context?: string;
}

export interface PairMatchBlock {
  type: 'pair-match';
  title?: string;
  instruction?: string;
  pairs: { id: string; left: string; right: string }[];
}

export type FlipCardFace =
  | { kind: 'text'; text: string }
  | { kind: 'image'; src: string; alt?: string };

export interface FlipCardBlock {
  type: 'flip-card';
  title?: string;
  instruction?: string;
  cards: { id: string; front: FlipCardFace; back: FlipCardFace }[];
}

export interface SortBucketBlock {
  type: 'sort-bucket';
  title?: string;
  instruction?: string;
  buckets: { id: string; label: string }[];
  items: { id: string; text: string; bucketId: string }[];
}

export type ContentBlock =
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
  | CustomBlockInstance;

export interface CustomBlockTypeFull {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  accentColor: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  config: CustomBlockTypeConfig;
}

export interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}
