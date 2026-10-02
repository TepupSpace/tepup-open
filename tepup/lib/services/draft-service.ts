// Server-side drafts for the admin lesson and chapter editors (table ContentDraft).
//
// Drafts are stored as typed in the editor: no prepareBlocksForSave / sanitizeAdminBlocks
// here, so half-written blocks can autosave. The full validation runs on publish (the
// PUT .../content routes), and drafts are only ever loaded back into the admin editor,
// never rendered for learners. Only the shape and size are checked on save.

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ContentBlock } from '@/lib/types/content';
import type { DraftDTO, DraftTarget, LessonDraftMeta } from '@/lib/types/drafts';

const MAX_BLOCKS_JSON_LENGTH = 1_000_000;
const MAX_TITLE_LENGTH = 300;
const MAX_SLUG_LENGTH = 200;

/** A validated draft save, ready for saveDraft(). */
export interface DraftInput {
  title: string;
  blocks: unknown[];
  /** Lesson settings for LESSON drafts; always null for chapters. */
  meta: LessonDraftMeta | null;
  baseUpdatedAt: Date | null;
}

export type ParseDraftResult = { ok: true; value: DraftInput } | { ok: false; error: string };

const draftSelect = {
  title: true,
  blocks: true,
  meta: true,
  updatedAt: true,
  baseUpdatedAt: true,
  updatedBy: { select: { username: true, name: true } },
} satisfies Prisma.ContentDraftSelect;

type DraftRow = Prisma.ContentDraftGetPayload<{ select: typeof draftSelect }>;

function toDTO<M>(row: DraftRow): DraftDTO<M> {
  return {
    title: row.title,
    blocks: Array.isArray(row.blocks) ? (row.blocks as unknown as ContentBlock[]) : [],
    meta: (row.meta ?? null) as M | null,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy?.username || row.updatedBy?.name || null,
    baseUpdatedAt: row.baseUpdatedAt ? row.baseUpdatedAt.toISOString() : null,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses an ISO timestamp; anything else (missing, malformed) becomes null. */
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Validates the body of PUT .../draft (SaveDraftBody). */
export function parseDraftBody(body: unknown, target: DraftTarget): ParseDraftResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Dữ liệu nháp không hợp lệ' };
  }

  const { title, blocks, meta, baseUpdatedAt } = body;

  if (typeof title !== 'string') {
    return { ok: false, error: 'Tiêu đề nháp không hợp lệ' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Tiêu đề quá dài (tối đa ${MAX_TITLE_LENGTH} ký tự)` };
  }

  if (!Array.isArray(blocks)) {
    return { ok: false, error: 'Nội dung nháp không hợp lệ' };
  }
  if (JSON.stringify(blocks).length > MAX_BLOCKS_JSON_LENGTH) {
    return { ok: false, error: 'Bản nháp quá lớn để lưu' };
  }

  let parsedMeta: LessonDraftMeta | null = null;
  if (target === 'LESSON' && meta !== undefined && meta !== null) {
    if (!isPlainObject(meta)) {
      return { ok: false, error: 'Cài đặt bài học không hợp lệ' };
    }
    const { slug, isActive, sortOrder } = meta;
    if (typeof slug !== 'string' || slug.length > MAX_SLUG_LENGTH) {
      return { ok: false, error: 'Slug không hợp lệ' };
    }
    if (typeof isActive !== 'boolean') {
      return { ok: false, error: 'Trạng thái hiển thị không hợp lệ' };
    }
    if (typeof sortOrder !== 'number' || !Number.isFinite(sortOrder)) {
      return { ok: false, error: 'Thứ tự không hợp lệ' };
    }
    // Whitelist: anything else in meta is dropped.
    parsedMeta = { slug, isActive, sortOrder };
  }

  return {
    ok: true,
    value: {
      title,
      blocks,
      meta: parsedMeta,
      baseUpdatedAt: parseIsoDate(baseUpdatedAt),
    },
  };
}

export async function getDraft<M = null>(
  target: DraftTarget,
  targetId: string
): Promise<DraftDTO<M> | null> {
  const row = await prisma.contentDraft.findUnique({
    where: { targetType_targetId: { targetType: target, targetId } },
    select: draftSelect,
  });
  return row ? toDTO<M>(row) : null;
}

export async function saveDraft<M = null>(
  target: DraftTarget,
  targetId: string,
  input: DraftInput,
  userId: string | null
): Promise<DraftDTO<M>> {
  const data = {
    title: input.title,
    blocks: input.blocks as Prisma.InputJsonValue,
    meta:
      target === 'LESSON' && input.meta
        ? (input.meta as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull,
    baseUpdatedAt: input.baseUpdatedAt,
    updatedById: userId,
  };

  const row = await prisma.contentDraft.upsert({
    where: { targetType_targetId: { targetType: target, targetId } },
    create: { targetType: target, targetId, ...data },
    update: data,
    select: draftSelect,
  });
  return toDTO<M>(row);
}

/** Discards the draft, if any. Pass `tx` to run it inside a publish transaction. */
export async function deleteDraft(
  target: DraftTarget,
  targetId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<void> {
  await tx.contentDraft.deleteMany({ where: { targetType: target, targetId } });
}

/**
 * Publish conflict check: true when the live content was updated after the editor
 * loaded it. No check when the client sent no (valid) baseUpdatedAt or there is no
 * live content yet.
 */
export function isPublishConflict(
  liveUpdatedAt: Date | null | undefined,
  baseUpdatedAt: Date | null
): boolean {
  if (!liveUpdatedAt || !baseUpdatedAt) return false;
  return liveUpdatedAt.getTime() > baseUpdatedAt.getTime();
}

/** 409 body for a publish conflict. The editor offers "publish anyway" (force: true). */
export function publishConflictBody(liveUpdatedAt: Date) {
  return {
    error:
      'Nội dung đang hiển thị đã được cập nhật sau khi bạn mở trang (bởi người khác hoặc từ một đóng góp được duyệt). Xuất bản sẽ ghi đè thay đổi đó.',
    conflict: true as const,
    liveUpdatedAt: liveUpdatedAt.toISOString(),
  };
}
