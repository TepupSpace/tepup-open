/**
 * Grading for the `question` block, shared by the lesson player and every preview
 * surface (editor widget, chapter editor, dev/blocks, contributor guide) so they
 * can't drift apart.
 */

export interface QuizOption {
  id: string;
  isCorrect: boolean;
}

export interface QuizShape {
  mode?: 'single' | 'multiple';
  options: QuizOption[];
}

/** Apply a click to the current selection. Single choice replaces, multiple toggles. */
export function toggleAnswer(selected: string[], optionId: string, mode?: 'single' | 'multiple'): string[] {
  if (mode !== 'multiple') return [optionId];
  return selected.includes(optionId)
    ? selected.filter((id) => id !== optionId)
    : [...selected, optionId];
}

/**
 * Multiple choice is all-or-nothing: the picked set must equal the correct set —
 * no missing answers, no extras. Single choice keeps its original rule (the one
 * picked option is flagged correct), so blocks with malformed data grade exactly
 * as they did before the mode existed.
 */
export function isAnswerCorrect(block: QuizShape, selected: string[]): boolean {
  if (block.mode !== 'multiple') {
    return block.options.some((o) => o.id === selected[0] && o.isCorrect);
  }
  const correct = block.options.filter((o) => o.isCorrect).map((o) => o.id);
  if (correct.length === 0) return false;
  const picked = new Set(selected);
  return picked.size === correct.length && correct.every((id) => picked.has(id));
}
