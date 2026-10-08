import LessonContentClient from './LessonContentClient';

export const metadata = { title: 'Nội dung bài học' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <LessonContentClient params={params} />;
}
