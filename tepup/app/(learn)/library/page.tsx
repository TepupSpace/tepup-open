import { getDocumentSummaries, getCategories } from '@/lib/services/library-service';
import LibraryBrowser from '@/components/library/LibraryBrowser';

/**
 * Trang này từng là client component: hiện spinner rồi mới gọi `/api/library` sau
 * khi hydrate xong, và endpoint đó trả về nguyên `content` JSON của MỌI tài liệu
 * chỉ để dựng danh sách thẻ. Giờ danh sách được render sẵn ở server, còn nội dung
 * đầy đủ chỉ nạp khi người dùng mở một tài liệu.
 */
export const revalidate = 300;

export default async function LibraryPage() {
  const [documents, categories] = await Promise.all([
    getDocumentSummaries(),
    getCategories(),
  ]);

  return <LibraryBrowser documents={documents} categories={categories} />;
}
