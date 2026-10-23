import SettingsClient from './SettingsClient';
import CreditSettings from '@/components/contributor/settings/CreditSettings';
import MyCourseRolesSection from '@/components/contributor/settings/MyCourseRolesSection';
import ReviewerProfileSection from '@/components/contributor/settings/ReviewerProfileSection';
import DeleteAccountSection from '@/components/contributor/settings/DeleteAccountSection';

export const metadata = { title: 'Cài đặt' };

export default function ContributorSettingsPage() {
  return (
    <div className="space-y-8">
      <SettingsClient />
      <CreditSettings />
      <MyCourseRolesSection />
      <ReviewerProfileSection />
      <DeleteAccountSection />
    </div>
  );
}
