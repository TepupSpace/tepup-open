'use client';

import { useAIChat } from '@/lib/contexts/AIChatContext';
import { PERSONAS, PERSONA_ORDER, MODEL_OPTIONS } from '@/lib/ai/personas';

export default function AIChatSettings() {
  const { settings, updateModel, updatePersona } = useAIChat();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      {/* Model selection */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Model AI
        </h3>
        <div className="space-y-2">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateModel(opt.id as Parameters<typeof updateModel>[0])}
              className={`
                w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                ${settings.model === opt.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <p className={`text-sm font-medium ${settings.model === opt.id ? 'text-blue-700' : 'text-gray-800'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Persona selection */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Nhân vật AI
        </h3>
        <div className="space-y-2">
          {PERSONA_ORDER.map((personaId) => {
            const persona = PERSONAS[personaId];
            const isActive = settings.personaId === personaId;
            return (
              <button
                key={personaId}
                onClick={() => updatePersona(personaId)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                  ${isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{persona.emoji}</span>
                  <div>
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                      {persona.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{persona.label}</p>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
