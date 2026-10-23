'use client';

import { useMemo } from 'react';
import type { CourseOutline } from '@/lib/types/outline';
import { diffOutline, type OutlineChange } from '@/lib/diff';
import { ChangeBadge, Del, Ins, WordDiffText, type ChangeKind } from '@/components/history/DiffParts';

/**
 * Diff of two course outlines: renamed, moved, reordered, inserted, hidden/shown lessons
 * and levels, course name/description. `before` null = first version.
 */
export default function OutlineDiff({ before, after }: { before: CourseOutline | null; after: CourseOutline }) {
  const diff = useMemo(() => diffOutline(before, after), [before, after]);
  const { course, levels, lessons } = diff.summary;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-800">
        {before === null ? 'Phiên bản đầu tiên: ' : ''}
        {course} thay đổi ở khóa học, {levels} ở level, {lessons} ở bài học.
      </p>
      {diff.changes.length === 0 ? (
        <p className="text-sm text-gray-600">Không có thay đổi.</p>
      ) : (
        <ul className="space-y-2">
          {diff.changes.map((c, i) => (
            <li key={i} className="flex flex-wrap items-start gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm">
              <ChangeBadge kind={kindOf(c)} label={badgeLabel(c)} />
              <span className="min-w-0 flex-1 break-words text-gray-800">{describe(c)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function kindOf(c: OutlineChange): ChangeKind {
  if (c.kind.endsWith('-inserted')) return 'added';
  if (c.kind.endsWith('-removed')) return 'removed';
  if (c.kind === 'lesson-shown' || c.kind === 'lesson-hidden') return 'info';
  return 'changed';
}

function badgeLabel(c: OutlineChange): string {
  switch (c.kind) {
    case 'course-renamed':
      return 'Đổi tên khóa học';
    case 'course-description':
      return 'Sửa mô tả khóa học';
    case 'level-inserted':
    case 'lesson-inserted':
      return 'Đã thêm';
    case 'level-removed':
    case 'lesson-removed':
      return 'Đã xóa';
    case 'level-renamed':
    case 'lesson-renamed':
      return 'Đổi tên';
    case 'level-reordered':
    case 'lesson-reordered':
      return 'Đổi thứ tự';
    case 'lesson-moved':
      return 'Chuyển level';
    case 'lesson-shown':
      return 'Hiện';
    case 'lesson-hidden':
      return 'Ẩn';
  }
}

function describe(c: OutlineChange) {
  switch (c.kind) {
    case 'course-renamed':
    case 'course-description':
      return <WordDiffText segments={c.words} />;
    case 'level-inserted':
      return <>Level <Ins>{c.name}</Ins></>;
    case 'level-removed':
      return <>Level <Del>{c.name}</Del></>;
    case 'level-renamed':
    case 'lesson-renamed':
      return (
        <>
          {c.kind === 'level-renamed' ? 'Level ' : 'Bài '}
          <Del>{c.from}</Del> <span aria-hidden="true">→</span> <Ins>{c.to}</Ins>
          {c.kind === 'lesson-renamed' && c.levelName ? ` (trong ${c.levelName})` : ''}
        </>
      );
    case 'level-reordered':
      return `Level “${c.name}”: vị trí ${c.fromPos} → ${c.toPos}`;
    case 'lesson-inserted':
      return (
        <>
          Bài <Ins>{c.name}</Ins>
          {c.levelName ? ` trong ${c.levelName}` : ''}
          {c.isActive ? '' : ' (đang ẩn)'}
        </>
      );
    case 'lesson-removed':
      return (
        <>
          Bài <Del>{c.name}</Del>
          {c.levelName ? ` khỏi ${c.levelName}` : ''}
        </>
      );
    case 'lesson-moved':
      return `Bài “${c.name}”: ${c.fromLevel} → ${c.toLevel}`;
    case 'lesson-reordered':
      return `Bài “${c.name}” trong ${c.levelName}: vị trí ${c.fromPos} → ${c.toPos}`;
    case 'lesson-shown':
      return `Bài “${c.name}” được hiện với người học`;
    case 'lesson-hidden':
      return `Bài “${c.name}” bị ẩn với người học`;
  }
}
