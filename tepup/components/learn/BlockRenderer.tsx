'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { ContentBlock } from '@/lib/types/content';
import { TextBlockComponent } from './TextBlock';
import { CalloutBlockComponent } from './CalloutBlock';
import { ImageBlockComponent } from './ImageBlock';
import { QuestionBlockComponent } from './QuestionBlock';
import NativeBlock, { isNativeBlock } from './NativeBlock';
import { sanitizeInlineHtml } from '@/lib/security/sanitize-html';

/**
 * Khung xám giữ chỗ trong lúc chunk của block đang về.
 *
 * Chiều cao phải xấp xỉ block thật: `LessonPlayer` đo chiều cao để tính đệm đuôi
 * và neo cuộn, nên một ô giữ chỗ cao 0 sẽ làm bố cục nhảy khi block hiện ra.
 */
function BlockSkeleton({ height = '16rem' }: { height?: string }) {
  return (
    <div
      className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"
      style={{ minHeight: height }}
      aria-hidden="true"
    />
  );
}

/**
 * Block tương tác nạp theo nhu cầu.
 *
 * Trước đây cả 10 block được import tĩnh, kéo theo `@codesandbox/sandpack-react`
 * (một bộ bundler chạy trong trình duyệt) vào bundle của MỌI bài học — kể cả bài
 * chỉ toàn chữ. Cả repo không hề có một `next/dynamic` nào.
 *
 * Giữ `ssr` mặc định để block vẫn render phía server và không gây nhảy bố cục;
 * riêng Sandpack không SSR được nên phải tắt.
 *
 * Import thẳng từng file thay vì qua barrel `@/components/blocks` — đi qua barrel
 * sẽ kéo lại cả chín block và làm việc tách chunk thành vô nghĩa.
 */
const LibraryDocumentBlockComponent = dynamic(
  () => import('./LibraryDocumentBlock').then((m) => m.LibraryDocumentBlockComponent),
  { loading: () => <BlockSkeleton height="8rem" /> }
);

const INTERACTIVE_BLOCK_MAP: Record<string, React.ComponentType<{ block: any; onComplete?: () => void }>> = {
  'calculator': dynamic(() => import('@/components/blocks/CalculatorBlock'), { loading: () => <BlockSkeleton /> }),
  'slider-simulator': dynamic(() => import('@/components/blocks/SliderSimulatorBlock'), { loading: () => <BlockSkeleton /> }),
  'budget-allocator': dynamic(() => import('@/components/blocks/BudgetAllocatorBlock'), { loading: () => <BlockSkeleton /> }),
  'bias-detector': dynamic(() => import('@/components/blocks/BiasDetectorBlock'), { loading: () => <BlockSkeleton /> }),
  'perspective-switch': dynamic(() => import('@/components/blocks/PerspectiveSwitchBlock'), { loading: () => <BlockSkeleton /> }),
  'hot-cold-guess': dynamic(() => import('@/components/blocks/HotColdGuessBlock'), { loading: () => <BlockSkeleton /> }),
  'pair-match': dynamic(() => import('@/components/blocks/PairMatchBlock'), { loading: () => <BlockSkeleton height="20rem" /> }),
  'flip-card': dynamic(() => import('@/components/blocks/FlipCardBlock'), { loading: () => <BlockSkeleton height="20rem" /> }),
  'sort-bucket': dynamic(() => import('@/components/blocks/SortBucketBlock'), { loading: () => <BlockSkeleton height="20rem" /> }),
  'custom': dynamic(() => import('@/components/blocks/CustomBlock'), {
    ssr: false,
    loading: () => <BlockSkeleton height="24rem" />,
  }),
};

/**
 * All interactive block type names.
 *
 * Chỉ đọc KHOÁ của map, không chạm tới giá trị — nên việc liệt kê ở đây không hề
 * kéo chunk nào về. `LessonPlayer` dùng mảng này để tính logic khoá nút Tiếp tục,
 * và logic đó phải chạy được ngay cả khi block tương ứng chưa tải xong.
 */
export const INTERACTIVE_BLOCK_TYPES = Object.keys(INTERACTIVE_BLOCK_MAP);

/**
 * Cùng trỏ tới các module như map trên — bundler gộp về đúng một chunk, nên gọi
 * hàm ở đây là hâm nóng sẵn chunk mà `dynamic()` sẽ cần.
 *
 * Cần thiết vì `LessonPlayer` chỉ render các nhóm đã mở: nếu không hâm trước,
 * request chunk mới bắt đầu đúng vào khoảnh khắc người học bấm mở nhóm — tức là
 * lại chờ, đúng thứ đang muốn xoá bỏ.
 */
const BLOCK_PRELOADERS: Record<string, () => Promise<unknown>> = {
  'calculator': () => import('@/components/blocks/CalculatorBlock'),
  'slider-simulator': () => import('@/components/blocks/SliderSimulatorBlock'),
  'budget-allocator': () => import('@/components/blocks/BudgetAllocatorBlock'),
  'bias-detector': () => import('@/components/blocks/BiasDetectorBlock'),
  'perspective-switch': () => import('@/components/blocks/PerspectiveSwitchBlock'),
  'hot-cold-guess': () => import('@/components/blocks/HotColdGuessBlock'),
  'pair-match': () => import('@/components/blocks/PairMatchBlock'),
  'flip-card': () => import('@/components/blocks/FlipCardBlock'),
  'sort-bucket': () => import('@/components/blocks/SortBucketBlock'),
  'custom': () => import('@/components/blocks/CustomBlock'),
  'library-document': () => import('./LibraryDocumentBlock'),
};

/** Hâm nóng chunk cho đúng những loại block mà bài học này thật sự dùng. */
export function preloadBlockTypes(types: string[]) {
  for (const type of new Set(types)) {
    BLOCK_PRELOADERS[type]?.().catch(() => {
      // Hâm trước hỏng thì không sao — `dynamic()` sẽ tự thử lại lúc render thật.
    });
  }
}

interface BlockRendererProps {
  block: ContentBlock;
  index: number;
  questionState?: { selected: string[]; checked: boolean; correct: boolean | null };
  onSelectAnswer: (blockIndex: number, optionId: string) => void;
  onInteractiveComplete: (blockIndex: number) => void;
  isLastVisible: boolean;
  explanationRef: React.RefObject<HTMLDivElement | null>;
  isCurrentBlock: boolean;
  /** Media trong nhóm hiện tại đã tải xong; `reanchor` = có cần neo lại không. */
  onMediaSettled?: (reanchor: boolean) => void;
}

export function BlockRenderer({
  block,
  index,
  questionState,
  onSelectAnswer,
  onInteractiveComplete,
  isLastVisible,
  explanationRef,
  isCurrentBlock,
  onMediaSettled,
}: BlockRendererProps) {
  const onComplete = () => onInteractiveComplete(index);
  // Chỉ media của nhóm đang hiện mới làm xê dịch bố cục mà người học nhìn thấy.
  const settled = isCurrentBlock ? () => onMediaSettled?.(isLastVisible) : undefined;

  // Reveal-group boundary is not rendered (used only by the reveal logic).
  if (block.type === 'step-break') return null;

  // Native rich-text blocks from the Notion-style editor.
  if (isNativeBlock(block.type)) return <NativeBlock block={block} onSettled={settled} />;

  // Basic block types
  if (block.type === 'text') {
    if (block.html !== undefined) {
      // Author HTML is untrusted (contributors, and content already in the DB):
      // always render the sanitised string, never `block.html` itself.
      const safe = sanitizeInlineHtml(block.html);
      // The editor turns every paragraph into its own block, so this margin is the
      // gap *between paragraphs* (16px) — it mirrors `space-y-4` in TextBlockComponent.
      const bare = safe.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      // An empty block is the author deliberately leaving a blank line in the editor.
      if (!bare) return <div className="h-4" aria-hidden="true" />;
      return (
        <div
          className="text-gray-700 leading-relaxed text-lg mb-4"
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      );
    }
    return <TextBlockComponent block={block} />;
  }
  if (block.type === 'callout') return <CalloutBlockComponent block={block} />;
  if (block.type === 'image') {
    return <ImageBlockComponent block={block} onSettled={settled} />;
  }
  if (block.type === 'library-document') return <LibraryDocumentBlockComponent block={block} />;
  if (block.type === 'question') {
    return (
      <QuestionBlockComponent
        block={block}
        onSelect={(optionId) => onSelectAnswer(index, optionId)}
        isChecked={questionState?.checked || false}
        selectedAnswer={questionState?.selected ?? []}
        isCorrect={questionState?.correct || null}
        explanationRef={isCurrentBlock ? explanationRef : undefined}
      />
    );
  }

  // Interactive block types (lookup from map)
  const InteractiveComponent = INTERACTIVE_BLOCK_MAP[block.type];
  if (InteractiveComponent) {
    return <InteractiveComponent block={block} onComplete={onComplete} />;
  }

  return null;
}
