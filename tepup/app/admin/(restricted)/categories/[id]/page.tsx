import EditCategoryClient from './EditCategoryClient';

export const metadata = { title: 'Chỉnh sửa danh mục' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditCategoryClient params={params} />;
}
