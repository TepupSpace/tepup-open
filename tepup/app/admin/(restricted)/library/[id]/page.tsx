import LibraryDocumentClient from './LibraryDocumentClient';

// /admin/library/new dùng chung route này (id = "new").
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id === 'new' ? 'Tạo tài liệu thư viện' : 'Chỉnh sửa tài liệu thư viện' };
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <LibraryDocumentClient params={params} />;
}
