'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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
import BlockPickerModal from './BlockPickerModal';
import BlockSeparator from './BlockSeparator';
import {
  getBlockBorderColor,
  getBlockIcon,
  getBlockLabel,
  getBlockPreview,
  createEmptyBlock,
  createCustomBlockInstance,
} from './block-utils';
import type { ContentBlock, CustomBlockTypeFull, BlockEditorProps } from './types';

// Re-export types for backward compatibility
export type {
  TextBlock,
  ImageBlock,
  CalloutBlock,
  QuestionBlock,
  LibraryDocumentBlock,
  CalculatorBlock,
  SliderSimulatorBlock,
  BudgetAllocatorBlock,
  BiasDetectorBlock,
  PerspectiveSwitchBlock,
  HotColdGuessBlock,
  PairMatchBlock,
  FlipCardBlock,
  SortBucketBlock,
  ContentBlock,
} from './types';

/** Map block type to its editor component */
const BLOCK_EDITOR_MAP: Record<string, React.ComponentType<{ block: any; onChange: (b: any) => void }>> = {
  'text': TextBlockEditor,
  'image': ImageBlockEditor,
  'callout': CalloutBlockEditor,
  'question': QuestionBlockEditor,
  'library-document': LibraryDocumentBlockEditor,
  'calculator': CalculatorBlockEditor,
  'slider-simulator': SliderSimulatorBlockEditor,
  'budget-allocator': BudgetAllocatorBlockEditor,
  'bias-detector': BiasDetectorBlockEditor,
  'perspective-switch': PerspectiveSwitchBlockEditor,
  'hot-cold-guess': HotColdGuessBlockEditor,
  'pair-match': PairMatchBlockEditor,
  'flip-card': FlipCardBlockEditor,
  'sort-bucket': SortBucketBlockEditor,
  'custom': CustomBlockEditor,
};

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<number>>(new Set());
  const [customBlockTypes, setCustomBlockTypes] = useState<CustomBlockTypeFull[]>([]);

  useEffect(() => {
    fetch('/api/admin/custom-block-types')
      .then((r) => r.json())
      .then((json) => { if (json.data) setCustomBlockTypes(json.data); })
      .catch(() => {});
  }, []);

  function toggleCollapse(index: number) {
    setCollapsedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function addBlock(type: string, index: number) {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, createEmptyBlock(type));
    onChange(newBlocks);
    setShowAddMenu(null);
  }

  function addCustomBlock(bt: CustomBlockTypeFull, index: number) {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, createCustomBlockInstance(bt));
    onChange(newBlocks);
    setShowAddMenu(null);
  }

  function updateBlock(index: number, block: ContentBlock) {
    const newBlocks = [...blocks];
    newBlocks[index] = block;
    onChange(newBlocks);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
    setCollapsedBlocks(new Set());
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
    setCollapsedBlocks(new Set());
  }

  function renderBlockEditor(block: ContentBlock, index: number) {
    const Editor = BLOCK_EDITOR_MAP[block.type];
    if (!Editor) return null;
    return <Editor block={block} onChange={(b) => updateBlock(index, b)} />;
  }

  return (
    <div>
      {blocks.length === 0 ? (
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(showAddMenu === 0 ? null : 0)}
            className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Thêm block mới</span>
            <span className="text-xs text-gray-300">Bài học chưa có nội dung</span>
          </button>
          {showAddMenu === 0 && (
            <BlockPickerModal
              insertIndex={0}
              customBlockTypes={customBlockTypes}
              onAddSystemBlock={addBlock}
              onAddCustomBlock={addCustomBlock}
              onClose={() => setShowAddMenu(null)}
            />
          )}
        </div>
      ) : (
        <>
          <BlockSeparator
            insertIndex={0}
            showAddMenu={showAddMenu}
            customBlockTypes={customBlockTypes}
            onToggleMenu={setShowAddMenu}
            onAddSystemBlock={addBlock}
            onAddCustomBlock={addCustomBlock}
          />
          {blocks.map((block, index) => {
            const isCollapsed = collapsedBlocks.has(index);
            const borderColor = getBlockBorderColor(block.type);
            const BlockIcon = getBlockIcon(block.type);
            const preview = getBlockPreview(block);

            return (
              <div key={index}>
                <div
                  className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden"
                  style={{ borderLeft: `4px solid ${borderColor}` }}
                >
                  {/* Block header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-move shrink-0" />
                      <span className="text-xs font-mono text-gray-400 tabular-nums shrink-0 w-6">#{index + 1}</span>
                      <BlockIcon className="w-4 h-4 shrink-0" style={{ color: borderColor }} />
                      <span className="text-sm font-medium text-gray-600 shrink-0">{getBlockLabel(block.type)}</span>
                      {isCollapsed && <span className="text-sm text-gray-400 truncate">— {preview}</span>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleCollapse(index)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}>
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-0.5" />
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Di chuyển lên">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Di chuyển xuống">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeBlock(index)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Xóa block">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {!isCollapsed && <div className="p-4">{renderBlockEditor(block, index)}</div>}
                </div>
                <BlockSeparator
                  insertIndex={index + 1}
                  showAddMenu={showAddMenu}
                  customBlockTypes={customBlockTypes}
                  onToggleMenu={setShowAddMenu}
                  onAddSystemBlock={addBlock}
                  onAddCustomBlock={addCustomBlock}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
