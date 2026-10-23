import { describe, it, expect } from 'vitest';
import {
  align,
  blockText,
  collapseSame,
  diffBlockLists,
  diffBlocksVersion,
  diffEntry,
  diffFields,
  diffOutline,
  humanizePath,
  stableStringify,
  stripTags,
  wordDiff,
} from '@/lib/diff';
import type { CourseOutline } from '@/lib/types/outline';

const text = (html: string) => ({ type: 'text', html, paragraphs: [html] });

describe('stableStringify', () => {
  it('ignores key order', () => {
    expect(stableStringify({ b: 1, a: { d: [1, { y: 2, x: 1 }], c: null } })).toBe(
      stableStringify({ a: { c: null, d: [1, { x: 1, y: 2 }] }, b: 1 }),
    );
  });
  it('drops undefined keys', () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});

describe('align (LCS)', () => {
  it('finds insertions and deletions', () => {
    const { ops, approximate } = align(['a', 'b', 'c', 'd'], ['a', 'c', 'x', 'd']);
    expect(approximate).toBe(false);
    expect(ops.map((o) => o.op)).toEqual(['eq', 'del', 'eq', 'ins', 'eq']);
  });
  it('falls back to positional pairing above the cap', () => {
    const a = Array.from({ length: 50 }, (_, i) => `a${i}`);
    const b = Array.from({ length: 50 }, (_, i) => `b${i}`);
    const { ops, approximate } = align(['same', ...a, 'end'], ['same', ...b, 'end'], 100);
    expect(approximate).toBe(true);
    expect(ops[0]).toEqual({ op: 'eq', a: 0, b: 0 });
    expect(ops[ops.length - 1]).toEqual({ op: 'eq', a: 51, b: 51 });
    expect(ops.filter((o) => o.op === 'del')).toHaveLength(50);
    expect(ops.filter((o) => o.op === 'ins')).toHaveLength(50);
  });
  it('handles a 1000-block lesson quickly', () => {
    const a = Array.from({ length: 1000 }, (_, i) => `x${i}`);
    const b = a.map((x, i) => (i % 3 === 0 ? `${x}!` : x));
    const t = Date.now();
    const res = align(a, b);
    expect(Date.now() - t).toBeLessThan(1000);
    expect(res.ops.length).toBeGreaterThanOrEqual(1000);
  });
});

describe('stripTags / wordDiff', () => {
  it('strips inline HTML and decodes entities', () => {
    expect(stripTags('<b>An</b> &amp; <a href="/tv/x">Bình</a><br>xin&nbsp;chào')).toBe('An & Bình xin chào');
  });
  it('never keeps a tag in the output', () => {
    expect(stripTags('<img src=x onerror=alert(1)>hi<script>x</script>')).toBe('hix');
  });
  it('diffs Vietnamese words', () => {
    const segs = wordDiff('Dữ liệu cá nhân là tài sản', 'Dữ liệu cá nhân không phải tài sản');
    expect(segs.filter((s) => s.op === 'del').map((s) => s.text.trim())).toEqual(['là']);
    expect(segs.filter((s) => s.op === 'ins').map((s) => s.text.trim())).toEqual(['không phải']);
    expect(segs.filter((s) => s.op !== 'ins').map((s) => s.text).join('')).toBe('Dữ liệu cá nhân là tài sản');
    expect(segs.filter((s) => s.op !== 'del').map((s) => s.text).join('')).toBe('Dữ liệu cá nhân không phải tài sản');
  });
  it('equal text gives one eq segment', () => {
    expect(wordDiff('a b', 'a b')).toEqual([{ op: 'eq', text: 'a b' }]);
  });
});

describe('diffFields', () => {
  it('lists changed interactive fields', () => {
    const before = { type: 'question', question: 'Q', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }], tolerance: 1 };
    const after = { type: 'question', question: 'Q', options: [{ text: 'A', isCorrect: false }, { text: 'B2', isCorrect: true }], tolerance: 2 };
    const { changes } = diffFields(before, after, (p) => p === 'type');
    expect(changes.map((c) => c.path)).toEqual([
      'options[0].isCorrect',
      'options[1].isCorrect',
      'options[1].text',
      'tolerance',
    ]);
    expect(changes.find((c) => c.path === 'tolerance')).toMatchObject({ before: '1', after: '2' });
    expect(changes.find((c) => c.path === 'options[1].text')?.words?.length).toBeGreaterThan(0);
  });
  it('flags markup-only changes', () => {
    const { changes } = diffFields({ html: 'a <b>b</b>' }, { html: 'a <i>b</i>' });
    expect(changes).toEqual([{ path: 'html', kind: 'changed', before: 'a b', after: 'a b', markupOnly: true }]);
  });
  it('humanizes paths 1-based', () => {
    expect(humanizePath('options[1].text')).toBe('options #2 › text');
  });
});

describe('diffBlockLists', () => {
  it('pairs removed+added blocks of the same type as changed', () => {
    const before = [text('Một'), text('Hai ba bốn'), { type: 'image', url: 'u', alt: 'x' }];
    const after = [text('Một'), text('Hai năm bốn'), { type: 'image', url: 'u', alt: 'x' }];
    const d = diffBlockLists(before, after);
    expect(d.summary).toEqual({ added: 0, removed: 0, changed: 1, unchanged: 2 });
    const changed = d.entries.find((e) => e.kind === 'changed');
    expect(changed).toMatchObject({ kind: 'changed', beforeIndex: 1, afterIndex: 1, type: 'text' });
    // `paragraphs` is legacy next to `html`: only html is reported.
    expect(changed && changed.kind === 'changed' && changed.fields.map((f) => f.path)).toEqual(['html']);
  });
  it('keeps different types as removed + added', () => {
    const d = diffBlockLists([text('A'), text('B')], [text('A'), { type: 'callout', text: 'B' }]);
    expect(d.summary).toEqual({ added: 1, removed: 1, changed: 0, unchanged: 1 });
    expect(d.entries.map((e) => e.kind)).toEqual(['same', 'removed', 'added']);
  });
  it('detects pure insertions and deletions', () => {
    const d = diffBlockLists([text('A'), text('B'), text('C')], [text('A'), text('X'), text('B')]);
    expect(d.summary.unchanged).toBe(2);
    // C was removed after B, X inserted before it: not the same position, so not paired.
    expect(d.entries.map((e) => e.kind)).toEqual(['same', 'added', 'same', 'removed']);
  });
  it('ignores key order inside blocks', () => {
    const d = diffBlockLists([{ type: 'text', html: 'a', paragraphs: ['a'] }], [{ paragraphs: ['a'], html: 'a', type: 'text' }]);
    expect(d.summary).toEqual({ added: 0, removed: 0, changed: 0, unchanged: 1 });
  });
  it('collapses unchanged runs', () => {
    const d = diffBlockLists([text('A'), text('B'), text('C'), text('D')], [text('A'), text('B'), text('C2'), text('D')]);
    expect(collapseSame(d.entries).map((e) => (e.kind === 'same-run' ? `same×${e.count}` : e.kind))).toEqual(['same×2', 'changed', 'same×1']);
  });
  it('stays fast and approximate above ~400×400', () => {
    const before = Array.from({ length: 900 }, (_, i) => text(`block ${i}`));
    const after = before.map((b, i) => (i % 2 ? text(`đã sửa ${i}`) : b)).reverse();
    const t = Date.now();
    const d = diffBlockLists(before, after);
    expect(Date.now() - t).toBeLessThan(3000);
    expect(d.approximate).toBe(true);
  });
  it('blockText strips tags and skips ids/types', () => {
    expect(blockText({ type: 'callout', id: 'abc', html: '<b>Chú ý</b>', variant: 'info' })).toBe('Chú ý');
  });
});

describe('diffBlocksVersion', () => {
  it('reports a title change and treats null before as all-added', () => {
    const d = diffBlocksVersion({ title: 'Cũ', blocks: [] }, { title: 'Mới', blocks: [text('A')] });
    expect(d.title.changed).toBe(true);
    expect(d.summary.added).toBe(1);
    const first = diffBlocksVersion(null, { title: 'T', blocks: [text('A'), text('B')] });
    expect(first.title.changed).toBe(false);
    expect(first.summary.added).toBe(2);
  });
});

describe('diffEntry', () => {
  const base = {
    title: 'Giám sát',
    summary: 'Theo dõi có hệ thống',
    body: { sections: [{ heading: 'Là gì', paragraphs: ['Đoạn một.'] }] },
    meta: { titleEn: 'Surveillance' },
    links: [
      { toId: 'a', kind: 'RELATED', order: 0 },
      { toId: 'b', kind: 'CITES', order: 1 },
    ],
  };
  it('lists field and link changes', () => {
    const after = {
      ...base,
      summary: 'Theo dõi có hệ thống và kéo dài',
      body: { sections: [{ heading: 'Là gì', paragraphs: ['Đoạn một.', 'Đoạn hai.'] }] },
      links: [
        { toId: 'b', kind: 'CITES', order: 0 },
        { toId: 'c', kind: 'RELATED', order: 1 },
      ],
    };
    const d = diffEntry(base, after);
    expect(d.fields.map((f) => f.path)).toEqual(['body.sections[0].paragraphs[1]', 'summary']);
    expect(d.links.added.map((l) => l.toId)).toEqual(['c']);
    expect(d.links.removed.map((l) => l.toId)).toEqual(['a']);
    expect(d.links.reordered.map((l) => l.toId)).toEqual(['b']);
  });
  it('no changes for an identical entry', () => {
    expect(diffEntry(base, structuredClone(base)).summary).toEqual({ fields: 0, linksAdded: 0, linksRemoved: 0, linksReordered: 0 });
  });
});

describe('diffOutline', () => {
  const before: CourseOutline = {
    course: { name: 'Quyền riêng tư', description: 'Mô tả' },
    levels: [
      { id: 'L1', name: 'Cấp 1', sortOrder: 1 },
      { id: 'L2', name: 'Cấp 2', sortOrder: 2 },
    ],
    lessons: [
      { id: 'a', name: 'Bài A', levelId: 'L1', sortOrder: 1, isActive: true },
      { id: 'b', name: 'Bài B', levelId: 'L1', sortOrder: 2, isActive: true },
      { id: 'c', name: 'Bài C', levelId: 'L1', sortOrder: 3, isActive: true },
      { id: 'd', name: 'Bài D', levelId: 'L2', sortOrder: 1, isActive: false },
    ],
  };
  it('ignores renumbering', () => {
    const after: CourseOutline = {
      ...before,
      levels: before.levels.map((l, i) => ({ ...l, sortOrder: i })),
      lessons: before.lessons.map((l) => ({ ...l, sortOrder: l.sortOrder - 1 })),
    };
    expect(diffOutline(before, after).changes).toEqual([]);
  });
  it('finds renamed, moved, reordered, inserted, removed and visibility changes', () => {
    const after: CourseOutline = {
      course: { name: 'Quyền riêng tư 101', description: 'Mô tả' },
      levels: [
        { id: 'L2', name: 'Cấp 2', sortOrder: 0 },
        { id: 'L1', name: 'Cấp một', sortOrder: 1 },
        { id: 'L3', name: 'Cấp 3', sortOrder: 2 },
      ],
      lessons: [
        { id: 'c', name: 'Bài C', levelId: 'L1', sortOrder: 0, isActive: true },
        { id: 'a', name: 'Bài A', levelId: 'L1', sortOrder: 1, isActive: true },
        { id: 'b', name: 'Bài B mới', levelId: 'L2', sortOrder: 0, isActive: true },
        { id: 'd', name: 'Bài D', levelId: 'L2', sortOrder: 1, isActive: true },
        { id: 'e', name: 'Bài E', levelId: 'L3', sortOrder: 0, isActive: false },
      ],
    };
    const removedBefore = { ...before, lessons: [...before.lessons, { id: 'z', name: 'Bài Z', levelId: 'L2', sortOrder: 9, isActive: true }] };
    const kinds = diffOutline(removedBefore, after).changes.map((c) => `${c.kind}${'id' in c ? `:${c.id}` : ''}`);
    expect(kinds).toEqual(
      expect.arrayContaining([
        'course-renamed',
        'level-renamed:L1',
        'level-inserted:L3',
        'lesson-renamed:b',
        'lesson-moved:b',
        'lesson-shown:d',
        'lesson-inserted:e',
        'lesson-removed:z',
      ]),
    );
    // A swap of two items: exactly one of them is reported as reordered.
    expect(kinds.filter((k) => k.startsWith('level-reordered'))).toHaveLength(1);
    expect(kinds.filter((k) => k === 'lesson-reordered:a' || k === 'lesson-reordered:c')).toHaveLength(1);
    expect(kinds).not.toContain('lesson-reordered:b');
  });
  it('first version lists everything as inserted', () => {
    const d = diffOutline(null, before);
    expect(d.summary).toEqual({ course: 0, levels: 2, lessons: 4 });
  });
});
