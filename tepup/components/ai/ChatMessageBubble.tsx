'use client';

import type { ChatMessage } from '@/lib/types/ai-chat';

interface Props {
  message: ChatMessage;
}

export default function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }
        `}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.isStreaming && (
          <span className="inline-block w-2 h-3.5 bg-current opacity-60 animate-pulse ml-0.5 align-middle rounded-sm" />
        )}
      </div>
    </div>
  );
}
