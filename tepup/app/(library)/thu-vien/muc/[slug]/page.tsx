import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
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
    <main id="main-content" className="lib lib--entry">
      <div className="lib-entry-back">
        <BackButton variant="paper" fallbackUrl="/thu-vien" label="Thư viện" />
      </div>
      <article className="lib-card">
        <header className="lib-entry-head">
          <p className="lib-kicker">
            {entry.typeLabel}
            {entry.subtitle && <span className="lib-entry-head__sub"> · {entry.subtitle}</span>}
          </p>
          <h1 className="paper-serif">{entry.title}</h1>
        </header>
        <ReferenceProvider slugs={[...collectTvSlugs(entry.body).keys()]} enabled={tvReferencesEnabled()}>
          <EntryView entry={entry} headingTag="h2" idPrefix={`tv-page-${entry.slug}`} />
        </ReferenceProvider>
      </article>
    </main>
  );
}
