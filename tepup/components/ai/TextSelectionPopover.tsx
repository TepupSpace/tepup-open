'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Search, PencilLine } from 'lucide-react';
import { useAIChat } from '@/lib/contexts/AIChatContext';

interface TextSelectionPopoverProps {
  /** When set, adds a "suggest a fix" action for the selected passage. */
  onSuggestEdit?: (selectedText: string) => void;
}

interface PopoverState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
}

export default function TextSelectionPopover({ onSuggestEdit }: TextSelectionPopoverProps = {}) {
  const { openWithSelection } = useAIChat();
  const [popover, setPopover] = useState<PopoverState>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';

    if (!text || text.length < 3) {
      setPopover((prev) => ({ ...prev, visible: false }));
      return;
    }

    const range = selection!.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Use viewport-relative (fixed) coordinates
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8; // 8px gap above selection

    setPopover({ visible: true, x, y, selectedText: text });
  }, []);

  useEffect(() => {
    const onMouseUp = () => {
      // Slight delay to let selection finalize
      setTimeout(handleSelectionChange, 10);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setPopover((prev) => ({ ...prev, visible: false }));
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [handleSelectionChange]);

  if (!popover.visible) return null;

  const handleAskAI = () => {
    setPopover((prev) => ({ ...prev, visible: false }));
    openWithSelection({ selectedText: popover.selectedText, mode: 'ask' });
  };

  const handleFactCheck = () => {
    setPopover((prev) => ({ ...prev, visible: false }));
    openWithSelection({ selectedText: popover.selectedText, mode: 'factcheck' });
  };

  const handleSuggestEdit = () => {
    setPopover((prev) => ({ ...prev, visible: false }));
    onSuggestEdit?.(popover.selectedText);
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${popover.y}px`,
        left: `${popover.x}px`,
        transform: 'translateX(-50%) translateY(-100%)',
        zIndex: 60,
      }}
      className="flex items-center bg-gray-900 text-white rounded-xl shadow-xl overflow-hidden"
    >
      <button
        onClick={handleAskAI}
        className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
      >
        <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
        Hỏi AI
      </button>
      <div className="w-px h-5 bg-gray-600 flex-shrink-0" />
      <button
        onClick={handleFactCheck}
        className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        Fact Check
      </button>
      {onSuggestEdit && (
        <>
          <div className="w-px h-5 bg-gray-600 flex-shrink-0" />
          <button
            onClick={handleSuggestEdit}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <PencilLine className="w-3.5 h-3.5 flex-shrink-0" />
            Góp ý sửa
          </button>
        </>
      )}
    </div>
  );
}
