import { Suspense } from 'react';
import EntryEditorClient from './EntryEditorClient';

// /admin/library-entries/new?type=TERM dùng chung route này (id = "new").
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id === 'new' ? 'Tạo mục thư viện' : 'Sửa mục thư viện' };
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // useSearchParams (loại mục khi tạo mới) cần một ranh giới Suspense.
  return (
    <Suspense>
      <EntryEditorClient params={params} />
    </Suspense>
  );
}
