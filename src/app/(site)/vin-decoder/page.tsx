import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('vin-decoder');

export default function Page() {
  return <CheckLandingPage slug="vin-decoder" />;
}
