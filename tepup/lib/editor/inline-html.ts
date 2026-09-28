/**
 * Pure serialization between BlockNote inline content and an HTML string.
 *
 * ContentBlock stores rich text as HTML (see `TextBlock.html`, `HeadingBlock.html`, …)
 * so the persisted data layer stays decoupled from BlockNote. These helpers convert
 * BlockNote's `InlineContent[]` ⇄ that HTML.
 *
 * `htmlToInline` is a closed-world parser for exactly the tag subset `inlineToHtml`
 * emits (`strong/em/u/s/code/a/span[style=color]`). It is intentionally small and
 * pure (no DOM) so it round-trips our own output and runs in Node tests; arbitrary
 * pasted HTML is normalized by BlockNote's own parser inside the editor, not here.
 */

import { isSafeLinkHref } from '@/lib/security/safe-url';

export interface InlineStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  textColor?: string;
}

export interface StyledText {
  type: 'text';
  text: string;
  styles: InlineStyles;
}

export interface InlineLink {
  type: 'link';
  href: string;
  content: StyledText[];
}

export type InlineContent = StyledText | InlineLink;

/** Màu chữ BlockNote: tên màu ("red"), hex hoặc rgb()/rgba(). Chặn chèn thuộc tính
 *  qua `textColor` (vd. `red" onmouseover="…`). */
const SAFE_COLOR =
  /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\))$/i;

// --- escaping ---
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function styledTextToHtml(node: StyledText): string {
  let html = escapeHtml(node.text);
  const s = node.styles || {};
  if (s.code) html = `<code>${html}</code>`;
  if (s.bold) html = `<strong>${html}</strong>`;
  if (s.italic) html = `<em>${html}</em>`;
  if (s.underline) html = `<u>${html}</u>`;
  if (s.strike) html = `<s>${html}</s>`;
  if (s.textColor && s.textColor !== 'default' && SAFE_COLOR.test(s.textColor)) {
    html = `<span style="color:${s.textColor}">${html}</span>`;
  }
  return html;
}

export function inlineToHtml(inline: InlineContent[] | undefined): string {
  if (!inline || inline.length === 0) return '';
  return inline
    .map((node) => {
      if (node.type === 'link') {
        const inner = node.content.map(styledTextToHtml).join('');
        // Only http(s)/mailto become links; `javascript:`, `data:` & co. keep their
        // text but lose the anchor. (Render-time sanitising enforces the same rule.)
        if (!isSafeLinkHref(node.href)) return inner;
        return `<a href="${escapeHtml(node.href.trim())}">${inner}</a>`;
      }
      return styledTextToHtml(node);
    })
    .join('');
}

// --- parsing (closed-world) ---
type Token =
  | { kind: 'open'; tag: string; attrs: string }
  | { kind: 'close'; tag: string }
  | { kind: 'text'; text: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<(\/?)([a-z]+)([^>]*)>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) {
      tokens.push({ kind: 'text', text: html.slice(last, m.index) });
    }
    const [, slash, tag, attrs] = m;
    if (slash) tokens.push({ kind: 'close', tag: tag.toLowerCase() });
    else tokens.push({ kind: 'open', tag: tag.toLowerCase(), attrs });
    last = re.lastIndex;
  }
  if (last < html.length) tokens.push({ kind: 'text', text: html.slice(last) });
  return tokens;
}

function parseColor(attrs: string): string | undefined {
  const m = /color:\s*([^;"']+)/i.exec(attrs);
  return m ? m[1].trim() : undefined;
}

export function htmlToInline(html: string): InlineContent[] {
  if (!html) return [];
  const tokens = tokenize(html);
  const out: InlineContent[] = [];

  // active formatting state
  const state: InlineStyles = {};
  let color: string | undefined;
  let linkHref: string | null = null;
  let linkBuffer: StyledText[] = [];

  const pushText = (raw: string) => {
    const text = unescapeHtml(raw);
    if (!text) return;
    const styles: InlineStyles = { ...state };
    if (color) styles.textColor = color;
    const node: StyledText = { type: 'text', text, styles };
    if (linkHref !== null) linkBuffer.push(node);
    else out.push(node);
  };

  for (const t of tokens) {
    if (t.kind === 'text') {
      pushText(t.text);
    } else if (t.kind === 'open') {
      switch (t.tag) {
        case 'strong': case 'b': state.bold = true; break;
        case 'em': case 'i': state.italic = true; break;
        case 'u': state.underline = true; break;
        case 's': case 'del': state.strike = true; break;
        case 'code': state.code = true; break;
        case 'span': color = parseColor(t.attrs); break;
        case 'a': {
          const hm = /href="([^"]*)"/i.exec(t.attrs);
          const href = hm ? unescapeHtml(hm[1]) : '';
          // An unsafe href loads into the editor as plain text, not as a link.
          linkHref = isSafeLinkHref(href) ? href : null;
          linkBuffer = [];
          break;
        }
      }
    } else {
      switch (t.tag) {
        case 'strong': case 'b': delete state.bold; break;
        case 'em': case 'i': delete state.italic; break;
        case 'u': delete state.underline; break;
        case 's': case 'del': delete state.strike; break;
        case 'code': delete state.code; break;
        case 'span': color = undefined; break;
        case 'a':
          if (linkHref !== null) {
            out.push({ type: 'link', href: linkHref, content: linkBuffer });
            linkHref = null;
            linkBuffer = [];
          }
          break;
      }
    }
  }

  return out;
}
