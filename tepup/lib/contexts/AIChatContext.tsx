'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import type {
  AIChatContextType,
  AISettings,
  ChatMessage,
  SelectionContext,
  AIModel,
  PersonaId,
} from '@/lib/types/ai-chat';

const SETTINGS_KEY = 'tepup_ai_settings';

const DEFAULT_SETTINGS: AISettings = {
  model: 'llama-3.3-70b-versatile',
  personaId: 'default',
};

function readSettings(): AISettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function writeSettings(settings: AISettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<SelectionContext | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  // Keep a ref to messages so sendMessage callback doesn't go stale
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);
  const toggleSettings = useCallback(() => setIsSettingsOpen((prev) => !prev), []);

  const updateModel = useCallback((model: AIModel) => {
    setSettings((prev) => {
      const next = { ...prev, model };
      writeSettings(next);
      return next;
    });
  }, []);

  const updatePersona = useCallback((personaId: PersonaId) => {
    setSettings((prev) => {
      const next = { ...prev, personaId };
      writeSettings(next);
      return next;
    });
  }, []);

  const clearMessages = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const clearPendingSelection = useCallback(() => setPendingSelection(null), []);

  const sendMessage = useCallback(
    async (userText: string, selectionContext?: SelectionContext) => {
      if (isStreaming) return;

      // Build display content and API content
      let apiContent = userText;
      let displayContent = userText;

      if (selectionContext) {
        if (selectionContext.mode === 'factcheck') {
          apiContent = `Hãy fact-check nội dung sau đây với các nguồn học thuật uy tín:\n\n"${selectionContext.selectedText}"`;
          displayContent = apiContent;
        } else {
          apiContent = `Về đoạn văn sau:\n"${selectionContext.selectedText}"\n\nCâu hỏi của tôi: ${userText}`;
          displayContent = apiContent;
        }
      }

      const userMessage: ChatMessage = {
        id: genId(),
        role: 'user',
        content: displayContent,
        timestamp: Date.now(),
      };

      const assistantId = genId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsStreaming(true);

      // Build history for API using the ref (current before this message)
      const historyForApi = [
        ...messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: apiContent },
      ];

      try {
        abortRef.current = new AbortController();

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historyForApi,
            model: settings.model,
            personaId: settings.personaId,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`API error: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: accumulated } : m
                    )
                  );
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (parseErr) {
                if ((parseErr as Error).message !== 'Unexpected end of JSON input') {
                  throw parseErr;
                }
              }
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: '❌ Đã xảy ra lỗi. Vui lòng thử lại.', isStreaming: false }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, settings]
  );

  const openWithSelection = useCallback(
    (context: SelectionContext) => {
      setIsOpen(true);
      setIsSettingsOpen(false);
      if (context.mode === 'factcheck') {
        sendMessage('', context);
      } else {
        setPendingSelection(context);
      }
    },
    [sendMessage]
  );

  return (
    <AIChatContext.Provider
      value={{
        isOpen, openChat, closeChat, toggleChat,
        isSettingsOpen, toggleSettings,
        settings, updateModel, updatePersona,
        messages, isStreaming, sendMessage, clearMessages,
        pendingSelection, clearPendingSelection,
        openWithSelection,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error('useAIChat must be used within AIChatProvider');
  return ctx;
}
