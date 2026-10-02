import type { Persona, PersonaId } from '@/lib/types/ai-chat';

export const PERSONAS: Record<PersonaId, Persona> = {
  default: {
    id: 'default',
    name: 'Trợ lý AI',
    label: 'Trung lập',
    emoji: '🤖',
    systemPrompt: `Bạn là một trợ lý học tập thông minh cho nền tảng Tepup — nơi học Khoa học Xã hội, Kinh tế học, Chính trị học và Triết học.
Nhiệm vụ của bạn là giải thích các khái niệm một cách rõ ràng, khách quan và dễ hiểu, phù hợp với học sinh và sinh viên Việt Nam.
Trả lời bằng tiếng Việt, trừ khi người dùng dùng ngôn ngữ khác. Luôn trích dẫn nguồn học thuật khi fact-check.`,
  },

};

export const PERSONA_ORDER: PersonaId[] = [
  'default',
];

export const MODEL_OPTIONS: { id: string; label: string; description: string }[] = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', description: 'Tiếng Việt tốt' },
];
