import EditStoryClient from './EditStoryClient';

export const metadata = { title: 'Chỉnh sửa câu chuyện' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditStoryClient params={params} />;
}
