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
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-100 group-hover/sep:bg-blue-200 transition-colors" />
      <button
        type="button"
        onClick={() => onToggleMenu(isOpen ? null : insertIndex)}
        aria-label={`Thêm block ở vị trí ${insertIndex + 1}`}
        aria-expanded={isOpen}
        className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-500
                   text-gray-600 flex items-center justify-center
                   opacity-0 group-hover/sep:opacity-100 focus-visible:opacity-100 group-hover/sep:border-blue-600 group-hover/sep:text-blue-600
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                   transition-all hover:bg-blue-50 z-10"
        title="Thêm block"
      >
        <Plus className="w-3 h-3" aria-hidden="true" />
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
