import { describe, it, expect } from 'vitest';
import { normalizeIdentifier, normalizeIsbn, normalizeSourceUrl, sourceKeyOf } from '@/lib/library/source-key';

describe('normalizeSourceUrl: one key per document', () => {
  const same = (a: string, b: string) => expect(normalizeSourceUrl(a)).toBe(normalizeSourceUrl(b));

  it('ignores scheme, www/m, trailing slash, fragment', () => {
    same('http://www.npr.org/transcripts/nx-s1-5953112/', 'https://npr.org/transcripts/nx-s1-5953112#top');
    same('https://en.m.wikipedia.org/wiki/Panopticon', 'https://en.wikipedia.org/wiki/Panopticon');
    same('https://m.example.com/a', 'https://example.com/a');
  });
  it('drops tracking parameters and sorts the rest', () => {
    same('https://time.com/x?utm_source=fb&utm_medium=social&fbclid=abc', 'https://time.com/x');
    same('https://site.vn/a?b=2&a=1', 'https://site.vn/a?a=1&b=2');
    expect(normalizeSourceUrl('https://site.vn/a?id=1')).not.toBe(normalizeSourceUrl('https://site.vn/a?id=2'));
  });
  it('treats a web.archive.org copy as the original', () => {
    same('https://web.archive.org/web/20251207041131/https://www.oecd.org/report.pdf', 'https://oecd.org/report.pdf');
    same('https://web.archive.org/web/20090217153022id_/http://www.hrw.org/x.pdf', 'https://hrw.org/x.pdf');
  });
  it('unifies DOI links', () => {
    same('https://doi.org/10.1073/PNAS.1320040111', 'http://dx.doi.org/10.1073/pnas.1320040111');
    expect(normalizeSourceUrl('https://doi.org/10.1073/pnas.1320040111')).toBe('doi:10.1073/pnas.1320040111');
  });
  it('unifies YouTube links', () => {
    same('https://youtu.be/abc123', 'https://www.youtube.com/watch?v=abc123&t=42s');
  });
  it('decodes percent-encoding (Vietnamese Wikipedia)', () => {
    same('https://vi.wikipedia.org/wiki/M%C3%A3_s%E1%BB%91_thu%E1%BA%BF', 'https://vi.wikipedia.org/wiki/Mã_số_thuế');
  });
  it('rejects non-http', () => {
    expect(normalizeSourceUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('identifiers', () => {
  it('ISBN-10 and ISBN-13, with or without hyphens, are the same book', () => {
    expect(normalizeIsbn('ISBN 978-0-300-07815-2')).toBe('9780300078152');
    expect(normalizeIsbn('0300078153')).toBe('9780300078152');
    expect(normalizeIdentifier('ISBN 0-300-07815-3')).toBe(normalizeIdentifier('9780300078152'));
  });
  it('DOI forms', () => {
    expect(normalizeIdentifier('DOI 10.1073/pnas.1320040111')).toBe('doi:10.1073/pnas.1320040111');
    expect(normalizeIdentifier('doi:10.1073/PNAS.1320040111')).toBe('doi:10.1073/pnas.1320040111');
  });
  it('law numbers ignore spacing and the "số" prefix', () => {
    expect(normalizeIdentifier('Số 91/2025/QH15')).toBe(normalizeIdentifier('91/2025/qh15'));
  });
  it('a DOI link and a DOI identifier give the same key', () => {
    expect(sourceKeyOf({ url: 'https://doi.org/10.1093/qje/qjx032' })).toBe(sourceKeyOf({ identifier: 'DOI 10.1093/qje/qjx032' }));
  });
});
