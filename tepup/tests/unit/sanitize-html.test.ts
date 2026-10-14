import { describe, it, expect } from 'vitest';
import { sanitizeInlineHtml } from '@/lib/security/sanitize-html';

describe('sanitizeInlineHtml — behaviour that must not change', () => {
  it('keeps the inline formatting the editor writes', () => {
    const html = '<strong>đậm</strong> <em>nghiêng</em> <span style="color:red">màu</span>';
    expect(sanitizeInlineHtml(html)).toBe(html);
  });

  it('forces new-tab, noopener on external links', () => {
    expect(sanitizeInlineHtml('<a href="https://example.com">x</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">x</a>',
    );
  });

  it.each([
    ['javascript:alert(1)'],
    ['data:text/html,<b>x</b>'],
    ['//evil.example/tv/x'],
    ['/admin'],
    ['/library'],
    ['/tv/../admin'],
    ['/tv/Viet-Hoa'],
    ['/tv/x/y'],
    ['/tv/'],
  ])('strips the href %s', (href) => {
    expect(sanitizeInlineHtml(`<a href="${href}">x</a>`)).not.toContain('href=');
  });

  it('drops scripts, handlers, classes and data attributes', () => {
    const out = sanitizeInlineHtml('<b class="fixed" data-x="1" onclick="x()">a</b><script>x()</script>');
    expect(out).toBe('<b>a</b>');
  });
});

describe('sanitizeInlineHtml — library references (/tv/)', () => {
  it('keeps /tv/<slug> links, tags them for the reader, same tab', () => {
    expect(sanitizeInlineHtml('<a href="/tv/legibility">khả đọc</a>')).toBe('<a href="/tv/legibility" data-tv="legibility">khả đọc</a>');
  });
  it('carries a section anchor', () => {
    expect(sanitizeInlineHtml('<a href="/tv/legibility#2">x</a>')).toBe('<a href="/tv/legibility#2" data-tv="legibility" data-tv-section="2">x</a>');
  });
  it('ignores data-tv supplied by the author', () => {
    expect(sanitizeInlineHtml('<a href="https://x.org" data-tv="evil">x</a>')).not.toContain('data-tv');
  });
  it('does not let a /tv/ prefix smuggle other paths', () => {
    for (const h of ['/tv/../admin', '/tv/a/b', '/tv/a?x', '/tv/A']) {
      expect(sanitizeInlineHtml(`<a href="${h}">x</a>`)).toBe('<a>x</a>');
    }
  });
});
