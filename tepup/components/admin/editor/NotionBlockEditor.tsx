'use client';
import '@blocknote/mantine/style.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core';
import { tepupSchema } from './blocknote/schema';
import { WidgetEditContext } from './blocknote/WidgetEditContext';
import BlockEditDrawer from './BlockEditDrawer';
import {
  toBlockNote,
  toContentBlocks,
  type BNBlock,
} from '@/lib/editor/blocknote-converter';
import {
  blockTypes,
  blockTypesInGroup,
  BLOCK_GROUP_LABEL,
  createEmptyBlock,
  createCustomBlockInstance,
  getAccentHex,
  getBlockBorderColor,
  getCustomIcon,
  STEP_BREAK_ICON,
} from './block-utils';
import type { ContentBlock } from '@/lib/types/content';
import type { CustomBlockTypeFull } from './types';

// Slash-menu group labels. The rest come from BlockNote's own English dictionary
// (Headings / Basic blocks / Advanced / Media / Others).
const GROUP_FREQUENT = 'Frequently used';
const GROUP_QUESTION = BLOCK_GROUP_LABEL.question;
const GROUP_EXPLAINER = BLOCK_GROUP_LABEL.explainer;
const GROUP_CUSTOM = 'Block tùy chỉnh';

const byType = (type: string) => blockTypes.find((b) => b.type === type)!;
// text/image are native BlockNote blocks; the other basic types sit in "Frequently used".
const FREQUENT_WIDGETS = [byType('callout'), byType('library-document')];
const QUESTION_WIDGETS = blockTypesInGroup('question');
const EXPLAINER_WIDGETS = blockTypesInGroup('explainer');

/**
 * Slash-menu icon for a Tepup block: the block's own lucide glyph inside a
 * tinted chip in that block's signature colour, so Tepup entries read as a
 * distinct family next to BlockNote's plain monochrome icons.
 */
function WidgetIcon({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  return (
    <span
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: `${color}26`, color, boxShadow: `inset 0 0 0 1px ${color}59` }}
    >
      <Icon size={13} strokeWidth={2.25} />
    </span>
  );
}

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function NotionBlockEditor({ blocks, onChange }: Props) {
  const [customTypes, setCustomTypes] = useState<CustomBlockTypeFull[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Load custom block types for the slash menu.
  useEffect(() => {
    fetch('/api/admin/custom-block-types')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setCustomTypes(d.data ?? d.blockTypes ?? []))
      .catch(() => setCustomTypes([]));
  }, []);

  // Build the editor once from the initial blocks (ContentBlock[] stays canonical).
  const initialContent = useMemo(() => {
    const bn = toBlockNote(blocks);
    return bn.length ? (bn as any) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload thất bại');
    const data = await res.json();
    return data.publicUrl as string;
  }, []);

  const editor = useCreateBlockNote({ schema: tepupSchema, initialContent, uploadFile });

  const emitChange = useCallback(() => {
    onChangeRef.current(toContentBlocks(editor.document as unknown as BNBlock[]));
  }, [editor]);

  const openEditor = useCallback(
    (blockId: string) => {
      const b = editor.getBlock(blockId) as any;
      if (!b || b.type !== 'tepup-widget') return;
      try {
        setEditingBlock(JSON.parse(b.props.payload) as ContentBlock);
        setEditingId(blockId);
      } catch {
        /* ignore malformed payload */
      }
    },
    [editor]
  );

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest('[data-widget-block]')) setSelectedId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const insertWidget = useCallback(
    (cb: ContentBlock) => {
      const cur = editor.getTextCursorPosition().block;
      const inserted = editor.insertBlocks(
        [{ type: 'tepup-widget', props: { payload: JSON.stringify(cb) } } as any],
        cur,
        'after'
      );
      emitChange();
      const id = (inserted as any)[0]?.id;
      if (id) openEditor(id);
    },
    [editor, emitChange, openEditor]
  );

  const onDrawerChange = useCallback(
    (updated: ContentBlock) => {
      setEditingBlock(updated);
      if (editingId) {
        editor.updateBlock(editingId, { props: { payload: JSON.stringify(updated) } } as any);
        emitChange();
      }
    },
    [editor, editingId, emitChange]
  );

  const widgetItem = useCallback(
    (w: (typeof blockTypes)[number], group: string) => ({
      title: w.label,
      group,
      icon: <WidgetIcon icon={w.icon} color={getBlockBorderColor(w.type)} />,
      onItemClick: () => insertWidget(createEmptyBlock(w.type) as unknown as ContentBlock),
    }),
    [insertWidget]
  );

  const getSlashItems = useCallback(
    async (query: string) => {
      const defaults = getDefaultReactSlashMenuItems(editor);

      const frequentItems = [
        {
          title: 'Ngắt bước',
          subtext: 'Ranh giới nhóm reveal cho học viên',
          group: GROUP_FREQUENT,
          icon: <WidgetIcon icon={STEP_BREAK_ICON} color={getBlockBorderColor('step-break')} />,
          onItemClick: () => {
            const cur = editor.getTextCursorPosition().block;
            editor.insertBlocks([{ type: 'step-break', props: {} } as any], cur, 'after');
            emitChange();
          },
        },
        ...FREQUENT_WIDGETS.map((w) => widgetItem(w, GROUP_FREQUENT)),
      ];

      const questionItems = QUESTION_WIDGETS.map((w) => widgetItem(w, GROUP_QUESTION));
      const explainerItems = EXPLAINER_WIDGETS.map((w) => widgetItem(w, GROUP_EXPLAINER));
      const customItems = customTypes.map((bt) => ({
        title: bt.name,
        subtext: bt.description || undefined,
        group: GROUP_CUSTOM,
        icon: (
          <WidgetIcon icon={getCustomIcon(bt.icon)} color={getAccentHex(bt.accentColor)} />
        ),
        onItemClick: () => insertWidget(createCustomBlockInstance(bt) as unknown as ContentBlock),
      }));

      // Array order IS display order: BlockNote emits a group header whenever the
      // group changes, so each group must stay contiguous and in this sequence.
      const items = [
        ...frequentItems,
        ...questionItems,
        ...explainerItems,
        ...defaults,
        ...customItems,
      ] as typeof defaults;
      return filterSuggestionItems(items, query);
    },
    [editor, customTypes, insertWidget, emitChange, widgetItem]
  );

  const widgetCtx = useMemo(
    () => ({ openEditor, selectedId, setSelectedId }),
    [openEditor, selectedId]
  );

  return (
    <WidgetEditContext.Provider value={widgetCtx}>
      <div className="tepup-lesson-editor bg-white rounded-2xl border border-gray-100 p-2 sm:p-4 min-h-[400px]">
        <BlockNoteView
          editor={editor as any}
          theme="light"
          slashMenu={false}
          onChange={emitChange}
        >
          <SuggestionMenuController triggerCharacter="/" getItems={getSlashItems} />
        </BlockNoteView>
      </div>

      <BlockEditDrawer
        block={editingBlock}
        onChange={onDrawerChange}
        onClose={() => {
          setEditingId(null);
          setEditingBlock(null);
        }}
      />
    </WidgetEditContext.Provider>
  );
}
