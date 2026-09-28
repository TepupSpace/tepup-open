'use client';

import { Plus } from 'lucide-react';
import BlockPickerModal from './BlockPickerModal';
import type { CustomBlockTypeFull } from './types';

interface BlockSeparatorProps {
  insertIndex: number;
  showAddMenu: number | null;
  customBlockTypes: CustomBlockTypeFull[];
  onToggleMenu: (index: number | null) => void;
  onAddSystemBlock: (type: string, index: number) => void;
  onAddCustomBlock: (bt: CustomBlockTypeFull, index: number) => void;
}

export default function BlockSeparator({
  insertIndex,
  showAddMenu,
  customBlockTypes,
  onToggleMenu,
  onAddSystemBlock,
  onAddCustomBlock,
}: BlockSeparatorProps) {
  const isOpen = showAddMenu === insertIndex;

  return (
    <div className="relative group/sep h-8 flex items-center">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-100 group-hover/sep:bg-blue-200 transition-colors" />
      <button
        onClick={() => onToggleMenu(isOpen ? null : insertIndex)}
        className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-200
                   text-gray-300 flex items-center justify-center
                   opacity-0 group-hover/sep:opacity-100 group-hover/sep:border-blue-300 group-hover/sep:text-blue-500
                   transition-all hover:bg-blue-50 z-10"
        title="Thêm block"
      >
        <Plus className="w-3 h-3" />
      </button>

      {isOpen && (
        <BlockPickerModal
          insertIndex={insertIndex}
          customBlockTypes={customBlockTypes}
          onAddSystemBlock={onAddSystemBlock}
          onAddCustomBlock={onAddCustomBlock}
          onClose={() => onToggleMenu(null)}
        />
      )}
    </div>
  );
}
