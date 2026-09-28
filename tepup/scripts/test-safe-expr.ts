/**
 * So sánh `lib/security/safe-expr.ts` với hành vi `new Function` cũ của các block
 * Calculator / SliderSimulator / BudgetAllocator.
 *
 *   npx tsx scripts/test-safe-expr.ts
 *
 * 1. Quét mọi chuỗi `formula` / `condition` thật trong repo (scripts/, data/, app/,
 *    components/, ../_backups, ../docs), tính bằng cả hai cách trên nhiều bộ giá trị
 *    biến và yêu cầu kết quả trùng khớp tuyệt đối (sau cùng một bước hậu xử lý như
 *    component cũ: số hữu hạn hoặc 0; điều kiện → boolean).
 * 2. Kiểm tra ngữ nghĩa thủ công (ưu tiên toán tử, `**`, ternary, `&&`/`||`…).
 * 3. Kiểm tra các chuỗi tấn công phải bị từ chối.
 *
 * Không chạm database, không gọi mạng. Script này là nơi DUY NHẤT còn dùng
 * `new Function` — làm chuẩn đối chiếu cho bộ tính mới.
 */
import fs from 'node:fs';
import path from 'node:path';
import { evaluateExpr, evaluateCondition, checkExpr } from '../lib/security/safe-expr';

const TEPUP = path.resolve(__dirname, '..');
const ROOT = path.resolve(TEPUP, '..');
const SCAN_DIRS = [
  path.join(TEPUP, 'scripts'),
  path.join(TEPUP, 'data'),
  path.join(TEPUP, 'app'),
  path.join(TEPUP, 'components'),
  path.join(TEPUP, 'lib'),
  path.join(ROOT, '_backups'),
  path.join(ROOT, 'docs'),
];
const EXT = new Set(['.ts', '.tsx', '.js', '.json', '.md']);

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXT.has(path.extname(entry.name)) && full !== __filename) out.push(full);
  }
  return out;
}

// `formula: '...'`, `"formula": "..."`, `condition: "..."`, template literals too.
const RE = /["']?(formula|condition)["']?\s*:\s*(?:"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`([^`]*)`)/g;

type Found = { kind: 'formula' | 'condition'; expr: string; where: string };
const found = new Map<string, Found>();
for (const file of SCAN_DIRS.flatMap((d) => walk(d))) {
  if (file.endsWith(path.join('lib', 'security', 'safe-expr.ts'))) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(RE)) {
    const raw = m[2] ?? m[3] ?? m[4] ?? '';
    if (raw.includes('${')) continue; // template interpolation — not a literal formula
    let expr = raw;
    try {
      if (m[2] !== undefined) expr = JSON.parse(`"${raw}"`);
      else expr = raw.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    } catch {
      /* keep raw */
    }
    const kind = m[1] as Found['kind'];
    const key = `${kind}\u0000${expr}`;
    if (!found.has(key)) {
      const line = text.slice(0, m.index).split('\n').length;
      found.set(key, { kind, expr, where: `${path.relative(ROOT, file)}:${line}` });
    }
  }
}

// --- old behaviour, verbatim from the components before this change ---
function oldEval(formula: string, vars: Record<string, number>): number {
  try {
    const fn = new Function(...Object.keys(vars), `return (${formula});`);
    const result = fn(...Object.values(vars));
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}
function oldBool(condition: string, vars: Record<string, number>): boolean {
  try {
    const fn = new Function(...Object.keys(vars), `return !!(${condition});`);
    return fn(...Object.values(vars));
  } catch {
    return false;
  }
}
// --- new behaviour, as the components now post-process it ---
function newEval(formula: string, vars: Record<string, number>): number {
  const r = evaluateExpr(formula, vars);
  return typeof r === 'number' && isFinite(r) ? r : 0;
}

const JS_WORDS = new Set([
  'true', 'false', 'Infinity', 'NaN', 'null', 'undefined', 'function', 'var', 'let',
  'const', 'return', 'for', 'if', 'else', 'break', 'while', 'new', 'this', 'typeof',
]);
/** Free variables of an expression: identifiers that aren't keywords or `.prop`s. */
function identifiers(expr: string): string[] {
  const names = new Set<string>();
  for (const m of expr.matchAll(/(\.)?\b([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
    if (m[1] || m[2] === 'Math' || JS_WORDS.has(m[2])) continue;
    names.add(m[2]);
  }
  // Locals declared inside an IIFE are not inputs.
  for (const m of expr.matchAll(/\bvar\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) names.delete(m[1]);
  return [...names];
}

// Deterministic PRNG so failures are reproducible.
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const SPECIAL = [0, 1, -1, 0.5, 5, 10, 12.3, 30, 45, 50, 55, 70, 90, 95, 100, 250, 600, 1e6];

function sampleSets(names: string[]): Record<string, number>[] {
  const sets: Record<string, number>[] = [];
  for (const v of SPECIAL) sets.push(Object.fromEntries(names.map((n) => [n, v])));
  for (let i = 0; i < 60; i++) {
    sets.push(Object.fromEntries(names.map((n) => [n, Math.round(rand() * 2000 - 200) / 10])));
  }
  // A set missing one variable — both must fail the same way (0 / false).
  if (names.length > 0) sets.push(Object.fromEntries(names.slice(1).map((n) => [n, 3])));
  return sets;
}

let failures = 0;
let checks = 0;
const fail = (msg: string) => {
  failures++;
  console.error('  FAIL', msg);
};

console.log(`\n== 1. Real expressions found in repo: ${found.size} unique ==`);
for (const f of found.values()) {
  const names = identifiers(f.expr);
  const syntaxErr = checkExpr(f.expr);
  let ok = true;
  for (const vars of sampleSets(names)) {
    checks++;
    if (f.kind === 'formula') {
      const a = oldEval(f.expr, vars);
      const b = newEval(f.expr, vars);
      if (!Object.is(a, b)) {
        ok = false;
        fail(`${f.where} formula ${JSON.stringify(f.expr)} vars=${JSON.stringify(vars)} old=${a} new=${b}`);
        break;
      }
    } else {
      const a = oldBool(f.expr, vars);
      const b = evaluateCondition(f.expr, vars);
      if (a !== b) {
        ok = false;
        fail(`${f.where} condition ${JSON.stringify(f.expr)} vars=${JSON.stringify(vars)} old=${a} new=${b}`);
        break;
      }
    }
  }
  const note = syntaxErr ? ` (parse error, same as old: ${syntaxErr})` : '';
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${f.kind.padEnd(9)} ${JSON.stringify(f.expr)}${note}  [${f.where}]`);
}

console.log('\n== 1b. Legacy formulas rewritten for the safe grammar ==');
// These IIFEs were live in scripts/stories-v2/thue/huong-thue.ts (calculator
// "Thuế thu nhập cá nhân theo bậc"). The safe evaluator can't run them, so the seed
// source now carries a min/max rewrite; prove it is bit-identical to the old code.
const LEGACY_BODY =
  'var t=Math.max(0,luong-giamtru-nguoiphuthuoc*giamtru*0.4);var b=[[5000000,0.05],[5000000,0.10],[8000000,0.15],[14000000,0.20],[20000000,0.25],[28000000,0.30]];var s=0;for(var i=0;i<b.length;i++){var p=Math.min(t,b[i][0]);if(p<=0)break;s+=p*b[i][1];t-=p;}if(t>0)s+=t*0.35;';
const LEGACY = [
  { id: 'thue', old: `(function(){${LEGACY_BODY}return s;})()` },
  { id: 'tyle', old: `(function(){${LEGACY_BODY}return luong>0? s/luong*100 : 0;})()` },
];
{
  const seedSrc = fs.readFileSync(path.join(TEPUP, 'scripts/stories-v2/thue/huong-thue.ts'), 'utf8');
  for (const { id, old } of LEGACY) {
    const m = new RegExp(`id: '${id}',[\\s\\S]*?formula:\\s*'([^']*)'`).exec(seedSrc);
    if (!m) {
      fail(`rewrite for ${id} not found in huong-thue.ts`);
      continue;
    }
    const rewritten = m[1];
    const err = checkExpr(rewritten);
    if (err) fail(`rewrite ${id} does not parse: ${err}`);
    let mismatches = 0;
    let sets = 0;
    const luongs = [0, 1, 4_999_999, 5e6, 11e6, 15e6, 16e6, 21e6, 29e6, 43e6, 60e6, 63e6, 91e6, 100e6, 123_456_789.5];
    for (const luong of luongs) {
      for (const giamtru of [9e6, 11e6, 15.5e6, 20e6]) {
        for (const nguoiphuthuoc of [0, 1, 2, 3, 4, 2.5]) {
          checks++;
          sets++;
          const vars = { luong, giamtru, nguoiphuthuoc };
          const a = oldEval(old, vars);
          const b = newEval(rewritten, vars);
          if (!Object.is(a, b)) {
            mismatches++;
            if (mismatches <= 3) fail(`rewrite ${id} vars=${JSON.stringify(vars)} old=${a} new=${b}`);
          }
        }
      }
    }
    // Random inputs across the calculator's full range, including non-integers.
    for (let i = 0; i < 2000; i++) {
      checks++;
      sets++;
      const vars = { luong: rand() * 120e6, giamtru: 9e6 + rand() * 11e6, nguoiphuthuoc: Math.floor(rand() * 5) };
      if (!Object.is(oldEval(old, vars), newEval(rewritten, vars))) {
        mismatches++;
        if (mismatches <= 3) fail(`rewrite ${id} vars=${JSON.stringify(vars)}`);
      }
    }
    // Old IIFE under the new evaluator: must be refused (renders 0), not run.
    checks++;
    if (checkExpr(old) === null) fail(`legacy IIFE ${id} parsed by safe evaluator`);
    console.log(`  ${mismatches ? 'FAIL' : 'ok  '} ${id}: rewrite (${rewritten.length} chars) matches old IIFE on ${sets} input sets`);
  }
}

console.log('\n== 2. Semantics vs JS ==');
const semantic: [string, Record<string, number>][] = [
  ['1 + 2 * 3', {}],
  ['(1 + 2) * 3', {}],
  ['10 - 4 - 3', {}],
  ['100 / 10 / 5', {}],
  ['7 % 3', {}],
  ['-7 % 3', {}],
  ['2 ** 3 ** 2', {}],
  ['(-2) ** 2', {}],
  ['2 ** -1', {}],
  ['-x + +y', { x: 3, y: 4 }],
  ['!x', { x: 0 }],
  ['!!x', { x: 5 }],
  ['!x > -1', { x: 0 }],
  ['x > 3 ? 1 : x > 1 ? 2 : 3', { x: 2 }],
  ['x > 3 ? 1 : x > 1 ? 2 : 3', { x: 0 }],
  ['a && b', { a: 2, b: 7 }],
  ['a && b', { a: 0, b: 7 }],
  ['a || b', { a: 0, b: 7 }],
  ['a || b && c', { a: 0, b: 1, c: 9 }],
  ['(x > 1) + (x > 2)', { x: 5 }],
  ['(x > 1) == 1', { x: 5 }],
  ['(x > 1) === 1', { x: 5 }],
  ['(x > 1) === true', { x: 5 }],
  ['x != 2', { x: 2 }],
  ['x !== 2', { x: 3 }],
  ['1 < 2 < 3', {}],
  ['3 > 2 > 1', {}],
  ['1 / 0', {}],
  ['0 / 0', {}],
  ['Math.max(1, 2, 3) + Math.min(4, 5)', {}],
  ['Math.round(2.5) + Math.round(-2.5) + Math.floor(-1.5) + Math.ceil(1.2)', {}],
  ['Math.abs(-3) + Math.sqrt(16) + Math.pow(2, 10)', {}],
  ['Math.PI * r ** 2', { r: 2 }],
  ['1e3 + .5 + 1.25E-2', {}],
  ['x > 0 && true', { x: 1 }],
  ['Math.max()', {}],
  ['', {}],
  ['   ', {}],
];
for (const [expr, vars] of semantic) {
  checks++;
  let expected: unknown;
  try {
    expected = new Function(...Object.keys(vars), `return (${expr});`)(...Object.values(vars));
  } catch {
    expected = 'ERROR';
  }
  const got = evaluateExpr(expr, vars);
  const same =
    expected === 'ERROR' ? Number.isNaN(got) && checkExpr(expr) !== null : Object.is(expected, got);
  console.log(`  ${same ? 'ok  ' : 'FAIL'} ${JSON.stringify(expr)} → js=${String(expected)} safe=${String(got)}`);
  if (!same) fail(`semantic ${expr}`);
}

console.log('\n== 3. Must be rejected (parse error → NaN / false) ==');
const hostile = [
  'alert(1)',
  'constructor',
  'x.constructor',
  "x['constructor']",
  'x[0]',
  'Math.constructor',
  'Math.constructor.constructor("alert(1)")()',
  '__proto__.polluted',
  'this',
  'globalThis',
  'window.location',
  'fetch("https://evil.example")',
  '(() => 1)()',
  'function(){}',
  'x = 1',
  'x += 1',
  'x++',
  '--x',
  '"a"',
  "'a'",
  '`a`',
  'new Date()',
  'x ^ 2',
  'x | 1',
  'x & 1',
  'x << 1',
  'typeof x',
  'void 0',
  'x, y',
  '-2 ** 2',
  'Math.random()',
  'eval("1")',
  'import("x")',
  '1;alert(1)',
  '/* */ 1',
  'x ? y',
  '((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((1))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))',
  'max(' + '1,'.repeat(60) + '1)',
  '1 + '.repeat(700) + '1',
];
for (const expr of hostile) {
  checks++;
  const err = checkExpr(expr);
  const v = evaluateExpr(expr, { x: 1, y: 2 });
  const c = evaluateCondition(expr, { x: 1, y: 2 });
  const rejected = err !== null && Number.isNaN(v) && c === false;
  const label = expr.length > 60 ? expr.slice(0, 57) + '...' : expr;
  console.log(`  ${rejected ? 'ok  ' : 'FAIL'} ${JSON.stringify(label)}${err ? ` — ${err}` : ''}`);
  if (!rejected) fail(`hostile accepted: ${label}`);
}

// Prototype keys must never resolve as variables even when vars is a plain object.
checks++;
if (!Number.isNaN(evaluateExpr('toString', {})) || !Number.isNaN(evaluateExpr('hasOwnProperty', {}))) {
  fail('prototype key resolved as variable');
}

console.log(`\n${checks} checks, ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
