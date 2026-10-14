import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LibraryDocumentClient from './LibraryDocumentClient';

// /admin/library/new dùng chung route này (id = "new").
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id === 'new' ? 'Tạo tài liệu thư viện' : 'Chỉnh sửa tài liệu thư viện' };
}

/**
 * Tài liệu đã xếp lại thành mục thư viện (cùng id) thì sửa ở trình sửa mục — bản ở bảng
 * LibraryDocument chỉ còn là đường lùi, sửa ở đây sẽ không hiện ra cho người học.
 * Tạo mới cũng sang trình sửa mục. Tài liệu chưa chuyển vẫn mở trình sửa cũ.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') redirect('/admin/library-entries/new');
  const entry = await prisma.libraryEntry.findUnique({ where: { id }, select: { id: true } }).catch(() => null);
  if (entry) redirect(`/admin/library-entries/${entry.id}`);
  return <LibraryDocumentClient params={params} />;
}
