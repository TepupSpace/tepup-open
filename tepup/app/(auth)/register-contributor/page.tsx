import RegisterContributorForm from './RegisterContributorForm';
import { TERMS } from '@/lib/terms';

export const metadata = { title: `${TERMS.signUp} | Tepup` };

export default function RegisterContributorPage() {
  return <RegisterContributorForm />;
}
