'use client';
import { X } from 'lucide-react';
import TextBlockEditor from './TextBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import CalloutBlockEditor from './CalloutBlockEditor';
import QuestionBlockEditor from './QuestionBlockEditor';
import LibraryDocumentBlockEditor from './LibraryDocumentBlockEditor';
import CalculatorBlockEditor from './CalculatorBlockEditor';
import SliderSimulatorBlockEditor from './SliderSimulatorBlockEditor';
import BudgetAllocatorBlockEditor from './BudgetAllocatorBlockEditor';
import BiasDetectorBlockEditor from './BiasDetectorBlockEditor';
import PerspectiveSwitchBlockEditor from './PerspectiveSwitchBlockEditor';
import HotColdGuessBlockEditor from './HotColdGuessBlockEditor';
import PairMatchBlockEditor from './PairMatchBlockEditor';
import FlipCardBlockEditor from './FlipCardBlockEditor';
import SortBucketBlockEditor from './SortBucketBlockEditor';
import CustomBlockEditor from './CustomBlockEditor';
import AiImportPanel from './AiImportPanel';
import { getBlockLabel } from './block-utils';
import type { ContentBlock } from '@/lib/types/content';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormComponent = React.ComponentType<{ block: any; onChange: (b: any) => void }>;

const FORM_MAP: Record<string, FormComponent> = {
  text: TextBlockEditor,
  image: ImageBlockEditor,
  callout: CalloutBlockEditor,
  question: QuestionBlockEditor,
  'library-document': LibraryDocumentBlockEditor,
  calculator: CalculatorBlockEditor,
  'slider-simulator': SliderSimulatorBlockEditor,
  'budget-allocator': BudgetAllocatorBlockEditor,
  'bias-detector': BiasDetectorBlockEditor,
  'perspective-switch': PerspectiveSwitchBlockEditor,
  'hot-cold-guess': HotColdGuessBlockEditor,
  'pair-match': PairMatchBlockEditor,
  'flip-card': FlipCardBlockEditor,
  'sort-bucket': SortBucketBlockEditor,
  custom: CustomBlockEditor,
};

interface Props {
  block: ContentBlock | null;
  onChange: (block: ContentBlock) => void;
  onClose: () => void;
}

/** Right slide-over that edits a Tepup widget block's fields, with a bring-your-own-AI import panel. */
export default function BlockEditDrawer({ block, onChange, onClose }: Props) {
  if (!block) return null;

  const Form = FORM_MAP[block.type];
  const label =
    block.type === 'custom'
      ? (block as { configSnapshot?: { name?: string } }).configSnapshot?.name || 'Block tùy chỉnh'
      : getBlockLabel(block.type);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={`Chỉnh sửa ${label}`}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-xl flex flex-col animate-slide-in-right"
      >
        <header className="flex items-center justify-between px-5 h-16 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{label}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <AiImportPanel key={block.id} block={block} onApply={(b) => onChange({ ...b, id: block.id } as ContentBlock)} />

          {/* Bespoke form */}
          {Form ? (
            <Form block={block} onChange={(b: ContentBlock) => onChange({ ...b, id: block.id } as ContentBlock)} />
          ) : (
            <p className="text-sm text-gray-500">Block này chưa có form chỉnh sửa.</p>
          )}
        </div>
      </div>
    </>
  );
}
