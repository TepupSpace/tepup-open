import PaperShell from '@/components/paper/PaperShell';

/** Layout giấy cho /story/** (demo-course-stories, màn 2–3). Xem PaperShell. */
export default function PaperLayout({ children }: { children: React.ReactNode }) {
  return <PaperShell current="courses">{children}</PaperShell>;
}
