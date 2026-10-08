import LevelsClient from './LevelsClient';

export const metadata = { title: 'Cấp độ và bài học' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <LevelsClient params={params} />;
}
