import BlockBuilderClient from './BlockBuilderClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const { edit } = await searchParams;
  return { title: edit ? 'Chỉnh sửa block tuỳ chỉnh' : 'Tạo block tuỳ chỉnh' };
}

export default function Page() {
  return <BlockBuilderClient />;
}
