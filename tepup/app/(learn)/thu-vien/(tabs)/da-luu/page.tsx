import type { Metadata } from 'next';
import SavedEntries from '@/components/reference/SavedEntries';

export const metadata: Metadata = { title: 'Đã lưu | Thư viện Tepup' };

export default function SavedPage() {
  return (
    <section aria-labelledby="tab-heading">
      <h2 id="tab-heading" className="text-xl font-bold text-gray-900">
        Đã lưu
      </h2>
      <p className="text-gray-700 mt-1 mb-4">
        Những mục bạn đã bấm ☆ Lưu. Danh sách nằm trong trình duyệt này (không cần tài khoản), nên không có trên thiết bị khác.
      </p>
      <SavedEntries />
    </section>
  );
}
