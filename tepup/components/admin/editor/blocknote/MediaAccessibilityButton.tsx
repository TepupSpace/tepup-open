'use client';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Accessibility } from 'lucide-react';
import type { BlockSchema, InlineContentSchema, StyleSchema } from '@blocknote/core';
import {
  FormattingToolbar,
  getFormattingToolbarItems,
  useBlockNoteEditor,
  useComponentsContext,
  useEditorState,
} from '@blocknote/react';

/**
 * "Trợ năng" button in BlockNote's toolbar for image, video and audio blocks. It edits
 * the accessibility props added in `schema.ts`: alt text / "decorative" for images,
 * captions URL and transcript for video and audio. Built like BlockNote's own
 * FileCaptionButton (a popover form that updates the block on every change).
 */

const MEDIA_TYPES = new Set(['image', 'video', 'audio']);

interface MediaA11yProps {
  alt?: string;
  decorative?: boolean;
  captionsUrl?: string;
  transcript?: string;
}

const FIELD =
  'w-full rounded-md border border-gray-500 bg-white px-2 py-1.5 text-sm text-gray-900 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500';

export function MediaAccessibilityButton() {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor<BlockSchema, InlineContentSchema, StyleSchema>();
  const [open, setOpenState] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const uid = useId();

  // Mantine's popover doesn't return focus when it closes (Escape, Enter in a field, click
  // outside), so the focused field would vanish and focus fall to <body>. Put it back on the
  // "Trợ năng" button, unless the user already moved it somewhere else.
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(open) : next;
    if (open && !value) {
      requestAnimationFrame(() => {
        const trigger = triggerRef.current;
        const active = document.activeElement;
        if (trigger?.isConnected && (!active || active === document.body)) trigger.focus();
      });
    }
    setOpenState(value);
  };

  const block = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor.isEditable) return undefined;
      const selected = editor.getSelection()?.blocks || [editor.getTextCursorPosition().block];
      if (selected.length !== 1 || !MEDIA_TYPES.has(selected[0].type)) return undefined;
      return selected[0];
    },
  });

  if (block === undefined) return null;

  const props = block.props as MediaA11yProps;
  const isImage = block.type === 'image';
  const update = (next: MediaA11yProps) => editor.updateBlock(block.id, { props: next as never });
  // Enter closes the popover from a one-line field (not mid-IME composition: Vietnamese).
  const closeOnEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <Components.Generic.Popover.Root open={open} onOpenChange={setOpen}>
      <Components.Generic.Popover.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label="Trợ năng"
          mainTooltip={isImage ? 'Mô tả ảnh cho người khiếm thị' : 'Phụ đề và bản ghi lời'}
          icon={<Accessibility size={16} aria-hidden="true" />}
          isSelected={open}
          onClick={(e) => {
            triggerRef.current = e.currentTarget as HTMLElement;
            setOpen((o) => !o);
          }}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content className="bn-popover-content" variant="form-popover">
        <div
          role="group"
          aria-label={isImage ? 'Trợ năng của ảnh' : 'Trợ năng của video hoặc âm thanh'}
          className="w-80 max-w-full space-y-3 p-1 text-sm text-gray-700"
        >
          {isImage ? (
            <>
              <label className="block">
                <span className="mb-1 block font-medium">Mô tả ảnh (alt)</span>
                <input
                  type="text"
                  className={FIELD}
                  value={props.decorative ? '' : props.alt ?? ''}
                  disabled={props.decorative === true}
                  maxLength={300}
                  aria-describedby={`${uid}-alt-hint`}
                  // eslint-disable-next-line jsx-a11y/no-autofocus -- the user just opened this popover to fill it in; Mantine doesn't move focus into it
                  autoFocus
                  placeholder="VD: Biểu đồ cột: nhóm thu nhập thấp chịu VAT cao hơn"
                  onChange={(e) => update({ alt: e.currentTarget.value })}
                  onKeyDown={closeOnEnter}
                />
              </label>
              <p id={`${uid}-alt-hint`} className="text-xs text-gray-500">
                Viết điều ảnh muốn nói cho người không nhìn thấy. Không dùng tên tệp.
              </p>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                  checked={props.decorative === true}
                  onChange={(e) => update({ decorative: e.currentTarget.checked })}
                />
                <span>Ảnh trang trí, không cần mô tả</span>
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block font-medium">Phụ đề (URL tệp .vtt)</span>
                <input
                  type="url"
                  className={FIELD}
                  value={props.captionsUrl ?? ''}
                  maxLength={2048}
                  aria-describedby={`${uid}-vtt-hint`}
                  // eslint-disable-next-line jsx-a11y/no-autofocus -- the user just opened this popover to fill it in; Mantine doesn't move focus into it
                  autoFocus
                  placeholder="https://…/phu-de.vtt"
                  onChange={(e) => update({ captionsUrl: e.currentTarget.value })}
                  onKeyDown={closeOnEnter}
                />
              </label>
              <p id={`${uid}-vtt-hint`} className="text-xs text-gray-500">
                Tệp WebVTT tiếng Việt, đặt ở cùng nơi được phép như video (kho của Tépup hoặc Wikimedia).
              </p>
              <label className="block">
                <span className="mb-1 block font-medium">Bản ghi lời</span>
                <textarea
                  className={FIELD}
                  rows={6}
                  value={props.transcript ?? ''}
                  maxLength={20000}
                  placeholder="Toàn bộ lời nói và âm thanh quan trọng. Người học mở được ngay dưới trình phát."
                  onChange={(e) => update({ transcript: e.currentTarget.value })}
                />
              </label>
            </>
          )}
        </div>
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
}

/** BlockNote's default formatting toolbar with the "Trợ năng" button after "Chú thích". */
export function TepupFormattingToolbar() {
  const items = getFormattingToolbarItems();
  const at = items.findIndex((item) => item.key === 'fileCaptionButton');
  items.splice(at + 1, 0, <MediaAccessibilityButton key="mediaAccessibilityButton" />);
  return <FormattingToolbar>{items}</FormattingToolbar>;
}
