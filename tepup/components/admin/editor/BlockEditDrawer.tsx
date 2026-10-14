'use client';
import { useId, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { X, BookMarked } from 'lucide-react';
import ReferencePicker from './ReferencePicker';
import { tvHref } from '@/lib/library/refs';
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
  // "Chèn tham chiếu" chèn link markdown vào ô chữ được focus gần nhất trong form.
  const lastField = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [picking, setPicking] = useState(false);
  const [hasField, setHasField] = useState(false);
  const [pickQuery, setPickQuery] = useState('');
  const pickBtnRef = useRef<HTMLButtonElement>(null);
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
            ref={pickBtnRef}
            type="button"
            onClick={() => {
              setPickQuery(selectionOf(lastField.current));
              setPicking((p) => !p);
            }}
            aria-expanded={picking}
            className="ml-auto mr-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <BookMarked className="w-4 h-4" aria-hidden="true" /> Chèn tham chiếu
          </button>
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

        {picking && (
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-xs text-gray-600 mb-2">
              {hasField
                ? 'Chữ đang bôi đen trong ô vừa sửa sẽ thành link tới mục bạn chọn; nếu không bôi đen gì, tên mục được chèn vào chỗ con trỏ.'
                : 'Bấm vào một ô chữ trong form trước, rồi chọn mục.'}
            </p>
            <ReferencePicker
              initialQuery={pickQuery}
              onPick={(entry) => {
                const field = lastField.current;
                setPicking(false);
                if (!field) {
                  pickBtnRef.current?.focus();
                  return;
                }
                insertMarkdownLink(field, entry.title, tvHref(entry.slug));
              }}
            />
          </div>
        )}

        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto p-5 space-y-5"
          onFocusCapture={(e) => {
            const t = e.target;
            if (t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && (t.type === 'text' || t.type === ''))) {
              lastField.current = t;
              setHasField(true);
            }
          }}
        >
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

/**
 * Bọc chữ đang chọn trong ô thành `[chữ](href)` (hoặc chèn `[title](href)` nếu không
 * chọn gì), rồi báo cho React như khi người dùng gõ: form của từng block là component
 * có kiểm soát, nên phải gọi setter gốc của value và phát sự kiện `input`.
 */
function insertMarkdownLink(field: HTMLInputElement | HTMLTextAreaElement, title: string, href: string) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  const selected = field.value.slice(start, end).trim();
  const link = `[${selected || title}](${href})`;
  const next = field.value.slice(0, start) + link + field.value.slice(end);
  const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(field, next);
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.focus();
  const caret = start + link.length;
  field.setSelectionRange(caret, caret);
}

/** Chữ đang bôi đen trong ô (để tìm sẵn trong bộ chọn tham chiếu). */
function selectionOf(field: HTMLInputElement | HTMLTextAreaElement | null): string {
  if (!field || field.selectionStart === null || field.selectionEnd === null) return '';
  return field.value.slice(field.selectionStart, field.selectionEnd);
}
