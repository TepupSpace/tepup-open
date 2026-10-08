'use client';
import { useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { createReactBlockSpec } from '@blocknote/react';
import { useWidgetEdit } from './WidgetEditContext';
import { BlockRenderer } from '@/components/learn/BlockRenderer';
import type { ContentBlock } from '@/lib/types/content';
import { toggleAnswer } from '@/lib/utils/quiz';
import { getBlockLabel } from '../block-utils';

/**
 * A Tepup widget carried opaquely inside the BlockNote document. In the editor it
 * renders the REAL learner-facing widget (via BlockRenderer) so authors see and can
 * interact with it exactly as students will. The "Sửa" button opens the edit drawer —
 * it appears on hover, and stays pinned once the block is clicked (BlockNote's own
 * text cursor never lands here, since the block is `content: 'none'`).
 * The widget config lives in `props.payload` (JSON of the ContentBlock).
 *
 * Keyboard: Tab inside the editor indents blocks, so the "Sửa" button is mouse-first. Arrow
 * keys select the whole block (BlockNote adds `.ProseMirror-selectednode` above it, which
 * pins the button and the ring here) and Enter opens the drawer (NotionBlockEditor).
 */
function WidgetPreview({ blockId, payload }: { blockId: string; payload: string }) {
  const ctx = useWidgetEdit();
  const explanationRef = useRef<HTMLDivElement>(null);
  const [questionState, setQuestionState] = useState<
    Record<number, { selected: string[]; checked: boolean; correct: boolean | null }>
  >({});
  const [, setCompleted] = useState<Record<number, boolean>>({});

  let cb: ContentBlock | null = null;
  try {
    cb = payload ? (JSON.parse(payload) as ContentBlock) : null;
  } catch {
    cb = null;
  }

  const isSelected = ctx?.selectedId === blockId;
  const label =
    cb?.type === 'custom'
      ? (cb as { configSnapshot?: { name?: string } }).configSnapshot?.name || getBlockLabel('custom')
      : getBlockLabel(cb?.type ?? '');

  return (
    // Mouse convenience only (pins the "Sửa" button after a click); keyboard users select
    // the block with the arrow keys and press Enter, see the comment above.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- mouse-only pinning, keyboard route above
    <div
      contentEditable={false}
      data-widget-block={blockId}
      onMouseDown={() => ctx?.setSelectedId(blockId)}
      className={`group relative my-2 rounded-xl transition-all p-3 in-[.ProseMirror-selectednode]:ring-2 in-[.ProseMirror-selectednode]:ring-blue-600 ${
        isSelected ? 'ring-2 ring-blue-600' : 'ring-1 ring-gray-200 hover:ring-blue-300'
      }`}
    >
      <button
        type="button"
        onClick={() => ctx?.openEditor(blockId)}
        aria-label={cb ? `Sửa block ${label}` : 'Sửa block chưa cấu hình'}
        className={`absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 bg-white border shadow-sm rounded-lg text-xs font-medium transition-all hover:text-blue-700 hover:border-blue-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 in-[.ProseMirror-selectednode]:opacity-100 ${
          isSelected
            ? 'opacity-100 text-blue-700 border-blue-300'
            : 'opacity-0 group-hover:opacity-100 text-gray-600 border-gray-200'
        }`}
      >
        <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Sửa
      </button>

      {cb ? (
        <BlockRenderer
          // Widget tương tác giữ state theo id con (slider, input…) và chỉ khởi tạo lúc
          // mount. Đổi cấu hình (form hoặc dán JSON) phải mount lại, nếu không state cũ
          // trỏ vào id không còn tồn tại và làm sập trang.
          key={payload}
          block={cb}
          index={0}
          questionState={questionState[0]}
          onSelectAnswer={(i, optionId) =>
            setQuestionState((s) => ({
              ...s,
              [i]: {
                selected: toggleAnswer(
                  s[i]?.selected ?? [],
                  optionId,
                  cb?.type === 'question' ? cb.mode : undefined
                ),
                checked: false,
                correct: null,
              },
            }))
          }
          onInteractiveComplete={(i) => setCompleted((c) => ({ ...c, [i]: true }))}
          isLastVisible={false}
          explanationRef={explanationRef}
          isCurrentBlock={false}
        />
      ) : (
        <p className="text-sm text-gray-500">Block chưa cấu hình — bấm Sửa.</p>
      )}
    </div>
  );
}

export const TepupWidgetBlock = createReactBlockSpec(
  {
    type: 'tepup-widget',
    propSchema: { payload: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block }) => (
      <WidgetPreview blockId={block.id} payload={(block.props as { payload: string }).payload} />
    ),
  }
);
