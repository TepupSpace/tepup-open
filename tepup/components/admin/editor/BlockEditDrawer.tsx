'use client';
import { useId, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
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

/**
 * Right slide-over that edits a Tepup widget block's fields, with an optional (collapsed)
 * bring-your-own-AI import panel below.
 *
 * Modal dialog: focus moves to the first field, is trapped inside, Escape (or the close
 * button / backdrop) closes it, and focus returns to what opened it (the widget's "Sửa"
 * button, or the editor when opened with Enter).
 */
export default function BlockEditDrawer({ block, onChange, onClose }: Props) {
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  if (!block) return null;

  const Form = FORM_MAP[block.type];
  const label =
    block.type === 'custom'
      ? (block as { configSnapshot?: { name?: string } }).configSnapshot?.name || 'Block tùy chỉnh'
      : getBlockLabel(block.type);

  return (
    <>
      {/* Backdrop: mouse convenience; keyboard users close with Escape or "Đóng". */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden />
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: true,
          allowOutsideClick: true,
          returnFocusOnDeactivate: true,
          onDeactivate: onClose,
          initialFocus: () =>
            bodyRef.current?.querySelector<HTMLElement>(
              'input:not([type="hidden"]):not([type="file"]):not([tabindex="-1"]), textarea, select'
            ) ??
            closeRef.current ??
            false,
          fallbackFocus: () => closeRef.current ?? document.body,
        }}
      >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-xl flex flex-col animate-slide-in-right"
      >
        <header className="flex items-center justify-between px-5 h-16 border-b border-gray-200 shrink-0">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 truncate">
            <span className="sr-only">Chỉnh sửa block: </span>
            {label}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Bespoke form first: these are the block's real fields. */}
          {Form ? (
            <Form block={block} onChange={(b: ContentBlock) => onChange({ ...b, id: block.id } as ContentBlock)} />
          ) : (
            <p className="text-sm text-gray-500">Block này chưa có form chỉnh sửa.</p>
          )}

          {/* Optional and collapsed by default: its textareas used to sit on top and were
              mistaken for the block's own fields. */}
          <AiImportPanel key={block.id} block={block} onApply={(b) => onChange({ ...b, id: block.id } as ContentBlock)} />
        </div>
      </div>
      </FocusTrap>
    </>
  );
}
