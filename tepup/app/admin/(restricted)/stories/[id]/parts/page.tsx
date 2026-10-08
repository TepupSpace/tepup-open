import PartsClient from './PartsClient';

export const metadata = { title: 'Phần và chương' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PartsClient params={params} />;
}
