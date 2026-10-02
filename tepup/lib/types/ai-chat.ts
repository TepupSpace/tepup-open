// Groq retired mixtral-8x7b-32768, llama3-8b-8192 and gemma2-9b-it; only this one is still served.
export type AIModel = 'llama-3.3-70b-versatile';

export type PersonaId = 'default';

export interface Persona {
  id: PersonaId;
  name: string;
  label: string;
  emoji: string;
  systemPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  /** The reply failed; shown to the learner but not sent back to the AI as history. */
  isError?: boolean;
}

export interface SelectionContext {
  selectedText: string;
  mode: 'ask' | 'factcheck';
}

export interface AISettings {
  model: AIModel;
  personaId: PersonaId;
}

export interface AIChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  isSettingsOpen: boolean;
  toggleSettings: () => void;

  settings: AISettings;
  updateModel: (model: AIModel) => void;
  updatePersona: (personaId: PersonaId) => void;

  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (userText: string, selectionContext?: SelectionContext) => Promise<void>;
  clearMessages: () => void;

  pendingSelection: SelectionContext | null;
  clearPendingSelection: () => void;
  openWithSelection: (context: SelectionContext) => void;
}
