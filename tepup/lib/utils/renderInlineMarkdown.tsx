import React from 'react';

/**
 * Inline markdown for authored course content.
 *
 * Course text is stored as plain strings (see `lib/types/content.ts`), but authors
 * write light markdown in them — `**đậm**`, `*nghiêng*`, `` `code` ``, `[chữ](url)`.
 * This renders that subset. Block-level syntax (headings, lists, tables) is NOT
 * supported on purpose: those belong to their own block types.
 *
 * Nothing here produces raw HTML, so contributor-authored text stays un-injectable.
 */

/**
 * One alternation, tried left to right, so `**x**` wins over `*x*` at the same
 * position. Capture groups: 1 code, 2 link text, 3 link href, 4 bold, 5 italic,
 * 6 bare URL.
 */
const INLINE_SOURCE = [
  '`([^`\\n]+)`',
  '\\[([^\\]\\n]+)\\]\\(([^\\s)]+)\\)',
  '\\*\\*(\\S(?:[\\s\\S]*?\\S)?)\\*\\*',
  '\\*([^\\s*](?:[^*\\n]*?[^\\s*])?)\\*',
  '(https?://[^\\s<>"\']+)',
].join('|');

/** Fresh instance per call — the renderer recurses, and `lastIndex` is per-regex state. */
const newMatcher = () => new RegExp(INLINE_SOURCE, 'g');

/** Only these schemes become anchors — blocks `javascript:` and friends. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/(?!\/))/i;

/** Markdown links swallow trailing sentence punctuation; bare URLs shouldn't. */
function trimTrailingPunctuation(url: string): { href: string; tail: string } {
  const match = url.match(/[.,;:!?)\]]+$/);
  if (!match) return { href: url, tail: '' };
  return { href: url.slice(0, -match[0].length), tail: match[0] };
}

const linkClass = 'text-purple-600 hover:text-purple-800 underline break-words';

export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text || !/[*`[]|https?:\/\//.test(text)) return text;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  const matcher = newMatcher();
  for (let m = matcher.exec(text); m !== null; m = matcher.exec(text)) {
    const [matched, code, linkText, linkHref, bold, italic, bareUrl] = m;

    if (m.index > cursor) nodes.push(text.slice(cursor, m.index));
    cursor = m.index + matched.length;

    if (code !== undefined) {
      nodes.push(
        <code key={key++} className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-[0.9em] font-mono">
          {code}
        </code>,
      );
    } else if (linkText !== undefined) {
      if (SAFE_HREF.test(linkHref)) {
        nodes.push(
          <a key={key++} href={linkHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {renderInlineMarkdown(linkText)}
          </a>,
        );
      } else {
        // Unsafe or unrecognized scheme — leave the author's source visible rather
        // than silently producing a link-shaped thing that doesn't link.
        nodes.push(matched);
      }
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {renderInlineMarkdown(bold)}
        </strong>,
      );
    } else if (italic !== undefined) {
      nodes.push(
        <em key={key++} className="italic">
          {renderInlineMarkdown(italic)}
        </em>,
      );
    } else if (bareUrl !== undefined) {
      const { href, tail } = trimTrailingPunctuation(bareUrl);
      nodes.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>
          {href}
        </a>,
      );
      if (tail) nodes.push(tail);
    }
  }

  if (cursor === 0) return text;
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
