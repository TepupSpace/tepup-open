'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { blockTypes, BLOCK_GROUP_LABEL, getCustomIcon, type BlockGroup } from './block-utils';
import type { CustomBlockTypeFull } from './types';

const GROUP_ORDER: BlockGroup[] = ['basic', 'question', 'explainer'];

interface BlockPickerModalProps {
  insertIndex: number;
  customBlockTypes: CustomBlockTypeFull[];
  onAddSystemBlock: (type: string, index: number) => void;
  onAddCustomBlock: (bt: CustomBlockTypeFull, index: number) => void;
  onClose: () => void;
}

export default function BlockPickerModal({
  insertIndex,
  customBlockTypes,
  onAddSystemBlock,
  onAddCustomBlock,
  onClose,
}: BlockPickerModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.toLowerCase().trim();
  const filteredSystem = blockTypes.filter(
    (bt) => !q || bt.label.toLowerCase().includes(q) || bt.type.includes(q)
  );
  const filteredCustom = customBlockTypes.filter(
    (bt) =>
      !q ||
      bt.name.toLowerCase().includes(q) ||
      bt.slug.includes(q) ||
      bt.description?.toLowerCase().includes(q)
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm block..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* System blocks, grouped: Cơ bản / Câu hỏi / Giải thích */}
          {GROUP_ORDER.map((group) => {
            const items = filteredSystem.filter((bt) => bt.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs font-medium text-gray-400 px-2 mb-1">{BLOCK_GROUP_LABEL[group]}</p>
                <div className="grid grid-cols-2 gap-1">
                  {items.map((bt) => {
                    const Icon = bt.icon;
                    return (
                      <button
                        key={bt.type}
                        onClick={() => { onAddSystemBlock(bt.type, insertIndex); onClose(); }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="text-sm">{bt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Custom blocks */}
          {filteredCustom.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 px-2 mb-1">Blocks tùy chỉnh</p>
              <div className="space-y-1">
                {filteredCustom.map((bt) => {
                  const Icon = getCustomIcon(bt.icon);
                  return (
                    <button
                      key={bt.id}
                      onClick={() => { onAddCustomBlock(bt, insertIndex); onClose(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-violet-50 rounded-lg transition-colors text-left"
                    >
                      <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{bt.name}</p>
                        {bt.description && (
                          <p className="text-xs text-gray-400 truncate">{bt.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredSystem.length === 0 && filteredCustom.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Không tìm thấy block nào</p>
          )}
        </div>
      </div>
    </>
  );
}
