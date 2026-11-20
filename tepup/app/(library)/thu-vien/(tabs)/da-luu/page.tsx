import type { Metadata } from 'next';
import SavedEntries from '@/components/reference/SavedEntries';

export const metadata: Metadata = { title: 'Đã lưu | Thư viện Tepup' };

export default function SavedPage() {
  return (
    <section aria-labelledby="tab-heading" className="lib-card">
      <h2 id="tab-heading" className="lib-card__title paper-serif">
        Đã lưu
      </h2>
      <p className="lib-intro">
        Những mục bạn đã bấm ☆ Lưu. Danh sách nằm trong trình duyệt này (không cần tài khoản), nên không có trên thiết bị khác.
      </p>
      <SavedEntries />
    </section>
  );
}
