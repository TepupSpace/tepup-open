import { redirect } from 'next/navigation';

/**
 * Tài liệu thư viện cũ (LibraryDocument) đã được xếp lại thành mục thư viện cùng id/slug
 * (scripts/reclassify-library-documents.ts). Quản lý mọi loại mục ở một chỗ.
 */
export default function Page() {
  redirect('/admin/library-entries');
}
