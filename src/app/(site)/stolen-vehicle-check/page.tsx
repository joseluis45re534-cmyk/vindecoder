import { CheckLandingPage, checkMetadata } from '@/components/checks/CheckLandingPage';

export const runtime = 'edge';
export const metadata = checkMetadata('stolen-vehicle-check');

export default function Page() {
  return <CheckLandingPage slug="stolen-vehicle-check" />;
}
