import EditCharacterClient from './EditCharacterClient';

export const metadata = { title: 'Chỉnh sửa nhân vật' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditCharacterClient params={params} />;
}
