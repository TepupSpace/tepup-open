/**
 * Bộ tính biểu thức an toàn cho công thức/điều kiện do tác giả viết
 * (Calculator, SliderSimulator, BudgetAllocator).
 *
 * Trước đây các block này chạy `new Function(...)` trên chuỗi của tác giả — tức là
 * bất kỳ contributor nào cũng chạy được JavaScript tuỳ ý trên origin của site. File
 * này thay thế bằng một parser nhỏ, tự viết, chỉ hiểu đúng phần ngữ pháp mà công thức
 * cần — không có truy cập thuộc tính, không gọi method, không chuỗi, không gán.
 *
 * Ngữ pháp (thứ tự ưu tiên từ thấp đến cao, giống JavaScript):
 *   ternary   a ? b : c
 *   ||, &&
 *   == != === !==
 *   < <= > >=
 *   + -
 *   * / %
 *   unary - + !
 *   **        (phải-kết-hợp, như JS)
 *   primary   số, biến, (expr), hàm(expr, ...)
 *
 * Hàm hợp lệ: `Math.<tên>` hoặc `<tên>` trong FUNCTIONS; hằng `Math.PI`, `Math.E`.
 * `^` KHÔNG được hỗ trợ: trong JS nó là XOR bit chứ không phải luỹ thừa, nên thà
 * báo lỗi còn hơn lặng lẽ tính khác đi. Dùng `**` cho luỹ thừa.
 *
 * Ngữ nghĩa bám sát JS để kết quả trùng với `new Function` cũ: `&&`/`||` trả về
 * toán hạng (không ép boolean), so sánh/số học ép boolean → số như JS.
 *
 * Không bao giờ ném lỗi ra ngoài: `evaluateExpr` trả NaN, `evaluateCondition` trả false.
 */

export type ExprValue = number | boolean;

type Node =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'const'; v: number }
  | { k: 'bool'; v: boolean }
  | { k: 'un'; op: '-' | '+' | '!'; a: Node }
  | { k: 'bin'; op: string; a: Node; b: Node }
  | { k: 'and' | 'or'; a: Node; b: Node }
  | { k: 'cond'; c: Node; a: Node; b: Node }
  | { k: 'call'; fn: string; args: Node[] };

/** Độ dài tối đa của một biểu thức — công thức thật dài nhất hiện có ~800 ký tự
 *  (thuế luỹ tiến 7 bậc viết bằng min/max). */
export const MAX_EXPR_LENGTH = 2000;
/** Chặn đệ quy quá sâu (vd. "((((((...") để không tràn stack. */
const MAX_DEPTH = 64;

const FUNCTIONS: Record<string, { fn: (...a: number[]) => number; min: number; max: number }> = {
  min: { fn: Math.min, min: 0, max: 50 },
  max: { fn: Math.max, min: 0, max: 50 },
  round: { fn: Math.round, min: 1, max: 1 },
  floor: { fn: Math.floor, min: 1, max: 1 },
  ceil: { fn: Math.ceil, min: 1, max: 1 },
  trunc: { fn: Math.trunc, min: 1, max: 1 },
  abs: { fn: Math.abs, min: 1, max: 1 },
  sign: { fn: Math.sign, min: 1, max: 1 },
  sqrt: { fn: Math.sqrt, min: 1, max: 1 },
  cbrt: { fn: Math.cbrt, min: 1, max: 1 },
  pow: { fn: Math.pow, min: 2, max: 2 },
  exp: { fn: Math.exp, min: 1, max: 1 },
  log: { fn: Math.log, min: 1, max: 1 },
  log10: { fn: Math.log10, min: 1, max: 1 },
  log2: { fn: Math.log2, min: 1, max: 1 },
};

const CONSTANTS: Record<string, number> = { PI: Math.PI, E: Math.E };

/**
 * Tên không bao giờ được coi là biến. Biến chỉ được tra bằng `hasOwnProperty` nên
 * những tên này vốn đã vô hại, nhưng từ chối ngay lúc parse cho thông báo lỗi rõ
 * ràng thay vì âm thầm ra 0.
 */
const RESERVED = new Set([
  'this', 'globalThis', 'window', 'self', 'document', 'constructor', 'prototype',
  '__proto__', 'arguments', 'eval', 'Function', 'Object', 'Math', 'null', 'undefined',
  'new', 'typeof', 'void', 'delete', 'in', 'instanceof', 'function', 'var', 'let',
  'const', 'return', 'if', 'else', 'for', 'while', 'do', 'class', 'import', 'export',
  'yield', 'await', 'async', 'with', 'switch', 'case', 'default', 'break', 'continue',
  'try', 'catch', 'finally', 'throw', 'super', 'extends', 'debugger',
]);

class ExprError extends Error {}

// --- tokenizer ---
type Tok =
  | { t: 'num'; v: number; pos: number }
  | { t: 'id'; v: string; pos: number }
  | { t: 'op'; v: string; pos: number }
  | { t: 'eof'; pos: number };

const OPERATORS = [
  '===', '!==', '**', '==', '!=', '<=', '>=', '&&', '||',
  '+', '-', '*', '/', '%', '<', '>', '!', '?', ':', '(', ')', ',',
];

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }
    // number: 12, 12.5, .5, 1e3, 1.2E-4
    const num = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) {
      out.push({ t: 'num', v: Number(num[0]), pos: i });
      i += num[0].length;
      continue;
    }
    // `++`/`--` are update operators in JS (a syntax error on literals); refuse them
    // rather than silently reading `--x` as `-(-x)`.
    if (src.startsWith('++', i) || src.startsWith('--', i)) {
      throw new ExprError(`Không hỗ trợ "${src.slice(i, i + 2)}" ở vị trí ${i}`);
    }
    // identifier, optionally `Math.<name>` (the only dotted form accepted)
    const id = /^(?:Math\.)?[\p{L}_$][\p{L}\p{N}_$]*/u.exec(src.slice(i));
    if (id) {
      out.push({ t: 'id', v: id[0], pos: i });
      i += id[0].length;
      continue;
    }
    const op = OPERATORS.find((o) => src.startsWith(o, i));
    if (op) {
      out.push({ t: 'op', v: op, pos: i });
      i += op.length;
      continue;
    }
    throw new ExprError(`Ký tự không hợp lệ "${ch}" ở vị trí ${i}`);
  }
  out.push({ t: 'eof', pos: src.length });
  return out;
}

// --- parser (recursive descent) ---
function parse(src: string): Node {
  if (typeof src !== 'string') throw new ExprError('Biểu thức phải là chuỗi');
  if (src.length > MAX_EXPR_LENGTH) throw new ExprError('Biểu thức quá dài');
  const toks = tokenize(src);
  let p = 0;
  let depth = 0;

  const peek = () => toks[p];
  const isOp = (v: string) => {
    const t = toks[p];
    return t.t === 'op' && t.v === v;
  };
  const expect = (v: string) => {
    if (!isOp(v)) throw new ExprError(`Thiếu "${v}" ở vị trí ${toks[p].pos}`);
    p++;
  };
  const enter = () => {
    if (++depth > MAX_DEPTH) throw new ExprError('Biểu thức lồng quá sâu');
  };
  const leave = () => {
    depth--;
  };

  function ternary(): Node {
    enter();
    const c = logicalOr();
    let node = c;
    if (isOp('?')) {
      p++;
      const a = ternary();
      expect(':');
      const b = ternary();
      node = { k: 'cond', c, a, b };
    }
    leave();
    return node;
  }

  function logicalOr(): Node {
    let a = logicalAnd();
    while (isOp('||')) {
      p++;
      a = { k: 'or', a, b: logicalAnd() };
    }
    return a;
  }

  function logicalAnd(): Node {
    let a = equality();
    while (isOp('&&')) {
      p++;
      a = { k: 'and', a, b: equality() };
    }
    return a;
  }

  function binaryLevel(ops: string[], next: () => Node): () => Node {
    return () => {
      let a = next();
      for (;;) {
        const t = peek();
        if (t.t === 'op' && ops.includes(t.v)) {
          p++;
          a = { k: 'bin', op: t.v, a, b: next() };
        } else {
          return a;
        }
      }
    };
  }

  const isPrefix = (t: Tok) => t.t === 'op' && (t.v === '-' || t.v === '+' || t.v === '!');

  function unary(): Node {
    const t = peek();
    if (t.t === 'op' && isPrefix(t)) {
      p++;
      enter();
      // The operand of a prefix operator is NOT an exponentiation base: JS rejects
      // `-a ** b` outright, so parse only a primary here and refuse a trailing `**`.
      const a = isPrefix(peek()) ? unary() : primary();
      leave();
      if (isOp('**')) throw new ExprError('Cần ngoặc quanh toán tử một ngôi trước "**"');
      return { k: 'un', op: t.v as '-' | '+' | '!', a };
    }
    return power();
  }

  function power(): Node {
    const base = primary();
    if (isOp('**')) {
      p++;
      enter();
      const exp = unary(); // right-associative: 2 ** 3 ** 2 === 2 ** 9
      leave();
      return { k: 'bin', op: '**', a: base, b: exp };
    }
    return base;
  }

  function primary(): Node {
    const t = peek();
    if (t.t === 'num') {
      p++;
      return { k: 'num', v: t.v };
    }
    if (t.t === 'op' && t.v === '(') {
      p++;
      const e = ternary();
      expect(')');
      return e;
    }
    if (t.t === 'id') {
      p++;
      const dotted = t.v.startsWith('Math.');
      const name = dotted ? t.v.slice(5) : t.v;
      if (isOp('(')) {
        p++;
        const fn = FUNCTIONS[name];
        if (!Object.prototype.hasOwnProperty.call(FUNCTIONS, name) || !fn) {
          throw new ExprError(`Hàm không được hỗ trợ: ${t.v}`);
        }
        const args: Node[] = [];
        if (!isOp(')')) {
          args.push(ternary());
          while (isOp(',')) {
            p++;
            args.push(ternary());
          }
        }
        expect(')');
        if (args.length < fn.min || args.length > fn.max) {
          throw new ExprError(`Sai số tham số cho ${t.v}`);
        }
        return { k: 'call', fn: name, args };
      }
      if (dotted) {
        if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
          return { k: 'const', v: CONSTANTS[name] };
        }
        throw new ExprError(`Không hỗ trợ ${t.v}`);
      }
      if (name === 'true' || name === 'false') return { k: 'bool', v: name === 'true' };
      if (name === 'Infinity') return { k: 'const', v: Infinity };
      if (name === 'NaN') return { k: 'const', v: NaN };
      if (RESERVED.has(name)) throw new ExprError(`Không dùng được tên "${name}"`);
      return { k: 'var', name };
    }
    if (t.t === 'eof') throw new ExprError('Biểu thức bị cụt');
    throw new ExprError(`Không mong đợi "${t.v}" ở vị trí ${t.pos}`);
  }

  // Precedence chain, lowest to highest (below logicalAnd).
  const multiplicative = binaryLevel(['*', '/', '%'], unary);
  const additive = binaryLevel(['+', '-'], multiplicative);
  const relational = binaryLevel(['<', '<=', '>', '>='], additive);
  const equality = binaryLevel(['===', '!==', '==', '!='], relational);

  const root = ternary();
  if (peek().t !== 'eof') {
    const t = peek();
    throw new ExprError(`Thừa ký tự ở vị trí ${t.pos}`);
  }
  return root;
}

// --- evaluator ---
function evalNode(n: Node, vars: Record<string, number>): ExprValue {
  switch (n.k) {
    case 'num':
    case 'const':
    case 'bool':
      return n.v;
    case 'var': {
      if (!Object.prototype.hasOwnProperty.call(vars, n.name)) {
        // Old behaviour: ReferenceError → caught by the caller.
        throw new ExprError(`Biến không tồn tại: ${n.name}`);
      }
      const v = vars[n.name];
      return typeof v === 'number' || typeof v === 'boolean' ? v : NaN;
    }
    case 'un': {
      const a = evalNode(n.a, vars);
      if (n.op === '!') return !a;
      return n.op === '-' ? -Number(a) : Number(a);
    }
    case 'and': {
      const a = evalNode(n.a, vars);
      return a ? evalNode(n.b, vars) : a;
    }
    case 'or': {
      const a = evalNode(n.a, vars);
      return a ? a : evalNode(n.b, vars);
    }
    case 'cond':
      return evalNode(n.c, vars) ? evalNode(n.a, vars) : evalNode(n.b, vars);
    case 'call': {
      const args = n.args.map((a) => Number(evalNode(a, vars)));
      return FUNCTIONS[n.fn].fn(...args);
    }
    case 'bin': {
      const a = evalNode(n.a, vars);
      const b = evalNode(n.b, vars);
      switch (n.op) {
        case '===': return typeof a === typeof b && a === b;
        case '!==': return !(typeof a === typeof b && a === b);
        // Operands are only ever number|boolean, for which JS `==` is numeric.
        case '==': return Number(a) === Number(b);
        case '!=': return Number(a) !== Number(b);
      }
      const x = Number(a);
      const y = Number(b);
      switch (n.op) {
        case '+': return x + y;
        case '-': return x - y;
        case '*': return x * y;
        case '/': return x / y;
        case '%': return x % y;
        case '**': return x ** y;
        case '<': return x < y;
        case '<=': return x <= y;
        case '>': return x > y;
        case '>=': return x >= y;
      }
      throw new ExprError(`Toán tử không hỗ trợ: ${n.op}`);
    }
  }
}

// Formulas are re-evaluated on every slider tick; parse each string once.
const CACHE_LIMIT = 500;
const cache = new Map<string, Node | ExprError>();

function compile(src: string): Node | ExprError {
  const hit = cache.get(src);
  if (hit) return hit;
  let result: Node | ExprError;
  try {
    result = parse(src);
  } catch (e) {
    result = e instanceof ExprError ? e : new ExprError('Biểu thức không hợp lệ');
  }
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(src, result);
  return result;
}

/** Kiểm tra cú pháp. Trả `null` nếu hợp lệ, ngược lại là thông báo lỗi (tiếng Việt). */
export function checkExpr(src: string): string | null {
  if (typeof src !== 'string') return 'Biểu thức phải là chuỗi';
  const r = compile(src);
  return r instanceof ExprError ? r.message : null;
}

/** Tính biểu thức. Lỗi cú pháp hoặc biến lạ → NaN (không ném). */
export function evaluateExpr(src: string, vars: Record<string, number>): ExprValue {
  if (typeof src !== 'string') return NaN;
  const ast = compile(src);
  if (ast instanceof ExprError) return NaN;
  try {
    return evalNode(ast, vars);
  } catch {
    return NaN;
  }
}

/** Tính điều kiện, ép về boolean như `!!(...)` cũ. Lỗi → false. */
export function evaluateCondition(src: string, vars: Record<string, number>): boolean {
  return !!evaluateExpr(src, vars);
}
