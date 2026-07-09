import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('flood-damage-check');

export default function Page() {
  return <CheckLandingPage slug="flood-damage-check" />;
}
