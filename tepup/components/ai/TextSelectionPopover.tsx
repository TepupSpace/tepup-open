'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, FocusEvent as ReactFocusEvent } from 'react';
import { MessageCircle, Search, PencilLine, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAIChat } from '@/lib/contexts/AIChatContext';

interface TextSelectionPopoverProps {
  /**
   * When set, adds "Góp ý" for the selected passage. One form covers every kind of
   * suggestion (fix the lesson, propose a glossary term); the learner picks the kind there.
   */
  onSuggest?: (selectedText: string) => void;
}

interface PopoverState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
  /** Chọn bằng cảm ứng: hiện thành thanh ở đáy màn hình thay vì nổi trên đoạn chọn. */
  touch: boolean;
  /** Chọn bằng bàn phím: đưa focus vào thanh để tới được các nút. */
  keyboard: boolean;
}

/**
 * Trên điện thoại, chọn chữ bằng nhấn giữ thường kết thúc bằng `touchcancel` (không
 * phải `touchend`), còn kéo hai tay cầm chọn thì không bắn sự kiện chạm nào cho trang.
 * Vì vậy với cảm ứng ta theo `selectionchange` và đợi vùng chọn đứng yên một nhịp.
 */
const TOUCH_SETTLE_MS = 400;

/** Phím mở rộng vùng chọn khi giữ Shift. */
const SELECT_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

/** Chọn chữ trong ô nhập là để sửa chữ, không phải để hỏi AI. */
function isEditable(el: Element | null): boolean {
  return el instanceof HTMLElement && (el.isContentEditable || el.matches('input, textarea, select'));
}

export default function TextSelectionPopover({ onSuggest }: TextSelectionPopoverProps = {}) {
  const { openWithSelection } = useAIChat();
  const [popover, setPopover] = useState<PopoverState>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
    touch: false,
    keyboard: false,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  // "AI" mở các thao tác AI ngay trong thanh (thay chỗ các nút khác), để thanh luôn gọn
  // hai nút trên điện thoại. Mỗi lần chọn đoạn mới thì quay về thanh chính.
  const [aiMenu, setAiMenu] = useState(false);
  // Đổi nhóm nút bằng bàn phím hay chuột đều giữ focus trong thanh: nút đầu của nhóm mới.
  const focusFirstAfterSwap = useRef(false);
  // Kiểu con trỏ của lần nhấn gần nhất: chuột/bút thì dùng `mouseup`, cảm ứng thì
  // dùng `selectionchange` (xem TOUCH_SETTLE_MS).
  const lastPointerRef = useRef<string>('mouse');
  // Đang chọn bằng bàn phím (Shift+mũi tên, Ctrl/⌘+A): hiện thanh khi nhả hết phím bổ trợ.
  const keyboardSelectingRef = useRef(false);
  // Nơi focus đứng trước khi chuyển vào thanh, để Escape trả về đúng chỗ.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const handleSelectionChange = useCallback((keyboard = false) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';

    if (!selection || selection.rangeCount === 0 || !text || text.length < 3) {
      setPopover((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const touch = !keyboard && lastPointerRef.current === 'touch';

    // Chuột/bàn phím: nổi ngay trên đoạn chọn, ép trong khung nhìn để không tràn mép.
    const half = 140;
    const x = Math.min(Math.max(rect.left + rect.width / 2, half), window.innerWidth - half);
    const y = Math.max(rect.top - 8, 56);

    setPopover({ visible: true, x, y, selectedText: text, touch, keyboard });
    setAiMenu(false);
  }, []);

  useEffect(() => {
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const onPointerDown = (e: PointerEvent) => {
      lastPointerRef.current = e.pointerType;
      if (popoverRef.current?.contains(e.target as Node)) return;
      // Chạm/nhấn ra ngoài: ẩn. Với cảm ứng, selectionchange sẽ quyết định lại.
      if (e.pointerType !== 'touch') setPopover((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    const onMouseUp = () => {
      if (lastPointerRef.current === 'touch') return;
      // Slight delay to let selection finalize
      setTimeout(() => handleSelectionChange(), 10);
    };

    const onSelectionChange = () => {
      if (lastPointerRef.current !== 'touch') return;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => handleSelectionChange(), TOUCH_SETTLE_MS);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopover((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }
      if (popoverRef.current?.contains(e.target as Node) || isEditable(document.activeElement)) return;
      const selectAll = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a';
      if (selectAll || (e.shiftKey && SELECT_KEYS.has(e.key))) keyboardSelectingRef.current = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      // Chỉ hiện khi đã nhả Shift/Ctrl/⌘: giữa chừng mà cướp focus thì không chọn tiếp được.
      if (!keyboardSelectingRef.current || e.shiftKey || e.ctrlKey || e.metaKey) return;
      keyboardSelectingRef.current = false;
      if (isEditable(document.activeElement)) return;
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      handleSelectionChange(true);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      clearTimeout(settleTimer);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [handleSelectionChange]);

  // Chọn bằng bàn phím: chuyển focus tới nút đầu, nếu không thì Tab không bao giờ tới thanh.
  useEffect(() => {
    if (popover.visible && popover.keyboard) {
      popoverRef.current?.querySelector('button')?.focus();
    }
  }, [popover.visible, popover.keyboard, popover.selectedText]);

  useEffect(() => {
    if (!focusFirstAfterSwap.current) return;
    focusFirstAfterSwap.current = false;
    popoverRef.current?.querySelector('button')?.focus();
  }, [aiMenu]);

  if (!popover.visible) return null;

  const hide = () => setPopover((prev) => ({ ...prev, visible: false }));

  const handleAskAI = () => {
    hide();
    openWithSelection({ selectedText: popover.selectedText, mode: 'ask' });
  };

  const handleFactCheck = () => {
    hide();
    openWithSelection({ selectedText: popover.selectedText, mode: 'factcheck' });
  };

  const handleSuggest = () => {
    hide();
    onSuggest?.(popover.selectedText);
  };

  const toggleAiMenu = (open: boolean) => {
    focusFirstAfterSwap.current = true;
    setAiMenu(open);
  };

  const handleToolbarKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hide();
      const el = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (el?.isConnected) el.focus();
      return;
    }
    // Thanh công cụ: mũi tên trái/phải chuyển giữa các nút.
    const buttons = Array.from(e.currentTarget.querySelectorAll('button'));
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === 'ArrowRight' ? buttons[(i + 1) % buttons.length]
      : e.key === 'ArrowLeft' ? buttons[(i - 1 + buttons.length) % buttons.length]
      : e.key === 'Home' ? buttons[0]
      : e.key === 'End' ? buttons[buttons.length - 1]
      : undefined;
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  // Tab ra khỏi thanh thì ẩn, để nó không nổi lơ lửng trên trang.
  const handleToolbarBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) hide();
  };

  const buttonClass =
    'flex items-center gap-1.5 px-3 py-2.5 min-h-11 hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white';

  return (
    <div
      ref={popoverRef}
      role="toolbar"
      aria-label="Thao tác với đoạn đã chọn"
      // Giữ vùng chọn khi bấm nút: không để nút cướp focus làm mất đoạn đang chọn.
      onPointerDown={(e) => e.preventDefault()}
      onKeyDown={handleToolbarKeyDown}
      onBlur={handleToolbarBlur}
      style={
        popover.touch
          ? {
              // Cảm ứng: menu sao chép của hệ điều hành nằm ngay trên đoạn chọn, nên
              // thanh này đặt ở đáy, trên chân trang dính (nút Tiếp tục).
              position: 'fixed',
              left: '50%',
              bottom: 'calc(var(--bottom-chrome, 0rem) + env(safe-area-inset-bottom) + 1.25rem)',
              transform: 'translateX(-50%)',
              zIndex: 60,
            }
          : {
              position: 'fixed',
              top: `${popover.y}px`,
              left: `${popover.x}px`,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 60,
            }
      }
      className="flex items-center bg-gray-900 text-white rounded-xl shadow-xl overflow-hidden max-w-[calc(100vw-1rem)]"
    >
      {aiMenu ? (
        <>
          <button onClick={() => toggleAiMenu(false)} className={buttonClass} aria-label="Quay lại">
            <ChevronLeft className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          </button>
          <div className="w-px h-5 bg-gray-600 flex-shrink-0" aria-hidden="true" />
          <button onClick={handleAskAI} className={buttonClass}>
            <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Hỏi AI
          </button>
          <div className="w-px h-5 bg-gray-600 flex-shrink-0" aria-hidden="true" />
          <button onClick={handleFactCheck} className={buttonClass}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Kiểm chứng
          </button>
        </>
      ) : (
        <>
          <button onClick={() => toggleAiMenu(true)} className={buttonClass} aria-expanded={false}>
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            AI
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 -ml-0.5" aria-hidden="true" />
          </button>
          {onSuggest && (
            <>
              <div className="w-px h-5 bg-gray-600 flex-shrink-0" aria-hidden="true" />
              <button onClick={handleSuggest} className={buttonClass}>
                <PencilLine className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                Góp ý
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
