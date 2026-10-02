'use client';
import '@blocknote/mantine/style.css';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core';
import { vi as viDictionary } from '@blocknote/core/locales';
import { tepupSchema } from './blocknote/schema';
import { WidgetEditContext } from './blocknote/WidgetEditContext';
import BlockEditDrawer from './BlockEditDrawer';
import { EditorModeContext, CONTRIBUTOR_NO_UPLOAD_MESSAGE, type EditorMode } from './EditorModeContext';
import {
  toBlockNote,
  toContentBlocks,
  type BNBlock,
} from '@/lib/editor/blocknote-converter';
import { numberTopLevelBlocks } from '@/lib/editor/block-numbering';
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

// Slash-menu group labels. The rest come from BlockNote's Vietnamese dictionary
// (`@blocknote/core/locales`), which also translates its toolbars and menus.
const GROUP_FREQUENT = 'Hay dùng';
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

/** Escapes a value for use inside a quoted CSS attribute selector. */
function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/gu, (c) => `\\${c.codePointAt(0)!.toString(16)} `);
}

/*
 * Block numbers in the left gutter ("Block #7" in publish errors = the 7 here).
 *
 * Drawn as `::before` of the top-level `.bn-block-outer[data-id]` (BlockNote's DOM:
 * `.bn-editor > .bn-block-group > .bn-block-outer > .bn-block > .bn-block-content`),
 * from a <style> element this component owns: one rule per numbered block id. Nothing
 * in BlockNote's DOM is touched, so the numbers survive BlockNote's re-renders, and
 * generated content is never selected or copied with the text.
 *
 * BlockNote's side menu (+ and drag handle, about 48px) sits in the editor's 54px left
 * padding, right next to the block. The numbers go further left, in an extra gutter
 * added to that padding, so the two never overlap. The number box has a fixed width,
 * so going from 9 to 10 doesn't move anything.
 *
 * Vertical alignment: `--tepup-num-top` is the block's top padding (globals.css sets
 * paragraph 0.5rem and heading 2rem; BlockNote's default is 3px) and `--tepup-num-line`
 * the height of its first line (font size x line-height 1.625), so the number sits in
 * the middle of the block's first line.
 */
const GUTTER_PX = 30; // number box (28px) + 2px from the editor edge
const SIDE_MENU_PX = 52; // BlockNote's side menu is ~48px wide, inside 54px of padding

function numberingCss(scope: string, numbers: Map<string, number>): string {
  const top = `${scope} .bn-editor > .bn-block-group > .bn-block-outer`;
  const has = (sel: string) => `${top}:has(> .bn-block > .bn-block-content${sel})`;
  const rules = [
    `${scope} .bn-editor { padding-left: ${54 + GUTTER_PX}px; }`,
    `${top} { position: relative; --tepup-num-top: 3px; --tepup-num-line: calc(1.125rem * 1.625); }`,
    `${has('[data-content-type="paragraph"]')} { --tepup-num-top: 0.5rem; }`,
    `${has('[data-content-type="heading"]')} { --tepup-num-top: 2rem; --tepup-num-line: calc(1.5rem * 1.625); }`,
    `${has('[data-content-type="heading"][data-level="1"]')} { --tepup-num-line: calc(1.875rem * 1.625); }`,
    `${has('[data-content-type="codeBlock"]')} { --tepup-num-top: 27px; }`,
    `${has('[data-content-type="table"]')} { --tepup-num-top: 18px; }`,
    `${top}::before {` +
      ' position: absolute;' +
      ' top: var(--tepup-num-top);' +
      ` right: calc(100% + ${SIDE_MENU_PX}px);` +
      ' width: 28px;' +
      ' text-align: right;' +
      ' font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;' +
      ' font-size: 12px;' +
      ' font-weight: 400;' +
      ' font-style: normal;' +
      ' font-variant-numeric: tabular-nums;' +
      ' line-height: var(--tepup-num-line);' +
      ' letter-spacing: 0;' +
      ' white-space: nowrap;' +
      ' color: #6b7280;' + // text-gray-500: readable when matching an error's "Block #N"
      ' -webkit-user-select: none;' +
      ' user-select: none;' +
      ' pointer-events: none;' +
      ' }',
  ];
  for (const [id, n] of numbers) {
    rules.push(`${top}[data-id="${cssEscape(id)}"]::before { content: "${n}"; }`);
  }
  return rules.join('\n');
}

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  /**
   * `contributor`: never calls the admin-only APIs (custom block types, image upload,
   * admin library), so contributors get no 401s. File upload is off: images are added
   * by URL from the allowed hosts (see EditorModeContext). Default `admin`.
   */
  mode?: EditorMode;
}

/** BlockNote's Vietnamese UI, with the URL box saying which image URLs are accepted. */
const DICTIONARY_ADMIN = viDictionary;
const DICTIONARY_CONTRIBUTOR = {
  ...viDictionary,
  file_panel: {
    ...viDictionary.file_panel,
    embed: {
      ...viDictionary.file_panel.embed,
      title: 'Dán URL',
      url_placeholder: 'https://upload.wikimedia.org/wikipedia/…',
    },
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function NotionBlockEditor({ blocks, onChange, mode = 'admin' }: Props) {
  const isContributor = mode === 'contributor';
  const [customTypes, setCustomTypes] = useState<CustomBlockTypeFull[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Load custom block types for the slash menu (admin only: contributors can't use
  // `custom` blocks, and the endpoint would answer 401).
  useEffect(() => {
    if (isContributor) return;
    fetch('/api/admin/custom-block-types')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setCustomTypes(d.data ?? d.blockTypes ?? []))
      .catch(() => setCustomTypes([]));
  }, [isContributor]);

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

  // Without `uploadFile` BlockNote hides its "Upload" tab and ignores pasted/dropped
  // files, so contributors only see the URL tab.
  const editor = useCreateBlockNote({
    schema: tepupSchema,
    initialContent,
    uploadFile: isContributor ? undefined : uploadFile,
    dictionary: isContributor ? DICTIONARY_CONTRIBUTOR : DICTIONARY_ADMIN,
  });

  const emitChange = useCallback(() => {
    onChangeRef.current(toContentBlocks(editor.document as unknown as BNBlock[]));
  }, [editor]);

  // Gutter block numbers: rewrite this editor's <style> on mount and on every change
  // (its own subscription, so what `onChange` emits is untouched). Written straight to
  // the element, so typing doesn't re-render this component.
  const numberingScope = useId();
  const numberingStyleRef = useRef<HTMLStyleElement>(null);
  useLayoutEffect(() => {
    const scope = `[data-tepup-block-numbers="${cssEscape(numberingScope)}"]`;
    const update = () => {
      const el = numberingStyleRef.current;
      if (!el) return;
      const css = numberingCss(scope, numberTopLevelBlocks(editor.document as unknown as BNBlock[]));
      if (el.textContent !== css) el.textContent = css;
    };
    update();
    return editor.onChange(update);
  }, [editor, numberingScope]);

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
    <EditorModeContext.Provider value={mode}>
    <WidgetEditContext.Provider value={widgetCtx}>
      <p className="mb-2 text-xs text-gray-500">
        Số bên trái là số thứ tự block, khớp với &ldquo;Block #…&rdquo; trong thông báo lỗi.
        Dòng trống không có số và sẽ được bỏ khi lưu.
      </p>
      {isContributor && (
        <p className="mb-2 text-xs text-gray-500" data-testid="contributor-image-note">
          <span className="font-medium text-gray-600">Ảnh:</span> {CONTRIBUTOR_NO_UPLOAD_MESSAGE}
        </p>
      )}
      <style ref={numberingStyleRef} />
      <div
        data-tepup-block-numbers={numberingScope}
        className="tepup-lesson-editor bg-white rounded-2xl border border-gray-100 p-2 sm:p-4 min-h-[400px]"
      >
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
    </EditorModeContext.Provider>
  );
}
