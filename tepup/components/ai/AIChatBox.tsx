'use client';

import { useState, useRef, useEffect, useId, useCallback, KeyboardEvent } from 'react';
import { MessageSquare, X, Settings, Trash2, Send } from 'lucide-react';
import { useAIChat } from '@/lib/contexts/AIChatContext';
import { PERSONAS } from '@/lib/ai/personas';
import ChatMessageBubble from './ChatMessageBubble';
import AIChatSettings from './AIChatSettings';
import type { ChatMessage } from '@/lib/types/ai-chat';

const ANNOUNCE_MAX = 200;

/** What the live region says once a reply has finished (never token by token). */
function describeReply(msg: ChatMessage | undefined, personaName: string): string {
  if (!msg || msg.role !== 'assistant' || msg.isStreaming) return '';
  if (msg.isError) {
    // The error is the last paragraph; any text streamed before it stays in the transcript.
    const error = msg.content.split('\n\n').pop()?.replace(/^❌\s*/, '') ?? '';
    return `Lỗi: ${error}`;
  }
  const text = msg.content.trim();
  if (!text) return `${personaName} đã trả lời.`;
  const short = text.length > ANNOUNCE_MAX ? `${text.slice(0, ANNOUNCE_MAX).trimEnd()}…` : text;
  return `${personaName} đã trả lời: ${short}`;
}

export default function AIChatBox() {
  const {
    isOpen, toggleChat, closeChat,
    isSettingsOpen, toggleSettings,
    settings,
    messages, isStreaming,
    sendMessage, clearMessages,
    pendingSelection, clearPendingSelection,
  } = useAIChat();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const currentPersona = PERSONAS[settings.personaId] ?? PERSONAS['default'];

  // Screen readers hear a finished reply once, not every streamed token: the live
  // region changes only when streaming starts/stops (state adjusted during render).
  const [announcement, setAnnouncement] = useState('');
  const [wasStreaming, setWasStreaming] = useState(isStreaming);
  if (isStreaming !== wasStreaming) {
    setWasStreaming(isStreaming);
    setAnnouncement(isStreaming ? '' : describeReply(messages.at(-1), currentPersona.name));
  }

  // Auto-scroll to bottom when messages change. JS smooth scrolling ignores the CSS
  // reduced-motion rule, so check it here.
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }, [messages]);

  // Focus textarea when chat opens (and not in settings), and when a passage is
  // attached or removed: the chip's X button unmounts, which would drop focus.
  useEffect(() => {
    if (isOpen && !isSettingsOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen, isSettingsOpen, pendingSelection]);

  // When a reply starts the send button is disabled, which would drop its focus; a
  // fact-check started from the selection popover lands here too.
  useEffect(() => {
    if (isStreaming && isOpen && !isSettingsOpen) textareaRef.current?.focus();
  }, [isStreaming, isOpen, isSettingsOpen]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputText]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text && !pendingSelection) return;
    if (isStreaming) return;
    sendMessage(text, pendingSelection ?? undefined);
    setInputText('');
    clearPendingSelection();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // The panel is not modal: closing it from inside sends focus back to the toggle
  // instead of letting it fall to <body>.
  const closeAndReturnFocus = useCallback(() => {
    closeChat();
    toggleRef.current?.focus();
  }, [closeChat]);

  // Escape closes the panel while focus is anywhere in the chat (panel or toggle).
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && rootRef.current?.contains(document.activeElement)) {
        closeAndReturnFocus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeAndReturnFocus]);

  const canSend = (inputText.trim().length > 0 || pendingSelection !== null) && !isStreaming;

  return (
    <div ref={rootRef} className="above-bottom-chrome fixed right-4 sm:right-6 z-[55] flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div
          className="
            w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[65dvh] sm:max-h-[520px]
            flex flex-col
            bg-white rounded-2xl shadow-2xl border border-gray-200
            animate-slide-up
          "
          id={panelId}
          role="dialog"
          aria-label={`Chat với ${currentPersona.name}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl leading-none flex-shrink-0">{currentPersona.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentPersona.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentPersona.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => clearMessages()}
                title="Xóa lịch sử chat"
                aria-label="Xóa lịch sử chat"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
              <button
                onClick={toggleSettings}
                title="Cài đặt"
                aria-label="Cài đặt"
                aria-expanded={isSettingsOpen}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSettingsOpen
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={closeAndReturnFocus}
                title="Đóng"
                aria-label="Đóng chat"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Body: settings or chat */}
          {isSettingsOpen ? (
            <AIChatSettings />
          ) : (
            <>
              {/* Messages area: deliberately not live, see `announcement` */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <span className="text-5xl mb-3 leading-none">{currentPersona.emoji}</span>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Chat với {currentPersona.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Hỏi bất cứ điều gì về bài học, hoặc bôi đen một đoạn văn và chọn &ldquo;Hỏi AI&rdquo;
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatMessageBubble key={msg.id} message={msg} assistantName={currentPersona.name} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-100 px-3 py-3 flex-shrink-0">
                {/* Selection context chip */}
                {pendingSelection && (
                  <div className="flex items-start gap-2 mb-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-700 font-medium mb-0.5">Đoạn được chọn:</p>
                      <p className="text-xs text-blue-700 line-clamp-2">
                        &ldquo;{pendingSelection.selectedText}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={clearPendingSelection}
                      className="flex-shrink-0 -mt-1 -mr-1.5 p-1.5 rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors"
                      aria-label="Xóa đoạn được chọn"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Nhập câu hỏi cho AI"
                    placeholder={
                      isStreaming
                        ? 'Đang trả lời...'
                        : pendingSelection
                          ? 'Nhập câu hỏi của bạn về đoạn văn trên...'
                          : 'Nhập câu hỏi... (Enter để gửi)'
                    }
                    rows={1}
                    // readOnly, not disabled: disabling the focused field would drop focus.
                    readOnly={isStreaming}
                    aria-busy={isStreaming}
                    className="
                      flex-1 resize-none rounded-xl border border-gray-500
                      px-3 py-2.5 text-sm focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-blue-600
                      focus-visible:ring-offset-2 focus-visible:ring-offset-white
                      max-h-[120px] overflow-y-auto leading-relaxed
                      bg-gray-50 focus:bg-white transition-colors
                    "
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    aria-label="Gửi tin nhắn"
                    className="
                      p-2.5 bg-blue-600 hover:bg-blue-700 text-white
                      rounded-xl transition-colors flex-shrink-0
                      disabled:opacity-40 disabled:cursor-not-allowed
                      active:scale-95
                    "
                  >
                    {isStreaming ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {/* Learners chat anonymously: tell them where their words go before they type. */}
                <p className="mt-2 px-1 text-xs leading-snug text-gray-500">
                  AI có thể sai. Tin nhắn được gửi tới một dịch vụ AI bên ngoài để trả lời. Đừng nhập
                  thông tin cá nhân như họ tên, số điện thoại hay địa chỉ.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Always mounted, so a change of its text is announced. */}
      <p className="sr-only" aria-live="polite">{announcement}</p>

      {/* Toggle button */}
      <button
        ref={toggleRef}
        onClick={toggleChat}
        className="
          w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white
          rounded-full shadow-lg flex items-center justify-center
          transition-all active:scale-95
        "
        title={isOpen ? 'Đóng chat' : 'Mở chat AI'}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat AI'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
