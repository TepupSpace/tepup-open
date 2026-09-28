import { Bot, Download, FileJson, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { BLOCK_SPECS, SPEC_TYPES } from '@/lib/ai-import/block-specs';

export const metadata = { title: 'Dùng AI của bạn - Tepup' };

const STEPS = [
  {
    title: 'Tải đặc tả',
    body: 'Tải bộ đầy đủ bên dưới (dùng lâu dài, đính kèm vào Claude Project / Custom GPT / Gem), hoặc bấm "Copy prompt" ngay trong block đang sửa.',
  },
  {
    title: 'Hỏi AI của bạn',
    body: 'Gửi file hoặc prompt cho ChatGPT, Claude, Gemini… kèm nội dung muốn tạo và loại block. AI trả về một khối JSON.',
  },
  {
    title: 'Dán vào block',
    body: 'Mở block cùng loại trong editor, dán JSON vào ô "Dán JSON từ AI" rồi bấm Áp dụng. Nếu báo lỗi, bấm "Copy lỗi để AI sửa" và gửi lại cho AI.',
  },
];

function DownloadLinks({ query }: { query: string }) {
  const sep = query ? '&' : '';
  return (
    <div className="flex items-center gap-3 shrink-0">
      <a
        href={`/api/block-schemas?${query}${sep}format=md`}
        download
        className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
      >
        <FileText className="w-4 h-4" /> .md
      </a>
      <a
        href={`/api/block-schemas?${query}${sep}format=json`}
        download
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:underline"
      >
        <FileJson className="w-4 h-4" /> .json
      </a>
    </div>
  );
}

export default async function AiGuidePage() {
  const customTypes = await prisma.customBlockType.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Bot className="w-7 h-7 text-violet-600" /> Dùng AI của bạn để điền block
        </h1>
        <p className="text-gray-600">
          Tepup không gọi AI thay bạn. Bạn dùng AI quen thuộc của mình, Tepup cung cấp đặc tả để AI điền đúng cấu trúc
          và kiểm tra lại trước khi áp dụng.
        </p>
      </header>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">
              {i + 1}. {s.title}
            </p>
            <p className="mt-1 text-sm text-gray-600">{s.body}</p>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-violet-200 bg-violet-50 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Bộ đặc tả đầy đủ</h2>
          <p className="text-sm text-gray-600">Tất cả {SPEC_TYPES.length} loại block trong một file — khuyên dùng .md cho AI.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/block-schemas?format=md"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
          >
            <Download className="w-4 h-4" /> Tải bộ đầy đủ (.md)
          </a>
          <a href="/api/block-schemas?format=json" download className="text-sm text-violet-700 hover:underline">
            .json
          </a>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-gray-900">Từng loại block</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {SPEC_TYPES.map((type) => (
            <li key={type} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">
                  {BLOCK_SPECS[type].label} <code className="ml-1 text-xs text-gray-500">{type}</code>
                </p>
                <p className="text-sm text-gray-600">{BLOCK_SPECS[type].purpose}</p>
              </div>
              <DownloadLinks query={`type=${type}`} />
            </li>
          ))}
        </ul>
      </section>

      {customTypes.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">Block tùy chỉnh</h2>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {customTypes.map((bt) => (
              <li key={bt.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{bt.name}</p>
                  {bt.description && <p className="text-sm text-gray-600">{bt.description}</p>}
                </div>
                <DownloadLinks query={`type=custom&customBlockTypeId=${bt.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
