import { tvReferencesEnabled } from '@/lib/library/flags';
import ReferenceProvider from '@/components/reference/ReferenceProvider';
import LibraryNav from '@/components/reference/LibraryNav';
import LibrarySearch from '@/components/reference/LibrarySearch';
import SuggestEntryButton from '@/components/reference/SuggestEntryButton';

/**
 * Khung chung cho mọi phần của thư viện (Mục từ, Nguồn, Viết tắt, Tủ công cụ, Bản đồ,
 * Đã lưu). Tiêu đề, ô tìm và thanh chuyển phần nằm ở layout nên đứng yên khi chuyển phần;
 * mọi phần cùng một khung rộng (`library-tabs` còn giữ chỗ thanh cuộn, xem globals.css).
 */
export default function LibraryTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="library-tabs w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Thư viện</h1>
        <SuggestEntryButton />
      </div>
      <ReferenceProvider slugs={[]} enabled={tvReferencesEnabled()}>
        <LibrarySearch />
        <LibraryNav />
        {children}
      </ReferenceProvider>
    </main>
  );
}
