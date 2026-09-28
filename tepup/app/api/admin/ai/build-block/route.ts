import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import type { CustomBlockTypeConfig } from '@/lib/types/custom-block';

const SYSTEM_PROMPT = `Bạn là AI chuyên tạo interactive block cho nền tảng học tập Tepup (giáo dục khoa học xã hội cho người Việt).

Mỗi block là một React component chạy trong sandbox (Sandpack). Block được nhúng vào bài học như một bài tập tương tác.

## RULES (bắt buộc):

1. Component PHẢI export default từ /App.jsx
2. Đọc dữ liệu do admin cung cấp: \`const fields = (typeof window !== 'undefined' && window.__BLOCK_FIELDS) || {};\`
3. Khi người học hoàn thành bài tập, gọi: \`window.parent.postMessage({ type: 'tepup:complete' }, '*');\`
4. KHÔNG dùng Tailwind — chỉ dùng inline styles hoặc CSS-in-JS
5. Có thể dùng useState, useEffect, useMemo từ React (đã có sẵn trong sandbox)
6. Có thể import thư viện npm nếu cần (recharts, d3, chart.js, framer-motion, etc.)
7. Font mặc định: system-ui, sans-serif
8. Màu chính của Tepup: #3b82f6 (blue-500)
9. Component phải responsive (dùng % hoặc maxWidth thay vì px cứng)
10. Xử lý edge case — đừng để component crash khi fields trống

## OUTPUT FORMAT (JSON thuần, KHÔNG markdown, KHÔNG giải thích):

{
  "version": 2,
  "name": "tên block ngắn gọn bằng tiếng Việt",
  "description": "mô tả 1 câu về block làm gì",
  "icon": "tên lucide icon (ví dụ: trending-up, calculator, bar-chart-3, sliders, brain, zap)",
  "accentColor": "cyan | blue | emerald | amber | rose | violet | orange",
  "files": {
    "/App.jsx": "...toàn bộ React component code ở đây..."
  },
  "editorSchema": [
    // array các field admin điền khi dùng block trong bài học
    // Để trống [] nếu block không cần tuỳ chỉnh
    // { "key": "fieldName", "label": "Nhãn hiển thị", "type": "text|textarea|number|boolean|select", ... }
  ]
}

## VÍ DỤ editorSchema:
[
  { "key": "title", "label": "Tiêu đề block", "type": "text", "defaultValue": "Mô phỏng lạm phát" },
  { "key": "intro", "label": "Giới thiệu ngắn", "type": "textarea", "defaultValue": "" },
  { "key": "maxRate", "label": "Tỉ lệ lạm phát tối đa (%)", "type": "number", "defaultValue": 30, "min": 5, "max": 100 }
]

Nhớ: export default App, đọc fields từ window.__BLOCK_FIELDS, gọi postMessage khi hoàn thành.`;

const STEP2_PROMPT = `Dựa trên React component trong config hiện tại, hãy xác định những gì admin nên tuỳ chỉnh khi dùng block này trong từng bài học khác nhau.

Trả về JSON với chỉ trường "editorSchema" (array EditorField). Không thay đổi files hay các trường khác.

OUTPUT FORMAT (JSON thuần):
{
  "editorSchema": [
    { "key": "...", "label": "...", "type": "text|textarea|number|boolean|select", "defaultValue": "..." }
  ]
}

Nếu component không có gì cần tuỳ chỉnh, trả về { "editorSchema": [] }.`;

const FIX_PROMPT = `Output bạn trả về ở lần trước không parse được thành JSON hợp lệ. Hãy chỉ trả về JSON thuần — không markdown, không giải thích, không code fence. Chỉ object JSON bắt đầu bằng { và kết thúc bằng }.`;

/**
 * Trích xuất JSON thuần từ raw text của AI.
 * Xử lý: markdown code fence, text trước/sau JSON.
 */
function extractJSON(raw: string): string | null {
  const trimmed = raw.trim();

  // 1. Strip markdown code fences: ```json\n...\n``` or ```\n...\n```
  const mdFenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (mdFenceMatch) return mdFenceMatch[1].trim();

  // 2. Find outermost JSON object via brace-depth counting
  const start = trimmed.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < trimmed.length; i++) {
    if (trimmed[i] === '{') depth++;
    else if (trimmed[i] === '}') {
      depth--;
      if (depth === 0) return trimmed.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Cố gắng parse JSON từ raw string.
 * Trả về parsed object hoặc null nếu thất bại.
 */
function tryParseJSON(raw: string): unknown | null {
  // Direct parse
  try {
    return JSON.parse(raw.trim());
  } catch { /* continue */ }

  // Extract then parse
  const extracted = extractJSON(raw);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch { /* continue */ }
  }

  return null;
}

function validateConfig(config: unknown): string[] {
  const errors: string[] = [];
  if (!config || typeof config !== 'object') return ['config phải là object'];
  const c = config as Record<string, unknown>;
  if (c.version !== 2) errors.push('version phải là 2');
  if (!c.files || typeof c.files !== 'object') {
    errors.push('files là bắt buộc');
  } else {
    const files = c.files as Record<string, unknown>;
    if (!files['/App.jsx'] || typeof files['/App.jsx'] !== 'string' || !(files['/App.jsx'] as string).trim()) {
      errors.push('files phải có /App.jsx không rỗng');
    }
  }
  if (!Array.isArray(c.editorSchema)) errors.push('editorSchema phải là array');
  return errors;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY chưa được cấu hình' }, { status: 500 });
    }

    const body = await request.json();
    const { prompt, step = 1, existingConfig, rawOutput } = body as {
      prompt: string;
      step?: 1 | 2 | 'fix';
      existingConfig?: Partial<CustomBlockTypeConfig>;
      rawOutput?: string; // for step='fix': the failed raw output
    };

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'prompt là bắt buộc' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // ── step='fix': ask Claude to extract JSON from its own failed output ──
    if (step === 'fix' && rawOutput) {
      const fixResponse = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8192,
        system: FIX_PROMPT,
        messages: [{ role: 'user', content: `Output lỗi cần sửa:\n${rawOutput}` }],
      });
      const fixRaw = fixResponse.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.TextBlock).text)
        .join('');

      const fixParsed = tryParseJSON(fixRaw);
      if (!fixParsed) {
        return NextResponse.json(
          { error: 'AI vẫn không trả về JSON hợp lệ sau khi sửa', raw: fixRaw },
          { status: 422 }
        );
      }

      if (existingConfig) {
        // step='fix' for step2 schema
        const merged = {
          ...existingConfig,
          version: 2,
          editorSchema: (fixParsed as Record<string, unknown>).editorSchema ?? [],
        };
        return NextResponse.json({ config: merged });
      }

      const validationErrors = validateConfig(fixParsed);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Config AI sinh ra không hợp lệ', validationErrors, raw: fixRaw },
          { status: 422 }
        );
      }
      return NextResponse.json({ config: fixParsed });
    }

    // ── step 1 or 2: normal generation ──
    let userMessage: string;
    let systemMessage: string;

    if (step === 2 && existingConfig) {
      systemMessage = STEP2_PROMPT;
      userMessage = `Config hiện tại:\n${JSON.stringify(existingConfig, null, 2)}\n\nYêu cầu admin: ${prompt}`;
    } else {
      systemMessage = SYSTEM_PROMPT;
      userMessage = prompt;
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      system: systemMessage,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('');

    let parsed = tryParseJSON(raw);

    // ── Auto-retry once if parse failed ──
    if (!parsed) {
      console.warn('build-block: parse failed on first attempt, retrying...');
      const retryResponse = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8192,
        system: FIX_PROMPT,
        messages: [
          { role: 'user', content: userMessage },
          { role: 'assistant', content: raw },
          { role: 'user', content: 'Output trên không parse được. Hãy trả về chỉ JSON thuần, bắt đầu bằng { và kết thúc bằng }.' },
        ],
      });
      const retryRaw = retryResponse.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.TextBlock).text)
        .join('');
      parsed = tryParseJSON(retryRaw);

      if (!parsed) {
        return NextResponse.json(
          { error: 'AI không trả về JSON hợp lệ sau 2 lần thử', raw },
          { status: 422 }
        );
      }
    }

    if (step === 2) {
      const merged = {
        ...existingConfig,
        version: 2,
        editorSchema: (parsed as Record<string, unknown>).editorSchema ?? [],
      };
      return NextResponse.json({ config: merged });
    }

    // Step 1: validate full config
    const validationErrors = validateConfig(parsed);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Config AI sinh ra không hợp lệ', validationErrors, raw },
        { status: 422 }
      );
    }

    return NextResponse.json({ config: parsed });
  } catch (error) {
    console.error('POST /api/admin/ai/build-block error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
