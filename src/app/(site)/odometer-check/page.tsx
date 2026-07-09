import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('odometer-check');

export default function Page() {
  return <CheckLandingPage slug="odometer-check" />;
}
