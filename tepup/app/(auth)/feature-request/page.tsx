import { auth } from '@/lib/auth';
import { isContributorOrAbove } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';
import FeatureRequestForm, { type SignedInUser } from './FeatureRequestForm';

export const metadata = { title: 'Đề xuất tính năng - Tepup' };

// Reads the session to tell signed-in senders that their account is attached (the API
// attaches it). Not in `publicPages`, so this per-user render is never edge-cached.
export default async function FeatureRequestPage() {
  const session = await auth().catch(() => null);
  const user = session?.user;
  const signedIn: SignedInUser | null = user?.id
    ? {
        displayName: user.username || user.name || 'tài khoản của bạn',
        isContributor: isContributorOrAbove(user.role as UserRole),
      }
    : null;
  return <FeatureRequestForm signedIn={signedIn} />;
}
