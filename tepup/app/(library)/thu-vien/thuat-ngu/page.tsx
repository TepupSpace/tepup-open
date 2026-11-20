import { permanentRedirect } from 'next/navigation';

/** "Thuật ngữ" và "Chủ đề" đã gộp thành một loại, Mục từ, ở trang chính của thư viện. */
export default function GlossaryPage() {
  permanentRedirect('/thu-vien');
}
