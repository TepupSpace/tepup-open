import PaperShell from '@/components/paper/PaperShell';
import './library.css';

/**
 * Layout giấy cho /thu-vien/** (Thư viện). Trước đây nằm trong (learn) với .reader;
 * giờ theo design system giấy như /courses và /story. Xem PaperShell.
 */
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <PaperShell current="library">{children}</PaperShell>;
}
