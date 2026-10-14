import { describe, it, expect } from 'vitest';
import { collectLibraryDocumentRefs, collectTvSlugs, isTvHref, parseTvHref, tvHref } from '@/lib/library/refs';
import { slugifyEntry } from '@/lib/library/slugify';

describe('/tv/ link parsing', () => {
  it.each(['/tv/legibility', '/tv/kha-doc-2', '/tv/a#0', '/tv/a-b#12'])('accepts %s', (h) => expect(isTvHref(h)).toBe(true));
  it.each(['/tv/', '/tv/A', '/tv/a/b', '/tv/../x', '/tv/a-', '/tv/-a', '/tv/a b', '/tv/a#x', ' /tv/a', '/tv/a?x=1', 'https://x/tv/a', '/tvx/a'])(
    'rejects %s',
    (h) => expect(isTvHref(h)).toBe(false),
  );
  it('parses slug and section', () => {
    expect(parseTvHref('/tv/abc')).toEqual({ slug: 'abc' });
    expect(parseTvHref('/tv/abc#3')).toEqual({ slug: 'abc', section: 3 });
    expect(tvHref('abc', 3)).toBe('/tv/abc#3');
  });
});

describe('collecting references from block JSON', () => {
  const blocks = [
    { type: 'text', html: 'Xem <a href="/tv/legibility">khả đọc</a> và <a href="/tv/legibility#1">phần 2</a>' },
    { type: 'question', explanation: 'Theo [Scott](/tv/scott-1998), còn [ngoài](https://x.org/tv/not-me).' },
    { type: 'library-document', mode: 'reference', documentId: 'doc1' },
    { type: 'library-document', mode: 'reference', documentSlug: 'doc-two' },
    { type: 'library-document', mode: 'inline', documentId: 'ignored' },
  ];
  it('counts /tv/ slugs and ignores look-alikes on other sites', () => {
    expect(Object.fromEntries(collectTvSlugs(blocks))).toEqual({ legibility: 2, 'scott-1998': 1 });
  });
  it('collects reference-mode library documents only', () => {
    expect(collectLibraryDocumentRefs(blocks)).toEqual({ ids: ['doc1'], slugs: ['doc-two'] });
  });
});

describe('slugifyEntry', () => {
  it('strips Vietnamese diacritics', () => {
    expect(slugifyEntry('Tính khả đọc (legibility)')).toBe('tinh-kha-doc-legibility');
    expect(slugifyEntry('Đường dây nóng')).toBe('duong-day-nong');
    expect(slugifyEntry('  --Luật 91/2025/QH15--  ')).toBe('luat-91-2025-qh15');
  });
});
