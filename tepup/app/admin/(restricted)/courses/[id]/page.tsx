import EditCourseClient from './EditCourseClient';

export const metadata = { title: 'Chỉnh sửa khóa học' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditCourseClient params={params} />;
}
