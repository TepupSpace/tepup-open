/**
 * Round-trip tests for the BlockNote ↔ ContentBlock converter and inline-html helpers.
 * No test framework in this repo — run with:  npx tsx scripts/test-editor-converter.ts
 */
import { inlineToHtml, htmlToInline, type InlineContent } from '@/lib/editor/inline-html';
import { toBlockNote, toContentBlocks } from '@/lib/editor/blocknote-converter';
import type { ContentBlock } from '@/lib/types/content';

function norm(v: any): any {
  if (Array.isArray(v)) return v.map(norm);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])]));
  return v;
}
let pass = 0, fail = 0;
function eq(a: unknown, b: unknown, name: string) {
  if (JSON.stringify(norm(a)) === JSON.stringify(norm(b))) pass++;
  else { fail++; console.log('FAIL', name, '\n  got :', JSON.stringify(norm(a)), '\n  want:', JSON.stringify(norm(b))); }
}

// --- inline-html round-trip ---
const inlineCases: InlineContent[][] = [
  [{ type: 'text', text: 'Hello world', styles: {} }],
  [{ type: 'text', text: 'a ', styles: {} }, { type: 'text', text: 'bi', styles: { bold: true, italic: true } }, { type: 'text', text: ' c', styles: {} }],
  [{ type: 'text', text: 'code', styles: { code: true } }],
  [{ type: 'text', text: 'colored', styles: { textColor: 'red' } }],
  [{ type: 'link', href: 'https://x.com/?a=1&b=2', content: [{ type: 'text', text: 'link', styles: { bold: true } }] }],
  [{ type: 'text', text: 'x < y & "z"', styles: {} }],
];
inlineCases.forEach((c, i) => eq(htmlToInline(inlineToHtml(c)), c, `inline #${i}`));

// --- converter round-trip ---
function rt(name: string, blocks: ContentBlock[]) {
  eq(toContentBlocks(toBlockNote(blocks)), blocks, `conv ${name}`);
}
rt('text-html', [{ type: 'text', paragraphs: [], html: '<strong>hi</strong> there' }]);
rt('heading', [{ type: 'heading', level: 2, html: 'Title <em>x</em>' }]);
rt('quote', [{ type: 'quote', html: 'a quote' }]);
rt('code', [{ type: 'code', language: 'js', code: 'const x = 1 < 2;' }]);
rt('bullet-nested', [{ type: 'bullet-list', items: [{ html: 'a' }, { html: 'b', children: [{ html: 'b1' }, { html: 'b2' }] }] }]);
rt('numbered', [{ type: 'numbered-list', items: [{ html: 'one' }, { html: 'two' }] }]);
rt('checklist', [{ type: 'check-list', items: [{ html: 'done', checked: true }, { html: 'todo', checked: false }] }]);
rt('toggle', [{ type: 'toggle', html: 'summary', children: [{ type: 'text', paragraphs: [], html: 'inside' }] }]);
rt('table', [{ type: 'table', rows: [['<strong>H1</strong>', 'H2'], ['a', 'b']] }]);
rt('image', [{ type: 'image', src: 'https://x/y.png', alt: 'alt text', caption: 'cap' }]);
rt('video', [{ type: 'video', url: 'https://x/v.mp4', caption: 'v' }]);
rt('file', [{ type: 'file', url: 'https://x/f.pdf', name: 'f.pdf', caption: 'doc' }]);
rt('step-break', [{ type: 'step-break', label: 'Bước 2' }]);
rt('widget-question', [{ type: 'question', question: 'Q?', options: [{ id: 'a', text: 'A', isCorrect: true }], explanation: 'because' } as ContentBlock]);
rt('widget-custom', [{ type: 'custom', customBlockTypeId: 'ct1', fields: { a: 1 }, configSnapshot: { x: 2 } } as unknown as ContentBlock]);
rt('mixed-doc', [
  { type: 'heading', level: 1, html: 'Doc' },
  { type: 'text', paragraphs: [], html: 'para <em>1</em>' },
  { type: 'bullet-list', items: [{ html: 'x' }, { html: 'y' }] },
  { type: 'step-break' },
  { type: 'question', question: 'Q', options: [{ id: 'a', text: 'A', isCorrect: false }] } as ContentBlock,
]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
