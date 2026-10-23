import type { LessonFlagKind } from '@prisma/client';
import { PUBLIC_FLAG_TEXT, type PublicFlagKind } from '@/lib/types/lesson-notices';

/** Staff labels for maintenance flags (proposal §6.21). Pure: client and server. */
export const FLAG_KIND_LABELS: Record<LessonFlagKind, string> = {
  NEEDS_SOURCES: 'Cần bổ sung nguồn',
  UNDER_REVIEW: 'Đang được xem lại',
  OUTDATED: 'Thông tin có thể đã cũ',
  NEEDS_ACCESSIBILITY: 'Cần bổ sung hỗ trợ tiếp cận (mô tả ảnh, phụ đề…)',
};

export const FLAG_KIND_ORDER: LessonFlagKind[] = ['NEEDS_SOURCES', 'UNDER_REVIEW', 'OUTDATED', 'NEEDS_ACCESSIBILITY'];

/** The banner learners see for this kind, or null for staff-only kinds (NEEDS_ACCESSIBILITY). */
export function learnerBanner(kind: LessonFlagKind): string | null {
  return kind in PUBLIC_FLAG_TEXT ? PUBLIC_FLAG_TEXT[kind as PublicFlagKind] : null;
}
