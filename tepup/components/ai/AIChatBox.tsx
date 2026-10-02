'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { MessageSquare, X, Settings, Trash2, Send } from 'lucide-react';
import { useAIChat } from '@/lib/contexts/AIChatContext';
import { PERSONAS } from '@/lib/ai/personas';
import ChatMessageBubble from './ChatMessageBubble';
import AIChatSettings from './AIChatSettings';

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when chat opens (and not in settings)
  useEffect(() => {
    if (isOpen && !isSettingsOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen, isSettingsOpen]);

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

  const currentPersona = PERSONAS[settings.personaId] ?? PERSONAS['default'];

  const canSend = (inputText.trim().length > 0 || pendingSelection !== null) && !isStreaming;

  return (
    <div className="above-bottom-chrome fixed right-4 sm:right-6 z-[55] flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div
          className="
            w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[65dvh] sm:max-h-[520px]
            flex flex-col
            bg-white rounded-2xl shadow-2xl border border-gray-200
            animate-slide-up
          "
          role="dialog"
          aria-modal="true"
          aria-label={`Chat với ${currentPersona.name}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl leading-none flex-shrink-0">{currentPersona.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentPersona.name}</p>
                <p className="text-xs text-gray-400 truncate">{currentPersona.label}</p>
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
                onClick={closeChat}
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
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite" aria-relevant="additions">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <span className="text-5xl mb-3 leading-none">{currentPersona.emoji}</span>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Chat với {currentPersona.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Hỏi bất cứ điều gì về bài học, hoặc bôi đen một đoạn văn và chọn &ldquo;Hỏi AI&rdquo;
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatMessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-100 px-3 py-3 flex-shrink-0">
                {/* Selection context chip */}
                {pendingSelection && (
                  <div className="flex items-start gap-2 mb-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-500 font-medium mb-0.5">Đoạn được chọn:</p>
                      <p className="text-xs text-blue-700 line-clamp-2">
                        &ldquo;{pendingSelection.selectedText}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={clearPendingSelection}
                      className="flex-shrink-0 text-blue-300 hover:text-blue-500 transition-colors mt-0.5"
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
                      pendingSelection
                        ? 'Nhập câu hỏi của bạn về đoạn văn trên...'
                        : 'Nhập câu hỏi... (Enter để gửi)'
                    }
                    rows={1}
                    disabled={isStreaming}
                    className="
                      flex-1 resize-none rounded-xl border border-gray-200
                      px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400
                      max-h-[120px] overflow-y-auto leading-relaxed
                      disabled:opacity-50 bg-gray-50 focus:bg-white transition-colors
                    "
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    aria-label="Gửi tin nhắn"
                    className="
                      p-2.5 bg-blue-500 hover:bg-blue-600 text-white
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
                <p className="mt-2 px-1 text-[11px] leading-snug text-gray-400">
                  AI có thể sai. Tin nhắn được gửi tới một dịch vụ AI bên ngoài để trả lời. Đừng nhập
                  thông tin cá nhân như họ tên, số điện thoại hay địa chỉ.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleChat}
        className="
          w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white
          rounded-full shadow-lg flex items-center justify-center
          transition-all active:scale-95
        "
        title={isOpen ? 'Đóng chat' : 'Mở chat AI'}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat AI'}
        aria-expanded={isOpen}
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
