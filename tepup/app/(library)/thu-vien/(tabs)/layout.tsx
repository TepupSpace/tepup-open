import { tvReferencesEnabled } from '@/lib/library/flags';
import ReferenceProvider from '@/components/reference/ReferenceProvider';
import LibraryNav from '@/components/reference/LibraryNav';
import LibrarySearch from '@/components/reference/LibrarySearch';
import SuggestEntryButton from '@/components/reference/SuggestEntryButton';

/**
 * Khung chung cho mọi phần của thư viện (Mục từ, Nguồn, Viết tắt, Tủ công cụ, Bản đồ,
 * Đã lưu). Tiêu đề, ô tìm và thanh chuyển phần nằm ở layout nên đứng yên khi chuyển phần;
 * mọi phần cùng một khung rộng (`library-tabs` còn giữ chỗ thanh cuộn, xem globals.css).
 * Giao diện giấy: app/(library)/library.css.
 */
export default function LibraryTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="library-tabs lib">
      <header className="lib-head">
        <h1 className="paper-serif">
          Thư <em>viện</em>
        </h1>
        <p>Mục từ, nguồn, viết tắt và công cụ dùng chung cho mọi khoá học, nối với nhau thành một mạng.</p>
        <SuggestEntryButton />
      </header>
      <ReferenceProvider slugs={[]} enabled={tvReferencesEnabled()}>
        <LibrarySearch />
        <LibraryNav />
        {children}
      </ReferenceProvider>
    </main>
  );
}
