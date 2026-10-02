// Server-side drafts for the admin lesson and chapter editors.
//
// "Lưu nháp" (and autosave) writes a ContentDraft row that learners never see;
// "Xuất bản" (publish) copies it into LessonContent / ChapterContent and deletes it.
// Drafts are stored as typed in the editor (half-written blocks included): the full
// validation runs on publish, and drafts are only ever loaded back into the admin editor.

import type { ContentBlock } from './content';

export type DraftTarget = 'LESSON' | 'CHAPTER';

/** Lesson settings from the side panel. They take effect on publish, never on draft save. */
export interface LessonDraftMeta {
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

/** A draft as the API returns it. */
export interface DraftDTO<M = null> {
  title: string;
  blocks: ContentBlock[];
  meta: M | null;
  /** ISO timestamp of the last draft save. */
  updatedAt: string;
  /** Username (or name) of whoever saved it last, if known. */
  updatedBy: string | null;
  /** ISO `updatedAt` of the live content when this draft was started, for the publish conflict check. */
  baseUpdatedAt: string | null;
}

/** Body of PUT /api/admin/{lessons/[id] | chapters/[chapterId]}/draft. */
export interface SaveDraftBody<M = null> {
  title: string;
  blocks: ContentBlock[];
  meta?: M | null;
  baseUpdatedAt: string | null;
}

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
