'use client';
import { useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { createReactBlockSpec } from '@blocknote/react';
import { useWidgetEdit } from './WidgetEditContext';
import { BlockRenderer } from '@/components/learn/BlockRenderer';
import type { ContentBlock } from '@/lib/types/content';
import { toggleAnswer } from '@/lib/utils/quiz';

/**
 * A Tepup widget carried opaquely inside the BlockNote document. In the editor it
 * renders the REAL learner-facing widget (via BlockRenderer) so authors see and can
 * interact with it exactly as students will. The "Sửa" button opens the edit drawer —
 * it appears on hover, and stays pinned once the block is clicked (BlockNote's own
 * text cursor never lands here, since the block is `content: 'none'`).
 * The widget config lives in `props.payload` (JSON of the ContentBlock).
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

  return (
    <div
      contentEditable={false}
      data-widget-block={blockId}
      onMouseDown={() => ctx?.setSelectedId(blockId)}
      className={`group relative my-2 rounded-xl transition-all p-3 ${
        isSelected ? 'ring-2 ring-blue-400' : 'ring-1 ring-gray-100 hover:ring-blue-200'
      }`}
    >
      <button
        type="button"
        onClick={() => ctx?.openEditor(blockId)}
        className={`absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 bg-white border shadow-sm rounded-lg text-xs font-medium transition-all hover:text-blue-600 hover:border-blue-300 ${
          isSelected
            ? 'opacity-100 text-blue-600 border-blue-300'
            : 'opacity-0 group-hover:opacity-100 text-gray-600 border-gray-200'
        }`}
      >
        <Pencil className="w-3.5 h-3.5" /> Sửa
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
        <p className="text-sm text-gray-400">Block chưa cấu hình — bấm Sửa.</p>
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
