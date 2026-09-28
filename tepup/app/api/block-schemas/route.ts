import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { BLOCK_SPECS } from '@/lib/ai-import/block-specs';
import {
  allBlocksJson,
  allBlocksMarkdown,
  blockSpecJson,
  blockSpecMarkdown,
  type CustomTypeInfo,
} from '@/lib/ai-import/build-doc';
import type { CustomBlockTypeConfig } from '@/lib/types/custom-block';

/**
 * GET /api/block-schemas — tải đặc tả block cho AI bên ngoài.
 *
 *   ?format=md|json                      bộ đầy đủ
 *   ?type=pair-match&format=md|json      một loại block
 *   ?type=custom&customBlockTypeId=…     một loại block tùy chỉnh
 *
 * Contributor trở lên (admin cũng qua).
 */
export async function GET(req: NextRequest) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const format = searchParams.get('format') === 'json' ? 'json' : 'md';

  let name = 'tepup-blocks';
  let body: string;

  if (!type) {
    body = format === 'md' ? allBlocksMarkdown() : JSON.stringify(allBlocksJson(), null, 2);
  } else if (!Object.hasOwn(BLOCK_SPECS, type)) {
    return NextResponse.json({ error: `Không có loại block "${type}"` }, { status: 404 });
  } else {
    let custom: CustomTypeInfo | undefined;
    if (type === 'custom') {
      const id = searchParams.get('customBlockTypeId');
      const bt = id ? await prisma.customBlockType.findUnique({ where: { id } }) : null;
      if (!bt) return NextResponse.json({ error: 'Không tìm thấy block tùy chỉnh' }, { status: 404 });
      const config = bt.config as unknown as CustomBlockTypeConfig;
      custom = { name: bt.name, description: bt.description ?? undefined, editorSchema: config.editorSchema ?? [] };
      name = `tepup-block-custom-${bt.slug}`;
    } else {
      name = `tepup-block-${type}`;
    }
    body = format === 'md' ? blockSpecMarkdown(type, custom) : JSON.stringify(blockSpecJson(type, custom), null, 2);
  }

  return new NextResponse(body, {
    headers: {
      'Content-Type': format === 'md' ? 'text/markdown; charset=utf-8' : 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}.${format}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
