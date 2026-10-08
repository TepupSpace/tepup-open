import ChapterContentClient from './ChapterContentClient';

export const metadata = { title: 'Nội dung chương' };

export default function Page({ params }: { params: Promise<{ chapterId: string }> }) {
  return <ChapterContentClient params={params} />;
}
