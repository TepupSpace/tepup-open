// Rolls results/** up into results/summary.md: axe rules by impact and page, reflow
// overflows, keyboard and touch findings. Run automatically by run.sh.
import fs from 'node:fs';
import path from 'node:path';

const RESULTS = path.resolve('results');
const read = (dir) => {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.json')) out.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  };
  walk(path.join(RESULTS, dir));
  return out;
};

const lines = ['# Browser accessibility run', '', `Generated ${new Date().toISOString()}`, ''];

// axe
const axe = read('axe');
const byRule = new Map();
for (const r of axe) {
  for (const v of r.data.violations) {
    const key = `${v.id}|${v.impact}`;
    const e = byRule.get(key) ?? { id: v.id, impact: v.impact, help: v.help, tags: v.tags, pages: new Set(), nodes: 0, sample: v.nodes[0] };
    e.pages.add(`${r.label} [${r.project}]`);
    e.nodes += v.count;
    byRule.set(key, e);
  }
}
const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const rules = [...byRule.values()].sort((a, b) => order[a.impact] - order[b.impact] || b.pages.size - a.pages.size);
lines.push(`## axe-core (${axe.length} page checks)`, '');
if (!rules.length) lines.push('No violations.', '');
for (const e of rules) {
  lines.push(`### ${e.id} — ${e.impact} (${e.pages.size} checks, ${e.nodes} elements)`);
  lines.push(`${e.help}. ${e.tags.join(', ')}`);
  if (e.sample) lines.push(`Example: \`${e.sample.target}\` — ${e.sample.summary ?? ''}`, '```html', e.sample.html, '```');
  lines.push('Where: ' + [...e.pages].slice(0, 12).join('; ') + (e.pages.size > 12 ? ` … +${e.pages.size - 12}` : ''), '');
}

// reflow
const reflow = read('reflow').filter((r) => r.data.overflow > 1);
lines.push(`## Reflow at 320px, text 150% (${read('reflow').length} pages)`, '');
lines.push(reflow.length ? '' : 'No horizontal overflow.');
for (const r of reflow) lines.push(`- ${r.label} [${r.project}]: +${r.data.overflow}px — ${r.data.culprits.join('; ')}`);
lines.push('');

// keyboard, touch, reader, custom: raw but readable
for (const kind of ['keyboard', 'touch', 'reader', 'custom']) {
  const items = read(kind);
  if (!items.length) continue;
  lines.push(`## ${kind}`, '');
  for (const r of items) lines.push(`### ${r.label} [${r.project}]`, '```json', JSON.stringify(r.data, null, 1).slice(0, 6000), '```', '');
}

// Live lessons/chapters with no content (learners see "chưa có nội dung").
try {
  const urls = JSON.parse(fs.readFileSync('urls.json', 'utf8'));
  const empty = [...urls.lessons, ...urls.chapters].filter((i) => !i.types.length);
  if (empty.length) lines.push('## Active but empty', '', ...empty.map((i) => `- ${i.url} — ${i.name}`), '');
} catch {}

fs.mkdirSync(RESULTS, { recursive: true });
fs.writeFileSync(path.join(RESULTS, 'summary.md'), lines.join('\n'));
console.log(`summary: ${rules.length} axe rules, ${reflow.length} reflow overflows → results/summary.md`);
