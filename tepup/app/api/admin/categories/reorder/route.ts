import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

/**
 * PUT /api/admin/categories/reorder — đặt lại thứ tự toàn bộ danh mục (kéo thả ở
 * Quản trị › Danh mục). Thứ tự này là thứ tự các kệ trên /courses.
 *
 * Body: `{ ids: [...] }` — mảng CHÍNH LÀ thứ tự, server gán `sortOrder: index`
 * (cùng hợp đồng với /api/admin/courses/[id]/reorder). Phải liệt kê đủ mọi danh
 * mục, mỗi id một lần: gửi thiếu sẽ để lại sortOrder cũ chen giữa thứ tự mới.
 */
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const ids = body && typeof body === 'object' && !Array.isArray(body) ? body.ids : undefined;
    if (!Array.isArray(ids) || ids.some((x) => typeof x !== 'string')) {
      return NextResponse.json({ error: 'Dữ liệu sắp xếp không hợp lệ' }, { status: 400 });
    }
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: 'Có id bị lặp trong yêu cầu' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const all = await tx.category.findMany({ select: { id: true } });
      const known = new Set(all.map((c) => c.id));
      if (ids.length !== known.size || ids.some((id: string) => !known.has(id))) {
        throw new MismatchError();
      }
      // sortOrder không unique: ghi đè thẳng, không cần đổi chỗ hai pha.
      for (const [index, id] of (ids as string[]).entries()) {
        await tx.category.update({ where: { id }, data: { sortOrder: index } });
      }
    });

    revalidateContent();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof MismatchError) {
      // Danh sách đã đổi ở nơi khác (tab khác vừa thêm/xoá danh mục).
      return NextResponse.json(
        { error: 'Danh sách danh mục vừa thay đổi. Hãy tải lại trang rồi sắp xếp lại.' },
        { status: 409 }
      );
    }
    console.error('Error reordering categories:', error);
    return NextResponse.json({ error: 'Không lưu được thứ tự' }, { status: 500 });
  }
}

class MismatchError extends Error {}
