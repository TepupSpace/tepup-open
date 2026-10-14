'use client';
import { useEffect, useRef, useState } from 'react';
import { BookMarked } from 'lucide-react';
import type { BlockSchema, InlineContentSchema, StyleSchema } from '@blocknote/core';
import { useBlockNoteEditor, useComponentsContext, useEditorState, useExtension } from '@blocknote/react';
import { FormattingToolbarExtension, ShowSelectionExtension } from '@blocknote/core/extensions';
import ReferencePicker from '../ReferencePicker';
import { tvHref } from '@/lib/library/refs';

/**
 * Nút "Tham chiếu" trên thanh định dạng: bôi đen chữ → chọn một mục thư viện →
 * chữ đó thành link `/tv/<slug>` (docs/design-reference-library.md §5.1). Link này đi
 * qua isSafeLinkHref nên được giữ khi lưu (lib/editor/inline-html.ts).
 */
export function ReferenceLinkButton() {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor<BlockSchema, InlineContentSchema, StyleSchema>();
  const [open, setOpenState] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Như nút "Tạo liên kết" của BlockNote: giữ vùng chọn hiện rõ (và thanh công cụ mở) trong
  // khi focus nằm ở ô tìm của popover, nếu không thanh công cụ đóng và popover biến mất theo.
  const { showSelection } = useExtension(ShowSelectionExtension);
  const toolbar = useExtension(FormattingToolbarExtension);
  useEffect(() => {
    showSelection(open, 'referenceLinkButton');
    return () => showSelection(false, 'referenceLinkButton');
  }, [open, showSelection]);

  // Như nút Trợ năng: Mantine không trả focus khi popover đóng, nên tự trả về nút.
  const setOpen = (next: boolean) => {
    if (open && !next) {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (triggerRef.current?.isConnected && (!active || active === document.body)) triggerRef.current.focus();
      });
    }
    setOpenState(next);
  };

  const hasText = useEditorState({
    editor,
    selector: ({ editor }) => editor.isEditable && editor.getSelectedText().trim().length > 0,
  });
  if (!hasText) return null;

  return (
    <Components.Generic.Popover.Root open={open} onOpenChange={setOpen}>
      <Components.Generic.Popover.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label="Tham chiếu"
          mainTooltip="Gắn chữ đang chọn với một mục thư viện (mục từ, nguồn, viết tắt, công cụ)"
          icon={<BookMarked size={16} aria-hidden="true" />}
          isSelected={open}
          onClick={(e) => {
            triggerRef.current = e.currentTarget as HTMLElement;
            setOpen(!open);
          }}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content className="bn-popover-content" variant="form-popover">
        <div role="group" aria-label="Chèn tham chiếu thư viện" className="w-80 max-w-full max-h-[70vh] overflow-y-auto p-1">
          <ReferencePicker
            initialQuery={editor.getSelectedText()}
            onPick={(entry) => {
              editor.createLink(tvHref(entry.slug));
              setOpen(false);
              toolbar.store.setState(false);
              editor.focus();
            }}
          />
        </div>
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
}
