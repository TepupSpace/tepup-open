import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { getEntryFull } from '@/lib/library/entry-service';
import { collectTvSlugs } from '@/lib/library/refs';
import { tvReferencesEnabled } from '@/lib/library/flags';
import ReferenceProvider from '@/components/reference/ReferenceProvider';
import EntryView from '@/components/reference/EntryView';

// ISR như các trang nội dung khác; admin sửa mục sẽ xoá cache qua revalidateLibrary().
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryFull(slug);
  return entry ? { title: `${entry.title} — ${entry.typeLabel} | Thư viện Tepup`, description: entry.summary } : {};
}

/** Trang riêng của một mục thư viện: đích của link /tv/<slug> khi mở trực tiếp. */
export default async function EntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryFull(slug);
  if (!entry) notFound();

  return (
    <main id="main-content" className="max-w-3xl mx-auto px-4 py-8">
      <nav aria-label="Đường dẫn" className="text-sm text-gray-600 mb-4">
        <Link href="/thu-vien" className="hover:underline">
          Thư viện
        </Link>
        <span aria-hidden="true"> › </span>
        <span>{entry.typeLabel}</span>
      </nav>
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
        {entry.typeLabel}
        {entry.subtitle && <span className="normal-case font-medium text-gray-600"> · {entry.subtitle}</span>}
      </p>
      <h1 className="text-3xl font-bold text-gray-900 mt-1 mb-6">{entry.title}</h1>
      <ReferenceProvider slugs={[...collectTvSlugs(entry.body).keys()]} enabled={tvReferencesEnabled()}>
        <EntryView entry={entry} headingTag="h2" idPrefix={`tv-page-${entry.slug}`} />
      </ReferenceProvider>
    </main>
  );
}
