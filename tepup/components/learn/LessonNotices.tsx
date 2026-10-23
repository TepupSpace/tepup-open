import { BadgeCheck, Info } from 'lucide-react';
import { PUBLIC_FLAG_TEXT, type LessonNoticesData, type PublicEndorsement } from '@/lib/types/lesson-notices';

/** One line per endorsement, only what the reviewer chose to disclose (proposal §6.14a). */
function endorsementText(e: PublicEndorsement): string {
  const where = e.affiliation ? `, ${e.affiliation}` : '';
  if (e.disclosure === 'FULL' && e.publicName) {
    return `Đã được ${e.publicName}${e.credential ? ` (${e.credential}${where})` : ''} kiểm tra.`;
  }
  if (e.disclosure !== 'ANONYMOUS' && e.credential) {
    return `Đã được một ${e.credential.toLowerCase()}${where} (đã xác minh) kiểm tra.`;
  }
  return 'Đã được người duyệt tin cậy kiểm tra.';
}

/**
 * Learner-facing notices above a lesson. Server component; same output for every visitor
 * (the data is cached under CONTENT_TAG), so it is safe on edge-cached pages.
 */
export default function LessonNotices({ notices }: { notices: LessonNoticesData }) {
  if (!notices.flags.length && !notices.endorsements.length) return null;
  // Identical endorsements (several anonymous ones) collapse into one line.
  const lines = [...new Set(notices.endorsements.map(endorsementText))];
  return (
    <div className="space-y-2 text-sm">
      {notices.flags.map((kind) => (
        <p key={kind} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-900 ring-1 ring-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {PUBLIC_FLAG_TEXT[kind]}
        </p>
      ))}
      {lines.map((line) => (
        <p key={line} className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900 ring-1 ring-emerald-200">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {line}
        </p>
      ))}
    </div>
  );
}
