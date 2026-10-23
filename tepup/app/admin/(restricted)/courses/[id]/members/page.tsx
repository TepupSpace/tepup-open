import MembersClient from './MembersClient';

export const metadata = { title: 'Trưởng khóa học và người duyệt của khóa học' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MembersClient courseId={id} />;
}
