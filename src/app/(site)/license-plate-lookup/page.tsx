import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('license-plate-lookup');

export default function Page() {
  return <CheckLandingPage slug="license-plate-lookup" />;
}
