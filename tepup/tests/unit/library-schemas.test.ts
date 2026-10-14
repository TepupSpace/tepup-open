import { describe, it, expect } from 'vitest';
import { ENTRY_TYPES, LINK_RULES, entryInput, parseMeta } from '@/lib/library/schemas';
import { baseTitle } from '@/lib/library/refs';

// One kind of knowledge entry, linked as a network (docs/design-reference-library.md §4, §12).
describe('entry types', () => {
  it('has one knowledge type, not topic/term/area/article', () => {
    expect(ENTRY_TYPES).toEqual(['CONCEPT', 'SOURCE', 'ACRONYM', 'TOOL']);
  });
  it('concept meta takes only optional fields', () => {
    expect(parseMeta('CONCEPT', {}).ok).toBe(true);
    expect(parseMeta('CONCEPT', { titleEn: 'surveillance' })).toEqual({ ok: true, meta: { titleEn: 'surveillance' } });
  });
});

describe('link rules', () => {
  it('related links any concept or tool to another, never to a source', () => {
    expect(LINK_RULES.RELATED.from).toEqual(['CONCEPT', 'TOOL']);
    expect(LINK_RULES.RELATED.to).not.toContain('SOURCE');
  });
  it('only concepts and tools cite sources; sources point nowhere', () => {
    expect(LINK_RULES.CITES).toEqual({ from: ['CONCEPT', 'TOOL'], to: ['SOURCE'] });
    for (const rule of Object.entries(LINK_RULES).filter(([k]) => k !== 'MENTIONS')) expect(rule[1].from).not.toContain('SOURCE');
  });
  it('MENTIONS is built by the server and cannot be submitted', () => {
    const base = { slug: 'a', type: 'CONCEPT', title: 'A', summary: 'A.' };
    expect(entryInput.safeParse({ ...base, links: [{ toId: 'x', kind: 'MENTIONS' }] }).success).toBe(false);
    expect(entryInput.safeParse({ ...base, links: [{ toId: 'x', kind: 'RELATED' }] }).success).toBe(true);
  });
});

describe('same name, different meaning', () => {
  it('drops a trailing disambiguation in brackets', () => {
    expect(baseTitle('Giám sát (dịch tễ)')).toBe('Giám sát');
    expect(baseTitle('Giám sát (thông tin)')).toBe(baseTitle('Giám sát'));
    expect(baseTitle('Thuế Thu nhập Cá nhân (TNCN)')).toBe('Thuế Thu nhập Cá nhân');
    expect(baseTitle('GDP (Gross Domestic Product) là gì')).toBe('GDP (Gross Domestic Product) là gì');
  });
});
