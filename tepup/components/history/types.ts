/**
 * Shapes returned by /api/history/** (client-safe, no Prisma imports) and link helpers
 * shared by the history pages, the hub section and recent changes.
 */

export type HistoryTargetType = 'LESSON' | 'CHAPTER' | 'LIBRARY_ENTRY' | 'COURSE_OUTLINE';
export type HistoryArea = 'admin' | 'contributor';
export type RevisionSourceName = 'BASELINE' | 'ADMIN_PUBLISH' | 'CONTRIBUTION' | 'COURSE_LEAD' | 'ROLLBACK' | 'SCRIPT' | 'DELETED';

export interface RevisionListItem {
  id: string;
  createdAt: string;
  source: RevisionSourceName;
  label: string;
  actor: string | null;
  author: string | null;
  contributionId: string | null;
  patrolled: boolean;
  patrolledBy: string | null;
  patrolledAt: string | null;
}

export interface HistoryListResponse {
  target: {
    type: HistoryTargetType;
    id: string;
    label: string;
    exists: boolean;
    courseId: string | null;
  };
  viewer: { isAdmin: boolean; canRestore: boolean; canPatrol: boolean };
  revisions: RevisionListItem[];
  nextCursor: string | null;
}

export interface RevisionDetailResponse {
  revision: RevisionListItem & { targetType: HistoryTargetType; targetId: string; courseId: string | null };
  snapshot: unknown;
  previous: { id: string; createdAt: string; source: RevisionSourceName; snapshot: unknown } | null;
  /** The live version now (null: none, or the target was deleted). */
  live: unknown | null;
  targetExists: boolean;
  /** Id of the newest revision of the target (send as baseRevisionId when restoring). */
  latestRevisionId: string | null;
  /** Library entry link targets: id → title (for EntryDiff). */
  linkTitles: Record<string, string>;
  viewer: {
    isAdmin: boolean;
    /** Restore is offered (a non-admin restore of lesson content may still be refused with 422). */
    canRestore: boolean;
    canPatrol: boolean;
  };
}

export interface RecentChangeRow extends RevisionListItem {
  targetType: HistoryTargetType;
  targetId: string;
  courseId: string | null;
  courseName: string | null;
  targetExists: boolean;
  canPatrol: boolean;
}

export interface RecentChangesResponse {
  rows: RecentChangeRow[];
  nextCursor: string | null;
  viewer: { isAdmin: boolean; global: boolean };
  /** Courses the viewer may filter by. */
  courses: { id: string; name: string }[];
}

export const TARGET_LABELS: Record<HistoryTargetType, string> = {
  LESSON: 'Bài học',
  CHAPTER: 'Chương truyện',
  LIBRARY_ENTRY: 'Mục thư viện',
  COURSE_OUTLINE: 'Mục lục khóa học',
};

export const SOURCE_LABELS: Record<RevisionSourceName, string> = {
  BASELINE: 'Bản gốc (trước khi có lịch sử)',
  ADMIN_PUBLISH: 'Quản trị viên xuất bản',
  CONTRIBUTION: 'Đề xuất được duyệt',
  COURSE_LEAD: 'Trưởng khóa học',
  ROLLBACK: 'Khôi phục',
  SCRIPT: 'Script',
  DELETED: 'Đã xóa',
};

/** Where the target itself is edited/viewed. Reviewers in the admin area use the contributor hubs. */
export function targetHref(area: HistoryArea, isAdmin: boolean, type: HistoryTargetType, id: string): string {
  if (area === 'admin' && isAdmin) {
    switch (type) {
      case 'LESSON':
        return `/admin/lessons/${id}/content`;
      case 'CHAPTER':
        return `/admin/chapters/${id}/content`;
      case 'LIBRARY_ENTRY':
        return `/admin/library-entries/${id}`;
      case 'COURSE_OUTLINE':
        return `/admin/courses/${id}`;
    }
  }
  switch (type) {
    case 'LESSON':
      return `/contributor/lessons/${id}`;
    case 'CHAPTER':
      return `/contributor/chapters/${id}`;
    case 'LIBRARY_ENTRY':
      return `/contributor/library/${id}`;
    case 'COURSE_OUTLINE':
      return historyHref(area, type, id);
  }
}

export function historyHref(area: HistoryArea, type: HistoryTargetType, id: string, revisionId?: string): string {
  const base = `/${area}/history/${type}/${encodeURIComponent(id)}`;
  return revisionId ? `${base}?rev=${encodeURIComponent(revisionId)}` : base;
}

const dateFmt = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export function formatTime(iso: string): string {
  return dateFmt.format(new Date(iso));
}
