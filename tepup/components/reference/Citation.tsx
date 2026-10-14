import type { Citation as CitationData } from '@/lib/library/citation';

/** Một trích dẫn: các cụm nối bằng " · ", tên sách/tạp chí in nghiêng. */
export default function Citation({ citation, className = '' }: { citation: CitationData; className?: string }) {
  return (
    <span className={className}>
      {citation.segments.map((seg, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {i > 0 && <span className="sr-only">, </span>}
          {seg.map((p, j) => (p.italic ? <cite key={j} className="italic">{p.text}</cite> : <span key={j}>{p.text}</span>))}
        </span>
      ))}
      {citation.languageBadge && (
        <span className="ml-2 inline-flex px-1.5 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700 align-middle">
          <span className="sr-only">Ngôn ngữ: </span>
          {citation.languageBadge}
        </span>
      )}
    </span>
  );
}
