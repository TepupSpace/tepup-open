import { describe, it, expect } from 'vitest';
import { isSafeLinkHref } from '@/lib/security/safe-url';

describe('isSafeLinkHref (editor + sanitiser gate)', () => {
  it.each(['https://x.org', 'http://x.org', 'mailto:a@b.c', '/tv/legibility', '/tv/a#1'])('allows %s', (h) => expect(isSafeLinkHref(h)).toBe(true));
  it.each(['/admin', '/tv/../admin', '//x.org', 'javascript:alert(1)', '/tv/a/b', ' /tv/a'])('blocks %s', (h) => expect(isSafeLinkHref(h)).toBe(false));
});
