import Link from '@/components/ui/AppLink';
import { LICENCE_NAME, LICENCE_URL } from '@/lib/licence';

/**
 * "Nội dung: CC BY-SA 4.0 · Những người đóng góp cho TepUp" (LICENCE_FOOTER, proposal §6.11).
 * Server component, same HTML for every visitor (no session), so it is safe on cached pages.
 * Not shown in the lesson player.
 */
export default function LicenceFooterLine({
  className = 'text-xs text-gray-600',
  linkClassName = 'underline underline-offset-2 hover:text-gray-900',
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <p className={className}>
      Nội dung:{' '}
      <a href={LICENCE_URL} rel="license noopener" target="_blank" className={linkClassName}>
        {LICENCE_NAME}
        <span className="sr-only"> (mở trong thẻ mới)</span>
      </a>
      {' · '}
      <Link href="/contributor-guide#ghi-cong" className={linkClassName}>
        Những người đóng góp cho TepUp
      </Link>
    </p>
  );
}
