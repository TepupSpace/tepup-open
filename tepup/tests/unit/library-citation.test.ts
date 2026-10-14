import { describe, it, expect } from 'vitest';
import { shortCitation, fullCitation, citationText, authorsShort, formatDate } from '@/lib/library/citation';
import { sourceMeta } from '@/lib/library/schemas';

const meta = (m: Record<string, unknown>) => sourceMeta.parse(m);

describe('citation formatting', () => {
  it('shortens author lists', () => {
    expect(authorsShort(['A'])).toBe('A');
    expect(authorsShort(['A', 'B'])).toBe('A và B');
    expect(authorsShort(['A', 'B', 'C'])).toBe('A và cộng sự');
    expect(authorsShort([])).toBeUndefined();
  });

  it('formats dates as dd/mm/yyyy', () => {
    expect(formatDate('2026-10-06')).toBe('06/10/2026');
  });

  it('book', () => {
    const m = meta({ sourceType: 'sach', authors: ['James C. Scott'], year: 1998, publisher: 'Yale University Press', identifier: 'ISBN 9780300078152', language: 'en' });
    expect(citationText(shortCitation('Seeing Like a State', m))).toBe('James C. Scott (1998). Seeing Like a State.');
    const full = fullCitation('Seeing Like a State', m);
    expect(citationText(full)).toBe('Sách · James C. Scott · 1998 · Seeing Like a State · Yale University Press · ISBN 9780300078152');
    expect(full.segments[3]).toEqual([{ text: 'Seeing Like a State', italic: true }]);
    expect(full.languageBadge).toBe('EN');
  });

  it('journal article', () => {
    const m = meta({
      sourceType: 'bai-bao-khoa-hoc',
      authors: ['Adam Kramer', 'Jamie Guillory', 'Jeffrey Hancock'],
      year: 2014,
      containerTitle: 'PNAS',
      url: 'https://doi.org/10.1073/pnas.1320040111',
      identifier: 'DOI 10.1073/pnas.1320040111',
      language: 'en',
    });
    expect(citationText(shortCitation('Experimental evidence of massive-scale emotional contagion', m))).toBe('Adam Kramer và cộng sự (2014), PNAS.');
  });

  it('news article', () => {
    const m = meta({ sourceType: 'bao-chi', authors: ['Harry Booth'], containerTitle: 'TIME', date: '2026-10-06', url: 'https://time.com/x', language: 'en' });
    expect(citationText(shortCitation('Meta’s Muse AI Agent Is Building a Dossier On You', m))).toBe('TIME, 06/10/2026.');
    expect(citationText(fullCitation('Meta’s Muse AI Agent Is Building a Dossier On You', m))).toBe(
      'Báo chí · Harry Booth · TIME · 06/10/2026 · “Meta’s Muse AI Agent Is Building a Dossier On You”',
    );
  });

  it('law (no URL needed when it has a number)', () => {
    const m = meta({ sourceType: 'van-ban-phap-luat', identifier: '91/2025/QH15', date: '2025-06-26' });
    expect(citationText(shortCitation('Luật Bảo vệ dữ liệu cá nhân', m))).toBe('Luật Bảo vệ dữ liệu cá nhân, số 91/2025/QH15.');
    expect(citationText(fullCitation('Luật Bảo vệ dữ liệu cá nhân', m))).toBe(
      'Văn bản pháp luật · Luật Bảo vệ dữ liệu cá nhân · số 91/2025/QH15 · ban hành 26/06/2025',
    );
  });

  it('podcast', () => {
    const m = meta({ sourceType: 'podcast', containerTitle: 'Planet Money', publisher: 'NPR', date: '2026-09-02', durationMin: 25, url: 'https://www.npr.org/transcripts/nx-s1-5953112', language: 'en' });
    expect(citationText(shortCitation('Love in the time of Palantir', m))).toBe('Planet Money (NPR), 02/09/2026.');
    expect(citationText(fullCitation('Love in the time of Palantir', m))).toBe(
      'Podcast · Planet Money (NPR) · “Love in the time of Palantir” · 02/09/2026 · 25 phút',
    );
  });

  it('rejects a source with neither URL nor (book/law) identifier', () => {
    expect(sourceMeta.safeParse({ sourceType: 'bao-chi' }).success).toBe(false);
    expect(sourceMeta.safeParse({ sourceType: 'sach', identifier: 'ISBN 1' }).success).toBe(true);
  });

  it('rejects non-http URLs', () => {
    expect(sourceMeta.safeParse({ sourceType: 'trang-web', url: 'javascript:alert(1)' }).success).toBe(false);
  });
});
