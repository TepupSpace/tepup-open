import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';

const md = (s: string) => renderToStaticMarkup(<>{renderInlineMarkdown(s)}</>);

describe('renderInlineMarkdown — behaviour that must not change', () => {
  it('returns plain text untouched', () => {
    expect(md('Không có gì đặc biệt.')).toBe('Không có gì đặc biệt.');
  });

  it('renders bold, italic and code', () => {
    expect(md('**đậm** *nghiêng* `mã`')).toContain('<strong class="font-semibold">đậm</strong>');
    expect(md('**đậm** *nghiêng* `mã`')).toContain('<em class="italic">nghiêng</em>');
    expect(md('**đậm** *nghiêng* `mã`')).toContain('>mã</code>');
  });

  it('renders external links in a new tab', () => {
    expect(md('[nguồn](https://example.com)')).toContain('href="https://example.com" target="_blank"');
  });

  it('leaves unsafe link source visible instead of linking', () => {
    expect(md('[x](javascript:alert(1))')).not.toContain('<a');
  });

  it('trims trailing punctuation from bare URLs', () => {
    expect(md('Xem https://example.com.')).toContain('href="https://example.com"');
  });
});

describe('renderInlineMarkdown — library references (/tv/)', () => {
  it('renders a same-tab reference link with data-tv', () => {
    expect(md('Xem [khả đọc](/tv/legibility).')).toBe('Xem <a href="/tv/legibility" data-tv="legibility">khả đọc</a>.');
  });
  it('carries a section anchor', () => {
    expect(md('[x](/tv/a#3)')).toBe('<a href="/tv/a#3" data-tv="a" data-tv-section="3">x</a>');
  });
  it('treats malformed /tv/ links as ordinary relative links (unchanged behaviour)', () => {
    expect(md('[x](/tv/A)')).toBe('<a href="/tv/A" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-800 underline break-words">x</a>');
  });
});

describe('renderInlineMarkdown — text inside controls (links: false)', () => {
  const plain = (s: string) => renderToStaticMarkup(<>{renderInlineMarkdown(s, { links: false })}</>);
  it('renders link text without an anchor', () => {
    expect(plain('Xem [Luật 91](/tv/luat-91) và [nguồn](https://x.org).')).toBe('Xem Luật 91 và nguồn.');
  });
  it('keeps formatting inside the link text', () => {
    expect(plain('[**đậm**](/tv/a)')).toBe('<strong class="font-semibold">đậm</strong>');
  });
  it('leaves bare URLs as text', () => {
    expect(plain('https://x.org')).toBe('https://x.org');
  });
});
