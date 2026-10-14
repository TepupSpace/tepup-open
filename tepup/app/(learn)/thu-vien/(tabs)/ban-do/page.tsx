import type { Metadata } from 'next';
import { getGraph } from '@/lib/library/entry-service';
import { isValidEntrySlug } from '@/lib/library/refs';
import LibraryGraph from '@/components/reference/LibraryGraph';

export const metadata: Metadata = { title: 'Bản đồ | Thư viện Tepup' };

/** Bản đồ: các mục thư viện nối với nhau thành mạng (§7.5). `?muc=<slug>` làm nổi một mục. */
export default async function GraphPage({ searchParams }: { searchParams: Promise<{ muc?: string }> }) {
  const [data, { muc }] = await Promise.all([getGraph(), searchParams]);
  const focus = isValidEntrySlug(muc) ? muc : undefined;
  return (
    <section aria-labelledby="tab-heading">
      <h2 id="tab-heading" className="text-xl font-bold text-gray-900">
        Bản đồ
      </h2>
      <p className="text-gray-700 mt-1 mb-4">
        Mọi mục trong thư viện và cách chúng dẫn sang nhau. Chấm càng to thì mục càng nhiều liên kết.
      </p>
      {data.nodes.length === 0 ? <p className="text-gray-600">Chưa có mục nào.</p> : <LibraryGraph data={data} focus={focus} />}
    </section>
  );
}
